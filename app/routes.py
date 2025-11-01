from flask import request, jsonify
from app import app, db
from app.models import Account

@app.route("/")
def index():
    return "Server is running!"

@app.route("/create_account", methods=["POST"])
def create_account():
    data = request.get_json()
    new_acc = Account(
        username=data["username"],
        email=data["email"],
        status=data.get("status", "inroom"),
        avatar=data.get("avatar")
    )
    db.session.add(new_acc)
    db.session.commit()
    return jsonify({"message": "account created"})
