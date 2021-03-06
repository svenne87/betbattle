var args = arguments[0] || {};
var context;

var uie = require('lib/IndicatorWindow');

var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

var games = null;
var amount_games = 0;
var challengeCode = "";

if (Alloy.Globals.COUPON === null || Alloy.Globals.COUPON.games === null) {
    Alloy.Globals.showToast(Alloy.Globals.PHRASES.commonErrorTxt);
    $.showCoupon.close();
} else {
    if (Alloy.Globals.COUPON && Alloy.Globals.COUPON.games.length > 0) {
        games = Alloy.Globals.COUPON.games;
        amount_games = games.length;
        challengeCode = Alloy.Globals.COUPON.challenge_code;  
    } else {
        Alloy.Globals.showToast(Alloy.Globals.PHRASES.commonErrorTxt);
        $.showCoupon.close();
    }    
}

var modalPickersToHide = [];
var coinsToJoin = -1;
var amount_deleted = 0;
var added = false;
var betPicker;
var table;
var child = false;
var isAndroid = true;
var iOSVersion;

var fontawesome = require('lib/IconicFont').IconicFont({
    font : 'lib/FontAwesome'
});

var font = 'fontawesome-webfont';

if (OS_IOS) {
    font = 'FontAwesome';
    isAndroid = false;
    child = true;
    iOSVersion = parseInt(Ti.Platform.version);

    $.showCoupon.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.couponTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });

    $.showCoupon.addEventListener('open', function() {
        Alloy.Globals.couponOpen = true;
    });
} else {
    context = require('lib/Context');
}

function onOpen(evt) {
    if (isAndroid) {
        context.on('showCouponActivity', this.activity);
    }
}

function onClose(evt) {
    if (isAndroid) {
        context.off('showCouponActivity');
    }
}

$.showCoupon.addEventListener('close', function() {
    indicator.closeIndicator();
    // hide modal pickers (ios)
    if (!isAndroid) {
        for (picker in modalPickersToHide) {
            modalPickersToHide[picker].close();
        }
    }

    Alloy.Globals.couponOpen = false;
});

function removeCouponGame(gameID) {
    if (Alloy.Globals.checkConnection()) {
        indicator.openIndicator();
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            indicator.closeIndicator();
            Ti.API.error('Bad Sever =>' + e.error);
        };

        try {
            xhr.open('POST', Alloy.Globals.BETKAMPENDELETECOUPONGAMEURL + '?lang=' + Alloy.Globals.LOCALE + '&gameID=' + gameID + '&cid=' + Alloy.Globals.COUPON.id);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
            xhr.setTimeout(Alloy.Globals.TIMEOUT);

            xhr.send();
        } catch(e) {
            indicator.closeIndicator();
        }

        xhr.onload = function() {
            if (this.status == '200') {
                if (this.readyState == 4) {
                    var response = null;
                    response = JSON.parse(this.responseText);
                    Alloy.Globals.showToast(Alloy.Globals.PHRASES.couponGameRemoved);
                    amount_deleted++;

                    // make sure match is removed so that we can check the dates for matches in the array

                    // TODO var games innan ( 3 första rader)

                    for (var i in Alloy.Globals.COUPON.games) {
                        if (Alloy.Globals.COUPON.games[i].game_id == gameID) {
                            var index = Alloy.Globals.COUPON.games.indexOf(Alloy.Globals.COUPON.games[i]);
                            Alloy.Globals.COUPON.games.splice(index, 1);
                        }
                    }

                    // remove table row
                    var index = table.getIndexByName(gameID);
                    table.deleteRow(index);

                    if (amount_deleted == amount_games) {
                        $.showCoupon.setOpacity(0);
                        $.showCoupon.close();
                    }
                    Alloy.Globals.getCoupon();
                }
            } else {
                Ti.API.error("Error =>" + this.response);
            }
            indicator.closeIndicator();
        };
    }
}

function challengeFriends() {
	if (challengeCode !== "") {
		if (validate()) {
			
			var fb = require('facebook');

        	var arg = {
            	coins : coinsToJoin,
            	challengeCode : challengeCode,
            	fb : fb
            };
            
            added = true;
             
            var win = Alloy.createController('groupSelect', arg).getView();
            Alloy.Globals.CURRENTVIEW = win;
            
            if (OS_IOS) {
            	Alloy.Globals.NAV.openWindow(win, {
                	animated : true
                });
            } else {
        		win.fbProxy = fb.createActivityWorker({lifecycleContainer : win});
          	
                win.open({
                	fullScreen : true
                });
            }
        } else {
        	Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.coinsNoBetError);
        }
	} else {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
	}
}

