from config import db
from produtos.produto_model import Produto

class Restaurantes(db.Model):
    __tablename__ = 'restaurantes'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(256), nullable=False)
    nome = db.Column(db.String(80), nullable=False)
    celular = db.Column(db.String(11), nullable=False)
    cep = db.Column(db.String(8), nullable=False)
    cnpj = db.Column(db.String(14), nullable=False, unique=True)
    especialidade = db.Column(db.String(20), nullable=False)
    cpf = db.Column(db.String(11), nullable=False)
    numero = db.Column(db.String(5), nullable=False)
    complemento = db.Column(db.String(40), nullable=True)
    imagem = db.Column(db.String(500), nullable=True)
    bairro = db.Column(db.String(256), nullable=False)
    endereco = db.Column(db.String(256), nullable=False)
    faturamento = db.Column(db.Float, default=0.0, nullable=False)
    aberto = db.Column(db.Boolean, default=False, nullable=False)
    
    email_token = db.Column(db.String(6), nullable=True)
    email_token_expiration = db.Column(db.DateTime, nullable=True)
    email_verified = db.Column(db.Boolean, default=False)
    
    # chave estrangeira
    pedidos = db.relationship('Pedidos', back_populates='restaurante')
    produtos = db.relationship('Produto', backref='restaurante', lazy=True)
    
    def __init__(self, email, celular, nome, cnpj, cep, especialidade, cpf, numero, bairro, endereco,imagem=None, complemento=None, faturamento=0.0, aberto=False):
        self.email = email
        self.celular = celular
        self.cep = cep
        self.especialidade = especialidade
        self.cpf = cpf
        self.bairro = bairro
        self.endereco = endereco
        self.numero = numero
        self.complemento = complemento
        self.imagem = imagem
        self.nome = nome
        self.cnpj = cnpj
        self.faturamento = faturamento
        self.aberto = aberto
        
    def to_dict(self):
        return {
            'id': self.id,
            'email' :self.email,
            'celular': self.celular,
            'cep': self.cep,
            'especialidade': self.especialidade,
            'cpf': self.cpf,
            'bairro': self.bairro,
            'endereco': self.endereco,
            'numero': self.numero,
            'complemento': self.complemento,
            'imagem': self.imagem,
            'nome': self.nome,
            'cnpj': self.cnpj,
            'faturamento': self.faturamento,
            'aberto': self.aberto
        }


