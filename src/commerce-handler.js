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

CommerceHandler.prototype.buildAddOrRemoveCartItem = function (event) {
    return {
        // TODO: What should the value of an add to cart be? Sum of the dollar amounts of items?
        // value: event.ProductAction.
        items: buildProductsList(event.ProductAction.ProductList),
    };
};

CommerceHandler.prototype.buildCheckout = function (event) {
    return {
        // TODO: What should the value of an add to cart be? Sum of the dollar amounts of items?
        // value: event.ProductAction.
        items: buildProductsList(event.ProductAction.ProductList),
        coupon: event.ProductAction ? event.ProductAction.CouponCode : null,
    };
};

// TODO: For legacy GA, they only had 1 checkout option, but now they have 2 checkout options.
// 1. add_shipping_info
// 2. add_Payment_info
// We will likely have to provide a custom flag

// CommerceHandler.prototype.buildCheckoutOption = function(event) {
//     return {
//         // TODO: FIGURE OUT HOW CHECKOUT OPTION NOW MAPS FROM MPARTICLE GIVEN GA4 HAS 2 DIFFERENT CHECKOUT OPTIONS - https://support.google.com/analytics/answer/10119380?hl=en
//         // add_shipping_info & add_payment_info
//         items: buildProductsList(event.ProductAction.ProductList),
//         coupon: event.ProductAction ? event.ProductAction.CouponCode : null,
//     };
// };

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
        value: event.ProductAction.TotalAmount,
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

CommerceHandler.prototype.logCommerceEvent = function (event) {
    var self = this;
    var ga4CommerceEventParameters;

    if (event.EventCategory === ProductActionTypes.Impression) {
        try {
            event.ProductImpressions.forEach(function (impression) {
                var ga4ImpressionEvent = self.buildImpression(impression);

                gtag(
                    'event',
                    mapGA4EcommerceEventName(event.EventCategory),
                    ga4ImpressionEvent
                );
            });
        } catch (error) {
            console.log('error logging impressions', error);
            return false;
        }
        return true;
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
            case ProductActionTypes.CheckoutOption:
                ga4CommerceEventParameters = self.buildCheckoutOption(event);
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
            mapGA4EcommerceEventName(event.EventCategory),
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
                console.log('ok');
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
                console.log('ok');
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

function mapGA4EcommerceEventName(mpEventType) {
    switch (mpEventType) {
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
            return 'add_shipping_info';
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

module.exports = CommerceHandler;
