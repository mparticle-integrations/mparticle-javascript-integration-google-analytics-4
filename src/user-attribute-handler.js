function UserAttributeHandler(common) {
    this.common = common || {};
}

// `mParticleUser` was removed from the function signatures onRemoveUserAttribute, onSetUserAttribute, and onConsentStateUpload because they were not being used
// In the future if mParticleUser is ever required for an implementation of any of the below APIs, see https://github.com/mparticle-integrations/mparticle-javascript-integration-example/blob/master/src/user-attribute-handler.js
// for previous function signatures

UserAttributeHandler.prototype.onRemoveUserAttribute = function(key) {
    var userAttributes = {};
    userAttributes[key] = null;
    gtag('set', 'user_properties', userAttributes);
};

UserAttributeHandler.prototype.onSetUserAttribute = function(key, value) {
    var userAttributes = {};
    userAttributes[key] = value;
    gtag('set', 'user_properties', userAttributes);
};

// TODO: Commenting this out for now because Integrations PM still determining if this is in scope or not
// UserAttributeHandler.prototype.onConsentStateUpdated = function() // oldState,
// newState,
// mParticleUser
// {};

module.exports = UserAttributeHandler;
