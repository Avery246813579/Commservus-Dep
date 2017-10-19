var form = document.getElementById('form');

if(typeof form != "undefined" && form != null) {
    form.onsubmit = function (e) {
        e.preventDefault();

        change();
        return false;
    };
}

function change() {
    var PASSWORD = document.getElementById('password').value;
    var CONFIRM = document.getElementById('confirm').value;
    var STATUS = document.getElementById('STATUS');

    if(PASSWORD.length < 5){
        STATUS.innerHTML = "Password has to be more then 5 characters";
        return;
    }

    if(PASSWORD != CONFIRM){
        STATUS.innerHTML = "Passwords have to match";
        return;
    }

    sendSimpleRequest('forgot', 'PATCH', {TOKEN: QueryString().TOKEN, USERNAME: QueryString().USERNAME, PASSWORD: PASSWORD}, function(err, payload){
        if(err){
            STATUS.innerHTML = "Internal Error";
            return;
        }

        if(payload.success){
            STATUS.innerHTML = 'Password Updated. <a href="login">Log back in.</a>';
        }else{
            STATUS.innerHTML = payload.message;
        }
    });
}