var args = arguments[0] || {};
Alloy.Globals.LANDINGWIN = $.landingPage;

var appResume = args.resume;
var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
	top : 200,
	text : Alloy.Globals.PHRASES.loadingTxt
});

var loadingLabel = Ti.UI.createLabel({
	top : 80,
    height : Ti.UI.SIZE,
    width : Ti.UI.SIZE,
    color : '#FFF',
    font : {
		fontSize : 19,
		fontFamily : "Impact"
	},
	text : Alloy.Globals.PHRASES.loadingTxt
});

function showFbLogin() {
	Alloy.Globals.CURRENTVIEW = null;
	Alloy.Globals.NAV.close();
	Ti.App.Properties.removeProperty("BETKAMPEN");
	Alloy.Globals.BETKAMPEN = null;
	Alloy.Globals.FACEBOOKOBJECT = null;

	var login = Alloy.createController('login').getView();
	login.open({
		modal : false
	});
	login = null;
}

function createLeagueAndUidObj(response) {
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

/* Only used for Betkampen token sign in! */
var refreshTry = 0;

function loginBetkampenAuthenticated(status) {
	// Get betkampenID with valid token
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onerror = function(e) {
		Ti.API.error('Bad Sever =>' + JSON.stringify(e));
		if (e.code == 401) {
			if (status === 1) {
				// if this is first try, then try refresh token
				if (refreshTry === 0) {
					refreshTry = 1;
					authWithRefreshToken();
				}
			} else if (status === 2) {
				// Facebook failed to reAuth, present login screen
				showFbLogin();
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
						indicator.closeIndicator();
						Ti.App.fireEvent('app:challengesViewRefresh');
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

// Try to authenticate using refresh token
function authWithRefreshToken() {
	if (Alloy.Globals.checkConnection()) {
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onerror = function(e) {
			Ti.API.error('Bad Sever reAuth =>' + JSON.stringify(e));
			indicator.closeIndicator();
			refreshTry = 0;
			// reAuth failed. Need to login again. 400 = invalid token
			Ti.App.Properties.removeProperty("BETKAMPEN");
			Alloy.Globals.BETKAMPEN = null;
			Alloy.Globals.CLOSE = false;
			Alloy.Globals.CURRENTVIEW = null;
			Alloy.Globals.NAV.close();
			var login = Alloy.createController('login').getView();
			login.open({
				modal : false
			});
			login = null;

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
					loginBetkampenAuthenticated(1);
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
Ti.App.addEventListener('pause',function(e){
   Ti.API.info("APP In background");
   Alloy.Globals.appStatus = 'background';
});
// resume listener for ios and android
if (OS_IOS) {
	if (Alloy.Globals.OPEN && Alloy.Globals.RESUME) {
		Alloy.Globals.RESUME = false;
		Ti.App.addEventListener('resume', function() {
			if (Alloy.Globals.CURRENTVIEW !== null) {
				// check connection
				Alloy.Globals.appStatus = 'foreground';
				if (Alloy.Globals.checkConnection()) {
					if (Alloy.Globals.FACEBOOKOBJECT) {
						var fb = Alloy.Globals.FACEBOOK;
						if (fb) {
							if (fb.loggedIn) {
								indicator.openIndicator();
								loginBetkampenAuthenticated(2);
								// TODO Test, run methods, need to authorize??  Testa /me och se om de svara 401 etc. då visa login...
							} else {
								// not logged in, show Betkampen login view
								showFbLogin();
							}
						}
					} else {
						// Betkampen check and if needed refresh token
						Ti.API.log("resume...");
						Alloy.Globals.readToken();
						indicator.openIndicator();
						loginBetkampenAuthenticated(1);
					}
					Ti.UI.iPhone.setAppBadge(0);
				} else {
					Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionError);
					// TODO add retry?
				}
			}
		});
	}
} else if (OS_ANDROID) {
	if (Alloy.Globals.checkConnection()) {
		var activity = Ti.Android.currentActivity;
		activity.addEventListener('resume', function(e) {
			//indicator.openIndicator();
			Alloy.Globals.appStatus = 'foreground';
			Ti.App.fireEvent('app:challengesViewRefresh');
		});
	} else {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionError);
	}
}


var deviceToken;

if (OS_IOS) {
	// only iOS
	if (appResume != 0)
		$.landingPage.addEventListener('open', function() {
			var apns = require('lib/push_notifications_apns');
			apns.apns();
		});

} else if (OS_ANDROID) {

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
		success : function(ev) {
			// on successful registration
			// post to our server
			Alloy.Globals.postDeviceToken(ev.deviceToken);
			Ti.API.info('******* success, ' + ev.deviceToken);
		},
		error : function(ev) {
			// when an error occurs
			Ti.API.info('******* error, ' + ev.error);
		},
		callback : function(e) {
			// when a gcm notification is received WHEN the app IS IN FOREGROUND

			try {
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
			} catch(e) {
				// something went wrong
				//> THIS should fail
			}

		},
		unregister : function(ev) {
			// on unregister
			Ti.API.info('******* unregister, ' + ev.deviceToken);
		},
		data : function(data) {
			// if we're here is because user has clicked on the notification
			// and we set extras in the intent
			// and the app WAS RUNNING (=> RESUMED)
			// (again don't worry, we'll see more of this later)

			try {

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
			} catch(e) {
				// something went wrong
			}
		}
	});

	// in order to unregister:
	// require('net.iamyellow.gcmjs').unregister();

}

var beacons = [];

function getBeacons() {
	Ti.API.info("getBeacons");
	if (Alloy.Globals.checkConnection()) {
		// show indicator and disable button

		var xhr = Titanium.Network.createHTTPClient();
		xhr.onerror = function(e) {
			Ti.API.error('Bad Sever =>' + e.error);
		};

		try {
			xhr.open('GET', Alloy.Globals.BETKAMPENGETGETBEACONSURL + '?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
			xhr.setRequestHeader("content-type", "application/json");
			//xhr.setRequestHeader("Authorization", Alloy.Globals.FACEBOOK.accessToken);
			xhr.setTimeout(Alloy.Globals.TIMEOUT);

			xhr.send();
		} catch(e) {
			Ti.API.info("ERROR CATCH");
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
		}
		xhr.onload = function() {
			Ti.API.info("ONLOAD " + JSON.stringify(this));
			if (this.status == '200') {

				if (this.readyState == 4) {
					Ti.API.log("respoooonse-------------->: " +this.responseText);
					var beacons = JSON.parse(this.responseText);
					
					if (OS_IOS) {
						Alloy.Globals.TiBeacon.addEventListener("changeAuthorizationStatus", function(e) {
							if (e.status != "authorized") {
								Ti.API.error("not authorized");
							}
						});

						var dialogShown = false;
						Alloy.Globals.TiBeacon.addEventListener("bluetoothStatus", function(e) {
							if (e.status != "on" && !dialogShown && appResume != 0) {
								dialogShown = true;
								var dialog = Ti.UI.createAlertDialog({
									message : Alloy.Globals.PHRASES.activateBlutoothMsg,
									title : 'Bluetooth',
									ok : 'Ok',
								});
								//dialog.show();
							}
						});

						Alloy.Globals.TiBeacon.requestBluetoothStatus();

						function enterRegion(e) {
							for (var i = 0; i < beacons.length; i++) {
								Ti.API.info("BEACON FOUND ID : " + e.identifier);
								Ti.API.info("BEACON RETREIVED ID : " + beacons[i].identifier);

								if (e.identifier == beacons[i].identifier) {
									if(Alloy.Globals.appStatus == 'foreground'){
										getPromotion(beacons[i].id);
									}else if(Alloy.Globals.appStatus){
										
									}
									
								}
							}

							Alloy.Globals.TiBeacon.startRangingForBeacons(e);
						}

						function exitRegion(e) {
							for (var i = 0; i < beacons.length; i++) {
								if (e.identifier == beacons[i].identifier) {
									//alert("Du lämnar konferensrumemt nu. Tack för besöket!");
								}
							}

						}

						function updateInformation(e) {
							/*if (e.identifier == 'conference' && e.proximity == "near"){
							 //alert("Du är i konferensrummet nu. Grattis!");
							 }else if (e.identifier == 'hall' && e.proximity == "near"){
							 //alert("Du är i hallen nu. Grattis!");
							 }else if (e.identifier == 'kitchen' && e.proximity == "near"){
							 //alert("Du är i köket! Glöm inte kaffet!");
							 }*/
						}


						Alloy.Globals.TiBeacon.addEventListener("enteredRegion", enterRegion);
						Alloy.Globals.TiBeacon.addEventListener("beaconProximity", updateInformation);
						Alloy.Globals.TiBeacon.addEventListener("exitedRegion", exitRegion);

						for (var i = 0; i < beacons.length; i++) {
							Alloy.Globals.TiBeacon.startMonitoringForRegion({
								uuid : beacons[i].uuid,
								identifier : beacons[i].identifier,
								major : beacons[i].major,
								minor : beacons[i].minor
							});
						}

					} else if (OS_ANDROID) {
	
						if (Ti.Platform.version >= 4.3) {

							Alloy.Globals.TiBeacon.initBeacon({
								success : onSuccess,
								error : onError,
								interval : 5,
								region : onRegion,
								found : onFound,
							});

							function onSuccess(e) {
								Ti.API.info("SUCCESS : " + JSON.stringify(e));
							}

							function onRegion(e) {
								Ti.API.info("BEACON : " + JSON.stringify(e));
								e = e.device;
								for (var i = 0; i < beacons.length; i++) {
									if (e.uuidDashed == beacons[i].uuid) {
										if (e.major == beacons[i].major && e.minor == beacons[i].minor) {
											//getPromotion(beacons[i].id);
											Ti.API.info("BEACON ON REGION");
										}
									}
								}
							}

							function onFound(e) {
								Ti.API.info("FOUND : " + JSON.stringify(e));
								e = e.device;
								for (var i = 0; i < beacons.length; i++) {
									if (e.uuidDashed == beacons[i].uuid) {
										if (e.major == beacons[i].major && e.minor == beacons[i].minor) {
											getPromotion(beacons[i].id);
										}
									}
								}
							}

							function onError(e) {
								Ti.API.info("ERROR BEACON : " + JSON.stringify(e));
							}

							if (Alloy.Globals.TiBeacon.isEnabled()) {
								Alloy.Globals.TiBeacon.startScanning();
							}

						}

					}
				} else {
					Ti.API.error("ERROR: " + this);
					Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
				}
			} else {
				Ti.API.error("Error =>" + this.response);
				Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
			}
		};

	} else {
		Ti.API.info("NO CONNECTION");
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
	}
}

function createBeaconDialog(msg, title, link, beacon) {
	var dialog = Ti.UI.createAlertDialog({
		cancel : 1,
		buttonNames : [Alloy.Globals.PHRASES.confirmBtnTxt, Alloy.Globals.PHRASES.abortBtnTxt],
		message : msg,
		title : title,
	});
	dialog.addEventListener('click', function(e) {
		if (e.index === e.source.cancel) {
			Ti.API.info('The cancel button was clicked');
		} else {
			Ti.API.info(link);
			beacon = true;
		}
	});
	dialog.show();
}

function getPromotion(beaconID) {
	if (Alloy.Globals.checkConnection()) {
		// show indicator and disable button

		var xhr = Titanium.Network.createHTTPClient();
		xhr.onerror = function(e) {
			Ti.API.error('Bad Sever =>' + e.error);
		};

		try {
			xhr.open('GET', Alloy.Globals.BETKAMPENGETPROMOTIONURL + '?beaconID=' + beaconID + '&lang=' + Alloy.Globals.LOCALE);
			xhr.setRequestHeader("content-type", "application/json");
			//xhr.setRequestHeader("Authorization", Alloy.Globals.FACEBOOK.accessToken);
			xhr.setTimeout(Alloy.Globals.TIMEOUT);

			xhr.send();
		} catch(e) {
			Ti.API.info("ERROR CATCH");
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
		}
		xhr.onload = function() {
			Ti.API.info("ONLOAD " + JSON.stringify(this));
			if (this.status == '200') {

				if (this.readyState == 4) {
					//Ti.API.log("respoooonse: " +this.responseText);
					var promo = JSON.parse(this.responseText);

					if (promo.type == 1) {
						createPromoTypeOne(promo);
					}
					if (promo.type == 2) {
						createPromoTypeTwo(promo);
					}
					if (promo.type == 3) {
						createPromoTypeThree(promo);
					}

				} else {
					Ti.API.error("ERROR: " + this);
					Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
				}
			} else {
				Ti.API.error("Error =>" + this.response);
				Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
			}
		};

	} else {
		Ti.API.info("NO CONNECTION");
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
	}
}

function createPromoTypeOne(promo) {

	w = Ti.UI.createWindow({
		title : promo.title,
		backgroundColor : "#000",
		layout : "vertical",
		height : "90%",
	}), b = Titanium.UI.createButton({
		title : Alloy.Globals.PHRASES.promoCloseBtnTxt
	});
	w.title = promo.title;
	w.barColor = 'black';

	w.add(b);

	b.addEventListener('click', function() {
		w.close();
	});

	var titleView = Ti.UI.createLabel({
		width : "100%",
		height : "10%",
		text : promo.title,
		textAlign : "center",
		color : "#FFF",
		font : {
			fontSize : 18,
			fontFamily : "Impact",
		}
	});
	w.add(titleView);

	var image = Ti.UI.createImageView({
		image : Alloy.Globals.BETKAMPENURL + '/promotions/images/' + promo.image,
		width : "100%",
		height : "45%",
	});
	w.add(image);

	var text = Ti.UI.createLabel({
		width : "100%",
		height : "45%",
		text : promo.text,
		textAlign : "center",
		color : "#FFF",
		font : {
			fontSize : 16,
			fontFamily : "Impact",
		}
	});
	w.add(text);
	w.open({
		modal : true
	});

}

function createPromoTypeTwo(promo) {

	w = Ti.UI.createWindow({
		title : promo.title,
		backgroundColor : "#000",
		layout : "vertical",
		height : "90%",
	});
	b = Titanium.UI.createButton({
		title : Alloy.Globals.PHRASES.promoCloseBtnTxt
	});

	w.title = promo.title;
	w.barColor = 'black';
	w.add(b);
	b.addEventListener('click', function() {
		w.close();
	});

	var image = Ti.UI.createImageView({
		image : Alloy.Globals.BETKAMPENURL + '/promotions/images/' + promo.image,
		width : "100%",
		height : "100%",
	});
	w.add(image);
	w.open({
		modal : true
	});

}

function createPromoTypeThree(promo) {
	w = Ti.UI.createWindow({
		title : promo.title,
		backgroundColor : "#000",
		layout : "vertical",
		height : "90%",
	});
	b = Titanium.UI.createButton({
		title : Alloy.Globals.PHRASES.promoCloseBtnTxt
	});

	w.title = promo.title;
	w.barColor = 'black';
	w.add(b);
	b.addEventListener('click', function() {
		w.close();
	});

	var titleView = Ti.UI.createLabel({
		width : "100%",
		height : "10%",
		text : promo.title,
		textAlign : "center",
		color : "#FFF",
		font : {
			fontSize : 18,
			fontFamily : "Impact",
		}
	});
	w.add(titleView);

	var image = Ti.UI.createImageView({
		image : Alloy.Globals.BETKAMPENURL + '/promotions/images/' + promo.image,
		width : "100%",
		height : "40%",
	});
	w.add(image);

	var text = Ti.UI.createLabel({
		width : "100%",
		height : "35%",
		text : promo.text,
		textAlign : "center",
		color : "#FFF",
		font : {
			fontSize : 16,
			fontFamily : "Impact",
		}
	});
	w.add(text);

	var btn = Ti.UI.createView({
		width : "50%",
		height : "10%",
		backgroundColor : "#c5c5c5",
	});

	var btnText = Ti.UI.createLabel({
		text : promo.title,
		textAlign : "center",
		font : {
			fontSize : 14,
			fontFamily : "Impact",
		},
		color : "#000",
	});

	btn.add(btnText);
	w.add(btn);
	btn.addEventListener("click", function(e) {
		w.close();
		Ti.API.info("CLICKAR");
		var win = Alloy.createController(promo.button_link).getView();
		if (OS_IOS) {
			Alloy.Globals.NAV.openWindow(win, {
				animated : true
			});
			//Alloy.Globals.INDEXWIN = win;
			win = null;
		} else if (OS_ANDROID) {
			win.open({
				fullScreen : true
			});
		}
	});

	w.open({
		modal : true
	});

}

var top_view = Ti.UI.createView({
	id : "top_view",
	backgroundColor : "#303030",
	height : "75%",
	width : "100%",
	//top: "10%",
	layout : "vertical"
});

var bot_view = Ti.UI.createView({
	backgroundColor : "#303030",
	id : "bot_view",
	height : "25%",
	width : "100%",
	layout : "horizontal"
});

var top_img = Ti.UI.createView({
	backgroundImage : "/images/top_img.png",
	height : "33.33%",
	width : "100%"
});

var mid_img = Ti.UI.createView({
	backgroundImage : "/images/mid_img.png",
	height : "33.33%",
	width : "100%"
});

var bot_img = Ti.UI.createView({
	backgroundImage : "/images/bot_img.png",
	height : "33.33%",
	width : "100%"
});

//create views to act as borders
var border1 = Ti.UI.createView({
	width : "100%",
	height : 2,
	backgroundColor : "orange",
	bottom : "0px"
});

var border2 = Ti.UI.createView({
	width : "100%",
	height : 2,
	backgroundColor : "orange",
	bottom : "0px"
});

var border3 = Ti.UI.createView({
	width : "100%",
	height : 2,
	backgroundColor : "orange",
	bottom : "0px"
});

//Add the black transparent view with the text inside.
var blackLabelTop = Ti.UI.createView({
	height : "25%",
	width : "100%",
	backgroundColor : "#000",
	opacity : "0.6",
	bottom : 2
});
var blackLabelMid = Ti.UI.createView({
	height : "25%",
	width : "100%",
	backgroundColor : "#000",
	opacity : "0.6",
	bottom : 2
});
var blackLabelBot = Ti.UI.createView({
	height : "25%",
	width : "100%",
	backgroundColor : "#000",
	opacity : "0.6",
	bottom : 2
});

top_img.add(Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.landingPageHalfPot,
	zIndex : "100",
	height : "25%",
	width : "60%",
	color : "#FFF",
	left : 10,
	bottom : 1,
	font : {
		fontSize : '20',
		fontFamily : 'Impact'
	}
}));

top_img.add(Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.landingPageHalfPotBtn,
	zIndex : "100",
	height : "25%",
	width : "30%",
	color : "#FFF",
	textAlign : "right",
	right : 25,
	bottom : 1,
	font : {
		fontSize : '14',
		fontFamily : 'Impact'
	}
}));
top_img.add(Ti.UI.createView({
	width : 8,
	height : 8,
	zIndex : "110",
	backgroundImage : "/images/arrow.png",
	right : 10,
	bottom : 10
}));

top_img.addEventListener("click", function(e) {
	// check connection
	if (!Alloy.Globals.checkConnection()) {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
		return;
	}

	var win = Alloy.createController('halfPot').getView();
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

mid_img.add(Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.landingPageMatch,
	zIndex : "100",
	height : "25%",
	width : "60%",
	color : "#FFF",
	left : 10,
	bottom : 1,
	font : {
		fontSize : '20',
		fontFamily : 'Impact'
	}
}));
mid_img.add(Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.landingPageMatchBtn,
	zIndex : "100",
	height : "25%",
	width : "30%",
	color : "#FFF",
	textAlign : "right",
	right : 25,
	bottom : 1,
	font : {
		fontSize : '14',
		fontFamily : 'Impact'
	}
}));
mid_img.add(Ti.UI.createView({
	width : 8,
	height : 8,
	zIndex : "110",
	backgroundImage : "/images/arrow.png",
	right : 10,
	bottom : 10
}));

