import math
from config import db
from datetime import datetime, timedelta

class Pagamento(db.Model):
    __tablename__ = 'pagamentos'
    
    id = db.Column(db.Integer, primary_key=True)
    
    pedido = db.relationship('Pedido', backref=db.backref('pagamento', uselist=False))
    
    pedido_id = db.Column(db.Integer, db.ForeignKey('pedidos.id'), nullable=False)
    
    metodo = db.Column(db.Integer, nullable=False)
    
    subtotal = db.Column(db.Float(asdecimal=True), nullable=False)
    taxa_entrega = db.Column(db.Float(asdecimal=True), nullable=False)
    total_final = db.Column(db.Float(asdecimal=True), nullable=False)
    
    status = db.Column(db.String(30), default="Aguardando Pagamento")
    
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    
    def esta_expirado(self):
        limite = self.data_criacao + timedelta(minutes=10)
        return datetime.utcnow() > limite
    
    transacao_id = db.Column(db.String(100), unique=True, nullable=True)
    
    def __init__(self, pedido_id, metodo, subtotal, taxa_entrega):
        self.pedido_id = pedido_id
        self.metodo = metodo
        self.subtotal = subtotal
        self.taxa_entrega = taxa_entrega
        self.total_final = self.subtotal + self.taxa_entrega

    
    def validar_pagamento(self, pedido_no_banco):
        
        if not pedido_no_banco:
            return False, "Pedido não encontrado"
        
        valor_real_itens = sum(item.preco_unitario * item.quantidade for item in pedido_no_banco.itens)
        if self.subtotal != valor_real_itens:
            return False, f"O subtotal ({self.subtotal}) não condiz com o carrinho ({valor_real_itens})."
        
        calculo_total = self.subtotal + self.taxa_entrega
        if self.total_final != calculo_total:
            return False, "Erro de cálculo no total final (Soma inválida)."
        
        metodos_aceitos = [1,2,3] # 1:Pix, 2:Cartão, 3:Dinheiro
        if self.metodo not in metodos_aceitos:
            return False, "Método de pagamento inválido ou não suportado"
        
        return True, "Dados válidos.Pronto para processar o pagamento."
    
def calcular_distancia_km(lat1,lon1,lat2,lon2):
    R = 6371.0
        
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
        
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
        
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    distancia = R * c
    return round(distancia, 2)
    