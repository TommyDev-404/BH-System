import { vars } from './variable.js'

export const helper = {

    createPaymentStatisticRow(data, type){
        const row = document.createElement('tr');

        const tableData = {
            'room': data.roomNo,
             'name': data.name,
            'gender': data.gender
        };

        if (type === 'advance') tableData.month = data.month; // append month if its view advance data
    
        const keys = Object.keys(tableData); // turn the tableData into object/dictionary
        for (let i = 0; i < keys.length + 1; i++){
            const td = document.createElement('td');
            td.textContent = tableData[keys[i]];
            row.appendChild(td);
        }

        if (type === 'advance') vars.TBODY_ADV.appendChild(row); // append on advance data table
        if (type === 'paid') vars.TBODY_PAID.appendChild(row); // append on paid data table
        if (type === 'unpaid') vars.TBODY_UNPAID.appendChild(row); // append on unpaid data table
    },

    createBoarderDataRow(data){
        const date = new Date(data.dateRented);
        const formattedDate = date.toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'}); //format date
        const row = document.createElement('tr');
      
        const tableData = {
            'room': data.roomNo,
            'name': data.name,
            'gender': data.gender,
            'phone': data.phone,
            'address': data.address,
            'date': formattedDate,
        };

        const keys = Object.keys(tableData); // turn the tableData into object/dictionary

        for (let i = 0; i < keys.length + 1; i++){
            const td = document.createElement('td');
            td.textContent = tableData[keys[i]];
            row.appendChild(td);
        }
        vars.TBODY_BOARDER.appendChild(row);
    },

    setTotalBoarder(data){
        vars.TOTAL_BOARDERS.textContent = data.all_boarders;
        vars.BOARDERS_MALE.textContent = data.male;
        vars.BOARDERS_FEMALE.textContent = data.female;
    },

    removeDataRow(){
        const row = document.querySelector('.boarder-overlay table tbody tr');
        row.forEach(data => data.remove());
    },

    createEmptyRow(type, message){
        const row = document.createElement('tr');
        row.className = 'empty-row';
        const td = document.createElement('td');
        td.colSpan = type === 'boarder' ? 6 : type === 'advance' ? 4 : 3;
        td.className = 'empty';
        td.textContent = message;
        row.appendChild(td);
        
        if (type === 'advance') vars.TBODY_ADV.appendChild(row); // append on advance data table
        if (type === 'paid') vars.TBODY_PAID.appendChild(row); // append on paid data table
        if (type === 'unpaid') vars.TBODY_UNPAID.appendChild(row); // append on unpaid data table
        if (type === 'boarder') vars.TBODY_BOARDER.appendChild(row); // append on unpaid data table
    },

    showMessage(message) {
        // Remove previous message
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
            messageBox.remove();
        });
    },

    setTotalPaid(data){
        vars.PAID.textContent = data.total;
        vars.PAID_MALE.textContent = data.male;
        vars.PAID_FEMALE.textContent = data.female;
    },

    setTotalUnpaid(data){
        vars.UNPAID.textContent = data.total;
        vars.UNPAID_MALE.textContent = data.male;
        vars.UNPAID_FEMALE.textContent = data.female;
    },

    setTotalAdvanced(data){
        vars.ADVANCE.textContent = data.total;
        vars.ADV_MALE.textContent = data.male;
        vars.ADV_FEMALE.textContent = data.female;
    },

    setValueRoom(data){
            vars.TOTAL_ROOMS.textContent = data.total;
            vars.ROOM_MALE.textContent = data.male;
            vars.ROOM_FEMALE.textContent = data.female;
            vars.OCC_ROOM.textContent = data.occ_total;
            vars.OCC_MALE.textContent = data.occ_male;
            vars.OCC_FEMALE.textContent = data.occ_female;
            vars.AVL_ROOM.textContent = data.avl_total;
            vars.AVL_MALE.textContent = data.avl_male;
            vars.AVL_FEMALE.textContent = data.avl_female;
            vars.MTN_ROOM.textContent = data.mtn_total;
            vars.MTN_MALE.textContent = data.mtn_male;
            vars.MTN_FEMALE.textContent = data.mtn_female;
        },

        setBhName(bh_name){
            vars.BH_NAME.textContent = "🏠 " + bh_name + " BH System";
        }

};