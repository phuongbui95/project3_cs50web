document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);
  
    ////----- By default, load the inbox
    load_mailbox('inbox');
});

function compose_email() {
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#in-email-view').style.display = 'none';
  
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
    
    // Send email
    /* event listener must be placed at where the event is triggered */
    document.querySelector('form').onsubmit = (event) => { 
      sendEmail(document.querySelector('#compose-recipients').value
              ,document.querySelector('#compose-subject').value
              ,document.querySelector('#compose-body').value
              )
      // Load 'sent' mailbox
      event.preventDefault();
      load_mailbox('sent');
    }
    
}

function load_mailbox(mailbox) {
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#in-email-view').style.display = 'none';
  
    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `
                                                        <div id="${mailbox}_listing">
                                                          <h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>
                                                        </div>
                                                        `;
  }

function sendEmail(recipientsVar, subjectVar, bodyVar) {
  // POST request to API
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: `${recipientsVar}`,
        subject: `${subjectVar}`,
        body: `${bodyVar}`
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });
}

function listEmail() {

}

function viewEmail() {

}

function archiveEmail() {
  //archive
  //unarchive
}

function replyEmail() {

}