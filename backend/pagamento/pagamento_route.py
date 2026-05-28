import mercadopago
import os
import uuid
import requests
import json
from flask import Blueprint, request, jsonify, redirect
from datetime import datetime, timedelta
from pedidos.pedido_model import Pedido
from .pagamento_model import Pagamento, db, calcular_distancia_km
from endereco.endereco_model import Endereco
from restaurantes.restaurante_model import Restaurantes
from dotenv import load_dotenv
from fpdf import FPDF
from flask_mail import Message, Mail
from config import mail

load_dotenv()

ACCESS_TOKEN = os.getenv("MERCADO_PAGO_ACCESS_TOKEN")
sdk = mercadopago.SDK(ACCESS_TOKEN)
    
pagamentos_bp = Blueprint('pagamentos', __name__)

#Cria um pagamento no Mercado Pago e retorna o link pro cliente pagar
@pagamentos_bp.route('/pagamentos/checkout', methods=['POST'])
def checkout():
    data = request.json
    tipo_envio = data.get('tipo_envio')
    
    id_do_pedido = data.get('pedido_id')
    pedido_no_banco = Pedido.query.get(id_do_pedido)

    if not pedido_no_banco:
        return jsonify({"erro": "Pedido não encontrado no banco de dados"}), 404
    
    if tipo_envio == 'retirada':
        valor_taxa = 0.0
    else:
        endereco_cliente = Endereco.query.get(data.get('endereco_id'))
        if not endereco_cliente:
            return jsonify({"erro": "Endereço não encontrado"}), 404
        
        restaurante_do_pedido = Restaurantes.query.get(pedido_no_banco.restaurante_id)
        
        LAT_RESTAURANTE = restaurante_do_pedido.latitude
        LON_RESTAURANTE = restaurante_do_pedido.longitude
            
        distancia = calcular_distancia_km(LAT_RESTAURANTE, 
            LON_RESTAURANTE, endereco_cliente.latitude, endereco_cliente.longitude)
        valor_taxa = distancia * 1.50
    
    novo_pagamento = Pagamento(
        pedido_id=id_do_pedido, 
        metodo=data.get('metodo_id'),
        subtotal=data.get('subtotal', 0.0),
        taxa_entrega=valor_taxa
    )
    
    sucesso_validacao, mensagem = novo_pagamento.validar_pagamento(pedido_no_banco)
    if not sucesso_validacao:
        return jsonify({"erro": mensagem}), 400
    
    total_final = float(novo_pagamento.subtotal) + float(novo_pagamento.taxa_entrega)

    preference_data = {
        "items": [
            {
                "title": f"Pedido Pop Doces #{id_do_pedido}",
                "quantity": 1,
                "unit_price": total_final,
                "currency_id": "BRL"
            }
        ],
        "payer": {
            "email": data.get('email_cliente'),
        },
        "statement_descriptor": "POP DOCES",
        "back_urls": {
            "success": "https://ceremony-moving-strainer.ngrok-free.dev/pagamentos/retorno-sucesso", 
            "failure": "http://localhost:5173",
            "pending": "http://localhost:5173"
        },
        "auto_return": "approved",
        "external_reference": str(id_do_pedido),
        "notification_url": "https://ceremony-moving-strainer.ngrok-free.dev/webhooks/mercadopago"
    }

    try:
        result = sdk.preference().create(preference_data)
        print("DEBUG MP FULL RESPONSE:", result)

        if result["status"] >= 400:
            return jsonify({
                "erro": "Erro na API do Mercado Pago",
                "detalhes": result.get("response", "Sem detalhes")
            }), result["status"]
        preference = result["response"]

        novo_pagamento.transacao_id = preference["id"]
        novo_pagamento.status = "Aguardando Pagamento"
        
        db.session.add(novo_pagamento)
        db.session.commit()

        return jsonify({
            "pagamento_id": novo_pagamento.id,
            "checkout_url": preference["init_point"] 
        }), 201

    except Exception as e:
        return jsonify({"erro": f"Erro ao criar preferência: {str(e)}"}), 400
    
# Gera um PDF simples com a nota fiscal do pedido e envia por email, é Chamado automaticamente quando o pagamento é confirmado no webhook
def enviar_nf_pdf(pedido, email_destino):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(40,10, f"Nota Fiscal - Pedido #{pedido.id}")
    pdf.ln(10)
    pdf.set_font("Arial", size=12)
    
    for item in pedido.itens:
        pdf.cell(0,10,f"{item.quantidade}x {item.nome_doce} - R$ {item.preco_unitario}", ln=True)
        
    pdf.ln(5)
    pdf.cell(0,10, f"Total: R$ {pedido.pagamento.total_final}", ln=True)
    
    pdf_content = pdf.output(dest='S').encode('latin-1')
        
    msg = Message(f"NF do seu pedido Pop Doces #{pedido.id}",
                  sender = "popdocescontato@gmail.com",
                  recipients=[email_destino])
    msg.body = "Olá! Segue em anexo a nota fiscal do seu doce."
    msg.attach("nota_fiscal.pdf", "application/pdf", pdf_content)
    
    mail.send(msg)
    

