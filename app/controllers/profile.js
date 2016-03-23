var args = arguments[0] || {};
var context;
var openWindows = [];
var isAndroid;
var iOSVersion;
var sections = [];
var profileLoadingLabel;
var deviceWidth = Ti.Platform.displayCaps.platformWidth;
var profileImageView;
var fontawesome = require('lib/IconicFont').IconicFont({
    font : 'lib/FontAwesome'
});

var font = 'FontAwesome';

if (OS_ANDROID) {
    isAndroid = true;
    font = 'fontawesome-webfont';
    context = require('lib/Context');

    $.profileWin.addEventListener('open', function() {
        $.profileWin.activity.onCreateOptionsMenu = function(e) {
            settings = e.menu.add( settingsIcon = {
                showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
                icon : 'images/settings_white.png',
                itemId : 2
            });

            settings.addEventListener('click', function() {
                var args = {profile : profileImageView};
                var win = Alloy.createController("settings", args).getView();
                Alloy.Globals.CURRENTVIEW = win;
                win.open({
                    fullScreen : true
                });
            });
        };

        $.profileWin.activity.actionBar.onHomeIconItemSelected = function() {
            if($.profileWin) {
               	$.profileWin.close();
            	$.profileWin = null;	
            }
        };
        $.profileWin.activity.actionBar.displayHomeAsUp = true;
        $.profileWin.activity.actionBar.title = Alloy.Globals.PHRASES.profile;
    });

    $.table.footerView = Ti.UI.createView({
        height : 0.5,
        backgroundColor : '#303030'
    });
} else {
    isAndroid = false;
    $.profileWin.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.profile,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });

    iOSVersion = parseInt(Ti.Platform.version);

    if (iOSVersion < 7) {
        $.table.separatorStyle = Titanium.UI.iPhone.TableViewSeparatorStyle.NONE;
        $.table.separatorColor = 'transparent';
    }

    $.table.footerView = Ti.UI.createView({
        height : 0.1
    });

    var settingsIcon = Ti.UI.createImageView({
        width : 22,
        height : 22,
        image : '/images/settings_white.png'
    });

    settingsIcon.addEventListener('click', function() {
        var args = {profile : profileImageView};
        var win = Alloy.createController("settings", args).getView();
        Alloy.Globals.CURRENTVIEW = win;
        Alloy.Globals.NAV.openWindow(win, {
            animated : true
        });
    });

    $.profileWin.setRightNavButton(settingsIcon);
}

function onOpen(evt) {
    if (isAndroid) {
        context.on('profileActivity', this.activity);
    } else {
        Alloy.Globals.PREVIOUSVIEW = 'profile';
        var children = Alloy.Globals.NAV.getChildren();
        for (var i in children) {
            if (children[i].id == "ticketView") {
                children[i].setOpacity(0);
            }
        }
    }
}

function onClose(evt) {
    if (isAndroid) {
        context.off('profileActivity');
    } else {
        Alloy.Globals.PREVIOUSVIEW = '';
        if (Alloy.Globals.COUPON !== null && Alloy.Globals.COUPON.games !== null) {
            if (Alloy.Globals.COUPON.games.length > 0) {
                var children = Alloy.Globals.NAV.getChildren();
                for (var i in children) {
                    if (children[i].id == "ticketView") {
                        children[i].setOpacity(1);
                    }
                }
            }
        }
    }
}

// variables to use in class
var userInfo = null;
var mod = require('bencoding.blur');

/*      Part 1      */
sections[0] = Ti.UI.createTableViewSection({
    headerView : Ti.UI.createView({
        height : 0.5,
        backgroundColor : '#000',
    })
});

var mainProfileRow = Ti.UI.createTableViewRow({
    height : 260,
    className : "profile",
    width : Ti.UI.FILL,
    backgroundColor : '#000',
    hasChild : false,
    layout : 'vertical'
});

var mainProfileCover = Ti.UI.createView({
    height : 260,
    width : Ti.UI.FILL,
    backgroundImage : '/images/profile_header.jpg',
    layout : 'vertical',
    zIndex : 0
});

mainProfileRow.add(mainProfileCover);

