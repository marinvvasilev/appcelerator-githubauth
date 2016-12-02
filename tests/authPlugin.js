/* global Arrow, connector, server */
var base = require('./_init'),
    should = require('should'),
    assert = require('assert'),
    async = require('async'),
    request = require('request'),
    path = require('path'),
    github = require('../'),
    passport = new Object(); //will become a passport instance

describe('Github Authentication Plugin', function () {
    var auth;

    before(function (next) {
        auth = new github(server);
        passport = new auth.getPassport();
        next();
    });


    it('should throw error on invalid configuration', function (next) {
        (function () {
            var testServer = server;
            testServer.config = {};
            return new github(testServer);
        }).should.throw('Please check your configuration file. Property object "gihubAuth" is missing!');
        next();
    });

    it('should passport be an object', function (next) {
        should(passport).be.type('object');
        next();
    });

    it('should attach passport to server', function (next) {
        var passportKeys = ['_key',
            '_strategies',
            '_serializers',
            '_deserializers',
            '_infoTransformers',
            '_framework',
            '_userProperty',
            'Authenticator',
            'Passport',
            'Strategy',
            'strategies'];
        should(server.passport).be.ok;
        should(passportKeys).eql(Object.keys(server.passport));
        next();
    });

    it('should have valid API configutation', function (next) {
        var apiConfigurationKeys = ['clientID',
            'clientSecret',
            'callbackURL',
            'loginRoute',
            'authPaths'];
        should(Object.keys(auth.settings)).eql(apiConfigurationKeys);
        next();
    });

    it('should match all urls', function (next) {
        should(auth.matchURL({})).be.true;
        next();
    });

    //Check the validateRequest funciton directly
    it('should validate paths', function (next) {
        var req = {};
        var res = {};
        var authentication = true;
        req.url = '/wrongUri';
        req.isAuthenticated = function () { return false; };
        auth.config.loginUrl = undefined;
        auth.config.allowedPaths = undefined;
        //check if error is thrown
        (function () {
            try {
                authentication = auth.validateRequest(req, res);
            } catch (E) {
                throw E;
            }
        }).should.not.throw();
        should(authentication).be.false;
        //reset the configuration
        auth.config.loginUrl = '/saml/login';
        auth.config.allowedPaths = ['/youFoo'];
        next();
    });

    //Check the validateRequest function with an actual request
    it('should validate Requests', function validatesRequests(next) {
        //Url to the foo Route registered in app.js
        var url = 'http://localhost:' + server.port + '/fooMe';
        //And now, let's make an unauthenticated request
        request({
            method: 'GET',
            url: url,
            json: true
        }, function (err, response, body) {
            //Request should not be authenticated
            console.log(body);
            should(body.success).be.false;
            should(body.message).containEql('Unauthorized');
            next();
        });
    });

    // it('should allow access to pre-configured paths', function prePaths(next) {
    //     //Url to the foo Route registered in app.js
    //     var url = 'http://localhost:' + server.port + '/youFoo';
    //     //First off, lets check if the correct auth type is set
    //     should(server.config.APIKeyAuthType).be.eql('plugin');
    //     should(server.config.APIKeyAuthPlugin).be.eql('index.js'); // yes, that's a hack :)
    //     //And now, let's make an unauthenticated request, to an allowed (in config) route
    //     request({
    //         method: 'GET',
    //         url: url,
    //         json: true
    //     }, function (err, response, body) {
    //         //Request should not be authenticated
    //         should(body.success).be.true;
    //         should(body).containEql('<p>You are now authenticated!</p>');
    //         next();
    //     });
    // });

});