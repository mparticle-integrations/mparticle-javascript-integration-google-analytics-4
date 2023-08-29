var self = this;
function CommerceHandler(common) {
    self.common = this.common = common || {};
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

    // TODO: https://mparticle-eng.atlassian.net/browse/SQDSDKS-5714
    if (this.common.forwarderSettings.enableDataCleansing) {
        ga4CommerceEventParameters = this.common.standardizeParameters(
            ga4CommerceEventParameters
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

    // TODO: https://mparticle-eng.atlassian.net/browse/SQDSDKS-5716
    if (self.common.forwarderSettings.enableDataCleansing) {
        return self.common.standardizeParameters(product);
    } else {
        return product;
    }
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

    if (self.common.forwarderSettings.enableDataCleansing) {
        return self.common.standardizeParameters(promotion);
    } else {
        return promotion;
    }
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

module.exports = CommerceHandler;
