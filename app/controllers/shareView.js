if (OS_ANDROID) {
	$.share.orientationModes = [Titanium.UI.PORTRAIT];

	$.share.addEventListener('open', function() {
		Alloy.Globals.setAndroidCouponMenu($.share.activity);
		
		$.share.activity.actionBar.onHomeIconItemSelected = function() {
			$.share.close();
			$.share = null;
		};
		$.share.activity.actionBar.displayHomeAsUp = true;
		$.share.activity.actionBar.title = Alloy.Globals.PHRASES.betbattleTxt;
	});
}
checkRatestatus();


var fontawesome = require('lib/IconicFont').IconicFont({
	font : 'lib/FontAwesome'
});

var font = 'FontAwesome';

if (OS_ANDROID) {
	font = 'fontawesome-webfont';
}

var mainView = Ti.UI.createScrollView({
	class : "topView",
	height : "100%",
	width : "100%",
	top : 0,
	backgroundColor : "transparent",
	layout : "vertical"
});

var socialShareLabel = Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.shareSocial,
	textAlign : "center",
	top : 30,
	font : {
		fontSize : 22,
		fontFamily : "Impact"
	},
	color : "#FFF"
});
mainView.add(socialShareLabel);
//----------------------------------------------------------------------EMAIL-----------------------------------------------------------------------------
var mailBtn = Titanium.UI.createView({
	top : "4%",
	height : '11%',
	width : '80%',
	left : '10%',
	backgroundColor : '#fff',
	borderRadius : 5
});
mainView.add(mailBtn);

var mailIconLabel = Titanium.UI.createLabel({
	font : {
		fontFamily : font,
		fontSize : 22
	},
	text : fontawesome.icon('fa-file-text-o'),
	left : '5%',
	color : '#000',
});
mailBtn.add(mailIconLabel);

mailLabel = Titanium.UI.createLabel({
	text : Alloy.Globals.PHRASES.sendMailTxt,
	font : {
		fontSize : 18,
		fontFamily : "Impact"
	},
	color : "#000000"
});
mailBtn.add(mailLabel);
//----------------------------------------------------------------------SMS-----------------------------------------------------------------------------
var smsBtn = Titanium.UI.createView({
	top : "2%",
	height : '11%',
	width : '80%',
	left : '10%',
	backgroundColor : '#fff',
	borderRadius : 5
});
mainView.add(smsBtn);

var smsIconLabel = Titanium.UI.createLabel({
	font : {
		fontFamily : font,
		fontSize : 22
	},
	text : fontawesome.icon('fa-mobile'),
	left : '5%',
	color : '#000',
});
smsBtn.add(smsIconLabel);

smsLabel = Titanium.UI.createLabel({
	text : Alloy.Globals.PHRASES.sendSMSTxt,
	font : {
		fontSize : 18,
		fontFamily : "Impact"
	},
	color : "#000000"
});
smsBtn.add(smsLabel);
//----------------------------------------------------------------------FACEBOOK-----------------------------------------------------------------------------
if (Alloy.Globals.FACEBOOKOBJECT == null) {
	var fbBtn = Titanium.UI.createView({
		top : "2%",
		height : '11%',
		width : '80%',
		left : '10%',
		backgroundColor : '#3B5998',
		borderRadius : 5
	});
	mainView.add(fbBtn);

	var fbIconLabel = Titanium.UI.createLabel({
		font : {
			fontFamily : font,
			fontSize : 22
		},
		text : fontawesome.icon('fa-facebook'),
		left : '5%',
		color : '#fff',
	});
	fbBtn.add(fbIconLabel);

	fbLabel = Titanium.UI.createLabel({
		text : Alloy.Globals.PHRASES.shareFBTxt,
		font : {
			fontSize : 18,
			fontFamily : "Impact"
		},
		color : "#FFF"
	});
	fbBtn.add(fbLabel);
} else {
	var fbUserBtn = Titanium.UI.createView({
		top : "2%",
		height : '11%',
		width : '80%',
		left : '10%',
		backgroundColor : '#3B5998',
		borderRadius : 5
	});
	mainView.add(fbUserBtn);

	var fbIconLabel = Titanium.UI.createLabel({
		font : {
			fontFamily : font,
			fontSize : 22
		},
		text : fontawesome.icon('fa-facebook'),
		left : '5%',
		color : '#fff',
	});
	fbUserBtn.add(fbIconLabel);

	fbLabel = Titanium.UI.createLabel({
		text : Alloy.Globals.PHRASES.shareFBTxt,
		font : {
			fontSize : 18,
			fontFamily : "Impact"
		},
		color : "#FFF"
	});
	fbUserBtn.add(fbLabel);
}
//-------------------------------------------------------------------TWITTER--------------------------------------------------------------------------------
var twitterBtn = Titanium.UI.createView({
	top : "2%",
	height : '11%',
	width : '80%',
	left : '10%',
	backgroundColor : '#00ACED',
	borderRadius : 5
});
mainView.add(twitterBtn);

