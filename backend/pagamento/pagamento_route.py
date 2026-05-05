import mercadopago
import os
from flask import Blueprint, request, jsonify
from pedidos.pedido_model import Pedido
from .pagamento_model import Pagamento, db, calcular_distancia_km
from endereco.endereco_model import Endereco
from restaurantes.restaurante_model import Restaurantes
from dotenv import load_dotenv
from fpdf import FPDF
from flask_mail import Message, Mail
from config import mail

load_dotenv()

# Chave de teste do Mercado Pago
ACCESS_TOKEN = os.getenv("MERCADO_PAGO_ACCESS_TOKEN")
sdk = mercadopago.SDK(ACCESS_TOKEN)

pagamentos_bp = Blueprint('pagamentos', __name__)

@pagamentos_bp.route('/pagamentos/checkout', methods=['POST'])
def checkout():
    data = request.json
    tipo_envio = data.get('tipo_envio')
    
    if tipo_envio == 'retirada':
        valor_taxa = 0.0
    else:
        endereco_cliente = Endereco.query.get(data.get('endereco_id'))
        if not endereco_cliente:
            return jsonify({"erro": "Endereço não encontrado"}), 404
        
        LAT_RESTAURANTE = -23.5505
        LON_RESTAURANTE = -46.6333
            
        distancia = calcular_distancia_km(LAT_RESTAURANTE, 
            LON_RESTAURANTE, endereco_cliente.latitude, endereco_cliente.longitude)
        valor_taxa = distancia * 1.50
    
    id_do_pedido = data.get('pedido_id')
    pedido_no_banco = Pedido.query.get(id_do_pedido)

    if not pedido_no_banco:
        return jsonify({"erro": "Pedido não encontrado no banco de dados"}), 404

    novo_pagamento = Pagamento(
        pedido_id=id_do_pedido, 
        metodo=data.get('metodo_id'),
        subtotal=data.get('subtotal'),
        taxa_entrega=valor_taxa
    )
    
    
    sucesso_validacao, mensagem = novo_pagamento.validar_pagamento(pedido_no_banco)
    if not sucesso_validacao:
        return jsonify({"erro": mensagem}), 400
    

    payment_data = {
        "transaction_amount": float(novo_pagamento.total_final),
        "description": "Pedido Pop Doces",
        "payer": {"email": data.get('email_cliente')},
        "payment_method_id": data.get('metodo_slug') # ex: pix, visa, master
    }
    
    if novo_pagamento.metodo == 2:
        payment_data["token"] = data.get('token')
        payment_data["installments"] = int(data.get('parcelas', 1))
        
    result = sdk.payment().create(payment_data)
    payment_info = result["response"]
    
    if result["status"] == 201:
        novo_pagamento.transacao_id = str(payment_info["id"])
        
        status_mp = payment_info["status"]
        novo_pagamento.status = "Pagamento Confirmado" if status_mp == "approved" else "Aguardando Confirmação"
        
        db.session.add(novo_pagamento)
        db.session.commit()

        return jsonify({
            "pagamento_id": novo_pagamento.id,
            "status": novo_pagamento.status,
            "detalhes": payment_info.get("point_of_interaction", {})
        }), 201
        
    return jsonify({"erro": "Falha na comunicação com Gateway"}), 400

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

    mail.send(msg)


@pagamentos_bp.route('/webhooks/mercadopago', methods=['POST'])
def webhook_mp():
    data_id = request.args.get('data.id') or request.json.get('data', {}).get('id')
    
    if data_id:
        #payment_info = sdk.payment().get(data_id)["response"]
        #status_real = payment_info["status"]
        
        status_real = "approved" #para o teste
        
        pagamento = Pagamento.query.filter_by(transacao_id=str(data_id)).first()
        
        if pagamento:
            if status_real == "approved":
                pagamento.status = "Pagamento Confirmado"
                pagamento.pedido.status = "Em Preparação"
                email_do_usuario = pagamento.pedido.usuario.email
                try:
                    enviar_nf_pdf(pagamento.pedido, email_do_usuario)
                except Exception as e:
                    print(f"Erro ao enviar email: {e}")
            elif status_real in ["rejected", "cancelled"]:
                pagamento.status = "Cancelado"
                pagamento.pedido.status = "Cancelado"
            
            pagamento.pedido.gerar_codigo_entrega()
            pagamento.pedido.iniciar_simulacao()
            db.session.commit()

    return "", 200
