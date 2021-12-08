function CommerceHandler(common) {
    this.common = common || {};
}

var ProductActionTypes = {
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
    ADD_PAYMENT_INFO = 'add_payment_info';
CommerceHandler.prototype.buildAddOrRemoveCartItem = function (event) {
    return {
        items: buildProductsList(event.ProductAction.ProductList),
    };
};

CommerceHandler.prototype.buildCheckout = function (event) {
    return {
        items: buildProductsList(event.ProductAction.ProductList),
        coupon: event.ProductAction ? event.ProductAction.CouponCode : null,
    };
};

CommerceHandler.prototype.buildImpression = function (impression) {
    return {
        item_list_id: impression.ProductImpressionList,
        item_list_name: impression.ProductImpressionList,
        items: buildProductsList(impression.ProductList),
    };
};

CommerceHandler.prototype.buildProductClick = function (event) {
    return {
        items: buildProductsList(event.ProductAction.ProductList),
    };
};

CommerceHandler.prototype.buildProductViewDetail = function (event) {
    return {
        items: buildProductsList(event.ProductAction.ProductList),
    };
};

CommerceHandler.prototype.buildPromotion = function (event) {
    // TODO: GA4 Promo object assumes single promo with array of products but
    //       our SDK provides an array of promos with no products
    return {
        items: buildPromoList(event.PromotionAction.PromotionList),
    };
};

CommerceHandler.prototype.buildPurchase = function (event) {
    return {
        transaction_id: event.ProductAction.TransactionId,
        value: event.ProductAction.TotalAmount,
        affiliation: event.ProductAction.Affiliation,
        coupon: event.ProductAction.CouponCode,
        shipping: event.ProductAction.ShippingAmount,
        tax: event.ProductAction.TaxAmount,
        items: buildProductsList(event.ProductAction.ProductList),
    };
};
CommerceHandler.prototype.buildRefund = function (event) {
    return {
        transaction_id: event.ProductAction.TransactionId,
        value: event.ProductAction.TotalAmount,
        affiliation: event.ProductAction.Affiliation,
        coupon: event.ProductAction.CouponCode,
        shipping: event.ProductAction.ShippingAmount,
        tax: event.ProductAction.TaxAmount,
        items: buildProductsList(event.ProductAction.ProductList),
    };
};
CommerceHandler.prototype.buildAddToWishlist = function (event) {
    return {
        value: event.ProductAction.TotalAmount,
        items: buildProductsList(event.ProductAction.ProductList),
    };
};

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

CommerceHandler.prototype.logCommerceEvent = function (event) {
    var self = this;
    var ga4CommerceEventParameters;

    if (event.EventCategory === ProductActionTypes.Impression) {
        try {
            event.ProductImpressions.forEach(function (impression) {
                var ga4ImpressionEvent = self.buildImpression(impression);

                gtag(
                    'event',
                    mapGA4EcommerceEventName(event),
                    ga4ImpressionEvent
                );
            });
        } catch (error) {
            console.log('error logging impressions', error);
            return false;
        }
        return true;
    } else if (event.EventCategory === ProductActionTypes.CheckoutOption) {
        return logCheckoutOptionEvent(event);
    } else {
        // TODO: Move this out into a pure builder function that isn't aware of "self"
        switch (event.EventCategory) {
            case ProductActionTypes.AddToCart:
            case ProductActionTypes.RemoveFromCart:
                ga4CommerceEventParameters =
                    self.buildAddOrRemoveCartItem(event);
                break;
            case ProductActionTypes.Checkout:
                ga4CommerceEventParameters = self.buildCheckout(event);
                break;
            case ProductActionTypes.Click:
                ga4CommerceEventParameters = self.buildProductClick(event);
                break;

            case ProductActionTypes.Purchase:
                ga4CommerceEventParameters = self.buildPurchase(event);
                break;
            case ProductActionTypes.Refund:
                ga4CommerceEventParameters = self.buildRefund(event);
                break;
            case ProductActionTypes.ViewDetail:
                ga4CommerceEventParameters = self.buildProductViewDetail(event);
                break;
            case ProductActionTypes.AddToWishlist:
                ga4CommerceEventParameters = self.buildAddToWishlist(event);
                break;
            case PromotionActionTypes.PromotionClick:
            case PromotionActionTypes.PromotionView:
                ga4CommerceEventParameters = self.buildPromotion(event);
                break;
            default:
                console.error('Unknown Commerce Type', event);
                return false;
        }
        ga4CommerceEventParameters.currency = event.CurrencyCode || null;

        gtag(
            'event',
            mapGA4EcommerceEventName(event),
            ga4CommerceEventParameters
        );
    }
    return true;
};

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

function buildPromoList(promotions) {
    var promotionsList = [];

    promotions.forEach(function (promotion) {
        promotionsList.push(parsePromotion(promotion));
    });

    return promotionsList;
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
            return getShippingOrPaymentEvent(event.CustomFlags);
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
        default:
            console.log('Product Action Type not supported');
            return null;
    }
}

function getShippingOrPaymentEvent(customFlags) {
    switch (customFlags[GA4_COMMERCE_EVENT_TYPE]) {
        case ADD_SHIPPING_INFO:
            return ADD_SHIPPING_INFO;
        case ADD_PAYMENT_INFO:
            return ADD_PAYMENT_INFO;
        default:
            console.log(
                'The GA4.CommerceEventType value you passed in is not supported.'
            );
            return null;
    }
}

// Google previously had a CheckoutOption event, and now this has been split into 2 GA4 events - add_shipping_info and add_payment_info
// Since MP still uses CheckoutOption, we must map this to the 2 events using custom flags
function logCheckoutOptionEvent(event) {
    try {
        var customFlags = event.CustomFlags,
            GA4CommerceEventType = customFlags[GA4_COMMERCE_EVENT_TYPE],
            ga4CommerceEventParameters;

        if (!customFlags) {
            console.error(
                'The CheckoutOption event type requires custom flags.  The event was not sent.  Please review the docs and fix.'
            );
            return false;
        }
        if (!GA4CommerceEventType) {
            console.error(
                'A custom flag of `GA4.CommerceEventType` is required for CheckoutOption events.  The event was not sent.  Please review the docs and fix.'
            );
            return false;
        }

        switch (GA4CommerceEventType) {
            case ADD_SHIPPING_INFO:
                ga4CommerceEventParameters = buildAddShippingInfo(event);
                break;
            case ADD_PAYMENT_INFO:
                ga4CommerceEventParameters = buildAddPaymentInfo(event);
                break;
            default:
                console.error(
                    'If you log a CheckoutOption commerce event, a `GA4.CommerceEventType` custom flag is required..  The event was not sent.  Please review the docs and fix.'
                );
        }
    } catch (e) {
        console.error(
            'There is an issue with the custom flags in your CheckoutOption event. The event was not sent.  Plrease review the docs and fix.'
        );
        return false;
    }

    gtag('event', mapGA4EcommerceEventName(event), ga4CommerceEventParameters);

    return true;
}

module.exports = CommerceHandler;
