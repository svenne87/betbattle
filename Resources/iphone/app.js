var Alloy = require("alloy"), _ = Alloy._, Backbone = Alloy.Backbone;

Alloy.Globals.FACEBOOKOBJECT;

Alloy.Globals.FACEBOOK;

Alloy.Globals.CHALLENGEOBJECTARRAY = [];

Alloy.Globals.BETKAMPENUID = 0;

Alloy.Globals.CHALLENGEINDEX;

Alloy.Globals.LEAGUES;

Alloy.Globals.AVAILABLELANGUAGES;

Alloy.Globals.SLIDERZINDEX = 1;

Alloy.Globals.TIMEOUT = 3e4;

Alloy.Globals.CURRENTVIEW;

Alloy.Globals.PREVIOUSVIEW;

Alloy.Globals.NAV = null;

Alloy.Globals.MAINVIEW;

Alloy.Globals.MAINWIN = null;

Alloy.Globals.WINDOWS = [];

Alloy.Globals.OPEN = true;

Alloy.Globals.CLOSE = true;

Alloy.Globals.FBERROR = true;

Alloy.Globals.PHRASES = {};

var lang = JSON.parse(Ti.App.Properties.getString("language"));

if ("undefined" == typeof lang || "" == lang || null == lang) Alloy.Globals.LOCALE = Titanium.Locale.getCurrentLanguage().toLowerCase(); else {
    lang = lang.language;
    Alloy.Globals.LOCALE = lang;
}

Alloy.Globals.INVITEURL = "https://apps.facebook.com/betkampen";

Alloy.Globals.BETKAMPENURL = "http://secure.jimdavislabs.se/secure/betkampen_vm";

Alloy.Globals.BETKAMPENLOGINURL = Alloy.Globals.BETKAMPENURL + "/api/login.php";

Alloy.Globals.BETKAMPENCHALLENGESURL = Alloy.Globals.BETKAMPENURL + "/api/challenges_v2.php";

Alloy.Globals.BETKAMPENUSERURL = Alloy.Globals.BETKAMPENURL + "/api/user_stats.php";

Alloy.Globals.BETKAMPENGAMESURL = Alloy.Globals.BETKAMPENURL + "/api/get_challenge_game.php";

Alloy.Globals.BETKAMPENANSWERURL = Alloy.Globals.BETKAMPENURL + "/api/answer_challenge.php";

Alloy.Globals.BETKAMPENGETGAMESURL = Alloy.Globals.BETKAMPENURL + "/api/get_available_games.php";

Alloy.Globals.BETKAMPENGETGAMESFORCHALLENGEURL = Alloy.Globals.BETKAMPENURL + "/api/get_game_and_types_for_challenge.php";

Alloy.Globals.BETKAMPENGETGAMESFORTOURNAMENT = Alloy.Globals.BETKAMPENURL + "/api/get_tournament_game.php";

Alloy.Globals.BETKAMPENGETGROUPSURL = Alloy.Globals.BETKAMPENURL + "/api/get_groups.php";

Alloy.Globals.BETKAMPENCHALLENGEDONEURL = Alloy.Globals.BETKAMPENURL + "/api/challenge_done.php";

Alloy.Globals.BETKAMPENDEVICETOKENURL = Alloy.Globals.BETKAMPENURL + "/api/store_device_token.php";

Alloy.Globals.BETKAMPENCOINSURL = Alloy.Globals.BETKAMPENURL + "/api/get_coins.php";

Alloy.Globals.BETKAMPENCHECKCOINSURL = Alloy.Globals.BETKAMPENURL + "/api/check_coins.php";

Alloy.Globals.BETKAMPENCOINSANDROIDURL = Alloy.Globals.BETKAMPENURL + "/api/get_coins_android.php";

Alloy.Globals.BETKAMPENSHAREURL = Alloy.Globals.BETKAMPENURL + "/api/share.php";

Alloy.Globals.GETLANGUAGE = Alloy.Globals.BETKAMPENURL + "/api/get_language.php";

Alloy.Globals.performTimeout = function(func) {
    func;
};

Alloy.Globals.themeColor = function() {
    var theme = 2;
    switch (theme) {
      case 1:
        return "#58B101";

      case 2:
        return "#ea7337";
    }
};

Alloy.Globals.getFont = function() {
    return "Helvetica Neue";
};

Alloy.Globals.getFontSize = function(target) {
    var font;
    1 === target ? font = 16 : 2 === target ? font = 22 : 3 === target && (font = 44);
    return font;
};

Alloy.Globals.showFeedbackDialog = function(msg) {
    var alertWindow = Titanium.UI.createAlertDialog({
        title: Alloy.Globals.PHRASES.betbattleTxt,
        message: msg,
        buttonNames: [ Alloy.Globals.PHRASES.okConfirmTxt ]
    });
    alertWindow.addEventListener("click", function(e) {
        switch (e.index) {
          case 0:
            alertWindow.hide();
        }
    });
    alertWindow.show();
};

