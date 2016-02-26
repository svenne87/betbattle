var args = arguments[0] || {};

//if (args.refresh) {
//getChallenges();
//}

var context;
var iOSVersion;
var isAndroid = false;
var refresher = null;
var swipeRefresh = null;
var data = [];

if (OS_IOS) {
    iOSVersion = parseInt(Ti.Platform.version);

    $.challenges_new.titleControl = Ti.UI.createLabel({
        // text : Alloy.Globals.PHRASES.challengesTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });
} else {
    isAndroid = true;
    context = require('lib/Context');
}

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

function onOpen(evt) {
    if(isAndroid) {
        context.on('challengesNewActivity', this.activity);
    }
}

function onClose(evt) {
    if(isAndroid) {
        context.off('challengesNewActivity');
    }
}

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

tableFooterView = Ti.UI.createView({
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
        separatorStyle : Titanium.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE,
        id : 'challengeTable',
        refreshControl : refresher,
        separatorColor : '#303030'
    });

    if (iOSVersion < 7) {
        table.separatorStyle = Titanium.UI.iPhone.TableViewSeparatorStyle.NONE;
        table.separatorColor = 'transparent';
    }

} else {
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
                if (e.rowData.id === 'nextMatchOTDRow') {
                    showNextMatchOTD();
                } else if (e.rowData.name === 'showMatchOTD') {
                	var arg = {
                        gameID : e.rowData.id,
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
                } else if (e.rowData.className === 'accept') {
                    var obj = Alloy.Globals.CHALLENGEOBJECTARRAY[0][e.rowData.id];
                    if (obj.attributes.show !== 0) {
                        // view challenge

                        var group = null;
                        try {
                            group = obj.attributes.group.name;
                        } catch(e) {
                            group = null;
                        }

                        if ( typeof group === undefined) {
                            group = null;
                        }
                        var count = obj.attributes.opponents.length;

                        var bet_amount = obj.attributes.potential_pot / count;
                        Ti.API.info("bet_amount : " + bet_amount);
                        var arg = {
                            answer : 1,
                            group : group,
                            bet_amount : bet_amount
                        };
                        Alloy.Globals.CHALLENGEINDEX = e.rowData.id;
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
                    } else {
                        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.roundHasStartedErrorTxt);
                    }
                } else if (e.rowData.className === 'pending_row') {
                 	var obj = Alloy.Globals.CHALLENGEOBJECTARRAY[1][e.rowData.id];

                    if (obj.attributes.show !== 0) {
                        // view challenge
                        var group = null;
                        try {
                            group = obj.attributes.group[0].name;
                        } catch(e) {
                            group = null;
                        }

                        if ( typeof group === undefined) {
                            group = null;
                        }
                        var args = {
                            cid : obj.attributes.id,
                            group : group
                        };

                        Alloy.Globals.CHALLENGEINDEX = e.rowData.id;
                        var win = Alloy.createController('showChallenge', args).getView();
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
            }
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        }
    }
});

buildTableRows();

if (!isAndroid) {
    $.challenges_new.add(table);
} else {
    var swipeRefreshModule = require('com.rkam.swiperefreshlayout');

    swipeRefresh = swipeRefreshModule.createSwipeRefresh({
        view : table,
        height : Ti.UI.FILL,
        width : Ti.UI.FILL,
        id : 'swiper'
    });

    swipeRefresh.addEventListener('refreshing', function(e) {
        if (Alloy.Globals.checkConnection()) {
            setTimeout(function() {
                indicator.openIndicator();
                getChallenges();
            }, 800);
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
            swipeRefresh.setRefreshing(false);
        }
    });
    $.challenges_new.add(swipeRefresh);
}

function endRefresher() {
    if (!isAndroid) {
        if ( typeof refresher !== 'undefined' && refresher !== null) {
            refresher.endRefreshing();
        }
    } else {
        if (swipeRefresh !== null && typeof swipeRefresh !== 'undefined') {
            Ti.API.log(JSON.stringify(swipeRefresh));
            // dummy fix
            swipeRefresh.setRefreshing(false);
        }
    }
}

function compare(a, b) {
    if (a.attributes.time < b.attributes.time)
        return -1;
    if (a.attributes.time > b.attributes.time)
        return 1;
    return 0;
}