var twitterIconLabel = Titanium.UI.createLabel({
	font : {
		fontFamily : font,
		fontSize : 22
	},
	text : fontawesome.icon('fa-twitter'),
	left : '5%',
	color : '#fff',
});
twitterBtn.add(twitterIconLabel);

twitterLabel = Titanium.UI.createLabel({
	text : Alloy.Globals.PHRASES.shareTwitterTxt,
	font : {
		fontSize : 18,
		fontFamily : "Impact"
	},
	color : "#FFF"
});
twitterBtn.add(twitterLabel);
//---------------------------------------------------------------------------------------------------------------------------------------------------
var googleBtn = Titanium.UI.createView({
	top : "2%",
	height : '11%',
	width : '80%',
	left : '10%',
	backgroundColor : '#DD4B39',
	borderRadius : 5
});
mainView.add(googleBtn);

var gplusIconLabel = Titanium.UI.createLabel({
	font : {
		fontFamily : font,
		fontSize : 22
	},
	text : fontawesome.icon('fa-google-plus'),
	left : '5%',
	color : '#fff',
});
googleBtn.add(gplusIconLabel);

googleLabel = Titanium.UI.createLabel({
	text : Alloy.Globals.PHRASES.shareGoogleTxt,
	font : {
		fontSize : 18,
		fontFamily : "Impact"
	},
	color : "#FFF"
});
googleBtn.add(googleLabel);

// functions for the buttons

