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
                                                      <div id="${mailbox}_listing">
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
    // let filteredEmails = [];
    // if(mailbox == 'inbox') {
    //   filteredEmails = sortedEmails.filter(email => email.archived === false);
      
    // } else if(mailbox == 'archive') {
    //   filteredEmails = sortedEmails.filter(email => email.archived === true);
      
    // } else {
    //   filteredEmails = sortedEmails;
      
    // }
    const filteredEmails = sortedEmails.filter(email => {
      switch (mailbox) {
        case 'inbox':
          return email.archived === false;
        case 'archive':
          return email.archived === true;
        default:
          return true;
      }
    });

    // Show emails in #emails-view
    let latestfilteredEmails = filteredEmails.slice(0,20);
    // console.log(latestfilteredEmails);
    latestfilteredEmails.forEach(email => {
      //-- Display overview of email's content in emails-view of mailbox
      list_email(email.sender, email.subject, email.timestamp, email.read, email.id, mailbox);
    });
    return;
  });
}

//
function list_email(senderVar, subjectVar, timestampVar, readVar, idVar, mailbox) {
  // parent dive to store listed emails
  const target_mailbox_div = document.querySelector(`#emails-view #${mailbox}_listing`);
  // Create div tag to contain email's content
  const email_div = document.createElement('div');
  const h3_emailsView = document.querySelector('#emails-view h3'); // Identify the h3 tag in #emails-view
  email_div.className = h3_emailsView.innerHTML + ` email_${idVar}`;
  email_div.innerHTML = `${senderVar}, ${subjectVar}, ${timestampVar}<br>`; //add <br> to see line breaks
  // Append email_div to parent div in mailbox
  target_mailbox_div.appendChild(email_div);
  // Add border to target mailbox
  email_div.style.border = "1px solid black";
  // Change background's color of read emails
  email_div.style.backgroundColor = readVar ? "gray": "white";
  // Check whether to create a new div in #in-email-view?
  if(!document.querySelector(`#email_${idVar}`)) {
    let createDiv = document.createElement('div');
    createDiv.setAttribute('id', `email_${idVar}`);
    document.querySelector(`#in-email-view #${mailbox}-email`).appendChild(createDiv);
  }
  
  document.querySelector(`#email_${idVar}`).style.display = 'none';

  // Event when a div element containing email is clicked
  email_div.addEventListener('click', () => {
    // Show in-email-view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#in-email-view').style.display = 'block'; //parent node level 1
    for (const box of ['inbox', 'sent', 'archive']) { //parent node level 2
      document.querySelector(`#${box}-email`).style.display = (box === mailbox) ? 'block' : 'none';
    }

    document.querySelector(`#email_${idVar}`).style.display = 'block'; // child node

    // view particular email based on email's id
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
    
    //--- Show in-email-view of particular email_id---//
    const emailDiv = document.querySelector(`#email_${email_id}`);

    emailDiv.innerHTML = `
      <div class="intro-view">
        From: ${email.sender}<br>
        To: ${email.recipients}<br>
        Subject: ${email.subject}<br>
        Timestamp: ${email.timestamp}<br>
      </div>
      <div class="buttons-view">
        <button class="replyButton">Reply</button>
        <button class="archiveButton">Archive</button>
        <button class="unarchiveButton">Unarchive</button>
        <hr>
      </div>
      <div class="body-view">
        <p>
          ${email.body.replace(/\[Input reply below\]/g, '<hr>')}
        </p>
      </div>
    `;
                
    // Hide the expected buttons
    let buttons = {
      'sent': ['archiveButton', 'unarchiveButton'],
      'inbox': ['unarchiveButton'],
      'archive': ['archiveButton', 'replyButton'],
    };
    
    for(let value of buttons[mailbox] ) {
      document.querySelector(`#email_${email_id} .${value}`).style.display = 'none';
    }
    

    // Trigger the buttons
    // Click on archive
    document.querySelector('.archiveButton').onclick = () => {
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
    document.querySelector('.unarchiveButton').onclick = () => {
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
    document.querySelector('.replyButton').onclick = () => {
      console.log('Clicked on Reply');
      reply_email(email.sender
                  , email.subject
                  , email.timestamp
                  , email.body
                  , email_id
                  );
    }
    return;
  });
}

function reply_email(senderVar, subjectVar, timestampVar, bodyVar, idVar) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#in-email-view').style.display = 'none';

  // Pre-fill recipients
  document.querySelector('#compose-recipients').value = senderVar;
  const regex = /^Re: /;
  // Pre-fill subjects
  if(regex.test(subjectVar) == true) {
    document.querySelector('#compose-subject').value = `${subjectVar}`;  
  } else {
    document.querySelector('#compose-subject').value = `Re: ${subjectVar}`;
  } 
  // Pre-fill the 1st part of body
  /**
   *  Design email_bodyTemplate
   *  Case 01: Without replies yet
   *  Case 02: With replies
   *  
  */
  let currentBodyText ='';
  let firstBodyText = '';
  let email_bodyTemplate = '';
  if(document.querySelector(`#in-email-view .body-view .reply-body .email_${idVar}`) === '') {
    firstBodyText = bodyVar;
    currentBodyText = firstBodyText;
  } else {
    currentBodyText = bodyVar.slice(bodyVar.indexOf('[Input reply below]',bodyVar.indexOf('[Input reply below]')+1)
                              ,bodyVar.length);
    firstBodyText = bodyVar.slice(0,bodyVar.indexOf('[Input reply below]'))

  }
  email_bodyTemplate = firstBodyText
                  + `\n[Input reply below]\n`
                  + `On ${timestampVar}, ${senderVar} wrote:`
                  + `\n${currentBodyText}`
                  + `\n[Input reply below]\n`
                  ;
  

  //prefill intro to body of reply
  document.querySelector('#compose-body').value = email_bodyTemplate;

  //////------ Submit is clicked
  document.querySelector('form').onsubmit = (event) => {
    // Send value from form's fields and trigger POST api
    let recipients = document.querySelector('#compose-recipients').value; // use .value to collect data from a Form Submit
    let subject = document.querySelector('#compose-subject').value;
    let body = document.querySelector('#compose-body').value;//after the reply body is inputted
    post_email(recipients, subject, body);
    
    
  }
}



