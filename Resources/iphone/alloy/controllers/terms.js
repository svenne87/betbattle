function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function onOpen() {
        isAndroid && context.on("termsActivity", this.activity);
    }
    function onClose() {
        isAndroid && context.off("termsActivity");
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "terms";
    if (arguments[0]) {
        {
            __processArg(arguments[0], "__parentSymbol");
        }
        {
            __processArg(arguments[0], "$model");
        }
        {
            __processArg(arguments[0], "__itemTemplate");
        }
    }
    var $ = this;
    var exports = {};
    var __defers = {};
    $.__views.terms = Ti.UI.createWindow({
        layout: "vertical",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        backgroundColor: "#303030",
        translucent: false,
        barColor: "black",
        apiName: "Ti.UI.Window",
        classes: [ "container" ],
        id: "terms"
    });
    $.__views.terms && $.addTopLevelView($.__views.terms);
    onOpen ? $.__views.terms.addEventListener("open", onOpen) : __defers["$.__views.terms!open!onOpen"] = true;
    onClose ? $.__views.terms.addEventListener("close", onClose) : __defers["$.__views.terms!close!onClose"] = true;
    exports.destroy = function() {};
    _.extend($, $.__views);
    var uie = require("lib/IndicatorWindow");
    var context;
    var isAndroid = false;
    var indicator = uie.createIndicatorWindow({
        top: 200,
        text: Alloy.Globals.PHRASES.loadingTxt
    });
    var url = Alloy.Globals.BETKAMPENURL + "/webviews/terms_wv.php";
    var win = $.terms;
    var extwebview;
    $.terms.titleControl = Ti.UI.createLabel({
        text: Alloy.Globals.PHRASES.termsTxt,
        font: Alloy.Globals.getFontCustom(18, "Bold"),
        color: "#FFF"
    });
    indicator.openIndicator();
    extwebview = Titanium.UI.createWebView({
        top: 0,
        left: 0,
        right: 0,
        url: url,
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        backgroundColor: "#000"
    });
    extwebview.hideLoadIndicator = true;
    extwebview.addEventListener("load", function() {
        indicator.closeIndicator();
    });
    win.addEventListener("close", function() {
        indicator.closeIndicator();
    });
    win.add(extwebview);
    __defers["$.__views.terms!open!onOpen"] && $.__views.terms.addEventListener("open", onOpen);
    __defers["$.__views.terms!close!onClose"] && $.__views.terms.addEventListener("close", onClose);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;