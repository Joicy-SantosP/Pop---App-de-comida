from flask import Blueprint, request, jsonify
from .entregadores_model import Entregador
from config import db
from sqlalchemy.exc import IntegrityError
from usuarios.services.email_service import send_email
from flask_jwt_extended import create_access_token
from datetime import datetime,timedelta
import random

def generate_token():
    return str(random.randint(100000, 999999))

entregador_bp = Blueprint('entregador_routes', __name__, url_prefix='/entregadores')

@entregador_bp.route('/', methods=['POST'])
def criar_entregador():
    dados = request.json

    campos_obrigatorios = ["nome", "cpf", "telefone", "email", "veiculo"]
    for campo in campos_obrigatorios:
        if not dados.get(campo):
            return jsonify({"erro": f"O campo {campo} é obrigatório"}), 400

    email = dados.get("email") 
    if len(email) > 100 or email.isdigit():
        return jsonify({"erro": "E-mail inválido conforme regras de negócio."}), 400

    novo_entregador = Entregador(
        nome=dados.get('nome'),
        cpf=dados.get('cpf'),
        email=email,
        telefone=dados.get('telefone'),
        veiculo=dados.get('veiculo'),
        status='Disponível',
        foto=dados.get('foto')
    )


    token = generate_token()
    novo_entregador.email_token = token
    novo_entregador.email_token_expiration = datetime.utcnow() + timedelta(minutes=13)

    try:
        db.session.add(novo_entregador)
        db.session.commit() # RN01: Valida unicidade do CPF no banco
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "CPF ou Email já cadastrados."}), 400

    # Envio do e-mail (fora do except e com a variável correta)
    send_email(
        to_email=email,
        subject="Seu código de verificação de cadastro PopDoces",
        body=f"""Olá,
Aqui está seu código de verificação:

{token}

Ele expira em 13 minutos.
Não informe esse código a ninguém."""
    )
    
    return jsonify({
        "mensagem": "Cadastro iniciado. Verifique seu código de confirmação.",
        "id": novo_entregador.id
    }), 201

@entregador_bp.route('/validar-acesso', methods=["POST"])
def validar_codigo():
    data = request.get_json()
    email = data.get("email")
    codigo = data.get("codigo")
    
    entregador = Entregador.query.filter_by(email=email).first()
    
    if not entregador:
        return jsonify({"erro": "Entregador não encontrado"}), 404
    
    if entregador.email_token != codigo:
        return jsonify({"erro": "Código inválido"}), 400
    
    if datetime.utcnow() > entregador.email_token_expiration:
        return jsonify({"erro": "Código expirado"}), 400
    
    entregador.email_verified = True
    entregador.email_token = None
    db.session.commit()
    
    return jsonify({"mensagem": "Telefone/Email validado com sucesso. Cadastro concluído."}), 200

@entregador_bp.route('/<int:id>', methods=['PUT'])
def atualizar_entregador(id):
    entregador = Entregador.query.get_or_404(id)
    dados = request.json

    if 'cpf' in dados and dados['cpf'] != entregador.cpf:
        return jsonify({"error": "Regra de Negócio: O CPF não pode ser alterado."}), 400
        
    if 'telefone' in dados:
        entregador.telefone = dados['telefone']
    if 'veiculo' in dados:
        entregador.veiculo = dados['veiculo']
    if 'foto' in dados:
        entregador.foto = dados['foto']
    if 'nome' in dados:
        entregador.nome = dados['nome']
    if 'status' in dados:
        entregador.status = dados['status']
        
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Erro de integridade ao atualizar."}), 400
        
    return jsonify(entregador.to_dict()), 200

@entregador_bp.route('/', methods=['GET'])
def listar_entregadores():
    entregadores = Entregador.query.all()
    return jsonify([e.to_dict() for e in entregadores]), 200

@entregador_bp.route('/<int:id>/inativar', methods=['PATCH'])
def inativar_entregador(id):
    entregador = Entregador.query.get_or_404(id)
    entregador.ativo = False
    entregador.status = "Indisponível"
    db.session.commit()
    return jsonify({"mensagem": "Entregador inativado com sucesso."})

@entregador_bp.route('/<int:id>', methods=['DELETE'])
def deletar_entregador(id):
    entregador = Entregador.query.get_or_404(id)
    
    db.session.delete(entregador)
    db.session.commit()
    return jsonify({"mensagem": "Entregador removido permanentemente."}), 204


