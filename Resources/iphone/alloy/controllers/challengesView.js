function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function getUserInfo() {
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            userInfoCoinsLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
            userInfoWinsLabel.setText("");
            Ti.API.error("Bad Sever =>" + e.error);
        };
        try {
            xhr.open("POST", Alloy.Globals.BETKAMPENUSERURL + "?uid=" + Alloy.Globals.BETKAMPENUID);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setRequestHeader("Authorization", Alloy.Globals.FACEBOOK.accessToken);
            xhr.setTimeout(Alloy.Globals.TIMEOUT);
            xhr.send();
        } catch (e) {
            userInfoCoinsLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
            userInfoWinsLabel.setText("");
        }
        xhr.onload = function() {
            if ("200" == this.status) {
                if (4 == this.readyState) {
                    var userInfo = null;
                    try {
                        userInfo = JSON.parse(this.responseText);
                    } catch (e) {
                        userInfo = null;
                    }
                    if (null !== userInfo) {
                        userInfoCoinsLabel.setText(Alloy.Globals.PHRASES.coinsInfoTxt + ": " + userInfo.totalCoins);
                        userInfoWinsLabel.setText(Alloy.Globals.PHRASES.winningsInfoTxt + ": " + userInfo.points);
                    }
                }
            } else {
                userInfoCoinsLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
                userInfoWinsLabel.setText("");
                Ti.API.error("Error =>" + this.response);
            }
        };
    }
    function checkTournament(obj) {
        var opponents = obj.attributes.opponents;
        for (opponent in opponents) if (opponents[opponent].fbid === Alloy.Globals.FACEBOOKOBJECT.attributes.id && 2 == opponents[opponent].status) return true;
        return false;
    }
    function checkActiveUsers(array) {
        var activeUserCount = 0;
        for (a in array) "2" == array[a].status && activeUserCount++;
        return activeUserCount;
    }
    function getDynamicLeftPos(oppCount) {
        var dynamicLeftPos;
        var dynamicLeftPos = 80;
        oppCount > 9 && 99 >= oppCount ? dynamicLeftPos = 85 : oppCount > 99 && 999 >= oppCount && (dynamicLeftPos = 90);
        return dynamicLeftPos;
    }
    function showChallengeInWebView(challengeId, roundId, groupName) {
        if (Alloy.Globals.checkConnection()) {
            var url;
            null === groupName && (groupName = "");
            url = -1 == roundId ? Alloy.Globals.BETKAMPENURL + "/webviews/show_challenge_wv.php?fbid=" + Alloy.Globals.FACEBOOKOBJECT.id + "&uid=" + Alloy.Globals.BETKAMPENUID + "&cid=" + challengeId + "&group=" + groupName : Alloy.Globals.BETKAMPENURL + "/webviews/show_challenge_wv.php?fbid=" + Alloy.Globals.FACEBOOKOBJECT.id + "&uid=" + Alloy.Globals.BETKAMPENUID + "&tid=" + challengeId + "&rid=" + roundId + "&group=" + groupName;
            var win = Ti.UI.createWindow({});
            indicator.openIndicator();
            var extwebview;
            extwebview = Titanium.UI.createWebView({
                top: 0,
                left: 0,
                right: 0,
                url: url,
                height: Ti.UI.FILL,
                width: Ti.UI.FILL,
                backgroundColor: "#303030"
            });
            extwebview.hideLoadIndicator = true;
            win.add(extwebview);
            extwebview.addEventListener("load", function() {
                indicator.closeIndicator();
            });
            Alloy.Globals.NAV.openWindow(win, {
                animated: true
            });
            win.addEventListener("close", function() {
                indicator.closeIndicator();
            });
        } else Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }
    function createSectionsForTable(sectionText) {
        var sectionView = $.UI.create("View", {
            classes: [ "challengesSection" ]
        });
        sectionView.add(Ti.UI.createLabel({
            top: "25%",
            width: "100%",
            textAlign: "center",
            text: sectionText,
            font: {
                fontSize: Alloy.Globals.getFontSize(2),
                fontWeight: "normal",
                fontFamily: Alloy.Globals.getFont()
            },
            color: "#FFF"
        }));
        return Ti.UI.createTableViewSection({
            headerView: sectionView,
            footerView: Ti.UI.createView({
                height: .1
            })
        });
    }
    function createEmptyTableRow(text) {
        var row = Ti.UI.createTableViewRow({
            hasChild: false,
            width: Ti.UI.FILL,
            left: 0,
            name: "empty",
            height: 60
        });
        row.add(Ti.UI.createLabel({
            text: Alloy.Globals.PHRASES.noneTxt + " " + text + " " + Alloy.Globals.PHRASES.foundTxt,
            left: 60,
            font: {
                fontSize: Alloy.Globals.getFontSize(1),
                fontWeight: "normal",
                fontFamily: Alloy.Globals.getFont()
            },
            color: "#FFF"
        }));
        7 > iOSVersion && row.add(Ti.UI.createView({
            height: .5,
            top: 57,
            backgroundColor: "#6d6d6d",
            width: "120%"
        }));
        return row;
    }
    function constructChallengeRows(obj, index, type) {
        var child = true;
        var row = Ti.UI.createTableViewRow({
            id: index,
            hasChild: child,
            width: Ti.UI.FILL,
            left: 0,
            className: type,
            height: 70
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
        var imageLocation;
        imageLocation = "tournament" === type || "tournament_finished" === type ? "/images/Topplista.png" : "/images/ikon_spelanasta.png";
        row.add(Ti.UI.createImageView({
            image: imageLocation,
            left: 15,
            top: 20,
            width: 30,
            height: 30
        }));
        var date = obj.attributes.time;
        date = date.substring(0, 10);
        date = date.substring(5);
        "0" == date.charAt(0) && (date = date.substring(1));
        var datePartOne = date.substring(date.lastIndexOf("-"));
        datePartOne = datePartOne.replace("-", "");
        "0" == datePartOne.charAt(0) && (datePartOne = datePartOne.substring(1));
        var datePartTwo = date.substring(0, date.indexOf("-"));
        date = datePartOne + "/" + datePartTwo;
        var time = obj.attributes.time;
        time = time.substring(time.length - 8);
        time = time.substring(0, 5);
        var firstRowView = Ti.UI.createView({
            layout: "hotizontal",
            top: -22
        });
        var betGroupName = Alloy.Globals.PHRASES.unknownGroupTxt;
        if ("tournament" !== type && "tournament_finished" !== type) {
            try {
                betGroupName = obj.attributes.group[0].name;
            } catch (e) {}
            betGroupName.length > 9 && (betGroupName = betGroupName.substring(0, 7) + "...");
        } else if ("tournament" === type && 1 === obj.attributes.opponents.length || "tournament_finished" === type && 1 === obj.attributes.opponents.length) betGroupName = Alloy.Globals.PHRASES.betbattleTxt; else {
            betGroupName = Alloy.Globals.PHRASES.tournamentTxt;
            null != obj.attributes.group.name && (betGroupName = obj.attributes.group.name);
            0 === betGroupName.length || "" === betGroupName ? betGroupName = "Turnering" : "BetKampen Community" === betGroupName && (betGroupName = Alloy.Globals.PHRASES.betbattleTxt);
            betGroupName.length > 9 && (betGroupName = betGroupName.substring(0, 7) + "...");
        }
        firstRowView.add(Ti.UI.createLabel({
            left: 60,
            text: betGroupName,
            font: {
                fontSize: Alloy.Globals.getFontSize(1),
                fontWeight: "bold",
                fontFamily: Alloy.Globals.getFont()
            },
            color: Alloy.Globals.themeColor()
        }));
        var startTextLeftPos = 150;
        var textLeftPos = 200;
        var potTextPos = 171;
        firstRowView.add(Ti.UI.createLabel({
            left: startTextLeftPos,
            font: {
                fontSize: Alloy.Globals.getFontSize(1),
                fontWeight: "bold",
                fontFamily: Alloy.Globals.getFont()
            },
            text: Alloy.Globals.PHRASES.startTxt + ": ",
            color: "#FFF"
        }));
        var topPos = 35;
        var size = Alloy.Globals.getFontSize(1);
        if (true && 7 > iOSVersion) {
            size = 15;
            topPos = 36;
        }
        firstRowView.add(Ti.UI.createLabel({
            left: textLeftPos,
            text: " " + date + " " + time,
            font: {
                fontSize: size,
                fontWeight: "normal",
                fontFamily: Alloy.Globals.getFont()
            },
            color: "#FFF",
            top: topPos
        }));
        var secondRowView = Ti.UI.createView({
            layout: "hotizontal",
            top: 28
        });
        var oppCount = 0;
        if ("tournament" === type && true === checkTournament(obj) && 1 === obj.attributes.opponents.length) oppCount = parseInt(obj.attributes.opponentCount); else {
            var oppCount = parseInt(obj.attributes.opponents.length);
            1 === oppCount && "BetKampen Community" === obj.attributes.group.name && (oppCount = parseInt(obj.attributes.opponentCount));
        }
        secondRowView.add(Ti.UI.createLabel({
            left: 60,
            text: oppCount.toString(),
            font: {
                fontSize: Alloy.Globals.getFontSize(1),
                fontWeight: "bold",
                fontFamily: Alloy.Globals.getFont()
            },
            color: Alloy.Globals.themeColor()
        }));
        secondRowView.add(Ti.UI.createLabel({
            left: getDynamicLeftPos(oppCount),
            text: Alloy.Globals.PHRASES.participantTxt,
            font: {
                fontSize: Alloy.Globals.getFontSize(1),
                fontWeight: "normal",
                fontFamily: Alloy.Globals.themeColor()
            },
            color: "#FFF"
        }));
        secondRowView.add(Ti.UI.createLabel({
            left: potTextPos,
            text: Alloy.Globals.PHRASES.potTxt + ":",
            font: {
                fontSize: Alloy.Globals.getFontSize(1),
                fontWeight: "bold",
                fontFamily: Alloy.Globals.getFont()
            },
            color: "#FFF"
        }));
        var currentPot = Alloy.Globals.PHRASES.unknownSmallTxt;
        if ("tournament" === type && 1 === obj.attributes.opponents.length || "tournament_finished" === type && 1 === obj.attributes.opponents.length) try {
            currentPot = obj.attributes.tournamentPot;
        } catch (e) {
            currentPot = Alloy.Globals.PHRASES.unknownSmallTxt;
        } else if ("tournament" === type && obj.attributes.opponents.length > 1 || "tournament_finished" === type && obj.attributes.opponents.length > 1) try {
            var activeUsers = checkActiveUsers(obj.attributes.opponents);
            currentPot = activeUsers * obj.attributes.tournamentPot;
        } catch (e) {
            currentPot = Alloy.Globals.PHRASES.unknownSmallTxt;
        } else try {
            currentPot = obj.attributes.pot;
        } catch (e) {
            currentPot = Alloy.Globals.PHRASES.unknownSmallTxt;
        }
        secondRowView.add(Ti.UI.createLabel({
            left: textLeftPos,
            text: " " + currentPot,
            font: {
                fontSize: Alloy.Globals.getFontSize(1),
                fontFamily: Alloy.Globals.getFont()
            },
            color: "#FFF"
        }));
        row.add(firstRowView);
        row.add(secondRowView);
        row.add(Ti.UI.createView({
            top: 60,
            heigth: 14,
            layout: "horizontal"
        }));
        7 > iOSVersion && row.add(Ti.UI.createView({
            height: .5,
            top: 65,
            backgroundColor: "#6d6d6d",
            width: "120%"
        }));
        return row;
    }
    function constructTableView(array) {
        refresher = Ti.UI.createRefreshControl({
            tintColor: Alloy.Globals.themeColor()
        });
        refresher.addEventListener("refreshstart", function() {
            if (Alloy.Globals.checkConnection()) getChallenges(); else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
                refresher.endRefreshing();
                userInfoCoinsLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
                userInfoWinsLabel.setText("");
            }
        });
        var children = $.challengesView.children;
        for (var i = 0; children.length > i; i++) if ("challengeTable" === children[i].id) {
            $.challengesView.remove(children[i]);
            children[i] = null;
        }
        var sections = [];
        var tableHeaderView = Ti.UI.createView({
            height: 212,
            backgroundColor: "#303030"
        });
        var tableImageView = Ti.UI.createView({
            top: 0,
            height: 142,
            backgroundImage: "/images/header.png"
        });
        tableImageView.add(Ti.UI.createLabel({
            top: 50,
            text: Alloy.Globals.PHRASES.challengesTxt,
            font: {
                fontSize: Alloy.Globals.getFontSize(3),
                fontWeight: "normal",
                fontFamily: Alloy.Globals.getFont()
            },
            color: "#FFF"
        }));
        tableHeaderView.add(tableImageView);
        var userInfoView = Ti.UI.createView({
            top: 142
        });
        var userInfoViewTop = Ti.UI.createView({
            top: 0,
            height: 35,
            layout: "horizontal",
            backgrounColor: "#303030"
        });
        var userInfoViewBottom = Ti.UI.createView({
            top: 35,
            height: 35,
            layout: "horizontal",
            backgrounColor: "#303030"
        });
        userInfoViewTop.add(Ti.UI.createImageView({
            left: 60,
            top: 15,
            height: 15,
            width: 20,
            image: "/images/totalt_saldo.png"
        }));
        userInfoViewBottom.add(Ti.UI.createImageView({
            left: 60,
            height: 15,
            width: 15,
            image: "/images/vinster_top.png"
        }));
        userInfoCoinsLabel = Ti.UI.createLabel({
            left: 5,
            top: 12,
            text: Alloy.Globals.PHRASES.loadingTxt,
            font: {
                fontSize: Alloy.Globals.getFontSize(1),
                fontWeight: "bold",
                fontFamily: Alloy.Globals.getFont()
            },
            color: Alloy.Globals.themeColor()
        });
        userInfoWinsLabel = Ti.UI.createLabel({
            left: 10,
            text: "",
            font: {
                fontSize: Alloy.Globals.getFontSize(1),
                fontWeight: "bold",
                fontFamily: Alloy.Globals.getFont()
            },
            color: Alloy.Globals.themeColor()
        });
        var fontawesome = require("lib/IconicFont").IconicFont({
            font: "lib/FontAwesome"
        });
        var font = "FontAwesome";
        var leftImageView = Ti.UI.createImageView({
            left: 10,
            height: 40,
            width: 40,
            image: "https://graph.facebook.com/" + Alloy.Globals.FACEBOOKOBJECT.id + "/picture"
        });
        var rightPos = "2%";
        var chevronColor = "#F9F9F9";
        true && 7 > iOSVersion && (chevronColor = "000");
        var rightInfoLabel = Ti.UI.createLabel({
            right: rightPos,
            top: 0,
            height: 70,
            width: 20,
            font: {
                fontFamily: font
            },
            text: fontawesome.icon("fa-chevron-right"),
            color: chevronColor,
            fontSize: 80
        });
        userInfoView.addEventListener("click", function() {
            var win = Alloy.createController("profile").getView();
            Alloy.Globals.NAV.openWindow(win, {
                animated: true
            });
        });
        userInfoViewTop.add(userInfoCoinsLabel);
        userInfoViewBottom.add(userInfoWinsLabel);
        userInfoView.add(userInfoViewTop);
        userInfoView.add(userInfoViewBottom);
        userInfoView.add(rightInfoLabel);
        userInfoView.add(leftImageView);
        userInfoView.add(Ti.UI.createView({
            top: 68,
            height: .5,
            width: "100%",
            backgroundColor: "#6d6d6d"
        }));
        tableHeaderView.add(userInfoView);
        var separatorS;
        if (7 > iOSVersion) {
            separatorS = Titanium.UI.iPhone.TableViewSeparatorStyle.NONE;
            separatorColor = "transparent";
        } else {
            separatorS = Titanium.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE;
            separatorColor = "#6d6d6d";
        }
        table = Titanium.UI.createTableView({
            width: Ti.UI.FILL,
            left: 0,
            headerView: tableHeaderView,
            height: "100%",
            backgroundColor: "#303030",
            style: Ti.UI.iPhone.TableViewStyle.GROUPED,
            separatorInsets: {
                left: 0,
                right: 0
            },
            id: "challengeTable",
            refreshControl: refresher,
            separatorStyle: separatorS,
            separatorColor: separatorColor
        });
        sections[1] = createSectionsForTable(Alloy.Globals.PHRASES.newChallengesTxt);
        sections[2] = createSectionsForTable(Alloy.Globals.PHRASES.pendingChallengesTxt);
        sections[3] = createSectionsForTable(Alloy.Globals.PHRASES.finishedChallengesTxt);
        var challengesTournamentsCount = 0;
        for (var x = array.length; x >= 0; x--) {
            var arrayObj = array[x];
            if (0 === x) if (arrayObj.length > 0) for (var i = 0; arrayObj.length > i; i++) sections[1].add(constructChallengeRows(arrayObj[i], i, "accept")); else 0 === arrayObj.length && challengesTournamentsCount > 0 && sections[1].add(createEmptyTableRow(Alloy.Globals.PHRASES.challengesSmallTxt + "/" + Alloy.Globals.PHRASES.tournamentsSmallTxt)); else if (1 === x) if (arrayObj.length > 0) for (var i = 0; arrayObj.length > i; i++) sections[2].add(constructChallengeRows(arrayObj[i], i, "pending")); else 0 === arrayObj.length && sections[2].add(createEmptyTableRow(Alloy.Globals.PHRASES.challengesSmallTxt)); else if (2 === x) if (arrayObj.length > 0) for (var i = 0; arrayObj.length > i; i++) sections[3].add(constructChallengeRows(arrayObj[i], i, "finished")); else 0 === arrayObj.length && sections[3].add(createEmptyTableRow(Alloy.Globals.PHRASES.challengesSmallTxt)); else if (3 === x) if (arrayObj.length > 0) for (var i = 0; arrayObj.length > i; i++) sections[1].add(constructChallengeRows(arrayObj[i], i, "tournament")); else 0 === arrayObj.length && (challengesTournamentsCount = 1); else if (4 === x && arrayObj.length > 0) for (var i = 0; arrayObj.length > i; i++) sections[3].add(constructChallengeRows(arrayObj[i], i, "tournament_finished"));
        }
        table.setData(sections);
        table.addEventListener("click", function(e) {
            if (2 == Alloy.Globals.SLIDERZINDEX) return;
            if (null !== e.rowData) if (Alloy.Globals.checkConnection()) {
                if ("undefined" != typeof e.rowData.id) if ("accept" === e.rowData.className) {
                    var obj = Alloy.Globals.CHALLENGEOBJECTARRAY[0][e.rowData.id];
                    if (0 !== obj.attributes.show) {
                        Alloy.Globals.CHALLENGEINDEX = e.rowData.id;
                        var win = Alloy.createController("challenge").getView();
                        Alloy.Globals.NAV.openWindow(win, {
                            animated: true
                        });
                    } else Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.roundHasStartedErrorTxt);
                } else if ("tournament" === e.rowData.className) {
                    var obj = Alloy.Globals.CHALLENGEOBJECTARRAY[3][e.rowData.id];
                    if (true === checkTournament(obj)) {
                        var group = null;
                        try {
                            group = obj.attributes.group.name;
                        } catch (e) {
                            group = null;
                        }
                        void 0 === typeof group && (group = null);
                        showChallengeInWebView(obj.attributes.id, obj.attributes.round, group);
                        group = null;
                    } else if (0 !== obj.attributes.show) {
                        var arg = {
                            tournamentIndex: e.rowData.id,
                            tournamentRound: obj.attributes.round
                        };
                        var win = Alloy.createController("challenge", arg).getView();
                        Alloy.Globals.NAV.openWindow(win, {
                            animated: true
                        });
                    } else Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.roundHasStartedErrorTxt);
                } else if ("pending" === e.rowData.className) {
                    var obj = Alloy.Globals.CHALLENGEOBJECTARRAY[1][e.rowData.id];
                    var group = null;
                    try {
                        group = obj.attributes.group[0].name;
                    } catch (e) {
                        group = null;
                    }
                    void 0 === typeof group && (group = null);
                    showChallengeInWebView(obj.attributes.id, -1, group);
                    obj = null;
                    group = null;
                } else if ("finished" === e.rowData.className) {
                    var obj = Alloy.Globals.CHALLENGEOBJECTARRAY[2][e.rowData.id];
                    var group = null;
                    try {
                        group = obj.attributes.group[0].name;
                    } catch (e) {
                        group = null;
                    }
                    void 0 === typeof group && (group = null);
                    showChallengeInWebView(obj.attributes.id, -1, group);
                    obj = null;
                    group = null;
                } else if ("tournament_finished" === e.rowData.className) {
                    var obj = Alloy.Globals.CHALLENGEOBJECTARRAY[4][e.rowData.id];
                    var group = null;
                    try {
                        group = obj.attributes.group.name;
                    } catch (e) {
                        group = null;
                    }
                    void 0 === typeof group && (group = null);
                    showChallengeInWebView(obj.attributes.id, obj.attributes.round, group);
                    obj = null;
                    group = null;
                }
            } else Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        });
        $.challengesView.add(table);
    }
    function getChallenges() {
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            "undefined" != typeof refresher && refresher.endRefreshing();
            Ti.API.error("Bad Sever =>" + e.error);
            indicator.closeIndicator();
        };
        try {
            xhr.open("GET", Alloy.Globals.BETKAMPENCHALLENGESURL + "/?uid=" + Alloy.Globals.BETKAMPENUID);
            xhr.setRequestHeader("challengesView-type", "application/json");
            xhr.setRequestHeader("Authorization", Alloy.Globals.FACEBOOK.accessToken);
            xhr.setTimeout(Alloy.Globals.TIMEOUT);
            xhr.send();
        } catch (e) {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            "undefined" != typeof refresher && refresher.endRefreshing();
            indicator.closeIndicator();
        }
        xhr.onload = function() {
            if ("200" == this.status) {
                if (4 == this.readyState) {
                    var response = JSON.parse(this.responseText);
                    Alloy.Globals.CHALLENGEOBJECTARRAY = Alloy.Globals.constructChallenge(response);
                    constructTableView(Alloy.Globals.CHALLENGEOBJECTARRAY);
                    getUserInfo();
                } else Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                indicator.closeIndicator();
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                indicator.closeIndicator();
                "undefined" != typeof refresher && refresher.endRefreshing();
                Ti.API.error("Error =>" + this.response);
            }
        };
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "challengesView";
    if (arguments[0]) {
        __processArg(arguments[0], "__parentSymbol");
        __processArg(arguments[0], "$model");
        __processArg(arguments[0], "__itemTemplate");
    }
    var $ = this;
    var exports = {};
    $.__views.challengesView = Ti.UI.createView({
        layout: "vertical",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        backgroundColor: "#303030",
        apiName: "Ti.UI.View",
        classes: [ "container" ],
        id: "challengesView"
    });
    $.__views.challengesView && $.addTopLevelView($.__views.challengesView);
    exports.destroy = function() {};
    _.extend($, $.__views);
    Ti.App.addEventListener("updateCoins", function(coins) {
        var currentCoins = -1;
        try {
            var currentCoinsText = userInfoCoinsLabel.getText();
            currentCoins = parseInt(currentCoinsText);
            coins = parseInt(coins.coins);
        } catch (e) {}
        if (currentCoins > -1) {
            currentCoins += coins;
            userInfoCoinsLabel.setText(Alloy.Globals.PHRASES.coinsInfoTxt + ": " + currentCoins.toString());
        }
    });
    Ti.App.addEventListener("challengesViewRefresh", function() {
        if (Alloy.Globals.checkConnection()) {
            indicator.openIndicator();
            getChallenges();
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
            userInfoCoinsLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
            userInfoWinsLabel.setText("");
        }
    });
    var uie = require("lib/IndicatorWindow");
    var indicator = uie.createIndicatorWindow({
        top: 200,
        text: Alloy.Globals.PHRASES.loadingTxt
    });
    var refresher;
    var table;
    var userInfoCoinsLabel;
    var userInfoWinsLabel;
    var args = arguments[0] || {};
    if (1 == args.refresh) if (Alloy.Globals.checkConnection()) {
        indicator.openIndicator();
        getChallenges();
        getUserInfo();
    } else {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        userInfoCoinsLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
        userInfoWinsLabel.setText("");
    }
    var iOSVersion;
    iOSVersion = parseInt(Ti.Platform.version);
    $.challengesView.addEventListener("close", function() {
        indicator.closeIndicator();
    });
    Alloy.Globals.OPEN && Ti.App.addEventListener("resume", function() {
        if (null !== Alloy.Globals.CURRENTVIEW) if (Alloy.Globals.checkConnection()) {
            Alloy.Globals.FACEBOOK.authorize();
            Ti.API.log(Alloy.Globals.FACEBOOK.getExpirationDate());
            Ti.UI.iPhone.setAppBadge(0);
            indicator.openIndicator();
            getChallenges();
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionError);
            userInfoCoinsLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
            userInfoWinsLabel.setText("");
        }
    });
    constructTableView(Alloy.Globals.CHALLENGEOBJECTARRAY);
    getUserInfo();
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;