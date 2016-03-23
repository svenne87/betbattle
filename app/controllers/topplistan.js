var args = arguments[0] || {};
var context;
var mod = require('bencoding.blur');
var openWindows = [];
var isAndroid = false;

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});
var name = false;
var data = [];
var iOSVersion;
var players = [];
var friends = [];
var scoreboardCount = 0;
var scroreboardFetched = 0;
var footerViewLabel = '';
var isLoading = false;
var initialTableSize = 0;
var currentSize = 0;
var overlap = 62;
var isAdding = false;

var imageErrorHandler = function(e) {
    e.source.image = '/images/no_pic.png';
};

var logoImageErrorHandler = function(e) {
     e.source.image = '/images/no_team.png';
};

var footerView = Ti.UI.createView({
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

footerViewLabel = Ti.UI.createLabel({
    left : 10,
    top : 25,
    text : '',
    height : Ti.UI.SIZE,
    width : Ti.UI.FILL,
    font : Alloy.Globals.getFontCustom(12, 'Regular'),
    color : '#FFF'
});

footerView.add(footerViewLabel);

$.scoreBoardTable.footerView = footerView;
$.scoreBoardTable.headerView = Ti.UI.createView({
    height : 0.1,
});

if (OS_IOS) {
    // get initial table size for iOS
    $.scoreBoardTable.addEventListener('postlayout', function() {
        initialTableSize = $.scoreBoardTable.rect.height;
    });

    $.scoreView.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.scoreboardTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });

} else {
    context = require('lib/Context');
    isAndroid = true;
}

function onOpen(evt) {
    if(isAndroid) {
        context.on('scoreBoardActivity', this.activity);
    }
}

function onClose(evt) {
    if(isAndroid) {
        context.off('scoreBoardActivity');
    }
}

