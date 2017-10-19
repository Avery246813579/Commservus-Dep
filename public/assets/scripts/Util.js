/*
Used for regular requests
 */
function getURL() {
    if (window.location.href.indexOf('localhost:8081') > -1) {
        return "http://localhost:8081/api/";
    } else {
        return "https://commservus.com/api/";
    }
}

Date.prototype.addMinutes = function (minutes) {
    this.setMinutes(this.getMinutes() + minutes);
    return this;
};


function getServerTime() {
    var offset = -5.0;

    var clientDate = new Date();

    if(clientDate.dst()){
        offset += 1;
    }

    var utc = clientDate.getTime() + (clientDate.getTimezoneOffset() * 60000);

    return new Date(utc + (3600000 * offset));
}


Date.prototype.stdTimezoneOffset = function() {
    var jan = new Date(this.getFullYear(), 0, 1);
    var jul = new Date(this.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
};

Date.prototype.dst = function() {
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
};


function formatTime(date) {
    return toDouble(date.getHours()) + ":" + toDouble(date.getMinutes()) + ":" + toDouble(date.getSeconds())
        + " " + toDouble(date.getMonth() + 1) + "-" + toDouble(date.getDate()) + "-" + toDouble(date.getFullYear())
}

function getTime() {
    return formatTime(getServerTime());
}

function parseTime(raw) {
    var time = new Date();

    var split = raw.split(" ");
    var fSplit = split[0].split(":");
    var sSplit = split[1].split("-");

    time.setHours(fSplit[0]);
    time.setMinutes(fSplit[1]);
    time.setSeconds(fSplit[2]);

    time.setMonth(sSplit[0] - 1);
    time.setDate(sSplit[1]);
    time.setFullYear(sSplit[2]);

    return time;
}

function toDouble(number) {
    if (number > 9) {
        return number;
    } else {
        return "0" + number;
    }
}

function sendSimpleRequest(route, method, body, payback) {
    var request = new XMLHttpRequest();

    if (window.location.href.indexOf('localhost:8081') > -1) {
        request.open(method.toUpperCase(), getURL() + route);

        request.setRequestHeader("Content-type", "application/json");

        if (typeof body == "undefined" || body == null) {
            try {
                request.send();
            } catch (Exception) {

            }
        } else {
            request.send(JSON.stringify(body));
        }

        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    var response = JSON.parse(request.responseText);

                    payback(undefined, response);
                } else {
                    console.log(request.statusText)
                }
            }
        }
    } else if ("withCredentials" in request) {
        request.open(method, getURL() + route, true);
        request.setRequestHeader("Content-type", "application/json");
        request.withCredentials = true;

        if (typeof body == "undefined" || body == null) {
            try {
                request.send();
            } catch (Exception) {
                payback(Exception);
            }
        } else {
            request.send(JSON.stringify(body));
        }

        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    var response = JSON.parse(request.responseText);

                    payback(undefined, response);
                } else {
                    console.log(request.statusText)
                }
            }
        }
    } else if (typeof XDomainRequest != "undefined") {
        request = new XDomainRequest();

        request.open(method, getURL() + route);
        request.setRequestHeader("Content-type", "application/json");

        if (typeof body == "undefined" || body == null) {
            try {
                request.send();
            } catch (Exception) {
                payback(Exception);
            }
        } else {
            request.send(JSON.stringify(body));
        }

        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    var response = JSON.parse(request.responseText);

                    payback(undefined, response);
                } else {
                    console.log(request.statusText)
                }
            }
        }
    } else {
        payback("We can't CORS", response);
        request = null;
    }
}

/*
Used for requests with a file
 */
function sendSimpleFileRequest(route, method, body, payback) {
    var request = new XMLHttpRequest();

    if (window.location.href.indexOf('localhost:8081') > -1) {
        request.open(method.toUpperCase(), getURL() + route);

        if (typeof body == "undefined" || body == null) {
            try {
                request.send();
            } catch (Exception) {

            }
        } else {
            var formData = new FormData();
            for(var key in body){
                if(body.hasOwnProperty(key)){
                    formData.append(key, body[key]);
                }
            }

            request.send(formData);
        }

        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    var response = JSON.parse(request.responseText);

                    payback(undefined, response);
                } else {
                    console.log(request.statusText)
                }
            }
        }
    } else if ("withCredentials" in request) {
        request.open(method, getURL() + route, true);
        request.withCredentials = true;

        if (typeof body == "undefined" || body == null) {
            try {
                request.send();
            } catch (Exception) {
                payback(Exception);
            }
        } else {
            var formData2 = new FormData();
            for(var key2 in body){
                if(body.hasOwnProperty(key2)){
                    formData2.append(key2, body[key2]);
                }
            }

            request.send(formData2);
        }

        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    var response = JSON.parse(request.responseText);

                    payback(undefined, response);
                } else {
                    console.log(request.statusText)
                }
            }
        }
    } else if (typeof XDomainRequest != "undefined") {
        request = new XDomainRequest();

        request.open(method, getURL() + route);

        if (typeof body == "undefined" || body == null) {
            try {
                request.send();
            } catch (Exception) {
                payback(Exception);
            }
        } else {
            formData3 = new FormData();
            for(key3 in body){
                if(body.hasOwnProperty(ke3y)){
                    formData3.append(key3, body[key3]);
                }
            }

            request.send(formData3);
        }

        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    var response = JSON.parse(request.responseText);

                    payback(undefined, response);
                } else {
                    console.log(request.statusText)
                }
            }
        }
    } else {
        payback("We can't CORS", response);
        request = null;
    }
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function TimeKeyDelay() {
    var self = this;
    var timer = null;
    (function Constructor(time, element, callback) {
        element.onkeyup = function () {
            clearTimeout(timer);
            timer = setTimeout(callback, time);
        }
    }).apply(this, arguments);
}

var QueryString = function () {
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");

    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }
    return query_string;
};

function getInputs(form, input) {
    var i = 0;

    while (true) {
        if (typeof form[i] == "undefined") {
            break;
        }

        if (form[i].name.toLowerCase() == input.toLowerCase()) {
            return form[i];
        }

        i++;
    }

    return null;
}

function inputDate(){
    var cDate = getServerTime();

    var m = (parseInt((cDate.getMinutes() + 7.5)/15) * 15) % 60;
    var h = cDate.getMinutes() > 52 ? (cDate.getHours() === 23 ? 0 : cDate.getHours() + 1) : cDate.getHours();

    return [toDouble(h) + ":" + toDouble(m), cDate.getFullYear() + "-" + toDouble(cDate.getMonth() + 1) + "-" + toDouble(cDate.getDate())];
}

function getInputDate(cDate){
    return [toDouble(cDate.getHours()) + ":" + toDouble(cDate.getMinutes()), cDate.getFullYear() + "-" + toDouble(cDate.getMonth() + 1) + "-" + toDouble(cDate.getDate())];
}

function removeURLParameter(url, parameter) {
    //prefer to use l.search if you have a location/link object
    var urlparts= url.split('?');
    if (urlparts.length>=2) {

        var prefix= encodeURIComponent(parameter)+'=';
        var pars= urlparts[1].split(/[&;]/g);

        //reverse iteration as may be destructive
        for (var i= pars.length; i-- > 0;) {
            //idiom for string.startsWith
            if (pars[i].lastIndexOf(prefix, 0) !== -1) {
                pars.splice(i, 1);
            }
        }

        url= urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : "");
        return url;
    } else {
        return url;
    }
}