from datetime import datetime
from .bh_info import Bh_info

class Dashboard:
    def __init__(self, db, room, boarder, payments):
        self.db = db
        self.room = room
        self.boarder = boarder
        self.payment = payments
        self.bh_info = Bh_info(db)
    
    #---------------- HELPERS ----------------#
    def _response(self, success, message=None, data=None, **kwargs):
        return {'success': success, 'message': message, 'data': data, **kwargs}
    
    #---------------- DATA FETCHER ----------------#
    def total_boarder(self):
        return self.boarder.get_totals()
    
    def total_income(self):
        return self.payment.overall_income()
    
    def month_income(self):
        return self.payment.month_income('normal', datetime.now().month, datetime.now().year)
    
    def unpaid_payments_amount(self):
        with self.db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute(''' 
                    SELECT
                        COUNT(CASE WHEN p.boarder_id IS NULL THEN 1 END) *  %s  as unpaid_payments 
                    FROM boarders_info b  
                    LEFT JOIN `payment_data` p
                    on b.boarder_id = p.boarder_id
            ''', (self.bh_info.get_monthly(),))
            total = cursor.fetchone()
        return self._response(bool(total), data=total)
    
    def total_paid(self):
         return self.payment.paid_boarders(datetime.now().month, datetime.now().year)
    
    def total_unpaid(self):
         return self.payment.unpaid_boarders(datetime.now().month, datetime.now().year)
    
    def total_advanced(self):
        return self.payment.overall_advanced(datetime.now().year)
    
    def total_room(self):
        return self.room.room_total_data()

    #--------------------- SHOWING BOARDERS INFO ------------#
    def advanced_data(self):
        with self.db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT roomNo, name, gender, GROUP_CONCAT(a.month SEPARATOR ', ') as month
                FROM boarders_info b JOIN advanced_payment a
                ON b.boarder_id = a.boarder_id WHERE year = %s 
                GROUP by roomNo, name, gender''', (datetime.now().year))
            data = cursor.fetchall()
            return self._response(bool(data), message='ok' if data else 'No advance yet.', data=data)

    
            

        