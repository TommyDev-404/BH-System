import hashlib
from flask import session

class Login:
    def __init__(self, db):
        self.db = db

    def _response(self, success, message=None, data=None, **kwargs):
        return {'success': success, 'message': message, 'data': data, **kwargs}

    def login(self, username, password):
        with self.db.connect() as conn:
            cursor = conn.cursor()
            # get all the admin data
            cursor.execute('SELECT * FROM admin_login WHERE admin_username = %s', (username,))
            user = cursor.fetchone() # fetch the data from db where the username exist

            # Middleware
            if not user:
                checkpoint = 'User dont exist!'
            elif user['hash_pass'] != self.hash_password(password):
                checkpoint = 'Wrong password!'
            else:
                checkpoint = 'Login successful!'
                session['user_id'] = user['id'] # store id in session

        return self._response(bool(user), message=checkpoint, data=user, redirect='/dashboard')

    def hash_password(self, password):
        return hashlib.sha256(password.encode()).hexdigest()