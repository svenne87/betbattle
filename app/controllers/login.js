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
		addEvent();
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
	};

	try {
		xhr.open('GET', Alloy.Globals.BETKAMPENCHALLENGESURL + '/?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
		xhr.setRequestHeader("content-type", "application/json");
		xhr.setRequestHeader("Authorization", Alloy.Globals.FACEBOOK.accessToken);
		xhr.setTimeout(Alloy.Globals.TIMEOUT);
		Ti.API.log(Alloy.Globals.FACEBOOK.accessToken);

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
						navBarHidden : false,
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
					var activity = Titanium.Android.currentActivity;
					activity.finish();
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
					//bithday : result.birthday,
					locale : result.locale,
					//location : result.location['name'],
					username : result.username,
					fullName : result.name,
					firstName : result.first_name,
					lastName : result.last_name,
					//gender : result.gender,
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
					var param = '{"auth_token" : "' + fb.accessToken + '", "lang":"' + Alloy.Globals.LOCALE + '"}';
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
								Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
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

var opened = Ti.App.Properties.getString('appLaunch');

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

if(OS_IOS){
	fb.permissions = ['email', 'user_birthday', 'user_friends', 'user_location', 'user_games_activity', 'friends_games_activity'];
} else {
	fb.permissions = ['email', 'user_birthday', 'user_friends', 'user_location', 'user_games_activity', 'friends_games_activity', 'publish_actions'];
}
fb.forceDialogAuth = false;

if (Alloy.Globals.FBERROR) {
	// need to keep track if event was already added, since it is beeing added several times otherwise.
	fb.addEventListener('login', function(e) {
		indicator.openIndicator();
		Alloy.Globals.FBERROR = false;
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
	});
}

addEvent();					  // + '?lang=' + Alloy.Globals.LOCALE gick inte så bra...
							  // TODO gick inte försöka igen efter Timeout vid login försök...
							  // TODO går inte att logga in, kan vara fb session som löpt up, sen går de inte försöka igen....
// set correct language phrase
$.facebookBtnText.text = Alloy.Globals.PHRASES.loginFacebookButtonTxt;							  
$.viewOneLabel.text = Alloy.Globals.PHRASES.labelOneTxt;
$.viewTwoLabel.text = Alloy.Globals.PHRASES.labelTwoTxt;
$.viewThreeLabel.text = Alloy.Globals.PHRASES.labelThreeTxt;
$.viewFourLabel.text = Alloy.Globals.PHRASES.labelFourTxt;
$.viewFiveLabel.text = Alloy.Globals.PHRASES.labelFiveTxt;

// check login
if (Alloy.Globals.checkConnection()) {		
	if (fb.loggedIn) {
		if (!opened) {
			// don't show the dialog at auto login
			Ti.App.Properties.setString("appLaunch", JSON.stringify({
				opened : true
			}));
		}
		
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
	} else {
		if (!opened) {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.welcomePhrase);
			//finally
			Ti.App.Properties.setString("appLaunch", JSON.stringify({
				opened : true
			}));
		}
	}
} else {
	Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
}


/*
 $.facebookBtn.addEventListener('click', function() {
 login();
 });
 */

$.login.addEventListener('close', function() {
	indicator.closeIndicator();
	
	$.scrollableView.removeAllChildren();
	
	for(child in $.scrollableView.children) {
		$.scrollableView[child] = null;
	}
	
	children = null;
	$.scrollableView = null;
	
	$.destroy();
});

if (OS_ANDROID) {
	$.login.addEventListener('android:back', function() {
		$.login.close();
		var activity = Titanium.Android.currentActivity;
		activity.finish();
	});
}

// email login --> creating login modal
var LoginWindow = Ti.UI.createWindow({
	backgroundColor: 'white',
	width: 300,
	height: 300,
	opacity: 0.8,
	borderRadius: 20
});
var loginTitle = Titanium.UI.createTextField({
	borderstyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
	color: 'black',
	top: 10,
	title: 'Logga in med din e-postadress'
});
LoginWindow.add(loginTitle);
 
var username = Titanium.UI.createTextField({
    color:'#336699',
    top:80,
    left:25,
    width:250,
    height:40,
    hintText: Alloy.Globals.PHRASES.emailTxt,
    keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
    returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
    borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});
LoginWindow.add(username);
 
var password = Titanium.UI.createTextField({
    color:'#336699',
    top:130,
    left:25,
    width:250,
    height:40,
    hintText: Alloy.Globals.PHRASES.passwordTxt,
    passwordMask:true,
    keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
    returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
    borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});
LoginWindow.add(password);
 
var signInBtn = Titanium.UI.createButton({
    top: 190,
	height: '14%',
	width: '68.5%',
	left: '15%',
	backgroundColor: '#000',
	color: '#fff',
	borderRadius: 3,
	title: Alloy.Globals.PHRASES.signInTxt
});
LoginWindow.add(signInBtn);

var cancelBtn = Titanium.UI.createButton({
    top: 240,
	height: '14%',
	width: '68.5%',
	left: '15%',
	backgroundColor: '#000',
	color: '#fff',
	borderRadius: 3,
	title: Alloy.Globals.PHRASES.abortBtnTxt
});
LoginWindow.add(cancelBtn);

// opening login modal
$.loginBtn.addEventListener('click', function(e)
{
	
	LoginWindow.open({modal:true});
});

//handle buttons in login modal
cancelBtn.addEventListener('click', function(e)
{
	
	LoginWindow.close();
});

var loginReq = Titanium.Network.createHTTPClient();
loginReq.onload = function()
{
	var json = this.responseText;
	var response = JSON.parse(json);
	if (response.logged == true)
	{
		alert("Welcome " + response.name + ". Your email is: " + response.email);
	}
	else
	{
		alert(response.message);
	}
};

loginReq.onerror = function()
{
	alert("Network error");
};

signInBtn.addEventListener('click', function(e)
{
	if (username.value != '' && password.value != '')
	{
		loginReq.open("POST","http://secure.jimdavislabs.se/secure/betkampen_vm/api/email_login.php");
		var params = {
			username: username.value,
			password: password.value
			//password: Ti.Utils.md5HexDigest(password.value)
		};
		loginReq.send(params);
	}
	else
	{
		alert("Username/Password are required");
	}
});



// creating register view
var RegisterWindow = Ti.UI.createWindow({
	backgroundColor: 'white',
	width: 300,
	height: 400,
	opacity: 0.8,
	borderRadius: 20
});

var email = Titanium.UI.createTextField({
    color:'#336699',
    top:80,
    left:25,
    width:250,
    height:40,
    hintText: Alloy.Globals.PHRASES.emailTxt,
    keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
    returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
    borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});
RegisterWindow.add(email);

var username = Titanium.UI.createTextField({
    color:'#336699',
    top:130,
    left:25,
    width:250,
    height:40,
    hintText: Alloy.Globals.PHRASES.usernameTxt,
    keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
    returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
    borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});
RegisterWindow.add(username);
 
var password = Titanium.UI.createTextField({
    color:'#336699',
    top:180,
    left:25,
    width:250,
    height:40,
    hintText: Alloy.Globals.PHRASES.passwordTxt,
    passwordMask:true,
    keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
    returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
    borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});
RegisterWindow.add(password);

var passwordAgain = Titanium.UI.createTextField({
    color:'#336699',
    top:230,
    left:25,
    width:250,
    height:40,
    hintText: Alloy.Globals.PHRASES.passwordTxt,
    passwordMask:true,
    keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
    returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
    borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});
RegisterWindow.add(passwordAgain);
 
var signUpBtn = Titanium.UI.createButton({
    top: 290,
	height: '10%',
	width: '68.5%',
	left: '15%',
	backgroundColor: '#000',
	color: '#fff',
	borderRadius: 3,
	title: Alloy.Globals.PHRASES.regTxt
});
RegisterWindow.add(signUpBtn);

var cancelRegBtn = Titanium.UI.createButton({
    top: 340,
	height: '10%',
	width: '68.5%',
	left: '15%',
	backgroundColor: '#000',
	color: '#fff',
	borderRadius: 3,
	title: Alloy.Globals.PHRASES.abortBtnTxt
});
RegisterWindow.add(cancelRegBtn);

// opening login modal
$.registerBtn.addEventListener('click', function(e)
{
	
	RegisterWindow.open({modal:true});
});

//handle buttons in login modal
cancelRegBtn.addEventListener('click', function(e)
{
	
	RegisterWindow.close();
});

signUpBtn.addEventListener('click', function(e)
{
	alert("Username and Password are required");
});


$.registerBtnText.text = Alloy.Globals.PHRASES.registerTxt;
$.loginBtnText.text = Alloy.Globals.PHRASES.signInTxt;
	