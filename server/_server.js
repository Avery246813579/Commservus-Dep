var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var parser = require('ua-parser-js');

var app = express();

app.use(express.static(path.join(__dirname + "/../", 'public')));

//app.use(function (req, res, next) {
//    res.header('Access-Control-Allow-Origin', "*");
//    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH");
//    res.header("Access-Control-Allow-Headers", "Content-Type, X-Requested-With");
//
//    next();
//});

var fs = require('fs'); // this engine requires the fs module
app.engine('frost', function (filePath, options, callback) { // define the template engine
    fs.readFile(filePath, function (err, content) {
        if (err) return callback(new Error(err));

        var rendered = content.toString();

        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                var property = options[key];

                if (typeof property == "function") {
                    rendered = rendered.replace("{{" + key.toUpperCase() + "}}", property);
                } else if (typeof property == "string") {
                    if (typeof bytes[property] != "undefined") {
                        rendered = rendered.replace("{{" + key.toUpperCase() + "}}", bytes[property]);
                        continue;
                    }

                    rendered = rendered.replace("{{" + key.toUpperCase() + "}}", property);
                }
            }
        }

        return callback(null, rendered);
    });
});
app.set('views', './'); // specify the views directory
app.set('view engine', 'frost'); // register the template engine
app.set('frost', './bytes');

var bytes = {};
fs.readdir(app.settings.frost, function (error, files) {
    if (error) {
        throw error;
    }

    for (var i = 0; i < files.length; i++) {
        (function () {
            var file = files[i];
            if (!files[i].endsWith(".html") && !files[i].endsWith('.htm')) {
                return;
            }

            fs.readFile(app.settings.frost + "/" + files[i], function (err, content) {
                if (error) {
                    throw err;
                }

                bytes[file.substr(0, file.length - 5)] = content.toString();
            });
        })();
    }

});

app.get('/test', function (req, res) {
    var host = req.get('host');
    var origin = req.get('origin');
    console.dir(host);
    console.dir(origin);

    var ip;
    if (req.headers['x-forwarded-for']) {
        ip = req.headers['x-forwarded-for'].split(",")[0];
    } else if (req.connection && req.connection.remoteAddress) {
        ip = req.connection.remoteAddress;
    } else {
        ip = req.ip;
    }
    console.log("client IP is *********************" + ip);

    function parseCookies(request) {
        var list = {},
            rc = request.headers.cookie;

        rc && rc.split(';').forEach(function (cookie) {
            var parts = cookie.split('=');
            list[parts.shift().trim()] = decodeURI(parts.join('='));
        });

        return list;
    }

    var ua = parser(req.headers['user-agent']);
    console.dir(ua.device);
    console.dir(ua.browser);
    console.dir(ua.os);


    var cookies = parseCookies(req);

    if (cookies['MyCookie'] === "ID") {
        res.render('views/index', {HEAD: "TEST"});
    } else {
        res.render('views/index', {HEAD: "<head><title>NOT ID</title></head>"});
    }
});

app.post('/test', function (req, res) {
    var host = req.get('host');
    var origin = req.get('origin');
    console.dir(host);
    console.dir(origin);

    res.status(200).json({
        success: false
    });
});

function test(cookies) {
    return "MOM " + cookies['MyCookie'];
}

//app.set('views', './views'); // specify the views directory
//app.set('view engine', 'ntl'); // register the template engine


app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname + '/../public/index.html'));
});

app.listen(8081, function () {
    console.log('Example app listening on port 8081!');
});
