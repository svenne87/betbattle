var args = arguments[0] || {};

var mod = require('bencoding.blur');
var openWindows = [];

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});
var name = false;
var sections = [];
var iOSVersion;
var players = [];
var friends = [];

var imageErrorHandler = function(e) {
    e.image = '/images/no_pic.png';
};

var scoreBoardInfoView = Ti.UI.createView({
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

scoreBoardInfoView.add(Ti.UI.createLabel({
    text : Alloy.Globals.PHRASES.scoreboardTxt,
    left : 10,
    top : 25,
    height : Ti.UI.SIZE,
    width : Ti.UI.SIZE,
    font : Alloy.Globals.getFontCustom(18, 'Regular'),
    color : '#FFF'
}));

sections[0] = Ti.UI.createTableViewSection({
    headerView : scoreBoardInfoView,
    footerView : Ti.UI.createView({
        height : 0.1
    })
});

var fontawesome = require('lib/IconicFont').IconicFont({
    font : 'lib/FontAwesome'
});

var font = 'fontawesome-webfont';
var child = false;

if (OS_IOS) {
    child = true;
    font = 'FontAwesome';
    iOSVersion = parseInt(Ti.Platform.version);

    if (iOSVersion < 7) {
        $.scoreBoardTable.separatorStyle = Titanium.UI.iPhone.TableViewSeparatorStyle.NONE;
        $.scoreBoardTable.separatorColor = 'transparent';
    } else {
        $.scoreBoardTable.separatorStyle = Titanium.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE;
        $.scoreBoardTable.separatorColor = '#303030';
    }
}

function addNewFriend(id, name) {
    if (Alloy.Globals.checkConnection()) {
        indicator.openIndicator();
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            indicator.closeIndicator();
            Ti.API.error('Bad Sever =>' + " " + JSON.stringify(e) + " " + e.error);
        };

        try {
            xhr.open('POST', Alloy.Globals.BETKAMPENADDFRIENDSURL + '?lang=' + Alloy.Globals.LOCALE + '&fb=0' + '&frid=' + id);
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
                    Alloy.Globals.showToast(Alloy.Globals.PHRASES.friendSuccess + ' ' + name);
                }
                indicator.closeIndicator();
            } else {
                Ti.API.error("Error =>" + this.response);
            }
            indicator.closeIndicator();
        };
    }
}

