var refreshItem;
var deviceToken;

if(OS_IOS){
	// only iOS		
	$.mainWin.addEventListener('open', function(){
		var apns = require('lib/push_notifications_apns');
		apns.apns();
	}); 
	
} else if(OS_ANDROID) {

	var gcm = require('net.iamyellow.gcmjs');
	var pendingData = gcm.data;
	if (pendingData && pendingData !== null) {
		// if we're here is because user has clicked on the notification
		// and we set extras for the intent 
		// and the app WAS NOT running
		// (don't worry, we'll see more of this later)
		Ti.API.info('******* data (started) ' + JSON.stringify(pendingData));
	}

	gcm.registerForPushNotifications({
		success: function (ev) {
			// on successful registration
			// post to our server
			Alloy.Globals.postDeviceToken(ev.deviceToken);
			Ti.API.info('******* success, ' + ev.deviceToken);
		},
		error: function (ev) {
			// when an error occurs
			Ti.API.info('******* error, ' + ev.error);
		},
		callback: function (e) {
			// when a gcm notification is received WHEN the app IS IN FOREGROUND
			
			try{
				var alertWindow = Titanium.UI.createAlertDialog({
					title : e.title,
					message : e.message,
					buttonNames : ['OK']
				});

				alertWindow.addEventListener('click', function(e) {
					alertWindow.hide();
					Ti.App.fireEvent('challengesViewRefresh');
				});
				alertWindow.show();
			} catch(e){
				// something went wrong
				//> THIS should fail
			}
			
		},
		unregister: function (ev) {
			// on unregister 
			Ti.API.info('******* unregister, ' + ev.deviceToken);
		},
		data: function (data) {
			// if we're here is because user has clicked on the notification
			// and we set extras in the intent 
			// and the app WAS RUNNING (=> RESUMED)
			// (again don't worry, we'll see more of this later)
		
			try{
				Ti.App.fireEvent('challengesViewRefresh');
						
				var alertWindow = Titanium.UI.createAlertDialog({
					title : e.title,
					message : e.message,
					buttonNames : ['OK']
				});

				alertWindow.addEventListener('click', function(e) {
					alertWindow.hide();
				});
				alertWindow.show();
			} catch(e){
				// something went wrong
			}
		}
	});

	// in order to unregister:
	// require('net.iamyellow.gcmjs').unregister();

}

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

exitOnClose: true;

Alloy.Globals.MAINWIN = $.mainWin;

if(Alloy.Globals.INDEXWIN !== null){
	Alloy.Globals.INDEXWIN.close();
	Alloy.Globals.INDEXWIN = null;	
}

var args = arguments[0] || {};

var oldIndicator = args.dialog || null;

if(oldIndicator !== null){
	oldIndicator.closeIndicator();
	oldIndicator = null;
}

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

	

function createSection() {
	var section = Ti.UI.createTableViewSection();

	var args = {
		title : Alloy.Globals.PHRASES.challengesTxt,
		customView : 'challengesView',
		image : '/images/ikon_spelanasta.png'
	};
	
	section.add(Alloy.createController('menurow', args).getView());
	var args2 = {
		title : Alloy.Globals.PHRASES.createChallengeTxt,
		customView : 'newChallengeLeague',
		image : '/images/Skapa_Utmaning.png'
	};
	section.add(Alloy.createController('menurow', args2).getView());

	var args3 = {
		title : Alloy.Globals.PHRASES.myProfileTxt,
		customView : 'profile',
		image : '/images/Min_Profil.png'
	};
	section.add(Alloy.createController('menurow', args3).getView());

	var args4 = {
		title : Alloy.Globals.PHRASES.scoreboardTxt,
		customView : 'topplistan',
		image : "/images/Topplista.png"
	};
	section.add(Alloy.createController('menurow', args4).getView());
	
	var args5 = {
		title : Alloy.Globals.PHRASES.storeTxt,
		customView : 'store',
		image : '/images/Store.png'
	};
	section.add(Alloy.createController('menurow', args5).getView());

	var args6 = {
		title : Alloy.Globals.PHRASES.termsTxt,
		customView : 'terms',
		image : '/images/villkor.png'
	};
	section.add(Alloy.createController('menurow', args6).getView());
	
	var args7 = {
		title : Alloy.Globals.PHRASES.shareTxt,
		customView : 'friendZone',
		image : '/images/share.png'
	};
	section.add(Alloy.createController('menurow', args7).getView());

	var args8 = {
		title : Alloy.Globals.PHRASES.settingsTxt,
		customView : 'settings',
		image : '/images/settings.png'
	};
	section.add(Alloy.createController('menurow', args8).getView());

	var args9 = {
		title : Alloy.Globals.PHRASES.signOutTxt,
		customView : 'logout',
		image : '/images/Logga_Ut.png'
	};
	section.add(Alloy.createController('menurow', args9).getView());

	return section;
}

