function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "terms";
    if (arguments[0]) {
        __processArg(arguments[0], "__parentSymbol");
        __processArg(arguments[0], "$model");
        __processArg(arguments[0], "__itemTemplate");
    }
    var $ = this;
    var exports = {};
    $.__views.terms = Ti.UI.createWindow({
        layout: "vertical",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        backgroundColor: "#303030",
        id: "terms"
    });
    $.__views.terms && $.addTopLevelView($.__views.terms);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var uie = require("lib/IndicatorWindow");
    var indicator = uie.createIndicatorWindow({
        top: 200
    });
    var url = Alloy.Globals.BETKAMPENURL + "/webviews/terms_wv.php";
    var win = $.terms;
    indicator.openIndicator();
    var extwebview;
    extwebview = Titanium.UI.createWebView({
        top: 0,
        left: 0,
        right: 0,
        url: url,
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        backgroundColor: "#303030"
    });
    extwebview.hideLoadIndicator = true;
    extwebview.addEventListener("load", function() {
        indicator.closeIndicator();
    });
    win.addEventListener("close", function() {
        indicator.closeIndicator();
    });
    win.add(extwebview);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;