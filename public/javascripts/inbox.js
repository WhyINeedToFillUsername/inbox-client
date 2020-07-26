const rdfnamespaces = require('rdf-namespaces');
const tripledoc = require('tripledoc');

const foaf = rdfnamespaces.foaf;
const ldp = rdfnamespaces.ldp.Resource; // http://www.w3.org/ns/ldp#Resource


async function getName(webId) {
    /* 1. Fetch the Document at `webId`: */
    const webIdDoc = await tripledoc.fetchDocument(webId);
    /* 2. Read the Subject representing the current user's profile: */
    const profile = webIdDoc.getSubject(webId);
    /* 3. Get their foaf:name: */
    return profile.getString(foaf.name)
}


const logoutBtn = document.getElementById('logout');
const content = document.getElementById('content');

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
    solid.auth.logout().then(function () {
        destroySessionOnServer();
    });
}

function loadInbox() {
    solid.auth.fetch("https://nokton.solid.community/inbox/")
        .then(function (data) {
            console.log(data);
            content.append(data);
        });
}

logoutBtn.addEventListener('click', logout);
loadInbox();