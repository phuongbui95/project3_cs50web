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
  document.querySelector('#emails-view').innerHTML = `
                                                      <div id="${mailbox}_div">
                                                        <h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>
                                                      </div>
                                                      `;
  
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
    
    ///// Filter emails for particular mailbox
    let filteredEmails = [];
    if(mailbox == 'inbox') {
      filteredEmails = sortedEmails.filter(email => email.archived === false);
      
    } else if(mailbox == 'archive') {
      filteredEmails = sortedEmails.filter(email => email.archived === true);
      
    } else {
      filteredEmails = sortedEmails;
      
    }
        
    // Show emails in #emails-view
    let latestfilteredEmails = filteredEmails.slice(0,10);
    // console.log(latestfilteredEmails);
    latestfilteredEmails.forEach(email => {
      //-- Display overview of email's content in emails-view of mailbox
      list_emails(email.sender, email.subject, email.timestamp, email.read, email.id, mailbox);
    });
    return;
  });
}

//
function list_emails(senderVar, subjectVar, timestampVar, readVar, idVar, mailbox) {
  // parent dive to store listed emails
  const target_mailbox_div = document.querySelector(`#emails-view #${mailbox}_div`);
  // Create div tag to contain email's content
  const email_div = document.createElement('div');
  const h3_emailsView = document.querySelector('#emails-view h3'); // Identify the h3 tag in #emails-view
  email_div.className = h3_emailsView.innerHTML; //Assign h3 tag's text as email_div's className
  email_div.setAttribute('id',`email_${idVar}`);
  email_div.innerHTML = `${senderVar}, ${subjectVar}, ${timestampVar}<br>`; //add <br> to see line breaks
  // Append email_div to parent div in mailbox
  target_mailbox_div.appendChild(email_div);
  // Add border to target mailbox
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
    let email_intro_view = emailView.querySelector('.intro-view');
    email_intro_view.innerHTML =
    `
      From: ${email.sender}<br>
      To: ${email.recipients}<br>
      Subject: ${email.subject}<br>
      Timestamp${email.timestamp}<br>   
    `;
    let email_buttons_view = emailView.querySelector('.buttons');
    email_buttons_view.innerHTML =
    `
    <button id="replyButton">Reply</button>
    <button id="archiveButton">Archive</button>
    <button id="unarchiveButton">Unarchive</button>
    `;
    let email_firstBody_view = emailView.querySelector('.body-view .first-body');
    email_firstBody_view.innerHTML =`<hr>${email.body}`;
                
    // Hide the expected buttons
    if(mailbox == 'sent'){
      document.querySelector('#archiveButton').style.display='none';
      document.querySelector('#unarchiveButton').style.display='none';
    } else if(mailbox == 'inbox'){
      document.querySelector('#unarchiveButton').style.display='none';
    } else {
      document.querySelector('#archiveButton').style.display='none';
    }

    // Trigger the buttons
    // Click on archive
    document.querySelector('#archiveButton').onclick = () => {
      console.log('Clicked on Archive');
      // Update archive = true
      fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: true //archived, not archive
        })
      })
      .then(response => {
        console.log(response);
        console.log(`Email ${email_id} is archived`);
      })
      // load 'inbox'
      load_mailbox('inbox');
    }

    // Update archive = false
    document.querySelector('#unarchiveButton').onclick = () => {
      console.log('Clicked on Unarchive');
      // Update archive = false
      fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: false //archived, not archive
        })
      })
      .then(response => {
        console.log(response);
        console.log(`Email ${email_id} is unarchived`);
      })
      // load 'inbox'
      load_mailbox('inbox');
    }

    // Click on Reply
    document.querySelector('#replyButton').onclick = () => {
      console.log('Clicked on Reply');
      reply_email(email.sender, email.subject, email.timestamp, email.body);
    }
    return;
  });
}

function reply_email(senderVar, subjectVar, timestampVar, bodyVar) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#in-email-view').style.display = 'none';

  // Pre-fill composition fields to reply the original email
  document.querySelector('#compose-recipients').value = senderVar;
  const regex = /^Re: /;
  if(regex.test(subjectVar) == true) {
    document.querySelector('#compose-subject').value = `${subjectVar}`;  
  } else {
    document.querySelector('#compose-subject').value = `Re: ${subjectVar}`;
  } 
  let reply_body = `\n-----------\n`
                  +`\nOn ${timestampVar}, ${senderVar} wrote:`
                  +`\n${bodyVar}\n-----------\n`
                  + `Reply:\n`
                  ;
  document.querySelector('#compose-body').value = reply_body;

  //////------ Submit is clicked
  document.querySelector('form').onsubmit = (event) => {
    // send value from form's fields and trigger POST api
    let recipients = document.querySelector('#compose-recipients').value; // use .value to collect data from a Form Submit
    let subject = document.querySelector('#compose-subject').value;
    let body = document.querySelector('#compose-body').value;
    post_email(recipients, subject, body);
    
  }
}