var refreshItem;
var winsLabel;
var coinsLabel;
var nameLabel;
var centerImageView;

var fontawesome = require('lib/IconicFont').IconicFont({
    font : 'lib/FontAwesome'
});

$.ds.contentview.add(Alloy.createController('challengesView').getView());

var font = 'FontAwesome';
var isAndroid = false;

if (OS_ANDROID) {
    font = 'fontawesome-webfont';
    isAndroid = true;
    var Context = require('lib/Context');
    
    function onOpen(evt) {
        Context.on('mainActivity', this.activity);
    }

    function onClose(evt) {
        Context.off('mainActivity'); 
    } 
}

if (!isAndroid) {
    Alloy.Globals.NAV = $.nav;

    var labelsMenu = [{
        image : '/images/ButtonMenu.png'
    }];

    var buttonBarMenu = Titanium.UI.createButtonBar({
        labels : labelsMenu,
        top : 50,
        height : 25,
        width : Ti.UI.SIZE,
        borderColor : 'transparent',
        backgroundColor : 'transparent' 
    });

    buttonBarMenu.addEventListener('click', function() {
        // show / hide slide menu
        $.ds.toggleLeftSlider();
    });

    $.mainWin.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.betbattleTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });

    var btn = Ti.UI.createView({
        width : 50,
        height : 50,
        right : 15,
        top : 5,
        id : "ticketView"
    });

    var ticketBtn = Ti.UI.createImageView({
        image : "images/ikoner_kupong.png",
        width : 30,
        height : 30,
        id : "label",
        right : 15,
        top : 15,
    });

    btn.add(ticketBtn);

    btn.setOpacity(0);
    // hide the ticket icon

    var badge = Ti.UI.createLabel({
        width : 15,
        height : 15,
        borderRadius : 7,
        right : 5,
        id : "badge",
        textAlign : "center",
        color : '#FFF',
        font : Alloy.Globals.getFontCustom(10, "Regular"),
        backgroundColor : "transparent",
        borderColor : "transparent",
        borderWidth : 1,
    });
    btn.add(badge);

    //Add event listener to ticket button
    btn.addEventListener("click", function() {
        if (Alloy.Globals.couponOpen)
            return;
        if (Alloy.Globals.hasCoupon) {
            var win = Alloy.createController('showCoupon').getView();

            Alloy.Globals.NAV.openWindow(win, {
                animated : true
            });
            Alloy.Globals.WINDOWS.push(win);
        }
    });

    $.mainWin.setLeftNavButton(buttonBarMenu);

    $.nav.add(btn);
    
    if (oldIndicator !== null && typeof oldIndicator !== 'undefined') {
        oldIndicator.closeIndicator();
        oldIndicator = null;
    }

} else {
    Ti.Gesture.addEventListener('orientationchange', function(e) {
        Ti.Android.currentActivity.setRequestedOrientation(Ti.Android.SCREEN_ORIENTATION_PORTRAIT);
    });
	
	var abx = require('com.alcoapps.actionbarextras');
    var ticket;
    $.mainWin.orientationModes = [Titanium.UI.PORTRAIT];
    $.mainWin.addEventListener('open', function() {
        if (!$.mainWin.activity) {
            Ti.API.error("Can't access action bar on a lightweight window.");
        } else {
            actionBar = $.mainWin.activity.actionBar;

            if (actionBar) {
                $.mainWin.activity.onCreateOptionsMenu = function(e) {
                	e.menu.clear();
					actionBar.displayHomeAsUp = true;

					if(Alloy.Globals.showAndroidHome === true) {
						abx.setHomeAsUpIcon("/images/ic_launcher.png");
						abx.title = Alloy.Globals.PHRASES.betbattleTxt + ' ';
					}
			
                    ticket = e.menu.add( ticketIcon = {
                        showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
                        itemId : 1
                    });
                                   
                    abx.setMenuItemIcon({
   				 		menu: e.menu,
    					menuItem: ticket,
    					fontFamily: font,
   						icon: fontawesome.icon('fa-ticket'), 
   						color: '#FFF',
    					size: 30
  					});

                    //Add event listener to ticket button
                    ticket.addEventListener("click", function() {
                        if (Alloy.Globals.couponOpen)
                            return;
                        if (Alloy.Globals.hasCoupon) {
                            couponOpen = true;
                            var win = Alloy.createController('showCoupon').getView();
                            win.open();
                            Alloy.Globals.WINDOWS.push(win);
                        }
                    });
                };
				
                $.mainWin.activity.onPrepareOptionsMenu = function(e) {
                    var menu = e.menu;
					var color = '#FFF';
                    if (Alloy.Globals.hasCoupon) {
                      color = '#F00';
                    }
                    
                     abx.setMenuItemIcon({
   				 		menu: e.menu,
    					menuItem: ticket,
    					fontFamily: font,
   						icon: fontawesome.icon('fa-ticket'), 
   						color: color,
    					size: 30
  					});
                    
                };
              	//$.mainWin.activity.invalidateOptionsMenu();
            
                // set onResume for each activity in order to keep them updated with correct coupon
                $.mainWin.activity.addEventListener("resume", function() {
                    // will rebuild menu and keep coupon up to date
                    $.mainWin.activity.invalidateOptionsMenu();
                });

				actionBar.onHomeIconItemSelected = function() {
                    // show / hide slide menu
                     setTimeout(function() {
                     	// fix layout issues. Might be sdk version.
                      	$.ds.toggleLeftSlider();
        			 }, 550);
                };
                
    			$.mainWin.activity.invalidateOptionsMenu();
            }
        }

        if (oldIndicator !== null) {
            oldIndicator.closeIndicator();
            oldIndicator = null;
        }
    });
}

