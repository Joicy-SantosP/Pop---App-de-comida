from config import db
from produtos.produto_model import Produto

class ItemPedido(db.Model):
    __tablename__ = 'item_pedido'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # chave estrangeira 
    pedido_id = db.Column(db.Integer, db.ForeignKey('pedidos.id'), nullable=False)
    
    nome_doce = db.Column(db.String(100), nullable=False)
    quantidade = db.Column(db.Integer, nullable=False)
    preco_unitario = db.Column(db.Float, nullable=False)

    
    pedido = db.relationship('Pedido', back_populates='itens')

    def subtotal(self):
        return self.quantidade * self.preco_unitario

    def to_dict(self):
        return {
            "id": self.id,
            "nome_doce": self.nome_doce,
            "quantidade": self.quantidade,
            "preco_unitario": self.preco_unitario,
            "subtotal": self.subtotal()
        }



class Pedido(db.Model):
    __tablename__ = 'pedidos'

    id = db.Column(db.Integer, primary_key=True)
    
    restaurante_id = db.Column(db.Integer, db.ForeignKey('restaurantes.id'), nullable=False)
    status = db.Column(db.String(20), default="Aberto", nullable=False) 
    total = db.Column(db.Float, default=0.0, nullable=False)

    
    restaurante = db.relationship('Restaurante', back_populates='pedidos')
    
    # Revisar arquitetura: um pedido tem VÁRIOS itens. Se deletar o pedido, deleta os itens junto
    itens = db.relationship('ItemPedido', back_populates='pedido', cascade="all, delete-orphan")

    def __init__(self, restaurante_id, status="Aberto"):
        self.restaurante_id = restaurante_id
        self.status = status
        self.total = 0.0 # começa zerado

    def atualizar_total(self):
        # Soma o subtotal de todos os itens da lista e atualiza o total
        self.total = sum(item.subtotal() for item in self.itens)

    def to_dict(self):
        return {
            "id": self.id,
            "restaurante_id": self.restaurante_id,
            "status": self.status,
            "total": self.total,
            "itens": [item.to_dict() for item in self.itens] # Traz os doces junto!
        }


def criar_carrinho(restaurante_id):
    try:

        novo_pedido = Pedido(restaurante_id=restaurante_id)
        db.session.add(novo_pedido)
        db.session.commit()
        return novo_pedido.to_dict(), 201
    except Exception as e:
        db.session.rollback()
        return {"erro": "Erro ao criar carrinho", "detalhes": str(e)}, 500


def adicionar_item_ao_carrinho(pedido_id, dados_item):
    try:
        
        pedido = db.session.get(Pedido, pedido_id)
        
        if not pedido:
            return {"erro": "Carrinho não encontrado"}, 404
            
        if pedido.status != "Aberto":
            return {"erro": "Este pedido já foi finalizado ou cancelado e não pode ser alterado"}, 400

        doce_id = dados_item.get('doce_id')
        
        # O Back-end vai no banco e confere as informações reais
        doce_real = db.session.get(Produto, doce_id) 
        
        if not doce_real:
            return {"erro": "Doce não cadastrado no sistema"}, 404

        # Cria o novo item usando dado do bd
        novo_item = ItemPedido(
            nome_doce=doce_real.nome, # Nome real, do banco
            quantidade=dados_item['quantidade'], # front-end
            preco_unitario=doce_real.preco # Preço real do bd
        )
        
        # Adiciona, atualiza a memória e recalcula
        pedido.itens.append(novo_item) 
        pedido.atualizar_total()
        
        db.session.commit()

        return pedido.to_dict(), 200
        
    except Exception as e:
        db.session.rollback()
        return {"erro": "Erro interno ao adicionar item", "detalhes": str(e)}, 500
