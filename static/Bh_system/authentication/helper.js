
export function showPasswordToggle(password){
	const type = password.getAttribute('type') === 'password' ? 'text' : 'password'; // get what type is the pass input field set
    	password.setAttribute('type', type); // set

    	toggle.textContent = type === 'password' ? 'Show' : 'Hide'; // change the text content
}

export function showMessage(message, redirect = null, form = null, input = null) {
	// Remove previous message
	const oldMsg = document.getElementById('message-box');
	if (oldMsg) oldMsg.remove();

	// Create message container
	const messageBox = document.createElement('div');
	messageBox.className = 'message-box';

	// Add content
	const label = document.createElement('label');
	label.textContent = message;
	const br = document.createElement('br');
	const closeBtn = document.createElement('button');
	closeBtn.textContent = 'Okay';
	closeBtn.className = 'close-message';

	messageBox.append(label, br, closeBtn);
	document.body.append(messageBox); // append on html body

	// Close on click
	closeBtn.addEventListener('click', () => {
		if (redirect != null) window.location.href = redirect; //redirect if there is to be redirected
		if (form != null) form.reset(); // reset the form 
		if (input != null) input.value = ''; // clear input field
		messageBox.remove();
	});
}


