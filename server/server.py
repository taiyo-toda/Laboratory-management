from flask import Flask, request, jsonify

app = Flask(__name__)

# 仮のデータベース（本当はDBを使う）
accounts = []

@app.route("/create_account", methods=["POST"])
def create_account():
    data = request.get_json()  # クライアントからJSONを受け取る
    username = data.get("username")
    email = data.get("email")
    status = data.get("status", "inroom")
    avatar = data.get("avatar")

    account = {
        "username": username,
        "email": email,
        "status": status,
        "avatar": avatar
    }

    accounts.append(account)

    return jsonify({"message": "Account created successfully", "account": account})

if __name__ == "__main__":
    app.run(debug=True)