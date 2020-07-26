const rdfnamespaces = require('rdf-namespaces');
const tripledoc = require('tripledoc');
const auth = require('solid-auth-client');
const addAlert = require('./alerts');

const ldp = rdfnamespaces.ldp; // http://www.w3.org/ns/ldp

const logoutBtn = document.getElementById('logout');
const notifsList = document.getElementById('notifs');

async function loadNotifs() {
    console.info("loading notifs");
    getNotificationsForIri(iri);
}

async function getNotificationsForIri(inboxIri) {
    async function loadNotificationsFromIri(inboxIri) {
        const inboxDoc = await tripledoc.fetchDocument(inboxIri);
        const inbox = inboxDoc.getSubject(inboxIri);

        return inbox.getAllRefs(ldp.contains);
    }

    const notifs = await loadNotificationsFromIri(inboxIri);

    function addNotifToShownList(notifIRI) {
        let button = document.createElement("button");
        button.classList.add("list-group-item", "list-group-item-action");
        button.appendChild(document.createTextNode(notifIRI));
        notifsList.appendChild(button);
    }

    notifs.forEach(notifIRI => {
        addNotifToShownList(notifIRI);
    });
}

function init() {
    logoutBtn.addEventListener('click', logout);

    loadNotifs();
}

init();