function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function openChallengesForLeague(league) {
        var arg = {
            leagueId: league
        };
        var win = Alloy.createController("newChallenge", arg).getView();
        Alloy.Globals.WINDOWS.push(win);
        Alloy.Globals.NAV.openWindow(win, {
            animated: true
        });
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "newChallengeLeague";
    if (arguments[0]) {
        __processArg(arguments[0], "__parentSymbol");
        __processArg(arguments[0], "$model");
        __processArg(arguments[0], "__itemTemplate");
    }
    var $ = this;
    var exports = {};
    $.__views.newChallengeLeague = Ti.UI.createWindow({
        layout: "vertical",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        backgroundColor: "#303030",
        apiName: "Ti.UI.Window",
        classes: [ "container" ],
        id: "newChallengeLeague"
    });
    $.__views.newChallengeLeague && $.addTopLevelView($.__views.newChallengeLeague);
    exports.destroy = function() {};
    _.extend($, $.__views);
    Ti.App.addEventListener("sliderToggled", function(e) {
        "undefined" != typeof table && (table.touchEnabled = e.hasSlided ? false : true);
    });
    var table;
    var leagues = Alloy.Globals.LEAGUES;
    var tableHeaderView = Ti.UI.createView({
        height: "142dp",
        backgroundImage: "/images/header.png"
    });
    tableHeaderView.add(Ti.UI.createLabel({
        top: 50,
        text: Alloy.Globals.PHRASES.leagueChooseTxt,
        font: {
            fontSize: Alloy.Globals.getFontSize(3),
            fontWeight: "normal",
            fontFamily: Alloy.Globals.getFont()
        },
        color: "#FFF"
    }));
    table = Titanium.UI.createTableView({
        width: Ti.UI.FILL,
        left: 0,
        headerView: tableHeaderView,
        height: "100%",
        backgroundColor: "#303030",
        separatorColor: "#6d6d6d"
    });
    table.separatorInsets = {
        left: 0,
        right: 0
    };
    table.footerView = Ti.UI.createView({
        height: .5
    });
    var data = [];
    for (var i in leagues) {
        var child;
        child = true;
        var tableRow = $.UI.create("TableViewRow", {
            classes: [ "challengesSection" ],
            id: leagues[i].id,
            hasChild: child
        });
        if (true != child) {
            var fontawesome = require("lib/IconicFont").IconicFont({
                font: "lib/FontAwesome"
            });
            font = "fontawesome-webfont";
            tableRow.add(Ti.UI.createLabel({
                font: {
                    fontFamily: font
                },
                text: fontawesome.icon("icon-chevron-right"),
                right: "5%",
                color: "#FFF",
                fontSize: 80,
                height: "auto",
                width: "auto"
            }));
        }
        var url = leagues[i].logo.replace("logos", "logos/mobile");
        var finalUrl = url.replace(" ", "");
        var finalUrl = finalUrl.toLowerCase();
        var imageLocation = Alloy.Globals.BETKAMPENURL + finalUrl;
        var leagueImageView = Ti.UI.createImageView({
            top: 10,
            left: 5,
            height: 40,
            width: 40,
            image: imageLocation
        });
        leagueImageView.addEventListener("error", function() {
            leagueImageView.image = "/images/Skapa_Utmaning.png";
        });
        tableRow.add(leagueImageView);
        tableRow.add(Ti.UI.createLabel({
            width: "80%",
            height: "auto",
            left: 60,
            top: 15,
            text: leagues[i].name,
            font: {
                fontSize: Alloy.Globals.getFontSize(2),
                fontWeight: "normal",
                fontFamily: Alloy.Globals.getFont()
            },
            color: "#FFF"
        }));
        tableRow.className = "league";
        data.push(tableRow);
    }
    table.setData(data);
    table.addEventListener("click", function(e) {
        if (2 == Alloy.Globals.SLIDERZINDEX) return;
        Alloy.Globals.checkConnection() ? openChallengesForLeague(e.row.id) : Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    });
    $.newChallengeLeague.add(table);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;