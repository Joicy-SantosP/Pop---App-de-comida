from config import db

class Entregador(db.Model):
    __tablename__ = 'entregadores'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    cpf = db.Column(db.String(11), unique=True, nullable=False)
    email = db.Column(db.String(100), nullable=False)
    telefone = db.Column(db.String(11), nullable=False) 
    veiculo = db.Column(db.String(900), nullable=False)
    foto = db.Column(db.String(500), nullable=True)
    status = db.Column(db.String(100), default='Indisponível')
    
    email_token = db.Column(db.String(6), nullable=True)
    email_token_expiration = db.Column(db.DateTime, nullable=True)
    email_verified = db.Column(db.Boolean, default=False)
    
    email_verified = db.Column(db.Boolean, default=True)
    
    def __init__(self,nome, cpf, email, telefone, veiculo, status, foto=None):
        self.nome = nome
        self.cpf = cpf
        self.email = email
        self.telefone = telefone
        self.veiculo = veiculo
        self.status = status
        self.foto = foto
    
    def to_dict(self):
        return{
            'id' : self.id,
            'nome' : self.nome,
            'cpf' : self.cpf,
            'email' : self.email,
            'telefone' : self.telefone,
            'veiculo' : self.veiculo,
            'status' : self.status,
            'foto' : self.foto
        }