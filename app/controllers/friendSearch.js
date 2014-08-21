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

var searchLabel = Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.addFriendsTxt,
	textAlign : "center",
	top : 10,
	font : {
		fontSize : 22,
		fontFamily : "Impact"
	},
	color : "#FFF"
});
mainView.add(searchLabel);

var search = Ti.UI.createTextField({
	top: 20,
	hintText: Alloy.Globals.PHRASES.searchTxt,
	width: "80%",
	font: {
		fontSize: 15
	},
	height: 50,
	color:'#336699',
    keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
    returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
    borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
	
});
mainView.add(search);



$.friendSearch.add(mainView);
