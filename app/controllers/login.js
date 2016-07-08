/* Functions */
var listener = function() {
	login();
};

function setButtonOpacity(value) {
	$.loginBtn.setOpacity(value);
	$.facebookBtn.setOpacity(value);
	$.registerBtn.setOpacity(value);
}

function removeEvent() {
	$.facebookBtn.removeEventListener('click', listener);
}

function addEvent() {
	$.facebookBtn.addEventListener('click', listener);
}

function createLeagueAndUidObj(response) {
	Ti.API.log(JSON.stringify(response));
	Alloy.Globals.BETKAMPENUID = response.betkampen_uid;
	Alloy.Globals.PROFILENAME = response.profile_name;
	Alloy.Globals.LEAGUES = [];
	Alloy.Globals.AVAILABLELANGUAGES = [];
	Alloy.Globals.VERSIONS = response.versions;
	Alloy.Globals.SETTINGS = response.settings;
	user_team = response.user_team;

	for (var i = 0; i < response.all_leagues.length; i++) {
		var league = {
			id : response.all_leagues[i].id,
			name : response.all_leagues[i].name,
			sport : response.all_leagues[i].sport,
			logo : response.all_leagues[i].logo,
			active : response.all_leagues[i].active,
			sport_name : response.all_leagues[i].sport_name,
			sort_order : response.all_leagues[i].sort_order
		};
		// store all active leagues
		Alloy.Globals.LEAGUES.push(league);
	}
	for (var i = 0; response.languages.length > i; i++) {
		var language = {
			id : response.languages[i].id,
			name : response.languages[i].name,
			imageLocation : response.languages[i].imageLocation,
			description : response.languages[i].description
		};
		Alloy.Globals.AVAILABLELANGUAGES.push(language);
	}
}

