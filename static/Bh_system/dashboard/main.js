import { api } from './api.js'
import { vars } from './variable.js'
import { helper } from './helper.js';
import { showMessage } from '../logout.js';

// ===== for displaying logout message =====
window.logout = { showMessage };

/*------------ CONTROLLER -------------*/
function main(){ // call all the function and wrap it out in main function
    totalBoarder(); overallIncome(); monthIncome(); unpaidPaymentAmount(); totalPaid(); totalUnpaid();totalAdvanced(); setBhName();
    totalRoom(); advancedDataBoarders(); boardersData(); paidDataBoarders(); unpaidDataBoarders(); openData(); closeData();
}

async function setBhName(){
    const result = await api.getBhName();
    helper.setBhName(result.bh_name);
}

async function totalBoarder(){
    const result = await api.getTotalBoarder();
    result.success ? result.data.forEach(data => helper.setTotalBoarder(data)) : null;
}

async function overallIncome(){
    const result = await api.getOverallIncome();
    result.success ? vars.OVERALL_INCOME.textContent = '₱'+result.data.overall_income.toFixed(2) : null;
}

async function monthIncome(){
    const result = await api.getMonthIncome();
    result.success ? vars.MONTH_INCOME.textContent = '₱'+result.data.monthly_income.toFixed(2) : null;
}

async function unpaidPaymentAmount(){
    const result = await api.getUnpaidAmount();
    result.success ? vars.UNPAID_INCOME.textContent = '₱'+result.data.unpaid_payments.toFixed(2) : null;
}

async function totalPaid(){
    const result = await api.getTotalPaid();
    result.success ? helper.setTotalPaid(result.data) : null;
}

async function totalUnpaid(){
    const result = await api.getTotalUnpaid();
    result.success ? helper.setTotalUnpaid(result.data) : null;
}

async function totalAdvanced(){
    const result = await api.getTotalAdvanced();
    result.success ? helper.setTotalAdvanced(result.data) : alert('error');
}

async function totalRoom(){
    const result = await api.getTotalRoom();
    result.success ? result.data.forEach(data => helper.setValueRoom(data)) : helper.showMessage('failed to retrieve total room data!');
}

// ======== SHOWING BOARDER INFO'S =====
async function advancedDataBoarders(){
    const result = await api.getAdvancedData();
    result.success ? result.data.forEach(data => helper.createPaymentStatisticRow(data, 'advance')) : helper.createEmptyRow('advance', result.message);
}

async function paidDataBoarders(){
    const result = await api.getPaidData(new Date().getMonth() + 1, new Date().getFullYear());
    result.success ? result.data.forEach(data => helper.createPaymentStatisticRow(data, 'paid')) : helper.createEmptyRow('paid', result.status);
}

async function unpaidDataBoarders(){
    const result = await api.getUnpaidData(new Date().getMonth() + 1, new Date().getFullYear());
    result.success ? result.data.forEach(data => helper.createPaymentStatisticRow(data, 'unpaid')) : helper.createEmptyRow('unpaid', result.status);
}

async function boardersData(){
    const result = await api.getBoarderData();
    result.success ? result.data.forEach(data => helper.createBoarderDataRow(data)) : helper.createEmptyRow('boarder', result.message);
}

function openData(){
    document.addEventListener('click', (e) => {
        if (e.target.matches('button')){
            if (e.target.closest('#advBtn')) vars.ADV_OVERLAY.classList.add('active');
            if (e.target.closest('#paidBtn')) vars.PAID_OVERLAY.classList.add('active');
            if (e.target.closest('#unpaidBtn')) vars.UNPAID_OVERLAY.classList.add('active');
            if (e.target.closest('#boarderBtn')) vars.BOARDER_OVERLAY.classList.add('active');
        }
    });
}

function closeData(){
    document.addEventListener('click', (e) => {
        if (e.target.matches('span')){
            if (e.target.closest('#close-adv')) vars.ADV_OVERLAY.classList.remove('active');
            if (e.target.closest('#close-paid')) vars.PAID_OVERLAY.classList.remove('active');
            if (e.target.closest('#close-unpaid')) vars.UNPAID_OVERLAY.classList.remove('active');
            if (e.target.closest('#close-boarder')) vars.BOARDER_OVERLAY.classList.remove('active');
        }
    });
}


// ======= MAIN METHOD =====
main();









