const rdfnamespaces = require('rdf-namespaces');
const tripledoc = require('tripledoc');
const auth = require('solid-auth-client');

const foaf = rdfnamespaces.foaf;
const ldp = rdfnamespaces.ldp; // http://www.w3.org/ns/ldp

const logoutBtn = document.getElementById('logout');
const content = document.getElementById('content');
const action1Btn = document.getElementById('action1');
const action2Btn = document.getElementById('action2');
const webId = document.getElementById('webId').textContent;


async function getName() {
    /* 1. Fetch the Document at `webId`: */
    const webIdDoc = await tripledoc.fetchDocument(webId);
    /* 2. Read the Subject representing the current user's profile: */
    const profile = webIdDoc.getSubject(webId);
    /* 3. Get their foaf:name: */
    console.log(profile.getString(foaf.name));
}

async function getNotifications() {
    action2Btn.disabled = true;

    async function getInboxIri() {
        /* 1. Fetch the Document at `webId`: */
        const webIdDoc = await tripledoc.fetchDocument(webId);
        /* 2. Read the Subject representing the current user's profile: */
        const profile = webIdDoc.getSubject(webId);
        /* 3. Get their ldp:inbox: */
        const inboxIri = profile.getRef(ldp.inbox);

        console.log(inboxIri);
        return inboxIri;
    }

    async function loadNotifications() {
        const inboxIri = await getInboxIri();
        const inboxDoc = await tripledoc.fetchDocument(inboxIri);
        const inbox = inboxDoc.getSubject(inboxIri);
        const notifs = inbox.getAllRefs(ldp.contains);
        // return {inboxDoc, inbox, notifs};
        return notifs;
    }

    // const {inboxDoc, inbox, notifs} = await loadNotifications();
    const notifs = await loadNotifications();
    notifs.forEach(value => {
        content.append(value + "\n");
    });

    action2Btn.disabled = false;
}

function destroySessionOnServer() {
    var xhr = new XMLHttpRequest();
    var url = "/logout";

    xhr.open("POST", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            // do something with response
            console.log(xhr.responseText);
            window.location.replace("/");
        }
    };
    xhr.send();
}

function logout() {
    logoutBtn.disabled = true;
    auth.logout().then(function () {
        destroySessionOnServer();
    });
}

function loadInbox() {
    auth.fetch("https://nokton.solid.community/inbox/")
        .then(function (data) {
            console.log(data);
            content.append(JSON.stringify(data));
        });
}

logoutBtn.addEventListener('click', logout);
action1Btn.addEventListener('click', getName);
action2Btn.addEventListener('click', getNotifications);
