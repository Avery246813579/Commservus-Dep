var Util = require('./Util');
var Parser = require('ua-parser-js');
var Clients = require('./../tables/account/Clients');
var Sessions = require('./../tables/account/Sessions');
var RouteHelper = require('./RouteHelper');
var Errors = require('./Errors');
var prototype = module.exports;
var JWT = require('jsonwebtoken');

prototype.validate = function (req, res, callback) {
    var cookies = Util.parseCookies(req);

    if (!RouteHelper.hasCookies(req, res, ['SID', 'CID'])) {
        callback(true);
        return;
    }

    try {
        Clients.find({UNIQUE_ID: cookies['CID']}, function (cErr, cRows) {
            if (RouteHelper.hasInternalError(res, cErr, cRows)) {
                callback(true);
                return;
            }

            if (cRows.length < 1) {
                RouteHelper.sendError(res, Errors.CLIENT_INVALID);
                callback(true);
                return;
            }

            var cClient = getCurrentClient(req);
            if (!sameClient(cRows[0], cClient)) {
                RouteHelper.sendError(res, Errors.CLIENT_INVALID);
                callback(true);
                return;
            }

            Sessions.find({UNIQUE_ID: cookies['SID'], CLIENT: cRows[0]['ID'], UNAUTHORIZED: false}, function (sErr, sRows) {
                if (RouteHelper.hasInternalError(res, sErr, sRows)) {
                    callback(true);
                    return;
                }

                if (sRows.length < 1) {
                    RouteHelper.sendError(res, Errors.SESSION_INVALID);
                    callback(true);
                    return;
                }

                if (sRows[0]['DATE_EXPIRES'] == null || Util.getServerTime().getTime() > Util.parseTime(sRows[0]['DATE_EXPIRES']).getTime()) {
                    RouteHelper.sendError(res, Errors.SESSION_EXPIRED);
                    callback(true);
                    return;
                }

                callback(undefined, sRows[0]['ACCOUNT_ID']);

                if (Util.parseTime(sRows[0]['DATE_EXPIRES']).getTime() < Util.getServerTime().addMinutes(60 * 24).getTime()) {
                    Sessions.update({DATE_EXPIRES: Util.formatTime(Util.getServerTime().addMinutes(60 * 24))}, {ID: sRows[0]['ID']}, function (err) {
                    });
                }

                if (cClient['IP_ADDRESS'] != cRows[0]['IP_ADDRESS']) {
                    Clients.update({IP_ADDRESS: cClient['IP_ADDRESS']}, {ID: cRows[0]['ID']}, function (err2) {
                    });
                }
            });
        });
    } catch (ex) {
        RouteHelper.sendError(res, Errors.TOKEN_INVALID);
        callback(true);
    }
};

prototype.validateNoSend = function (req, res, callback) {
    var cookies = Util.parseCookies(req);

    if (!RouteHelper.hasCookies(req, res, ['SID', 'CID'], false)) {
        callback(true);
        return;
    }

    try {
        Clients.find({UNIQUE_ID: cookies['CID']}, function (cErr, cRows) {
            if (hasInternalError(cErr, cRows)) {
                callback(true);
                return;
            }

            if (cRows.length < 1) {
                callback(true);
                return;
            }

            var cClient = getCurrentClient(req);
            if (!sameClient(cRows[0], cClient)) {
                Util.deleteCookie(res, 'SID');
                Util.deleteCookie(res, 'CID');
                callback(true);
                return;
            }

            Sessions.find({UNIQUE_ID: cookies['SID'], CLIENT: cRows[0]['ID'], UNAUTHORIZED: false}, function (sErr, sRows) {
                if (hasInternalError(sErr, sRows)) {
                    callback(true);
                    return;
                }

                if (sRows.length < 1) {
                    callback(true);
                    return;
                }

                if (sRows[0]['DATE_EXPIRES'] == null || Util.getServerTime().getTime() > Util.parseTime(sRows[0]['DATE_EXPIRES']).getTime()) {
                    callback(true);
                    return;
                }

                callback(undefined, sRows[0]['ACCOUNT_ID']);

                if (Util.parseTime(sRows[0]['DATE_EXPIRES']).getTime() < Util.getServerTime().addMinutes(60 * 24).getTime()) {
                    Sessions.update({DATE_EXPIRES: Util.formatTime(Util.getServerTime().addMinutes(60 * 24))}, {ID: sRows[0]['ID']}, function (err) {
                    });
                }

                if (cClient['IP_ADDRESS'] != cRows[0]['IP_ADDRESS']) {
                    Clients.update({IP_ADDRESS: cClient['IP_ADDRESS']}, {ID: cRows[0]['ID']}, function (err2) {
                    });
                }
            });
        });
    } catch (ex) {
        callback(true);
    }
};

