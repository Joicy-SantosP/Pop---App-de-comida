from datetime import datetime, timedelta
from config import db
from pedidos.pedido_model import Pedido, ItemPedido
from produtos.produto_model import Produto

# Busca um carrinho aberto do usuário ou cria um novo, tratando carrinhos expirados
def buscar_ou_criar_carrinho(usuario_id, restaurante_id):
    pedido = Pedido.query.filter_by(
        usuario_id=usuario_id,
        status="Aberto"
    ).first()

    if pedido:
        if pedido.carrinho_abandonado():
            pedido.status = "Abandonado"
            db.session.commit()
        else:
            return pedido

    novo_pedido = Pedido(
        restaurante_id=restaurante_id,
        usuario_id=usuario_id
    )

    db.session.add(novo_pedido)
    db.session.commit()

    return novo_pedido

# Retorna o carrinho aberto do usuário com seus itens e total atualizado
def ver_carrinho(usuario_id):
    pedido = Pedido.query.filter_by(
        usuario_id=usuario_id,
        status="Aberto"
    ).first()

    if not pedido:
        return {
            "mensagem": "Carrinho vazio",
            "itens": [],
            "total": 0.0
        }, 200

    if pedido.carrinho_abandonado():
        pedido.status = "Abandonado"
        db.session.commit()
        return {
            "erro": "Carrinho expirado"
        }, 400

    pedido.atualizar_total()
    db.session.commit()

    return pedido.to_dict(), 200

# Adiciona um item ao carrinho do usuário, validando restaurante e evitando mistura de lojas
def adicionar_item_ao_carrinho(usuario_id, dados_item):
    try:
        produto = db.session.get(
            Produto,
            dados_item.get('produto_id')
        )

        if not produto:
            return {
                "erro": "Produto não encontrado"
            }, 404

        pedido = buscar_ou_criar_carrinho(
            usuario_id,
            produto.id_restaurante
        )

        if pedido.restaurante_id != produto.id_restaurante:
            return {
                "erro": "Você possui itens de outro restaurante"
            }, 400

        item_existente = next(
            (
                item
                for item in pedido.itens
                if item.produto_id == produto.id
            ),
            None
        )

        if item_existente:
            item_existente.quantidade += dados_item['quantidade']
        else:
            novo_item = ItemPedido(
                produto_id=produto.id,
                nome_doce=produto.nome,
                quantidade=dados_item['quantidade'],
                preco_unitario=produto.preco
            )

            pedido.itens.append(novo_item)

        pedido.updated_at = datetime.utcnow()
        pedido.atualizar_total()
        db.session.commit()

        return {
            "mensagem": "Item adicionado com sucesso!",
            "pedido": pedido.to_dict()
        }, 200

    except Exception as e:
        db.session.rollback()
        return {
            "erro": "Erro ao adicionar item",
            "detalhes": str(e)
        }, 500

# Atualiza a quantidade de um item no carrinho ou o remove se quantidade for zero
def atualizar_item(usuario_id, item_id, dados):
    try:
        pedido = Pedido.query.filter_by(
            usuario_id=usuario_id,
            status="Aberto"
        ).first()

        if not pedido:
            return {
                "erro": "Carrinho não encontrado"
            }, 404

        item = db.session.get(
            ItemPedido,
            item_id
        )

        if not item:
            return {
                "erro": "Item não encontrado"
            }, 404

        quantidade = dados.get('quantidade')

        if quantidade is None:
            return {
                "erro": "Quantidade obrigatória"
            }, 400

        if quantidade <= 0:
            db.session.delete(item)
        else:
            item.quantidade = quantidade

        pedido.updated_at = datetime.utcnow()
        pedido.atualizar_total()
        db.session.commit()

        return {
            "mensagem": "Carrinho atualizado"
        }, 200

    except Exception as e:
        db.session.rollback()
        return {
            "erro": "Erro ao atualizar item",
            "detalhes": str(e)
        }, 500

# Remove um item específico do carrinho do usuário
def remover_item(usuario_id, item_id):
    try:
        pedido = Pedido.query.filter_by(
            usuario_id=usuario_id,
            status="Aberto"
        ).first()

        if not pedido:
            return {
                "erro": "Carrinho não encontrado"
            }, 404

        item = db.session.get(
            ItemPedido,
            item_id
        )

        if not item:
            return {
                "erro": "Item não encontrado"
            }, 404

        db.session.delete(item)
        pedido.updated_at = datetime.utcnow()
        pedido.atualizar_total()
        db.session.commit()

        return {
            "mensagem": "Item removido"
        }, 200

    except Exception as e:
        db.session.rollback()
        return {
            "erro": "Erro ao remover item",
            "detalhes": str(e)
        }, 500

# Finaliza o pedido validando disponibilidade, estoque e preço dos itens
def finalizar_pedido(usuario_id):
    try:
        pedido = Pedido.query.filter_by(
            usuario_id=usuario_id,
            status="Aberto"
        ).first()

        if not pedido:
            return {
                "erro": "Carrinho vazio"
            }, 404

        for item in pedido.itens:
            produto = db.session.get(
                Produto,
                item.produto_id
            )

            if not produto:
                return {
                    "erro": f"O produto {item.nome_doce} foi removido"
                }, 400

            if produto.estoque < item.quantidade:
                return {
                    "erro": f"Estoque insuficiente para {produto.nome}"
                }, 400

            if produto.preco != item.preco_unitario:
                preco_antigo = item.preco_unitario
                item.preco_unitario = produto.preco
                pedido.atualizar_total()
                db.session.commit()

                return {
                    "erro": "Preço atualizado",
                    "produto": produto.nome,
                    "preco_antigo": preco_antigo,
                    "preco_novo": produto.preco,
                    "novo_total": pedido.total
                }, 400

        pedido.status = "Confirmado"
        pedido.gerar_codigo_entrega()
        pedido.iniciar_simulacao()
        pedido.updated_at = datetime.utcnow()
        pedido.atualizar_total()
        db.session.commit()

        return {
            "mensagem": "Pedido confirmado!",
            "pedido": pedido.to_dict()
        }, 200

    except Exception as e:
        db.session.rollback()
        return {
            "erro": "Erro ao finalizar pedido",
            "detalhes": str(e)
        }, 500

# Remove carrinhos abandonados há mais de 30 dias para limpeza do banco
def limpar_carrinhos_antigos():
    try:
        limite = datetime.utcnow() - timedelta(days=30)

        carrinhos = Pedido.query.filter(
            Pedido.status == "Abandonado",
            Pedido.updated_at < limite
        ).all()

        quantidade = len(carrinhos)

        for pedido in carrinhos:
            db.session.delete(pedido)

        db.session.commit()

        return {
            "mensagem": f"{quantidade} carrinhos removidos"
        }

    except Exception as e:
        db.session.rollback()
        return {
            "erro": "Erro na limpeza",
            "detalhes": str(e)
        }