function getChallengesAndStart() {
	// Get challenges
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onerror = function(e) {
		Ti.API.error('Bad Sever =>' + e.error);
		indicator.closeIndicator();
		setButtonOpacity(1);
		addEvent();
		isSubmitting = false;
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
	};

	try {
		xhr.open('GET', Alloy.Globals.BETKAMPENCHALLENGESURL + '/?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
		xhr.setRequestHeader("content-type", "application/json");
		xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
		xhr.setTimeout(Alloy.Globals.TIMEOUT);
		Ti.API.log(Alloy.Globals.BETKAMPEN.token);

		xhr.send();
	} catch(e) {
		Ti.API.error('Bad Sever =>' + e.error);
		indicator.closeIndicator();
		addEvent();
		isSubmitting = false;
		setButtonOpacity(1);
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
	}
	xhr.onload = function() {
		if (this.status == '200') {
			if (this.readyState == 4) {
				var response = null;

				try {
					response = JSON.parse(this.responseText);
				} catch(e) {
					indicator.closeIndicator();
					addEvent();
					setButtonOpacity(1);
					isSubmitting = false;
					Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
				}

				// construct array with objects
				Alloy.Globals.CHALLENGEOBJECTARRAY = Alloy.Globals.constructChallenge(response);

				// login success
				var args = {
					dialog : indicator
				};

				if (!isAndroid) {
					$.nav.close();
				}

				//if (user_team.data.length > 0) {

				// keep landing page in memory
				var tmp = Alloy.createController('landingPage', args).getView();

				// open main
				var loginSuccessWindow = Alloy.createController('main', args).getView();
				// Alloy.Globals.CURRENTVIEW = loginSuccessWindow;
				// Alloy.Globals.CURRENTVIEW.hide();

				if (OS_IOS) {
					loginSuccessWindow.open({
						fullScreen : true
					});

					loginSuccessWindow = null;

				} else if (OS_ANDROID) {
					// exitOnClose was false before
					loginSuccessWindow.open({
						fullScreen : true,
						exitOnClose : true,
						orientationModes : [Titanium.UI.PORTRAIT]
					});
					loginSuccessWindow = null;
				}

				addEvent();

				$.login.close();

				if (Alloy.Globals.INDEXWIN !== null) {
					Alloy.Globals.INDEXWIN.close();
				}

				//  } else {
				/*
				var loginSuccessWindow = Alloy.createController('pickTeam', args).getView();
				Alloy.Globals.CURRENTVIEW = loginSuccessWindow;
				if (OS_IOS) {
				loginSuccessWindow.open({
				fullScreen : true
				});
				loginSuccessWindow = null;

				} else if (OS_ANDROID) {
				loginSuccessWindow.open({
				fullScreen : true,
				orientationModes : [Titanium.UI.PORTRAIT]
				});
				loginSuccessWindow = null;
				}

				addEvent();
				$.login.close();

				if (Alloy.Globals.INDEXWIN !== null) {
				Alloy.Globals.INDEXWIN.close();
				}
				*/
				// }
			} else {
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
				indicator.closeIndicator();
				addEvent();
				setButtonOpacity(1);
				isSubmitting = false;
			}
		} else {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
			indicator.closeIndicator();
			addEvent();
			isSubmitting = false;
			setButtonOpacity(1);
			Ti.API.error("Error =>" + this.response);
		}
	};
}

function doError() {
	indicator.closeIndicator();
	addEvent();
	isSubmitting = false;
	setButtonOpacity(1);

	var alertWindow = Titanium.UI.createAlertDialog({
		title : Alloy.Globals.PHRASES.commonErrorTxt,
		message : Alloy.Globals.PHRASES.facebookConnectionErrorTxt + ' ' + Alloy.Globals.PHRASES.retryTxt,
		buttonNames : [Alloy.Globals.PHRASES.retryBtnTxt, Alloy.Globals.PHRASES.closeBtnTxt]
	});

	alertWindow.addEventListener('click', function(e) {
		switch (e.index) {
		case 0:
			alertWindow.hide();
			indicator.openIndicator();
			loginAuthenticated(fb);
			break;
		case 1:
			alertWindow.hide();

			/*
			 if (OS_ANDROID) {
			 var activity = Titanium.Android.currentActivity;
			 activity.finish();
			 $.login.close();
			 }
			 */
			break;
		}
	});
	alertWindow.show();
}

function loginAuthenticated(fb) {
	// Get betkampenID with valid facebook token
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onerror = function(e) {
		Ti.API.error('Bad Sever =>' + e.error);
		indicator.closeIndicator();
		addEvent();
		isSubmitting = false;
		setButtonOpacity(1);
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
	};

	try {
		xhr.open('POST', Alloy.Globals.BETKAMPENLOGINURL);
		xhr.setRequestHeader("content-type", "application/json");
		xhr.setTimeout(Alloy.Globals.TIMEOUT);
		var param = '{"access_token" : "' + fb.accessToken + '", "lang":"' + Alloy.Globals.LOCALE + '"}';
		xhr.send(param);
	} catch(e) {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.internetMayBeOffErrorTxt);
		indicator.closeIndicator();
		addEvent();
		isSubmitting = false;
		setButtonOpacity(1);
	}

	xhr.onload = function() {
		if (this.status == '200') {
			if (this.readyState == 4) {
				var response = null;

				try {
					response = JSON.parse(this.responseText);
				} catch(e) {
					indicator.closeIndicator();
					addEvent();
				}

				if (response !== null) {
					createLeagueAndUidObj(response);

					if (Alloy.Globals.BETKAMPENUID > 0) {
						getChallengesAndStart();
					}
				} else {
					Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
					indicator.closeIndicator();
					addEvent();
				}
			}
		} else {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
			Ti.API.error("Error =>" + this.response);
			indicator.closeIndicator();
			addEvent();
			isSubmitting = false;
			setButtonOpacity(1);
		}
	};
}

function login() {
	Ti.API.log("Facebook login click...");

	if (isSubmitting) {
		return;
	}

	// check login
	if (Alloy.Globals.checkConnection()) {
		isSubmitting = true;
		// setButtonOpacity(0);
		if (!args.reauth) {
			fb.logout();
			// Added to see if it will reinitiate correct at error's (will mess with ios)
			fb.authorize();
			isSubmitting = false;
			// ios fix so we can login after restart...
			setButtonOpacity(0);
		} else {
			setButtonOpacity(0);
			removeEvent();
			indicator.openIndicator();
			if (!fb.loggedIn) {
				fb.authorize();
			} else {
				loginAuthenticated(fb);
			}
		}
	} else {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
		//removeEvent();
		//addEvent();
	}
}

