from config import db
from usuarios.usuario_model import Usuario
from usuarios.auth.social_auth_model import SocialAuth

def login_social(provider, provider_user_id, email, token=None):
    social = SocialAuth.query.filter_by(
        provider=provider,
        provider_user_id=provider_user_id
    ).first()

    if social:
        return social.user

    # NÃO cria usuário aqui
    # apenas sinaliza que precisa cadastrar

    return None