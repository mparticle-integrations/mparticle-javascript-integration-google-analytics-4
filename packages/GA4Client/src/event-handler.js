function EventHandler(common) {
    this.common = common || {};
}

EventHandler.prototype.sendEventToGA4 = function (eventName, eventAttributes) {
    gtag(
        'event',
        this.common.truncateEventName(eventName),
        this.common.truncateEventAttributes(eventAttributes)
    );
};

EventHandler.prototype.logEvent = function (event) {
    this.sendEventToGA4(event.EventName, event.EventAttributes);
};

EventHandler.prototype.logError = function () {
    console.warn('Google Analytics 4 does not support error events.');
};

EventHandler.prototype.logPageView = function (event) {
    var TITLE = 'Google.Title';
    var LOCATION = 'Google.Location';
    var pageTitle, pageLocation;

    if (event.CustomFlags && event.CustomFlags.hasOwnProperty(TITLE)) {
        pageTitle = event.CustomFlags[TITLE];
    } else {
        pageTitle = document.title;
    }

    if (event.CustomFlags && event.CustomFlags.hasOwnProperty(LOCATION)) {
        pageLocation = event.CustomFlags[LOCATION];
    } else {
        pageLocation = location.href;
    }

    var eventAttributes = this.common.mergeObjects(
        {
            page_title: pageTitle,
            page_location: pageLocation,
        },
        event.EventAttributes
    );

    this.sendEventToGA4('page_view', eventAttributes);

    return true;
};

module.exports = EventHandler;
