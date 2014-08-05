function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "view2";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    $.__views.view2 = Ti.UI.createView({
        id: "view2"
    });
    $.__views.view2 && $.addTopLevelView($.__views.view2);
    var __alloyId5 = [];
    $.__views.sectionFruit = Ti.UI.createTableViewSection({
        id: "sectionFruit",
        headerTitle: "Fruit"
    });
    __alloyId5.push($.__views.sectionFruit);
    $.__views.__alloyId6 = Ti.UI.createTableViewRow({
        title: "Apple",
        id: "__alloyId6"
    });
    $.__views.sectionFruit.add($.__views.__alloyId6);
    $.__views.__alloyId7 = Ti.UI.createTableViewRow({
        title: "Bananas",
        id: "__alloyId7"
    });
    $.__views.sectionFruit.add($.__views.__alloyId7);
    $.__views.sectionVeg = Ti.UI.createTableViewSection({
        id: "sectionVeg",
        headerTitle: "Vegetables"
    });
    __alloyId5.push($.__views.sectionVeg);
    $.__views.__alloyId8 = Ti.UI.createTableViewRow({
        title: "Carrots",
        id: "__alloyId8"
    });
    $.__views.sectionVeg.add($.__views.__alloyId8);
    $.__views.__alloyId9 = Ti.UI.createTableViewRow({
        title: "Potatoes",
        id: "__alloyId9"
    });
    $.__views.sectionVeg.add($.__views.__alloyId9);
    $.__views.sectionFish = Ti.UI.createTableViewSection({
        id: "sectionFish",
        headerTitle: "Fish"
    });
    __alloyId5.push($.__views.sectionFish);
    $.__views.__alloyId10 = Ti.UI.createTableViewRow({
        title: "Cod",
        id: "__alloyId10"
    });
    $.__views.sectionFish.add($.__views.__alloyId10);
    $.__views.__alloyId11 = Ti.UI.createTableViewRow({
        title: "Haddock",
        id: "__alloyId11"
    });
    $.__views.sectionFish.add($.__views.__alloyId11);
    $.__views.table = Ti.UI.createTableView({
        data: __alloyId5,
        id: "table"
    });
    $.__views.view2.add($.__views.table);
    exports.destroy = function() {};
    _.extend($, $.__views);
    Ti.App.addEventListener("sliderToggled", function(e) {
        $.table.touchEnabled = e.hasSlided ? false : true;
    });
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;