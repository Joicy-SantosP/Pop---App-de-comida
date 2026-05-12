from config import db
from datetime import datetime

class Endereco(db.Model):
    __tablename__ = 'enderecos'
    
    id = db.Column(db.Integer, primary_key=True)
    
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    
    cep = db.Column(db.String(8), nullable=False)
    logradouro = db.Column(db.String(256), nullable=False)
    numero = db.Column(db.String(20), nullable=False)
    bairro = db.Column(db.String(150), nullable=False)
    cidade = db.Column(db.String(100), nullable=False)
    estado = db.Column(db.String(2), nullable=False)
    
    complemento = db.Column(db.String(150), nullable=True)
    ponto_referencial = db.Column(db.String(256), nullable=True)
    rotulo = db.Column(db.String(50), nullable=True)
    
    principal = db.Column(db.Boolean, default=False, nullable=False)
    
    latitude = db.Column(db.Numeric(precision=10, scale=6), nullable=False)
    longitude = db.Column(db.Numeric(precision=10, scale=6), nullable=False)
    
    ativo = db.Column(db.Boolean, default=True, nullable=False)
    criado_em = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Endereco {self.rotulo} - {self.logradouro}>'