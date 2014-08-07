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
    this.__controllerPath = "menurow";
    if (arguments[0]) {
        __processArg(arguments[0], "__parentSymbol");
        __processArg(arguments[0], "$model");
        __processArg(arguments[0], "__itemTemplate");
    }
    var $ = this;
    var exports = {};
    $.__views.row = Ti.UI.createTableViewRow({
        height: "60dp",
        selectedBackgroundColor: "#303030",
        selectedColor: "white",
        backgroundColor: "#40000000",
        apiName: "Ti.UI.TableViewRow",
        id: "row",
        classes: []
    });
    $.__views.row && $.addTopLevelView($.__views.row);
    $.__views.icon = Ti.UI.createImageView({
        width: "38dp",
        left: "5dp",
        apiName: "Ti.UI.ImageView",
        id: "icon",
        classes: []
    });
    $.__views.row.add($.__views.icon);
    $.__views.__alloyId11 = Ti.UI.createView({
        layout: "vertical",
        height: Ti.UI.SIZE,
        apiName: "Ti.UI.View",
        classes: [ "vgroup" ],
        id: "__alloyId11"
    });
    $.__views.row.add($.__views.__alloyId11);
    $.__views.title = Ti.UI.createLabel({
        color: "#FFF",
        font: {
            fontSize: "20",
            font: "Helvetica"
        },
        left: "54dp",
        apiName: "Ti.UI.Label",
        id: "title",
        classes: []
    });
    $.__views.__alloyId11.add($.__views.title);
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