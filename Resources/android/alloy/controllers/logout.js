function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "logout";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    $.__views.logout = Ti.UI.createWindow({
        layout: "vertical",
        width: "100%",
        height: "100%",
        backgroundColor: "#303030",
        id: "logout"
    });
    $.__views.logout && $.addTopLevelView($.__views.logout);
    $.__views.logoutView = Ti.UI.createView({
        id: "logoutView"
    });
    $.__views.logout.add($.__views.logoutView);
    exports.destroy = function() {};
    _.extend($, $.__views);
    $.logoutView.add(Ti.UI.createLabel({
        text: "Du är nu utloggad, avsluta appen för att logga in igen.",
        color: "#FFF"
    }));
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;