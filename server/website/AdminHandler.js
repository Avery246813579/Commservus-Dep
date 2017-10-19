var path = require('path');
var Security = require('../util/Security');
var Util = require('../util/Util');
var WebsiteUtil = require('./WebsiteUtil');
var Admins = require('../tables/general/Admins');
var Whitelist = require('../tables/general/Whitelist');

function AdminHandler(app) {
    app.get('/admin', function (req, res) {
        Security.validateNoSend(req, res, function (nLogged, id) {
            if (nLogged) {
                res.status(403).send();
                return;
            }

            Admins.find({ACCOUNT_ID: id}, function (aErr, aRows) {
                if (aErr) {
                    res.status(403).send();
                    return;
                }

                if (aRows.length < 1) {
                    res.status(403).send();
                    return;
                }

                var toReturnParameters = {
                    NAVBAR: WebsiteUtil.getAdminNavigationBar('', encodeURIComponent(req.protocol + '://' + req.get('Host') + req.url))
                };

                res.render(path.resolve(__dirname + '/../../public/desktop/admin/index/index.frost'), toReturnParameters);
            });
        });
    });

    app.get('/admin/whitelist', function (req, res) {
        Security.validateNoSend(req, res, function (nLogged, id) {
            if (nLogged) {
                res.status(403).send();
                return;
            }

            Admins.find({ACCOUNT_ID: id}, function (aErr, aRows) {
                if (aErr) {
                    res.status(403).send();
                    return;
                }

                if (aRows.length < 1) {
                    res.status(403).send();
                    return;
                }

                var toReturnParameters = {
                    NAVBAR: WebsiteUtil.getAdminNavigationBar('../', encodeURIComponent(req.protocol + '://' + req.get('Host') + req.url)),
                    WHITELIST: ''
                };

                Whitelist.find([{TYPE: 0}, {TYPE: 1}], function (wErr, wRows) {
                    if(wErr){
                        res.render(path.resolve(__dirname + '/../../public/desktop/admin/whitelist/whitelist.frost'), {});
                        return;
                    }

                    for(var i = 0; i < wRows.length; i++){
                        toReturnParameters['WHITELIST'] += '<tr class="_row"> <td> <input type="text" value="' + wRows[i]['CONTENT'] + '" id="' + wRows[i]['ID'] + '_CONTENT"> </td> <td> <input type="text" value="' + wRows[i]['TYPE'] + '" id="' + wRows[i]['ID'] + '_TYPE"> </td> <td> <input type="button" onclick="updateWhitelist(' + wRows[i]['ID'] + ')" value="Update" style="float: right; width: 50px !important; height: 12px; top: -7px; position: relative; background-color: #1CAC78"> <input type="button" onclick="deleteWhitelist(' + wRows[i]['ID'] + ')" value="-" style="float: right; width: 12px !important; height: 12px; top: -7px; position: relative; background-color: #b94a48;">  </td> </tr>';
                    }

                    toReturnParameters['WHITELIST'] += '<tr class="_row"> <td> <input type="text" id="CREATE_CONTENT" placeholder="Content"> </td> <td> <input  id="CREATE_TYPE" type="text" placeholder="Type"> </td> <td> <input type="button" onclick="createWhitelist()" value="+" style="float: right; width: 12px !important; height: 12px; top: -7px; position: relative; background-color: #1CAC78;">  </td> </tr>';

                    res.render(path.resolve(__dirname + '/../../public/desktop/admin/whitelist/whitelist.frost'), toReturnParameters);
                });
            });
        });
    });

}

module.exports = AdminHandler;