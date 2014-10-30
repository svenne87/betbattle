var args = arguments[0] || {};
var openWindows = [];
var isAndroid;
var iOSVersion;
var sections = [];

if (OS_ANDROID) {
    $.profileWin.addEventListener('open', function() {
        Alloy.Globals.setAndroidCouponMenu($.profileWin.activity);
        isAndroid = true;

        $.profileWin.activity.actionBar.onHomeIconItemSelected = function() {
            $.profileWin.close();
            $.profileWin = null;
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
}

//variables to use in class
var userInfo = null;
var mod = require('bencoding.blur');

/*      Part 1      */
sections[0] = Ti.UI.createTableViewSection({
    headerView : Ti.UI.createView({
        height : 75,
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
    })
});

profileNameLabel = Ti.UI.createLabel({
    text : Alloy.Globals.PHRASES.loadingTxt + ' ',
    textAlign : 'center',
    font : Alloy.Globals.getFontCustom(18, "Bold"),
    color : "#FFF"
});

sections[0].headerView.add(profileNameLabel);

var mainProfileRow = Ti.UI.createTableViewRow({
    height : 140,
    className : "profile",
    width : Ti.UI.FILL,
    backgroundColor : '#000',
    hasChild : false
});

var firstMainProfileRowView = Ti.UI.createView({
    top : 10,
    height : 90,
    width : Ti.UI.FILL,
    layout : 'horizontal'
});

var favoriteTeamImageView = Ti.UI.createImageView({
    defaultImage : '/images/no_pic.png',
    width : 40,
    left : '10%',
    height : 40,
    borderRadius : 20
});

var profileImageView = Ti.UI.createImageView({
    defaultImage : '/images/no_pic.png',
    width : 80,
    left : '17%',
    height : 80,
    borderRadius : 40
});

//profilepicture
var image;
if (Alloy.Globals.FACEBOOKOBJECT) {
    profileImageView.image = "https://graph.facebook.com/" + Alloy.Globals.FACEBOOKOBJECT.id + "/picture?type=large";
} else {
    // get betkampen image
    profileImageView.image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + Alloy.Globals.BETKAMPENUID + '.png';
}

profileImageView.addEventListener('error', function(e) {
    // fallback for image
    profileImageView.image = '/images/no_pic.png';
});

var levelImageView = Ti.UI.createImageView({
    defaultImage : '/images/no_pic.png',
    width : 40,
    left : '17%',
    height : 40,
    borderRadius : 20
});

firstMainProfileRowView.add(favoriteTeamImageView);
firstMainProfileRowView.add(profileImageView);
firstMainProfileRowView.add(levelImageView);

var secondMainProfileRowView = Ti.UI.createView({
    top : 100,
    height : 20,
    width : Ti.UI.FILL,
    layout : 'absolute'
});

var favoriteTeamNameLabel = Ti.UI.createLabel({
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    text : '',
    color : '#FFF',
    left : 20,
    height : 20,
    width : Ti.UI.SIZE
});

var levelLabel = Ti.UI.createLabel({
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    text : 'Loading...',
    color : '#FFF',
    right : 20,
    height : 20,
    width : Ti.UI.SIZE
});

secondMainProfileRowView.add(favoriteTeamNameLabel);
secondMainProfileRowView.add(levelLabel);

mainProfileRow.add(firstMainProfileRowView);
mainProfileRow.add(secondMainProfileRowView);

/*      Part 2      */
sections[1] = Ti.UI.createTableViewSection({
    headerView : Ti.UI.createView({
        height : 75,
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
    })
});

//Create the list of Achievements
var statsProfileLabel = Ti.UI.createLabel({
    text : Alloy.Globals.PHRASES.statsTxt,
    textAlign : "center",
    color : "#FFF",
    font : Alloy.Globals.getFontCustom(18, 'Bold'),
});

sections[1].headerView.add(statsProfileLabel);

var generalProfileRow = Ti.UI.createTableViewRow({
    height : 125,
    className : "profile",
    width : Ti.UI.FILL,
    backgroundColor : '#000',
    hasChild : false
});

var coinsView = Ti.UI.createView({
    top : 10,
    height : 23,
    width : Ti.UI.FILL,
    layout : 'horizontal'
});

var coinsLabelText = Ti.UI.createLabel({
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    text : Alloy.Globals.PHRASES.coinsInfoTxt + ':',
    color : '#FFF',
    left : 20,
    width : Ti.UI.SIZE
});

var coinsLabelValue = Ti.UI.createLabel({
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    text : '...',
    color : Alloy.Globals.themeColor(),
    left : 5,
    width : Ti.UI.SIZE
});

coinsView.add(coinsLabelText);
coinsView.add(coinsLabelValue);

var pointsView = Ti.UI.createView({
    top : 36,
    height : 23,
    width : Ti.UI.FILL,
    layout : 'horizontal'
});

var pointsLabelText = Ti.UI.createLabel({
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    text : Alloy.Globals.PHRASES.scoreInfoTxt + ':',
    color : '#FFF',
    left : 20,
    width : Ti.UI.SIZE
});

var pointsLabelValue = Ti.UI.createLabel({
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    text : '...',
    color : Alloy.Globals.themeColor(),
    left : 5,
    width : Ti.UI.SIZE
});

pointsView.add(pointsLabelText);
pointsView.add(pointsLabelValue);

var winsView = Ti.UI.createView({
    top : 62,
    height : 23,
    width : Ti.UI.FILL,
    layout : 'horizontal'
});

var winsLabelText = Ti.UI.createLabel({
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    text : Alloy.Globals.PHRASES.winsInfoTxt + ':',
    color : '#FFF',
    left : 20,
    width : Ti.UI.SIZE
});

var winsLabelValue = Ti.UI.createLabel({
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    text : '...',
    color : Alloy.Globals.themeColor(),
    left : 5,
    width : Ti.UI.SIZE
});

winsView.add(winsLabelText);
winsView.add(winsLabelValue);

var scoreBoardView = Ti.UI.createView({
    top : 87,
    height : 23,
    width : Ti.UI.FILL,
    layout : 'horizontal'
});

var scoreBoardLabelText = Ti.UI.createLabel({
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    text : Alloy.Globals.PHRASES.positionTxt + ':',
    color : '#FFF',
    left : 20,
    width : Ti.UI.SIZE
});

var scoreBoardLabelValue = Ti.UI.createLabel({
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    text : '..',
    color : Alloy.Globals.themeColor(),
    left : 5,
    width : Ti.UI.SIZE
});

scoreBoardView.add(scoreBoardLabelText);
scoreBoardView.add(scoreBoardLabelValue);

generalProfileRow.add(coinsView);
generalProfileRow.add(pointsView);
generalProfileRow.add(winsView);
generalProfileRow.add(scoreBoardView);

/*      Part 3      */
sections[2] = Ti.UI.createTableViewSection({
    headerView : Ti.UI.createView({
        height : 75,
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
    })
});

//Create the list of Achievements
var achievementsLabel = Ti.UI.createLabel({
    text : Alloy.Globals.PHRASES.profileAchievements,
    textAlign : "center",
    color : "#FFF",
    font : Alloy.Globals.getFontCustom(18, 'Bold'),
});

sections[2].headerView.add(achievementsLabel);

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
    textAlign : "center",
    top : 30,
    color : "#FFF",
    font : Alloy.Globals.getFontCustom(18, 'Regular'),
});

achievementsRow.add(achievementsLoadingLabel);

sections[0].add(mainProfileRow);
sections[1].add(generalProfileRow);
sections[2].add(achievementsRow);

$.table.setData(sections);

//Get the user info
function getProfile() {
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onerror = function(e) {
        profileNameLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
        Ti.API.error('Bad Sever =>' + e.error);
    };

    try {
        xhr.open('POST', Alloy.Globals.BETKAMPENUSERURL + '?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
        xhr.setTimeout(Alloy.Globals.TIMEOUT);

        xhr.send();
    } catch(e) {
        profileNameLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
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
                    if (userInfo.team.data[0].name.length > 17) {
                        userInfo.team.data[0].name = userInfo.team.data[0].name.substring(0, 14) + '...';
                    }

                    favoriteTeamNameLabel.setText(userInfo.team.data[0].name + ' ');
                    favoriteTeamImageView.setImage(Alloy.Globals.BETKAMPENURL + userInfo.team.data[0].team_logo);

                    favoriteTeamImageView.addEventListener('error', function() {
                        favoriteTeamImageView.image = '/images/no_pic.png';
                    });

                    if (userInfo.name.length > 17) {
                        userInfo.name = userInfo.name.substring(0, 15) + '...';
                    }

                    profileNameLabel.setText(userInfo.name + ' ');

                    var level = userInfo.level.level;

                    levelImageView.setImage(Alloy.Globals.BETKAMPENURL + "/" + userInfo.level.symbol);

                    levelImageView.addEventListener('error', function() {
                        levelImageView.image = '/images/no_pic.png';
                    });

                    if (Alloy.Globals.PHRASES.levels[level].lenght > 17) {
                        Alloy.Globals.PHRASES.levels[level] = Alloy.Globals.PHRASES.levels[level].substring(0, 14) + '...';
                    }

                    levelLabel.setText(Alloy.Globals.PHRASES.levels[level] + ' ');

                    coinsLabelValue.setText(userInfo.totalCoins);
                    pointsLabelValue.setText(userInfo.totalPoints);
                    winsLabelValue.setText(userInfo.totalWins);
                    scoreBoardLabelValue.setText(userInfo.position);
                }
            }

        } else {
            profileNameLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
            Ti.API.error("Error =>" + this.response);
        }
    };
}