# Consulta o status de um pagamento pelo ID é usado pelo frontend pra ficar consultando se o pagamento foi aprovado.
@pagamentos_bp.route('/pagamentos/<int:id>/status', methods=['GET'])
def verificar_status(id):
    pagamento = Pagamento.query.get_or_404(id)

    if pagamento.status == "Aguardando Confirmação" and pagamento.esta_expirado():
        pagamento.status = "Cancelado"
        db.session.commit()
        return jsonify({"status": "Cancelado", "motivo": "Tempo limite para pagamento excedido."})

    return jsonify({
        "id": pagamento.id,
        "status": pagamento.status,
        "total": pagamento.total_final
    })
    
# Consulta o status do pagamento de um pedido específico
@pagamentos_bp.route('/pagamentos/pedido/<int:pedido_id>', methods=['GET'])
def verificar_status_por_pedido(pedido_id):

    pagamento = Pagamento.query.filter_by(
        pedido_id=pedido_id
    ).order_by(Pagamento.id.desc()).first()

    if not pagamento:
        return jsonify({"erro": "Pagamento não encontrado"}), 404

    if pagamento.status == "Aguardando Confirmação" and pagamento.esta_expirado():
        pagamento.status = "Cancelado"
        db.session.commit()

    return jsonify({
        "id": pagamento.id,
        "status": pagamento.status,
        "total": pagamento.total_final
    }), 200

# Webhook que o Mercado Pago chama quando um pagamento é aprovado/rejeitado, retorna a resposta do pagamento do pedido
@pagamentos_bp.route('/webhooks/mercadopago', methods=['POST'])
def webhook_mp():
    data_json = request.get_json() or {}
    
    payment_id = (request.args.get('data.id') or 
                  data_json.get('data', {}).get('id') or 
                  data_json.get('id'))
    
    topic = (request.args.get('type') or 
             data_json.get('type') or 
             request.args.get('topic'))

    if payment_id and (topic == 'payment' or topic is None):
        try:
            resource = sdk.payment().get(payment_id)
            
            if resource["status"] not in [200, 201]:
                print(f"O ID {payment_id} não é um pagamento válido ou expirou (Status MP: {resource['status']})")
                return "", 200

            payment_info = resource["response"]
            status_real = payment_info.get("status")
            pref_id_mp = payment_info.get("preference_id")
            ext_ref = payment_info.get("external_reference")

            pagamento = None
            if pref_id_mp:
                pagamento = Pagamento.query.filter_by(transacao_id=pref_id_mp).first()
            
            if not pagamento and ext_ref:
                try:
                    pagamento = Pagamento.query.filter_by(pedido_id=int(ext_ref)).first()
                except:
                    pass

            if pagamento:
                if status_real == "approved":
                    pagamento.status = "Pagamento Confirmado"
                    if pagamento.pedido:
                        pagamento.pedido.status = "Em Preparação"
                        pagamento.pedido.status_preparo = "Preparando"
                        
                        if pagamento.pedido.tipo_retirada == 'retirada':
                            pagamento.pedido.gerar_senha_retirada()
                            print(f"🔑 Senha gerada: {pagamento.pedido.numero_senha}")
                        
                        try:
                            email_do_usuario = pagamento.pedido.usuario.email
                            enviar_nf_pdf(pagamento.pedido, email_do_usuario)
                        except Exception as e:
                            print(f"Erro ao enviar NF: {e}")
                        
                        pagamento.pedido.gerar_codigo_entrega()
                        pagamento.pedido.iniciar_simulacao()
                
                elif status_real in ["rejected", "cancelled", "refunded"]:
                    pagamento.status = "Cancelado"
                    if pagamento.pedido:
                        pagamento.pedido.status = "Cancelado"

                db.session.commit()
                print("Alterações salvas no banco com sucesso!")
            else:
                print(f"Aviso: Pagamento {payment_id} ignorado (Não encontrado no seu banco).")

        except Exception as e:
            db.session.rollback()
            print(f"ERRO CRÍTICO no processamento: {e}")
    else:
        print(f"Webhook descartado: ID ausente ou tópico irrelevante ({topic})")

    return "", 200

