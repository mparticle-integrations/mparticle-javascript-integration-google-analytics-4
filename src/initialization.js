var initialization = {
    name: 'insertSDKNameHere',
/*  ****** Fill out initForwarder to load your SDK ******
    Note that not all arguments may apply to your SDK initialization.
    These are passed from mParticle, but leave them even if they are not being used.
    forwarderSettings contain settings that your SDK requires in order to initialize
    userAttributes example: {gender: 'male', age: 25}
    userIdentities example: { 1: 'customerId', 2: 'facebookId', 7: 'emailid@email.com' }
    additional identityTypes can be found at https://github.com/mParticle/mparticle-sdk-javascript/blob/master-v2/src/types.js#L88-L101
*/
    initForwarder: function(forwarderSettings, testMode, userAttributes, userIdentities, processEvent, eventQueue, isInitialized, common, appVersion, appName, customFlags, clientId) {
        /* `forwarderSettings` contains your SDK specific settings such as apiKey that your customer needs in order to initialize your SDK properly */

        if (!testMode) {
            /* Load your Web SDK here using a variant of your snippet from your readme that your customers would generally put into their <head> tags
               Generally, our integrations create script tags and append them to the <head>. Please follow the following format as a guide:
            */

            // var clientScript = document.createElement('script');
            // clientScript.type = 'text/javascript';
            // clientScript.async = true;
            // clientScript.src = 'https://www.clientscript.com/static/clientSDK.js';   // <---- Update this to be your script
            // (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(clientScript);
            // clientScript.onload = function() {
            //     if (clientSDKObject && eventQueue.length > 0) {
            //         // Process any events that may have been queued up while forwarder was being initialized.
            //         for (var i = 0; i < eventQueue.length; i++) {
            //             processEvent(eventQueue[i]);
            //         }
            //          // now that each queued event is processed, we empty the eventQueue
            //         eventQueue = [];
            //     }
            //    clientSDKObject.initialize(forwarderSettings.apiKey);
            // };
        } else {
            // For testing, you should fill out this section in order to ensure any required initialization calls are made,
            // clientSDKObject.initialize(forwarderSettings.apiKey)
        }
    }
};

module.exports = initialization;