// create content of popup
function createPopupLayout(win, playerObj, isFriend, isMe, friendIndex) {
    name = playerObj.name.toString();

    if (name.length > 18) {
        name = name.substring(0, 15) + '...';
    }

    var friendStats = Ti.UI.createLabel({
        text : name,
        left : 100,
        color : "#000",
        top : 45,
        font : Alloy.Globals.getFontCustom(16, 'Regular'),
    });
    win.add(friendStats);
    
    
    var friend;
    
    if(OS_IOS) {
        friend = Ti.UI.createView({
            top : 2,
            width : Ti.UI.FILL,
            height : 45,
        });
        win.add(friend);
    } else {
        friend = win;
    }
 
    var image;

    if (playerObj.fbid !== null) {
        image = "https://graph.facebook.com/" + playerObj.fbid + "/picture?type=large";
    } else {
        // get betkampen image
        image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + playerObj.id + '.png';
    }

    var profilePic = Titanium.UI.createImageView({
        defaultImage : '/images/no_pic.png',
        image : image,
        height : 90,
        width : 90,
        left : 5,
        top : 10,
        borderRadius : 45
    });

    profilePic.addEventListener('error', imageErrorHandler);

    friend.add(profilePic);
    
    if (isFriend || isMe) {
        var friendObj;

        if (isMe) {
            friendObj = playerObj;
        } else {
            friendObj = friends[friendIndex];
        }

        var frLvl = Ti.UI.createLabel({
            text : Alloy.Globals.PHRASES.levelTxt + ': ' + friendObj.level,
            left : 10,
            color : "#000",
            font : Alloy.Globals.getFontCustom(16, 'Regular'),
            top : 110,
        });
        friend.add(frLvl);

        var frScore = Ti.UI.createLabel({
            text : Alloy.Globals.PHRASES.scoreInfoTxt + ': ' + friendObj.score,
            left : 10,
            color : "#000",
            font : Alloy.Globals.getFontCustom(16, 'Regular'),
            top : 130,
        });
        friend.add(frScore);

        var frWins = Ti.UI.createLabel({
            text : Alloy.Globals.PHRASES.winsInfoTxt + ': ' + friendObj.wins,
            left : 10,
            font : Alloy.Globals.getFontCustom(16, 'Regular'),
            color : "#000",
            top : 150,
        });
        friend.add(frWins);

    } else if (!isFriend && !isMe) {
        var addFriendBtn = Ti.UI.createView({
            width : Ti.UI.SIZE,
            height : Ti.UI.SIZE,
            layout : 'horizontal',
            left : 10,
            top : 115,
            height : 40,
            id : playerObj.id,
            fName : playerObj.name
        });

        addFriendBtn.add(Ti.UI.createLabel({
            width : Ti.UI.SIZE,
            height : Ti.UI.SIZE,
            top : 12,
            left : 2,
            text : fontawesome.icon('icon-plus'),
            color : '#000',
            font : {
                fontFamily : font
            },
            id : playerObj.id,
            fName : playerObj.name
        }));

        addFriendBtn.add(Ti.UI.createLabel({
            width : Ti.UI.SIZE,
            height : Ti.UI.SIZE,
            top : 8,
            left : 6,
            text : Alloy.Globals.PHRASES.addFriendTxt,
            font : Alloy.Globals.getFontCustom(16, 'Regular'),
            color : "#000",
            id : playerObj.id,
            fName : playerObj.name
        }));

        addFriendBtn.addEventListener('click', function(e) {
            addNewFriend(e.source.id, e.source.fName);
        });

        win.add(addFriendBtn);

    }

    var favTeam = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.favTeamTxt,
        left : 10,
        color : "#000",
        font : Alloy.Globals.getFontCustom(16, 'Regular'),
        top : 190,
    });
    friend.add(favTeam);

    var teamName = playerObj.team.data[0].name;
    if (teamName.length > 22) {
        teamName = teamName.substring(0, 19) + '...';
    }

    var frTeam = Ti.UI.createLabel({
        text : teamName,
        font : Alloy.Globals.getFontCustom(16, 'Regular'),
        left : 10,
        color : "#000",
        top : 210,
    });
    friend.add(frTeam);

    var url = playerObj.team.data[0].team_logo;
    var finalUrl = url.replace(' ', '');
    var finalUrl = finalUrl.toLowerCase();
    var images = Alloy.Globals.BETKAMPENURL + finalUrl;

    var profilePics = Titanium.UI.createImageView({
        defaultImage : '/images/no_pic.png',
        image : images,
        height : 70,
        width : 70,
        right : 5,
        top : 170,
        borderRadius : 35
    });

    profilePics.addEventListener('error', imageErrorHandler);

    friend.add(profilePics);
}

function getFriendIndex(playerId) {
    // search array to see if I am friends with this player
    for (var i = 0; i < friends.length; i++) {
        if (friends[i].id === playerId) {
            // we are friends, return index of friend
            return i;
        }
    }
    return -1;
}

function popupAndroid(objId, playerIndex) {
    var w = Ti.UI.createView({
        height : Ti.UI.FILL,
        width : Ti.UI.FILL,
        backgroundColor : 'transparent',
        top : 0,
        left : 0,
        zIndex : "1000",
    });
    
    var modal = Ti.UI.createView({
        height : 250,
        width : "85%",
        top : 80,
        left : '7.5%',
        right : '7.5%',
        backgroundColor : '#FFF',
        borderRadius : 10
    });
   
    w.add(modal);
    
    var textWrapper = Ti.UI.createView({
        height : 250,
        width : "85%"
    });  
    
    w.add(textWrapper);

    var friendIndex = getFriendIndex(objId);

    if (objId === Alloy.Globals.BETKAMPENUID) {
        // this is me
        createPopupLayout(modal, players[playerIndex], true, true, -1);
    } else if (friendIndex > -1) {
        // this is one of my friends
        createPopupLayout(modal, players[playerIndex], true, false, friendIndex);
    } else {
        // some one else
        createPopupLayout(modal, players[playerIndex], false, false, -1);
    }

    // When clicking on the modal
    textWrapper.addEventListener("click", function(e) {
        winOpen = false;
        modal.hide();
        modal = null;
    });

    // When clicking outside of the modal
    w.addEventListener('click', function() {
        winOpen = false;
        w.hide();
    });
    
    var clickPreventer = function(){
        winOpen = false;
        w.hide();
        $.scoreBoardTable.removeEventListener('click', clickPreventer);
    };
    
    // add a event listener to the "parent" of the modal so that window will be closed when clicking outside of it
    // we need to delay the adding since we open modal on table row click
    setTimeout(function() { 
        $.scoreBoardTable.addEventListener('click', clickPreventer);
    }, 300);      

    $.scoreBoardTable.add(w);
}