// --------------------------------------------------------------- Share to FACEBOOK  ------------------------------------------------------------------------------
// if user login with email
if (Alloy.Globals.FACEBOOKOBJECT == null) {

	if (OS_IOS) {
		if (Titanium.Platform.canOpenURL('fb://')) {
			fejjan = false;
		} else {
			fejjan = true;
		}
	} else if (OS_ANDROID) {
		function shareToFejjan() {
			try {
				var intFejs = Ti.Android.createIntent({
					action : Ti.Android.ACTION_SEND,
					packageName : 'com.facebook.katana',
					flags : Ti.Android.FLAG_ACTIVITY_NEW_TASK,
					type : 'text/plain'
				});
				intFejs.putExtra(Ti.Android.EXTRA_TEXT, Alloy.Globals.PHRASES.twitterMsg);
				Ti.Android.currentActivity.startActivity(intTwitter);
			} catch(x) {
				alert(Alloy.Globals.PHRASES.notInstalledTxt + ' ' + 'Facebook');
			}
		}

	}

	fbBtn.addEventListener('click', function(e) {
		if (OS_IOS) {
			if (fejjan == true) {
				alert(Alloy.Globals.PHRASES.notInstalledTxt + ' ' + 'facebook');
			} else {
				Titanium.Platform.openURL('fb://publish');
			}

		} else if (OS_ANDROID) {
			shareToFejjan();
		}
	});
} else {
	//if user login with fb
	fbUserBtn.addEventListener('click', function(e) {
		if (Alloy.Globals.checkConnection()) {
			var facebookModuleError = true;
			var fb = Alloy.Globals.FACEBOOK;

			if (OS_IOS) {
				var permissions = fb.getPermissions();

				if (permissions.indexOf('publish_actions') > -1) {
					// already have permission
					facebookModuleError = false;
					performFacebookPost(fb);
				} else {
					fb.reauthorize(['publish_actions'], 'friends', function(e) {
						facebookModuleError = false;

						if (e.success) {
							performFacebookPost(fb);
						} else {
							if (e.error && !e.cancelled) {
								Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.facebookConnectionErrorTxt);
							} else {

							}
						}
					});
				}
			} else {
				facebookModuleError = false;
				performFacebookPost(fb);
			}

			if (facebookModuleError) {
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.unknownFacebookErrorTxt);
			}
		} else {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
		}

	});
	var uie = require('lib/IndicatorWindow');
	var indicator = uie.createIndicatorWindow({
		top : 200,
		text : Alloy.Globals.PHRASES.loadingTxt
	});

	function performFacebookPost(fb) {
		var data = {
			link : Alloy.Globals.BETKAMPENURL,
			name : Alloy.Globals.PHRASES.fbPostNameTxt,
			caption : Alloy.Globals.PHRASES.fbPostCaptionTxt,
			picture : Alloy.Globals.BETKAMPENURL + '/images/log_bk.png',
			description : Alloy.Globals.PHRASES.fbPostDescriptionTxt
		};

		indicator.openIndicator();

		// share
		fb.dialog('feed', data, function(event) {
			if (event.success && event.result) {
				// shared success

				// check connection
				if (Alloy.Globals.checkConnection()) {
					var xhr = Titanium.Network.createHTTPClient();
					xhr.onerror = function(e) {
						Ti.API.error('Bad Sever =>' + e.error);
						indicator.closeIndicator();
						Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
					};

					try {
						xhr.open('POST', Alloy.Globals.BETKAMPENSHAREURL);
						xhr.setRequestHeader("content-type", "application/json");
						xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
						xhr.setTimeout(Alloy.Globals.TIMEOUT);

						// build the json string
						var param = '{"betkampen_id":"' + Alloy.Globals.BETKAMPENUID + '", "lang":"' + Alloy.Globals.LOCALE + '"}';

						xhr.send(param);
					} catch(e) {
						indicator.closeIndicator();
						Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
					}

					xhr.onload = function() {
						if (this.status == '200') {
							indicator.closeIndicator();

							if (this.readyState == 4) {
								var response = '';
								try {
									response = JSON.parse(this.responseText);
								} catch(e) {

								}

								if (response.indexOf('100 coins') > -1) {
									Ti.App.fireEvent('updateCoins', {
										"coins" : 100
									});
								}
								Alloy.Globals.showFeedbackDialog(response);

								Ti.API.log(response);
							} else {
								Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
							}
						} else {
							indicator.closeIndicator();
							Ti.API.error("Error =>" + JSON.parse(this.responseText));
							Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
						}
					};
				} else {
					indicator.closeIndicator();
					Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionError);
				}

			} else {
				indicator.closeIndicator();
				if (event.error && !event.cancelled) {
					Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.facebookConnectionErrorTxt);
				} else {
					// cancel
				}
			}
		});
	}

}

// --------------------------------------------------------------- Share to TWITTER  -------------------------------------------------------------------------------
if (OS_IOS) {
	if (Titanium.Platform.canOpenURL('twitter://')) {
		twitter = false;
	} else {
		twitter = true;
	}
} else if (OS_ANDROID) {
	function shareToTwitter() {
		try {
			var intTwitter = Ti.Android.createIntent({
				action : Ti.Android.ACTION_SEND,
				packageName : 'com.twitter.android',
				flags : Ti.Android.FLAG_ACTIVITY_NEW_TASK,
				type : 'text/plain'
			});
			intTwitter.putExtra(Ti.Android.EXTRA_TEXT, Alloy.Globals.PHRASES.twitterMsg);
			Ti.Android.currentActivity.startActivity(intTwitter);
		} catch(x) {
			alert(Alloy.Globals.PHRASES.notInstalledTxt + ' ' + 'Twitter');
		}
	}

}
twitterBtn.addEventListener('click', function(e) {
	if (OS_IOS) {
		if (twitter == true) {
			alert(Alloy.Globals.PHRASES.notInstalledTxt + ' ' + 'Twitter');
		} else {
			Titanium.Platform.openURL('twitter://post?message=' + Alloy.Globals.PHRASES.twitterMsg);
		}

	} else if (OS_ANDROID) {
		shareToTwitter();
	}

});

