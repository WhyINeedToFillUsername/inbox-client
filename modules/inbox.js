const rdfnamespaces = require('rdf-namespaces');
const tripledoc = require('tripledoc');
const auth = require('solid-auth-client');
const addAlert = require('./alerts');

const ldp = rdfnamespaces.ldp; // http://www.w3.org/ns/ldp

const logoutBtn = document.getElementById('logout');
const content = document.getElementById('content');
const submitBtn = document.getElementById('submit');
const webId = document.getElementById('webId').textContent;

const INBOX = {
    iri: "",
    notifs: []
};

const inboxes = [];

function addWatchedIri(iri) {
    function isAlreadyWatched(iriToAdd) {
        // return watchedIRIs.includes(iri);
        return inboxes.map(inbox => inbox.iri).find(existingIri => existingIri === iriToAdd)
    }

    function addInbox(iriToAdd) {
        // watchedIRIs.push(iri);
        inboxes.push({iri: iriToAdd, notifs: []});
    }

    if (isAlreadyWatched(iri)) {
        console.info("IRI already watched: " + iri);
    } else {
        addInbox(iri);
        console.info("IRI added to watch: " + iri);
    }
}

async function retrieveInbox(iri) {
    try {
        const iriDoc = await tripledoc.fetchDocument(iri);
        const subject = iriDoc.getSubject(iri);
        const inboxIri = subject.getRef(ldp.inbox);
        console.log(inboxIri);
        return inboxIri;
    } catch (err) {
        // addAlert('danger', "Error adding IRI '" + iri + "' to monitored inboxes.");
        return false;
    }
}

async function addIriToMonitor() {
    submitBtn.disabled = true;
    const iriInput = document.getElementById("resourceIri");
    const resourceIRI = iriInput.value;

    let inboxIri = await retrieveInbox(resourceIRI);
    if (inboxIri) {
        addWatchedIri(inboxIri);
        addAlert('success', "Successfully added IRI '" + inboxIri + "' to monitored inboxes!", true);
    } else {
        addAlert('danger', "Error adding resource to monitored inboxes - couldn't find inbox on the submitted IRI ('" + resourceIRI + "').");
    }
    submitBtn.disabled = false;
    iriInput.value = "";
}

async function loadNotifs() {
    console.info("loading notifs");
    inboxes.map(inbox => inbox.iri).forEach(iri => getNotificationsForIri(iri));
}

async function getNotificationsForIri(inboxIri) {
    async function loadNotificationsFromIri(inboxIri) {
        const inboxDoc = await tripledoc.fetchDocument(inboxIri);
        const inbox = inboxDoc.getSubject(inboxIri);

        return inbox.getAllRefs(ldp.contains);
    }

    const notifs = await loadNotificationsFromIri(inboxIri);

    content.append("IRI: " + inboxIri + "\n");
    notifs.forEach(value => {
        content.append(value + "\n");
    });
    content.append("\n...\n\n");
}

async function getNotifications() {
    action2Btn.disabled = true;

    async function loadNotificationsFromIri(inboxIri) {
        const inboxDoc = await tripledoc.fetchDocument(inboxIri);
        const inbox = inboxDoc.getSubject(inboxIri);

        return inbox.getAllRefs(ldp.contains);
    }

    const inboxIri = await getInboxIri();
    const notifs = await loadNotificationsFromIri(inboxIri);
    notifs.forEach(value => {
        content.append(value + "\n");
    });

    action2Btn.disabled = false;
}

function logout() {
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

    logoutBtn.disabled = true;
    auth.logout().then(function () {
        destroySessionOnServer();
    });
}

logoutBtn.addEventListener('click', logout);
submitBtn.addEventListener('click', addIriToMonitor);

window.setInterval(loadNotifs, 1000 * 10);