checkRatestatus();

// Used to update the menu and add a indicator for a new challenge
var updateMenu = function() {
    // rebuild table rows
    // Pass data to widget leftTableView
    leftData[0] = createSection();
    $.ds.leftTableView.data = leftData;

    // set new profile name
    nameLabel.setText(Alloy.Globals.PROFILENAME);

    if (Alloy.Globals.FACEBOOKOBJECT) {
        centerImageView.setImage('https://graph.facebook.com/' + Alloy.Globals.FACEBOOKOBJECT.id + '/picture');
    } else {
        centerImageView.setImage(Alloy.Globals.BETKAMPENURL + '/profile_images/' + Alloy.Globals.BETKAMPENUID + '.png' + "?t=" + new Date().getTime());
    }    
};

Ti.App.addEventListener('app:updateMenu', updateMenu);

// Used to rebuild the android action bar menu, to indicate that a ticket is available
var rebuildAndroidMenu = function() {
    try {
        $.mainWin.activity.invalidateOptionsMenu();
    } catch(e) {

    }
};

Ti.App.addEventListener('app:rebuildAndroidMenu', rebuildAndroidMenu);

// slide menu
var slide = function() {
   $.ds.toggleLeftSlider(); 
};

Ti.App.addEventListener('app:slide', slide);

// Used to update coins information
var coinsMenuInfo = function(data) {
    winsLabel.setText(data.totalPoints);
    coinsLabel.setText(data.totalCoins);

    if(winsLabel.getText().length > 4) {
        winsLabel.setText(winsLabel.getText().substring(0, 3) + '..');
    }
    
    if(coinsLabel.getText().length > 4) {
        coinsLabel.setText(coinsLabel.getText().substring(0, 3) + '..');
    }
};

Ti.App.addEventListener('app:coinsMenuInfo', coinsMenuInfo);

// update coins
var updateCoins = function(coins) {
    var currentCoins = -1;
    try {
        var currentCoinsText = coinsLabel.getText();
        currentCoins = parseInt(currentCoinsText);

        coins = parseInt(coins.coins);
    } catch (e) {

    }

    if (currentCoins > -1) {
        currentCoins = currentCoins + coins;
        coinsLabel.setText(Alloy.Globals.PHRASES.coinsInfoTxt + ": " + currentCoins.toString());
    }
};

