import hashlib, random

# this class is for basic recovery using the email and provide the code to right after clicking the get code button
class Forgot: 
    def __init__(self, db):
        self.db = db
        self.email = None

    #---------------- HELPERS ----------------#
    def _response(self, success, message=None, data=None, **kwargs):
        return {'success': success, 'message': message, 'data': data, **kwargs}
    
    #---------------- GET CODE ----------------#
    def get_code(self, email):
        with self.db.connect() as conn:
            cursor  = conn.cursor()
            #Random recovery code
            code = random.randint(100000, 999999)
            # update the recovery code every time the user ask a code for recovery
            cursor.execute(''' UPDATE admin_login SET recovery_code = %s  WHERE email = %s''', (code, email))
            conn.commit()
            # retrieve the recovery code
            cursor.execute(''' SELECT recovery_code FROM  admin_login WHERE email = %s''', (email))
            data = cursor.fetchone()
        return self._response(bool(data), message=f'You"re recovery code is {data.get('recovery_code')}' if data else 'Email dont exist! Try again.')
        
    #---------------- SEND CODE TO PROCEED INTO CHANGING PASSWORD ----------------#
    def send_code(self, code, email):
        with self.db.connect() as conn:
            cursor  = conn.cursor()
            cursor.execute(''' SELECT recovery_code FROM  admin_login WHERE email = %s''', (email))
            data = cursor.fetchone()
            return self._response(True if data.get('recovery_code') == code else False, status='ok' if data.get('recovery_code') == code else 'Incorrect code!', redirect='/update')
        
    #---------------- SET THE NEW PASSWORD ----------------#
    def set_new_password(self, password, email):
        print(password, email)
        with self.db.connect() as conn:
            cursor  = conn.cursor()
            cursor.execute(''' UPDATE admin_login SET admin_pass = %s, hash_pass = %s  WHERE email = %s''', (password, self.hash_password(password), email,))
            conn.commit()
            return self._response(True, message="Password updated successfully!", redirect='/login')
            
    def hash_password(self, password):
        return hashlib.sha256(password.encode()).hexdigest()