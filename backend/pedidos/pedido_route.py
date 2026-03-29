from flask import request
from config import db
from pedido_model import Pedido
from restaurante_model import Restaurante
# from item_model import ItensPedido 
# from produto_model import Produto

def criarPedido():
    dados = request.json
    restaurante_id = dados.get('restaurante_id')
    cliente_id = dados.get('cliente_id') # Importante saber quem pede
    
    # VALIDAÇÃO DA EXISTENCIA
    restaurante = Restaurante.query.get(restaurante_id)
    if not restaurante:
        return {"erro": "Restaurante não encontrado"}, 404

  
    total_calculado = dados.get('total') # S

    pedido = Pedido(
        total=total_calculado, 
        restaurante_id=restaurante_id,
        cliente_id=cliente_id,
        status='CRIADO' # Define um status inicial
    )

    try:
        db.session.add(pedido)
        db.session.commit()
        return pedido.to_dict(), 201
    except Exception as e:
        db.session.rollback()
        return {"erro": "Erro ao criar pedido", "detalhe": str(e)}, 500



def cancelarPedido(id):
    pedido = Pedido.query.get(id)

    if not pedido:
        return {"erro": "Pedido não encontrado"}, 404
    
    if pedido.status == 'CANCELADO':
        return {"erro": "Pedido já está cancelado"}, 400

    try:
        pedido.status = 'CANCELADO'
       
        
        db.session.commit()
        return {"mensagem": "Pedido cancelado com sucesso"}, 200
    except Exception as e:
        db.session.rollback()
        return {"erro": "Erro ao cancelar pedido"}, 500
