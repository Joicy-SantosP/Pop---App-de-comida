from config import app,db
from usuarios.usuario_route import usuario_bp

app.register_blueprint(usuario_bp)

@app.route("/", methods=['GET'])
def home():
    return "API POP Doces funcionando!"

if __name__ == '__main__':
    with app.app_context():
        db.create_all() 
    app.run(
        host=app.config['HOST'],
        port=app.config['PORT'],
        debug=app.config['DEBUG']
    )