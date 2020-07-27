const auth = require('solid-auth-client');
const addAlert = require('./alerts');
const discover = require('./inbox-discover');

const messageForm = document.getElementById('messageForm');
const iriToInput = document.getElementById('iriTo');
const notifContentInput = document.getElementById('notifContent');
const sendNotifBtn = document.getElementById('sendNotif');

let webID = "";


function createMessage(from, to, content) {
    return {
        "@context": "https://www.w3.org/ns/activitystreams",
        "@id": "",
        "@type": "Create",
        "to": [
            to
        ],
        "actor": from,
        "object": {
            "type": "Note",
            "id": "", // should store this message with accessible IRI in an outbox
            "attributedTo": from,
            "to": [to],
            "content": escape(content),
            "published": new Date().toISOString()
        }
    }
}

function sendMessage(to, message) {
    return fetch(to, {
        method: 'post',
        body: JSON.stringify(message),
        headers: {"Content-type": "application/ld+json"}
    });
}

async function submitForm() {
    sendNotifBtn.disabled = true;
    let sent = false;
    let error = "";
    let destinationResourceIRI = iriToInput.value;
    let notifContent = notifContentInput.value;

    // 1) discover inbox on the submitted IRI
    let destinationInbox = await discover.discoverInbox(destinationResourceIRI);
    if (destinationInbox) {

        // 2) construct message
        const message = createMessage(webID, destinationResourceIRI, notifContent);

        // 3) ajax post to IRI
        await sendMessage(destinationInbox, message).then(response => {
            sent = response.ok;
        }).catch(err => {
            error = err;
        });
    }

    if (sent) addAlert('success', "Message sent!", true);
    else addAlert('warning', "Error sending message: " + error);

    iriToInput.value = "";
    notifContentInput.value = "";
    sendNotifBtn.disabled = false;
}


function init(session) {
    messageForm.addEventListener('submit', function (event) {
        submitForm();
        event.preventDefault();
    });

    webID = session.webId;
}

auth.trackSession(session => {
    if (!session) {
        console.log('The user is not logged in');
        window.location.replace("/");
    } else
        init(session);
});