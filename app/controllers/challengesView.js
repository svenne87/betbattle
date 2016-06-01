/* Flow */
var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

var refresher;
var table;
var swipeRefresh = null;
var webViewUrl = '';
var webViewTitle = '';
var acceptRow;
var profileRow;
var firstRow;
var secondRow;
var profileImageView;
var acceptTextLabel;
var profileNameLabel = '';
var profileCoinsLabel = '';
var profilePointsLabel = '';
var profileWinsLabel = '';
var profileRankingLabel = '';
var profileAchievementsLabel = '';
var profileLevelImage = '';
var overlayView = '';
var overlayLabel = '';

//var matchOTDTextLabel;
//var matchOTDRow;

var args = arguments[0] || {};
if (args.refresh == 1) {
    if (Alloy.Globals.checkConnection()) {
        // refresh table with challenges
        //indicator.openIndicator();
        getChallenges();
        if (args.sent_challenge == 1) {
            Alloy.Globals.unlockAchievement(11);
        }
    } else {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }
}

Alloy.Globals.userInfoUpdateEvent = function() {
    if (Alloy.Globals.checkConnection()) {
        getUserInfo();
    } else {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }   
};

Ti.App.addEventListener('userInfoUpdate', Alloy.Globals.userInfoUpdateEvent);

var acceptLabel = Ti.UI.createLabel({
    backgroundColor : Alloy.Globals.themeColor(),
    color : '#FFF',
    textAlign : 'center',
    borderRadius : 8,
    width : 30,
    top : 10,
    height : Ti.UI.SIZE
});

/*
var matchOTDLabel = Ti.UI.createLabel({
    backgroundColor : Alloy.Globals.themeColor(),
    color : '#FFF',
    textAlign : 'center',
    borderRadius : 8,
    width : 30,
    top : 10,
    height : Ti.UI.SIZE
});
*/

var iOSVersion;
var isAndroid = true;
var sections = [];

if (OS_IOS) {
    iOSVersion = parseInt(Ti.Platform.version);
    isAndroid = false;
}

if (Alloy.Globals.hasCoupon) {
    if (!isAndroid) {
        var children = Alloy.Globals.NAV.getChildren();
        for (var i in children) {
            if (children[i].id == "ticketView") {
                var labels = children[i].getChildren();
                for (var y in labels) {
                    if (labels[y].id == "badge") {
                        labels[y].setBackgroundColor(Alloy.Globals.themeColor());
                        labels[y].setBorderColor("#c5c5c5");
                        labels[y].setText("" + Alloy.Globals.COUPON.games.length);
                    }
                    if (labels[y].id == "label") {
                        labels[y].setColor("#FFF");
                    }
                }

            }
        }
    } else {
        // will rebuild action bar menu
        Ti.App.fireEvent('app:rebuildAndroidMenu');
    }
}

Ti.App.addEventListener("sliderToggled", function(e) {
    if ( typeof table !== 'undefined') {
        if (e.hasSlided) {
            table.touchEnabled = false;
        } else {
            table.touchEnabled = true;
        }
    }
});

var mod = require('bencoding.blur');

Alloy.Globals.challengesViewRefreshEvent = function(e) {
    Ti.API.log("refresh körs!!!!!!!!!");
    
   
    
    
    
    if (Alloy.Globals.checkConnection()) {
        //indicator.openIndicator();
        getChallenges();
    } else {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    } 
};

// refresh this view
Ti.App.addEventListener("challengesViewRefresh", Alloy.Globals.challengesViewRefreshEvent);

