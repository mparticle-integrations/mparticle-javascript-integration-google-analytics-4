function Common() {}

Common.prototype.createParameters = function(eventAttributes, map) {
    var parameters = {};

    for (var key in eventAttributes) {
        if (map[key]) {
            // It is possible for the customer to choose the same recommended attribute to be multiple attributes to be associated with the same recommended attribute
            // TODO: are there different user attributes, event attributes, and product attribute options?
            if (parameters[map[key]]) {
                console.warn(
                    'The key of ' +
                        map[key] +
                        'has already been mapped. It is not possible to map multiple keys to the same recommended parameter.  Skipping ' +
                        key
                );
            } else {
                parameters[map[key]] = eventAttributes[key];
            }
        } else {
            parameters[key] = eventAttributes[key];
        }
    }

    console.log(parameters);
    // return 'I am an example';

    return parameters;
};

Common.prototype.mappedEventNames = {};
Common.prototype.mappedParameters = {};

Common.prototype.mergeObjects = function() {
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

module.exports = Common;
