/*=============== SIGN UP PART ===============*/

import { showMessage, showPasswordToggle } from './helper.js'

const registerForm = document.getElementById('registerForm');
const password = document.getElementById('password');
const setPassword = document.getElementById('toggle');
const total_room = document.querySelector('input[name="total_room"]');
const total_male = document.querySelector('input[name="male"]');
const total_female = document.querySelector('input[name="female"]');
let total = 0; // total male/female input storage


/*================= EVENT LISTENERS ===============*/
function main(){
	// HANDLE SIGN UP
	registerForm.addEventListener('submit', (e) => register(e));
	// FOR SET PASSWORD
	setPassword.addEventListener('click', () => showPasswordToggle(password));
	// HANDLE GENDER CAPACITY
	total_male.addEventListener('keyup', (e) => genderRoomLimiter(e, "male"));
	total_female.addEventListener('keyup', (e) => genderRoomLimiter(e, "female"));
	document.addEventListener('input', (e) => {
		if (e.target.matches('input[name="bhName"]')){
			let input = e.target.value.split(' ');
			let words = input.map(inp => inp.charAt(0).toUpperCase() + inp.slice(1));
			e.target.value = words.join(' ');
		}
		if (e.target.matches('input[name="admin_uname"]')){
			let input = e.target.value.split(' ');
			let words = input.map(inp => inp.charAt(0).toUpperCase() + inp.slice(1));
			e.target.value = words.join(' ');
		}
	});
}

async function register(e){
	e.preventDefault();
	const form = new FormData(e.target);
	const formData = Object.fromEntries(form.entries());
	console.log(formData);
	const oldMsg = document.getElementById('message-box');
	if (oldMsg) oldMsg.remove();

	try{
		const response = await axios.post('/register-submit', formData);
		const result = response.data;
		result.success ? showMessage(result.message, result.redirect) : showMessage(result.message, null, e.target);
	}catch(error){
		showMessage(error, null, e.target);
	}
}

function genderRoomLimiter(e, gender){
	// check each input 
	if (gender === 'male'){ 
		if (e.target.value === '' && total_female.value != '') total = parseInt(total_female.value); // return the value of female when male is cleared 
		if (e.target.value === '' && total_female.value === '') total = 0; // else return 0 to avoid error
	}else{  
		if (e.target.value === '' && total_male.value != '') total = parseInt(total_male.value);
		if (e.target.value === '' && total_male.value === '') total = 0;
	}
	
	total  += e.target.value === ''  ?  0 : parseInt(e.target.value); // get the totals of each gender
	
	// reset if the total male and female exceed the total room
	if (total > parseFloat(total_room.value)){
		showMessage("Number exceeds the total room! Please input a correct value.", null, null, e.target);
		total -= parseInt(e.target.value); // subtract the total to the number remove for checking
	}
}


// ====== MAIN METHOD =======
main();