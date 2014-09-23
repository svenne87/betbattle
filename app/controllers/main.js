var refreshItem;

var winsLabel;
var coinsLabel;
var nameLabel;

checkRatestatus();
/* Used to update the menu and add a indicator for a new challenge */
Ti.App.addEventListener('app:updateMenu', function() {
	// rebuild table rows
	// Pass data to widget leftTableView 
	leftData[0] = createSection();
	$.ds.leftTableView.data = leftData;
	
	// set new profile name
	nameLabel.setText(Alloy.Globals.PROFILENAME);
});

/* Used to rebuild the android action bar menu, to indicate that a ticket is available */
Ti.App.addEventListener('app:rebuildAndroidMenu', function() {
	try {
		$.mainWin.activity.invalidateOptionsMenu();
	} catch(e){
		
	}
	// TODO Exception här? funkar ändå?
});

/* Used to update coins information */
Ti.App.addEventListener('app:coinsMenuInfo', function(data) {
	winsLabel.setText(data.totalPoints);
	coinsLabel.setText(data.totalCoins);
});


// update coins
Ti.App.addEventListener('updateCoins', function(coins) {
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
});

// used to navigate between views
Ti.App.addEventListener('app:updateView', function(obj){
	var currentView = Alloy.Globals.CURRENTVIEW;
	// attempt to clear memory
	$.ds.contentview.removeAllChildren();
	for(child in $.ds.contentview.children){
		$.ds.contentview[child] = null;
	}
				
	if(obj.arg !== null){
		currentView = Alloy.createController(obj.controller, obj.arg).getView();
	} else {
		currentView = Alloy.createController(obj.controller).getView();
	}
	
	$.ds.contentview.add(currentView);
	Alloy.Globals.CURRENTVIEW = currentView;	
});

/* Used to create the header view in menu */
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
		height: 100,
		width : 50,
		layout : 'horizontal'
	});
	
	var image;
	if (Alloy.Globals.FACEBOOKOBJECT) {
		image = 'https://graph.facebook.com/' + Alloy.Globals.FACEBOOKOBJECT.id + '/picture';
	} else {
		image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + Alloy.Globals.BETKAMPENUID + '.png';
	}

	var centerImageView = Ti.UI.createImageView({
		left : 10,
		top : 30,
		height : 40,
		width : 40,
		borderRadius : 20,
		image : image
	});
	
	centerImageView.addEventListener('error',function(e){
		// fallback for image
		centerImageView.image = '/images/no_pic.png';
	});

	leftViewPart.add(centerImageView);
	
	var profileName = Alloy.Globals.PROFILENAME;
	
	if(profileName.length > 16) {
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
		font : {
			fontSize : 14,
			fontFamily : 'Impact'
		},
		color : '#FFF',
		left : 0
	});
	
	profileViewRow.add(nameLabel);	
		
	leftViewPart.add(profileViewRow);
	
	var topPos = -15;
	var heightPos = 15;
	var borderLeftTop = 30;
	var borderRightTop = 48;
	if(OS_ANDROID) {topPos = 5; heightPos = 26; borderLeftTop = 18; borderRightTop = 47;}

	var coinsView = Ti.UI.createView({
		height : heightPos,
		left : 65,
		top : topPos,
		layout : 'horizontal'
	});

	coinsView.add(Ti.UI.createImageView({
		height : 15,
		width : 20,
		image : '/images/totalt_saldo.png'
	}));
	
	coinsLabel = Ti.UI.createLabel({
		text : Alloy.Globals.PHRASES.loadingTxt,
		font : {
			fontSize : 14,
			fontFamily : 'Impact'
		},
		color : '#FFF',
		left : 5
	});
	
	coinsView.add(coinsLabel);

	coinsView.add(Ti.UI.createImageView({
		left : 10,
		height : 15,
		width : 20,
		image : '/images/vinster_top.png'
	}));
	
	winsLabel = Ti.UI.createLabel({
		text : '',
		font : {
			fontSize : 14,
			fontFamily : 'Impact'
		},
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
		Alloy.Globals.CURRENTVIEW =  win;
		if (OS_IOS) {
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
		Alloy.Globals.CURRENTVIEW =  win;
		if (OS_IOS) {
			Alloy.Globals.NAV.openWindow(win, {
				animated : true
			});
		} else {
			win.open({
				fullScreen : true
			});
		}
	});
	
	userInfoView.add(leftViewPart);
	userInfoView.add(rightViewPart);

	return userInfoView;
}

