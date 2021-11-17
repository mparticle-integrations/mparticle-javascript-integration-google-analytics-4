function EventHandler(common) {
    this.common = common || {};
}
EventHandler.prototype.logEvent = function(event) {
    var parameters = this.common.createParameters(event.EventAttributes);

    // TODO: map event name to recommended event types - https://developers.google.com/analytics/devguides/collection/ga4/reference/events
    // if the name is not mapped, it will return event.EventName
    var mappedName = this.common.mapEventName(event.EventName);

    gtag('event', mappedName, parameters);
};

EventHandler.prototype.logError = function(event) {
    console.log(event);
};
EventHandler.prototype.logPageView = function(event) {
    console.log(event);

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

module.exports = EventHandler;
