function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function challengeFriends(groupName) {
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
                        buttonNames: [ "OK", "Butik" ]
                    });
                    alertWindow.addEventListener("click", function(e) {
                        switch (e.index) {
                          case 0:
                            alertWindow.hide();
                            break;

                          case 1:
                            var win = Alloy.createController("store").getView();
                            Alloy.Globals.WINDOWS.push(win);
                            win.open({
                                fullScreen: false
                            });
                            win = null;
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
                param += ', "new_group":"' + groupName + '", "friends":[{';
                for (var i = 0; facebookFriendsChallenge.length > i; i++) {
                    param += '"' + facebookFriendsChallenge[i].id + '":"' + facebookFriendsChallenge[i].name;
                    param += i == facebookFriendsChallenge.length - 1 ? '"' : '", ';
                }
                param += "}]}";
                Ti.API.log(param);
                xhr.send(param);
            } catch (e) {
                indicator.closeIndicator();
                submitButton.touchEnabled = true;
                Alloy.Globals.showFeedbackDialog("Något gick fel! Försök igen.");
            }
            xhr.onload = function() {
                if ("200" == this.status) {
                    indicator.closeIndicator();
                    if (4 == this.readyState) {
                        Ti.API.log(this.responseText);
                        var response = JSON.parse(this.responseText);
                        if ("undefined" != typeof response.from) {
                            var fb = Alloy.Globals.FACEBOOK;
                            fb.appid = Ti.App.Properties.getString("ti.facebook.appid");
                            fb.dialog("apprequests", {
                                message: response.from + " har utmanat dig på Betkampen " + Alloy.Globals.INVITEURL,
                                to: response.to
                            }, function(responseFb) {
                                if (responseFb.result || "undefined" == typeof responseFb.result) {
                                    response.message = response.message.replace(/(<br \/>)+/g, "\n");
                                    var alertWindow = Titanium.UI.createAlertDialog({
                                        title: "Betkampen",
                                        message: response.message,
                                        buttonNames: [ "OK" ]
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
                                        for (win in Alloy.Globals.WINDOWS) {
                                            Alloy.Globals.WINDOWS[win].close();
                                            Alloy.Globals.WINDOWS[win] = null;
                                        }
                                    });
                                    alertWindow.show();
                                }
                            });
                        } else {
                            response = response.replace(/(<br \/>)+/g, "\n");
                            var alertWindow = Titanium.UI.createAlertDialog({
                                title: "Betkampen",
                                message: response,
                                buttonNames: [ "OK" ]
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
                        submitButton.touchEnabled = true;
                        Alloy.Globals.showFeedbackDialog("Något gick fel!");
                    }
                } else {
                    indicator.closeIndicator();
                    submitButton.touchEnabled = true;
                    Ti.API.error("Error =>" + this.response);
                    Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
                }
            };
        } else Alloy.Globals.showFeedbackDialog("Ingen anslutning!");
    }
    function getFacebookFriends() {
        var children = $.friendSelect.children;
        for (var i = 0; children.length > i; i++) {
            "groupsTable" === children[i].id && $.friendSelect.remove(children[i]);
            "submitButtonsView" === children[i].id && $.friendSelect.remove(children[i]);
        }
        Alloy.Globals.FACEBOOKOBJECT;
        var fb = Alloy.Globals.FACEBOOK;
        var query = "SELECT uid, name, pic_square, hometown_location  FROM user ";
        query += "where uid IN (SELECT uid2 FROM friend WHERE uid1 = " + fb.uid + ")";
        query += "order by last_name limit 1000";
        fb.request("fql.query", {
            query: query
        }, function(r) {
            if (r.success) {
                indicator.closeIndicator();
                facebookFriendsObjects = JSON.parse(r.result);
                createFriendsView(facebookFriendsObjects);
            } else {
                indicator.closeIndicator();
                Alloy.Globals.showFeedbackDialog("Något gick fel! Vänligen försök igen.");
            }
        });
    }
    function createSubmitButtons() {
        var submitButtonsView = Ti.UI.createView({
            height: "20%",
            width: "100%",
            backgroundColor: "#303030",
            layout: "vertical"
        });
        submitButton = Titanium.UI.createButton({
            title: "Utmana",
            height: 40,
            top: 5,
            width: "70%",
            id: "submitButton",
            borderRadius: 6,
            backgroundColor: "#58B101",
            font: {
                fontSize: Alloy.Globals.getFontSize(2),
                fontWeight: "normal",
                fontFamily: Alloy.Globals.getFont()
            },
            color: "#FFF",
            backgroundImage: "none"
        });
        submitButton.addEventListener("click", function() {
            if (facebookFriendsChallenge.length > 0) {
                var dialog;
                var textfield = Ti.UI.createTextField();
                dialog = Ti.UI.createAlertDialog({
                    title: "Ange gruppnamn",
                    message: "En grupp skapas automatiskt för varje utmaning med vänner, vänligen ange namn på gruppen.",
                    androidView: textfield,
                    buttonNames: [ "OK", "Cancel" ]
                });
                dialog.addEventListener("click", function(e) {
                    if (0 == e.index) {
                        var text;
                        text = textfield.value;
                        text.length > 2 && 16 > text.length ? challengeFriends(text) : Alloy.Globals.showFeedbackDialog("Namnet måste var mellan 2 - 15 tecken");
                    } else dialog.hide();
                });
                dialog.show();
            } else Alloy.Globals.showFeedbackDialog("Du måste välja minst en vän att utmana!");
        });
        marginView = Titanium.UI.createView({
            id: "marginView",
            height: 10
        });
        submitButtonsView.add(marginView);
        submitButtonsView.add(submitButton);
        submitButton.add(marginView);
        $.friendSelect.add(submitButtonsView);
    }
    function createFriendsView(array) {
        var fontawesome = require("lib/IconicFont").IconicFont({
            font: "lib/FontAwesome"
        });
        var font = "FontAwesome";
        font = "fontawesome-webfont";
        var templateHeight;
        var topLabelPos = 10;
        templateHeight = Ti.UI.SIZE;
        var facebookTemplate = {
            childTemplates: [ {
                type: "Ti.UI.ImageView",
                bindId: "pic",
                properties: {
                    width: 50,
                    height: 50,
                    left: 0
                }
            }, {
                type: "Ti.UI.Label",
                bindId: "textLabel",
                properties: {
                    color: "#FFF",
                    font: {
                        fontSize: Alloy.Globals.getFontSize(1),
                        fontWeight: "normal",
                        fontFamily: Alloy.Globals.getFont()
                    },
                    left: 70,
                    height: "auto",
                    top: topLabelPos,
                    textAlign: "left",
                    width: "auto"
                }
            }, {
                type: "Ti.UI.Label",
                bindId: "selectLabel",
                properties: {
                    color: "#FFF",
                    font: {
                        fontFamily: font,
                        fontSize: 30
                    },
                    right: 10,
                    height: "auto",
                    width: "auto"
                }
            } ],
            properties: {
                height: templateHeight
            }
        };
        var search = Titanium.UI.createSearchBar({
            barColor: "#303030",
            showCancel: true,
            height: 43,
            hintText: "Sök vänner",
            top: 0,
            color: "#FFF",
            backgroundColor: "#303030"
        });
        search.addEventListener("cancel", function() {
            search.blur();
        });
        search.addEventListener("change", function(e) {
            listView.searchText = e.value;
        });
        listView = Ti.UI.createListView({
            id: "facebookFriends",
            height: "80%",
            templates: {
                template: facebookTemplate
            },
            defaultItemTemplate: "template",
            searchView: search,
            caseInsensitiveSearch: true,
            allowsSelection: true,
            backgroundColor: "#303030"
        });
        listView.footerView = Ti.UI.createView({
            height: .5,
            backgroundColor: "#6d6d6d"
        });
        var sections = [];
        var listHeaderView = Ti.UI.createView({
            height: "142dp",
            backgroundImage: "/images/header.png"
        });
        var listHeaderLabel = Ti.UI.createLabel({
            width: "100%",
            textAlign: "center",
            top: 50,
            text: "Välj vänner",
            font: {
                fontSize: Alloy.Globals.getFontSize(3),
                fontWeight: "normal",
                fontFamily: Alloy.Globals.getFont()
            },
            color: "#FFF"
        });
        listHeaderView.add(listHeaderLabel);
        var dataSection = Ti.UI.createListSection({
            headerView: listHeaderView
        });
        sections.push(dataSection);
        var selectionStyle;
        var items = [];
        for (var i in array) items.push({
            selectLabel: {
                text: "",
                id: i
            },
            textLabel: {
                text: array[i].name
            },
            pic: {
                image: array[i].pic_square
            },
            properties: {
                searchableText: array[i].name,
                itemId: array[i].uid,
                color: "#FFF",
                backgroundColor: "#303030",
                selectionStyle: selectionStyle
            }
        });
        dataSection.setItems(items);
        listView.sections = sections;
        listView.addEventListener("itemclick", function(e) {
            var selected = dataSection.getItemAt(e.itemIndex);
            var searchKey = listView.getSearchText();
            if ("" !== searchKey && "undefined" != typeof searchKey) {
                searchKey = searchKey.toLowerCase();
                var section = listView.sections[e.sectionIndex];
                var _results = _.filter(section.items, function(_item) {
                    return -1 !== _item.properties.searchableText.toLowerCase().indexOf(searchKey);
                });
                for (var i = 0; _results.length > i; i++) if (_results[i].properties.itemId == e.itemId) {
                    e.itemIndex = i;
                    selected = _results[e.itemIndex];
                    e.itemIndex = selected.selectLabel.id;
                    break;
                }
            }
            selected.selectLabel.text = selected.selectLabel.text.length > 0 ? "" : fontawesome.icon("fa-check");
            var friend = {
                name: selected.textLabel.text,
                id: e.itemId
            };
            var index = -1;
            for (var i in facebookFriendsChallenge) if (facebookFriendsChallenge[i].id == e.itemId) {
                index = i;
                break;
            }
            -1 != index ? facebookFriendsChallenge.splice(index, 1) : facebookFriendsChallenge.push(friend);
            dataSection.updateItemAt(e.itemIndex, selected);
        });
        $.friendSelect.add(listView);
        createSubmitButtons();
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "friendSelect";
    if (arguments[0]) {
        __processArg(arguments[0], "__parentSymbol");
        __processArg(arguments[0], "$model");
        __processArg(arguments[0], "__itemTemplate");
    }
    var $ = this;
    var exports = {};
    $.__views.friendSelectWindow = Ti.UI.createWindow({
        layout: "vertical",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        backgroundColor: "#303030",
        id: "friendSelectWindow"
    });
    $.__views.friendSelectWindow && $.addTopLevelView($.__views.friendSelectWindow);
    $.__views.friendSelect = Ti.UI.createView({
        layout: "vertical",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        id: "friendSelect"
    });
    $.__views.friendSelectWindow.add($.__views.friendSelect);
    exports.destroy = function() {};
    _.extend($, $.__views);
    Ti.App.addEventListener("sliderToggled", function(e) {
        "undefined" != typeof listView && (listView.touchEnabled = e.hasSlided ? false : true);
    });
    var facebookFriendsObjects = [];
    var facebookFriendsChallenge = [];
    var listView;
    var submitButton;
    var args = arguments[0] || {};
    var param = args.param || null;
    var uie = require("lib/IndicatorWindow");
    var indicator = uie.createIndicatorWindow({
        top: 200
    });
    $.friendSelectWindow.orientationModes = [ Titanium.UI.PORTRAIT ];
    $.friendSelectWindow.addEventListener("open", function() {
        $.friendSelectWindow.activity.actionBar.onHomeIconItemSelected = function() {
            $.friendSelectWindow.close();
            $.friendSelectWindow = null;
        };
        $.friendSelectWindow.activity.actionBar.displayHomeAsUp = true;
        $.friendSelectWindow.activity.actionBar.title = "Betkampen";
        indicator.openIndicator();
    });
    $.friendSelectWindow.addEventListener("close", function() {
        indicator.closeIndicator();
    });
    Alloy.Globals.checkConnection() ? getFacebookFriends() : Alloy.Globals.showFeedbackDialog("Ingen anslutning!");
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;