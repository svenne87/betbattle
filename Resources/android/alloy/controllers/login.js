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
            Alloy.Globals.showFeedbackDialog("Något gick fel! Försök igen.");
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
            Alloy.Globals.showFeedbackDialog("Något gick fel! Försök igen.");
        }
        xhr.onload = function() {
            if ("200" == this.status) if (4 == this.readyState) {
                var response = null;
                try {
                    response = JSON.parse(this.responseText);
                } catch (e) {
                    indicator.closeIndicator();
                    addEvent();
                    Alloy.Globals.showFeedbackDialog("Något gick fel! Försök igen.");
                }
                Alloy.Globals.CHALLENGEOBJECTARRAY = Alloy.Globals.constructChallenge(response);
                var args = {
                    dialog: indicator
                };
                var loginSuccessWindow;
                var loginSuccessWindow = Alloy.createController("main", args).getView();
                loginSuccessWindow.open({
                    fullScreen: true,
                    navBarHidden: false,
                    orientationModes: [ Titanium.UI.PORTRAIT ]
                });
                loginSuccessWindow = null;
                addEvent();
                $.login.close();
                null !== Alloy.Globals.INDEXWIN && Alloy.Globals.INDEXWIN.close();
                var activity = Titanium.Android.currentActivity;
                activity.finish();
            } else {
                Alloy.Globals.showFeedbackDialog("Något gick fel! Försök igen.");
                indicator.closeIndicator();
                addEvent();
            } else {
                Alloy.Globals.showFeedbackDialog("Server svarar med felkod " + this.status);
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
            title: "Något gick fel!",
            message: "Ett fel uppstod vid kontaktande av Facebook. Vänligen försök igen.",
            buttonNames: [ "Försök igen", "Stäng" ]
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
                        Alloy.Globals.showFeedbackDialog("Något gick fel! Försök igen.");
                    };
                    try {
                        xhr.open("POST", Alloy.Globals.BETKAMPENLOGINURL);
                        xhr.setRequestHeader("content-type", "application/json");
                        xhr.setTimeout(Alloy.Globals.TIMEOUT);
                        var param = '{"auth_token" : "' + fb.accessToken + '"}';
                        xhr.send(param);
                    } catch (e) {
                        Alloy.Globals.showFeedbackDialog("Något gick fel! Internet kanske inte är på? Försök igen.");
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
                                Alloy.Globals.showFeedbackDialog("Något gick fel! Försök igen.");
                            }
                            if (null !== response) {
                                createLeagueAndUidObj(response);
                                Alloy.Globals.BETKAMPENUID > 0 && getChallengesAndStart();
                            } else {
                                Alloy.Globals.showFeedbackDialog("Något gick fel! Försök igen.");
                                indicator.closeIndicator();
                                addEvent();
                            }
                        } else {
                            Alloy.Globals.showFeedbackDialog("Något gick fel! Försök igen.");
                            indicator.closeIndicator();
                            addEvent();
                        } else {
                            Alloy.Globals.showFeedbackDialog("Något gick fel! Försök igen." + this.status);
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
        Alloy.Globals.checkConnection() ? fb.authorize() : Alloy.Globals.showFeedbackDialog("Ingen Anslutning!");
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "login";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    $.__views.login = Ti.UI.createWindow({
        layout: "vertical",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        backgroundColor: "transparent",
        id: "login"
    });
    $.__views.login && $.addTopLevelView($.__views.login);
    var __alloyId0 = [];
    $.__views.content = Ti.UI.createView({
        height: "100%",
        width: "100%",
        backgroundImage: "/images/Default-Portrait.png",
        layout: "vertical",
        id: "content"
    });
    __alloyId0.push($.__views.content);
    $.__views.facebookBtn = Ti.UI.createView({
        top: "70%",
        height: "7%",
        width: "68.5%",
        backgroundColor: "#336699",
        borderRadius: 3,
        id: "facebookBtn"
    });
    $.__views.content.add($.__views.facebookBtn);
    $.__views.facebookBtnText = Ti.UI.createLabel({
        color: "#FFF",
        left: "19%",
        width: "auto",
        font: {
            fontFamily: "Roboto-Regular",
            fontSize: 16,
            fontWeight: "normal"
        },
        text: "Logga in med facebook",
        id: "facebookBtnText"
    });
    $.__views.facebookBtn.add($.__views.facebookBtnText);
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
        id: "view1"
    });
    __alloyId0.push($.__views.view1);
    $.__views.__alloyId1 = Ti.UI.createLabel({
        color: "#FFF",
        width: "90%",
        textAlign: "center",
        height: Ti.UI.SIZE,
        top: "5%",
        font: {
            fontFamily: "Roboto-Regular",
            fontSize: 22,
            fontWeight: "normal"
        },
        text: "Välj skapa utmaning i menyn för att komma igång!",
        id: "__alloyId1"
    });
    $.__views.view1.add($.__views.__alloyId1);
    $.__views.__alloyId2 = Ti.UI.createView({
        top: "31%",
        left: "16.5%",
        height: "65%",
        width: "70%",
        opacity: .5,
        backgroundColor: "#303030",
        id: "__alloyId2"
    });
    $.__views.view1.add($.__views.__alloyId2);
    $.__views.__alloyId3 = Ti.UI.createImageView({
        top: "30%",
        height: "65%",
        width: "70%",
        image: "/images/tutoneios.png",
        id: "__alloyId3"
    });
    $.__views.view1.add($.__views.__alloyId3);
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
        id: "view2"
    });
    __alloyId0.push($.__views.view2);
    $.__views.__alloyId4 = Ti.UI.createLabel({
        color: "#FFF",
        width: "90%",
        textAlign: "center",
        height: Ti.UI.SIZE,
        top: "5%",
        font: {
            fontFamily: "Roboto-Regular",
            fontSize: 22,
            fontWeight: "normal"
        },
        text: "Välj sedan vilken liga och omgång du vill spela på!",
        id: "__alloyId4"
    });
    $.__views.view2.add($.__views.__alloyId4);
    $.__views.__alloyId5 = Ti.UI.createView({
        top: "31%",
        left: "16.5%",
        height: "65%",
        width: "70%",
        opacity: .5,
        backgroundColor: "#303030",
        id: "__alloyId5"
    });
    $.__views.view2.add($.__views.__alloyId5);
    $.__views.__alloyId6 = Ti.UI.createImageView({
        top: "30%",
        height: "65%",
        width: "70%",
        image: "/images/tutthreeios.png",
        id: "__alloyId6"
    });
    $.__views.view2.add($.__views.__alloyId6);
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
        id: "view3"
    });
    __alloyId0.push($.__views.view3);
    $.__views.__alloyId7 = Ti.UI.createLabel({
        color: "#FFF",
        width: "90%",
        textAlign: "center",
        height: Ti.UI.SIZE,
        top: "5%",
        font: {
            fontFamily: "Roboto-Regular",
            fontSize: 22,
            fontWeight: "normal"
        },
        text: "Gör dina val, satsa Coins och klicka på utmana, i steget efter välj dina vänner att utmana och skicka sedan iväg utmaningen!",
        id: "__alloyId7"
    });
    $.__views.view3.add($.__views.__alloyId7);
    $.__views.__alloyId8 = Ti.UI.createView({
        top: "31%",
        left: "16.5%",
        height: "65%",
        width: "70%",
        opacity: .5,
        backgroundColor: "#303030",
        id: "__alloyId8"
    });
    $.__views.view3.add($.__views.__alloyId8);
    $.__views.__alloyId9 = Ti.UI.createImageView({
        top: "30%",
        height: "65%",
        width: "70%",
        image: "/images/tutfourios.png",
        id: "__alloyId9"
    });
    $.__views.view3.add($.__views.__alloyId9);
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
        id: "view4"
    });
    __alloyId0.push($.__views.view4);
    $.__views.__alloyId10 = Ti.UI.createLabel({
        color: "#FFF",
        width: "90%",
        textAlign: "center",
        height: Ti.UI.SIZE,
        top: "5%",
        font: {
            fontFamily: "Roboto-Regular",
            fontSize: 22,
            fontWeight: "normal"
        },
        text: "För att köpa Coins väljer du Butik i menyn och väljer där hur mycket Coins du vill köpa, följ sedan instruktionerna.",
        id: "__alloyId10"
    });
    $.__views.view4.add($.__views.__alloyId10);
    $.__views.__alloyId11 = Ti.UI.createView({
        top: "31%",
        left: "16.5%",
        height: "65%",
        width: "70%",
        opacity: .5,
        backgroundColor: "#303030",
        id: "__alloyId11"
    });
    $.__views.view4.add($.__views.__alloyId11);
    $.__views.__alloyId12 = Ti.UI.createImageView({
        top: "30%",
        height: "65%",
        width: "70%",
        image: "/images/tutfiveios.png",
        id: "__alloyId12"
    });
    $.__views.view4.add($.__views.__alloyId12);
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
        id: "view5"
    });
    __alloyId0.push($.__views.view5);
    $.__views.__alloyId13 = Ti.UI.createLabel({
        color: "#FFF",
        width: "90%",
        textAlign: "center",
        height: Ti.UI.SIZE,
        top: "5%",
        font: {
            fontFamily: "Roboto-Regular",
            fontSize: 22,
            fontWeight: "normal"
        },
        text: 'Under menyvalet "Min Profil" får du en överblick av dina XP-poäng, vinster, Coins och utmärkelser.',
        id: "__alloyId13"
    });
    $.__views.view5.add($.__views.__alloyId13);
    $.__views.__alloyId14 = Ti.UI.createView({
        top: "31%",
        left: "16.5%",
        height: "65%",
        width: "70%",
        opacity: .5,
        backgroundColor: "#303030",
        id: "__alloyId14"
    });
    $.__views.view5.add($.__views.__alloyId14);
    $.__views.__alloyId15 = Ti.UI.createImageView({
        top: "30%",
        height: "65%",
        width: "70%",
        image: "/images/tutsixios.png",
        id: "__alloyId15"
    });
    $.__views.view5.add($.__views.__alloyId15);
    $.__views.scrollableView = Ti.UI.createScrollableView({
        views: __alloyId0,
        id: "scrollableView",
        showPagingControl: "true"
    });
    $.__views.login.add($.__views.scrollableView);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var listener = function() {
        login();
    };
    var uie = require("lib/IndicatorWindow");
    var indicator = uie.createIndicatorWindow({
        top: 200
    });
    var opened = Ti.App.Properties.getString("appLaunch");
    var fontawesome = require("lib/IconicFont").IconicFont({
        font: "lib/FontAwesome"
    });
    var font = "FontAwesome";
    font = "fontawesome-webfont";
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
    fb.permissions = [ "email", "user_birthday", "user_friends", "user_location", "user_games_activity", "friends_games_activity", "publish_actions" ];
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
            Alloy.Globals.showFeedbackDialog("Något gick fel! Du kanske avbröt inloggningen?");
            indicator.closeIndicator();
        } else if (e.cancelled) {
            Alloy.Globals.showFeedbackDialog("Avbrytet");
            indicator.closeIndicator();
        }
    });
    addEvent();
    if (Alloy.Globals.checkConnection()) {
        if (fb.loggedIn) {
            opened || Ti.App.Properties.setString("appLaunch", JSON.stringify({
                opened: true
            }));
            removeEvent();
            $.login.addEventListener("open", function() {
                indicator.openIndicator();
            });
            setTimeout(function() {
                loginAuthenticated(fb);
            }, 300);
        } else if (!opened) {
            Alloy.Globals.showFeedbackDialog("Välkommen till Betkampen, för att lättare komma igång kan du när du vill titta igenom våran tutorial. Detta gör du genom att bläddra åt höger. Du kan även få mer coins att spela för genom att dela till Facebook.");
            Ti.App.Properties.setString("appLaunch", JSON.stringify({
                opened: true
            }));
        }
    } else Alloy.Globals.showFeedbackDialog("Ingen anslutning!");
    $.login.addEventListener("close", function() {
        indicator.closeIndicator();
        $.scrollableView.removeAllChildren();
        for (child in $.scrollableView.children) $.scrollableView[child] = null;
        children = null;
        $.scrollableView = null;
        $.destroy();
    });
    $.login.addEventListener("android:back", function() {
        $.login.close();
        var activity = Titanium.Android.currentActivity;
        activity.finish();
    });
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;