addAlert = function (level, message, autoDismiss) {
    $(document.body).prepend('<div class="alert alert-' + level + ' alert-dismissible fade show" role="alert">\n' +
        '            ' + message +
        '            <button type="button" class="close" data-dismiss="alert" aria-label="Close">\n' +
        '                <span aria-hidden="true">&times;</span>\n' +
        '            </button>\n' +
        '        </div>');

    if (autoDismiss) {
        window.setTimeout(function () {
            $(".alert").first().alert('close')
        }, 10000);
    }
};

module.exports = addAlert;