Ti.App.addEventListener('updateCoins', updateCoins);

// used to navigate between views
var updateView = function(obj) {
    var currentView = Alloy.Globals.CURRENTVIEW;
    // attempt to clear memory
    $.ds.contentview.removeAllChildren();
    for (child in $.ds.contentview.children) {
        $.ds.contentview[child] = null;
    }

    // remove old event listeners
    Ti.App.removeEventListener('challengesViewRefresh', Alloy.Globals.challengesViewRefreshEvent);
    Ti.App.removeEventListener('userInfoUpdate', Alloy.Globals.userInfoUpdateEvent);
                        
    if (obj.arg !== null) {
        currentView = Alloy.createController(obj.controller, obj.arg).getView();
    } else {
        currentView = Alloy.createController(obj.controller).getView();
    }

    $.ds.contentview.add(currentView);
    Alloy.Globals.CURRENTVIEW = currentView;
};

Ti.App.addEventListener('app:updateView', updateView);
 
// Used to create the header view in menu
function createMenuHeader() {
    var userInfoView = Ti.UI.createView({
        top : 0,
        height : 100,
        layout : 'horizontal',
        backgroundColor : "transparent",
    });

    var leftViewPart = Ti.UI.createView({
        width : 200,
        height : 100,
        layout : 'horizontal'
    });

    var rightViewPart = Ti.UI.createView({
        height : 100,
        width : 50,
        layout : 'horizontal'
    });

    var image;

    if (Alloy.Globals.FACEBOOKOBJECT) {
        image = 'https://graph.facebook.com/' + Alloy.Globals.FACEBOOKOBJECT.id + '/picture';
    } else {
        image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + Alloy.Globals.BETKAMPENUID + '.png' + "?t=" + new Date().getTime();
    }

    centerImageView = Ti.UI.createImageView({
        left : 10,
        top : 30,
        height : 40,
        width : 40,
        borderRadius : 20,
        image : image
    });

    centerImageView.addEventListener('error', function(e) {
        // fallback for image
        e.source.image = '/images/no_pic.png';
    });

    leftViewPart.add(centerImageView);

    var profileName = Alloy.Globals.PROFILENAME;

    if (profileName.length > 16) {
        profileName = profileName.substring(0, 13);
        profileName = profileName + '...';
    }

    var profileViewRow = Ti.UI.createView({
        layout : 'horizontal',
        top : 30,
        left : 15,
        height : 20,
        width : Ti.UI.FILL
    });

    nameLabel = Ti.UI.createLabel({
        text : profileName,
        font : Alloy.Globals.getFontCustom(14, "Regular"),
        color : '#FFF',
        left : 0
    });

    profileViewRow.add(nameLabel);

    leftViewPart.add(profileViewRow);

    var topPos = -15;
    var heightPos = 26;
    var borderLeftTop = 18;
    var borderRightTop = 47;

    if (isAndroid) {
        topPos = 5;
    }

    var coinsView = Ti.UI.createView({
        height : heightPos,
        left : 65,
        top : topPos,
        layout : 'horizontal'
    });

    coinsView.add(Ti.UI.createLabel({
        font : {
            fontFamily : font
        },
        text : fontawesome.icon('fa-database'),
        color : '#CCC'
    }));

    coinsLabel = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.loadingTxt,
        font : Alloy.Globals.getFontCustom(14, "Regular"),
        color : '#FFF',
        left : 5
    });

    coinsView.add(coinsLabel);

    coinsView.add(Ti.UI.createLabel({
        left : 10,
        height : 15,
        font : {
            fontFamily : font
        },
        text : fontawesome.icon('icon-signal'),
        color : '#CCC'
    }));

    winsLabel = Ti.UI.createLabel({
        text : '',
        font : Alloy.Globals.getFontCustom(14, "Regular"),
        color : '#FFF',
        left : 5
    });

    coinsView.add(winsLabel);

    leftViewPart.add(coinsView);
    leftViewPart.add(Ti.UI.createView({
        height : 0.5,
        top : borderLeftTop,
        width : Ti.UI.FILL,
        layout : 'horizontal',
        backgroundColor : '#303030'
    }));

    leftViewPart.addEventListener('click', function() {
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

    rightViewPart.add(Ti.UI.createImageView({
        width : 22,
        height : 22,
        top : 30,
        image : '/images/settings.png'
    }));

    rightViewPart.add(Ti.UI.createView({
        height : 0.5,
        top : borderRightTop,
        width : '100%',
        layout : 'horizontal',
        backgroundColor : '#303030'
    }));

    rightViewPart.addEventListener('click', function() {
        var win = Alloy.createController('settings').getView();
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

        $.ds.toggleLeftSlider();
    });

    userInfoView.add(leftViewPart);
    userInfoView.add(rightViewPart);

    return userInfoView;
}

Alloy.Globals.MAINWIN = $.mainWin;

if (!isAndroid) {
    if (Alloy.Globals.INDEXWIN !== null) {
        Alloy.Globals.INDEXWIN.close();
        Alloy.Globals.INDEXWIN = null;
    }
}

var args = arguments[0] || {};
var oldIndicator = args.dialog || null;
var refresher = args.refresh || null;
var sent_challenge = args.sent_challenge || null;

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

$.mainWin.addEventListener('close', function() {
    indicator.closeIndicator();
    
    // remove event listeners
    Ti.App.removeEventListener('app:updateView', updateView);
    Ti.App.removeEventListener('updateCoins', updateCoins);
    Ti.App.removeEventListener('app:coinsMenuInfo', coinsMenuInfo);
    Ti.App.removeEventListener('app:slide', slide);
    Ti.App.removeEventListener('app:rebuildAndroidMenu', rebuildAndroidMenu);
    Ti.App.removeEventListener('app:updateMenu', updateMenu);
    Ti.App.removeEventListener('sliderToggled', sliderToggled);
});

var iOSVersion;

if (!isAndroid) {
    iOSVersion = parseInt(Ti.Platform.version);
}

var leftData = [];

function logoutBetbattle() {
    // check connection
    if (Alloy.Globals.checkConnection()) {
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            Ti.API.error('Bad Sever =>' + JSON.stringify(e));
        };

        try {
            xhr.open('POST', Alloy.Globals.BETKAMPENLOGOUTURL);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setTimeout(Alloy.Globals.TIMEOUT);
            // build the json string
            var param = '{"access_token":"' + Alloy.Globals.BETKAMPEN.token + '", "refresh_token":"' + Alloy.Globals.BETKAMPEN.refresh_token + '", "lang":"' + Alloy.Globals.LOCALE + '"}';
            xhr.send(param);
        } catch(e) {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        }

        xhr.onload = function() {
            if (this.status == '200') {
                if (this.readyState == 4) {
                    var response = '';
                    try {
                        response = JSON.parse(this.responseText);
                    } catch(e) {

                    }

                    Ti.API.log(response);
                    // remove token and name
                    Ti.App.Properties.removeProperty("BETKAMPEN");
                    Ti.App.Properties.removeProperty("favorite_team");
                    Alloy.Globals.BETKAMPEN = null;
                    Alloy.Globals.FACEBOOKOBJECT = null;
                    // close
                    if (isAndroid) {
                        $.mainWin.close();
                        var activity = Titanium.Android.currentActivity;
            
                        // remove old event listeners
                        Ti.App.removeEventListener('paused', Alloy.Globals.androidPauseEvent);
                        Ti.App.removeEventListener('resumed', Alloy.Globals.androidResumeEvent); 
                        Ti.App.removeEventListener('challengesViewRefresh', Alloy.Globals.challengesViewRefreshEvent);
                        Ti.App.removeEventListener('userInfoUpdate', Alloy.Globals.userInfoUpdateEvent);
                        
                        activity.finish();

                        // start app again
                        var intent = Ti.Android.createIntent({
                            action : Ti.Android.ACTION_MAIN,
                            url : 'Betbattle.js'
                        });
                        intent.addCategory(Ti.Android.CATEGORY_LAUNCHER);
                        Ti.Android.currentActivity.startActivity(intent);
                    } else {     
                        Alloy.Globals.CURRENTVIEW = null;
                        Alloy.Globals.NAV.close();

                        var login = Alloy.createController('login').getView();
                        login.open({
                            modal : false
                        });
                        login = null;
                    }
                } else {
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                }
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                Ti.API.error("Error =>" + this.response);
            }
        };
    } else {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }
}

