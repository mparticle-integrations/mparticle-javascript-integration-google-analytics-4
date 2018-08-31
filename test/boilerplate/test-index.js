window.MockHttpServer = require('./mockhttprequest.js');
window.Should = require('should');

var mp = function () {
    var self = this;

    this.addForwarder = function (forwarder) {
        self.forwarder = new forwarder.constructor();
    };

    this.getCurrentUser = function() {
        return currentUser();
    };
};

function currentUser() {
    return {
        getMPID: function() {
            return 123;
        }
    };
}

window.mParticle = new mp();
require('../../node_modules/@mparticle/web-kit-wrapper/index.js');
require('../tests.js');
