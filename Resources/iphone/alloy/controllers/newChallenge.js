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
    function createAndShowTableView(league, array) {
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
            height: "142dp",
            backgroundImage: "/images/header.png"
        });
        var nameFont = Alloy.Globals.getFontSize(3);
        leagueName.length > 13 && (nameFont = 32);
        tableHeaderView.add(Ti.UI.createLabel({
            width: "100%",
            textAlign: "center",
            top: 50,
            text: leagueName,
            font: {
                fontSize: nameFont,
                fontWeight: "normal",
                fontFamily: Alloy.Globals.getFont()
            },
            color: "#FFF"
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
        table.footerView = Ti.UI.createView({
            height: .5,
            backgroundColor: "#6d6d6d"
        });
        var data = [];
        for (var i = 0; array.length > i; i++) {
            var dateFix = parseInt(array[i].attributes.game_date + "000");
            var date = new Date(dateFix);
            var dateString = date.toUTCString();
            dateString = dateString.substring(5, dateString.length - 3);
            var subRow = Ti.UI.createTableViewRow({
                layout: "vertical",
                selectionStyle: "none",
                backgroundColor: "#303030"
            });
            subRow.footerView = Ti.UI.createView({
                height: .5,
                backgroundColor: "#6d6d6d"
            });
            subRow.add(Ti.UI.createView({
                height: 12
            }));
            for (var x = 0; array[i].attributes.game_values.length > x; x++) subRow.add(Ti.UI.createLabel({
                text: array[i].attributes.game_values[x],
                left: 60,
                font: {
                    fontSize: Alloy.Globals.getFontSize(1),
                    fontWeight: "normal",
                    fontFamily: Alloy.Globals.getFont()
                },
                color: "#FFF",
                backgroundColor: "#303030"
            }));
            subRow.add(Ti.UI.createView({
                height: 12
            }));
            var subRowArray = [];
            subRowArray.push(subRow);
            var rowChild;
            rowChild = true;
            var row = $.UI.create("TableViewRow", {
                classes: [ "challengesSection" ],
                id: array[i].attributes.round,
                sub: subRowArray,
                opened: false,
                isparent: true
            });
            var themeColor = Alloy.Globals.themeColor();
            "#ea7337" === Alloy.Globals.themeColor() && (themeColor = "FFF");
            row.add(Ti.UI.createLabel({
                text: dateString,
                top: 10,
                left: 60,
                font: {
                    fontSize: Alloy.Globals.getFontSize(1),
                    fontWeight: "normal",
                    fontFamily: Alloy.Globals.getFont()
                },
                color: themeColor
            }));
            row.add(Ti.UI.createLabel({
                text: Alloy.Globals.PHRASES.nrOfGamesTxt + " " + array[i].attributes.game_values.length,
                top: 30,
                left: 60,
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
            var detailsImg = Ti.UI.createImageView({
                name: "detailsBtn",
                width: 35,
                height: 35,
                top: 11,
                left: 5,
                id: array[i].attributes.round,
                image: "/images/p.png"
            });
            row.add(detailsImg);
            row.className = date.toUTCString();
            data.push(row);
        }
        table.setData(data);
        table.addEventListener("click", function(e) {
            if (2 == Alloy.Globals.SLIDERZINDEX) return;
            if ("detailsBtn" === e.source.name) {
                e.source.image = "/images/p.png" == e.source.image ? "/images/m.png" : "/images/p.png";
                if (e.row.isparent) if (e.row.opened) {
                    for (var i = e.row.sub.length; i > 0; i -= 1) table.deleteRow(e.index + i);
                    e.row.opened = false;
                } else {
                    var currentIndex = e.index;
                    for (var i = 0; e.row.sub.length > i; i++) {
                        table.insertRowAfter(currentIndex, e.row.sub[i]);
                        currentIndex++;
                    }
                    e.row.opened = true;
                }
            } else if (null !== e.rowData && "undefined" != typeof e.rowData.id) {
                var matchDate = new Date(e.rowData.className);
                matchDate.setHours(matchDate.getHours() - 2);
                var now = new Date();
                if (now.getTime() > matchDate.getTime()) Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.roundHasStartedErrorTxt); else {
                    var arg = {
                        round: e.row.id,
                        leagueName: leagueName,
                        leagueId: leagueId
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
                xhr.open("GET", Alloy.Globals.BETKAMPENGETGAMESURL + "/?uid=" + Alloy.Globals.BETKAMPENUID + "&league=" + league);
                xhr.setRequestHeader("content-type", "application/json");
                xhr.setRequestHeader("Authorization", Alloy.Globals.FACEBOOK.accessToken);
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
    {
        require("lib/IconicFont").IconicFont({
            font: "lib/FontAwesome"
        });
    }
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