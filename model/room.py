from .bh_info import Bh_info

class Room:
    def __init__(self, db):
        self.db = db
        self.bh_info = Bh_info(db)

    #---------------- RESPONSE FUNCTION ---------------#
    def _response(self, success, message=None, data=None, **kwargs):
        return {'success': success, 'message': message, 'data': data, **kwargs}
    
    def add_room(self, room, capacity, gender, type=None):
        with self.db.connect() as conn:
            print(room, capacity, gender)
            cursor = conn.cursor()
            cursor.execute(''' INSERT INTO room (roomNo, gender, capacity, available, status) VALUES (%s, %s, %s, %s, %s) ''', (room, gender, int(capacity), int(capacity), 'Available'))
            
            if type == 'direct-add':
                if gender == 'Male':
                    cursor.execute(''' UPDATE bh_info SET total_room = total_room + 1, male = male + 1 WHERE owner_id = %s''', (int(self.bh_info.get_owner_id())))
                else:
                    cursor.execute(''' UPDATE bh_info SET total_room = total_room + 1, female = female + 1 WHERE owner_id = %s''', (int(self.bh_info.get_owner_id())))

            conn.commit()
            return self._response(True, message=f'Room {room} added successfully!')

    def edit_room(self, roomId, roomNo, gender, capacity, available, status):
        with self.db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute(''' UPDATE room SET roomNo = %s, gender = %s, capacity = %s, available = %s, status = %s WHERE id = %s''', (roomNo, gender, int(capacity), int(available), status, int(roomId)))
            conn.commit()
            return self._response(True, message=f'Room updated successfully!')

    def delete_room(self, room_id, roomNo, gender):
        with self.db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute(''' DELETE FROM room WHERE id = %s''', (int(room_id)))
            cursor.execute(' DELETE FROM boarders_info WHERE roomNo = %s', (int(roomNo),))

            if gender == 'Male':
                cursor.execute(''' UPDATE bh_info SET total_room = total_room - 1, male = male - 1 WHERE owner_id = %s''', (int(self.bh_info.get_owner_id())))
            else:
                cursor.execute(''' UPDATE bh_info SET total_room = total_room - 1, female = female - 1 WHERE owner_id = %s''', (int(self.bh_info.get_owner_id())))

            conn.commit()
            return self._response(True, message=f'Room {roomNo} deleted successfully!')

    def get_room_data(self, room_id):
        with self.db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute(''' SELECT * FROM room WHERE id = %s ''', (int(room_id),))
            data = cursor.fetchone()
        return self._response(bool(data), data=data)

    def show_room(self):
        with self.db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute(''' SELECT * FROM room ORDER BY roomNo ASC ''')
            rooms = cursor.fetchall()
        return self._response(bool(rooms), message='ok' if rooms else 'No rooms.', data=rooms)

    def room_total_data(self):
        with self.db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute(''' 
                SELECT
                    COUNT(*) AS total,
                    COUNT(CASE WHEN gender = 'Male' THEN 1 END) AS male,
                    COUNT(CASE WHEN gender = 'Female' THEN 2 END) AS female,
                
                    -- Occupied
                    COUNT(CASE WHEN status = 'Occupied' THEN 1 END) AS occ_total,
                    COUNT(CASE WHEN status = 'Occupied' AND gender = 'Male' THEN 2 END) AS occ_male,
                    COUNT(CASE WHEN status = 'Occupied' AND gender = 'Female' THEN 3 END) AS occ_female,
                
                    -- Available
                    COUNT(CASE WHEN status = 'Available' THEN 1 END) AS avl_total,
                    COUNT(CASE WHEN status = 'Available' AND gender = 'Male' THEN 2 END) AS avl_male,
                    COUNT(CASE WHEN status = 'Available' AND gender = 'Female' THEN 3 END) AS avl_female,
                
                    -- Maintenance
                    COUNT(CASE WHEN status = 'Maintenance' THEN 1 END) AS mtn_total,
                    COUNT(CASE WHEN status = 'Maintenance' AND gender = 'Male' THEN 2 END) AS mtn_male,
                    COUNT(CASE WHEN status = 'Maintenance' AND gender = 'Female' THEN 3 END) AS mtn_female
                FROM room;
            ''')

            all_total = cursor.fetchall()
        return self._response(bool(all_total), data=all_total)

    def sort_room(self, sortType):
        with self.db.connect() as conn:
            cursor = conn.cursor()

            if sortType == 'All':
                return self.show_room()

            cursor.execute(''' SELECT * FROM room WHERE status = %s ORDER BY roomNo ASC''', (sortType,))
            data = cursor.fetchall()
        return self._response(bool(data), message='ok' if data else 'No rooms.', data=data)
