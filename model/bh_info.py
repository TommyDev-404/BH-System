from flask import session

class Bh_info:
      def __init__(self, db):
            self.db = db

      def get_bh_name(self, owner_id):
            print(owner_id)
            with self.db.connect() as conn:
                  cursor = conn.cursor()
                  cursor.execute('SELECT bh_name FROM bh_info WHERE owner_id = %s', (int(owner_id)))
                  return cursor.fetchone()['bh_name']
      
      def get_owner_id(self):
             with self.db.connect() as conn:
                  cursor = conn.cursor()
                  cursor.execute('SELECT owner_id FROM bh_info')
                  return cursor.fetchone()['owner_id']
         
      def get_monthly(self):
            with self.db.connect() as conn:
                  cursor = conn.cursor()
                  cursor.execute('SELECT monthly FROM bh_info WHERE owner_id = %s', (session['user_id'],))
                  return cursor.fetchone().get('monthly')
   
          
