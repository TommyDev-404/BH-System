from datetime import datetime
from .bh_info import Bh_info

class Payments:
    def __init__(self, db, boarder):
        self.db = db
        self.boarder = boarder
        self.bh_info = Bh_info(db)

    #---------------- HELPERS ----------------#
    def _response(self, success, message=None, data=None, **kwargs):
        return {'success': success, 'message': message, 'data': data, **kwargs}

    def formatDate(self, paymentDate):
        dt = datetime.strptime(paymentDate, '%Y-%m-%d')
        return {'month_name': dt.strftime('%B'), 'year': dt.year, 'month': dt.month}

    def split_month(self, months):
        return {'month': months.split(',')}


    #---------------  QUERIES FOR ADD PAYMENT -----------------#
    def boarder_date_rented(self, boarder_id):
        with self.db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute(''' SELECT dateRented from boarders_info WHERE boarder_id = %s ''', (boarder_id,))
            date = cursor.fetchone()
        return self._response(bool(date), status='ok' if date else 'Not found.', data=date.get('dateRented'))

    def check_payment_exists(self, boarder_id, months, year):
        with self.db.connect() as conn:
            cursor = conn.cursor()

            exist_months = [] # list of months
            for month in self.split_month(months).get('month'):
                if int(month) > datetime.today().month: # for advanced payment
                    exist_months.append(self.formatDate(f'2027-{month}-09').get('month_name')) # get the month that paid for display
                    cursor.execute(''' SELECT * from advanced_payment WHERE boarder_id = %s AND month = %s AND year = %s ''', (boarder_id, self.formatDate(f'2025-{month}-09').get('month_name'), year))
                else: # for normal payment
                    cursor.execute(''' SELECT * from payment_data WHERE boarder_id = %s AND month = %s AND year = %s ''', (boarder_id, self.formatDate(f'2025-{month}-09').get('month_name'), year))

            payment_list = cursor.fetchone()
           # print('data:'+str(payment_list))
        return self._response(bool(payment_list), months=exist_months)

    def next_payment(self, boarder_id, month_count):
        boarder_rented = self.boarder_date_rented(boarder_id).get('data')
        # next payment logic
        month_gap = (int(month_count) + 1) if int(month_count) < int(boarder_rented.month) else (((int(month_count) - boarder_rented.month) + 1) + boarder_rented.month)

        if int(month_gap) > 12: # advanced next year
            next_payment = [datetime.now().year + 1, month_gap - 12, boarder_rented.day]
        else:
            next_payment = [datetime.now().year, month_gap, boarder_rented.day]
        return {'next_payment': str(next_payment[0])+'-'+str(next_payment[1])+'-'+str(next_payment[2])}

    def insert_advanced_payment(self, boarder_id, months, year, paymentDate):
        with self.db.connect() as conn:
            cursor = conn.cursor()

            count = 0
            for month in self.split_month(months).get('month'):
                cursor.execute('''
                        INSERT INTO advanced_payment (boarder_id, amount, month, year, date, next_payment)
                        VALUES (%s, %s, %s, %s, %s, %s) 
                ''', (boarder_id, int(self.bh_info.get_monthly()), self.formatDate(f'2025-{month}-03').get('month_name'), year, paymentDate, self.next_payment(boarder_id, month).get('next_payment')))
                conn.commit()
                count += 1

    def added_payment(self, boarder_id, date):
        with self.db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute('''
               SELECT
                    p.id, b.roomNo, b.name, b.gender, p.date, p.month, p.year, p.next_payment,
                    CASE 
                        WHEN p.id is not NULL THEN 'Paid' 
                        ELSE 'Not Paid' 
                    END AS payment_status 
               FROM boarders_info b JOIN payment_data p 
               ON b.boarder_id = p.boarder_id
               WHERE p.boarder_id = %s AND p.month = %s AND p.year = %s ORDER BY p.date DESC ''', (int(boarder_id), date.get('month_name'), date.get('year')))
            return cursor.fetchone()


    #-------------- CRUD OPERATION ----------------#
    def add_payment(self, boarder_id, paymentType, name, gender, paymentDate, year=None, month=None):
        with self.db.connect() as conn:
            cursor = conn.cursor()
            # avoid sending empty data when there is no boarder added yet
            if self.boarder.show_boarders().get("status") == 'empty': return self._response(False, message="No boarder  yet! Cannot perform such action.")
            # format date
            date = self.formatDate(paymentDate)
            # Middleware, check if payment exist on the current month
            exist = self.check_payment_exists(boarder_id, str(self.formatDate(paymentDate).get('month')), self.formatDate(paymentDate).get('year')).get('success')
            print(boarder_id)
            if not exist: # check if payment exist on the current month
                cursor.execute(''' INSERT INTO payment_data (boarder_id, amount, date, month, year, next_payment) VALUES (%s, %s, %s, %s, %s, %s) ''',
                               (boarder_id, int(self.bh_info.get_monthly()), paymentDate, date.get('month_name'), date.get('year'), self.next_payment(boarder_id, self.formatDate(paymentDate).get('month')).get('next_payment')))
                conn.commit()

                if paymentType == 'advance': # advanced payment on the same day he paid the current month
                    self.insert_advanced_payment(boarder_id, month, year, paymentDate)
            elif paymentType == 'advance': # if advanced on different day and already paid the current month
                exist = self.check_payment_exists(boarder_id, month, year)
                if exist.get('success'): # return a message if paid on the month selected
                    return self._response(False, message=f'This boarder already paid the month of {exist.get('months')[0] if len(exist.get('months')) == 1 else ', '.join(exist.get('months')[:-1]) + ' and ' + exist.get('months')[-1]}.', status='exist')
                self.insert_advanced_payment(boarder_id, month, year, paymentDate) # else add payment for advanced
            else:
                return self._response(False, message='This boarder already paid in this month.', status='exist') # return a message for normal payment

            payment_data = self.added_payment(boarder_id, date) # confirm if added successfully
            return self._response(bool(payment_data), message='Payment successfully added.', data=payment_data, exist=exist) # for successful payment added

    def show_payments(self, month, year): # SHOW ALL THE PAID ONLY
        with self.db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute('''
               SELECT
                    b.roomNo, b.name, b.gender, p.amount, p.date, p.month, p.year, p.next_payment,
                    CASE 
                        WHEN p.id is not NULL THEN 'Paid' 
                        ELSE 'Not Paid' 
                    END AS payment_status 
               FROM boarders_info b JOIN payment_data p 
               ON b.boarder_id = p.boarder_id
               WHERE p.month = %s AND p.year = %s ORDER BY p.date DESC ''', (self.formatDate(f'2025-{month}-02').get('month_name'), year))
            payment_data = cursor.fetchall()
        return self._response(bool(payment_data), status='ok' if payment_data else 'No paid yet.', data=payment_data, type='paidCurrent')


    #--------------- TOTAL INCOMES ------------------#
    def overall_income(self):
        with self.db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute(''' 
                SELECT COUNT(*)  *  %s  AS overall_income 
                FROM (
                    SELECT boarder_id FROM payment_data 
                    UNION ALL
                    SELECT boarder_id FROM advanced_payment) 
                AS income
            ''', (int(self.bh_info.get_monthly()),))
            overall_income = cursor.fetchone()
        return self._response(bool(overall_income), data=overall_income)

    def month_income(self, types, month, year):
        with self.db.connect() as conn:
            cursor = conn.cursor()
            if types == 'normal':
                cursor.execute(''' SELECT COUNT(*) * %s AS monthly_income FROM payment_data WHERE month = %s AND year = %s ''', (int(self.bh_info.get_monthly()), self.formatDate(f'2025-{month}-09').get('month_name'), year))
            else:
                cursor.execute(''' SELECT COUNT(*) * %s AS monthly_income FROM advanced_payment WHERE month = %s AND year = %s ''', (int(self.bh_info.get_monthly()), self.formatDate(f'2025-{month}-09').get('month_name'), year))
            monthly_income = cursor.fetchone()
        return self._response(bool(monthly_income), data=monthly_income)


    #--------------- PAID CURRENT/ADVANCED TRACKER ------------------#
    def paid_boarders(self, month, year):
        with self.db.connect() as conn:
            cursor = conn.cursor()

            if int(month) <= datetime.now().month: # current
                cursor.execute(''' 
                    SELECT COUNT(*) AS total, COUNT(CASE WHEN b.gender = 'Female' THEN 1 END) AS female, COUNT(CASE WHEN b.gender = 'Male' THEN 1 END) AS male
                    FROM boarders_info b JOIN payment_data p 
                    ON b.boarder_id = p.boarder_id AND p.month = %s AND p.year = %s ''', (self.formatDate(f'2025-{month}-09').get('month_name'), year))
            else: # advance
                cursor.execute(''' 
                    SELECT COUNT(*) AS total, COUNT(CASE WHEN b.gender = 'Female' THEN 1 END) AS female, COUNT(CASE WHEN b.gender = 'Male' THEN 1 END) AS male
                    FROM boarders_info b JOIN payment_data p ON b.boarder_id = p.boarder_id
                    JOIN advanced_payment a ON p.boarder_id = a.boarder_id AND a.month = %s AND a.year = %s ''', (self.formatDate(f'2025-{month}-09').get('month_name'), year))
            paidData = cursor.fetchone()
        return self._response(bool(paidData), data=paidData)


    #--------------- UNPAID CURRENT/ADVANCED TRACKER ------------------#
    def unpaid_boarders(self, month, year):
        with self.db.connect() as conn:
            cursor = conn.cursor()

            if int(month) <= datetime.now().month: # current
                cursor.execute(''' 
                    SELECT 
                        count(case when p.date is null then 'not paid' end) as total,
                        count(case when p.date is null and b.gender = 'Male' then 'not paid' end) as male,
                        count(case when p.date is null and b.gender = 'Female' then 'not paid' end) as female
                    FROM boarders_info b LEFT JOIN payment_data p 
                    ON b.boarder_id = p.boarder_id AND p.month = %s AND p.year = %s
                ''', (self.formatDate(f'2025-{month}-09').get('month_name'), year))
            else: # advance
                print('advanced month')
                cursor.execute(''' 
                    SELECT 
                          count(case when a.date is null then 'not paid' end) as total,
                          count(case when a.date is null and b.gender = 'Male' then 'not paid' end) as male,
                          count(case when a.date is null and b.gender = 'Female' then 'not paid' end) as female
                      FROM boarders_info b
                      LEFT JOIN advanced_payment a 
                      ON b.boarder_id = a.boarder_id
                      AND a.month = %s AND a.year = %s
                ''', (self.formatDate(f'2025-{month}-09').get('month_name'), year))
            overall_unpaid = cursor.fetchone()
        return self._response(bool(overall_unpaid), data=overall_unpaid)


    # --------------- ADVANCED PAYMENT DATA TRACKER ------------------#
    def overall_advanced(self, year):
        with self.db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute('''	
                    SELECT 
                        count(DISTINCT a.boarder_id) as total,
                        count(DISTINCT case when a.boarder_id and b.gender = 'Male' then a.boarder_id end) as male,
                        count(DISTINCT case when a.boarder_id and b.gender = 'Female' then a.boarder_id end) as female
                    FROM boarders_info b
                    JOIN advanced_payment a 
                    ON b.boarder_id = a.boarder_id AND a.year = %s
            ''', (year,))
            overall_advance = cursor.fetchone()
        return self._response(bool(overall_advance), data=overall_advance)


    # --------------- VIEW PAID PAYMENT ON ADVANCED/CURRENT/PREVIOUS BY MONTH ------------------#
    def view_paid_payment_by_month(self, month, year):
        with self.db.connect() as conn:
            cursor = conn.cursor()

            if int(month) > datetime.now().month: # view payments in advanced
                cursor.execute('''
                   SELECT
                        b.boarder_id, b.roomNo, b.name, a.amount, b.gender, a.month, a.year, a.date, a.next_payment,
                        CASE 
                            WHEN a.id is not NULL THEN 'Paid/Advanced' 
                            ELSE 'Not advanced.' 
                        END AS payment_status 
                   FROM boarders_info b JOIN advanced_payment a ON b.boarder_id = a.boarder_id 
                   WHERE a.month = %s AND a.year = %s ORDER BY a.date DESC
                ''', (self.formatDate(f'2025-{month}-09').get('month_name'), year))
                advanced_payment_data = cursor.fetchall()
                return self._response(bool(advanced_payment_data), status='ok' if advanced_payment_data else 'No paid yet.', data=advanced_payment_data, type='paidAdvance') # return advanced paid data
            else:
                return self.show_payments(month, year) # return the current paid data


    # --------------- VIEW UNPAID PAYMENT ON ADVANCED/CURRENT/PREVIOUS BY MONTH ------------------#
    def view_unpaid_payment_by_month(self, month, year):
        with self.db.connect() as conn:
            cursor = conn.cursor()

            if int(month) > datetime.now().month: # advanced unpaid
                cursor.execute('''
                      SELECT
                           a.id, b.roomNo, b.name, b.gender, a.date, a.month, a.year,
                           CASE 
                               WHEN a.id is not NULL THEN 'Paid' 
                               ELSE 'Not Paid' 
                           END AS payment_status,
                           CASE 
                               WHEN a.month is NULL THEN %s
                           END AS new_month    
                      FROM boarders_info b LEFT JOIN advanced_payment a 
                      ON b.boarder_id = a.boarder_id AND a.month = %s AND a.year = %s ORDER BY b.roomNo ASC
                ''', (self.formatDate(f'2025-{month}-09').get('month_name'), self.formatDate(f'2025-{month}-09').get('month_name'), year))
            else:
                cursor.execute('''
                      SELECT
                            p.id, b.roomNo, b.name, b.gender, p.date, p.month, p.year,
                           CASE 
                               WHEN p.id is not NULL THEN 'Paid' 
                               ELSE 'Not Paid' 
                           END AS payment_status,
                           CASE 
                               WHEN p.month is NULL THEN %s
                           END AS new_month    
                      FROM boarders_info b LEFT JOIN payment_data p 
                      ON b.boarder_id = p.boarder_id AND p.month = %s AND p.year = %s ORDER BY b.roomNo ASC
                ''', (self.formatDate(f'2025-{month}-09').get('month_name'), self.formatDate(f'2025-{month}-09').get('month_name'), year))

            unpaid_data = [data for data in cursor.fetchall() if data.get('payment_status') == 'Not Paid'] # get the not paid payment only
        return self._response(bool(unpaid_data), data=unpaid_data, status='No boarders.' if self.boarder.show_boarders().get("status") == "empty" else  'ok' if unpaid_data else 'All paid.', type='unpaidAdvance' if int(month) > datetime.now().month else 'unpaidCurrent')


    #--------------- LIVE SEARCH PAYMENT PAID ADVANCE/CURRENT ------------------#
    def live_search_payment_paid(self, name, month, year):
        with self.db.connect() as conn:
            cursor = conn.cursor()

            if int(month) > datetime.now().month:
                cursor.execute('''
                   SELECT
                        b.boarder_id, b.roomNo, b.name, b.gender, a.amount, a.month, a.year, a.date, a.next_payment,
                        CASE 
                            WHEN a.id is not NULL THEN 'Paid/Advanced' 
                            ELSE 'Not advanced.' 
                        END AS payment_status 
                   FROM boarders_info b JOIN advanced_payment a ON b.boarder_id = a.boarder_id 
                   AND a.month = %s AND a.year = %s WHERE b.name LIKE %s ORDER BY a.date DESC
                ''', (self.formatDate(f'2025-{month}-09').get('month_name'), year, (name + '%')))
            else:
                cursor.execute('''
                   SELECT
                        b.roomNo, b.name, b.gender, p.amount, p.date, p.month, p.year, p.next_payment,
                        CASE 
                            WHEN p.id is not NULL THEN 'Paid' 
                            ELSE 'Not Paid' 
                        END AS payment_status 
                   FROM boarders_info b JOIN payment_data p 
                   ON b.boarder_id = p.boarder_id AND p.month = %s AND p.year = %s 
                   WHERE b.name LIKE %s ORDER BY b.roomNo ASC ''',
                   (self.formatDate(f'2025-{month}-02').get('month_name'), year, (name + '%')))

            payment_data = cursor.fetchall()
        return self._response(bool(payment_data), status= 'ok' if payment_data else 'Not found.', data=payment_data)


    #--------------- LIVE SEARCH PAYMENT UNPAID ADVANCE/CURRENT ------------------#
    def live_search_payment_unpaid(self, name, month, year):
        with self.db.connect() as conn:
            cursor = conn.cursor()

            if int(month) > datetime.now().month:
                cursor.execute('''
                   SELECT
                       a.id, b.roomNo, b.name, b.gender, a.date, a.month, a.year,
                       CASE 
                           WHEN a.id is not NULL THEN 'Paid' 
                           ELSE 'Not Paid' 
                       END AS payment_status,
                       CASE 
                           WHEN a.month is NULL THEN %s
                       END AS new_month    
                  FROM boarders_info b LEFT JOIN advanced_payment a 
                  ON b.boarder_id = a.boarder_id AND a.month = %s AND a.year = %s 
                  WHERE b.name LIKE %s ORDER BY b.roomNo ASC
                ''', (self.formatDate(f'2025-{month}-09').get('month_name'), self.formatDate(f'2025-{month}-09').get('month_name'), year, (name + '%')))
            else:
                cursor.execute('''
                SELECT
                    p.id, b.roomNo, b.name, b.gender, p.date, p.month, p.year,
                    CASE 
                       WHEN p.id is not NULL THEN 'Paid' 
                       ELSE 'Not Paid' 
                    END AS payment_status,
                    CASE 
                       WHEN p.month is NULL THEN %s
                    END AS new_month    
                    FROM boarders_info b LEFT JOIN payment_data p 
                    ON b.boarder_id = p.boarder_id AND p.month = %s AND p.year = %s 
                    WHERE b.name LIKE %s ORDER BY b.roomNo ASC 
                ''', (self.formatDate(f'2025-{month}-09').get('month_name'), self.formatDate(f'2025-{month}-02').get('month_name'), year, (name + '%')))

            payment_data = [data for data in cursor.fetchall() if data.get('payment_status') == 'Not Paid']
        return self._response(bool(payment_data), status='ok' if payment_data else 'Not found.', data=payment_data, type='unpaidAdvance' if int(month) > datetime.now().month else 'unpaidCurrent')
