var args = arguments[0] || {};
var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

var games = null;
if (Alloy.Globals.COUPON && Alloy.Globals.COUPON.games.length > 0) {
    games = Alloy.Globals.COUPON.games;
} else {
    Alloy.Globals.showToast("Fel i coupons....");
    $.showCoupon.close();
}

var modalPickersToHide = [];
var coinsToJoin = -1;
var amount_games = games.length;
var amount_deleted = 0;
var added = false;
var betPicker;
var table;
var child = true;

var iOSVersion;

if (OS_IOS) {
    iOSVersion = parseInt(Ti.Platform.version);

    $.showCoupon.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.couponTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });
}

var fontawesome = require('lib/IconicFont').IconicFont({
    font : 'lib/FontAwesome'
});

var font = 'FontAwesome';

if (OS_ANDROID) {
    font = 'fontawesome-webfont';
}

function checkFriends() {
    if (Alloy.Globals.checkConnection()) {
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error('Bad Sever =>' + e.error);
            added = false;
        };

        try {
            xhr.open('GET', Alloy.Globals.BETKAMPENGETFRIENDSURL + '?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
            xhr.setRequestHeader("challengesView-type", "application/json");
            xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
            xhr.setTimeout(Alloy.Globals.TIMEOUT);
            xhr.send();
        } catch(e) {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            added = false;
        }
        xhr.onload = function() {
            added = false;
            if (this.status == '200') {
                if (this.readyState == 4) {
                    var response = JSON.parse(this.responseText);
                    // construct array with objects
                    if (response.length > 0) {
                        if (validate()) {
                            var arg = {
                                coins : coinsToJoin
                            };
                            var win = Alloy.createController('groupSelect', arg).getView();
                            Alloy.Globals.CURRENTVIEW = win;
                            if (OS_IOS) {
                                Alloy.Globals.NAV.openWindow(win, {
                                    animated : true
                                });
                            } else {
                                win.open({
                                    fullScreen : true
                                });
                            }
                        } else {
                            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.coinsNoBetError);
                        }
                    } else {

                        var message = Alloy.Globals.PHRASES.noFriendsChallengePrompt;
                        var my_alert = Ti.UI.createAlertDialog({
                            title : 'Betkampen',
                            message : message
                        });
                        my_alert.show();
                        my_alert.addEventListener('click', function(e) {

                            my_alert.hide();

                            var win = Alloy.createController('friendZone').getView();
                            if (OS_IOS) {
                                Alloy.Globals.NAV.openWindow(win, {
                                    animated : true
                                });
                            } else {
                                win.open({
                                    fullScreen : true
                                });
                                win = null;
                            }
                            $.showCoupon.close();

                        });
                    }

                } else {
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                }

            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                Ti.API.error("Error =>" + this.response);
            }
        };
    } else {
        added = false;
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }

}

// When clicking the edit icon of a match
var editEvent = function(e) {
    var args = {
        gameID : e.row.id,
        table : table,
        couponWin : $.showCoupon
    };

    var win = Alloy.createController("editGame", args).getView();
    Alloy.Globals.CURRENTVIEW = win;
    if (OS_IOS) {
        Alloy.Globals.NAV.openWindow(win, {
            animated : true
        });
    } else {
        win.open({
            fullScreen : true
        });
    }
};

if (OS_IOS) {
    var separatorS;
    var separatorCol;

    if (iOSVersion < 7) {
        separatorS = Titanium.UI.iPhone.TableViewSeparatorStyle.NONE;
        separatorColor = 'transparent';
    } else {
        separatorS = Titanium.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE;
        separatorColor = '#303030';
    }

    table = Titanium.UI.createTableView({
        width : Ti.UI.FILL,
        height : Ti.UI.FILL,
        backgroundColor : '#000',
        style : Ti.UI.iPhone.TableViewStyle.GROUPED,
        separatorInsets : {
            left : 0,
            right : 0
        },
        separatorStyle : separatorS,
        separatorColor : separatorColor
    });
} else if (OS_ANDROID) {
    table = Titanium.UI.createTableView({
        width : Ti.UI.FILL,
        height : '85%',
        backgroundColor : '#000',
        separatorColor : '#303030',
    });
    child = true;
}

table.headerView = Ti.UI.createView({
    height : 0.1,
    width : Ti.UI.FILL
});

var sections = [];

