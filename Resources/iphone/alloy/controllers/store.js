function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function stateChangeEventFunction(e) {
        Ti.API.info("Received stateChange event with state " + e.state);
        switch (InAppProducts.state) {
          case InAppProducts.STATE_NOT_READY:
            Alloy.Globals.showFeedbackDialog("Modulen är inte redo!");
            e.errorCode && Ti.API.info("Initialization error code: " + e.errorCode);
            e.errorMessage && Ti.API.info("Initialization error msg: " + e.errorMessage);
            break;

          case InAppProducts.STATE_READY:
            Ti.API.log("Module ready.");
            break;

          case InAppProducts.STATE_NOT_SUPPORTED:
            Alloy.Globals.showFeedbackDialog("Funkar inte att köra i emulatorn!");
            break;

          default:
            Alloy.Globals.showFeedbackDialog("Modulen är inte redo!");
        }
    }
    function receivedProductsEventFunction(e) {
        if (e.errorCode) {
            indicator.closeIndicator();
            fetchProductsError();
        } else {
            Ti.API.info("getProducts succeeded!");
            productObjects = e.products;
            Ti.API.info("Product count: " + productObjects.length);
            Ti.API.info("Invalid IDs: " + JSON.stringify(e.invalid));
            indicator.closeIndicator();
            buildGUI(productObjects);
        }
    }
    function purchaseUpdateEventFunction(e) {
        Ti.API.info("Received purchaseUpdate event");
        indicator.openIndicator();
        if (e.errorCode) {
            indicator.closeIndicator();
            Alloy.Globals.showFeedbackDialog("Köpet misslyckades! Vänligen försök igen.");
        } else {
            Ti.API.info("Product: " + e.purchase.SKU + " state: " + purchaseStateToString(e.purchase.state));
            switch (e.purchase.state) {
              case InAppProducts.PURCHASE_STATE_PURCHASED:
                completePurchaseServer(e.purchase.SKU, e.purchase.receipt);
                break;

              case InAppProducts.PURCHASE_STATE_CANCELED:
                indicator.closeIndicator();
                Alloy.Globals.showFeedbackDialog("Köpet avbröts.");
                break;

              case InAppProducts.PURCHASE_STATE_REFUNDED:
                break;

              case InAppProducts.PURCHASE_STATE_PURCHASING:
                break;

              case InAppProducts.PURCHASE_STATE_FAILED:
                indicator.closeIndicator();
                Alloy.Globals.showFeedbackDialog("Köpet misslyckades! Vänligen försök igen.");
                break;

              case InAppProducts.PURCHASE_STATE_RESTORED:            }
            if (false === InAppProducts.autoCompletePurchases) switch (e.purchase.state) {
              case InAppProducts.PURCHASE_STATE_PURCHASED:
              case InAppProducts.PURCHASE_STATE_FAILED:
              case InAppProducts.PURCHASE_STATE_RESTORED:
                Ti.API.info("Completing purchase...");
                e.purchase.complete();
            }
        }
    }
    function addEventListeners() {
        InAppProducts.addEventListener("stateChange", stateChangeEventFunction);
        InAppProducts.addEventListener("receivedProducts", receivedProductsEventFunction);
        InAppProducts.addEventListener("purchaseUpdate", purchaseUpdateEventFunction);
    }
    function retry(identifier, receipt, msg) {
        var alertWindow = Titanium.UI.createAlertDialog({
            title: "Något gick fel!",
            message: msg,
            buttonNames: [ "OK", "Försök igen" ]
        });
        alertWindow.addEventListener("click", function(e) {
            switch (e.index) {
              case 0:
                alertWindow.hide();
                break;

              case 1:
                completePurchaseServer(identifier, receipt);
                alertWindow.hide();
            }
        });
        alertWindow.show();
    }
    function completePurchaseServer(identifier, receipt) {
        var receiptTextEncoded = Ti.Utils.base64encode(receipt).text;
        var receiptText64String = receiptTextEncoded.replace(/\r/g, "").replace(/\n/g, "");
        if (Alloy.Globals.checkConnection()) {
            var xhr = Titanium.Network.createHTTPClient();
            xhr.onerror = function() {
                indicator.closeIndicator();
                retry(identifier, receipt, "Något gick fel försök igen!");
            };
            try {
                xhr.open("POST", Alloy.Globals.BETKAMPENCOINSURL);
                xhr.setRequestHeader("content-type", "application/json");
                xhr.setTimeout(Alloy.Globals.TIMEOUT);
                var storeTest = 0;
                var param = '{"receipt":"' + receiptText64String + '", "coins_item":"' + identifier + '", "sandbox":"' + storeTest + '", "user":"' + Alloy.Globals.FACEBOOKOBJECT.id + '", "betkampen_id":"' + Alloy.Globals.BETKAMPENUID + '"}';
                xhr.send(param);
            } catch (e) {
                indicator.closeIndicator();
                retry(identifier, receipt, "Något gick fel försök igen!");
            }
            xhr.onload = function() {
                if ("200" == this.status) {
                    indicator.closeIndicator();
                    4 == this.readyState ? Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText)) : retry(identifier, receipt, JSON.parse(this.responseText));
                } else {
                    indicator.closeIndicator();
                    retry(identifier, receipt, JSON.parse(this.responseText));
                }
            };
        } else {
            indicator.closeIndicator();
            Alloy.Globals.showFeedbackDialog("Ingen anslutning!");
        }
    }
    function purchaseCurrentProduct(prod) {
        var developerPayloadRaw = Ti.Utils.base64encode(Alloy.Globals.FACEBOOKOBJECT.id).text;
        var appPayload = developerPayloadRaw.replace(/\r/g, "").replace(/\n/g, "");
        if (Alloy.Globals.checkConnection()) {
            var product = productObjects[prod];
            Ti.API.info("Purchasing product " + product.SKU + " with app payload " + appPayload);
            product.purchase({
                quantity: 1,
                applicationPayload: appPayload
            });
        } else Alloy.Globals.showFeedbackDialog("Ingen anslutning!");
    }
    function buildGUI(products) {
        try {
            products.sort(function(a, b) {
                if (a.priceAsNumber < b.priceAsNumber) return -1;
                if (a.priceAsNumber > b.priceAsNumber) return 1;
                return 0;
            });
        } catch (e) {}
        for (product in products) {
            var buyCoinsButton = Ti.UI.createButton({
                title: products[product].priceAsString,
                top: topPos,
                textAlign: "center",
                height: heightVal,
                width: "70%",
                borderRadius: 6,
                font: {
                    fontFamily: Alloy.Globals.getFont(),
                    fontSize: Alloy.Globals.getFontSize(2)
                },
                color: "#FFF",
                backgroundImage: "none",
                backgroundColor: "#58B101",
                index: product
            });
            buyCoinsButton.addEventListener("click", function(e) {
                purchaseCurrentProduct(e.source.index);
            });
            $.store.add(buyCoinsButton);
            $.store.add(Ti.UI.createLabel({
                top: 5,
                font: {
                    fontFamily: Alloy.Globals.getFont(),
                    fontSize: textFontSize
                },
                color: "#FFF",
                text: "Ger " + products[product].title,
                textAlign: "center"
            }));
        }
    }
    function fetchProductsError() {
        var alertWindow = Titanium.UI.createAlertDialog({
            title: "Något gick fel!",
            message: "Ett fel uppstod när vi försökte hämta tillgängliga produkter. Vänligen försök igen.",
            buttonNames: [ "Försök igen", "Stäng" ]
        });
        alertWindow.addEventListener("click", function(e) {
            switch (e.index) {
              case 0:
                alertWindow.hide();
                indicator.openIndicator();
                InAppProducts.getProducts({
                    SKUs: productIDs
                });
                break;

              case 1:
                alertWindow.hide();
            }
        });
        alertWindow.show();
    }
    function init() {
        Ti.API.info("Initializing app...");
        var imageView = Ti.UI.createImageView({
            height: 142,
            width: "100%",
            image: "/images/header.png"
        });
        imageView.add(Ti.UI.createLabel({
            top: 50,
            color: "#FFF",
            font: {
                fontFamily: Alloy.Globals.getFont(),
                fontSize: Alloy.Globals.getFontSize(3)
            },
            text: "Köp Coins"
        }));
        $.store.add(imageView);
        indicator.openIndicator();
        addEventListeners();
        if (InAppProducts.state === InAppProducts.STATE_READY) if (Alloy.Globals.checkConnection()) if (InAppProducts.getProducts({
            SKUs: productIDs
        })) Ti.API.info("getProducts request started successfully."); else {
            indicator.closeIndicator();
            fetchProductsError();
        } else {
            indicator.closeIndicator();
            Alloy.Globals.showFeedbackDialog("Ingen Anslutning!");
        }
        Ti.API.info("... initialization complete!");
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "store";
    if (arguments[0]) {
        __processArg(arguments[0], "__parentSymbol");
        __processArg(arguments[0], "$model");
        __processArg(arguments[0], "__itemTemplate");
    }
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
    var InAppProducts = require("com.logicallabs.inappproducts");
    var iOSVersion;
    iOSVersion = parseInt(Ti.Platform.version);
    var heightVal = 50;
    var topPos = 30;
    var textFontSize = Alloy.Globals.getFontSize(2);
    if (7 > iOSVersion) {
        heightVal = 40;
        topPos = 19;
        textFontSize = 16;
    }
    Ti.API.info("Module ready? " + (InAppProducts.getSupportStatus() !== InAppProducts.SUPPORT_STATUS_ERROR));
    var productIDs = [ "apps.topgame.betkampen.coins.20", "apps.topgame.betkampen.coins.40", "apps.topgame.betkampen.coins.100" ];
    var productObjects;
    var purchaseStateToString;
    purchaseStateToString = function(state) {
        switch (state) {
          case InAppProducts.PURCHASE_STATE_PURCHASED:
            return "purchased";

          case InAppProducts.PURCHASE_STATE_CANCELED:
            return "canceled";

          case InAppProducts.PURCHASE_STATE_REFUNDED:
            return "refunded";

          case InAppProducts.PURCHASE_STATE_PURCHASING:
            return "purchasing";

          case InAppProducts.PURCHASE_STATE_FAILED:
            return "failed";

          case InAppProducts.PURCHASE_STATE_RESTORED:
            return "restored";

          default:
            return "unknown";
        }
    };
    init();
    $.store.addEventListener("close", function() {
        InAppProducts.removeEventListener("stateChange", stateChangeEventFunction);
        InAppProducts.removeEventListener("receivedProducts", receivedProductsEventFunction);
        InAppProducts.removeEventListener("purchaseUpdate", purchaseUpdateEventFunction);
        indicator.closeIndicator();
        InAppProducts = null;
        $.destroy();
        $.store = null;
    });
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;