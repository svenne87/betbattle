var args = arguments[0] || {};

if (args.refresh) {
    getChallenges();
}

var iOSVersion;
var isAndroid = false;
var data = [];

if (OS_IOS) {
    iOSVersion = parseInt(Ti.Platform.version);
    $.challenges_finished.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.finishedTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });
} else {
    isAndroid = true;
}
var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

if (!isAndroid) {
    refresher = Ti.UI.createRefreshControl({
        tintColor : Alloy.Globals.themeColor()
    });

    // will refresh on pull
    refresher.addEventListener('refreshstart', function(e) {
        if (Alloy.Globals.checkConnection()) {
            getChallenges();
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
            refresher.endRefreshing();

        }

    });
}

var tableHeaderView = Ti.UI.createView({
    height : 0.1,
});

var tableFooterView = Ti.UI.createView({
    height : 0.1,
});

var fontawesome = require('lib/IconicFont').IconicFont({
    font : 'lib/FontAwesome'
});

var font = 'FontAwesome';
var rightPercentage = '5%';

if (isAndroid) {
    font = 'fontawesome-webfont';

    if (Titanium.Platform.displayCaps.platformWidth < 350) {
        rightPercentage = '3%';
    }
}

if (!isAndroid) {
    table = Titanium.UI.createTableView({
        left : 0,
        headerView : tableHeaderView,
        footerView : tableFooterView,
        height : '100%',
        width : '100%',
        backgroundColor : 'transparent',
        style : Ti.UI.iPhone.TableViewStyle.GROUPED,
        separatorInsets : {
            left : 0,
            right : 0
        },
        id : 'challengeTable',
        refreshControl : refresher,
        separatorColor : '#303030'
    });

    if (iOSVersion < 7) {
        table.separatorStyle = Titanium.UI.iPhone.TableViewSeparatorStyle.NONE;
        table.separatorColor = 'transparent';
    }

} else if (OS_ANDROID) {
    table = Titanium.UI.createTableView({
        width : Ti.UI.FILL,
        top : 0,
        left : 0,
        headerView : tableHeaderView,
        footerView : tableFooterView,
        height : Ti.UI.FILL,
        separatorColor : '#303030',
        id : 'challengeTable'
    });

    table.headerView = Ti.UI.createView({
        height : 0.5,
        backgroundColor : '#303030'
    });

    table.footerView = Ti.UI.createView({
        height : 0.5,
        backgroundColor : '#303030'
    });
}

// when clicking a row
table.addEventListener('click', function(e) {
    if (Alloy.Globals.SLIDERZINDEX == 2) {
        return;
    }

    // e.rowData is null in android
    if (isAndroid) {
        // fix for android
        e.rowData = e.row;
    }

    if (e.rowData !== null) {
        if (Alloy.Globals.checkConnection()) {
            if ( typeof e.rowData.id !== 'undefined') {
                var obj = Alloy.Globals.CHALLENGEOBJECTARRAY[2][e.rowData.id];
                if (obj.attributes.show !== 0) {
                    // view challenge
                    Alloy.Globals.CHALLENGEINDEX = e.rowData.id;
                    args = {
                        cid : obj.id,
                    };
                    var win = Alloy.createController('showChallenge', args).getView();

                    if (OS_IOS) {
                        Alloy.Globals.NAV.openWindow(win, {
                            animated : true
                        });
                    } else if (OS_ANDROID) {
                        win.open({
                            fullScreen : true
                        });
                    }
                } else {
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.roundHasStartedErrorTxt);
                }
            }
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        }
    }
});

buildTableRows();
$.challenges_finished.add(table);

function buildTableRows() {
    table.setData([]);
    data = [];

    var arrayObj = Alloy.Globals.CHALLENGEOBJECTARRAY[2];
    // create 'accept' rows
    if (arrayObj.length > 0) {
        for (var i = 0; i < arrayObj.length; i++) {
            data.push(constructChallengeRows(arrayObj[i], i));
        }
    } else if (arrayObj.length === 0) {
        data.push(createEmptyTableRow(Alloy.Globals.PHRASES.challengesSmallTxt));
    }

    table.setData(data);
}

