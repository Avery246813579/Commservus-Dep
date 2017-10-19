var FORM = document.getElementById('FORM');
var DISPLAY_NAME_STATUS = document.getElementById('DISPLAY_NAME');
var USERNAME_STATUS = document.getElementById('USERNAME');
var EMAIL_STATUS = document.getElementById('EMAIL');
var PASSWORD_STATUS = document.getElementById('PASSWORD');
var CONFIRM_PASSWORD_STATUS = document.getElementById('CONFIRM_PASSWORD');
var STATUS = document.getElementById('status');

FORM.onsubmit = function (e) {
    e.preventDefault();

    register();
    return false;
};

function register() {
    var DISPLAY_NAME = getInputs(FORM, 'DISPLAY_NAME').value;
    var USERNAME = getInputs(FORM, 'USERNAME').value;
    var EMAIL = getInputs(FORM, 'EMAIL').value;
    var PASSWORD = getInputs(FORM, 'PASSWORD').value;
    var CONFIRM_PASSWORD = getInputs(FORM, 'CONFIRM_PASSWORD').value;

    var ERROR = false;
    if (DISPLAY_NAME.length < 1 || DISPLAY_NAME.length > 70) {
        DISPLAY_NAME_STATUS.innerHTML = "Display Name out of bounds (1-70)";
        ERROR = true;
    } else {
        DISPLAY_NAME_STATUS.innerHTML = "";
    }

    if (EMAIL.length < 1) {
        EMAIL_STATUS.innerHTML = "Email has to be set";
        ERROR = true;
    } else if (!validateEmail(EMAIL)) {
        EMAIL_STATUS.innerHTML = "Email invalid format";
        ERROR = true;
    } else {
        EMAIL_STATUS.innerHTML = "";
    }

    if (USERNAME.length < 4 || USERNAME.length > 16) {
        USERNAME.innerHTML = "Username out of bounds (4-16)";
        ERROR = true;
    } else if (!/^\w+$/.test(USERNAME) && USERNAME.charAt(0) != "_") {
        USERNAME.innerHTML = "Username can only contain letters, numbers, and underscores (underscore can not be the first character)";
        ERROR = true;
    } else {
        USERNAME.innerHTML = "";
    }

    if (PASSWORD.length < 5) {
        PASSWORD_STATUS.innerHTML = "Password has to be greater then 5 characters";
        ERROR = true;
    } else {
        PASSWORD_STATUS.innerHTML = "";
    }

    if (PASSWORD != CONFIRM_PASSWORD) {
        CONFIRM_PASSWORD_STATUS.innerHTML = "Passwords have to match";
        ERROR = true;
    } else {
        CONFIRM_PASSWORD_STATUS.innerHTML = "";
    }

    if (ERROR) {
        return;
    }

    sendSimpleRequest('register', 'post', {
        DISPLAY_NAME: DISPLAY_NAME,
        USERNAME: USERNAME,
        PASSWORD: PASSWORD,
        EMAIL: EMAIL
    }, function (err, payload) {
        if (err) {
            console.log("ERROR: " + err);
            return;
        }

        if (payload.success) {
            location.href = "/";
        } else {
            if (payload.code == 38) {
                console.log(encodeURIComponent(window.location.href));
                STATUS.innerHTML = "Email domain is not whitelisted! Learn more <a href='beta?redirect=" + encodeURIComponent(window.location.href) + "'>here</a>!"
            } else if (payload.code == 6) {
                if (payload.CONFLICT == "EMAIL") {
                    STATUS.innerHTML = "Email is already in use!"
                } else {
                    STATUS.innerHTML = "Username is already in use!"
                }
            } else {
                STATUS.innerHTML = "Internal error creating account!";
                console.dir(payload);
            }
        }
    });
}