import mercadopago
import os
from flask import Blueprint, request, jsonify, redirect
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

#calcula o total do pedido com a taxa de entrega
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
            "success": "https://ceremony-moving-strainer.ngrok-free.dev/pagamentos/retorno-sucesso", #alterar com o link do front, os três
            "failure": "http://localhost:5173",
            "pending": "http://localhost:5173"
        },
        "auto_return": "approved",
        "external_reference": str(id_do_pedido),
        "notification_url": "https://ceremony-moving-strainer.ngrok-free.dev/webhooks/mercadopago"
    }

    try:
        # Criando a preferência no Mercado Pago
        result = sdk.preference().create(preference_data)
        print("DEBUG MP FULL RESPONSE:", result)

        if result["status"] >= 400:
            # Se a API do MP retornar erro (ex: token inválido, preço errado)
            return jsonify({
                "erro": "Erro na API do Mercado Pago",
                "detalhes": result.get("response", "Sem detalhes")
            }), result["status"]
        preference = result["response"]

        # Salva o ID da preferência no banco para controle
        novo_pagamento.transacao_id = preference["id"]
        novo_pagamento.status = "Aguardando Pagamento"
        
        db.session.add(novo_pagamento)
        db.session.commit()

        # Retornamos o init_point para o seu front-end abrir
        return jsonify({
            "pagamento_id": novo_pagamento.id,
            "checkout_url": preference["init_point"] 
        }), 201

    except Exception as e:
        return jsonify({"erro": f"Erro ao criar preferência: {str(e)}"}), 400
    
#envia uma nota fizcal básuica para o email após o pagamento
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
    
#Aqui verifica o status do pedidio para o pagamento
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
    
#verifica o status do pagamento para o frontend
@pagamentos_bp.route('/pagamentos/pedido/<int:pedido_id>', methods=['GET'])
def verificar_status_por_pedido(pedido_id):

    pagamento = Pagamento.query.filter_by(
        pedido_id=pedido_id
    ).order_by(Pagamento.id.desc()).first()

    if not pagamento:
        return jsonify({"erro": "Pagamento não encontrado"}), 404

    # verifica expiração
    if pagamento.status == "Aguardando Confirmação" and pagamento.esta_expirado():
        pagamento.status = "Cancelado"
        db.session.commit()

    return jsonify({
        "id": pagamento.id,
        "status": pagamento.status,
        "total": pagamento.total_final
    }), 200

#captura a resposta do mercado pago sobre o pagamento
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

@pagamentos_bp.route('/pagamentos/calcular-taxa', methods=['POST'])
def consultar_taxa():
    data = request.json
    print("📥 DADOS RECEBIDOS:", data)
    
    endereco_id = data.get('endereco_id')
    pedido_id = data.get('pedido_id')
    restaurante_id = data.get('restaurante_id')
    
    # Validação do endereço
    endereco_cliente = Endereco.query.get(endereco_id)
    if not endereco_cliente:
        return jsonify({"erro": "Endereço não encontrado"}), 404
    
    restaurante_do_pedido = None
    
    # Caso 1: Tem pedido_id (fluxo normal depois do checkout)
    if pedido_id:
        pedido_no_banco = Pedido.query.get(pedido_id)
        if not pedido_no_banco:
            return jsonify({"erro": "Pedido não encontrado"}), 404
        restaurante_do_pedido = Restaurantes.query.get(pedido_no_banco.restaurante_id)
    
    # Caso 2: Tem restaurante_id direto (carrinho ainda sem pedido)
    elif restaurante_id:
        restaurante_do_pedido = Restaurantes.query.get(restaurante_id)
    
    if not restaurante_do_pedido:
        return jsonify({"erro": "Restaurante não encontrado"}), 404
    
    # Cálculo da distância
    LAT_RESTAURANTE = restaurante_do_pedido.latitude
    LON_RESTAURANTE = restaurante_do_pedido.longitude
    
    distancia = calcular_distancia_km(
        LAT_RESTAURANTE,
        LON_RESTAURANTE,
        endereco_cliente.latitude,
        endereco_cliente.longitude
    )
    
    valor_taxa = round(distancia * 1.50, 2)
    
    # Regra de frete grátis (exemplo: distância menor que 1km)
    is_frete_gratis = distancia < 1.0
    
    # Tempo estimado
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