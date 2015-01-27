var args = arguments[0] || {};
var context;
var openWindows = [];
var isAndroid;
var iOSVersion;
var sections = [];
var profileLoadingLabel;
var deviceWidth = Ti.Platform.displayCaps.platformWidth;

var fontawesome = require('lib/IconicFont').IconicFont({
    font : 'lib/FontAwesome'
});

var font = 'FontAwesome';

if (OS_ANDROID) {
    isAndroid = true;
    font = 'fontawesome-webfont';
    context = require('lib/Context');

    $.profileWin.addEventListener('open', function() {
        Alloy.Globals.setAndroidCouponMenu($.profileWin.activity);

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

function onOpen(evt) {
    if (isAndroid) {
        context.on('profileActivity', this.activity);
    }
}

function onClose(evt) {
    if (isAndroid) {
        context.off('profileActivity');
    }
}

// variables to use in class
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
    height : 200,
    className : "profile",
    width : Ti.UI.FILL,
    backgroundColor : '#000',
    hasChild : false
});

var firstMainProfileRowView = Ti.UI.createView({
    top : 10,
    height : 100,
    width : Ti.UI.FILL,
    layout : 'horizontal'
});

var favoriteTeamImageView = Ti.UI.createImageView({
    defaultImage : '/images/no_team.png',
    width : 50,
    left : '10%',
    height : 50,
    borderRadius : 25
});

var dynLeft = '17%';

if (deviceWidth <= 320) {
    dynLeft = '12%';
}

var profileImageView = Ti.UI.createImageView({
    defaultImage : '/images/no_pic.png',
    width : 80,
    left : dynLeft,
    height : 80,
    borderRadius : 40
});

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
    profileImageView.image = '/images/no_pic.png';
});

var levelImageView = Ti.UI.createImageView({
    defaultImage : '/images/no_team.png',
    width : 50,
    left : dynLeft,
    height : 50,
    borderRadius : 25
});

firstMainProfileRowView.add(favoriteTeamImageView);
firstMainProfileRowView.add(profileImageView);
firstMainProfileRowView.add(levelImageView);

mainProfileRow.add(firstMainProfileRowView);

var profileStatsView = Ti.UI.createView({
    height : 100,
    left : 0,
    top : 100,
    width : Ti.UI.FILL,
    backgroundColor : '#000',
});

profileLoadingLabel = Ti.UI.createLabel({
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    text : Alloy.Globals.PHRASES.loadingTxt + ' ',
    color : '#FFF',
    left : 20,
    width : Ti.UI.SIZE
});

profileStatsView.add(profileLoadingLabel);

mainProfileRow.add(profileStatsView);

var firstProfilePart = Ti.UI.createView({
    height : Ti.UI.SIZE,
    left : 0,
    width : (deviceWidth / 2),
    backgroundColor : '#000',
    layout : 'horizontal'
});

var secondProfilePart = Ti.UI.createView({
    height : Ti.UI.SIZE,
    left : (deviceWidth / 2),
    width : (deviceWidth / 2),
    backgroundColor : '#000',
    layout : 'horizontal'
});

firstProfilePart.hide();
secondProfilePart.hide();

var firstLeftRow = Ti.UI.createView({
    top : 0,
    left : 10,
    height : 30,
    width : Ti.UI.FILL,
    layout : 'horizontal'
});

var favoriteTeamNameLabel = Ti.UI.createLabel({
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    text : '',
    color : '#FFF',
    left : 0,
    width : Ti.UI.SIZE
});

firstLeftRow.add(favoriteTeamNameLabel);
firstProfilePart.add(firstLeftRow);

var secondLeftRow = Ti.UI.createView({
    top : 0,
    left : 10,
    height : 30,
    width : Ti.UI.FILL,
    layout : 'horizontal'
});

var coinsLabelText = Ti.UI.createLabel({
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    text : Alloy.Globals.PHRASES.coinsInfoTxt + ':',
    color : '#FFF',
    left : 0,
    width : Ti.UI.SIZE
});

var coinsLabelValue = Ti.UI.createLabel({
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    text : '...                       ',
    color : Alloy.Globals.themeColor(),
    left : 5,
    width : Ti.UI.SIZE
});

secondLeftRow.add(coinsLabelText);

secondLeftRow.add(Ti.UI.createLabel({
    left : 10,
    width : Ti.UI.SIZE,
    font : {
        fontFamily : font
    },
    text : fontawesome.icon('fa-database'),
    color : Alloy.Globals.themeColor(),
}));