profileImageView = Ti.UI.createImageView({
    top : 20,
    // defaultImage : '/images/no_pic.png',
    width : 120,
    height : 120,
    borderRadius : 60,
   // borderColor : '#303030',  // TODO
    borderColor : '#FFF',
    borderWidth : 2
});

if(!isAndroid) {
	profileImageView.setDefaultImage('/images/no_pic.png');
}

//profilepicture
var image;
if (Alloy.Globals.FACEBOOKOBJECT) {
    profileImageView.image = "https://graph.facebook.com/" + Alloy.Globals.FACEBOOKOBJECT.id + "/picture?type=large";
} else {
    // get betkampen image
    profileImageView.image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + Alloy.Globals.BETKAMPENUID + '.png' + "?t=" + new Date().getTime();
}

profileImageView.addEventListener('error', function(e) {
    // fallback for image
    e.source.image = '/images/no_pic.png';
});

mainProfileCover.add(profileImageView);

var nameProfileLabel = Ti.UI.createLabel({
    text : Alloy.Globals.PHRASES.loadingTxt + ' ',
    textAlign : 'center',
    top : 20,
    font : Alloy.Globals.getFontCustom(18, "Bold"),
    color : "#FFF"
});

mainProfileCover.add(nameProfileLabel);

var levelLabel = Ti.UI.createLabel({
    text : '  ',
    textAlign : 'center',
    top : 10,
    font : Alloy.Globals.getFontCustom(16, "Normal"),
   // color : Alloy.Globals.themeColor()
    color : '#FFF'  // TODO
});

mainProfileCover.add(levelLabel);

var statsRow = Ti.UI.createTableViewRow({
    height : 100,
    className : "profile",
    width : Ti.UI.FILL,
    backgroundColor : '#000',
    hasChild : false,
    layout : 'horizontal'
});

var statsViewOne = Ti.UI.createView({
    height : 100,
    width : (deviceWidth / 3),
    backgroundColor : '#000',
    layout : 'vertical'
});

var coinsView = Ti.UI.createView({
    height : Ti.UI.SIZE,
    top : 25,
    width : Ti.UI.SIZE,
    backgroundColor : '#000',
    layout : 'horizontal'
});

coinsView.add(Ti.UI.createLabel({
    textAlign : 'center',
    width : Ti.UI.SIZE,
    font : {
        fontFamily : font
    },
    text : fontawesome.icon('fa-database'),
    color : '#FFF'
}));

var coinsLabelValue = Ti.UI.createLabel({
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    text : '',
    left : 2,
    color : '#FFF',
    textAlign : 'center',
    width : Ti.UI.SIZE
});

coinsView.add(coinsLabelValue);

var coinsLabelText = Ti.UI.createLabel({
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    text : Alloy.Globals.PHRASES.coinsInfoTxt + ' ',
    color : Alloy.Globals.themeColor(),
    textAlign : 'center',
    width : (deviceWidth / 3)
});

statsViewOne.add(coinsView);
statsViewOne.add(coinsLabelText);

var statsViewTwo = Ti.UI.createView({
    height : 100,
    width : (deviceWidth / 3),
    backgroundColor : '#000',
    layout : 'vertical'
});

var pointsView = Ti.UI.createView({
    height : Ti.UI.SIZE,
    top : 25,
    width : Ti.UI.SIZE,
    backgroundColor : '#000',
    layout : 'horizontal'
});

pointsView.add(Ti.UI.createLabel({
    textAlign : 'center',
    width : Ti.UI.SIZE,
    font : {
        fontFamily : font
    },
    text : fontawesome.icon('fa-signal'),
    color : '#FFF'
}));

var pointsLabelValue = Ti.UI.createLabel({
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    text : '',
    left : 2,
    color : '#FFF',
    textAlign : 'center',
    width : Ti.UI.SIZE
});

pointsView.add(pointsLabelValue);

var pointsLabelText = Ti.UI.createLabel({
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    text : Alloy.Globals.PHRASES.scoreInfoTxt + ' ',
    color : '#FFF',
    color : Alloy.Globals.themeColor(),
    textAlign : 'center',
    width : (deviceWidth / 3)
});

statsViewTwo.add(pointsView);
statsViewTwo.add(pointsLabelText);