function popupWinIOS(objId, playerIndex) {
    var t = Titanium.UI.create2DMatrix();
    t = t.scale(0);

    //create a transparent overlay that fills the screen to prevent openingen multiple windows
    var transparent_overlay = Ti.UI.createView({
        width : Ti.UI.FILL,
        height : Ti.UI.FILL,
        backgroundColor : 'transparent',
        top : 0,
        left : 0,
        zIndex : 100,
    });
    
    $.scoreBoardTable.add(transparent_overlay);

    var w = Titanium.UI.createWindow({
        backgroundColor : '#fff',
        height : 250,
        width : "85%",
        borderRadius : 10,
        opacity : 1,
        zIndex : 1000,
        transform : t
    });

    var friendIndex = getFriendIndex(objId);

    if (objId === Alloy.Globals.BETKAMPENUID) {
        // this is me
        createPopupLayout(w, players[playerIndex], true, true, -1);
    } else if (friendIndex > -1) {
        // this is one of my friends
        createPopupLayout(w, players[playerIndex], true, false, friendIndex);
    } else {
        // some one else
        createPopupLayout(w, players[playerIndex], false, false, -1);
    }

    // create first transform to go beyond normal size
    var t1 = Titanium.UI.create2DMatrix();
    t1 = t1.scale(1.1);
    var a = Titanium.UI.createAnimation();
    a.transform = t1;
    a.duration = 200;

    // when this animation completes, scale to normal size
    a.addEventListener('complete', function() {
        var t2 = Titanium.UI.create2DMatrix();
        t2 = t2.scale(1.0);
        w.animate({
            transform : t2,
            duration : 200
        });

    });

    w.addEventListener('click', function() {
        var t3 = Titanium.UI.create2DMatrix();
        t3 = t3.scale(0);
        w.close({
            transform : t3,
            duration : 300
        });
        transparent_overlay.hide();
        transparent_overlay = null;
        winOpen = false;
    });

    /* Listen to the click event outside of the achievement window */
    transparent_overlay.addEventListener('click', function(e) {
        winOpen = false;
        var t3 = Titanium.UI.create2DMatrix();
        t3 = t3.scale(0);
        w.close({
            transform : t3,
            duration : 300
        });
        transparent_overlay.hide();
        transparent_overlay = null;
    });

    openWindows.push(w);
    transparent_overlay.add(w.open(a));
}

var winOpen = false;

var rowClick = function(e) {
    if (winOpen) {
        return;
    }

    winOpen = true;
    
    if (OS_IOS) {
        popupWinIOS(e.row.id, e.row.name);
    } else {
        popupAndroid(e.row.id, e.row.name);
    }
};

