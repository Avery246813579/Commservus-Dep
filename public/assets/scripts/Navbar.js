var ICON_MODE = false, ACCOUNT_ICON_MODE = false, NAV_RESIZE_WIDTH = 750;
var NAVBAR = document.getElementById('_nav');

window.onresize = checkIcons;
window.onscroll = function (e) {
    if (window.mobileAndTabletcheck()) {
        return;
    }

    NAVBAR.style.left = -window.scrollX + "px";
};

var NAV_ICONS = NAVBAR.getElementsByTagName('a');
checkIcons();
function checkIcons() {
    if (NAV_RESIZE_WIDTH > getWidth() && ICON_MODE == false) {
        ICON_MODE = true;

        for (var i = 0; i < NAV_ICONS.length; i++) {
            if (NAV_ICONS[i].classList.contains("_nonav")) {
                continue;
            }

            NAV_ICONS[i].getElementsByClassName('name')[0].style.display = "none";
            NAV_ICONS[i].classList.add("nav-tooltip");
            NAV_ICONS[i].getElementsByClassName('tooltiptext')[0].style.display = "block";

            (function () {
                var NAV = NAV_ICONS[i];
                NAV_ICONS[i].onmouseover = function () {
                    NAV.getElementsByClassName('tooltiptext')[0].style.visibility = "visable";
                }
            })();
        }
    }

    if (NAV_RESIZE_WIDTH < getWidth()) {
        ICON_MODE = false;

        for (var j = 0; j < NAV_ICONS.length; j++) {
            if (NAV_ICONS[j].classList.contains("_nonav")) {
                continue;
            }

            NAV_ICONS[j].getElementsByClassName('name')[0].style.display = "inline";
            NAV_ICONS[j].classList.remove("nav-tooltip");
            NAV_ICONS[j].getElementsByClassName('tooltiptext')[0].style.display = "none";
        }
    }
}

function getWidth() {
    if (self.innerWidth) {
        return self.innerWidth;
    }

    if (document.documentElement && document.documentElement.clientWidth) {
        return document.documentElement.clientWidth;
    }

    if (document.body) {
        return document.body.clientWidth;
    }
}

function getHeight() {
    if (self.innerHeight) {
        return self.innerHeight;
    }

    if (document.documentElement && document.documentElement.clientHeight) {
        return document.documentElement.clientHeight;
    }

    if (document.body) {
        return document.body.clientHeight;
    }
}

window.mobileAndTabletcheck = function () {
    var check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

var SEARCH = document.getElementById('_search');
var RESULTS = document.getElementById('_search-content');

recent();
new TimeKeyDelay(500, SEARCH, function () {
    if (SEARCH.value.trim() == "") {
        recent();
        return;
    }

    sendSimpleRequest('find/' + SEARCH.value, "GET", {}, function (err, payload) {
        if (err) {
            console.log("INTERNAL ERROR");
            return;
        }

        if (payload.success) {
            var results = payload.data;
            var toResult = '';

            resetData();
            //RESULTS.style.display = "block";
            for (var i = 0; i < results.length; i++) {
                var result = results[i];

                if (typeof sData[result['ID']] != "undefined") {
                    sData[result['ID']]['NAME'] = result['NAME'];
                    sData[result['ID']]['DUPE'] = true;
                } else {
                    sData[result['ID']] = result;
                }

                if (result['TYPE'] == 0) {
                    toResult += '<a onclick="update(' + result['ID'] + ')" href="' + window.location.origin + '/organization/' + result['ID'] + '" class="_nonav"><div class="_row">' + result['NAME'] + '</div></a>';
                } else {
                    toResult += '<a onclick="update(' + result['ID'] + ')" href="' + window.location.origin + '/event/' + result['ID'] + '" class="_nonav"><div class="_row">' + result['NAME'] + '</div></a>';
                }
            }

            if(results.length < 1){
                RESULTS.innerHTML = '<div class="_row">No results found</div>';
                return;
            }

            RESULTS.innerHTML = toResult;
        } else {
            console.dir(payload);
        }
    });
});

var sData = {}, pre = "";
function resetData() {
    sData = {};

    var PAST;

    try {
        PAST = JSON.parse(localStorage['SEARCHES']);
    } catch (e) {
        PAST = [];
    }

    if (typeof PAST == "undefined") {
        PAST = [];
    }

    if (PAST.constructor !== Array) {
        PAST = [];
    }

    for (var i = 0; i < PAST.length; i++) {
        sData[PAST[i]['ID']] = PAST[i];
    }
}

function update(dParse, past) {
    var data = sData[dParse];

    var PAST;

    try {
        PAST = JSON.parse(localStorage['SEARCHES']);
    } catch (e) {
        PAST = [];
    }

    if (typeof PAST == "undefined") {
        PAST = [];
    }

    if (PAST.constructor !== Array) {
        PAST = [];
    }

    if (typeof data['DUPE'] == "undefined") {
        PAST.push(data);
    } else {
        for (var i = 0; i < PAST.length; i++) {
            if (PAST[i]['ID'] == data['ID']) {
                PAST.splice(i, 1);
                PAST.push(data);
                break;
            }
        }
    }

    localStorage['SEARCHES'] = JSON.stringify(PAST);
}

function recent(PREE) {
    var PAST;

    if (typeof PREE != "undefined") {
        pre = PREE;
    }

    try {
        PAST = JSON.parse(localStorage['SEARCHES']);
    } catch (e) {
        PAST = [];
    }

    if (typeof PAST == "undefined") {
        PAST = [];
    }

    RESULTS.innerHTML = '';

    var end = PAST.length;
    if (PAST.length > 5) {
        end -= 5;
    } else {
        end = 0;
    }

    if(PAST.length < 1){
        RESULTS.innerHTML = '<div class="_row">No past searches</div>';
        return;
    }

    sData = {};
    for (var i = PAST.length - 1; i >= end; i--) {
        var data = PAST[i];

        sData[data['ID']] = data;
        sData[data['ID']]['DUPE'] = true;

        if (data['TYPE'] == 0) {
            RESULTS.innerHTML += '<a onclick="update(' + data['ID'] + ')" href="' + window.location.origin + '/organization/' + data['ID'] + '" class="_nonav"><div class="_row">' + data['NAME'] + '</div></a>';
        } else {
            RESULTS.innerHTML += '<a onclick="update(' + data['ID'] + ')" href="' + window.location.origin + '/event/' + data['ID'] + '" class="_nonav"><div class="_row">' + data['NAME'] + '</div></a>';
        }
    }
}