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

    describe('initialization', function () {
        it('should initialize gtag and the dataLayer', function (done) {
            (typeof window.gtag === 'undefined').should.be.true();
            (typeof window.dataLayer === 'undefined').should.be.true();
            window.mockGA4EventForwarder = new mockGA4EventForwarder();
            // Include any specific settings that is required for initializing your SDK here
            var sdkSettings = {
                clientKey: '123456',
                appId: 'abcde',
                userIdField: 'customerId',
            };

            mParticle.forwarder.init(sdkSettings, reportService.cb, true);

            window.gtag.should.be.ok();
            window.dataLayer.should.be.ok();

            done();
        });
    });
    describe('forwarder mapping', function () {
        beforeEach(function () {
            window.dataLayer = [];
            window.mockGA4EventForwarder = new mockGA4EventForwarder();
            // Include any specific settings that is required for initializing your SDK here
            var sdkSettings = {
                clientKey: '123456',
                appId: 'abcde',
                userIdField: 'customerId',
            };
            // You may require userAttributes or userIdentities to be passed into initialization
            var userAttributes = {
                color: 'green',
            };
            var userIdentities = [
                {
                    Identity: 'customerId',
                    Type: IdentityType.CustomerId,
                },
                {
                    Identity: 'email',
                    Type: IdentityType.Email,
                },
                {
                    Identity: 'facebook',
                    Type: IdentityType.Facebook,
                },
            ];
            mParticle.forwarder.init(
                sdkSettings,
                reportService.cb,
                true,
                null,
                userAttributes,
                userIdentities
            );
        });

        it('should set user attribute', function (done) {
            mParticle.forwarder.setUserAttribute('foo', 'bar');
            var result = ['set', 'user_properties', { foo: 'bar' }];
            window.dataLayer[0].should.match(result);

            done();
        });

        it('should remove user attribute', function (done) {
            mParticle.forwarder.removeUserAttribute('bar');
            var result = ['set', 'user_properties', { bar: null }];
            window.dataLayer[0].should.match(result);

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

            it('should log an add_to_cart commerce event', function (done) {
                mParticle.forwarder.process({
                    CurrencyCode: 'USD',
                    EventName: 'Test Purchase Event',
                    EventDataType: MessageType.Commerce,
                    EventCategory: CommerceEventType.ProductAddToCart,
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
                        TotalAmount: 450,
                        TaxAmount: 40,
                        ShippingAmount: 10,
                    },
                });

                result[1] = 'add_to_cart';

                window.dataLayer[0].should.match(result);

                done();
            });

            it('should log a remove_from_cart commerce event', function (done) {
                mParticle.forwarder.process({
                    CurrencyCode: 'USD',
                    EventName: 'Test Purchase Event',
                    EventDataType: MessageType.Commerce,
                    EventCategory: CommerceEventType.ProductRemoveFromCart,
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
                    },
                });

                result[1] = 'remove_from_cart';
                window.dataLayer[0].should.match(result);

                done();
            });

            it('should log a begin_checkout commerce event', function (done) {
                mParticle.forwarder.process({
                    CurrencyCode: 'USD',
                    EventName: 'Test Purchase Event',
                    EventDataType: MessageType.Commerce,
                    EventCategory: CommerceEventType.ProductCheckout,
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
                window.dataLayer[0].should.match(result);

                done();
            });

            it('should process a purchase commerce event', function (done) {
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
                        TotalAmount: 450,
                        TaxAmount: 40,
                        ShippingAmount: 10,
                        CouponCode: 'couponCode',
                    },
                });

                result[1] = 'purchase';
                window.dataLayer[0].should.match(result);

                done();
            });

            it('should process a refund commerce event', function (done) {
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
                        TotalAmount: 450,
                        TaxAmount: 40,
                        ShippingAmount: 10,
                        CouponCode: 'couponCode',
                    },
                });

                result[1] = 'refund';
                window.dataLayer[0].should.match(result);

                done();
            });

            // TODO: Should we do remove_from_wishlist?
            // .     We support it but it looks like GA4 doesn't?
            it('should log an add_to_wishlist commerce event', function (done) {
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
                window.dataLayer[0].should.match(result);

                done();
            });

            // TODO: We don't have an analog for this. How do we map?
            it('should log a view_cart commerce event', function (done) {
                done();
            });

            it('should log a view_item commerce event', function (done) {
                mParticle.forwarder.process({
                    CurrencyCode: 'USD',
                    EventName: 'Test Purchase Event',
                    EventDataType: MessageType.Commerce,
                    EventCategory: CommerceEventType.ProductViewDetail,
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
                        TotalAmount: 450,
                        TaxAmount: 40,
                        ShippingAmount: 10,
                        CouponCode: 'couponCode',
                    },
                });

                result[1] = 'view_item';
                window.dataLayer[0].should.match(result);

                done();
            });

            // TODO: Is this a ProductImpression?
            it('should log a view_item_list commerce event', function (done) {
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
                            TotalAmount: 450,
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

                window.dataLayer[0].should.match(result);

                done();
            });

            // TODO: We should have test cases express the mapping for easier
            //       readability. I.e. 'should map select_item to ProductAction.Click
            it('should log a select_item commerce event', function (done) {
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
                window.dataLayer[0].should.match(result);

                done();
            });

            it('should log a view_promotion commerce event', function (done) {
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

                // TODO: Should these be in the root of the object or the items?
                // result[1] = 'view_promotion';
                // result[2].creative_name = 'Summer Sale Banner';
                // result[2].creative_slot = 'featured_sale_2';
                // result[2].location_id = 'L_12345';
                // result[2].promotion_id = 'P_12345';
                // result[2].promotion_name = 'Summer Sale';

                // TODO: Create a promotion sample result
                result = [
                    'event',
                    'view_promotion',
                    {
                        items: [
                            {
                                promotion_id: 'P_12345',
                                promotion_name: 'Summer Sale Banner',
                                creative_name: 'Summer Sale',
                                creative_slot: 'featured_app_1',
                            },
                            {
                                promotion_id: 'P_78901',
                                promotion_name: 'Winter Sale Banner',
                                creative_name: 'Winter Sale',
                                creative_slot: 'featured_app_2',
                            },
                        ],
                    },
                ];

                window.dataLayer[0].should.match(result);

                done();
            });

            it('should log a select_promotion commerce event', function (done) {
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

                // TODO: Should these be in the root of the object or the items?
                // result[1] = 'select_promotion';
                // result[2].creative_name = 'Summer Sale Banner';
                // result[2].creative_slot = 'featured_sale_2';
                // result[2].location_id = 'L_12345';
                // result[2].promotion_id = 'P_12345';
                // result[2].promotion_name = 'Summer Sale';

                // TODO: Create a promotion sample result
                result = [
                    'event',
                    'select_promotion',
                    {
                        items: [
                            {
                                promotion_id: 'P_12345',
                                promotion_name: 'Summer Sale Banner',
                                creative_name: 'Summer Sale',
                                creative_slot: 'featured_app_1',
                            },
                            {
                                promotion_id: 'P_78901',
                                promotion_name: 'Winter Sale Banner',
                                creative_name: 'Winter Sale',
                                creative_slot: 'featured_app_2',
                            },
                        ],
                    },
                ];

                window.dataLayer[0].should.match(result);

                done();
            });

            // TODO: This seems to conflict with our existing implementation
            //       Need to sync with Rob/Product for direction
            it('should log an add_payment_info commerce event', function (done) {
                done();
            });

            // TODO: This seems to conflict with our existing implementation
            //       Need to sync with Rob/Product for direction
            it('should log an add_shipping_info commerce event', function (done) {
                done();
            });

            // beforeEach(function() {
            //     window.dataLayer = [];
            //     window.mockGA4EventForwarder = new mockGA4EventForwarder();
            //     // Include any specific settings that is required for initializing your SDK here
            //     var sdkSettings = {
            //         clientKey: '123456',
            //         appId: 'abcde',
            //         userIdField: 'customerId',
            //     };
            //     // You may require userAttributes or userIdentities to be passed into initialization
            //     var userAttributes = {
            //         color: 'green',
            //     };
            //     var userIdentities = [
            //         {
            //             Identity: 'customerId',
            //             Type: IdentityType.CustomerId,
            //         },
            //         {
            //             Identity: 'email',
            //             Type: IdentityType.Email,
            //         },
            //         {
            //             Identity: 'facebook',
            //             Type: IdentityType.Facebook,
            //         },
            //     ];
            //     mParticle.forwarder.init(
            //         sdkSettings,
            //         reportService.cb,
            //         true,
            //         null,
            //         userAttributes,
            //         userIdentities
            //     );
            // });
        });
    });
});