exitOnClose: true;
Alloy.Globals.MAINWIN = $.mainWin;

if(Alloy.Globals.INDEXWIN !== null){
	Alloy.Globals.INDEXWIN.close();
	Alloy.Globals.INDEXWIN = null;	
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

$.mainWin.addEventListener('close', function(){
	indicator.closeIndicator();
});


var iOSVersion;

if(OS_IOS){
	iOSVersion = parseInt(Ti.Platform.version);
}


var leftData = [];

function logoutBetbattle(){
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
			var param = '{"access_token":"' + Alloy.Globals.BETKAMPEN.token + '", "refresh_token":"' + Alloy.Globals.BETKAMPEN.refresh_token + '", "lang":"' + Alloy.Globals.LOCALE +'"}';
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
					Alloy.Globals.BETKAMPEN = null;
					Alloy.Globals.FACEBOOKOBJECT = null;
					// close
					if(OS_ANDROID) {
						$.mainWin.close();
						var activity = Titanium.Android.currentActivity;
    					activity.finish();
    					
    					// start app again
						var intent = Ti.Android.createIntent({
							action : Ti.Android.ACTION_MAIN,
							url : 'Betkampen.js'
						});
						intent.addCategory(Ti.Android.CATEGORY_LAUNCHER);
						Ti.Android.currentActivity.startActivity(intent);
					} else if(OS_IOS) {
						Alloy.Globals.FBERROR = false;							
						Alloy.Globals.CURRENTVIEW  = null;
						Alloy.Globals.NAV.close();
				
						var login = Alloy.createController('login').getView();
						login.open({modal : false});
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
		customView : 'landingPage',
		image : '/images/home.png'
	};
	section.add(Alloy.createController('menurow', args).getView());
	
	var args1 = {
		title : Alloy.Globals.PHRASES.challengesTxt,
		customView : 'challengesView',
		image : '/images/ikon_spelanasta.png',
		rightIcon : ''
	};

	// Update menu with icon if there are new challenges
	if(Alloy.Globals.CHALLENGEOBJECTARRAY[0].length > 0) {
		args1.rightIcon = Alloy.Globals.CHALLENGEOBJECTARRAY[0].length;
	} 
	
	section.add(Alloy.createController('menurow', args1).getView());
	
	var args2 = {
		title : Alloy.Globals.PHRASES.createChallengeTxt,
		customView : 'newChallengeLeague',
		image : '/images/Skapa_Utmaning.png'
	};
	section.add(Alloy.createController('menurow', args2).getView());
/*
	var args3 = {
		title : Alloy.Globals.PHRASES.myProfileTxt,
		customView : 'profile',
		image : '/images/Min_Profil.png'
	};
	section.add(Alloy.createController('menurow', args3).getView());
*/
	var args4 = {
		title : Alloy.Globals.PHRASES.friendZoneTxt,
		customView : 'friendZone',
		image : "/images/friendzone.png"
	};
	section.add(Alloy.createController('menurow', args4).getView());
	
	var args5 = {
		title : Alloy.Globals.PHRASES.storeTxt,
		customView : 'store',
		image : '/images/Store.png'
	};
	section.add(Alloy.createController('menurow', args5).getView());

	var args6 = {
		title : Alloy.Globals.PHRASES.scoreboardTxt,
		customView : 'topplistan',
		image : '/images/Topplista.png'
	};
	section.add(Alloy.createController('menurow', args6).getView());
	
	var args7 = {
		title : Alloy.Globals.PHRASES.termsTxt,
		customView : 'terms',
		image : '/images/villkor.png'
	};
	section.add(Alloy.createController('menurow', args7).getView());
/*
	var args8 = {
		title : Alloy.Globals.PHRASES.settingsTxt,
		customView : 'settings',
		image : '/images/settings.png'
	};
	section.add(Alloy.createController('menurow', args8).getView());
*/
	var args9 = {
		title : Alloy.Globals.PHRASES.signOutTxt,
		customView : 'logout',
		image : '/images/Logga_Ut.png'
	};
	section.add(Alloy.createController('menurow', args9).getView());

	return section;
}

function rowSelect(e) {
	
	if(OS_IOS && e.row.customView !== 'challengesView' && e.row.customView !== 'logout'  && e.row.customView !== 'landingPage'){	
		
		if (Alloy.Globals.checkConnection()) {
			// open these in window
			var win =  Alloy.createController(e.row.customView).getView();
	
			if(e.row.customView === 'newChallengeLeague'){
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
			
	} else if(OS_ANDROID && e.row.customView !== 'challengesView' && e.row.customView !== 'logout'  && e.row.customView !== 'landingPage'){
		if (Alloy.Globals.checkConnection()) {
			// open these in window
			var win =  Alloy.createController(e.row.customView).getView();

			if(e.row.customView === 'newChallengeLeague'){
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
	
	if(e.row.customView === 'landingPage') {
		if(OS_IOS){
			Alloy.Globals.NAV.close();
			var args = {resume : false};
			var start = Alloy.createController('landingPage', args).getView();
			Alloy.Globals.CURRENTVIEW  = start;
			start.open({modal : false});
			start = null;
		} else if (OS_ANDROID){
			$.mainWin.close();
		}
	}
	

	if(OS_ANDROID && e.row.customView === 'logout'){
		if (Alloy.Globals.checkConnection()) {	
			var alertWindow = Titanium.UI.createAlertDialog({
				title : Alloy.Globals.PHRASES.betbattleTxt,
				message : Alloy.Globals.PHRASES.confirmLogoutDialogTxt,
				buttonNames : [Alloy.Globals.PHRASES.signOutTxt, Alloy.Globals.PHRASES.abortBtnTxt]
			});
			
			alertWindow.addEventListener('click', function(e) {
				switch (e.index) {
					case 0:						
						var fb = Alloy.Globals.FACEBOOK;
						if(fb){
							fb.addEventListener('logout', function(e) {
								Ti.API.log('steg 3');
								// this never get's called, might be a bug
							});
							fb.logout();
							Ti.App.Properties.removeProperty("BETKAMPEN");
							Alloy.Globals.BETKAMPEN = null;
							Alloy.Globals.FACEBOOKOBJECT = null;
							Alloy.Globals.FACEBOOK = null;
							$.mainWin.close();
							var activity = Titanium.Android.currentActivity;
    						activity.finish();
    					
    						// start app again
							var intent = Ti.Android.createIntent({
								action : Ti.Android.ACTION_MAIN,
								url : 'Betkampen.js'
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
	
	if(OS_IOS && e.row.customView === 'logout'){
		if (Alloy.Globals.checkConnection()) {
			var alertWindow = Titanium.UI.createAlertDialog({
					title : Alloy.Globals.PHRASES.betbattleTxt,
					message : Alloy.Globals.PHRASES.confirmLogoutDialogTxt,
					buttonNames : [Alloy.Globals.PHRASES.signOutTxt, Alloy.Globals.PHRASES.abortBtnTxt]
				});

				alertWindow.addEventListener('click', function(e) {
					switch (e.index) {
						case 0:						
							var fb = Alloy.Globals.FACEBOOK;
							if(fb) {
								if(Alloy.Globals.CLOSE){
									// need to keep track if event was already added, since it is beeing added several times otherwise.
									fb.addEventListener('logout', function(e) {
										alertWindow.hide();
										Alloy.Globals.CLOSE = false;
										Alloy.Globals.CURRENTVIEW  = null;
										Alloy.Globals.NAV.close();
										Ti.App.Properties.removeProperty("BETKAMPEN");
										Alloy.Globals.BETKAMPEN = null;
										Alloy.Globals.FACEBOOKOBJECT = null;
										Alloy.Globals.FACEBOOK = null;
				
										var login = Alloy.createController('login').getView();
										login.open({modal : false});
										login = null;
									});
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

if(OS_IOS){
	$.ds.leftTableView.separatorStyle = Titanium.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE;
	$.ds.leftTableView.separatorInsets = {left:0,right:0};
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
	if(storedRowTitle !== null && typeof storedRowTitle !== 'undefined'){
		storedRowTitle = e.row.customTitle;
		storedRowTitle.color = "#FFF";
	}
});
$.ds.leftTableView.addEventListener('touchend', function(e) {
	if(storedRowTitle !== null && typeof storedRowTitle !== 'undefined'){
		storedRowTitle.color = "#666";
	}
});
$.ds.leftTableView.addEventListener('scroll', function(e) {
	if (storedRowTitle != null && typeof storedRowTitle !== 'undefiend')
		storedRowTitle.color = "#666";
});

Ti.App.addEventListener("sliderToggled", function(e) {
	if (e.direction == "right") {
		$.ds.leftMenu.zIndex = 2;
		$.ds.rightMenu.zIndex = 1;
		Alloy.Globals.SLIDERZINDEX = 2;
	} else if (e.direction == "left") {
		$.ds.leftMenu.zIndex = 1;
		$.ds.rightMenu.zIndex = 2;
	}
});

if (OS_IOS){
	Alloy.Globals.NAV = $.nav;
	
	var labelsMenu = [{ image : '/images/ButtonMenu.png'}];
	
	var buttonBarMenu = Titanium.UI.createButtonBar({
    	labels : labelsMenu,
    	top : 50,
    	style : Titanium.UI.iPhone.SystemButtonStyle.BAR,
   	 	height : 25,
    	width : Ti.UI.SIZE,
    	borderColor : 'transparent',
    	backgroundColor : 'transparent'
	});
	
	buttonBarMenu.addEventListener('click', function(){
		// show / hide slide menu
   		$.ds.toggleLeftSlider();
	});
	
	var fontawesome = require('lib/IconicFont').IconicFont({
		font : 'lib/FontAwesome'
	});

	var font = 'FontAwesome';
	
	if(iOSVersion < 7){
		$.mainWin.titleControl = Ti.UI.createLabel({
    	text : 'Betkampen',
    	font : {
        	fontSize : Alloy.Globals.getFontSize(2),
       	 	fontWeight : 'bold',
        	fontFamily : Alloy.Globals.getFont()
    	},
    		color : 'white'
		});
	} else {
		$.nav.add($.UI.create('ImageView', {
			classes : ['navLogo']
		}));
	}
	var btn = Ti.UI.createView({
		width: 50,
		height: 50,
		right: 15,
		top:5,
		id: "ticketView"
	});
	
	var ticketBtn = Ti.UI.createLabel({	
		font:{
			fontFamily: font,
			fontSize: 30,
		},
		text: fontawesome.icon("fa-ticket"),
		//backgroundImage: "/images/ticketBtn.png",
		color: "#303030",
		width: 'auto',
		height: 'auto',
		id:"label",
		right: 15,
		top: 15,
	});

	btn.add(ticketBtn);
	var badge = Ti.UI.createLabel({
		width: 15,
		height: 15,
		borderRadius: 7,
		//text: 1,
		right: 5,
		id: "badge",
		textAlign: "center",
		font: {
			fontSize: 10,
			fontFamily: "Impact",
		},
		backgroundColor: "transparent",
		borderColor: "transparent",
		borderWidth: 1,	
	});
	btn.add(badge);
	var couponOpen = false;
	//Add event listener to ticket button
	btn.addEventListener("click", function(){
		if(couponOpen) return;
		if(Alloy.Globals.hasCoupon){
			couponOpen = true;
			var win = Alloy.createController('showCoupon').getView();
			win.addEventListener('close', function(){
				win = null;
				couponOpen = false;	
			});
			
			Alloy.Globals.NAV.openWindow(win, {
				animated : true
			});
			win = null;
		}
	});
	
	$.mainWin.setLeftNavButton(buttonBarMenu);
	
	$.nav.add(btn);
	
	var currentView = Alloy.createController('challengesView', argu).getView();
	$.ds.contentview.add(currentView);
	Alloy.Globals.CURRENTVIEW = currentView;	
	
	if(oldIndicator !== null){
		oldIndicator.closeIndicator();
		oldIndicator = null;
	}
	
} else {
	Ti.Gesture.addEventListener('orientationchange', function(e) {
 		Ti.Android.currentActivity.setRequestedOrientation(Ti.Android.SCREEN_ORIENTATION_PORTRAIT);
    });
	
	$.mainWin.orientationModes = [Titanium.UI.PORTRAIT];	
	$.mainWin.addEventListener('open', function(){	
		var loadingLabel = Ti.UI.createLabel({
        	top : 50,
        	height : Ti.UI.SIZE,
        	width : Ti.UI.SIZE,
        	color : '#FFF',
        	font : {
				fontSize : 19,
				fontFamily : "Impact"
			},
			text : Alloy.Globals.PHRASES.loadingTxt
        });
        $.ds.contentview.add(loadingLabel);
		
		 if (! $.mainWin.activity) {
            Ti.API.error("Can't access action bar on a lightweight window.");
        } else {
            actionBar = $.mainWin.activity.actionBar;
            
            if (actionBar) {
                actionBar.icon = "images/ButtonMenu.png";
                actionBar.title = Alloy.Globals.PHRASES.betbattleTxt;
                
                $.mainWin.activity.onCreateOptionsMenu = function(e) {
        			
        			ticket = e.menu.add(ticketIcon = {
        				showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
        				icon: 'images/ticketBtn.png',
        				itemId : 1
        			});

        			refreshItem = e.menu.add({
            			showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
            			icon : 'images/ic_action_refresh.png'
        			});
  
       			 	refreshItem.addEventListener("click", function(e){
       			 		// update the correct view
       			 		switch(Alloy.Globals.CURRENTVIEW.id){
       			 			case 'challengesView':
       			 				Ti.App.fireEvent('challengesViewRefresh');
       			 				break;
       			 			case 'groupSelect':
       			 				Ti.App.fireEvent('groupSelectRefresh');
       			 				break;
       			 			case 'newChallenge':
       			 				Ti.App.fireEvent('newChallengeRefresh');
       			 				break;
       			 		}       			 		
    			 		
       				});
       				
       				var couponOpen = false;
       				//Add event listener to ticket button
					ticket.addEventListener("click", function(){
						if(couponOpen) return;
						if(Alloy.Globals.hasCoupon){
							couponOpen = true;
							var win = Alloy.createController('showCoupon').getView();
							win.addEventListener('close', function(){
								win = null;
								couponOpen = false;	
							});
							win.open({
								fullScreen : true
							});
							win = null;
						}
					});
    			};
    			
    			$.mainWin.activity.onPrepareOptionsMenu = function(e) {
    				var menu = e.menu;
    				
    				if(Alloy.Globals.hasCoupon){
    					menu.findItem(1).setIcon('images/ticketBtnRed.png');
    				} else {
    					menu.findItem(1).setIcon('images/ticketBtn.png');
    				}

    			};
   
    			$.mainWin.activity.invalidateOptionsMenu();
    			
    			// set onResume for each activity in order to keep them updated with correct coupon
				$.mainWin.activity.addEventListener("resume", function() {
					// will rebuild menu and keep coupon up to date
					$.mainWin.activity.invalidateOptionsMenu();
				});
                
                actionBar.onHomeIconItemSelected = function() {
					// show / hide slide menu
                    $.ds.toggleLeftSlider();
                };
            }
        }	
        		
		if(oldIndicator !== null){
			oldIndicator.closeIndicator();
			oldIndicator = null;
		}
        
        var currentView = Alloy.createController('challengesView', argu).getView();
		$.ds.contentview.add(currentView);
		Alloy.Globals.CURRENTVIEW = currentView;
		$.ds.contentview.remove(loadingLabel);
	});
}

//check if user has rated app if not dialog shows up
function checkRatestatus() {
	var rate_status = 0;
	var xhr = Ti.Network.createHTTPClient({
		onload : function(e) {
			Ti.API.info("Received text: " + this.responseText);
			var status = JSON.parse(this.responseText);
			numba = status.data[0].visit_count;
			var even;
			if (numba & 1) {
				even = false;
			} else {
				even = true;
			}
			if (status.data[0].rated == 0) {
				if (even) {
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
							if (OS_IOS) {
								Ti.Platform.openURL("http://itunes.apple.com/app/id884939881");
							} else if (OS_ANDROID) {
								Ti.Platform.openURL("market://details?id=apps.topgame.betkampen");
							}
							rate_status = 2;
							setRateStatus(rate_status);
							Alloy.Globals.addBonusCoins(Alloy.Globals.BETKAMPENUID, 20);
							Alloy.Globals.addExperience(Alloy.Globals.BETKAMPENUID, 50);
							break;
						case 1:
						//user pick not now and the dialog wait 2 days to be shown again
							rate_status = 0;
							setRateStatus(rate_status);
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
	var params = {
		uid : Alloy.Globals.BETKAMPENUID,
		rate_status : rate_status
	};
	rateStatus.send(params);
}