function createSection() {
    var section = Ti.UI.createTableViewSection();

    var args = {
        title : Alloy.Globals.PHRASES.homeTxt,
        customView : 'challengesView',
        image : '/images/ikon_spelanasta.png',
        rightIcon : ''
    };

    // Update menu with icon if there are new challenges
    if (Alloy.Globals.CHALLENGEOBJECTARRAY[6].match_otd_status === 0 && Alloy.Globals.CHALLENGEOBJECTARRAY[0].length > 0) {
        // add badge
        args.rightIcon = (Alloy.Globals.CHALLENGEOBJECTARRAY[0].length + 1);
    } else if (Alloy.Globals.CHALLENGEOBJECTARRAY[0].length > 0) {
        // accept challenges, add badge
        args.rightIcon = Alloy.Globals.CHALLENGEOBJECTARRAY[0].length;
    } else if (Alloy.Globals.CHALLENGEOBJECTARRAY[6].match_otd_status === 0) {
        args.rightIcon = 1;
    }

    section.add(Alloy.createController('menurow', args).getView());

    var args2 = {
        title : Alloy.Globals.PHRASES.createChallengeTxt,
        customView : 'newChallengeLeague',
        image : '/images/Skapa_Utmaning.png'
    };
    section.add(Alloy.createController('menurow', args2).getView());

   	var args3 = {
    	title : Alloy.Globals.PHRASES.inviteCodeTxt,
     	customView : 'challengesView',
     	method : 'inviteCodeMethod',
     	image : '/images/sharethis.png'
    };
    section.add(Alloy.createController('menurow', args3).getView());

    var args4 = {
        title : Alloy.Globals.PHRASES.friendZoneTxt,
        customView : 'friendZone',
        image : "/images/friendzone.png"
    };
    section.add(Alloy.createController('menurow', args4).getView());

    var args5 = {
        title : Alloy.Globals.PHRASES.scoreboardTxt,
        customView : 'topplistan',
        image : '/images/Topplista.png'
    };
    section.add(Alloy.createController('menurow', args5).getView());

    var args6 = {
        title : Alloy.Globals.PHRASES.storeTxt,
        customView : 'store',
        image : '/images/Store.png'
    };
    section.add(Alloy.createController('menurow', args6).getView());

    var args7 = {
        title : Alloy.Globals.PHRASES.termsTxt,
        customView : 'terms',
        image : '/images/villkor.png'
    };
    section.add(Alloy.createController('menurow', args7).getView());

    var args9 = {
        title : Alloy.Globals.PHRASES.signOutTxt,
        customView : 'logout',
        image : '/images/Logga_Ut.png'
    };
    section.add(Alloy.createController('menurow', args9).getView());

    return section;
}

