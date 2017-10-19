var path = require('path');
var Security = require('../util/Security');
var Util = require('../util/Util');
var Event_Applications = require('../tables/event/Event_Applications');
var Organization_Members = require('../tables/organization/Organization_Members');
var Organization_Groups = require('../tables/organization/Organization_Groups');
var Organizations = require('../tables/organization/Organizations');
var Events = require('../tables/event/Events');
var Event_Admins = require('../tables/event/Event_Admins');
var Accounts = require('../tables/account/Accounts');
var WebsiteUtil = require('./WebsiteUtil');
var parser = require('ua-parser-js');

function OrganizationHandler(app) {
    app.get('/organization/:ID/event', function (req, res) {
        if (isMobile(req)) {
            var toReturnParameters = {
                NAVBAR: WebsiteUtil.getMobileNavigationBar('../'),
                NAVBAR_ASSETS: WebsiteUtil.getMobileNavigationBarAssets('../'),
                FOOTER: WebsiteUtil.getMobileFooter('../'),
                JAVASCRIPT: '**/loggedIn = true;ID=' + req.params['ID'] + ';/**'
            };

            res.render(path.resolve(__dirname + '/../../public/mobile/event/create/create.frost'), toReturnParameters);
            return;
        }

        Security.validateNoSend(req, res, function (nLogged, sPayload) {
            if (nLogged) {
                res.render(path.resolve(__dirname + '/../../public/desktop/events/create/create.frost'), {
                    MESSAGE: "YOU NEED TO BE LOGGED IN MY DUDE",
                    NAVBAR: WebsiteUtil.getNavigationBar(!nLogged, '../../', encodeURIComponent(req.protocol + '://' + req.get('Host') + req.url)),
                    JAVASCRIPT: '**/ID=' + req.params['ID'] + ';/**'
                });
                return;
            }

            Organization_Members.find({
                ORGANIZATION_ID: req.params['ID'],
                ACCOUNT_ID: sPayload,
                ADMIN: 1
            }, function (oErr, oRows) {
                if (oErr) {
                    res.render(path.resolve(__dirname + '/../../public/desktop/events/create/create.frost'), {
                        MESSAGE: "Organizaiton not found",
                        NAVBAR: WebsiteUtil.getNavigationBar(!nLogged, '../../', encodeURIComponent(req.protocol + '://' + req.get('Host') + req.url)),
                        JAVASCRIPT: '**/ID=' + req.params['ID'] + ';/**'
                    });
                    return;
                }

                if (oRows.length < 1) {
                    res.render(path.resolve(__dirname + '/../../public/desktop/events/create/create.frost'), {
                        MESSAGE: "Organizaiton not found",
                        NAVBAR: WebsiteUtil.getNavigationBar(!nLogged, '../../', encodeURIComponent(req.protocol + '://' + req.get('Host') + req.url)),
                        JAVASCRIPT: '**/ID=' + req.params['ID'] + ';/**'
                    });
                    return;
                }


                res.render(path.resolve(__dirname + '/../../public/desktop/events/create/create.frost'), {
                    JAVASCRIPT: "**/ID=" + req.params['ID'] + "/**",
                    NAVBAR: WebsiteUtil.getNavigationBar(!nLogged, '../../', encodeURIComponent(req.protocol + '://' + req.get('Host') + req.url)),
                });
            });
        });
    });

    app.get('/event/:EVENT', function (req, res) {
        Security.validateNoSend(req, res, function (nLogged, sPayload) {
            if (isMobile(req)) {
                var toReturnParameters = {
                    NAVBAR: WebsiteUtil.getMobileNavigationBar('../'),
                    NAVBAR_ASSETS: WebsiteUtil.getMobileNavigationBarAssets('../'),
                    FOOTER: WebsiteUtil.getMobileFooter('../'),
                    JAVASCRIPT: '**/loggedIn = true;ID=' + req.params['EVENT'] + ';/**',
                    NAME: 'NOT FOUND',
                    HOST: 'John Deer Tractors',
                    BUTTONS: '',
                    LOCATION: ''
                };

                Events.find({ID: req.params['EVENT']}, function (eErr, eRows) {
                    if (eErr || eRows.length < 1) {
                        res.render(path.resolve(__dirname + '/../../public/mobile/event/view/event.frost'), toReturnParameters);
                        return;
                    }

                    toReturnParameters['NAME'] = eRows[0]['NAME'];
                    toReturnParameters['LOCATION'] = eRows[0]['LOCATION'];

                    if(nLogged){
                        toReturnParameters['BUTTONS'] += '<input type="button" onclick="editEvent_()" class="cButton" value="Login to Apply" />';
                        res.render(path.resolve(__dirname + '/../../public/mobile/event/view/event.frost'), toReturnParameters);
                        return;
                    }

                    Event_Admins.find({EVENT_ID: req.params['EVENT'], ACCOUNT_ID: sPayload}, function (aErr, aRows) {
                        if (aErr || aRows.length < 1) {
                        }

                        if (!aErr && aRows.length > 0 && (aRows[0]['ADMIN'] || eRows[0]['ACCOUNT_ID'] == sPayload)) {
                            toReturnParameters['BUTTONS'] += '<input type="button" onclick="editEvent_()" class="cButton" value="Edit Event" />';
                        }

                        if (eRows[0]['ACCOUNT_ID'] == sPayload) {
                            toReturnParameters['BUTTONS'] += '<input type="button" onclick="deleteEvent_()" class="cButton" style="background-color: #b94a48;" value="Delete Event" />';
                        }

                        Event_Applications.find({
                            EVENT_ID: req.params['EVENT'],
                            ACCOUNT_ID: sPayload
                        }, function (eAErr, eARows) {
                            if (!aErr && aRows.length > 0 && (aRows[0]['ADMIN'] || eRows[0]['ACCOUNT_ID'] == sPayload)) {
                                toReturnParameters['BUTTONS'] += '<input type="button" onclick="editEvent_()" class="cButton" value="Check Applications" />';
                            }else {
                                if (eARows.length < 0) {
                                    toReturnParameters['BUTTONS'] += '<input type="button" onclick="editEvent_()" class="cButton" value="Apply for Event" />';
                                } else {
                                    toReturnParameters['BUTTONS'] += '<input type="button" onclick="editEvent_()" class="cButton" value="Apply to Event" />';
                                }
                            }

                            res.render(path.resolve(__dirname + '/../../public/mobile/event/view/event.frost'), toReturnParameters);
                        });
                    });
                });

                return;
            }

            toReturnParameters = {
                NAVBAR: WebsiteUtil.getNavigationBar(!nLogged, '../', encodeURIComponent(req.protocol + '://' + req.get('Host') + req.url)),
                JAVASCRIPT: '**/loggedIn = true;ID=' + req.params['EVENT'] + ';/**',
                NAME: "No Organization Found",
                USERNAME: "Organization Not Found",
                DESCRIPTION: "Organization Not Found",
                HOST: 'John Deer Tractors',
                BUTTONS: '',
                LOCATION: ''
            };

            Events.find({ID: req.params['EVENT']}, function (eErr, eRows) {
                if (eErr || eRows.length < 1) {
                    res.render(path.resolve(__dirname + '/../../public/desktop/events/view/event.frost'), toReturnParameters);
                    return;
                }

                toReturnParameters['NAME'] = eRows[0]['NAME'];
                toReturnParameters['DATE'] = Util.getTwoDates(Util.parseTime(eRows[0]['START_TIME']), Util.parseTime(eRows[0]['END_TIME']));
                toReturnParameters['DESCRIPTION'] = eRows[0]['DESCRIPTION'];
                toReturnParameters['LOCATION'] = eRows[0]['LOCATION'];

                if(nLogged){
                    toReturnParameters['BUTTONS'] += '<input type="button" onclick="editEvent_()" class="cButton" style=" width: 100%; background-color: #4DB6AC;" value="Login to Apply" />';
                    res.render(path.resolve(__dirname + '/../../public/desktop/events/view/event.frost'), toReturnParameters);
                    return;
                }

                Event_Admins.find({EVENT_ID: req.params['EVENT'], ACCOUNT_ID: sPayload}, function (aErr, aRows) {
                    if (aErr || aRows.length < 1) {
                    }

                    if (!aErr && aRows.length > 0 && (aRows[0]['ADMIN'] || eRows[0]['ACCOUNT_ID'] == sPayload)) {
                        toReturnParameters['BUTTONS'] += '<input type="button" onclick="editEvent_()" class="cButton" style=" width: 100%; background-color: #4DB6AC;" value="Edit Event" />';
                    }

                    if (eRows[0]['ACCOUNT_ID'] == sPayload) {
                        toReturnParameters['BUTTONS'] += '<input type="button" onclick="deleteEvent_()" class="cButton" style="background-color: #b94a48; width: 100%;" value="Delete Event" />';
                    }

                    Event_Applications.find({
                        EVENT_ID: req.params['EVENT'],
                        ACCOUNT_ID: sPayload
                    }, function (eAErr, eARows) {
                        if (!aErr && aRows.length > 0 && (aRows[0]['ADMIN'] || eRows[0]['ACCOUNT_ID'] == sPayload)) {
                            toReturnParameters['BUTTONS'] += '<input type="button" onclick="editEvent_()" style=" width: 100%; background-color: #4DB6AC;" class="cButton" value="Check Applications" />';
                        }else {
                            if (eARows.length < 0) {
                                toReturnParameters['BUTTONS'] += '<input type="button" onclick="editEvent_()" style="background-color: #4DB6AC; width: 100%;" class="cButton" value="Apply for Event" />';
                            } else {
                                toReturnParameters['BUTTONS'] += '<input type="button" onclick="editEvent_()" style="background-color: #4DB6AC; width: 100%;" class="cButton" value="Apply for Event" />';
                            }
                        }

                        res.render(path.resolve(__dirname + '/../../public/desktop/events/view/event.frost'), toReturnParameters);
                    });
                });
            });
        });
    });

    app.get('/event/:EVENT/apply', function (req, res) {
        Events.find({ID: req.params['EVENT']}, function (eErr, eRows) {
            var toReturnParameters = {
                JAVASCRIPT: ""
            };

            if (eErr || eRows.length < 1) {
                res.writeHead(302, {
                    'Location': '../'
                });

                res.end();

                return;
            }

            Security.validateNoSend(req, res, function (nLogged, sPayload) {
                if (nLogged) {
                    res.writeHead(302, {
                        'Location': '../'
                    });

                    res.end();
                    return;
                }

                Event_Applications.find({
                    ACCOUNT_ID: sPayload,
                    EVENT_ID: req.params['EVENT']
                }, function (aErr, aRows) {
                    if (aErr) {
                        res.writeHead(302, {
                            'Location': '../'
                        });

                        res.end();
                        return;
                    }

                    if (aRows.length > 0) {
                        res.writeHead(302, {
                            'Location': '../'
                        });

                        res.end();
                        return;
                    }

                    toReturnParameters['JAVASCRIPT'] = '**/START_TIME = "' + eRows[0]['START_TIME'] + '"; END_TIME = "' + eRows[0]['END_TIME'] + '"; ID = ' + req.params['EVENT'] + '/**';
                    res.render(path.resolve(__dirname + '/../../public/desktop/events/apply.frost'), toReturnParameters);
                });
            });
        });
    });

    app.get('/event/:EVENT/application', function (req, res) {
        Events.find({ID: req.params['EVENT']}, function (eErr, eRows) {
            var toReturnParameters = {
                JAVASCRIPT: ""
            };

            if (eErr || eRows.length < 1) {
                res.writeHead(302, {
                    'Location': '../'
                });

                res.end();

                return;
            }

            Security.validateNoSend(req, res, function (nLogged, sPayload) {
                if (nLogged) {
                    res.writeHead(302, {
                        'Location': '../'
                    });

                    res.end();
                    return;
                }

                Event_Applications.find({
                    ACCOUNT_ID: sPayload,
                    EVENT_ID: req.params['EVENT']
                }, function (aErr, aRows) {
                    if (aErr) {
                        res.writeHead(302, {
                            'Location': '../'
                        });

                        res.end();
                        return;
                    }

                    if (aRows.length < 1) {
                        res.writeHead(302, {
                            'Location': '../'
                        });

                        res.end();
                        return;
                    }

                    toReturnParameters['START_DATE'] = aRows[0]['START_TIME'];
                    toReturnParameters['END_DATE'] = aRows[0]['END_TIME'];
                    toReturnParameters['STATUS'] = "" + aRows[0]['STATUS'];

                    if (toReturnParameters['STATUS'] == null) {
                        toReturnParameters['STATUS'] = "0";
                    }

                    res.render(path.resolve(__dirname + '/../../public/desktop/events/application.frost'), toReturnParameters);
                });
            });
        });
    });

    app.get('/event/:EVENT/admin', function (req, res) {
        var toReturnParameters = {
            NAME: "Unknown Event",
            APPLICATIONS: "None"
        };

        Events.find({ID: req.params['EVENT']}, function (eErr, eRows) {
            if (eErr || eRows.length < 1) {
                res.render(path.resolve(__dirname + '/../../public/desktop/events/admin.frost'), toReturnParameters);
                return;
            }

            toReturnParameters['NAME'] = eRows[0]['NAME'];
            Security.validateNoSend(req, res, function (nLogged, sPayload) {
                if (nLogged) {
                    res.writeHead(302, {
                        'Location': '../'
                    });

                    res.end();
                    return;
                }

                Event_Admins.find({
                    ACCOUNT_ID: sPayload,
                    EVENT_ID: req.params['EVENT']
                }, function (aErr, aRows) {
                    if (aErr) {
                        res.writeHead(302, {
                            'Location': '../'
                        });

                        res.end();
                        return;
                    }

                    if (aRows.length < 1) {
                        res.writeHead(302, {
                            'Location': '../'
                        });

                        res.end();
                        return;
                    }

                    Event_Applications.find({EVENT_ID: req.params['EVENT']}, function (apErr, apRows) {
                        if (apErr) {
                            res.render(path.resolve(__dirname + '/../../public/desktop/events/admin.frost'), toReturnParameters);
                            return;
                        }

                        if (apRows.length < 1) {
                            res.render(path.resolve(__dirname + '/../../public/desktop/events/admin.frost'), toReturnParameters);
                            return;
                        }

                        var toFindAccounts = [];
                        for (var i = 0; i < apRows.length; i++) {
                            toFindAccounts.push({ID: apRows[i]['ACCOUNT_ID']});
                        }

                        Accounts.find(toFindAccounts, function (acErr, acRows) {
                            if (acErr) {
                                res.render(path.resolve(__dirname + '/../../public/desktop/events/admin.frost'), toReturnParameters);
                                return;
                            }

                            if (acRows.length < 1) {
                                res.render(path.resolve(__dirname + '/../../public/desktop/events/admin.frost'), toReturnParameters);
                                return;
                            }

                            var accounts = {};
                            for (var j = 0; j < acRows.length; j++) {
                                accounts[acRows[j]['ID']] = acRows[j]['DISPLAY_NAME'];
                            }

                            var applications = '';
                            for (var l = 0; l < apRows.length; l++) {
                                applications += '<a href="application/' + apRows[l]['ID'] + '">' + accounts[apRows[l]['ACCOUNT_ID']] + '</a><br>';
                            }

                            toReturnParameters['APPLICATIONS'] = applications;
                            res.render(path.resolve(__dirname + '/../../public/desktop/events/admin.frost'), toReturnParameters);
                        });
                    });
                });
            });
        });
    });

    app.get('/event/:EVENT/application/:ID', function (req, res) {
        var toReturnParameters = {
            NAME: "Application not found",
            INFO: "No application found",
            ACTION: ""
        };

        Events.find({ID: req.params['EVENT']}, function (eErr, eRows) {
            if (eErr || eRows.length < 1) {
                res.render(path.resolve(__dirname + '/../../public/desktop/events/admin.frost'), toReturnParameters);
                return;
            }

            Security.validateNoSend(req, res, function (nLogged, sPayload) {
                if (nLogged) {
                    res.writeHead(302, {
                        'Location': '../'
                    });

                    res.end();
                    return;
                }

                Event_Admins.find({
                    ACCOUNT_ID: sPayload,
                    EVENT_ID: req.params['EVENT']
                }, function (aErr, aRows) {
                    if (aErr) {
                        res.writeHead(302, {
                            'Location': '../'
                        });

                        res.end();
                        return;
                    }

                    if (aRows.length < 1) {
                        res.writeHead(302, {
                            'Location': '../'
                        });

                        res.end();
                        return;
                    }

                    Event_Applications.find({
                        EVENT_ID: req.params['EVENT'],
                        ID: req.params['ID']
                    }, function (apErr, apRows) {
                        if (apErr) {
                            res.render(path.resolve(__dirname + '/../../public/desktop/events/aapp.frost'), toReturnParameters);
                            return;
                        }

                        if (apRows.length < 1) {
                            res.render(path.resolve(__dirname + '/../../public/desktop/events/aapp.frost'), toReturnParameters);
                            return;
                        }

                        Accounts.find({ID: apRows[0]['ACCOUNT_ID']}, function (acErr, acRows) {
                            if (acErr) {
                                res.render(path.resolve(__dirname + '/../../public/desktop/events/aapp.frost'), toReturnParameters);
                                return;
                            }

                            if (acRows.length < 1) {
                                res.render(path.resolve(__dirname + '/../../public/desktop/events/aapp.frost'), toReturnParameters);
                                return;
                            }

                            toReturnParameters['NAME'] = acRows[0]['DISPLAY_NAME'] + "'s Application";

                            toReturnParameters['INFO'] = toReturnParameters['NAME'] + "<br>Start Time: " + apRows[0]['START_TIME'] + "<br>"
                                + "End Time: " + apRows[0]['END_TIME'] + "<br>"
                                + "Status: " + apRows[0]['STATUS'];

                            if (apRows[0]['STATUS'] == 0 || apRows[0]['STATUS'] == null || apRows[0]['STATUS'] > 2) {
                                toReturnParameters['ACTION'] = '<button id="ACCEPT">Accept</button><button id="DENY">Deny</button>';
                            } else {
                                toReturnParameters['ACTION'] = '<button id="CANCEL">Cancel</button>';
                            }

                            toReturnParameters['JAVASCRIPT'] = "**/ID = " + req.params['ID'] + "; EVENT = " + req.params['EVENT'] + ";/**";

                            res.render(path.resolve(__dirname + '/../../public/desktop/events/aapp.frost'), toReturnParameters);
                        });
                    });
                });
            });
        });
    });
}

function isMobile(req) {
    var ua = parser(req.headers['user-agent']);

    return typeof ua.device.type != "undefined";
}

module.exports = OrganizationHandler;