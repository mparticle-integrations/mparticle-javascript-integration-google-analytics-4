var EVENT_MAX_LENGTH = 40;
var USER_ATTRIBUTE_MAX_LENGTH = 24;
var EVENT_VAL_MAX_LENGTH = 100;
var USER_ATTRIBUTE_VALUE_MAX_LENGTH = 36;

function truncateString(string, limit) {
    return string.length > limit ? string.substring(0, limit) : string;
}

function Common() {}

Common.prototype.forwarderSettings = null;

Common.prototype.mergeObjects = function () {
    var resObj = {};
    for (var i = 0; i < arguments.length; i += 1) {
        var obj = arguments[i],
            keys = Object.keys(obj);
        for (var j = 0; j < keys.length; j += 1) {
            resObj[keys[j]] = obj[keys[j]];
        }
    }
    return resObj;
};

Common.prototype.truncateAttributes = function (
    attributes,
    keyLimit,
    valueLimit
) {
    var truncatedAttributes = {};

    Object.keys(attributes).forEach(function (attribute) {
        var key = truncateString(attribute, keyLimit);
        var val = truncateString(attributes[attribute], valueLimit);
        truncatedAttributes[key] = val;
    });

    return truncatedAttributes;
};

Common.prototype.truncateEventName = function (eventName) {
    return truncateString(eventName, EVENT_MAX_LENGTH);
};

Common.prototype.truncateEventAttributes = function (eventAttributes) {
    return this.truncateAttributes(
        eventAttributes,
        EVENT_MAX_LENGTH,
        EVENT_VAL_MAX_LENGTH
    );
};

Common.prototype.truncateUserAttributes = function (userAttributes) {
    return this.truncateAttributes(
        userAttributes,
        USER_ATTRIBUTE_MAX_LENGTH,
        USER_ATTRIBUTE_VALUE_MAX_LENGTH
    );
};

Common.prototype.getUserId = function (
    user,
    externalUserIdentityType,
    hashUserId
) {
    if (!user) {
        return;
    }

    var externalUserIdentityTypes = {
        none: 'None',
        customerId: 'CustomerId',
        other: 'Other',
        other2: 'Other2',
        other3: 'Other3',
        other4: 'Other4',
        other5: 'Other5',
        other6: 'Other6',
        other7: 'Other7',
        other8: 'Other8',
        other9: 'Other9',
        other10: 'Other10',
        mpid: 'mpid',
    };

    var userId,
        userIdentities = user.getUserIdentities().userIdentities;
    if (externalUserIdentityType !== externalUserIdentityTypes.none) {
        switch (externalUserIdentityType) {
            case 'CustomerId':
                userId = userIdentities.customerid;
                break;
            case externalUserIdentityTypes.other:
                userId = userIdentities.other;
                break;
            case externalUserIdentityTypes.other2:
                userId = userIdentities.other2;
                break;
            case externalUserIdentityTypes.other3:
                userId = userIdentities.other3;
                break;
            case externalUserIdentityTypes.other4:
                userId = userIdentities.other4;
                break;
            case externalUserIdentityTypes.other5:
                userId = userIdentities.other5;
                break;
            case externalUserIdentityTypes.other6:
                userId = userIdentities.other6;
                break;
            case externalUserIdentityTypes.other7:
                userId = userIdentities.other7;
                break;
            case externalUserIdentityTypes.other8:
                userId = userIdentities.other8;
                break;
            case externalUserIdentityTypes.other9:
                userId = userIdentities.other9;
                break;
            case externalUserIdentityTypes.other10:
                userId = userIdentities.other10;
                break;
            case externalUserIdentityTypes.mpid:
                userId = user.getMPID();
                break;
            default:
                console.warn(
                    'External identity type not found for setting identity on ' +
                        'GA4' +
                        '. User not set. Please double check your implementation.'
                );
        }
        if (userId) {
            if (hashUserId == 'True') {
                userId = window.mParticle.generateHash(userId);
            }
        } else {
            console.warn(
                'External identity type of ' +
                    externalUserIdentityType +
                    ' not set on the user'
            );
        }
        return userId;
    }
};

module.exports = Common;
