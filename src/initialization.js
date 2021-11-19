var initialization = {
    name: 'GoogleAnalytics4EventForwarder',
    /*  ****** Fill out initForwarder to load your SDK ******
    Note that not all arguments may apply to your SDK initialization.
    These are passed from mParticle, but leave them even if they are not being used.
    forwarderSettings contain settings that your SDK requires in order to initialize
    userAttributes example: {gender: 'male', age: 25}
    userIdentities example: { 1: 'customerId', 2: 'facebookId', 7: 'emailid@email.com' }
    additional identityTypes can be found at https://github.com/mParticle/mparticle-sdk-javascript/blob/master-v2/src/types.js#L88-L101
*/
    initForwarder: function(
        forwarderSettings,
        testMode,
        userAttributes,
        userIdentities,
        processEvent,
        eventQueue,
        isInitialized,
        common,
        appVersion,
        appName,
        customFlags,
        clientId
    ) {
        var measurementId = forwarderSettings.measurementId;
        window.dataLayer = window.dataLayer || [];

        window.gtag = function() {
            window.dataLayer.push(arguments);
        };
        if (!testMode) {
            var clientScript = document.createElement('script');
            clientScript.type = 'text/javascript';
            clientScript.async = true;
            clientScript.src =
                'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
            (
                document.getElementsByTagName('head')[0] ||
                document.getElementsByTagName('body')[0]
            ).appendChild(clientScript);

            clientScript.onload = function() {
                isInitialized = true;
                if (window.dataLayer && gtag && eventQueue.length > 0) {
                    for (var i = 0; i < eventQueue.length; i++) {
                        processEvent(eventQueue[i]);
                    }
                    eventQueue = [];
                }
            };
            gtag('js', new Date());

            gtag('config', measurementId, {});
        } else {
            isInitialized = true;
        }
    },
};

module.exports = initialization;