prototype.validateSocket = function (socket, rc, callback) {
    var cookies = Util.parseSocketCookies(rc);

    if (!RouteHelper.hasSocketCookies(cookies, ['SID', 'CID'], false)) {
        callback(true);
        return;
    }

    try {
        Clients.find({UNIQUE_ID: cookies['CID']}, function (cErr, cRows) {
            if (hasInternalError(cErr, cRows)) {
                callback(true);
                return;
            }

            if (cRows.length < 1) {
                callback(true);
                return;
            }

            var cClient = getCurrentClient(socket.request);
            if (!sameClient(cRows[0], cClient)) {
                callback(true);
                return;
            }

            Sessions.find({UNIQUE_ID: cookies['SID'], CLIENT: cRows[0]['ID'], UNAUTHORIZED: false}, function (sErr, sRows) {
                if (hasInternalError(sErr, sRows)) {
                    callback(true);
                    return;
                }

                if (sRows.length < 1) {
                    callback(true);
                    return;
                }

                if (sRows[0]['DATE_EXPIRES'] == null || Util.getServerTime().getTime() > Util.parseTime(sRows[0]['DATE_EXPIRES']).getTime()) {
                    callback(true);
                    return;
                }

                callback(undefined, sRows[0]['ACCOUNT_ID']);

                if (Util.parseTime(sRows[0]['DATE_EXPIRES']).getTime() < Util.getServerTime().addMinutes(60 * 24).getTime()) {
                    Sessions.update({DATE_EXPIRES: Util.formatTime(Util.getServerTime().addMinutes(60 * 24))}, {ID: sRows[0]['ID']}, function (err) {
                    });
                }

                if (cClient['IP_ADDRESS'] != cRows[0]['IP_ADDRESS']) {
                    Clients.update({IP_ADDRESS: cClient['IP_ADDRESS']}, {ID: cRows[0]['ID']}, function (err2) {
                    });
                }
            });
        });
    } catch (ex) {
        callback(true);
    }
};


//Create the session and send back the token
prototype.createSession = function (req, res, id, expires, callback) {
    var self = this;

    var cookies = Util.parseCookies(req);
    var client = getCurrentClient(req);
    client['ACCOUNT_ID'] = id;

    if (typeof cookies['CID'] != "undefined") {
        Clients.find({UNIQUE_ID: cookies['CID'], ACCOUNT_ID: id}, function (cErr, cRows) {
            if (hasInternalError(cErr, cRows)) {
                self.createClient(client, req, res, function (err, row) {
                    if (err) {
                        callback(true);
                        return;
                    }

                    createSessionHelper(req, res, id, row, expires, function (sErr, payload) {
                        if (sErr) {
                            callback(true);
                            return;
                        }

                        callback(undefined, {CLIENT: row, SESSION: payload});
                    });
                });

                return;
            }

            if (cRows.length > 0) {
                createSessionHelper(req, res, id, cRows[0], expires, function (sErr, payload) {
                    if (sErr) {
                        callback(true);
                        return;
                    }

                    callback(undefined, {CLIENT: cRows[0], SESSION: payload});
                });

                return;
            }

            self.createClient(client, req, res, function (err, row) {
                if (err) {
                    callback(true);
                    return;
                }

                createSessionHelper(req, res, id, row, expires, function (sErr, payload) {
                    if (sErr) {
                        callback(true);
                        return;
                    }

                    callback(undefined, {CLIENT: row, SESSION: payload});
                });
            });
        });

        return;
    }

    self.createClient(client, req, res, function (err, row) {
        if (err) {
            callback(true);
            return;
        }

        createSessionHelper(req, res, id, row, expires, function (sErr, payload) {
            if (sErr) {
                callback(true);
                return;
            }

            callback(undefined, {CLIENT: row, SESSION: payload});
        });
    });
};

function createSessionHelper(req, res, id, client, expires, callback) {
    var insert = {
        UNIQUE_ID: Util.randomString(64),
        CLIENT: client['ID'],
        DATE_CREATED: Util.getTime(),
        UNAUTHORIZED: false,
        IP_ADDRESS: getInternetProtocolAddress(req),
        ACCOUNT_ID: id
    };

    if (typeof expires != "undefined") {
        var serverTime = Util.getServerTime();
        serverTime.addMinutes(expires);

        insert['DATE_EXPIRES'] = Util.formatTime(serverTime);
    }

    Sessions.insert(insert, function (sErr, sRows) {
        if (hasInternalError(sErr, sRows)) {
            callback(true);
            return;
        }

        Sessions.find({ID: sRows}, function (sFErr, sFRows) {
            if (hasInternalError(sFErr, sFRows)) {
                callback(true);
                return;
            }

            callback(undefined, sFRows[0]);
        });
    });
}

