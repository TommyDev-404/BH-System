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

    // ========== BOARDER INFO'S ==========
    async getAdvancedData(){
        return this.apiRequest('get', '/dashboard/advanced-data');
    }, 

    async getPaidData(month, year){
        return this.apiRequest('get', '/payment/all-paid', {month : month, year : year});
    },

    async getUnpaidData(month, year){
        return this.apiRequest('get', '/payment/all-unpaid', {month : month, year : year});
    },
    
    // ======= TOTALS ====
    async getTotalBoarder(){
        return this.apiRequest('get', '/dashboard/total-boarders');
    }, 
    
    async getBoarderData(){
        return this.apiRequest('get', '/boarder/all-boarder');
    }, 

    async getOverallIncome(){
        return this.apiRequest('get', '/dashboard/overall-income');
    }, 

    async getMonthIncome(){
        return this.apiRequest('get', '/dashboard/month-income');
    }, 

    async getUnpaidAmount(){
        return this.apiRequest('get', '/dashboard/unpaid-amount');
    }, 
    
    async getTotalPaid(){
        return this.apiRequest('get', '/dashboard/total-paid');
    }, 
    
    async getTotalUnpaid(){
        return this.apiRequest('get', '/dashboard/total-unpaid');
    }, 
    
    async getTotalPaid(){
        return this.apiRequest('get', '/dashboard/total-paid');
    }, 
    
    async getTotalRoom(){
        return this.apiRequest('get', '/dashboard/room-data');
    }, 
    
    async getTotalAdvanced(){
        return this.apiRequest('get', '/dashboard/total-advanced');
    }
    
};
