/* Functions */
var listener = function() {
	login();
};

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

	for (var i = 0; i < response.leagues.length; i++) {
		var league = {
			id : response.leagues[i].id,
			name : response.leagues[i].name,
			sport : response.leagues[i].sport,
			logo : response.leagues[i].logo,
			actvie : response.leagues[i].active
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
		addEvent();
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
					Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
				}

				// construct array with objects
				Alloy.Globals.CHALLENGEOBJECTARRAY = Alloy.Globals.constructChallenge(response);

				// login success
				var args = {
					dialog : indicator
				};

				var teamInfo = Ti.Network.createHTTPClient({
					onload : function(e) {
						Ti.API.info("Received text: " + this.responseText);
						var team = JSON.parse(this.responseText);
						if (team.data.length > 0) {

							var loginSuccessWindow = Alloy.createController('landingPage', args).getView();
							Alloy.Globals.CURRENTVIEW = loginSuccessWindow;
							if (OS_IOS) {
								loginSuccessWindow.open({
									fullScreen : true,
									transition : Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT
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

							if (OS_ANDROID) {
							//	var activity = Titanium.Android.currentActivity; // TODO
							//	activity.finish();
							}
						} else {
							var loginSuccessWindow = Alloy.createController('pickTeam', args).getView();
							Alloy.Globals.CURRENTVIEW = loginSuccessWindow;
							if (OS_IOS) {
								loginSuccessWindow.open({
									fullScreen : true,
									transition : Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT
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

							if (OS_ANDROID) {
							//	var activity = Titanium.Android.currentActivity;  // TODO
							//	activity.finish();
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
				teamInfo.open('GET', Alloy.Globals.BETKAMPENGETUSERTEAM + '?uid=' + Alloy.Globals.BETKAMPENUID +'&sid=1'+ '&lang=' + Alloy.Globals.LOCALE);

				teamInfo.setRequestHeader("content-type", "application/json");
				teamInfo.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
				teamInfo.setTimeout(Alloy.Globals.TIMEOUT);

				teamInfo.send();

			} else {
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
				indicator.closeIndicator();
				addEvent();
			}
		} else {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
			indicator.closeIndicator();
			addEvent();
			Ti.API.error("Error =>" + this.response);
		}
	};
}

function doError() {
	indicator.closeIndicator();
	addEvent();

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
	params = {
		access_token : fb.accessToken
	};
	fb.requestWithGraphPath('/me', params, 'GET', function(e) {
		if (e.success) {
			Alloy.Globals.FACEBOOK = fb;
			Alloy.Globals.BETKAMPEN = {
				token : fb.accessToken
			};
			var result = null;

			try {
				result = JSON.parse(e.result);
			} catch(Exception) {
				// catch em all here
				doError();
			}

			if (result !== null) {

				// create a model with the needed Facebook information, and store it global
				for (r in result) {
					if ( typeof result.r === 'undefined' || result.r === null) {
						if ( typeof result.location === 'undefined') {
							result.location = {
								name : '',
								id : ''
							};
						} else {
							result.r = '';
						}
					}
				}

				Alloy.Globals.FACEBOOKOBJECT = Alloy.createModel('facebook', {
					id : result.id,
					locale : result.locale,
					username : result.username,
					fullName : result.name,
					firstName : result.first_name,
					lastName : result.last_name,
					email : result.email
				});

				// Get betkampenID with valid facebook token
				var xhr = Titanium.Network.createHTTPClient();
				xhr.onerror = function(e) {
					Ti.API.error('Bad Sever =>' + e.error);
					indicator.closeIndicator();
					addEvent();
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

						} else {
							Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
							indicator.closeIndicator();
							addEvent();
						}
					} else {
						Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
						Ti.API.error("Error =>" + this.response);
						indicator.closeIndicator();
						addEvent();
					}
				};
			} else {
				doError();
			}

		} else if (e.error) {
			doError();
		}
	});

}

function login() {
	// check login
	if (Alloy.Globals.checkConnection()) {
		fb.authorize();
	} else {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
		//removeEvent();
		//addEvent();
	}
}

/* Initial */

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
	top : 200,
	text : Alloy.Globals.PHRASES.loadingTxt
});
/* Main Flow */

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

// app id and permission's
fb.appid = Ti.App.Properties.getString('ti.facebook.appid');

if (OS_IOS) {
    $.login.hideNavBar();
    
	fb.permissions = ['email'];
} else {
	fb.permissions = ['email'];
}
fb.forceDialogAuth = false;

Alloy.Globals.connect = true;
Ti.API.info(Alloy.Globals.connect);
if (Alloy.Globals.FBERROR) {
	// need to keep track if event was already added, since it is beeing added several times otherwise.
	fb.addEventListener('login', function(e) {
		if (Alloy.Globals.connect == true) {
			indicator.openIndicator();
		}
		Alloy.Globals.FBERROR = false;
		if (Alloy.Globals.connect == true) {
			if (e.success) {
				removeEvent();
				setTimeout(function() {
					loginAuthenticated(fb);
				}, 300);
			} else if (e.error) {
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.facebookAbortConnectionTxt);
				//addEvent();
				indicator.closeIndicator();
			} else if (e.cancelled) {
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.canceledTxt);
				indicator.closeIndicator();
				//addEvent();
			}
		}
	});
}

addEvent();
// Har satt Alloy.Globals.FBERROR till false för att inte öppna flera gånger, sätta till true vid error??
// TODO gick inte försöka igen efter Timeout vid login försök...
// TODO går inte att logga in, kan vara fb session som löpt up, sen går de inte försöka igen....
// set correct language phrase
$.facebookBtnText.text = Alloy.Globals.PHRASES.loginFacebookButtonTxt;


// try to get Betkampen token
Alloy.Globals.readToken();

// check login
if (Alloy.Globals.checkConnection()) {
	if (fb.loggedIn) {
	    
		removeEvent();
		if (OS_ANDROID) {
			$.login.addEventListener('open', function() {
				indicator.openIndicator();
			});

			setTimeout(function() {
				loginAuthenticated(fb);
				//fb.authorize();  TODO Issue with fb module?
			}, 300);

		} else if (OS_IOS) {
			setTimeout(function() {
				indicator.openIndicator();
				fb.authorize();
				//loginAuthenticated(fb); //TODO Issue with fb module?
			}, 300);
		}
	} else if (Alloy.Globals.BETKAMPEN) {
		Ti.API.log('aooomen!');
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
	}

	xhr.onload = function() {
		if (this.status == '200') {
			if (this.readyState == 4) {
				var response = null;
				try {
					response = JSON.parse(this.responseText);
				} catch(e) {
					indicator.closeIndicator();
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
			} else {
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
				indicator.closeIndicator();
				Ti.API.log("3");
			}
		} else {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
			Ti.API.error("Error =>" + this.response);
			indicator.closeIndicator();
			Ti.API.log("4");
		}
	};
}

function getTutorialImages(){
	var platform = "";
	if (Alloy.Globals.checkConnection()) {
		
		if(OS_IOS){
			platform = "iphone";
		}else if(OS_ANDROID){
			platform = "android";
		}
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onerror = function(e) {
			Ti.API.error('Bad Sever =>' + JSON.stringify(e));
			if (e.code == 401) {
				
			} else {
				
			}
		};
	
		try {
			xhr.open('POST', Alloy.Globals.BETKAMPENGETTUTORIALURL + "?lang=" + Alloy.Globals.LOCALE + '&platform=' + platform);
			xhr.setRequestHeader("content-type", "application/json");
			xhr.setTimeout(Alloy.Globals.TIMEOUT);
		
			xhr.send();
		} catch(e) {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.internetMayBeOffErrorTxt);
		}
	
		xhr.onload = function() {
			if (this.status == '200') {
				if (this.readyState == 4) {
					var response = null;
					try {
						response = JSON.parse(this.responseText);
					} catch(e) {
						
					}
	
					if (response !== null) {
						Ti.API.info("TUTORIAL BILD : " + JSON.stringify(response));
						for (var i in response){
							
							var view = Ti.UI.createView({
								height: Ti.UI.FILL,
								width: Ti.UI.FILL,
							});
							var imageUrl =  Alloy.Globals.BETKAMPENURL + '/tutorial/' + platform + '/' + Alloy.Globals.LOCALE + '/tut_' + response[i] + '.png';
							Ti.API.info("IMAGE URL " + imageUrl);
							var image = Ti.UI.createImageView({
								image :imageUrl,
								text : Ti.UI.FILL,
								text : Ti.UI.FILL, 
							});
							
							view.add(image);
							$.scrollableView.addView(view);
						}
					} else {
						
					}
				} else {
					
					
				}
			} else {
				
			}
		};
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
				} else {
					Ti.API.log(this.response);
				}
			} else {
				Ti.API.error("Error =>" + this.response);
				indicator.closeIndicator();
				refreshTry = 0;
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
			}
		};
	} else {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
	}
}

$.login.addEventListener('close', function() {
	indicator.closeIndicator();

	$.scrollableView.removeAllChildren();

	for (child in $.scrollableView.children) {
		$.scrollableView[child] = null;
	}

	children = null;
	$.scrollableView = null;

	$.destroy();
});

if (OS_ANDROID) {
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

// opening login view
$.loginBtn.addEventListener('click', function(e) {
	var loginWindow = Alloy.createController('loginView').getView();
	if (OS_IOS) {
		$.nav.openWindow(loginWindow);
	} else {
		loginWindow.open();
	}
	//$.login.close();
	Alloy.Globals.WINDOWS.push($.login);
});

//open registration view
$.registerBtn.addEventListener('click', function(e) {

	var regWindow = Alloy.createController('registrationView').getView();
	if (OS_IOS) {
		$.nav.openWindow(regWindow);
	} else {
		regWindow.open();
	}
	//$.login.close();
    Alloy.Globals.WINDOWS.push($.login);
});

$.registerBtnText.text = Alloy.Globals.PHRASES.registerTxt;
$.loginBtnText.text = Alloy.Globals.PHRASES.signInTxt;
// TODO in index getTutorialImages();