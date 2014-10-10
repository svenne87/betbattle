var args = arguments[0] || {};
var match = args.match;

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

if (OS_ANDROID) {
    isAndroid = true;

    $.matchDay.orientationModes = [Titanium.UI.PORTRAIT];

    $.matchDay.addEventListener('open', function() {
        $.matchDay.activity.actionBar.onHomeIconItemSelected = function() {
            $.matchDay.close();
            $.matchDay = null;
        };
        $.matchDay.activity.actionBar.displayHomeAsUp = true;
        $.matchDay.activity.actionBar.title = Alloy.Globals.PHRASES.matchTxt;
    });
} else {
    $.matchDay.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.matchTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });

}

function checkResponded(match) {
    Ti.API.info("CLIKCADE MACHENS MÄSTARE");
    indicator.openIndicator();
    if (Alloy.Globals.checkConnection()) {
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            versusLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
            indicator.closeIndicator();
            Ti.API.error('Bad Sever =>' + e.error);
        };

        try {
            xhr.open('GET', Alloy.Globals.BETKAMPENGETMATCHOTDSTATUSURL + '?lang=' + Alloy.Globals.LOCALE + '&gameID=' + match.game_id);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
            xhr.setTimeout(Alloy.Globals.TIMEOUT);
            xhr.send();
        } catch(e) {
            Ti.API.info("FAIL : " + JSON.stringify(e));
            indicator.closeIndicator();
        }

        xhr.onload = function() {
            if (this.status == '200') {
                if (this.readyState == 4) {
                    indicator.closeIndicator();
                    var resp = null;
                    try {
                        Ti.API.info("RESPONSE INNAN PARSENNNN : " + JSON.stringify(this.responseText));
                        resp = JSON.parse(this.responseText);

                    } catch (e) {
                        resp = null;
                        //Ti.API.info("Match NULL");
                    }

                    if (resp == 2) {
                        Ti.API.info("RESPONSE TOP : " + JSON.stringify(resp));
                        Ti.API.info("MATCH ID TILL MATCHENS MÄSTARE : " + match.game_id);
                        var arg = {
                            round : match.roundID,
                            leagueName : match.leagueName,
                            leagueId : match.leagueID,
                            gameID : match.game_id,
                            matchOTD : 1,
                            bet_amount : match.bet_amount
                        };

                        var win = Alloy.createController('challenge', arg).getView();
                        Alloy.Globals.WINDOWS.push(win);

                        if (OS_IOS) {
                            Alloy.Globals.NAV.openWindow(win, {
                                animated : true
                            });
                        } else if (OS_ANDROID) {
                            win.open({
                                fullScreen : true
                            });
                        }
                    } else if (resp == 1) {
                        var arg = {
                            gameID : match.game_id,
                        };

                        var win = Alloy.createController('showMatchOTD', arg).getView();
                        Alloy.Globals.WINDOWS.push(win);

                        if (OS_IOS) {
                            Alloy.Globals.NAV.openWindow(win, {
                                animated : true
                            });
                        } else if (OS_ANDROID) {
                            win.open({
                                fullScreen : true
                            });
                        }
                    }
                }

            } else {
                indicator.closeIndicator();
                Ti.API.error("Error =>" + this.response);
            }
        };
    } else {
        indicator.closeIndicator();
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
    }
}

var wrapperView = Ti.UI.createView({
    width : Ti.UI.FILL,
    height : Ti.UI.FILL,
    layout : "vertical",
});

var matchOTDinfo = Ti.UI.createLabel({
    top : 20,
    text : Alloy.Globals.PHRASES.matchOTDInfo,
    textAlign : "center",
    color : "#FFF",
    font : Alloy.Globals.FONT,
});

var nextMatch = Alloy.Globals.createButtonView("#FFF", "#000", Alloy.Globals.PHRASES.matchOTDNextBtn);
var previousMatch = Alloy.Globals.createButtonView("#FFF", "#000", Alloy.Globals.PHRASES.matchOTDPreviousBtn);

nextMatch.setTop(60);
nextMatch.addEventListener("click", function(e) {
    checkResponded(match);
});

previousMatch.addEventListener("click", function(e) {

    var win = Alloy.createController('previousMatchOTD').getView();
    Alloy.Globals.WINDOWS.push(win);

    if (OS_IOS) {
        Alloy.Globals.NAV.openWindow(win, {
            animated : true
        });
    } else if (OS_ANDROID) {
        win.open({
            fullScreen : true
        });
    }
});

wrapperView.add(matchOTDinfo);
wrapperView.add(nextMatch);
wrapperView.add(previousMatch);

$.matchDay.add(wrapperView);