/* Initial */
var args = arguments[0] || {};
var user_team;
var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
	top : 200,
	text : Alloy.Globals.PHRASES.loadingTxt
});

var isSubmitting = false;
/* Main Flow */
$.loginBtn.setBackgroundColor(Alloy.Globals.themeColor());
$.registerBtn.setBackgroundColor(Alloy.Globals.themeColor());
addTutorial();

// add facebook icon to the "login with facebook button"
var fontawesome = require('lib/IconicFont').IconicFont({
	font : 'lib/FontAwesome'
});

var font = 'FontAwesome';

if (OS_ANDROID) {
	font = 'fontawesome-webfont';
}

$.facebookBtn.add(Ti.UI.createLabel({
	font : {
		fontFamily : font
	},
	text : fontawesome.icon('fa-facebook'),
	left : '10%',
	color : '#FFF',
	fontSize : 40
}));

var fb = require('facebook');
var isAndroid;

var reOpen = false;
var args = arguments[0] || {};

if (args.reOpen) {
	reOpen = args.reOpen;
}

var added = false;

if (OS_IOS) {
	isAndroid = false;
	$.login.hideNavBar();
	fb.permissions = ['email', 'public_profile'];
} else {
	isAndroid = true;

	$.login.fbProxy = fb.createActivityWorker({
		lifecycleContainer : $.login
	});
	fb.permissions = ['email', 'public_profile'];
}

// permission = user_games_activity

/* This should not be needed... */
fb.appid = '1403709019858016';
/* - - - - - */

if (!isAndroid) {
	fb.setLoginBehavior(fb.LOGIN_BEHAVIOR_NATIVE);
}
fb.forceDialogAuth = false;
Alloy.Globals.connect = true;

Ti.API.log("Försöker iaf 1..." + fb.loggedIn);

// need to keep track if event was already added, since it is beeing added several times otherwise.

var fbLoginEvent = function(e) {
	Ti.API.log("Försöker iaf 11...");
	if (added) {
		return;
	}
	added = true;

	isSubmitting = true;
	setButtonOpacity(0);
	Ti.API.log("Försöker iaf 111...");

	if (Alloy.Globals.connect == true) {
		indicator.openIndicator();
	}

	if (Alloy.Globals.connect == true) {
		if (e.success) {
			e.data = JSON.parse(e.data);

			Alloy.Globals.FACEBOOK = fb;

			Alloy.Globals.BETKAMPEN = {
				token : fb.accessToken
			};

			Alloy.Globals.FACEBOOKOBJECT = Alloy.createModel('facebook', {
				id : e.uid,
				locale : e.data.locale,
				username : e.data.name,
				fullName : e.data.name,
				firstName : e.data.first_name,
				lastName : e.data.last_name,
				email : e.data.email
			});

			removeEvent();
			setTimeout(function() {
				loginAuthenticated(fb);
			}, 300);
		} else if (e.error) {
			isSubmitting = false;
			setButtonOpacity(1);
			indicator.closeIndicator();

			if (!isAndroid) {
				if (e.error.indexOf('OTHER:') !== 0) {
					Alloy.Globals.showFeedbackDialog(e.error);
				} else {
					Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.facebookAbortConnectionTxt);
				}
			} else {
				Alloy.Globals.showFeedbackDialog(e.error);
			}
			added = false;
			addEvent();
			// need to add it here??????
		} else if (e.cancelled) {
			isSubmitting = false;
			setButtonOpacity(1);
			indicator.closeIndicator();
			//addEvent();
		}
	}
};

fb.addEventListener('login', fbLoginEvent);

