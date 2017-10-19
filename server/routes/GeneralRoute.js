var Errors = require('./../util/Errors');
var Util = require('./../util/Util');
var Accounts = require('./../tables/account/Accounts');
var RouteHelper = require('./../util/RouteHelper');
var Security = require('./../util/Security');
var Organizations = require('./../tables/organization/Organizations');
var Organization_Groups = require('./../tables/organization/Organization_Groups');
var Organization_Members = require('./../tables/organization/Organization_Members');
var Events = require('./../tables/event/Events');
var Event_Admins = require('./../tables/event/Event_Admins');
var Event_Applications = require('./../tables/event/Event_Applications');
var Whitelist = require('./../tables/general/Whitelist');
var Admins = require('./../tables/general/Admins');

function GeneralRoute(app) {
    app.get('/find/:ID', function (req, res) {
        if (!RouteHelper.hasBody(req.params, res, {
                ID: {MIN: 1, TYPE: "UNICODE"}
            })) {
            return;
        }

        var INFO_DUMP = [];
        Organizations.findLike({NAME: req.params['ID'] + "%"}, function (oErr, oRows) {
            if (RouteHelper.hasInternalError(res, oErr, oRows)) {
                return;
            }

            for (var i = 0; i < oRows.length; i++) {
                INFO_DUMP.push({TYPE: 0, NAME: oRows[i]['NAME'], ID: oRows[i]['ID']});
            }

            Events.findLike({NAME: req.params['ID'] + "%"}, function (eErr, eRows) {
                if (RouteHelper.hasInternalError(res, eErr, eRows)) {
                    return;
                }

                for (var j = 0; j < eRows.length; j++) {
                    INFO_DUMP.push({TYPE: 1, NAME: eRows[j]['NAME'], ID: eRows[j]['ID']});
                }

                var SEARCH_TILL = INFO_DUMP.length;
                if (SEARCH_TILL > 5) {
                    SEARCH_TILL = 5;
                }

                var TO_RETURN = [];
                for (var l = 0; l < SEARCH_TILL; l++) {
                    TO_RETURN.push(INFO_DUMP[l]);
                }

                RouteHelper.sendSuccess(res, {data: TO_RETURN});
            });
        });
    });

    app.post('/whitelist', function (req, res) {
        if (!RouteHelper.hasBody(req.body, res, {
                CONTENT: {MIN: 1, TYPE: "UNICODE"},
                TYPE: {MIN: 1, TYPE: "NUMBER"}
            })) {
            return;
        }

        Security.validate(req, res, function (err, sPayload) {
            if (err) {
                return;
            }

            Admins.find({ACCOUNT_ID: sPayload}, function (aErr, aRows) {
                if (RouteHelper.hasInternalError(res, aErr, aRows)) {
                    return;
                }

                if (aRows.length < 1) {
                    RouteHelper.sendError(res, Errors.INSUFFICIENT_PERMISSIONS);
                    return;
                }

                Whitelist.insert({CONTENT: req.body['CONTENT'], TYPE: req.body['TYPE']}, function (wErr) {
                });

                RouteHelper.sendSuccess(res);
            });
        });
    });

    app.patch('/whitelist/:ID', function (req, res) {
        if (!RouteHelper.hasBody(req.params, res, {
                ID: {MIN: 1, TYPE: "NUMBER"}
            })) {
            return;
        }

        if (!RouteHelper.hasBody(req.body, res, {
                CONTENT: {MIN: 1, TYPE: "UNICODE"},
                TYPE: {MIN: 1, TYPE: "NUMBER"}
            })) {
            return;
        }

        Security.validate(req, res, function (err, sPayload) {
            if (err) {
                return;
            }

            Admins.find({ACCOUNT_ID: sPayload}, function (aErr, aRows) {
                if (RouteHelper.hasInternalError(res, aErr, aRows)) {
                    return;
                }

                if (aRows.length < 1) {
                    RouteHelper.sendError(res, Errors.INSUFFICIENT_PERMISSIONS);
                    return;
                }

                Whitelist.find({ID: req.params['ID']}, function (wErr, wRows) {
                    if (RouteHelper.hasInternalError(res, wErr, wRows)) {
                        return;
                    }

                    if (wRows.length < 1) {
                        RouteHelper.sendError(res, Errors.WHITELIST_INVALID);
                        return;
                    }

                    Whitelist.update({CONTENT: req.body['CONTENT'], TYPE: req.body['TYPE']}, {ID: req.params['ID']}, function(wErr){});
                    RouteHelper.sendSuccess(res);
                });
            });
        });
    });

    app.delete('/whitelist/:ID', function (req, res) {
        if (!RouteHelper.hasBody(req.params, res, {
                ID: {MIN: 1, TYPE: "NUMBER"}
            })) {
            return;
        }

        Security.validate(req, res, function (err, sPayload) {
            if (err) {
                return;
            }

            Admins.find({ACCOUNT_ID: sPayload}, function (aErr, aRows) {
                if (RouteHelper.hasInternalError(res, aErr, aRows)) {
                    return;
                }

                if (aRows.length < 1) {
                    RouteHelper.sendError(res, Errors.INSUFFICIENT_PERMISSIONS);
                    return;
                }

                Whitelist.find({ID: req.params['ID']}, function (wErr, wRows) {
                    if (RouteHelper.hasInternalError(res, wErr, wRows)) {
                        return;
                    }

                    if (wRows.length < 1) {
                        RouteHelper.sendError(res, Errors.WHITELIST_INVALID);
                        return;
                    }

                    Whitelist.delete({ID: req.params['ID']}, function(wErr){});
                    RouteHelper.sendSuccess(res);
                });
            });
        });
    });
}

module.exports = GeneralRoute;