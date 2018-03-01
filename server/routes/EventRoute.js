'use strict'

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

function EventRoute(app) {
    app.post('/organization/:ID/event', function (req, res) {
        Security.validate(req, res, function (err, sPayload) {
            if (err) {
                return;
            }

            if (!RouteHelper.hasBody(req.body, res, {
                    NAME: {MAX: 128, MIN: 5, TYPE: "UNICODE"},
                    DESCRIPTION: {MIN: 5, TYPE: "UNICODE"},
                    START_TIME: {LENGTH: 19, TYPE: "DATE"},
                    END_TIME: {LENGTH: 19, TYPE: "DATE"},
                    LOCATION: {MIN: 1, TYPE: "UNICODE"},
                    TYPE: {LENGTH: 1, TYPE: "NUMBER"}
                })) {
                return;
            }

            if (!RouteHelper.hasBody(req.params, res, {ID: {TYPE: "NUMBER", MAX: 12}})) {
                return;
            }

            Organization_Members.find({ACCOUNT_ID: sPayload, ADMIN: 1}, function (mErr, mRows) {
                if (RouteHelper.hasInternalError(res, mErr, mRows)) {
                    return;
                }

                if (mRows.length < 1) {
                    RouteHelper.sendError(res, Errors.ORGANIZATION_INSUFFICIENT_PERMISSIONS);
                    return;
                }

                Events.insert({
                    NAME: req.body['NAME'],
                    DESCRIPTION: req.body['DESCRIPTION'],
                    ACCOUNT_ID: sPayload,
                    LOCATION: req.body['LOCATION'],
                    ORGANIZATION_ID: req.params['ID'],
                    START_TIME: req.body['START_TIME'],
                    END_TIME: req.body['END_TIME'],
                    TYPE: req.body['TYPE']
                }, function (eErr, eRow) {
                    if (RouteHelper.hasInternalError(res, eErr, eRow)) {
                        return;
                    }

                    Event_Admins.insert({EVENT_ID: eRow, ACCOUNT_ID: sPayload}, function (aErr) {
                    });

                    RouteHelper.sendSuccess(res, {data: eRow});
                });
            });
        });
    });

    app.delete('/event/:ID', function (req, res) {
        if (!RouteHelper.hasBody(req.params, res, {ID: {TYPE: "NUMBER", MAX: 12}})) {
            return;
        }

        Security.validate(req, res, function (err, sPayload) {
            if (err) {
                return;
            }

            Events.find({ID: req.params['ID']}, function(eErr, eRows){
                if(RouteHelper.hasInternalError(res, eErr, eRows)){
                    return;
                }

                if(eRows.length < 1){
                    RouteHelper.sendError(res, Errors.EVENT_INVALID);
                    return;
                }

                if(eRows[0]['ACCOUNT_ID'] != sPayload){
                    RouteHelper.sendError(res, Errors.EVENT_INSUFFICIENT_PERMISSIONS);
                    return;
                }

                Events.delete({ID: req.params['ID']}, function(eErr){});
                RouteHelper.sendSuccess(res);
            })
        });
    });

    app.get('/event/:ID', function (req, res) {
        if (!RouteHelper.hasBody(req.params, res, {ID: {TYPE: "NUMBER", MAX: 12}})) {
            return;
        }

        Events.find({ID: req.params['ID']}, function (eErr, eRows) {
            if (RouteHelper.hasInternalError(res, eErr, eRows)) {
                return;
            }

            if (eRows.length < 1) {
                RouteHelper.sendError(res, Errors.EVENT_INVALID);
                return;
            }

            RouteHelper.sendSuccess(res, {data: eRows[0]});
        });
    });

    app.patch('/organization/:ID/event/:EVENT', function (req, res) {
        Security.validate(req, res, function (err, sPayload) {
            if (err) {
                return;
            }

            if (!RouteHelper.hasABody(req.body, res, {
                    NAME: {MAX: 128, MIN: 5, TYPE: "UNICODE"},
                    DESCRIPTION: {MIN: 5, TYPE: "UNICODE"},
                    START_TIME: {LENGTH: 19, TYPE: "DATE"},
                    END_TIME: {LENGTH: 19, TYPE: "DATE"},
                    TYPE: {LENGTH: 1, TYPE: "NUMBER"}
                })) {
                return;
            }

            if (!RouteHelper.hasBody(req.params, res, {
                    ID: {TYPE: "NUMBER", MAX: 12},
                    EVENT: {TYPE: "NUMBER", MAX: 12}
                })) {
                return;
            }

            var toUpdate = {};
            if (typeof req.body['NAME'] != "undefined") {
                toUpdate['NAME'] = req.body['NAME'];
            }

            if (typeof req.body['DESCRIPTION'] != "undefined") {
                toUpdate['DESCRIPTION'] = req.body['DESCRIPTION'];
            }

            if (typeof req.body['START_TIME'] != "undefined") {
                toUpdate['START_TIME'] = req.body['START_TIME'];
            }

            if (typeof req.body['END_TIME'] != "undefined") {
                toUpdate['END_TIME'] = req.body['END_TIME'];
            }

            if (typeof req.body['TYPE'] != "undefined") {
                toUpdate['TYPE'] = req.body['TYPE'];
            }

            Event_Admins.find({EVENT_ID: req.params['EVENT'], ACCOUNT_ID: sPayload}, function (aErr, aRows) {
                if (RouteHelper.hasInternalError(res, aErr, aRows)) {
                    return;
                }

                if (aRows.length < 1) {
                    RouteHelper.sendError(res, Errors.EVENT_INSUFFICIENT_PERMISSIONS);
                    return;
                }

                Events.update(toUpdate, {ID: req.params['EVENT']}, function (eErr) {
                });

                RouteHelper.sendSuccess(res);
            });
        });
    });

    app.post('/organization/:ID/event/:EVENT/cancel', function (req, res) {
        Security.validate(req, res, function (err, sPayload) {
            if (err) {
                return;
            }

            if (!RouteHelper.hasBody(req.params, res, {
                    ID: {TYPE: "NUMBER", MAX: 12},
                    EVENT: {TYPE: "NUMBER", MAX: 12}
                })) {
                return;
            }

            Event_Admins.find({EVENT_ID: req.params['EVENT'], ACCOUNT_ID: sPayload}, function (aErr, aRows) {
                if (RouteHelper.hasInternalError(res, aErr, aRows)) {
                    return;
                }

                if (aRows.length < 1) {
                    RouteHelper.sendError(res, Errors.EVENT_INSUFFICIENT_PERMISSIONS);
                    return;
                }

                Events.update({CANCELLED_DATE: Util.getTime()}, {ID: req.params['EVENT']}, function (eErr) {
                });

                RouteHelper.sendSuccess(res);
            });
        });
    });

    app.post('/organization/:ID/event/:EVENT/open', function (req, res) {
        Security.validate(req, res, function (err, sPayload) {
            if (err) {
                return;
            }

            if (!RouteHelper.hasBody(req.params, res, {
                    ID: {TYPE: "NUMBER", MAX: 12},
                    EVENT: {TYPE: "NUMBER", MAX: 12}
                })) {
                return;
            }

            Event_Admins.find({EVENT_ID: req.params['EVENT'], ACCOUNT_ID: sPayload}, function (aErr, aRows) {
                if (RouteHelper.hasInternalError(res, aErr, aRows)) {
                    return;
                }

                if (aRows.length < 1) {
                    RouteHelper.sendError(res, Errors.EVENT_INSUFFICIENT_PERMISSIONS);
                    return;
                }

                Events.update({CANCELLED_DATE: null}, {ID: req.params['EVENT']}, function (eErr) {
                });

                RouteHelper.sendSuccess(res);
            });
        });
    });

    app.post('/event/:ID/apply', function (req, res) {
        Security.validate(req, res, function (err, sPayload) {
            if (err) {
                return;
            }

            if (!RouteHelper.hasBody(req.params, res, {
                    ID: {TYPE: "NUMBER", MAX: 12}
                })) {
                return;
            }

            if (!RouteHelper.hasBody(req.body, res, {
                    START_TIME: {LENGTH: 19, TYPE: "DATE"},
                    END_TIME: {LENGTH: 19, TYPE: "DATE"}
                })) {
                return;
            }

            Events.find({ID: req.params['ID']}, function (eErr, eRows) {
                if (RouteHelper.hasInternalError(res, eErr, eRows)) {
                    return;
                }

                if (eRows.length < 1) {
                    RouteHelper.sendError(res, Errors.EVENT_INVALID);
                    return;
                }

                Event_Applications.find({
                    EVENT_ID: req.params['ID'],
                    ACCOUNT_ID: sPayload
                }, function (aErr, aRows) {
                    if (RouteHelper.hasInternalError(res, aErr, aRows)) {
                        return;
                    }

                    if (aRows.length > 0) {
                        RouteHelper.sendError(res, Errors.EVENT_APPLICATION_DUPLICATE);
                        return;
                    }

                    Event_Applications.insert({
                        ACCOUNT_ID: sPayload,
                        EVENT_ID: req.params['ID'],
                        START_TIME: req.body['START_TIME'],
                        END_TIME: req.body['END_TIME']
                    }, function (iErr) {
                    });

                    RouteHelper.sendSuccess(res);
                });
            });
        });
    });

    app.get('/event/:ID/application', function (req, res) {
        Security.validate(req, res, function (err, sPayload) {
            if (err) {
                return;
            }

            if (!RouteHelper.hasBody(req.params, res, {
                    ID: {TYPE: "NUMBER", MAX: 12}
                })) {
                return;
            }

            Event_Applications.find({
                EVENT_ID: parseInt(req.params['ID']),
                ACCOUNT_ID: sPayload
            }, function (aErr, aRows) {
                if (RouteHelper.hasInternalError(res, aErr, aRows)) {
                    return;
                }

                if (aRows.length < 1) {
                    RouteHelper.sendError(res, Errors.EVENT_APPLICATION_INVALID);
                    return;
                }

                RouteHelper.sendSuccess(res, {data: aRows[0]});
            });
        });
    });

    app.delete('/event/:ID/application', function (req, res) {
        Security.validate(req, res, function (err, sPayload) {
            if (err) {
                return;
            }

            if (!RouteHelper.hasBody(req.params, res, {
                    ID: {TYPE: "NUMBER", MAX: 12}
                })) {
                return;
            }

            Event_Applications.find({
                EVENT_ID: parseInt(req.params['ID']),
                ACCOUNT_ID: sPayload
            }, function (aErr, aRows) {
                if (RouteHelper.hasInternalError(res, aErr, aRows)) {
                    return;
                }

                if (aRows.length < 1) {
                    RouteHelper.sendError(res, Errors.EVENT_APPLICATION_INVALID);
                    return;
                }

                Event_Applications.delete({ID: aRows[0]['ID']}, function (eErr) {
                });
                RouteHelper.sendSuccess(res, {data: aRows[0]});
            });
        });
    });

    /**
     * Accepts or denies the event
     */
    app.post('/event/:EVENT/application/:ID', function (req, res) {
        Security.validate(req, res, function (err, sPayload) {
            if (err) {
                return;
            }

            if (!RouteHelper.hasBody(req.params, res, {
                    ID: {TYPE: "NUMBER", MAX: 12},
                    EVENT: {TYPE: "NUMBER", MAX: 12}
                })) {
                return;
            }

            if (!RouteHelper.hasBody(req.body, res, {
                    STATUS: {LENGTH: 1, TYPE: "NUMBER"}
                })) {
                return;
            }

            Event_Admins.find({EVENT_ID: req.params['EVENT'], ACCOUNT_ID: sPayload}, function (aErr, aRows) {
                if (RouteHelper.hasInternalError(res, aErr, aRows)) {
                    return;
                }

                if (aRows.length < 1) {
                    RouteHelper.sendError(res, Errors.EVENT_INSUFFICIENT_PERMISSIONS);
                    return;
                }

                Event_Applications.find({
                    ID: req.params['ID'],
                    EVENT_ID: req.params['EVENT']
                }, function (apErr, apRows) {
                    if (RouteHelper.hasInternalError(res, apErr, apRows)) {
                        return;
                    }

                    if (apRows.length < 1) {
                        RouteHelper.sendError(res, Errors.EVENT_APPLICATION_INVALID);
                        return;
                    }

                    //TODO Send notification to person
                    Event_Applications.update({
                        STATUS: req.body['STATUS'],
                        STATED_BY: sPayload
                    }, {ID: req.params['ID']}, function (eaErr) {
                    });

                    RouteHelper.sendSuccess(res);
                });
            });
        });
    });

    app.get('/organization/:ID/events', function (req, res) {
        if (!RouteHelper.hasBody(req.params, res, {
                ID: {TYPE: "NUMBER", MAX: 12}
            })) {
            return;
        }

        Organizations.find({ID: req.params['ID']}, function (oErr, oRows) {
            if (RouteHelper.hasInternalError(res, oErr, oRows)) {
                return;
            }

            if (oRows.length < 1) {
                RouteHelper.sendError(res, Errors.ORGANIZATION_INVALID);
                return;
            }

            Events.find({ORGANIZATION_ID: oRows[0]['ID']}, function (eErr, eRows) {
                if (RouteHelper.hasInternalError(res, eErr, eRows)) {
                    return;
                }

                RouteHelper.sendSuccess(res, {data: eRows});
            });
        });
    });

    app.get('/events', function (req, res) {
        Security.validate(req, res, function (err, sPayload) {
            if (err) {
                return;
            }

            Event_Applications.find({ACCOUNT_ID: sPayload}, function (aErr, aRows) {
                if (RouteHelper.hasInternalError(res, aErr, aRows)) {
                    return;
                }

                if (aRows.length < 1) {
                    RouteHelper.sendSuccess(res, {data: []});
                    return;
                }

                var toFindEvents = [];
                for (var i = 0; i < aRows.length; i++) {
                    toFindEvents.push({ID: aRows[0]['EVENT_ID']});
                }

                Events.find(toFindEvents, function (eErr, eRows) {
                    if (RouteHelper.hasInternalError(res, eErr, eRows)) {
                        return;
                    }

                    RouteHelper.sendSuccess(res, {data: eRows});
                });
            });
        });
    });

    app.get('/organization/:ID/events', function (req, res) {
        if (!RouteHelper.hasBody(req.params, res, {
                ID: {TYPE: "NUMBER", MAX: 12}
            })) {
            return;
        }

        Organizations.find({ID: req.params['ID']}, function (oErr, oRows) {
            if (RouteHelper.hasInternalError(res, oErr, oRows)) {
                return;
            }

            if (oRows.length < 1) {
                RouteHelper.sendError(res, Errors.ORGANIZATION_INVALID);
                return;
            }

            Events.find({ORGANIZATION_ID: req.params['ID']}, function (eErr, eRows) {
                if (RouteHelper.hasInternalError(res, eErr, eRows)) {
                    return;
                }

                RouteHelper.sendSuccess(res, {data: eRows});
            });
        });
    });
}

module.exports = EventRoute;