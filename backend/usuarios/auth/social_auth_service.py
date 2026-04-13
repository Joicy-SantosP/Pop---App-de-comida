from config import db
from usuarios.usuario_model import Usuario
from usuarios.auth.social_auth_model import SocialAuth

def login_social(provider, provider_user_id, email):

    social = SocialAuth.query.filter_by(
        provider=provider,
        provider_user_id=provider_user_id
    ).first()

    if social:
        return social.user


    user = Usuario(email=email)
    db.session.add(user)
    db.session.flush()


    social = SocialAuth(
        provider=provider,
        provider_user_id=provider_user_id,
        user_id=user.id
    )

    db.session.add(social)
    db.session.commit()

    # ainda não tem cadastro completo
    return None