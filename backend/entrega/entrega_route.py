from flask import Blueprint, request, jsonify
from config import db
from pedidos.pedido_model import Pedido
from entrega.entrega_model import Entrega
from endereco.endereco_model import Endereco

entrega_bp = Blueprint('entrega', __name__)

@entrega_bp.route('/pedido/<int:pedido_id>/despachar', methods=['POST'])
def despachar_pedido(pedido_id):
    data = request.json
    pedido = db.session.get(Pedido, pedido_id)
    
    endereco_ref = db.session.get(Endereco, data.get('endereco_id'))

    if not endereco_ref:
        return jsonify({"erro": "Endereço de entrega obrigatório e não encontrado"}), 400
    
    if pedido.status not in ["Pronto", "Em Preparação"]:
        return jsonify({"erro": "Pedido não está pronto para despacho"}), 400

    try:
        endereco_completo = f"{endereco_ref.logradouro}, {endereco_ref.numero} - {endereco_ref.bairro}, {endereco_ref.cidade}/{endereco_ref.estado}"
        if endereco_ref.complemento:
            endereco_completo += f" ({endereco_ref.complemento})"

        nova_entrega = Entrega(
            pedido_id=pedido.id,
            entregador_codigo=data.get('entregador_codigo'),
            endereco_snapshot=endereco_completo,
            latitude_entrega=endereco_ref.latitude,
            longitude_entrega=endereco_ref.longitude,
            taxa_entrega=data.get('taxa', 0.0) # RN03
        )
        
        pedido.status = "Em Trânsito" # RF03
        db.session.add(nova_entrega)
        db.session.commit()
        
        return jsonify({"mensagem": "Entrega iniciada!", "destino": endereco_completo}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": str(e)}), 500

@entrega_bp.route('/pedido/<int:pedido_id>/confirmar-entrega', methods=['PATCH'])
def confirmar_entrega(pedido_id):
    pedido = db.session.get(Pedido, pedido_id)

    if not pedido or pedido.status != "Em Trânsito":
        return jsonify({"erro": "O pedido não está em rota de entrega"}), 400

    try:
        pedido.status = "Entregue"
        
        db.session.commit()
        return jsonify({"mensagem": "Status atualizado: Entregue"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": str(e)}), 500