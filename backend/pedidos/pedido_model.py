from config import db

class Pedido(db.Model):
    __tablename__ = 'pedido'

    id = db.Column(db.Integer, primary_key=True)
    total = db.Column(db.Float, nullable=False)

    restaurante_id = db.Column(
        db.Integer,
        db.ForeignKey('restaurante.id'),
        nullable=False
    )

    restaurante = db.relationship('Restaurante', back_populates='pedidos')

    def __init__(self, total, restaurante_id):
        self.total = total
        self.restaurante_id = restaurante_id

    def to_dict(self):
        return {
            "id": self.id,
            "total": self.total,
            "restaurante_id": self.restaurante_id
        }