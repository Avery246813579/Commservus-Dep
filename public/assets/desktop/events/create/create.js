var FORM = document.getElementById('FORM');
var NAME_STATUS = document.getElementById('NAME');
var DESCRIPTION_STATUS = document.getElementById('DESCRIPTION_STATUS');
var START_DATE_STATUS = document.getElementById('START_DATE');
var END_DATE_STATUS = document.getElementById('END_DATE');
var DROP_STATUS = document.getElementById('DROP');
var LOCATION_STATUS = document.getElementById('LOCATION_STATUS');

var DATE = inputDate();
getInputs(FORM, 'START_DATE').value = DATE[1] + "T" + DATE[0];
getInputs(FORM, 'END_DATE').value = DATE[1] + "T" + DATE[0];

FORM.onsubmit = function (e) {
    e.preventDefault();
    create();

    return false;
};

function create() {
    var NAME = getInputs(FORM, 'NAME').value;
    var LOCATION = getInputs(FORM, 'LOCATION').value;
    var DESCRIPTION = getInputs(FORM, 'DESCRIPTION').value;
    var START_DATE = getInputs(FORM, 'START_DATE').value;
    var END_DATE = getInputs(FORM, 'END_DATE').value;
    var DROP = getInputs(FORM, 'DROP').value;

    var ERROR = false;
    if (NAME.length < 5 || NAME.length > 128) {
        NAME_STATUS.innerHTML = "Display name has to be between 5-128 characters";
        ERROR = true;
    }

    if (DESCRIPTION.length < 1) {
        DESCRIPTION_STATUS.innerHTML = "Description has to be a least 5 characters";
        ERROR = true;
    }

    if(LOCATION.length < 1){
        LOCATION_STATUS.innerHTML = "Location has to be set";
        ERROR = true;
    }

    var SDS = START_DATE.split('T');
    var EDS = END_DATE.split('T');
    var SDSS = SDS[0].split('-');
    var EDSS = EDS[0].split('-');
    var sDate = parseTime(SDS[1] + ":00 " + SDSS[1] + "-" + SDSS[2] + "-" + SDSS[0]);
    var eDate = parseTime(EDS[1] + ":00 " + EDSS[1] + "-" + EDSS[2] + "-" + EDSS[0]);
    var cDate = getServerTime();

    if (cDate.getTime() > sDate.getTime()) {
        START_DATE_STATUS.style.display = "block";
        START_DATE_STATUS.innerHTML = "Start date has to be in the future!";
        ERROR = true;
    } else if (sDate.getTime() > eDate.getTime()) {
        END_DATE_STATUS.style.display = "block";
        END_DATE_STATUS.innerHTML = "End date has to be later then the start date!";
        START_DATE_STATUS.innerHTML = "";
        ERROR = true;
    } else {
        END_DATE_STATUS.innerHTML = '';
        START_DATE_STATUS.innerHTML = '';
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