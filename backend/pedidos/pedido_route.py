from flask import Blueprint, request, jsonify
from .pedido_model import criar_carrinho, adicionar_item_ao_carrinho, Pedido, remover_item_do_carrinho
from config import db
from datetime import datetime

pedidos_blueprint = Blueprint('pedidos', __name__)

# Cria um pedido vazio (abre o carrinho de compras)
@pedidos_blueprint.route("/pedidos", methods=["POST"])
def abrir_pedido():
    dados = request.get_json()
    restaurante_id = dados.get('restaurante_id')
    usuario_id = dados.get('usuario_id')
    
    if not restaurante_id or not usuario_id:
         return jsonify({"erro": "O ID do restaurante é obrigatório"}), 400

    pedido, status = criar_carrinho(restaurante_id, usuario_id)
    return jsonify(pedido), status

# Adiciona um doce ao carrinho e recalcula o total do pedido
@pedidos_blueprint.route("/pedidos/<int:pedido_id>/itens", methods=["POST"])
def adicionar_item(pedido_id):
    dados = request.get_json()
    
    pedido_atualizado, status = adicionar_item_ao_carrinho(pedido_id, dados)
    return jsonify(pedido_atualizado), status

# Cancela um pedido existente
@pedidos_blueprint.route("/pedidos/<int:id>/cancelar", methods=["PUT"])
def cancelar_pedido(id):
    pedido = db.session.get(Pedido, id)

    if not pedido:
        return jsonify({"erro": "Pedido não encontrado"}), 404
    
    if pedido.status == 'CANCELADO':
        return jsonify({"erro": "Pedido já está cancelado"}), 400

    try:
        pedido.status = 'CANCELADO'
        db.session.commit()
        return jsonify({"mensagem": "Pedido cancelado com sucesso"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": "Erro ao cancelar pedido", "detalhes": str(e)}), 500

# Acompanha o status do pedido com transições automáticas baseadas no tempo
@pedidos_blueprint.route('/pedidos/<int:id>/status', methods=["GET"])
def acompanhar_pedido(id):
    pedido = db.session.get(Pedido, id)
    if not pedido:
        return jsonify({"erro": "Pedido não encontrado"}), 404
    
    if pedido.status in ["Em Preparação", "Pronto", "Em Trânsito"] and pedido.data_preparo_inicio:
        agora = datetime.utcnow()
        minutos_passados = (agora - pedido.data_preparo_inicio).total_seconds() / 60
        
        status_original = pedido.status
        
        if minutos_passados >= pedido.minutos_preparo and pedido.status == "Em preparacao":
            pedido.status = "Pronto"

        if pedido.status == "Pronto":
            if pedido.tipo_retirada == "entrega":
                if minutos_passados >= (pedido.minutos_preparo + 2):
                    pedido.status = "Em transito"
            
        if pedido.tipo_retirada == "entrega":
            if minutos_passados >= (pedido.minutos_preparo + 2 + pedido.minutos_entrega) and pedido.status == "Em transito":
                pedido.status = "Entregue"

        if status_original != pedido.status:
            db.session.commit()
        
    return jsonify(pedido.to_dict()), 200

# Remove um item específico do carrinho
@pedidos_blueprint.route("/pedidos/itens/<int:item_id>", methods=["DELETE"])
def deletar_item(item_id):
    try:
        pedido_atualizado, status = remover_item_do_carrinho(item_id)
        return jsonify(pedido_atualizado), status
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

# Força o status do pedido para "Pronto" (rota auxiliar para testes)
@pedidos_blueprint.route('/pedidos/<int:id>/forçar-pronto', methods=['PATCH'])
def forcar_pronto(id):
    pedido = db.session.get(Pedido, id)
    pedido.status = 'Pronto'
    db.session.commit()
    return jsonify({"mensagem": "Status forçado para Pronto!"})

# Lista todos os pedidos de um usuário específico
@pedidos_blueprint.route("/usuarios/<int:user_id>/pedidos", methods=["GET"])
def listar_pedidos_usuario(user_id):
    pedidos = Pedido.query.filter_by(usuario_id=user_id).order_by(Pedido.id.desc()).all()
    for p in pedidos:
        print(f"Pedido #{p.id}: tipo_retirada={p.tipo_retirada}, status={p.status}")
    return jsonify([p.to_dict() for p in pedidos]), 200

# Confirma a retirada de um pedido no balcão
@pedidos_blueprint.route('/pedidos/<int:id>/confirmar-retirada', methods=['PATCH'])
def confirmar_retirada(id):
    pedido = db.session.get(Pedido, id)
    
    if not pedido:
        return jsonify({"erro": "Pedido não encontrado"}), 404
    
    if not hasattr(pedido, 'tipo_retirada') or pedido.tipo_retirada != 'retirada':
        return jsonify({"erro": "Este pedido não é para retirada"}), 400
    
    status_pronto = (
        pedido.status == "Pronto" or 
        getattr(pedido, 'status_preparo', '') == 'pronto'
    )
    
    if not status_pronto:
        return jsonify({
            "erro": f"Pedido não está pronto para retirada. Status atual: {pedido.status}",
            "status": pedido.status,
            "status_preparo": getattr(pedido, 'status_preparo', 'não definido')
        }), 400
    
    try:
        pedido.status = "Entregue"
        if hasattr(pedido, 'status_preparo'):
            pedido.status_preparo = 'finalizado'
        
        db.session.commit()
        return jsonify({
            "mensagem": "Retirada confirmada com sucesso! 🍩",
            "status": pedido.status
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": str(e)}), 500