secondLeftRow.add(coinsLabelValue);

firstProfilePart.add(secondLeftRow);

var firstRightRow = Ti.UI.createView({
    top : 0,
    height : 30,
    width : Ti.UI.FILL,
    layout : 'horizontal'
});

var levelLabel = Ti.UI.createLabel({
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    text : '',
    color : '#FFF',
    right : 10,
    textAlign : 'right',
    width : Ti.UI.FILL
});

firstRightRow.add(levelLabel);
secondProfilePart.add(firstRightRow);

var secondRightRow = Ti.UI.createView({
    top : 0,
    height : 30,
    width : Ti.UI.FILL,
});

var secondRightRowInner = Ti.UI.createView({
    top : 0,
    height : 30,
    width : Ti.UI.SIZE,
    right : 10,
    layout : 'horizontal'
});

var winsLabelText = Ti.UI.createLabel({
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    text : Alloy.Globals.PHRASES.winsInfoTxt + ':',
    color : '#FFF',
    left : 10,
    textAlign : 'right',
    width : Ti.UI.SIZE
});

var winsLabelValue = Ti.UI.createLabel({
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    text : '',
    color : Alloy.Globals.themeColor(),
    left : 5,
    textAlign : 'right',
    width : Ti.UI.SIZE
});

secondRightRowInner.add(winsLabelText);

secondRightRowInner.add(Ti.UI.createLabel({
    left : 10,
    textAlign : 'left',
    width : Ti.UI.SIZE,
    font : {
        fontFamily : font
    },
    text : fontawesome.icon('fa-trophy'),
    color : Alloy.Globals.themeColor(),
}));

secondRightRowInner.add(winsLabelValue);
secondRightRow.add(secondRightRowInner);
secondProfilePart.add(secondRightRow);

var thirdLeftRow = Ti.UI.createView({
    top : 0,
    left : 10,
    height : 30,
    width : Ti.UI.FILL,
    layout : 'horizontal'
});

var pointsLabelText = Ti.UI.createLabel({
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    text : Alloy.Globals.PHRASES.scoreInfoTxt + ':',
    color : '#FFF',
    left : 0,
    width : Ti.UI.SIZE
});

var pointsLabelValue = Ti.UI.createLabel({
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    text : '...                      ',
    color : Alloy.Globals.themeColor(),
    left : 5,
    width : Ti.UI.SIZE
});

thirdLeftRow.add(pointsLabelText);

thirdLeftRow.add(Ti.UI.createLabel({
    left : 10,
    width : Ti.UI.SIZE,
    font : {
        fontFamily : font
    },
    text : fontawesome.icon('fa-signal'),
    color : Alloy.Globals.themeColor()
}));

thirdLeftRow.add(pointsLabelValue);
firstProfilePart.add(thirdLeftRow);

var thirdRightRow = Ti.UI.createView({
    top : 0,
    height : 30,
    width : Ti.UI.FILL
});

var thirdRightRowInner = Ti.UI.createView({
    top : 0,
    height : 30,
    width : Ti.UI.SIZE,
    right : 10,
    layout : 'horizontal'
});

var scoreBoardLabelText = Ti.UI.createLabel({
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    text : Alloy.Globals.PHRASES.positionTxt + ':',
    color : '#FFF',
    left : 0,
    textAlign : 'right',
    width : Ti.UI.SIZE
});

var scoreBoardLabelValue = Ti.UI.createLabel({
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    text : '',
    color : Alloy.Globals.themeColor(),
    left : 5,
    textAlign : 'right',
    width : Ti.UI.SIZE
});

thirdRightRowInner.add(scoreBoardLabelText);
thirdRightRowInner.add(scoreBoardLabelValue);

thirdRightRow.add(thirdRightRowInner);
secondProfilePart.add(thirdRightRow);

