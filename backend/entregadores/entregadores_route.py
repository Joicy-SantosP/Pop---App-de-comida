from flask import Blueprint, request, jsonify
from .entregadores_model import Entregador
from config import db
from sqlalchemy.exc import IntegrityError
from usuarios.services.email_service import send_email
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import random

# Gera um código de 6 dígitos para validação por email
def generate_token():
    return str(random.randint(100000, 999999))

entregador_bp = Blueprint('entregador_routes', __name__, url_prefix='/entregadores')

# =============================================
# ROTAS DE CADASTRO E VERIFICAÇÃO
# =============================================

# Cadastra um novo entregador no sistema e envia um código de validação do email
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
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "CPF ou Email já cadastrados."}), 400

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


# =============================================
# ROTAS DE LOGIN (PASSWORDLESS)
# =============================================

# Solicita login: envia código de 6 dígitos por email
@entregador_bp.route("/login/request", methods=["POST"])
def request_login():
    """Solicita código de acesso para login do entregador"""
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
    """Verifica código e retorna token JWT para o entregador"""
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

    # Gera token JWT com identidade do entregador
    access_token = create_access_token(
        identity=str(entregador.id),
        additional_claims={
            "tipo": "entregador",
            "email": entregador.email,
            "nome": entregador.nome
        }
    )

    # Limpa o token de login
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

# Verifica se o token JWT é válido e retorna dados do entregador
@entregador_bp.route("/me", methods=["GET"])
@jwt_required()
def obter_entregador_logado():
    """Retorna dados do entregador autenticado"""
    entregador_id = get_jwt_identity()
    entregador = Entregador.query.get(int(entregador_id))
    
    if not entregador:
        return jsonify({"erro": "Entregador não encontrado"}), 404
    
    return jsonify(entregador.to_dict()), 200

# Logout - invalida o token (opcional, depende da estratégia)
@entregador_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    """Registra logout do entregador"""
    entregador_id = get_jwt_identity()
    entregador = Entregador.query.get(int(entregador_id))
    
    if entregador:
        entregador.status = "Indisponível"
        entregador.disponivel = False
        db.session.commit()
    
    return jsonify({"mensagem": "Logout realizado com sucesso"}), 200


# =============================================
# ROTAS CRUD E GERENCIAMENTO
# =============================================

# Atualiza os dados de um entregador existente
@entregador_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()  # Protegido com JWT
def atualizar_entregador(id):
    entregador = Entregador.query.get_or_404(id)
    dados = request.json

    # Verifica se o token pertence a este entregador
    entregador_id = int(get_jwt_identity())
    if entregador_id != id:
        return jsonify({"erro": "Não autorizado"}), 403

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

# Inativa um entregador
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