#redireciona a tela do mercado pago de volta para o site depois do pagamento
@pagamentos_bp.route('/pagamentos/retorno-sucesso')
def retorno_sucesso():
    return redirect("http://localhost:5173/dashboard")

# Calcula a taxa de entrega e tempo estimado antes de finalizar o pedido
@pagamentos_bp.route('/pagamentos/calcular-taxa', methods=['POST'])
def consultar_taxa():
    data = request.json
    print("📥 DADOS RECEBIDOS:", data)
    
    endereco_id = data.get('endereco_id')
    pedido_id = data.get('pedido_id')
    restaurante_id = data.get('restaurante_id')
    
    endereco_cliente = Endereco.query.get(endereco_id)
    if not endereco_cliente:
        return jsonify({"erro": "Endereço não encontrado"}), 404
    
    restaurante_do_pedido = None
    
    if pedido_id:
        pedido_no_banco = Pedido.query.get(pedido_id)
        if not pedido_no_banco:
            return jsonify({"erro": "Pedido não encontrado"}), 404
        restaurante_do_pedido = Restaurantes.query.get(pedido_no_banco.restaurante_id)
    
    elif restaurante_id:
        restaurante_do_pedido = Restaurantes.query.get(restaurante_id)
    
    if not restaurante_do_pedido:
        return jsonify({"erro": "Restaurante não encontrado"}), 404
    
    LAT_RESTAURANTE = restaurante_do_pedido.latitude
    LON_RESTAURANTE = restaurante_do_pedido.longitude
    
    distancia = calcular_distancia_km(
        LAT_RESTAURANTE,
        LON_RESTAURANTE,
        endereco_cliente.latitude,
        endereco_cliente.longitude
    )
    
    valor_taxa = round(distancia * 1.50, 2)
    
    is_frete_gratis = distancia < 1.0
    
    tempo_base = 20
    tempo_por_km = 3
    tempo_min = tempo_base + int(distancia * tempo_por_km)
    tempo_max = tempo_min + 15
    tempo_estimado = f"{tempo_min}-{tempo_max} min"
    
    resposta = {
        "taxaEntrega": valor_taxa,
        "isFreteGratis": is_frete_gratis,
        "tempoEstimado": tempo_estimado,
        "distancia_km": round(distancia, 2)
    }
    
    print("📤 RESPOSTA:", resposta)
    return jsonify(resposta)


