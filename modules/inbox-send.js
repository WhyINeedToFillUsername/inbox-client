const auth = require('solid-auth-client');
const addAlert = require('./submodules/alerts');
const discover = require('./submodules/inbox-discover');
const pod = require('./submodules/pod');

const logoutBtn = document.getElementById('logout');
const logout = require('./submodules/solid-logout')(logoutBtn);

const messageForm = document.getElementById('messageForm');
const iriToInput = document.getElementById('iriTo');
const notifContentInput = document.getElementById('notifContent');
const sendNotifBtn = document.getElementById('sendNotif');
const friendsSelect = document.getElementById('friends');

let webID = "";

async function loadFriends() {
    function addOptionToSelect(textContent, select) {
        let option = document.createElement("option");
        option.appendChild(document.createTextNode(textContent));
        select.appendChild(option);
    }

    const friends = await pod.getFriends(webID);
    friends.forEach(friend => {
        addOptionToSelect(friend, friendsSelect);
    })
}

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
        headers: {"Content-type": "application/ld+json"},
        credentials: "include"
    });
}

async function submitForm() {
    function getDestination() {
        let selected = friendsSelect.value;
        if (selected === "useInput")
            return iriToInput.value;
        else
            return selected;
    }

    sendNotifBtn.disabled = true;
    let sent = false;
    let error = "";
    let destinationResourceIRI = getDestination();
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
    } else {
        error = "Couldn't find an inbox.";
    }

    if (sent) addAlert('success', "Message sent!", true);
    else addAlert('warning', "Error sending message. " + error);

    iriToInput.value = "";
    notifContentInput.value = "";
    sendNotifBtn.disabled = false;
}


function handleDestinationInputs() {
    friendsSelect.addEventListener('change', function () {
        let selected = friendsSelect.value;
        if (selected === "useInput") {
            iriToInput.disabled = false;
            iriToInput.required = true;
        } else {
            iriToInput.disabled = true;
            iriToInput.required = false;
        }
    });
}

function init(session) {
    logoutBtn.addEventListener('click', logout);

    messageForm.addEventListener('submit', function (event) {
        submitForm();
        event.preventDefault();
    });

    webID = session.webId;

    const webIdAnchor = document.getElementById("webId");
    webIdAnchor.href = webID;
    webIdAnchor.innerHTML = webID;

    loadFriends();
    handleDestinationInputs();
}

auth.trackSession(session => {
    if (!session) {
        console.log('The user is not logged in');
        window.location.replace("/");
    } else
        init(session);
});