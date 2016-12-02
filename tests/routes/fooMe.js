var Arrow = require('arrow');

var FooMeRoute = Arrow.Router.extend({
    name: 'fooMe',
    path: '/fooMe',
    method: 'GET',
    description: 'fooMe once',
    action: function(req, resp, next) {
        resp.status(200).send('<p>You are NOT seeing this!</p>');
    }
});

module.exports = FooMeRoute;