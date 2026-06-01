from flask import Blueprint, request, jsonify
from .entregadores_model import Entregador
from config import db
from sqlalchemy.exc import IntegrityError
from usuarios.services.email_service import send_email
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import random

def generate_token():
    return str(random.randint(100000, 999999))

entregador_bp = Blueprint('entregador_routes', __name__, url_prefix='/entregadores')

# Cadastra um novo entregador no sistema e envia um código de validação do email
@entregador_bp.route('/', methods=['POST'])
def criar_entregador():
    dados = request.json

    campos_obrigatorios = ["nome", "cpf", "telefone", "email", "veiculo", "cnh", "placa"] 
    for campo in campos_obrigatorios:
        if not dados.get(campo):
            return jsonify({"erro": f"O campo {campo} é obrigatório"}), 400
        
    placa = dados.get('placa', '').upper().replace('-', '').replace(' ', '')
    if not placa or len(placa) != 7:
        return jsonify({"erro": "Placa inválida. Deve conter 7 caracteres."}), 400

    email = dados.get("email") 
    if len(email) > 100 or email.isdigit():
        return jsonify({"erro": "E-mail inválido conforme regras de negócio."}), 400

    novo_entregador = Entregador(
        nome=dados.get('nome'),
        cpf=dados.get('cpf'),
        email=email,
        telefone=dados.get('telefone'),
        veiculo=dados.get('veiculo'),
        cnh=dados.get('cnh'),
        placa=placa,  
        status='Disponível',
        foto=dados.get('foto')
    )

    token = generate_token()
    novo_entregador.email_token = token
    novo_entregador.email_token_expiration = datetime.utcnow() + timedelta(minutes=13)

    try:
        db.session.add(novo_entregador)
        db.session.commit()
    except IntegrityError as e:
        db.session.rollback()
        erro_msg = str(e.orig).lower() if e.orig else ''
        if 'cpf' in erro_msg or 'cpf' in str(e).lower():
            return jsonify({"error": "CPF já cadastrado."}), 400
        elif 'placa' in erro_msg or 'placa' in str(e).lower():
            return jsonify({"error": "Placa já cadastrada. Cada veículo deve ter uma placa única."}), 400
        elif 'email' in erro_msg:
            return jsonify({"error": "Email já cadastrado."}), 400
        else:
            return jsonify({"error": "Dados duplicados. Verifique CPF, email e placa."}), 400

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

# Valida o código enviado por email para concluir o cadastro do entregador
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
    entregador.email_token_expiration = None
    db.session.commit()
    
    return jsonify({"mensagem": "Email validado com sucesso. Cadastro concluído."}), 200

# Solicita login do entregador enviando código de acesso por email
@entregador_bp.route("/login/request", methods=["POST"])
def request_login():
    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"erro": "Email é obrigatório"}), 400

    entregador = Entregador.query.filter_by(email=email).first()

    if not entregador:
        return jsonify({"erro": "Entregador não encontrado"}), 404
    
    if not entregador.email_verified:
        return jsonify({"erro": "Email não verificado. Complete o cadastro primeiro."}), 400

    token = generate_token()
    entregador.login_token = token
    entregador.login_token_expiration = datetime.utcnow() + timedelta(minutes=13)
    db.session.commit()

    send_email(
        to_email=email,
        subject="Seu código de login - PopDoces",
        body=f"""Olá {entregador.nome},

Seu código de login é: {token}

Ele expira em 13 minutos.
Não informe este código a ninguém."""
    )

    return jsonify({
        "mensagem": "Código de login enviado para seu email",
        "expira_em": "13 minutos"
    }), 200

