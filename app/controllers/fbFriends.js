var args = arguments[0] || {};

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
if (Alloy.Globals.FACEBOOKOBJECT == null) {

	//USER IS NOT CONNECTED WITH FACEBOOK----------------------------------------------------------------------------------------------------------------------------------

	var connectLabel = Ti.UI.createLabel({
		text : 'Du har inte loggat in med facebook' + '\n' + 'Koppla ditt konto för att se dina fb vänner', //Alloy.Globals.PHRASES.addFriendsTxt,
		textAlign : "center",
		top : 10,
		font : {
			fontSize : 18,
			fontFamily : "Impact"
		},
		color : "#FFF"
	});
	mainView.add(connectLabel);

	var connectBtn = Titanium.UI.createView({
		//title: Alloy.Globals.PHRASES.fbFriendsTxt,
		top : "5%",
		height : '10%',
		width : '80%',
		left : '10%',
		backgroundColor : '#3B5998',
		borderRadius : 5
	});
	mainView.add(connectBtn);

	var fbIconLabel = Titanium.UI.createLabel({
		font : {
			fontFamily : font,
			fontSize : 22
		},
		text : fontawesome.icon('fa-facebook'),
		left : '5%',
		color : '#fff',
	});
	connectBtn.add(fbIconLabel);

	var fbLabel = Titanium.UI.createLabel({
		text : 'Koppla ditt konto', //Alloy.Globals.PHRASES.fbFriendsTxt,
		font : {
			fontSize : 18,
			fontFamily : "Impact"
		},
		color : "#fff"
	});
	connectBtn.add(fbLabel);

	//search starting when you click searchbutton
	connectBtn.addEventListener('click', function(e) {
		alert('koppla ditt konto till facebook för att se dina fb vänner');
	});
} else {

	//USER IS CONNECTED WITH FACEBOOK-----------------------------------------------------------------------------------------------------------

	var faceBookLabel = Ti.UI.createLabel({
		text : 'välj facebook vänner som har appen' + '\n' + ' eller bjud in dom som inte har den', //Alloy.Globals.PHRASES.addFriendsTxt,
		textAlign : "center",
		top : 10,
		font : {
			fontSize : 18,
			fontFamily : "Impact"
		},
		color : "#FFF"
	});
	mainView.add(faceBookLabel);
	
	getFacebookFriends();

	function getFacebookFriends() {
		
		Titanium.Facebook.requestWithGraphPath('v2.1/me/friends?field=name', 'GET', function(e){
			var data = JSON.parse(e.result);
			Ti.API.info(data);
		});

	}

}

$.fbFriends.add(mainView);
