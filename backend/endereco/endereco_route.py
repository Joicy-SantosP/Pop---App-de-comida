from flask import Blueprint, request, jsonify
from .endereco_model import Endereco, db
import requests

endereco_bp = Blueprint('enderecos', __name__)

@endereco_bp.route('/cep/<string:cep_input>', methods=['GET'])
def buscar_cep(cep_input):
    cep_limpo = ''.join(filter(str.isdigit, cep_input))
    if len(cep_limpo) != 8:
        return jsonify({"erro":"CEP não encontrado"}), 404
    
    response = requests.get(f'https://viacep.com.br/ws/{cep_limpo}/json/')
    if response.status_code != 200 or "erro" in response.json():
        return jsonify({"erro": "CEP não encontrado"}), 404
    
    return jsonify(response.json()), 200

@endereco_bp.route('/', methods=['POST'])
def cadastrar_endereco():
    data = request.json
    if data.get('principal'):
        Endereco.query.filter_by(usuario_id=data['usuario_id'], principal=True)\
            .update({"principal": False})
            
    novo_endereco = Endereco(
        usuario_id = data['usuario_id'],
        cep = data['cep'],
        logradouro = data['logradouro'],
        numero = data.get('numero', 'S/N'),
        bairro = data['bairro'],
        cidade = data['cidade'],
        estado = data['estado'],
        complemento = data.get('complemento'),
        ponto_referencial = data.get('ponto_referencial'),
        rotulo = data.get('rotulo'),
        latitude = data['latitude'],
        longitude = data['longitude'],
        principal = data.get('principal', False)
    )
    
    db.session.add(novo_endereco)
    db.session.commit()
    return jsonify({"mensagem": "Endereço cadastrado com sucesso!"}), 201

@endereco_bp.route('/usuario/<int:user_id>', methods=['GET'])
def listar_enderecos(user_id):
    enderecos = Endereco.query.filter_by(usuario_id=user_id, ativo=True).all()
    
    output = []
    for end in enderecos:
        output.append({
            "id": end.id,
            "rotulo": end.rotulo,
            "logradouro": end.logradouro,
            "numero": end.numero,
            "cidade": end.cidade,
            "principal": end.principal
        })
    
    return jsonify(output), 200

@endereco_bp.route('/<int:id>', methods=['GET'])
def buscar_endereco_detalhado(id):
    endereco = Endereco.query.get_or_404(id)
    
    return jsonify({
        "id": endereco.id,
        "cep": endereco.cep,
        "logradouro": endereco.logradouro,
        "numero": endereco.numero,
        "complemento": endereco.complemento,
        "bairro": endereco.bairro,
        "cidade": endereco.cidade,
        "estado": endereco.estado,
        "ponto_referencial": endereco.ponto_referencial,
        "rotulo": endereco.rotulo,
        "latitude": float(endereco.latitude),
        "longitude": float(endereco.longitude),
        "principal": endereco.principal
    }), 200


@endereco_bp.route('/<int:id>', methods=['PUT'])
def editar_endereco(id):
    endereco = Endereco.query.get_or_404(id)
    data = request.json

    if data.get('principal') is True and not endereco.principal:
        Endereco.query.filter_by(usuario_id=endereco.usuario_id, principal=True)\
                   .update({"principal": False})

    endereco.logradouro = data.get('logradouro', endereco.logradouro)
    endereco.numero = data.get('numero', endereco.numero)
    endereco.complemento = data.get('complemento', endereco.complemento)
    endereco.bairro = data.get('bairro', endereco.bairro)
    endereco.ponto_referencial = data.get('ponto_referencial', endereco.ponto_referencial)
    endereco.rotulo = data.get('rotulo', endereco.rotulo)
    endereco.principal = data.get('principal', endereco.principal)
    
    if 'cep' in data:
        endereco.cep = data['cep']
    if 'latitude' in data:
        endereco.latitude = data['latitude']
    if 'longitude' in data:
        endereco.longitude = data['longitude']

    db.session.commit()
    return jsonify({"mensagem": "Endereço atualizado com sucesso!"}), 200

@endereco_bp.route('/<int:id>', methods=['DELETE'])
def excluir_endereco(id):
    endereco = Endereco.query.get_or_404(id)
    endereco.ativo = False 
    db.session.commit()
    return jsonify({"mensagem": "Endereço removido da sua lista."}), 200