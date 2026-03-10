from config import db

class Restaurante(db.Model):
    __tablename__ = 'restaurante'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(50), nullable=False)
    cnpj = db.Column(db.String(14), nullable=False, unique=True)
    faturamento = db.Column(db.Float, default=0.0, nullable=False) # Correção: Float maiúsculo e default 0
    aberto = db.Column(db.Boolean, default=False, nullable=False)  # Nova regra de negócio
    
    # id_item removido! O relacionamento agora é 1 para N (1 Restaurante tem N Produtos)
    
    pedidos = db.relationship('Pedido', back_populates='restaurante')
    # No futuro, você adicionará: produtos = db.relationship('Produto', backref='restaurante')
    
    def __init__(self, nome, cnpj, faturamento=0.0):
        self.nome = nome
        self.cnpj = cnpj
        self.faturamento = faturamento
        
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'cnpj': self.cnpj,
            'faturamento': self.faturamento,
            'aberto': self.aberto
        }
    
# rotas

class RestauranteNaoIdentificado(Exception):
    pass

def getRestaurantes():
    restaurantes = Restaurante.query.all()
    # Retornando a lista e o status 200 para manter padrão com as rotas
    return [restaurante.to_dict() for restaurante in restaurantes], 200
    
def obter_restaurante_por_id(id):
    try:
        restaurante = Restaurante.query.get(id)
        if not restaurante:
            raise RestauranteNaoIdentificado('Restaurante não encontrado')
        return restaurante.to_dict(), 200
    except RestauranteNaoIdentificado as e:
        return {"error": str(e)}, 400 

def criarRestaurante(dados):
    try:
        nome = dados['nome']
        cnpj = dados['cnpj']
        faturamento = dados.get('faturamento', 0.0)

        restaurante = Restaurante(nome=nome, cnpj=cnpj, faturamento=faturamento)

        db.session.add(restaurante)
        db.session.commit()

        return restaurante.to_dict(), 201 # 201 é o status correto para "Criado"
    except KeyError as e:
        return {"erro": f"Campo obrigatório faltando: {str(e)}"}, 400

def updateRestaurante(idRestaurante, dados):
    try:
        restaurante = Restaurante.query.get(idRestaurante)
        if not restaurante:
            raise RestauranteNaoIdentificado("Restaurante não encontrado")

        # Correção: IFs independentes para atualizar múltiplos campos
        if 'nome' in dados:
            restaurante.nome = dados['nome']
        if 'cnpj' in dados:
            restaurante.cnpj = dados['cnpj']
        if 'faturamento' in dados:
            restaurante.faturamento = dados['faturamento']
        if 'aberto' in dados:
            restaurante.aberto = dados['aberto']

        db.session.commit()
        return restaurante.to_dict(), 200
    except RestauranteNaoIdentificado as e:
        return {"erro": str(e)}, 400 

def deleteRestaurante(idRestaurante):
    try:
        restaurante = Restaurante.query.get(idRestaurante)
        if not restaurante:
            raise RestauranteNaoIdentificado("Restaurante não encontrado")

        db.session.delete(restaurante)
        db.session.commit()
        return {"mensagem": "Restaurante deletado com sucesso"}, 200 # Retorno mais claro
    except RestauranteNaoIdentificado as e:
        return {"erro": str(e)}, 400