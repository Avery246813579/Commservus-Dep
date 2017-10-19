var FORM = document.getElementById('FORM');

var DATE = inputDate();
getInputs(FORM, 'START_DATE').value = DATE[1] + "T" + DATE[0];
getInputs(FORM, 'END_DATE').value = DATE[1] + "T" + DATE[0];

var STATUS = document.getElementById('status');

function createEvent_() {
    var NAME = getInputs(FORM, 'NAME').value;
    var DESCRIPTION = getInputs(FORM, 'DESCRIPTION').value;
    var START_DATE = getInputs(FORM, 'START_DATE').value;
    var END_DATE = getInputs(FORM, 'END_DATE').value;
    var LOCATION = getInputs(FORM, 'LOCATION').value;
    var DROP = getInputs(FORM, 'DROP').value;

    var ERROR = false;
    if (NAME.length < 5 || NAME.length > 128) {
        STATUS.innerHTML = "Display name has to be between 5-128 characters";
        return;
    }

    if (DESCRIPTION.length < 1) {
        STATUS.innerHTML = "Description has to be a least 5 characters";
        return;
    }

    if(LOCATION.length < 1){
        STATUS.innerHTML = "Location has to be set";
        return;
    }

    var SDS = START_DATE.split('T');
    var EDS = END_DATE.split('T');
    var SDSS = SDS[0].split('-');
    var EDSS = EDS[0].split('-');
    var sDate = parseTime(SDS[1] + ":00 " + SDSS[1] + "-" + SDSS[2] + "-" + SDSS[0]);
    var eDate = parseTime(EDS[1] + ":00 " + EDSS[1] + "-" + EDSS[2] + "-" + EDSS[0]);
    var cDate = getServerTime();

    if (cDate.getTime() > sDate.getTime()) {
        STATUS.innerHTML = "Start date has to be in the future!";
        return;
    } else if (sDate.getTime() > eDate.getTime()) {
        STATUS.innerHTML = "End date has to be later then the start date!";
        return;
    } else {
        STATUS.innerHTML = '';
        STATUS.innerHTML = '';
    }

    if (ERROR) {
        return;
    }

    sendSimpleRequest('organization/' + ID + "/event", 'post', {
        NAME: NAME,
        DESCRIPTION: DESCRIPTION,
        TYPE: DROP,
        LOCATION: LOCATION,
        START_TIME: formatTime(sDate),
        END_TIME: formatTime(eDate)
    }, function (err, payload) {
        if (err) {
            console.log("INTERNAL ERROR");
            return;
        }

        if (payload.success) {
            setTimeout(function(){
                location.href = window.location.origin + "/event/" + payload['data'];
            }, 250);
        } else {
            console.dir(payload);
        }
    });
}