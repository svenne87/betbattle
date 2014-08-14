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
	top:10,
	font: {
		fontSize: 18,
		fontFamily: "Impact"
	},
	color: "#FFF"
});
mainView.add(socialShareLabel);

var fbBtn = Titanium.UI.createButton({
	title: Alloy.Globals.PHRASES.shareOnTxt+ " Facebook  ",
	top:40,
	height: 40,
	width: 220,
	textAlign: "right",
	left: '15.5%',
	backgroundColor: '#3B5998',
	color: '#fff',
	borderRadius: 3
});
mainView.add(fbBtn);

var instaBtn = Titanium.UI.createButton({
	title: Alloy.Globals.PHRASES.shareOnTxt+ " Instagram  ",
	top:5,
	height: 40,
	width: 220,
	textAlign: "right",
	left: '15.5%',
	backgroundColor: '#4E433C',
	color: '#fff',
	borderRadius: 3
});
mainView.add(instaBtn);

var twitterBtn = Titanium.UI.createButton({
	title: Alloy.Globals.PHRASES.shareOnTxt+ " Twitter  ",
	top:5,
	height: 40,
	width: 220,
	textAlign: "right",
	left: '15.5%',
	backgroundColor: '#00ACED',
	color: '#fff',
	borderRadius: 3
});
mainView.add(twitterBtn);

var messengerBtn = Titanium.UI.createButton({
	title: Alloy.Globals.PHRASES.shareOnTxt+ " Messenger  ",
	top:5,
	height: 40,
	width: 220,
	textAlign: "right",
	left: '15.5%',
	backgroundColor: '#0087FF',
	color: '#fff',
	borderRadius: 3
});
mainView.add(messengerBtn);

var googleBtn = Titanium.UI.createButton({
	title: Alloy.Globals.PHRASES.shareOnTxt+ " Google+  ",
	top:5,
	height: 40,
	width: 220,
	textAlign: "right",
	left: '15.5%',
	backgroundColor: '#DD4B39',
	color: '#fff',
	borderRadius: 3
});
mainView.add(googleBtn);

if(OS_IOS){
	var appleBtn = Titanium.UI.createButton({
		title: Alloy.Globals.PHRASES.sendTxt+ " AppleMail  ",
		top:5,
		height: 40,
		width: 220,
		textAlign: "right",
		left: '15.5%',
		backgroundColor: '#fff',
		color: '#000',
		borderRadius: 3
});

	mainView.add(appleBtn);

	var iphoneSmsBtn = Titanium.UI.createButton({
		title: Alloy.Globals.PHRASES.sendTxt+ " SMS ",
		top:5,
		height: 40,
		width: 220,
		textAlign: "right",
		left: '15.5%',
		backgroundColor: '#fff',
		color: '#000',
		borderRadius: 3
});
	mainView.add(iphoneSmsBtn);
} else if(OS_ANDROID){
	var gmailBtn = Titanium.UI.createButton({
		title: Alloy.Globals.PHRASES.sendTxt+ " GMail  ",
		top:5,
		height: 40,
		width: 220,
		textAlign: "right",
		left: '15.5%',
		backgroundColor: '#fff',
		color: '#000',
		borderRadius: 3
});

	mainView.add(gmailBtn);

	var androidSmsBtn = Titanium.UI.createButton({
		title: Alloy.Globals.PHRASES.sendTxt+ " SMS ",
		top:5,
		height: 40,
		width: 220,
		textAlign: "right",
		left: '15.5%',
		backgroundColor: '#fff',
		color: '#000',
		borderRadius: 3
});
	mainView.add(androidSmsBtn);
}


$.share.add(mainView);

