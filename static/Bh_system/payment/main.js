import { api } from './api.js'
import { helper } from './helper.js'
import { vars } from './variables.js'
import { showMessage } from '../logout.js';

// ===== for displaying logout message =====
window.logout = { showMessage };


/*-------------------------- DOM CONTROLLERS FUNCTIONS ---------------------------------*/
function _init_main_(){
	/*--------------------------- EVENT LISTENERS ----------------------------*/
	// DISPLAY PAYMENTS
	displayPaymentController(vars.MONTH.value, vars.YEAR.value);
	// DIRECT EVENTS
	vars.SUBMIT_PAYMENT_FORM.addEventListener('submit', (e) => addPaymentController(e, vars.MONTH.value, vars.YEAR.value, vars.PAYMENT_TYPE.value));// submit payment
	// ALL SELECT OR COMBOBOX EVENTS
	document.addEventListener('change', (e) => {
		if (e.target.matches('select')){
			if (e.target.closest('#sortStatus') || e.target.closest('#month') || e.target.closest('#year')) paymentStatusDataWithMonthController(vars.PAYMENT_STATUS.value, vars.MONTH.value, vars.YEAR.value);  // this control all the dropdown/select tag
			if (e.target.closest('#paymentType')) helper.selectPaymentType(e);
		}
	});
	// ALL INPUT FIELD
	document.addEventListener('keyup', (e) => {
		if (e.target.matches('#searchInput')) searchPaymentController(vars.PAYMENT_STATUS.value, e.target.value, vars.MONTH.value, vars.YEAR.value); // event listener for live search payment
		if (e.target.matches('#name')) searchBoarderNameController(e.target.value);
	});
	// ALL CLICK ACTION
	document.addEventListener('click', (e) => {
		if (e.target.matches('.list-item')) helper.inputName(e, e.target.textContent); // input automatically name when clicked
		if (e.target.matches('.months') || e.target.matches('.monthBtn')) helper.selectMonthAdvanced(e); // toggle change name on a button from "Select Month" to "Close Month" , div + label elem
		if (e.target.matches('#addBtn'))  helper.openAddPaymentController(); // open add payment modal, button elem
		if (e.target.matches('#closeBtn'))  helper.closeAddPaymentController(); // close add payment modal, span elem
	});
      // automatic capitalize
      document.addEventListener('input', (e) => {
            if (e.target.matches('input')){
                  let input_words = e.target.value.split(' '); // get the first letter of every input
                  let words = input_words.map(word => word.charAt(0).toUpperCase() + word.slice(1)); // capitalize the first letter upon input
                  e.target.value = words.join(' '); // show the capitalize word
            }
      });
}

// =========== DISPLAY PAYMENTS ===========
export async function displayPaymentController(month, year){
	summaryCardDatasController(month, year); // display all the data in summary cards
	setBhName();
	const result = await api.displayAllPayments(month, year); // request
	result.success ? (helper.removeAllRow(), result.data.forEach(p => helper.createRow(p, null))) : (helper.removeAllRow(), helper.createEmptyPaymentMessage(result.status));
}

// ======= SET BH SYSTEM NAME =========
async function setBhName(){
	const result = await api.getBhName();
	vars.BH_NAME.textContent = "🏠 " + result.bh_name + " BH System";
}

// =========== VIEW THE PAYMENTS BASED ON STATUS PAID/UNPAID WITH MONTH ==========
async function paymentStatusDataWithMonthController(status, month, year){
	summaryCardDatasController(month, year); // dynamic data change on summary cards when month is changed
	if (status === 'unpaid'){ // if want to view unpaid
		const result = await api.viewAllUnpaidMonth(month, year); // all unpaid data advanced/current
		helper.removeAllRow();
		result.success ? result.data.forEach(data => helper.createRow(data, result.type)) : helper.createEmptyPaymentMessage(result.status);
	}else{
		const result = await api.viewAllPaidMonth(month, year); // all unpaid data advanced/current
		helper.removeAllRow();
		result.success ? result.data.forEach(data => helper.createRow(data, result.type)) : helper.createEmptyPaymentMessage(result.status);
	}
}

