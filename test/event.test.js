var expect = require("chai").expect, chai = require("chai"), request = require("request");
var Util = require('../server/util/Util'), Errors = require('../server/util/Errors'), RouteHelper = require('../server/util/RouteHelper'), fs = require('fs');
require('../server/index.js');
var config = JSON.parse(fs.readFileSync('test/cache.json', 'utf8'));
var EVENT = 1, PAST_EVENT = config['PAST_EVENT'], PAST_APPLICATION;

var HEADERS = {
    'Content-Type': 'application/json',
    'Cookie': config['Cookie']
};

describe("Event Route API", function () {
    describe("Creating an Event", function () {
        it("should create an event", function (done) {
            request.post({
                url: 'http://localhost:8081/csu/api/organization/' + config['Org'] + '/event',
                method: 'POST',
                json: {
                    NAME: 'EVENT NAME',
                    DESCRIPTION: "EVENT DESCRIPTION",
                    START_TIME: "22:18:41 01-16-2017",
                    END_TIME: "22:18:41 01-16-2017",
                    TYPE: "0"
                },
                headers: HEADERS
            }, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body.success).to.equal(true);
                EVENT = body['data'];

                config['PAST_EVENT'] = EVENT;
                fs.writeFile('test/cache.json', JSON.stringify(config), 'utf8');

                done();
            });
        });

        it("should reject with INTERNAL_ERROR", function (done) {
            request.post({
                url: 'http://localhost:8081/csu/api/organization/100000/event',
                method: 'POST',
                json: {
                    NAME: 'EVENT NAME',
                    DESCRIPTION: "EVENT DESCRIPTION",
                    START_TIME: "22:18:41 01-16-2017",
                    END_TIME: "22:18:41 01-16-2017",
                    TYPE: "0"
                },
                headers: HEADERS
            }, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body.success).to.equal(false);
                expect(body.code).to.equal(Errors.INTERNAL_ERROR['CODE']);

                done();
            });
        });

        it("should reject with ORGANIZATION_INSUFFICIENT_PERMISSIONS", function (done) {
            request.post({
                url: 'http://localhost:8081/csu/api/organization/7/event',
                method: 'POST',
                json: {
                    NAME: 'EVENT NAME',
                    DESCRIPTION: "EVENT DESCRIPTION",
                    START_TIME: "22:18:41 01-16-2017",
                    END_TIME: "22:18:41 01-16-2017",
                    TYPE: "0"
                },
                headers: HEADERS
            }, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body.success).to.equal(false);
                expect(body.code).to.equal(Errors.ORGANIZATION_INSUFFICIENT_PERMISSIONS['CODE']);

                done();
            });
        });
    });

    describe("Finding event", function () {
        it("should return an event", function (done) {
            request.get({
                url: 'http://localhost:8081/csu/api/event/' + EVENT,
                method: 'GET',
                json: {},
                headers: HEADERS
            }, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body.success).to.equal(true);

                done();
            });
        });

        it("should reject with EVENT_INVALID", function (done) {
            request.get({
                url: 'http://localhost:8081/csu/api/event/10000',
                method: 'GET',
                json: {},
                headers: HEADERS
            }, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body.success).to.equal(false);
                expect(body.code).to.equal(Errors.EVENT_INVALID['CODE']);

                done();
            });
        });
    });

    describe("Editing an Event", function () {
        it("should edit an event", function (done) {
            request.patch({
                url: 'http://localhost:8081/csu/api/organization/' + config['Org'] + '/event/' + EVENT,
                method: 'PATCH',
                json: {
                    NAME: 'EDITED NAME',
                    DESCRIPTION: "EDITED DESCRIPTION"
                },
                headers: HEADERS
            }, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body.success).to.equal(true);

                done();
            });
        });

        it("should reject with EVENT_INSUFFICIENT_PERMISSIONS", function (done) {
            request.patch({
                url: 'http://localhost:8081/csu/api/organization/' + config['Org'] + '/event/1',
                method: 'PATCH',
                json: {
                    NAME: 'EDITED NAME',
                    DESCRIPTION: "EDITED DESCRIPTION"
                },
                headers: HEADERS
            }, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body.success).to.equal(false);
                expect(body.code).to.equal(Errors.EVENT_INSUFFICIENT_PERMISSIONS['CODE']);

                done();
            });
        });
    });

    describe("Cancelling an Event", function () {
        it("should cancel an event", function (done) {
            request.post({
                url: 'http://localhost:8081/csu/api/organization/' + config['Org'] + '/event/' + EVENT + "/cancel",
                method: 'POST',
                json: {},
                headers: HEADERS
            }, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body.success).to.equal(true);

                done();
            });
        });

        it("should reject with EVENT_INSUFFICIENT_PERMISSIONS", function (done) {
            request.post({
                url: 'http://localhost:8081/csu/api/organization/' + config['Org'] + '/event/1/cancel',
                method: 'POST',
                json: {},
                headers: HEADERS
            }, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body.success).to.equal(false);
                expect(body.code).to.equal(Errors.EVENT_INSUFFICIENT_PERMISSIONS['CODE']);

                done();
            });
        });
    });

    describe("Opening an Event", function () {
        it("should open an event", function (done) {
            request.post({
                url: 'http://localhost:8081/csu/api/organization/' + config['Org'] + '/event/' + EVENT + "/open",
                method: 'POST',
                json: {},
                headers: HEADERS
            }, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body.success).to.equal(true);

                done();
            });
        });

        it("should reject with EVENT_INSUFFICIENT_PERMISSIONS", function (done) {
            request.post({
                url: 'http://localhost:8081/csu/api/organization/' + config['Org'] + '/event/1/open',
                method: 'POST',
                json: {},
                headers: HEADERS
            }, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body.success).to.equal(false);
                expect(body.code).to.equal(Errors.EVENT_INSUFFICIENT_PERMISSIONS['CODE']);

                done();
            });
        });
    });

    describe("Applying to an event", function () {
        it("should apply to event", function (done) {
            request.post({
                url: 'http://localhost:8081/csu/api/event/' + PAST_EVENT + "/apply",
                method: 'POST',
                json: {
                    START_TIME: '15:36:00 04-01-2017',
                    END_TIME: '15:36:00 04-01-2017'
                },
                headers: HEADERS
            }, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body.success).to.equal(true);

                done();
            });
        });

        it("should reject EVENT_APPLICATION_DUPLICATE", function (done) {
            request.post({
                url: 'http://localhost:8081/csu/api/event/' + PAST_EVENT + "/apply",
                method: 'POST',
                json: {
                    START_TIME: '15:36:00 04-01-2017',
                    END_TIME: '15:36:00 04-01-2017'
                },
                headers: HEADERS
            }, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body.success).to.equal(false);
                expect(body.code).to.equal(Errors.EVENT_APPLICATION_DUPLICATE['CODE']);

                done();
            });
        });

        it("should reject EVENT_INVALID", function (done) {
            request.post({
                url: 'http://localhost:8081/csu/api/event/2000/apply',
                method: 'POST',
                json: {
                    START_TIME: '15:36:00 04-01-2017',
                    END_TIME: '15:36:00 04-01-2017'
                },
                headers: HEADERS
            }, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body.success).to.equal(false);
                expect(body.code).to.equal(Errors.EVENT_INVALID['CODE']);

                done();
            });
        });
    });

    describe("Getting an event application", function () {
        it("should get applicaiton", function (done) {
            request.get({
                url: 'http://localhost:8081/csu/api/event/' + PAST_EVENT + "/application",
                method: 'GET',
                json: {
                },
                headers: HEADERS
            }, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body.success).to.equal(true);

                PAST_APPLICATION = body['data']['ID'];
                done();
            });
        });

        it("should reject EVENT_APPLICATION_INVALID", function (done) {
            request.get({
                url: 'http://localhost:8081/csu/api/event/2000/application',
                method: 'GET',
                json: {
                },
                headers: HEADERS
            }, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body.success).to.equal(false);
                expect(body.code).to.equal(Errors.EVENT_APPLICATION_INVALID['CODE']);

                done();
            });
        });
    });

    describe("Updating status of application", function () {
        it("should update", function (done) {
            request.post({
                url: 'http://localhost:8081/csu/api/event/' + PAST_EVENT + "/application/" + PAST_APPLICATION,
                method: 'POST',
                json: {
                    STATUS: 1
                },
                headers: HEADERS
            }, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body.success).to.equal(true);

                done();
            });
        });

        it("should reject with EVENT_INSUFFICIENT_PERMISSIONS", function (done) {
            request.post({
                url: 'http://localhost:8081/csu/api/event/52/application/53',
                method: 'POST',
                json: {
                    STATUS: 1
                },
                headers: HEADERS
            }, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body.success).to.equal(false);
                expect(body.code).to.equal(Errors.EVENT_INSUFFICIENT_PERMISSIONS['CODE']);

                done();
            });
        });
    });
});