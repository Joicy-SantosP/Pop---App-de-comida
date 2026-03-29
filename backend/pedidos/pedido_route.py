from flask import Blueprint, request, jsonify
from .pedido_model import criar_carrinho, adicionar_item_ao_carrinho, Pedidos
from config import db

pedidos_blueprint = Blueprint('pedidos', __name__)

###cria um pedido vazio (Abre o carrinho)
@pedidos_blueprint.route("/pedidos", methods=["POST"])
def abrir_pedido():
    dados = request.get_json()
    restaurante_id = dados.get('restaurante_id')
    
    if not restaurante_id:
         return jsonify({"erro": "O ID do restaurante é obrigatório"}), 400

    ###Chama a regra de negócio que está no Model
    pedido, status = criar_carrinho(restaurante_id)
    return jsonify(pedido), status

###adiciona um doce e calcula o faturamento
@pedidos_blueprint.route("/pedidos/<int:pedido_id>/itens", methods=["POST"])
def adicionar_item(pedido_id):
    dados = request.get_json()
    
    # Passa o trabalho  pro Model fazer a matemática
    pedido_atualizado, status = adicionar_item_ao_carrinho(pedido_id, dados)
    return jsonify(pedido_atualizado), status

# rota cancelar
@pedidos_blueprint.route("/pedidos/<int:id>/cancelar", methods=["PUT"])
def cancelar_pedido(id):
    pedido = db.session.get(Pedidos, id)

    if not pedido:
        return jsonify({"erro": "Pedido não encontrado"}), 404
    
    if pedido.status == 'CANCELADO':
        return jsonify({"erro": "Pedido já está cancelado"}), 400

    try:
        pedido.status = 'CANCELADO'
        db.session.commit()
        return jsonify({"mensagem": "Pedido cancelado com sucesso"}), 200
    ##rollback no BD
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": "Erro ao cancelar pedido", "detalhes": str(e)}), 500