// When clicking the edit icon of a match
var editEvent = function(e) {
    if (e.source.name === 'noEdit') {
        return;
    }

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

var tableHeaderView = Ti.UI.createView({
    height : 0.1,
});

var tableFooterView = Ti.UI.createView({
    height : 0.1
});

if (!isAndroid) {
    table = Titanium.UI.createTableView({
        width : Ti.UI.FILL,
        height : Ti.UI.FILL,
        backgroundColor : '#000',
        footerView : tableFooterView,
        headerView : tableHeaderView,
        style : Ti.UI.iPhone.TableViewStyle.GROUPED,
        tableSeparatorInsets : {
            left : 0,
            right : 0
        },
        separatorStyle : Titanium.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE,
        separatorColor : '#303030'
    });

    if (iOSVersion < 7) {
        table.separatorStyle = Titanium.UI.iPhone.TableViewSeparatorStyle.NONE;
        table.separatorColor = 'transparent';
    }

} else {
    table = Titanium.UI.createTableView({
        width : Ti.UI.FILL,
        footerView : tableFooterView,
        headerView : tableHeaderView,
        height : Ti.UI.FILL,
        backgroundColor : '#000',
        separatorColor : '#303030',
    });
}

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
    text : Alloy.Globals.PHRASES.matchesTxt + " ",
    left : 10,
    top : 25,
    height : Ti.UI.SIZE,
    width : Ti.UI.SIZE,
    font : Alloy.Globals.getFontCustom(18, 'Regular'),
    color : '#FFF'
}));

sections[0] = Ti.UI.createTableViewSection({
    headerView : matchesView
});