Alloy.Globals.checkConnection = function() {
    return Titanium.Network.online;
};

Alloy.Globals.postDeviceToken = function(deviceToken) {
    if (Alloy.Globals.checkConnection()) {
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            Ti.API.error("Bad Sever =>" + e.error);
        };
        try {
            xhr.open("POST", Alloy.Globals.BETKAMPENDEVICETOKENURL);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setRequestHeader("Authorization", Alloy.Globals.FACEBOOK.accessToken);
            xhr.setTimeout(Alloy.Globals.TIMEOUT);
            var param = '{"device_token":"' + deviceToken + '", "device_type":"' + Ti.Platform.osname + '", "lang":"' + Alloy.Globals.LOCALE + '"}';
            xhr.send(param);
        } catch (e) {}
        xhr.onload = function() {
            if ("200" == this.status) if (4 == this.readyState) {
                var response = "";
                try {
                    response = this.response;
                } catch (e) {}
                Ti.API.log(response);
            } else Ti.API.log(this.response); else Ti.API.error("Error =>" + this.response);
        };
    } else Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
};

Alloy.Globals.checkCoins = function() {
    if (Alloy.Globals.checkConnection()) {
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            Ti.API.error("Bad Sever =>" + e.error);
        };
        try {
            xhr.open("POST", Alloy.Globals.BETKAMPENCHECKCOINSURL + "?uid=" + Alloy.Globals.BETKAMPENUID + "&lang=" + Alloy.Globals.LOCALE);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setRequestHeader("Authorization", Alloy.Globals.FACEBOOK.accessToken);
            xhr.setTimeout(Alloy.Globals.TIMEOUT);
            xhr.send();
        } catch (e) {}
        xhr.onload = function() {
            if ("200" == this.status) {
                if (4 == this.readyState) {
                    var coins = null;
                    try {
                        coins = JSON.parse(this.responseText);
                        coins = parseInt(coins);
                    } catch (e) {
                        coins = null;
                    }
                    if (null !== coins && 0 >= coins) {
                        var alertWindow = Titanium.UI.createAlertDialog({
                            title: Alloy.Globals.PHRASES.betbattleTxt,
                            message: Alloy.Globals.PHRASES.noCoinsErrorTxt,
                            buttonNames: [ Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.storeTxt ]
                        });
                        alertWindow.addEventListener("click", function(e) {
                            switch (e.index) {
                              case 0:
                                alertWindow.hide();
                                break;

                              case 1:
                                var win = Alloy.createController("store").getView();
                                Alloy.Globals.NAV.openWindow(win, {
                                    animated: true
                                });
                                alertWindow.hide();
                            }
                        });
                        alertWindow.show();
                    }
                }
            } else Ti.API.error("Error =>" + this.response);
        };
    }
};

Alloy.Globals.constructChallenge = function(responseAPI) {
    var finalArray = [];
    for (var c = 0; responseAPI.length > c; c++) {
        response = responseAPI[c];
        var array = [];
        for (var i = 0; response.length > i; i++) {
            var cOpponents = [];
            for (var x = 0; response[i].opponents.length > x; x++) {
                var opponent = {
                    fbid: response[i].opponents[x].fbid,
                    name: response[i].opponents[x].name,
                    status: response[i].opponents[x].status
                };
                cOpponents.push(opponent);
            }
            var cWinners = [];
            for (var z = 0; response[i].winners.length > z; z++) {
                var winner = {
                    fbid: response[i].winners[z].fbid,
                    name: response[i].winners[z].name,
                    uid: response[i].winners[z].uid
                };
                cWinners.push(winner);
            }
            if (3 == c || 4 == c) var challenge = Alloy.createModel("challenge", {
                id: response[i].id,
                name: response[i].t_name,
                time: response[i].game_date,
                opponents: cOpponents,
                winners: cWinners,
                group: response[i].group,
                league: response[i].league_id,
                round: response[i].rnd,
                opponentCount: response[i].count_opps,
                tournamentPot: response[i].pot,
                show: response[i].show
            }); else var challenge = Alloy.createModel("challenge", {
                id: response[i].c_id,
                name: response[i].c_name,
                fbid: response[i].c_fbid,
                time: response[i].c_time,
                status: response[i].status,
                opponents: cOpponents,
                pot: response[i].pot,
                potential_pot: response[i].potential_pot,
                winners: cWinners,
                group: response[i].group,
                league: response[i].league,
                round: response[i].round,
                show: response[i].show
            });
            array.push(challenge);
        }
        finalArray.push(array);
    }
    return finalArray;
};

Alloy.createController("index");