// --------------------------------------------------------------- Share to GOOGLE+  -------------------------------------------------------------------------------

var goWin = Alloy.createController('gplus').getView();

googleBtn.addEventListener('click', function(e) {
	if (OS_IOS) {
		Alloy.Globals.NAV.openWindow(goWin, {
			animated : true
		});
	} else if (OS_ANDROID) {
		goWin.open({
			fullScreen : true
		});
	}
});

// iPhone buttons

// --------------------------------------------------------------- Send EMAIL  ----------------------------------------------------------------------------

var emailDialog = Titanium.UI.createEmailDialog();
emailDialog.subject = Alloy.Globals.PHRASES.mailSubject;
emailDialog.messageBody = Alloy.Globals.PHRASES.mailMsg;

mailBtn.addEventListener('click', function(e) {
	emailDialog.open();
});

// --------------------------------------------------------------- Send SMS  -------------------------------------------------------------------------------
if (OS_IOS) {
	var sms = require('bencoding.sms').createSMSDialog({
		barColor : '#336699'
	});
	sms.setMessageBody(Alloy.Globals.PHRASES.smsMsg);

	smsBtn.addEventListener('click', function(e) {
		sms.open();
	});

} else if (OS_ANDROID) {

	var intent = Ti.Android.createIntent({
		action : Ti.Android.ACTION_SENDTO,
		data : 'smsto:'
	});
	intent.putExtra('sms_body', "'" + Alloy.Globals.PHRASES.smsMsg + "'");

	smsBtn.addEventListener('click', function(e) {
		Ti.Android.currentActivity.startActivity(intent);
	});

}

function checkRatestatus() {
	var rate_status = 0;
	var xhr = Ti.Network.createHTTPClient({
		onload : function(e) {
			Ti.API.info("Received text: " + this.responseText);
			var status = JSON.parse(this.responseText);
			//alert(status.data[0].rated);
			if (status.data[0].rated == 0){
				var rateAlert = Ti.UI.createAlertDialog({
					title: Alloy.Globals.PHRASES.betbattleTxt,
					message: Alloy.Globals.PHRASES.rateMeTxt,
					buttonNames: [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.remindMeTxt, Alloy.Globals.PHRASES.dontRemindMeTxt],
					cancel: 2
				});
				rateAlert.addEventListener('click', function(e){
					switch(e.index){
						case 0:
							if (OS_IOS){
								Ti.Platform.openURL("http://itunes.apple.com/app/id884939881");
								//Ti.Platform.openURL('itms-apps://itunes.apple.com/app/id884939881');
							}else if(OS_ANDROID){
								Ti.Platform.openURL("market://details?id=apps.topgame.betkampen");
							}
							rate_status = 2;
							setRateStatus(rate_status);
							break;
						case 1: 
							alert('du vill bli påmind :|');
							rate_status = 0;
							setRateStatus(rate_status);
							break;
						case 2: 
							alert('dumma dig :(');
							rate_status = 1;
							setRateStatus(rate_status);
							break;
					}
				});
				rateAlert.show(); 
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
function setRateStatus(rate_status){
	Ti.API.info(rate_status);
	var addFriends = Ti.Network.createHTTPClient();
			addFriends.open("POST", Alloy.Globals.BETKAMPENSETRATESTATUS);
			var params = {
				uid : Alloy.Globals.BETKAMPENUID,
				rate_status : rate_status
			};
			addFriends.send(params);
}

$.share.add(mainView); 