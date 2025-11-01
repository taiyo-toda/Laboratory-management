import account
print("Enter your account name")
name = input()
print("Enter your email")
mail = input()
print("Enter your avatar")
avatar = input()

accountlist = []
accountlist.append(account(name, mail, avatar))
