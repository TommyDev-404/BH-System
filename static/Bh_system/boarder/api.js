/*----------------------[ API HANDLER ]----------------------*/

export const api = {

	async httpRequest(method, url, params = null, formData = null){
		try{
			const config = {method, url};
			if (params) config.params = params;
			if (formData) config.data = formData;
			
			const response = await axios(config);
			const result = response.data;

			return result;
		}catch(error){
			return error;
		}
	},

	// ======== GET BH NAME ==========
	async getBhName(){
	    return this.httpRequest('get', '/bh_info/bh_name');
	},
	
	// ADD BOARDER
	async addBoarder(formData){
		return this.httpRequest('post', '/boarder/add-boarder', null, formData);
	},

	// GET AVAILABLE ROOM
	async avlRooms(gender){
		return this.httpRequest('get', '/boarder/get-avl-room', { gender : gender });
	},

	// DISPLAY ALL BOARDER
	async showAllBoarder(){
		return this.httpRequest('get', '/boarder/all-boarder');
	},

	// SORT BOARDER BASED ON WHAT USER WANT
	async sortBoarders(sortType){
		return this.httpRequest('get', '/boarder/sort-boarder', { type : sortType });
	},

	// GET THE TOTAL OF ALL BOARDER AND TOTAL OF EACH GENDER
	async showBoarderTotalsAndClassification(){
		return this.httpRequest('get', '/boarder/all-totals');
	},

	// EDIT THE BOARDER INFORMATION
	async editBoarderInfo(formData){
		return this.httpRequest('post', '/boarder/edit-boarder', null, formData);
	},

	// GET THE BOARDER INFO FROM THE TABLE AND PUT IN THE FORM
	async getBoarderInfos(boarder_id){
		return this.httpRequest('get', `/boarder/get-boarder/${boarder_id}`);
	},

	// REMOVE THE BOARDER
	async removeBoarder(boarder_id, gender, room_no){
		return this.httpRequest('delete', `/boarder/remove-boarder`, { boarder_id : boarder_id, gender : gender, room_no : room_no});
	},

	// LIVE SEARCH
	async liveSearchBoarderNames(name){
		return this.httpRequest('get', '/boarder/search-boarder', {name : name });
	},

};





