var passport = require('passport');
var request = require('request');

/**
 * Plugin initialization logic
 * @param Object server
 * @param Object testConfig - optional - configuration settings for testing purposes
 */
function Plugin(server) {
    this.server = server;
    this.config = server.config;
    //Check if we have the right config
    this.checkConfiguration();
    this.settings = this.config.githubAuth;
    //Init if not present
    if (typeof this.server.passport === "undefined")
        this.initGithubAuth();
    else
        this.passport = this.server.passport;
}
// Only validate requests to /api/foo
Plugin.prototype.matchURL = function (request) {
    return true;
};


Plugin.prototype.getPassport = function () {
    return this.passport;
}

//Checks if config parameters are supplied
Plugin.prototype.checkConfiguration = function () {
    if (typeof this.config.githubAuth === "undefined") {
        throw new Error('Please check your configuration file. Property object "githubAuth" is missing!');
    }
    return true;
}


// Check if the request has the X-Secret header and its value matches the config file
Plugin.prototype.validateRequest = function (request, response) {
    if ((typeof request.isAuthenticated !== 'function') || !request.isAuthenticated()) {
        if ((request.url).indexOf(this.config.githubAuth.loginRoute) >= 0) {
            return true;
        }
        //Loop trough all authorized paths
        if (typeof this.settings.authPaths !== "undefined") {
            for (var i = 0; i < this.settings.authPaths.length; i++) {
                if ((request.url).indexOf(this.settings.authPaths[i]) >= 0) {
                    return true;
                }
            }
        }
        return false;
    } else {
        return true;
    }
};


Plugin.prototype.initGithubAuth = function () {
    if (this.server && this.server.app) {
        var GitHubStrategy = require('passport-github').Strategy;
        var userObject = new Object();
        var self = this;

        passport.use(new GitHubStrategy({
            clientID: this.settings.clientID,
            clientSecret: this.settings.clientSecret,
            callbackURL: this.settings.callbackURL,
        }, function (accessToken, refreshToken, profile, cb) {
            userObject = self.mapResultToObject(self, profile);
            return cb(null, userObject);
        }
        ));

        passport.serializeUser(function (user, cb) {
            cb(null, user);
        });

        passport.deserializeUser(function (obj, cb) {
            cb(null, obj);
        });

        this.server.app.use(passport.initialize());
        this.server.app.use(passport.session());
        this.server.passport = passport;
        return passport;
    }
}

Plugin.prototype.mapResultToObject = function (self, _object) {
    var returnObject = new Object;
    var _sett;
    if (typeof self.settings.mappedObject !== "undefined") {
        _sett = self.settings.mappedObject;
    } else {
        _sett = {
            githubId: "id",
            displayName: "displayName",
            username: "username",
            profileUrl: "profileUrl",
            data: "_json"
        };
    }
    (Object.keys(_sett)).forEach(function (setting, key) {
        if (_object.hasOwnProperty(_sett[setting])) {
            returnObject[setting] = _object[(_sett[setting])];
        }
    });

    return returnObject;
};

module.exports = Plugin;