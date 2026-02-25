from flask import Blueprint, request, jsonify
from .usuario_model import Usuario
from config import db
from sqlalchemy.exc import IntegrityError
from datetime import datetime

usuario_bp = Blueprint('usuario_routes', __name__, url_prefix='/usuarios')

@usuario_bp.route('/', methods=['POST'])
def criar_usuario():
    dados = request.json
    
    try:
        data_nascimento = datetime.strptime(
            dados.get('data_nascimento'), "%Y-%m-%d"
        ).date()
    except:
        return {"error": "Data inválida. Use o formato AAAA-MM-DD."}, 400
    
    novo_usuario = Usuario(
        nome=dados.get('nome'),
        cpf=dados.get('cpf'),
        email=dados.get('email'),
        telefone=dados.get('telefone'),
        endereco=dados.get('endereco'),
        data_nascimento=data_nascimento,
        senha=dados.get('senha')
    )
    
    db.session.add(novo_usuario)
    
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return {"error": "CPF ou Email já cadastrados."}, 400
    
    return novo_usuario.to_dict(), 201

@usuario_bp.route('/', methods=['GET'])
def listar_usuarios():
    usuarios = Usuario.query.all()
    return[usuario.to_dict() for usuario in usuarios], 200

@usuario_bp.route('/<int:id>', methods=['GET'])
def obter_usuario(id):
    usuario = Usuario.query.get_or_404(id)
    return usuario.to_dict(), 200

@usuario_bp.route('/<int:id>', methods=['PUT'])
def atualizar_usuario(id):
    usuario = Usuario.query.get_or_404(id)
    dados = request.json
    
    if 'nome' in dados:
        usuario.nome = dados['nome']
    if 'cpf' in dados:
        usuario.cpf = dados['cpf']
    if 'email' in dados:
        usuario.email = dados['email']
    if 'telefone' in dados:
        usuario.telefone = dados['telefone']
    if 'endereco' in dados:
        usuario.endereco = dados['endereco']
    if 'data_nascimento' in dados:
        usuario.data_nascimento = datetime.strptime(
            dados['data_nascimento'], "%Y-%m-%d"
        ).date()
        
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return {"error":"Erro ao atualizar usuário."}, 400
    return usuario.to_dict(), 200
    

@usuario_bp.route('/<int:id>', methods=['DELETE'])
def deletar_usuario(id):
    usuario = Usuario.query.get_or_404(id)
    db.session.delete(usuario)
    db.session.commit()
    return "", 204