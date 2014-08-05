function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "home";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    $.__views.home = Ti.UI.createview({
        layout: "vertical",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        backgroundColor: "white",
        id: "home"
    });
    $.__views.home && $.addTopLevelView($.__views.home);
    $.__views.header = Ti.UI.createview({
        layout: "horizontal",
        height: "20%",
        width: Ti.UI.FILL,
        backgroundColor: "#d85000",
        id: "header"
    });
    $.__views.home.add($.__views.header);
    $.__views.content = Ti.UI.createview({
        layout: "vertical",
        height: "60%",
        width: Ti.UI.FILL,
        backgroundColor: "#ccc",
        id: "content"
    });
    $.__views.home.add($.__views.content);
    $.__views.footer = Ti.UI.createview({
        layout: "horizontal",
        height: "20%",
        width: Ti.UI.FILL,
        backgroundColor: "#fff",
        id: "footer"
    });
    $.__views.home.add($.__views.footer);
    exports.destroy = function() {};
    _.extend($, $.__views);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;