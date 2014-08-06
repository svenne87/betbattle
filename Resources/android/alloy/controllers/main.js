function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function performFacebookPost(fb) {
        var data = {
            link: Alloy.Globals.BETKAMPENURL,
            name: "Gå med i Betkampens VM-turnering!",
            caption: "Stöd Barncancerfonden!",
            picture: Alloy.Globals.BETKAMPENURL + "/images/log_bk.png",
            description: "Utmana dina vänner på att tippa resultaten under fotbolls VM. Ha kul och stöd samtidigt Barncancerfonden! Tävla i turneringar eller utmana på enskilda spel."
        };
        indicator.openIndicator();
        fb.dialog("feed", data, function(event) {
            if (event.success && event.result) if (Alloy.Globals.checkConnection()) {
                var xhr = Titanium.Network.createHTTPClient();
                xhr.onerror = function(e) {
                    Ti.API.error("Bad Sever =>" + e.error);
                    indicator.closeIndicator();
                    Alloy.Globals.showFeedbackDialog("Något gick fel vid kontakt med våran server! Försök igen.");
                };
                try {
                    xhr.open("POST", Alloy.Globals.BETKAMPENSHAREURL);
                    xhr.setRequestHeader("content-type", "application/json");
                    xhr.setRequestHeader("Authorization", Alloy.Globals.FACEBOOK.accessToken);
                    xhr.setTimeout(Alloy.Globals.TIMEOUT);
                    var param = '{"betkampen_id":"' + Alloy.Globals.BETKAMPENUID + '"}';
                    xhr.send(param);
                } catch (e) {
                    indicator.closeIndicator();
                    Alloy.Globals.showFeedbackDialog("Något gick fel vid kontakt med våran server! Försök igen.");
                }
                xhr.onload = function() {
                    if ("200" == this.status) {
                        indicator.closeIndicator();
                        if (4 == this.readyState) {
                            var response = "";
                            try {
                                response = JSON.parse(this.responseText);
                            } catch (e) {}
                            response.indexOf("100 coins") > -1 && Ti.App.fireEvent("updateCoins", {
                                coins: 100
                            });
                            Alloy.Globals.showFeedbackDialog(response);
                            Ti.API.log(response);
                        } else Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
                    } else {
                        indicator.closeIndicator();
                        Ti.API.error("Error =>" + JSON.parse(this.responseText));
                        Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
                    }
                };
            } else {
                indicator.closeIndicator();
                Alloy.Globals.showFeedbackDialog("Ingen anslutning!");
            } else {
                indicator.closeIndicator();
                event.error && !event.cancelled && Alloy.Globals.showFeedbackDialog("Något gick fel när vi försökte kontakta Facebook!");
            }
        });
    }
    function shareOnFacebook() {
        if (Alloy.Globals.checkConnection()) {
            var facebookModuleError = true;
            var fb = Alloy.Globals.FACEBOOK;
            facebookModuleError = false;
            performFacebookPost(fb);
            facebookModuleError && Alloy.Globals.showFeedbackDialog("Ett fel uppstod med Facebook, vänligen prova logga ut och in igen.");
        } else Alloy.Globals.showFeedbackDialog("Ingen anslutning!");
    }
    function createSection() {
        var section = Ti.UI.createTableViewSection();
        var args = {
            title: "Utmaningar",
            customView: "challengesView",
            image: "/images/ikon_spelanasta.png"
        };
        section.add(Alloy.createController("menurow", args).getView());
        var args2 = {
            title: "Skapa utmaning",
            customView: "newChallengeLeague",
            image: "/images/Skapa_Utmaning.png"
        };
        section.add(Alloy.createController("menurow", args2).getView());
        var args3 = {
            title: "Min profil",
            customView: "profile",
            image: "/images/Min_Profil.png"
        };
        section.add(Alloy.createController("menurow", args3).getView());
        var args4 = {
            title: "Topplistan",
            customView: "topplistan",
            image: "/images/Topplista.png"
        };
        section.add(Alloy.createController("menurow", args4).getView());
        var args5 = {
            title: "Butik",
            customView: "store",
            image: "/images/Store.png"
        };
        section.add(Alloy.createController("menurow", args5).getView());
        var args6 = {
            title: "Villkor",
            customView: "terms",
            image: "/images/villkor.png"
        };
        section.add(Alloy.createController("menurow", args6).getView());
        var args7 = {
            title: "Dela",
            customView: "share",
            image: "/images/share.png"
        };
        section.add(Alloy.createController("menurow", args7).getView());
        var args8 = {
            title: "Logga ut",
            customView: "logout",
            image: "/images/Logga_Ut.png"
        };
        section.add(Alloy.createController("menurow", args8).getView());
        return section;
    }
    function rowSelect(e) {
        var win;
        if (true && "challengesView" !== e.row.customView && "logout" !== e.row.customView && "share" !== e.row.customView) if (Alloy.Globals.checkConnection()) {
            var win = Alloy.createController(e.row.customView).getView();
            if ("newChallengeLeague" === e.row.customView) {
                Alloy.Globals.WINDOWS = [];
                Alloy.Globals.WINDOWS.push(win);
            }
            win.open({
                fullScreen: true
            });
            win = null;
        } else Alloy.Globals.showFeedbackDialog("Ingen Anslutning!");
        "share" === e.row.customView && shareOnFacebook();
        if (true && "logout" === e.row.customView) if (Alloy.Globals.checkConnection()) {
            var fb = Alloy.Globals.FACEBOOK;
            fb.addEventListener("logout", function() {
                Ti.API.log("steg 3");
            });
            fb.logout();
            $.mainWin.close();
            var activity = Titanium.Android.currentActivity;
            activity.finish();
        } else Alloy.Globals.showFeedbackDialog("Ingen anslutning!");
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "main";
    if (arguments[0]) {
        __processArg(arguments[0], "__parentSymbol");
        __processArg(arguments[0], "$model");
        __processArg(arguments[0], "__itemTemplate");
    }
    var $ = this;
    var exports = {};
    $.__views.mainWin = Ti.UI.createWindow({
        layout: "vertical",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        backgroundColor: "#303030",
        id: "mainWin"
    });
    $.__views.mainWin && $.addTopLevelView($.__views.mainWin);
    $.__views.ds = Alloy.createWidget("ds.slideMenu", "widget", {
        id: "ds",
        __parentSymbol: $.__views.mainWin
    });
    $.__views.ds.setParent($.__views.mainWin);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var refreshItem;
    var gcm = require("net.iamyellow.gcmjs");
    var pendingData = gcm.data;
    pendingData && null !== pendingData && Ti.API.info("******* data (started) " + JSON.stringify(pendingData));
    gcm.registerForPushNotifications({
        success: function(ev) {
            Alloy.Globals.postDeviceToken(ev.deviceToken);
            Ti.API.info("******* success, " + ev.deviceToken);
        },
        error: function(ev) {
            Ti.API.info("******* error, " + ev.error);
        },
        callback: function(e) {
            try {
                var alertWindow = Titanium.UI.createAlertDialog({
                    title: e.title,
                    message: e.message,
                    buttonNames: [ "OK" ]
                });
                alertWindow.addEventListener("click", function() {
                    alertWindow.hide();
                    Ti.App.fireEvent("challengesViewRefresh");
                });
                alertWindow.show();
            } catch (e) {}
        },
        unregister: function(ev) {
            Ti.API.info("******* unregister, " + ev.deviceToken);
        },
        data: function() {
            try {
                Ti.App.fireEvent("challengesViewRefresh");
                var alertWindow = Titanium.UI.createAlertDialog({
                    title: e.title,
                    message: e.message,
                    buttonNames: [ "OK" ]
                });
                alertWindow.addEventListener("click", function() {
                    alertWindow.hide();
                });
                alertWindow.show();
            } catch (e) {}
        }
    });
    Ti.App.addEventListener("app:updateView", function(obj) {
        var currentView = Alloy.Globals.CURRENTVIEW;
        $.ds.contentview.removeAllChildren();
        for (child in $.ds.contentview.children) $.ds.contentview[child] = null;
        currentView = null !== obj.arg ? Alloy.createController(obj.controller, obj.arg).getView() : Alloy.createController(obj.controller).getView();
        $.ds.contentview.add(currentView);
        Alloy.Globals.CURRENTVIEW = currentView;
    });
    true;
    Alloy.Globals.MAINWIN = $.mainWin;
    if (null !== Alloy.Globals.INDEXWIN) {
        Alloy.Globals.INDEXWIN.close();
        Alloy.Globals.INDEXWIN = null;
    }
    var args = arguments[0] || {};
    var oldIndicator = args.dialog || null;
    if (null !== oldIndicator) {
        oldIndicator.closeIndicator();
        oldIndicator = null;
    }
    var uie = require("lib/IndicatorWindow");
    var indicator = uie.createIndicatorWindow({
        top: 200
    });
    $.mainWin.addEventListener("close", function() {
        indicator.closeIndicator();
    });
    var leftData = [];
    leftData[0] = createSection();
    $.ds.leftTableView.backgroundColor = "#000";
    $.ds.leftTableView.separatorColor = "#303030";
    $.ds.leftTableView.footerView = Ti.UI.createView({
        height: .2,
        backgroundColor: "#303030"
    });
    $.ds.leftTableView.data = leftData;
    var currentView = Alloy.createController("challengesView").getView();
    $.ds.contentview.add(currentView);
    Alloy.Globals.CURRENTVIEW = currentView;
    $.ds.leftTableView.addEventListener("click", function(e) {
        rowSelect(e);
        $.ds.toggleLeftSlider();
    });
    var storedRowTitle = null;
    $.ds.leftTableView.addEventListener("touchstart", function(e) {
        if (null !== storedRowTitle && "undefined" != typeof storedRowTitle) {
            storedRowTitle = e.row.customTitle;
            storedRowTitle.color = "#FFF";
        }
    });
    $.ds.leftTableView.addEventListener("touchend", function() {
        null !== storedRowTitle && "undefined" != typeof storedRowTitle && (storedRowTitle.color = "#666");
    });
    $.ds.leftTableView.addEventListener("scroll", function() {
        null != storedRowTitle && "undefiend" != typeof storedRowTitle && (storedRowTitle.color = "#666");
    });
    Ti.App.addEventListener("sliderToggled", function(e) {
        if ("right" == e.direction) {
            $.ds.leftMenu.zIndex = 2;
            $.ds.rightMenu.zIndex = 1;
            Alloy.Globals.SLIDERZINDEX = 2;
        } else if ("left" == e.direction) {
            $.ds.leftMenu.zIndex = 1;
            $.ds.rightMenu.zIndex = 2;
        }
    });
    Ti.Gesture.addEventListener("orientationchange", function() {
        Ti.Android.currentActivity.setRequestedOrientation(Ti.Android.SCREEN_ORIENTATION_PORTRAIT);
    });
    $.mainWin.orientationModes = [ Titanium.UI.PORTRAIT ];
    $.mainWin.addEventListener("open", function() {
        if ($.mainWin.activity) {
            actionBar = $.mainWin.activity.actionBar;
            if (actionBar) {
                actionBar.icon = "images/ButtonMenu.png";
                actionBar.title = "Betkampen";
                $.mainWin.activity.onCreateOptionsMenu = function(e) {
                    refreshItem = e.menu.add({
                        showAsAction: Ti.Android.SHOW_AS_ACTION_ALWAYS,
                        icon: "images/ic_action_refresh.png"
                    });
                    refreshItem.addEventListener("click", function() {
                        switch (Alloy.Globals.CURRENTVIEW.id) {
                          case "challengesView":
                            Ti.App.fireEvent("challengesViewRefresh");
                            break;

                          case "groupSelect":
                            Ti.App.fireEvent("groupSelectRefresh");
                            break;

                          case "newChallenge":
                            Ti.App.fireEvent("newChallengeRefresh");
                        }
                    });
                };
                $.mainWin.activity.invalidateOptionsMenu();
                actionBar.onHomeIconItemSelected = function() {
                    $.ds.toggleLeftSlider();
                };
            }
        } else Ti.API.error("Can't access action bar on a lightweight window.");
        $.mainWin.open();
    });
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;