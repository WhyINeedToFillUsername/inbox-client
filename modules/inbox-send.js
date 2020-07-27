const iriToInput = document.getElementById('iriTo');
const notifContentInput = document.getElementById('notifContent');
const sendNotifBtn = document.getElementById('sendNotif');

function submitForm() {
    sendNotifBtn.disabled = true;
    let iriTo = iriToInput.value;
    let notifContent = notifContentInput.value;



    iriToInput.value = "";
    notifContentInput.value = "";
    sendNotifBtn.disabled = false;
}

sendNotifBtn.addEventListener('click', submitForm);
