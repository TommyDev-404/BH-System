import { showPasswordToggle, showMessage } from './helper.js'

const NEW_PASS_FORM = document.getElementById('new-pass');
const NEW_PASS_INPUT = document.querySelector('#new-pass input[name="password"');
const EMAIL_INPUT = document.querySelector('#new-pass input[name="email"');
const SHOW_PASSWORD = document.getElementById('toggle');

function main(){
	getEmail();
    	SHOW_PASSWORD.addEventListener('click', () => showPasswordToggle(NEW_PASS_INPUT));
    	NEW_PASS_FORM.addEventListener('submit', (e) => setPassword(e, Object.fromEntries(new FormData(e.target).entries())));
}

async function getEmail() {
	const response = await axios.get('/update/get-email');
	const result = response.data;
	EMAIL_INPUT.value = result.email;
}

async function setPassword(e, form) {
	e.preventDefault();
	const response = await axios.post('/update/new-password', form);
	const result = response.data;
	if (result.success){
		showMessage(result.message, result.redirect);
	}else{
		showMessage(result.message, null, e.target);
	}
}

// ========= MAIN METHOD ===========
main();