var args = arguments[0] || {};
var match = args.match;
var isAndroid = false;

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
    indicator.openIndicator();
    if (Alloy.Globals.checkConnection()) {
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
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
            indicator.closeIndicator();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        }

        xhr.onload = function() {
            if (this.status == '200') {
                if (this.readyState == 4) {
                    indicator.closeIndicator();
                    var resp = null;
                    try {
                        resp = JSON.parse(this.responseText);
                    } catch (e) {
                        resp = null;
                    }

                    if (resp == 2) {
                        var arg = {
                            round : match.roundID,
                            leagueName : match.leagueName,
                            leagueId : match.leagueID,
                            gameID : match.game_id,
                            matchOTD : 1,
                            bet_amount : match.bet_amount,
                            win : $.matchDay
                        };

                        var win = Alloy.createController('challenge', arg).getView();
                        Alloy.Globals.WINDOWS.push(win);

                        if (!isAndroid) {
                            Alloy.Globals.NAV.openWindow(win, {
                                animated : true
                            });
                        } else {
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

                        if (!isAndroid) {
                            Alloy.Globals.NAV.openWindow(win, {
                                animated : true
                            });
                        } else {
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

// add new line chars to info text
var infoTexts = Alloy.Globals.PHRASES.matchOTDInfo.split('.');
var infoTextFixed = '';
for (var text in infoTexts) {
    if(infoTexts[text] !== '') {
        if(infoTexts[text].charAt(0) === ' ') {
            infoTexts[text]= infoTexts[text].substring(1);
        }
        infoTextFixed += infoTexts[text] + '.' +'\n';
    }
}

var matchOTDinfo = Ti.UI.createLabel({
    top : 20,
    left : 10,
    width: Ti.UI.FILL,
    text : infoTextFixed,
    textAlign : "left",
    color : "#FFF",
    font : Alloy.Globals.getFontCustom(16, "Regular")
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

    if (!isAndroid) {
        Alloy.Globals.NAV.openWindow(win, {
            animated : true
        });
    } else {
        win.open({
            fullScreen : true
        });
    }
});

wrapperView.add(matchOTDinfo);
wrapperView.add(nextMatch);
wrapperView.add(previousMatch);

$.matchDay.add(wrapperView);
