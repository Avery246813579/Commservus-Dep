var path = require('path');
var Security = require('../util/Security');
var Util = require('../util/Util');
var Admins = require('../tables/general/Admins');
var Whitelist = require('../tables/general/Whitelist');
var parser = require('ua-parser-js');
var WebsiteUtil = require('./WebsiteUtil');

function AdminHandler(app) {
    app.get('/settings/account', function(req, res){
        if (isMobile(req)) {
            var toReturnParameters = {
                NAVBAR: WebsiteUtil.getMobileNavigationBar('../../'),
                NAVBAR_ASSETS: WebsiteUtil.getMobileNavigationBarAssets('../../'),
                FOOTER: WebsiteUtil.getMobileFooter('../../'),
                JAVASCRIPT: '**/loggedIn = true;/**'
            };

            res.render(path.resolve(__dirname + '/../../public/mobile/settings/account/account.frost'), toReturnParameters);
        } else {
            res.render(path.resolve(__dirname + '/../../public/desktop/landing.frost'), {});
        }
    });
}

function isMobile(req) {
    var ua = parser(req.headers['user-agent']);

    return typeof ua.device.type != "undefined";
}

module.exports = AdminHandler;