# Rota para criar pagamento PIX
@pagamentos_bp.route('/pagamentos/pix', methods=['POST'])
def criar_pix():
    """
    Cria um pagamento PIX via API de Orders do Mercado Pago
    Retorna o QR Code para o front-end exibir
    """
    data = request.json
    tipo_envio = data.get('tipo_envio')
    
    id_do_pedido = data.get('pedido_id')
    pedido_no_banco = Pedido.query.get(id_do_pedido)
    
    if not pedido_no_banco:
        return jsonify({"erro": "Pedido não encontrado no banco de dados"}), 404
    
    if tipo_envio == 'retirada':
        valor_taxa = 0.0
    else:
        endereco_cliente = Endereco.query.get(data.get('endereco_id'))
        if not endereco_cliente:
            return jsonify({"erro": "Endereço não encontrado"}), 404
        
        restaurante_do_pedido = Restaurantes.query.get(pedido_no_banco.restaurante_id)
        
        LAT_RESTAURANTE = restaurante_do_pedido.latitude
        LON_RESTAURANTE = restaurante_do_pedido.longitude
        
        distancia = calcular_distancia_km(LAT_RESTAURANTE, 
            LON_RESTAURANTE, endereco_cliente.latitude, endereco_cliente.longitude)
        valor_taxa = distancia * 1.50
    
    novo_pagamento = Pagamento(
        pedido_id=id_do_pedido, 
        metodo=data.get('metodo_id'),  # 1 = PIX
        subtotal=data.get('subtotal', 0.0),
        taxa_entrega=valor_taxa
    )
    
    sucesso_validacao, mensagem = novo_pagamento.validar_pagamento(pedido_no_banco)
    if not sucesso_validacao:
        return jsonify({"erro": mensagem}), 400
    
    total_final = float(novo_pagamento.subtotal) + float(novo_pagamento.taxa_entrega)
    
    order_payload = {
        "type": "online",
        "total_amount": str(total_final),
        "external_reference": str(id_do_pedido),
        "processing_mode": "automatic",
        "description": f"Pedido Pop Doces #{id_do_pedido}",
        "payer": {
            "email": "test_user_99999999@testuser.com",
            "first_name": "APRO",
            "last_name": "Test",
            "identification": {
                "type": "CPF",
                "number": "00000000000"
            }
        },
        "transactions": {
            "payments": [
                {
                    "amount": str(total_final),
                    "payment_method": {
                        "id": "pix",
                        "type": "bank_transfer"
                    }
                }
            ]
        }
    }
    
    idempotency_key = str(uuid.uuid4())
    
    try:
            response = requests.post(
                'https://api.mercadopago.com/v1/orders',
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {ACCESS_TOKEN}',
                    'X-Idempotency-Key': idempotency_key
                },
                data=json.dumps(order_payload)
            )
            
            print("=" * 50)
            print("STATUS CODE:", response.status_code)
            print("RESPONSE TEXT:", response.text)
            print("=" * 50)
            
            if response.status_code >= 400:
                print("❌ Erro API Orders:", response.text)
                return jsonify({
                    "erro": "Erro na API do Mercado Pago",
                    "detalhes": response.json() if response.text else "Sem detalhes"
                }), response.status_code
            
            order_data = response.json()
            print("✅ ORDER_DATA:", json.dumps(order_data, indent=2))
            
            if 'transactions' not in order_data or not order_data['transactions']:
                print("❌ Resposta sem transactions:", order_data)
                return jsonify({
                    "erro": "Resposta da API não contém dados de pagamento",
                    "detalhes": order_data
                }), 500
            
            payments = order_data['transactions'].get('payments', [])
            if not payments:
                print("❌ Sem payments na resposta")
                return jsonify({
                    "erro": "Nenhum pagamento encontrado na resposta",
                    "detalhes": order_data
                }), 500
                
            payment_info = payments[0]
            qr_code = payment_info['payment_method']['qr_code']
            ticket_url = payment_info['payment_method']['ticket_url']
            order_id = order_data['id']
            
            novo_pagamento.transacao_id = order_id
            novo_pagamento.status = "Aguardando Pagamento"
            
            db.session.add(novo_pagamento)
            db.session.commit()
            
            return jsonify({
                "pagamento_id": novo_pagamento.id,
                "order_id": order_id,
                "qr_code": qr_code,
                "ticket_url": ticket_url,
                "status": "Aguardando Pagamento",
                "total": total_final
            }), 201
            
    except Exception as e:
        print(f"❌ Erro ao criar order PIX: {e}")
        db.session.rollback()
        return jsonify({"erro": f"Erro ao criar pagamento PIX: {str(e)}"}), 400
    
# Rota TEMPORÁRIA para simular aprovação de pagamento (apenas para testes)
@pagamentos_bp.route('/pagamentos/simular-aprovacao/<int:pedido_id>', methods=['POST'])
def simular_aprovacao(pedido_id):
    """Simula a aprovação de um pagamento para fins de teste acadêmico"""
    
    pagamento = Pagamento.query.filter_by(
        pedido_id=pedido_id
    ).order_by(Pagamento.id.desc()).first()
    
    if not pagamento:
        return jsonify({"erro": "Pagamento não encontrado"}), 404
    
    # Atualiza o status
    pagamento.status = "Pagamento Confirmado"
    
    if pagamento.pedido:
        pagamento.pedido.status = "Em Preparação"
        
        try:
            email_do_usuario = pagamento.pedido.usuario.email
            enviar_nf_pdf(pagamento.pedido, email_do_usuario)
        except Exception as e:
            print(f"Erro ao enviar NF: {e}")
        
        try:
            pagamento.pedido.gerar_codigo_entrega()
            pagamento.pedido.iniciar_simulacao()
        except Exception as e:
            print(f"Erro ao iniciar simulação: {e}")
    
    db.session.commit()
    
    return jsonify({
        "mensagem": "Pagamento aprovado com sucesso! (Simulação)",
        "status": pagamento.status,
        "pedido_status": pagamento.pedido.status if pagamento.pedido else None
    }), 200
    
