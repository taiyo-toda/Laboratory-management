from flask import request, jsonify, render_template
from app import app, db
from app.models import Account, Schedule
import random

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/create_account", methods=["POST"])
def create_account():
    data = request.get_json()
    color_list = [
        "#2196f3","#4caf50","#ff9800","#9c27b0","#e91e63",
        "#00bcd4","#8bc34a","#ffc107","#3f51b5","#795548"
    ]
    color = random.choice(color_list)

    # すでに同じメールがあるかチェック
    existing = Account.query.filter_by(email=data["email"]).first()
    if existing:
        return jsonify({"error": "このメールアドレスはすでに登録されています"}), 400

    new_acc = Account(
        username=data["username"],
        email=data["email"],
        status=data.get("status", "inroom"),
        avatar=data.get("avatar"),
        color=color
    )
    db.session.add(new_acc)
    db.session.commit()
    return jsonify({"message": "account created"})

@app.route("/add_schedule", methods=["POST"])
def add_schedule():
    data = request.get_json()
    account = Account.query.filter_by(username=data["username"]).first()
    if not account:
        return jsonify({"error": "account not found"}), 404

    new_schedule = Schedule(
        account_id=account.id,
        start_time=data["start_time"],
        end_time=data["end_time"],
        description=data.get("description", "")
    )
    db.session.add(new_schedule)
    db.session.commit()
    return jsonify({"message": "schedule added"})

@app.route("/get_all_accounts", methods=["GET"])
def get_all_accounts():
    accounts = Account.query.all()
    account_list = []
    for acc in accounts:
        account_list.append({
            "id": acc.id,
            "username": acc.username,
            "email": acc.email,
            "status": acc.status,
            "avatar": acc.avatar,
            "color": acc.color or "#2196f3"  # もし空なら青
        })
    return jsonify(account_list)

@app.route("/test")
def test_page():
    return render_template("test.html")

@app.route("/update_status", methods = ["POST"])
def update_status():
    data = request.get_json() or {}
    username = data.get("username")
    status = data.get("status")
    comment = data.get("comment", "")

    # 入力チェック
    if not username or not status:
        return jsonify({"error": "usernameとstatusが必要です"}), 400

    account = Account.query.filter_by(username=username).first()
    if not account:
        return jsonify({"error": "アカウントが見つかりません"}), 404
    
    account.status = status
    db.session.commit()

    return jsonify({"message": "statusを更新しました", "username": account.username, "status": account.status})