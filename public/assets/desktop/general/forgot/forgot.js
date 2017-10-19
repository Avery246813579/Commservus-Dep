var FORM = document.getElementById('FORM');
var ID_STATUS = document.getElementById('ID');
var STATUS = document.getElementById('status');

FORM.onsubmit = function (e) {
    e.preventDefault();
    forgot();

    return false;
};

function forgot() {
    var ID = getInputs(FORM, 'ID').value;

    var ERROR = false;
    if (ID.length < 1) {
        ID_STATUS.innerHTML = "Username or Password has to be set";
        ERROR = true;
    }

    if (ERROR) {
        return;
    } else {
        ID_STATUS.innerHTML = "";
    }


    sendSimpleRequest('forgot', 'post', {ID: ID}, function (err, payload) {
        if (err) {
            console.log("ERROR: " + err);
            return;
        }

        if (payload.success) {
            STATUS.innerHTML = "An email has been sent with more instructions";
        } else {
            if(payload.code == 19){
                STATUS.innerHTML = "Email already sent in the last 24h!"
            }else{
                STATUS.innerHTML = "User not found";
            }
        }
    });
}