var custom_font = "Base02";
if (OS_ANDROID) {
	custom_font = "Base-02";
}
bot_img.add(Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.landingPageZone,
	zIndex : "100",
	height : "25%",
	width : "60%",
	color : "#FFF",
	left : 10,
	bottom : 1,
	font : {
		fontSize : '20',
		fontFamily : custom_font
	}
}));
bot_img.add(Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.landingPageZoneBtn,
	zIndex : "100",
	height : "25%",
	width : "30%",
	textAlign : "right",
	color : "#FFF",
	right : 25,
	bottom : 1,
	font : {
		fontSize : '14',
		fontFamily : 'Impact'
	}
}));
bot_img.add(Ti.UI.createView({
	width : 8,
	height : 8,
	zIndex : "110",
	backgroundImage : "/images/arrow.png",
	right : 10,
	bottom : 10
}));

//create the two buttons at the bottom
var inviteBtn = Ti.UI.createView({
	width : "50%",
	height : "100%",
	backgroundImage : "/images/inviteBtn.png",
	left : "0px"
});

var profileBtn = Ti.UI.createView({
	width : "50%",
	height : "100%",
	backgroundImage : "/images/profileBtn.png",
	left : "0px"
});

profileBtn.add(Ti.UI.createLabel({
	height : "20%",
	width : "100%",
	textAlign : "center",
	bottom : 20,
	font : {
		fontSize : '20',
		fontFamily : 'Impact'
	},
	color : "#FFF",
	text : Alloy.Globals.PHRASES.landingPageProfileBtn
}));