var statsViewThree = Ti.UI.createView({
    height : 100,
    width : (deviceWidth / 3),
    backgroundColor : '#000',
    layout : 'vertical'
});

var winsView = Ti.UI.createView({
    height : Ti.UI.SIZE,
    top : 25,
    width : Ti.UI.SIZE,
    backgroundColor : '#000',
    layout : 'horizontal'
});

winsView.add(Ti.UI.createLabel({
    textAlign : 'center',
    width : Ti.UI.SIZE,
    font : {
        fontFamily : font
    },
    text : fontawesome.icon('fa-trophy'),
    color : '#FFF'
}));

var winsLabelValue = Ti.UI.createLabel({
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    text : '',
    left : 2,
    color : '#FFF',
    textAlign : 'center',
    width : Ti.UI.SIZE
});

winsView.add(winsLabelValue);

var winsLabelText = Ti.UI.createLabel({
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    text : Alloy.Globals.PHRASES.winsInfoTxt + ' ',
    color : Alloy.Globals.themeColor(),
    textAlign : 'center',
    width : (deviceWidth / 3)
});

statsViewThree.add(winsView);
statsViewThree.add(winsLabelText);

statsRow.add(statsViewOne);
statsRow.add(statsViewTwo);
statsRow.add(statsViewThree);

/*      Part 2      */
sections[1] = Ti.UI.createTableViewSection({
    headerView : Ti.UI.createView({
        height : 75,
        backgroundColor : '#000',
    })
});

//Create the list of Achievements
var achievementsLabel = Ti.UI.createLabel({
    text : Alloy.Globals.PHRASES.profileAchievements,
    textAlign : "center",
    color : "#FFF",
    font : Alloy.Globals.getFontCustom(18, 'Bold'),
});

sections[1].headerView.add(achievementsLabel);

var achievementsRow = Ti.UI.createTableViewRow({
    height : Ti.UI.SIZE,
    className : "profile",
    width : Ti.UI.FILL,
    backgroundColor : '#000',
    hasChild : false,
    layout : 'horizontal'
});

var achievementsLoadingLabel = Ti.UI.createLabel({
    text : Alloy.Globals.PHRASES.loadingTxt,
    top : 30,
    left : 20,
    color : "#FFF",
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
});

achievementsRow.add(achievementsLoadingLabel);

sections[0].add(mainProfileRow);
sections[0].add(statsRow);
sections[1].add(achievementsRow);

$.table.setData(sections);

//Get the user info
function getProfile() {
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onerror = function(e) {
        nameProfileLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
        Ti.API.error('Bad Sever =>' + e.error);
    };

    try {
        xhr.open('GET', Alloy.Globals.BETKAMPENUSERURL + '?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
        xhr.setTimeout(Alloy.Globals.TIMEOUT);

        xhr.send();
    } catch(e) {
        nameProfileLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
    }

    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {
                userInfo = null;

                try {
                    userInfo = JSON.parse(this.responseText);
                } catch (e) {
                    userInfo = null;
                    Ti.API.info("UserInfo NULL");
                }

                if (userInfo !== null) {
                    if (userInfo.name.length > 30) {
                        userInfo.name = userInfo.name.substring(0, 27) + '...';
                    }

                    nameProfileLabel.setText(userInfo.name + ' ');

                    var level = userInfo.level.level;

                    if ( typeof Alloy.Globals.PHRASES.levels[level] !== 'undefined') {
                        if (Alloy.Globals.PHRASES.levels[level].lenght > 30) {
                            Alloy.Globals.PHRASES.levels[level] = Alloy.Globals.PHRASES.levels[level].substring(0, 28) + '...';
                        }
                    } else {
                        Alloy.Globals.PHRASES.levels[level] = 'N/A';
                    }

                    levelLabel.setText(Alloy.Globals.PHRASES.levels[level] + ' ');
                    coinsLabelValue.setText(userInfo.totalCoins + ' ');
                    pointsLabelValue.setText(userInfo.totalPoints + ' ');
                    winsLabelValue.setText(userInfo.totalWins + ' ');

                    if (coinsLabelValue.getText().length > 8) {
                        coinsLabelValue.setText(coinsLabelValue.getText().substring(0, 6) + '..');
                    }

                    if (pointsLabelValue.getText().length > 8) {
                        pointsLabelValue.setText(pointsLabelValue.getText().substring(0, 6) + '..');
                    }

                    if (winsLabelValue.getText().length > 8) {
                        winsLabelValue.setText(winsLabelValue.getText().substring(0, 6) + '..');
                    }
                }
            }

        } else {
            nameProfileLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
            Ti.API.error("Error =>" + this.response);
        }
    };
}

