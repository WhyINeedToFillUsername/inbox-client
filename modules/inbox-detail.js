const rdfnamespaces = require('rdf-namespaces');
const tripledoc = require('tripledoc');
const auth = require('solid-auth-client');
const solid = require('solid-auth-client');
const pod = require('./pod');

// init logout module
const logoutBtn = document.getElementById('logout');
const logout = require('./solid-logout')(logoutBtn);

const stopMonitorBtn = document.getElementById('stopMonitor');
const notifsList = document.getElementById('notifs');

let webId = "";

async function loadNotifs() {
    console.info("loading notifs");
    getNotificationsForInboxIri(iri);
}

async function getNotificationsForInboxIri(inboxIri) {
    async function loadNotificationIrisFromInboxIri(inboxIri) {
        const inboxDoc = await tripledoc.fetchDocument(inboxIri);
        const inbox = inboxDoc.getSubject(inboxIri);

        const notificationIris = inbox.getAllRefs(rdfnamespaces.ldp.contains);
        // console.log("loaded iris", notificationIris);
        return notificationIris;
    }

    async function loadNotificationContent(notifIri, i) {
        // using solid instead of tripledoc to fetch raw document - tripledoc requires text/turtle, can't convert some notifs => 500 from solid server
        solid.fetch(notifIri)
            .then(response => response.text())
            .then(data => {
                // console.log("fetched iri", notifIri, data);
                addNotifToShownList(notifIri, data, i);
            });
    }

    function addNotifToShownList(notifIRI, content, i) {
        let div = document.createElement("div");
        div.classList.add("card");
        let escapedContent = $("<div>").text(content).html();
        div.innerHTML = `
        <div class="card-header" id="heading${i}"><h2 class="mb-0"><button class="btn btn-link btn-block text-left collapsed"
            type="button" data-toggle="collapse" data-target="#collapse${i}" aria-expanded="false" aria-controls="collapse${i}">
                    ${notifIRI}
                    <i class="fas fa-chevron-down close"></i>
        </button> </h2> </div>

        <div id="collapse${i}" class="collapse" aria-labelledby="heading${i}" data-parent="#notifs"> <div class="card-body">
            <pre class="text-wrap">${escapedContent}</pre>
        </div> </div>
        `;
        notifsList.appendChild(div);
    }

    const notifs = await loadNotificationIrisFromInboxIri(inboxIri);
    let i = 0;
    for (const notifIRI of notifs) {
        loadNotificationContent(notifIRI, i++);
    }
}


async function stopMonitor() {
    stopMonitorBtn.disabled = true;

    // try removing from watched inboxes
    await tripledoc.fetchDocument(webId)
        .then(profileDoc => {
            return profileDoc.getSubject(webId);
        })
        .then(profile => {
            return pod.getWatchedInboxesListDocument(profile)
        }).then(watchedInboxesDoc => {

            pod.removeWatchedInbox(iri, watchedInboxesDoc);
        })
        .catch(error => console.error(error));

    // redirect home
    stopMonitorBtn.disabled = false;
    window.location.replace("/inbox");
}

function init(session) {
    webId = session.webId;

    const webIdAnchor = document.getElementById("webId");
    webIdAnchor.href = webId;
    webIdAnchor.innerHTML = webId;

    logoutBtn.addEventListener('click', logout);
    stopMonitorBtn.addEventListener('click', stopMonitor);

    loadNotifs();
}

auth.trackSession(session => {
    if (!session) {
        console.log('The user is not logged in');
        window.location.replace("/");
    } else
        init(session);
});
