const loginBtn = document.getElementById('login');

solid.auth.trackSession(session => {
    if (!session)
        console.log('The user is not logged in');
    else
        afterLoginSuccess(session);
});

async function popupLogin() {
    loginBtn.disabled = true;
    let session = await solid.auth.currentSession();
    let popupUri = 'https://solid.community/common/popup.html';
    if (!session)
        session = await solid.auth.popupLogin({popupUri});
}

function afterLoginSuccess(session) {
    console.info(`Logged in as ${session.webId}`);
    sendSolidSessionToServer(session);
}

function sendSolidSessionToServer(session) {
    var xhr = new XMLHttpRequest();
    var url = "/login";
    var data = JSON.stringify(session);

    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            // do something with response
            console.log(xhr.responseText);
            window.location.replace("/inbox");
        }
    };
    xhr.send(data);
}

loginBtn.addEventListener('click', popupLogin);