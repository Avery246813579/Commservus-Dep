var APPLY_MODAL = document.getElementById('APPLY_MODAL');
var ID, START_TIME, END_TIME, APPLICATION;
/**{{JAVASCRIPT}}**/

//START_TIME = parseTime(START_TIME);
//END_TIME = parseTime(END_TIME);

var FORM = document.getElementById('FORM');

//var START_DATE = getInputDate(START_TIME);
//var END_DATE = getInputDate(END_TIME);
//getInputs(FORM, 'START_DATE').value = START_DATE[1] + "T" + START_DATE[0] + ":00";
//getInputs(FORM, 'END_DATE').value = END_DATE[1] + "T" + END_DATE[0]  + ":00";

var modals = document.getElementsByClassName("modal");
window.onclick = function (event) {
    for (var i = 0; i < modals.length; i++) {
        if (event.target == modals[i]) {
            modals[i].style.display = "none";
        }
    }
};

function apply() {
    APPLY_MODAL.style.display = "block";
}

function applyAction() {
    var START_DATE = getInputs(FORM, 'START_DATE').value;
    var END_DATE = getInputs(FORM, 'END_DATE').value;

    var ERROR = false;
    var SDS = START_DATE.split('T');
    var EDS = END_DATE.split('T');
    var SDSS = SDS[0].split('-');
    var EDSS = EDS[0].split('-');
    var sDate = parseTime(SDS[1] + ":00 " + SDSS[1] + "-" + SDSS[2] + "-" + SDSS[0]);
    var eDate = parseTime(EDS[1] + ":00 " + EDSS[1] + "-" + EDSS[2] + "-" + EDSS[0]);
    START_TIME.setMilliseconds(0);
    END_TIME.setMilliseconds(0);
    sDate.setMilliseconds(0);
    eDate.setMilliseconds(0);

    console.log(START_TIME);
    console.log(END_TIME);
    if (sDate.getTime() < START_TIME.getTime()) {
        START_DATE_STATUS.innerHTML = "Start date has to be within the events dates!";
        ERROR = true;
    } else if (eDate.getTime() > END_TIME.getTime()) {
        END_DATE_STATUS.innerHTML = "End date has to be within the events dates!";
        ERROR = true;
    } else {
        START_DATE_STATUS.innerHTML = "";
        END_DATE_STATUS.innerHTML = "";
    }

    if (ERROR) {
        return;
    }

    sendSimpleRequest('event/' + ID + "/apply", 'POST', {
        START_TIME: formatTime(sDate),
        END_TIME: formatTime(eDate)
    }, function (err, payload) {
        if (err) {
            console.log("INTERNAL ERROR");
            return;
        }

        if (payload.success) {
            setTimeout(function () {
                location.href = ID;
            }, 250);
        } else {
            console.dir(payload);
        }
    });
}

function viewApp(){
    var START_DATE = getInputDate(APPLICATION['START_TIME']);
    var END_DATE = getInputDate(APPLICATION['START_TIME']);
    getInputs(FORM, 'START_DATE').value = START_DATE[1] + "T" + START_DATE[0] + ":00";
    getInputs(FORM, 'END_DATE').value = END_DATE[1] + "T" + END_DATE[0]  + ":00";

    APPLY_MODAL.style.display = "block";
}

function viewAppAction(){
    START_DATE = getInputs(FORM, 'START_DATE').value;
    END_DATE = getInputs(FORM, 'END_DATE').value;

    var ERROR = false;
    var SDS = START_DATE.split('T');
    var EDS = END_DATE.split('T');
    var SDSS = SDS[0].split('-');
    var EDSS = EDS[0].split('-');
    var sDate = parseTime(SDS[1] + ":00 " + SDSS[1] + "-" + SDSS[2] + "-" + SDSS[0]);
    var eDate = parseTime(EDS[1] + ":00 " + EDSS[1] + "-" + EDSS[2] + "-" + EDSS[0]);
    START_TIME.setMilliseconds(0);
    END_TIME.setMilliseconds(0);
    sDate.setMilliseconds(0);
    eDate.setMilliseconds(0);

    console.log(START_TIME);
    console.log(END_TIME);
    if (sDate.getTime() < START_TIME.getTime()) {
        START_DATE_STATUS.innerHTML = "Start date has to be within the events dates!";
        ERROR = true;
    } else if (eDate.getTime() > END_TIME.getTime()) {
        END_DATE_STATUS.innerHTML = "End date has to be within the events dates!";
        ERROR = true;
    } else {
        START_DATE_STATUS.innerHTML = "";
        END_DATE_STATUS.innerHTML = "";
    }

    if (ERROR) {
        return;
    }

    sendSimpleRequest('event/' + ID + "/apply", 'POST', {
        START_TIME: formatTime(sDate),
        END_TIME: formatTime(eDate)
    }, function (err, payload) {
        if (err) {
            console.log("INTERNAL ERROR");
            return;
        }

        if (payload.success) {
            setTimeout(function () {
                location.href = ID;
            }, 250);
        } else {
            console.dir(payload);
        }
    });
}

function deleteApp(){
    sendSimpleRequest('event/' + ID + "/application", 'DELETE', {}, function (err, payload) {
        if (err) {
            console.log("INTERNAL ERROR");
            return;
        }

        if (payload.success) {
            setTimeout(function () {
                location.href = ID;
            }, 250);
        } else {
            console.dir(payload);
        }
    });
}

function deleteEvent_(){
    if(confirm("Are you sure you want to delete this event?")){
        if(confirm("You can not restore an event after it's deleted. Are you really sure you want to delete this event?")){
            sendSimpleRequest('event/' + ID, 'DELETE', {}, function (err, payload) {
                if (err) {
                    console.log("INTERNAL ERROR");
                    return;
                }

                if (payload.success) {
                    setTimeout(function () {
                        location.href = '../';
                    }, 250);
                } else {
                    console.dir(payload);
                }
            });
        }
    }
}