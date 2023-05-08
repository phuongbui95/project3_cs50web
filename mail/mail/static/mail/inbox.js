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
  document.querySelector('#in-email-view').style.display = 'none';

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
  document.querySelector('#in-email-view').style.display = 'none';

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
    console.log(`Mailbox: ${mailbox}`);
    // Sort the array of emails by timestamp in descending order
    let sortedEmails = emails.sort((a,b) => b.timestamp - a.timestamp);
    
    // // Get the first 10 timestamps of elements in the sorted array
    // let largestTimestamps = sortedEmails.slice(0,10).map(email => email.timestamp);
    // // create a new array containing only the emails with timestamps in the extracted ids
    // let filteredEmails = emails.filter(email => largestTimestamps.includes(email.timestamp));
    // // let filteredEmails_timestamps = filteredEmails.map(email => console.log(email.timestamp));
    
    // Show emails in #emails-view
    let latest10SortedEmails = sortedEmails.slice(0,10);
    latest10SortedEmails.forEach(email => {
      //-- Display overview of email's content in emails-view of mailbox
      list_emails(email.sender, email.subject, email.timestamp, email.read, email.id, mailbox);
    });
    return;
  });
}

//
function list_emails(senderVar, subjectVar, timestampVar, readVar, idVar, mailbox) {
  // Create div tag to contain email's content
  const email_div = document.createElement('div');
  email_div.className= 'overview';
  email_div.innerHTML = `${senderVar}, ${subjectVar}, ${timestampVar}<br>`; //add <br> to see line breaks
  // Add border to each email box
  document.querySelector('#emails-view').append(email_div);
  email_div.style.border = "1px solid black";
  // Change background's color of read emails
  if(readVar) {
  email_div.style.backgroundColor = "gray";
  } else {
  email_div.style.backgroundColor = "white";
  }

  // Event when a div element containing email is clicked
  email_div.addEventListener('click', () => {
    // Show in-email-view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    view_email(idVar, mailbox);
  });
}

// GET particular email from email_id
function view_email(email_id, mailbox) {
  // get emails by email_id
  
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    console.log(`Email ${email_id} has been clicked!`);
    /** in-email-view
     * From: sender
     * To: recipients
     * Subject: subject
     * --> add a horizontal break line <hr> here!
     * Show the 'body' of email here
     * 
     * // Function
     * Update email.read by PUT method to 'true'.
     * Present email'content as above.
     * Add 'archive' button for 'inbox' email, 'unarchive' one for 'archive' email.
     * Add 'reply' button for 'inbox' email. 
     */

    // Update this email is read
    fetch(`/emails/${email_id}`,{
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    })

    //--- Show in-email-view ---//
    let emailView = document.querySelector('#in-email-view');
    emailView.style.display = 'block';
    emailView.innerHTML = `
                <div class='intro-view'>       
                  From: ${email.sender}<br>
                  To: ${email.recipients}<br>
                  Subject: ${email.subject}<br>
                  Timestamp${email.timestamp}<br>   
                </div>
                <div class='buttons'>
                  <button class="button reply">Reply</button>
                  <button class="button archive">Archive</button>
                  <button class="button unarchive">Unarchive</button>
                </div>
                <div class='body-view'>
                  <hr>${email.body}
                </div>
                `;
    document.querySelector('.reply').onclick = () => {
      console.log('Clicked on Reply');
    }
    document.querySelector('.archive').onclick = () => {
      console.log('Clicked on Archive');
    }
    document.querySelector('.unarchive').onclick = () => {
      console.log('Clicked on Unarchive');
    }
    // button customization
    if(mailbox == 'sent'){
      document.querySelector('.archive').style.display='none';
      document.querySelector('.unarchive').style.display='none';
    } else if(mailbox == 'inbox'){
      document.querySelector('.unarchive').style.display='none';
    } else {
      document.querySelector('.archive').style.display='none';
    }
    return;
  });
}
