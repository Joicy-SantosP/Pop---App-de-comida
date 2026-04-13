from flask import Blueprint, request, jsonify, redirect
import urllib.parse
import requests
import os
from usuarios.auth.social_auth_model import SocialAuth
from usuarios.usuario_model import Usuario
from config import db
from datetime import datetime


from usuarios.auth.social_auth_service import login_social

from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests


social_auth_bp = Blueprint("social_auth", __name__)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = "http://localhost:5000/auth/google/callback"


@social_auth_bp.route("/google")
def google_login():
    base_url = "https://accounts.google.com/o/oauth2/v2/auth"

    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
    }

    url = f"{base_url}?{urllib.parse.urlencode(params)}"
    return redirect(url)


@social_auth_bp.route("/google/callback")
def google_callback():
    code = request.args.get("code")

    if not code:
        return jsonify({"error": "Código não fornecido"}), 400

    token_url = "https://oauth2.googleapis.com/token"

    data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code"
    }

    token_response = requests.post(token_url, data=data).json()

    google_token = token_response.get("id_token")

    if not google_token:
        return jsonify({"error": "Erro ao obter token do Google"}), 400

    idinfo = google_id_token.verify_oauth2_token(
        google_token,
        google_requests.Request(),
        GOOGLE_CLIENT_ID
    )

    provider_user_id = idinfo["sub"]
    email = idinfo["email"]


    user = login_social(
        provider="google",
        provider_user_id=provider_user_id,
        email=email
    )

    if user:
        return redirect("http://localhost:5173/dashboard")

    # novo usuário → completar cadastro
    return redirect(
        f"http://localhost:5173/cadastro-complementar"
        f"?provider=google"
        f"&provider_user_id={provider_user_id}"
        f"&email={email}"
    )
    
@social_auth_bp.route("/cadastro-complementar", methods=["POST"])
def complete_social_register():
    data = request.get_json()

    provider = data.get("provider")
    provider_user_id = data.get("provider_user_id")

    nome = data.get("nome")
    telefone = data.get("telefone")
    cpf = data.get("cpf")
    data_nascimento = data.get("data_nascimento")

    social = SocialAuth.query.filter_by(
        provider=provider,
        provider_user_id=provider_user_id
    ).first()

    if not social:
        return jsonify({"message": "Usuário não encontrado"}), 404

    user = social.user

    user.nome = nome
    user.telefone = telefone
    user.cpf = cpf
    
    if data_nascimento:
        user.data_nascimento = datetime.strptime(data_nascimento, "%Y-%m-%d").date()

    db.session.commit()

    return jsonify({"message": "Cadastro completo"}), 200