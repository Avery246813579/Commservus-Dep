var path = require('path');
var Security = require('../util/Security');
var Util = require('../util/Util');
var parser = require('ua-parser-js');
var Organization_Members = require('../tables/organization/Organization_Members');
var Organizations = require('../tables/organization/Organizations');
var RouteHelper = require('../util/RouteHelper');
var Event_Applications = require('./../tables/event/Event_Applications');
var Events = require('./../tables/event/Events');
var Event_Admins = require('./../tables/event/Event_Admins');
var Accounts = require('./../tables/account/Accounts');
var Emails = require('./../tables/account/Emails');
var WebsiteUtil = require('./WebsiteUtil');

function WebsiteHandler(app, route, express) {
    route.use(express.static(path.join(__dirname + "/../../", 'public')));

    require('./OrganizationHandler')(route);
    require('./EventHandler')(route);
    require('./AdminHandler')(route);
    require('./SettingHandler')(route);

    route.get('/test', function (req, res) {
        Security.validateNoSend(req, res, function (nLogged, id) {
            res.render(path.resolve(__dirname + '/../../public/desktop/test.frost'), {
                NAVBAR: WebsiteUtil.getNavigationBar(!nLogged, '', encodeURIComponent(req.protocol + '://' + req.get('Host') + req.url))
            });
        });
    });

    route.get('/email', function (req, res) {
        Security.validateNoSend(req, res, function (err, id) {
            if (!RouteHelper.hasBody(req.query, res, {
                    USERNAME: {
                        MIN: 4,
                        MAX: 16,
                        TYPE: "LNU"
                    },
                    TOKEN: {
                        LENGTH: 64,
                        TYPE: "LNU"
                    }
                }, true)) {

                res.render(path.resolve(__dirname + '/../../public/desktop/general/email/email.frost'), {
                    EMAIL: '<div class="title"> Are you lost? </div> <div class="description"> You are not suppose to be here </div> <input type="button" onclick="location.href = \'../\'" style="background-color: #b4b4b4" value="Let\'s go home">'
                });

                return;
            }

            Accounts.find({USERNAME: req.query['USERNAME']}, function (aErr, aRows) {
                if (aErr) {
                    res.render(path.resolve(__dirname + '/../../public/desktop/general/email/email.frost'), {
                        EMAIL: '<div class="title"> Are you lost? </div> <div class="description"> You are not suppose to be here </div> <input type="button" onclick="location.href = \'../\'" style="background-color: #b4b4b4" value="Let\'s go home">'
                    });

                    return;
                }

                if (aRows.length < 1) {
                    res.render(path.resolve(__dirname + '/../../public/desktop/general/email/email.frost'), {
                        EMAIL: '<div class="title"> Are you lost? </div> <div class="description"> You are not suppose to be here </div> <input type="button" onclick="location.href = \'../\'" style="background-color: #b4b4b4" value="Let\'s go home">'
                    });

                    return;
                }

                Emails.find({ACCOUNT_ID: aRows[0]['ID'], TOKEN: req.query['TOKEN']}, function (eErr, eRows) {
                    if (eErr) {
                        res.render(path.resolve(__dirname + '/../../public/desktop/general/email/email.frost'), {
                            EMAIL: 'Are you lost? <input type="button" onclick="location.href = \'../\'" style="background-color: #b4b4b4" value="Let\'s go home">'
                        });

                        return;
                    }

                    if (eRows.length < 1) {
                        res.render(path.resolve(__dirname + '/../../public/desktop/general/email/email.frost'), {
                            EMAIL: '<div class="title"> Are you lost? </div> <div class="description"> You are not suppose to be here </div> <input type="button" onclick="location.href = \'../\'" style="background-color: #b4b4b4" value="Let\'s go home">'
                        });

                        return;
                    }

                    if (Util.getServerTime().getTime() > Util.parseTime(eRows[0]['DATE_EXPIRES']).getTime()) {
                        res.render(path.resolve(__dirname + '/../../public/desktop/general/email/email.frost'), {
                            EMAIL: '<div class="title"> Email Token Expired </div> <div class="description"> You need to send a new email </div> <input type="button" onclick="location.href = \'../\'" style="background-color: #b4b4b4" value="Let\'s go home">'
                        });

                        return;
                    }

                    switch (eRows[0]['TYPE']) {
                        default:
                            res.render(path.resolve(__dirname + '/../../public/desktop/general/email/email.frost'), {
                                EMAIL: '<div class="title"> Internal Error </div> <div class="description"> This case should never be met. You broke me. </div> <input type="button" onclick="location.href = \'../\'" style="background-color: #b4b4b4" value="Let\'s go home">'
                            });

                            break;
                        case 0:
                            res.render(path.resolve(__dirname + '/../../public/desktop/general/email/email.frost'), {
                                EMAIL: '<div class="title"> Email Authenticated! </div> <div class="description"> You have successfully authenticated your email </div> <input type="button" onclick="location.href = \'../\'" style="background-color: #b4b4b4" value="Let\'s go home">'
                            });

                            Accounts.update({
                                EMAIL: eRows[0]['EMAIL'],
                                CONFIRMED: 1
                            }, {ID: aRows[0]['ID']}, function (aErr) {
                            });
                            Emails.delete({ID: eRows[0]['ID']}, function (eErr) {
                            });
                            break;
                        case 1:
                            res.render(path.resolve(__dirname + '/../../public/desktop/general/email/email.frost'), {
                                    EMAIL: '<form id="form" method="post" action="#"> <input type="submit" style="display: none"> <div class="title"> Reset Password </div><div id="STATUS" class="status"></div><input type=submit style="display: none"> <input type="password" name="password" placeholder="Password" id="password"><br> <input name="confirm" type="password" id="confirm" placeholder="Confirm Password"> <input style="margin-top: 5px" type="button" value="Reset Password" id="button" onclick="change()"> <input type="button" onclick="location.href = \'../\'" style="background-color: #b4b4b4" value="Home page"></form>'
                                }
                            );

                            break;
                    }

                });
            })

        });
    });

    route.get('/', function (req, res) {
        Security.validateNoSend(req, res, function (nLogged, id) {
            if (!nLogged) {
                if (isMobile(req)) {
                    var toReturnParameters = {
                        ORGANIZATIONS: '<div class="nan"> None found! </div>',
                        EVENTS: '<div class="nan"> None found! </div>',
                        NAVBAR: WebsiteUtil.getMobileNavigationBar(''),
                        NAVBAR_ASSETS: WebsiteUtil.getMobileNavigationBarAssets(''),
                        FOOTER: WebsiteUtil.getMobileFooter(''),
                        JAVASCRIPT: "**/loggedIn = true;/**"
                    };

                    Event_Applications.find({ACCOUNT_ID: id}, function (aErr, aRows) {
                        if (aErr) {
                            res.render(path.resolve(__dirname + '/../../public/mobile/general/index/index.frost'), toReturnParameters);
                            return;
                        }

                        var toFindEvents = [];
                        for (var i = 0; i < aRows.length; i++) {
                            toFindEvents.push({ID: aRows[i]['EVENT_ID']});
                        }

                        Event_Admins.find({ACCOUNT_ID: id}, function (adErr, adRows) {
                            if (adErr) {
                                res.render(path.resolve(__dirname + '/../../public/mobile/general/index/index.frost'), toReturnParameters);
                                return;
                            }

                            for (var j = 0; j < adRows.length; j++) {
                                toFindEvents.push({ID: adRows[j]['EVENT_ID']});
                            }

                            if (toFindEvents.length < 1) {
                                toFindEvents.push({ID: 100000000});
                            }

                            Events.find(toFindEvents, function (eErr, eRows) {
                                if (eErr) {
                                    res.render(path.resolve(__dirname + '/../../public/mobile/general/index/index.frost'), toReturnParameters);
                                    return;
                                }

                                if (eRows.length > 0) {
                                    toReturnParameters['EVENTS'] = "";
                                }

                                for (var t = 0; t < eRows.length; t++) {
                                    var eRow = eRows[t];

                                    toReturnParameters['EVENTS'] += '<a href="event/' + eRow['ID'] + '"><div class="item"> <img src="assets/favicon.png" width="70" height="70" class="icon"> <div class="info"> <div class="title"> ' + eRow['NAME'] + ' </div> <div class="header"> Danny\'s Place </div> <div class="time"> ' + Util.getTwoDates(Util.parseTime(eRow['START_TIME']), Util.parseTime(eRow['END_TIME'])) + ' </div> </div> </div></a>';
                                }

                                Organization_Members.find({ACCOUNT_ID: id}, function (mErr, mRows) {
                                    if (mErr) {
                                        res.render(path.resolve(__dirname + '/../../public/mobile/general/index/index.frost'), toReturnParameters);
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
                                        if (oErr) {
                                            res.render(path.resolve(__dirname + '/../../public/mobile/general/index/index.frost'), toReturnParameters);
                                            return;
                                        }

                                        if (oRows.length > 0) {
                                            toReturnParameters['ORGANIZATIONS'] = "";
                                        }

                                        for (var p = 0; p < oRows.length; p++) {
                                            toReturnParameters['ORGANIZATIONS'] += '<a href="organization/' + oRows[p]['ID'] + '"><div class="item"> <img src="assets/favicon.png" width="70" height="70" class="icon"> <div class="info"> <div class="title"> ' + oRows[p]['NAME'] + ' </div> <div class="header"> ' + oRows[p]['USERNAME'] + '  </div> </div> </div></a>';
                                        }

                                        res.render(path.resolve(__dirname + '/../../public/mobile/general/index/index.frost'), toReturnParameters);
                                    });
                                });
                            });
                        });
                    });

                    return;
                }


                toReturnParameters = {
                    ORGANIZATIONS: '<tr class="_row"><td>No Organizations Found</td><td></td></tr>',
                    EVENTS: '<tr class="_row"><td>No Events Found</td><td></td><td></td><td></td></tr>',
                    JAVASCRIPT: "**/loggedIn = true;/**",
                    NAVBAR: WebsiteUtil.getNavigationBar(!nLogged, '', encodeURIComponent(req.protocol + '://' + req.get('Host') + req.url))
                };

                Event_Applications.find({ACCOUNT_ID: id}, function (aErr, aRows) {
                    if (aErr) {
                        res.render(path.resolve(__dirname + '/../../public/desktop/general/index/index.frost'), toReturnParameters);
                        return;
                    }

                    var toFindEvents = [];
                    for (var i = 0; i < aRows.length; i++) {
                        toFindEvents.push({ID: aRows[i]['EVENT_ID']});
                    }

                    Event_Admins.find({ACCOUNT_ID: id}, function (adErr, adRows) {
                        if (adErr) {
                            res.render(path.resolve(__dirname + '/../../public/desktop/general/index/index.frost'), toReturnParameters);
                            return;
                        }

                        for (var j = 0; j < adRows.length; j++) {
                            toFindEvents.push({ID: adRows[j]['EVENT_ID']});
                        }

                        if (toFindEvents.length < 1) {
                            toFindEvents.push({ID: 100000000});
                        }

                        Events.find(toFindEvents, function (eErr, eRows) {
                            if (eErr) {
                                res.render(path.resolve(__dirname + '/../../public/desktop/general/index/index.frost'), toReturnParameters);
                                return;
                            }

                            if (eRows.length > 0) {
                                toReturnParameters['EVENTS'] = "";
                            }

                            for (var t = 0; t < eRows.length; t++) {
                                var eRow = eRows[t];

                                toReturnParameters['EVENTS'] += '<tr class="_row" onclick="location.href=\'event/' + eRow['ID'] + '\'"> <td> ' + eRow['NAME'] + ' </td> <td></td> <td></td> <td> ' + Util.getTwoDates(Util.parseTime(eRow['START_TIME']), Util.parseTime(eRow['END_TIME'])) + ' </td> </tr>';
                            }

                            Organization_Members.find({ACCOUNT_ID: id}, function (mErr, mRows) {
                                if (mErr) {
                                    res.render(path.resolve(__dirname + '/../../public/desktop/general/index/index.frost'), toReturnParameters);
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
                                    if (oErr) {
                                        res.render(path.resolve(__dirname + '/../../public/desktop/general/index/index.frost'), toReturnParameters);
                                        return;
                                    }

                                    if (oRows.length > 0) {
                                        toReturnParameters['ORGANIZATIONS'] = "";
                                    }

                                    for (var p = 0; p < oRows.length; p++) {
                                        toReturnParameters['ORGANIZATIONS'] += '<tr class="_row" onclick="location.href=\'organization/' + oRows[p]['ID'] + '\'"> <td> ' + oRows[p]['NAME'] + ' </td> <td> ' + oRows[p]['USERNAME'] + ' </td> </tr>';
                                    }

                                    res.render(path.resolve(__dirname + '/../../public/desktop/general/index/index.frost'), toReturnParameters);
                                });
                            });
                        });
                    });
                });

                return;
            }

            if (isMobile(req)) {
                res.render(path.resolve(__dirname + '/../../public/mobile/general/landing/landing.frost'), {});
            } else {
                res.render(path.resolve(__dirname + '/../../public/desktop/landing.frost'), {});
            }
        });
    });

    route.get('/signup', function (req, res) {
        Security.validateNoSend(req, res, function (nLogged, id) {
            if (!nLogged) {
                res.writeHead(302, {
                    'Location': '../'
                });

                res.end();
                return;
            }

            if (isMobile(req)) {
                res.writeHead(302, {
                    'Location': '../?popup=signup'
                });

                res.end();
            } else {
                res.render(path.resolve(__dirname + '/../../public/desktop/general/signup/signup.frost'), {});
            }
        });
    });

    route.get('/login', function (req, res) {
        Security.validateNoSend(req, res, function (nLogged, id) {
            if (!nLogged) {
                res.writeHead(302, {
                    'Location': '../'
                });

                res.end();
                return;
            }

            if (isMobile(req)) {
                res.writeHead(302, {
                    'Location': '../?popup=login'
                });

                res.end();
            } else {
                res.render(path.resolve(__dirname + '/../../public/desktop/general/login/login.frost'), {});
            }
        });
    });

    route.get('/forgot', function (req, res) {
        Security.validateNoSend(req, res, function (nLogged, id) {
            if (!nLogged) {
                res.writeHead(302, {
                    'Location': '../'
                });

                res.end();
                return;
            }

            if (isMobile(req)) {
                res.writeHead(302, {
                    'Location': '../?popup=forgot'
                });

                res.end();
            } else {
                res.render(path.resolve(__dirname + '/../../public/desktop/general/forgot/forgot.frost'), {});
            }
        });
    });

    route.get('/beta', function (req, res) {
        Security.validateNoSend(req, res, function (nLogged, id) {
            if (isMobile(req)) {
                res.writeHead(302, {
                    'Location': '../?popup=alpha'
                });

                res.end();
            } else {
                res.render(path.resolve(__dirname + '/../../public/desktop/beta.frost'), {});
            }
        });
    });

    route.get('/logout', function (req, res) {
        Util.deleteCookie(res, 'SID');
        Util.deleteCookie(res, 'TOKEN');

        var ref = req.get('Referer');
        if (typeof ref == "undefined") {
            ref = "/"
        }

        res.writeHead(302, {
            'Location': ref
        });

        res.end();
    });
}

function isMobile(req) {
    var ua = parser(req.headers['user-agent']);

    return typeof ua.device.type != "undefined";
}

module.exports = WebsiteHandler;
