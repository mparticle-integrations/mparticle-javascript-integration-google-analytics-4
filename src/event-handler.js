function EventHandler(common) {
    this.common = common || {};
}

EventHandler.prototype.logEvent = function (event) {
    // GA4 allows users to use recommended parameter and event names. Before
    // sending an event to GA4, check to see if the event name or parameters
    // are mapped.
    var parameters = this.common.createParameters(
        event.EventAttributes,
        this.common.mappedParameters
    );

    var mappingMatches = getEventMappingMatches(
        event,
        this.common.mappedEventNames
    );
    if (mappingMatches) {
        mappingMatches.matches.forEach(function (match) {
            gtag('event', match.value, parameters);
        });
    } else {
        gtag('event', event.EventName, parameters);
    }
};

EventHandler.prototype.logError = function () {
    console.warn('Google Analytics 4 does not support error events.');
};

EventHandler.prototype.logPageView = function (event) {
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

function getEventMappingMatches(event, eventMapping) {
    var mappingObject = null;
    var jsHash = calculateJSHash(
        event.EventDataType,
        event.EventCategory,
        event.EventName
    );
    if (eventMapping) {
        var filteredArray = eventMapping.filter(function (mappingEntry) {
            if (
                mappingEntry.jsmap &&
                mappingEntry.maptype &&
                mappingEntry.value
            ) {
                return mappingEntry.jsmap === jsHash.toString();
            }
        });

        if (filteredArray && filteredArray.length > 0) {
            mappingObject = {
                matches: filteredArray,
            };
        }
    }

    return mappingObject;
}

function calculateJSHash(eventDataType, eventCategory, name) {
    var preHash = '' + eventDataType + ('' + eventCategory) + '' + (name || '');

    return mParticle.generateHash(preHash);
}

module.exports = EventHandler;
