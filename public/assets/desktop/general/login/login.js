var FORM = document.getElementById('FORM');
var ID_STATUS = document.getElementById('ID');
var PASSWORD_STATUS = document.getElementById('PASSWORD');
var STATUS = document.getElementById('status');

FORM.onsubmit = function (e) {
    e.preventDefault();
    login();

    return false;
};

function login() {
    var ID = getInputs(FORM, 'ID').value;
    var PASSWORD = getInputs(FORM, 'PASSWORD').value;

    var ERROR = false;
    if (ID.length < 1) {
        ID_STATUS.innerHTML = "Username has to be set";
        ERROR = true;
    }else{
        ID_STATUS.innerHTML = "";
    }

    if (PASSWORD.length < 1) {
        PASSWORD_STATUS.innerHTML = "Password has to be set";
        ERROR = true;
    }else{
        PASSWORD_STATUS.innerHTML = "";
    }

    if (ERROR) {
        return;
    }

    var LOGIN = {
        PASSWORD: PASSWORD
    };

    if (validateEmail(ID)) {
        LOGIN['EMAIL'] = ID;
    } else {
        LOGIN['USERNAME'] = ID;
    }

    sendSimpleRequest('login', 'post', LOGIN, function (err, payload) {
        if (err) {
            console.log("ERROR: " + err);
            return;
        }

        if (payload.success) {
            console.dir(QueryString().redirect);

            if(typeof QueryString().redirect != "undefined"){
                location.href = QueryString().redirect;
                return;
            }

            location.href = "../";
        } else {
            if(payload.code == 16){
                STATUS.innerHTML = "Login credentials invalid";
            }else{
                STATUS.innerHTML = "Internal error";
                console.dir(payload);
            }
        }
    });
}