function EventHandler(common) {
    this.common = common || {};
}

EventHandler.prototype.logEvent = function(event) {
    // GA4 allows users to use recommended parameter and event names. Before
    // sending an event to GA4, check to see if the event name or parameters
    // are mapped.
    var parameters = this.common.createParameters(
        event.EventAttributes,
        this.common.mappedParameters
    );

    var mappingMatches = getEventMappingValue(
        event,
        this.common.mappedEventNames
    );
    if (mappingMatches && mappingMatches.result === true) {
        mappingMatches.matches.forEach(function(match) {
            gtag('event', match.value, parameters);
        });
    } else {
        gtag('event', event.EventName, parameters);
    }
};

EventHandler.prototype.logError = function() {
    console.warn('Google Analytics 4 does not support error events.');
};

EventHandler.prototype.logPageView = function(event) {
    var TITLE = 'Google.Title';
    var LOCATION = 'Google.Location';
    var pageTitle, pageLocation;
    if (event.CustomFlags.hasProperty(TITLE)) {
        pageTitle = event.CustomFlags[TITLE];
    } else {
        pageTitle = document.title;
    }

    if (event.CustomFlags.hasProperty(LOCATION)) {
        pageLocation = event.CustomFlags[LOCATION];
    } else {
        pageLocation = location.href;
    }
    gtag('event', 'page_view', {
        page_title: pageTitle,
        page_location: pageLocation,
    });

    return true;
};

function getEventMappingValue(event, eventMapping) {
    var jsHash = calculateJSHash(
        event.EventDataType,
        event.EventCategory,
        event.EventName
    );
    return findValueInMapping(jsHash, eventMapping);
}

function calculateJSHash(eventDataType, eventCategory, name) {
    var preHash = '' + eventDataType + ('' + eventCategory) + '' + (name || '');

    return mParticle.generateHash(preHash);
}

function findValueInMapping(jsHash, mapping) {
    if (mapping) {
        var filteredArray = mapping.filter(function(mappingEntry) {
            if (
                mappingEntry.jsmap &&
                mappingEntry.maptype &&
                mappingEntry.value
            ) {
                return mappingEntry.jsmap === jsHash.toString();
            }

            return {
                result: false,
            };
        });

        if (filteredArray && filteredArray.length > 0) {
            return {
                result: true,
                matches: filteredArray,
            };
        }
    }

    return null;
}

module.exports = EventHandler;