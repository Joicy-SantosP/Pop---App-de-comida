from flask import Blueprint, request, jsonify
from config import db
from datetime import datetime
from pedidos.pedido_model import Pedido
from entrega.entrega_model import Entrega
from endereco.endereco_model import Endereco
from entregadores.entregadores_model import Entregador

entrega_bp = Blueprint('entrega', __name__)

# Despacha um pedido para entrega (inicia o processo de entrega)
@entrega_bp.route('/pedido/<int:pedido_id>/despachar', methods=['POST'])
def despachar_pedido(pedido_id):
    data = request.json
    pedido = db.session.get(Pedido, pedido_id)
    
    if not pedido:
        return jsonify({"erro": "Pedido não encontrado"}), 404
    
    endereco_ref = db.session.get(Endereco, data.get('endereco_id'))
    if not endereco_ref:
        return jsonify({"erro": "Endereço de entrega obrigatório e não encontrado"}), 400
    
    if pedido.status not in ["Pronto", "Em Preparação"]:
        return jsonify({"erro": "Pedido não está pronto para despacho"}), 400

    entregador = None
    entregador_id = data.get('entregador_id')
    
    if entregador_id:
        entregador = db.session.get(Entregador, entregador_id)
        if not entregador:
            return jsonify({"erro": "Entregador não encontrado"}), 404
        if not entregador.disponivel:
            return jsonify({"erro": "Entregador não está disponível"}), 400
    else:
        entregador = Entregador.query.filter_by(disponivel=True, status='Disponível').first()
        if not entregador:
            return jsonify({"erro": "Nenhum entregador disponível no momento"}), 400

    try:
        endereco_completo = f"{endereco_ref.logradouro}, {endereco_ref.numero} - {endereco_ref.bairro}, {endereco_ref.cidade}/{endereco_ref.estado}"
        if endereco_ref.complemento:
            endereco_completo += f" ({endereco_ref.complemento})"

        nova_entrega = Entrega(
            pedido_id=pedido.id,
            entregador_id=entregador.id,
            endereco_snapshot=endereco_completo,
            latitude_entrega=endereco_ref.latitude,
            longitude_entrega=endereco_ref.longitude,
            taxa_entrega=data.get('taxa', 0.0)
        )
        
        pedido.status = "Em Trânsito"
        entregador.status = "Em entrega"
        
        db.session.add(nova_entrega)
        db.session.commit()
        
        return jsonify({
            "mensagem": "Entrega iniciada!",
            "destino": endereco_completo,
            "entregador": {
                "id": entregador.id,
                "nome": entregador.nome,
                "veiculo": entregador.veiculo
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": str(e)}), 500


# Confirma a entrega do pedido
@entrega_bp.route('/pedido/<int:pedido_id>/confirmar-entrega', methods=['PATCH'])
def confirmar_entrega(pedido_id):
    data = request.json
    codigo_informado = data.get('codigo_verificacao')
    
    pedido = db.session.get(Pedido, pedido_id)

    if not pedido:
        return jsonify({"erro": "Pedido não encontrado"}), 404
    
    status_permitidos = ["Em Trânsito", "Próximo", "Em Preparação", "Pronto"]
    
    if pedido.status not in status_permitidos:
        return jsonify({"erro": f"O pedido não está em rota de entrega. Status atual: {pedido.status}"}), 400

    if not pedido.codigo_confirmacao:
        pedido.gerar_codigo_entrega()
        db.session.commit()
        return jsonify({
            "erro": "Nenhum código gerado. Use o novo código.",
            "codigo_gerado": pedido.codigo_confirmacao
        }), 400

    if codigo_informado != pedido.codigo_confirmacao:
        return jsonify({"erro": "Código de entrega incorreto!"}), 403

    try:
        pedido.status = "Entregue"
        if pedido.detalhes_entrega:
            pedido.detalhes_entrega.data_conclusao = datetime.utcnow()
            
            if pedido.detalhes_entrega.entregador:
                pedido.detalhes_entrega.entregador.status = "Disponível"
            
        db.session.commit()
        return jsonify({"mensagem": "Código verificado! Entrega confirmada."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": str(e)}), 500


# Listar entregas de um entregador específico (para o app mobile)
@entrega_bp.route('/entregador/<int:entregador_id>/entregas', methods=['GET'])
def listar_entregas_entregador(entregador_id):
    entregador = db.session.get(Entregador, entregador_id)
    if not entregador:
        return jsonify({"erro": "Entregador não encontrado"}), 404
    
    entregas_ativas = Entrega.query.filter_by(
        entregador_id=entregador_id
    ).filter(Entrega.data_conclusao == None).order_by(Entrega.data_saida.desc()).all()
    
    entregas_concluidas = Entrega.query.filter_by(
        entregador_id=entregador_id
    ).filter(Entrega.data_conclusao != None).order_by(Entrega.data_conclusao.desc()).limit(10).all()
    
    return jsonify({
        "entregador": entregador.to_dict(),
        "entregas_ativas": [e.to_dict() for e in entregas_ativas],
        "entregas_concluidas": [e.to_dict() for e in entregas_concluidas],
        "total_ativas": len(entregas_ativas),
        "total_concluidas": len(entregas_concluidas)
    }), 200


# Atualizar localização do entregador (para rastreamento)
@entrega_bp.route('/entregador/<int:entregador_id>/localizacao', methods=['PUT'])
def atualizar_localizacao(entregador_id):
    data = request.json
    entregador = db.session.get(Entregador, entregador_id)
    
    if not entregador:
        return jsonify({"erro": "Entregador não encontrado"}), 404
    
    return jsonify({
        "mensagem": "Localização atualizada",
        "latitude": data.get('latitude'),
        "longitude": data.get('longitude')
    }), 200


# Simula o avanço da entrega
@entrega_bp.route('/pedido/<int:pedido_id>/simular-entrega', methods=['POST'])
def simular_entrega(pedido_id):
    pedido = db.session.get(Pedido, pedido_id)
    
    if not pedido:
        return jsonify({"erro": "Pedido não encontrado"}), 404
    

    if pedido.tipo_retirada == "retirada":
        sequencia = ["Em Preparação", "Pronto", "Entregue"]
        mensagens = {
            "Em Preparação": "Seu pedido está sendo preparado com carinho!",
            "Pronto": "Seu pedido está pronto para retirada! Venha buscar!",
            "Entregue": "Retirada confirmada! Bom apetite!"
        }
    else:
        sequencia = ["Em Preparação", "Pronto", "Em Trânsito", "Próximo", "Entregue"]
        mensagens = {
            "Em Preparação": "Seu pedido está sendo preparado com carinho!",
            "Pronto": "Seu pedido está pronto! Aguardando entregador...",
            "Em Trânsito": "Entregador saiu para entrega!",
            "Próximo": "Entregador está chegando! Fique atento!",
            "Entregue": "Pedido entregue! Bom apetite!"
        }
    
    if pedido.status not in sequencia:
        pedido.status = sequencia[0]
        db.session.commit()
        return jsonify({
            "status": pedido.status,
            "indice": 0,
            "total": len(sequencia),
            "mensagem": mensagens.get(pedido.status, "")
        })
    
    indice_atual = sequencia.index(pedido.status)
    
    if indice_atual >= len(sequencia) - 1:
        return jsonify({
            "status": pedido.status,
            "indice": indice_atual,
            "total": len(sequencia),
            "mensagem": mensagens.get(pedido.status, "")
        })
    
    novo_indice = indice_atual + 1
    pedido.status = sequencia[novo_indice]
    
    if pedido.status == "Em Trânsito" and pedido.tipo_retirada == "entrega" and not pedido.detalhes_entrega:
        endereco = Endereco.query.filter_by(usuario_id=pedido.usuario_id).first()
        if endereco:
            entregador = Entregador.query.filter_by(disponivel=True, status='Disponível').first()
            
            endereco_completo = f"{endereco.logradouro}, {endereco.numero} - {endereco.bairro}"
            nova_entrega = Entrega(
                pedido_id=pedido.id,
                entregador_id=entregador.id if entregador else None,
                endereco_snapshot=endereco_completo,
                latitude_entrega=endereco.latitude,
                longitude_entrega=endereco.longitude,
                taxa_entrega=0.0
            )
            db.session.add(nova_entrega)
            
            if entregador:
                entregador.status = "Em entrega"
    
    if pedido.status == "Entregue":
        if pedido.tipo_retirada == "entrega" and pedido.detalhes_entrega:
            pedido.detalhes_entrega.data_conclusao = datetime.utcnow()
            if pedido.detalhes_entrega.entregador:
                pedido.detalhes_entrega.entregador.status = "Disponível"
    
    db.session.commit()
    
    return jsonify({
        "status": pedido.status,
        "indice": novo_indice,
        "total": len(sequencia),
        "mensagem": mensagens.get(pedido.status, "")
    }), 200