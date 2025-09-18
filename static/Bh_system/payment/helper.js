
import { vars } from './variables.js'
import { displayPaymentController } from './main.js';

export const helper = {

    /*-------------- TABLE ROW HELPER DISPLAYS -------------------*/
    createRow(data, type){
        const payment_date = new Date(data.date); // get the date based on type if current or advanced
        const options = {month: 'long', day: 'numeric', year: 'numeric'} //format style
        const formattedPaymentDate = payment_date.toLocaleDateString('en-US', options); //format date

        const next_payment = new Date(data.next_payment);
        const formattedNextPayment = next_payment.toLocaleDateString('en-US', options); //format date
        const row = document.createElement('tr');
        row.dataset.id = data.payment_id;
        row.dataset.boarder_id = data.boarder_id;

        const tableData = {
            'room': data.roomNo,
            'name': data.name,
            'gender': data.gender,
            'amount': type === 'unpaidAdvance' || type === 'unpaidCurrent' ? "₱0.0" : "₱"+data.amount.toFixed(2),
            'status': data.payment_status,
            'month' : type === 'unpaidAdvance' || type === 'unpaidCurrent' ? data.new_month : data.month,
            'date': type === 'unpaidAdvance' ||  type === 'unpaidCurrent' ? 'None' : formattedPaymentDate,
            'nextPayment': type === 'unpaidAdvance' ||  type === 'unpaidCurrent' ? 'None' : formattedNextPayment
        };

        const keys = Object.keys(tableData);
        for (let i = 0; i < keys.length + 1; i++){
            const td = document.createElement('td');
            td.textContent = tableData[keys[i]];
            td.setAttribute('id', keys[i]);

            row.appendChild(td);
        }
        vars.TABLE_BODY.appendChild(row);
    },

    removeAllRow(){
        const rows = document.querySelectorAll('table tbody tr');
        rows.forEach(row =>  row.remove());
    },

    createEmptyPaymentMessage(text){ // FOR DISPLAYING DATA
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        tr.className = 'empty-row';
        td.className = 'empty';
        td.colSpan = 9;
        td.textContent = text;
        tr.appendChild(td);
        vars.TABLE_BODY.appendChild(tr);
    },

    /*-------------- LIVE SEARCH HELPER DISPLAYS------------*/
    createBoarderNameResult(text, bid, gender){ // FOR DISPLAYING FULLNAME
        const content = document.createElement('p');
        content.textContent = text;
        content.className = ['Not found.','No boarder yet.'].includes(text) ? 'empty-list' : 'list-item';
        content.dataset.boarder_id = bid;
        content.dataset.gender = gender;
        vars.BOARDER_NAMES.appendChild(content);
    },

    removeFullnameResult(){ // FOR DISPLAYING FULLNAME
        const remove = document.querySelectorAll('.list-item');
        const remove2 = document.querySelectorAll('.empty-list');
        remove.forEach(row => row.remove()); // for the name result
        remove2.forEach(row => row.remove()); // for not found
    },

    /*-------------- AUTOMATIC NAME INPUTTER HELPER --------------*/
    inputName(e, name){
        if (e.target.matches('.list-item')){
            if (['No name found.', 'No boarder yet.'].includes(name)) return ;
            vars.PAYMENT_SEARCH_BAR.value = e.target.textContent; // PUT THE NAME ON THE NAME BAR
            vars.BOARDER_ID.value = e.target.dataset.boarder_id; // RETRIEVE THE BOARDER ID OF THE NAME SELECTED
            vars.GENDER_INPUT.value = e.target.dataset.gender; // ALSO THE GENDER
            this.removeFullnameResult(); // REMOVE ALL THE RESULT
        }
    },

    /*-------------- SELECT PAYMENT TYPE HELPER--------------*/
    selectPaymentType(e){
        e.target.value === 'advance' ? vars.ADVANCED_PAYMENT_FORM.classList.add('active') : vars.ADVANCED_PAYMENT_FORM.classList.remove('active'); // TERNARY OPERATOR SAME LIKE IF-ELSE
    },

    /*-------------- SELECT MONTH TO ADVANCED HELPER--------------*/
    selectMonthAdvanced(e){
        e.preventDefault();
        if (e.target.textContent === 'Select Month'){
            vars.COMBOBOX.classList.add('active');
            e.target.textContent = 'Close month';
        }else{
            vars.COMBOBOX.classList.remove('active');
            e.target.textContent = 'Select Month';
        }
    },

    /*-------------- GET THE MONTH AND THE YEAR FROM ADVANCED --------------*/
    getMonthsAndYearAdvanced(){
        const year = document.querySelector('#yearAdvance');
        const checkbox = document.querySelectorAll('input[type="checkbox"]:checked'); // ALSO DYNAMIC
        const months = Array.from(checkbox).map(cb => cb.value);// GET THE MONTHS THAT CHECKED
        return {'year':year.value, 'month':months}; // CREATE OBJECT AND APPEND IT THE FORM
    },

    showMessage(message, type) {
            // Remove previous message
            console.log(message);
            const oldMsg = document.getElementById('message-box');
            if (oldMsg) oldMsg.remove();
        
            // Create message container
            const messageBox = document.createElement('div');
            messageBox.className = 'message-box';
        
            // Add content
            const label = document.createElement('label');
            label.textContent = message;
            const br = document.createElement('br');
            const closeBtn = document.createElement('button');
            closeBtn.textContent = 'Okay';
            closeBtn.className = 'close-message';
        
            messageBox.append(label, br, closeBtn);
            document.body.append(messageBox); // append on html body
        
            // Close on click
            closeBtn.addEventListener('click', () => {
                if (type === 'remove') displayPaymentController(vars.MONTH.value, vars.YEAR.value);
                if (type === 'edit') (this.closeModalEditController(), displayPaymentController(vars.MONTH.value, vars.YEAR.value));
                if (type === 'add') (this.closeAddPaymentController(), displayPaymentController(vars.MONTH.value, vars.YEAR.value));
                messageBox.remove();
            });
    },

    //=============== OPEN PAYMENT MODAL ================
    openAddPaymentController(){
        vars.OVERLAY.classList.add('active');
        vars.PAYMENT_STATUS.value = 'paid'; // set to paid the status view
        vars.MONTH.value = new Date().getMonth() + 1; // reset to default/current month
        vars.YEAR.value = new Date().getFullYear();
        vars.SEARCH_BAR.value = ''; // empty the search bar
        displayPaymentController(vars.MONTH.value, vars.YEAR.value); // show to default data based on current month
    },

    //=============== CLOSE PAYMENT MODAL ================
    closeAddPaymentController(){
        vars.OVERLAY.classList.remove('active');
        vars.SUBMIT_PAYMENT_FORM.reset(); // reset the form
        vars.PAYMENT_TYPE.value = 'normal'; // reset the payment type combobox
        vars.ADVANCED_PAYMENT_FORM.classList.remove('active'); // close the advanced form extension
        this.removeFullnameResult();
    },


};
