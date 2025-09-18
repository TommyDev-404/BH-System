
import { vars } from './variables.js'
import { displayRoomDataController } from './main.js'

export const helper = {
	
	/*-------------- TABLE ROW HELPER DISPLAYS -------------------*/
	createRow(data){
		const row = document.createElement('tr');
		row.dataset.id = data.id;
		row.dataset.room = data.roomNo;
		row.dataset.gender = data.gender;

		const tableData = {
			'room': data.roomNo,
			'gender': data.gender,
			'capacity': data.capacity,
			'available': data.available,
			'status': data.status
		};

		const keys = Object.keys(tableData);
		for (let i = 0; i < keys.length + 1; i++){
			const td = document.createElement('td');

			if (i === keys.length){
			const edit  = document.createElement('button');
			const del  = document.createElement('button');
			edit.className = 'edit-btn';
			edit.textContent = 'Edit';
			del.className = 'delete-btn';
			del.textContent = 'Delete';

			td.append(edit, del);
			}else{
			td.textContent = tableData[keys[i]];
			td.setAttribute('id', keys[i]);
			}
			row.appendChild(td);
		}
		vars.TABLE_BODY.appendChild(row);
	},

	removeAllRow(){
		const rows = document.querySelectorAll('table tbody tr');
		rows.forEach(row => {
			row.remove();
		});
	},

	createEmptyRoomMessage(text){ // FOR DISPLAYING DATA
		const tr = document.createElement('tr');
		const td = document.createElement('td');
		tr.className = 'empty-row';
		td.className = 'empty';
		td.colSpan = 6;
		td.textContent = text;
		tr.appendChild(td);
		vars.TABLE_BODY.appendChild(tr);
	},

	/*-------------- SUMMARY CARDS HELPER DISPLAYS -------------------*/
	setValue(data){
		vars.TOTAL_ROOM.textContent = data.total;
		vars.TOTAL_MALE.textContent = data.male;
		vars.TOTAL_FEMALE.textContent = data.female;
		vars.OCCUPIED_ROOM.textContent = data.occ_total;
		vars.OCCUPIED_MALE.textContent = data.occ_male;
		vars.OCCUPIED_FEMALE.textContent = data.occ_female;
		vars.AVL_ROOM.textContent = data.avl_total;
		vars.AVL_MALE.textContent = data.avl_male;
		vars.AVL_FEMALE.textContent = data.avl_female;
		vars.MAINTENANCE_ROOM.textContent = data.mtn_total;
		vars.MAINTENANCE_MALE.textContent = data.mtn_male;
		vars.MAINTENANCE_FEMALE.textContent = data.mtn_female;
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
			if (type === 'remove') displayRoomDataController();
			if (type === 'edit') (this.closeModalEditController(), displayRoomDataController());
			if (type === 'add') (this.closeModalAddController(), displayRoomDataController());
			messageBox.remove();
		});
	},
	
	closeModalEditController(){
		vars.EDIT_SUBMIT.reset();
		vars.EDIT_OVERLAY.classList.remove('active');
	},

	/*-------------- BUTTONS ACTIONS ADD -------------------*/
	openModalAddController(){
		vars.ADD_OVERLAY.classList.add('active');
		vars.SORT_ROOM.value = 'All';
		displayRoomDataController();
	},

	closeModalAddController(){
		vars.SUBMIT_ROOM.reset();
		vars.ADD_OVERLAY.classList.remove('active');
	},

	/*-------------- BUTTONS ACTIONS EDIT -------------------*/
	openModalEditController(data){
		vars.EDIT_OVERLAY.classList.add('active');
		vars.ROOM_ID.value = data.id;
		vars.ROOM_NO.value = data.roomNo;
		vars.ROOM_GENDER.value = data.gender;
		vars.ROOM_CAPACITY.value = data.capacity;
		vars.ROOM_AVL.value = data.available;
		vars.ROOM_STATUS.value = data.status;
	}
	
};