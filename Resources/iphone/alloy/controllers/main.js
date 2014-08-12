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
            name: Alloy.Globals.PHRASES.fbPostNameTxt,
            caption: Alloy.Globals.PHRASES.fbPostCaptionTxt,
            picture: Alloy.Globals.BETKAMPENURL + "/images/log_bk.png",
            description: Alloy.Globals.PHRASES.fbPostDescriptionTxt
        };
        indicator.openIndicator();
        fb.dialog("feed", data, function(event) {
            if (event.success && event.result) if (Alloy.Globals.checkConnection()) {
                var xhr = Titanium.Network.createHTTPClient();
                xhr.onerror = function(e) {
                    Ti.API.error("Bad Sever =>" + e.error);
                    indicator.closeIndicator();
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
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
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
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
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionError);
            } else {
                indicator.closeIndicator();
                event.error && !event.cancelled && Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.facebookConnectionErrorTxt);
            }
        });
    }
    function shareOnFacebook() {
        if (Alloy.Globals.checkConnection()) {
            var facebookModuleError = true;
            var fb = Alloy.Globals.FACEBOOK;
            var permissions = fb.getPermissions();
            if (permissions.indexOf("publish_actions") > -1) {
                facebookModuleError = false;
                performFacebookPost(fb);
            } else fb.reauthorize([ "publish_actions" ], "friends", function(e) {
                facebookModuleError = false;
                e.success ? performFacebookPost(fb) : e.error && !e.cancelled && Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.facebookConnectionErrorTxt);
            });
            facebookModuleError && Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.unknownFacebookErrorTxt);
        } else Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }
    function createSection() {
        var section = Ti.UI.createTableViewSection();
        var args = {
            title: Alloy.Globals.PHRASES.challengesTxt,
            customView: "challengesView",
            image: "/images/ikon_spelanasta.png"
        };
        section.add(Alloy.createController("menurow", args).getView());
        var args2 = {
            title: Alloy.Globals.PHRASES.createChallengeTxt,
            customView: "newChallengeLeague",
            image: "/images/Skapa_Utmaning.png"
        };
        section.add(Alloy.createController("menurow", args2).getView());
        var args3 = {
            title: Alloy.Globals.PHRASES.myProfileTxt,
            customView: "profile",
            image: "/images/Min_Profil.png"
        };
        section.add(Alloy.createController("menurow", args3).getView());
        var args4 = {
            title: Alloy.Globals.PHRASES.scoreboardTxt,
            customView: "topplistan",
            image: "/images/Topplista.png"
        };
        section.add(Alloy.createController("menurow", args4).getView());
        var args5 = {
            title: Alloy.Globals.PHRASES.storeTxt,
            customView: "store",
            image: "/images/Store.png"
        };
        section.add(Alloy.createController("menurow", args5).getView());
        var args6 = {
            title: Alloy.Globals.PHRASES.termsTxt,
            customView: "terms",
            image: "/images/villkor.png"
        };
        section.add(Alloy.createController("menurow", args6).getView());
        var args7 = {
            title: Alloy.Globals.PHRASES.shareTxt,
            customView: "share",
            image: "/images/share.png"
        };
        section.add(Alloy.createController("menurow", args7).getView());
        var args8 = {
            title: Alloy.Globals.PHRASES.settingsTxt,
            customView: "settings",
            image: "/images/settings.png"
        };
        section.add(Alloy.createController("menurow", args8).getView());
        var args9 = {
            title: Alloy.Globals.PHRASES.signOutTxt,
            customView: "logout",
            image: "/images/Logga_Ut.png"
        };
        section.add(Alloy.createController("menurow", args9).getView());
        return section;
    }
    function rowSelect(e) {
        if (true && "challengesView" !== e.row.customView && "logout" !== e.row.customView && "share" !== e.row.customView) if (Alloy.Globals.checkConnection()) {
            var win = Alloy.createController(e.row.customView).getView();
            if ("newChallengeLeague" === e.row.customView) {
                Alloy.Globals.WINDOWS = [];
                Alloy.Globals.WINDOWS.push(win);
            }
            Alloy.Globals.NAV.openWindow(win, {
                animated: true,
                fullScreen: false
            });
            win = null;
        } else Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionError); else var win;
        "share" === e.row.customView && shareOnFacebook();
        if (true && "logout" === e.row.customView) if (Alloy.Globals.checkConnection()) {
            var alertWindow = Titanium.UI.createAlertDialog({
                title: Alloy.Globals.PHRASES.betbattleTxt,
                message: Alloy.Globals.PHRASES.confirmLogoutDialogTxt,
                buttonNames: [ Alloy.Globals.PHRASES.signOutTxt, Alloy.Globals.PHRASES.abortBtnTxt ]
            });
            alertWindow.addEventListener("click", function(e) {
                switch (e.index) {
                  case 0:
                    var fb = Alloy.Globals.FACEBOOK;
                    Alloy.Globals.CLOSE && fb.addEventListener("logout", function() {
                        alertWindow.hide();
                        Alloy.Globals.CLOSE = false;
                        Alloy.Globals.CURRENTVIEW = null;
                        Alloy.Globals.NAV.close();
                        var login = Alloy.createController("login").getView();
                        login.open({
                            modal: false
                        });
                        login = null;
                    });
                    fb.logout();
                    break;

                  case 1:
                    alertWindow.hide();
                }
            });
            alertWindow.show();
        } else Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
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
        apiName: "Ti.UI.Window",
        classes: [ "container" ],
        id: "mainWin"
    });
    $.__views.ds = Alloy.createWidget("ds.slideMenu", "widget", {
        apiName: "Alloy.Require",
        id: "ds",
        classes: [],
        __parentSymbol: $.__views.mainWin
    });
    $.__views.ds.setParent($.__views.mainWin);
    $.__views.nav = Ti.UI.iOS.createNavigationWindow({
        backgroundImage: "none",
        tintColor: "#FFF",
        barColor: "#FFF",
        translucent: false,
        statusBarStyle: Titanium.UI.iPhone.StatusBar.LIGHT_CONTENT,
        backgroundColor: "none",
        backgroundGradient: "none",
        window: $.__views.mainWin,
        apiName: "Ti.UI.iOS.NavigationWindow",
        id: "nav",
        classes: []
    });
    $.__views.nav && $.addTopLevelView($.__views.nav);
    exports.destroy = function() {};
    _.extend($, $.__views);
    $.mainWin.addEventListener("open", function() {
        var apns = require("lib/push_notifications_apns");
        apns.apns();
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
        top: 200,
        text: Alloy.Globals.PHRASES.loadingTxt
    });
    $.mainWin.addEventListener("close", function() {
        indicator.closeIndicator();
    });
    var iOSVersion;
    iOSVersion = parseInt(Ti.Platform.version);
    var leftData = [];
    leftData[0] = createSection();
    $.ds.leftTableView.backgroundColor = "#000";
    $.ds.leftTableView.separatorColor = "#303030";
    $.ds.leftTableView.footerView = Ti.UI.createView({
        height: .2,
        backgroundColor: "#303030"
    });
    $.ds.leftTableView.separatorStyle = Titanium.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE;
    $.ds.leftTableView.separatorInsets = {
        left: 0,
        right: 0
    };
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
    Alloy.Globals.NAV = $.nav;
    var labelsMenu = [ {
        image: "/images/ButtonMenu.png"
    } ];
    var buttonBarMenu = Titanium.UI.createButtonBar({
        labels: labelsMenu,
        top: 50,
        style: Titanium.UI.iPhone.SystemButtonStyle.BAR,
        height: 25,
        width: Ti.UI.SIZE,
        borderColor: "transparent",
        backgroundColor: "transparent"
    });
    buttonBarMenu.addEventListener("click", function() {
        $.ds.toggleLeftSlider();
    });
    require("lib/IconicFont").IconicFont({
        font: "lib/FontAwesome"
    });
    7 > iOSVersion ? $.mainWin.titleControl = Ti.UI.createLabel({
        text: "Betkampen",
        font: {
            fontSize: Alloy.Globals.getFontSize(2),
            fontWeight: "bold",
            fontFamily: Alloy.Globals.getFont()
        },
        color: "white"
    }) : $.nav.add($.UI.create("ImageView", {
        classes: [ "navLogo" ]
    }));
    $.mainWin.setLeftNavButton(buttonBarMenu);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;