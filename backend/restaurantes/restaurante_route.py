# restaurante_routes.py
from flask import Flask, jsonify, request, Blueprint    
from restaurantes import restaurante_model as model

restaurantes_blueprint = Blueprint('restaurantes', __name__)

@restaurantes_blueprint.route("/restaurantes", methods=["GET"])
def exibir_restaurantes():
    print("LISTA DE TODOS OS RESTAURANTES:")
    # Desempacotando a lista e o status que agora vem da função
    restaurantes, status = model.getRestaurantes() 
    return jsonify(restaurantes), status

@restaurantes_blueprint.route("/restaurantes/<int:id>", methods=["GET"])
def exibir_restaurante_por_id(id):
    restaurante, status = model.obter_restaurante_por_id(id)
    if status != 200:
        return jsonify(restaurante), status # O erro já vem formatado da função
    return jsonify(restaurante), status

@restaurantes_blueprint.route("/restaurantes", methods=["POST"])
def criar_restaurante():
    print("CRIANDO RESTAURANTE!")
    dados = request.json
    # Correção: criarRestaurante com 'R' maiúsculo
    restaurante, status = model.criarRestaurante(dados) 
    return jsonify(restaurante), status

@restaurantes_blueprint.route("/restaurantes/<int:idRestaurante>", methods=["PUT"])
def atualizar_Restaurante(idRestaurante):
    dados = request.get_json()
    restaurante, status = model.updateRestaurante(idRestaurante, dados)
    return jsonify(restaurante), status

@restaurantes_blueprint.route("/restaurantes/<int:idRestaurante>", methods=["DELETE"])
def deletar_restaurante(idRestaurante):
    restaurante, status = model.deleteRestaurante(idRestaurante)
    return jsonify(restaurante), status