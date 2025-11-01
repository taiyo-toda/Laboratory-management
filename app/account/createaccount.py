import requests

print("Enter your account name:")
name = input()
print("Enter your email:")
mail = input()

data = {
    "username": name,
    "email": mail,
    "status": "inroom",
    "avatar": None
}

response = requests.post("http://127.0.0.1:5000/create_account", json=data)

print(response.json())