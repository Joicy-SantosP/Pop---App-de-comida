from datetime import datetime, timedelta
from config import db
from pedidos.pedido_model import Pedido, ItemPedido
from produtos.produto_model import Produto
#aumento da complexidade do carrinho

def buscar_ou_criar_carrinho(usuario_id, restaurante_id):

    pedido = Pedido.query.filter_by(
        usuario_id=usuario_id,
        status="Aberto"
    ).first()

    # EXISTE
    if pedido:

        # EXPIRADO
        if pedido.carrinho_abandonado():

            pedido.status = "Abandonado"

            db.session.commit()

        else:
            return pedido

    # NOVO
    novo_pedido = Pedido(
        restaurante_id=restaurante_id,
        usuario_id=usuario_id
    )

    db.session.add(novo_pedido)

    db.session.commit()

    return novo_pedido


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

    # expirado
    if pedido.carrinho_abandonado():

        pedido.status = "Abandonado"

        db.session.commit()

        return {
            "erro": "Carrinho expirado"
        }, 400

    pedido.atualizar_total()

    db.session.commit()

    return pedido.to_dict(), 200


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

        # NO IFOOD NÃO PODE MISTURAR OS RESTAURANTES
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

        # item existe
        if item_existente:

            item_existente.quantidade += dados_item['quantidade']

        # novo item
        else:

            novo_item = ItemPedido(

                produto_id=produto.id,

                nome_doce=produto.nome,

                quantidade=dados_item['quantidade'],

                # PREÇO CONGELADO
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

        # REMOVE ITEM
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

        # validação
        for item in pedido.itens:

            produto = db.session.get(
                Produto,
                item.produto_id
            )

            # produto indisponivel
            if not produto:

                return {
                    "erro": f"O produto {item.nome_doce} foi removido"
                }, 400

            # estoque
            if produto.estoque < item.quantidade:

                return {
                    "erro": f"Estoque insuficiente para {produto.nome}"
                }, 400

            # mudança de preço
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

        # finaliza
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

# limpeza automática - 30 dias 

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