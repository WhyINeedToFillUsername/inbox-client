const auth = require('solid-auth-client');

module.exports = function (logoutButton) {
    return function logout() {
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

        logoutButton.disabled = true;
        auth.logout().then(function () {
            destroySessionOnServer();
        });
    };
};

