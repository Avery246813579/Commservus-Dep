process.on('uncaughtException', function (err) {
    if(err.name == "AssertionError"){
        return;
    }

    if (err.name != "AssertionError") {
        console.log("-=- Node Critical Error Start -=-");
        console.dir(err.stack);
        console.log("-=- Node Critical Error End -=-");
    }
});

function Server(app, express) {
    require('./tables/TableHandler')();
    require('./routes/RouteHandler')(app, express);
    require('./socket/SocketHandler').init(app);
    require('./website/WebsiteHandler')(app, app, express);
}

module.exports = Server;
