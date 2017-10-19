var prototype = module.exports;
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport('smtps://' + process.env.EMAIL + ':' + process.env.EMAIL_PASSWORD + '@smtp.gmail.com');
var AWS = require('aws-sdk');
crypto = require('crypto');

var s3 = new AWS.S3({
    secretAccessKey: process.env.AWS_SECRET,
    accessKeyId: process.env.AWS_ACCESS
});

var monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

var monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "June",
    "July", "Aug", "Sep", "Oct", "Nov", "Dec"
];

Date.prototype.getMonthName = function(){
    return  monthNames[this.getMonth()];
};

Date.prototype.getMonthShortName = function(){
    return  monthNamesShort[this.getMonth()];
};

prototype.deleteImage = function(key){
    var params = {
        Bucket: 'frostbyte',
        Key: key
    };

    s3.deleteObject(params, function(err, data) {
    });
};

prototype.upload = function(name, file, length){
    s3.putObject({
        Bucket: 'frostbyte',
        Key: name,
        ACL: 'public-read',
        Body: file

    }, function(err, data) {
        if (err) console.log(err);
    })
};
prototype.sendEmail = function(address, subject, body){
    var mailOptions = {
        from: '"Steven Can\'t Code" <I_MADE_THIS_EMAIL_UP@gmail.com>',
        to: address,
        subject: subject,
        html: body
    };

    transporter.sendMail(mailOptions, function(error, info){});
};

Date.prototype.addMinutes = function (minutes) {
    this.setMinutes(this.getMinutes() + minutes);
    return this;
};

Date.prototype.addSeconds = function (seconds) {
    this.setSeconds(this.getSeconds() + seconds);
    return this;
};

Date.prototype.stdTimezoneOffset = function() {
    var jan = new Date(this.getFullYear(), 0, 1);
    var jul = new Date(this.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
};

Date.prototype.dst = function() {
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
};

prototype.randomString = function (howMany, chars) {
    chars = chars
        || "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";
    var rnd = crypto.randomBytes(howMany)
        , value = new Array(howMany)
        , len = chars.length;

    for (var i = 0; i < howMany; i++) {
        value[i] = chars[rnd[i] % len]
    }

    return value.join('');
};

prototype.getServerTime = function () {
    var offset = -5.0;

    var clientDate = new Date();

    if(clientDate.dst()){
        offset += 1;
    }

    var utc = clientDate.getTime() + (clientDate.getTimezoneOffset() * 60000);

    return new Date(utc + (3600000 * offset));
};

prototype.formatTime = function (date) {
    var instance = this;

    return instance.toDouble(date.getHours()) + ":" + instance.toDouble(date.getMinutes()) + ":" + instance.toDouble(date.getSeconds())
        + " " + instance.toDouble(date.getMonth() + 1) + "-" + instance.toDouble(date.getDate()) + "-" + instance.toDouble(date.getFullYear())
};

prototype.getTime = function () {
    return this.formatTime(this.getServerTime());
};

prototype.parseTime = function (raw) {
    var time = new Date();

    var split = raw.split(" ");
    var fSplit = split[0].split(":");
    var sSplit = split[1].split("-");

    time.setHours(fSplit[0]);
    time.setMinutes(fSplit[1]);
    time.setSeconds(fSplit[2]);

    time.setMonth(sSplit[0] - 1);
    time.setDate(sSplit[1]);
    time.setFullYear(sSplit[2]);

    return time;
};

prototype.toDouble = function (number) {
    if (number > 9) {
        return number;
    } else {
        return "0" + number;
    }
};

function toDouble(number) {
    if (number > 9) {
        return number;
    } else {
        return "0" + number;
    }
};

prototype.getTwoDates = function(start, end){
    if(start.getMonth() == end.getMonth() && start.getDate() == end.getDate()){
        return toPM_AM(start) + " - " + toPM_AM(end) + " (EST) on " + start.getMonthShortName() + " " + start.getDate() + ", " + start.getFullYear();
        //return "5:00PM - 7:00PM (EST) on Jan 12, 2017";
    }else{
        return toPM_AM(start) + " (EST) " + start.getMonthShortName() + " " + start.getDate() + ", " + start.getFullYear() + " - " + toPM_AM(end) + " (EST) " + end.getMonthShortName() + " " + end.getDate() + ", " + end.getFullYear();
        //return "5:00PM (EST) Jan 12, 2017 - 6:00:PM (EST) Jan 13, 2017
    }
};

function toPM_AM(time){
    if(time.getHours() > 12){
        return time.getHours() % 12 + ":" + toDouble(time.getMinutes()) + "PM";
    } else if(time.getHours() == 12){
        return "12:" + toDouble(time.getMinutes()) + "PM"
    } else if (time.getHours() == 0){
        return "12:" + toDouble(time.getMinutes()) + "AM"
    }else {
        return time.getHours() + ":" + toDouble(time.getMinutes()) + "AM";
    }
}

prototype.deleteCookie = function (res, key) {
    if (typeof process.env.RDS_USERNAME == "undefined") {
        res.cookie(key, '', {expires: new Date(1), path: '/'});
    } else {
        res.cookie(key, '', {expires: new Date(1), path: '/', domain: getURL()});
    }
};

prototype.parseCookies = function (request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function (cookie) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
};

prototype.parseSocketCookies = function (rc) {
    var list = {};

    rc && rc.split(';').forEach(function (cookie) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
};

function getURL() {
    if (typeof process.env.RDS_USERNAME == "undefined") {
        return ".localhost:8081";
    } else {
        return ".commservus.com";
    }
}

prototype.getURL = function(){
    if (typeof process.env.RDS_USERNAME == "undefined") {
        return ".localhost:8081";
    } else {
        return ".commservus.com";
    }
};

prototype.onlyReturn = function(rows, elements){
    var toReturn = [];

    for(var i = 0; i < rows.length; i++){
        var nRow = {};

        for(var j = 0; j < elements.length; j++){
            nRow[elements[j]] = rows[i][elements[j]];
        }

        toReturn.push(nRow);
    }

    return toReturn;
};
