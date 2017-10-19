var prototype = module.exports;
var Errors = require('./Errors');
var Util = require('./Util');

prototype.hasBody = function (body, res, parameters, send) {
    var self = this;

    if (typeof parameters == "string") {
        if (typeof body[parameters] == "undefined") {
            self.sendError(res, Errors.BODY_ARGUMENT_MISSING, {ARGUMENT: parameters});
            return false;
        }
    } else if (parameters.constructor === Array) {
        for (var i = 0; i < parameters.length; i++) {
            (function () {
                var parameter = parameters[i];

                if (typeof body[parameter] == "undefined") {
                    self.sendError(res, Errors.BODY_ARGUMENT_MISSING, {argument: parameter});
                    return false;
                }
            })();
        }

        return true;
    } else {
        /*
         We assume this is a dictionary. If it's not, someone is doing something wrong. Probably me.
         We also use dictionary to check data settings
         */

        for (var key in parameters) {
            if (parameters.hasOwnProperty(key)) {
                var parameter = parameters[key];

                if (typeof body[key] == "undefined") {
                    self.sendError(res, Errors.BODY_ARGUMENT_MISSING, {argument: key});
                    return false;
                }

                var response = self.checkVariable(body[key], parameter);
                if (typeof response != "undefined") {
                    switch (response) {
                        default:
                            //TODO Add something here, but we shouldn't get to here
                            break;
                        case Errors.VARIABLE_LENGTH_MISSMATCH:
                            self.sendError(res, Errors.VARIABLE_LENGTH_MISSMATCH, {
                                argument: key,
                                length: parameter['LENGTH']
                            });
                            break;
                        case Errors.VARIABLE_LENGTH_SHORT:
                            self.sendError(res, Errors.VARIABLE_LENGTH_SHORT, {argument: key, min: parameter['MIN']});
                            break;
                        case Errors.VARIABLE_LENGTH_LONGER:
                            self.sendError(res, Errors.VARIABLE_LENGTH_LONGER, {argument: key, length: parameter['MAX']});
                            break;
                        case Errors.VARIABLE_TYPE_MISSMATCH:
                            if (parameter['TYPE'] == "LNU") {
                                parameter['TYPE'] = "LNU (Only allows letters, numbers, and underscores; Underscore can't be at start of variable)"
                            }

                            self.sendError(res, Errors.VARIABLE_TYPE_MISSMATCH, {argument: key, type: parameter['TYPE']});
                            break;
                    }

                    return false;
                }
            }
        }

        return true;
    }
};

prototype.hasABody = function (body, res, parameters) {
    var self = this;

    if (typeof parameters == "string") {
        if (typeof body[parameters] == "undefined") {
            self.sendError(res, Errors.BODY_ARGUMENT_MISSING, {ARGUMENT: parameters});
            return false;
        }
    } else if (parameters.constructor === Array) {
        for (var i = 0; i < parameters.length; i++) {
            (function () {
                var parameter = parameters[i];

                if (typeof body[parameter] != "undefined") {
                    self.sendError(res, Errors.BODY_ARGUMENT_MISSING, {argument: parameter});
                    return true;
                }
            })();
        }

        return false;
    } else {
        /*
         We assume this is a dictionary. If it's not, someone is doing something wrong. Probably me.
         We also use dictionary to check data settings
         */

        var hasOne = false;
        for (var key in parameters) {
            if (parameters.hasOwnProperty(key)) {
                var parameter = parameters[key];

                if (typeof body[key] == "undefined") {
                    continue;
                }

                hasOne = true;
                var response = self.checkVariable(body[key], parameter);
                if (typeof response != "undefined") {
                    switch (response) {
                        default:
                            //TODO Add something here, but we shouldn't get to here
                            break;
                        case Errors.VARIABLE_LENGTH_MISSMATCH:
                            self.sendError(res, Errors.VARIABLE_LENGTH_MISSMATCH, {
                                argument: key,
                                length: parameter['LENGTH']
                            });
                            break;
                        case Errors.VARIABLE_LENGTH_SHORT:
                            self.sendError(res, Errors.VARIABLE_LENGTH_SHORT, {argument: key, min: parameter['MIN']});
                            break;
                        case Errors.VARIABLE_LENGTH_LONGER:
                            self.sendError(res, Errors.VARIABLE_LENGTH_LONGER, {argument: key, length: parameter['MAX']});
                            break;
                        case Errors.VARIABLE_TYPE_MISSMATCH:
                            if (parameter['TYPE'] == "LNU") {
                                parameter['TYPE'] = "LNU (Only allows letters, numbers, and underscores; Underscore can't be at start of variable)"
                            }

                            self.sendError(res, Errors.VARIABLE_TYPE_MISSMATCH, {argument: key, type: parameter['TYPE']});
                            break;
                    }

                    return false;
                }
            }
        }

        if (!hasOne) {
            self.sendError(res, Errors.BODY_ARGUMENTS_MISSING);
        }

        return hasOne;
    }
};

prototype.sendError = function (res, error, data) {
    var rawData = {
        success: false,
        message: error.DESCRIPTION,
        code: error.CODE
    };

    if (typeof data != "undefined") {
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                rawData[key] = data[key];
            }
        }
    }

    res.status(200).json(rawData);
};

prototype.sendSuccess = function (res, data) {
    var rawData = {
        success: true
    };

    if (typeof data != "undefined") {
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                rawData[key] = data[key];
            }
        }
    }

    res.status(200).json(rawData);
};

