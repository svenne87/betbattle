function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function removeEvent() {
        $.facebookBtn.removeEventListener("click", listener);
    }
    function addEvent() {
        $.facebookBtn.addEventListener("click", listener);
    }
    function createLeagueAndUidObj(response) {
        Alloy.Globals.BETKAMPENUID = response.betkampen_uid;
        Alloy.Globals.LEAGUES = [];
        for (var i = 0; response.leagues.length > i; i++) {
            var league = {
                id: response.leagues[i].id,
                name: response.leagues[i].name,
                logo: response.leagues[i].logo
            };
            Alloy.Globals.LEAGUES.push(league);
        }
    }
    function getChallengesAndStart() {
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            Ti.API.error("Bad Sever =>" + e.error);
            indicator.closeIndicator();
            addEvent();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        };
        try {
            xhr.open("GET", Alloy.Globals.BETKAMPENCHALLENGESURL + "/?uid=" + Alloy.Globals.BETKAMPENUID);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setRequestHeader("Authorization", Alloy.Globals.FACEBOOK.accessToken);
            xhr.setTimeout(Alloy.Globals.TIMEOUT);
            Ti.API.log(Alloy.Globals.FACEBOOK.accessToken);
            xhr.send();
        } catch (e) {
            Ti.API.error("Bad Sever =>" + e.error);
            indicator.closeIndicator();
            addEvent();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        }
        xhr.onload = function() {
            if ("200" == this.status) if (4 == this.readyState) {
                var response = null;
                try {
                    response = JSON.parse(this.responseText);
                } catch (e) {
                    indicator.closeIndicator();
                    addEvent();
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                }
                Alloy.Globals.CHALLENGEOBJECTARRAY = Alloy.Globals.constructChallenge(response);
                var args = {
                    dialog: indicator
                };
                var loginSuccessWindow;
                var loginSuccessWindow = Alloy.createController("landingPage", args).getView();
                loginSuccessWindow.open({
                    fullScreen: true,
                    transition: Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT
                });
                loginSuccessWindow = null;
                addEvent();
                $.login.close();
                null !== Alloy.Globals.INDEXWIN && Alloy.Globals.INDEXWIN.close();
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                indicator.closeIndicator();
                addEvent();
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                indicator.closeIndicator();
                addEvent();
                Ti.API.error("Error =>" + this.response);
            }
        };
    }
    function doError() {
        indicator.closeIndicator();
        addEvent();
        var alertWindow = Titanium.UI.createAlertDialog({
            title: Alloy.Globals.PHRASES.commonErrorTxt,
            message: Alloy.Globals.PHRASES.facebookConnectionErrorTxt + " " + Alloy.Globals.PHRASES.retryTxt,
            buttonNames: [ Alloy.Globals.PHRASES.retryBtnTxt, Alloy.Globals.PHRASES.closeBtnTxt ]
        });
        alertWindow.addEventListener("click", function(e) {
            switch (e.index) {
              case 0:
                alertWindow.hide();
                indicator.openIndicator();
                loginAuthenticated(fb);
                break;

              case 1:
                alertWindow.hide();
            }
        });
        alertWindow.show();
    }
    function loginAuthenticated(fb) {
        params = {
            access_token: fb.accessToken
        };
        fb.requestWithGraphPath("/me", params, "GET", function(e) {
            if (e.success) {
                Alloy.Globals.FACEBOOK = fb;
                var result = null;
                try {
                    result = JSON.parse(e.result);
                } catch (Exception) {
                    doError();
                }
                if (null !== result) {
                    for (r in result) ("undefined" == typeof result.r || null === result.r) && ("undefined" == typeof result.location ? result.location = {
                        name: "",
                        id: ""
                    } : result.r = "");
                    Alloy.Globals.FACEBOOKOBJECT = Alloy.createModel("facebook", {
                        id: result.id,
                        bithday: result.birthday,
                        locale: result.locale,
                        location: result.location["name"],
                        username: result.username,
                        fullName: result.name,
                        firstName: result.first_name,
                        lastName: result.last_name,
                        gender: result.gender,
                        email: result.email
                    });
                    var xhr = Titanium.Network.createHTTPClient();
                    xhr.onerror = function(e) {
                        Ti.API.error("Bad Sever =>" + e.error);
                        indicator.closeIndicator();
                        addEvent();
                        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                    };
                    try {
                        xhr.open("POST", Alloy.Globals.BETKAMPENLOGINURL);
                        xhr.setRequestHeader("content-type", "application/json");
                        xhr.setTimeout(Alloy.Globals.TIMEOUT);
                        var param = '{"auth_token" : "' + fb.accessToken + '"}';
                        xhr.send(param);
                    } catch (e) {
                        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.internetMayBeOffErrorTxt);
                        indicator.closeIndicator();
                        addEvent();
                    }
                    xhr.onload = function() {
                        if ("200" == this.status) if (4 == this.readyState) {
                            var response = null;
                            try {
                                response = JSON.parse(this.responseText);
                            } catch (e) {
                                indicator.closeIndicator();
                                addEvent();
                                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                            }
                            if (null !== response) {
                                createLeagueAndUidObj(response);
                                Alloy.Globals.BETKAMPENUID > 0 && getChallengesAndStart();
                            } else {
                                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                                indicator.closeIndicator();
                                addEvent();
                            }
                        } else {
                            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                            indicator.closeIndicator();
                            addEvent();
                        } else {
                            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                            Ti.API.error("Error =>" + this.response);
                            indicator.closeIndicator();
                            addEvent();
                        }
                    };
                } else doError();
            } else e.error && doError();
        });
    }
    function login() {
        Alloy.Globals.checkConnection() ? fb.authorize() : Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "login";
    if (arguments[0]) {
        __processArg(arguments[0], "__parentSymbol");
        __processArg(arguments[0], "$model");
        __processArg(arguments[0], "__itemTemplate");
    }
    var $ = this;
    var exports = {};
    $.__views.login = Ti.UI.createWindow({
        layout: "vertical",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        backgroundColor: "transparent",
        apiName: "Ti.UI.Window",
        classes: [ "container" ],
        id: "login"
    });
    $.__views.login && $.addTopLevelView($.__views.login);
    var __alloyId0 = [];
    $.__views.content = Ti.UI.createView({
        height: "100%",
        width: "100%",
        backgroundImage: "/images/Default-Portrait.png",
        layout: "vertical",
        apiName: "Ti.UI.View",
        id: "content",
        classes: []
    });
    __alloyId0.push($.__views.content);
    $.__views.betbattleLogo = Ti.UI.createImageView({
        apiName: "Ti.UI.ImageView",
        id: "betbattleLogo",
        classes: []
    });
    $.__views.content.add($.__views.betbattleLogo);
    $.__views.facebookBtn = Ti.UI.createView({
        top: "75%",
        height: "7%",
        width: "68.5%",
        backgroundColor: "#336699",
        borderRadius: 3,
        apiName: "Ti.UI.View",
        id: "facebookBtn",
        classes: []
    });
    $.__views.content.add($.__views.facebookBtn);
    $.__views.facebookBtnText = Ti.UI.createLabel({
        color: "#FFF",
        left: "19%",
        width: "auto",
        font: {
            fontFamily: "Helvetica Neue",
            fontSize: 14,
            fontWeight: "normal"
        },
        text: "sign in with Facebook",
        apiName: "Ti.UI.Label",
        id: "facebookBtnText",
        classes: []
    });
    $.__views.facebookBtn.add($.__views.facebookBtnText);
    $.__views.loginBtn = Ti.UI.createView({
        top: "1%",
        height: "7%",
        width: "68.5%",
        backgroundColor: "#fff",
        borderRadius: 3,
        apiName: "Ti.UI.View",
        id: "loginBtn",
        classes: []
    });
    $.__views.content.add($.__views.loginBtn);
    $.__views.loginBtnText = Ti.UI.createLabel({
        color: "#000",
        left: "19%",
        width: "auto",
        font: {
            fontFamily: "Helvetica Neue",
            fontSize: 14,
            fontWeight: "normal"
        },
        text: "Sign in with Email",
        apiName: "Ti.UI.Label",
        id: "loginBtnText",
        classes: []
    });
    $.__views.loginBtn.add($.__views.loginBtnText);
    $.__views.signUpBtn = Ti.UI.createView({
        top: "1%",
        height: "7%",
        width: "68.5%",
        backgroundColor: "#fff",
        borderRadius: 3,
        apiName: "Ti.UI.View",
        id: "signUpBtn",
        classes: []
    });
    $.__views.content.add($.__views.signUpBtn);
    $.__views.signUpBtnText = Ti.UI.createLabel({
        color: "#000",
        left: "19%",
        width: "auto",
        font: {
            fontFamily: "Helvetica Neue",
            fontSize: 14,
            fontWeight: "normal"
        },
        text: "Sign up for Betbattle",
        apiName: "Ti.UI.Label",
        id: "signUpBtnText",
        classes: []
    });
    $.__views.signUpBtn.add($.__views.signUpBtnText);
    $.__views.view1 = Ti.UI.createView({
        backgroundColor: "#61A542",
        backgroundGradient: {
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
                color: "#61A542",
                offset: 0
            }, {
                color: "#458940",
                offset: 1
            } ]
        },
        apiName: "Ti.UI.View",
        id: "view1",
        classes: [ "scrollView" ]
    });
    __alloyId0.push($.__views.view1);
    $.__views.viewOneLabel = Ti.UI.createLabel({
        color: "#FFF",
        width: "90%",
        textAlign: "center",
        height: Ti.UI.SIZE,
        top: "5%",
        font: {
            fontFamily: "Helvetica Neue",
            fontSize: 20,
            fontWeight: "normal"
        },
        text: "Choose create challenge in the menu to get started!",
        apiName: "Ti.UI.Label",
        id: "viewOneLabel",
        classes: [ "tutorialInfoLabel" ]
    });
    $.__views.view1.add($.__views.viewOneLabel);
    $.__views.__alloyId1 = Ti.UI.createView({
        top: "31%",
        left: "16.5%",
        height: "65%",
        width: "70%",
        opacity: .5,
        backgroundColor: "#303030",
        apiName: "Ti.UI.View",
        classes: [ "shadowContainer" ],
        id: "__alloyId1"
    });
    $.__views.view1.add($.__views.__alloyId1);
    $.__views.__alloyId2 = Ti.UI.createImageView({
        top: "30%",
        height: "65%",
        width: "70%",
        apiName: "Ti.UI.ImageView",
        classes: [ "tutorialImage" ],
        image: "/images/tutoneios.png",
        id: "__alloyId2"
    });
    $.__views.view1.add($.__views.__alloyId2);
    $.__views.view2 = Ti.UI.createView({
        backgroundColor: "#61A542",
        backgroundGradient: {
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
                color: "#61A542",
                offset: 0
            }, {
                color: "#458940",
                offset: 1
            } ]
        },
        apiName: "Ti.UI.View",
        id: "view2",
        classes: [ "scrollView" ]
    });
    __alloyId0.push($.__views.view2);
    $.__views.viewTwoLabel = Ti.UI.createLabel({
        color: "#FFF",
        width: "90%",
        textAlign: "center",
        height: Ti.UI.SIZE,
        top: "5%",
        font: {
            fontFamily: "Helvetica Neue",
            fontSize: 20,
            fontWeight: "normal"
        },
        text: "Then choose which league and round you want to play!",
        apiName: "Ti.UI.Label",
        id: "viewTwoLabel",
        classes: [ "tutorialInfoLabel" ]
    });
    $.__views.view2.add($.__views.viewTwoLabel);
    $.__views.__alloyId3 = Ti.UI.createView({
        top: "31%",
        left: "16.5%",
        height: "65%",
        width: "70%",
        opacity: .5,
        backgroundColor: "#303030",
        apiName: "Ti.UI.View",
        classes: [ "shadowContainer" ],
        id: "__alloyId3"
    });
    $.__views.view2.add($.__views.__alloyId3);
    $.__views.__alloyId4 = Ti.UI.createImageView({
        top: "30%",
        height: "65%",
        width: "70%",
        apiName: "Ti.UI.ImageView",
        classes: [ "tutorialImage" ],
        image: "/images/tutthreeios.png",
        id: "__alloyId4"
    });
    $.__views.view2.add($.__views.__alloyId4);
    $.__views.view3 = Ti.UI.createView({
        backgroundColor: "#61A542",
        backgroundGradient: {
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
                color: "#61A542",
                offset: 0
            }, {
                color: "#458940",
                offset: 1
            } ]
        },
        apiName: "Ti.UI.View",
        id: "view3",
        classes: [ "scrollView" ]
    });
    __alloyId0.push($.__views.view3);
    $.__views.viewThreeLabel = Ti.UI.createLabel({
        color: "#FFF",
        width: "90%",
        textAlign: "center",
        height: Ti.UI.SIZE,
        top: "5%",
        font: {
            fontFamily: "Helvetica Neue",
            fontSize: 20,
            fontWeight: "normal"
        },
        text: "Make your selections, bet Coins and hit challenge. After that choose friends to challenge and click to send the challenge!",
        apiName: "Ti.UI.Label",
        id: "viewThreeLabel",
        classes: [ "tutorialInfoLabel" ]
    });
    $.__views.view3.add($.__views.viewThreeLabel);
    $.__views.__alloyId5 = Ti.UI.createView({
        top: "31%",
        left: "16.5%",
        height: "65%",
        width: "70%",
        opacity: .5,
        backgroundColor: "#303030",
        apiName: "Ti.UI.View",
        classes: [ "shadowContainer" ],
        id: "__alloyId5"
    });
    $.__views.view3.add($.__views.__alloyId5);
    $.__views.__alloyId6 = Ti.UI.createImageView({
        top: "30%",
        height: "65%",
        width: "70%",
        apiName: "Ti.UI.ImageView",
        classes: [ "tutorialImage" ],
        image: "/images/tutfourios.png",
        id: "__alloyId6"
    });
    $.__views.view3.add($.__views.__alloyId6);
    $.__views.view4 = Ti.UI.createView({
        backgroundColor: "#61A542",
        backgroundGradient: {
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
                color: "#61A542",
                offset: 0
            }, {
                color: "#458940",
                offset: 1
            } ]
        },
        apiName: "Ti.UI.View",
        id: "view4",
        classes: [ "scrollView" ]
    });
    __alloyId0.push($.__views.view4);
    $.__views.viewFourLabel = Ti.UI.createLabel({
        color: "#FFF",
        width: "90%",
        textAlign: "center",
        height: Ti.UI.SIZE,
        top: "5%",
        font: {
            fontFamily: "Helvetica Neue",
            fontSize: 20,
            fontWeight: "normal"
        },
        text: "To buy Coins you need to choose 'Store' in the menu, you then select the amount you wish to purchase and follow the instructions.",
        apiName: "Ti.UI.Label",
        id: "viewFourLabel",
        classes: [ "tutorialInfoLabel" ]
    });
    $.__views.view4.add($.__views.viewFourLabel);
    $.__views.__alloyId7 = Ti.UI.createView({
        top: "31%",
        left: "16.5%",
        height: "65%",
        width: "70%",
        opacity: .5,
        backgroundColor: "#303030",
        apiName: "Ti.UI.View",
        classes: [ "shadowContainer" ],
        id: "__alloyId7"
    });
    $.__views.view4.add($.__views.__alloyId7);
    $.__views.__alloyId8 = Ti.UI.createImageView({
        top: "30%",
        height: "65%",
        width: "70%",
        apiName: "Ti.UI.ImageView",
        classes: [ "tutorialImage" ],
        image: "/images/tutfiveios.png",
        id: "__alloyId8"
    });
    $.__views.view4.add($.__views.__alloyId8);
    $.__views.view5 = Ti.UI.createView({
        backgroundColor: "#61A542",
        backgroundGradient: {
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
                color: "#61A542",
                offset: 0
            }, {
                color: "#458940",
                offset: 1
            } ]
        },
        apiName: "Ti.UI.View",
        id: "view5",
        classes: [ "scrollView" ]
    });
    __alloyId0.push($.__views.view5);
    $.__views.viewFiveLabel = Ti.UI.createLabel({
        color: "#FFF",
        width: "90%",
        textAlign: "center",
        height: Ti.UI.SIZE,
        top: "5%",
        font: {
            fontFamily: "Helvetica Neue",
            fontSize: 20,
            fontWeight: "normal"
        },
        text: "Under the option 'My Profile' you'll see an overall view for your experience points, total wins and achievements!",
        apiName: "Ti.UI.Label",
        id: "viewFiveLabel",
        classes: [ "tutorialInfoLabel" ]
    });
    $.__views.view5.add($.__views.viewFiveLabel);
    $.__views.__alloyId9 = Ti.UI.createView({
        top: "31%",
        left: "16.5%",
        height: "65%",
        width: "70%",
        opacity: .5,
        backgroundColor: "#303030",
        apiName: "Ti.UI.View",
        classes: [ "shadowContainer" ],
        id: "__alloyId9"
    });
    $.__views.view5.add($.__views.__alloyId9);
    $.__views.__alloyId10 = Ti.UI.createImageView({
        top: "30%",
        height: "65%",
        width: "70%",
        apiName: "Ti.UI.ImageView",
        classes: [ "tutorialImage" ],
        image: "/images/tutsixios.png",
        id: "__alloyId10"
    });
    $.__views.view5.add($.__views.__alloyId10);
    $.__views.scrollableView = Ti.UI.createScrollableView({
        views: __alloyId0,
        apiName: "Ti.UI.ScrollableView",
        id: "scrollableView",
        showPagingControl: "true",
        classes: []
    });
    $.__views.login.add($.__views.scrollableView);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var listener = function() {
        login();
    };
    var uie = require("lib/IndicatorWindow");
    var indicator = uie.createIndicatorWindow({
        top: 200,
        text: Alloy.Globals.PHRASES.loadingTxt
    });
    var opened = Ti.App.Properties.getString("appLaunch");
    var fontawesome = require("lib/IconicFont").IconicFont({
        font: "lib/FontAwesome"
    });
    var font = "FontAwesome";
    $.facebookBtn.add(Ti.UI.createLabel({
        font: {
            fontFamily: font
        },
        text: fontawesome.icon("fa-facebook"),
        left: "10%",
        color: "#FFF",
        fontSize: 40
    }));
    var fb = require("facebook");
    fb.appid = Ti.App.Properties.getString("ti.facebook.appid");
    fb.permissions = [ "email", "user_birthday", "user_friends", "user_location", "user_games_activity", "friends_games_activity" ];
    fb.forceDialogAuth = false;
    Alloy.Globals.FBERROR && fb.addEventListener("login", function(e) {
        indicator.openIndicator();
        Alloy.Globals.FBERROR = false;
        if (e.success) {
            removeEvent();
            setTimeout(function() {
                loginAuthenticated(fb);
            }, 300);
        } else if (e.error) {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.facebookAbortConnectionTxt);
            indicator.closeIndicator();
        } else if (e.cancelled) {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.canceledTxt);
            indicator.closeIndicator();
        }
    });
    addEvent();
    $.facebookBtnText.text = Alloy.Globals.PHRASES.loginFacebookButtonTxt;
    $.viewOneLabel.text = Alloy.Globals.PHRASES.labelOneTxt;
    $.viewTwoLabel.text = Alloy.Globals.PHRASES.labelTwoTxt;
    $.viewThreeLabel.text = Alloy.Globals.PHRASES.labelThreeTxt;
    $.viewFourLabel.text = Alloy.Globals.PHRASES.labelFourTxt;
    $.viewFiveLabel.text = Alloy.Globals.PHRASES.labelFiveTxt;
    if (Alloy.Globals.checkConnection()) {
        if (fb.loggedIn) {
            opened || Ti.App.Properties.setString("appLaunch", JSON.stringify({
                opened: true
            }));
            removeEvent();
            setTimeout(function() {
                indicator.openIndicator();
                fb.authorize();
            }, 300);
        } else if (!opened) {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.welcomePhrase);
            Ti.App.Properties.setString("appLaunch", JSON.stringify({
                opened: true
            }));
        }
    } else Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    $.login.addEventListener("close", function() {
        indicator.closeIndicator();
        $.scrollableView.removeAllChildren();
        for (child in $.scrollableView.children) $.scrollableView[child] = null;
        children = null;
        $.scrollableView = null;
        $.destroy();
    });
    var LoginWindow = Ti.UI.createWindow({
        backgroundColor: "white",
        width: 300,
        height: 300,
        opacity: .8,
        borderRadius: 20
    });
    var username = Titanium.UI.createTextField({
        color: "#336699",
        top: 40,
        left: 25,
        width: 250,
        height: 40,
        hintText: "Username",
        keyboardType: Titanium.UI.KEYBOARD_DEFAULT,
        returnKeyType: Titanium.UI.RETURNKEY_DEFAULT,
        borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
    });
    LoginWindow.add(username);
    var password = Titanium.UI.createTextField({
        color: "#336699",
        top: 90,
        left: 25,
        width: 250,
        height: 40,
        hintText: "Password",
        passwordMask: true,
        keyboardType: Titanium.UI.KEYBOARD_DEFAULT,
        returnKeyType: Titanium.UI.RETURNKEY_DEFAULT,
        borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
    });
    LoginWindow.add(password);
    var signInBtn = Titanium.UI.createButton({
        top: "50%",
        height: "17%",
        width: "68.5%",
        left: "15%",
        backgroundColor: "#000",
        color: "#fff",
        borderRadius: 3,
        title: "Login"
    });
    LoginWindow.add(signInBtn);
    var cancelBtn = Titanium.UI.createButton({
        top: "70%",
        height: "17%",
        width: "68.5%",
        left: "15%",
        backgroundColor: "#000",
        color: "#fff",
        borderRadius: 3,
        title: "Cancel"
    });
    LoginWindow.add(cancelBtn);
    $.loginBtn.addEventListener("click", function() {
        LoginWindow.open({
            modal: true
        });
    });
    cancelBtn.addEventListener("click", function() {
        LoginWindow.close();
    });
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;