from flask import Blueprint, request, jsonify
from .produto_model import Produto
from config import db

produto_bp = Blueprint('produto_routes', __name__, url_prefix='/produtos')


@produto_bp.route('/', methods=['POST'])
def criar_produto():
    dados = request.json

    if not dados.get('nome') or not dados.get('preco') or not dados.get('id_restaurante'):
        return {"error": "Campos obrigatórios: nome, preco, id_restaurante"}, 400

    if float(dados.get('preco')) <= 0:
        return {"error": "Preço deve ser maior que zero"}, 400

    categorias_validas = ['preparado', 'industrializado', 'combo']
    if dados.get('categoria') not in categorias_validas:
        return {"error": "Categoria inválida"}, 400

    novo_produto = Produto(
        nome=dados.get('nome'),
        descricao=dados.get('descricao'),
        preco=dados.get('preco'),
        imagem=dados.get('imagem'),
        categoria=dados.get('categoria'),
        id_restaurante=dados.get('id_restaurante')
    )

    db.session.add(novo_produto)
    db.session.commit()

    return novo_produto.to_dict(), 201



@produto_bp.route('/', methods=['GET'])
def listar_produtos():
    produtos = Produto.query.all()
    return [p.to_dict() for p in produtos], 200



@produto_bp.route('/<int:id>', methods=['GET'])
def obter_produto(id):
    produto = Produto.query.get_or_404(id)
    return produto.to_dict(), 200


@produto_bp.route('/<int:id>', methods=['PUT'])
def atualizar_produto(id):
    produto = Produto.query.get_or_404(id)
    dados = request.json

    if 'nome' in dados:
        produto.nome = dados['nome']
    if 'descricao' in dados:
        produto.descricao = dados['descricao']
    if 'preco' in dados:
        if float(dados['preco']) <= 0:
            return {"error": "Preço inválido"}, 400
        produto.preco = dados['preco']
    if 'imagem' in dados:
        produto.imagem = dados['imagem']
    if 'categoria' in dados:
        produto.categoria = dados['categoria']

    db.session.commit()
    return produto.to_dict(), 200


@produto_bp.route('/<int:id>/status', methods=['PATCH'])
def alterar_status(id):
    produto = Produto.query.get_or_404(id)

    produto.status = not produto.status
    db.session.commit()

    return produto.to_dict(), 200



@produto_bp.route('/buscar', methods=['GET'])
def buscar_produto():
    nome = request.args.get('nome')

    produtos = Produto.query.filter(
        Produto.nome.ilike(f"%{nome}%"),
        Produto.status == True  # RN04
    ).all()

    return [p.to_dict() for p in produtos], 200

@produto_bp.route('/<int:id>', methods=['DELETE'])
def deletar_produto(id):
    produto = Produto.query.get_or_404(id)

    db.session.delete(produto)
    db.session.commit()

    return {"message": "Produto deletado com sucesso"}, 200