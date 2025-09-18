
class Boarder:
    def __init__(self, db):
        self.db = db

    def _format_name(self, first_name, middle, last_name): # underscore before function means that this function can only be used in this class
        first_name = " ".join(name for name in first_name.split()) # get the name even and format even if it have 2 or more name
        new_last_name = " ".join(name for name in last_name.split()) # also the lastname
        return f'{first_name} {middle}. {new_last_name}'

    def _response(self, success, message=None, data=None, **kwargs):
        return {'success': success, 'message': message, 'data': data, **kwargs}

    def get_avl_room(self, gender): # get the availabke room for boarder adding
        with self.db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute(''' SELECT roomNo FROM room WHERE status = "Available" AND gender = %s''', (gender,))
            room = cursor.fetchall()
        return self._response(bool(room), message='ok' if room else 'No room available.', data=room)

    def update_room(self, gender, query_type, room_no, prevroom=None, prevgender=None): # modify the room, update the available room and change its status based on room availability
        with self.db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute(""" SELECT available FROM room  WHERE gender = %s  AND roomNo = %s """, (gender, int(room_no)))
            avl_room = cursor.fetchone()

            if query_type == 'add':
                if int(avl_room.get('available')) != 1:
                    cursor.execute(""" UPDATE room SET available = available - 1 WHERE gender = %s AND roomNo = %s """, (gender, int(room_no)))
                else:
                    cursor.execute(""" UPDATE room SET available = available - 1, status = %s WHERE gender = %s AND roomNo = %s """, ('Occupied', gender, int(room_no)))
            elif query_type == 'edit':
                print('edit')
                cursor.execute(""" UPDATE room SET available = available + 1 WHERE gender = %s AND roomNo = %s """, (prevgender, prevroom))
                if int(avl_room.get('available')) != 1:
                    cursor.execute(""" UPDATE room SET available = available - 1 WHERE gender = %s AND roomNo = %s """, (gender, int(room_no)))
                else:
                    cursor.execute(""" UPDATE room SET available = available - 1, status = %s WHERE gender = %s AND roomNo = %s """, ('Occupied', gender, int(room_no)))
            else:
                if int(avl_room.get('available')) == 0:
                    cursor.execute(""" UPDATE room SET available = available + 1, status = %s WHERE gender = %s AND roomNo = %s """, ('Available', gender,  int(room_no)))
                else:
                    cursor.execute(""" UPDATE room SET available = available + 1 WHERE gender = %s AND roomNo = %s """, (gender, int(room_no)))
                    
            conn.commit() 

    def add_boarder(self, roomNo, firstname, middle, lastname, gender, phone, address, date_rented):
        name = self._format_name(firstname, middle, lastname)
        with self.db.connect() as conn: # DB CONNECTION THAT OPEN AND CLOSE THE DB CONNECTION AFTER QUERY
            cursor = conn.cursor()
            cursor.execute(''' SELECT name FROM boarders_info WHERE name = %s ''', (name,))
            boarder = cursor.fetchone()
            # if boarder exist
            if boarder: return self._response(False, 'Boarder already exists')
            # if not
            cursor.execute(''' INSERT INTO boarders_info (roomNo, name, gender, address, phone, dateRented) VALUES (%s, %s, %s, %s, %s, %s)''', (int(roomNo), name, gender, address, phone, date_rented,))
            conn.commit()

            #update room
            self.update_room(gender, 'add', roomNo)

            return self._response(True, 'Boarder added successfully!')

    def show_boarders(self): # get all the boarder
        with self.db.connect() as conn:
            cursor = conn.cursor() # return dict and not tuples
            cursor.execute("SELECT * FROM boarders_info ORDER BY roomNo ASC")
            data = cursor.fetchall()
        return self._response(bool(data), status='ok' if data else 'empty', message='ok' if data else 'No boarders yet.', data=data)

    def delete_boarder(self, boarder_id, gender, room_no):
        with self.db.connect() as conn:
            cursor = conn.cursor()
            print(boarder_id)
            cursor.execute('''DELETE FROM boarders_info WHERE boarder_id = %s''', (boarder_id,))
            cursor.execute('''DELETE FROM payment_data WHERE boarder_id = %s''', (boarder_id,))
            cursor.execute('''DELETE FROM advanced_payment WHERE boarder_id = %s''', (boarder_id,))
            conn.commit()
            self.update_room(gender, 'remove', room_no)
        return self._response(True, 'Boarder deleted successfully!')

    def edit_boarder(self, boarder_id, prevroom, prevgender, roomNo, firstname, lastname, middle_initial, gender, phone, address, date_rented):
        name = self._format_name(firstname, middle_initial, lastname)
        with self.db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute(''' UPDATE boarders_info SET roomNo = %s, name = %s, gender = %s, address = %s, phone = %s, dateRented = %s WHERE boarder_id = %s''',
                           (int(roomNo), name, gender, address, phone, date_rented, boarder_id,))
            conn.commit()
            print(gender, prevroom, roomNo)
            # update room
            self.update_room(gender, 'edit', roomNo, prevroom, prevgender)
            
        return self._response(True, 'Boarder edited successfully!')

    def get_boarder(self, boarder_id):
        with self.db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute(''' SELECT * FROM boarders_info WHERE boarder_id = %s ''', (boarder_id,))
            boarder = cursor.fetchone()
        return self._response(True, data=boarder)

    def live_search(self, name):
        with self.db.connect() as conn:
            cursor = conn.cursor()
            boarder = self.show_boarders()

            if boarder.get('status') == 'empty': # CHECK IF TABLE IS EMPTY
                return self.show_boarders()
            else:
                query = "SELECT * FROM boarders_info WHERE name LIKE %s ORDER BY roomNo ASC"
                cursor.execute(query, (name + "%",)) # THIS '%' IN SQL PERFORM SEARCH AND IF NAME IS EMPTY, IT RETURN ALL RESULTS IN DB LIKE A SHOW ALL
            boarder = cursor.fetchall()
        return self._response(True if len(boarder) != 0 else False, data=boarder, status='ok' if len(boarder) != 0 else 'not found' )

    def sort_boarders(self, type):
        with self.db.connect() as conn:
            cursor = conn.cursor()

            if type == 'dateRented':
                query = f"SELECT * FROM boarders_info ORDER BY {type} DESC"
            else:
                query = f"SELECT * FROM boarders_info ORDER BY {type} ASC"
            cursor.execute(query)
            boarders = cursor.fetchall()
        return self._response(bool(boarders), data=boarders)

    def get_totals(self, gender=None):
        with self.db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute(''' 
                                SELECT  
                                    COUNT(*) as all_boarders,
                                    COUNT(CASE WHEN gender = 'Male' THEN 1 END) AS male,
                                    COUNT(CASE WHEN gender = 'Female' THEN 2 END) AS female
                                FROM boarders_info ''')
            boarders = cursor.fetchall()
        return self._response(bool(boarders), data=boarders)