# pagamento_route.py

import mercadopago
import os
from flask import Blueprint, request, jsonify
<<<<<<< HEAD
from dotenv import load_dotenv
from config import db
from pedidos.pedido_model import Pedido
from pagamento.pagamento_model import (
    Pagamento,
    calcular_distancia_km
)

from endereco.endereco_model import Endereco
from restaurantes.restaurante_model import Restaurantes

=======
from pedidos.pedido_model import Pedido
from .pagamento_model import Pagamento, db, calcular_distancia_km
from endereco.endereco_model import Endereco
from restaurantes.restaurante_model import Restaurantes
from dotenv import load_dotenv
from fpdf import FPDF
from flask_mail import Message, Mail
from config import mail
>>>>>>> 39df86110f956d9fb587785dad746dc28e809ef2

load_dotenv()

ACCESS_TOKEN = os.getenv(
    "MERCADO_PAGO_ACCESS_TOKEN"
)

sdk = mercadopago.SDK(
    ACCESS_TOKEN
)

pagamentos_bp = Blueprint(
    'pagamentos',
    __name__
)

@pagamentos_bp.route(
    '/pagamentos/checkout',
    methods=['POST']
)
def checkout():

    try:

        data = request.json

        tipo_envio = data.get('tipo_envio')

        pedido_id = data.get('pedido_id')

        # SQLALCHEMY MODERNO
        pedido_no_banco = db.session.get(
            Pedido,
            pedido_id
        )

        if not pedido_no_banco:

            return jsonify({
                "erro": "Pedido não encontrado"
            }), 404

        #taxinha da entrega
        if tipo_envio == 'retirada':

            valor_taxa = 0.0

        else:

            endereco_cliente = db.session.get(
                Endereco,
                data.get('endereco_id')
            )

            if not endereco_cliente:

                return jsonify({
                    "erro": "Endereço não encontrado"
                }), 404

            restaurante_do_pedido = db.session.get(
                Restaurantes,
                pedido_no_banco.restaurante_id
            )

            if not restaurante_do_pedido:

                return jsonify({
                    "erro": "Restaurante não encontrado"
                }), 404

            LAT_RESTAURANTE = (
                restaurante_do_pedido.latitude
            )

            LON_RESTAURANTE = (
                restaurante_do_pedido.longitude
            )

            distancia = calcular_distancia_km(

                LAT_RESTAURANTE,

                LON_RESTAURANTE,

                endereco_cliente.latitude,

                endereco_cliente.longitude
            )

            valor_taxa = distancia * 1.50

        #pagamento

        novo_pagamento = Pagamento(

            pedido_id=pedido_id,

            metodo=data.get('metodo_id'),

            subtotal=pedido_no_banco.total,

            taxa_entrega=valor_taxa
        )

        #validação

        sucesso_validacao, mensagem = (

            novo_pagamento.validar_pagamento(
                pedido_no_banco
            )
        )

        if not sucesso_validacao:

            return jsonify({
                "erro": mensagem
            }), 400

        #dados mercado pago

        payment_data = {

            "transaction_amount": float(
                novo_pagamento.total_final
            ),

            "description": "Pedido Pop Doces",

            "payment_method_id": data.get(
                'metodo_slug'
            ),

            "payer": {

                "email": data.get(
                    'email_cliente'
                ),

                "first_name": "Cliente",

                "last_name": "Teste"
            }
        }

        #cartão

        if novo_pagamento.metodo == 2:

            payment_data["token"] = data.get(
                'token'
            )

            payment_data["installments"] = int(
                data.get('parcelas', 1)
            )

        # MERCADO PAGO REAL

        # result = sdk.payment().create(
        #     payment_data
        # )

        # payment_info = result["response"]

        result = {
            "status": 201
        }

        payment_info = {

            "id": 123456789,

            "status": "pending",

            "point_of_interaction": {

                "transaction_data": {

                    "qr_code_base64":
                    "iVBORw0KGgoAAAANSUhEUgA...",

                    "qr_code":
                    "00020126580014br.gov.bcb.pix"
                }
            }
        }

        #pagamento aceito
        if result["status"] == 201:

            novo_pagamento.transacao_id = str(
                payment_info["id"]
            )

            status_mp = payment_info["status"]

            novo_pagamento.status = (

                "Pagamento Confirmado"

                if status_mp == "approved"

                else "Aguardando Confirmação"
            )

            db.session.add(novo_pagamento)

            db.session.commit()

            return jsonify({

                "pagamento_id":
                novo_pagamento.id,

                "status":
                novo_pagamento.status,

                "total": round(float(novo_pagamento.total_final), 2),

                "detalhes":
                payment_info.get(
                    "point_of_interaction",
                    {}
                )

            }), 201

        return jsonify({
            "erro": "Falha no gateway"
        }), 400

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "erro": "Erro no checkout",
            "detalhes": str(e)
        }), 500


#status do pagamento
@pagamentos_bp.route(
    '/pagamentos/<int:id>/status',
    methods=['GET']
)
def verificar_status(id):

    pagamento = db.session.get(
        Pagamento,
        id
    )

    if not pagamento:

        return jsonify({
            "erro": "Pagamento não encontrado"
        }), 404

    # EXPIRAÇÃO
    if (

        pagamento.status == "Aguardando Confirmação"

        and pagamento.esta_expirado()
    ):

        pagamento.status = "Cancelado"

        pagamento.pedido.status = "Cancelado"

        db.session.commit()

        return jsonify({

            "status": "Cancelado",
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

            "motivo":
            "Tempo limite excedido"

        }), 200

    return jsonify({

        "id": pagamento.id,

        "status": pagamento.status,

        "total": pagamento.total_final

    }), 200


@pagamentos_bp.route(
    '/webhooks/mercadopago',
    methods=['POST']
)
def webhook_mp():

    try:

        data_id = (

            request.args.get('data.id')

            or

            request.json.get(
                'data',
                {}
            ).get('id')
        )

        if data_id:

            # =====================================
            # MERCADO PAGO REAL
            # =====================================

            # payment_info = sdk.payment().get(
            #     data_id
            # )["response"]

            # status_real = payment_info["status"]

            #teste

            status_real = "approved"

            pagamento = Pagamento.query.filter_by(
                transacao_id=str(data_id)
            ).first()

            if pagamento:

                #aprovado

                if status_real == "approved":

                    pagamento.status = (
                        "Pagamento Confirmado"
                    )

                    pagamento.pedido.status = (
                        "Preparando"
                    )

                    pagamento.pedido.gerar_codigo_entrega()

                    pagamento.pedido.iniciar_simulacao()

                #recusado
                elif status_real in [
                    "rejected",
                    "cancelled"
                ]:

                    pagamento.status = "Cancelado"

                    pagamento.pedido.status = (
                        "Cancelado"
                    )

                db.session.commit()

        return "", 200

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "erro": str(e)
        }), 500
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
