
import { vars } from './variables.js'
import { api } from './api.js'
import { helper } from './helper.js'
import { showMessage } from '../logout.js';

// ===== for displaying logout message =====
window.logout = { showMessage };


/*------------------- DOM CONTROLLER FUNCTIONS --------------------*/
function _init_main(){
	displayRoomDataController();
	eventDelegationSubmit();
	eventDelegationOpenClose();
}

function eventDelegationSubmit(){
	document.addEventListener('submit', (e) => {
		if (e.target.matches('form')){ // submitting forms
			if (e.target.closest('#editForm')) editRoomController(e);
			if (e.target.closest('#roomForm')) addRoomController(e);
		}
	});
}

function eventDelegationOpenClose(){
	document.addEventListener('click', (e) => {
		// open actions with edit and delete
		if  (e.target.matches('button')){
			if (e.target.matches('.edit-btn')) getEditRoomDataController(e.target.closest('tr').dataset.id);
			if (e.target.closest('#addRoomBtn')) helper.openModalAddController();
			if (e.target.matches('.delete-btn')) deleteRoomController(e.target.closest('tr').dataset.id, e.target.closest('tr').dataset.room, e.target.closest('tr').dataset.gender);
		}
		// close actions
		if (e.target.matches('span')){
			if (e.target.closest('#closeRoomBtn')) helper.closeModalAddController();
			if (e.target.closest('#editCloseBtn')) helper.closeModalEditController();
		}
	});
}

export async function displayRoomDataController(){
	const result = await api.showRoom();
	helper.removeAllRow();
	if (result.success){
		vars.SORT_ROOM.value = 'All';
		result.data.forEach(data => helper.createRow(data));
	}else{
		helper.createEmptyRoomMessage(result.message);
	}
	setBhName();
	summaryCardsController();
	vars.SORT_ROOM.addEventListener('change', (e) => sortRoomController(e.target.value)); // sorting
}

async function setBhName(){
	const result = await api.getBhName();
	vars.BH_NAME.textContent = "🏠 " + result.bh_name + " BH System";
}

async function deleteRoomController(room_id, roomNo, gender){
	const result = await api.deleteRoom(room_id, roomNo, gender);
	result.success ? helper.showMessage(result.message, 'remove') : helper.showMessage(result.message);
}

async function sortRoomController(type){
	const result = await api.sortRoom(type);
	helper.removeAllRow();
	result.success ? result.data.forEach(data => helper.createRow(data)) : helper.createEmptyRoomMessage(result.message);
}

async function summaryCardsController(){
	const result = await api.summaryCardTotal();
	result.success ? result.data.forEach(data => helper.setValue(data)) : helper.showMessage('Failed to retrieve');
}

async function addRoomController(e){
	e.preventDefault();
	const result = await api.addRoom(Object.fromEntries(new FormData(e.target).entries()));
	result.success ? helper.showMessage(result.message, 'add') : helper.showMessage('Failed to add.');
}

async function getEditRoomDataController(room_id){
	const result = await api.getEditRoomData(room_id);
	result.success ? helper.openModalEditController(result.data) : helper.showMessage('Failed to retrieve');
}

async function editRoomController(e){
	e.preventDefault();
	const result = await api.editRoom(Object.fromEntries(new FormData(e.target).entries()));
	result.success ? helper.showMessage(result.message, 'edit') : helper.showMessage('Failed to add.');
}


/*------------------- MAIN METHOD --------------------*/
_init_main();