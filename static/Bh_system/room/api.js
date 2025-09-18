
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

      // ============= ADD ROOM ================
      async addRoom(formData){
            return this.apiRequest('post', '/room/add-room', null, formData);
      },

      // ============= EDIT ROOM ================
      async editRoom(formData){
            return this.apiRequest('post', '/room/edit-room', null, formData);
      },

      // ============= DELETE ROOM ================
      async deleteRoom(room_id, roomNo, gender){
            return this.apiRequest('delete', '/room/delete-room', { room_id : room_id, room : roomNo, gender : gender });
      },

      // ============= SORT ROOM ================
      async sortRoom(type){
            return this.apiRequest('get', '/room/sort-room', { type : type });
      },

      // ============= GET EDIT ROOM DATA ================
      async getEditRoomData(room_id){
            return this.apiRequest('post', '/room/get-room-data', { room_id : room_id });
      },

      // ============= DISPLAY ROOMS ================
      async showRoom(){
            return this.apiRequest('get', '/room/show-all-rooms');
      },

      // ============= SUMMARY CARDS TOTALS ================
      async summaryCardTotal(){
            return this.apiRequest('get', '/room/all-totals');
      }

};