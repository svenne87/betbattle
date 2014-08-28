var error = Alloy.Globals.PHRASES.loginError;
var uie = require('lib/IndicatorWindow');

var indicator = uie.createIndicatorWindow({
	top : 200,
	text : Alloy.Globals.PHRASES.loadingTxt
});

var args = arguments[0] || {};

var emailReg = -1;
if ( typeof args.email !== 'undefined') {
	emailReg = args.email;
}

var passwordReg = -1;
if ( typeof args.password !== 'undefined') {
	passwordReg = args.password;
}

if(emailReg !== -1 && passwordReg !== -1) {
	// auto login
	login(true);
}

function storeProfileName(name) {
	if (!Ti.App.Properties.hasProperty("profileNameSetting")) {
		Ti.App.Properties.setString("profileNameSetting", name);
	}
}

function createLeagueAndUidObj(response) {
	Alloy.Globals.BETKAMPENUID = response.betkampen_uid;
	Alloy.Globals.LEAGUES = [];
	Alloy.Globals.AVAILABLELANGUAGES = [];

	for (var i = 0; i < response.leagues.length; i++) {
		var league = {
			id : response.leagues[i].id,
			name : response.leagues[i].name,
			logo : response.leagues[i].logo
		};
		// store all active leagues
		Alloy.Globals.LEAGUES.push(league);
	}
	        for (var i = 0; response.languages.length > i; i++) {
            var language = {
                name: response.languages[i].name,
                imageLocation: response.languages[i].imageLocation,
                description: response.languages[i].description
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
		$.signInBtn.enabled = true;
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
	};

	try {
		xhr.open('GET', Alloy.Globals.BETKAMPENCHALLENGESURL + '/?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
		xhr.setRequestHeader("content-type", "application/json");
		xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
		xhr.setTimeout(Alloy.Globals.TIMEOUT);

		xhr.send();
	} catch(e) {
		Ti.API.error('Bad Sever =>' + e.error);
		indicator.closeIndicator();
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
					$.signInBtn.enabled = true;
					Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
				}

				// construct array with objects
				if(response !== null) {
					Alloy.Globals.CHALLENGEOBJECTARRAY = Alloy.Globals.constructChallenge(response);
				}
				

				// login success
				var args = {
					dialog : indicator
				};

				if (OS_IOS) {
					var loginSuccessWindow = Alloy.createController('landingPage', args).getView();
					loginSuccessWindow.open({
						fullScreen : true,
						transition : Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT
					});
					loginSuccessWindow = null;

				} else if (OS_ANDROID) {
					var loginSuccessWindow = Alloy.createController('landingPage', args).getView();
					loginSuccessWindow.open({
						fullScreen : true,
						orientationModes : [Titanium.UI.PORTRAIT]
					});
					loginSuccessWindow = null;
				}

				$.loginView.close();

				if (Alloy.Globals.INDEXWIN !== null) {
					Alloy.Globals.INDEXWIN.close();
				}

				if (OS_ANDROID) {
					var activity = Titanium.Android.currentActivity;
					activity.finish();
				}

			} else {
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
				$.signInBtn.enabled = true;
				indicator.closeIndicator();
			}
		} else {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
			$.signInBtn.enabled = true;
			indicator.closeIndicator();
			Ti.API.error("Error =>" + this.response);
		}
	};
}


  // TODO Handle expired token (Global, perhaps at resume???)
  // TODO Handle if registered with fb and no password stored, if we want to login using betkampen?
 


function loginAuthenticated() {
	// Get betkampenID with valid token
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onerror = function(e) {
		Ti.API.error('Bad Sever =>' + e.error);
		indicator.closeIndicator();
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
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
		$.signInBtn.enabled = true;
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
					//////
					Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
					indicator.closeIndicator();
					$.signInBtn.enabled = true;
				}

			} else {
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
				indicator.closeIndicator();
				$.signInBtn.enabled = true;
			}
		} else {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
			Ti.API.error("Error =>" + this.response);
			indicator.closeIndicator();
			$.signInBtn.enabled = true;
		}
	};			
}


function login(auto) {
	var username;
	var password;
	if(auto) {
		// login from register
		username = emailReg;
		password = passwordReg;
	} else {
		username = $.loginEmail.value;
		password = $.loginPass.value;
	}
	
	if (Alloy.Globals.checkConnection()) {
		$.signInBtn.enabled = false;
		indicator.openIndicator();
		var loginReq = Titanium.Network.createHTTPClient();
		loginReq.setTimeout(Alloy.Globals.TIMEOUT);

		try {
			loginReq.setUsername('betkampen_mobile');
			loginReq.setPassword('not_so_s3cr3t');
			loginReq.open("POST", Alloy.Globals.BETKAMPENEMAILLOGIN);
			var params = {
				grant_type : 'password',
				username : username,
				password : password,
				client_id : 'betkampen_mobile',
				client_secret : 'not_so_s3cr3t'
			};
			loginReq.send(params);
		} catch(e) {
			Ti.API.error('Bad Sever =>' + e.error);
			indicator.closeIndicator();
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
			$.signInBtn.enabled = true;
		}

		loginReq.onload = function() {
			if (this.status == '200') {
				if (this.readyState == 4) {					
					var json = this.responseText;
					var response = JSON.parse(json);
					// token received, store it for API requests
					Alloy.Globals.BETKAMPEN = {
						token : "TOKEN " + response.access_token,
						valid : response.expires_in,
						refresh_token : response.refresh_token
					};
					
					// get first part on name
					var name =  $.loginEmail.value;
					var index = name.indexOf("@");
					name = name.substring(0, index);
					
					// store profile name in phone and fetch challenges
					storeProfileName(name);
					Alloy.Globals.storeToken();
					loginAuthenticated();	
				}
			} else {
				Ti.API.log(this.responseText);
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.loginCredentialsError);
			}
		};
		loginReq.onerror = function(e) {
			Ti.API.error('Bad Sever =>' + JSON.stringify(e));
			$.signInBtn.enabled = true;
			indicator.closeIndicator();
			if(e.code === 400) {
				// OAuth return 400 on credentials error
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.loginCredentialsError);
			} else {
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
			}
			
		};
	} else {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
	}
}

$.signInBtn.addEventListener('click', function(e) {
	if ($.loginEmail.value != '' && $.loginPass.value != '') {
		login(false);
	} else {
		alert(error);
	}
});

$.abortLoginBtn.addEventListener('click', function(e) {
	var login = Alloy.createController('login').getView();
	login.open();
	$.loginView.close();
});
