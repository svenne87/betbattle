var args = arguments[0] || {};

if(args.refresh) {
    getChallenges();
}

var iOSVersion;
var isAndroid = false;

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

// build and return rows that are of the type 'Accept', 'Pending' and 'Finished'
function constructChallengeRows(obj, index, type) {
    var child = true;
    if (OS_ANDROID) {
        child = false;
    }

    var row = Ti.UI.createTableViewRow({
        id : index,
        hasChild : child,
        width : Ti.UI.FILL,
        left : 0,
        className : type,
        height : 75
    });

    var fontawesome = require('lib/IconicFont').IconicFont({
        font : 'lib/FontAwesome'
    });

    var font = 'FontAwesome';

    // add custom icon on Android to symbol that the row has child
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
            if(isAndroid) {
                imageLocation = '/images/ikonhockey.png';
            } else {
               imageLocation = '/images/Ikonhockey.png'; 
            }
        } else if (obj.attributes.leagues[0].sport_id === '2') {
            // Soccer
            if(isAndroid) {
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

    if (type !== 'tournament' && type !== 'tournament_finished') {
        // for normal challenge
        try {
            betGroupName = obj.attributes.group[0].name;
        } catch(e) {
            // do nothing
            betGroupName = "";
        }
        Ti.API.info("GRUPPNAMN: " + betGroupName);
        if (betGroupName <= 0) {
            betGroupName = obj.attributes.name;
        }
        if (betGroupName.length > 15) {
            betGroupName = betGroupName.substring(0, 12) + '...';
        }

    } else {
        // for tournament's
        if ((type === 'tournament' && obj.attributes.opponents.length === 1) || (type === 'tournament_finished' && obj.attributes.opponents.length === 1)) {
            betGroupName = Alloy.Globals.PHRASES.betbattleTxt;
        } else {
            betGroupName = Alloy.Globals.PHRASES.tournamentTxt;

            if (obj.attributes.group.name != null) {
                betGroupName = obj.attributes.group.name;
            }

            if (betGroupName.length === 0 || betGroupName === '') {
                betGroupName = 'Turnering';
            } else if (betGroupName === 'BetKampen Community') {
                betGroupName = Alloy.Globals.PHRASES.betbattleTxt;
            }

            if (betGroupName.length > 15) {
                betGroupName = betGroupName.substring(0, 12) + '...';
            }
        }
    }

    firstRowView.add(Ti.UI.createLabel({
        left : 60,
        text : betGroupName,
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

    var oppCount = 0;

    if (type === 'tournament' && checkTournament(obj) === true && obj.attributes.opponents.length === 1) {
        oppCount = parseInt(obj.attributes.opponentCount);
    } else {
        var oppCount = parseInt(obj.attributes.opponents.length);

        if (oppCount === 1 && obj.attributes.group.name === 'BetKampen Community') {
            oppCount = parseInt(obj.attributes.opponentCount);
        }
    }

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

    if ((type === 'tournament' && obj.attributes.opponents.length === 1) || (type === 'tournament_finished' && obj.attributes.opponents.length === 1)) {
        try {
            currentPot = obj.attributes.tournamentPot;
        } catch (e) {
            currentPot = Alloy.Globals.PHRASES.unknownSmallTxt;
        }
    } else if ((type === 'tournament' && obj.attributes.opponents.length > 1) || (type === 'tournament_finished' && obj.attributes.opponents.length > 1)) {
        try {
            var activeUsers = checkActiveUsers(obj.attributes.opponents);
            currentPot = activeUsers * obj.attributes.tournamentPot;
        } catch (e) {
            currentPot = Alloy.Globals.PHRASES.unknownSmallTxt;
        }
    } else {
        try {
            currentPot = obj.attributes.pot;
        } catch (e) {
            currentPot = Alloy.Globals.PHRASES.unknownSmallTxt;
        }
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
        //alert(JSON.parse(this.responseText));
        if (OS_IOS) {
            if ( typeof refresher !== 'undefined') {
                refresher.endRefreshing();
            }
        }
        Ti.API.error('Bad Sever =>' + e.error);
        indicator.closeIndicator();
        //$.facebookBtn.enabled = true;
    };

    try {
        xhr.open('GET', Alloy.Globals.BETKAMPENCHALLENGESURL + '/?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
        xhr.setRequestHeader("challengesView-type", "application/json");
        xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
        xhr.setTimeout(Alloy.Globals.TIMEOUT);
        xhr.send();
    } catch(e) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        //alert(JSON.parse(this.responseText));
        if (OS_IOS) {
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

                if (OS_ANDROID) {
                    $.challenges_finished.removeAllChildren();
                    for (child in $.challenges_finished.children) {

                        $.challenges_finished.children[child] = null;
                    }
                }
                constructTableView(Alloy.Globals.CHALLENGEOBJECTARRAY);

            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                //$.facebookBtn.enabled = true;
            }
            indicator.closeIndicator();
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            indicator.closeIndicator();
            if (OS_IOS) {
                if ( typeof refresher !== 'undefined') {
                    refresher.endRefreshing();
                }
            }
            //$.facebookBtn.enabled = true;
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
            backgroundColor : '#6d6d6d',
            width : '120%'
        }));
    }

    return row;
}

function constructTableView(array) {

    if (OS_IOS) {
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

    // check if table exists, and if it does simply remove it
    var children = $.challenges_finished.children;
    for (var i = 0; i < children.length; i++) {
        if (children[i].id === 'challengeTable') {
            $.challenges_finished.remove(children[i]);
            children[i] = null;
        }
    }

    var sections = [];

    tableHeaderView = Ti.UI.createView({
        height : 0.1,
    });

    var fontawesome = require('lib/IconicFont').IconicFont({
        font : 'lib/FontAwesome'
    });

    var font = 'FontAwesome';

    if (OS_ANDROID) {
        font = 'fontawesome-webfont';
    }

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
            //width : Ti.UI.FILL,
            left : 0,
            headerView : tableHeaderView,
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
            separatorStyle : separatorS,
            separatorColor : separatorColor
        });
    } else if (OS_ANDROID) {
        table = Titanium.UI.createTableView({
            width : Ti.UI.FILL,
            left : 0,
            headerView : tableHeaderView,
            height : '100%',
            separatorColor : '#303030',
            id : 'challengeTable'
        });
    }

    sections[0] = Ti.UI.createTableViewSection({
        headerView : Ti.UI.createView({
            height : 0.1,
        }),
        footerView : Ti.UI.createView({
            height : 0.1,
        }),
    });

    var fontawesome = require('lib/IconicFont').IconicFont({
        font : 'lib/FontAwesome'
    });

    var font = 'FontAwesome';
    var rightPercentage = '5%';

    if (OS_ANDROID) {
        font = 'fontawesome-webfont';

        if (Titanium.Platform.displayCaps.platformWidth < 350) {
            rightPercentage = '3%';
        }

    }

    var challengesTournamentsCount = 0;
    // set this to 1 if there are no challenges

    // looping array backwards to print out tournaments first
    for (var x = array.length; x >= 0; x--) {
        var arrayObj = array[x];

        if (x === 2) {
            // create 'pending' rows
            if (arrayObj.length > 0) {
                for (var i = 0; i < arrayObj.length; i++) {
                    sections[0].add(constructChallengeRows(arrayObj[i], i, 'finished'));
                }
            } else if (arrayObj.length === 0 && challengesTournamentsCount > 0) {
                sections[0].add(createEmptyTableRow(Alloy.Globals.PHRASES.challengesSmallTxt + '/' + Alloy.Globals.PHRASES.tournamentsSmallTxt));
            }
        } else if (x === 3) {
            // create 'accept' / 'pending' tournaments rows
            if (arrayObj.length > 0) {
                for (var i = 0; i < arrayObj.length; i++) {
                    sections[0].add(constructChallengeRows(arrayObj[i], i, 'tournament'));
                }
            } else if (arrayObj.length === 0) {
                challengesTournamentsCount = 1;
            }
        }
    }

    table.setData(sections);

    // when clicking a row
    table.addEventListener('click', function(e) {
        if (Alloy.Globals.SLIDERZINDEX == 2) {
            return;
        }

        // e.rowData is null in android
        if (OS_ANDROID) {
            // fix for android
            e.rowData = e.row;
        }

        if (e.rowData !== null) {
            if (Alloy.Globals.checkConnection()) {
                Ti.API.info("CLICKADE ROW : " + JSON.stringify(e.rowData));
                if ( typeof e.rowData.id !== 'undefined') {
                    if (e.rowData.className === 'finished') {
                        var obj = Alloy.Globals.CHALLENGEOBJECTARRAY[2][e.rowData.id];
                        Ti.API.info("Objectt: " + JSON.stringify(obj));
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

                    } else if (e.rowData.className === 'tournament') {
                        // get correct tournament object, 3 will contain all tournaments
                        var obj = Alloy.Globals.CHALLENGEOBJECTARRAY[3][e.rowData.id];
                        // check if my status is 2, that mean I already have answered this challenge
                        if (checkTournament(obj) === true) {
                            // open in webview
                            var group = null;
                            try {
                                group = obj.attributes.group.name;
                            } catch(e) {
                                group = null;
                            }

                            if ( typeof group === undefined) {
                                group = null;
                            }
                            var arg = {
                                tournamentIndex : e.rowData.id,
                                tournamentRound : obj.attributes.round,
                                group : group,
                            };

                            var win = Alloy.createController('showChallenge', arg).getView();

                            if (OS_IOS) {
                                Alloy.Globals.NAV.openWindow(win, {
                                    animated : true
                                });

                            } else if (OS_ANDROID) {
                                win.open({
                                    fullScreen : true
                                });
                            }

                            group = null;
                        } else {
                            if (obj.attributes.show !== 0) {
                                // open to answer tournament round
                                var arg = {
                                    tournamentIndex : e.rowData.id,
                                    tournamentRound : obj.attributes.round
                                };

                                var win = Alloy.createController('challenge', arg).getView();

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
                    }
                }
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
            }
        }
    });

    $.challenges_finished.add(table);
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
constructTableView(Alloy.Globals.CHALLENGEOBJECTARRAY);

