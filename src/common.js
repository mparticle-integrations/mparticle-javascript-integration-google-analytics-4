function Common() {}

// Initialize an object for each of event and parameter maps
Common.prototype.mappedEventNames = {};
Common.prototype.mappedParameters = {};

// This method returns an object of parameters from an array of eventAttributes
// and mappings selected in the UI. Each attribute may be mapped to a recommended
// parameter. If an attribute is mapped, add the mapped value to the parameter
// object. If an attribute isn't mapped, add the original attribute name.
Common.prototype.createParameters = function(eventAttributes, map) {
    var parameters = {};

    for (var key in eventAttributes) {
        // If the key does not exist in the map, retain the original attribute
        if (!map[key]) {
            parameters[key] = eventAttributes[key];
            continue;
        }

        // TODO: Should there be different code path for user/event/product
        // attributes?
        // If the key does exist in the map, set the mapped value:
        // If the parameters object doesn't have the mapped key yet, add it.
        if (!parameters[map[key]]) {
            parameters[map[key]] = eventAttributes[key];
        } else {
            // It is possible (although wrong) in the UI to map multiple attributes
            // to the same recommended parameter. In these cases, warn the user
            // that the attribute is being skipped, and to double check their setup.
            console.warn(
                'The key of ' +
                    map[key] +
                    ' has already been mapped. It is not possible to map multiple attributes to the same recommended parameter name.  Please check your set up. Skipping key:' +
                    key +
                    '.'
            );
        }
    }

    return parameters;
};

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