function buildTableRows() {
    data = [];
    
    data[0] = createSectionsForTable(Alloy.Globals.PHRASES.newChallengesTxt + ' ');
    data[1] = createSectionsForTable(Alloy.Globals.PHRASES.pendingChallengesTxt + ' ');
    
    var createdMatchOTDRow = false;
	var createdPendingMatchOTD = false;
    
    // add next Match OTD row
    // only create this row if the user has not already joined this challenge
    if (Alloy.Globals.CHALLENGEOBJECTARRAY[6].match_otd_status === 0) {
        data[0].add(createNextMatchOTDRow());
        createdMatchOTDRow = true;
    }
    
    // build pending row for match OTD
    if ( typeof Alloy.Globals.CHALLENGEOBJECTARRAY[6].match_data !== 'undefined') {
        if (Alloy.Globals.CHALLENGEOBJECTARRAY[6].match_data.status !== '2') {
            data[1].add(createMatchOTDRow());
            createdPendingMatchOTD = true;
        }
    }
    
    Alloy.Globals.CHALLENGEOBJECTARRAY[0].sort(compare);

    var arrayAcceptObj = Alloy.Globals.CHALLENGEOBJECTARRAY[0];
    // create 'accept' rows
    if (arrayAcceptObj.length > 0) {
        for (var i = 0; i < arrayAcceptObj.length; i++) {
            data[0].add(constructChallengeRows(arrayAcceptObj[i], i, 'accept'));
        }
    } 
    
    Alloy.Globals.CHALLENGEOBJECTARRAY[1].sort(compare);
    
    var arrayPendingObj = Alloy.Globals.CHALLENGEOBJECTARRAY[1];
    // create 'pending' rows
    if (arrayPendingObj.length > 0) {
        for (var i = 0; i < arrayPendingObj.length; i++) {
            data[1].add(constructChallengeRows(arrayPendingObj[i], i, 'pending_row'));
        }
    }
    
    /*
    if (arrayAcceptObj.length === 0 && !createdMatchOTDRow) {
        data[0].add(createEmptyTableRow(Alloy.Globals.PHRASES.challengesSmallTxt));
    }
    */
    
    if(arrayPendingObj.length === 0 && !createdPendingMatchOTD) {
    	data[1].add(createEmptyTableRow(Alloy.Globals.PHRASES.challengesSmallTxt));
    }

    data[0].add(createNewChallengeRow());
    data[0].add(createFinishedChallengeRow());
    table.setData(data);
}

function constructChallengeRows(obj, index, type) {
    var child = true;
    if (isAndroid) {
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
            imageLocation = '/images/ikonhockey.png';
        } else if (obj.attributes.leagues[0].sport_id === '2') {
            // Soccer
            imageLocation = '/images/ikonfotboll.png';
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
    
    if(type === 'pending_row') {
    	// set the length of the images you have in your sequence
   		var loaderArrayLength = 2;

    	// initialize the index to 1
    	var loaderIndex = 1;

    	var liveIcon = null;
    	// this function will be called by the setInterval
    	function loadingAnimation() {
        	// set the image property of the imageview by constructing the path with the loaderIndex variable
        	liveIcon.image = "/images/ikon_" + loaderIndex + "_live.png";
        	//increment the index so that next time it loads the next image in the sequence
        	loaderIndex++;
        	// if you have reached the end of the sequence, reset it to 1
        	if (loaderIndex === 3)
            	loaderIndex = 1;
    	}

    	// start the setInverval -- adjust the time to make a smooth animation
    	var firstLeft = 200;
    	var secondLeft = 185;
    
    	if(isAndroid) {
        	firstLeft = 220;
        	secondLeft = 205;
    	}

    	// check all matches in a challenge to check if any of the matches are active
    	for (var i = 0; i < obj.attributes.matches.length; i++) {
        	if (obj.attributes.matches[i].status === '3') { 
            	var liveLabel = Ti.UI.createLabel({
                	text : "Live",
                	left : firstLeft,
                	font : Alloy.Globals.getFontCustom(12, "Regular"),
                	color : Alloy.Globals.themeColor()
            	});

            	firstRowView.add(liveLabel);
            	liveIcon = Ti.UI.createImageView({
                	left : secondLeft,
                	image : '/images/ikon_1_live.png',
                	height : 10,
                	width : 10,
            	});

            	firstRowView.add(liveIcon);
            	var loaderAnimate = setInterval(loadingAnimation, 280);
            	break;
        	}
    	}
    }

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
        endRefresher();
        Ti.API.error('Bad Sever =>' + e.error);
        indicator.closeIndicator();
    };

    try {
        xhr.open('GET', Alloy.Globals.BETKAMPENCHALLENGESURL + '/?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
        xhr.setTimeout(Alloy.Globals.TIMEOUT);
        xhr.send();
    } catch(e) {
        endRefresher();
        indicator.closeIndicator();
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
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
            endRefresher();
            indicator.closeIndicator();
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            indicator.closeIndicator();
            endRefresher();
            Ti.API.error("Error =>" + this.response);
        }
    };
}