profileBtn.addEventListener("click", function(e) {
	// check connection
	if (!Alloy.Globals.checkConnection()) {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
		return;
	}

	var win = Alloy.createController('profile').getView();
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

inviteBtn.add(Ti.UI.createLabel({
	height : "20%",
	width : "100%",
	textAlign : "center",
	bottom : "20%",
	font : {
		fontSize : '20',
		fontFamily : 'Impact'
	},
	color : "#FFF",
	text : Alloy.Globals.PHRASES.landingPageInviteBtnBot
}));

inviteBtn.add(Ti.UI.createLabel({
	height : "20%",
	width : "100%",
	textAlign : "left",
	bottom : "40%",
	left : "20%",
	font : {
		fontSize : '20',
		fontFamily : 'Impact'
	},
	color : "#FFF",
	text : Alloy.Globals.PHRASES.landingPageInviteBtnTop
}));

inviteBtn.addEventListener("click", function(e) {
	var win = Alloy.createController('friendZone').getView();
	if (OS_IOS) {
		Alloy.Globals.NAV.openWindow(win, {
			animated : true
		});
	} else {
		win.open({
			fullScreen : true
		});
		win = null;
	}
});

bot_img.addEventListener("click", function(e) {
	// check connection
	if (!Alloy.Globals.checkConnection()) {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
		return;
	}
	
	indicator.openIndicator();
	args.dialog = indicator;

	var loginSuccessWindow = Alloy.createController('main', args).getView();
	if (OS_IOS) {
		loginSuccessWindow.open({
			fullScreen : true,
			transition : Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT
		});
	} else if (OS_ANDROID) {
		loginSuccessWindow.open({
			fullScreen : true,
			navBarHidden : false,
			orientationModes : [Titanium.UI.PORTRAIT]
		});
	}
	loginSuccessWindow = null;
});

function createTopView(resp){

	var img = "";
	if(resp !== null){
		img = resp.image;
	}else{
		img = "/images/top_img.png";
	}
	top_img = Ti.UI.createView({
		backgroundImage: img,
		height: "33.33%",
		width:"100%"
	});
	
	mid_img = Ti.UI.createView({
		backgroundImage: "/images/mid_img.png",
		height: "33.33%",
		width:"100%"
	});
	
	bot_img = Ti.UI.createView({
		backgroundImage: "/images/bot_img.png",
		height: "33.33%",
		width:"100%"
	});
	
	//create views to act as borders
	var border1 = Ti.UI.createView({
		width:"100%",
		height:2,
		backgroundColor: "orange",
		bottom:"0px"
	});
	
	var border2 = Ti.UI.createView({
		width:"100%",
		height:2,
		backgroundColor: "orange",
		bottom:"0px"
	});
	
	
	var border3 = Ti.UI.createView({
		width:"100%",
		height:2,
		backgroundColor: "orange",
		bottom:"0px"
	});
	
	//Add the black transparent view with the text inside.
	var blackLabelTop = Ti.UI.createView({
		height: "25%",
		width:"100%",
		backgroundColor: "#000",
		opacity: "0.6",
		bottom: 2
	});
	var blackLabelMid = Ti.UI.createView({
		height: "25%",
		width:"100%",
		backgroundColor: "#000",
		opacity: "0.6",
		bottom: 2
	});
	var blackLabelBot = Ti.UI.createView({
		height: "25%",
		width:"100%",
		backgroundColor: "#000",
		opacity: "0.6",
		bottom: 2
	});
	var labelText = "";
	var btnLabelTxt = "";
	if(resp !== null){
		labelText = resp.title;
		btnLabelTxt = "";
	}else{
		labelText = Alloy.Globals.PHRASES.landingPageHalfPot;
		btnLabelTxt = Alloy.Globals.PHRASES.landingPageHalfPotBtn;
	}
	top_img.add(Ti.UI.createLabel({
		text: labelText,
		zIndex:"100",
		height:"25%",
		width:"60%",
		color:"#FFF",
		left:10,
		bottom:1,
		font: {
			fontSize: '20',
			fontFamily: 'Impact'
		}
	}));
	
	
	top_img.add(Ti.UI.createLabel({
		text: btnLabelTxt,
		zIndex : "100",
		height:"25%",
		width: "30%",
		color:"#FFF",
		textAlign: "right",
		right:25,
		bottom:1,
		font:{
			fontSize: '14',
			fontFamily: 'Impact'
		}
	}));
	top_img.add(Ti.UI.createView({
		width:8,
		height:8,
		zIndex: "110",
		backgroundImage: "/images/arrow.png",
		right:10,
		bottom:10
	}));
	
	if(resp !== null){
		top_img.addEventListener("click", function(e){
			var params = {
				link: resp.url
			};
			var win = Alloy.createController('webview', params).getView();
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
	}else{
		top_img.addEventListener("click", function(e){
		
			var win = Alloy.createController('halfPot').getView();
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
	}
	
	
	mid_img.add(Ti.UI.createLabel({
		text: Alloy.Globals.PHRASES.landingPageMatch,
		zIndex:"100",
		height:"25%",
		width:"60%",
		color:"#FFF",
		left:10,
		bottom:1,
		font: {
			fontSize: '20',
			fontFamily: 'Impact'
		}
	}));
	mid_img.add(Ti.UI.createLabel({
		text:Alloy.Globals.PHRASES.landingPageMatchBtn,
		zIndex : "100",
		height:"25%",
		width: "30%",
		color:"#FFF",
		textAlign: "right",
		right:25,
		bottom:1,
		font:{
			fontSize: '14',
			fontFamily: 'Impact'
		}
	}));
	mid_img.add(Ti.UI.createView({
		width:8,
		height:8,
		zIndex: "110",
		backgroundImage: "/images/arrow.png",
		right:10,
		bottom:10
	}));
	
	
	var custom_font = "Base02";
	if(OS_ANDROID){
		custom_font = "Base-02";
	}
	bot_img.add(Ti.UI.createLabel({
		text: Alloy.Globals.PHRASES.landingPageZone,
		zIndex:"100",
		height:"25%",
		width:"60%",
		color:"#FFF",
		left:10,
		bottom:1,
		font: {
			fontSize: '20',
			fontFamily: custom_font
		}
	}));
	bot_img.add(Ti.UI.createLabel({
		text:Alloy.Globals.PHRASES.landingPageZoneBtn,
		zIndex : "100",
		height:"25%",
		width: "30%",
		textAlign: "right",
		color:"#FFF",
		right:25,
		bottom:1,
		font:{
			fontSize: '14',
			fontFamily: 'Impact'
		}
	}));
	bot_img.add(Ti.UI.createView({
		width:8,
		height:8,
		zIndex: "110",
		backgroundImage: "/images/arrow.png",
		right:10,
		bottom:10
	}));
	
	bot_img.addEventListener("click", function(e){
		indicator.openIndicator();
		args.dialog = indicator;
		
		var loginSuccessWindow = Alloy.createController('main', args).getView();
		if (OS_IOS) {
			loginSuccessWindow.open({
				fullScreen : true,
				transition : Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT
			});
		} else if (OS_ANDROID) {
			loginSuccessWindow.open({
				fullScreen : true,
				navBarHidden : false,
				orientationModes : [Titanium.UI.PORTRAIT]
			});
		}
		loginSuccessWindow = null;
	});
		
		///Get the match for "Matchens Mästare"
	var matchWrapperView = Ti.UI.createView({
		width: "50%",
		height: "70%",
		layout: "horizontal",
		top: 0,
	});
	
	team1Logo = Ti.UI.createImageView({
		width: 50,
		height: 50,
	});
	matchWrapperView.add(team1Logo);

	var versusLabel = Ti.UI.createLabel({
		width: "30%",
		height: "100%",
		text: "VS",
		textAlign: "center",
		color: "#FFFFFF",
		font:{
			fontSize: 22,
			fontFamily: "Impact",
		}
	});
	matchWrapperView.add(versusLabel);

	team2Logo = Ti.UI.createImageView({
		width: 50,
		height: 50,	
	});
	matchWrapperView.add(team2Logo);


	mid_img.add(matchWrapperView);

	
	top_img.add(border1);
	mid_img.add(border2);
	bot_img.add(border3);

	top_img.add(blackLabelTop);
	mid_img.add(blackLabelMid);
	bot_img.add(blackLabelBot);

	top_view.add(top_img);
	top_view.add(mid_img);
	top_view.add(bot_img);
	
	$.landingPage.remove(loadingLabel);
}



function createBotView(){
	//create the two buttons at the bottom
	var inviteBtn = Ti.UI.createView({
		width:"50%",
		height:"100%",
		backgroundImage: "/images/inviteBtn.png",
		left: "0px"
	});
	
	var profileBtn = Ti.UI.createView({
		width:"50%",
		height:"100%",
		backgroundImage: "/images/profileBtn.png",
		left: "0px"
	});
	
	profileBtn.add(Ti.UI.createLabel({
		height:"20%",
		width:"100%",
		textAlign: "center",
		bottom: 20,
		font: {
			fontSize:'20',
			fontFamily: 'Impact'
		},
		color: "#FFF",
		text: Alloy.Globals.PHRASES.landingPageProfileBtn
	}));
	
	profileBtn.addEventListener("click", function(e){
		var win = Alloy.createController('profile').getView();
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
	
	inviteBtn.add(Ti.UI.createLabel({
		height:"20%",
		width:"100%",
		textAlign: "center",
		bottom:"20%",
		font:{
			fontSize:'20',
			fontFamily: 'Impact'
		},
		color:"#FFF",
		text: Alloy.Globals.PHRASES.landingPageInviteBtnBot
	}));
	
	inviteBtn.add(Ti.UI.createLabel({
		height:"20%",
		width:"100%",
		textAlign: "left",
		bottom:"40%",
		left: "20%",
		font:{
			fontSize:'20',
			fontFamily: 'Impact'
		},
		color:"#FFF",
		text: Alloy.Globals.PHRASES.landingPageInviteBtnTop
	}));
	
	inviteBtn.addEventListener("click", function(e){
		var win = Alloy.createController('friendZone').getView();
			if (OS_IOS) {
				Alloy.Globals.NAV.openWindow(win, {
					animated : true
				});
			} else {
				win.open({
					fullScreen : true
				});
				win = null;
			}
	});
	bot_view.add(profileBtn);
	bot_view.add(inviteBtn);
}

if (OS_IOS) {
	Alloy.Globals.NAV = $.nav;
	var iOSVersion;

	if (OS_IOS) {
		iOSVersion = parseInt(Ti.Platform.version);
	}

	if (iOSVersion < 7) {
		$.landingPage.titleControl = Ti.UI.createLabel({
			text : Alloy.Globals.PHRASES.betbattleTxt,
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
} else {
	Ti.Gesture.addEventListener('orientationchange', function(e) {
		Ti.Android.currentActivity.setRequestedOrientation(Ti.Android.SCREEN_ORIENTATION_PORTRAIT);
	});
	$.landingPage.orientationModes = [Titanium.UI.PORTRAIT];
}

///Get the match for "Matchens Mästare"
var matchWrapperView = Ti.UI.createView({
	width : "50%",
	height : "70%",
	layout : "horizontal",
	top : 0,
});

var team1Logo = Ti.UI.createImageView({
	width : 50,
	height : 50,
});
matchWrapperView.add(team1Logo);

var versusLabel = Ti.UI.createLabel({
	width : "30%",
	height : "100%",
	text : "VS",
	textAlign : "center",
	color : "#FFFFFF",
	font : {
		fontSize : 22,
		fontFamily : "Impact",
	}
});
matchWrapperView.add(versusLabel);

var team2Logo = Ti.UI.createImageView({
	width : 50,
	height : 50,
});
matchWrapperView.add(team2Logo);

mid_img.add(matchWrapperView);

function getTopImgView(){
	if(Alloy.Globals.checkConnection()){
		$.landingPage.add(loadingLabel);
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onerror = function(e) {
			versusLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
			Ti.API.error('Bad Sever =>' + e.error);
		};
	
		try {
			xhr.open('GET', Alloy.Globals.BETKAMPENGETTOPLANDINGPAGE + '?lang=' + Alloy.Globals.LOCALE + '&location=landingPage');
			xhr.setRequestHeader("content-type", "application/json");
			xhr.setTimeout(Alloy.Globals.TIMEOUT);
	
			xhr.send();
		} catch(e) {
			versusLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
			$.landingPage.remove(loadingLabel);
		}
	
		xhr.onload = function() {
			if (this.status == '200') {
				if (this.readyState == 4) {
						var resp = null;
					try {
						Ti.API.info("RESPONSE INNAN PARSE : " + JSON.stringify(this.responseText));
						resp = JSON.parse(this.responseText);
						
					} catch (e) {
						resp = null;
						//Ti.API.info("Match NULL");
					}
	
					if (resp !== null) {
						Ti.API.info("RESPONSE TOP : " + JSON.stringify(resp));
						createTopView(resp);
						createBotView();
						getMatchOfTheDay();
					}else{
						Ti.API.info("RESPONSE TOP = NULL");
						createTopView(resp);
						createBotView();
						getMatchOfTheDay();
					}
				}
				
			} else {
				$.landingPage.remove(loadingLabel);
				versusLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
				Ti.API.error("Error =>" + this.response);
			}
		};
	}else{
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
	}
}

function getMatchOfTheDay() {
	// check connection
	if (!Alloy.Globals.checkConnection()) {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
		return;
	}
	
	$.landingPage.add(loadingLabel);
	
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onerror = function(e) {
		versusLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
		Ti.API.error('Bad Sever =>' + e.error);
		$.landingPage.remove(loadingLabel);
	};

	try {
		xhr.open('GET', Alloy.Globals.BETKAMPENGETMOTDINFO + '?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
		xhr.setRequestHeader("content-type", "application/json");
		xhr.setTimeout(Alloy.Globals.TIMEOUT);

		xhr.send();
	} catch(e) {
		versusLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
		$.landingPage.remove(loadingLabel);
	}

	xhr.onload = function() {
		if (this.status == '200') {
			if (this.readyState == 4) {
				$.landingPage.remove(loadingLabel);
				var match = null;
				try {
					match = JSON.parse(this.responseText);
					Ti.API.info("MATCH : " + JSON.stringify(match));
				} catch (e) {
					match = null;
					Ti.API.info("Match NULL");
				}	
					
				if (match !== null) {
					team1Logo.image = Alloy.Globals.BETKAMPENURL + match.team1_image;
					team2Logo.image = Alloy.Globals.BETKAMPENURL + match.team2_image;

					mid_img.addEventListener("click", function(e) {
						// check connection
						checkResponded(match);
						
					});
				}
			}

		} else {
			versusLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
			Ti.API.error("Error =>" + this.response);
			$.landingPage.remove(loadingLabel);
		}
	};

};

function checkResponded(match){
	Ti.API.info("CLIKCADE MACHENS MÄSTARE");
	indicator.openIndicator();
	if(Alloy.Globals.checkConnection()){
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onerror = function(e) {
			versusLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
			indicator.closeIndicator();
			Ti.API.error('Bad Sever =>' + e.error);
		};
	
		try {
			xhr.open('GET', Alloy.Globals.BETKAMPENGETMATCHOTDSTATUSURL + '?lang=' + Alloy.Globals.LOCALE + '&gameID=' + match.game_id);
			xhr.setRequestHeader("content-type", "application/json");
			xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
			xhr.setTimeout(Alloy.Globals.TIMEOUT);
			xhr.send();
		} catch(e) {
			Ti.API.info("FAIL : " + JSON.stringify(e));
			indicator.closeIndicator();
		}
	
		xhr.onload = function() {
			if (this.status == '200') {
				if (this.readyState == 4) {
						indicator.closeIndicator();
						var resp = null;
					try {
						Ti.API.info("RESPONSE INNAN PARSENNNN : " + JSON.stringify(this.responseText));
						resp = JSON.parse(this.responseText);
						
					} catch (e) {
						resp = null;
						//Ti.API.info("Match NULL");
					}
	
					if (resp == 2) {
						Ti.API.info("RESPONSE TOP : " + JSON.stringify(resp));
						var arg = {
							round : match.roundID,
							leagueName : match.leagueName,
							leagueId : match.leagueID,
							gameID : match.game_id,
							matchOTD : 1,
							bet_amount : match.bet_amount
						};

						var win = Alloy.createController('challenge', arg).getView();
						Alloy.Globals.WINDOWS.push(win);

						if (OS_IOS) {
							Alloy.Globals.NAV.openWindow(win, {
								animated : true
							});
						} else if (OS_ANDROID) {
							win.open({
								fullScreen : true
							});
						}
					}else if(resp == 1){
						var arg = {
							gameID : match.game_id,
						};

						var win = Alloy.createController('showMatchOTD', arg).getView();
						Alloy.Globals.WINDOWS.push(win);

						if (OS_IOS) {
							Alloy.Globals.NAV.openWindow(win, {
								animated : true
							});
						} else if (OS_ANDROID) {
							win.open({
								fullScreen : true
							});
						}
					}
				}
				
			} else {
				indicator.closeIndicator();
				Ti.API.error("Error =>" + this.response);
			}
		};
	}else{
		indicator.closeIndicator();
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
	}
}

//create the topView and the botView that will contain everything
var top_view = Ti.UI.createView({
	id: "top_view",
	backgroundColor: "#303030",
	height: "75%",
	width: "100%",
	//top: "10%",
	layout: "vertical"
});
	
var bot_view = Ti.UI.createView({
	backgroundColor: "#303030",
	id: "bot_view",
	height:"25%",
	width:"100%",
	layout: "horizontal"
});

//declare the views for each section
var top_img;
var mid_img;
var bot_img;

//delcare the logo variables to getMatchOfTheDay function can access them
var team1Logo;
var team2Logo;

if (OS_ANDROID) {
	$.landingPage.addEventListener('open', function() {
		$.landingPage.activity.actionBar.hide();
		getTopImgView();
		$.landingPage.add(top_view);
		$.landingPage.add(bot_view);
		getBeacons();
	
	});
} else if(OS_IOS){
	$.landingPage.addEventListener('open', function() {
		//fill each section and view with content
		getTopImgView();
		$.landingPage.add(top_view);
		$.landingPage.add(bot_view);
		getBeacons();
	});
}




/*var test = {
 title: "Hamburgarmeny!",
 text: "Passa på idag! Innan matchen är slut kostar en meny endast 25kr. Visa oss att du har appen installerad på mobilen för att få ta del av erbjudandet.",
 image: "hamburger-menu.png",
 button_link: "halfPot",
 };
 createPromoTypeThree(test);*/