function rowSelect(e) {
	if(e.row.customView === 'challengesView' && e.row.method === 'inviteCodeMethod') {
		Ti.API.log("Show invite dialog...");
		Alloy.Globals.displayEnterInviteCodeDialog(indicator);
	}
	
    if (!isAndroid && e.row.customView !== 'challengesView' && e.row.customView !== 'logout' && e.row.customView !== 'landingPage') {

        if (Alloy.Globals.checkConnection()) {
            // open these in window
            var win = Alloy.createController(e.row.customView).getView();

            if (e.row.customView === 'newChallengeLeague') {
                Alloy.Globals.WINDOWS = [];
                Alloy.Globals.WINDOWS.push(win);
            }

            Alloy.Globals.NAV.openWindow(win, {
                animated : true,
                fullScreen : false
            });
            win = null;
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionError);
        }

    } else if (isAndroid && e.row.customView !== 'challengesView' && e.row.customView !== 'logout' && e.row.customView !== 'landingPage') {
        if (Alloy.Globals.checkConnection()) {
            // open these in window
            var win = Alloy.createController(e.row.customView).getView();

            if (e.row.customView === 'newChallengeLeague') {
                Alloy.Globals.WINDOWS = [];
                Alloy.Globals.WINDOWS.push(win);
            }

            win.open({
                fullScreen : true
            });
            win = null;

        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionError);
        }
    }

    if (e.row.customView === 'landingPage') {
        if (!isAndroid) {
            Alloy.Globals.NAV.close();
            var args = {
                resume : false
            };
            var start = Alloy.createController('landingPage', args).getView();
            Alloy.Globals.CURRENTVIEW = start;
            start.open({
                modal : false
            });
            start = null;
        } else {
            $.mainWin.close();
        }
    }

    if (isAndroid && e.row.customView === 'logout') {
        if (Alloy.Globals.checkConnection()) {
            var alertWindow = Titanium.UI.createAlertDialog({
                title : Alloy.Globals.PHRASES.betbattleTxt,
                message : Alloy.Globals.PHRASES.confirmLogoutDialogTxt,
                buttonNames : [Alloy.Globals.PHRASES.signOutTxt, Alloy.Globals.PHRASES.abortBtnTxt]
            });

            alertWindow.addEventListener('click', function(e) {
                switch (e.index) {
                case 0:
                    if (Alloy.Globals.FACEBOOKOBJECT) {
                        $.mainWin.fbProxy = Alloy.Globals.FACEBOOK.createActivityWorker({lifecycleContainer: $.mainWin});
                        var fb = Alloy.Globals.FACEBOOK;                        

                        fb.addEventListener('logout', function(e) {
                            Ti.API.log('steg 3');
                            // this never get's called, might be a bug
                        });
                        fb.logout();
                        Ti.App.Properties.removeProperty("BETKAMPEN");
                        Ti.App.Properties.removeProperty("favorite_team");

                        Alloy.Globals.BETKAMPEN = null;
                        Alloy.Globals.FACEBOOKOBJECT = null;
                        Alloy.Globals.FACEBOOK = null;
                        $.mainWin.close();
                        var activity = Titanium.Android.currentActivity;
                                                                     
                        // remove old event listeners
                        Ti.App.removeEventListener('paused', Alloy.Globals.androidPauseEvent);
                        Ti.App.removeEventListener('resumed', Alloy.Globals.androidResumeEvent);
                        Ti.App.removeEventListener('challengesViewRefresh', Alloy.Globals.challengesViewRefreshEvent);
                        Ti.App.removeEventListener('userInfoUpdate', Alloy.Globals.userInfoUpdateEvent);

                         activity.finish();   

                        // start app again
                        var intent = Ti.Android.createIntent({
                            action : Ti.Android.ACTION_MAIN,
                            url : 'Betbattle.js'
                        });
                        intent.addCategory(Ti.Android.CATEGORY_LAUNCHER);
                        Ti.Android.currentActivity.startActivity(intent);
                    } else {
                        // Betkampen logout
                        logoutBetbattle();
                    }
                    break;
                case 1:
                    alertWindow.hide();
                    break;
                }
            });
            alertWindow.show();
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionError);
        }
    }

    if (!isAndroid && e.row.customView === 'logout') {
        if (Alloy.Globals.checkConnection()) {
            var alertWindow = Titanium.UI.createAlertDialog({
                title : Alloy.Globals.PHRASES.betbattleTxt,
                message : Alloy.Globals.PHRASES.confirmLogoutDialogTxt,
                buttonNames : [Alloy.Globals.PHRASES.signOutTxt, Alloy.Globals.PHRASES.abortBtnTxt]
            });

            alertWindow.addEventListener('click', function(e) {
                switch (e.index) {
                case 0:
                    Ti.App.removeEventListener('pause', Alloy.Globals.iosPauseEvent);
                    Ti.App.removeEventListener('resume', Alloy.Globals.iosResumeEvent);
                    Ti.App.removeEventListener('challengesViewRefresh', Alloy.Globals.challengesViewRefreshEvent);
                    Ti.App.removeEventListener('userInfoUpdate', Alloy.Globals.userInfoUpdateEvent);
                    
                    var fb = Alloy.Globals.FACEBOOK;
                    if (fb) {
                        if (Alloy.Globals.CLOSE) {
                            // need to keep track if event was already added, since it is beeing added several times otherwise.
                            var logoutFunction = function(e){
                                fb.loggedIn = false;
   
                                alertWindow.hide();
                                Alloy.Globals.CLOSE = false;
                                Alloy.Globals.CURRENTVIEW = null;
                                Alloy.Globals.NAV.close();
                                Ti.App.Properties.removeProperty("BETKAMPEN");
                                Ti.App.Properties.removeProperty("favorite_team");
                                Alloy.Globals.BETKAMPEN = null;
                                Alloy.Globals.FACEBOOKOBJECT = null;
                                Alloy.Globals.FACEBOOK = null;
                                
                                var args = {reOpen : true};
                                
                                var login = Alloy.createController('login', args).getView();
                                login.open({
                                    modal : false
                                });
                                login = null; 
                            };
                            
                            fb.addEventListener('logout', logoutFunction);
                        }
                        fb.logout();

                    } else {
                        // Betkampen logout
                        logoutBetbattle();
                    }
                    break;
                case 1:
                    alertWindow.hide();
                    break;
                }
            });
            alertWindow.show();
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        }
    }

}