prototype.hasInternalError = function (res, error, response) {
    var self = this;

    if ((error != null && error)) {
        self.sendError(res, Errors.INTERNAL_ERROR, {error: error});
        return true;
    }

    return false;
};

prototype.parseCookies = function (request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function (cookie) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
};

prototype.parseSocketCookies = function (rc) {
    var list = {};

    rc && rc.split(';').forEach(function (cookie) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
};

prototype.hasSocketCookies = function (cookies, cookie) {
    if (typeof cookie == "string") {
        if (typeof cookies[cookie] == "undefined") {
            return false;
        }
    } else {
        for (var i = 0; i < cookie.length; i++) {
            if (typeof cookies[cookie[i]] == "undefined") {
                return false;
            }
        }
    }

    return true;
};


prototype.hasCookie = function (req, res, cookie, send) {
    return this.hasCookies(req, res, cookie, send);
};

prototype.hasCookies = function (req, res, cookie, send) {
    var self = this, cookies = self.parseCookies(req);


    if (typeof cookie == "string") {
        if (typeof cookies[cookie] == "undefined") {
            if (typeof send == "undefined") {
                self.sendError(res, Errors.COOKIE_NOT_FOUND, {cookie: cookie});
            }

            return false;
        }
    } else {
        for (var i = 0; i < cookie.length; i++) {
            if (typeof cookies[cookie[i]] == "undefined") {
                if (typeof send == "undefined") {
                    self.sendError(res, Errors.COOKIE_NOT_FOUND, {cookie: cookie[i]});
                }

                return false;
            }
        }
    }

    return true;
};

prototype.checkVariable = function (variable, settings) {
    var self = this;

    if (typeof settings['LENGTH'] != "undefined") {
        if (variable.length != settings['LENGTH']) {

            if(!isNaN(variable)){
                if (variable.toString().length != settings['LENGTH']) {
                    return Errors.VARIABLE_LENGTH_MISSMATCH;
                }else{
                    return;
                }
            }

            if (typeof variable.length == "undefined") {
                if (variable != settings['LENGTH']) {
                    return Errors.VARIABLE_LENGTH_MISSMATCH;
                }
            } else {
                return Errors.VARIABLE_LENGTH_MISSMATCH;
            }
        }
    }

    if (typeof settings['MIN'] != "undefined") {
        if (variable.length < settings['MIN']) {
            return Errors.VARIABLE_LENGTH_SHORT;
        }
    }

    //Let's make this inclusive
    if (typeof settings['MAX'] != "undefined") {
        if (variable.length > settings["MAX"]) {
            return Errors.VARIABLE_LENGTH_LONGER;
        }
    }

    if (typeof settings['TYPE'] != "undefined") {
        if (!self.isType(variable, settings['TYPE'])) {
            return Errors.VARIABLE_TYPE_MISSMATCH;
        }
    }
};

/**
 * Checks if a variable is a certain type.
 *
 * Types:
 * - Alphabetical
 * - Numerical
 * - Email
 * - UNICODE
 * - [Special Characters]
 * - LNU (Letters, Numbers, Underscores)
 * - NUMBER
 *
 * @param variable
 * @param type          An
 */
prototype.isType = function (variable, type) {
    var self = this;
    if (typeof type == "string") {
        return self.isSpecificType(variable, type)
    }

    //We assume it's an array. Why? Because I can.
    for (var i = 0; i < type.length; i++) {
        var response = self.isSpecificType(variable, type[i]);

        if (response == false) {
            return false;
        }
    }

    return true;
};

/**
 * This is just a helper method. Alas.
 *
 * I feel there is an easier way. But I just can't place a finger on it. (Cleaner code then inner function IMO)
 */
prototype.isSpecificType = function (variable, type) {
    switch (type.toUpperCase()) {
        case "EMAIL":
            if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(variable))
                return true;

            break;
        case "LNU":
            if (/^\w+$/.test(variable) && variable.charAt(0) != "_")
                return true;

            break;
        case "UNICODE":
            //TODO Actually check this. We assume it's true, this will definitely come to haunt me.
            return true;
        case "NUMBER":
            return !isNaN(variable);
        case "DATE":
            try {
                Util.parseTime(variable);
                return true;
            } catch (e) {
                return false;
            }
    }

    return false;
};

prototype.setCookie = function (res, keys, value) {
    if (typeof process.env.RDS_USERNAME == "undefined") {
        if (typeof keys == "string") {
            res.setHeader('Set-Cookie', keys + "=" + value + ";path=/");
            return;
        }

        var toAdd = [];
        for (var key in keys) {
            if (keys.hasOwnProperty(key)) {
                toAdd.push(key + "=" + keys[key] + ";path=/");
            }
        }

        res.setHeader('Set-Cookie', toAdd);
    } else {
        if (typeof keys == "string") {
            res.setHeader('Set-Cookie', keys + "=" + value + ";path=/;domain=" + getURL());
            return;
        }

        var toAdd = [];
        for (var key in keys) {
            if (keys.hasOwnProperty(key)) {
                toAdd.push(key + "=" + keys[key] + ";path=/;domain=" + getURL());
            }
        }

        res.setHeader('Set-Cookie', toAdd);
    }
};

function getURL() {
    if (typeof process.env.RDS_USERNAME == "undefined") {
        return ".localhost:8081";
    } else {
        return ".commservus.com";
    }
}

prototype.getURL = function(){
    if (typeof process.env.RDS_USERNAME == "undefined") {
        return ".localhost:8081";
    } else {
        return ".commservus.com";
    }
};