function getAchievements() {
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
                    for (var i = 0; i < achievements.length; i++) {
                        var ach_img = '/images/locked_ach.png';
                        if (achievements[i].unlocked == true) {
                            ach_img = Alloy.Globals.BETKAMPENURL + "/achievements/" + achievements[i].image;
                        }
                        var achievement = Ti.UI.createImageView({
                            id : achievements[i].id,
                            image : ach_img,
                            width : 60,
                            height : 60,
                            left : '12%',
                            top : 10,
                            bottom : 10
                        });

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
                                    height : 200,
                                    image : ach_img,
                                    borderRadius : 10,
                                    blurRadius : 35,
                                });
                                w.add(blur);

                                var modal = Ti.UI.createView({
                                    height : 200,
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

                                var achievementTitle = Ti.UI.createLabel({
                                    text : Alloy.Globals.PHRASES.achievements[e.source.id].title,
                                    textAlign : "center",
                                    color : "#000",
                                    zIndex : "2000",
                                    font : Alloy.Globals.getFontCustom(18, 'Bold'),
                                    top : 5,
                                });
                                textWrapper.add(achievementTitle);
                                
                                var dynamicTop = 40;
                                
                                if(Alloy.Globals.PHRASES.achievements[e.source.id].title.length > 13) {
                                    dynamicTop = 60;
                                } 

                                var achievementDescription = Ti.UI.createLabel({
                                    text : Alloy.Globals.PHRASES.achievements[e.source.id].description,
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
                                    height : 200,
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
                                    height : 200,
                                    image : e.source.image,
                                    blurRadius : 15,
                                });

                                w.add(blur);

                                var greyGlass = Ti.UI.createView({
                                    width : 200,
                                    height : 200,
                                    backgroundColor : "#FFF"
                                });

                                w.add(greyGlass);

                                var achievementTitle = Ti.UI.createLabel({
                                    text : Alloy.Globals.PHRASES.achievements[e.source.id].title,
                                    textAlign : "center",
                                    color : "#000",
                                    top : 15,
                                    font : Alloy.Globals.getFontCustom(18, 'Bold')
                                });
                                w.add(achievementTitle);
                                
                                var dynamicTop = 40;
                                
                                if(Alloy.Globals.PHRASES.achievements[e.source.id].title.length > 13) {
                                    dynamicTop = 60;
                                } 

                                var achievementDescription = Ti.UI.createLabel({
                                    text : Alloy.Globals.PHRASES.achievements[e.source.id].description,
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

                        achievementsRow.add(achievement);
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

