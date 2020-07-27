const rdfnamespaces = require('rdf-namespaces');
const tripledoc = require('tripledoc');
const auth = require('solid-auth-client');
const addAlert = require('./alerts');

const ldp = rdfnamespaces.ldp; // http://www.w3.org/ns/ldp

const logoutBtn = document.getElementById('logout');
const submitBtn = document.getElementById('submit');
const inboxList = document.getElementById('inboxes');

let inboxes = []; // INBOX = {iri: "", notifs: []};

async function sendMonitoredInboxToServer(inboxIRI) {
    const response = await fetch("inbox/monitor", {
        method: 'post',
        body: JSON.stringify({inboxIRI: inboxIRI}),
        headers: {"Content-type": "application/json"},
        credentials: "include"
    });

    if (response.ok)
        console.log("success submitting monitored inbox on server: " + inboxIRI);
    else
        console.error("error submitting monitored inbox on server: " + inboxIRI);
}

async function addWatchedInboxIRI(inboxIRI) {
    function isAlreadyWatched(iriToAdd) {
        return inboxes.map(inbox => inbox.iri).find(existingIri => existingIri === iriToAdd)
    }

    async function addInbox(iriToAdd) {
        // watchedIRIs.push(iri);
        inboxes.push({iri: iriToAdd});
        await sendMonitoredInboxToServer(inboxIRI);
        addInboxToShownList(inboxIRI)
    }

    if (isAlreadyWatched(inboxIRI)) {
        console.info("IRI already being watched: " + inboxIRI);
    } else {
        await addInbox(inboxIRI);
        console.info("IRI added to watch: " + inboxIRI);
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
        await addWatchedInboxIRI(inboxIri);
        addAlert('success', "Successfully added IRI '" + inboxIri + "' to monitored inboxes!", true);
    } else {
        addAlert('danger', "Error adding resource to monitored inboxes - couldn't find inbox on the submitted IRI ('" + resourceIRI + "').");
    }
    submitBtn.disabled = false;
    iriInput.value = "";
}

function loadNotifs() {

    function compareAndNotify(oldNotifs, newNotifs) {
        for (const newNotif of newNotifs) {
            if (!oldNotifs.includes(newNotif)) {
                console.log("new notif!"); // TODO create system notif!
                addAlert('primary', "new notification! + href", true);
            }
        }
    }

    async function getNotificationsForIri(inboxIri) {
        const inboxDoc = await tripledoc.fetchDocument(inboxIri);
        const inbox = inboxDoc.getSubject(inboxIri);

        return inbox.getAllRefs(ldp.contains);
    }

    console.info("loading notifs");
    for (const inbox of inboxes) {
        const iri = inbox.iri;
        getNotificationsForIri(iri).then(newNotifs => {
            if (inbox.notifs) compareAndNotify(inbox.notifs, newNotifs);
            inbox.notifs = newNotifs;
        });
    }
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

function addInboxToShownList(inboxIRI) {
    let a = document.createElement("a");
    a.href = "/inbox/detail/" + encodeURIComponent(inboxIRI);
    a.classList.add("list-group-item", "list-group-item-action");
    a.appendChild(document.createTextNode(inboxIRI));
    inboxList.appendChild(a);
}

function loadMonitoredInboxesFromServer() {
    const url = "/inbox/monitor";

    fetch(url, {
        method: 'get',
        credentials: "include"
    })
        .then(response => response.json())
        .then(data => {
            data.forEach(inboxIRI => {
                inboxes.push({iri: inboxIRI});
                addInboxToShownList(inboxIRI);
            });

            console.log("success retrieving monitored inbox from server.");
        }).catch(error => {
        console.error("error retrieving monitored inbox from server: ", error);
    });
}

function init() {
    logoutBtn.addEventListener('click', logout);
    submitBtn.addEventListener('click', addIriToMonitor);

    loadMonitoredInboxesFromServer();

    window.setInterval(loadNotifs, 1000 * 10);
}

init();