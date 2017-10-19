var Errors = require('./../util/Errors');
var Util = require('./../util/Util');
var RouteHelper = require('./../util/RouteHelper');
var Accounts = require('./../tables/account/Accounts');
var Passwords = require('./../tables/account/Passwords');
var Emails = require('./../tables/account/Emails');
var Clients = require('./../tables/account/Sessions');
var Sessions = require('./../tables/account/Sessions');
var Security = require('./../util/Security');
var EmailUtil = require('./../util/Emails');
var Whitelist = require('./../tables/general/Whitelist');
var Busboy = require('busboy');

function AccountRoute(app) {
    app.post('/register', function (req, res) {
            if (!RouteHelper.hasBody(req.body, res, {
                    DISPLAY_NAME: {
                        TYPE: "UNICODE",
                        MAX: 70,
                        MIN: 1
                    },
                    USERNAME: {
                        MIN: 4,
                        MAX: 16,
                        TYPE: "LNU"
                    },
                    EMAIL: {
                        TYPE: "EMAIL"
                    },
                    PASSWORD: {
                        MIN: 5
                    }
                })) {
                return;
            }

            var cookies = Util.parseCookies(req);
            Accounts.find([{USERNAME: req.body['USERNAME']}, {EMAIL: req.body['EMAIL']}], function (aErr, aRows) {
                if (RouteHelper.hasInternalError(res, aErr, aRows)) {
                    return;
                }

                if (aRows.length > 0) {
                    if (req.body['EMAIL'] === aRows[0].EMAIL) {
                        RouteHelper.sendError(res, Errors.ELEMENT_ALREADY_CREATED, {CONFLICT: "EMAIL"});
                        return;
                    }

                    RouteHelper.sendError(res, Errors.ELEMENT_ALREADY_CREATED, {CONFLICT: "USERNAME"});
                    return;
                }

                Whitelist.find([{TYPE: 0}, {TYPE: 1}], function (wErr, wRows) {
                    if (RouteHelper.hasInternalError(res, wErr, wRows)) {
                        return;
                    }

                    var match = false, domain = req.body['EMAIL'].replace(/.*@/, "");
                    for (var i = 0; i < wRows.length; i++) {
                        if (wRows[i]['TYPE'] == 0) {
                            if (wRows[i]['CONTENT'].toLowerCase() == domain.toLowerCase()) {
                                match = true;
                                break;
                            }
                        }

                        if (wRows[i]['TYPE'] == 1) {
                            if (wRows[i]['CONTENT'].toLowerCase() == req.body['EMAIL'].toLowerCase()) {
                                match = true;
                                break;
                            }
                        }
                    }

                    if (!match) {
                        RouteHelper.sendError(res, Errors.EMAIL_NOT_WHITELISTED);
                        return;
                    }

                    Accounts.insert({
                        USERNAME: req.body['USERNAME'],
                        DISPLAY_NAME: req.body['DISPLAY_NAME'],
                        EMAIL: req.body['EMAIL'],
                        DATE_CREATED: Util.getTime(),
                        DATE_UPDATED: Util.getTime(),
                        CONFIRMED: 0
                    }, function (iErr, iIRow) {
                        if (RouteHelper.hasInternalError(res, iErr, iIRow)) {
                            return;
                        }

                        Accounts.find({ID: iIRow}, function (iErr, iRows) {
                            if (RouteHelper.hasInternalError(res, iErr, iRow)) {
                                return;
                            }

                            var iRow = iRows[0];
                            Security.createSession(req, res, iRow['ID'], 60 * 24, function (err, payload) {
                                if (err) {
                                    RouteHelper.sendError(res, Errors.INTERNAL_ERROR);
                                    return;
                                }

                                RouteHelper.setCookie(res, {
                                    SID: payload['SESSION']['UNIQUE_ID'],
                                    CID: payload['CLIENT']['UNIQUE_ID']
                                });

                                var tCan = Util.randomString(64);
                                Emails.insert({
                                    ACCOUNT_ID: iRow['ID'],
                                    TYPE: 0,
                                    TOKEN: tCan,
                                    DATE_SENT: Util.getTime(),
                                    DATE_EXPIRES: Util.formatTime(Util.getServerTime().addMinutes(60 * 24))
                                }, function (eIErr) {
                                });

                                if (Util.getURL() == ".commservus.com") {
                                    EmailUtil.sendEmail(req.body['EMAIL'], "Commservus Authentication", "<a href='https://" + Util.getURL().substr(1) + "/email?TOKEN=" + tCan + "&USERNAME=" + req.body['USERNAME'] + "'>Click to confirm your email for (" + req.body['USERNAME'] + ")</a>");
                                }

                                res.status(200).json({
                                    success: true
                                });
                            });

                            var PASSWORD = require('crypto').createHash('sha512').update(req.body['PASSWORD']).digest('hex').toUpperCase();
                            Passwords.insert({ACCOUNT_ID: iRow['ID'], CONTENT: PASSWORD}, function (pErr, pRow) {
                            });
                        })
                    });
                });
            });
        }
    )
    ;

    app.post('/email', function (req, res) {
        Security.validate(req, res, function (err, sPayload) {
            if (err) {
                return;
            }

            if (!RouteHelper.hasBody(req.body, res, {
                    EMAIL: {
                        TYPE: "EMAIL"
                    }
                })) {
                return;
            }

            Accounts.find({ID: sPayload}, function (aErr, aRows) {
                if (RouteHelper.hasInternalError(res, aErr, aRows)) {
                    return;
                }

                if (aRows.length < 1) {
                    RouteHelper.sendError(res, Errors.INTERNAL_ERROR);
                    return;
                }

                Accounts.find({EMAIL: req.body['EMAIL']}, function (aeErr, aeRows) {
                    if (RouteHelper.hasInternalError(res, aeErr, aeRows)) {
                        return;
                    }

                    if (aeRows.length > 0) {
                        RouteHelper.sendError(res, Errors.EMAIL_IN_USE);
                        return;
                    }

                    Emails.find({ACCOUNT_ID: sPayload, TYPE: 0}, function (eErr, eRows) {
                        if (RouteHelper.hasInternalError(res, eErr, eRows)) {
                            return;
                        }

                        if (eRows.length > 0) {
                            if (Util.getServerTime().getTime() < Util.parseTime(eRows[0]['DATE_EXPIRES']).getTime()) {
                                RouteHelper.sendError(res, Errors.EMAIL_RESET_ALREADY_SENT);
                                return;
                            }

                            Emails.delete({ID: eRows[0]['ID']}, function (eDErr, eDRows) {
                            });
                        }

                        var tCan = Util.randomString(64);
                        Emails.insert({
                            ACCOUNT_ID: sPayload,
                            EMAIL: req.body['EMAIL'],
                            TYPE: 0,
                            TOKEN: tCan,
                            DATE_SENT: Util.getTime(),
                            DATE_EXPIRES: Util.formatTime(Util.getServerTime().addMinutes(60 * 24))
                        }, function (eIErr) {
                        });

                        EmailUtil.sendEmail(req.body['EMAIL'], "Commservus Authentication", "<a href='https://" + Util.getURL().substr(1) + "/email?TOKEN=" + tCan + "&USERNAME=" + aRows[0]['USERNAME'] + "'>Click to reset your email (" + aRows[0]['USERNAME'] + ")</a>");

                        res.status(200).json({
                            success: true
                        })
                    });
                });
            });
        });
    });

    app.post('/forgot', function (req, res) {
        if (!RouteHelper.hasBody(req.body, res, {ID: {MIN: 1}})) {
            return;
        }

        Accounts.find([{EMAIL: req.body['ID']}, {USERNAME: req.body['ID']}], function (aErr, aRows) {
            if (RouteHelper.hasInternalError(res, aErr, aRows)) {
                return;
            }

            if (aRows.length < 1) {
                RouteHelper.sendError(res, Errors.ACCOUNT_NOT_FOUND);
                return;
            }

            Emails.find({ACCOUNT_ID: aRows[0]['ID'], TYPE: 1}, function (eErr, eRows) {
                if (RouteHelper.hasInternalError(res, eErr, eRows)) {
                    return;
                }

                if (eRows.length > 0) {
                    if (Util.getServerTime().getTime() < Util.parseTime(eRows[0]['DATE_EXPIRES']).getTime()) {
                        RouteHelper.sendError(res, Errors.EMAIL_RESET_ALREADY_SENT);
                        return;
                    }

                    Emails.delete({ID: eRows[0]['ID']}, function (eDErr, eDRows) {
                    });
                }

                var tCan = Util.randomString(64);
                Emails.insert({
                    ACCOUNT_ID: aRows[0]['ID'],
                    TYPE: 1,
                    TOKEN: tCan,
                    DATE_SENT: Util.getTime(),
                    DATE_EXPIRES: Util.formatTime(Util.getServerTime().addMinutes(60 * 24))
                }, function (eIErr) {
                });

                EmailUtil.sendEmail(aRows[0]['EMAIL'], "Commservus Forgot Password", "<a href='https://" + Util.getURL().substr(1) + "/email?TOKEN=" + tCan + "&USERNAME=" + aRows[0]['USERNAME'] + "'>Click to reset your password (" + aRows[0]['USERNAME'] + ")</a>");

                res.status(200).json({
                    success: true
                })
            });
        });
    });

    app.patch('/forgot', function (req, res) {
        if (!RouteHelper.hasBody(req.body, res, {
                TOKEN: {
                    LENGTH: 64
                },
                USERNAME: {
                    MIN: 4,
                    MAX: 16,
                    TYPE: "LNU"
                },
                PASSWORD: {
                    MIN: 5
                }
            })) {
            return;
        }

        Accounts.find({USERNAME: req.body['USERNAME']}, function (aErr, aRows) {
            if (RouteHelper.hasInternalError(res, aErr, aRows)) {
                return;
            }

            if (aRows.length < 1) {
                RouteHelper.sendError(res, Errors.ACCOUNT_NOT_FOUND);
                return;
            }

            Emails.find({ACCOUNT_ID: aRows[0]['ID'], TOKEN: req.body['TOKEN'], TYPE: 1}, function (eErr, eRows) {
                if (RouteHelper.hasInternalError(res, eErr, eRows)) {
                    return;
                }

                if (eRows.length < 1) {
                    RouteHelper.sendError(res, Errors.EMAIL_TOKEN_INVALID);
                    return;
                }

                if (Util.getServerTime().getTime() > Util.parseTime(eRows[0]['DATE_EXPIRES']).getTime()) {
                    RouteHelper.sendError(res, Errors.EMAIL_QUERY_EXPIRED);
                    return;
                }

                var PASSWORD = require('crypto').createHash('sha512').update(req.body['PASSWORD']).digest('hex').toUpperCase();
                Passwords.find({ACCOUNT_ID: aRows[0]['ID'], DATE_CHANGED: null}, function (pErr, pRows) {
                    if (RouteHelper.hasInternalError(res, pErr, pRows)) {
                        return;
                    }

                    Passwords.update({DATE_CHANGED: Util.getTime()}, {ID: pRows[0]['ID']}, function (pErr) {
                    });
                    Passwords.insert({ACCOUNT_ID: aRows[0]['ID'], CONTENT: PASSWORD}, function (pErr) {
                    });
                    Emails.delete({ID: eRows[0]['ID']}, function (eErr) {
                    });

                    RouteHelper.sendSuccess(res);
                });
            });
        });
    });


    app.get('/valid', function (req, res) {
        Security.validate(req, res, function (err, payload) {
            if (err) {
                return;
            }

            Accounts.find({ID: payload}, function (aErr, aRows) {
                if (RouteHelper.hasInternalError(res, aErr, aRows)) {
                    return;
                }

                if (aRows.length < 1) {
                    RouteHelper.sendSuccess(res, {data: []});
                    return;
                }

                RouteHelper.sendSuccess(res, {data: aRows[0]});
            });
        });
    });

    /* Location Redirect: */
    app.post('/login', function (req, res) {
        Security.hasSession(req, res, function (seErr, sePayload) {
            if (seErr) {
                return;
            }

            if (sePayload) {
                RouteHelper.sendError(res, Errors.SESSION_ALREADY);
                return;
            }

            var PASSWORD;
            if (typeof req.body['USERNAME'] != "undefined") {
                if (!RouteHelper.hasBody(req.body, res, {USERNAME: {MIN: 4, MAX: 16, TYPE: "LNU"}, PASSWORD: {MIN: 5}})) {
                    return;
                }

                PASSWORD = require('crypto').createHash('sha512').update(req.body['PASSWORD']).digest('hex').toUpperCase();
                Accounts.find({USERNAME: req.body['USERNAME']}, function (aErr, aRows) {
                    if (RouteHelper.hasInternalError(res, aErr, aRows)) {
                        return;
                    }

                    if (aRows.length > 0) {
                        Passwords.find({ACCOUNT_ID: aRows[0]['ID'], DATE_CHANGED: null}, function (pErr, pRows) {
                            if (RouteHelper.hasInternalError(res, pErr, pRows)) {
                                return;
                            }

                            var expireTime = 60 * 24;
                            if(typeof req.query['remember'] != "undefined"){
                                expireTime = 60 * 24 * 365;
                            }

                            try {
                                if (pRows[0]['CONTENT'] == PASSWORD) {
                                    Security.createSession(req, res, aRows[0]['ID'], expireTime, function (csErr, csPayload) {
                                        if (csErr) {
                                            RouteHelper.sendError(res, Errors.INTERNAL_ERROR);
                                            return;
                                        }

                                        RouteHelper.setCookie(res, {
                                            SID: csPayload['SESSION']['UNIQUE_ID'],
                                            CID: csPayload['CLIENT']['UNIQUE_ID']
                                        });

                                        RouteHelper.sendSuccess(res);
                                    });

                                } else {
                                    RouteHelper.sendError(res, Errors.LOGIN_INVALID);
                                }
                            } catch (e) {
                                RouteHelper.sendError(res, Errors.LOGIN_INVALID);
                            }
                        });
                    } else {
                        RouteHelper.sendError(res, Errors.LOGIN_INVALID);
                    }
                });
            } else if (typeof req.body['EMAIL'] != "undefined") {
                if (!RouteHelper.hasBody(req.body, res, {EMAIL: {TYPE: "EMAIL"}, PASSWORD: {MIN: 5}})) {
                    return;
                }

                PASSWORD = require('crypto').createHash('sha512').update(req.body['PASSWORD']).digest('hex').toUpperCase();
                Accounts.find({EMAIL: req.body['EMAIL']}, function (aErr, aRows) {
                    if (RouteHelper.hasInternalError(res, aErr, aRows)) {
                        return;
                    }

                    if (aRows.length > 0) {
                        Passwords.find({ACCOUNT_ID: aRows[0]['ID'], DATE_CHANGED: null}, function (pErr, pRows) {
                            if (RouteHelper.hasInternalError(res, pErr, pRows)) {
                                return;
                            }

                            if (pRows[0]['CONTENT'] == PASSWORD) {
                                Security.createSession(req, res, aRows[0]['ID'], 60 * 24, function (csErr, csPayload) {
                                    if (csErr) {
                                        RouteHelper.sendError(res, Errors.INTERNAL_ERROR);
                                        return;
                                    }

                                    RouteHelper.setCookie(res, {
                                        SID: csPayload['SESSION']['UNIQUE_ID'],
                                        CID: csPayload['CLIENT']['UNIQUE_ID']
                                    });

                                    RouteHelper.sendSuccess(res);
                                });
                            } else {
                                RouteHelper.sendError(res, Errors.LOGIN_INVALID);
                            }
                        });
                    } else {
                        RouteHelper.sendError(res, Errors.LOGIN_INVALID);
                    }
                });
            } else {
                RouteHelper.sendError(res, Errors.BODY_ARGUMENT_MISSING, {argument: ['USERNAME', 'EMAIL']});
            }
        });
    });

    app.post('/password/reset', function (req, res) {
        Security.validate(req, res, function (err, payload) {
            if (err) {
                return;
            }

            if (!RouteHelper.hasBody(req.body, res, {
                    PASSWORD: {
                        MIN: 5
                    },
                    NEW_PASSWORD: {
                        MIN: 5
                    }
                })) {
                return;
            }

            Accounts.find({ID: payload}, function (aErr, aRows) {
                if (RouteHelper.hasInternalError(res, aErr, aRows)) {
                    return;
                }

                if (aRows.length < 1) {
                    RouteHelper.sendError(res, Errors.ACCOUNT_NOT_FOUND);
                    return;
                }

                var PASSWORD = require('crypto').createHash('sha512').update(req.body['PASSWORD']).digest('hex').toUpperCase();
                var NEW_PASSWORD = require('crypto').createHash('sha512').update(req.body['NEW_PASSWORD']).digest('hex').toUpperCase();
                Passwords.find({ACCOUNT_ID: payload, DATE_CHANGED: null}, function (pErr, pRows) {
                    if (RouteHelper.hasInternalError(res, pErr, pRows)) {
                        return;
                    }

                    if (pRows[0]['CONTENT'] == PASSWORD) {
                        Passwords.update({DATE_CHANGED: Util.getTime()}, {ID: pRows[0]['ID']}, function (pErr) {
                        });
                        Passwords.insert({ACCOUNT_ID: payload, CONTENT: NEW_PASSWORD}, function (pErr) {
                        });

                        RouteHelper.sendSuccess(res);
                    } else {
                        RouteHelper.sendError(res, Errors.PASSWORD_INVALID);
                    }
                });
            });
        });
    });


    /**
     * Checking if account with email exists
     */
    app.get('/account/email/:EMAIL', function (req, res) {
        if (!RouteHelper.hasBody(req.params, res, {EMAIL: {TYPE: "EMAIL"}})) {
            return;
        }

        Accounts.find({EMAIL: req.params['EMAIL']}, function (aErr, aRows) {
            if (RouteHelper.hasInternalError(res, aErr, aRows)) {
                return;
            }

            if (aRows.length > 0) {
                RouteHelper.sendSuccess(res);
            } else {
                RouteHelper.sendError(res, Errors.ACCOUNT_NOT_FOUND);
            }
        });
    });

    /**
     * Checking if account with username exists
     */
    app.get('/account/username/:USERNAME', function (req, res) {
        if (!RouteHelper.hasBody(req.params, res, {USERNAME: {MIN: 4, MAX: 16, TYPE: "LNU"}})) {
            return;
        }

        Accounts.find({USERNAME: req.params['USERNAME']}, function (aErr, aRows) {
            if (RouteHelper.hasInternalError(res, aErr, aRows)) {
                return;
            }

            if (aRows.length > 0) {
                RouteHelper.sendSuccess(res);
            } else {
                RouteHelper.sendError(res, Errors.ACCOUNT_NOT_FOUND);
            }
        });
    });

    /**
     * Finding users based on username.
     */
    app.get('/account/find/username/:USERNAME', function (req, res) {
        Security.validateNoSend(req, res, function (err, id) {
            if (err) {
                RouteHelper.sendError(res, Errors.NO_PERMISSION);
                return;
            }

            if (!RouteHelper.hasBody(req.params, res, {USERNAME: {MIN: 1, MAX: 16, TYPE: "LNU"}})) {
                return;
            }

            Accounts.findLike({USERNAME: req.params['USERNAME'] + "%"}, function (aErr, aRows) {
                if (RouteHelper.hasInternalError(res, aErr, aRows)) {
                    return;
                }

                var toSplice = [];
                for (var i = 0; i < aRows.length; i++) {
                    delete aRows[i]['EMAIL'];
                    delete aRows[i]['DATE_CREATED'];
                    delete aRows[i]['DATE_UPDATED']
                }

                for (var s = 0; s < toSplice.length; s++) {
                    aRows.splice(toSplice[s], 1);
                }

                if (aRows.length > 0) {
                    RouteHelper.sendSuccess(res, {data: aRows});
                } else {
                    RouteHelper.sendError(res, Errors.ACCOUNT_NOT_FOUND);
                }
            });
        });
    });

    app.patch('/account', function (req, res) {
        if (!RouteHelper.hasABody(req.body, res, {DISPLAY_NAME: {TYPE: "UNICODE", MAX: 70}, BIO: {TYPE: "UNICODE", MAX: 150}})) {
            return;
        }

        Security.validate(req, res, function (err, payload) {
            if (err) {
                return;
            }

            var toInsert = {};
            if (typeof req.body['DISPLAY_NAME'] != "undefined") {
                toInsert['DISPLAY_NAME'] = req.body['DISPLAY_NAME'];
            }

            if (typeof req.body['BIO'] != "undefined") {
                toInsert['BIO'] = req.body['BIO'];
            }

            Accounts.update(toInsert, {ID: payload}, function () {
            });

            RouteHelper.sendSuccess(res);
        });
    });

    app.post('/profilepic', function (req, res) {
        Security.validate(req, res, function (sErr, sPayload) {
            if (sErr) {
                return;
            }

            var body = {}, pError = false;
            var busboy;
            try {
                busboy = new Busboy({headers: req.headers});
            } catch (e) {
                RouteHelper.sendError(res, Errors.DATA_PARSE_ERROR);
                return;
            }
            busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
                file.fileRead = [];
                file.on('data', function onData(chunk) {
                    this.fileRead.push(chunk);
                });
                file.on('end', function onEnd() {
                    var finalBuffer = Buffer.concat(this.fileRead);
                    req.file = {
                        buffer: finalBuffer,
                        size: finalBuffer.length,
                        filename: filename,
                        mimetype: mimetype.toLowerCase()
                    };
                });
            });
            busboy.on('error', function onError(err) {
                pError = true;
                RouteHelper.sendError(res, Errors.INTERNAL_ERROR, {ERROR: err});
            });

            busboy.on('field', function (fieldname, val) {
                body[fieldname] = val;
            });

            var sent = false;
            busboy.on('finish', function () {
                if (pError) {
                    return;
                }

                if (sent) {
                    return;
                }

                if (typeof req.file == "undefined") {
                    RouteHelper.sendError(res, Errors.FILE_INVALID);
                    sent = true;
                    return;
                }

                var name = Date.now().toString() + "-" + sPayload + ".png";
                Accounts.find({ID: sPayload}, function (aErr, aRows) {
                    if (RouteHelper.hasInternalError(res, aErr, aRows)) {
                        return;
                    }

                    Util.deleteImage(aRows[0]['LOGO']);
                    Util.upload(name, req.file.buffer);

                    Accounts.update({LOGO: name}, {ID: sPayload}, function (aErr) {
                    });
                    RouteHelper.sendSuccess(res);
                    sent = true;
                });
            });

            req.pipe(busboy);
        });
    });

}

module.exports = AccountRoute;
