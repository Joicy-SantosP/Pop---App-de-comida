# produto_model.py

from config import db

class Produto(db.Model):
    __tablename__ = 'produtos'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(256), nullable=False)
    descricao = db.Column(db.String(500), nullable=True)
    preco = db.Column(db.Float, nullable=False)
    imagem = db.Column(db.String(500), nullable=True)
    
    status = db.Column(db.Boolean, nullable=False, default=True) 
    
    categoria = db.Column(db.String(100), nullable=False)
    
    id_restaurante = db.Column(
        db.Integer,
        db.ForeignKey('restaurantes.id'),
        nullable=False
    )

    def __init__(self, nome, preco, categoria, id_restaurante, descricao=None, imagem=None):
        self.nome = nome
        self.descricao = descricao
        self.preco = preco
        self.imagem = imagem
        self.categoria = categoria
        self.id_restaurante = id_restaurante

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'descricao': self.descricao,
            'preco': self.preco,
            'imagem': self.imagem,
            'status': self.status,
            'categoria': self.categoria,
            'id_restaurante': self.id_restaurante
        }