// update profile info row
function updateProfileData(userInfo) {
    firstRow.setOpacity(0);
    secondRow.setOpacity(0);
   
    // check if language or tutorial has been changed, if it has download the new version
    Alloy.Globals.checkVersions(indicator);
    
    // keep coupon up to date
    Alloy.Globals.getCoupon();
    
    // update profile data
    if (userInfo.name.length > 16) {
        userInfo.name = userInfo.name.substring(0, 13);
        userInfo.name = userInfo.name + '...';
    }
    
    profileNameLabel.setText(userInfo.name);
    profileCoinsLabel.setText(userInfo.totalCoins);
    profilePointsLabel.setText(userInfo.totalPoints);
    profileWinsLabel.setText(userInfo.totalWins);  
    profileRankingLabel.setText(userInfo.position);
    profileAchievementsLabel.setText(userInfo.achieved_achievements);
    profileLevelImage.setImage(Alloy.Globals.BETKAMPENURL + "/" + userInfo.level.symbol);
    
    if(profileCoinsLabel.getText().length > 5) {
        profileCoinsLabel.setText(profileCoinsLabel.getText().substring(0, 3) + '..');
    }
    
    if(profilePointsLabel.getText().length > 5) {
        profilePointsLabel.setText(profilePointsLabel.getText().substring(0, 3) + '..');
    }
    
    if(profileWinsLabel.getText().length > 4) {
        profileWinsLabel.setText(profileWinsLabel.getText().substring(0, 2) + '..');
    }
    
    if(profileAchievementsLabel.getText().length > 4) {
        profileAchievementsLabel.setText(profileAchievementsLabel.getText().substring(0, 2) + '..');
    }
    
    // make sure they are at the same position
    if(profileCoinsLabel.toImage().width > profileWinsLabel.toImage().width) {
        profileWinsLabel.setWidth(profileCoinsLabel.toImage().width);
    } else if(profileWinsLabel.toImage().width > profileCoinsLabel.toImage().width){
        profileCoinsLabel.setWidth(profileWinsLabel.toImage().width);
    }
    
    if (userInfo.team.data[0]) {
        Ti.App.Properties.setString("favorite_team", userInfo.team.data[0].name);
    }
    
	profileRow.setOpacity(0);
	
    setTimeout(function() { 
    	firstRow.setOpacity(1);
    	secondRow.setOpacity(1);
		profileRow.remove(overlayView);
    }, 1000);
	

    // update profile image
    if (Alloy.Globals.FACEBOOKOBJECT) {
        profileImageView.setImage('https://graph.facebook.com/' + Alloy.Globals.FACEBOOKOBJECT.id + '/picture');
    } else {
        profileImageView.setImage(Alloy.Globals.BETKAMPENURL + '/profile_images/' + Alloy.Globals.BETKAMPENUID + '.png' + "?t=" + new Date().getTime());
    }
}

// get coins for user
function getUserInfo() {
		
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onerror = function(e) {
        Ti.API.error('Bad Sever 2 =>' + e.error);
        overlayLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
    };

    try {
        xhr.open('GET', Alloy.Globals.BETKAMPENUSERURL + '?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
        xhr.setTimeout(Alloy.Globals.TIMEOUT);
        xhr.send();
    } catch(e) {
        var error = {
            totalCoins : '',
            totalPoints : ''
        };
        Ti.App.fireEvent('app:coinsMenuInfo', error);
        overlayLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
    }

    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {

                var userInfo = null;
                try {
                    userInfo = JSON.parse(this.responseText);
                } catch (e) {
                    userInfo = null;
                }

                if (userInfo !== null) {
                    // Update menu
                    Ti.App.fireEvent('app:coinsMenuInfo', userInfo);

                    // update profile data
                    updateProfileData(userInfo);
                }
            }
        } else {
            Ti.API.error("Error =>" + this.response);
            overlayLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
        }
    };
}

// check for users that have status 2 in challenge/tournament
function checkActiveUsers(array) {
    var activeUserCount = 0;
    for (a in array) {
        if (array[a].status == '2') {
            activeUserCount++;
        }
    }
    return activeUserCount;
}

// show pending and finished challenges and tournaments in a webview
function showChallenge(challengeId, roundId, groupName) {
    if (Alloy.Globals.checkConnection()) {

        var win = Alloy.createController('showChallenge').getView();

        if (!isAndroid) {
            Alloy.Globals.NAV.openWindow(win, {
                animated : true
            });
        } else {
            win.open({
                fullScreen : true
            });
        }

        win.addEventListener('close', function() {
            indicator.closeIndicator();
        });

    } else {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }
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

// show empty row if no games found
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
        text : Alloy.Globals.PHRASES.noneTxt + ' ' + text + ' ' + Alloy.Globals.PHRASES.foundTxt + ' ',
        left : 60,
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

function createNewChallengeRow() {
    child = true;

    if (isAndroid) {
        child = false;
    }

    var tableFooterView = Ti.UI.createTableViewRow({
        height : 65,
        hasChild : child,
        selectionStyle : 'none'
    });

    tableFooterView.add(Ti.UI.createImageView({
        image : '/images/Skapa_Utmaning.png',
        width : 40,
        height : 40,
        left : 10,
    }));

    tableFooterView.add(Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.createChallengeTxt + ' ',
        font : Alloy.Globals.getFontCustom(16, "Regular"),
        color : "#FFF",
        left : 65,
    }));

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