# Verifica o código de login e gera o token JWT de acesso
@entregador_bp.route("/login/verify", methods=["POST"])
def verify_login():
    data = request.get_json()
    email = data.get("email")
    codigo = data.get("codigo")

    if not email or not codigo:
        return jsonify({"erro": "Email e código são obrigatórios"}), 400

    entregador = Entregador.query.filter_by(email=email).first()

    if not entregador:
        return jsonify({"erro": "Entregador não encontrado"}), 404

    if not entregador.login_token:
        return jsonify({"erro": "Nenhum código de login solicitado"}), 400

    if entregador.login_token != codigo:
        return jsonify({"erro": "Código inválido"}), 400

    if datetime.utcnow() > entregador.login_token_expiration:
        return jsonify({"erro": "Código expirado. Solicite um novo."}), 400

    access_token = create_access_token(
        identity=str(entregador.id),
        additional_claims={
            "tipo": "entregador",
            "email": entregador.email,
            "nome": entregador.nome
        }
    )

    entregador.login_token = None
    entregador.login_token_expiration = None
    db.session.commit()

    return jsonify({
        "mensagem": "Login realizado com sucesso!",
        "access_token": access_token,
        "entregador": {
            "id": entregador.id,
            "nome": entregador.nome,
            "email": entregador.email,
            "veiculo": entregador.veiculo,
            "status": entregador.status
        }
    }), 200

# Retorna os dados do entregador autenticado via token JWT
@entregador_bp.route("/me", methods=["GET"])
@jwt_required()
def obter_entregador_logado():
    entregador_id = get_jwt_identity()
    entregador = Entregador.query.get(int(entregador_id))
    
    if not entregador:
        return jsonify({"erro": "Entregador não encontrado"}), 404
    
    return jsonify(entregador.to_dict()), 200

# Realiza o logout do entregador tornando-o indisponível
@entregador_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    entregador_id = get_jwt_identity()
    entregador = Entregador.query.get(int(entregador_id))
    
    if entregador:
        entregador.status = "Indisponível"
        entregador.disponivel = False
        db.session.commit()
    
    return jsonify({"mensagem": "Logout realizado com sucesso"}), 200

# Atualiza os dados de um entregador existente
@entregador_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def atualizar_entregador(id):
    entregador = Entregador.query.get_or_404(id)
    dados = request.json

    entregador_id = int(get_jwt_identity())
    if entregador_id != id:
        return jsonify({"erro": "Não autorizado"}), 403

    if 'cpf' in dados and dados['cpf'] != entregador.cpf:
        return jsonify({"error": "Regra de Negócio: O CPF não pode ser alterado."}), 400
    
    if 'placa' in dados:
        placa = dados['placa'].upper().replace('-', '').replace(' ', '')
        if len(placa) != 7:
            return jsonify({"erro": "Placa inválida. Deve conter 7 caracteres."}), 400
        entregador.placa = placa
        
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
    except IntegrityError as e:
        db.session.rollback()
        erro_msg = str(e.orig).lower() if e.orig else ''
        if 'placa' in erro_msg:
            return jsonify({"error": "Esta placa já está em uso por outro entregador."}), 400
        return jsonify({"error": "Erro de integridade ao atualizar. Verifique os dados."}), 400
        
    return jsonify(entregador.to_dict()), 200

# Retorna a lista de todos os entregadores cadastrados
@entregador_bp.route('/', methods=['GET'])
def listar_entregadores():
    entregadores = Entregador.query.all()
    return jsonify([e.to_dict() for e in entregadores]), 200

# Busca um entregador específico pelo ID
@entregador_bp.route('/<int:id>', methods=['GET'])
def obter_entregador(id):
    entregador = Entregador.query.get_or_404(id)
    return jsonify(entregador.to_dict()), 200

# Inativa um entregador (torna indisponível sem remover do sistema)
@entregador_bp.route('/<int:id>/inativar', methods=['PATCH'])
@jwt_required()
def inativar_entregador(id):
    entregador = Entregador.query.get_or_404(id)
    entregador.disponivel = False
    entregador.status = "Indisponível"
    db.session.commit()
    return jsonify({"mensagem": "Entregador inativado com sucesso."}), 200

# Remove permanentemente um entregador do banco de dados
@entregador_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def deletar_entregador(id):
    entregador = Entregador.query.get_or_404(id)
    db.session.delete(entregador)
    db.session.commit()
    return jsonify({"mensagem": "Entregador removido permanentemente."}), 204