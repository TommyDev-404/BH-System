/*============================ HANDLE API REQUEST =======================*/

export const api = {
    // BASE REQUEST
    async apiRequest(method, url, params = null, data = null){

        try{
            const config = {method, url};
            if (params) config.params = params;
            if (data) config.data = data;

            const response = await axios(config);
            const result = response.data;

            return result;
        }catch(error){
            return error;
        }
    },

	// ======== GET BH NAME ==========
	async getBhName(){
	    return this.apiRequest('get', '/bh_info/bh_name');
	},

    //========= CRUD OPERATION =============
    async addPayment(formData){
        console.log(formData);
        return this.apiRequest('post', '/payment/add-payment', null, formData);
    },

    async removePayment(payment_id){
        return this.apiRequest('post', `/payment/delete-payment/${payment_id}`);
    },

    async displayAllPayments(month, year){
        return this.apiRequest('get', '/payment/show-all-payments', { month : month, year : year });
    },

    // ============= INCOMES ===============
    async overallIncomes(){
        return this.apiRequest('get', '/payment/overall-income');
    },

    async monthlyIncomes(type, month, year){
        return this.apiRequest('get', '/payment/monthly-income', { types: type, month : month, year : year });
    },

    // ========== ALL PAID CURRENT/ADVANCED ==============
    async viewAllPaidMonth(month, year){
        return this.apiRequest('get', '/payment/all-paid', { month : month, year : year });
    },

    // ========== ALL UNPAID CURRENT/ADVANCED ==============
    async viewAllUnpaidMonth(month, year){
        return this.apiRequest('get', '/payment/all-unpaid', { month : month, year : year });
    },

    // ========== OVERALL PAID CURRENT/ADVANCED ==============
    async overallPaid(month, year){
        return this.apiRequest('get', '/payment/overall-paid', { month : month, year : year });
    },

    // ========== OVERALL UNPAID CURRENT/ADVANCED ==============
    async overallUnpaid(month, year){
        return this.apiRequest('get', '/payment/overall-unpaid', { month : month, year : year });
    },

    // ========== OVERALL ADVANCED PAYMENT ==============
    async overallAdvanced(year){
        return this.apiRequest('get', '/payment/overall-advanced', { year : year });
    },

    // ========== LIVE SEARCH PAID ==============
    async searchAllPaidPayment(name, month, year){
        console.log(name);
        return this.apiRequest('get', '/payment/search-all-paid', { name : name, month : month, year : year });
    },

    // ========== LIVE SEARCH UNPAID ==============
    async searchAllUnpaidPayment(name, month, year){
        console.log(name);
        return this.apiRequest('get', '/payment/search-all-unpaid', { name : name, month : month, year : year });
    },

    // ============= LIVE SEARCH BOARDER NAME ==========
    async searchBoarder(name){
        return this.apiRequest('get', '/boarder/search-boarder', { name : name });
    }

};
