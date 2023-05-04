///--Main functions ----///
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
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  //////------ Redirect to 'sent' mailbox when submit is clicked
  document.querySelector('form').onsubmit = (event) => {
    // send value from form's fields and trigger POST api
    let recipients = document.querySelector('#compose-recipients').value; // use .value to collect data from a Form Submit
    let subject = document.querySelector('#compose-subject').value;
    let body = document.querySelector('#compose-body').value;
    post_email(recipients, subject, body);
    
    // Load 'sent' mailbox
    event.preventDefault();
    load_mailbox('sent');
  }
  
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  // Show emails of that mailbox
  get_mailbox(mailbox);
}

///--API-related functions ----///
// Post email when using Compose
function post_email(recipientsVar, subjectVar, bodyVar) {
  ////-- Send a POST request to the URL api
  const requestOptions =  {
    method: 'POST',
    body: JSON.stringify({
        recipients: `${recipientsVar}`,
        subject: `${subjectVar}`,
        body: `${bodyVar}`
    })
  }
  // activate the API to POST data
  fetch('/emails', requestOptions)
  .then(response => response.json())
  .then(result => {
      // Print result in console
      console.log(result);
      return;
  })
  
}

// GET all emails in mailbox
function get_mailbox(mailbox) {
  // get all emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // only get 10 latest emails
    console.log(`Mailbox: ${mailbox}`);
    const email_array = emails.slice(-10);
    // console.log(email_array);

    // get the array of ids in that array of objects
    const email_ids = email_array.map(obj => obj.id);
    // console.log(email_ids);

    // show the objects in email_ids array
    email_ids.forEach(email_id => view_email(email_id));
    return;
  });
}

// GET particular email from email_id
function view_email(email_id) {
  // get emails by email_id
  // let email_id = 1;
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    //-- Render email's content and display in emails-view of mailbox
    const sender = email.sender;
    const recipients = email.recipients;
    const subject = email.subject;
    const timestamp = email.timestamp;
    const body = email.body;
    
    // Create div tag to contain email's content
    const email_div = document.createElement('div');
    email_div.innerHTML = `${sender}, ${subject}, ${timestamp}`;
    // Add border to each email box
    document.querySelector('#emails-view').append(email_div);
    email_div.style.border = "1px solid black";
    // Change background's color of read emails
    const isRead = email.read;
    if(isRead) {
      email_div.style.backgroundColor = "gray";
    } else {
      email_div.style.backgroundColor = "white";
    }

    // Event when a div element containing email is clicked
    email_div.addEventListener('click', () => {
      console.log(`Email ${email_id} has been clicked!`);
      console.log(`Sender: ${sender}
                  \nRecipients: ${recipients}
                  \nSubject: ${subject}
                  \nTimestamp: ${timestamp}
                  \nBody: ${body}
                  `
                  );
    });
    return;
  });
}