// build and return rows that are of the type 'Accept', 'Pending' and 'Finished'
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
        height : 95,
        selectionStyle : 'none'
    });

    var fontawesome = require('lib/IconicFont').IconicFont({
        font : 'lib/FontAwesome'
    });

    var font = 'FontAwesome';

    // add custom icon on Android to symbol that the row has child
    if (isAndroid) {
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
        top : -40,
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
        top : 4,
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
        text : '' + date + ' ' + time + ' ',
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

    var thirdRowView = Ti.UI.createView({
        top : 40,
        layout : 'absolute',
        width : 'auto'
    });

    if (type === 'accept') {
        firstRowView.add(Ti.UI.createLabel({
            left : 40,
            font : {
                fontFamily : font
            },
            text : fontawesome.icon('fa-arrow-right'),
            color : Alloy.Globals.themeColor()

        }));

        thirdRowView.add(Ti.UI.createLabel({
            left : 60,
            text : Alloy.Globals.PHRASES.newTxt + ' ',
            font : Alloy.Globals.getFontCustom(12, 'Regular'),
            color : Alloy.Globals.themeColor()
        }));

    } else if (type === 'pending') {
        var pendingLabel = Ti.UI.createLabel({
            left : 60,
            text : Alloy.Globals.PHRASES.pendingTxt + ' ',
            font : Alloy.Globals.getFontCustom(12, 'Regular'),
            color : Alloy.Globals.themeColor()
        });

        thirdRowView.add(pendingLabel);

        // check all matches in a challenge to check if any of the matches are active
        for (var i = 0; i < obj.attributes.matches.length; i++) {
            if (obj.attributes.matches[i].status === '3') {
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
        }
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

if (!isAndroid) {
    refresher = Ti.UI.createRefreshControl({
        tintColor : Alloy.Globals.themeColor()
    });

    // will refresh on pull
    refresher.addEventListener('refreshstart', function(e) {
        if (Alloy.Globals.checkConnection()) {
            //indicator.openIndicator();
            getChallenges();
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
            refresher.endRefreshing();
        }

    });
}

var tableHeaderView = Ti.UI.createView({
    height : 120,
    width : Ti.UI.FILL,
    layout : "vertical",
});

tableHeaderView.addEventListener('click', function() {
    if (!Alloy.Globals.checkConnection()) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        return;
    }

    if (webViewUrl !== '' && webViewUrl !== null) {
        // open web view
        var arg = {
            url : webViewUrl,
            title : webViewTitle
        };

        var win = Alloy.createController('dynamicWebView', arg).getView();
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
        // check connection
        if (!Alloy.Globals.checkConnection()) {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
            return;
        }

        var win = Alloy.createController('newChallengeLeague').getView();
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
    }
});

if (!isAndroid) {
    table = Titanium.UI.createTableView({
        left : 0,
        top : 0,
        headerView : tableHeaderView,
        height : Ti.UI.FILL,
        width : '100%',
        backgroundColor : 'transparent',
        style : Ti.UI.iPhone.TableViewStyle.GROUPED,
        id : 'challengeTable',
        refreshControl : refresher,
        separatorInsets : {
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
        left : 0,
        headerView : tableHeaderView,
        height : '100%',
        backgroundColor : '#000',
        separatorColor : '#303030',
        id : 'challengeTable'
    });

    table.footerView = Ti.UI.createView({
        height : 0.5,
        width : Ti.UI.FILL,
        backgroundColor : '#303030'
    });
}

table.addEventListener('swipe', function(e) {
    if (e.direction !== 'up' && e.direction !== 'down') {
        table.touchEnabled = false;
        Alloy.Globals.SLIDERZINDEX = 2;

        var interval = interval ? interval : 100;
        setTimeout(function() {
            Ti.App.fireEvent('app:slide');
        }, interval);
    }
});

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

    if (e.rowData === null || typeof e.rowData.id === 'undefined') {
        return;
    }

    if (!Alloy.Globals.checkConnection()) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        return;
    }

    if (e.rowData.className === 'accept') {
        // TEST
        Alloy.Globals.CHALLENGEOBJECTARRAY[0].sort(compare);
        
        var obj = Alloy.Globals.CHALLENGEOBJECTARRAY[0][e.rowData.id];
        console.log("Pending -> " + e.rowData.id); // TODO
        if (obj.attributes.show !== 0) {
            // view challenge

            var count = obj.attributes.opponents.length;
            var bet_amount = obj.attributes.potential_pot / count;

            var args = {
                answer : 1,
                bet_amount : bet_amount
            };
            Alloy.Globals.CHALLENGEINDEX = e.rowData.id;
            var win = Alloy.createController('challenge', args).getView();

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

    } else if (e.rowData.id === 'new') {
        var win = Alloy.createController('challenges_new').getView();
       
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

    } else if (e.rowData.id === 'pending') {
        var win = Alloy.createController('challenges_pending').getView();
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
   /* } else if (e.rowData.id === 'matchOTD') {
        var win = Alloy.createController('matchDay').getView();
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
    */
   /*
    } else if (e.rowData.id === 'finished') {
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
    */
    } else if (e.rowData.className === 'pending') {
          // TEST
        Alloy.Globals.CHALLENGEOBJECTARRAY[1].sort(compare);
        
        var obj = Alloy.Globals.CHALLENGEOBJECTARRAY[1][e.rowData.id];
        console.log("Pending -> " + e.rowData.id); // TODO
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

    } else if (e.rowData.className === 'finished') {
        // get correct object, 2 == finished
        var obj = Alloy.Globals.CHALLENGEOBJECTARRAY[2][e.rowData.id];
        // open a web view to view the finished challenge
        var group = null;
        try {
            group = obj.attributes.group[0].name;
        } catch(e) {
            group = null;
        }

        if ( typeof group === undefined) {
            group = null;
        }

        showChallenge(obj.attributes.id, -1, group);
        obj = null;
        group = null;

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

    }
});

if (isAndroid) {
    // https://github.com/raymondkam/Ti.SwipeRefreshLayout (original)   
    // https://github.com/iskugor/Ti.SwipeRefreshLayout

    var swipeRefreshModule = require('com.rkam.swiperefreshlayout');

    swipeRefresh = swipeRefreshModule.createSwipeRefresh({
        view : table,
        height : Ti.UI.FILL,
        width : Ti.UI.FILL,
        id : 'scrollView'
    });

    swipeRefresh.addEventListener('refreshing', function() {
        if (Alloy.Globals.checkConnection()) {
            //indicator.openIndicator();
            setTimeout(function() {
                getChallenges();
            }, 800);
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
            swipeRefresh.setRefreshing(false);
        }
    });

    $.challengesView.add(swipeRefresh);
} else {
    $.challengesView.add(table);
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
        left : 160,  // + participantsValueLabel.toImage().width + 5 + participantsTextLabel.toImage().width + 2)
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
        left : (160 + potTextLabel.toImage().width + 2),  // participantsValueLabel.toImage().width + 2 + participantsTextLabel.toImage().width + +
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
/*
 *  Var inte samma här som i pendeing????

 function compare(a, b) {
    if (a.attributes.time > b.attributes.time)
        return -1;
    if (a.attributes.time < b.attributes.time)
        return 1;
    return 0;
}
*/

function compare(a, b) {
    if (a.attributes.time < b.attributes.time)
        return -1;
    if (a.attributes.time > b.attributes.time)
        return 1;
    return 0;
}

// create the hole table view with sections and checks if there are no challenges
function constructTableData(array) {
    getDynamicTopImage();

    if (!isAndroid) {
        sections[0] = Ti.UI.createTableViewSection({
            footerView : Ti.UI.createView({
                height : 0.1
            })
        });
    } else {
        sections[0] = Ti.UI.createTableViewSection({});

    }

    var fontawesome = require('lib/IconicFont').IconicFont({
        font : 'lib/FontAwesome'
    });

    var font = 'FontAwesome';
    var rightPercentage = '5%';
    var child = true;

    if (isAndroid) {
        child = false;
        isAndroid = true;

        font = 'fontawesome-webfont';

        if (Titanium.Platform.displayCaps.platformWidth < 350) {
            rightPercentage = '3%';
        }
    }

    profileRow = Ti.UI.createTableViewRow({
        top : 0,
        height : 75,
        id : "profile",
        width : Ti.UI.FILL,
        font : Alloy.Globals.getFont(),
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
            },{
                color : "#2E2E2E"
            }]
        },
        hasChild : false,
        selectionStyle : 'none'
    });    

    acceptRow = Ti.UI.createTableViewRow({
        //top : 0,
        height : 75,
        id : "new",
        width : Ti.UI.FILL,
        color : "#FFF",
        backgroundColor : 'transparent',
        font : Alloy.Globals.getFont(),
        hasChild : child,
        selectionStyle : 'none'
    });

    var pendingRow = Ti.UI.createTableViewRow({
        height : 75,
        id : "pending",
        width : Ti.UI.FILL,
        color : "#FFF",
        backgroundColor : 'transparent',
        font : Alloy.Globals.getFont(),
        hasChild : child,
        selectionStyle : 'none'
    });

