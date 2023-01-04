'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// Google requires event and user attribute strings to have specific limits
// in place when sending to data layer.
// https://support.google.com/analytics/answer/9267744?hl=en

var EVENT_NAME_MAX_LENGTH = 40;
var EVENT_ATTRIBUTE_KEY_MAX_LENGTH = 40;
var EVENT_ATTRIBUTE_VAL_MAX_LENGTH = 100;
var USER_ATTRIBUTE_KEY_MAX_LENGTH = 24;
var USER_ATTRIBUTE_VALUE_MAX_LENGTH = 36;

function truncateString(string, limit) {
    return !!string && string.length > limit
        ? string.substring(0, limit)
        : string;
}

function Common() {}

Common.prototype.forwarderSettings = null;

Common.prototype.mergeObjects = function () {
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

Common.prototype.truncateAttributes = function (
    attributes,
    keyLimit,
    valueLimit
) {
    var truncatedAttributes = {};

    Object.keys(attributes).forEach(function (attribute) {
        var key = truncateString(attribute, keyLimit);
        var val = truncateString(attributes[attribute], valueLimit);
        truncatedAttributes[key] = val;
    });

    return truncatedAttributes;
};

Common.prototype.truncateEventName = function (eventName) {
    return truncateString(eventName, EVENT_NAME_MAX_LENGTH);
};

Common.prototype.truncateEventAttributes = function (eventAttributes) {
    return this.truncateAttributes(
        eventAttributes,
        EVENT_ATTRIBUTE_KEY_MAX_LENGTH,
        EVENT_ATTRIBUTE_VAL_MAX_LENGTH
    );
};

Common.prototype.truncateUserAttributes = function (userAttributes) {
    return this.truncateAttributes(
        userAttributes,
        USER_ATTRIBUTE_KEY_MAX_LENGTH,
        USER_ATTRIBUTE_VALUE_MAX_LENGTH
    );
};

Common.prototype.getUserId = function (
    user,
    externalUserIdentityType,
    hashUserId
) {
    if (!user) {
        return;
    }

    var externalUserIdentityTypes = {
        none: 'None',
        customerId: 'CustomerId',
        other: 'Other',
        other2: 'Other2',
        other3: 'Other3',
        other4: 'Other4',
        other5: 'Other5',
        other6: 'Other6',
        other7: 'Other7',
        other8: 'Other8',
        other9: 'Other9',
        other10: 'Other10',
        mpid: 'mpid',
    };

    var userId,
        userIdentities = user.getUserIdentities().userIdentities;
    if (externalUserIdentityType !== externalUserIdentityTypes.none) {
        switch (externalUserIdentityType) {
            case 'CustomerId':
                userId = userIdentities.customerid;
                break;
            case externalUserIdentityTypes.other:
                userId = userIdentities.other;
                break;
            case externalUserIdentityTypes.other2:
                userId = userIdentities.other2;
                break;
            case externalUserIdentityTypes.other3:
                userId = userIdentities.other3;
                break;
            case externalUserIdentityTypes.other4:
                userId = userIdentities.other4;
                break;
            case externalUserIdentityTypes.other5:
                userId = userIdentities.other5;
                break;
            case externalUserIdentityTypes.other6:
                userId = userIdentities.other6;
                break;
            case externalUserIdentityTypes.other7:
                userId = userIdentities.other7;
                break;
            case externalUserIdentityTypes.other8:
                userId = userIdentities.other8;
                break;
            case externalUserIdentityTypes.other9:
                userId = userIdentities.other9;
                break;
            case externalUserIdentityTypes.other10:
                userId = userIdentities.other10;
                break;
            case externalUserIdentityTypes.mpid:
                userId = user.getMPID();
                break;
            default:
                console.warn(
                    'External identity type not found for setting identity on ' +
                        'GA4' +
                        '. User not set. Please double check your implementation.'
                );
        }
        if (userId) {
            if (hashUserId == 'True') {
                userId = window.mParticle.generateHash(userId);
            }
        } else {
            console.warn(
                'External identity type of ' +
                    externalUserIdentityType +
                    ' not set on the user'
            );
        }
        return userId;
    }
};

var common = Common;

function CommerceHandler(common) {
    this.common = common || {};
}

var ProductActionTypes = {
    Unknown: 0,
    AddToCart: 10,
    Click: 14,
    Checkout: 12,
    CheckoutOption: 13,
    Impression: 22,
    Purchase: 16,
    Refund: 17,
    RemoveFromCart: 11,
    ViewDetail: 15,
    AddToWishlist: 20,
};

var PromotionActionTypes = {
    PromotionClick: 19,
    PromotionView: 18,
};

// Custom Flags
var GA4_COMMERCE_EVENT_TYPE = 'GA4.CommerceEventType',
    GA4_SHIPPING_TIER = 'GA4.ShippingTier',
    GA4_PAYMENT_TYPE = 'GA4.PaymentType';

var ADD_SHIPPING_INFO = 'add_shipping_info',
    ADD_PAYMENT_INFO = 'add_payment_info',
    VIEW_CART = 'view_cart';

CommerceHandler.prototype.logCommerceEvent = function (event) {
    var needsCurrency = true,
        needsValue = true,
        ga4CommerceEventParameters,
        isViewCartEvent = false;

    // GA4 has a view_cart event which MP does not support via a ProductActionType
    // In order to log a view_cart event, pass ProductActionType.Unknown along with
    // the proper custom flag
    // Unknown ProductActionTypes without a custom flag will reach the switch statement
    // below and throw an error to the customer
    if (event.EventCategory === ProductActionTypes.Unknown) {
        if (
            event.CustomFlags &&
            event.CustomFlags[GA4_COMMERCE_EVENT_TYPE] === VIEW_CART
        ) {
            isViewCartEvent = true;
            return logViewCart(event);
        }
    }
    // Handle Impressions
    if (event.EventCategory === ProductActionTypes.Impression) {
        return logImpressionEvent(event);
        // Handle Promotions
    } else if (
        event.EventCategory === PromotionActionTypes.PromotionClick ||
        event.EventCategory === PromotionActionTypes.PromotionView
    ) {
        return logPromotionEvent(event);
    }

    ga4CommerceEventParameters = buildParameters(event);
    if (event.EventAttributes) {
        ga4CommerceEventParameters = this.common.mergeObjects(
            ga4CommerceEventParameters,
            event.EventAttributes
        );
    }

    switch (event.EventCategory) {
        case ProductActionTypes.AddToCart:
        case ProductActionTypes.RemoveFromCart:
            ga4CommerceEventParameters = buildAddOrRemoveCartItem(event);
            break;
        case ProductActionTypes.Checkout:
            ga4CommerceEventParameters = buildCheckout(event);
            break;
        case ProductActionTypes.Click:
            ga4CommerceEventParameters = buildSelectItem(event);

            needsCurrency = false;
            needsValue = false;
            break;
        case ProductActionTypes.Purchase:
            ga4CommerceEventParameters = buildPurchase(event);
            break;
        case ProductActionTypes.Refund:
            ga4CommerceEventParameters = buildRefund(event);
            break;
        case ProductActionTypes.ViewDetail:
            ga4CommerceEventParameters = buildViewItem(event);
            break;
        case ProductActionTypes.AddToWishlist:
            ga4CommerceEventParameters = buildAddToWishlist(event);
            break;

        case ProductActionTypes.CheckoutOption:
            return logCheckoutOptionEvent(event);

        default:
            // a view cart event is handled at the beginning of this function
            if (!isViewCartEvent) {
                console.error(
                    'Unsupported Commerce Event. Event not sent.',
                    event
                );
                return false;
            }
    }

    // CheckoutOption, Promotions, and Impressions will not make it to this code
    if (needsCurrency) {
        ga4CommerceEventParameters.currency = event.CurrencyCode;
    }

    if (needsValue) {
        ga4CommerceEventParameters.value =
            (event.CustomFlags && event.CustomFlags['GA4.Value']) ||
            event.ProductAction.TotalAmount ||
            null;
    }

    gtag('event', mapGA4EcommerceEventName(event), ga4CommerceEventParameters);
    return true;
};

function buildParameters(event) {
    return {
        items: buildProductsList(event.ProductAction.ProductList),
        coupon: event.ProductAction ? event.ProductAction.CouponCode : null,
    };
}

function buildAddOrRemoveCartItem(event) {
    return {
        items: buildProductsList(event.ProductAction.ProductList),
    };
}

function buildCheckout(event) {
    return {
        items: buildProductsList(event.ProductAction.ProductList),
        coupon: event.ProductAction ? event.ProductAction.CouponCode : null,
    };
}

function buildCheckoutOptions(event) {
    var parameters = event.EventAttributes;
    parameters.items = buildProductsList(event.ProductAction.ProductList);
    parameters.coupon = event.ProductAction
        ? event.ProductAction.CouponCode
        : null;

    return parameters;
}

function parseImpression(impression) {
    return {
        item_list_id: impression.ProductImpressionList,
        item_list_name: impression.ProductImpressionList,
        items: buildProductsList(impression.ProductList),
    };
}

function buildSelectItem(event) {
    return {
        items: buildProductsList(event.ProductAction.ProductList),
    };
}

function buildViewItem(event) {
    return {
        items: buildProductsList(event.ProductAction.ProductList),
    };
}

function buildPromotion(promotion) {
    return parsePromotion(promotion);
}

function buildPurchase(event) {
    return {
        transaction_id: event.ProductAction.TransactionId,
        value: event.ProductAction.TotalAmount,
        affiliation: event.ProductAction.Affiliation,
        coupon: event.ProductAction.CouponCode,
        shipping: event.ProductAction.ShippingAmount,
        tax: event.ProductAction.TaxAmount,
        items: buildProductsList(event.ProductAction.ProductList),
    };
}
function buildRefund(event) {
    return {
        transaction_id: event.ProductAction.TransactionId,
        value: event.ProductAction.TotalAmount,
        affiliation: event.ProductAction.Affiliation,
        coupon: event.ProductAction.CouponCode,
        shipping: event.ProductAction.ShippingAmount,
        tax: event.ProductAction.TaxAmount,
        items: buildProductsList(event.ProductAction.ProductList),
    };
}
function buildAddToWishlist(event) {
    return {
        value: event.ProductAction.TotalAmount,
        items: buildProductsList(event.ProductAction.ProductList),
    };
}

function buildAddShippingInfo(event) {
    return {
        coupon:
            event.ProductAction && event.ProductAction.CouponCode
                ? event.ProductAction.CouponCode
                : null,
        shipping_tier:
            event.CustomFlags && event.CustomFlags[GA4_SHIPPING_TIER]
                ? event.CustomFlags[GA4_SHIPPING_TIER]
                : null,
        items: buildProductsList(event.ProductAction.ProductList),
    };
}

function buildAddPaymentInfo(event) {
    return {
        coupon:
            event.ProductAction && event.ProductAction.CouponCode
                ? event.ProductAction.CouponCode
                : null,
        payment_type:
            event.CustomFlags && event.CustomFlags[GA4_PAYMENT_TYPE]
                ? event.CustomFlags[GA4_PAYMENT_TYPE]
                : null,
        items: buildProductsList(event.ProductAction.ProductList),
    };
}

// Utility function
function toUnderscore(string) {
    return string
        .split(/(?=[A-Z])/)
        .join('_')
        .toLowerCase();
}

function parseProduct(_product) {
    var product = {};

    for (var key in _product) {
        switch (key) {
            case 'Sku':
                product.item_id = _product.Sku;
                break;
            case 'Name':
                product.item_name = _product.Name;
                break;
            case 'Brand':
                product.item_brand = _product.Brand;
                break;
            case 'Category':
                product.item_category = _product.Category;
                break;
            case 'Variant':
                product.item_variant = _product.Variant;
                break;
            default:
                product[toUnderscore(key)] = _product[key];
        }
    }

    return product;
}

function parsePromotion(_promotion) {
    var promotion = {};

    for (var key in _promotion) {
        switch (key) {
            case 'Id':
                promotion.promotion_id = _promotion.Id;
                break;
            case 'Creative':
                promotion.creative_name = _promotion.Creative;
                break;
            case 'Name':
                promotion.promotion_name = _promotion.Name;
                break;
            case 'Position':
                promotion.creative_slot = _promotion.Position;
                break;
            default:
                promotion[toUnderscore(key)] = _promotion[key];
        }
    }

    return promotion;
}

function buildProductsList(products) {
    var productsList = [];

    products.forEach(function (product) {
        productsList.push(parseProduct(product));
    });

    return productsList;
}

function mapGA4EcommerceEventName(event) {
    switch (event.EventCategory) {
        case ProductActionTypes.AddToCart:
            return 'add_to_cart';
        case ProductActionTypes.AddToWishlist:
            return 'add_to_wishlist';
        case ProductActionTypes.RemoveFromCart:
            return 'remove_from_cart';
        case ProductActionTypes.Purchase:
            return 'purchase';
        case ProductActionTypes.Checkout:
            return 'begin_checkout';
        case ProductActionTypes.CheckoutOption:
            return getCheckoutOptionEventName(event.CustomFlags);
        case ProductActionTypes.Click:
            return 'select_item';
        case ProductActionTypes.Impression:
            return 'view_item_list';
        case ProductActionTypes.Refund:
            return 'refund';
        case ProductActionTypes.ViewDetail:
            return 'view_item';
        case PromotionActionTypes.PromotionClick:
            return 'select_promotion';
        case PromotionActionTypes.PromotionView:
            return 'view_promotion';
        case ProductActionTypes.Unknown:
            if (
                event.CustomFlags &&
                event.CustomFlags[GA4_COMMERCE_EVENT_TYPE] === VIEW_CART
            ) {
                return 'view_cart';
            }
            break;
        default:
            console.error('Product Action Type not supported');
            return null;
    }
}

function getCheckoutOptionEventName(customFlags) {
    switch (customFlags[GA4_COMMERCE_EVENT_TYPE]) {
        case ADD_SHIPPING_INFO:
            return ADD_SHIPPING_INFO;
        case ADD_PAYMENT_INFO:
            return ADD_PAYMENT_INFO;
        default:
            return 'set_checkout_option';
    }
}

// Google previously had a CheckoutOption event, and now this has been split into 2 GA4 events - add_shipping_info and add_payment_info
// Since MP still uses CheckoutOption, we must map this to the 2 events using custom flags.  To prevent any data loss from customers
// migrating from UA to GA4, we will set a default `set_checkout_option` which matches Firebase's data model.
function logCheckoutOptionEvent(event) {
    try {
        var customFlags = event.CustomFlags,
            GA4CommerceEventType = customFlags[GA4_COMMERCE_EVENT_TYPE],
            ga4CommerceEventParameters;

        // if no custom flags exist or there is no GA4CommerceEventType, the user has not updated their code from using legacy GA which still supports checkout_option
        if (!customFlags || !GA4CommerceEventType) {
            console.error(
                'Your checkout option event for the Google Analytics 4 integration is missing a custom flag for "GA4.CommerceEventType". The event was sent using the deprecated set_checkout_option event.  Review mParticle docs for GA4 for the custom flags to add.'
            );
        }

        switch (GA4CommerceEventType) {
            case ADD_SHIPPING_INFO:
                ga4CommerceEventParameters = buildAddShippingInfo(event);
                break;
            case ADD_PAYMENT_INFO:
                ga4CommerceEventParameters = buildAddPaymentInfo(event);
                break;
            default:
                ga4CommerceEventParameters = buildCheckoutOptions(event);
                break;
        }
    } catch (error) {
        console.error(
            'There is an issue with the custom flags in your CheckoutOption event. The event was not sent.  Plrease review the docs and fix.',
            error
        );
        return false;
    }

    gtag('event', mapGA4EcommerceEventName(event), ga4CommerceEventParameters);

    return true;
}

function logPromotionEvent(event) {
    try {
        var ga4CommerceEventParameters;
        event.PromotionAction.PromotionList.forEach(function (promotion) {
            ga4CommerceEventParameters = buildPromotion(promotion);
            gtag(
                'event',
                mapGA4EcommerceEventName(event),
                ga4CommerceEventParameters
            );
        });
        return true;
    } catch (error) {
        console.error(
            'Error logging Promotions to GA4. Promotions not logged.',
            error
        );
    }
    return false;
}

function logImpressionEvent(event) {
    try {
        var ga4CommerceEventParameters;
        event.ProductImpressions.forEach(function (impression) {
            ga4CommerceEventParameters = parseImpression(impression);

            gtag(
                'event',
                mapGA4EcommerceEventName(event),
                ga4CommerceEventParameters
            );
        });
    } catch (error) {
        console.log(
            'Error logging Impressions to GA4. Impressions not logged',
            error
        );
        return false;
    }
    return true;
}

function logViewCart(event) {
    var ga4CommerceEventParameters = buildViewCart(event);
    ga4CommerceEventParameters.currency = event.CurrencyCode;

    ga4CommerceEventParameters.value =
        (event.CustomFlags && event.CustomFlags['GA4.Value']) ||
        event.ProductAction.TotalAmount ||
        null;
    gtag('event', mapGA4EcommerceEventName(event), ga4CommerceEventParameters);
    return true;
}

function buildViewCart(event) {
    return {
        items: buildProductsList(event.ProductAction.ProductList),
    };
}

var commerceHandler = CommerceHandler;

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

var eventHandler = EventHandler;

/*
The 'mParticleUser' is an object with methods get user Identities and set/get user attributes
Partners can determine what userIds are available to use in their SDK
Call mParticleUser.getUserIdentities() to return an object of userIdentities --> { userIdentities: {customerid: '1234', email: 'email@gmail.com'} }
For more identity types, see http://docs.mparticle.com/developers/sdk/javascript/identity#allowed-identity-types
Call mParticleUser.getMPID() to get mParticle ID
For any additional methods, see http://docs.mparticle.com/developers/sdk/javascript/apidocs/classes/mParticle.Identity.getCurrentUser().html
*/

/*
identityApiRequest has the schema:
{
  userIdentities: {
    customerid: '123',
    email: 'abc'
  }
}
For more userIdentity types, see http://docs.mparticle.com/developers/sdk/javascript/identity#allowed-identity-types
*/

function IdentityHandler(common) {
    this.common = common || {};
}
IdentityHandler.prototype.onUserIdentified = function (mParticleUser) {
    var userId = this.common.getUserId(
        mParticleUser,
        this.common.forwarderSettings.externalUserIdentityType,
        this.common.forwarderSettings.hashUserId
    );
    gtag('config', this.common.forwarderSettings.measurementId, {
        // do not send a page view when updating the userid in an identity call
        send_page_view: false,
        user_id: userId,
    });
};
IdentityHandler.prototype.onIdentifyComplete = function (
    mParticleUser,
    identityApiRequest
) {};
IdentityHandler.prototype.onLoginComplete = function (
    mParticleUser,
    identityApiRequest
) {};
IdentityHandler.prototype.onLogoutComplete = function (
    mParticleUser,
    identityApiRequest
) {};
IdentityHandler.prototype.onModifyComplete = function (
    mParticleUser,
    identityApiRequest
) {};

/*  In previous versions of the mParticle web SDK, setting user identities on
    kits is only reachable via the onSetUserIdentity method below. We recommend
    filling out `onSetUserIdentity` for maximum compatibility
*/
IdentityHandler.prototype.onSetUserIdentity = function (
    forwarderSettings,
    id,
    type
) {};

var identityHandler = IdentityHandler;

var initialization = {
    name: 'GoogleAnalytics4',
    /*  ****** Fill out initForwarder to load your SDK ******
    Note that not all arguments may apply to your SDK initialization.
    These are passed from mParticle, but leave them even if they are not being used.
    forwarderSettings contain settings that your SDK requires in order to initialize
    userAttributes example: {gender: 'male', age: 25}
    userIdentities example: { 1: 'customerId', 2: 'facebookId', 7: 'emailid@email.com' }
    additional identityTypes can be found at https://github.com/mParticle/mparticle-sdk-javascript/blob/master-v2/src/types.js#L88-L101
*/
    initForwarder: function (
        forwarderSettings,
        testMode,
        userAttributes,
        userIdentities,
        processEvent,
        eventQueue,
        isInitialized,
        common
    ) {
        common.forwarderSettings = forwarderSettings;
        var measurementId = forwarderSettings.measurementId;
        var userIdType = forwarderSettings.externalUserIdentityType;
        var hashUserId = forwarderSettings.hashUserId;
        var configSettings = {
            send_page_view: forwarderSettings.enablePageView === 'True',
        };
        window.dataLayer = window.dataLayer || [];

        window.gtag = function () {
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

            clientScript.onload = function () {
                gtag('js', new Date());

                if (window.mParticle.getVersion().split('.')[0] === '2') {
                    var userId = common.getUserId(
                        mParticle.Identity.getCurrentUser(),
                        userIdType,
                        hashUserId
                    );
                    if (userId) {
                        configSettings.user_id = userId;
                    }
                }
                gtag('config', measurementId, configSettings);
                isInitialized = true;

                if (window.dataLayer && gtag && eventQueue.length > 0) {
                    for (var i = 0; i < eventQueue.length; i++) {
                        processEvent(eventQueue[i]);
                    }
                    eventQueue = [];
                }
            };
        } else {
            isInitialized = true;
        }
        return isInitialized;
    },
};

var initialization_1 = initialization;

var sessionHandler = {
    onSessionStart: function(event) {
        
    },
    onSessionEnd: function(event) {

    }
};

var sessionHandler_1 = sessionHandler;

function UserAttributeHandler(common) {
    this.common = common || {};
}

UserAttributeHandler.prototype.sendUserPropertiesToGA4 = function (
    userAttributes
) {
    gtag(
        'set',
        'user_properties',
        this.common.truncateUserAttributes(userAttributes)
    );
};

// `mParticleUser` was removed from the function signatures onRemoveUserAttribute, onSetUserAttribute, and onConsentStateUpload because they were not being used
// In the future if mParticleUser is ever required for an implementation of any of the below APIs, see https://github.com/mparticle-integrations/mparticle-javascript-integration-example/blob/master/src/user-attribute-handler.js
// for previous function signatures

UserAttributeHandler.prototype.onRemoveUserAttribute = function (key) {
    var userAttributes = {};
    userAttributes[key] = null;
    this.sendUserPropertiesToGA4(userAttributes);
};

UserAttributeHandler.prototype.onSetUserAttribute = function (key, value) {
    var userAttributes = {};
    userAttributes[key] = value;
    this.sendUserPropertiesToGA4(userAttributes);
};

// TODO: Commenting this out for now because Integrations PM still determining if this is in scope or not
// UserAttributeHandler.prototype.onConsentStateUpdated = function() // oldState,
// newState,
// mParticleUser
// {};

var userAttributeHandler = UserAttributeHandler;

// =============== REACH OUT TO MPARTICLE IF YOU HAVE ANY QUESTIONS ===============
//
//  Copyright 2018 mParticle, Inc.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.









var name = initialization_1.name,
    moduleId = initialization_1.moduleId,
    MessageType = {
        SessionStart: 1,
        SessionEnd: 2,
        PageView: 3,
        PageEvent: 4,
        CrashReport: 5,
        OptOut: 6,
        Commerce: 16,
        Media: 20,
    };

var constructor = function() {
    var self = this,
        isInitialized = false,
        forwarderSettings,
        reportingService,
        eventQueue = [];

    self.name = initialization_1.name;
    self.moduleId = initialization_1.moduleId;
    self.common = new common();

    function initForwarder(
        settings,
        service,
        testMode,
        trackerId,
        userAttributes,
        userIdentities,
        appVersion,
        appName,
        customFlags,
        clientId
    ) {
        forwarderSettings = settings;

        if (
            typeof window !== 'undefined' &&
            window.mParticle.isTestEnvironment
        ) {
            reportingService = function() {};
        } else {
            reportingService = service;
        }

        try {
            initialization_1.initForwarder(
                settings,
                testMode,
                userAttributes,
                userIdentities,
                processEvent,
                eventQueue,
                isInitialized,
                self.common,
                appVersion,
                appName,
                customFlags,
                clientId
            );
            self.eventHandler = new eventHandler(self.common);
            self.identityHandler = new identityHandler(self.common);
            self.userAttributeHandler = new userAttributeHandler(self.common);
            self.commerceHandler = new commerceHandler(self.common);

            isInitialized = true;
        } catch (e) {
            console.log('Failed to initialize ' + name + ' - ' + e);
        }
    }

    function processEvent(event) {
        var reportEvent = false;
        if (isInitialized) {
            try {
                if (event.EventDataType === MessageType.SessionStart) {
                    reportEvent = logSessionStart(event);
                } else if (event.EventDataType === MessageType.SessionEnd) {
                    reportEvent = logSessionEnd(event);
                } else if (event.EventDataType === MessageType.CrashReport) {
                    reportEvent = logError(event);
                } else if (event.EventDataType === MessageType.PageView) {
                    reportEvent = logPageView(event);
                } else if (event.EventDataType === MessageType.Commerce) {
                    reportEvent = logEcommerceEvent(event);
                } else if (event.EventDataType === MessageType.PageEvent) {
                    reportEvent = logEvent(event);
                } else if (event.EventDataType === MessageType.Media) {
                    // Kits should just treat Media Events as generic Events
                    reportEvent = logEvent(event);
                }
                if (reportEvent === true && reportingService) {
                    reportingService(self, event);
                    return 'Successfully sent to ' + name;
                } else {
                    return (
                        'Error logging event or event type not supported on forwarder ' +
                        name
                    );
                }
            } catch (e) {
                return 'Failed to send to ' + name + ' ' + e;
            }
        } else {
            eventQueue.push(event);
            return (
                "Can't send to forwarder " +
                name +
                ', not initialized. Event added to queue.'
            );
        }
    }

    function logSessionStart(event) {
        try {
            sessionHandler_1.onSessionStart(event);
            return true;
        } catch (e) {
            return {
                error: 'Error starting session on forwarder ' + name + '; ' + e,
            };
        }
    }

    function logSessionEnd(event) {
        try {
            sessionHandler_1.onSessionEnd(event);
            return true;
        } catch (e) {
            return {
                error: 'Error ending session on forwarder ' + name + '; ' + e,
            };
        }
    }

    function logError(event) {
        try {
            self.eventHandler.logError(event);
            return true;
        } catch (e) {
            return {
                error: 'Error logging error on forwarder ' + name + '; ' + e,
            };
        }
    }

    function logPageView(event) {
        try {
            self.eventHandler.logPageView(event);
            return true;
        } catch (e) {
            return {
                error:
                    'Error logging page view on forwarder ' + name + '; ' + e,
            };
        }
    }

    function logEvent(event) {
        try {
            self.eventHandler.logEvent(event);
            return true;
        } catch (e) {
            return {
                error: 'Error logging event on forwarder ' + name + '; ' + e,
            };
        }
    }

    function logEcommerceEvent(event) {
        try {
            self.commerceHandler.logCommerceEvent(event);
            return true;
        } catch (e) {
            return {
                error:
                    'Error logging purchase event on forwarder ' +
                    name +
                    '; ' +
                    e,
            };
        }
    }

    function setUserAttribute(key, value) {
        if (isInitialized) {
            try {
                self.userAttributeHandler.onSetUserAttribute(
                    key,
                    value,
                    forwarderSettings
                );
                return 'Successfully set user attribute on forwarder ' + name;
            } catch (e) {
                return (
                    'Error setting user attribute on forwarder ' +
                    name +
                    '; ' +
                    e
                );
            }
        } else {
            return (
                "Can't set user attribute on forwarder " +
                name +
                ', not initialized'
            );
        }
    }

    function removeUserAttribute(key) {
        if (isInitialized) {
            try {
                self.userAttributeHandler.onRemoveUserAttribute(
                    key,
                    forwarderSettings
                );
                return (
                    'Successfully removed user attribute on forwarder ' + name
                );
            } catch (e) {
                return (
                    'Error removing user attribute on forwarder ' +
                    name +
                    '; ' +
                    e
                );
            }
        } else {
            return (
                "Can't remove user attribute on forwarder " +
                name +
                ', not initialized'
            );
        }
    }

    function setUserIdentity(id, type) {
        if (isInitialized) {
            try {
                self.identityHandler.onSetUserIdentity(
                    forwarderSettings,
                    id,
                    type
                );
                return 'Successfully set user Identity on forwarder ' + name;
            } catch (e) {
                return (
                    'Error removing user attribute on forwarder ' +
                    name +
                    '; ' +
                    e
                );
            }
        } else {
            return (
                "Can't call setUserIdentity on forwarder " +
                name +
                ', not initialized'
            );
        }
    }

    function onUserIdentified(user) {
        if (isInitialized) {
            try {
                self.identityHandler.onUserIdentified(user);

                return (
                    'Successfully called onUserIdentified on forwarder ' + name
                );
            } catch (e) {
                return {
                    error:
                        'Error calling onUserIdentified on forwarder ' +
                        name +
                        '; ' +
                        e,
                };
            }
        } else {
            return (
                "Can't set new user identities on forwader  " +
                name +
                ', not initialized'
            );
        }
    }

    function onIdentifyComplete(user, filteredIdentityRequest) {
        if (isInitialized) {
            try {
                self.identityHandler.onIdentifyComplete(
                    user,
                    filteredIdentityRequest
                );

                return (
                    'Successfully called onIdentifyComplete on forwarder ' +
                    name
                );
            } catch (e) {
                return {
                    error:
                        'Error calling onIdentifyComplete on forwarder ' +
                        name +
                        '; ' +
                        e,
                };
            }
        } else {
            return (
                "Can't call onIdentifyCompleted on forwader  " +
                name +
                ', not initialized'
            );
        }
    }

    function onLoginComplete(user, filteredIdentityRequest) {
        if (isInitialized) {
            try {
                self.identityHandler.onLoginComplete(
                    user,
                    filteredIdentityRequest
                );

                return (
                    'Successfully called onLoginComplete on forwarder ' + name
                );
            } catch (e) {
                return {
                    error:
                        'Error calling onLoginComplete on forwarder ' +
                        name +
                        '; ' +
                        e,
                };
            }
        } else {
            return (
                "Can't call onLoginComplete on forwader  " +
                name +
                ', not initialized'
            );
        }
    }

    function onLogoutComplete(user, filteredIdentityRequest) {
        if (isInitialized) {
            try {
                self.identityHandler.onLogoutComplete(
                    user,
                    filteredIdentityRequest
                );

                return (
                    'Successfully called onLogoutComplete on forwarder ' + name
                );
            } catch (e) {
                return {
                    error:
                        'Error calling onLogoutComplete on forwarder ' +
                        name +
                        '; ' +
                        e,
                };
            }
        } else {
            return (
                "Can't call onLogoutComplete on forwader  " +
                name +
                ', not initialized'
            );
        }
    }

    function onModifyComplete(user, filteredIdentityRequest) {
        if (isInitialized) {
            try {
                self.identityHandler.onModifyComplete(
                    user,
                    filteredIdentityRequest
                );

                return (
                    'Successfully called onModifyComplete on forwarder ' + name
                );
            } catch (e) {
                return {
                    error:
                        'Error calling onModifyComplete on forwarder ' +
                        name +
                        '; ' +
                        e,
                };
            }
        } else {
            return (
                "Can't call onModifyComplete on forwader  " +
                name +
                ', not initialized'
            );
        }
    }

    function setOptOut(isOptingOutBoolean) {
        if (isInitialized) {
            try {
                self.initialization.setOptOut(isOptingOutBoolean);

                return 'Successfully called setOptOut on forwarder ' + name;
            } catch (e) {
                return {
                    error:
                        'Error calling setOptOut on forwarder ' +
                        name +
                        '; ' +
                        e,
                };
            }
        } else {
            return (
                "Can't call setOptOut on forwader  " +
                name +
                ', not initialized'
            );
        }
    }

    this.init = initForwarder;
    this.process = processEvent;
    this.setUserAttribute = setUserAttribute;
    this.removeUserAttribute = removeUserAttribute;
    this.onUserIdentified = onUserIdentified;
    this.setUserIdentity = setUserIdentity;
    this.onIdentifyComplete = onIdentifyComplete;
    this.onLoginComplete = onLoginComplete;
    this.onLogoutComplete = onLogoutComplete;
    this.onModifyComplete = onModifyComplete;
    this.setOptOut = setOptOut;
};

function getId() {
    return moduleId;
}

function isObject(val) {
    return (
        val != null && typeof val === 'object' && Array.isArray(val) === false
    );
}

function register(config) {
    if (!config) {
        console.log(
            'You must pass a config object to register the kit ' + name
        );
        return;
    }

    if (!isObject(config)) {
        console.log(
            "'config' must be an object. You passed in a " + typeof config
        );
        return;
    }

    if (isObject(config.kits)) {
        config.kits[name] = {
            constructor: constructor,
        };
    } else {
        config.kits = {};
        config.kits[name] = {
            constructor: constructor,
        };
    }
    console.log(
        'Successfully registered ' + name + ' to your mParticle configuration'
    );
}

if (typeof window !== 'undefined') {
    if (window && window.mParticle && window.mParticle.addForwarder) {
        window.mParticle.addForwarder({
            name: name,
            constructor: constructor,
            getId: getId,
        });
    }
}

var webKitWrapper = {
    register: register,
};
var webKitWrapper_1 = webKitWrapper.register;

exports.default = webKitWrapper;
exports.register = webKitWrapper_1;
