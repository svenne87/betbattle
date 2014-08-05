function Controller() {
    function makePurchase(product) {
        if (Alloy.Globals.checkConnection()) {
            var xhr = Titanium.Network.createHTTPClient();
            xhr.onerror = function() {
                Alloy.Globals.showFeedbackDialog("Något gick fel! Försök igen.");
                indicator.closeIndicator();
            };
            try {
                xhr.open("POST", Alloy.Globals.BETKAMPENCOINSANDROIDURL + "?uid=" + Alloy.Globals.BETKAMPENUID);
                xhr.setRequestHeader("content-type", "application/json");
                xhr.setTimeout(Alloy.Globals.TIMEOUT);
                var param = JSON.stringify(product);
                xhr.send(param);
                logInApp(param);
            } catch (e) {
                Alloy.Globals.showFeedbackDialog("Något gick fel! Försök igen.");
                indicator.closeIndicator();
            }
            xhr.onload = function() {
                if ("200" == this.status) {
                    indicator.closeIndicator();
                    if (4 == this.readyState) Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText)); else {
                        var alertWindow = Titanium.UI.createAlertDialog({
                            title: "Något gick fel!",
                            message: JSON.parse(this.responseText),
                            buttonNames: [ "OK", "Försök igen" ]
                        });
                        alertWindow.addEventListener("click", function(e) {
                            switch (e.index) {
                              case 0:
                                alertWindow.hide();
                                break;

                              case 1:
                                makePurchase(product);
                                alertWindow.hide();
                            }
                        });
                    }
                } else {
                    indicator.closeIndicator();
                    var alertWindow = Titanium.UI.createAlertDialog({
                        title: "Något gick fel!",
                        message: JSON.parse(this.responseText),
                        buttonNames: [ "OK", "Försök igen" ]
                    });
                    alertWindow.addEventListener("click", function(e) {
                        switch (e.index) {
                          case 0:
                            alertWindow.hide();
                            break;

                          case 1:
                            makePurchase(product);
                            alertWindow.hide();
                        }
                    });
                }
            };
        } else Alloy.Globals.showFeedbackDialog("Ingen anslutning!");
    }
    function runSetup() {
        logInApp("Running startSetup...");
        InAppBilling.startSetup({
            publicKey: PUBLIC_KEY
        });
        logInApp("Wait for setup to complete successfully");
    }
    function responseString(responseCode) {
        switch (responseCode) {
          case InAppBilling.RESULT_OK:
            return "OK";

          case InAppBilling.RESULT_USER_CANCELED:
            return "USER CANCELED";

          case InAppBilling.RESULT_BILLING_UNAVAILABLE:
            return "BILLING UNAVAILABLE";

          case InAppBilling.RESULT_ITEM_UNAVAILABLE:
            return "ITEM UNAVAILABLE";

          case InAppBilling.RESULT_DEVELOPER_ERROR:
            return "DEVELOPER ERROR";

          case InAppBilling.RESULT_ERROR:
            return "RESULT ERROR";

          case InAppBilling.RESULT_ITEM_ALREADY_OWNED:
            return "RESULT ITEM ALREADY OWNED";

          case InAppBilling.RESULT_ITEM_NOT_OWNED:
            return "RESULT ITEM NOT OWNED";

          case InAppBilling.IAB_RESULT_REMOTE_EXCEPTION:
            return "IAB RESULT REMOTE EXCEPTION";

          case InAppBilling.IAB_RESULT_BAD_RESPONSE:
            return "IAB RESULT BAD RESPONSE";

          case InAppBilling.IAB_RESULT_VERIFICATION_FAILED:
            return "IAB RESULT VERIFICATION FAILED";

          case InAppBilling.IAB_RESULT_SEND_INTENT_FAILED:
            return "IAB RESULT SEND INTENT FAILED";

          case InAppBilling.IAB_RESULT_UNKNOWN_PURCHASE_RESPONSE:
            return "IAB RESULT UNKNOWN PURCHASE RESPONSE";

          case InAppBilling.IAB_RESULT_MISSING_TOKEN:
            return "IAB RESULT MISSING TOKEN";

          case InAppBilling.IAB_RESULT_UNKNOWN_ERROR:
            return "IAB RESULT UNKNOWN ERROR";

          case InAppBilling.IAB_RESULT_SUBSCRIPTIONS_NOT_AVAILABLE:
            return "IAB RESULT SUBSCRIPTIONS NOT AVAILABLE";

          case InAppBilling.IAB_RESULT_INVALID_CONSUMPTION:
            return "IAB RESULT INVALID CONSUMPTION";
        }
        return "";
    }
    function purchaseStateString(state) {
        switch (state) {
          case InAppBilling.PURCHASE_STATE_PURCHASED:
            return "PURCHASE STATE PURCHASED";

          case InAppBilling.PURCHASE_STATE_CANCELED:
            return "PURCHASE STATE CANCELED";
        }
        return "";
    }
    function purchaseTypeString(state) {
        switch (state) {
          case InAppBilling.ITEM_TYPE_INAPP:
            return "ITEM TYPE INAPP";
        }
        return "";
    }
    function purchaseProperties(p) {
        var str = "type: " + purchaseTypeString(p.type) + "\norderId: " + p.orderId + "\npackageName: " + p.packageName + "\nproductId: " + p.productId + "\npurchaseTime: " + new Date(p.purchaseTime) + "\npurchaseState: " + purchaseStateString(p.purchaseState) + "\ndeveloperPayload: " + p.developerPayload + "\ntoken: " + p.token;
        return str;
    }
    function createPurchaseButton(product) {
        var buyCoins = Ti.UI.createButton({
            title: product.price,
            top: 30,
            width: "70%",
            borderRadius: 6,
            textAlign: "center",
            height: 40,
            font: {
                fontFamily: Alloy.Globals.getFont(),
                fontSize: Alloy.Globals.getFontSize(2)
            },
            color: "#FFF",
            backgroundImage: "none",
            backgroundColor: "#58B101"
        });
        buyCoins.addEventListener("click", function() {
            InAppBilling.purchase({
                productId: product.productId,
                type: InAppBilling.ITEM_TYPE_INAPP,
                developerPayload: DEVELOPER_PAYLOAD
            });
        });
        $.store.add(buyCoins);
        $.store.add(Ti.UI.createLabel({
            top: 5,
            font: {
                fontFamily: Alloy.Globals.getFont(),
                fontSize: Alloy.Globals.getFontSize(1)
            },
            color: "#FFF",
            text: product.description,
            textAlign: "center"
        }));
    }
    function logInApp(text) {
        Ti.API.info(text);
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "store";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    $.__views.store = Ti.UI.createWindow({
        layout: "vertical",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        backgroundColor: "#303030",
        id: "store"
    });
    $.__views.store && $.addTopLevelView($.__views.store);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var uie = require("lib/IndicatorWindow");
    var indicator = uie.createIndicatorWindow({
        top: 200
    });
    $.store.orientationModes = [ Titanium.UI.PORTRAIT ];
    $.store.addEventListener("open", function() {
        $.store.activity.actionBar.onHomeIconItemSelected = function() {
            $.store.close();
        };
        $.store.activity.actionBar.displayHomeAsUp = true;
        $.store.activity.actionBar.title = "Betkampen";
    });
    $.store.addEventListener("close", function() {
        indicator.closeIndicator();
    });
    var InAppBilling = require("ti.inappbilling");
    var status = false;
    var PUBLIC_KEY = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlxb/6H5UAlfdtBk66M1DeVOaXcvHTHx6R2nnLtN/n6LQVnPYF7t8UaoqIW+KgpjpIx3Ffopki26Wm83aHxkBq5L2Q5+I2laH8RpUWR6w0cz4Gv+7j0inQwX7GpE52EetREupqHrCz3CfhVPKMVGxLQsKCXFZewaocWGTh3fDRzk+nJK8NtlM1HvQIeFW/sAqtx+hNyKRd4nNQ5AZidM9J9WfTQwDZfh1lgvDra9ysSppD29ZHnCp9taZD0ntbOdM/QBxr+4ur+h/Jl43vT9tjBmIsRxip/I0Op3f1DOamoNwPV/PdhwjuzYFbAMvtJxCav+z6Pn9coPV98HEYz1R/wIDAQAB";
    var developerPayloadRaw = Ti.Utils.base64encode(Alloy.Globals.FACEBOOKOBJECT.id).text;
    var DEVELOPER_PAYLOAD = developerPayloadRaw.replace(/\r/g, "").replace(/\n/g, "");
    InAppBilling.addEventListener("setupcomplete", function(e) {
        logInApp("Setup response: " + responseString(e.responseCode));
        if (e.success) {
            status = true;
            logInApp("Setup completed successfully!");
            InAppBilling.queryInventory({
                moreItems: [ "apps.topgame.betkampen.coins.20", "apps.topgame.betkampen.coins.40", "apps.topgame.betkampen.coins.100" ]
            });
        } else {
            logInApp("Setup FAILED.");
            Alloy.Globals.showFeedbackDialog("Något gick fel! Försök igen.");
            indicator.closeIndicator();
        }
    });
    InAppBilling.addEventListener("queryinventorycomplete", function(e) {
        logInApp("Query Inventory response: " + responseString(e.responseCode));
        var inventory = e.inventory;
        var productIds = [ "apps.topgame.betkampen.coins.20", "apps.topgame.betkampen.coins.40", "apps.topgame.betkampen.coins.100" ];
        indicator.closeIndicator();
        if (e.success) {
            for (var i = 0, j = productIds.length; j > i; i++) if (inventory.hasDetails(productIds[i])) {
                var productDetails = inventory.getDetails(productIds[i]);
                createPurchaseButton(productDetails);
            }
            logInApp("success!!!");
        } else Alloy.Globals.showFeedbackDialog("Något gick fel! Försök igen.");
    });
    InAppBilling.addEventListener("consumecomplete", function(e) {
        logInApp("Consume response: " + responseString(e.responseCode));
        e.success && makePurchase(e.purchase);
    });
    InAppBilling.addEventListener("purchasecomplete", function(e) {
        logInApp("Purchase response: " + responseString(e.responseCode));
        if (e.success && e.purchase) {
            logInApp(purchaseProperties(e.purchase));
            indicator.openIndicator();
            InAppBilling.consume({
                purchases: [ e.purchase ]
            });
        }
    });
    var imageView = Ti.UI.createView({
        top: 0,
        height: 142,
        width: "100%",
        backgroundImage: "/images/header.png"
    });
    imageView.add(Ti.UI.createLabel({
        top: 50,
        color: "#FFF",
        font: {
            fontFamily: Alloy.Globals.getFont(),
            fontWeight: "normal",
            fontSize: Alloy.Globals.getFontSize(3)
        },
        text: "Köp Coins"
    }));
    $.store.add(imageView);
    if ("<< Public Key >>" === PUBLIC_KEY) Alloy.Globals.showFeedbackDialog("Please put your app's public key in PUBLIC_KEY in this example."); else {
        indicator.openIndicator();
        try {
            runSetup();
        } catch (IllegalStateException) {
            if ("Setup already completed." === IllegalStateException.message) {
                InAppBilling.queryInventory({
                    moreItems: [ "apps.topgame.betkampen.coins.20", "apps.topgame.betkampen.coins.40", "apps.topgame.betkampen.coins.100" ]
                });
                logInApp("Setup was already made... Starting query for products.");
            } else {
                var alertWindow = Titanium.UI.createAlertDialog({
                    title: "Betkampen Fel",
                    message: "Vi ber om ursäkt men ett allvarligt fel uppstod! Appen kommer att avslutas.",
                    buttonNames: [ "OK" ]
                });
                alertWindow.addEventListener("click", function(e) {
                    switch (e.index) {
                      case 0:
                        alertWindow.hide();
                        $.store.exitOnClose = true;
                        $.store.close();
                        Alloy.Globals.MAINWIN.close();
                        var activity = Titanium.Android.currentActivity;
                        activity.finish();
                    }
                });
                setTimeout(function() {
                    alertWindow.show();
                }, 300);
            }
        }
    }
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;