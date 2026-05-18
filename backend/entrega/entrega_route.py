from flask import Blueprint, request, jsonify
from config import db
from datetime import datetime
from pedidos.pedido_model import Pedido
from entrega.entrega_model import Entrega
from endereco.endereco_model import Endereco

entrega_bp = Blueprint('entrega', __name__)

# Despacha um pedido para entrega (inicia o processo de entrega)
@entrega_bp.route('/pedido/<int:pedido_id>/despachar', methods=['POST'])
def despachar_pedido(pedido_id):
    data = request.json
    pedido = db.session.get(Pedido, pedido_id)
    
    endereco_ref = db.session.get(Endereco, data.get('endereco_id'))

    if not endereco_ref:
        return jsonify({"erro": "Endereço de entrega obrigatório e não encontrado"}), 400
    
    if pedido.status not in ["Pronto", "Em Preparação"]:
        return jsonify({"erro": "Pedido não está pronto para despacho"}), 400

    try:
        endereco_completo = f"{endereco_ref.logradouro}, {endereco_ref.numero} - {endereco_ref.bairro}, {endereco_ref.cidade}/{endereco_ref.estado}"
        if endereco_ref.complemento:
            endereco_completo += f" ({endereco_ref.complemento})"

        nova_entrega = Entrega(
            pedido_id=pedido.id,
            entregador_codigo=data.get('entregador_codigo'),
            endereco_snapshot=endereco_completo,
            latitude_entrega=endereco_ref.latitude,
            longitude_entrega=endereco_ref.longitude,
            taxa_entrega=data.get('taxa', 0.0)
        )
        
        pedido.status = "Em Trânsito" 
        db.session.add(nova_entrega)
        db.session.commit()
        
        return jsonify({"mensagem": "Entrega iniciada!", "destino": endereco_completo}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": str(e)}), 500
    

# Despacha um pedido para entrega (inicia o processo de entrega)
@entrega_bp.route('/pedido/<int:pedido_id>/confirmar-entrega', methods=['PATCH'])
def confirmar_entrega(pedido_id):
    data = request.json
    codigo_informado = data.get('codigo_verificacao')
    
    pedido = db.session.get(Pedido, pedido_id)

    if not pedido or pedido.status != "Em Trânsito":
        return jsonify({"erro": "O pedido não está em rota de entrega"}), 400

    if codigo_informado != pedido.codigo_confirmacao:
        return jsonify({"erro": "Código de entrega incorreto! Verifique com o cliente."}), 403

    try:
        pedido.status = "Entregue"
        if pedido.detalhes_entrega:
            pedido.detalhes_entrega.data_conclusao = datetime.utcnow()
            
        db.session.commit()
        return jsonify({"mensagem": "Código verificado! Entrega confirmada."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": str(e)}), 500

# Simula o avanço da entrega (para teste acadêmico)
@entrega_bp.route('/pedido/<int:pedido_id>/simular-entrega', methods=['POST'])
def simular_entrega(pedido_id):
    """
    Simula o avanço do status de entrega.
    Cada chamada avança um estágio.
    Fluxo: Em Preparação → Em Trânsito → Próximo → Entregue
    """
    pedido = db.session.get(Pedido, pedido_id)
    
    if not pedido:
        return jsonify({"erro": "Pedido não encontrado"}), 404
    
    # Define a sequência de status
    sequencia = ["Em Preparação", "Em Trânsito", "Próximo", "Entregue"]
    
    # Se não tem status ainda, começa do primeiro
    if pedido.status not in sequencia:
        pedido.status = sequencia[0]
        db.session.commit()
        return jsonify({
            "status": pedido.status,
            "indice": 0,
            "total": len(sequencia),
            "mensagem": "Pedido recebido! Preparando seus doces..."
        })
    
    # Encontra o índice atual
    indice_atual = sequencia.index(pedido.status)
    
    # Se já está no último, não avança mais
    if indice_atual >= len(sequencia) - 1:
        return jsonify({
            "status": pedido.status,
            "indice": indice_atual,
            "total": len(sequencia),
            "mensagem": "Pedido entregue! Bom apetite! 🍩"
        })
    
    # Avança para o próximo status
    novo_indice = indice_atual + 1
    pedido.status = sequencia[novo_indice]
    
    # Se chegou em "Em Trânsito" e não tem entrega, cria uma
    if pedido.status == "Em Trânsito" and not pedido.detalhes_entrega:
        endereco = Endereco.query.filter_by(usuario_id=pedido.usuario_id).first()
        if endereco:
            endereco_completo = f"{endereco.logradouro}, {endereco.numero} - {endereco.bairro}"
            nova_entrega = Entrega(
                pedido_id=pedido.id,
                entregador_codigo=1,
                endereco_snapshot=endereco_completo,
                latitude_entrega=endereco.latitude,
                longitude_entrega=endereco.longitude,
                taxa_entrega=0.0
            )
            db.session.add(nova_entrega)
    
    # Se chegou em "Entregue", finaliza a entrega
    if pedido.status == "Entregue" and pedido.detalhes_entrega:
        pedido.detalhes_entrega.data_conclusao = datetime.utcnow()
    
    db.session.commit()
    
    # Mensagens para cada estágio
    mensagens = {
        "Em Preparação": "Seu pedido está sendo preparado com carinho! 🍩",
        "Em Trânsito": "Entregador saiu para entrega! 🛵",
        "Próximo": "Entregador está chegando! Fique atento! 📍",
        "Entregue": "Pedido entregue! Bom apetite! 🎉"
    }
    
    return jsonify({
        "status": pedido.status,
        "indice": novo_indice,
        "total": len(sequencia),
        "mensagem": mensagens.get(pedido.status, "")
    }), 200