
      export function showMessage(message, redirect) {
            // Remove previous message
            console.log(message);
            const oldMsg = document.getElementById('message-box');
            if (oldMsg) oldMsg.remove();
      
            // Create message container
            const messageBox = document.createElement('div');
            messageBox.className = 'message-box';
      
            // Add content
            const label = document.createElement('label');
            label.textContent = message;
            const br = document.createElement('br');
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Cancel';
            cancelBtn.className = 'cancel-message';
            const okBtn = document.createElement('button');
            okBtn.textContent = 'Logout';
            okBtn.className = 'close-message';
      
            messageBox.append(label, br, cancelBtn, okBtn);
            document.body.append(messageBox); // append on html body
          
            // cancel btn
            cancelBtn.addEventListener('click', () => {
                  messageBox.remove();
            });

            // logout  brn
            okBtn.addEventListener('click', () => {
                  messageBox.remove();
                  window.location.href = redirect;
            });            
      }