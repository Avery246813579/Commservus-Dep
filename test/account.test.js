var expect = require("chai").expect, assert = require("chai").assert, chai = require("chai");
var request = require("request");
var fs = require('fs');
var config = JSON.parse(fs.readFileSync('test/config.json', 'utf8'));

require('../server/index.js');
var Util = require('../server/util/Util');
var RouteHelper = require('../server/util/RouteHelper');
var USERNAME = Util.randomString(10), COOKIES = "";

/*
Lets cache an account and org
 */
var cache = JSON.parse(fs.readFileSync('test/cache.json', 'utf8'));

if(typeof cache['Cookie'] == "undefined") {
    request.post({
        url: 'http://localhost:8081/csu/api/register',
        method: 'POST',
        json: {
            DISPLAY_NAME: 'BOT USER',
            USERNAME: USERNAME,
            EMAIL: USERNAME + "@FAKEADDRESS.COM",
            PASSWORD: "2A95D17965EEE8C5911AC175AA80D1C91FB671FD5DFBFF327A2951DBC775280A647ABC360A27834F5518304F68D83F79CDDE867ECE85836E8D4B065B96F58261"
        }
    }, function (error, response, body) {
        var rCookies = response.headers['set-cookie'], cookies = "";
        for (var key in rCookies) {
            if (rCookies.hasOwnProperty(key)) {
                cookies += rCookies[key];
            }
        }

        request.post({
            url: 'http://localhost:8081/csu/api/organization',
            method: 'POST',
            json: {
                NAME: 'TEST ORGANIZATION',
                USERNAME: USERNAME,
                DESCRIPTION: "This is a test organization",
                TYPE: '1'
            },
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookies.replaceAll("path=/", "")
            }
        }, function (error, response, body) {
            if (response.statusCode != 200 || body.success != true) {
                console.log("BAD NEWS");
                return;
            }

            fs.writeFile('test/cache.json', JSON.stringify({Cookie: cookies.replaceAll("path=/", ""), Org: body['data']['id']}), 'utf8');
        });
    });

    throw new Error("Restart :D");
}

//describe("Account Route API", function () {
//    describe("Creating an Account", function () {
//        it("should create account with new info", function (done) {
//            request.post({
//                url: 'http://localhost:8081/csu/api/register',
//                method: 'POST',
//                json: {
//                    DISPLAY_NAME: 'BOT USER',
//                    USERNAME: USERNAME,
//                    EMAIL: USERNAME + "@FAKEADDRESS.COM",
//                    PASSWORD: "2A95D17965EEE8C5911AC175AA80D1C91FB671FD5DFBFF327A2951DBC775280A647ABC360A27834F5518304F68D83F79CDDE867ECE85836E8D4B065B96F58261"
//                }
//            }, function (error, response, body) {
//                expect(response.statusCode).to.equal(200);
//                expect(body.success).to.equal(true);
//
//                var rCookies = response.headers['set-cookie'], cookies = "";
//                for (var key in rCookies) {
//                    if (rCookies.hasOwnProperty(key)) {
//                        cookies += rCookies[key];
//                    }
//                }
//
//                fs.writeFile('test/config.json', JSON.stringify({Last: config['Cookie'], Cookie: cookies.replaceAll("path=/", "")}), 'utf8');
//                done();
//            });
//        });
//
//        it("should reject creation because of duplicate email", function (done) {
//            request.post({
//                url: 'http://localhost:8081/csu/api/register',
//                method: 'POST',
//                json: {
//                    DISPLAY_NAME: 'BOT USER',
//                    USERNAME: USERNAME,
//                    EMAIL: USERNAME + "@FAKEADDRESS.COM",
//                    PASSWORD: "2A95D17965EEE8C5911AC175AA80D1C91FB671FD5DFBFF327A2951DBC775280A647ABC360A27834F5518304F68D83F79CDDE867ECE85836E8D4B065B96F58261"
//                }
//            }, function (error, response, body) {
//                expect(response.statusCode).to.equal(200);
//                expect(body.success).to.equal(false);
//                expect(body.code).to.be.oneOf([13, 6]);
//
//                done();
//            });
//        });
//    });
//
//    describe('Logging into account', function () {
//        it('should reject with login invalid with bad login id', function (done) {
//            request.post({
//                url: 'http://localhost:8081/csu/api/login',
//                method: 'POST',
//                json: {
//                    USERNAME: USERNAME + "DD",
//                    PASSWORD: "2A95D17965EEE8C5911AC175AA80D1C91FB671FD5DFBFF327A2951DBC775280A647ABC360A27834F5518304F68D83F79CDDE867ECE85836E8D4B065B96F58261"
//                }
//            }, function (error, response, body) {
//                expect(response.statusCode).to.equal(200);
//                expect(body.success).to.equal(false);
//                expect(body.code).to.equal(16);
//
//                done();
//            });
//        });
//
//        it('should reject with login invalid with bad login password', function (done) {
//            request.post({
//                url: 'http://localhost:8081/csu/api/login',
//                method: 'POST',
//                json: {
//                    USERNAME: USERNAME,
//                    PASSWORD: "2A95D17965DEE8C5911AC175AA80D1C91FB671FD5DFBFF327A2951DBC775280A647ABC360A27834F5518304F68D83F79CDDE867ECE85836E8D4B065B96F58261"
//                }
//            }, function (error, response, body) {
//                expect(response.statusCode).to.equal(200);
//                expect(body.success).to.equal(false);
//                expect(body.code).to.equal(16);
//
//                done();
//            });
//        });
//    })
//});