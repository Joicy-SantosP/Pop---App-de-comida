# pedido_model.py

from config import db

import random

from datetime import datetime, timedelta

from produtos.produto_model import Produto
from usuarios.usuario_model import Usuario


# =========================================================
# ITEM DO PEDIDO
# =========================================================

class ItemPedido(db.Model):

    __tablename__ = 'item_pedido'

    id = db.Column(db.Integer, primary_key=True)

    # FK PEDIDO
    pedido_id = db.Column(
        db.Integer,
        db.ForeignKey('pedidos.id'),
        nullable=False
    )

    # FK PRODUTO
    produto_id = db.Column(
        db.Integer,
        db.ForeignKey('produtos.id'),
        nullable=False
    )

    nome_doce = db.Column(
        db.String(100),
        nullable=False
    )

    quantidade = db.Column(
        db.Integer,
        nullable=False
    )

    # PREÇO CONGELADO
    preco_unitario = db.Column(
        db.Float,
        nullable=False
    )

    pedido = db.relationship(
        'Pedido',
        back_populates='itens'
    )

    produto = db.relationship('Produto')

    def subtotal(self):

        return self.quantidade * self.preco_unitario

    def to_dict(self):

        return {
            "id": self.id,
            "produto_id": self.produto_id,
            "nome_doce": self.nome_doce,
            "quantidade": self.quantidade,
            "preco_unitario": self.preco_unitario,
            "subtotal": self.subtotal()
        }


# =========================================================
# PEDIDO / CARRINHO
# =========================================================

class Pedido(db.Model):

    __tablename__ = 'pedidos'

    id = db.Column(db.Integer, primary_key=True)

    restaurante_id = db.Column(
        db.Integer,
        db.ForeignKey('restaurantes.id'),
        nullable=False
    )

    usuario_id = db.Column(
        db.Integer,
        db.ForeignKey('usuarios.id'),
        nullable=False
    )

    status = db.Column(
        db.String(30),
        default="Aberto",
        nullable=False
    )

    total = db.Column(
        db.Float,
        default=0.0,
        nullable=False
    )

    codigo_confirmacao = db.Column(
        db.String(4)
    )

    data_preparo_inicio = db.Column(
        db.DateTime
    )

    minutos_preparo = db.Column(
        db.Integer
    )

    minutos_entrega = db.Column(
        db.Integer
    )

    # CONTROLE DE TEMPO
    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    restaurante = db.relationship(
        'Restaurantes',
        back_populates='pedidos'
    )

    usuario = db.relationship(
        'Usuario',
        backref='pedidos'
    )

    itens = db.relationship(
        'ItemPedido',
        back_populates='pedido',
        cascade="all, delete-orphan"
    )

    def __init__(self, restaurante_id, usuario_id, status="Aberto"):

        self.restaurante_id = restaurante_id
        self.usuario_id = usuario_id
        self.status = status
        self.total = 0.0

    # =====================================
    # TOTAL
    # =====================================

    def atualizar_total(self):

        self.total = sum(
            item.subtotal()
            for item in self.itens
        )

    # =====================================
    # SIMULAÇÃO ENTREGA
    # =====================================

    def iniciar_simulacao(self):

        self.data_preparo_inicio = datetime.utcnow()

        self.minutos_preparo = random.randint(20, 40)

        self.minutos_entrega = random.randint(10, 60)

    # =====================================
    # CÓDIGO ENTREGA
    # =====================================

    def gerar_codigo_entrega(self):

        if self.usuario and self.usuario.telefone:

            celular_limpo = ''.join(
                filter(str.isdigit, self.usuario.telefone)
            )

            self.codigo_confirmacao = celular_limpo[-4:]

    # =====================================
    # CARRINHO ABANDONADO
    # =====================================

    def carrinho_abandonado(self):

        tempo_limite = timedelta(minutes=30)

        return (
            self.status == "Aberto"
            and datetime.utcnow() - self.updated_at > tempo_limite
        )

    def to_dict(self):

        return {

            "id": self.id,

            "usuario_id": self.usuario_id,

            "restaurante_id": self.restaurante_id,

            "status": self.status,

            "total": self.total,

            "created_at": self.created_at,

            "updated_at": self.updated_at,

            "itens": [
                item.to_dict()
                for item in self.itens
            ]
        }