/*
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
*/
/*
    matchOTDRow = Ti.UI.createTableViewRow({
        height : 75,
        id : "matchOTD",
        width : Ti.UI.FILL,
        color : "#FFF",
        backgroundColor : 'transparent',
        font : Alloy.Globals.getFont(),
        hasChild : child,
        selectionStyle : 'none'
    });
*/  
    var deviceWidth = Ti.Platform.displayCaps.platformWidth;
    var widthParted = deviceWidth / 4;

    var leftProfilePart = Ti.UI.createView({
        width : widthParted,
        left : 0,
        height : 75,
        layout : 'horizontal'
    });
    
    var centerProfilePart = Ti.UI.createView({
        width : (widthParted * 2),
        left : widthParted,
        height : 75,
        layout : 'horizontal'
    });

    var rightProfilePart = Ti.UI.createView({
        width : widthParted,
        left : (widthParted * 3),
        height : 75,
        layout : 'horizontal'
    });

    var image;
	
    if (Alloy.Globals.FACEBOOKOBJECT) {
        image = 'https://graph.facebook.com/' + Alloy.Globals.FACEBOOKOBJECT.id + '/picture';
    } else {
        image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + Alloy.Globals.BETKAMPENUID + '.png' + "?t=" + new Date().getTime();
    }

    profileImageView = Ti.UI.createImageView({
        left : ((widthParted - 50) / 2), // based on the image beeing 50 in height
        top : 12.5, // based on the image beeing 50 in height
        height : 50,
        width : 50,
        borderRadius : 25,
        image : image
    });

    profileImageView.addEventListener('error', function(e) {
        // fallback for image
        e.source.image = '/images/no_pic.png';
    });

    leftProfilePart.add(profileImageView);
    
    var topPosRelative = 7;
    
    if(isAndroid) {
       topPosRelative = 4; 
    }
    
    profileNameLabel = Ti.UI.createLabel({
        text : '		',
        font : Alloy.Globals.getFontCustom(14, "Regular"),
        color : '#FFF',
        top : topPosRelative,
        left : 30,
        width : Ti.UI.FILL
    });
    
    centerProfilePart.add(profileNameLabel);
    
    firstRow = Ti.UI.createView({
        layout : 'horizontal',
        left : 30,
        top : 0,
        width : Ti.UI.FILL,
        height : 20
    });
    
    firstRow.add(Ti.UI.createLabel({
        left : 0,
        width : Ti.UI.SIZE,
        font : {
            fontFamily : font
        },
        text : fontawesome.icon('fa-database'),
        color : Alloy.Globals.themeColor()
    }));
    
    profileCoinsLabel = Ti.UI.createLabel({
        text : '',
        font : Alloy.Globals.getFontCustom(14, "Regular"),
        color : Alloy.Globals.themeColor(),
        left : 10,
        width : Ti.UI.SIZE
    });
    
    firstRow.add(profileCoinsLabel);
  
    firstRow.add(Ti.UI.createLabel({
        left : 15,
        font : {
            fontFamily : font
        },
        text : fontawesome.icon('fa-signal'),
        width : Ti.UI.SIZE,
        color : Alloy.Globals.themeColor()
    }));
 
    profilePointsLabel = Ti.UI.createLabel({
       left : 10,
       text : '',
       font : Alloy.Globals.getFontCustom(14, "Regular"),
       color :  Alloy.Globals.themeColor(),
       width : Ti.UI.SIZE 
    });
    
    firstRow.add(profilePointsLabel);
    centerProfilePart.add(firstRow);
    
    secondRow = Ti.UI.createView({
        layout : 'horizontal',
        left : 30,
        top : 0,
        width : Ti.UI.FILL,
        height : Ti.UI.SIZE
    });
    
    secondRow.add(Ti.UI.createLabel({
        left : 0,
        font : {
            fontFamily : font
        },
        text : fontawesome.icon('fa-trophy'),
        width : Ti.UI.SIZE,
        color : Alloy.Globals.themeColor()
    }));
    
    profileWinsLabel = Ti.UI.createLabel({
       text : '',
       font : Alloy.Globals.getFontCustom(14, "Regular"),
       color : Alloy.Globals.themeColor(),
       left : 10,
       width : Ti.UI.SIZE 
    });
    
    secondRow.add(profileWinsLabel);

    secondRow.add(Ti.UI.createLabel({
        left : 12,
        font : {
            fontFamily : font
        },
        text : fontawesome.icon('fa-unlock'),
        width : Ti.UI.SIZE,
        color : Alloy.Globals.themeColor()
    }));
    
    profileAchievementsLabel = Ti.UI.createLabel({
       text : '',
       font : Alloy.Globals.getFontCustom(14, "Regular"),
       color : Alloy.Globals.themeColor(),
       left : 10,
       width : Ti.UI.SIZE 
    });
    
    secondRow.add(profileAchievementsLabel);
    
    profileRankingLabel = Ti.UI.createLabel({
       text : '        ',
       font : Alloy.Globals.getFontCustom(14, "Regular"),
       left : 5,
       width : Ti.UI.SIZE,
       color : Alloy.Globals.themeColor()
    });  

    centerProfilePart.add(secondRow);

    profileLevelImage = Ti.UI.createImageView({
        left : ((widthParted - 50) / 2), 
        top : 12.5,
        height : 50,
        width : 50,
        borderRadius : 25,
        //defaultImage : '/images/no_team.png'
    });
  
    if(!isAndroid) {
    	profileLevelImage.setDefaultImage('/images/no_team.png');
    }
    
    profileLevelImage.addEventListener('error', function() {
        e.source.image = '/images/no_team.png';
    });
    
    rightProfilePart.add(profileLevelImage);
    
    profileRow.add(leftProfilePart);
    profileRow.add(centerProfilePart);
    profileRow.add(rightProfilePart);
    
    overlayView =  $.UI.create('View', {
		height: 70,
		width:Ti.UI.FILL,
		classes : ['challengesSection'],
	});

	overlayLabel = Ti.UI.createLabel({
		text : Alloy.Globals.PHRASES.loadingTxt,
		color : '#FFF',
		top: 20,
    	textAlign : 'center',
    	width: Ti.UI.FILL,
   	 	height : Ti.UI.SIZE,

	});
	
	overlayView.add(overlayLabel);
	profileRow.add(overlayView);

    // open profile window when clicking profile row
    profileRow.addEventListener('click', function() {
        var win = Alloy.createController('profile').getView();
        Alloy.Globals.CURRENTVIEW = win;
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

    acceptRow.add(Ti.UI.createImageView({
        left : 10,
        width : 30,
        height : 30,
        image : '/images/ikoner_utmaning_ny.png',
    }));

    acceptTextLabel = Ti.UI.createLabel({
        font : Alloy.Globals.getFontCustom(16, 'Bold'),
        text : Alloy.Globals.PHRASES.challengesTxt + ' ',
        color : '#FFF',
        left : 60,
        height : Ti.UI.SIZE,
        width : Ti.UI.SIZE
    });

    acceptRow.add(acceptTextLabel);

    if (isAndroid) {
        acceptRow.add(Ti.UI.createLabel({
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

    if (Alloy.Globals.CHALLENGEOBJECTARRAY[6].match_otd_status === 0 && Alloy.Globals.CHALLENGEOBJECTARRAY[0].length > 0) {
        // add badge
        acceptLabel.setText(Alloy.Globals.CHALLENGEOBJECTARRAY[0].length + 1);
        acceptLabel.setLeft(acceptTextLabel.toImage().width + 70);
        acceptRow.add(acceptLabel);
    } else if (Alloy.Globals.CHALLENGEOBJECTARRAY[0].length > 0) {
        // accept challenges, add badge
        acceptLabel.setText(Alloy.Globals.CHALLENGEOBJECTARRAY[0].length);
        acceptLabel.setLeft(acceptTextLabel.toImage().width + 70);
        acceptRow.add(acceptLabel);
    } else if (Alloy.Globals.CHALLENGEOBJECTARRAY[6].match_otd_status === 0) {
        // match otd, add badge
        acceptLabel.setText('1');
        acceptLabel.setLeft(acceptTextLabel.toImage().width + 70);
        acceptRow.add(acceptLabel);
    }
/*
    pendingRow.add(Ti.UI.createImageView({
        left : 10,
        width : 30,
        height : 30,
        image : '/images/ikoner_utmaning_pagaende.png',
    }));

    pendingRow.add(Ti.UI.createLabel({
        font : Alloy.Globals.getFontCustom(16, 'Regular'),
        text : Alloy.Globals.PHRASES.pendingChallengesTxt + ' ',
        color : '#FFF',
        left : 60,
        height : 'auto',
        width : 'auto'
    }));

    if (isAndroid) {
        pendingRow.add(Ti.UI.createLabel({
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
*/
/*
    finishedRow.add(Ti.UI.createImageView({
        left : 10,
        width : 30,
        height : 30,
        image : '/images/ikoner_utmaning_klar.png',
    }));

    finishedRow.add(Ti.UI.createLabel({
        font : Alloy.Globals.getFontCustom(16, 'Regular'),
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
    */
    /*
    matchOTDRow.add(Ti.UI.createImageView({
        left : 10,
        width : 30,
        height : 30,
        image : '/images/ikoner_utmaning_ny.png',
    }));

    matchOTDTextLabel = Ti.UI.createLabel({
        font : Alloy.Globals.getFontCustom(16, 'Regular'),
        text : Alloy.Globals.PHRASES.landingPageMatch + ' ',
        color : '#FFF',
        left : 60,
        height : Ti.UI.SIZE,
        width : Ti.UI.SIZE
    });

    matchOTDRow.add(matchOTDTextLabel);

    if (Alloy.Globals.CHALLENGEOBJECTARRAY[6].match_otd_status === 0) {
        // match otd, add badge
        matchOTDLabel.setLeft(matchOTDTextLabel.toImage().width + 70);
        matchOTDLabel.setText('1');
        matchOTDRow.add(matchOTDLabel);
    }

    if (isAndroid) {
        matchOTDRow.add(Ti.UI.createLabel({
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
    */

    sections[0].add(profileRow);
    sections[0].add(acceptRow);
    //sections[0].add(pendingRow);
    //sections[0].add(finishedRow);
    //sections[0].add(matchOTDRow);

    sections[1] = createSectionsForTable(Alloy.Globals.PHRASES.challengesViewHot);

    var challengesTournamentsCount = 0;
    // set this to 1 if there are no challenges

    var rightNowRows = 0;
    var acceptNowCount = 1;
    var pendingNowCount = 1;

    // add Match OTD
    if ( typeof Alloy.Globals.CHALLENGEOBJECTARRAY[6].match_data !== 'undefined') {
        if (Alloy.Globals.CHALLENGEOBJECTARRAY[6].match_data.status !== '2') {
            rightNowRows = rightNowRows + 1;
            sections[1].add(createMatchOTDRow());
        }
    }

    for (var x = 0; x < array.length; x++) {
        var arrayObj = array[x];
        if (x === 0) {
            // create 'accept' rows
            if (arrayObj.length > 0) {
                Alloy.Globals.CHALLENGEOBJECTARRAY[x].sort(compare);  // TODO Används vid öppnade av utmaning
                arrayObj.sort(compare);
                for (var i = 0; i < arrayObj.length; i++) {
                    if (rightNowRows < 5) {
                        rightNowRows++;
                        sections[1].add(constructChallengeRows(arrayObj[i], i, 'accept'));
                    }
                }
            } else if (arrayObj.length === 0 && challengesTournamentsCount > 0) {
                acceptNowCount = 0;
            }
        } else if (x === 1) {
            if (arrayObj.length > 0) {
                arrayObj.sort(compare);
                Alloy.Globals.CHALLENGEOBJECTARRAY[x].sort(compare);  // TODO Används vid öppnade av utmaning
                for (var i = 0; i < arrayObj.length; i++) {
                    if (rightNowRows < 5) {
                        rightNowRows++;
                        sections[1].add(constructChallengeRows(arrayObj[i], i, 'pending'));
                    }
                }
            } else {
                if (acceptNowCount == 0) {
                    pendingNowCount = 0;
                }
            }
        }
    }

    if (rightNowRows == 0) {
        sections[1].add(createEmptyTableRow(Alloy.Globals.PHRASES.challengesSmallTxt));
        sections[1].add(createNewChallengeRow());
    }
    table.setData(sections);

    indicator.closeIndicator();

    if (!isAndroid) {
        endRefresher();
    }
}

function getDynamicTopImage() {
    if (!Alloy.Globals.checkConnection()) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        return;
    }
	
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onerror = function(e) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        Ti.API.error('Bad Sever 3 =>' + e.error);
    };

    try {
        xhr.open('GET', Alloy.Globals.BETKAMPENGETTOPLANDINGPAGE + '/?location=' + 'challengesView' + '&lang=' + Alloy.Globals.LOCALE);
        xhr.setRequestHeader("challengesView-type", "application/json");
        xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
        xhr.setTimeout(Alloy.Globals.TIMEOUT);
        xhr.send();
    } catch(e) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
    }
    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {
                var response = JSON.parse(this.responseText);
                
                webViewUrl = response.url;
				webViewTitle = response.title;

				var header = table.getHeaderView();

				// at app start we will need to add the image
				// on refresh there will be children elements and image only need to change if there is a image in the response
				if(response.image != '' || header.children.length == 0) {
					header.removeAllChildren();

					var imageView = Ti.UI.createImageView({
						// defaultImage : '/images/h_image.jpg',
						image : Alloy.Globals.BETKAMPENURL + response.image,
						width : Ti.UI.FILL,
						height : 120,
						backgroundColor : '#000'
					});
					
					if(!isAndroid) {
						imageView.setDefaultImage('/images/h_image.jpg');
					}

					if (response.image != '') {
						imageView.setImage(Alloy.Globals.BETKAMPENURL + response.image);
					} else {
						imageView.setImage('/images/h_image.jpg');
					}

					imageView.addEventListener('error', function(e) {
						e.source.image = '/images/h_images.jpg';
					});

					header.add(imageView);

					if (isAndroid) {
						header.add(Ti.UI.createView({
							height : 0.5,
							width : Ti.UI.FILL,
							backgroundColor : '#303030'
						}));
					}
				}
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            }

        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("Error =>" + this.response);
        }
    };
}