if (!isAndroid) {
    sections[0].footerView = Ti.UI.createView({
        height : 0.1
    });
}

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

    var removeView = Ti.UI.createView({
        id : games[i].game_id,
        left : 0,
        height : 75,
        width : 50,
        name : 'noEdit'
    });

    removeView.add(Ti.UI.createLabel({
        id : games[i].game_id,
        font : {
            fontFamily : font,
            fontSize : 32
        },
        text : fontawesome.icon('icon-trash'),
        name : 'noEdit',
        left : 10,
        color : Alloy.Globals.themeColor()
    }));

    removeView.addEventListener('click', function(e) {
        removeCouponGame(e.source.id);
    });

    row.add(removeView);

    var teamOne = games[i].team_1.team_name;
    var teamTwo = games[i].team_2.team_name;

    if (teamOne.length + teamTwo.length > 24) {
        teamOne = teamOne.substring(0, 11);
        teamOne = teamOne + '...';

        teamTwo = teamTwo.substring(0, 11);
        teamTwo = teamTwo + '...';
    } else {
        if (teamOne.length > 15) {
            teamOne = teamOne.substring(0, 12);
            teamOne = teamOne + '...';
        }

        if (teamTwo.length > 15) {
            teamTwo = teamTwo.substring(0, 12);
            teamTwo = teamTwo + '...';
        }
    }

    var teamsLabel = Ti.UI.createLabel({
        text : teamOne + ' - ' + teamTwo + " ",
        font : Alloy.Globals.getFontCustom(16, 'Regular'),
        color : "#FFF",
        left : 50,
        top : 15
    });

    var dateIcon = Ti.UI.createLabel({
        top : 42,
        left : 50,
        height : Ti.UI.SIZE,
        width : Ti.UI.SIZE,
        font : {
            fontFamily : font
        },
        text : fontawesome.icon('fa-clock-o'),
        color : Alloy.Globals.themeColor()
    });

    var dateLabel = Ti.UI.createLabel({
        text : games[i].game_date_string + ' ',
        font : Alloy.Globals.getFontCustom(12, 'Regular'),
        color : Alloy.Globals.themeColor(),
        left : 65,
        top : 40
    });

    if (!child) {
        var rightPercentage = '5%';

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
    text : Alloy.Globals.PHRASES.chooseCoinsBetTxt + " ",
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

function coinsFastSelectDefault() {
    coinsFastSelectViewOne.backgroundColor = '#000';
    coinsFastSelectViewTwo.backgroundColor = '#000';
    coinsFastSelectViewThree.backgroundColor = '#000';
    coinsFastSelectViewFour.backgroundColor = '#000';
    coinsFastSelectViewFive.backgroundColor = '#000';
    coinsFastSelectViewSix.backgroundColor = '#000';
    coinsIconOne.color = Alloy.Globals.themeColor();
    coinsIconTwo.color = Alloy.Globals.themeColor();
    coinsIconThree.color = Alloy.Globals.themeColor();
    coinsIconFour.color = Alloy.Globals.themeColor();
    coinsIconFive.color = Alloy.Globals.themeColor();
    coinsIconSix.color = Alloy.Globals.themeColor();
}

var coinsFastSelectRow = Ti.UI.createTableViewRow({
    hasChild : false,
    className : 'coinsFastSelectRow',
    selectionStyle : 'none',
    height : 75,
    backgroundColor : "#000",
    layout : "horizontal",
});

var phoneWidth = (Titanium.Platform.displayCaps.platformWidth / 3);

var coinsFastSelectViewOne = Ti.UI.createView({
    width : (phoneWidth - 0.5),
    height : 75
});

var coinsIconOne = Ti.UI.createLabel({
    font : {
        fontFamily : font
    },
    left : (phoneWidth / 3),
    text : fontawesome.icon('fa-database'),
    color : Alloy.Globals.themeColor()
});

coinsFastSelectViewOne.add(coinsIconOne);

coinsFastSelectViewOne.add(Ti.UI.createLabel({
    left : (phoneWidth / 3) + 5 + coinsIconOne.toImage().width,
    text : '20',
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    color : '#FFF'
}));

coinsFastSelectViewOne.addEventListener('click', function() {
    coinsToJoin = 20;
    // betPicker.text = '20';  
    coinsFastSelectDefault();
    coinsFastSelectViewOne.backgroundColor = Alloy.Globals.themeColor();
    coinsIconOne.color = '#FFF';
});

coinsFastSelectRow.add(coinsFastSelectViewOne);

coinsFastSelectRow.add(Ti.UI.createView({
    height : 75,
    left : 0,
    width : 0.5,
    backgroundColor : '#303030',
}));

var coinsFastSelectViewTwo = Ti.UI.createView({
    width : (phoneWidth - 0.5),
    height : 75
});

var coinsIconTwo = Ti.UI.createLabel({
    font : {
        fontFamily : font
    },
    left : (phoneWidth / 3),
    text : fontawesome.icon('fa-database'),
    color : Alloy.Globals.themeColor()
});

coinsFastSelectViewTwo.add(coinsIconTwo);

coinsFastSelectViewTwo.add(Ti.UI.createLabel({
    left : (phoneWidth / 3) + 5 + coinsIconTwo.toImage().width,
    text : '40',
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    color : '#FFF'
}));

coinsFastSelectViewTwo.addEventListener('click', function() {
    coinsToJoin = 40;
    // betPicker.text = '40';
    coinsFastSelectDefault();
    coinsFastSelectViewTwo.backgroundColor = Alloy.Globals.themeColor();
    coinsIconTwo.color = '#FFF';
});

coinsFastSelectRow.add(coinsFastSelectViewTwo);

coinsFastSelectRow.add(Ti.UI.createView({
    height : 75,
    left : 0,
    width : 0.5,
    backgroundColor : '#303030',
}));

var coinsFastSelectViewThree = Ti.UI.createView({
    width : (phoneWidth - 2),
    height : 75
});

var coinsIconThree = Ti.UI.createLabel({
    font : {
        fontFamily : font
    },
    left : (phoneWidth / 3),
    text : fontawesome.icon('fa-database'),
    color : Alloy.Globals.themeColor()
});

coinsFastSelectViewThree.add(coinsIconThree);

coinsFastSelectViewThree.add(Ti.UI.createLabel({
    left : (phoneWidth / 3) + 5 + coinsIconThree.toImage().width,
    text : '60',
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    color : '#FFF'
}));

coinsFastSelectViewThree.addEventListener('click', function() {
    coinsToJoin = 60;
    // betPicker.text = '60';
	coinsFastSelectDefault();
    coinsFastSelectViewThree.backgroundColor = Alloy.Globals.themeColor();
    coinsIconThree.color = '#FFF';
});

coinsFastSelectRow.add(coinsFastSelectViewThree);

sections[1].add(coinsFastSelectRow);


 var coinsFastSelectSecondRow = Ti.UI.createTableViewRow({
    hasChild : false,
    className : 'coinsFastSelectSecondRow',
    selectionStyle : 'none',
    height : 75,
    backgroundColor : "#000",
    layout : "horizontal",
});

var coinsFastSelectViewFour = Ti.UI.createView({
    width : (phoneWidth - 0.5),
    height : 75
});

var coinsIconFour = Ti.UI.createLabel({
    font : {
        fontFamily : font
    },
    left : (phoneWidth / 3),
    text : fontawesome.icon('fa-database'),
    color : Alloy.Globals.themeColor()
});

coinsFastSelectViewFour.add(coinsIconFour);

coinsFastSelectViewFour.add(Ti.UI.createLabel({
    left : (phoneWidth / 3) + 5 + coinsIconFour.toImage().width,
    text : '80',
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    color : '#FFF'
}));

coinsFastSelectViewFour.addEventListener('click', function() {
    coinsToJoin = 80;
    // betPicker.text = '80';
	coinsFastSelectDefault();
    coinsFastSelectViewFour.backgroundColor = Alloy.Globals.themeColor();
    coinsIconFour.color = '#FFF';
});

coinsFastSelectSecondRow.add(coinsFastSelectViewFour);

coinsFastSelectSecondRow.add(Ti.UI.createView({
    height : 75,
    left : 0,
    width : 0.5,
    backgroundColor : '#303030',
}));

var coinsFastSelectViewFive = Ti.UI.createView({
    width : (phoneWidth - 0.5),
    height : 75
});

var coinsIconFive = Ti.UI.createLabel({
    font : {
        fontFamily : font
    },
    left : (phoneWidth / 3),
    text : fontawesome.icon('fa-database'),
    color : Alloy.Globals.themeColor()
});

coinsFastSelectViewFive.add(coinsIconFive);

coinsFastSelectViewFive.add(Ti.UI.createLabel({
    left : (phoneWidth / 3) + 5 + coinsIconFive.toImage().width,
    text : '100',
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    color : '#FFF'
}));

coinsFastSelectViewFive.addEventListener('click', function() {
	
    coinsToJoin = 100;
    // betPicker.text = '100';
    coinsFastSelectDefault();
    coinsFastSelectViewFive.backgroundColor = Alloy.Globals.themeColor();
    coinsIconFive.color = '#FFF';
});

coinsFastSelectSecondRow.add(coinsFastSelectViewFive);

coinsFastSelectSecondRow.add(Ti.UI.createView({
    height : 75,
    left : 0,
    width : 0.5,
    backgroundColor : '#303030',
}));

var coinsFastSelectViewSix = Ti.UI.createView({
    width : (phoneWidth - 2),
    height : 75
});

var coinsIconSix = Ti.UI.createLabel({
    font : {
        fontFamily : font
    },
    left : (phoneWidth / 3),
    text : fontawesome.icon('fa-database'),
    color : Alloy.Globals.themeColor()
});

coinsFastSelectViewSix.add(coinsIconSix);

coinsFastSelectViewSix.add(Ti.UI.createLabel({
    left : (phoneWidth / 3) + 5 + coinsIconSix.toImage().width,
    text : '150',
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    color : '#FFF'
}));

coinsFastSelectViewSix.addEventListener('click', function() {
    coinsToJoin = 150;
    // betPicker.text = '150';
	coinsFastSelectDefault();
    coinsFastSelectViewSix.backgroundColor = Alloy.Globals.themeColor();
    coinsIconSix.color = '#FFF';
});

coinsFastSelectSecondRow.add(coinsFastSelectViewSix);

sections[1].add(coinsFastSelectSecondRow);


var footerView = Ti.UI.createView({
    height : Ti.UI.SIZE,
    width : Ti.UI.FILL,
    layout : 'vertical',
    backgroundColor : '#000'
});

var submitButton = Alloy.Globals.createButtonView(Alloy.Globals.themeColor(), '#FFF', Alloy.Globals.PHRASES.createChallengeTxt);

if (isAndroid) {
    submitButton.top = 15;
} else {
    submitButton.top = 25;
}

submitButton.addEventListener('click', function() {
    var gameDatesValid = true;
	
    var games = Alloy.Globals.COUPON.games;
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
        challengeFriends();
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

if (isAndroid) {
    $.showCoupon.orientationModes = [Titanium.UI.PORTRAIT];

    $.showCoupon.addEventListener('open', function() {
        Alloy.Globals.couponOpen = true;
        $.showCoupon.activity.actionBar.onHomeIconItemSelected = function() {
            if($.showCoupon) {
                if($.showCoupon) {
                    $.showCoupon.close();
            		$.showCoupon = null;		
                }
            }
        };
        $.showCoupon.activity.actionBar.displayHomeAsUp = true;
        $.showCoupon.activity.actionBar.title = Alloy.Globals.PHRASES.couponTxt;
    });
}

$.showCoupon.addEventListener('focus', function(e) {
	added = false;
});
