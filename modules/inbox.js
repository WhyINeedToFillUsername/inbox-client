const rdfnamespaces = require('rdf-namespaces');
const tripledoc = require('tripledoc');
const auth = require('solid-auth-client');
const addAlert = require('./alerts');
const pod = require('./pod');
const discover = require('./inbox-discover');
const notification = require('./submodules/notifications');

const logoutBtn = document.getElementById('logout');
const logout = require('./solid-logout')(logoutBtn);

const submitBtn = document.getElementById('submit');
const inboxList = document.getElementById('inboxes');
const requestNotificationsBtn = document.getElementById('requestNotifications');

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
        console.info("IRI already being watched: ", inboxIRI);
    } else {
        await addInbox(inboxIRI);
        console.info("IRI added to watch: ", inboxIRI);
    }
}

async function addIriToMonitor() {
    submitBtn.disabled = true;
    const iriInput = document.getElementById("resourceIri");
    const resourceIRI = iriInput.value;

    let inboxIri = await discover.discoverInbox(resourceIRI);
    if (inboxIri) {
        await addWatchedInboxIRI(inboxIri);
        addAlert('success', "Successfully added IRI '" + inboxIri + "' to monitored inboxes!", true);
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
                return inbox.getAllRefs(rdfnamespaces.ldp.contains);
            }).catch(error => {
            if (error.toString().includes("403"))
                addAlert("warning", "error fetching data from inbox '" + inboxIri + "'. Make sure you have access!");
            else console.error(error);
        });
    }

    for (const inbox of inboxes) {
        const iri = inbox.iri;
        getNotificationsForIri(iri).then(newNotifs => {
            if (inbox.notifs) compareAndNotify(inbox.notifs, newNotifs);
            inbox.notifs = newNotifs;
        });
    }
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

    const webIdAnchor = document.getElementById("webId");
    webIdAnchor.href = webID;
    webIdAnchor.innerHTML = webID;

    loadMonitoredInboxesFromPod(webID);

    // init notification module
    notification.init(requestNotificationsBtn);
    document.getElementById('testNotif').addEventListener('click', notification.createSimpleNotification);

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
