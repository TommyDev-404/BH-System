/*------------- THIS IS THE MAIN FILE ------------*/
import { vars } from './variable.js'
import { helper } from './helper.js';
import { api } from './api.js'
import { showMessage } from '../logout.js';

// == for displaying
window.logout = { showMessage };

// ====================================  CONTROLLERS ================================ //
function main(){
      // DISPLAY BOARDER DATA ALONG WITH THE SUMMARY CARD TOTAL
      displayData();
      // LIVE SEARCH event
      vars.SEARCH_BAR.addEventListener('input', (e) => live_search(e.target.value));
      // FORM EVENT DELEGATION
      document.addEventListener('submit', (e) => {
            if (e.target.matches('form')){
                  if (e.target.closest('#addBoarderForm')) addBoarderInfo(e); // submit boarder info
                  if (e.target.closest('#editForm')) submitEditForm(e); // submit edit form
            }
      });
      // SELECT EVENT DELEGATION
      document.addEventListener('change', (e) => {
            if (e.target.matches('select')){
                  if (e.target.closest('#gender')) avlRoom('add', e.target.value); // get the available room based on gender on add part
                  if (e.target.closest('#editGender')) avlRoom('edit', e.target.value); // get the available room based on gender on edit part
                  if (e.target.closest('#sortBoarder')) sortBoarder(e.target.value); // sort boarders
            }
      });
      // EVENT DELEGATION FOR BUTTON ACTIONS
      document.addEventListener('click', (e) => {
            // buttons
            if (e.target.matches('button')){
                  if (e.target.closest('.edit-btn')) getBoarderInfo(e.target.closest('tr').dataset.id); // open edit and fill the form
                  if (e.target.closest('.delete-btn')) removeBoarders(e.target.closest('tr').dataset.id, e.target.closest('tr').dataset.gender, e.target.closest('tr').dataset.room); // remove boarder
                  if (e.target.closest('#addBtn')) helper.openAddBoarderForm(); // open add boarder modal
            }
            // span
            if (e.target.matches('span')){
                  if (e.target.closest('#closeEditBtn')) helper.closeEditModal();   // close edit form
                  if (e.target.closest('#closeBtn')) helper.closeAddBoarderForm(); // close add boarder modal
            }
      });
      // automatic capitalize
      document.addEventListener('input', (e) => {
            if (e.target.matches('input')){
                  let input_words = e.target.value.split(' ');
                  let words = input_words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
                  e.target.value = words.join(' ');
            }
      });
}

// ======== GET AVAILABLE ROOM ========== 
export async function avlRoom(type, gender=null, room=null){
      helper.removeComboBox(type); // remove all option tag 
      const result = await api.avlRooms(gender); // get the available room data

      if (type === 'add'){ // create the combobox for add boarder
            if (!['Male', 'Female'].includes(gender)){
                  helper.createComboBox(null, 'Select Room', type); // create an option tag of "Select Room"
            }else{
                  result.success ?  result.data.forEach(data => helper.createComboBox(data, null, type)) : helper.showMessage(result.message);
            }
      }else{ // for edit payment combobox
            if (result.success){
                  result.data.forEach(data => helper.createComboBox(data, null, type));
                  document.querySelector(`#editRoomNo option[value='${room}']`).selected = true;
            }else{
                  helper.showMessage(result.message);
            }
      }
}

// ===== BOARDER DISPLAYS =====
export async function displayData(){
      showBoarderTotals();
      setBhName();
      const result = await api.showAllBoarder();
      result.success ? helper.renderRows(result.data) : (helper.removeEmptyRow(), helper.createEmptyRow('empty'));
}

async function setBhName(){
      const result = await api.getBhName();
      vars.BH_NAME.textContent = "🏠 " + result.bh_name + " BH System";
}

async function live_search(name){
      const result = await api.liveSearchBoarderNames(name);
      result.success ? helper.renderRows(result.data) : helper.removeRows(result.status);
}

// ===== SORT BOARDER ======
async function sortBoarder(sortType){
      const result = await api.sortBoarders(sortType);
      result.success ? helper.renderRows(await result.data) : displayData();
}

// ====== TOTALS ======
async function showBoarderTotals(){
      const result = await api.showBoarderTotalsAndClassification();
      result.success ? result.data.forEach(data => helper.setBoarderTotal(data)) : helper.showMessage('Error fetching total data!');
}

// ====== BOARDER CRUD ======
async function addBoarderInfo(e){
      e.preventDefault();
      const result = await api.addBoarder(helper.formatForm(e)); // result of the request
      result.success ? helper.showMessage(result.message, 'add') :  helper.showMessage(result.message);
}

async function removeBoarders(boarder_id, gender, room_no){
      const result = await api.removeBoarder(boarder_id, gender, room_no);
      result.success ? helper.showMessage(result.message, 'remove') : helper.showMessage(result.message);
}

async function submitEditForm(e){
      e.preventDefault(); // this keep you control where to send the request and avoid request abort
      const result = await api.editBoarderInfo(helper.formatForm(e));
      result.success ? helper.showMessage(result.message, 'edit') : helper.showMessage(result.message);
}

async function getBoarderInfo(boarder_id){
      const result = await api.getBoarderInfos(boarder_id);
      result.success ? helper.fillEditFormLogic(result) : helper.showMessage(result.message);
}


// ======== MAIN METHOD ========
main();

