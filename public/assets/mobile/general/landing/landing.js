var SEARCH_BAR = document.getElementById('search-bar');
var MENU = document.getElementById('menu');
var BLEED = document.getElementById('bleed');
var LOGIN_MODAL = document.getElementById('loginModal');
var SIGNUP_MODAL = document.getElementById('signupModal');
var FORGOT_MODAL = document.getElementById('forgotModal');
var BETA_MODAL = document.getElementById('alphaModal');
var search, menu;

firstLoad();
function firstLoad() {
    var modal = QueryString().popup;

    if (typeof modal == "undefined") {
        return;
    }

    modal = modal.toLowerCase();
    if (modal == "login") {
        openLogin();
    } else if (modal == "signup") {
        openSignup();
    } else if (modal == "forgot") {
        openForgot();
    } else if (modal == "alpha") {
        openBeta();
    }
}

window.onclick = function (event) {
    if (event.target == BLEED) {
        BLEED.style.display = "none";

        if (search) {
            SEARCH_BAR.style.display = "none";
            search = false;
        } else if (menu) {
            MENU.style.display = "none";
            menu = false;
        }
    }
};

function openSignup() {
    SIGNUP_MODAL.style.display = "block";
    LOGIN_MODAL.style.display = "none";
    FORGOT_MODAL.style.display = "none";
    BETA_MODAL.style.display = "none";
}

function openBeta() {
    SIGNUP_MODAL.style.display = "none";
    LOGIN_MODAL.style.display = "none";
    FORGOT_MODAL.style.display = "none";
    BETA_MODAL.style.display = "block";
}

function openSearch() {
    SEARCH_BAR.style.display = "block";
    BLEED.style.display = "block";
    MENU.style.display = "none";
    search = true;
}

function closeSearch() {
    SEARCH_BAR.style.display = "none";
    BLEED.style.display = "none";
    search = false;
}

function toggleMenu() {
    if (MENU.style.display == "block") {
        MENU.style.display = "none";
        BLEED.style.display = "none";
        menu = false;
        return;
    }

    MENU.style.display = "block";
    BLEED.style.display = "block";
    menu = true;
}

function openLogin() {
    LOGIN_MODAL.style.display = "block";
    SIGNUP_MODAL.style.display = "none";
    FORGOT_MODAL.style.display = "none";
    MENU.style.display = "none";
    BLEED.style.display = "none";
}

function openForgot() {
    LOGIN_MODAL.style.display = "none";
    SIGNUP_MODAL.style.display = "none";
    FORGOT_MODAL.style.display = "block";
    BETA_MODAL.style.display = "none";
    MENU.style.display = "none";
    BLEED.style.display = "none";
}

var loginForm = document.getElementById('loginForm');
loginForm.onsubmit = function (e) {
    e.preventDefault();
    loginAction();

    return false;
};

function loginAction() {
    var status = loginForm.getElementsByClassName('status')[0];
    var id = getInputs(loginForm, 'id').value;
    var password = getInputs(loginForm, 'password').value;

    if (id.length < 1) {
        status.innerHTML = "Username or Email has to be filled in!";
        return;
    }

    if (password.length < 1) {
        status.innerHTML = "Password has to be filled in!";
        return;
    }

    var BODY = {
        PASSWORD: password
    };

    if (validateEmail(id)) {
        BODY['EMAIL'] = id;
    } else {
        BODY['USERNAME'] = id;
    }


    sendSimpleRequest('login', 'POST', BODY, function (error, payload) {
        if (error) {
            status.innerHTML = "Client side internal error! Send help!";
            return;
        }

        if (payload.success) {
            if (typeof QueryString().redirect != "undefined") {
                location.href = QueryString().redirect;
                return;
            }

            location.reload();
        } else {
            if (payload.code == 16) {
                status.innerHTML = "Login credentials invalid";
            }
        }
    });
}

var signupForm = document.getElementById('signupForm');
signupForm.onsubmit = function (event) {
    event.preventDefault();
    signupAction();

    return false;
};

function signupAction() {
    var status = signupForm.getElementsByClassName('status')[0];
    var display = getInputs(signupForm, 'display').value;
    var username = getInputs(signupForm, 'username').value;
    var email = getInputs(signupForm, 'email').value;
    var password = getInputs(signupForm, 'password').value;
    var confirm = getInputs(signupForm, 'confirm').value;

    if (display.length < 1) {
        status.innerHTML = "Display name has to be set";
        return;
    }

    if (display.length > 70) {
        status.innerHTML = "Display name can't exceed 70 characters";
        return;
    }

    if (username.length < 4) {
        status.innerHTML = "Username has to be at least 4 characters";
        return;
    }

    if (username.length > 16) {
        status.innerHTML = "Username can't be more then 16 characters";
        return;
    }

    if (!/^\w+$/.test(username) && username.charAt(0) != "_") {
        status.innerHTML = "Username can only contain numbers, letters, or underscores (not in first position)";
        return;
    }

    if (email.length < 1) {
        status.innerHTML = "Email has to be set";
        return;
    }

    if (!validateEmail(email)) {
        status.innerHTML = "Email is invalid";
        return;
    }

    if (password.length < 5) {
        status.innerHTML = "Password has to be at least 5 characters";
        return;
    }

    if (password != confirm) {
        status.innerHTML = "Passwords don't match";
        return;
    }

    sendSimpleRequest('register', 'POST', {
        USERNAME: username,
        PASSWORD: password,
        EMAIL: email,
        DISPLAY_NAME: display
    }, function (error, payload) {
        if (error) {
            status.innerHTML = "Client side internal error";
            return;
        }

        if (payload.success) {
            location.reload();
        } else {
            if (payload.code == 38) {
                status.innerHTML = "Email domain is not whitelisted! Learn more <a href='beta?redirect=" + encodeURIComponent(window.location.href) + "'>here</a>!"
            } else if (payload.code == 6) {
                if (payload.CONFLICT == "EMAIL") {
                    status.innerHTML = "Email is already in use!"
                } else {
                    status.innerHTML = "Username is already in use!"
                }
            } else {
                status.innerHTML = "Internal error while creating account!";
                console.dir(payload);
            }
        }
    });
}

var forgotForm = document.getElementById('forgotForm');
forgotForm.onsubmit = function (event) {
    event.preventDefault();
    forgotAction();

    return false;
};

function forgotAction() {
    var status = forgotForm.getElementsByClassName('status')[0];
    var id = getInputs(forgotForm, 'id').value;

    if (id.length < 1) {
        status.innerHTML = "Please enter username or email";
        return;
    }

    sendSimpleRequest('forgot', 'POST', {ID: id}, function (error, payback) {
        if (error) {
            status.innerHTML = "Internal client side error";
            return;
        }

        if (payback.success) {
            status.innerHTML = "An email has been sent with more instructions";
        } else {
            if (payback.code == 19) {
                status.innerHTML = "Email already sent in the last 24h!"
            } else {
                status.innerHTML = "User not found";
            }
        }

    })
}

var modals = document.getElementsByClassName('modal');

for (var i = 0; i < modals.length; i++) {
    (function () {
        var modal = modals[i];
        modal.getElementsByClassName('close')[0].onclick = function () {
            modal.style.display = "none";

            if (typeof QueryString().popup != "undefined") {
                console.log("HERE");

                window.history.pushState({
                }, "", removeURLParameter(window.location.href, 'popup'));
            }
        }
    })();
}