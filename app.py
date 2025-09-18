import pymysql
from flask import Flask, render_template, session, request, jsonify
from model import Database, Register, Boarder, Payments, Room,  Login, Dashboard, Forgot, Bh_info

app = Flask(__name__)
app.secret_key = 'i_love_u'  # secret key

# prevent going back to homepage after logout or going direct on home page without authentication
@app.after_request
def add_header(response):
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

# Create DB object once here
db = Database(
    host="localhost",
    user="tommy",
    password="2006",
    database="my_db",
    cursor=pymysql.cursors.DictCursor
)

# Pass the same db instance to every class
admin_login = Login(db)
admin_register = Register(db)
boarder = Boarder(db)
payment = Payments(db, boarder)
rooms = Room(db)
dashboard = Dashboard(db, rooms, boarder, payment)
forgot = Forgot(db)
bh_info = Bh_info(db)

#------------------  BH NAME ------------------#
@app.route('/bh_info/bh_name', methods=['GET'])
def get_bh_name():
    return jsonify({'bh_name' : bh_info.get_bh_name(bh_info.get_owner_id())})


#------------------ LOGIN ------------------#
@app.route('/login', methods=['GET', 'POST'])
def login_page():
    return render_template('login.html')

@app.route('/login-submit', methods=['POST'])
def login():
    return jsonify(admin_login.login(**request.get_json()))


#----------------- REGISTER ACCOUNT ------------------#
@app.route('/register', methods=['GET', 'POST'])
def register_page():
    return render_template('register.html')

@app.route('/register-submit', methods=['POST'])
def register():
    return jsonify(admin_register.register(**request.get_json()))


#------------------ FORGOT PASSWORD ------------------#
@app.route('/recover')
def forgot_page():
    return render_template('forgot.html')

@app.route('/recover/get-code', methods=['GET'])
def get_code():
    session['email'] = request.args.get('email') # store email in session
    return jsonify(forgot.get_code(request.args.get('email')))

@app.route('/recover/send-code', methods=['POST'])
def send_code():
    return jsonify(forgot.send_code(**request.get_json()))


#------------------ CHANGE PASSWORD ------------------#
@app.route('/update')
def update_password_page():
    return render_template('update.html')

@app.route('/update/get-email', methods=['GET'])
def get_email():
    return jsonify({'email':session['email']})

@app.route('/update/new-password', methods=['POST'])
def update_password():
    return jsonify(forgot.set_new_password(**request.get_json()))


#------------------DASHBOARD------------------#
@app.route('/dashboard')
def dashboard_page():
    if 'user_id' in session:
        return render_template('dashboard.html')
    return render_template('login.html')

@app.route('/dashboard/total-boarders', methods=['GET'])
def total_boarders():
    return jsonify(dashboard.total_boarder())

@app.route('/dashboard/overall-income', methods=['GET'])
def overall_income():
    return jsonify(dashboard.total_income())

@app.route('/dashboard/month-income', methods=['GET'])
def monthly_income():
    return jsonify(dashboard.month_income())

@app.route('/dashboard/unpaid-amount', methods=['GET'])
def unpaid_amount():
    return jsonify(dashboard.unpaid_payments_amount())

@app.route('/dashboard/total-paid', methods=['GET'])
def paid():
    return jsonify(dashboard.total_paid())

@app.route('/dashboard/total-unpaid', methods=['GET'])
def unpaid():
    return jsonify(dashboard.total_unpaid())

@app.route('/dashboard/total-advanced', methods=['GET'])
def advanced():
    return jsonify(dashboard.total_advanced())

@app.route('/dashboard/room-data', methods=['GET'])
def room_data():
    return jsonify(dashboard.total_room())

@app.route('/dashboard/advanced-data', methods=['GET'])
def advanced_paid_data():
    return jsonify(dashboard.advanced_data())


#------------------BOARDERS------------------#
@app.route('/boarder')
def boarders_page():
    if 'user_id' in session:
        return render_template('boarder.html')
    return render_template('login.html')

@app.route('/boarder/add-boarder', methods=['POST'])
def add_boarder():
    return jsonify(boarder.add_boarder(**request.get_json()))

@app.route('/boarder/all-boarder', methods=['GET'])
def show_all_boarders():
    return jsonify(boarder.show_boarders())

@app.route('/boarder/remove-boarder', methods=['DELETE'])
def remove_boarder():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': "Unauthorized! You're not logged in! Please log in."})
    return jsonify(boarder.delete_boarder(request.args.get('boarder_id'), request.args.get('gender'), request.args.get('room_no')))

