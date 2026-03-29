from config import db


class ItemPedido(db.Model):
    __tablename__ = 'item_pedido'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Chave estrangeira ligando ao pedido
    pedido_id = db.Column(db.Integer, db.ForeignKey('pedidos.id'), nullable=False)
    
    nome_doce = db.Column(db.String(100), nullable=False)
    quantidade = db.Column(db.Integer, nullable=False)
    preco_unitario = db.Column(db.Float, nullable=False)

    # Relacionamento de volta para o Pedido principal
    pedido = db.relationship('Pedidos', back_populates='itens')

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


class Pedidos(db.Model):
    __tablename__ = 'pedidos'

    id = db.Column(db.Integer, primary_key=True)
    
    
    # O padrão Flask geralmente é singular.
    restaurante_id = db.Column(db.Integer, db.ForeignKey('restaurantes.id'), nullable=False)
    
    status = db.Column(db.String(20), default="Aberto", nullable=False) 
    total = db.Column(db.Float, default=0.0, nullable=False)

    # Verifique também se a classe do seu modelo de restaurante é 'Restaurante' ou 'Restaurantes'
    restaurante = db.relationship('Restaurantes', back_populates='pedidos')
    
    # Um pedido tem VÁRIOS itens. Se deletar o pedido, deleta os itens junto (cascade)
    itens = db.relationship('ItemPedido', back_populates='pedido', cascade="all, delete-orphan")

    def __init__(self, restaurante_id, status="Aberto"):
        self.restaurante_id = restaurante_id
        self.status = status
        self.total = 0.0 # Começa zerado

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


#REGRAS DE NEGÓCIO


def criar_carrinho(restaurante_id):
    try:
        novo_pedido = Pedidos(restaurante_id=restaurante_id)
        db.session.add(novo_pedido)
        db.session.commit()
        return novo_pedido.to_dict(), 201
    except Exception as e:
        db.session.rollback()
        return {"erro": "Erro ao criar carrinho", "detalhes": str(e)}, 500


def adicionar_item_ao_carrinho(pedido_id, dados_item):
    try:
        pedido = db.session.get(Pedidos, pedido_id)
        
        if not pedido:
            return {"erro": "Carrinho não encontrado"}, 404
            
        if pedido.status != "Aberto":
            return {"erro": "Este pedido já foi finalizado ou cancelado e não pode ser alterado"}, 400

        # Cria o novo item (
        novo_item = ItemPedido(
            nome_doce=dados_item['nome_doce'],
            quantidade=dados_item['quantidade'],
            preco_unitario=dados_item['preco_unitario']
        )
        
     
        # Isso atualiza a memória para o cálculo e prepara o INSERT no MySQL.
        pedido.itens.append(novo_item) 
        
        # Recalcula o faturamento com o novo item 
        pedido.atualizar_total()
        
        db.session.commit()

        return pedido.to_dict(), 200

    except KeyError as e:
        # Se o Front-end esquecer de mandar o 'nome_doce', 'quantidade' ou 'preco_unitario'
        return {"erro": f"Faltando dados obrigatórios do produto: {str(e)}"}, 400
        
    except Exception as e:
        db.session.rollback() 
        return {"erro": "Erro interno ao adicionar item", "detalhes": str(e)}, 500
