const auth = require('solid-auth-client');

module.exports = function (logoutButton) {
    return async function logout() {
        logoutButton.disabled = true;
        await auth.logout();
        window.location.replace("/");
    };
};