@app.route('/boarder/search-boarder', methods=['GET'])
def live_search_boarder():
    return jsonify(boarder.live_search(request.args.get('name')))

@app.route('/boarder/get-boarder/<int:id>', methods=['GET'])
def retrieve_boarder(id):
    return jsonify(boarder.get_boarder(id))

@app.route('/boarder/all-totals', methods=['GET'])
def get_totals():
    return jsonify(boarder.get_totals())

@app.route('/boarder/edit-boarder', methods=['POST'])
def edit_boarder():
    return jsonify(boarder.edit_boarder(**request.get_json()))

@app.route('/boarder/sort-boarder', methods=['GET'])
def sort_boarders():
    return jsonify(boarder.sort_boarders(request.args.get('type')))

@app.route('/boarder/get-avl-room', methods=['GET'])
def avl_room():
    return jsonify(boarder.get_avl_room(request.args.get('gender')))


#------------------PAYMENTS------------------#
@app.route('/payment')
def payments_page():
    if 'user_id' in session:
        return render_template('payment.html')
    return render_template('login.html')

@app.route('/payment/add-payment', methods=['POST'])
def add_payment():
    return jsonify(payment.add_payment(**request.get_json()))

@app.route('/payment/payment-existence', methods=['GET'])
def payment_existence():
    return jsonify(payment.check_payment_exists(request.args.get('boarder_id'), request.args.get('month'), request.args.get('year')))

@app.route('/payment/show-all-payments', methods=['GET'])
def show_all_payments():
    return jsonify(payment.show_payments(request.args.get('month'), request.args.get('year')))

@app.route('/payment/overall-income', methods=['GET'])
def payment_overall_income():
    return jsonify(payment.overall_income())

@app.route('/payment/monthly-income', methods=['GET'])
def payment_monthly_income():
    return jsonify(payment.month_income(request.args.get('types'), request.args.get('month'), request.args.get('year')))

@app.route('/payment/overall-unpaid', methods=['GET'])
def overall_unpaid():
    return jsonify(payment.unpaid_boarders(request.args.get('month'), request.args.get('year')))

@app.route('/payment/overall-paid', methods=['GET'])
def overall_paid():
    return jsonify(payment.paid_boarders(request.args.get('month'), request.args.get('year')))

@app.route('/payment/overall-advanced', methods=['GET'])
def overall_advanced():
    return jsonify(payment.overall_advanced(request.args.get('year')))

@app.route('/payment/all-paid', methods=['GET'])
def view_all_paid():
    return jsonify(payment.view_paid_payment_by_month(request.args.get('month'), request.args.get('year')))

@app.route('/payment/all-unpaid', methods=['GET'])
def view_all_unpaid():
    return jsonify(payment.view_unpaid_payment_by_month(request.args.get('month'), request.args.get('year')))

@app.route('/payment/search-all-paid', methods=['GET'])
def live_search_boarder_payment_advanced_paid():
    return jsonify(payment.live_search_payment_paid(request.args.get('name'), request.args.get('month'), request.args.get('year')))

@app.route('/payment/search-all-unpaid', methods=['GET'])
def live_search_boarder_payment_advanced_unpaid():
    return jsonify(payment.live_search_payment_unpaid(request.args.get('name'), request.args.get('month'), request.args.get('year')))


#------------------ROOMS------------------#
@app.route('/room')
def rooms_page():
    if 'user_id' in session:
        return render_template('room.html')
    return render_template('login.html')

@app.route('/room/add-room', methods=['POST'])
def add_room():
    return jsonify(rooms.add_room(**request.get_json()))

@app.route('/room/edit-room', methods=['POST'])
def edit_room():
    return jsonify(rooms.edit_room(**request.get_json()))

@app.route('/room/delete-room', methods=['DELETE'])
def delete_room():
    return jsonify(rooms.delete_room(request.args.get('room_id'), request.args.get('room'), request.args.get('gender')))

@app.route('/room/get-room-data', methods=['POST'])
def get_room_data():
    return jsonify(rooms.get_room_data(request.args.get('room_id')))

@app.route('/room/show-all-rooms', methods=['GET'])
def show_room():
    return jsonify(rooms.show_room())

@app.route('/room/all-totals', methods=['GET'])
def all_totals():
    return jsonify(rooms.room_total_data())

@app.route('/room/sort-room', methods=['GET'])
def sort_room():
    return jsonify(rooms.sort_room(request.args.get('type')))


#----------------- LOGOUT ---------------------#
@app.route('/logout', methods=['GET', 'POST'])
def logout():
    session.clear() # clear session when logout
    return render_template('login.html')


if __name__ == '__main__':
    app.run(debug=True)


