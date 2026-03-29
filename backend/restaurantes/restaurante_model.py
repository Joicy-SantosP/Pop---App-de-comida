from config import db

class Restaurantes(db.Model):
    __tablename__ = 'restaurantes'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(50), nullable=False)
    cnpj = db.Column(db.String(14), nullable=False, unique=True)
    faturamento = db.Column(db.Float, default=0.0, nullable=False)
    aberto = db.Column(db.Boolean, default=False, nullable=False)
    
    # chave estrangeira
    pedidos = db.relationship('Pedidos', back_populates='restaurante')
    
    def __init__(self, nome, cnpj, faturamento=0.0, aberto=False):
        self.nome = nome
        self.cnpj = cnpj
        self.faturamento = faturamento
        self.aberto = aberto
        
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'cnpj': self.cnpj,
            'faturamento': self.faturamento,
            'aberto': self.aberto
        }

# ---  REGRA DE NEGÓCIO ---

class RestauranteNaoIdentificado(Exception):
    pass

def getRestaurantes():
    restaurantes = Restaurantes.query.all()
    return [restaurante.to_dict() for restaurante in restaurantes], 200
    
def obter_restaurante_por_id(id):
    try:
        restaurante = db.session.get(Restaurantes, id)
        if not restaurante:
            raise RestauranteNaoIdentificado('Restaurante não encontrado')
        return restaurante.to_dict(), 200
    except RestauranteNaoIdentificado as e:
        return {"error": str(e)}, 404

def criarRestaurante(dados):
    try:
        nome = dados['nome']
        cnpj = dados['cnpj']
        faturamento = dados.get('faturamento', 0.0)

        restaurante = Restaurantes(nome=nome, cnpj=cnpj, faturamento=faturamento)

        db.session.add(restaurante)
        db.session.commit()

        return restaurante.to_dict(), 201
    except KeyError as e:
        return {"erro": f"Campo obrigatório faltando: {str(e)}"}, 400

def updateRestaurante(idRestaurante, dados):
    try:
        restaurante = db.session.get(Restaurantes, idRestaurante)
        if not restaurante:
            raise RestauranteNaoIdentificado("Restaurante não encontrado")

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
        return {"erro": str(e)}, 404

def deleteRestaurante(idRestaurante):
    try:
        restaurante = db.session.get(Restaurantes, idRestaurante)
        if not restaurante:
            raise RestauranteNaoIdentificado("Restaurante não encontrado")

        db.session.delete(restaurante)
        db.session.commit()
        return {"mensagem": "Restaurante deletado com sucesso"}, 200
    except RestauranteNaoIdentificado as e:
        return {"erro": str(e)}, 404
