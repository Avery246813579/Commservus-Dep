var expect = require("chai").expect, chai = require("chai"), request = require("request");
var Util = require('../server/util/Util'), RouteHelper = require('../server/util/RouteHelper'), fs = require('fs');
require('../server/index.js');
var config = JSON.parse(fs.readFileSync('test/config.json', 'utf8'));

var HEADERS = {
    'Content-Type': 'application/json',
    'Cookie': config['Cookie']
};

var USERNAME = Util.randomString(10), ORGANIZATION_ID = -1, GROUP_ID = -1;

//describe("Organization API Tests", function () {
//    describe("Finding organizations", function () {
//        it("should return an empty array", function (done) {
//            request.get({
//                url: 'http://localhost:8081/csu/api/organizations',
//                method: 'GET',
//                json: {},
//                headers: HEADERS
//            }, function (error, response, body) {
//                expect(response.statusCode).to.equal(200);
//                expect(body.success).to.equal(true);
//                expect(body.data.length).to.equal(0);
//
//                done();
//            });
//        });
//    });
//
//    describe("Creating an organization", function () {
//        it("should return an ORGANIZATION_DUPLICATE", function (done) {
//            request.post({
//                url: 'http://localhost:8081/csu/api/organization',
//                method: 'POST',
//                json: {
//                    NAME: 'TEST ORGANIZATION',
//                    USERNAME: "DUPLICATE",
//                    DESCRIPTION: "This is a test organization",
//                    TYPE: '1'
//                },
//                headers: HEADERS
//            }, function (error, response, body) {
//                expect(response.statusCode).to.equal(200);
//                expect(body.success).to.equal(false);
//                expect(body.code).to.equal(27);
//
//                done();
//            });
//        });
//
//        it("should create an organization", function (done) {
//            request.post({
//                url: 'http://localhost:8081/csu/api/organization',
//                method: 'POST',
//                json: {
//                    NAME: 'TEST ORGANIZATION',
//                    USERNAME: USERNAME,
//                    DESCRIPTION: "This is a test organization",
//                    TYPE: '1'
//                },
//                headers: HEADERS
//            }, function (error, response, body) {
//                expect(response.statusCode).to.equal(200);
//                expect(body.success).to.equal(true);
//                ORGANIZATION_ID = body['data']['id'];
//                GROUP_ID = body['data']['group'];
//
//                config['ORG'] = ORGANIZATION_ID;
//                fs.writeFile('test/config.json', JSON.stringify(config), 'utf8');
//                done();
//            });
//        });
//
//        it("should return an ORGANIZATION_ACCOUNT_DUPLICATE", function (done) {
//            request.post({
//                url: 'http://localhost:8081/csu/api/organization',
//                method: 'POST',
//                json: {
//                    NAME: 'TEST ORGANIZATION',
//                    USERNAME: USERNAME,
//                    DESCRIPTION: "This is a test organization",
//                    TYPE: '1'
//                },
//                headers: HEADERS
//            }, function (error, response, body) {
//                expect(response.statusCode).to.equal(200);
//                expect(body.success).to.equal(false);
//                expect(body.code).to.equal(26);
//
//                done();
//            });
//        });
//    });
//
//    describe("Finding organizations", function () {
//        it("should return an empty array", function (done) {
//            request.get({
//                url: 'http://localhost:8081/csu/api/organizations',
//                method: 'GET',
//                json: {},
//                headers: HEADERS
//            }, function (error, response, body) {
//                expect(response.statusCode).to.equal(200);
//                expect(body.success).to.equal(true);
//                expect(body.data.length).to.be.above(0);
//
//                done();
//            });
//        });
//    });
//
//    describe("Updating an organization", function () {
//        it("should successfully update an organization", function (done) {
//            request.patch({
//                url: 'http://localhost:8081/csu/api/organization/' + ORGANIZATION_ID,
//                method: 'PATCH',
//                json: {
//                    NAME: 'TEST ORGANIZATION UPDATED NAME',
//                    DESCRIPTION: "UPDATED DESCRIPTION"
//                },
//                headers: HEADERS
//            }, function (error, response, body) {
//                expect(response.statusCode).to.equal(200);
//                expect(body.success).to.equal(true);
//
//                done();
//            });
//        });
//
//        it("should reject with ORGANIZATION_INVALID", function (done) {
//            request.patch({
//                url: 'http://localhost:8081/csu/api/organization/213231',
//                method: 'PATCH',
//                json: {
//                    NAME: 'TEST ORGANIZATION UPDATED NAME',
//                    DESCRIPTION: "UPDATED DESCRIPTION"
//                },
//                headers: HEADERS
//            }, function (error, response, body) {
//                expect(response.statusCode).to.equal(200);
//                expect(body.success).to.equal(false);
//                expect(body.code).to.equal(28);
//
//                done();
//            });
//        });
//
//        it("should reject with ORGANIZATION_INSUFFICIENT_PERMISSIONS", function (done) {
//            request.patch({
//                url: 'http://localhost:8081/csu/api/organization/1',
//                method: 'PATCH',
//                json: {
//                    NAME: 'TEST ORGANIZATION UPDATED NAME',
//                    DESCRIPTION: "UPDATED DESCRIPTION"
//                },
//                headers: HEADERS
//            }, function (error, response, body) {
//                expect(response.statusCode).to.equal(200);
//                expect(body.success).to.equal(false);
//                expect(body.code).to.equal(29);
//
//                done();
//            });
//        });
//    });
//
//    describe('Joining an organization', function () {
//        it("should reject with ORGANIZATION_GROUP_INVALID", function (done) {
//            request.post({
//                url: 'http://localhost:8081/csu/api/organization/' + ORGANIZATION_ID + "/group/2",
//                method: 'POST',
//                json: {},
//                headers: {
//                    'Cookie': config['Last']
//                }
//            }, function (error, response, body) {
//                expect(response.statusCode).to.equal(200);
//                expect(body.success).to.equal(false);
//                expect(body.code).to.equal(32);
//
//                done();
//            });
//        });
//
//        it("should reject with ORGANIZATION_INVALID", function (done) {
//            request.post({
//                url: 'http://localhost:8081/csu/api/organization/787988/group/2',
//                method: 'POST',
//                json: {},
//                headers: {
//                    'Cookie': config['Last']
//                }
//            }, function (error, response, body) {
//                expect(response.statusCode).to.equal(200);
//                expect(body.success).to.equal(false);
//                expect(body.code).to.equal(28);
//
//                done();
//            });
//        });
//
//        it("should successfully join an organization", function (done) {
//            request.post({
//                url: 'http://localhost:8081/csu/api/organization/' + ORGANIZATION_ID + "/group/" + GROUP_ID,
//                method: 'POST',
//                json: {},
//                headers: {
//                    'Cookie': config['Last']
//                }
//            }, function (error, response, body) {
//                expect(response.statusCode).to.equal(200);
//                expect(body.success).to.equal(true);
//
//
//                done();
//            });
//        });
//
//        it("should reject with ORGANIZATION_ACCOUNT_DUPLICATE", function (done) {
//            this.timeout(250);
//
//            request.post({
//                url: 'http://localhost:8081/csu/api/organization/' + ORGANIZATION_ID + "/group/" + GROUP_ID,
//                method: 'POST',
//                json: {},
//                headers: {
//                    'Cookie': config['Last']
//                }
//            }, function (error, response, body) {
//                expect(response.statusCode).to.equal(200);
//                expect(body.success).to.equal(false);
//                expect(body.code).to.equal(30);
//
//                done();
//            });
//        });
//
//    });
//});