// ============== ADD PAYMENT =============
async function addPaymentController(e, month, year, type){
	e.preventDefault();
	const form = new FormData(e.target);
	const obj = helper.getMonthsAndYearAdvanced();
	if (type === 'advance') for (const key in obj ) form.append(key, obj[key]);

	const result = await api.addPayment(Object.fromEntries(form.entries()));
	if (result.success){
		helper.showMessage(result.message, 'add');
	}else{
		helper.showMessage(result.message);
		vars.SUBMIT_PAYMENT_FORM.reset(); // reset form when payment
		helper.removeFullnameResult();
		type === 'advance' ? vars.PAYMENT_TYPE.value = 'advance' : vars.PAYMENT_TYPE.value = 'normal'; // if already paid, prevent resetting the payment type based on what user choose at first
	}
}

// =========== SUMMARY CARD'S DATA'S ========
async function summaryCardDatasController(month, year){
	const resultPaid = await api.overallPaid(month, year); // all paid
	const resultUnpaid = await api.overallUnpaid(month, year); // all unpaid
	const resultOverallIncome = await api.overallIncomes(); // overall income
	const resultMonthlyIncome = await api.monthlyIncomes(month <= new Date().getMonth() + 1 ? 'normal' : 'advanced', month, year); // monthly income
	const resultOverallAdvanced = await api.overallAdvanced(year);
	// put the data on the summary cards
	if (resultPaid.success) (vars.TOTAL_PAID.textContent = resultPaid.data.total, vars.TOTAL_MALE.textContent = resultPaid.data.male, vars.TOTAL_FEMALE.textContent = resultPaid.data.female);
	if (resultUnpaid.success) (vars.TOTAL_UNPAID.textContent = resultUnpaid.data.total, vars.TOTAL_UNPAID_MALE.textContent = resultUnpaid.data.male, vars.TOTAL_UNPAID_FEMALE.textContent = resultUnpaid.data.female);
	if (resultOverallIncome.success) vars.OVERALL_INCOME.textContent = "₱"+resultOverallIncome.data.overall_income.toFixed(2); // overall income
	if (resultMonthlyIncome.success) vars.MONTH_INCOME.textContent = "₱"+resultMonthlyIncome.data.monthly_income.toFixed(2); // monthly income
	if (resultOverallAdvanced.success) (vars.TOTAL_ADVANCED.textContent = resultOverallAdvanced.data.total, vars.TOTAL_ADVANCED_MALE.textContent = resultOverallAdvanced.data.male, vars.TOTAL_ADVANCED_FEMALE.textContent = resultOverallAdvanced.data.female);
}

// =========== LIVE SEARCH BOARDER NAME ===============
async function searchBoarderNameController(name){
	helper.removeFullnameResult();
	if (vars.PAYMENT_SEARCH_BAR.value === ''){
		vars.GENDER_INPUT.value = '';
	}else{
		const result = await api.searchBoarder(name);
		result.success ? result.data.forEach(p => helper.createBoarderNameResult(p.name, p.boarder_id, p.gender)) : helper.createBoarderNameResult(result.status === 'not found' ? 'No name found.' : 'No boarder yet.', null, null);
	}
}

// =========== LIVE SEARCH PAYMENTS PAID/UNPAID ADVANCED/CURRENT WITH MONTH AND YEAR ===============
async function searchPaymentController(type, name, month, year){
	if (type === 'unpaid'){
		const result = await api.searchAllUnpaidPayment(name, month, year);
		helper.removeAllRow();
		result.success ? result.data.forEach(data => helper.createRow(data, result.type)) : helper.createEmptyPaymentMessage(result.status);
	}else{
		const result = await api.searchAllPaidPayment(name, month, year);
		helper.removeAllRow();
		result.success ? result.data.forEach(data => helper.createRow(data, result.type)) : helper.createEmptyPaymentMessage(result.status);
	}
}


/*-------- MAIN METHOD ------*/
_init_main_();

