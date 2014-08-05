function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "menuview";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    $.__views.menuView = Ti.UI.createView({
        id: "menuView"
    });
    $.__views.menuView && $.addTopLevelView($.__views.menuView);
    $.__views.menuTopBar = Ti.UI.createView({
        id: "menuTopBar"
    });
    $.__views.menuView.add($.__views.menuTopBar);
    var __alloyId17 = [];
    $.__views.row1 = Ti.UI.createTableViewRow({
        id: "row1"
    });
    __alloyId17.push($.__views.row1);
    $.__views.rowContainer = Ti.UI.createView({
        id: "rowContainer"
    });
    $.__views.row1.add($.__views.rowContainer);
    $.__views.rowSkull = Ti.UI.createView({
        id: "rowSkull"
    });
    $.__views.rowContainer.add($.__views.rowSkull);
    $.__views.rowLabel = Ti.UI.createLabel({
        text: "Home",
        id: "rowLabel"
    });
    $.__views.rowContainer.add($.__views.rowLabel);
    $.__views.row2 = Ti.UI.createTableViewRow({
        id: "row2"
    });
    __alloyId17.push($.__views.row2);
    $.__views.rowContainer = Ti.UI.createView({
        id: "rowContainer"
    });
    $.__views.row2.add($.__views.rowContainer);
    $.__views.rowGear = Ti.UI.createView({
        id: "rowGear"
    });
    $.__views.rowContainer.add($.__views.rowGear);
    $.__views.rowLabel = Ti.UI.createLabel({
        text: "Configurations",
        id: "rowLabel"
    });
    $.__views.rowContainer.add($.__views.rowLabel);
    $.__views.menuTable = Ti.UI.createTableView({
        data: __alloyId17,
        id: "menuTable"
    });
    $.__views.menuView.add($.__views.menuTable);
    exports.destroy = function() {};
    _.extend($, $.__views);
    arguments[0] || {};
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;