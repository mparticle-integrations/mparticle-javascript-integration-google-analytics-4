function Common() {}

Common.prototype.createParameters = function(eventAttributes) {
    var parameters = {};
    // loop over event attributes and if the eventAttribute is part of a mapped event attribute
    // if so, set the mapped event attribute, if not, set the original event attribute name

    for (var key in eventAttributes) {
        console.log(key);
        // if event attribute is mapped
        // parameters[mappedAttribute] = eventAttributes[key[]]
        // else {
        // set key to parameter as it is a custo parameter
        //     parameters[key] = eventAttributes[key]
        // }
        //
    }

    console.log(parameters);
    // return 'I am an example';

    return parameters;
};

Common.prototype.mapEventName = function(eventName) {
    console.log(eventName);
    // if (EventNameMap[eventName]) {
    //     return EventNameMap[eventName];
    // } else {
    //     return eventName;
    // }
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