// create sections for the table
function createSectionsForTable(sectionText) {
    var sectionView = $.UI.create('View', {
        classes : ['challengesSection']
    });

    sectionView.add(Ti.UI.createLabel({
        top : '25%',
        width : Ti.UI.FILL,
        left : 60,
        text : sectionText,
        font : Alloy.Globals.getFontCustom(18, 'Bold'),
        color : '#FFF'
    }));

    if (!isAndroid) {
        return Ti.UI.createTableViewSection({
            headerView : sectionView,
            footerView : Ti.UI.createView({
                height : 0.1
            })
        });
    } else {
        return Ti.UI.createTableViewSection({
            headerView : sectionView
        });
    }
}

function createEmptyTableRow(text) {
    var row = Ti.UI.createTableViewRow({
        hasChild : false,
        width : Ti.UI.FILL,
        left : 0,
        name : 'empty',
        height : 75,
        selectionStyle : 'none'
    });

    row.add(Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.noneTxt + ' ' + text + ' ' + Alloy.Globals.PHRASES.foundTxt + " ",
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

function createNextMatchOTDRow() {
    var child = true;

    if (isAndroid) {
        child = false;
    }

    var row = Ti.UI.createTableViewRow({
        id : 'nextMatchOTDRow',
        hasChild : child,
        width : Ti.UI.FILL,
        left : 0,
        className : 'nextMatchOTDRow',
        height : 75
    });

    row.add(Ti.UI.createImageView({
        image : '/images/ikoner_utmaning_ny.png',
        left : 10,
        width : 30,
        height : 30
    }));

    var firstRowView = Ti.UI.createView({
        top : -20,
        layout : 'absolute',
        width : 'auto'
    });

    firstRowView.add(Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.landingPageMatch + ' ',
        font : Alloy.Globals.getFontCustom(16, "Regular"),
        color : "#FFF",
        left : 60
    }));

    var secondRowView = Ti.UI.createView({
        top : 25,
        layout : 'absolute',
        width : 'auto'
    });

    secondRowView.add(Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.matchOTDNextBtn + ' ',
        left : 60,
        font : Alloy.Globals.getFontCustom(12, 'Regular'),
        color : Alloy.Globals.themeColor()
    }));

    row.add(firstRowView);
    row.add(secondRowView);

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

    return row;
}

function showNextMatchOTD() {
    // check connection
    if (!Alloy.Globals.checkConnection()) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        return;
    }

    var match;
   // indicator.openIndicator();

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
                                            win : $.challenges_new                    // TODO this should work?
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

                } catch (e) {
                    match = null;
                    inidcator.closeIndicator();
                }
            }

        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("Error =>" + this.response);
            indicator.closeIndicator();
        }
    };
}