$.scoreBoardTable.addEventListener('scroll', function(_evt) {
    if (OS_IOS) {
        // include a timeout for better UE
        setTimeout(function() {
            if (currentSize - overlap < _evt.contentOffset.y + initialTableSize) {
                if (isLoading) {
                    return;
                }

                if (scoreboardCount <= scroreboardFetched) {
                    // can't load more
                    return;
                } else {
                    // try to fetch 20 more games each time
                    getScore(false, ((scroreboardFetched - 0) + 20), 20);
                }
            }
        }, 500);
    } else {
        if (_evt.firstVisibleItem + _evt.visibleItemCount == _evt.totalItemCount) {
            if (isLoading) {
                return;
            }

            if (scoreboardCount <= scroreboardFetched) {
                // can't load more
                return;
            } else {
                setTimeout(function() {
                    // try to fetch 20 more games each time
                    getScore(false, ((scroreboardFetched - 0) + 20), 20);
                }, 200);
            }
        }
    }

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

function isLowerCase(str) {
    return str === str.toLowerCase();
}

function addNewFriend(id, name, playerObj) {
    if (Alloy.Globals.checkConnection()) {
        indicator.openIndicator();
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            indicator.closeIndicator();
            Ti.API.error('Bad Sever =>' + " " + JSON.stringify(e) + " " + e.error);
            isAdding = false;
        };

        try {
            xhr.open('POST', Alloy.Globals.BETKAMPENADDFRIENDSURL + '?lang=' + Alloy.Globals.LOCALE + '&fb=0' + '&frid=' + id);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
            xhr.setTimeout(Alloy.Globals.TIMEOUT);

            xhr.send();
        } catch(e) {
            indicator.closeIndicator();
            isAdding = false;
        }

        xhr.onload = function() {
            if (this.status == '200') {
                if (this.readyState == 4) {
                    friends.push(playerObj);
                    Alloy.Globals.showToast(Alloy.Globals.PHRASES.friendSuccess + ' ' + name);
                }
                indicator.closeIndicator();
            } else {
                Ti.API.error("Error =>" + this.response);
            }
            indicator.closeIndicator();
            isAdding = false;
        };
    } else {
        isAdding = false;
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }
}

// create content of popup
function createPopupLayout(win, playerObj, isFriend, isMe, friendIndex) {
    name = playerObj.name.toString();

    if (name.length > 18) {
        name = name.substring(0, 15) + '...';
    }

    var friendStats = Ti.UI.createLabel({
        text : name + " ",
        left : 100,
        color : "#000",
        top : 45,
        font : Alloy.Globals.getFontCustom(16, 'Regular'),
    });
    win.add(friendStats);

    var friend;

    friend = win;
    
    var image;

    if (playerObj.fbid !== null) {
        image = "https://graph.facebook.com/" + playerObj.fbid + "/picture?type=large";
    } else {
        // get betkampen image
        image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + playerObj.id + '.png';
    }

    var profilePic = Titanium.UI.createImageView({
        //defaultImage : '/images/no_pic.png',
        image : image,
        height : 90,
        width : 90,
        left : 5,
        top : 10,
        borderRadius : 45
    });
    
    profilePic.addEventListener('error', imageErrorHandler);
	
	if(!isAndroid) {
		profilePic.setDefaultImage('/images/no_pic.png');
	}
	
    friend.add(profilePic);

    if (isFriend || isMe) {
        var friendObj;

        if (isMe) {
            friendObj = playerObj;
        } else {
            friendObj = friends[friendIndex];
        }

        var frLvl = Ti.UI.createLabel({
            text : Alloy.Globals.PHRASES.levelTxt + ': ' + friendObj.level + " ",
            left : 10,
            color : "#000",
            font : Alloy.Globals.getFontCustom(16, 'Regular'),
            top : 110,
        });
        friend.add(frLvl);

        var frScore = Ti.UI.createLabel({
            text : Alloy.Globals.PHRASES.scoreInfoTxt + ': ' + friendObj.score + " ",
            left : 10,
            color : "#000",
            font : Alloy.Globals.getFontCustom(16, 'Regular'),
            top : 130,
        });
        friend.add(frScore);

        if (friendObj.wins === "" || friendObj.wins === null || friendObj.wins === " ") {
            friendObj.wins = "0";
        }

        var frWins = Ti.UI.createLabel({
            text : Alloy.Globals.PHRASES.winsInfoTxt + ': ' + friendObj.wins + " ",
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
            zIndex : 9999,
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
            text : Alloy.Globals.PHRASES.addFriendTxt + " ",
            font : Alloy.Globals.getFontCustom(16, 'Regular'),
            color : "#000",
            id : playerObj.id,
            fName : playerObj.name
        }));

        addFriendBtn.addEventListener('click', function(e) {
            if (isAdding) {
                return;
            }

            addNewFriend(e.source.id, e.source.fName, playerObj);
        });

        win.add(addFriendBtn);
    }
    
    if (playerObj.team.data[0]) {
        
        if(playerObj.team.data[0].name) {
        	var favTeam = Ti.UI.createLabel({
            	text : Alloy.Globals.PHRASES.favTeamTxt + " ",
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
            	text : teamName + " ",
            	font : Alloy.Globals.getFontCustom(16, 'Regular'),
            	left : 10,
            	color : "#000",
            	top : 210,
        	});
        	friend.add(frTeam);
		}
		if(playerObj.team.data[0].team_logo) {
        	var images = Alloy.Globals.BETKAMPENURL + playerObj.team.data[0].team_logo;

        	var profilePics = Titanium.UI.createImageView({
         	   //defaultImage : '/images/no_team.png',
         	   image : images,
         	   height : 70,
         	   width : 70,
         	   right : 5,
         	   top : 170
        	});

        	profilePics.addEventListener('error', logoImageErrorHandler);
        	
        	if(!isAndroid) {
        		profilePics.setDefaultImage('/images/no_team.png');
        	}
        	
        	// fix for images delivered from us/api
        	if (!isLowerCase(playerObj.team.data[0].team_logo)) {
            	profilePics.width = 50;
            	profilePics.height = 50;
            	profilePics.top = 190;
        	}
       
        	friend.add(profilePics);
       }
    }
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
 
    // When clicking outside of the modal
    w.addEventListener('click', function(e) { 
        winOpen = false;
        w.hide();
    });

    var clickPreventer = function() {
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
        //defaultImage : '/images/no_pic.png', // strul
       	image : image,
        width : 40,
        left : 10,
        height : 40,
        borderRadius : 20
    });

    profileImage.addEventListener('error', imageErrorHandler);
    if(!isAndroid) {
    	profileImage.setDefaultImage('/images/no_pic.png');
    }
	row.add(profileImage);

    var profileName = obj.name;

    if (profileName.length > 18) {
        profileName = profileName.substring(0, 15) + '...';
    }

    var nameLabel = Ti.UI.createLabel({
        text : profileName + " ",
        left : 60,
        top : 16,
        height : Ti.UI.SIZE,
        width : Ti.UI.SIZE,
        font : Alloy.Globals.getFontCustom(16, 'Regular'),
        color : '#FFF'
    });
    row.add(nameLabel);

    var customTopPos = 38;

    if (!child) {
        customTopPos = 40;
    }

    var statusIcon = Ti.UI.createLabel({
        left : 60,
        top : customTopPos,
        height : Ti.UI.SIZE,
        width : Ti.UI.SIZE,
        font : {
            fontFamily : font,
            //fontSize : 20
        },
        text : fontawesome.icon('icon-signal'),
        color : Alloy.Globals.themeColor()
    });

    row.add(statusIcon);

    var scoreLabel = Ti.UI.createLabel({
        text : obj.score + " ",
        left : 60 + statusIcon.toImage().width + 2,
        top : customTopPos,
        height : Ti.UI.SIZE,
        width : Ti.UI.SIZE,
        font : Alloy.Globals.getFontCustom(12, 'Regular'),
        color : Alloy.Globals.themeColor()
    });

    row.add(scoreLabel);

    var posImage = 10;

    if (!child) {
        var rightPercentage = '5%';
        posImage = '10%';

        font = 'fontawesome-webfont';

        if (Titanium.Platform.displayCaps.platformWidth < 350) {
            rightPercentage = '3%';
            posImage = '8%';
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

    var positionImage = Ti.UI.createImageView({
        image : null,
        height : 20,
        width : 20,
        right : posImage,
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

    if (OS_IOS) {
        // keep track of the table total heigth, to decide when to start fetching more
        currentSize += row.toImage().height;
    }

    return row;
}

if (OS_IOS) {
    indicator.openIndicator();
}

$.scoreBoardTable.setData(data);
getScore(true, 0, 20);

/* Set text with information about how many games we are displaying */
function setDisplayText() {
    if (scoreboardCount <= scroreboardFetched) {
        footerViewLabel.setText(Alloy.Globals.PHRASES.showningPlayersTxt + ': ' + scoreboardCount + '/' + scoreboardCount + ' ');
    } else {
        footerViewLabel.setText(Alloy.Globals.PHRASES.showningPlayersTxt + ': ' + scroreboardFetched + '/' + scoreboardCount + ' ');
    }
}

function getScore(firstTime, start, rows) {
    Ti.API.log(firstTime + " Fetching -> " + start + " - " + rows);

    // check connection
    if (Alloy.Globals.checkConnection()) {
        if (isLoading) {
            return;
        }

        if (OS_IOS && firstTime) {
            indicator.openIndicator();
        } else if (!firstTime) {
            indicator.openIndicator();
        }

        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            isLoading = false;
            indicator.closeIndicator();
            Ti.API.error('Bad Sever =>' + JSON.stringify(e));
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        };

        try {
            xhr.open("GET", Alloy.Globals.SCOREBOARDURL + '?lang=' + Alloy.Globals.LOCALE + '&start=' + start + '&rows=' + rows);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
            xhr.setTimeout(Alloy.Globals.TIMEOUT);
            isLoading = true;
            xhr.send();
        } catch(e) {
            isLoading = false;
            indicator.closeIndicator();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        }

        xhr.onload = function() {
            if (this.status == '200') {
                if (this.readyState == 4) {
                    var resp = JSON.parse(this.responseText);

                    scoreboardCount = resp.scoreboard_count;

                    if (scoreboardCount <= scroreboardFetched) {
                        scroreboardFetched = scoreboardCount;
                    } else {
                        scroreboardFetched = start;
                    }

                    if (firstTime) {
                        scroreboardFetched = 0;
                        footerViewLabel.setText(Alloy.Globals.PHRASES.showningPlayersTxt + ': ' + 20 + '/' + scoreboardCount + ' ');
                        if (((scroreboardFetched - 0) + 20) >= scoreboardCount) {
                            footerViewLabel.setText(Alloy.Globals.PHRASES.showningPlayersTxt + ': ' + scoreboardCount + '/' + scoreboardCount + ' ');
                        }
                    } else {
                        // we can't fetch more games
                        if (((scroreboardFetched - 0) + 20) >= scoreboardCount) {
                            // all games are visible. update values
                            scroreboardFetched = scoreboardCount;
                        }
                        setDisplayText();
                    }

                    // friends will be this array
                    friends = resp.friends;

                    // store all in players
                    for (var player in resp.scoreboard) {
                        // add each player to total array, and keep track of that index
                        var index = players.push(resp.scoreboard[player]) - 1;
                        $.scoreBoardTable.appendRow(createRow(resp.scoreboard[player], friends, index));
                    }
                }
                indicator.closeIndicator();
                isLoading = false;
            } else {
                isLoading = false;
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
            if($.scoreView) {
            	$.scoreView.close();
            	$.scoreView = null;           	
            }
        };
        $.scoreView.activity.actionBar.displayHomeAsUp = true;
        $.scoreView.activity.actionBar.title = Alloy.Globals.PHRASES.scoreboardTxt;

        // sometimes the view remain in memory, then we don't need to show the "loading"
        if (players.length == 0) {
            indicator.openIndicator();
            // TODO
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
