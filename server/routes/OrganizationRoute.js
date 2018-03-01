'use strict'

var Errors = require('./../util/Errors');
var Util = require('./../util/Util');
var RouteHelper = require('./../util/RouteHelper');
var Accounts = require('./../tables/account/Accounts');
var Security = require('./../util/Security');
var Organizations = require('./../tables/organization/Organizations');
var Organization_Groups = require('./../tables/organization/Organization_Groups');
var Organization_Members = require('./../tables/organization/Organization_Members');
var Events = require('./../tables/event/Events');
var Event_Applications = require('./../tables/event/Event_Applications');
var Event_Admins = require('./../tables/event/Event_Admins');

function OrganizationRoute(app) {
    app.get('/feed', function (req, res) {
        Security.validate(req, res, function (err, sPayload) {
            if (err) {
                return;
            }

            Event_Applications.find({ACCOUNT_ID: sPayload}, function (aErr, aRows) {
                if (RouteHelper.hasInternalError(res, aErr, aRows)) {
                    return;
                }

                var toFindEvents = [];
                for (var i = 0; i < aRows.length; i++) {
                    toFindEvents.push({ID: aRows[i]['EVENT_ID']});
                }

                Event_Admins.find({ACCOUNT_ID: sPayload}, function (adErr, adRows) {
                    if (RouteHelper.hasInternalError(res, adErr, adRows)) {
                        return;
                    }

                    for (var j = 0; j < adRows.length; j++) {
                        toFindEvents.push({ID: adRows[j]['EVENT_ID']});
                    }

                    if (toFindEvents.length < 1) {
                        toFindEvents.push({ID: 100000000});
                    }

                    Events.find(toFindEvents, function (eErr, eRows) {
                        if (RouteHelper.hasInternalError(res, eErr, eRows)) {
                            return;
                        }

                        Organization_Members.find({ACCOUNT_ID: sPayload}, function (mErr, mRows) {
                            if (RouteHelper.hasInternalError(res, mErr, mErr)) {
                                return;
                            }

                            var toFindOrganizations = [];
                            if (mRows.length < 1) {
                                toFindOrganizations.push({ID: 10000000});
                            }

                            for (var r = 0; r < mRows.length; r++) {
                                toFindOrganizations.push({ID: mRows[r]['ORGANIZATION_ID']});
                            }

                            Organizations.find(toFindOrganizations, function (oErr, oRows) {
                                if (RouteHelper.hasInternalError(res, oErr, oRows)) {
                                    return;
                                }

                                RouteHelper.sendSuccess(res, {events: eRows, organizations: oRows});
                            });
                        });
                    });
                });
            });
        });
    });

    app.post('/organization', function (req, res) {
        Security.validate(req, res, function (err, sPayload) {
            if (err) {
                return;
            }

            if (!RouteHelper.hasBody(req.body, res, {
                    NAME: {TYPE: "UNICODE", MIN: 1, MAX: 64},
                    USERNAME: {TYPE: "LNU", MIN: 5, MAX: 16},
                    DESCRIPTION: {TYPE: "UNICODE", MIN: 1, MAX: 255},
                    TYPE: {TYPE: "NUMBER", LENGTH: 1}
                })) {
                return;
            }

            Organizations.find({ACCOUNT_ID: sPayload}, function (aErr, aRows) {
                if (RouteHelper.hasInternalError(res, aErr, aRows)) {
                    return;
                }

                if (aRows.length > 0) {
                    RouteHelper.sendError(res, Errors.ORGANIZATION_ACCOUNT_DUPLICATE);
                    return;
                }

                Organizations.find({USERNAME: req.body['USERNAME']}, function (oErr, oRows) {
                    if (RouteHelper.hasInternalError(res, oErr, oRows)) {
                        return;
                    }

                    if (oRows.length > 0) {
                        RouteHelper.sendError(res, Errors.ORGANIZATION_DUPLICATE);
                        return;
                    }

                    Organizations.insert({
                        NAME: req.body['NAME'],
                        USERNAME: req.body['USERNAME'],
                        DESCRIPTION: req.body['DESCRIPTION'],
                        TYPE: req.body['TYPE'],
                        ACCOUNT_ID: sPayload,
                        DATE_CREATED: Util.getTime()
                    }, function (cErr, cRow) {
                        if (RouteHelper.hasInternalError(res, cErr, cRow)) {
                            return;
                        }

                        Organization_Members.insert({
                            ACCOUNT_ID: sPayload,
                            ORGANIZATION_ID: cRow,
                            DATE_JOINED: Util.getTime(),
                            ADMIN: 1
                        }, function (aiErr) {
                        });

                        RouteHelper.sendSuccess(res, {data: {id: cRow}});
                    });
                });
            });
        });
    });

    app.delete('/organization/:ID', function(req, res){
        Security.validate(req, res, function (err, sPayload) {
            if (err) {
                return;
            }

            if (!RouteHelper.hasBody(req.params, res, {
                    ID: {TYPE: "NUMBER", MAX: 12}
                })) {
                return;
            }

            Organizations.find({ID: req.params['ID']}, function(oErr, oRows){
                if(RouteHelper.hasInternalError(res, oErr, oRows)){
                    return;
                }

                if(oRows.length < 1){
                    RouteHelper.sendError(res, Errors.ORGANIZATION_INVALID);
                    return;
                }

                if(sPayload != oRows[0]['ACCOUNT_ID']){
                    RouteHelper.sendError(res, Errors.ORGANIZATION_INSUFFICIENT_PERMISSIONS);
                    return;
                }

                Organizations.delete({ID: req.params['ID']}, function(oErr){});
                RouteHelper.sendSuccess(res);
            });
        });
    });

    app.get('/organizations', function (req, res) {
        Security.validate(req, res, function (err, sPayload) {
            if (err) {
                return;
            }

            Organization_Members.find({ACCOUNT_ID: sPayload}, function (mErr, mRows) {
                if (RouteHelper.hasInternalError(res, mErr, mRows)) {
                    return;
                }

                if (mRows.length < 1) {
                    RouteHelper.sendSuccess(res, {data: []});
                    return;
                }

                var toFindOrganizations = [];
                for (var i = 0; i < mRows.length; i++) {
                    toFindOrganizations.push({ID: mRows[i]['ORGANIZATION_ID']});
                }

                Organizations.find(toFindOrganizations, function (oErr, oRows) {
                    if (RouteHelper.hasInternalError(res, oErr, oRows)) {
                        return;
                    }

                    RouteHelper.sendSuccess(res, {data: oRows});
                });
            });
        });
    });

    app.get('/organization/:ID', function (req, res) {
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

            Organization_Groups.find({ORGANIZATION_ID: req.params['ID']}, function (gErr, gRows) {
                if (RouteHelper.hasInternalError(res, gErr, gRows)) {
                    return;
                }

                var toFindMembers = [], groups = {};
                if (gRows.length < 1) {
                    toFindMembers.push({ID: 10000000});
                }

                for (var i = 0; i < gRows.length; i++) {
                    toFindMembers.push({GROUP_ID: gRows[i]['ID']});
                    groups[gRows[i]['ID']] = gRows[i];
                    groups[gRows[i]['ID']]['MEMBERS'] = [];
                }

                Organization_Members.find(toFindMembers, function (mErr, mRows) {
                    if (RouteHelper.hasInternalError(res, mErr, mRows)) {
                        return;
                    }

                    var toFindAccounts = [];
                    if (mRows.length < 1) {
                        toFindAccounts.push({ID: 10000000});
                    }

                    for (var j = 0; j < mRows.length; j++) {
                        toFindAccounts.push({ID: mRows[j]['ACCOUNT_ID']});
                        groups[mRows[j]['GROUP_ID']]['MEMBERS'].push('ACCOUNT_ID');
                    }

                    Accounts.find(toFindAccounts, function (aErr, aRows) {
                        if(RouteHelper.hasInternalError(res, aErr, aRows)){
                            return;
                        }

                        RouteHelper.sendSuccess(res, {
                            data: {
                                organization: Util.onlyReturn(oRows, ['NAME', 'USERNAME', 'DESCRIPTION', 'DATE_CREATED', 'TYPE']),
                                groups: Util.onlyReturn(gRows, ['']),
                            }
                        });
                    });
                });
            });
        });
    });

    app.patch('/organization/:ID', function (req, res) {
        Security.validate(req, res, function (err, sPayload) {
            if (err) {
                return;
            }

            if (!RouteHelper.hasBody(req.params, res, {
                    ID: {TYPE: "NUMBER", MAX: 12}
                })) {
                return;
            }

            if (!RouteHelper.hasABody(req.body, res, {
                    NAME: {TYPE: "UNICODE", MIN: 1, MAX: 64},
                    DESCRIPTION: {TYPE: "UNICODE", MIN: 1, MAX: 255}
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

                if (oRows[0]['ACCOUNT_ID'] != sPayload) {
                    RouteHelper.sendError(res, Errors.ORGANIZATION_INSUFFICIENT_PERMISSIONS);
                    return;
                }

                var toUpdate = {};
                if (typeof req.body['NAME'] != "undefined") {
                    toUpdate['NAME'] = req.body['NAME'];
                }

                if (typeof req.body['DESCRIPTION'] != "undefined") {
                    toUpdate['DESCRIPTION'] = req.body['DESCRIPTION'];
                }

                Organizations.update(toUpdate, {ID: req.params['ID']}, function (oErr) {
                });

                RouteHelper.sendSuccess(res);
            });
        });
    });

    app.post('/organization/:ID/group', function (req, res) {
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
                    NAME: {TYPE: "UNICODE", MAX: 36, MIN: 1},
                    PASSWORD: {TYPE: "UNICODE", MAX: 20}
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

                Organization_Members.find({
                    ACCOUNT_ID: sPayload,
                    ORGANIZATION_ID: req.params['ID'],
                    ADMIN: 1
                }, function (mErr, mRows) {
                    if (RouteHelper.hasInternalError(res, mErr, mRows)) {
                        return;
                    }

                    if (mRows.length < 1) {
                        RouteHelper.sendError(res, Errors.ORGANIZATION_INSUFFICIENT_PERMISSIONS);
                        return;
                    }

                    Organization_Groups.insert({
                        NAME: req.body['NAME'],
                        PASSWORD: req.body['PASSWORD'],
                        ORGANIZATION_ID: req.params['ID']
                    }, function (gERr) {
                    });

                    RouteHelper.sendSuccess(res);
                });
            });
        });
    });

    app.delete('/organization/:ID/group/:GROUP', function (req, res) {
        Security.validate(req, res, function (err, sPayload) {
            if (err) {
                return;
            }

            if (!RouteHelper.hasBody(req.params, res, {
                    ID: {TYPE: "NUMBER", MAX: 12},
                    GROUP: {TYPE: "NUMBER", MAX: 12}
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

                Organization_Members.find({
                    ACCOUNT_ID: sPayload,
                    ORGANIZATION_ID: req.params['ID'],
                    ADMIN: 1
                }, function (mErr, mRows) {
                    if (RouteHelper.hasInternalError(res, mErr, mRows)) {
                        return;
                    }

                    if (mRows.length < 1) {
                        RouteHelper.sendError(res, Errors.ORGANIZATION_INSUFFICIENT_PERMISSIONS);
                        return;
                    }

                    Organization_Groups.find({ID: req.params['GROUP']}, function (gErr, gRows) {
                        if (RouteHelper.hasInternalError(res, gErr, gRows)) {
                            return;
                        }

                        if (gRows.length < 1) {
                            RouteHelper.sendError(res, Errors.ORGANIZATION_GROUP_INVALID);
                            return;
                        }

                        Organization_Groups.delete({ID: req.params['GROUP']}, function (gERr) {
                        });

                        RouteHelper.sendSuccess(res);
                    });
                });
            });
        });
    });

    app.patch('/organization/:ID/group/:GROUP', function (req, res) {
        Security.validate(req, res, function (err, sPayload) {
            if (err) {
                return;
            }

            if (!RouteHelper.hasBody(req.params, res, {
                    ID: {TYPE: "NUMBER", MAX: 12},
                    GROUP: {TYPE: "NUMBER", MAX: 12}
                })) {
                return;
            }

            if (!RouteHelper.hasBody(req.body, res, {
                    NAME: {TYPE: "UNICODE", MAX: 36, MIN: 1},
                    PASSWORD: {TYPE: "UNICODE", MAX: 20}
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

                Organization_Members.find({
                    ACCOUNT_ID: sPayload,
                    ORGANIZATION_ID: req.params['ID'],
                    ADMIN: 1
                }, function (mErr, mRows) {
                    if (RouteHelper.hasInternalError(res, mErr, mRows)) {
                        return;
                    }

                    if (mRows.length < 1) {
                        RouteHelper.sendError(res, Errors.ORGANIZATION_INSUFFICIENT_PERMISSIONS);
                        return;
                    }

                    Organization_Groups.find({ID: req.params['GROUP']}, function (gErr, gRows) {
                        if (RouteHelper.hasInternalError(res, gErr, gRows)) {
                            return;
                        }

                        if (gRows.length < 1) {
                            RouteHelper.sendError(res, Errors.ORGANIZATION_GROUP_INVALID);
                            return;
                        }

                        Organization_Groups.update({
                            NAME: req.body['NAME'],
                            PASSWORD: req.body['PASSWORD']
                        }, {ID: req.params['GROUP']}, function (gERr) {
                        });

                        RouteHelper.sendSuccess(res);
                    });
                });
            });
        });
    });

    app.post('/organization/:ID/group/:GROUP/member', function (req, res) {
        Security.validate(req, res, function (err, sPayload) {
            if (err) {
                return;
            }

            if (!RouteHelper.hasBody(req.params, res, {
                    ID: {TYPE: "NUMBER", MAX: 12},
                    GROUP: {TYPE: "NUMBER", MAX: 12}
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

                Organization_Members.find({
                    ACCOUNT_ID: sPayload,
                    ORGANIZATION_ID: req.params['ID']
                }, function (mErr, mRows) {
                    if (RouteHelper.hasInternalError(res, mErr, mRows)) {
                        return;
                    }

                    if (mRows.length > 0) {
                        RouteHelper.sendError(res, Errors.ORGANIZATION_MEMBER_DUPLICATE);
                        return;
                    }

                    Organization_Groups.find({
                        ORGANIZATION_ID: oRows[0]['ID'],
                        ID: req.params['GROUP']
                    }, function (gErr, gRows) {
                        if (RouteHelper.hasInternalError(res, gErr, gRows)) {
                            return;
                        }

                        if (gRows.length < 1) {
                            RouteHelper.sendError(res, Errors.ORGANIZATION_GROUP_INVALID);
                            return;
                        }

                        if (gRows[0]['PASSWORD'] != null) {
                            if (!RouteHelper.hasBody(req.body, res, {
                                    PASSWORD: {TYPE: "UNICODE", MIN: 1, MAX: 20}
                                })) {
                                return;
                            }

                            if (gRows[0]['PASSWORD'] != req.body['PASSWORD']) {
                                RouteHelper.sendError(res, Errors.ORGANIZATION_PASSWORD_INVALID);
                                return;
                            }
                        }

                        Organization_Members.insert({
                            ACCOUNT_ID: sPayload,
                            ORGANIZATION_ID: req.params['ID'],
                            GROUP_ID: req.params['GROUP'],
                            DATE_JOINED: Util.getTime()
                        }, function (gErr) {
                        });

                        RouteHelper.sendSuccess(res);
                    });
                });
            });
        });
    });

    app.get('/organization/:ID/group/:GROUP/member', function (req, res) {
        Security.validate(req, res, function (err, sPayload) {
            if (err) {
                return;
            }

            if (!RouteHelper.hasBody(req.params, res, {
                    ID: {TYPE: "NUMBER", MAX: 12},
                    GROUP: {TYPE: "NUMBER", MAX: 12}
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

                Organization_Members.find({
                    ACCOUNT_ID: sPayload,
                    ORGANIZATION_ID: req.params['ID']
                }, function (mErr, mRows) {
                    if (RouteHelper.hasInternalError(res, mErr, mRows)) {
                        return;
                    }

                    if (mRows.length < 1) {
                        RouteHelper.sendError(res, Errors.ORGANIZATION_INSUFFICIENT_PERMISSIONS);
                        return;
                    }

                    Organization_Groups.find({
                        ORGANIZATION_ID: oRows[0]['ID'],
                        ID: req.params['GROUP']
                    }, function (gErr, gRows) {
                        if (RouteHelper.hasInternalError(res, gErr, gRows)) {
                            return;
                        }

                        if (gRows.length < 1) {
                            RouteHelper.sendError(res, Errors.ORGANIZATION_GROUP_INVALID);
                            return;
                        }

                        Organization_Members.find({
                            ORGANIZATION_ID: req.params['ID'],
                            ID: req.params['GROUP']
                        }, function (fmErr, fmRows) {
                            if (RouteHelper.hasInternalError(res, fmErr, fmRows)) {
                                return;
                            }

                            RouteHelper.sendSuccess(res, fmRows);
                        });
                    });
                });
            });
        });
    });

    app.post('/organization/:ID/admin/:ACCOUNT', function (req, res) {
        Security.validate(req, res, function (err, sPayload) {
            if (err) {
                return;
            }

            if (!RouteHelper.hasBody(req.params, res, {
                    ID: {TYPE: "NUMBER", MAX: 12},
                    ACCOUNT: {TYPE: "NUMBER", MAX: 12}
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

                if (sPayload != oRows[0]['ACCOUNT_ID']) {
                    RouteHelper.sendError(res, Errors.ORGANIZATION_INSUFFICIENT_PERMISSIONS);
                    return;
                }

                Organization_Members.find({
                    ORGANIZATION_ID: req.params['ID'],
                    ACCOUNT_ID: req.params['ACCOUNT']
                }, function (mErr, mRows) {
                    if (RouteHelper.hasInternalError(res, mErr, mRows)) {
                        return;
                    }

                    if (mRows.length < 1) {
                        Organization_Members.insert({
                            ADMIN: 0,
                            ACCOUNT_ID: req.params['ACCOUNT'],
                            ORGANIZATION_ID: req.params['ID'],
                            DATE_JOINED: Util.getTime()
                        }, function (mErr) {
                        });
                        RouteHelper.sendSuccess(res);
                        return;
                    }

                    Organization_Members.update({ADMIN: 1}, {ID: mRows[0]['ID']}, function (mErr) {
                    });

                    RouteHelper.sendSuccess(res);
                });
            });
        });
    });

    app.delete('/organization/:ID/admin/:ACCOUNT', function (req, res) {
        Security.validate(req, res, function (err, sPayload) {
            if (err) {
                return;
            }

            if (!RouteHelper.hasBody(req.params, res, {
                    ID: {TYPE: "NUMBER", MAX: 12},
                    ACCOUNT: {TYPE: "NUMBER", MAX: 12}
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

                if (sPayload != oRows[0]['ACCOUNT_ID']) {
                    RouteHelper.sendError(res, Errors.ORGANIZATION_INSUFFICIENT_PERMISSIONS);
                    return;
                }

                Organization_Members.find({
                    ORGANIZATION_ID: req.params['ID'],
                    ACCOUNT_ID: req.params['ACCOUNT']
                }, function (mErr, mRows) {
                    if (RouteHelper.hasInternalError(res, mErr, mRows)) {
                        return;
                    }

                    if (mRows.length < 1) {
                        RouteHelper.sendSuccess(res);
                        return;
                    }

                    Organization_Members.update({ADMIN: 0}, {ID: mRows[0]['ID']}, function (mErr) {
                    });

                    RouteHelper.sendSuccess(res);
                });
            });
        });
    })
}

module.exports = OrganizationRoute;
