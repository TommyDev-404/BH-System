/*=============== LOGIN PART ===============*/

import { showMessage, showPasswordToggle } from './helper.js'

const LoginForm = document.getElementById('loginForm');
const password = document.getElementById('passw');
const showPassword = document.getElementById('toggle');

/*======= EVENT LISTENERS ==========*/
// HANDLE FORM SUBMISSION
LoginForm.addEventListener('submit', (e) => loginForm(e) );
// HANDLE VIEW PASSWORD
showPassword.addEventListener('click', () => showPasswordToggle(password));
// automatic capitalize
document.addEventListener('input', (e) => {
	if (e.target.matches('input[id="name"]')){
		let input = e.target.value.split(' ');
		let words = input.map(inp => inp.charAt(0).toUpperCase() + inp.slice(1));
		e.target.value = words.join(' ');
	}
	if (e.target.matches('input[id="passw"]')){
		let input = e.target.value.split(' ');
		let words = input.map(inp => inp.charAt(0).toUpperCase() + inp.slice(1));
		e.target.value = words.join(' ');
	}
});



/*================ FUNCTIONS ==================*/
async function loginForm(e){
	e.preventDefault();
	const uname = e.target.admin_uname.value;
	const password = e.target.admin_pass.value;

	try{
		const response = await axios.post('/login-submit', { username : uname, password : password });
		const result = response.data;
		result.success ? showMessage(result.message, result.redirect, e.target) : showMessage(result.message, null, e.target);
	}catch(error){
		showMessage(error, null, e.target);
	}
}