leftData[0] = createSection();

$.ds.leftTableView.backgroundColor = '#000';
$.ds.leftTableView.separatorColor = '#303030';

$.ds.leftTableView.footerView = Ti.UI.createView({
    top : 10,
    height : 0.5,
    width : Ti.UI.FILL,
    backgroundColor : '#303030'
});

$.ds.leftTableView.headerView = createMenuHeader();

if (!isAndroid) {
    $.ds.leftTableView.separatorStyle = Titanium.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE;
    $.ds.leftTableView.tableSeparatorInsets = {
        left : 0,
        right : 0
    };
    
    if (iOSVersion < 7) {
        $.ds.leftTableView.separatorStyle = Titanium.UI.iPhone.TableViewSeparatorStyle.NONE;
        $.ds.leftTableView.separatorColor = 'transparent';
    }
}

// Pass data to widget leftTableView
$.ds.leftTableView.data = leftData;

var argu = {
    refresh : refresher,
    sent_challenge : sent_challenge
};

// Swap views on menu item click
$.ds.leftTableView.addEventListener('click', function selectRow(e) {
    rowSelect(e);
    $.ds.toggleLeftSlider();
});

// Set row title highlight colour (left table view)
var storedRowTitle = null;
$.ds.leftTableView.addEventListener('touchstart', function(e) {
    if (storedRowTitle !== null && typeof storedRowTitle !== 'undefined') {
        storedRowTitle = e.row.customTitle;
        storedRowTitle.color = "#FFF";
    }
});
$.ds.leftTableView.addEventListener('touchend', function(e) {
    if (storedRowTitle !== null && typeof storedRowTitle !== 'undefined') {
        storedRowTitle.color = "#666";
    }
});
$.ds.leftTableView.addEventListener('scroll', function(e) {
    if (storedRowTitle != null && typeof storedRowTitle !== 'undefiend')
        storedRowTitle.color = "#666";
});

