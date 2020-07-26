const rdfnamespaces = require('rdf-namespaces');
const tripledoc = require('tripledoc');
const auth = require('solid-auth-client');

const ldp = rdfnamespaces.ldp; // http://www.w3.org/ns/ldp

const logoutBtn = document.getElementById('logout');
const content = document.getElementById('content');
const submitBtn = document.getElementById('submit');
const webId = document.getElementById('webId').textContent;

const watchedIRIs = [];

function addWatchedIri(iri) {
    if (watchedIRIs.includes(iri)) {
        console.info("IRI already watched: " + iri);
    } else {
        watchedIRIs.push(iri);
        console.info("IRI added to watch: " + iri);
    }
}

async function addIriToMonitor() {
    submitBtn.disabled = true;
    const iriInput = document.getElementById("resourceIri");

    const iri = iriInput.value;
    try {
        const iriDoc = await tripledoc.fetchDocument(iri);
        const subject = iriDoc.getSubject(iri);
        const inboxIri = subject.getRef(ldp.inbox);

        console.log(inboxIri);
        addWatchedIri(inboxIri);

    } catch (err) {
        alert(err);
    }

    submit.disabled = false;
    iriInput.value = "";
}

async function loadNotifs() {
    console.info("loading notifs");
    watchedIRIs.forEach(iri => getNotificationsForIri(iri));
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