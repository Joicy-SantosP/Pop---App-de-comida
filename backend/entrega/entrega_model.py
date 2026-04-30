from datetime import datetime
from config import db

class Entrega(db.Model):
    __tablename__ = 'entregas'

    id = db.Column(db.Integer, primary_key=True)
    pedido_id = db.Column(db.Integer, db.ForeignKey('pedidos.id'), nullable=False)
    
    entregador_codigo = db.Column(db.Integer) 
    
    endereco_snapshot = db.Column(db.String(256), nullable=False)
    latitude_entrega = db.Column(db.Numeric(precision=10, scale=6))
    longitude_entrega = db.Column(db.Numeric(precision=10, scale=6))
    
    taxa_entrega = db.Column(db.Float, default=0.0) # RN03
    data_saida = db.Column(db.DateTime, default=datetime.utcnow)
    data_conclusao = db.Column(db.DateTime)

    pedido = db.relationship('Pedido', backref=db.backref('detalhes_entrega', uselist=False))

    def finalizar(self):
        self.data_conclusao = datetime.utcnow()