var sliderToggled = function(e) {
    if (e.direction == "right") {
        $.ds.leftMenu.zIndex = 2;
        $.ds.rightMenu.zIndex = 1;
        Alloy.Globals.SLIDERZINDEX = 2;
    } else if (e.direction == "left") {
        $.ds.leftMenu.zIndex = 1;
        $.ds.rightMenu.zIndex = 2;
    } 
};

Ti.App.addEventListener("sliderToggled", sliderToggled);

//check if user has rated app if not dialog shows up
function checkRatestatus() {
    var rate_status = 0;
    var now = new Date().getTime();
    var reminder = Ti.App.Properties.getString('Reminder');
    var xhr = Ti.Network.createHTTPClient({
        onload : function(e) {
            Ti.API.info("Received text: " + this.responseText);
            var status = JSON.parse(this.responseText);
            if (!reminder) {
                Ti.App.Properties.setString('Reminder', now);
            } else if (reminder < now) {
                if (status.data[0].rated == 0) {
                    var rateAlert = Ti.UI.createAlertDialog({
                        title : Alloy.Globals.PHRASES.betbattleTxt,
                        message : Alloy.Globals.PHRASES.rateMeTxt,
                        buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.remindMeTxt, Alloy.Globals.PHRASES.dontRemindMeTxt],
                        cancel : 2
                    });
                    rateAlert.addEventListener('click', function(e) {
                        switch(e.index) {
                        //Google play or app store opens and user gets coins + xp
                        case 0:
                            if (!isAndroid) {
                                Ti.Platform.openURL("http://itunes.apple.com/app/id884939881");
                            } else {
                                Ti.Platform.openURL("market://details?id=apps.topgame.betkampen");
                            }
                            rate_status = 2;
                            setRateStatus(rate_status);
                            //send uid and coins amount
                            Alloy.Globals.addBonusCoins(Alloy.Globals.BETKAMPENUID, 20);
                            //send uid and xp amount
                            Alloy.Globals.addExperience(Alloy.Globals.BETKAMPENUID, 50);
                            break;
                        case 1:
                            //user pick not now and the dialog will wait a week to be shown again
                            rate_status = 0;
                            setRateStatus(rate_status);
                            Ti.App.Properties.setString('Reminder', now + (7 * 24 * 60 * 60 * 1000));
                            break;
                        case 2:
                            //user pick never and is never asked again
                            rate_status = 1;
                            setRateStatus(rate_status);
                            break;
                        }
                    });
                    rateAlert.show();
                }
            }

        },
        // function called when an error occurs, including a timeout
        onerror : function(e) {
            Ti.API.debug(e.error);
            //alert('error');
        },
        timeout : Alloy.Globals.TIMEOUT // in milliseconds
    });
    // Prepare the connection.
    xhr.open('GET', Alloy.Globals.BETKAMPENCHECKRATESTATUS + '?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);

    xhr.setRequestHeader("content-type", "application/json");
    xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
    xhr.setTimeout(Alloy.Globals.TIMEOUT);

    xhr.send();
}

//set rated status to 0 if user wants to be reminded, 1 if user dont want to rate and 2 if user has rated
function setRateStatus(rate_status) {
    Ti.API.info(rate_status);
    var rateStatus = Ti.Network.createHTTPClient();
    rateStatus.open("POST", Alloy.Globals.BETKAMPENSETRATESTATUS);
    rateStatus.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
    var params = {
        uid : Alloy.Globals.BETKAMPENUID,
        rate_status : rate_status
    };
    rateStatus.send(params);
}

setTimeout(function() {
    Alloy.Globals.appStatus = 'foreground';
}, 1000);


$.mainWin.addEventListener('focus', function() {
	Alloy.Globals.showAndroidHome = true;
});
$.mainWin.addEventListener('blur', function() {
	Alloy.Globals.showAndroidHome = false;
});
