from config import app, db
from flask_jwt_extended import JWTManager

#  rotas (Blueprints)
from usuarios.usuario_route import usuario_bp
from restaurantes.restaurante_route import restaurantes_blueprint 
from pedidos.pedido_route import pedidos_blueprint 
from produtos.produto_route import produto_bp


# 2. IMPORTANTE: Importar os models para o db.create_all() criar as tabelas!
from restaurantes.restaurante_model import Restaurantes
from pedidos.pedido_model import ItemPedido


app.config["JWT_SECRET_KEY"] = "chave_super_secreta" # Dica: no futuro, coloque isso numa variável de ambiente!
jwt = JWTManager(app)

# 3. Registrando todas as rotas no app
app.register_blueprint(usuario_bp)
app.register_blueprint(restaurantes_blueprint)
app.register_blueprint(produto_bp)
# app.register_blueprint(pedidos_blueprint) <-- Descomente quando criar o de pedidos

@app.route("/", methods=['GET'])
def home():
    return "API POP Doces funcionando!"

if __name__ == '__main__':
    with app.app_context():
        # Agora sim ele vai criar a tabela de Restaurante e Pedido também!
        db.create_all() 
        
    app.run(
        host=app.config.get('HOST', '0.0.0.0'),
        port=app.config.get('PORT', 1313),
        debug=app.config.get('DEBUG', True)
    )