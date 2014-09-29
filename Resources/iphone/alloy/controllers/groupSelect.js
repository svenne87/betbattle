function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function createMemberRow(member, subRow) {
        var image = "/images/no_pic.png";
        Ti.API.info("MEMBERS : " + JSON.stringify(member));
        image = null != member.fbid ? "https://graph.facebook.com/" + member.fbid + "/picture?type=large" : Alloy.Globals.BETKAMPENURL + "/profile_images/" + member.id + ".png";
        var profilePic = Ti.UI.createImageView({
            image: image,
            height: 40,
            width: 40,
            left: 10,
            top: 5
        });
        profilePic.addEventListener("error", function(e) {
            Ti.API.info("fel på bild");
            e.source.image = "/images/no_pic.png";
        });
        subRow.add(profilePic);
        subRow.add(Ti.UI.createLabel({
            text: member.name,
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
    function getFriends() {
        selectedGroupIds = [];
        friendsChallenge = [];
        indicator.openIndicator();
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            indicator.closeIndicator();
            "undefined" != typeof refresher && refresher.endRefreshing();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("Bad Sever =>" + e.error);
        };
        try {
            xhr.open("GET", Alloy.Globals.BETKAMPENGETFRIENDSURL + "?uid=" + Alloy.Globals.BETKAMPENUID + "&lang=" + Alloy.Globals.LOCALE);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
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
                        friendObjects = [];
                        for (var i = 0; response.length > i; i++) {
                            var friendObject = Alloy.createModel("friend", {
                                fbid: response[i].fbid,
                                id: response[i].id,
                                name: response[i].name
                            });
                            friendObjects.push(friendObject);
                        }
                        createViews(friendObjects, 2);
                    } else Ti.API.info("Inga Vänner");
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
    function getGroups() {
        selectedGroupIds = [];
        friendsChallenge = [];
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
            xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
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
                        groupObjects = [];
                        for (var i = 0; response.length > i; i++) {
                            var membersArray = [];
                            for (var x = 0; response[i].members.length > x; x++) {
                                var member = {
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
                        createViews(groupObjects, 1);
                    } else {
                        tab_groups.setBackgroundColor("black");
                        tab_friends.setBackgroundColor(Alloy.Globals.themeColor());
                        getFriends();
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
    function challengeGroup(array) {
        if (Alloy.Globals.checkConnection()) {
            indicator.openIndicator();
            submitButton.touchEnabled = false;
            var xhr = Titanium.Network.createHTTPClient();
            xhr.onerror = function(e) {
                indicator.closeIndicator();
                submitButton.touchEnabled = true;
                if (-1 != JSON.parse(this.responseText).indexOf("coins")) {
                    var alertWindow = Titanium.UI.createAlertDialog({
                        title: Alloy.Globals.PHRASES.betbattleTxt,
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
                xhr.open("POST", Alloy.Globals.BETKAMPENCHALLENGEGROUPURL);
                xhr.setRequestHeader("content-type", "application/json");
                xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
                xhr.setTimeout(Alloy.Globals.TIMEOUT);
                var param = "";
                param += '{"cid": ' + Alloy.Globals.COUPON.id + ', "coins": ' + coins + ', "groups": [{';
                for (var i = 0; array.length > i; i++) for (var x = 0; groupObjects.length > x; x++) if (groupObjects[x].attributes.id === array[i]) {
                    param += '"' + array[i] + '":"' + groupObjects[x].attributes.name;
                    param += i != array.length - 1 ? '", ' : '"';
                }
                param += "}]}";
                Ti.API.log("Params : " + param);
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
                        Ti.API.info("RESPONSE NO PARSE : " + JSON.stringify(this.responseText));
                        var response = JSON.parse(this.responseText);
                        Ti.API.info("RESPONSE : " + JSON.stringify(response));
                        response = response.replace(/(<br \/>)+/g, "\n");
                        Alloy.Globals.showToast(response);
                        var argu = {
                            refresh: 1,
                            sent_challenge: 1
                        };
                        var loginSuccessWindow = Alloy.createController("main", argu).getView();
                        loginSuccessWindow.open({
                            fullScreen: true,
                            transition: Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT
                        });
                        loginSuccessWindow = null;
                        for (win in Alloy.Globals.WINDOWS) 0 !== win && Alloy.Globals.WINDOWS[win].close();
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
    function challengeFriends() {
        if (Alloy.Globals.checkConnection()) {
            indicator.openIndicator();
            submitButton.touchEnabled = false;
            var xhr = Titanium.Network.createHTTPClient();
            xhr.onerror = function(e) {
                indicator.closeIndicator();
                submitButton.touchEnabled = true;
                Ti.API.info("ERROR PARSE : " + JSON.stringify(this.responseText));
                if (-1 != JSON.parse(this.responseText).indexOf("coins")) {
                    var alertWindow = Titanium.UI.createAlertDialog({
                        title: Alloy.Globals.PHRASES.betbattleTxt,
                        message: JSON.parse(this.responseText),
                        buttonNames: [ Alloy.Globals.PHRASES.okConfirmBtnTxt, Alloy.Globals.PHRASES.storeTxt ]
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
                xhr.open("POST", Alloy.Globals.BETKAMPENCHALLENGEFRIENDSURL + "/?lang=" + Alloy.Globals.LOCALE);
                xhr.setRequestHeader("content-type", "application/json");
                xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
                xhr.setTimeout(Alloy.Globals.TIMEOUT);
                var param = "";
                param += '{"coins": ' + coins + ', "cid":"' + Alloy.Globals.COUPON.id + '", "friends":[{';
                for (var i = 0; friendsChallenge.length > i; i++) {
                    param += '"' + friendsChallenge[i].id + '":"' + friendsChallenge[i].name;
                    param += i == friendsChallenge.length - 1 ? '"' : '", ';
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
                        Ti.API.log("RESPONSE FRIENDS : " + JSON.stringify(this.responseText));
                        var response = JSON.parse(this.responseText);
                        response = response.replace(/(<br \/>)+/g, "\n");
                        Alloy.Globals.showToast(response);
                        var argu = {
                            refresh: 1,
                            sent_challenge: 1
                        };
                        var loginSuccessWindow = Alloy.createController("main", argu).getView();
                        loginSuccessWindow.open({
                            fullScreen: true,
                            transition: Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT
                        });
                        loginSuccessWindow = null;
                        for (win in Alloy.Globals.WINDOWS) 0 !== win && Alloy.Globals.WINDOWS[win].close();
                    } else {
                        submitButton.touchEnabled = true;
                        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                    }
                } else {
                    indicator.closeIndicator();
                    submitButton.touchEnabled = true;
                    Ti.API.error("Error =>" + this.response);
                    Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
                }
            };
        } else Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }
    function createSubmitButtons(type) {
        submitButton = null;
        var buttonHeight = 40;
        var viewHeight = "20%";
        botView.removeAllChildren();
        Ti.API.log(Titanium.Platform.displayCaps.platformHeight);
        Ti.UI.createView({
            height: viewHeight,
            width: "auto",
            layout: "vertical",
            backgroundColor: "#303030",
            id: "submitButtonsView"
        });
        submitButton = 7 > iOSVersion ? Titanium.UI.createButton({
            title: Alloy.Globals.PHRASES.challengeBtnTxt,
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
        }) : Titanium.UI.createButton({
            title: Alloy.Globals.PHRASES.challengeBtnTxt,
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
        submitButton.addEventListener("click", function() {
            if (1 == type) if (1 === selectedGroupIds.length) {
                Ti.API.info("challenge : Group");
                challengeGroup(selectedGroupIds);
            } else Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.groupChallengeErrorTxt);
            if (2 == type) if (friendsChallenge.length > 0) {
                Ti.API.info("challenge : Friends");
                challengeFriends();
            } else Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.friendChallengeErrorTxt);
        });
        botView.add(submitButton);
    }
    function createViews(array, type) {
        var children = tableWrapper.children;
        for (var i = 0; children.length > i; i++) {
            "groupsTable" === children[i].id && tableWrapper.remove(children[i]);
            "submitButtonsView" === children[i].id && $.groupSelect.remove(children[i]);
            children[i] = null;
        }
        refresher = Ti.UI.createRefreshControl({
            tintColor: Alloy.Globals.themeColor()
        });
        refresher.addEventListener("refreshstart", function() {
            if (Alloy.Globals.checkConnection()) 1 == type ? getGroups() : 2 == type && getFriends(); else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
                refresher.endRefreshing();
            }
        });
        table = Ti.UI.createTableView({
            height: "100%",
            id: "groupsTable",
            refreshControl: refresher,
            backgroundColor: "#303030"
        });
        table.separatorInsets = {
            left: 0,
            right: 0
        };
        table.footerView = Ti.UI.createView({
            height: .5,
            backgroundColor: "#6d6d6d"
        });
        var data = [];
        var hasChild;
        hasChild = true;
        for (var i = 0; array.length > i; i++) {
            if (1 == type) {
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
                for (var x = 0; array[i].attributes.members.length > x; x++) createMemberRow(array[i].attributes.members[x], subRow);
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
            } else {
                Ti.API.info("VÄNNEN : " + JSON.stringify(array[i].attributes));
                var image;
                image = null !== array[i].attributes.fbid ? "https://graph.facebook.com/" + array[i].attributes.fbid + "/picture?type=large" : Alloy.Globals.BETKAMPENURL + "/profile_images/" + array[i].attributes.id + ".png";
                var row = $.UI.create("TableViewRow", {
                    classes: [ "challengesSectionDefault" ],
                    id: array[i].attributes.id,
                    hasChild: hasChild,
                    isparent: true,
                    opened: false,
                    name: array[i].attributes.name,
                    height: 40
                });
                var detailsImg = Ti.UI.createImageView({
                    name: "profilePic",
                    width: 30,
                    height: 30,
                    left: 5,
                    id: "img-" + array[i].attributes.id,
                    image: image
                });
                detailsImg.addEventListener("error", function(e) {
                    e.source.image = "/images/no_pic.png";
                });
                row.add(detailsImg);
                row.add(Ti.UI.createLabel({
                    text: array[i].attributes.name,
                    textAlign: "center",
                    left: 60,
                    font: {
                        fontSize: Alloy.Globals.getFontSize(1),
                        fontWeight: "normal",
                        fontFamily: Alloy.Globals.getFont()
                    },
                    color: "#FFF"
                }));
            }
            if (1 == type) {
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
            }
            data.push(row);
        }
        table.setData(data);
        table.addEventListener("click", function(e) {
            if ("detailsBtn" === e.source.name) {
                if (1 == type) {
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
                }
            } else {
                1 == type && (e.source.image = "/images/p.png" == e.source.image ? "/images/m.png" : "/images/p.png");
                if (1 == type) {
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
                    selectedGroupIds[0] = e.row.id;
                }
                if (2 == type) {
                    Ti.API.info("selected: " + JSON.stringify(e));
                    var friend = {
                        name: e.row.name,
                        id: e.row.id
                    };
                    Ti.API.info("Friend : " + JSON.stringify(friend));
                    var index = -1;
                    var clicked = false;
                    for (var i in friendsChallenge) if (friendsChallenge[i].id == e.row.id) {
                        clicked = true;
                        index = i;
                        break;
                    }
                    -1 != index ? friendsChallenge.splice(index, 1) : friendsChallenge.push(friend);
                }
                buttonsPushed.push(e.row);
                for (var i = 0; buttonsPushed.length > i; i++) if (1 == type) {
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
                Ti.API.info("friend array: " + JSON.stringify(friendsChallenge));
                if (clicked) {
                    e.row.remove(e.row.children[e.row.children.length - 1]);
                    e.row.setBackgroundColor("#242424");
                    e.row.backgroundGradient = {
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
                } else {
                    2 == type && e.row.add(Ti.UI.createLabel({
                        id: "selected_" + e.row.id,
                        text: fontawesome.icon("fa-check"),
                        textAlign: "center",
                        right: 10,
                        color: "#FFF",
                        parent: row,
                        font: {
                            fontSize: 30,
                            fontFamily: font
                        },
                        height: "auto",
                        width: "auto"
                    }));
                    e.row.setBackgroundColor(Alloy.Globals.themeColor());
                    e.row.backgroundGradient = {};
                }
            }
        });
        tableWrapper.removeAllChildren();
        tableWrapper.add(table);
        createSubmitButtons(type);
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
    var args = arguments[0] || {};
    var coins = -1;
    "undefined" != typeof args.coins && (coins = args.coins);
    Ti.App.addEventListener("sliderToggled", function(e) {
        "undefined" != typeof table && (table.touchEnabled = e.hasSlided ? false : true);
    });
    var tableWrapper = Ti.UI.createView({
        height: "75%",
        width: Ti.UI.FILL
    });
    var args = arguments[0] || {};
    var groupObjects = [];
    var friendObjects = [];
    var selectedGroupIds = [];
    var friendsChallenge = [];
    var submitButton;
    var buttonsPushed = [];
    var table;
    var refresher;
    var notFirstRun = false;
    var uie = require("lib/IndicatorWindow");
    var indicator = uie.createIndicatorWindow({
        top: 200,
        text: Alloy.Globals.PHRASES.loadingTxt
    });
    $.groupSelectWindow.addEventListener("close", function() {
        indicator.closeIndicator();
    });
    var fontawesome = require("lib/IconicFont").IconicFont({
        font: "lib/FontAwesome"
    });
    var font = "FontAwesome";
    var iOSVersion;
    iOSVersion = parseInt(Ti.Platform.version);
    var topView = Ti.UI.createView({
        height: 40,
        width: Ti.UI.FILL,
        layout: "horizontal"
    });
    var botView = Ti.UI.createView({
        height: 60,
        width: Ti.UI.FILL,
        layout: "absolute"
    });
    var tab_groups = Ti.UI.createView({
        height: 40,
        width: "50%",
        backgroundColor: Alloy.Globals.themeColor()
    });
    tab_groups.add(Ti.UI.createLabel({
        text: Alloy.Globals.PHRASES.GroupsTxt,
        textAlign: "center",
        color: "#FFFFFF",
        font: {
            fontSize: 14,
            fontFamily: "Impact"
        }
    }));
    var tab_friends = Ti.UI.createView({
        height: 40,
        width: "50%",
        backgroundColor: "black"
    });
    tab_friends.add(Ti.UI.createLabel({
        text: Alloy.Globals.PHRASES.FriendsTxt,
        textAlign: "center",
        color: "#c5c5c5",
        font: {
            fontSize: 14,
            fontFamily: "Impact"
        }
    }));
    topView.add(tab_groups);
    topView.add(tab_friends);
    $.groupSelect.add(topView);
    tab_groups.addEventListener("click", function() {
        tab_groups.setBackgroundColor(Alloy.Globals.themeColor());
        tab_friends.setBackgroundColor("black");
        getGroups();
    });
    tab_friends.addEventListener("click", function() {
        tab_groups.setBackgroundColor("black");
        tab_friends.setBackgroundColor(Alloy.Globals.themeColor());
        getFriends();
    });
    $.groupSelect.add(tableWrapper);
    $.groupSelect.add(botView);
    if (Alloy.Globals.checkConnection()) {
        getGroups();
        notFirstRun = true;
    } else Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;