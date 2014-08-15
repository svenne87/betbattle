var args = arguments[0] || {};
var isIos = false;
if(OS_IOS){
	if(Titanium.Platform.canOpenURL('fb://profile')){
		Titanium.Facebook.forceDialogAuth = false;
	} else {
		Titanium.Facebook.forceDialogAuth = true;
	}
}
var instagram;
if(OS_IOS){
	if(Titanium.Platform.canOpenURL('instagram://app')){
		instagram = false;
	} else {
		instagram = true;
	}
}

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
		image: "images/fb.png",
		height: 25,
		width: 25,
		left: 3
	});
	fbBtn.add(fbIcon);

var instaBtn = Titanium.UI.createButton({
	title: Alloy.Globals.PHRASES.shareOnTxt+ " Instagram  ",
	top:5,
	height: 50,
	width: 260,
	textAlign: "center",
	left: '10%',
	backgroundColor: '#4E433C',
	color: '#fff',
	borderRadius: 3
});
mainView.add(instaBtn);
var instaIcon = Titanium.UI.createImageView({
		image: "images/insta.png",
		height: 25,
		width: 25,
		left: 5
	});
	instaBtn.add(instaIcon);

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
		image: "images/twitter.png",
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
		image: "images/googleplus.png",
		height: 25,
		width: 25,
		left: 5
	});
	googleBtn.add(googleIcon);

if(OS_IOS){
	var appleBtn = Titanium.UI.createButton({
		title: Alloy.Globals.PHRASES.sendTxt+ " Apple Mail  ",
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
		image: "images/iosmail.png",
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
		image: "images/iossms.PNG",
		height: 25,
		width: 25,
		left: 5
	});
	iphoneSmsBtn.add(iossmsIcon);
	
} else if(OS_ANDROID){
	var gmailBtn = Titanium.UI.createButton({
		title: Alloy.Globals.PHRASES.sendTxt+ " GMail  ",
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
		image: "images/gmail.png",
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
		image: "images/androidsms.png",
		height: 25,
		width: 25,
		left: 5
	});
	androidSmsBtn.add(androidIcon);
}

// functions for the buttons


// --------------------------------------------------------------- Share to FACEBOOK  ------------------------------------------------------------------------------
fbBtn.addEventListener('click', function(e){
	
	if(Titanium.Facebook.forceDialogAuth == true){
		alert('du har inte installerat fb');
	} else {
		alert('Du har fb :):):)');
	}
	
});

// --------------------------------------------------------------- Share to INSTAGRAM  -----------------------------------------------------------------------------

instaBtn.addEventListener('click', function(e){
	if(instagram == true){
		alert('du har inte installerat instagram');
	} else {
		alert('Du har instagram :):):)');
	}
});

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
				className: 'com.twitter.android.PostActivity',
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
function gplus(){
var win = Ti.UI.createWindow({
    barColor: '#000',
    navBarHidden: true
});
var textToShare = encodeURIComponent('hej hej betkampen');
var webView = Ti.UI.createWebView({
    url: 'https://plus.google.com/share?text='+textToShare        
});
win.add(webView);
var close = Ti.UI.createButton({
    title: 'Close'
});
close.addEventListener('click', function () {
    win.close();
});
win.open({modal: true});
 
webView.addEventListener('load', function (e) {
    if (e.url.indexOf('https://accounts.google.com') == -1) {
        win.hideNavBar();
    } else {
        win.showNavBar();
        win.setLeftNavButton(close);
    }
});
webView.addEventListener('error', function (e) {
    win.close();
});
}

googleBtn.addEventListener('click', function(e){
	gplus();
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

