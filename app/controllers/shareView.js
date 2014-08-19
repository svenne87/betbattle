var args = arguments[0] || {};

var mainView = Ti.UI.createView({
	class : "topView",
	height:"100%",
	width: "100%",
	top:0,
	backgroundColor: "transparent",
	layout: "vertical"
});


var socialShareLabel = Ti.UI.createLabel({
	text: Alloy.Globals.PHRASES.shareSocial,
	textAlign: "center",
	top:30,
	font: {
		fontSize: 22,
		fontFamily: "Impact"
	},
	color: "#FFF"
});
mainView.add(socialShareLabel);

var fbBtn = Titanium.UI.createButton({
	title: Alloy.Globals.PHRASES.shareOnTxt+ " Facebook  ",
	top:40,
	height: 50,
	width: 260,
	left: '10%',
	backgroundColor: '#3B5998',
	color: '#fff',
	borderRadius: 3
});
mainView.add(fbBtn);
var fbIcon = Titanium.UI.createImageView({
		image: "/images/fb.png",
		height: 25,
		width: 25,
		left: 3
	});
	fbBtn.add(fbIcon);

var twitterBtn = Titanium.UI.createButton({
	title: Alloy.Globals.PHRASES.shareOnTxt+ " Twitter  ",
	top:5,
	height: 50,
	width: 260,
	textAlign: "center",
	left: '10%',
	backgroundColor: '#00ACED',
	color: '#fff',
	borderRadius: 3
});
mainView.add(twitterBtn);
var twitterIcon = Titanium.UI.createImageView({
		image: "/images/twitter.png",
		height: 25,
		width: 25,
		left: 5
	});
	twitterBtn.add(twitterIcon);

var googleBtn = Titanium.UI.createButton({
	title: Alloy.Globals.PHRASES.shareOnTxt+ " Google+  ",
	top:5,
	height: 50,
	width: 260,
	textAlign: "center",
	left: '10%',
	backgroundColor: '#DD4B39',
	color: '#fff',
	borderRadius: 3
});
mainView.add(googleBtn);
var googleIcon = Titanium.UI.createImageView({
		image: "/images/googleplus.png",
		height: 25,
		width: 25,
		left: 5
	});
	googleBtn.add(googleIcon);

if(OS_IOS){
	var appleBtn = Titanium.UI.createButton({
		title: Alloy.Globals.PHRASES.sendTxt+ " Mail  ",
		top:5,
		height: 50,
		width: 260,
		textAlign: "center",
		left: '10%',
		backgroundColor: '#fff',
		color: '#000',
		borderRadius: 3
});

	mainView.add(appleBtn);
	var appleIcon = Titanium.UI.createImageView({
		image: "/images/iosmail.png",
		height: 25,
		width: 25,
		left: 5
	});
	appleBtn.add(appleIcon);

	var iphoneSmsBtn = Titanium.UI.createButton({
		title: Alloy.Globals.PHRASES.sendTxt+ " SMS ",
		top:5,
		height: 50,
		width: 260,
		textAlign: "center",
		left: '10%',
		backgroundColor: '#fff',
		color: '#000',
		borderRadius: 3
});
	mainView.add(iphoneSmsBtn);
	
	var iossmsIcon = Titanium.UI.createImageView({
		image: "/images/iossms.png",
		height: 25,
		width: 25,
		left: 5
	});
	iphoneSmsBtn.add(iossmsIcon);
	
} else if(OS_ANDROID){
	var gmailBtn = Titanium.UI.createButton({
		title: Alloy.Globals.PHRASES.sendTxt+ " Mail  ",
		top:5,
		height: 50,
		width: 260,
		textAlign: "center",
		left: '10%',
		backgroundColor: '#fff',
		color: '#000',
		borderRadius: 3
	});

	mainView.add(gmailBtn);
	var gmailIcon = Titanium.UI.createImageView({
		image: "/images/gmail.png",
		height: 25,
		width: 25,
		left: 5
	});
	gmailBtn.add(gmailIcon);

	var androidSmsBtn = Titanium.UI.createButton({
		title: Alloy.Globals.PHRASES.sendTxt+ " SMS ",
		top:5,
		height: 50,
		width: 260,
		textAlign: "center",
		left: '10%',
		backgroundColor: '#fff',
		color: '#000',
		borderRadius: 3
	});
	mainView.add(androidSmsBtn);
	var androidIcon = Titanium.UI.createImageView({
		image: "/images/androidsms.png",
		height: 25,
		width: 25,
		left: 5
	});
	androidSmsBtn.add(androidIcon);
}

// functions for the buttons


