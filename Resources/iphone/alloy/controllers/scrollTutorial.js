function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "scrollTutorial";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    $.__views.tutorialScroll = Ti.UI.createWindow({
        layout: "vertical",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        backgroundColor: "#000",
        id: "tutorialScroll"
    });
    $.__views.tutorialScroll && $.addTopLevelView($.__views.tutorialScroll);
    var __alloyId3 = [];
    $.__views.view1 = Ti.UI.createView({
        id: "view1",
        backgroundImage: "/images/tutone.png"
    });
    __alloyId3.push($.__views.view1);
    $.__views.view1 = Ti.UI.createView({
        id: "view1",
        backgroundImage: "/images/tuttwo.png"
    });
    __alloyId3.push($.__views.view1);
    $.__views.view1 = Ti.UI.createView({
        id: "view1",
        backgroundImage: "/images/tutthree.png"
    });
    __alloyId3.push($.__views.view1);
    $.__views.view1 = Ti.UI.createView({
        id: "view1",
        backgroundImage: "/images/tutfour.png"
    });
    __alloyId3.push($.__views.view1);
    $.__views.view1 = Ti.UI.createView({
        id: "view1",
        backgroundImage: "/images/tutfive.png"
    });
    __alloyId3.push($.__views.view1);
    $.__views.scrollableView = Ti.UI.createScrollableView({
        top: "5%",
        height: "85%",
        width: "100%",
        views: __alloyId3,
        id: "scrollableView",
        showPagingControl: "true"
    });
    $.__views.tutorialScroll.add($.__views.scrollableView);
    $.__views.leaveBtn = Ti.UI.createButton({
        height: "10%",
        width: "100%",
        backgroundColor: "#FFF",
        color: "#000",
        font: {
            fontFamily: "Helvetica Neue",
            fontSize: 14,
            fontWeight: "normal"
        },
        title: "Stäng tutorial",
        id: "leaveBtn"
    });
    $.__views.tutorialScroll.add($.__views.leaveBtn);
    exports.destroy = function() {};
    _.extend($, $.__views);
    $.leaveBtn.addEventListener("click", function() {
        var children = $.scrollableView.getChildren();
        for (child in children) {
            children.remove(children[child]);
            children[child] = null;
        }
        children = null;
        $.tutorialScroll.close();
        $.tutorialScroll = null;
    });
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;