from config import db
from werkzeug.security import generate_password_hash, check_password_hash

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(50), nullable=False)
    cpf = db.Column(db.String(14), nullable=False, unique=True)
    email = db.Column(db.String(100), nullable=False, unique=True)
    telefone = db.Column(db.String(15), nullable=False)
    endereco = db.Column(db.String(100), nullable=False)
    data_nascimento = db.Column(db.Date, nullable=False)
    senha = db.Column(db.String(255), nullable=False)
    
    def set_password(self, senha):
        self.senha = generate_password_hash(senha)
        
    def check_password(self, senha):
        return check_password_hash(self.senha, senha)
    
    def __init__(self, nome, cpf,email,telefone,endereco,data_nascimento,senha):
        self.nome = nome
        self.cpf = cpf
        self.email = email
        self.telefone = telefone
        self.endereco = endereco
        self.data_nascimento = data_nascimento
        self.set_password(senha)
        
    def to_dict(self):
        return{
            'id' : self.id,
            'nome' : self.nome,
            'cpf' : self.cpf,
            'email' : self.email,
            'telefone' : self.telefone,
            'endereco' : self.endereco,
            'data_nascimento' : self.data_nascimento.isoformat(),
        }
    