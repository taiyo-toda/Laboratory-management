from app import db

class Account(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    status = db.Column(db.String(20), default="inroom")
    avatar = db.Column(db.String(255))
