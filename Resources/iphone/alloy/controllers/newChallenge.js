function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function createGameListObject(response) {
        var array = [];
        for (var i = 0; response.length > i; i++) {
            var gameValues = [];
            for (var x = 0; response[i].game_values.length > x; x++) {
                var gameValue = response[i].game_values[x];
                gameValues.push(gameValue);
            }
            var team_1 = {
                team_id: response[i].team_1.team_id,
                team_logo: response[i].team_1.team_logo,
                team_name: response[i].team_1.team_name
            };
            var team_2 = {
                team_id: response[i].team_2.team_id,
                team_logo: response[i].team_2.team_logo,
                team_name: response[i].team_2.team_name
            };
            var gameListObject = Alloy.createModel("gameListObject", {
                game_id: response[i].game_id,
                game_type: response[i].game_type,
                game_date: response[i].game_date,
                status: response[i].status,
                league_id: response[i].league_id,
                round: response[i].round_id,
                team_1: team_1,
                team_2: team_2,
                game_values: gameValues
            });
            array.push(gameListObject);
        }
        return array;
    }
    function createNoGamesView() {
        $.newChallenge.add(Ti.UI.createLabel({
            width: "100%",
            text: Alloy.Globals.PHRASES.noGamesTxt,
            left: 60,
            top: 40,
            font: {
                fontSize: Alloy.Globals.getFontSize(2),
                fontWeight: "400",
                fontFamily: Alloy.Globals.getFont()
            },
            color: "#FFF"
        }));
    }
    function createTableRow(obj) {
        var dateFix = parseInt(obj.attributes.game_date + "000");
        var date = new Date(dateFix);
        var dateString = date.toUTCString();
        dateString = dateString.substring(5, dateString.length - 7);
        var child;
        child = true;
        var row = $.UI.create("TableViewRow", {
            classes: [ "challengesSectionDefault" ],
            id: obj.attributes.round,
            hasChild: child
        });
        if (true != child) {
            var fontawesome = require("lib/IconicFont").IconicFont({
                font: "lib/FontAwesome"
            });
            var font = "FontAwesome";
            var rightPercentage = "5%";
            row.add(Ti.UI.createLabel({
                font: {
                    fontFamily: font
                },
                text: fontawesome.icon("icon-chevron-right"),
                right: rightPercentage,
                color: "#FFF",
                fontSize: 80,
                height: "auto",
                width: "auto"
            }));
        }
        row.add(Ti.UI.createLabel({
            text: dateString,
            top: 10,
            left: 20,
            font: {
                fontSize: Alloy.Globals.getFontSize(1),
                fontWeight: "normal",
                fontFamily: Alloy.Globals.getFont()
            },
            color: "#FFF"
        }));
        row.add(Ti.UI.createLabel({
            text: obj.attributes.team_1.team_name + " - " + obj.attributes.team_2.team_name,
            top: 30,
            left: 20,
            font: {
                fontSize: Alloy.Globals.getFontSize(1),
                fontWeight: "normal",
                fontFamily: Alloy.Globals.getFont()
            },
            color: "#FFF"
        }));
        row.add(Ti.UI.createView({
            top: 50,
            layout: "vertical",
            height: 12
        }));
        row.gameID = obj.attributes.game_id;
        row.teamNames = obj.attributes.team_1.team_name + " - " + obj.attributes.team_2.team_name;
        row.className = date.toUTCString();
        return row;
    }
    function createAndShowTableView(league, array) {
        Ti.API.info("Array" + JSON.stringify(array));
        var children = $.newChallenge.children;
        for (var i = 0; children.length > i; i++) "newChallengeTable" === children[i].id && $.newChallenge.remove(children[i]);
        leagueId = league;
        for (var i in Alloy.Globals.LEAGUES) Alloy.Globals.LEAGUES[i].id == leagueId && (leagueName = Alloy.Globals.LEAGUES[i].name);
        var tableView = Ti.UI.createView({
            heigth: "100%",
            width: "100%",
            layout: "vertical",
            id: "newChallengeTable"
        });
        refresher = Ti.UI.createRefreshControl({
            tintColor: Alloy.Globals.themeColor()
        });
        refresher.addEventListener("refreshstart", function() {
            if (Alloy.Globals.checkConnection()) getGames(leagueId); else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
                refresher.endRefreshing();
            }
        });
        var tableHeaderView = Ti.UI.createView({
            height: "10%",
            width: Ti.UI.FILL,
            backgroundColor: "transparent"
        });
        tableHeaderView.add(Ti.UI.createLabel({
            text: Alloy.Globals.PHRASES.pickMatchTxt,
            textAlign: "center",
            color: "#FFF",
            font: {
                fontSize: Alloy.Globals.getFontSize(2),
                fontFamily: "Impact"
            }
        }));
        table = Ti.UI.createTableView({
            headerView: tableHeaderView,
            height: "auto",
            refreshControl: refresher,
            backgroundColor: "#303030",
            separatorInsets: {
                left: 0,
                right: 0
            }
        });
        var footerView = Ti.UI.createView({
            height: 60,
            backgroundColor: "transparent",
            layout: "vertical"
        });
        footerView.add(Ti.UI.createLabel({
            text: Alloy.Globals.PHRASES.showningMatchesTxt + ": 1-10",
            textAlign: "center",
            color: Alloy.Globals.themeColor(),
            font: {
                fontSize: 10,
                fontFamily: Alloy.Globals.getFont()
            }
        }));
        footerView.add(Ti.UI.createLabel({
            text: Alloy.Globals.PHRASES.loadMoreTxt + "...",
            textAlign: "center",
            color: Alloy.Globals.themeColor(),
            font: {
                fontSize: 10,
                fontFamily: Alloy.Globals.getFont()
            }
        }));
        footerView.addEventListener("click", function() {
            Ti.API.log("load more...");
            table.appendRow(createTableRow(array[0]));
        });
        table.footerView = footerView;
        var data = [];
        for (var i = 0; array.length > i; i++) data.push(createTableRow(array[i]));
        table.setData(data);
        table.addEventListener("click", function(e) {
            if (2 == Alloy.Globals.SLIDERZINDEX) return;
            if (null !== e.rowData && "undefined" != typeof e.rowData.id) {
                Ti.API.info("maatch" + JSON.stringify(e.rowData));
                var matchDate = new Date(e.rowData.className);
                matchDate.setHours(matchDate.getHours() - 2);
                var now = new Date();
                var teamNames = e.rowData.teamNames;
                var gameID = e.rowData.gameID;
                if (now.getTime() > matchDate.getTime()) Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.roundHasStartedErrorTxt); else {
                    var arg = {
                        round: e.row.id,
                        leagueName: leagueName,
                        leagueId: leagueId,
                        teamNames: teamNames,
                        gameID: gameID
                    };
                    var win = Alloy.createController("challenge", arg).getView();
                    Alloy.Globals.WINDOWS.push(win);
                    Alloy.Globals.NAV.openWindow(win, {
                        animated: true
                    });
                }
            }
        });
        tableView.add(table);
        $.newChallenge.add(tableView);
    }
    function getGames(league) {
        if (Alloy.Globals.checkConnection()) {
            indicator.openIndicator();
            var xhr = Titanium.Network.createHTTPClient();
            xhr.onerror = function(e) {
                Ti.API.error("Bad Sever =>" + e.error);
                indicator.closeIndicator();
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                "undefined" != typeof refresher && refresher.endRefreshing();
            };
            try {
                xhr.open("GET", Alloy.Globals.BETKAMPENGETGAMESURL + "/?uid=" + Alloy.Globals.BETKAMPENUID + "&league=" + league + "&lang=" + Alloy.Globals.LOCALE);
                xhr.setRequestHeader("content-type", "application/json");
                xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
                xhr.setTimeout(Alloy.Globals.TIMEOUT);
                xhr.send();
            } catch (e) {
                indicator.closeIndicator();
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                "undefined" != typeof refresher && refresher.endRefreshing();
            }
            xhr.onload = function() {
                if ("200" == this.status) {
                    if (4 == this.readyState) {
                        Ti.API.info("getGames = " + JSON.stringify(this.responseText));
                        var response = JSON.parse(this.responseText);
                        var array = createGameListObject(response);
                        array.length > 0 ? createAndShowTableView(league, array) : createNoGamesView();
                    } else Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                    indicator.closeIndicator();
                } else {
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                    indicator.closeIndicator();
                    "undefined" != typeof refresher && refresher.endRefreshing();
                    Ti.API.error("Error =>" + this.response);
                }
            };
        } else Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "newChallenge";
    if (arguments[0]) {
        __processArg(arguments[0], "__parentSymbol");
        __processArg(arguments[0], "$model");
        __processArg(arguments[0], "__itemTemplate");
    }
    var $ = this;
    var exports = {};
    $.__views.newChallenge = Ti.UI.createWindow({
        layout: "vertical",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        backgroundColor: "#303030",
        apiName: "Ti.UI.Window",
        classes: [ "container" ],
        id: "newChallenge"
    });
    $.__views.newChallenge && $.addTopLevelView($.__views.newChallenge);
    exports.destroy = function() {};
    _.extend($, $.__views);
    Ti.App.addEventListener("sliderToggled", function(e) {
        "undefined" != typeof table && (table.touchEnabled = e.hasSlided ? false : true);
    });
    Ti.App.addEventListener("newChallengeRefresh", function() {
        indicator.openIndicator();
        getGames(leagueId);
    });
    var leagueName = "";
    var leagueId = -1;
    var table;
    var refresher;
    var uie = require("lib/IndicatorWindow");
    var indicator = uie.createIndicatorWindow({
        top: 200,
        text: Alloy.Globals.PHRASES.loadingTxt
    });
    require("lib/IconicFont").IconicFont({
        font: "lib/FontAwesome"
    });
    $.newChallenge.addEventListener("close", function() {
        indicator.closeIndicator();
    });
    var args = arguments[0] || {};
    if ("undefined" != typeof args.leagueId) {
        leagueId = args.leagueId;
        getGames(leagueId);
    }
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;