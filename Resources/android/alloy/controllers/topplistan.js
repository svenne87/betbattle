function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "topplistan";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    $.__views.scoreView = Ti.UI.createWindow({
        layout: "vertical",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        backgroundColor: "#303030",
        id: "scoreView"
    });
    $.__views.scoreView && $.addTopLevelView($.__views.scoreView);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var uie = require("lib/IndicatorWindow");
    var indicator = uie.createIndicatorWindow({
        top: 200
    });
    var url = Alloy.Globals.BETKAMPENURL + "/webviews/scoreboard_wv.php";
    var win = $.scoreView;
    $.scoreView.orientationModes = [ Titanium.UI.PORTRAIT ];
    $.scoreView.addEventListener("open", function() {
        $.scoreView.activity.actionBar.onHomeIconItemSelected = function() {
            $.scoreView.close();
            $.scoreView = null;
        };
        $.scoreView.activity.actionBar.displayHomeAsUp = true;
        $.scoreView.activity.actionBar.title = "Betkampen";
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
    win.add(extwebview);
    extwebview.addEventListener("load", function() {
        indicator.closeIndicator();
    });
    win.addEventListener("close", function() {
        indicator.closeIndicator();
    });
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;