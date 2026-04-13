from config import db

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(50), nullable=True)
    cpf = db.Column(db.String(14), nullable=True, unique=True)
    email = db.Column(db.String(100), nullable=False, unique=True)
    telefone = db.Column(db.String(15), nullable=True)
    data_nascimento = db.Column(db.Date, nullable=True)
    
    email_token = db.Column(db.String(6), nullable=True)
    email_token_expiration = db.Column(db.DateTime, nullable=True)
    email_verified = db.Column(db.Boolean, default=False)
    
    telefone_token = db.Column(db.String(10), nullable=True)
    telefone_token_expiration = db.Column(db.DateTime, nullable=True)
    email_verified = db.Column(db.Boolean, default=True)
    
    login_token = db.Column(db.String(6), nullable=True)
    login_token_expiration = db.Column(db.DateTime, nullable=True)
    
    provider = db.Column(db.String(50), nullable=True)
    provider_user_id = db.Column(db.String(255), nullable=True)
    
    def __init__(self, email, nome=None, cpf=None,telefone=None,data_nascimento=None):
        self.nome = nome
        self.cpf = cpf
        self.email = email
        self.telefone = telefone
        self.data_nascimento = data_nascimento
        
    def to_dict(self):
        return{
            'id' : self.id,
            'nome' : self.nome,
            'cpf' : self.cpf,
            'email' : self.email,
            'telefone' : self.telefone,
            'data_nascimento' : self.data_nascimento.isoformat(),
        }
    