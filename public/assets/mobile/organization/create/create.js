function createOrg() {
    var DISPLAY_INPUT = document.getElementById('displayInput').value;
    var USERNAME_INPUT = document.getElementById('usernameInput').value;
    var DESCRIPTION_INPUT = document.getElementById('descriptionInput').value;
    var TYPE_INPUT = document.getElementById('typeInput').value;
    var STATUS = document.getElementById('status');

    if (DISPLAY_INPUT.length < 1) {
        STATUS.innerHTML = "Name has to be set.";
        return;
    }

    if(DISPLAY_INPUT.length > 64){
        STATUS.innerHTML = "Name can't be more then 64 characters";
        return;
    }

    if (USERNAME_INPUT.length < 1) {
        STATUS.innerHTML = "Username has to be set.";
        return;
    }

    if (USERNAME_INPUT.length < 5) {
        STATUS.innerHTML = "Username ahs to be at least 5 characters";
        return;
    }

    if (USERNAME_INPUT.length > 16) {
        STATUS.innerHTML = "Username can only be 16 characters at most";
        return;
    }

    if (!/^\w+$/.test(USERNAME_INPUT) && USERNAME_INPUT.charAt(0) != "_") {
        STATUS.innerHTML = "Username can only contain numbers, letters, or underscores (not in first position)";
        return;
    }

    if(DESCRIPTION_INPUT.length < 1){
        STATUS.innerHTML = "A description has to be set";
        return;
    }

    if(TYPE_INPUT != 0 && TYPE_INPUT != 1){
        STATUS.innerHTML = "Internal error? Code injection?";
        return;
    }

    sendSimpleRequest('/organization', 'POST', {NAME: DISPLAY_INPUT, DESCRIPTION: DESCRIPTION_INPUT, TYPE: TYPE_INPUT, USERNAME: USERNAME_INPUT}, function(error, payload){
        if(error){
            STATUS.innerHTML = "Internal Client Error";
            return;
        }

        if(payload.success){
            setTimeout(function(){
                location.href = "organization/" + payload.data.id;
            }, 250)
        }else{
            if(payload.code){
                STATUS.innerHTML = "You already have an organization";
            }else{
                STATUS.innerHTML = "Internal Error";
            }
        }
    });
    console.log(TYPE_INPUT);
}