const auth = require('solid-auth-client');

const loginBtn = document.getElementById('login');

auth.trackSession(session => {
    if (!session)
        console.log('The user is not logged in');
    else {
        console.info(`Logged in as ${session.webId}`);
        window.location.replace("/inbox");
    }
});

async function popupLogin() {
    loginBtn.disabled = true;
    let session = await auth.currentSession();
    let popupUri = 'https://solid.community/common/popup.html';
    if (!session)
        session = await auth.popupLogin({popupUri});
}

loginBtn.addEventListener('click', popupLogin);