function rowSelect(e) {
	
	if(OS_IOS && e.row.customView !== 'challengesView' && e.row.customView !== 'logout'){	
		
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
			
	} else if(OS_ANDROID && e.row.customView !== 'challengesView' && e.row.customView !== 'logout'){
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

						fb.addEventListener('logout', function(e) {
							Ti.API.log('steg 3');
							// this never get's called, might be a bug
						});

						fb.logout();
						$.mainWin.close();
						var activity = Titanium.Android.currentActivity;
    					activity.finish();
    					
    					/*
    					// start app again
						var intent = Ti.Android.createIntent({
							action : Ti.Android.ACTION_MAIN,
							url : 'Betkampen.js'
						});
						intent.addCategory(Ti.Android.CATEGORY_LAUNCHER);
						Ti.Android.currentActivity.startActivity(intent);
    					*/
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
			
							if(Alloy.Globals.CLOSE){
								// need to keep track if event was already added, since it is beeing added several times otherwise.
								fb.addEventListener('logout', function(e) {
									alertWindow.hide();
									Alloy.Globals.CLOSE = false;
									Alloy.Globals.CURRENTVIEW  = null;
									Alloy.Globals.NAV.close();
				
									var login = Alloy.createController('login').getView();
									login.open({modal : false});
									login = null;
								});
							}
							fb.logout();
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
	height : 0.2,
	backgroundColor : '#303030'
});

if(OS_IOS){
	$.ds.leftTableView.separatorStyle = Titanium.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE;
	$.ds.leftTableView.separatorInsets = {left:0,right:0};
}

// Pass data to widget leftTableView 
$.ds.leftTableView.data = leftData;

var currentView = Alloy.createController('challengesView').getView();
$.ds.contentview.add(currentView);
Alloy.Globals.CURRENTVIEW = currentView;

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

	$.mainWin.setLeftNavButton(buttonBarMenu);
// TODO
/*
	$.mainWin.open({
		transition : Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT
	});
	*/
	//$.nav.open();
	
} else {
	Ti.Gesture.addEventListener('orientationchange', function(e) {
 		Ti.Android.currentActivity.setRequestedOrientation(Ti.Android.SCREEN_ORIENTATION_PORTRAIT);
    });
	
	$.mainWin.orientationModes = [Titanium.UI.PORTRAIT];	
	$.mainWin.addEventListener('open', function(){		
		 if (! $.mainWin.activity) {
            Ti.API.error("Can't access action bar on a lightweight window.");
        } else {
            actionBar = $.mainWin.activity.actionBar;
            if (actionBar) {
                actionBar.icon = "images/ButtonMenu.png";
                actionBar.title = Alloy.Globals.PHRASES.betbattleTxt;
                
                $.mainWin.activity.onCreateOptionsMenu = function(e) {
        			refreshItem = e.menu.add({
            			//title : "Refresh",
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
    			};
    			$.mainWin.activity.invalidateOptionsMenu();
                
                actionBar.onHomeIconItemSelected = function() {
					// show / hide slide menu
                    $.ds.toggleLeftSlider();
                };
            }
        }		
       	$.mainWin.open();
	});
}
