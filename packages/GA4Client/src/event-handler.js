function EventHandler(common) {
    this.common = common || {};
}

EventHandler.prototype.logEvent = function (event) {
    gtag('event', event.EventName, event.EventAttributes || {});
};

EventHandler.prototype.logError = function () {
    console.warn('Google Analytics 4 does not support error events.');
};

EventHandler.prototype.logPageView = function (event) {
    var TITLE = 'GA4.Title';
    var LOCATION = 'GA4.Location';

    // These are being included for backwards compatibility from the previous Google Analytics custom flags
    var LEGACY_GA_TITLE = 'Google.Title';
    var LEGACY_GA_LOCATION = 'Google.Location';

    var pageTitle, pageLocation;

    if (event.CustomFlags && event.CustomFlags.hasOwnProperty(TITLE)) {
        pageTitle = event.CustomFlags[TITLE];
    } else if (event.CustomFlags.hasOwnProperty(LEGACY_GA_TITLE)) {
        pageTitle = event.CustomFlags[LEGACY_GA_TITLE];
    } else {
        pageTitle = document.title;
    }

    if (event.CustomFlags && event.CustomFlags.hasOwnProperty(LOCATION)) {
        pageLocation = event.CustomFlags[LOCATION];
    } else if (event.CustomFlags.hasOwnProperty(LEGACY_GA_LOCATION)) {
        pageLocation = event.CustomFlags[LEGACY_GA_LOCATION];
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

    gtag('event', 'page_view', eventAttributes);

    return true;
};

module.exports = EventHandler;
