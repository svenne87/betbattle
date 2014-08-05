function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "menurow";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    $.__views.row = Ti.UI.createTableViewRow({
        height: "60dp",
        selectedBackgroundColor: "#303030",
        selectedColor: "white",
        backgroundColor: "#40000000",
        id: "row"
    });
    $.__views.row && $.addTopLevelView($.__views.row);
    $.__views.icon = Ti.UI.createImageView({
        width: "38dp",
        height: "38dp",
        left: "5dp",
        top: "9dp",
        id: "icon"
    });
    $.__views.row.add($.__views.icon);
    $.__views.__alloyId16 = Ti.UI.createView({
        layout: "vertical",
        height: Ti.UI.SIZE,
        id: "__alloyId16"
    });
    $.__views.row.add($.__views.__alloyId16);
    $.__views.title = Ti.UI.createLabel({
        color: "#FFF",
        font: {
            fontSize: "20",
            fontFamily: "Roboto-Regular"
        },
        left: "54dp",
        id: "title"
    });
    $.__views.__alloyId16.add($.__views.title);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var args = arguments[0] || {};
    $.icon.image = args.image;
    $.title.text = args.title || "";
    $.row.customView = args.customView || "";
    $.row.customTitle = $.title;
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;