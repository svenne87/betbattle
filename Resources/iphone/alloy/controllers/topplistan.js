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
    this.__controllerPath = "topplistan";
    if (arguments[0]) {
        __processArg(arguments[0], "__parentSymbol");
        __processArg(arguments[0], "$model");
        __processArg(arguments[0], "__itemTemplate");
    }
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