var args = arguments[0] || {};
var isAndroid = false;
var match = null;

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

getMatchOfTheDay();

function getMatchOfTheDay() {
    // check connection
    if (!Alloy.Globals.checkConnection()) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        return;
    }

    indicator.openIndicator();

    var xhr = Titanium.Network.createHTTPClient();
    xhr.onerror = function(e) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        Ti.API.error('Bad Sever =>' + e.error);
        indicator.closeIndicator();
    };

    try {
        xhr.open('GET', Alloy.Globals.BETKAMPENGETMOTDINFO + '?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setTimeout(Alloy.Globals.TIMEOUT);
        xhr.send();
    } catch(e) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        indicator.closeIndicator();
    }

    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {
                try {
                    match = JSON.parse(this.responseText);
                } catch (e) {
                    match = null;
                }
                indicator.closeIndicator();
            }

        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("Error =>" + this.response);
            indicator.closeIndicator();
        }
    };
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
                    } else if (resp == 0) {
                        Alloy.Globals.showToast(Alloy.Globals.PHRASES.noGamesTxt);
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
    if (infoTexts[text] !== '') {
        if (infoTexts[text].charAt(0) === ' ') {
            infoTexts[text] = infoTexts[text].substring(1);
        }
        infoTextFixed += infoTexts[text] + '.' + '\n';
    }
}

var matchOTDinfo = Ti.UI.createLabel({
    top : 10,
    left : 20,
    width : '90%',
    text : infoTextFixed + "\n",
    textAlign : "left",
    color : "#FFF",
    font : Alloy.Globals.getFontCustom(16, "Regular")
});

var table;
var data = [];

var tableHeaderView = Ti.UI.createView({
    height : Ti.UI.SIZE
});

tableHeaderView.add(matchOTDinfo);
tableHeaderView.add(Ti.UI.createView({
    height : 0.5,
    bottom : 0,
    width : Ti.UI.FILL,
    backgroundColor : '#303030'
}));

table = Titanium.UI.createTableView({
    width : Ti.UI.FILL,
    left : 0,
    headerView : tableHeaderView,
    height : '90%',
    backgroundColor : '#000',
    separatorColor : '#303030'
});

if (!isAndroid) {
    var iOSVersion = parseInt(Ti.Platform.version);

    if (iOSVersion < 7) {
        table.separatorStyle = Titanium.UI.iPhone.TableViewSeparatorStyle.NONE;
        table.separatorColor = 'transparent';
    }

    table.separatorInsets = {
        left : 0,
        right : 0
    };
    table.footerView = Ti.UI.createView({
        height : 0.5,
        backgroundColor : '#303030'
    });
} else {
    table.footerView = Ti.UI.createView({
        height : 0.5,
        backgroundColor : '#303030'
    });
}

var child = true;

if (isAndroid) {
    child = false;
}

var nextMatchRow = Ti.UI.createTableViewRow({
    height : 75,
    width : Ti.UI.FILL,
    color : "#FFF",
    backgroundColor : 'transparent',
    font : Alloy.Globals.getFont(),
    hasChild : child,
    selectionStyle : 'none'
});

nextMatchRow.add(Ti.UI.createLabel({
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    text : Alloy.Globals.PHRASES.matchOTDNextBtn,
    color : '#FFF',
    left : 20,
    height : 'auto',
    width : 'auto'
}));

if (isAndroid) {
    nextMatchRow.add(Ti.UI.createLabel({
        font : {
            fontFamily : font
        },
        text : fontawesome.icon('icon-chevron-right'),
        right : rightPercentage,
        color : '#c5c5c5',
        fontSize : 80,
        height : 'auto',
        width : 'auto',
    }));
}

nextMatchRow.addEventListener("click", function(e) {
    if (match !== null) {
        checkResponded(match);
    } else {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
    }
});

var previousMatchRow = Ti.UI.createTableViewRow({
    height : 75,
    width : Ti.UI.FILL,
    color : "#FFF",
    backgroundColor : 'transparent',
    font : Alloy.Globals.getFont(),
    hasChild : child,
    selectionStyle : 'none'
});

previousMatchRow.add(Ti.UI.createLabel({
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    text : Alloy.Globals.PHRASES.matchOTDPreviousBtn,
    color : '#FFF',
    left : 20,
    height : 'auto',
    width : 'auto'
}));

if (isAndroid) {
    previousMatchRow.add(Ti.UI.createLabel({
        font : {
            fontFamily : font
        },
        text : fontawesome.icon('icon-chevron-right'),
        right : rightPercentage,
        color : '#c5c5c5',
        fontSize : 80,
        height : 'auto',
        width : 'auto',
    }));
}

previousMatchRow.addEventListener("click", function(e) {

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

data.push(nextMatchRow);
data.push(previousMatchRow);

table.setData(data);

wrapperView.add(table);
$.matchDay.add(wrapperView);