function constructChallengeRows(obj, index) {
    var child = true;
    if (isAndroid) {
        child = false;
    }

    var row = Ti.UI.createTableViewRow({
        id : index,
        hasChild : child,
        width : Ti.UI.FILL,
        left : 0,
        className : "finished_row",
        height : 75
    });
    
    // add custom icon on Android to symbol that the row has child
    if (child != true) {
        row.add(Ti.UI.createLabel({
            font : {
                fontFamily : font
            },
            text : fontawesome.icon('icon-chevron-right'),
            right : rightPercentage,
            color : '#FFF',
            fontSize : 80,
            height : 'auto',
            width : 'auto'
        }));
    }

    var imageLocation;
    // set correct image
    if (obj.attributes.leagueMixed) {
        // this is a mixed challenge
        imageLocation = '/images/ikoner_mix_sport.png';
    } else {
        // not a mixed challenge, just get sport from league[0]
        if (obj.attributes.leagues[0].sport_id === '1') {
            // Hockey
            if (isAndroid) {
                imageLocation = '/images/ikonhockey.png';
            } else {
                imageLocation = '/images/Ikonhockey.png';
            }
        } else if (obj.attributes.leagues[0].sport_id === '2') {
            // Soccer
            if (isAndroid) {
                imageLocation = '/images/ikonfotboll.png';
            } else {
                imageLocation = '/images/Ikonfotboll.png';
            }
        } else {
            imageLocation = '/images/ikoner_mix_sport.png';
        }
    }

    row.add(Ti.UI.createImageView({
        image : imageLocation,
        left : 10,
        width : 30,
        height : 30
    }));

    var firstRowView = Ti.UI.createView({
        top : -20,
        layout : 'absolute',
        width : 'auto'
    });

    var betGroupName = Alloy.Globals.PHRASES.unknownGroupTxt;

    // for normal challenge
    try {
        betGroupName = obj.attributes.group[0].name;
    } catch(e) {
        // do nothing
        betGroupName = "";
    }

    if (betGroupName <= 0) {
        betGroupName = obj.attributes.name;
    }
    if (betGroupName.length > 15) {
        betGroupName = betGroupName.substring(0, 12) + '...';
    }

    firstRowView.add(Ti.UI.createLabel({
        left : 60,
        text : betGroupName + ' ',
        font : Alloy.Globals.getFontCustom(16, 'Regular'),
        color : '#FFF'
    }));

    var secondRowView = Ti.UI.createView({
        top : 25,
        layout : 'absolute',
        width : 'auto'
    });

    var date = obj.attributes.time;
    date = date.substring(0, 10);
    date = date.substring(5);

    // check first char
    if (date.charAt(0) == '0') {
        date = date.substring(1);
    }

    // change position
    var datePartOne = date.substring(date.lastIndexOf('-'));
    datePartOne = datePartOne.replace('-', '');
    if (datePartOne.charAt(0) == '0') {
        datePartOne = datePartOne.substring(1);
    }

    var datePartTwo = date.substring(0, date.indexOf('-'));
    date = datePartOne + '/' + datePartTwo;

    var time = obj.attributes.time;
    time = time.substring(time.length - 8);
    time = time.substring(0, 5);

    var startTextLabel = Ti.UI.createLabel({
        left : 60,
        font : {
            fontFamily : font
        },
        text : fontawesome.icon('fa-clock-o'),
        color : Alloy.Globals.themeColor()
    });

    secondRowView.add(startTextLabel);

    var startTextValueLabel = Ti.UI.createLabel({
        left : 75,
        text : '' + date + ' ' + time,
        font : Alloy.Globals.getFontCustom(12, 'Regular'),
        color : Alloy.Globals.themeColor()
    });

    secondRowView.add(startTextValueLabel);

    var participantsTextLabel = Ti.UI.createLabel({
        left : 160,
        font : {
            fontFamily : font
        },
        text : fontawesome.icon('icon-user'),
        color : Alloy.Globals.themeColor()
    });

    secondRowView.add(participantsTextLabel);

   var oppCount = parseInt(obj.attributes.opponents.length);

    var participantsValueLabel = Ti.UI.createLabel({
        left : 175,
        text : oppCount.toString() + ' ',
        font : Alloy.Globals.getFontCustom(12, 'Regular'),
        color : Alloy.Globals.themeColor()
    });

    secondRowView.add(participantsValueLabel);

    var potTextLabel = Ti.UI.createLabel({
        left : (160 + participantsValueLabel.toImage().width + 5 + participantsTextLabel.toImage().width + 2),
        font : {
            fontFamily : font
        },
        text : fontawesome.icon('fa-database'),
        color : Alloy.Globals.themeColor()
    });

    secondRowView.add(potTextLabel);

    var currentPot = Alloy.Globals.PHRASES.unknownSmallTxt;

    try {
        currentPot = obj.attributes.pot;
    } catch (e) {
        currentPot = Alloy.Globals.PHRASES.unknownSmallTxt;
    }
    var potValueLabel = Ti.UI.createLabel({
        left : (160 + participantsValueLabel.toImage().width + 2 + participantsTextLabel.toImage().width + 6 + potTextLabel.toImage().width + 2),
        text : '' + currentPot,
        font : Alloy.Globals.getFontCustom(12, 'Regular'),
        color : Alloy.Globals.themeColor()
    });

    secondRowView.add(potValueLabel);

    // Add info to the created row
    row.add(firstRowView);
    row.add(secondRowView);

    row.add(Ti.UI.createView({
        top : 60,
        heigth : 14,
        layout : 'horizontal'
    }));

    if (iOSVersion < 7) {
        row.add(Ti.UI.createView({
            height : 0.5,
            top : 65,
            backgroundColor : '#303030',
            width : '120%'
        }));
    }

    return row;
}

