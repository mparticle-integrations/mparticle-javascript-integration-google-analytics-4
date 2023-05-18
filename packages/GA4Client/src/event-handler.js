function EventHandler(common) {
    this.common = common || {};
}

EventHandler.prototype.sendEventToGA4 = function (eventName, eventAttributes) {
    gtag(
        'event',
        this.common.standardizeName(eventName),
        this.common.standardizeParameters(eventAttributes)
    );
};

EventHandler.prototype.logEvent = function (event) {
    this.sendEventToGA4(event.EventName, event.EventAttributes);
};

EventHandler.prototype.logError = function () {
    console.warn('Google Analytics 4 does not support error events.');
};

EventHandler.prototype.logPageView = function (event) {
    var TITLE = 'GA4.Title';
    var LOCATION = 'GA4.Location';

    // These are being included for backwards compatibility from the legacy Google Analytics custom flags
    var LEGACY_GA_TITLE = 'Google.Title';
    var LEGACY_GA_LOCATION = 'Google.Location';

    var pageLocation = location.href,
        pageTitle = document.title;

    if (event.CustomFlags) {
        if (event.CustomFlags.hasOwnProperty(TITLE)) {
            pageTitle = event.CustomFlags[TITLE];
        } else if (event.CustomFlags.hasOwnProperty(LEGACY_GA_TITLE)) {
            pageTitle = event.CustomFlags[LEGACY_GA_TITLE];
        }

        if (event.CustomFlags.hasOwnProperty(LOCATION)) {
            pageLocation = event.CustomFlags[LOCATION];
        } else if (event.CustomFlags.hasOwnProperty(LEGACY_GA_LOCATION)) {
            pageLocation = event.CustomFlags[LEGACY_GA_LOCATION];
        }
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