function getAchievements(userInfo) {
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onerror = function(e) {
        achievementsRow.remove(achievementsLoadingLabel);
        achievementsLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
        Ti.API.error('Bad Sever =>' + JSON.stringify(e));
    };

    try {
        xhr.open('GET', Alloy.Globals.BETKAMPENACHIEVEMENTSURL + '?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
        xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
        xhr.setTimeout(Alloy.Globals.TIMEOUT);

        xhr.send();
    } catch(e) {
        achievementsRow.remove(achievementsLoadingLabel);
        achievementsLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
    }

    xhr.onload = function() {
        achievementsRow.remove(achievementsLoadingLabel);

        if (this.status == '200') {
            if (this.readyState == 4) {
                var achievements = null;
                try {
                    achievements = JSON.parse(this.responseText);
                } catch (e) {
                    achievements = null;
                }

                if (achievements !== null) {
                    var achievementsCoverView = Ti.UI.createView({
                        top : 0,
                        height : Ti.UI.SIZE,
                        width : Ti.UI.FILL,
                        layout : 'horizontal'
                    });

                    var achievementsHolderView = Ti.UI.createView({
                        top : 0,
                        height : Ti.UI.SIZE,
                        width : Ti.UI.FILL,
                        layout : 'horizontal'
                    });

                    var dynWidth = '6%';

                    if (deviceWidth <= 320) {
                        dynWidth = '4%';
                    }

                    for (var i = 0; i < achievements.length; i++) {

                        var ach_img = Alloy.Globals.BETKAMPENURL + "/achievements/" + achievements[i].image;

                        var achievement = Ti.UI.createImageView({
                            id : achievements[i].id,
                            image : ach_img,
                            width : 65,
                            height : 65,
                            borderRadius : 32.5,
                            borderWidth : 3,
                            borderColor : '#303030',
                            left : dynWidth,
                            top : dynWidth
                        });

                        if (!achievements[i].unlocked) {
                            achievement.setOpacity(0.2);
                        }

                        var achID = achievement.id;
                        achievement.addEventListener("click", function(e) {

                            if (isAndroid) {
                                var w = Ti.UI.createView({
                                    height : "100%",
                                    width : "100%",
                                    backgroundColor : 'transparent',
                                    top : 0,
                                    left : 0,
                                    zIndex : "1000",
                                });

                                var blur = mod.createBasicBlurView({
                                    width : 200,
                                    height : 150,
                                    image : ach_img,
                                    borderRadius : 10,
                                    blurRadius : 35,
                                });
                                w.add(blur);

                                var modal = Ti.UI.createView({
                                    height : 150,
                                    width : 200,
                                    backgroundColor : '#FFF',
                                    borderRadius : 10,
                                    //opacity : 0.5,
                                });
                                w.add(modal);

                                var textWrapper = Ti.UI.createView({
                                    width : 150,
                                    height : 150,
                                });
                                w.add(textWrapper);

                                var achievementTitleTxt = 'not available';

                                if ( typeof Alloy.Globals.PHRASES.achievements[e.source.id] !== 'undefined') {
                                    achievementTitleTxt = Alloy.Globals.PHRASES.achievements[e.source.id].title;
                                }

                                var achievementTitle = Ti.UI.createLabel({
                                    text : achievementTitleTxt,
                                    textAlign : "center",
                                    color : "#000",
                                    zIndex : "2000",
                                    font : Alloy.Globals.getFontCustom(18, 'Bold'),
                                    top : 5,
                                });
                                textWrapper.add(achievementTitle);

                                var dynamicTop = 40;

                                if (achievementTitleTxt.length > 13) {
                                    dynamicTop = 60;
                                }

                                var achievementDescriptionTxt = 'not available';

                                if ( typeof Alloy.Globals.PHRASES.achievements[e.source.id] !== 'undefined') {
                                    achievementDescriptionTxt = Alloy.Globals.PHRASES.achievements[e.source.id].description;
                                }

                                var achievementDescription = Ti.UI.createLabel({
                                    text : achievementDescriptionTxt,
                                    textAlign : "center",
                                    color : "#000",
                                    width : "90%",
                                    zIndex : "2000",
                                    top : dynamicTop,
                                });
                                textWrapper.add(achievementDescription);

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

                                $.profileWin.add(w);
                            } else {
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
                                $.profileWin.add(transparent_overlay);

                                var w = Titanium.UI.createWindow({
                                    backgroundColor : 'transparent',
                                    height : 150,
                                    width : 200,
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
                                    var t2 = Titanium.UI.create2DMatrix();
                                    t2 = t2.scale(1.0);
                                    w.animate({
                                        transform : t2,
                                        duration : 200
                                    });
                                });

                                var blur = mod.createBasicBlurView({
                                    width : 200,
                                    height : 150,
                                    image : e.source.image,
                                    blurRadius : 15,
                                });

                                w.add(blur);

                                var greyGlass = Ti.UI.createView({
                                    width : 200,
                                    height : 150,
                                    backgroundColor : "#FFF"
                                });

                                w.add(greyGlass);

                                var achievementTitleTxt = 'not available';

                                if ( typeof Alloy.Globals.PHRASES.achievements[e.source.id] !== 'undefined') {
                                    achievementTitleTxt = Alloy.Globals.PHRASES.achievements[e.source.id].title;
                                }

                                var achievementTitle = Ti.UI.createLabel({
                                    text : achievementTitleTxt,
                                    textAlign : "center",
                                    color : "#000",
                                    top : 15,
                                    font : Alloy.Globals.getFontCustom(18, 'Bold')
                                });
                                w.add(achievementTitle);

                                var dynamicTop = 40;

                                if (achievementTitleTxt.length > 13) {
                                    dynamicTop = 60;
                                }

                                var achievementDescriptionTxt = 'not available';

                                if ( typeof Alloy.Globals.PHRASES.achievements[e.source.id] !== 'undefined') {
                                    achievementDescriptionTxt = Alloy.Globals.PHRASES.achievements[e.source.id].description;
                                }

                                var achievementDescription = Ti.UI.createLabel({
                                    text : achievementDescriptionTxt,
                                    textAlign : "center",
                                    color : "#000",
                                    width : "90%",
                                    top : dynamicTop,
                                });
                                w.add(achievementDescription);

                                w.addEventListener('click', function() {
                                    var t3 = Titanium.UI.create2DMatrix();
                                    t3 = t3.scale(0);
                                    w.close({
                                        transform : t3,
                                        duration : 300
                                    });
                                    transparent_overlay.hide();
                                    //transparent_overlay = null;
                                });

                                /* Listen to the click event outside of the achievement window */
                                transparent_overlay.addEventListener('click', function(e) {
                                    var t3 = Titanium.UI.create2DMatrix();
                                    t3 = t3.scale(0);
                                    w.close({
                                        transform : t3,
                                        duration : 300
                                    });
                                    transparent_overlay.hide();
                                    //transparent_overlay = null;
                                });

                                openWindows.push(w);
                                transparent_overlay.add(w.open(a));
                                //w.open(a);
                            }

                        });
                        achievementsHolderView.add(achievement);

                    }
                    achievementsCoverView.add(achievementsHolderView);
                    achievementsRow.add(achievementsCoverView);

                    if (isAndroid) {
                        // Android fix since it's not filling view.
                        achievementsRow.add(Ti.UI.createView({
                            height : 80,
                            width : Ti.UI.FILL
                        }));
                    }
                }
            }
        } else {
            achievementsLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
            Ti.API.error("Error =>" + this.response);
        }
    };
}

getProfile();
getAchievements();

/* Close all open windows on window close */
$.profileWin.addEventListener('close', function() {
    if (openWindows.length > 0) {
        for (var i = 0; i < openWindows.length; i++) {
            openWindows[i].close();
        }
    }
});
