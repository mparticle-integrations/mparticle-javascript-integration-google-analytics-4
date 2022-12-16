/* eslint-disable no-undef*/
describe('Google Analytics 4 Event', function () {
    // -------------------DO NOT EDIT ANYTHING BELOW THIS LINE-----------------------
    var MessageType = {
            SessionStart: 1,
            SessionEnd: 2,
            PageView: 3,
            PageEvent: 4,
            CrashReport: 5,
            OptOut: 6,
            AppStateTransition: 10,
            Profile: 14,
            Commerce: 16,
        },
        EventType = {
            Unknown: 0,
            Navigation: 1,
            Location: 2,
            Search: 3,
            Transaction: 4,
            UserContent: 5,
            UserPreference: 6,
            Social: 7,
            Other: 8,
            Media: 9,
            getName: function () {
                return 'blahblah';
            },
        },
        CommerceEventType = {
            Unknown: 0,
            ProductAddToCart: 10,
            ProductRemoveFromCart: 11,
            ProductCheckout: 12,
            ProductCheckoutOption: 13,
            ProductClick: 14,
            ProductViewDetail: 15,
            ProductPurchase: 16,
            ProductRefund: 17,
            PromotionView: 18,
            PromotionClick: 19,
            ProductAddToWishlist: 20,
            ProductRemoveFromWishlist: 21,
            ProductImpression: 22,
        },
        ProductActionType = {
            Unknown: 0,
            AddToCart: 1,
            RemoveFromCart: 2,
            Checkout: 3,
            CheckoutOption: 4,
            Click: 5,
            ViewDetail: 6,
            Purchase: 7,
            Refund: 8,
            AddToWishlist: 9,
            RemoveFromWishlist: 10,
        },
        PromotionActionType = {
            Unknown: 0,
            PromotionClick: 1,
            PromotionView: 2,
        },
        IdentityType = {
            Other: 0,
            CustomerId: 1,
            Facebook: 2,
            Twitter: 3,
            Google: 4,
            Microsoft: 5,
            Yahoo: 6,
            Email: 7,
            Alias: 8,
            FacebookCustomAudienceId: 9,
        },
        ReportingService = function () {
            var self = this;

            this.id = null;
            this.event = null;

            this.cb = function (forwarder, event) {
                self.id = forwarder.id;
                self.event = event;
            };

            this.reset = function () {
                this.id = null;
                this.event = null;
            };
        },
        reportService = new ReportingService();

    // -------------------DO NOT EDIT ANYTHING ABOVE THIS LINE-----------------------
    // -------------------START EDITING BELOW:-----------------------
    // -------------------mParticle stubs - Add any additional stubbing to our methods as needed-----------------------
    mParticle.Identity = {
        getCurrentUser: function () {
            return {
                getMPID: function () {
                    return '123';
                },
            };
        },
    };
    // -------------------START EDITING BELOW:-----------------------
    var mockGA4EventForwarder = function () {
        var self = this;

        // create properties for each type of event you want tracked, see below for examples
        this.trackCustomEventCalled = false;
        this.logPurchaseEventCalled = false;
        this.initializeCalled = false;

        this.trackCustomName = null;
        this.logPurchaseName = null;
        this.apiKey = null;
        this.appId = null;
        this.userId = null;
        this.userAttributes = {};
        this.userIdField = null;

        this.eventProperties = [];
        this.purchaseEventProperties = [];

        // stub your different methods to ensure they are being called properly
        this.initialize = function (appId, apiKey) {
            self.initializeCalled = true;
            self.apiKey = apiKey;
            self.appId = appId;
        };

        this.stubbedTrackingMethod = function (name, eventProperties) {
            self.trackCustomEventCalled = true;
            self.trackCustomName = name;
            self.eventProperties.push(eventProperties);
            // Return true to indicate event should be reported
            return true;
        };

        this.stubbedUserAttributeSettingMethod = function (userAttributes) {
            self.userId = id;
            userAttributes = userAttributes || {};
            if (Object.keys(userAttributes).length) {
                for (var key in userAttributes) {
                    if (userAttributes[key] === null) {
                        delete self.userAttributes[key];
                    } else {
                        self.userAttributes[key] = userAttributes[key];
                    }
                }
            }
        };

        this.stubbedUserLoginMethod = function (id) {
            self.userId = id;
        };
    };

    var kitSettings = {
        clientKey: '123456',
        appId: 'abcde',
        externalUserIdentityType: 'customerId',
        measurementId: 'testMeasurementId',
    };

    describe('initialization', function () {
        it('should initialize gtag and the dataLayer', function (done) {
            (typeof window.gtag === 'undefined').should.be.true();
            (typeof window.dataLayer === 'undefined').should.be.true();
            window.mockGA4EventForwarder = new mockGA4EventForwarder();
            // Include any specific settings that is required for initializing your SDK here
            mParticle.forwarder.init(kitSettings, reportService.cb, true);

            window.gtag.should.be.ok();
            window.dataLayer.should.be.ok();

            done();
        });
    });
    describe('forwarder mapping', function () {
        beforeEach(function () {
            window.dataLayer = [];
            window.mockGA4EventForwarder = new mockGA4EventForwarder();
            mParticle.forwarder.init(kitSettings, reportService.cb, true, null);
            window.gtag = function () {
                window.dataLayer.push(Array.prototype.slice.call(arguments));
            };
        });

        it('should set user attribute', function (done) {
            mParticle.forwarder.setUserAttribute('foo', 'bar');
            var result = ['set', 'user_properties', { foo: 'bar' }];
            window.dataLayer[0].should.eql(result);

            done();
        });

        it('should remove user attribute', function (done) {
            mParticle.forwarder.removeUserAttribute('bar');
            var result = ['set', 'user_properties', { bar: null }];
            window.dataLayer[0].should.eql(result);

            done();
        });

        describe('ecommerce mapping', function () {
            var result;
            beforeEach(function () {
                result = [
                    'event',
                    'event_type_to_be_updated',
                    {
                        currency: 'USD',
                        value: 100,
                        items: [
                            {
                                attributes: {
                                    eventMetric1: 'metric2',
                                    journeyType: 'testjourneytype1',
                                },
                                coupon_code: 'coupon',
                                item_brand: 'brand',
                                item_category: 'category',
                                item_id: 'iphoneSKU',
                                item_name: 'iphone',
                                item_variant: 'variant',
                                position: 1,
                                price: 999,
                                quantity: 1,
                                total_amount: 999,
                            },
                            {
                                attributes: {
                                    eventMetric1: 'metric1',
                                    journeyType: 'testjourneytype2',
                                },
                                coupon_code: 'coupon',
                                item_brand: 'brand',
                                item_category: 'category',
                                item_id: 'iphoneSKU',
                                item_name: 'iphone',
                                item_variant: 'variant',
                                position: 1,
                                price: 999,
                                quantity: 1,
                                total_amount: 999,
                            },
                        ],
                    },
                ];
            });

            it('should map MP AddToCart commerce event to GA4 add_to_cart event', function (done) {
                mParticle.forwarder.process({
                    CurrencyCode: 'USD',
                    EventName: 'Test Purchase Event',
                    EventDataType: MessageType.Commerce,
                    EventCategory: CommerceEventType.ProductAddToCart,
                    CustomFlags: { 'GA4.Value': 100 },
                    ProductAction: {
                        ProductActionType: ProductActionType.AddToCart,
                        ProductList: [
                            {
                                Attributes: {
                                    eventMetric1: 'metric2',
                                    journeyType: 'testjourneytype1',
                                },
                                Brand: 'brand',
                                Category: 'category',
                                CouponCode: 'coupon',
                                Name: 'iphone',
                                Position: 1,
                                Price: 999,
                                Quantity: 1,
                                Sku: 'iphoneSKU',
                                TotalAmount: 999,
                                Variant: 'variant',
                            },
                            {
                                Attributes: {
                                    eventMetric1: 'metric1',
                                    journeyType: 'testjourneytype2',
                                },
                                Brand: 'brand',
                                Category: 'category',
                                CouponCode: 'coupon',
                                Name: 'iphone',
                                Position: 1,
                                Price: 999,
                                Quantity: 1,
                                Sku: 'iphoneSKU',
                                TotalAmount: 999,
                                Variant: 'variant',
                            },
                        ],
                        TaxAmount: 40,
                        ShippingAmount: 10,
                        CouponCode: 'coupon',
                    },
                });

                result[1] = 'add_to_cart';
                window.dataLayer[0].should.eql(result);

                done();
            });

            it('should map MP RemoveFromCart commerce event to GA4 remove_from_cart event', function (done) {
                mParticle.forwarder.process({
                    CurrencyCode: 'USD',
                    EventName: 'Test Purchase Event',
                    EventDataType: MessageType.Commerce,
                    EventCategory: CommerceEventType.ProductRemoveFromCart,
                    CustomFlags: { 'GA4.Value': 100 },
                    ProductAction: {
                        ProductActionType: ProductActionType.RemoveFromCart,
                        ProductList: [
                            {
                                Attributes: {
                                    eventMetric1: 'metric2',
                                    journeyType: 'testjourneytype1',
                                },
                                Brand: 'brand',
                                Category: 'category',
                                CouponCode: 'coupon',
                                Name: 'iphone',
                                Position: 1,
                                Price: 999,
                                Quantity: 1,
                                Sku: 'iphoneSKU',
                                TotalAmount: 999,
                                Variant: 'variant',
                            },
                            {
                                Attributes: {
                                    eventMetric1: 'metric1',
                                    journeyType: 'testjourneytype2',
                                },
                                Brand: 'brand',
                                Category: 'category',
                                CouponCode: 'coupon',
                                Name: 'iphone',
                                Position: 1,
                                Price: 999,
                                Quantity: 1,
                                Sku: 'iphoneSKU',
                                TotalAmount: 999,
                                Variant: 'variant',
                            },
                        ],
                        TotalAmount: 450,
                        TaxAmount: 40,
                        ShippingAmount: 10,
                        CouponCode: 'couponCode',
                    },
                });

                result[1] = 'remove_from_cart';
                window.dataLayer[0].should.eql(result);

                done();
            });

            it('should map MP Checkout commerce event to GA4 begin_checkout event', function (done) {
                mParticle.forwarder.process({
                    CurrencyCode: 'USD',
                    EventName: 'Test Purchase Event',
                    EventDataType: MessageType.Commerce,
                    EventCategory: CommerceEventType.ProductCheckout,
                    CustomFlags: { 'GA4.Value': 100 },
                    ProductAction: {
                        ProductActionType: ProductActionType.ProductCheckout,
                        ProductList: [
                            {
                                Attributes: {
                                    eventMetric1: 'metric2',
                                    journeyType: 'testjourneytype1',
                                },
                                Brand: 'brand',
                                Category: 'category',
                                CouponCode: 'coupon',
                                Name: 'iphone',
                                Position: 1,
                                Price: 999,
                                Quantity: 1,
                                Sku: 'iphoneSKU',
                                TotalAmount: 999,
                                Variant: 'variant',
                            },
                            {
                                Attributes: {
                                    eventMetric1: 'metric1',
                                    journeyType: 'testjourneytype2',
                                },
                                Brand: 'brand',
                                Category: 'category',
                                CouponCode: 'coupon',
                                Name: 'iphone',
                                Position: 1,
                                Price: 999,
                                Quantity: 1,
                                Sku: 'iphoneSKU',
                                TotalAmount: 999,
                                Variant: 'variant',
                            },
                        ],
                        TotalAmount: 450,
                        TaxAmount: 40,
                        ShippingAmount: 10,
                        CouponCode: 'couponCode',
                    },
                });

                result[1] = 'begin_checkout';
                result[2].coupon = 'couponCode';
                window.dataLayer[0].should.eql(result);

                done();
            });

            it('should map MP Purchase commerce event to GA4 purchase event', function (done) {
                mParticle.forwarder.process({
                    CurrencyCode: 'USD',
                    EventName: 'Test Purchase Event',
                    EventDataType: MessageType.Commerce,
                    EventCategory: CommerceEventType.ProductPurchase,
                    ProductAction: {
                        ProductActionType: ProductActionType.ProductPurchase,
                        ProductList: [
                            {
                                Attributes: {
                                    eventMetric1: 'metric2',
                                    journeyType: 'testjourneytype1',
                                },
                                Brand: 'brand',
                                Category: 'category',
                                CouponCode: 'coupon',
                                Name: 'iphone',
                                Position: 1,
                                Price: 999,
                                Quantity: 1,
                                Sku: 'iphoneSKU',
                                TotalAmount: 999,
                                Variant: 'variant',
                            },
                            {
                                Attributes: {
                                    eventMetric1: 'metric1',
                                    journeyType: 'testjourneytype2',
                                },
                                Brand: 'brand',
                                Category: 'category',
                                CouponCode: 'coupon',
                                Name: 'iphone',
                                Position: 1,
                                Price: 999,
                                Quantity: 1,
                                Sku: 'iphoneSKU',
                                TotalAmount: 999,
                                Variant: 'variant',
                            },
                        ],
                        Affiliation: 'foo-affiliation-id',
                        TransactionId: 'foo-transaction-id',
                        TotalAmount: 450,
                        TaxAmount: 40,
                        ShippingAmount: 10,
                        CouponCode: 'couponCode',
                    },
                });

                result[1] = 'purchase';
                result[2].coupon = 'couponCode';
                result[2].transaction_id = 'foo-transaction-id';
                result[2].affiliation = 'foo-affiliation-id';
                result[2].shipping = 10;
                result[2].tax = 40;
                result[2].value = 450;
                window.dataLayer[0].should.eql(result);

                done();
            });

            it('should map MP Refund commerce event to GA4 refund event', function (done) {
                mParticle.forwarder.process({
                    CurrencyCode: 'USD',
                    EventName: 'Test Purchase Event',
                    EventDataType: MessageType.Commerce,
                    EventCategory: CommerceEventType.ProductRefund,
                    ProductAction: {
                        ProductActionType: ProductActionType.ProductRefund,
                        ProductList: [
                            {
                                Attributes: {
                                    eventMetric1: 'metric2',
                                    journeyType: 'testjourneytype1',
                                },
                                Brand: 'brand',
                                Category: 'category',
                                CouponCode: 'coupon',
                                Name: 'iphone',
                                Position: 1,
                                Price: 999,
                                Quantity: 1,
                                Sku: 'iphoneSKU',
                                TotalAmount: 999,
                                Variant: 'variant',
                            },
                            {
                                Attributes: {
                                    eventMetric1: 'metric1',
                                    journeyType: 'testjourneytype2',
                                },
                                Brand: 'brand',
                                Category: 'category',
                                CouponCode: 'coupon',
                                Name: 'iphone',
                                Position: 1,
                                Price: 999,
                                Quantity: 1,
                                Sku: 'iphoneSKU',
                                TotalAmount: 999,
                                Variant: 'variant',
                            },
                        ],
                        Affiliation: 'foo-affiliation-id',
                        TransactionId: 'foo-transaction-id',
                        TotalAmount: 450,
                        TaxAmount: 40,
                        ShippingAmount: 10,
                        CouponCode: 'couponCode',
                    },
                });

                result[1] = 'refund';
                result[2].coupon = 'couponCode';
                result[2].transaction_id = 'foo-transaction-id';
                result[2].affiliation = 'foo-affiliation-id';
                result[2].shipping = 10;
                result[2].tax = 40;
                result[2].value = 450;
                window.dataLayer[0].should.eql(result);

                done();
            });

            it('should map MP AddToWishlist commerce event to GA4 add_to_wishlist event', function (done) {
                mParticle.forwarder.process({
                    CurrencyCode: 'USD',
                    EventName: 'Test Purchase Event',
                    EventDataType: MessageType.Commerce,
                    EventCategory: CommerceEventType.ProductAddToWishlist,
                    ProductAction: {
                        ProductActionType: ProductActionType.AddToWishlist,
                        ProductList: [
                            {
                                Attributes: {
                                    eventMetric1: 'metric2',
                                    journeyType: 'testjourneytype1',
                                },
                                Brand: 'brand',
                                Category: 'category',
                                CouponCode: 'coupon',
                                Name: 'iphone',
                                Position: 1,
                                Price: 999,
                                Quantity: 1,
                                Sku: 'iphoneSKU',
                                TotalAmount: 999,
                                Variant: 'variant',
                            },
                            {
                                Attributes: {
                                    eventMetric1: 'metric1',
                                    journeyType: 'testjourneytype2',
                                },
                                Brand: 'brand',
                                Category: 'category',
                                CouponCode: 'coupon',
                                Name: 'iphone',
                                Position: 1,
                                Price: 999,
                                Quantity: 1,
                                Sku: 'iphoneSKU',
                                TotalAmount: 999,
                                Variant: 'variant',
                            },
                        ],
                        TotalAmount: 450,
                        TaxAmount: 40,
                        ShippingAmount: 10,
                        CouponCode: 'couponCode',
                    },
                });

                result[1] = 'add_to_wishlist';
                result[2].value = 450;
                window.dataLayer[0].should.eql(result);

                done();
            });

            it('should map MP ViewDetail commerce event to GA4 view_item event', function (done) {
                mParticle.forwarder.process({
                    CurrencyCode: 'USD',
                    EventName: 'Test Purchase Event',
                    EventDataType: MessageType.Commerce,
                    EventCategory: CommerceEventType.ProductViewDetail,
                    CustomFlags: { 'GA4.Value': 100 },
                    ProductAction: {
                        ProductActionType: ProductActionType.ViewDetail,
                        ProductList: [
                            {
                                Attributes: {
                                    eventMetric1: 'metric2',
                                    journeyType: 'testjourneytype1',
                                },
                                Brand: 'brand',
                                Category: 'category',
                                CouponCode: 'coupon',
                                Name: 'iphone',
                                Position: 1,
                                Price: 999,
                                Quantity: 1,
                                Sku: 'iphoneSKU',
                                TotalAmount: 999,
                                Variant: 'variant',
                            },
                            {
                                Attributes: {
                                    eventMetric1: 'metric1',
                                    journeyType: 'testjourneytype2',
                                },
                                Brand: 'brand',
                                Category: 'category',
                                CouponCode: 'coupon',
                                Name: 'iphone',
                                Position: 1,
                                Price: 999,
                                Quantity: 1,
                                Sku: 'iphoneSKU',
                                TotalAmount: 999,
                                Variant: 'variant',
                            },
                        ],
                        TaxAmount: 40,
                        ShippingAmount: 10,
                        CouponCode: 'couponCode',
                    },
                });

                result[1] = 'view_item';
                window.dataLayer[0].should.eql(result);

                done();
            });

            it('should map MP ProductImpression commerce event to GA4 view_item_list event', function (done) {
                mParticle.forwarder.process({
                    CurrencyCode: 'USD',
                    EventName: 'Test Purchase Event',
                    EventDataType: MessageType.Commerce,
                    EventCategory: CommerceEventType.ProductImpression,
                    ProductImpressions: [
                        {
                            // TODO: Does this map to the name or id of the impression?
                            ProductImpressionList: 'Related Products',
                            ProductList: [
                                {
                                    Attributes: {
                                        eventMetric1: 'metric2',
                                        journeyType: 'testjourneytype1',
                                    },
                                    Brand: 'brand',
                                    Category: 'category',
                                    CouponCode: 'coupon',
                                    Name: 'iphone',
                                    Position: 1,
                                    Price: 999,
                                    Quantity: 1,
                                    Sku: 'iphoneSKU',
                                    TotalAmount: 999,
                                    Variant: 'variant',
                                },
                                {
                                    Attributes: {
                                        eventMetric1: 'metric1',
                                        journeyType: 'testjourneytype2',
                                    },
                                    Brand: 'brand',
                                    Category: 'category',
                                    CouponCode: 'coupon',
                                    Name: 'iphone',
                                    Position: 1,
                                    Price: 999,
                                    Quantity: 1,
                                    Sku: 'iphoneSKU',
                                    TotalAmount: 999,
                                    Variant: 'variant',
                                },
                            ],
                            TaxAmount: 40,
                            ShippingAmount: 10,
                            CouponCode: 'couponCode',
                        },
                    ],
                });

                result = [
                    'event',
                    'view_item_list',
                    {
                        item_list_id: 'Related Products',
                        item_list_name: 'Related Products',
                        items: [
                            {
                                attributes: {
                                    eventMetric1: 'metric2',
                                    journeyType: 'testjourneytype1',
                                },
                                coupon_code: 'coupon',
                                item_brand: 'brand',
                                item_category: 'category',
                                item_id: 'iphoneSKU',
                                item_name: 'iphone',
                                item_variant: 'variant',
                                position: 1,
                                price: 999,
                                quantity: 1,
                                total_amount: 999,
                            },
                            {
                                attributes: {
                                    eventMetric1: 'metric1',
                                    journeyType: 'testjourneytype2',
                                },
                                coupon_code: 'coupon',
                                item_brand: 'brand',
                                item_category: 'category',
                                item_id: 'iphoneSKU',
                                item_name: 'iphone',
                                item_variant: 'variant',
                                position: 1,
                                price: 999,
                                quantity: 1,
                                total_amount: 999,
                            },
                        ],
                    },
                ];

                window.dataLayer[0].should.eql(result);

                done();
            });

            it('should map MP Click commerce event to GA4 select_item event', function (done) {
                mParticle.forwarder.process({
                    CurrencyCode: 'USD',
                    EventName: 'Test Purchase Event',
                    EventDataType: MessageType.Commerce,
                    EventCategory: CommerceEventType.ProductClick,
                    ProductAction: {
                        ProductActionType: ProductActionType.Click,
                        ProductList: [
                            {
                                Attributes: {
                                    eventMetric1: 'metric2',
                                    journeyType: 'testjourneytype1',
                                },
                                Brand: 'brand',
                                Category: 'category',
                                CouponCode: 'coupon',
                                Name: 'iphone',
                                Position: 1,
                                Price: 999,
                                Quantity: 1,
                                Sku: 'iphoneSKU',
                                TotalAmount: 999,
                                Variant: 'variant',
                            },
                            {
                                Attributes: {
                                    eventMetric1: 'metric1',
                                    journeyType: 'testjourneytype2',
                                },
                                Brand: 'brand',
                                Category: 'category',
                                CouponCode: 'coupon',
                                Name: 'iphone',
                                Position: 1,
                                Price: 999,
                                Quantity: 1,
                                Sku: 'iphoneSKU',
                                TotalAmount: 999,
                                Variant: 'variant',
                            },
                        ],
                        TotalAmount: 450,
                        TaxAmount: 40,
                        ShippingAmount: 10,
                        CouponCode: 'couponCode',
                    },
                });

                result[1] = 'select_item';
                // select items do not include currency of value, which is by default on the result
                delete result[2]['currency'];
                delete result[2]['value'];
                window.dataLayer[0].should.eql(result);

                done();
            });

            it('should map MP PromotionView commerce event to GA4 view_promotion event', function (done) {
                mParticle.forwarder.process({
                    CurrencyCode: 'USD',
                    EventName: 'Test Promotion Action Event',
                    EventDataType: MessageType.Commerce,
                    EventCategory: CommerceEventType.PromotionView,
                    PromotionAction: {
                        PromotionActionType: PromotionActionType.PromotionView,
                        PromotionList: [
                            {
                                Id: 'P_12345',
                                Name: 'Summer Sale Banner',
                                Creative: 'Summer Sale',
                                Position: 'featured_app_1',
                            },
                            {
                                Id: 'P_78901',
                                Name: 'Winter Sale Banner',
                                Creative: 'Winter Sale',
                                Position: 'featured_app_2',
                            },
                        ],
                    },
                });

                var promotionResult1 = [
                    'event',
                    'view_promotion',
                    {
                        promotion_id: 'P_12345',
                        promotion_name: 'Summer Sale Banner',
                        creative_name: 'Summer Sale',
                        creative_slot: 'featured_app_1',
                    },
                ];

                var promotionResult2 = [
                    'event',
                    'view_promotion',
                    {
                        promotion_id: 'P_78901',
                        promotion_name: 'Winter Sale Banner',
                        creative_name: 'Winter Sale',
                        creative_slot: 'featured_app_2',
                    },
                ];

                window.dataLayer[0].should.eql(promotionResult1);
                window.dataLayer[1].should.eql(promotionResult2);

                done();
            });

            it('should map MP PromotionClick commerce event to GA4 select_promotion event', function (done) {
                mParticle.forwarder.process({
                    CurrencyCode: 'USD',
                    EventName: 'Test Purchase Event',
                    EventDataType: MessageType.Commerce,
                    EventCategory: CommerceEventType.PromotionClick,
                    PromotionAction: {
                        PromotionActionType: PromotionActionType.PromotionClick,
                        PromotionList: [
                            {
                                Id: 'P_12345',
                                Name: 'Summer Sale Banner',
                                Creative: 'Summer Sale',
                                Position: 'featured_app_1',
                            },
                            {
                                Id: 'P_78901',
                                Name: 'Winter Sale Banner',
                                Creative: 'Winter Sale',
                                Position: 'featured_app_2',
                            },
                        ],
                    },
                });

                var promotionResult1 = [
                    'event',
                    'select_promotion',
                    {
                        promotion_id: 'P_12345',
                        promotion_name: 'Summer Sale Banner',
                        creative_name: 'Summer Sale',
                        creative_slot: 'featured_app_1',
                    },
                ];

                var promotionResult2 = [
                    'event',
                    'select_promotion',
                    {
                        promotion_id: 'P_78901',
                        promotion_name: 'Winter Sale Banner',
                        creative_name: 'Winter Sale',
                        creative_slot: 'featured_app_2',
                    },
                ];

                window.dataLayer[0].should.eql(promotionResult1);
                window.dataLayer[1].should.eql(promotionResult2);

                done();
            });

            it('should map MP CheckoutOption commerce event with add_payment_info custom flag to GA4 add_payment_info event', function (done) {
                mParticle.forwarder.process({
                    CurrencyCode: 'USD',
                    EventName: 'Test add_payment_info Event',
                    EventDataType: MessageType.Commerce,
                    EventCategory: CommerceEventType.ProductCheckoutOption,
                    CustomFlags: {
                        'GA4.CommerceEventType': 'add_payment_info',
                        'GA4.PaymentType': 'credit-card',
                    },
                    ProductAction: {
                        ProductActionType: ProductActionType.Click,
                        ProductList: [
                            {
                                Attributes: {
                                    eventMetric1: 'metric2',
                                    journeyType: 'testjourneytype1',
                                },
                                Brand: 'brand',
                                Category: 'category',
                                CouponCode: 'coupon',
                                Name: 'iphone',
                                Position: 1,
                                Price: 999,
                                Quantity: 1,
                                Sku: 'iphoneSKU',
                                TotalAmount: 999,
                                Variant: 'variant',
                            },
                            {
                                Attributes: {
                                    eventMetric1: 'metric1',
                                    journeyType: 'testjourneytype2',
                                },
                                Brand: 'brand',
                                Category: 'category',
                                CouponCode: 'coupon',
                                Name: 'iphone',
                                Position: 1,
                                Price: 999,
                                Quantity: 1,
                                Sku: 'iphoneSKU',
                                TotalAmount: 999,
                                Variant: 'variant',
                            },
                        ],
                        TotalAmount: 450,
                        TaxAmount: 40,
                        ShippingAmount: 10,
                        CouponCode: 'couponCode',
                    },
                });

                result = [
                    'event',
                    'add_payment_info',
                    {
                        payment_type: 'credit-card',
                        coupon: 'couponCode',
                        items: [
                            {
                                attributes: {
                                    eventMetric1: 'metric2',
                                    journeyType: 'testjourneytype1',
                                },
                                coupon_code: 'coupon',
                                item_brand: 'brand',
                                item_category: 'category',
                                item_id: 'iphoneSKU',
                                item_name: 'iphone',
                                item_variant: 'variant',
                                position: 1,
                                price: 999,
                                quantity: 1,
                                total_amount: 999,
                            },
                            {
                                attributes: {
                                    eventMetric1: 'metric1',
                                    journeyType: 'testjourneytype2',
                                },
                                coupon_code: 'coupon',
                                item_brand: 'brand',
                                item_category: 'category',
                                item_id: 'iphoneSKU',
                                item_name: 'iphone',
                                item_variant: 'variant',
                                position: 1,
                                price: 999,
                                quantity: 1,
                                total_amount: 999,
                            },
                        ],
                    },
                ];

                window.dataLayer[0].should.match(result);

                done();
            });

            it('should map MP CheckoutOption commerce event with add_shipping_info custom flag to GA4 add_shipping_info event', function (done) {
                mParticle.forwarder.process({
                    CurrencyCode: 'USD',
                    EventName: 'Test add_shipping_info Event',
                    EventDataType: MessageType.Commerce,
                    EventCategory: CommerceEventType.ProductCheckoutOption,
                    CustomFlags: {
                        'GA4.CommerceEventType': 'add_shipping_info',
                        'GA4.ShippingTier': 'ground',
                    },
                    ProductAction: {
                        ProductActionType: ProductActionType.Click,
                        ProductList: [
                            {
                                Attributes: {
                                    eventMetric1: 'metric2',
                                    journeyType: 'testjourneytype1',
                                },
                                Brand: 'brand',
                                Category: 'category',
                                CouponCode: 'coupon',
                                Name: 'iphone',
                                Position: 1,
                                Price: 999,
                                Quantity: 1,
                                Sku: 'iphoneSKU',
                                TotalAmount: 999,
                                Variant: 'variant',
                            },
                            {
                                Attributes: {
                                    eventMetric1: 'metric1',
                                    journeyType: 'testjourneytype2',
                                },
                                Brand: 'brand',
                                Category: 'category',
                                CouponCode: 'coupon',
                                Name: 'iphone',
                                Position: 1,
                                Price: 999,
                                Quantity: 1,
                                Sku: 'iphoneSKU',
                                TotalAmount: 999,
                                Variant: 'variant',
                            },
                        ],
                        TotalAmount: 450,
                        TaxAmount: 40,
                        ShippingAmount: 10,
                        CouponCode: 'couponCode',
                    },
                });

                result = [
                    'event',
                    'add_shipping_info',
                    {
                        shipping_tier: 'ground',
                        coupon: 'couponCode',
                        items: [
                            {
                                attributes: {
                                    eventMetric1: 'metric2',
                                    journeyType: 'testjourneytype1',
                                },
                                coupon_code: 'coupon',
                                item_brand: 'brand',
                                item_category: 'category',
                                item_id: 'iphoneSKU',
                                item_name: 'iphone',
                                item_variant: 'variant',
                                position: 1,
                                price: 999,
                                quantity: 1,
                                total_amount: 999,
                            },
                            {
                                attributes: {
                                    eventMetric1: 'metric1',
                                    journeyType: 'testjourneytype2',
                                },
                                coupon_code: 'coupon',
                                item_brand: 'brand',
                                item_category: 'category',
                                item_id: 'iphoneSKU',
                                item_name: 'iphone',
                                item_variant: 'variant',
                                position: 1,
                                price: 999,
                                quantity: 1,
                                total_amount: 999,
                            },
                        ],
                    },
                ];

                window.dataLayer[0].should.eql(result);

                done();
            });

            it('should log a `set_checkout_option` event if a CheckoutOption is sent without a custom flag for GA4.CommerceEventType', function (done) {
                mParticle.forwarder.process({
                    CurrencyCode: 'USD',
                    EventName: 'Test add_payment_info Event',
                    EventDataType: MessageType.Commerce,
                    EventCategory: CommerceEventType.ProductCheckoutOption,
                    EventAttributes: {
                        foo: 'bar',
                    },
                    CustomFlags: {},
                    ProductAction: {
                        ProductActionType: ProductActionType.Click,
                        ProductList: [],
                    },
                });

                result = [
                    'event',
                    'set_checkout_option',
                    {
                        items: [],
                        foo: 'bar',
                    },
                ];
                window.dataLayer.length.should.eql(1);

                done();
            });

            it('should log an event if a CheckoutOption is sent with GA4.CommerceEventType but without GA4.ShippingTier', function (done) {
                mParticle.forwarder.process({
                    CurrencyCode: 'USD',
                    EventName: 'Test add_payment_info Event',
                    EventDataType: MessageType.Commerce,
                    EventCategory: CommerceEventType.ProductCheckoutOption,
                    CustomFlags: {
                        'GA4.CommerceEventType': 'add_shipping_info',
                    },
                    ProductAction: {
                        ProductActionType: ProductActionType.Click,
                        ProductList: [],
                    },
                });

                result = [
                    'event',
                    'add_shipping_info',
                    {
                        shipping_tier: null,
                        coupon: null,
                        items: [],
                    },
                ];
                window.dataLayer[0].should.eql(result);

                done();
            });

            it('should log an event if a CheckoutOption is sent on with GA4.CommerceEventType but without GA4.PaymentType', function (done) {
                mParticle.forwarder.process({
                    CurrencyCode: 'USD',
                    EventName: 'Test add_payment_info Event',
                    EventDataType: MessageType.Commerce,
                    EventCategory: CommerceEventType.ProductCheckoutOption,
                    CustomFlags: {
                        'GA4.CommerceEventType': 'add_payment_info',
                    },
                    ProductAction: {
                        ProductActionType: ProductActionType.Click,
                        ProductList: [],
                    },
                });

                result = [
                    'event',
                    'add_payment_info',
                    {
                        payment_type: null,
                        coupon: null,
                        items: [],
                    },
                ];
                window.dataLayer[0].should.eql(result);

                done();
            });

            it('should log a view_cart event using ProductActionType.Unknown and a custom flag', function (done) {
                mParticle.forwarder.process({
                    CurrencyCode: 'USD',
                    EventName: 'Unknown Test',
                    EventDataType: MessageType.Commerce,
                    EventCategory: CommerceEventType.Unknown,
                    CustomFlags: {
                        'GA4.CommerceEventType': 'view_cart',
                        'GA4.Value': 100,
                    },
                    ProductAction: {
                        ProductActionType: ProductActionType.Unknown,
                        ProductList: [
                            {
                                Attributes: {
                                    eventMetric1: 'metric2',
                                    journeyType: 'testjourneytype1',
                                },
                                Brand: 'brand',
                                Category: 'category',
                                CouponCode: 'coupon',
                                Name: 'iphone',
                                Position: 1,
                                Price: 999,
                                Quantity: 1,
                                Sku: 'iphoneSKU',
                                TotalAmount: 999,
                                Variant: 'variant',
                            },
                            {
                                Attributes: {
                                    eventMetric1: 'metric1',
                                    journeyType: 'testjourneytype2',
                                },
                                Brand: 'brand',
                                Category: 'category',
                                CouponCode: 'coupon',
                                Name: 'iphone',
                                Position: 1,
                                Price: 999,
                                Quantity: 1,
                                Sku: 'iphoneSKU',
                                TotalAmount: 999,
                                Variant: 'variant',
                            },
                        ],
                    },
                });

                result = [
                    'event',
                    'view_cart',
                    {
                        value: 100,
                        currency: 'USD',
                        items: [
                            {
                                attributes: {
                                    eventMetric1: 'metric2',
                                    journeyType: 'testjourneytype1',
                                },
                                coupon_code: 'coupon',
                                item_brand: 'brand',
                                item_category: 'category',
                                item_id: 'iphoneSKU',
                                item_name: 'iphone',
                                item_variant: 'variant',
                                position: 1,
                                price: 999,
                                quantity: 1,
                                total_amount: 999,
                            },
                            {
                                attributes: {
                                    eventMetric1: 'metric1',
                                    journeyType: 'testjourneytype2',
                                },
                                coupon_code: 'coupon',
                                item_brand: 'brand',
                                item_category: 'category',
                                item_id: 'iphoneSKU',
                                item_name: 'iphone',
                                item_variant: 'variant',
                                position: 1,
                                price: 999,
                                quantity: 1,
                                total_amount: 999,
                            },
                        ],
                    },
                ];

                window.dataLayer[0].should.eql(result);

                done();
            });

            it('should not log an Unknown Product Action Type with no custom flags', function (done) {
                mParticle.forwarder.process({
                    CurrencyCode: 'USD',
                    EventName: 'Unknown Test',
                    EventDataType: MessageType.Commerce,
                    EventCategory: CommerceEventType.Unknown,
                    CustomFlags: {},
                });

                window.dataLayer.length.should.eql(0);

                done();
            });
        });

        describe('event mapping', function () {
            it('should log the event name and event attributes of the page event', function (done) {
                mParticle.forwarder.process({
                    EventDataType: MessageType.PageEvent,
                    EventCategory: EventType.Navigation,
                    EventName: 'Unmapped Event Name',
                    EventAttributes: {
                        foo: 'bar',
                    },
                });

                var result = ['event', 'Unmapped Event Name', { foo: 'bar' }];
                window.dataLayer[0].should.eql(result);

                done();
            });

            it('should log page view ', function (done) {
                // Mocking page title for headless tests
                document.title = 'Mocha Tests';

                mParticle.forwarder.process({
                    EventDataType: MessageType.PageView,
                    EventName: 'test name',
                    EventAttributes: {},
                });

                var result = [
                    'event',
                    'page_view',
                    {
                        page_title: 'Mocha Tests',
                        page_location: location.href,
                    },
                ];
                window.dataLayer[0].should.eql(result);

                done();
            });

            it('should log page view with event attributes', function (done) {
                mParticle.forwarder.process({
                    EventDataType: MessageType.PageView,
                    EventName: 'test name',
                    EventAttributes: {
                        eventKey1: 'test1',
                        eventKey2: 'test2',
                    },
                    CustomFlags: {
                        'Google.Title': 'Foo Page Title',
                        'Google.Location': '/foo',
                    },
                });

                var result = [
                    'event',
                    'page_view',
                    {
                        page_title: 'Foo Page Title',
                        page_location: '/foo',
                        eventKey1: 'test1',
                        eventKey2: 'test2',
                    },
                ];
                window.dataLayer[0].should.eql(result);

                done();
            });

            it('should truncate long event attributes keys and values', function (done) {
                mParticle.forwarder.process({
                    EventDataType: MessageType.PageEvent,
                    EventCategory: EventType.Navigation,
                    EventName:
                        'This is a very long event name that should be truncated at some point',
                    EventAttributes: {
                        foo: 'bar',
                        superLongEventAttributeNameThatShouldBeTruncatedWhenItsTooLong:
                            'Super Long Event Attribute value that should be truncated because we do not want super long attribute names that would upset Google',
                    },
                });

                var expectedEventName =
                    'This is a very long event name that shou';

                var expectedEventAttributes = {
                    foo: 'bar',
                    superLongEventAttributeNameThatShouldBeT:
                        'Super Long Event Attribute value that should be truncated because we do not want super long attribut',
                };

                window.dataLayer[0][1].should.eql(expectedEventName);
                window.dataLayer[0][2].should.eql(expectedEventAttributes);
                done();
            });

            it('should truncate long user attribute keys and values', function (done) {
                mParticle.forwarder.setUserAttribute(
                    'superLongUserAttributeNameThatShouldBeTruncated',
                    'Super Long User Attribute Value That Should Be Truncated'
                );

                window.dataLayer[0][2].should.eql({
                    superLongUserAttributeNa:
                        'Super Long User Attribute Value That',
                });
                done();
            });
        });
    });

    describe('identity', function () {
        var mParticleUser = {
            getMPID: function () {
                return 'testMPID';
            },
            getUserIdentities: function () {
                return {
                    userIdentities: {
                        customerid: 'testCustomerId',
                        other: 'other1',
                    },
                };
            },
        };

        beforeEach(function () {
            window.dataLayer = [];
        });

        it('should handle onUserIdentified with customerid', function (done) {
            kitSettings.externalUserIdentityType = 'CustomerId';
            mParticle.forwarder.init(kitSettings, reportService.cb, true, null);

            mParticle.forwarder.onUserIdentified(mParticleUser);

            var result = [
                'config',
                'testMeasurementId',
                { send_page_view: false, user_id: 'testCustomerId' },
            ];

            window.dataLayer[0].should.match(result);

            done();
        });

        it('should handle onUserIdentified with other1', function (done) {
            kitSettings.externalUserIdentityType = 'Other';
            mParticle.forwarder.init(kitSettings, reportService.cb, true, null);

            mParticle.forwarder.onUserIdentified(mParticleUser);

            var result = [
                'config',
                'testMeasurementId',
                { send_page_view: false, user_id: 'other1' },
            ];
            window.dataLayer[0].should.match(result);

            done();
        });

        it('should handle onUserIdentified with mpid', function (done) {
            kitSettings.externalUserIdentityType = 'mpid';
            mParticle.forwarder.init(kitSettings, reportService.cb, true, null);

            mParticle.forwarder.onUserIdentified(mParticleUser);

            var result = [
                'config',
                'testMeasurementId',
                { send_page_view: false, user_id: 'testMPID' },
            ];
            window.dataLayer[0].should.match(result);

            done();
        });
    });
});
