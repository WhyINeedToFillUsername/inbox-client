const loginBtn = document.getElementById('login');

solid.auth.trackSession(session => {
    if (!session)
        console.log('The user is not logged in');
    else
        afterLoginSuccess(session.webId);
});

async function popupLogin() {
    let session = await solid.auth.currentSession();
    let popupUri = 'https://solid.community/common/popup.html';
    if (!session)
        session = await solid.auth.popupLogin({popupUri});

    afterLoginSuccess(session.webId);
}

function afterLoginSuccess(webId) {
    console.info(`Logged in as ${webId}`);
    window.location.replace("/inbox");
}

loginBtn.addEventListener('click', popupLogin);