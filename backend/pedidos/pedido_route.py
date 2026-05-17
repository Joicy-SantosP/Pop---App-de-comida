from flask import Blueprint, request, jsonify
from .pedido_model import criar_carrinho, adicionar_item_ao_carrinho, Pedido, remover_item_do_carrinho
from config import db
from datetime import datetime

pedidos_blueprint = Blueprint('pedidos', __name__)

###cria um pedido vazio (Abre o carrinho)
@pedidos_blueprint.route("/pedidos", methods=["POST"])
def abrir_pedido():
    dados = request.get_json()
    restaurante_id = dados.get('restaurante_id')
    usuario_id = dados.get('usuario_id')
    
    if not restaurante_id or not usuario_id:
         return jsonify({"erro": "O ID do restaurante é obrigatório"}), 400

    ###Chama a regra de negócio que está no Model
    pedido, status = criar_carrinho(restaurante_id, usuario_id)
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
    
@pedidos_blueprint.route('/pedidos/<int:id>/status', methods=["GET"])
def acompanhar_pedido(id):
    pedido = db.session.get(Pedido,id)
    if not pedido:
        return jsonify({"erro": "Pedido não encontrado"}), 404
    
    if pedido.status in ["Em Preparação", "Pronto", "Em Trânsito"] and pedido.data_preparo_inicio:
        agora = datetime.utcnow()
        minutos_passados = (agora - pedido.data_preparo_inicio).total_seconds() / 60
        
        status_original = pedido.status
        
        if minutos_passados >= pedido.minutos_preparo and pedido.status == "Em preparacao":
            pedido.status = "Pronto"

        if minutos_passados >= (pedido.minutos_preparo + 2) and pedido.status == "Pronto":
            pedido.status = "Em transito"
            
        if minutos_passados >= (pedido.minutos_preparo + 2 + pedido.minutos_entrega) and pedido.status == "Em transito":
            pedido.status = "Entregue"

        if status_original != pedido.status:
            db.session.commit()
        
    return jsonify(pedido.to_dict()), 200

 ### Painel TV
@pedidos_blueprint.route('/pedidos/painel-loja', methods=['GET'])
def painel_loja():
    try:
        pedidos_ativos = Pedido.query.filter(
            Pedido.status.in_(['Em preparacao', 'Pronto'])
        ).all()
        
        em_preparo = [p.id for p in pedidos_ativos if p.status == 'Em preparacao']
        prontos = [p.id for p in pedidos_ativos if p.status == 'Pronto']
        
        return jsonify({
            "em_preparo": em_preparo,
            "prontos_para_retirar": prontos
        }), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@pedidos_blueprint.route("/pedidos/itens/<int:item_id>", methods=["DELETE"])
def deletar_item(item_id):
    try:
        # Chamamos o Model para fazer o trabalho sujo de deletar no banco
        pedido_atualizado, status = remover_item_do_carrinho(item_id)
        return jsonify(pedido_atualizado), status
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@pedidos_blueprint.route('/pedidos/<int:id>/forçar-pronto', methods=['PATCH']) #foi só para teste, mative para caso precise novamente, mas não é necessária e não atrapalha em nada
def forcar_pronto(id):
    pedido = db.session.get(Pedido, id)
    pedido.status = 'Pronto'
    db.session.commit()
    return jsonify({"mensagem": "Status forçado para Pronto!"})

@pedidos_blueprint.route("/usuarios/<int:user_id>/pedidos", methods=["GET"])
def listar_pedidos_usuario(user_id):
    pedidos = Pedido.query.filter_by(usuario_id=user_id).order_by(Pedido.id.desc()).all()
    return jsonify([p.to_dict() for p in pedidos]), 200