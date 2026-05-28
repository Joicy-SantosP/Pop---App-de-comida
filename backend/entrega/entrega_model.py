from datetime import datetime
from config import db

class Entrega(db.Model):
    __tablename__ = 'entregas'

    id = db.Column(db.Integer, primary_key=True)
    pedido_id = db.Column(db.Integer, db.ForeignKey('pedidos.id'), nullable=False)
    
    # 🔄 ALTERADO: Agora é ForeignKey para a tabela entregadores
    entregador_id = db.Column(db.Integer, db.ForeignKey('entregadores.id'), nullable=True)
    
    endereco_snapshot = db.Column(db.String(256), nullable=False)
    latitude_entrega = db.Column(db.Numeric(precision=10, scale=6))
    longitude_entrega = db.Column(db.Numeric(precision=10, scale=6))
    
    taxa_entrega = db.Column(db.Float, default=0.0)
    data_saida = db.Column(db.DateTime, default=datetime.utcnow)
    data_conclusao = db.Column(db.DateTime)

    # Relacionamentos
    pedido = db.relationship('Pedido', backref=db.backref('detalhes_entrega', uselist=False))
    entregador = db.relationship('Entregador', backref=db.backref('entregas', lazy=True))

    def finalizar(self):
        self.data_conclusao = datetime.utcnow()
    
    def to_dict(self):
        return {
            'id': self.id,
            'pedido_id': self.pedido_id,
            'entregador_id': self.entregador_id,
            'entregador_nome': self.entregador.nome if self.entregador else None,
            'endereco_snapshot': self.endereco_snapshot,
            'latitude_entrega': float(self.latitude_entrega) if self.latitude_entrega else None,
            'longitude_entrega': float(self.longitude_entrega) if self.longitude_entrega else None,
            'taxa_entrega': self.taxa_entrega,
            'data_saida': self.data_saida.isoformat() if self.data_saida else None,
            'data_conclusao': self.data_conclusao.isoformat() if self.data_conclusao else None,
            'status_entrega': 'Concluída' if self.data_conclusao else 'Em andamento'
        }