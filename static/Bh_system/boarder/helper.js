/*-------------- HELPER FUNCTIONS --------------*/
import { vars} from "./variable.js";
import { displayData, avlRoom } from './main.js';

export const helper = {

    	// GET BOARDER INFO FOR EDIT
	fillEditFormLogic(result){
		// FORMAT NAME
		let name = result.data.name; // get the full name
		let parts = name.trim().split('.'); // separate them based on the (.) ex. Rustom Gwapo P. Galicia
		let first_part = parts[0].trim().split(' '); // Rustom gwapo P.
		let lastname = parts[1].trim(); // Galicia
		let middle = first_part[first_part.length - 1].trim().replace('.', ' '); // get the middle initial
		let firstname = '';

		if(first_part.length > 2){ // if the name is more than 1
			for (let i = 0; i < first_part.length - 1; i++){
			firstname += first_part[i]+' '; // append the each name forming a new name
			}
		}else{
			firstname = first_part[0];
		}

		// FORMAT DATE
		const date = new Date(result.data.dateRented);
		const formattedDate = date.toISOString().split('T')[0]; // "YYYY-MM-DD"

		// PUT THE DATA ON THE INPUT
		document.getElementById('editId').value = result.data.boarder_id;
		document.getElementById('editGender').value = result.data.gender;
		document.getElementById('prevroom').value = result.data.roomNo; // store room as prev room
		document.getElementById('prevgender').value = result.data.gender; // store gender
		avlRoom('edit', result.data.gender, result.data.roomNo); // retrieve room with the available room
		document.getElementById('editFirstName').value = firstname;
		document.getElementById('editLastName').value = lastname;
		document.getElementById('editMiddleInitial').value = middle;
		document.getElementById('editPhone').value = result.data.phone;
		document.getElementById('editAddress').value = result.data.address;
		document.getElementById('editDateRented').value = formattedDate;

		vars.EDIT_OVERLAY.classList.add('active'); // open the edit modal with all filled data
	},
	
	// for displaying boarder
	renderRows(row){
		this.emptyTheTable(); 
		row.forEach(data => this.createRow(data) ); // create row
	},

	// for deleting the boarder
	removeRows(status){
		this.emptyTheTable();
		this.createEmptyRow(status); // after removing the boarder if no row , it will display and empty row
	},

	// remove all the boarder data that created
	emptyTheTable(){
		// REMOVE THE EXISTING ROW DATA
		const row = document.querySelectorAll('table tbody tr'); // get all row
		row.forEach(r =>  r.remove()); // loop to all row and remove them all
	},

	// create the row data 
	createRow(data){
		const date = new Date(data.dateRented);
		const options = {month: 'long', day: 'numeric', year: 'numeric'} //format style
		const formattedDate = date.toLocaleDateString('en-US', options); //format date
		const row = document.createElement('tr');
		row.dataset.id = data.boarder_id;
		row.dataset.room = data.roomNo;
		row.dataset.gender = data.gender;

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

			if (i == keys.length){ // ADD ACTION BUTTON
				const editBtn = document.createElement('button');
				const deleteBtn = document.createElement('button');
				editBtn.className = 'edit-btn';
				editBtn.textContent = 'Edit';
				deleteBtn.className = 'delete-btn';
				deleteBtn.textContent = 'Delete';
				td.append(editBtn, deleteBtn);
			}else{
				td.textContent = tableData[keys[i]];
				td.setAttribute('id', keys[i]);
			}
			row.appendChild(td);
		}
		vars.TABLE_BODY.appendChild(row);
	},

	// create an empty row
	createEmptyRow(type){
		const row = document.createElement('tr');
		row.className = 'empty-row';
		const td = document.createElement('td');
		td.colSpan = 7;

		if (type === 'not found'){
			td.className = 'not-found';
			td.textContent = 'Not found.';
			row.appendChild(td);
		}else{
			td.className = 'empty';
			td.textContent = 'No boarders.';
			row.appendChild(td);
		}
		vars.TABLE_BODY.appendChild(row);
	},

	// remove the empty row
	removeEmptyRow(){
		const empRow = document.querySelector('.empty-row');
		if (empRow) empRow.remove();
	},


	createComboBox(data, emptyText, type){
		const option = document.createElement('option');
		option.setAttribute('id', 'roomAvailable');

		if (type === 'add'){
			option.value = data != null ? data.roomNo : emptyText;
			option.textContent = data != null ? data.roomNo : emptyText;
			vars.ROOM_NO.appendChild(option);
		}else{
			option.value = data.roomNo;
			option.textContent = data.roomNo;
			vars.EDIT_ROOM_NO.appendChild(option);
		}
	},

	removeComboBox(type){
		if (type === 'add'){
			const option = document.querySelectorAll('#roomNo option[id="roomAvailable"]');
			option.forEach(op => op.remove());
		}else{
			const option = document.querySelectorAll('#editRoomNo option[id="roomAvailable"]');
			option.forEach(op => op.remove());
		}
	},

	formatForm(e){
		const data = new FormData(e.target);
		const form = Object.fromEntries(data.entries());
		return form;
	},

	setBoarderTotal(data){
		vars.TOTAL_BOARDERS.textContent = data.all_boarders;
		vars.TOTAL_MEN.textContent = data.male;
		vars.TOTAL_WOMEN.textContent = data.female;
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
			if (type === 'remove') (this.emptyTheTable(), displayData());
			if (type === 'edit') (this.closeEditModal(), displayData());
			if (type === 'add'){
				this.removeEmptyRow(); // remove the empty message row if there is
				this.closeAddBoarderForm();
				displayData();
			}
			messageBox.remove();
		});
	},

	/*-------------- CLOSE EDIT MODAL ----------------- */
	closeEditModal(){
		vars.EDIT_FORM.reset(); // RESET THE EDIT FORM
		vars.EDIT_OVERLAY.classList.remove('active');
	},
	
	/*=========== CLOSE AND OPEN ADD MODAL ==========*/
	openAddBoarderForm(){ 
		vars.SEARCH_BAR.value = '';  // clear the search bar input when add boarder btn is click
		vars.COMBO_BOX.value = 'roomNo'; // reset the combobox into the default value
		displayData(); // reset the data on table
		avlRoom('add'); // reset the rooms available combobox
		vars.ADD_OVERLAY.classList.add('active');
	},
	
	closeAddBoarderForm(){ 
		vars.ADD_FORM.reset();  
		vars.ADD_OVERLAY.classList.remove('active'); 
	}
	
};
