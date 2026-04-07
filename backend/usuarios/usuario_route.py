from flask import Blueprint, request, jsonify
from .usuario_model import Usuario
from config import db
from sqlalchemy.exc import IntegrityError
from .services.email_service import send_email
from flask_jwt_extended import create_access_token
from datetime import datetime,timedelta
import random

def generate_token():
    return str(random.randint(100000, 999999))

usuario_bp = Blueprint('usuario_routes', __name__, url_prefix='/usuarios')

@usuario_bp.route('/', methods=['POST'])
def criar_usuario():
    dados = request.json
    
    email = dados.get("email")
    
    if not email:
        return jsonify({"erro": "Email é obrigatório"}), 400
    
    
    try:
        data_nascimento = datetime.strptime(
            dados.get('data_nascimento'), "%Y-%m-%d"
        ).date()
    except:
        return {"error": "Data inválida. Use o formato AAAA-MM-DD."}, 400
    
    novo_usuario = Usuario(
        nome=dados.get('nome'),
        cpf=dados.get('cpf'),
        email=email,
        telefone=dados.get('telefone'),
        data_nascimento=data_nascimento,
    )
    
    token_email = generate_token()
    token_telefone = generate_token()
    
    novo_usuario.email_token = token_email
    novo_usuario.email_token_expiration = datetime.utcnow() + timedelta(minutes=13)
    
    novo_usuario.telefone_token = token_telefone
    novo_usuario.telefone_token_expiration = datetime.utcnow() + timedelta(minutes=18)
    
    db.session.add(novo_usuario)
    
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return {"error": "CPF ou Email já cadastrados."}, 400
    
    send_email(
        to_email=email,
        subject="Seu código de verificação de cadastro de email",
        body=f"""Olá,
            Aqui está seu código de verificação:
             
            {token_email}
            
            Ele expira em 13 minutos.
            Não informe esse código à ninguém."""
    )
    
    print(f"O código de veriifcação do seu número de telefone é: {token_telefone}")
    
    return jsonify({"mensagem": "Código de validação de email enviado para seu email e telefone"}), 200

@usuario_bp.route('/validar', methods=["POST"])
def validar_codigo_usuario():
    data = request.get_json()
    
    email = data.get("email")
    codigo = data.get("codigo")
    
    usuario = Usuario.query.filter_by(email=email).first()
    
    if not usuario:
        return jsonify({"erro": "Usuário não encontrado"}), 404
    
    if usuario.email_token != codigo:
        return jsonify({"erro": "Código de verificaçaõ inválido"}), 400
    
    if datetime.utcnow() > usuario.email_token_expiration:
        return jsonify({"erro": "Código de verificação expirado"}), 400
    
    usuario.email_verified = True
    usuario.email_token = None
    usuario.email_token_expiration = None
    
    db.session.commit()
    
    return jsonify({"mensagem": "Email verificado com sucesso"}), 200

@usuario_bp.route('/validar-telefone', methods=['POST'])
def validar_telefone():
    data = request.get_json()
    
    usuario = Usuario.query.filter_by(telefone=data.get("telefone")).first()
    
    if not usuario or usuario.telefone_token != data.get("codigo"):
        return {"erro": "Código de validação inválido"}, 400
    
    if not usuario.telefone_token_expiration or datetime.utcnow() > usuario.telefone_token_expiration:
        return {"erro": "Código de validação expirado"}, 400
    
    usuario.token_verified = True
    usuario.telefone_token = None
    usuario.telefone_token_expiration = None
    
    db.session.commit()
    
    return {"mensagem": "Número de telefone verificado"}, 200

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

@usuario_bp.route("/login/request", methods=["POST"])
def request_login():
    data = request.get_json()
    email = data.get("email")

    usuario = Usuario.query.filter_by(email=email).first()

    if not usuario:
        return jsonify({"message": "Usuário não encontrado"}), 404

    token = generate_token()

    usuario.login_token = token
    usuario.login_token_expiration = datetime.utcnow() + timedelta(minutes=13)
    db.session.commit()

    send_email(
        to_email=email,
        subject="Seu código de login",
        body=f"Seu código de login é: {token}. Ele expira em 13 minutos."
    )

    return jsonify({"message": "Token enviado para o email"}), 200

@usuario_bp.route("/login/verify", methods=["POST"])
def verify_login():
    data = request.get_json()
    email = data.get("email")
    token = data.get("token")

    usuario = Usuario.query.filter_by(email=email).first()

    if not usuario:
        return jsonify({"message": "Usuário não encontrado"}), 404

    if usuario.login_token != token:
        return jsonify({"message": "Token inválido"}), 400

    if datetime.utcnow() > usuario.login_token_expiration:
        return jsonify({"message": "Token expirado"}), 400

    access_token = create_access_token(identity=usuario.id)

    usuario.login_token = None
    usuario.login_token_expiration = None
    db.session.commit()

    return jsonify({"access_token": access_token}), 200