var matchesView = Ti.UI.createView({
    height : 75,
    width : Ti.UI.FILL,
    layout : 'vertical',
    backgroundColor : '#303030',
    backgroundGradient : {
        type : "linear",
        startPoint : {
            x : "0%",
            y : "0%"
        },
        endPoint : {
            x : "0%",
            y : "100%"
        },
        colors : [{
            color : "#151515",

        }, {
            color : "#2E2E2E",

        }]
    }
});

matchesView.add(Ti.UI.createLabel({
    text : Alloy.Globals.PHRASES.matchesTxt,
    left : 10,
    top : 25,
    height : Ti.UI.SIZE,
    width : Ti.UI.SIZE,
    font : Alloy.Globals.getFontCustom(18, 'Regular'),
    color : '#FFF'
}));

sections[0] = Ti.UI.createTableViewSection({
    headerView : matchesView,
    footerView : Ti.UI.createView({
        height : 0.1
    })
});

for (var i in games) {
    var row = Ti.UI.createTableViewRow({
        hasChild : child,
        className : 'couponMatch',
        selectionStyle : 'none',
        id : games[i].game_id,
        name : games[i].game_id,
        height : 75,
        backgroundColor : "#000",
        layout : "absolute",
    });

    var teamOne = games[i].team_1.team_name;
    var teamTwo = games[i].team_2.team_name;

    if (teamOne.length + teamTwo.length > 35) {
        teamOne = teamOne.substring(0, 13);
        teamOne = teamOne + '...';

        teamTwo = teamTwo.substring(0, 13);
        teamTwo = teamTwo + '...';
    } else {
        if (teamOne.length > 17) {
            teamOne = teamOne.substring(0, 14);
            teamOne = teamOne + '...';
        }

        if (teamTwo.length > 17) {
            teamTwo = teamTwo.substring(0, 14);
            teamTwo = teamTwo + '...';
        }
    }

    var teamsLabel = Ti.UI.createLabel({
        text : teamOne + ' - ' + teamTwo,
        font : Alloy.Globals.getFontCustom(16, 'Regular'),
        color : "#FFF",
        left : 10,
        top : 15
    });

    var dateIcon = Ti.UI.createLabel({
        top : 42,
        left : 10,
        height : Ti.UI.SIZE,
        width : Ti.UI.SIZE,
        font : {
            fontFamily : font
        },
        text : fontawesome.icon('fa-clock-o'),
        color : Alloy.Globals.themeColor()
    });

    var dateLabel = Ti.UI.createLabel({
        text : games[i].game_date_string,
        font : Alloy.Globals.getFontCustom(12, 'Regular'),
        color : Alloy.Globals.themeColor(),
        left : 25,
        top : 40
    });

    if (child != true) {
        var rightPercentage = '5%';
        font = 'fontawesome-webfont';

        if (Titanium.Platform.displayCaps.platformWidth < 350) {
            rightPercentage = '3%';
        }

        row.add(Ti.UI.createLabel({
            font : {
                fontFamily : font
            },
            text : fontawesome.icon('icon-chevron-right'),
            right : rightPercentage,
            color : '#FFF',
            fontSize : 80,
            height : Ti.UI.SIZE,
            width : Ti.UI.SIZE
        }));
    }

    row.add(teamsLabel);
    row.add(dateIcon);
    row.add(dateLabel);
    row.addEventListener('click', editEvent);
    sections[0].add(row);
}

var coinsView = Ti.UI.createView({
    height : 75,
    width : Ti.UI.FILL,
    layout : 'vertical',
    backgroundColor : '#303030',
    backgroundGradient : {
        type : "linear",
        startPoint : {
            x : "0%",
            y : "0%"
        },
        endPoint : {
            x : "0%",
            y : "100%"
        },
        colors : [{
            color : "#151515",

        }, {
            color : "#2E2E2E",

        }]
    }
});

coinsView.add(Ti.UI.createLabel({
    text : Alloy.Globals.PHRASES.chooseCoinsBetTxt,
    left : 10,
    top : 25,
    height : Ti.UI.SIZE,
    width : Ti.UI.SIZE,
    font : Alloy.Globals.getFontCustom(18, 'Regular'),
    color : '#FFF'
}));

sections[1] = Ti.UI.createTableViewSection({
    headerView : coinsView,
    footerView : Ti.UI.createView({
        height : 0.1
    })
});