profileStatsView.add(firstProfilePart);
profileStatsView.add(secondProfilePart);

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
sections[1].add(achievementsRow);

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
                    if (userInfo.team.data[0]) {
                        if (userInfo.team.data[0].name.length > 17) {
                            userInfo.team.data[0].name = userInfo.team.data[0].name.substring(0, 14) + '...';
                        }

                        favoriteTeamNameLabel.setText(userInfo.team.data[0].name + ' ');
                        favoriteTeamImageView.setImage(Alloy.Globals.BETKAMPENURL + userInfo.team.data[0].team_logo);

                        favoriteTeamImageView.addEventListener('error', function() {
                            favoriteTeamImageView.image = '/images/no_team.png';
                        });
                    }

                    if (userInfo.name.length > 17) {
                        userInfo.name = userInfo.name.substring(0, 15) + '...';
                    }

                    profileNameLabel.setText(userInfo.name + ' ');

                    var level = userInfo.level.level;

                    levelImageView.setImage(Alloy.Globals.BETKAMPENURL + "/" + userInfo.level.symbol);

                    levelImageView.addEventListener('error', function() {
                        levelImageView.image = '/images/no_team.png';
                    });

                    if ( typeof Alloy.Globals.PHRASES.levels[level] !== 'undefined') {
                        if (Alloy.Globals.PHRASES.levels[level].lenght > 17) {
                            Alloy.Globals.PHRASES.levels[level] = Alloy.Globals.PHRASES.levels[level].substring(0, 14) + '...';
                        }
                    } else {
                        Alloy.Globals.PHRASES.levels[level] = 'N/A';
                    }

                    levelLabel.setText(Alloy.Globals.PHRASES.levels[level] + ' ');
                    coinsLabelValue.setText(userInfo.totalCoins + ' ');
                    pointsLabelValue.setText(userInfo.totalPoints + ' ');
                    winsLabelValue.setText(userInfo.totalWins + ' ');
                    scoreBoardLabelValue.setText(userInfo.position + ' ');

                    if (coinsLabelValue.getText().length > 6) {
                        coinsLabelValue.setText(coinsLabelValue.getText().substring(0, 5) + '..');
                    }

                    if (pointsLabelValue.getText().length > 6) {
                        pointsLabelValue.setText(pointsLabelValue.getText().substring(0, 5) + '..');
                    }

                    if (winsLabelValue.getText().length > 4) {
                        winsLabelValue.setText(winsLabelValue.getText().substring(0, 3) + '..');
                    }

                    if (scoreBoardLabelValue.getText().length > 6) {
                        scoreBoardLabelValue.setText(scoreBoardLabelValue.getText().substring(0, 5) + '..');
                    }

                    profileStatsView.remove(profileLoadingLabel);
                    firstProfilePart.show();
                    secondProfilePart.show();
                }
            }

        } else {
            profileNameLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
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
/*
                    var achievementsHolderView = Ti.UI.createView({
                        top : 0,
                        height : Ti.UI.SIZE,
                        width : '90%',
                        left : '-2%',
                        right : '10%',
                        layout : 'horizontal'
                    });
*/
                    var achievementsHolderView = Ti.UI.createView({
                        top : 0,
                        height : Ti.UI.SIZE,
                        width : Ti.UI.FILL,
                        layout : 'horizontal'
                    });
                    
                  //  var dynWidth = '14%';
                    var dynWidth = '7%';

                    if (deviceWidth <= 320) {
                        //dynWidth = '12%';
                        dynWidth = '5%';
                    }

                    for (var i = 0; i < achievements.length; i++) {
                        //var ach_img = '/images/locked_ach.png';  TODO
                        
                        var ach_img;
                        
                        if (achievements[i].unlocked) {
                            ach_img = Alloy.Globals.BETKAMPENURL + "/achievements/" + achievements[i].image;
                        }
                        var achievement = Ti.UI.createImageView({
                            id : achievements[i].id,
                            image : ach_img,
                            width : 60,
                            height : 60,
                            left : dynWidth,
                            top : dynWidth
                            //top : 10,
                            //bottom : 10
                        });
                        
                        if (!achievements[i].unlocked) {  
                            achievement.setOpacity(0.2);
                            
                            if( i > 1) {
                                achievement.setOpacity(0.3);
                            } 
                            
                                                        if( i > 2) {
                                achievement.setOpacity(0.4);
                            } 
                            
                                                        if( i > 3) {
                                achievement.setOpacity(0.6);
                            } 
                            
                            if( i > 10) {
                                achievement.setOpacity(0.8);
                            } 
                           
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
                                
                                if(typeof Alloy.Globals.PHRASES.achievements[e.source.id] !== 'undefined') {
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
                                
                                if(typeof Alloy.Globals.PHRASES.achievements[e.source.id] !== 'undefined') {
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
                                
                                if(typeof Alloy.Globals.PHRASES.achievements[e.source.id] !== 'undefined') {
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
                                
                                if(typeof Alloy.Globals.PHRASES.achievements[e.source.id] !== 'undefined') {
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
                    
                    if(isAndroid) {
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
