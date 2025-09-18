import hashlib, random
from flask import session
from .room import Room

# this class is for user registration or creating account to use the system along with the boarding house info's
class Register:
    def __init__(self, db):
        self.db = db
        self.rooms = Room(db) # init Room class

    #----------------- HELPERS ----------------#
    def _response(self, success, message=None, data=None, **kwargs):
        return {'success': success, 'message': message, 'data': data, **kwargs}

    #----------------- CREATE ACCOUNT METHOD ----------------#
    def register(self, bhName, total_room, male, female, bed_spacer, monthly, email, admin_uname, password):
        with self.db.connect() as conn:
            cursor = conn.cursor()
            #Random recovery code
            code = random.randint(100000, 999999)

            # Middleware
            cursor.execute('SELECT * FROM admin_login WHERE admin_username = %s', (admin_uname,))
            user = cursor.fetchone()  # fetch the data from db where the username exist

            if user: # user exist
                return self._response(False, message="User exist!")

            # if not user exist and pass the middleware checkpoint
            cursor.execute(''' INSERT INTO admin_login (admin_username, admin_pass, hash_pass, email, recovery_code) VALUES (%s, %s, %s, %s, %s) ''', (admin_uname, password, self.hash_password(password), email, code))
            conn.commit()

            # insert into admin login table
            cursor.execute('SELECT * FROM admin_login WHERE admin_username = %s', (admin_uname,))
            owner_id = cursor.fetchone()  # fetch the data from db where the username exist
          
            # insert into BH Info table
            cursor.execute(''' INSERT INTO bh_info  (owner_id, bh_name,  monthly, total_room, male, female) VALUES (%s, %s, %s, %s, %s, %s) ''', (owner_id.get('id'), bhName,  int(monthly), int(total_room), int(male), int(female)))               
            conn.commit()

            # insert into room table
            for room in range(int(total_room)):
                self.rooms.add_room(int(room) + 1, int(bed_spacer), ("Male" if room < int(male) else "Female" ))

            return self._response(True, message='Registered successfully!', redirect='/login')

    def hash_password(self, password):
        return hashlib.sha256(password.encode()).hexdigest()