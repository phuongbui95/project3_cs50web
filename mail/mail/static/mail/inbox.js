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

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = 'thor@example.com';//'';
  document.querySelector('#compose-subject').value = 'test subject';//'';
  document.querySelector('#compose-body').value = 'test body of email';//'';

  //////------ Send email when submit is clicked
  document.querySelector('form').onsubmit = () => {
    let recipients = document.querySelector('#compose-recipients').value; // use .value to collect data from a Form Submit
    let subject = document.querySelector('#compose-subject').value;
    let body = document.querySelector('#compose-body').value;
    // alert(`${recipients}, ${subject}, ${body}`)
    send_email(recipients, subject, body);
    // alert(post_email())
  }

  //Use addEventListener to load the page
  document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault(); //prevent the default event from load_mailbox(mailbox)
    const mailbox = this.getAttribute('id') === 'compose-form' ? 'sent' : 'inbox';
    load_mailbox(mailbox);
  });
  
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}

function send_email(recipientsVar, subjectVar, bodyVar) {
  // Send a POST request to the URL api
  const requestOptions =  {
    method: 'POST',
    body: JSON.stringify({
        recipients: `${recipientsVar}`,
        subject: `${subjectVar}`,
        body: `${bodyVar}`
    })
  }
  fetch('/emails', requestOptions)
  .then(response => response.json())
  .then(result => {
      // Print result in console
      console.log(result)
      
  })
  return true;
}