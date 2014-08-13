function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function getGroups() {
        indicator.openIndicator();
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            indicator.closeIndicator();
            "undefined" != typeof refresher && refresher.endRefreshing();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("Bad Sever =>" + e.error);
        };
        try {
            xhr.open("GET", Alloy.Globals.BETKAMPENGETGROUPSURL + "/?lang=" + Alloy.Globals.LOCALE);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setRequestHeader("Authorization", Alloy.Globals.FACEBOOK.accessToken);
            xhr.setTimeout(Alloy.Globals.TIMEOUT);
            xhr.send();
        } catch (e) {
            indicator.closeIndicator();
            "undefined" != typeof refresher && refresher.endRefreshing();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        }
        xhr.onload = function() {
            if ("200" == this.status) {
                if (4 == this.readyState) {
                    var response = JSON.parse(this.responseText);
                    if (response.length > 0) {
                        for (var i = 0; response.length > i; i++) {
                            var membersArray = [];
                            for (var x = 0; response[i].members.length > x; x++) {
                                var member = {
                                    fbid: response[i].members[x].fbid,
                                    id: response[i].members[x].id,
                                    name: response[i].members[x].name
                                };
                                membersArray.push(member);
                            }
                            var groupObject = Alloy.createModel("group", {
                                creator: response[i].creator,
                                id: response[i].id,
                                name: response[i].name,
                                members: membersArray
                            });
                            groupObjects.push(groupObject);
                        }
                        createViews(groupObjects);
                    } else {
                        indicator.openIndicator();
                        setTimeout(function() {
                            var arg = {
                                param: params
                            };
                            var win = Alloy.createController("friendSelect", arg).getView();
                            Alloy.Globals.WINDOWS.push(win);
                            Alloy.Globals.NAV.openWindow(win, {
                                animated: true
                            });
                            indicator.closeIndicator();
                        }, 1500);
                    }
                } else Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                indicator.closeIndicator();
            } else {
                indicator.closeIndicator();
                "undefined" != typeof refresher && refresher.endRefreshing();
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                Ti.API.error("Error =>" + this.response);
            }
        };
    }
    function challengeGroup(array, param) {
        if (Alloy.Globals.checkConnection()) {
            indicator.openIndicator();
            submitButton.touchEnabled = false;
            var xhr = Titanium.Network.createHTTPClient();
            xhr.onerror = function(e) {
                indicator.closeIndicator();
                submitButton.touchEnabled = true;
                if (-1 != JSON.parse(this.responseText).indexOf("coins")) {
                    var alertWindow = Titanium.UI.createAlertDialog({
                        title: "Betkampen",
                        message: JSON.parse(this.responseText),
                        buttonNames: [ Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.storeTxt ]
                    });
                    alertWindow.addEventListener("click", function(e) {
                        switch (e.index) {
                          case 0:
                            alertWindow.hide();
                            break;

                          case 1:
                            var win = Alloy.createController("store").getView();
                            Alloy.Globals.WINDOWS.push(win);
                            Alloy.Globals.NAV.openWindow(win, {
                                animated: true
                            });
                            alertWindow.hide();
                        }
                    });
                    alertWindow.show();
                } else Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
                Ti.API.error("Bad Sever =>" + e.error);
            };
            try {
                xhr.open("POST", Alloy.Globals.BETKAMPENCHALLENGEDONEURL);
                xhr.setRequestHeader("content-type", "application/json");
                xhr.setRequestHeader("Authorization", Alloy.Globals.FACEBOOK.accessToken);
                xhr.setTimeout(Alloy.Globals.TIMEOUT);
                param += ', "groups": [{';
                for (var i = 0; array.length > i; i++) for (var x = 0; groupObjects.length > x; x++) if (groupObjects[x].attributes.id === array[i]) {
                    param += '"' + array[i] + '":"' + groupObjects[x].attributes.name;
                    param += i != array.length - 1 ? '", ' : '"';
                }
                param += "}]}";
                Ti.API.log(param);
                xhr.send(param);
            } catch (e) {
                indicator.closeIndicator();
                submitButton.touchEnabled = true;
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            }
            xhr.onload = function() {
                if ("200" == this.status) {
                    indicator.closeIndicator();
                    if (4 == this.readyState) {
                        var response = JSON.parse(this.responseText);
                        if ("undefined" != typeof response.from) {
                            var fb = Alloy.Globals.FACEBOOK;
                            fb.appid = Ti.App.Properties.getString("ti.facebook.appid");
                            fb.dialog("apprequests", {
                                message: response.from + " " + Alloy.Globals.PHRASES.hasChallengedYouBetBattleTxt + " " + Alloy.Globals.INVITEURL,
                                to: response.to
                            }, function(responseFb) {
                                if (responseFb.result || "undefined" == typeof responseFb.result) {
                                    response.message = response.message.replace(/(<br \/>)+/g, "\n");
                                    var alertWindow = Titanium.UI.createAlertDialog({
                                        title: Alloy.Globals.PHRASES.betbattleTxt,
                                        message: response.message,
                                        buttonNames: [ Alloy.Globals.PHRASES.okConfirmTxt ]
                                    });
                                    alertWindow.addEventListener("click", function() {
                                        submitButton.touchEnabled = true;
                                        var arg = {
                                            refresh: true
                                        };
                                        var obj = {
                                            controller: "challengesView",
                                            arg: arg
                                        };
                                        Ti.App.fireEvent("app:updateView", obj);
                                        for (win in Alloy.Globals.WINDOWS) Alloy.Globals.WINDOWS[win].close();
                                    });
                                    alertWindow.show();
                                }
                            });
                        } else {
                            response = response.replace(/(<br \/>)+/g, "\n");
                            var alertWindow = Titanium.UI.createAlertDialog({
                                title: Alloy.Globals.PHRASES.betbattleTxt,
                                message: response,
                                buttonNames: [ Alloy.Globals.PHRASES.okConfirmTxt ]
                            });
                            alertWindow.addEventListener("click", function() {
                                submitButton.touchEnabled = true;
                                var arg = {
                                    refresh: true
                                };
                                var obj = {
                                    controller: "challengesView",
                                    arg: arg
                                };
                                Ti.App.fireEvent("app:updateView", obj);
                                for (win in Alloy.Globals.WINDOWS) Alloy.Globals.WINDOWS[win].close();
                            });
                            alertWindow.show();
                        }
                    } else {
                        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                        submitButton.touchEnabled = true;
                    }
                } else {
                    Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
                    indicator.closeIndicator();
                    submitButton.touchEnabled = true;
                    Ti.API.error("Error =>" + this.response);
                }
            };
        } else Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }
    function createSubmitButtons() {
        var buttonHeight = 40;
        var viewHeight = "20%";
        Ti.API.log(Titanium.Platform.displayCaps.platformHeight);
        var submitButtonsView = Ti.UI.createView({
            height: viewHeight,
            width: "auto",
            layout: "vertical",
            backgroundColor: "#303030",
            id: "submitButtonsView"
        });
        submitButton = 7 > iOSVersion ? Titanium.UI.createButton({
            title: "Utmana",
            height: 30,
            top: -1,
            width: "70%",
            id: "submitButton",
            backgroundColor: Alloy.Globals.themeColor(),
            borderRadius: 6,
            font: {
                fontFamily: Alloy.Globals.getFont(),
                fontSize: Alloy.Globals.getFontSize(2)
            },
            color: "#FFF",
            backgroundImage: "none"
        }) : Titanium.UI.createButton({
            title: "Utmana",
            height: buttonHeight,
            top: -1,
            width: "70%",
            id: "submitButton",
            backgroundColor: Alloy.Globals.themeColor(),
            borderRadius: 6,
            font: {
                fontFamily: Alloy.Globals.getFont(),
                fontSize: Alloy.Globals.getFontSize(2)
            },
            color: "#FFF",
            backgroundImage: "none"
        });
        submitButton.addEventListener("click", function() {
            1 === selectedGroupIds.length ? challengeGroup(selectedGroupIds, params) : Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.groupChallengeErrorTxt);
        });
        friendsButton = 7 > iOSVersion ? Ti.UI.createButton({
            title: Alloy.Globals.PHRASES.showFriendsTxt,
            height: 30,
            width: "70%",
            id: "submitButton",
            backgroundColor: Alloy.Globals.themeColor(),
            borderRadius: 6,
            font: {
                fontFamily: Alloy.Globals.getFont(),
                fontSize: Alloy.Globals.getFontSize(2)
            },
            color: "#FFF",
            backgroundImage: "none"
        }) : Ti.UI.createButton({
            title: Alloy.Globals.PHRASES.showFriendsTxt,
            height: buttonHeight,
            width: "70%",
            id: "submitButton",
            backgroundColor: Alloy.Globals.themeColor(),
            borderRadius: 6,
            font: {
                fontFamily: Alloy.Globals.getFont(),
                fontSize: Alloy.Globals.getFontSize(2)
            },
            color: "#FFF",
            backgroundImage: "none"
        });
        friendsButton.addEventListener("click", function() {
            var arg = {
                param: params
            };
            var win = Alloy.createController("friendSelect", arg).getView();
            Alloy.Globals.WINDOWS.push(win);
            Alloy.Globals.NAV.openWindow(win, {
                animated: true
            });
        });
        submitButtonsView.add(Titanium.UI.createView({
            id: "marginView",
            layout: "vertical",
            height: 10
        }));
        submitButtonsView.add(friendsButton);
        submitButtonsView.add(Titanium.UI.createView({
            id: "marginView",
            layout: "vertical",
            height: 10
        }));
        submitButtonsView.add(submitButton);
        $.groupSelect.add(submitButtonsView);
    }
    function createViews(array) {
        var children = $.groupSelect.children;
        for (var i = 0; children.length > i; i++) {
            "groupsTable" === children[i].id && $.groupSelect.remove(children[i]);
            "submitButtonsView" === children[i].id && $.groupSelect.remove(children[i]);
            children[i] = null;
        }
        refresher = Ti.UI.createRefreshControl({
            tintColor: Alloy.Globals.themeColor()
        });
        refresher.addEventListener("refreshstart", function() {
            if (Alloy.Globals.checkConnection()) getGroups(); else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
                refresher.endRefreshing();
            }
        });
        var tableHeaderView = Ti.UI.createView({
            height: "142dp",
            backgroundImage: "/images/header.png"
        });
        tableHeaderView.add(Ti.UI.createLabel({
            width: "100%",
            textAlign: "center",
            top: 50,
            text: Alloy.Globals.PHRASES.chooseGroupTxt,
            font: {
                fontSize: Alloy.Globals.getFontSize(3),
                fontWeight: "normal",
                fontFamily: Alloy.Globals.getFont()
            },
            color: "#FFF"
        }));
        table = Ti.UI.createTableView({
            headerView: tableHeaderView,
            height: "80%",
            id: "groupsTable",
            refreshControl: refresher,
            backgroundColor: "#303030"
        });
        table.footerView = Ti.UI.createView({
            height: .5,
            backgroundColor: "#6d6d6d"
        });
        table.separatorInsets = {
            left: 0,
            right: 0
        };
        var data = [];
        for (var i = 0; array.length > i; i++) {
            var subRow = Ti.UI.createTableViewRow({
                layout: "vertical",
                backgroundColor: "#303030",
                selectionStyle: "none",
                height: "auto"
            });
            subRow.footerView = Ti.UI.createView({
                height: .5,
                backgroundColor: "#6d6d6d"
            });
            subRow.add(Ti.UI.createView({
                height: 10
            }));
            for (var x = 0; array[i].attributes.members.length > x; x++) {
                subRow.add(Ti.UI.createImageView({
                    image: "https://graph.facebook.com/" + array[i].attributes.members[x].fbid + "/picture",
                    height: 40,
                    width: 40,
                    left: 10,
                    top: 5
                }));
                subRow.add(Ti.UI.createLabel({
                    text: array[i].attributes.members[x].name,
                    top: -30,
                    left: 60,
                    width: "auto",
                    font: {
                        fontSize: Alloy.Globals.getFontSize(1),
                        fontWeight: "normal",
                        fontFamily: Alloy.Globals.getFont()
                    },
                    color: "#FFF",
                    backgroundColor: "#303030"
                }));
            }
            subRow.add(Ti.UI.createView({
                height: 20
            }));
            var subRowArray = [];
            subRowArray.push(subRow);
            var hasChild;
            hasChild = true;
            var row = $.UI.create("TableViewRow", {
                classes: [ "challengesSectionDefault" ],
                id: array[i].attributes.id,
                hasChild: hasChild,
                isparent: true,
                opened: false,
                sub: subRowArray
            });
            row.add(Ti.UI.createLabel({
                text: array[i].attributes.name,
                top: 6,
                left: 60,
                font: {
                    fontSize: Alloy.Globals.getFontSize(1),
                    fontWeight: "normal",
                    fontFamily: Alloy.Globals.getFont()
                },
                color: "#FFF"
            }));
            row.add(Ti.UI.createLabel({
                text: Alloy.Globals.PHRASES.nrOfMembersTxt + ": " + array[i].attributes.members.length,
                top: 26,
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
                height: 8
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
            row.className = "one_image_per_row";
            data.push(row);
        }
        table.setData(data);
        table.addEventListener("click", function(e) {
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
            } else {
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
                buttonsPushed.push(e.row);
                for (var i = 0; buttonsPushed.length > i; i++) {
                    buttonsPushed[i].setBackgroundColor("#242424");
                    buttonsPushed[i].backgroundGradient = {
                        type: "linear",
                        startPoint: {
                            x: "0%",
                            y: "0%"
                        },
                        endPoint: {
                            x: "0%",
                            y: "100%"
                        },
                        colors: [ {
                            color: "#2E2E2E",
                            offset: 0
                        }, {
                            color: "#151515",
                            offset: 1
                        } ]
                    };
                }
                e.row.setBackgroundColor(Alloy.Globals.themeColor());
                e.row.backgroundGradient = {};
                selectedGroupIds[0] = e.row.id;
            }
        });
        $.groupSelect.add(table);
        createSubmitButtons();
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "groupSelect";
    if (arguments[0]) {
        __processArg(arguments[0], "__parentSymbol");
        __processArg(arguments[0], "$model");
        __processArg(arguments[0], "__itemTemplate");
    }
    var $ = this;
    var exports = {};
    $.__views.groupSelectWindow = Ti.UI.createWindow({
        layout: "vertical",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        backgroundColor: "#303030",
        apiName: "Ti.UI.Window",
        classes: [ "container" ],
        id: "groupSelectWindow"
    });
    $.__views.groupSelectWindow && $.addTopLevelView($.__views.groupSelectWindow);
    $.__views.groupSelect = Ti.UI.createView({
        height: "100%",
        width: "100%",
        layout: "vertical",
        apiName: "Ti.UI.View",
        id: "groupSelect",
        classes: []
    });
    $.__views.groupSelectWindow.add($.__views.groupSelect);
    exports.destroy = function() {};
    _.extend($, $.__views);
    Ti.App.addEventListener("sliderToggled", function(e) {
        "undefined" != typeof table && (table.touchEnabled = e.hasSlided ? false : true);
    });
    Ti.App.addEventListener("groupSelectRefresh", function() {
        indicator.openIndicator();
        getGroups();
    });
    var args = arguments[0] || {};
    var params = args.param || null;
    var groupObjects = [];
    var selectedGroupIds = [];
    var submitButton;
    var buttonsPushed = [];
    var table;
    var friendsButton;
    var refresher;
    var uie = require("lib/IndicatorWindow");
    var indicator = uie.createIndicatorWindow({
        top: 200,
        text: Alloy.Globals.PHRASES.loadingTxt
    });
    $.groupSelectWindow.addEventListener("close", function() {
        indicator.closeIndicator();
    });
    {
        require("lib/IconicFont").IconicFont({
            font: "lib/FontAwesome"
        });
    }
    var iOSVersion;
    iOSVersion = parseInt(Ti.Platform.version);
    Alloy.Globals.checkConnection() ? getGroups() : Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;