@pagamentos_bp.route('/pagamentos/checkout-retirada', methods=['POST'])
def checkout_retirada():
    """Checkout para retirada no local"""
    data = request.json
    id_do_pedido = data.get('pedido_id')
    pedido_no_banco = Pedido.query.get(id_do_pedido)

    if not pedido_no_banco:
        return jsonify({"erro": "Pedido não encontrado"}), 404
    
    # Configura pedido como retirada
    pedido_no_banco.tipo_retirada = 'retirada'
    
    novo_pagamento = Pagamento(
        pedido_id=id_do_pedido, 
        metodo=data.get('metodo_id'),
        subtotal=data.get('subtotal', 0.0),
        taxa_entrega=0.0  # Retirada: sem taxa
    )
    
    sucesso_validacao, mensagem = novo_pagamento.validar_pagamento(pedido_no_banco)
    if not sucesso_validacao:
        return jsonify({"erro": mensagem}), 400
    
    total_final = float(novo_pagamento.subtotal)

    preference_data = {
        "items": [{
            "title": f"Pedido Pop Doces #{id_do_pedido} - Retirada",
            "quantity": 1,
            "unit_price": total_final,
            "currency_id": "BRL"
        }],
        "payer": {
            "email": data.get('email_cliente'),
        },
        "statement_descriptor": "POP DOCES",
        "back_urls": {
            "success": "hhttps://ceremony-moving-strainer.ngrok-free.dev/pagamentos/retorno-sucesso",
            "failure": "https://seusite.com/erro",
            "pending": "https://seusite.com/pendente"
        },
        "auto_return": "approved",
        "external_reference": str(id_do_pedido),
        "notification_url": "https://ceremony-moving-strainer.ngrok-free.dev/webhooks/mercadopago"
    }

    try:
        result = sdk.preference().create(preference_data)
        
        if result["status"] >= 400:
            return jsonify({
                "erro": "Erro na API do Mercado Pago",
                "detalhes": result.get("response")
            }), result["status"]
            
        preference = result["response"]
        novo_pagamento.transacao_id = preference["id"]
        novo_pagamento.status = "Aguardando Pagamento"
        
        db.session.add(novo_pagamento)
        db.session.commit()

        return jsonify({
            "pagamento_id": novo_pagamento.id,
            "checkout_url": preference["init_point"],
            "pedido_id": id_do_pedido
        }), 201

    except Exception as e:
        return jsonify({"erro": f"Erro ao criar preferência: {str(e)}"}), 400


# Endpoint que o painel consulta periodicamente
@pagamentos_bp.route('/painel/pedidos-prontos', methods=['GET'])
def pedidos_prontos_painel():
    """Retorna pedidos prontos para exibição no painel"""
    try:
        # 🔄 CORRIGIDO: Usando data_preparo_inicio e id como fallback
        pedidos_prontos = Pedido.query.filter(
            Pedido.tipo_retirada =='retirada',
            Pedido.status =='Pronto'
        ).order_by(Pedido.id.desc()).limit(20).all()
        
        resultado = []
        for pedido in pedidos_prontos:
            resultado.append({
                'id': pedido.id,
                'numero_senha': pedido.numero_senha,
                'nome_cliente': pedido.usuario.nome.split()[0] if pedido.usuario and pedido.usuario.nome else 'Cliente',
                'status': pedido.status
            })
        
        return jsonify(resultado), 200
    except Exception as e:
        print(f"❌ ERRO NO PAINEL: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"erro": str(e)}), 500


# Endpoint para simular mudança de status (será substituído pelo sistema do restaurante)
@pagamentos_bp.route('/admin/atualizar-status-pedido/<int:pedido_id>', methods=['PUT'])
def atualizar_status_pedido(pedido_id):
    """Endpoint administrativo para mudar status dos pedidos"""
    data = request.json
    novo_status = data.get('status_preparo')
    
    if novo_status not in ['confirmado', 'preparando', 'pronto', 'finalizado']:
        return jsonify({"erro": "Status inválido"}), 400
    
    pedido = Pedido.query.get_or_404(pedido_id)
    pedido.status_preparo = novo_status
    db.session.commit()
    
    return jsonify({
        "mensagem": "Status atualizado",
        "pedido_id": pedido_id,
        "numero_senha": pedido.numero_senha,
        "status_preparo": pedido.status_preparo
    }), 200
    
@pagamentos_bp.route('/pedido/<int:pedido_id>/confirmar-retirada', methods=['PUT'])
def confirmar_retirada(pedido_id):
    """Confirma que o cliente retirou o pedido"""
    try:
        data = request.json
        pedido = db.session.get(Pedido, pedido_id)
        
        if not pedido:
            return jsonify({"erro": "Pedido não encontrado"}), 404
        
        if pedido.tipo_retirada != 'retirada':
            return jsonify({"erro": "Este pedido não é de retirada"}), 400
        
        if pedido.status_preparo != 'pronto':
            return jsonify({"erro": "Pedido ainda não está pronto para retirada"}), 400
        
        pedido.status_preparo = 'finalizado'
        pedido.status = 'Entregue'
        db.session.commit()
        
        return jsonify({
            "mensagem": "Retirada confirmada! Bom apetite!",
            "status": pedido.status
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": str(e)}), 500