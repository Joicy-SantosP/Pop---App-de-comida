from config import db

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(50), nullable=False)
    cpf = db.Column(db.String(14), nullable=False, unique=True)
    email = db.Column(db.String(100), nullable=False, unique=True)
    telefone = db.Column(db.String(15), nullable=False)
    endereco = db.Column(db.String(100), nullable=False)
    data_nascimento = db.Column(db.Date, nullable=False)
    
    login_token = db.Column(db.String(6), nullable=True)
    login_token_expiration = db.Column(db.DateTime, nullable=True)

    
    def __init__(self, nome, cpf,email,telefone,endereco,data_nascimento):
        self.nome = nome
        self.cpf = cpf
        self.email = email
        self.telefone = telefone
        self.endereco = endereco
        self.data_nascimento = data_nascimento
        
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
    