prototype.hasSession = function (req, res, callback) {
    var cookies = Util.parseCookies(req);

    if (RouteHelper.hasCookie(req, res, ['SID', 'CID'], false)) {
        Clients.find({UNIQUE_ID: cookies['CID']}, function (cErr, cRows) {
            if (RouteHelper.hasInternalError(res, cErr, cRows)) {
                callback(undefined, false);
                return;
            }

            if (cRows.length > 0) {
                Sessions.find({UNIQUE_ID: cookies['SID'], CLIENT: cRows[0]['ID'], UNAUTHORIZED: false}, function (sErr, sRows) {
                    if (RouteHelper.hasInternalError(res, sErr, sRows)) {
                        return;
                    }

                    if (sRows.length > 0) {
                        if (Util.getServerTime().getTime() < Util.parseTime(sRows[0]['DATE_EXPIRES']).getTime()) {
                            callback(undefined, true);

                            return;
                        }
                    }

                    callback(undefined, false);
                });

                return;
            }

            callback(undefined, false);
        });

        return;
    }

    callback(undefined, false);
};

prototype.hasClient = function (req, res, callback) {
    var cookies = Util.parseCookies(req);

    if (RouteHelper.hasCookie(req, res, ['CID'])) {
        Clients.find({UNIQUE_ID: cookies['CID']}, function (cErr, cRows) {
            if (RouteHelper.hasInternalError(res, cErr, cRows)) {
                callback(undefined, false);
                return;
            }

            if (cRows.length > 0) {
                callback(undefined, true);

                return;
            }

            callback(undefined, false);
        });

        return;
    }

    callback(undefined, false);
};

prototype.getClients = function (req, res, id, callback) {
    var self = this;

    var client = getCurrentClient(req);
    client['ACCOUNT_ID'] = id;
    Clients.find(client, function (cErr, cRows) {
        if (RouteHelper.hasInternalError(res, cErr, cRows)) {
            callback(true);
            return;
        }

        if (cRows.length > 0) {
            var ip = getInternetProtocolAddress(req);

            callback(undefined, cRows);
        } else {
            self.createClient(client, req, res, function (err, payload) {
                if (err) {
                    callback(err);
                    return;
                }

                callback(undefined, payload);
            });
        }
    });
};

prototype.createClient = function (client, req, res, callback) {
    client['UNIQUE_ID'] = Util.randomString(64);

    Clients.insert(client, function (cErr, cRow) {
        if (RouteHelper.hasInternalError(res, cErr, cRow)) {
            callback(true);
            return;
        }

        Clients.find({ID: cRow}, function (cErr, cRows) {
            if (hasInternalError(cErr, cRows)) {
                callback(true);
                return;
            }

            callback(undefined, cRows[0]);
        });
    });
};

prototype.getInternetProtocolAddress = function (req) {
    var ip;
    if (req.headers['x-forwarded-for']) {
        ip = req.headers['x-forwarded-for'].split(",")[0];
    } else if (req.connection && req.connection.remoteAddress) {
        ip = req.connection.remoteAddress;
    } else {
        ip = req.ip;
    }

    return ip;
};

function getInternetProtocolAddress(req) {
    var ip;
    if (req.headers['x-forwarded-for']) {
        ip = req.headers['x-forwarded-for'].split(",")[0];
    } else if (req.connection && req.connection.remoteAddress) {
        ip = req.connection.remoteAddress;
    } else {
        ip = req.ip;
    }

    return ip;
}

function getCurrentClient(req) {
    var self = this;

    var ua = Parser(req.headers['user-agent']);
    var payload = {};

    if (typeof ua.device.type != "undefined") {
        payload['DEVICE'] = (ua.device.type + " " + ua.device.vendor);
    }

    return payload;
}

function hasInternalError(error, response) {
    return ((error != null && error));
}

/*
 Checks if the SQL Client and Current client are the same

 */
function sameClient(sClient, cClient) {
    if (sClient['DEVICE'] != null) {
        if (cClient['DEVICE'] != sClient['DEVICE']) {
            return false;
        }
    }

    return true;
}