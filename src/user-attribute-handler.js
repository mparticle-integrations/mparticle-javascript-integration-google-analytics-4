function UserAttributeHandler(common) {
    this.common = common || {};
}
UserAttributeHandler.prototype.onRemoveUserAttribute = function(
    key
    // mParticleUser
) {
    var userAttributes = {};
    userAttributes[key] = null;
    gtag('set', 'user_properties', userAttributes);
};
UserAttributeHandler.prototype.onSetUserAttribute = function(
    key,
    value
    // mParticleUser
) {
    var userAttributes = {};
    userAttributes[key] = value;
    gtag('set', 'user_properties', userAttributes);
};
UserAttributeHandler.prototype.onConsentStateUpdated = function() // oldState,
// newState,
// mParticleUser
{};

module.exports = UserAttributeHandler;
