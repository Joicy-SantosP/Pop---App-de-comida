from flask import Blueprint, request, jsonify
from .endereco_model import Endereco, db
from geopy.geocoders import Nominatim # biblioteca gratuita de geolocalização 
import requests #biblioteca para fazer chamadas em APIs externas

endereco_bp = Blueprint('enderecos', __name__)
geolocator = Nominatim(user_agent="pop_doces_endereco") # Instância do geolocator Nominatim (converte endereços em coordenadas e converte endereços em coordenadas) com user personalizado para nossa api

# Busca informações de um CEP na API ViaCEP
@endereco_bp.route('/cep/<string:cep_input>', methods=['GET'])
def buscar_cep(cep_input):
    cep_limpo = ''.join(filter(str.isdigit, cep_input))
    if len(cep_limpo) != 8:
        return jsonify({"erro":"CEP não encontrado"}), 404
    
    response = requests.get(f'https://viacep.com.br/ws/{cep_limpo}/json/')
    if response.status_code != 200 or "erro" in response.json():
        return jsonify({"erro": "CEP não encontrado"}), 404
    
    return jsonify(response.json()), 200

# Cadastra um novo endereço para um usuário
@endereco_bp.route('/', methods=['POST'])
def cadastrar_endereco():
    data = request.json
    
    latitude_final = data.get('latitude')
    longitude_final = data.get('longitude')

    if not latitude_final or not longitude_final:
        endereco_completo = f"{data['logradouro']}, {data.get('numero','')}, {data['bairro']}, {data['cidade']}, {data['estado']}, Brasil"
        try: 
            location = geolocator.geocode(endereco_completo)
            if location:
                latitude_final = location.latitude
                longitude_final = location.longitude
            else:
                return jsonify({"erro": "Não foi possivel encontrar as coordenadas para esse endereço"}), 400
        except Exception as e:
            return jsonify({"erro": f"Erro no serviço de geolocalização: {str(e)}"}), 500
        
    
    if data.get('principal'):
        Endereco.query.filter_by(usuario_id=data['usuario_id'], principal=True).update({"principal": False})
            
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
        latitude = latitude_final,
        longitude = longitude_final,
        principal = data.get('principal', False)
    )
    
    db.session.add(novo_endereco)
    db.session.commit()
    return jsonify({
        "id": novo_endereco.id,
        "logradouro": novo_endereco.logradouro,
        "numero": novo_endereco.numero,
        "cidade": novo_endereco.cidade,
        "estado": novo_endereco.estado,
        "lat": novo_endereco.latitude,
        "lon": novo_endereco.longitude
    }), 201

# Lista todos os endereços ativos de um usuário específico
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

# Busca todos os detalhes de um endereço específico pelo ID
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

@endereco_bp.route('/buscar-sugestoes', methods=['GET'])
def buscar_sugestoes():
    query = request.args.get('q') # O texto que o usuário digita
    if not query:
        return jsonify([]), 200
    
    locations = geolocator.geocode(query, exactly_one=False, limit=5, country_codes='br', timeout=10)
    
    if not locations:
        return jsonify([]), 200
    
    results = []
    for loc in locations:
        results.append({
            "display_name": loc.address,
            "lat": loc.latitude,
            "lon": loc.longitude,
        })
    
    return jsonify(results), 200

@endereco_bp.route('/reversa', methods=['GET'])
def geocode_reversa():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    
    location = geolocator.reverse(f"{lat}, {lon}")
    return jsonify(location.raw['address']), 200

@endereco_bp.route('/<int:id>', methods=['DELETE'])
def excluir_endereco(id):
    endereco = Endereco.query.get_or_404(id)
    endereco.ativo = False 
    db.session.commit()
    return jsonify({"mensagem": "Endereço removido da sua lista."}), 200