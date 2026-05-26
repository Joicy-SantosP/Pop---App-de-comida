from config import db
import random
from datetime import datetime
from produtos.produto_model import Produto
from usuarios.usuario_model import Usuario

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
    data_preparo_inicio = db.Column(db.DateTime)
    minutos_preparo = db.Column(db.Integer)
    minutos_entrega = db.Column(db.Integer)
    
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    codigo_confirmacao = db.Column(db.String(4))
    
    tipo_retirada = db.Column(db.String(30), default='entrega')
    status_preparo = db.Column(db.String(30), default='confirmado')
    
    numero_senha = db.Column(db.String(6))
    
    restaurante = db.relationship('Restaurantes', back_populates='pedidos')
    usuario = db.relationship('Usuario', backref='pedidos')
    
    # Revisar arquitetura: um pedido tem VÁRIOS itens. Se deletar o pedido, deleta os itens junto
    itens = db.relationship('ItemPedido', back_populates='pedido', cascade="all, delete-orphan")

    def __init__(self, restaurante_id, status="Aberto"):
        self.restaurante_id = restaurante_id
        self.status = status
        self.total = 0.0 # começa zerado
        
    def iniciar_simulacao(self):
        self.data_preparo_inicio = datetime.utcnow()
        self.minutos_preparo = random.randint(20,40)
        self.minutos_entrega = random.randint(10,60)
        
    def gerar_codigo_entrega(self):
        if self.usuario and self.usuario.telefone:
            celular_limpo = ''.join(filter(str.isdigit, self.usuario.telefone))
            self.codigo_confirmacao = celular_limpo[-4:]
    
    def gerar_senha_retirada(self):
        self.numero_senha = str(random.randint(100,999))
        return self.numero_senha

    def atualizar_total(self):
        # Soma o subtotal de todos os itens da lista e atualiza o total
        self.total = sum(item.subtotal() for item in self.itens)

    def to_dict(self):
        return {
            "id": self.id,
            "restaurante_id": self.restaurante_id,
            "status": self.status,
            "total": self.total,

            "restaurante_nome": self.restaurante.nome,

            "itens": [
                {
                    "id": item.id,
                    "nome_doce": item.nome_doce,
                    "quantidade": item.quantidade,
                    "preco_unitario": item.preco_unitario,
                    "subtotal": item.subtotal(),

                    # pega produto pelo nome
                    "imagem": Produto.query.filter_by(nome=item.nome_doce).first().imagem
                    if Produto.query.filter_by(nome=item.nome_doce).first()
                    else None,

                    "lojaNome": self.restaurante.nome
                }
                for item in self.itens
            ]
        }


def criar_carrinho(restaurante_id, usuario_id):
    try:

        novo_pedido = Pedido(restaurante_id=restaurante_id)
        novo_pedido.usuario_id = usuario_id
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
    
def remover_item_do_carrinho(item_id):
    from .pedido_model import ItemPedido, Pedido # Garanta as importações
    
    # 1. Busca o item
    item = ItemPedido.query.get(item_id)
    if not item:
        return {"erro": "Item não encontrado"}, 404
    
    pedido_id = item.pedido_id
    
    # 2. Remove do banco
    db.session.delete(item)
    db.session.commit()
    
    # 3. Busca o pedido atualizado para devolver ao Front-end
    pedido = Pedido.query.get(pedido_id)
    return pedido.to_dict(), 200