if (!isAndroid) {
	// check boolean and if this is a restart
	var restart = false;
	var fbLogin = false;

	if (Ti.App.Properties.hasProperty("restart")) {
		restart = Ti.App.Properties.getBool("restart");
	}

	if (Ti.App.Properties.hasProperty("facebook")) {
		fbLogin = Ti.App.Properties.getBool("facebook");
	}

	if (restart && fbLogin) {
		Ti.API.log("This is a restart");
		fb.authorize();
		// This is needed for our restart function on ios, but will not work on android
		// reset
		Ti.App.Properties.setBool("restart", false);
		Ti.App.Properties.setBool("facebook", false);
	}
}

addEvent();

if (isAndroid) {
	// TODO ERROR fb.initialize causes the app to load twice... here aswell??
	fb.initialize(5000);
} else {
	if (!reOpen) {
		// TODO ERROR fb.initialize causes the app to load twice...
		fb.initialize();
		// , false
	}
}

// set correct language phrase
$.facebookBtn.title = Alloy.Globals.PHRASES.loginFacebookButtonTxt + ' ';

// try to get Betkampen token
Alloy.Globals.readToken();

// check login
if (Alloy.Globals.checkConnection()) {
	if (fb.loggedIn) {
		isSubmitting = true;
		setButtonOpacity(0);
		removeEvent();
		if (OS_ANDROID) {
			$.login.addEventListener('open', function() {
				indicator.openIndicator();
			});

			setTimeout(function() {
				//  loginAuthenticated(fb);
				fb.authorize();
				//  TODO Issue with fb module?
			}, 300);
		} else if (OS_IOS) {
			if (!args.reauth) {
				setTimeout(function() {
					indicator.openIndicator();
					//  fb.authorize();
					//loginAuthenticated(fb); //TODO Issue with fb module?
				}, 300);
			} else {
				addEvent();
			}
		}
	} else if (Alloy.Globals.BETKAMPEN) {
		setButtonOpacity(0);
		isSubmitting = true;
		// Betkampen auto sign in
		indicator.openIndicator();
		loginBetkampenAuthenticated();
	}
} else {
	Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
}

/* Only used for Betkampen token sign in! */
var refreshTry = 0;

function loginBetkampenAuthenticated() {
	// Get betkampenID with valid token
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onerror = function(e) {
		Ti.API.error('Bad Sever =>' + JSON.stringify(e));
		if (e.code == 401) {
			// if this is first try, then try refresh token
			if (refreshTry === 0) {
				refreshTry = 1;
				authWithRefreshToken();
			}
		} else {
			isSubmitting = false;
			setButtonOpacity(1);
			indicator.closeIndicator();
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
		}
	};

	try {
		xhr.open('POST', Alloy.Globals.BETKAMPENLOGINURL);
		xhr.setRequestHeader("content-type", "application/json");
		xhr.setTimeout(Alloy.Globals.TIMEOUT);
		var param = '{"access_token" : "' + Alloy.Globals.BETKAMPEN.token + '", "lang":"' + Alloy.Globals.LOCALE + '"}';
		xhr.send(param);
	} catch(e) {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.internetMayBeOffErrorTxt);
		indicator.closeIndicator();
		isSubmitting = false;
		setButtonOpacity(1);
	}

	xhr.onload = function() {
		if (this.status == '200') {
			if (this.readyState == 4) {
				var response = null;
				try {
					response = JSON.parse(this.responseText);
				} catch(e) {
					indicator.closeIndicator();
					setButtonOpacity(1);
					isSubmitting = false;
					Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
				}

				if (response !== null) {
					createLeagueAndUidObj(response);

					if (Alloy.Globals.BETKAMPENUID > 0) {
						getChallengesAndStart();
					}
				} else {
					indicator.closeIndicator();
					Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.loginCredentialsError);
				}
			}
		} else {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
			Ti.API.error("Error =>" + this.response);
			indicator.closeIndicator();
			isSubmitting = false;
			setButtonOpacity(1);
		}
	};
}