function getChallenges() {
    // Get challenges
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onerror = function(e) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        if (OS_IOS) {
            if ( typeof refresher !== 'undefined') {
                refresher.endRefreshing();
            }
        }
        Ti.API.error('Bad Sever =>' + e.error);
        indicator.closeIndicator();
    };

    try {
        xhr.open('GET', Alloy.Globals.BETKAMPENCHALLENGESURL + '/?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
        xhr.setRequestHeader("challengesView-type", "application/json");
        xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
        xhr.setTimeout(Alloy.Globals.TIMEOUT);
        xhr.send();
    } catch(e) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        if (!isAndroid) {
            if ( typeof refresher !== 'undefined') {
                refresher.endRefreshing();
            }
        }
        indicator.closeIndicator();
    }
    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {
                var response = JSON.parse(this.responseText);
                // construct array with objects
                Alloy.Globals.CHALLENGEOBJECTARRAY = Alloy.Globals.constructChallenge(response);
                buildTableRows();
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            }
            if (!isAndroid) {
                if ( typeof refresher !== 'undefined') {
                    refresher.endRefreshing();
                }
            }
            indicator.closeIndicator();
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            indicator.closeIndicator();
            if (!isAndroid) {
                if ( typeof refresher !== 'undefined') {
                    refresher.endRefreshing();
                }
            }
            Ti.API.error("Error =>" + this.response);
        }
    };
}

function createEmptyTableRow(text) {

    var row = Ti.UI.createTableViewRow({
        hasChild : false,
        width : Ti.UI.FILL,
        left : 0,
        name : 'empty',
        height : 75
    });

    row.add(Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.noneTxt + ' ' + text + ' ' + Alloy.Globals.PHRASES.foundTxt,
        left : 10,
        font : Alloy.Globals.getFontCustom(16, 'Regular'),
        color : '#CCC'
    }));

    if (iOSVersion < 7) {
        row.add(Ti.UI.createView({
            height : 0.5,
            top : 57,
            backgroundColor : '#303030',
            width : '120%'
        }));
    }

    return row;
}

if (OS_ANDROID) {
    font = 'fontawesome-webfont';

    $.challenges_finished.orientationModes = [Titanium.UI.PORTRAIT];

    $.challenges_finished.addEventListener('open', function() {
        Alloy.Globals.setAndroidCouponMenu($.challenges_finished.activity);

        $.challenges_finished.activity.actionBar.onHomeIconItemSelected = function() {
            $.challenges_finished.close();
            $.challenges_finished = null;
        };
        $.challenges_finished.activity.actionBar.displayHomeAsUp = true;
        $.challenges_finished.activity.actionBar.title = Alloy.Globals.PHRASES.finishedTxt;
    });
}