// --------------------------------------------------------------- Share to FACEBOOK  ------------------------------------------------------------------------------
fbBtn.addEventListener('click', function(e){
	
	if (Alloy.Globals.checkConnection()) {	
		var facebookModuleError = true;		
		var fb = Alloy.Globals.FACEBOOK;
		
		if(OS_IOS) {
			var permissions = fb.getPermissions();
			
			if(permissions.indexOf('publish_actions') > -1){
				// already have permission
				facebookModuleError = false;
				performFacebookPost(fb);
			} else {
				fb.reauthorize(['publish_actions'], 'friends', function(e){
					facebookModuleError = false;
					
					if(e.success) {
						performFacebookPost(fb);
					} else {
						if(e.error && !e.cancelled){
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
		
		if(facebookModuleError){
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
   		description: Alloy.Globals.PHRASES.fbPostDescriptionTxt
    };
	
	indicator.openIndicator();
				
	// share
	fb.dialog('feed',
		data,
		function(event) {
			if(event.success && event.result) {
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
							xhr.setRequestHeader("Authorization", Alloy.Globals.FACEBOOK.accessToken);
							xhr.setTimeout(Alloy.Globals.TIMEOUT);

							// build the json string
							var param = '{"betkampen_id":"' + Alloy.Globals.BETKAMPENUID + '", "lang":"' + Alloy.Globals.LOCALE +'"}';

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
								
								if(response.indexOf('100 coins') > -1){
									Ti.App.fireEvent('updateCoins', {"coins" : 100});
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
				if(event.error && !event.cancelled){
					Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.facebookConnectionErrorTxt);
				} else {
					// cancel
				}
			}
		}
	);			
}

// --------------------------------------------------------------- Share to TWITTER  -------------------------------------------------------------------------------
if(OS_IOS){
	if(Titanium.Platform.canOpenURL('twitter://')){
		twitter = false;
	} else {
		twitter = true;
	}
}else if(OS_ANDROID){
	function shareToTwitter(){
		try{
			var intTwitter = Ti.Android.createIntent({
				action: Ti.Android.ACTION_SEND,
				packageName: 'com.twitter.android',
				flags: Ti.Android.FLAG_ACTIVITY_NEW_TASK,
				type: 'text/plain'
			});
			intTwitter.putExtra(Ti.Android.EXTRA_TEXT, 'hej hej detta är betkampen');
			Ti.Android.currentActivity.startActivity(intTwitter);
		}catch(x){
			alert('Hittar inte Twitters app. Har du den installerad?');
		}
	}
}
twitterBtn.addEventListener('click', function(e){
	if(OS_IOS){
		if(twitter == true){
			alert('du har inte installerat twitter');
		} else {
			Titanium.Platform.openURL('twitter://post?message=hej%20hej%20betkampen');
		}
		
	}else if(OS_ANDROID){
		shareToTwitter();
	}
	
});

// --------------------------------------------------------------- Share to GOOGLE+  -------------------------------------------------------------------------------

var goWin = Alloy.createController('gplus').getView();


googleBtn.addEventListener('click', function(e){
	if(OS_IOS){
		Alloy.Globals.NAV.openWindow(goWin, {
			animated : true
		});
	}else if (OS_ANDROID){
		goWin.open({
			fullScreen : true
		});
	}
});

// iPhone buttons
if(OS_IOS){
// --------------------------------------------------------------- Share to APPLE MAIL  ----------------------------------------------------------------------------
	var emailDialog = Titanium.UI.createEmailDialog();
	emailDialog.subject = 'Testa betkampen';
	emailDialog.messageBody = 'hej hej betkampen här';
	
	appleBtn.addEventListener('click', function(e){
		emailDialog.open();
	});

// --------------------------------------------------------------- Share to IOS SMS  -------------------------------------------------------------------------------
	var sms = require('bencoding.sms').createSMSDialog({ barColor:'#336699'
	});
	 sms.setMessageBody('hej hej betkampen här');
	 
	iphoneSmsBtn.addEventListener('click', function(e){
		sms.open();
	});
	
}
// Android Buttons
if(OS_ANDROID){
// --------------------------------------------------------------- Share to GMAIL  ---------------------------------------------------------------------------------
	var emailDialog = Titanium.UI.createEmailDialog();
	emailDialog.subject = 'Testa betkampen';
	emailDialog.messageBody = 'hej hej betkampen här';
	
	gmailBtn.addEventListener('click', function(e){
		emailDialog.open();
	});
// --------------------------------------------------------------- Share to SMS ANDROID  ---------------------------------------------------------------------------
	
	var intent = Ti.Android.createIntent({
		action: Ti.Android.ACTION_SENDTO,
		data: 'smsto:'
	});
	intent.putExtra('sms_body', 'hej hej detta är betkampen');
	
	androidSmsBtn.addEventListener('click', function(e){
		Ti.Android.currentActivity.startActivity(intent);
	});
}


$.share.add(mainView);

