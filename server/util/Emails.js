var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport('smtps://' + process.env.EMAIL + ':' + process.env.EMAIL_PASSWORD + '@smtp.gmail.com');
var prototype = module.exports;

prototype.sendEmail = function(address, subject, body){
    var mailOptions = {
        from: '"Frostbyte" <minersfortune@gmail.com>',
        to: address,
        subject: subject,
        html: body
    };

    transporter.sendMail(mailOptions, function(error, info){});
};
