class account:
    def __init__(self, username, email, staus="active" ,avatar=None):
        self.username = username
        self.email = email
    
    def changestatus(self, new_status):
        self.status = new_status

    def displayinfo(self):
        return 0
    
    def changeprofile(self, new_username, new_email, new_avatar):
        self.username = new_username
        self.email = new_email
        self.avatar = new_avatar
    