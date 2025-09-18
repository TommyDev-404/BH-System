import { showMessage } from "./helper.js";

const SEND_EMAIL_FORM = document.getElementById('get-code');
const CODE_FORM = document.getElementById('recovery-code');
const SEND_EMAIL_BTN = document.getElementById('send-email');
const CODE_BTN = document.getElementById('send-code');
const CODE_INPUT = document.querySelector('#recovery-code input[name="code"]');
const EMAIL_INPUT = document.querySelector('input[name="email"]');

function main(){
      document.addEventListener('submit', (e) => {
            if (e.target.matches('.get-code')) getCode(e); 
            if (e.target.matches('.recovery-code')) sendCode(e); 
      }); 
}

async function getCode(e) {
      e.preventDefault();
      const response = await axios.get('/recover/get-code',  {params : Object.fromEntries(new FormData(e.target).entries())});
      const result = response.data;
      result.success ? showMessage(result.message) : showMessage(result.message, null, null, e.target);
}

async function sendCode(e) {
      e.preventDefault();
      console.log(new FormData(e.target).email);
      const response = await axios.post('/recover/send-code', {code : new FormData(e.target).get('code'), email : new FormData(SEND_EMAIL_FORM).get('email')});
      const result = response.data;
      result.success ? window.location.href = result.redirect : showMessage(result.status, null, null, e.target);
}

// ======== MAIN METHOD ========
main();