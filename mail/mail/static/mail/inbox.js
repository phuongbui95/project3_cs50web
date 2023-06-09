document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);

    // Customize tasks
    let h2_tag = document.querySelector('h2');
    h2_tag.addEventListener('click', () => load_mailbox('inbox'));
    let username = h2_tag.innerText.replace('@example.com','');
    h2_tag.innerHTML = `Hello ${username.toUpperCase()} ^.^`;

  
    ////----- By default, load the inbox
    load_mailbox('inbox');
});

function compose_email() {
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#in-email-view').style.display = 'none';
    // document.querySelector('#compose-view .pre-filled-body').style.display = 'none';
  
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
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
    openMailbox(mailbox); // List all emails in this mailbox
  }

// Use composition form to compose an email then send
function sendEmail(recipientsVar, subjectVar, bodyVar) {
  // Send a POST request to API
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

// list all expected emails in particular mailbox
function openMailbox(mailbox) {
  console.log(`Mailbox: ${mailbox}`);
  // Send a GET request to API
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print the latest emails (api has already given emails in reverse chronological order)
      console.log(emails);
      // Loop go through each email in the array
      emails.forEach(email => {
        const listedEmail_div = document.createElement('div');
        listedEmail_div.className = `${mailbox} email_${email.id} emails-grid`;
        listedEmail_div.innerHTML = `<div class="gridItem-sender">${email.sender}</div><div class="gridItem-subject">${email.subject}</div><div class="gridItem-timestamp">${email.timestamp}</div>`;
        listedEmail_div.style.border = '1px solid black';
        listedEmail_div.style.backgroundColor = email.read ? 'lightgray' : 'white'; // email.read is a boolen variable
        document.querySelector('#emails-view').append(listedEmail_div);
        
        // view email
        listedEmail_div.addEventListener('click', () => {
          document.querySelector('#emails-view').style.display = 'none';
          document.querySelector('#in-email-view').style.display = 'block';
          viewEmail(email.id, mailbox);
        });
      });
  });
}

// look into an email
function viewEmail(emailID, mailbox) {
  console.log(`email id: ${emailID}, mailbox: ${mailbox}`);
  // Send PUT request to api 
  fetch(`/emails/${emailID}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true //update emai.read = true;
    })
  })

  // Send GET request to api
  fetch(`/emails/${emailID}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(`Email ${emailID} is clicked.`);
      // Only display the div related to emailID
      const emailChildren = document.querySelectorAll('#in-email-view > div');
      emailChildren.forEach(child => child.style.display = child.id === `email_${emailID}` ? 'block' : 'none');
      // Check if child element does not exist yet, create a new div and append it to parent div
      if (!document.querySelector(`#email_${emailID}`)) { //getElementById
        // Create child element
        const childNode = document.createElement("div");
        childNode.setAttribute('id',`email_${emailID}`);
        // #in-email-view: Show the email’s sender, recipients, subject, timestamp, and body
        childNode.innerHTML = `
        <div class="email-intro">
          <b>Sender</b>: ${email.sender}<br>
          <b>Recipients</b>: ${email.recipients}<br>
          <b>Subject</b>: ${email.subject}<br>
          <b>Timestamp</b>: ${email.timestamp}
          
        </div>
        <div class="email-buttons">
          <button class="replyButton btn btn-sm btn-outline-primary"> Reply </button>
          <button class="archiveButton btn btn-sm btn-outline-primary"> Archive </button>
          <button class="unarchiveButton btn btn-sm btn-outline-primary"> Unarchive </button>
        </div>
        <hr>
        `;
        // .email-body // ${email.body.replace(/\[To Split\]/g, '<hr>')}
        // let bodyArray = email.body.split('------');
        // let inputBody = `${bodyArray[bodyArray.length-1]}`;
        // if(email.body.search('------')<0) {
        //   inputBody = email.body;
        // }
        const inputBody = email.body.split('------').pop() || email.body;

        emailBody = `
        <div class="email-body">
          <p> 
            ${inputBody}
          </p>
        </div>
        `;
        // Add .email-body to email div
        childNode.innerHTML += emailBody;

        // Append child element to parent
        // Get parent element
        const parentNode = document.querySelector('#in-email-view');
        parentNode.appendChild(childNode);
      }

      /** archive/unarchive button
       *  Task 01: Hide unexpected buttons
       *  Task 02: Trigger the event being listened
      */ 
      // Hide the buttons
      let btn = ['archiveButton', 'unarchiveButton'];
      
      if(mailbox == "inbox") {
        document.querySelector(`#email_${emailID} .${btn[0]}`).style.display = 'block';
        document.querySelector(`#email_${emailID} .${btn[1]}`).style.display = 'none';
      } else if(mailbox == 'archive') {
        document.querySelector(`#email_${emailID} .${btn[0]}`).style.display = 'none';
        document.querySelector(`#email_${emailID} .${btn[1]}`).style.display = 'block';
      } else{
        document.querySelector(`#email_${emailID} .${btn[1]}`).style.display = 'none';
        document.querySelector(`#email_${emailID} .${btn[0]}`).style.display = 'none';
      }

      // Trigger the buttons
      document.querySelector(`#email_${emailID} .archiveButton`).onclick = () => {
        archiveEmail(emailID, '.archiveButton');
      }
      document.querySelector(`#email_${emailID} .unarchiveButton`).onclick = () => {
        archiveEmail(emailID, '.unarchiveButton');
      }

      /** Trigger Reply button in particular email id */
      document.querySelector(`#email_${emailID} .replyButton`).onclick = () => {
        replyEmail(emailID, email.sender, email.subject, email.body, email.timestamp);
      }
  });
  
}

// archive/unarchive
function archiveEmail(emailID, actionClass) {
  fetch(`emails/${emailID}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: actionClass === '.archiveButton' ? true : false //really like this ternary operator!
    })
  })
  .then(response => {
    console.log(response);
    console.log(`Email ${emailID} is clicked on ${actionClass}`);
    // load 'inbox'
    load_mailbox('inbox');
  })
    
}
  
function replyEmail(emailID, emailSender, emailSubject, emailBody, emailTimestamp) {
  // Show composition form and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#in-email-view').style.display = 'none';
  
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Pre-fill some texts from original email to the form
  //// Recipient is sender of original email
  document.querySelector('#compose-recipients').value = emailSender;
  //// If at least 1 reply of this email does exist, do not add "Re: " anymore
  document.querySelector('#compose-subject').value = emailSubject.slice(0, 4) === 'Re: ' ? emailSubject : `Re: ${emailSubject}`;
  // let prefilledBody = `On <b>${emailTimestamp} ${emailSender}</b> wrote:<br>${emailBody.trim()}`;
  // document.querySelector('#compose-view .pre-filled-body').style.display = 'block';
  // document.querySelector('#compose-view .pre-filled-body').innerHTML = prefilledBody;

  // Create a body_template => used once per reply only!
  let emailBody_adjusted = emailBody.split("------").pop() || emailBody;
  let body_template = `------On ${emailTimestamp}, ${emailSender} wrote------\n${emailBody_adjusted.trim()}\n------\n`;
  document.querySelector('#compose-body').value = body_template;
  
  // Submit
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