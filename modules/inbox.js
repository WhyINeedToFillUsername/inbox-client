const rdfnamespaces = require('rdf-namespaces');
const tripledoc = require('tripledoc');
const auth = require('solid-auth-client');
const addAlert = require('./alerts');
const pod = require('./pod');

const ldp = rdfnamespaces.ldp; // http://www.w3.org/ns/ldp

const logoutBtn = document.getElementById('logout');
const submitBtn = document.getElementById('submit');
const inboxList = document.getElementById('inboxes');

let inboxes = []; // INBOX = {iri: "", notifs: []};
let webID = "";


async function addWatchedInboxIRI(inboxIRI) {
    function isAlreadyWatched(iriToAdd) {
        return inboxes.map(inbox => inbox.iri).find(existingIri => existingIri === iriToAdd)
    }

    function saveToPod(inboxIRI) {
        tripledoc.fetchDocument(webID)
            .then(profileDoc => {
                return profileDoc.getSubject(webId);
            })
            .then(profile => {
                return pod.getWatchedInboxesListDocument(profile)
            }).then(watchedInboxesDoc => {

            const result = pod.addWatchedInbox(inboxIRI, watchedInboxesDoc);
            // console.log(result);
        })
            .catch(error => console.error(error));
    }

    async function addInbox(iriToAdd) {
        inboxes.push({iri: iriToAdd});
        // await sendMonitoredInboxToServer(inboxIRI);
        saveToPod(inboxIRI);
        addInboxToShownList(inboxIRI);
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
        addAlert('danger', "Error adding IRI '" + iri + "' to monitored inboxes.");
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
                // console.log("new notif!"); // TODO create system notif!
                addAlert('primary', "new notification! + href", true);
            }
        }
    }

    function getNotificationsForIri(inboxIri) {
        return tripledoc.fetchDocument(inboxIri).then(
            inboxDoc => {
                const inbox = inboxDoc.getSubject(inboxIri);
                return inbox.getAllRefs(ldp.contains);
            }).catch(error => {
            if (error.toString().includes("403"))
                addAlert("warning", "error fetching data from inbox '" + inboxIri + "'. Make sure you have access!");
            else console.error(error);
        });
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

function loadMonitoredInboxesFromPod(webId) {
    // 1) get solid profile
    tripledoc.fetchDocument(webId)
        .then(profileDoc => {
            return profileDoc.getSubject(webId);
        })
        .then(profile => {

    // 2) on the profile, get/create document that stores the watched inboxes list
            return pod.getWatchedInboxesListDocument(profile)
        }).then(inboxesDocumentFromPod => {

    // 3) from the document, get all subjects of class schema.URL
        inboxesDocumentFromPod.getAllSubjectsOfType(rdfnamespaces.schema.URL)
            .forEach(node => {

    // 4) each has the url saved as type string
                const inboxIRI = node.getString();
                inboxes.push({iri: inboxIRI});
                addInboxToShownList(inboxIRI);
            });
        console.log(inboxesDocumentFromPod);
    })
        .catch(error => {
            console.error("error retrieving monitored inbox from server: ", error);
            addAlert('warning', "error retrieving monitored inbox from server: " + error);
        });
}

function init(session) {
    logoutBtn.addEventListener('click', logout);
    submitBtn.addEventListener('click', addIriToMonitor);
    webID = session.webId;

    loadMonitoredInboxesFromPod(webID);

    // start monitoring notifications in inboxes
    window.setInterval(loadNotifs, 1000 * 10);
}

auth.trackSession(session => {
    if (!session) {
        console.log('The user is not logged in');
        window.location.replace("/");
    } else
        init(session);
});