// function to create match of the day row
function createMatchOTDRow() {
    var fontawesome = require('lib/IconicFont').IconicFont({
        font : 'lib/FontAwesome'
    });

    var font = 'FontAwesome';

    var child = true;

    if (isAndroid) {
        child = false;
        font = 'fontawesome-webfont';
    }

    var row = Ti.UI.createTableViewRow({
        height : 95,
        id : Alloy.Globals.CHALLENGEOBJECTARRAY[6].match_data.game_id,
        name : "showMatchOTD",
        width : Ti.UI.FILL,
        color : "#FFF",
        backgroundColor : 'transparent',
        font : Alloy.Globals.getFont(),
        hasChild : child,
        selectionStyle : 'none'
    });

    row.add(Ti.UI.createImageView({
        image : '/images/ikoner_mix_sport.png',
        left : 10,
        width : 30,
        height : 30
    }));

    var firstRowView = Ti.UI.createView({
        top : -40,
        layout : 'absolute',
        width : 'auto'
    });

    firstRowView.add(Ti.UI.createLabel({
        font : Alloy.Globals.getFontCustom(16, 'Regular'),
        text : Alloy.Globals.PHRASES.landingPageMatch + ' ',
        color : '#FFF',
        left : 60,
        height : Ti.UI.SIZE,
        width : Ti.UI.SIZE
    }));

    var secondRowView = Ti.UI.createView({
        top : 4,
        layout : 'absolute',
        width : 'auto'
    });

    var date = Alloy.Globals.CHALLENGEOBJECTARRAY[6].match_data.game_date;
    date = date.split(" ");
    var time = date[1];
    date = date[0];
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
        text : '' + date + ' ' + time + ' ',
        font : Alloy.Globals.getFontCustom(12, 'Regular'),
        color : Alloy.Globals.themeColor()
    });

    secondRowView.add(startTextValueLabel);

	/*
    var participantsTextLabel = Ti.UI.createLabel({
        left : 160,
        font : {
            fontFamily : font
        },
        text : fontawesome.icon('icon-user'),
        color : Alloy.Globals.themeColor()
    });

    secondRowView.add(participantsTextLabel);
	*/
    var oppCount = parseInt(Alloy.Globals.CHALLENGEOBJECTARRAY[6].match_data.participants.count);
	
	/*
    var participantsValueLabel = Ti.UI.createLabel({
        left : 175,
        text : oppCount.toString() + ' ',
        font : Alloy.Globals.getFontCustom(12, 'Regular'),
        color : Alloy.Globals.themeColor()
    });

    secondRowView.add(participantsValueLabel);
	*/
    var potTextLabel = Ti.UI.createLabel({
        left : 160, // + participantsValueLabel.toImage().width + 5 + participantsTextLabel.toImage().width + 2),
        font : {
            fontFamily : font
        },
        text : fontawesome.icon('fa-database'),
        color : Alloy.Globals.themeColor()
    });

    secondRowView.add(potTextLabel);

    var currentPot = Alloy.Globals.PHRASES.unknownSmallTxt;

    try {
        currentPot = (oppCount * Alloy.Globals.CHALLENGEOBJECTARRAY[6].match_data.participants.bet_amount);
        currentPot = (currentPot - 0) + (Alloy.Globals.CHALLENGEOBJECTARRAY[6].match_data.participants.extra_pot - 0);
    } catch (e) {
        currentPot = Alloy.Globals.PHRASES.unknownSmallTxt;
    }

    var potValueLabel = Ti.UI.createLabel({
        left : (160 + potTextLabel.toImage().width + 2), //  participantsValueLabel.toImage().width + 2 + participantsTextLabel.toImage().width + 6 + 
        text : '' + currentPot,
        font : Alloy.Globals.getFontCustom(12, 'Regular'),
        color : Alloy.Globals.themeColor()
    });

    secondRowView.add(potValueLabel);

    if (!child) {
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
            color : '#c5c5c5',
            fontSize : 60,
            height : 'auto',
            width : 'auto'
        }));
    }

    var thirdRowView = Ti.UI.createView({
        top : 40,
        layout : 'absolute',
        width : 'auto'
    });

    var pendingLabel = Ti.UI.createLabel({
        left : 60,
        text : Alloy.Globals.PHRASES.pendingTxt + ' ',
        font : Alloy.Globals.getFontCustom(12, 'Regular'),
        color : Alloy.Globals.themeColor()
    });

    thirdRowView.add(pendingLabel);

    // check all matches in a challenge to check if any of the matches are active
    if (Alloy.Globals.CHALLENGEOBJECTARRAY[6].match_data.status === '3') {
        // set the length of the images you have in your sequence
        var loaderArrayLength = 2;

        // initialize the index to 1
        var loaderIndex = 1;

        var liveIcon = null;
        // this function will be called by the setInterval
        function loadingAnimation() {
            // set the image property of the imageview by constructing the path with the loaderIndex variable
            try {
                liveIcon.image = "/images/ikon_" + loaderIndex + "_live.png";
            } catch (e) {

            }

            //increment the index so that next time it loads the next image in the sequence
            loaderIndex++;
            // if you have reached the end of the sequence, reset it to 1
            if (loaderIndex === 3) {
                loaderIndex = 1;
            }
        }

        liveIcon = Ti.UI.createImageView({
            left : 60 + pendingLabel.toImage().width + 5,
            image : '/images/ikon_1_live.png',
            height : 10,
            width : 10,
        });

        thirdRowView.add(liveIcon);

        var liveLabel = Ti.UI.createLabel({
            text : "Live",
            left : 60 + pendingLabel.toImage().width + 15,
            font : Alloy.Globals.getFontCustom(12, "Regular"),
            color : Alloy.Globals.themeColor()
        });

        thirdRowView.add(liveLabel);

        var loaderAnimate = setInterval(loadingAnimation, 280);
    }

    // Add info to the created row
    row.add(firstRowView);
    row.add(secondRowView);
    row.add(thirdRowView);

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

