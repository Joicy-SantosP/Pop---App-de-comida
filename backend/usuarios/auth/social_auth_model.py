from config import db

class SocialAuth(db.Model):
    __tablename__ = "social_auth"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)

    provider = db.Column(db.String(50), nullable=False)  # google, github
    provider_user_id = db.Column(db.String(255), nullable=False)

    access_token = db.Column(db.Text)

    user = db.relationship("Usuario", backref="social_accounts")