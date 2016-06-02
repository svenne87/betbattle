var args = arguments[0] || {};
var context;

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

var mod = require('bencoding.blur');
var openWindows = [];
var sections = [];
var isAndroid = true;
var child = false;
var table = null;
var iOSVersion;

var fontawesome = require('lib/IconicFont').IconicFont({
    font : 'lib/FontAwesome'
});

var font = 'fontawesome-webfont';

if (OS_IOS) {
    $.myFriends.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.friendsHeaderTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });

    font = 'FontAwesome';
    isAndroid = false;
    child = true;
    iOSVersion = parseInt(Ti.Platform.version);
} else {
    context = require('lib/Context');
}

function onOpen(evt) {
    if(isAndroid) {
        context.on('myFriendsActivity', this.activity);
    }
}

function onClose(evt) {
    if(isAndroid) {
        context.off('myFriendsActivity');
    }
}

var mainView = Ti.UI.createView({
    //class : "topView",
    height : "100%",
    width : "100%",
    top : 0,
    backgroundColor : "transparent",
    layout : "vertical"
});

var imageErrorHandler = function(e) {
    e.source.image = '/images/no_pic.png';
};

var logoImageErrorHandler = function(e) {
    e.source.image = '/images/no_team.png';
};

function isLowerCase(str) {
    return str === str.toLowerCase();
}

