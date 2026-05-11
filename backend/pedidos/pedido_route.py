from flask import Blueprint, request, jsonify
from datetime import datetime
from config import db
from pedidos.pedido_model import Pedido

# Importando do Service (Onde a sua lógica real está)
from pedidos.pedido_service import (
    ver_carrinho,
    adicionar_item_ao_carrinho,
    atualizar_item,
    remover_item,
    finalizar_pedido
)

pedidos_blueprint = Blueprint('pedidos', __name__)

@pedidos_blueprint.route("/pedidos/carrinho/<int:usuario_id>", methods=["GET"])
def visualizar_carrinho(usuario_id):
    resposta, status = ver_carrinho(usuario_id)
    return jsonify(resposta), status

@pedidos_blueprint.route("/pedidos/itens/<int:usuario_id>", methods=["POST"])
def adicionar_item(usuario_id):
    dados = request.get_json()
    resposta, status = adicionar_item_ao_carrinho(usuario_id, dados)
    return jsonify(resposta), status

@pedidos_blueprint.route("/pedidos/item/<int:item_id>/<int:usuario_id>", methods=["PUT"])
def atualizar_item_route(item_id, usuario_id):
    dados = request.get_json()
    resposta, status = atualizar_item(usuario_id, item_id, dados)
    return jsonify(resposta), status

@pedidos_blueprint.route("/pedidos/item/<int:item_id>/<int:usuario_id>", methods=["DELETE"])
def remover_item_route(item_id, usuario_id):
    resposta, status = remover_item(usuario_id, item_id)
    return jsonify(resposta), status

@pedidos_blueprint.route("/pedidos/finalizar/<int:usuario_id>", methods=["POST"])
def finalizar(usuario_id):
    resposta, status = finalizar_pedido(usuario_id)
    return jsonify(resposta), status

@pedidos_blueprint.route("/pedidos/<int:id>/cancelar", methods=["PUT"])
def cancelar_pedido(id):
    pedido = db.session.get(Pedido, id)

    if not pedido:
        return jsonify({"erro": "Pedido não encontrado"}), 404
    
    if pedido.status in ['Cancelado', 'CANCELADO']:
        return jsonify({"erro": "Pedido já está cancelado"}), 400

    try:
        pedido.status = 'CANCELADO'
        pedido.updated_at = datetime.utcnow()
        db.session.commit()
        return jsonify({"mensagem": "Pedido cancelado com sucesso"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": "Erro ao cancelar pedido", "detalhes": str(e)}), 500

@pedidos_blueprint.route('/pedidos/<int:id>/status', methods=["GET"])
def acompanhar_pedido(id):
    pedido = db.session.get(Pedido, id)
    if not pedido:
        return jsonify({"erro": "Pedido não encontrado"}), 404

    if pedido.status in ["Preparando", "Pronto", "Em trânsito"] and pedido.data_preparo_inicio:
        agora = datetime.utcnow()
        minutos_passados = (agora - pedido.data_preparo_inicio).total_seconds() / 60
        status_original = pedido.status

        if minutos_passados >= pedido.minutos_preparo and pedido.status == "Preparando":
            pedido.status = "Pronto"

        if minutos_passados >= (pedido.minutos_preparo + 2) and pedido.status == "Pronto":
            pedido.status = "Em trânsito"

        if minutos_passados >= (pedido.minutos_preparo + 2 + pedido.minutos_entrega) and pedido.status == "Em trânsito":
            pedido.status = "Entregue"

        if status_original != pedido.status:
            pedido.updated_at = datetime.utcnow()
            db.session.commit()

    return jsonify(pedido.to_dict()), 200

@pedidos_blueprint.route('/pedidos/<int:id>/forcar-pronto', methods=['PATCH']) 
def forcar_pronto(id):
    pedido = db.session.get(Pedido, id)
    if not pedido:
        return jsonify({"erro": "Pedido não encontrado"}), 404
        
    pedido.status = 'Pronto'
    pedido.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify({"mensagem": "Status forçado para Pronto!"}), 200