function endRefresher() {
    if (!isAndroid) {
        if ( typeof refresher !== 'undefined') {
            refresher.endRefreshing();
        }
    } else {
        if ( typeof swipeRefresh !== 'undefined' && swipeRefresh !== null && args.refresh != 1) {
            swipeRefresh.setRefreshing(false);
        }
    }
}

function getChallenges() {
    if (!Alloy.Globals.checkConnection()) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        return;
    }

    // Get challenges
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onerror = function(e) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        endRefresher();
        Ti.API.error('Bad Sever 1 =>' + e.error);
        //indicator.closeIndicator();
    };

    try {
        xhr.open('GET', Alloy.Globals.BETKAMPENCHALLENGESURL + '/?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
        xhr.setRequestHeader("challengesView-type", "application/json");
        xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
        xhr.setTimeout(Alloy.Globals.TIMEOUT);
        xhr.send();
    } catch(e) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        endRefresher();
        //indicator.closeIndicator();
    }
    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {
                var response = JSON.parse(this.responseText);
                // construct array with objects
                Alloy.Globals.CHALLENGEOBJECTARRAY = Alloy.Globals.constructChallenge(response);

                if (Alloy.Globals.CHALLENGEOBJECTARRAY[6].match_otd_status === 0 && Alloy.Globals.CHALLENGEOBJECTARRAY[0].length > 0) {
                    // add badge
                    acceptLabel.setText(Alloy.Globals.CHALLENGEOBJECTARRAY[0].length + 1);
                    acceptLabel.setLeft(acceptTextLabel.toImage().width + 70);
                    acceptRow.add(acceptLabel);
                } else if (Alloy.Globals.CHALLENGEOBJECTARRAY[0].length > 0) {
                    // accept challenges, add badge
                    acceptLabel.setText(Alloy.Globals.CHALLENGEOBJECTARRAY[0].length);
                    acceptLabel.setLeft(acceptTextLabel.toImage().width + 70);
                    acceptRow.add(acceptLabel);
                } else if (Alloy.Globals.CHALLENGEOBJECTARRAY[6].match_otd_status === 0) {
                    // match otd, add badge
                    acceptLabel.setText('1');
                    acceptLabel.setLeft(acceptTextLabel.toImage().width + 70);
                    acceptRow.add(acceptLabel);
                } else {
                    acceptRow.remove(acceptLabel);
                }

                // Update menu with icon if there are new challenges
                Ti.App.fireEvent('app:updateMenu');
                constructTableData(Alloy.Globals.CHALLENGEOBJECTARRAY);
                getUserInfo();
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            }

            if (isAndroid) {
                if (swipeRefresh !== null && typeof swipeRefresh !== 'undefined') {
                    swipeRefresh.setRefreshing(false);
                }
            }

            //indicator.closeIndicator();
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            //indicator.closeIndicator();
            endRefresher();
            Ti.API.error("Error =>" + this.response);
        }
    };
}

constructTableData(Alloy.Globals.CHALLENGEOBJECTARRAY);
if (args.refresh != 1) {
    getUserInfo();
}

var checkFirstTime = JSON.parse(Ti.App.Properties.getString("firstTimeAchievement"));

if (!checkFirstTime) {
    if (Alloy.Globals.checkConnection()) {
        Alloy.Globals.unlockAchievement(13);
        Ti.App.Properties.setString("firstTimeAchievement", JSON.stringify(true));
    }
} 


if (!Ti.App.Properties.hasProperty("showInviteSetting")) {
	Ti.App.Properties.setBool("showInviteSetting", true);
}

var showInviteCodeBox = Ti.App.Properties.getBool('showInviteSetting');

function isEmptyObj(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true && JSON.stringify(obj) === JSON.stringify({});
}

if(showInviteCodeBox && isEmptyObj(args) ) {
	setTimeout(function() {
		Alloy.Globals.displayEnterInviteCodeDialog(indicator);
    }, 2500);
}