var coinsRow = Ti.UI.createTableViewRow({
    hasChild : false,
    className : 'coinsRow',
    selectionStyle : 'none',
    height : 75,
    backgroundColor : "#000",
    layout : "absolute",
});

// create 20, 40, 60, 80, 100 values
var betArray = ['20', '40', '60', '80', '100'];
var data = [];

if (OS_ANDROID) {
    coinsToJoin = -1;
    betPicker = Ti.UI.createLabel({
        top : 18,
        backgroundColor : '#FFF',
        borderRadius : 2,
        width : 120,
        height : 40,
        text : Alloy.Globals.PHRASES.chooseConfirmBtnTxt,
        textAlign : 'center'
    });

    betPicker.addEventListener('click', function() {
        betPicker.open = true;
        Alloy.createWidget('danielhanold.pickerWidget', {
            id : 'sColumnBetPicker',
            outerView : $.showCoupon,
            hideNavBar : false,
            type : 'single-column',
            selectedValues : [20],
            pickerValues : [{
                20 : '20',
                40 : '40',
                60 : '60',
                80 : '80',
                100 : '100'
            }],
            onDone : function(e) {
                if (e.data) {
                    betPicker.setText(e.data[0].value);
                    coinsToJoin = e.data[0].value;
                }
                betpicker.open = false;
            },
        });
    });
} else if (OS_IOS) {
    // default
    data.push(Titanium.UI.createPickerRow({
        title : Alloy.Globals.PHRASES.chooseConfirmBtnTxt,
        value : -1
    }));

    for (var i = 0; i < betArray.length; i++) {
        data.push(Titanium.UI.createPickerRow({
            title : '' + betArray[i],
            value : betArray[i]
        }));
    }

    var ModalPicker = require("lib/ModalPicker");
    var visualPrefs = {
        top : 18,
        opacity : 0.85,
        borderRadius : 3,
        backgroundColor : '#FFF',
        width : 140,
        height : 40,
        textAlign : 'center'
    };

    betPicker = new ModalPicker(visualPrefs, data, Alloy.Globals.PHRASES.chooseConfirmBtnTxt, Alloy.Globals.PHRASES.closeBtnTxt);
    modalPickersToHide.push(betPicker);

    betPicker.text = Alloy.Globals.PHRASES.chooseConfirmBtnTxt;

    betPicker.self.addEventListener('change', function(e) {
        coinsToJoin = betPicker.value;
    });
}

coinsRow.add(betPicker);

coinsRow.addEventListener('click', function() {
    if (betPicker.open) {
        // the picker is visible, don't do anything
        return;
    }
    betPicker.fireEvent('click');
});

sections[1].add(coinsRow);

var footerView = Ti.UI.createView({
    height : Ti.UI.SIZE,
    width : Ti.UI.FILL,
    layout : 'vertical',
    backgroundColor : '#000'
});

var submitButton = Alloy.Globals.createButtonView(Alloy.Globals.themeColor(), '#FFF', Alloy.Globals.PHRASES.challengeBtnTxt);
submitButton.top = 45;
submitButton.addEventListener('click', function() {
    var gameDatesValid = true;

    // check if any of the games in the coupon has started / already finished.
    for (var i = 0; i < games.length; i++) {
        var gameDateMilli = games[i].game_date + "000";
        var gameDate = new Date((gameDateMilli - 0));
        var now = new Date();

        if (now.getTime() > gameDate.getTime()) {
            gameDatesValid = false;
        }

    }

    if (!added && gameDatesValid) {
        checkFriends();
        added = true;
    } else if (!gameDatesValid) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.invalidDatesTxt);
    }
});

footerView.add(submitButton);

table.footerView = footerView;

table.setData(sections);
$.showCoupon.add(table);

function validate() {
    if (coinsToJoin == -1) {
        return false;
    } else {
        return true;
    }
}

if (OS_ANDROID) {
    font = 'fontawesome-webfont';

    $.showCoupon.orientationModes = [Titanium.UI.PORTRAIT];

    $.showCoupon.addEventListener('open', function() {
        $.showCoupon.activity.actionBar.onHomeIconItemSelected = function() {
            $.showCoupon.close();
            $.showCoupon = null;
        };
        $.showCoupon.activity.actionBar.displayHomeAsUp = true;
        $.showCoupon.activity.actionBar.title = Alloy.Globals.PHRASES.couponTxt;
    });

}