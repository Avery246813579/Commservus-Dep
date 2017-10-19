var RouteHelper = require('./../util/RouteHelper');
var Errors = require('./../util/Errors');

function RouteHandler(app, express) {
    var router = express.Router();

    require('./AccountRoute')(router);
    require('./OrganizationRoute')(router);
    require('./EventRoute')(router);
    require('./GeneralRoute')(router);

    app.use(function (err, req, res, next) {
        if (err.status === 400) {
            return RouteHelper.sendError(res, Errors.BODY_JSON_INVALID);
        }

        return next(err);
    });

    //Load stuff here

    app.use('/api', router);
}

module.exports = RouteHandler;