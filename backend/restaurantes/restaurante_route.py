# restaurante_routes.py
from flask import  Blueprint, request, jsonify
from config import db  
import random  
from .restaurante_model import Restaurantes
from datetime import datetime,timedelta
from .services.emailRestaurante_service import send_email


restaurantes_blueprint = Blueprint('restaurantes', __name__)

class RestauranteNaoIdentificado(Exception):
    pass

def generate_token():
    return str(random.randint(100000, 999999))

@restaurantes_blueprint.route("/restaurantes", methods=["POST"])
def criar_restaurante():
    dados = request.get_json()

    email = dados.get("email")

    if not email:
        return jsonify({"erro": "Email é obrigatório"}), 400

    restaurante = Restaurantes(
        email=email,
        nome=dados.get("nome"),
        celular=dados.get("celular"),
        cep=dados.get("cep"),
        cnpj=dados.get("cnpj"),
        especialidade=dados.get("especialidade"),
        cpf=dados.get("cpf"),
        numero=dados.get("numero"),
        bairro=dados.get("bairro"),
        endereco=dados.get("endereco"),
        complemento=dados.get("complemento"),
        imagem=dados.get("imagem")
    )

    # gera token
    token = generate_token()

    restaurante.email_token = token
    restaurante.email_token_expiration = datetime.utcnow() + timedelta(minutes=13)

    db.session.add(restaurante)
    db.session.commit()

    send_email(
        to_email=email,
        subject="Seu código de verificação",
        body=f"Seu código é: {token}"
    )

    return jsonify({"mensagem": "Código enviado para o email"}), 200

@restaurantes_blueprint.route("/restaurantes/validar", methods=["POST"])
def validar_codigo_restaurante():
    data = request.get_json()

    email = data.get("email")
    codigo = data.get("codigo")

    restaurante = Restaurantes.query.filter_by(email=email).first()

    if not restaurante:
        return jsonify({"erro": "Restaurante não encontrado"}), 404

    if restaurante.email_token != codigo:
        return jsonify({"erro": "Código inválido"}), 400

    if datetime.utcnow() > restaurante.email_token_expiration:
        return jsonify({"erro": "Código expirado"}), 400

    restaurante.email_verified = True
    restaurante.email_token = None
    restaurante.email_token_expiration = None

    db.session.commit()

    return jsonify({"mensagem": "Email verificado com sucesso"}), 200

@restaurantes_blueprint.route("/restaurantes", methods=["GET"])
def getRestaurantes():
    restaurantes = Restaurantes.query.all()
    return jsonify([restaurante.to_dict() for restaurante in restaurantes]), 200

@restaurantes_blueprint.route("/restaurantes/<int:id>", methods=["GET"])
def obter_restaurante_por_id(id):
    restaurante = db.session.get(Restaurantes, id)

    if not restaurante:
        return {"erro": "Restaurante não encontrado"}, 404

    return jsonify(restaurante.to_dict()), 200



@restaurantes_blueprint.route("/restaurantes/<int:id>", methods=["PUT"])
def atualizar_restaurante(id):
    restaurante = db.session.get(Restaurantes, id)

    if not restaurante:
        return {"erro": "Restaurante não encontrado"}, 404

    dados = request.get_json()

    for campo in dados:
        setattr(restaurante, campo, dados[campo])

    db.session.commit()

    return jsonify(restaurante.to_dict()), 200

@restaurantes_blueprint.route("/restaurantes/<int:id>", methods=["DELETE"])
def deletar_restaurante(id):
    restaurante = db.session.get(Restaurantes, id)

    if not restaurante:
        return {"erro": "Restaurante não encontrado"}, 404

    db.session.delete(restaurante)
    db.session.commit()

    return {"mensagem": "Restaurante deletado com sucesso"}, 200