function createNewChallengeRow() {
    child = true;

    if (isAndroid) {
        child = false;
    }

    var tableFooterView = Ti.UI.createTableViewRow({
        height : 75,
        hasChild : child,
    });

    tableFooterView.add(Ti.UI.createImageView({
        image : '/images/ikoner_utmaning_ny.png',
        width : 40,
        height : 40,
        left : 10,
    }));

    tableFooterView.add(Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.createChallengeTxt + ' ',
        font : Alloy.Globals.getFontCustom(16, "Bold"),
        color : "#FFF",
        left : 65,
    }));

    // add custom icon on Android to symbol that the row has child
    if (child != true) {
        tableFooterView.add(Ti.UI.createLabel({
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

    tableFooterView.addEventListener("click", function(e) {
        var win = Alloy.createController('newChallengeLeague').getView();
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

    return tableFooterView;
}


function createFinishedChallengeRow() {
    child = true;

    if (isAndroid) {
        child = false;
    }

	var finishedRow = Ti.UI.createTableViewRow({
        height : 75,
        id : "finished",
        width : Ti.UI.FILL,
        color : "#FFF",
        backgroundColor : 'transparent',
        font : Alloy.Globals.getFont(),
        hasChild : child,
        selectionStyle : 'none'
    });
    
    finishedRow.add(Ti.UI.createImageView({
        left : 10,
        width : 30,
        height : 30,
        image : '/images/ikoner_utmaning_klar.png',
    }));

    finishedRow.add(Ti.UI.createLabel({
        font : Alloy.Globals.getFontCustom(16, 'Bold'),
        text : Alloy.Globals.PHRASES.finishedChallengesTxt + ' ',
        color : '#FFF',
        left : 60,
        height : 'auto',
        width : 'auto'
    }));

    if (isAndroid) {
        finishedRow.add(Ti.UI.createLabel({
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
    
    finishedRow.addEventListener("click", function(e) {
        var win = Alloy.createController('challenges_finished').getView();
        Alloy.Globals.WINDOWS.push(win);

        if (!isAndroid) {
            Alloy.Globals.NAV.openWindow(win, {
                animated : true,
            });
        } else {
            win.open({
                fullScreen : true,
            });
        }
    });

    return finishedRow;
}

if (isAndroid) {
    $.challenges_new.orientationModes = [Titanium.UI.PORTRAIT];

    $.challenges_new.addEventListener('open', function() {
        Alloy.Globals.setAndroidCouponMenu($.challenges_new.activity);

        $.challenges_new.activity.actionBar.onHomeIconItemSelected = function() {
            $.challenges_new.close();
            $.challenges_new = null;
        };
        $.challenges_new.activity.actionBar.displayHomeAsUp = true;
        $.challenges_new.activity.actionBar.title = Alloy.Globals.PHRASES.challengesTxt;
    });
}

indicator.openIndicator();
getChallenges();