function createGUI(obj) {

    if (!obj.team.data[0]) {
        obj.team.data[0] = {};
        obj.team.data[0].name = '';
        obj.team.data[0].team_logo = '';
    }
    
    if(obj.team.data[0].name == null) {
    	obj.team.data[0].name = "";
    }
    
    if(obj.team.data[0].team_logo == null) {
    	obj.team.data[0].team_logo = "";
    }
	
    var friend = Ti.UI.createTableViewRow({
        hasChild : child,
        width : Ti.UI.FILL,
        left : 0,
        className : 'gameTypeRow',
        height : 75,
        isFriend : false,
        id : obj.id,
        name : obj.name,
        fbid : obj.fbid,
        score : obj.score,
        wins : obj.wins,
        level : obj.level,
        teamName : obj.team.data[0].name,
        teamLogo : obj.team.data[0].team_logo,
    });

    friend.addEventListener("click", function(e) {
        if (isAndroid) {
            var w = Ti.UI.createView({
                height : "100%",
                width : "100%",
                backgroundColor : 'transparent',
                top : 0,
                left : 0,
                zIndex : "1000"
            });

            var images = Alloy.Globals.BETKAMPENURL + e.source.teamLogo;

            var modal = Ti.UI.createView({
                height : 300,
                width : "85%",
                zIndex : 99,
                backgroundColor : '#fff',
                borderRadius : 10
            });
            w.add(modal);

            var textWrapper = Ti.UI.createView({
                height : 250,
                width : "85%"
            });
            w.add(textWrapper);

            friendName = obj.name.toString();
            if (friendName.length > 18) {
                friendName = boardName.substring(0, 18);
            }

            var friendStats = Ti.UI.createLabel({
                text : friendName + " ",
                left : '38%',
                color : "#000",
                top : 45,
                font : Alloy.Globals.getFontCustom(16, "Regular")
            });
            modal.add(friendStats);

            var image;
            if (obj.fbid !== null) {
                image = "https://graph.facebook.com/" + obj.fbid + "/picture?type=large";
            } else {
                // get betkampen image
                image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + obj.id + '.png';
            }

            var profilePic = Titanium.UI.createImageView({
               // defaultImage : '/images/no_pic.png',
                image : image,
                height : 90,
                width : 90,
                left : '2%',
                top : 10,
                borderRadius : 45
            });
            
            if(!isAndroid) {
            	profilePic.setDefaultImage('/images/no_pic.png');
            }

            profilePic.addEventListener('error', imageErrorHandler);

            modal.add(profilePic);

            var frLvl = Ti.UI.createLabel({
                text : Alloy.Globals.PHRASES.levelTxt + ': ' + e.source.level,
                left : '5%',
                color : "#000",
                top : 110,
                font : Alloy.Globals.getFontCustom(16, "Regular")
            });
            modal.add(frLvl);

            var frScore = Ti.UI.createLabel({
                text : Alloy.Globals.PHRASES.scoreInfoTxt + ': ' + e.source.score,
                left : '5%',
                color : "#000",
                top : 130,
                font : Alloy.Globals.getFontCustom(16, "Regular")
            });
            modal.add(frScore);

            if (e.source.wins === "" || e.source.wins === null || e.source.wins === " ") {
                e.source.wins = 0;
            }

            var frWins = Ti.UI.createLabel({
                text : Alloy.Globals.PHRASES.winsInfoTxt + ': ' + e.source.wins,
                left : '5%',
                color : "#000",
                top : 150,
                font : Alloy.Globals.getFontCustom(16, "Regular")
            });
            modal.add(frWins);

            if (e.source.teamName !== '') {
                var favTeam = Ti.UI.createLabel({
                    text : Alloy.Globals.PHRASES.favTeamTxt,
                    left : "5%",
                    color : "#000",
                    top : 190,
                    font : Alloy.Globals.getFontCustom(16, "Regular")
                });
                modal.add(favTeam);

                var frTeam = Ti.UI.createLabel({
                    text : e.source.teamName,
                    left : "5%",
                    color : "#000",
                    top : 210,
                    font : Alloy.Globals.getFontCustom(16, "Regular")
                });
                modal.add(frTeam);

                var images = Alloy.Globals.BETKAMPENURL + e.source.teamLogo;

                var profilePics = Titanium.UI.createImageView({
                    //defaultImage : '/images/no_team.png',
                    image : images,
                    height : 70,
                    width : 70,
                    right : '2%',
                    top : 170
                });
                
                if(!isAndroid) {
            		profilePics.setDefaultImage('/images/no_team.png');
            	}
                
                profilePics.addEventListener('error', logoImageErrorHandler);

                // fix for images delivered from us/api
                if (!isLowerCase(e.source.teamLogo)) {
                    profilePics.top = 190;
                    profilePics.width = 50;
                    profilePics.height = 50;
                }

                modal.add(profilePics);
            }

            var buttonView = Ti.UI.createView({
                width : 100,
                zIndex : 9999,
                layout : 'horizontal',
                left : 10,
                top : 245,
                height : 40,
                id : e.source.id,
                fName : e.source.name
            });

            buttonView.add(Ti.UI.createLabel({
                width : Ti.UI.SIZE,
                height : Ti.UI.SIZE,
                top : 12,
                left : 2,
                text : fontawesome.icon('icon-trash'),
                color : '#000',
                font : {
                    fontFamily : font
                },
                id : e.source.id,
                fName : e.source.name
            }));

            buttonView.add(Ti.UI.createLabel({
                width : Ti.UI.SIZE,
                height : Ti.UI.SIZE,
                top : 8,
                left : 6,
                text : Alloy.Globals.PHRASES.removeTxt + ' ',
                font : Alloy.Globals.getFontCustom(16, 'Regular'),
                color : "#000",
                id : e.source.id,
                fName : e.source.name
            }));

            buttonView.addEventListener("click", function(e) {
                var aL = Titanium.UI.createAlertDialog({
                    title : Alloy.Globals.PHRASES.betbattleTxt,
                    message : Alloy.Globals.PHRASES.removeFriendTxt + ' ' + e.source.fName + '?',
                    buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.abortBtnTxt],
                    cancel : 1,
                    id : e.source.id,
                    fName : e.source.fName
                });

                aL.addEventListener('click', function(e) {
                    switch(e.index) {
                    case 0:
                        if (!Alloy.Globals.checkConnection()) {
                            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
                            return;
                        }

                        var removeFriend = Ti.Network.createHTTPClient();

                        try {
                            indicator.openIndicator();
                            removeFriend.open("POST", Alloy.Globals.BETKAMPENDELETEFRIENDURL + '?frid=' + e.source.id + '&fb=0&lang=' + Alloy.Globals.LOCALE);
                            removeFriend.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
                            removeFriend.setTimeout(Alloy.Globals.TIMEOUT);
                            removeFriend.send();
                        } catch (e) {
                            Alloy.Globals.showToast(Alloy.Globals.PHRASES.commonErrorTxt);
                            indicator.closeIndicator();
                        }

                        removeFriend.onload = function() {
                            for (var row in table.data[0].rows) {
                                if (table.data[0].rows[row].id === e.source.id) {
                                    table.deleteRow(table.data[0].rows[row]);
                                    break;
                                }
                            }
                            indicator.closeIndicator();
                            Alloy.Globals.showToast(e.source.fName + ' ' + Alloy.Globals.PHRASES.groupMemberDeletedTxt);
                        };

                        removeFriend.onerror = function() {
                            indicator.closeIndicator();
                            Alloy.Globals.showToast(Alloy.Globals.PHRASES.commonErrorTxt);
                        };
                        break;
                    case 1:
                        break;
                    }

                });
                aL.show();
            });

            modal.add(buttonView);

            /* When clicking on the modal */
            textWrapper.addEventListener("click", function(e) {
                modal.hide();
                modal = null;
            });

            /* When clicking outside of the modal */
            w.addEventListener('click', function() {
                w.hide();
                w = null;
            });

            $.myFriends.add(w);
        } else {//iphone
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
            $.myFriends.add(transparent_overlay);

            var w = Titanium.UI.createWindow({
                backgroundColor : '#fff',
                height : 300,
                width : "85%",
                borderRadius : 10,
                opacity : 1,
                zIndex : 1000,
                transform : t
            });
            // create first transform to go beyond normal size
            var t1 = Titanium.UI.create2DMatrix();
            t1 = t1.scale(1.1);
            var a = Titanium.UI.createAnimation();
            a.transform = t1;
            a.duration = 200;

            // when this animation completes, scale to normal size
            a.addEventListener('complete', function() {
                Titanium.API.info('here in complete');
                var t2 = Titanium.UI.create2DMatrix();
                t2 = t2.scale(1.0);
                w.animate({
                    transform : t2,
                    duration : 200
                });

            });
            friendName = obj.name.toString();
            if (friendName.length > 18) {
                friendName = boardName.substring(0, 18);
            }

            var friendStats = Ti.UI.createLabel({
                text : friendName,
                left : '38%',
                color : "#000",
                top : 45,
                font : Alloy.Globals.getFontCustom(16, "Regular")
            });
            w.add(friendStats);
            
            /* Old work around
            var friend = Ti.UI.createView({
                top : 2,
                width : "100%",
                height : 45,
            });
            w.add(friend);
            */
            
            var friend = w;
           
            var image;
            if (obj.fbid !== null) {
                image = "https://graph.facebook.com/" + obj.fbid + "/picture?type=large";
            } else {
                // get betkampen image
                image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + obj.id + '.png';
            }

            var profilePic = Titanium.UI.createImageView({
                // defaultImage : '/images/no_pic.png',
                image : image,
                height : 90,
                width : 90,
                left : '2%',
                top : 10,
                borderRadius : 45
            });
			
			if(!isAndroid) {
            	profilePic.setDefaultImage('/images/no_pic.png');
            }
			
            profilePic.addEventListener('error', imageErrorHandler);

            friend.add(profilePic);

            var frLvl = Ti.UI.createLabel({
                text : Alloy.Globals.PHRASES.levelTxt + ': ' + e.source.level,
                left : "5%",
                color : "#000",
                top : 110,
                font : Alloy.Globals.getFontCustom(16, "Regular")
            });
            friend.add(frLvl);

            var frScore = Ti.UI.createLabel({
                text : Alloy.Globals.PHRASES.scoreInfoTxt + ': ' + e.source.score,
                left : "5%",
                color : "#000",
                top : 130,
                font : Alloy.Globals.getFontCustom(16, "Regular")
            });
            friend.add(frScore);

            if (e.source.wins === "" || e.source.wins === null || e.source.wins === " ") {
                e.source.wins = 0;
            }

            var frWins = Ti.UI.createLabel({
                text : Alloy.Globals.PHRASES.winsInfoTxt + ': ' + e.source.wins,
                left : "5%",
                color : "#000",
                top : 150,
                font : Alloy.Globals.getFontCustom(16, "Regular")
            });
            friend.add(frWins);

            if (e.source.teamName !== '') {
                var favTeam = Ti.UI.createLabel({
                    text : Alloy.Globals.PHRASES.favTeamTxt,
                    left : "5%",
                    color : "#000",
                    top : 190,
                    font : Alloy.Globals.getFontCustom(16, "Regular")
                });
                friend.add(favTeam);

                var frTeam = Ti.UI.createLabel({
                    text : e.source.teamName,
                    left : "5%",
                    color : "#000",
                    top : 210,
                    font : Alloy.Globals.getFontCustom(16, "Regular")
                });
                friend.add(frTeam);

                var images = Alloy.Globals.BETKAMPENURL + e.source.teamLogo;

                var profilePics = Titanium.UI.createImageView({
                    // defaultImage : '/images/no_team.png',
                    image : images,
                    height : 70,
                    width : 70,
                    right : '2%',
                    top : 170,
                    borderRadius : 35
                });
                
                if(!isAndroid) {
            		profilePics.setDefaultImage('/images/no_team.png');
           	 	}
			
                profilePics.addEventListener('error', logoImageErrorHandler);
                
                // fix for images delivered from us/api
                if (!isLowerCase(e.source.teamLogo)) {
                    profilePics.top = 190;
                    profilePics.width = 50;
                    profilePics.height = 50;
                }

                friend.add(profilePics);
            }

            var buttonView = Ti.UI.createView({
                width : Ti.UI.SIZE,
                // height : Ti.UI.SIZE,
                layout : 'horizontal',
                left : 10,
                top : 245,
                height : 40,
                id : e.source.id,
                fName : e.source.name
            });

            buttonView.add(Ti.UI.createLabel({
                width : Ti.UI.SIZE,
                height : Ti.UI.SIZE,
                top : 12,
                left : 2,
                text : fontawesome.icon('icon-trash'),
                color : '#000',
                font : {
                    fontFamily : font
                },
                id : e.source.id,
                fName : e.source.name
            }));

            buttonView.add(Ti.UI.createLabel({
                width : Ti.UI.SIZE,
                height : Ti.UI.SIZE,
                top : 8,
                left : 6,
                text : Alloy.Globals.PHRASES.removeTxt,
                font : Alloy.Globals.getFontCustom(16, 'Regular'),
                color : "#000",
                id : e.source.id,
                fName : e.source.name
            }));

            buttonView.addEventListener("click", function(e) {
                var aL = Titanium.UI.createAlertDialog({
                    title : Alloy.Globals.PHRASES.betbattleTxt,
                    message : Alloy.Globals.PHRASES.removeFriendTxt + ' ' + e.source.fName + '?',
                    buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.abortBtnTxt],
                    cancel : 1,
                    id : e.source.id,
                    fName : e.source.fName
                });

                aL.addEventListener('click', function(e) {
                    switch(e.index) {
                    case 0:
                        if (!Alloy.Globals.checkConnection()) {
                            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
                            return;
                        }

                        var removeFriend = Ti.Network.createHTTPClient();

                        try {
                            indicator.openIndicator();
                            removeFriend.open("POST", Alloy.Globals.BETKAMPENDELETEFRIENDURL + '?frid=' + e.source.id + '&fb=0&lang=' + Alloy.Globals.LOCALE);
                            removeFriend.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
                            removeFriend.setTimeout(Alloy.Globals.TIMEOUT);
                            removeFriend.send();
                        } catch (e) {
                            Alloy.Globals.showToast(Alloy.Globals.PHRASES.commonErrorTxt);
                            indicator.closeIndicator();
                        }

                        removeFriend.onload = function() {
                            for (var row in table.data[0].rows) {
                                if (table.data[0].rows[row].id === e.source.id) {
                                    table.deleteRow(table.data[0].rows[row]);
                                    break;
                                }
                            }

                            if (table.data[0].rows.length === 0) {
                                $.myFriends.close();
                            }

                            indicator.closeIndicator();
                            Alloy.Globals.showToast(e.source.fName + ' ' + Alloy.Globals.PHRASES.groupMemberDeletedTxt);
                        };

                        removeFriend.onerror = function() {
                            indicator.closeIndicator();
                            Alloy.Globals.showToast(Alloy.Globals.PHRASES.commonErrorTxt);
                        };
                        break;
                    case 1:
                        break;
                    }

                });
                aL.show();

            });

            w.add(buttonView);

            w.addEventListener('click', function() {
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
            //w.open(a);

        }

    });

    //profilepicture
    var image;
    if (obj.fbid !== null) {
        image = "https://graph.facebook.com/" + obj.fbid + "/picture?type=large";
    } else {
        // get betkampen image
        image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + obj.id + '.png';
    }

    if (!obj.team.data[0]) {
        obj.team.data[0] = {};
        obj.team.data[0].name = '';
        obj.team.data[0].team_logo = '';
    }

    var profilePic = Titanium.UI.createImageView({
        // defaultImage : '/images/no_pic.png',
        image : image,
        width : 40,
        left : 10,
        height : 40,
        borderRadius : 20,
        id : obj.id,
        name : obj.name,
        fbid : obj.fbid,
        score : obj.score,
        wins : obj.wins,
        level : obj.level,
        teamName : obj.team.data[0].name,
        teamLogo : obj.team.data[0].team_logo,
        borderRadius : 17
    });
    
                    
    if(!isAndroid) {
    	profilePic.setDefaultImage('/images/no_pic.png');
    }
    
    profilePic.addEventListener('error', function(e) {
        // fallback for image
        e.source.image = '/images/no_pic.png';
    });

    friend.add(profilePic);

    boardName = obj.name.toString();
    if (boardName.length > 22) {
        boardName = boardName.substring(0, 22);
    }
    var name = Ti.UI.createLabel({
        text : boardName,
        left : 60,
        id : obj.id,
        name : obj.name,
        fbid : obj.fbid,
        score : obj.score,
        wins : obj.wins,
        level : obj.level,
        teamName : obj.team.data[0].name,
        teamLogo : obj.team.data[0].team_logo,
        font : Alloy.Globals.getFontCustom(18, "Regular"),
        color : "#FFF"
    });
    friend.add(name);

    // add custom icon on Android to symbol that the row has child
    if (child !== true) {
        var rightPercentage = '5%';

        font = 'fontawesome-webfont';

        if (Titanium.Platform.displayCaps.platformWidth < 350) {
            rightPercentage = '3%';
        }

        friend.add(Ti.UI.createLabel({
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

    return friend;
}

function createBtn() {
	var spaceView = Ti.UI.createView( {
		height: 10,
		width: Ti.UI.FILL,
		backgroundColor : '#000'
	});
	mainView.add(spaceView);
	
    var addFriendsLabel = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.noFriendsTxt + " ",
        textAlign : "center",
        top : 20,
        font : Alloy.Globals.getFontCustom(16, "Regular"),
        color : "#FFF"
    });
    mainView.add(addFriendsLabel);

	var secSpaceView = Ti.UI.createView( {
		height: 40,
		width: Ti.UI.FILL,
		backgroundColor : '#000'
	});
	mainView.add(secSpaceView);

    var openFriendSearchBtn = Alloy.Globals.createButtonView(Alloy.Globals.themeColor(), "#FFF", Alloy.Globals.PHRASES.addFriendsTxt);
    mainView.add(openFriendSearchBtn);

    openFriendSearchBtn.addEventListener('click', function(e) {
        var win = Alloy.createController('friendSearch').getView();
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
        $.myFriends.close();
    });

}

var friends = null;

var xhr = Ti.Network.createHTTPClient({
    // function called when the response data is available
    onload : function(e) {
        friends = JSON.parse(this.responseText);
        if (friends.length == 0) {
            createBtn();
        } else {
            friends.sort(function(a, b) {
                var x = a.name.toLowerCase();
                var y = b.name.toLowerCase();
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });

            var tableHeaderView = Ti.UI.createView({
                height : 0.1
            });

            var tableFooterView = Ti.UI.createView({
                height : 0.1
            });

            if (!isAndroid) {
                table = Titanium.UI.createTableView({
                    left : 0,
                    headerView : tableHeaderView,
                    footerView : tableFooterView,
                    height : '85%',
                    width : '100%',
                    backgroundColor : 'transparent',
                    style : Ti.UI.iPhone.TableViewStyle.GROUPED,
                    tableSeparatorInsets : {
                        left : 0,
                        right : 0
                    },
                    id : 'challengeTable',
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
                    height : '85%',
                    separatorColor : '#303030',
                    id : 'challengeTable'
                });

                table.footerView = Ti.UI.createView({
                    height : 0.5,
                    width : Ti.UI.FILL,
                    backgroundColor : '#303030'
                });
            }

            if (!isAndroid) {
                sections[0] = Ti.UI.createTableViewSection({
                    headerView : Ti.UI.createView({
                        height : 0.1
                    }),
                    footerView : Ti.UI.createView({
                        height : 0.1
                    })
                });
            } else {
                sections[0] = Ti.UI.createTableViewSection({
                });
            }

            for (var i = 0; i < friends.length; i++) {
                sections[0].add(createGUI(friends[i]));
            }

            table.setData(sections);
            mainView.add(table);

        }
        indicator.closeIndicator();
    },
    // function called when an error occurs, including a timeout
    onerror : function(e) {
        Ti.API.debug(e.error);
        indicator.closeIndicator();
        //alert('error');
    },
    timeout : Alloy.Globals.TIMEOUT // in milliseconds
});
// Prepare the connection.
xhr.open('GET', Alloy.Globals.BETKAMPENGETFRIENDSURL + '?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);

xhr.setRequestHeader("content-type", "application/json");
xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
xhr.setTimeout(Alloy.Globals.TIMEOUT);

if (!isAndroid) {
    indicator.openIndicator();
}

xhr.send();

if (isAndroid) {
    $.myFriends.addEventListener('open', function() {
        Alloy.Globals.setAndroidCouponMenu($.myFriends.activity);

        $.myFriends.activity.actionBar.onHomeIconItemSelected = function() {
            if($.myFriends) {
            	$.myFriends.close();
            	$.myFriends = null;
            }
        };
        $.myFriends.activity.actionBar.displayHomeAsUp = true;
        $.myFriends.activity.actionBar.title = Alloy.Globals.PHRASES.friendsHeaderTxt;

        // sometimes the view remain in memory, then we don't need to show the "loading"
        if (!friends) {
            indicator.openIndicator();
        }
    });
}
$.myFriends.addEventListener('close', function() {
    indicator.closeIndicator();
});

$.myFriends.add(mainView);

$.myFriends.addEventListener('close', function() {
    if (openWindows.length > 0) {
        for (var i = 0; i < openWindows.length; i++) {
            openWindows[i].close();
        }
    }
});
