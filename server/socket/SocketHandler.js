var Security = require('../util/Security');
var Util = require('../util/Util');

module.exports.SOCKET_USERS = {};

module.exports.init = function (app) {
    var server = require('http').createServer(app);
    var io = require('socket.io')(server);

    io.on('connection', function (event) {
        Security.validateSocket(event, event.request.headers.cookie, function (error, id) {
            if (error) {
                event.disconnect();
                return;
            }

            var ID = Util.randomString(5, "1234567890");
            if (typeof module.exports.SOCKET_USERS[id] == "undefined") {
                module.exports.SOCKET_USERS[id] = {CLIENTS: {}};
            }

            var CLIENTS = module.exports.SOCKET_USERS[id]['CLIENTS'];
            CLIENTS[ID] = event;

            event.on('disconnect', function () {
                delete module.exports.SOCKET_USERS[id]['CLIENTS'][ID];

                var CLIENTS = module.exports.SOCKET_USERS[id]['CLIENTS'];
                if (CLIENTS.length < 1) {
                    delete module.exports.SOCKET_USERS[id];
                }
            });
        });
    });

    server.listen(3001);
};