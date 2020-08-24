const addAlert = require('./alerts');

module.exports = {
    createSimpleNotification: function (title, message) {
        const img = '/favicon.ico';
        const options = {
            body: message,
            icon: img,
            tag: "new-message", // An ID for a given notification that allows you to find, replace, or remove the notification using a script if necessary.
            badge: img, // URL of an image to represent the notification when there is not enough space to display the notification itself
            renotify: true
        };
        new Notification(title, options);
    },

    init: function (enableBtn) {
        enableBtn.addEventListener('click', event => {
            askNotificationPermission(event.target)
        });
        setEnableButtonState(enableBtn);
    }
};


//// private

function setEnableButtonState(enableBtn) {
    // set the button to disabled or enabled, depending on what the user answers
    if (Notification.permission === 'denied' || Notification.permission === 'default') {
        enableBtn.disabled = false;
    } else {
        enableBtn.disabled = true;
    }
}

// check whether the browser supports the promise version of notifs
function checkNotificationPromise() {
    try {
        Notification.requestPermission().then();
    } catch (e) {
        return false;
    }

    return true;
}

function askNotificationPermission(enableBtn) {
    // function to actually ask the permissions
    function handlePermission(permission) {
        // Whatever the user answers, we make sure Chrome stores the information
        if (!('permission' in Notification)) {
            Notification.permission = permission;
        }
        setEnableButtonState(enableBtn);
    }

    // Let's check if the browser supports notifications
    if (!('Notification' in window)) {
        const message = "This browser does not support notifications.";
        addAlert('warning', message);
        console.error(message);
    } else {
        if (checkNotificationPromise()) {
            Notification.requestPermission()
                .then((permission) => {
                    handlePermission(permission);
                })
        } else {
            Notification.requestPermission(function (permission) {
                handlePermission(permission);
            });
        }
    }
}