function createRow(obj, friends, index) {
    var row = Ti.UI.createTableViewRow({
        backgroundColor : '#000',
        id : obj.id,
        hasChild : child,
        height : 75,
        width : Ti.UI.FILL,
        name : index
    });

    row.addEventListener('click', rowClick);

    var image;
    if (obj.fbid !== null) {
        image = "https://graph.facebook.com/" + obj.fbid + "/picture?type=large";
    } else {
        // get betkampen image
        image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + obj.id + '.png';
    }

    var profileImage = Ti.UI.createImageView({
        defaultImage : '/images/no_pic.png',
        image : image,
        width : 40,
        left : 10,
        height : 40,
        borderRadius : 20
    });

    profileImage.addEventListener('error', imageErrorHandler);

    row.add(profileImage);

    var profileName = obj.name;

    if (profileName.length > 18) {
        profileName = profileName.substring(0, 15) + '...';
    }

    var nameLabel = Ti.UI.createLabel({
        text : profileName,
        left : 60,
        top : 16,
        height : Ti.UI.SIZE,
        width : Ti.UI.SIZE,
        font : Alloy.Globals.getFontCustom(16, 'Regular'),
        color : '#FFF'
    });
    row.add(nameLabel);

    var statusIcon = Ti.UI.createLabel({
        left : 60,
        top : 38,
        height : Ti.UI.SIZE,
        width : Ti.UI.SIZE,
        font : {
            fontFamily : font,
            //fontSize : 20
        },
        text : fontawesome.icon('icon-trophy'),
        color : Alloy.Globals.themeColor()
    });

    row.add(statusIcon);

    var scoreLabel = Ti.UI.createLabel({
        text : obj.score,
        left : 60 + statusIcon.toImage().width + 2,
        top : 38,
        height : Ti.UI.SIZE,
        width : Ti.UI.SIZE,
        font : Alloy.Globals.getFontCustom(12, 'Regular'),
        color : Alloy.Globals.themeColor()
    });

    row.add(scoreLabel);

    var positionImage = Ti.UI.createImageView({
        image : null,
        height : 20,
        width : 20,
        right : 10,
        borerRadius : 10
    });

    var statusLabel = Ti.UI.createLabel({
        text : null,
        top : 38,
        left : 60 + statusIcon.toImage().width + 2 + scoreLabel.toImage().width + 5,
        height : Ti.UI.SIZE,
        width : Ti.UI.FILL,
        font : Alloy.Globals.getFontCustom(12, 'Regular'),
        color : Alloy.Globals.themeColor()
    });

    switch(index) {
    case 0:
        positionImage.image = '/images/gold.png';
        statusLabel.text = Alloy.Globals.PHRASES.chipleaderTxt;
        break;
    case 1:
        positionImage.image = '/images/silver.png';
        statusLabel.text = Alloy.Globals.PHRASES.runnerUppTxt;
        break;
    case 2:
        positionImage.image = '/images/bronze.png';
        statusLabel.text = Alloy.Globals.PHRASES.thirdPlaceTxt;
        break;
    default:
        break;
    }

    if (positionImage.image !== null) {
        row.add(positionImage);
        row.add(statusLabel);
    }

    row.className = "scoreBoardRow";
    return row;
}

if (OS_IOS) {
    indicator.openIndicator();
}

getScore();

function runFirstTime(players, friends) {
    for (var i = 0; i < players.length; i++) {
        sections[0].add(createRow(players[i], friends, i));
    }
    $.scoreBoardTable.setData(sections);
}

function getScore() {
    // check connection
    if (Alloy.Globals.checkConnection()) {
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            indicator.closeIndicator();
            Ti.API.error('Bad Sever =>' + JSON.stringify(e));
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        };

        try {
            xhr.open("GET", Alloy.Globals.SCOREBOARDURL + '?lang=' + Alloy.Globals.LOCALE);
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
                    var resp = JSON.parse(this.responseText);

                    for (var player in resp.scoreboard) {
                        // add each player
                        players.push(resp.scoreboard[player]);
                    }

                    // friends will be this array
                    friends = resp.friends;

                    runFirstTime(players, friends);
                }
                indicator.closeIndicator();
            } else {
                indicator.closeIndicator();
                Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
                Ti.API.error("Error =>" + this.response);
            }
        };
    } else {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }
}

if (OS_ANDROID) {
    $.scoreView.addEventListener('open', function() {
        Alloy.Globals.setAndroidCouponMenu($.scoreView.activity);

        $.scoreView.activity.actionBar.onHomeIconItemSelected = function() {
            $.scoreView.close();
            $.scoreView = null;
        };
        $.scoreView.activity.actionBar.displayHomeAsUp = true;
        $.scoreView.activity.actionBar.title = Alloy.Globals.PHRASES.betbattleTxt;

        // sometimes the view remain in memory, then we don't need to show the "loading"
        if (!name) {
           // indicator.openIndicator(); // TODO
        }
    });
}

$.scoreView.addEventListener('close', function() {
    indicator.closeIndicator();
});

$.scoreView.addEventListener('close', function() {
    if (openWindows.length > 0) {
        for (var i = 0; i < openWindows.length; i++) {
            openWindows[i].close();
        }
    }
});

$.scoreBoardTable.setOpacity(1);