function addTutorial() {
	// TODO should there be several webviews for each language/platform? (or just one as now)

	if (Alloy.Globals.checkConnection()) {
		var platform = 'android';

		if (OS_IOS) {
			platform = 'iphone';
		}

		var extwebview = Titanium.UI.createWebView({
			top : 0,
			left : 0,
			right : 0,
			url : Alloy.Globals.BETKAMPENGETTUTORIALURL + '?platform=' + platform + '&lang=' + Alloy.Globals.LOCALE,
			height : Ti.UI.FILL,
			width : Ti.UI.FILL,
			backgroundColor : '#FFF',
			hideLoadIndicator : true
		});

		extwebview.addEventListener('beforeload', function() {
			indicator.openIndicator();
		});

		extwebview.addEventListener('load', function() {
			indicator.closeIndicator();
		});

		$.scrollableView.addView(extwebview);
	}
}

// Try to authenticate using refresh token
function authWithRefreshToken() {
	if (Alloy.Globals.checkConnection()) {
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onerror = function(e) {
			Ti.API.error('Bad Sever reAuth =>' + JSON.stringify(e));
			indicator.closeIndicator();
			refreshTry = 0;
			isSubmitting = false;
			setButtonOpacity(1);
			// reAuth failed. Need to login again. 400 = invalid token
			Alloy.Globals.BETKAMPEN = null;
			if (e.code != 400) {
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
			}
		};
		try {
			xhr.open('POST', Alloy.Globals.BETKAMPENEMAILLOGIN);
			xhr.setTimeout(Alloy.Globals.TIMEOUT);

			var params = {
				grant_type : 'refresh_token',
				refresh_token : Alloy.Globals.BETKAMPEN.refresh_token,
				client_id : 'betkampen_mobile',
				client_secret : 'not_so_s3cr3t'
			};
			xhr.send(params);
		} catch(e) {
			indicator.closeIndicator();
			refreshTry = 0;
			isSubmitting = false;
			setButtonOpacity(1);
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

					Alloy.Globals.BETKAMPEN = {
						token : "TOKEN " + response.access_token,
						valid : response.expires_in,
						refresh_token : Alloy.Globals.BETKAMPEN.refresh_token // since we don't get a new one here
					};
					Alloy.Globals.storeToken();
					// brand new token, try to authenticate
					loginBetkampenAuthenticated();
				}
			} else {
				Ti.API.error("Error =>" + this.response);
				indicator.closeIndicator();
				refreshTry = 0;
				isSubmitting = false;
				setButtonOpacity(1);
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
			}
		};
	} else {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
	}
}

$.scrollableView.addEventListener('close', function() {
	indicator.closeIndicator();
});

$.login.addEventListener('close', function() {
	indicator.closeIndicator();

	$.scrollableView.removeAllChildren();

	for (child in $.scrollableView.children) {
		$.scrollableView[child] = null;
	}
	removeEvent();
	children = null;
	$.scrollableView = null;
	fb.removeEventListener('login', fbLoginEvent);
	fb = null;
	$.login = null;
	$.destroy();
});

if (isAndroid) {
	$.login.addEventListener('open', function() {
		$.login.activity.actionBar.hide();
	});

	$.login.addEventListener('android:back', function() {
		$.login.close();
		var activity = Titanium.Android.currentActivity;
		activity.finish();
	});
}

//----------------- email login
if (!isAndroid) {
	Alloy.Globals.NAV = $.nav;
}

// opening login view
$.loginBtn.addEventListener('click', function(e) {

	if (isSubmitting) {
		return;
	}

	var loginWindow = Alloy.createController('loginView').getView();
	if (OS_IOS) {
		$.nav.openWindow(loginWindow);
		Alloy.Globals.WINDOWS.push($.nav);
	} else {
		loginWindow.open();
	}
	//$.login.close();
	Alloy.Globals.WINDOWS.push($.login);
});

//open registration view
$.registerBtn.addEventListener('click', function(e) {
	if (isSubmitting) {
		return;
	}

	var regWindow = Alloy.createController('registrationView').getView();
	if (OS_IOS) {
		$.nav.openWindow(regWindow);
		Alloy.Globals.WINDOWS.push($.nav);
	} else {
		regWindow.open();
	}
	//$.login.close();
	Alloy.Globals.WINDOWS.push($.login);
});

$.registerBtn.title = Alloy.Globals.PHRASES.registerTxt + ' ';
$.loginBtn.title = Alloy.Globals.PHRASES.signInTxt + ' ';
