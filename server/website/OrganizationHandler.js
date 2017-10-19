var path = require('path');
var Security = require('../util/Security');
var Util = require('../util/Util');
var parser = require('ua-parser-js');
var Organization_Members = require('../tables/organization/Organization_Members');
var Organization_Groups = require('../tables/organization/Organization_Groups');
var Organizations = require('../tables/organization/Organizations');
var Accounts = require('../tables/account/Accounts');
var WebsiteUtil = require('./WebsiteUtil');
var Events = require('../tables/event/Events');

function OrganizationHandler(app) {
    app.get('/organization', function (req, res) {
        Security.validateNoSend(req, res, function (nLogged, id) {
            if (!nLogged) {
                if (isMobile(req)) {
                    var toReturnParameters = {
                        NAVBAR: WebsiteUtil.getMobileNavigationBar('../'),
                        NAVBAR_ASSETS: WebsiteUtil.getMobileNavigationBarAssets('../'),
                        FOOTER: WebsiteUtil.getMobileFooter('../'),
                        JAVASCRIPT: '**/loggedIn = true;/**'
                    };

                    res.render(path.resolve(__dirname + '/../../public/mobile/organization/create/create.frost'), toReturnParameters);
                    return;
                }

                res.render(path.resolve(__dirname + '/../../public/desktop/organization/create.frost'), {
                    NAVBAR: WebsiteUtil.getNavigationBar(!nLogged, './', encodeURIComponent(req.protocol + '://' + req.get('Host') + req.url))
                });

                return;
            }

            res.writeHead(302, {
                'Location': '../login'
            });

            res.end();
        });
    });

    app.get('/organization/:ID', function (req, res) {
        if (isMobile(req)) {
            Security.validateNoSend(req, res, function (nLogged, sPayload) {
                Organizations.find({ID: req.params['ID']}, function (oErr, oRows) {
                    var toReturnParameters = {
                        NAVBAR: WebsiteUtil.getMobileNavigationBar('../'),
                        NAVBAR_ASSETS: WebsiteUtil.getMobileNavigationBarAssets('../'),
                        FOOTER: WebsiteUtil.getMobileFooter('../'),
                        JAVASCRIPT: '**/loggedIn = true;ID=' + req.params['ID'] + ';/**',
                        NAME: "No Organization Found",
                        EVENTS: '<div class="nan"> None found! </div>',
                        GROUPS: '<div class="item eGroup"> General </div>',
                        BUTTONS: ''
                    };

                    if (oErr || oRows.length < 1) {
                        res.render(path.resolve(__dirname + '/../../public/mobile/organization/view/organization.frost'), toReturnParameters);
                        return;
                    }

                    toReturnParameters['NAME'] = oRows[0]['NAME'];
                    toReturnParameters['USERNAME'] = oRows[0]['USERNAME'];

                    Events.find({ORGANIZATION_ID: req.params['ID']}, function (eErr, eRows) {
                        if (!eErr && eRows.length > 0) {
                            toReturnParameters['EVENTS'] = '';
                        }

                        for (var i = 0; i < eRows.length; i++) {
                            toReturnParameters['EVENTS'] += '<div class="item" style="background-color: #fcfcfc"> <img src="../assets/favicon.png" width="70" height="70" class="icon"> <div class="info"> <div class="title"> ' + eRows[i]['NAME'] + ' </div> <div class="header"> ' + oRows[0]['NAME'] + ' </div> <div class="time"> ' + Util.getTwoDates(Util.parseTime(eRows[i]['START_TIME']), Util.parseTime(eRows[i]['END_TIME'])) + ' </div> </div> </div>';
                        }

                        Organization_Groups.find({ORGANIZATION_ID: oRows[0]['ID']}, function (gErr, gRows) {
                            for (var j = 0; j < gRows.length; j++) {
                                toReturnParameters['GROUPS'] += '<div class="item eGroup"> ' + gRows[j]['NAME'] + ' </div>';
                            }

                            if (nLogged) {
                                res.render(path.resolve(__dirname + '/../../public/mobile/organization/view/organization.frost'), toReturnParameters);
                                return;
                            }

                            Organization_Members.find({ORGANIZATION_ID: req.params['ID'], ACCOUNT_ID: sPayload}, function (mErr, mRows) {
                                if (!mErr && mRows.length > 0 && (mRows[0]['ADMIN'] || oRows[0]['ACCOUNT_ID'] == sPayload)) {
                                    toReturnParameters['BUTTONS'] += '<input type="button" onclick="editOrg()" class="cButton" value="Edit Organization" />';
                                    toReturnParameters['BUTTONS'] += '<input type="button" onclick="createEvent_()" class="cButton"  style="background-color: #1CAC78;" value="Create Event" />';
                                }

                                if (oRows[0]['ACCOUNT_ID'] == sPayload) {
                                    toReturnParameters['BUTTONS'] += '<input type="button" onclick="deleteOrg()" class="cButton" style="background-color: #b94a48;" value="Delete Organization" />';
                                }

                                if (mRows.length < 1) {
                                    toReturnParameters['BUTTONS'] += '<input type="button" onclick="joinOrg()" class="cButton" style="background-color: #1CAC78;" value="Join Organization" />';
                                }

                                res.render(path.resolve(__dirname + '/../../public/mobile/organization/view/organization.frost'), toReturnParameters);
                            });
                        });
                    });
                });
            });

            return;
        }

        Security.validateNoSend(req, res, function (nLogged, sPayload) {
            Organizations.find({ID: req.params['ID']}, function (oErr, oRows) {
                var toReturnParameters = {
                    NAVBAR: WebsiteUtil.getNavigationBar(!nLogged, './', encodeURIComponent(req.protocol + '://' + req.get('Host') + req.url)),
                    NAME: "No Organization Found",
                    USERNAME: "Organization Not Found",
                    DESCRIPTION: "Organization Not Found",
                    EVENTS: '<tr class="_row"> <td> No Events Found </td> <td>  </td> <td>  </td> </tr>',
                    GROUPS: '<a href="' + req.params['ID'] + '/group/general"><div class="_row">General</div></a>',
                    BUTTONS: '',
                    JAVASCRIPT: '**/ID=' + req.params['ID'] + ';/**'
                };

                if (oErr || oRows.length < 1) {
                    res.render(path.resolve(__dirname + '/../../public/desktop/organization/view/organization.frost'), toReturnParameters);
                    return;
                }

                toReturnParameters['NAME'] = oRows[0]['NAME'];
                toReturnParameters['USERNAME'] = oRows[0]['USERNAME'];
                toReturnParameters['DESCRIPTION'] = oRows[0]['DESCRIPTION'];

                Events.find({ORGANIZATION_ID: req.params['ID']}, function (eErr, eRows) {
                    if (!eErr && eRows.length > 0) {
                        toReturnParameters['EVENTS'] = '';
                    }

                    for (var i = 0; i < eRows.length; i++) {
                        toReturnParameters['EVENTS'] += '<tr class="_row" onclick="location.href=\'../event/' + eRows[i]['ID'] + '\'"> <td> ' + eRows[i]['NAME'] + ' </td> <td> ' + eRows[i]['LOCATION'] + ' </td> <td> ' + Util.getTwoDates(Util.parseTime(eRows[i]['START_TIME']), Util.parseTime(eRows[i]['END_TIME'])) + ' </td> </tr>';
                    }

                    Organization_Groups.find({ORGANIZATION_ID: oRows[0]['ID']}, function (gErr, gRows) {
                        for (var j = 0; j < gRows.length; j++) {
                            toReturnParameters['GROUPS'] += '<a href="' + req.params['ID'] + '/group/' + gRows[j]['ID'] + '"><div class="_row">' + gRows[j]['NAME'] + '</div></a>';
                        }

                        if (nLogged) {
                            res.render(path.resolve(__dirname + '/../../public/desktop/organization/view/organization.frost'), toReturnParameters);
                            return;
                        }

                        Organization_Members.find({ORGANIZATION_ID: req.params['ID'], ACCOUNT_ID: sPayload}, function (mErr, mRows) {
                            if (!mErr && mRows.length > 0 && (mRows[0]['ADMIN'] || oRows[0]['ACCOUNT_ID'] == sPayload)) {
                                toReturnParameters['BUTTONS'] += '<input type="button" onclick="editOrg()" value="Edit Organization" style="background-color: #4DB6AC; width: 100%;" />';
                                toReturnParameters['BUTTONS'] += '<input type="button" onclick="createEvent_()" value="Create Event" style="background-color: #1CAC78; width: 100%;" />';
                            }

                            if (oRows[0]['ACCOUNT_ID'] == sPayload) {
                                toReturnParameters['BUTTONS'] += '<input type="button" onclick="deleteOrg()" value="Delete Organization" style="background-color: #b94a48; width: 100%;" />'
                            }

                            if (mRows.length < 1) {
                                toReturnParameters['BUTTONS'] += '<input type="button" onclick="joinOrg()" value="Join Organization" style="background-color: #1CAC78; width: 100%;" />';
                            }

                            res.render(path.resolve(__dirname + '/../../public/desktop/organization/view/organization.frost'), toReturnParameters);
                        });
                    });
                });
            });
        });
    });

    app.get('/organization/:ID/admin', function (req, res) {
        Security.validateNoSend(req, res, function (nLogged, id) {
            Organizations.find({ID: req.params['ID']}, function (oErr, oRows) {
                var toReturnParameters = {
                    NAVBAR: WebsiteUtil.getNavigationBar(!nLogged, '../../', encodeURIComponent(req.protocol + '://' + req.get('Host') + req.url)),
                    NAME: "Organization Not Found",
                    USERNAME: "Organization Not Found",
                    DESCRIPTION: "Organization Not Found",
                    ACTIONS: "",
                    ID: -1,
                    GROUPS: "",
                    EVENTS: '<tr class="_row"> <td> No Events Found </td> <td>  </td> <td>  </td> </tr>'
                };

                if (oErr) {
                    res.render(path.resolve(__dirname + '/../../public/desktop/organization/edit.frost'), {ORG_NAME: "ORG NOT FIND"});
                    return;
                }

                if (oRows.length < 1) {
                    res.render(path.resolve(__dirname + '/../../public/desktop/organization/edit.frost'), toReturnParameters);
                    return;
                }

                var baseO = oRows[0];
                toReturnParameters = {
                    ID: req.params['ID'],
                    NAVBAR: WebsiteUtil.getNavigationBar(!nLogged, '../../', encodeURIComponent(req.protocol + '://' + req.get('Host') + req.url)),
                    NAME: oRows[0]['NAME'],
                    USERNAME: oRows[0]['USERNAME'],
                    DESCRIPTION: oRows[0]['DESCRIPTION'],
                    ACTIONS: "",
                    GROUPS: '<tr class="_row"> <td> No Events Found </td> <td>  </td> <td>  </td> </tr>',
                    ADMINS: ""
                };

                Events.find({ORGANIZATION_ID: req.params['ID']}, function (eErr, eRows) {
                    if (eErr) {
                        res.render(path.resolve(__dirname + '/../../public/desktop/organization/edit.frost'), toReturnParameters);
                        return;
                    }

                    var events = '';
                    for (var j = 0; j < eRows.length; j++) {
                        events += '<tr class="_row" onclick="location.href=\'../event/' + eRows[j]['ID'] + '\'"> <td> ' + eRows[j]['NAME'] + ' </td> <td> ' + eRows[j]['LOCATION'] + ' </td> <td> ' + Util.getTwoDates(Util.parseTime(eRows[j]['START_TIME']), Util.parseTime(eRows[j]['END_TIME'])) + ' </td> </tr>';
                    }

                    toReturnParameters['EVENTS'] = events;
                    Organization_Members.find({
                        ORGANIZATION_ID: req.params['ID'],
                        ACCOUNT_ID: id,
                        ADMIN: 1
                    }, function (mErr, mRows) {
                        if (mErr) {
                            res.render(path.resolve(__dirname + '/../../public/desktop/organization/edit.frost'), toReturnParameters);
                            return;
                        }

                        if (mRows.length < 1) {
                            res.writeHead(302, {
                                'Location': '../'
                            });

                            res.end();

                            return;
                        }

                        Organization_Groups.find({ORGANIZATION_ID: req.params['ID']}, function (oErr, oRows) {
                            if (oErr) {
                                res.render(path.resolve(__dirname + '/../../public/desktop/organization/edit.frost'), toReturnParameters);
                                return;
                            }

                            var groups = '';
                            for (var i = 0; i < oRows.length; i++) {
                                groups += '<tr class="_row"> <td> <input type="text" value="' + oRows[i]['NAME'] + '" id="' + oRows[i]['ID'] + '_NAME"> </td> <td> <input type="text" value="' + oRows[i]['PASSWORD'] + '" id="' + oRows[i]['ID'] + '_PASSWORD"> </td> <td> <input type="button" onclick="updateGroup(' + oRows[i]['ID'] + ')" value="Update" style="float: right; width: 50px !important; height: 12px; top: -7px; position: relative; background-color: #1CAC78"> <input type="button" onclick="deleteGroup(' + oRows[i]['ID'] + ')" value="-" style="float: right; width: 12px !important; height: 12px; top: -7px; position: relative; background-color: #b94a48;">  </td> </tr>';
                            }

                            if (oRows.length < 1) {
                                groups = '<tr class="_row"> <td> No Events Found </td> <td>  </td> <td>  </td> </tr>';
                            }

                            groups += '<tr class="_row"> <td> <input type="text" id="CREATE_NAME" placeholder="Name"> </td> <td> <input  id="CREATE_PASSWORD" type="text" placeholder="Password"> </td> <td> <input type="button" onclick="createGroup()" value="+" style="float: right; width: 12px !important; height: 12px; top: -7px; position: relative; background-color: #1CAC78;">  </td> </tr>';
                            toReturnParameters['GROUPS'] = groups;
                            Organization_Members.find({ORGANIZATION_ID: req.params['ID']}, function (msErr, msRows) {
                                if (msErr) {
                                    res.render(path.resolve(__dirname + '/../../public/desktop/organization/edit.frost'), toReturnParameters);
                                    return;
                                }

                                var toFindAccount = [];
                                for (var t = 0; t < msRows.length; t++) {
                                    toFindAccount.push({ID: msRows[t]['ACCOUNT_ID']});
                                }

                                if (msRows.length < 1) {
                                    toFindAccount.push({ID: 10000000});
                                }

                                Accounts.find(toFindAccount, function (aErr, aRows) {
                                    if (aErr) {
                                        res.render(path.resolve(__dirname + '/../../public/desktop/organization/edit.frost'), toReturnParameters);
                                        return;
                                    }

                                    var accounts = {};
                                    for (var x = 0; x < aRows.length; x++) {
                                        accounts[aRows[x]['ID']] = aRows[x];
                                    }

                                    var admins = '', dAdmins = {};
                                    for (var j = 0; j < msRows.length; j++) {
                                        var msRow = msRows[j];

                                        if (msRow['ADMIN'] == 1) {
                                            if (msRow['ACCOUNT_ID'] == id) {
                                                admins += '<a href=""><div class="_row">' + accounts[msRow['ACCOUNT_ID']]['DISPLAY_NAME'] + '</div></a>';
                                            } else {
                                                admins += '<a href=""><div class="_row">' + accounts[msRow['ACCOUNT_ID']]['DISPLAY_NAME'] + '<input type="button" onclick="removeAdmin(' + accounts[msRow['ACCOUNT_ID']]['ID'] + ')" value="-" style="float: right; width: 12px !important; height: 12px; top: -7px; position: relative; background-color: #b94a48;"> </div></a>';
                                            }

                                            dAdmins[accounts[msRow['ACCOUNT_ID']]['ID']] = accounts[msRow['ACCOUNT_ID']];
                                        }
                                    }

                                    toReturnParameters['JAVASCRIPT'] = "**/admins=" + JSON.stringify(dAdmins) + ";id=" + id + ";oid=" + req.params['ID'] + ";/**";

                                    if (baseO['ACCOUNT_ID'] == id) {
                                        admins += '<input type="button" value="Add Admin" onclick="addAdmin()">';
                                    }

                                    toReturnParameters['ADMINS'] = admins;

                                    res.render(path.resolve(__dirname + '/../../public/desktop/organization/edit.frost'), toReturnParameters);
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    app.get('/organization/:ID/group/:GROUP', function (req, res) {
        Security.validateNoSend(req, res, function (nLogged, sPayload) {
            var toReturnParameters = {
                NAVBAR: WebsiteUtil.getNavigationBar(!nLogged, '../../../', encodeURIComponent(req.protocol + '://' + req.get('Host') + req.url)),
                ORGANIZATION: "Organization Not Found",
                NAME: "Name not found",
                MEMBERS: '<tr class="_row"> <td> No Events Found </td> <td>  </td> <td>  </td> </tr>',
                JAVASCRIPT: ""
            };

            Organizations.find({ID: req.params['ID']}, function (oErr, oRows) {
                if (oErr || oRows.length < 1) {
                    res.render(path.resolve(__dirname + '/../../public/desktop/organization/members.frost'), toReturnParameters);
                    return;
                }

                toReturnParameters['ORGANIZATION'] = oRows[0]['NAME'];
                Organization_Groups.find({
                    ORGANIZATION_ID: req.params['ID'],
                    ID: req.params['GROUP']
                }, function (gErr, gRows) {
                    if (gErr || gRows.length < 1) {
                        res.render(path.resolve(__dirname + '/../../public/desktop/organization/members.frost'), toReturnParameters);
                        return;
                    }

                    toReturnParameters['NAME'] = gRows[0]['NAME'];
                    Organization_Members.find({
                        ORGANIZATION_ID: req.params['ID'],
                        GROUP_ID: req.params['GROUP']
                    }, function (mErr, mRows) {
                        if (mErr) {
                            res.render(path.resolve(__dirname + '/../../public/desktop/organization/members.frost'), toReturnParameters);
                            return;
                        }

                        //DO SOMETHING WITH MEMEBERS

                        if (nLogged) {
                            res.render(path.resolve(__dirname + '/../../public/desktop/organization/members.frost'), toReturnParameters);
                            return;
                        }

                        Organization_Members.find({
                            ORGANIZATION_ID: req.params['ID'],
                            ACCOUNT_ID: sPayload,
                            ADMIN: 1
                        }, function (aErr, aRows) {
                            if (aErr || aRows.length < 1) {
                                res.render(path.resolve(__dirname + '/../../public/desktop/organization/members.frost'), toReturnParameters);
                                return;
                            }

                            //DO ADMIN STUFF HERE :D
                            res.render(path.resolve(__dirname + '/../../public/desktop/organization/members.frost'), toReturnParameters);
                        });
                    })
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