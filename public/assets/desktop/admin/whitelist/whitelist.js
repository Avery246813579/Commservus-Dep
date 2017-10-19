/**{{JAVASCRIPT}}**/

var modals = document.getElementsByClassName("modal");
window.onclick = function (event) {
    for (var i = 0; i < modals.length; i++) {
        if (event.target == modals[i]) {
            modals[i].style.display = "none";
        }
    }
};

function updateWhitelist(id){
    var CONTENT_ID = document.getElementById(id + '_CONTENT');
    var TYPE_ID = document.getElementById(id + '_TYPE');

    sendSimpleRequest('whitelist/' + id, 'PATCH', {CONTENT: CONTENT_ID.value, TYPE: TYPE_ID.value}, function(err, payload){
        if(err){
            console.log("Error");
            return;
        }

        if(payload.success){
            setTimeout(function(){
                location.reload();
            }, 250);
        }else{
            console.dir(payload);
        }
    });
}

var CREATE_CONTENT = document.getElementById('CREATE_CONTENT');
var CREATE_TYPE = document.getElementById('CREATE_TYPE');
function createWhitelist(){
    sendSimpleRequest('whitelist', 'POST', {CONTENT: CREATE_CONTENT.value, TYPE: CREATE_TYPE.value}, function(err, payload){
        if(err){
            console.log("Error");
            return;
        }

        if(payload.success){
            setTimeout(function(){
                location.reload();
            }, 250);
        }else{
            console.dir(payload);
        }
    });
}

function deleteWhitelist(id){
    sendSimpleRequest('whitelist/' + id, 'DELETE', {}, function(err, payload){
        if(err){
            console.log("Error");
            return;
        }

        if(payload.success){
            setTimeout(function(){
                location.reload();
            }, 250);
        }else{
            console.dir(payload);
        }
    });
}