var express = require('express');
var server = require('./server');
var bodyParser = require('body-parser');
var fs = require('fs');
var app = express();
setupEngine(app);

app.set('view engine', 'frost'); // register the template engine
app.use(bodyParser.json());

app.use(function (req, res, next) {
    if (typeof process.env.RDS_USERNAME != "undefined" && (!req.secure) && (req.get('X-Forwarded-Proto') !== 'https')) {
        res.redirect('https://' + req.get('Host') + req.url);
        return;
    }

    var host = req.header("host");
    if (host.match(/^www\..*/i)) {
        res.redirect(301, "https://" + host);
        return;
    }


    res.header('Access-Control-Allow-Origin', 'http://www.frostbyte.co');
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH");
    res.header("Access-Control-Allow-Headers", "Content-Type, X-Requested-With");
    res.header("Access-Control-Allow-Credentials", "true");

    next();
});

server(app, express);

var pack = JSON.parse(fs.readFileSync('package.json', 'utf8'));
app.listen(8081, function () {
    console.log(pack.name + " v" + pack.version + " has booted up.");
});


String.prototype.replaceAll = function(target, replacement) {
    return this.split(target).join(replacement);
};

function setupEngine(app) {
    var fs = require('fs'); // this engine requires the fs module
    app.engine('frost', function (filePath, options, callback) { // define the template engine
        fs.readFile(filePath, function (err, content) {
            if (err) return callback(new Error(err));

            var rendered = content.toString();

            for (var key in options) {
                if (options.hasOwnProperty(key)) {
                    var property = options[key];

                    if (typeof property == "function") {
                        rendered = rendered.replaceAll("{{" + key.toUpperCase() + "}}", property);
                    } else if (typeof property == "string") {
                        rendered = rendered.replaceAll("{{" + key.toUpperCase() + "}}", property);
                    }
                }
            }

            return callback(null, rendered);
        });
    });

    app.set('view engine', 'frost'); // register the template engine
}

module.exports.close = function(){
    app.close();
};