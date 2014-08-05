function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "terms";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
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
    $.terms.orientationModes = [ Titanium.UI.PORTRAIT ];
    $.terms.addEventListener("open", function() {
        $.terms.activity.actionBar.onHomeIconItemSelected = function() {
            $.terms.close();
            $.terms = null;
        };
        $.terms.activity.actionBar.displayHomeAsUp = true;
        $.terms.activity.actionBar.title = "Betkampen";
        indicator.openIndicator();
    });
    var extwebview;
    extwebview = Titanium.UI.createWebView({
        top: 0,
        left: 0,
        right: 0,
        url: url,
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        backgroundColor: "#303030",
        softKeyboardOnFocus: Titanium.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS
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