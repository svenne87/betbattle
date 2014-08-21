var args = arguments[0] || {};

var fontawesome = require('lib/IconicFont').IconicFont({
	font : 'lib/FontAwesome'
});

var font = 'FontAwesome';

if (OS_ANDROID) {
	font = 'fontawesome-webfont';
}

var mainView = Ti.UI.createView({
	height:"100%",
	width: "100%",
	top:0,
	backgroundColor: "transparent",
	layout: "vertical"
});


var friendZoneLabel = Ti.UI.createLabel({
	text: Alloy.Globals.PHRASES.friendZoneTxt,
	textAlign: "center",
	top:10,
	font: {
		fontSize: 28,
		fontFamily: "Impact"
	},
	color: "#FFF"
});
mainView.add(friendZoneLabel);


var fbFriendBtn = Titanium.UI.createButton({
	//title: Alloy.Globals.PHRASES.fbFriendsTxt,
	top:"5%",
	height: 50,
	width: 260,
	left: '10%',
	font : {
		fontFamily : font,
		fontSize: 22
	},
	title: fontawesome.icon('fa-facebook'),
	backgroundColor: '#3B5998',
	color: '#fff',
	textAlign: "left",
	borderRadius: 5
});
mainView.add(fbFriendBtn);

fbLabel = Titanium.UI.createLabel({
	text:  Alloy.Globals.PHRASES.fbFriendsTxt,
	font: {
		fontSize: 18,
		fontFamily: "Impact"
	},
	color: "#fff"
});
fbFriendBtn.add(fbLabel);

var myFriendBtn = Titanium.UI.createButton({
	top:"1%",
	height: 50,
	width: 260,
	left: '10%',
	font : {
		fontFamily : font,
		fontSize: 22
	},
	title: fontawesome.icon('fa-user'),
	backgroundColor: '#fff',
	color: '#000',
	textAlign: "left",
	borderRadius: 5
});
mainView.add(myFriendBtn);

mFriendLabel = Titanium.UI.createLabel({
	text: Alloy.Globals.PHRASES.myFriendsTxt,
	font: {
		fontSize: 18,
		fontFamily: "Impact"
	},
	color: "#000000"
});
myFriendBtn.add(mFriendLabel);


var myGroupsBtn = Titanium.UI.createButton({
	top:"1%",
	height: 50,
	width: 260,
	left: '10%',
	font : {
		fontFamily : font,
		fontSize: 22
	},
	title: fontawesome.icon('fa-users'),
	backgroundColor: '#fff',
	color: '#000',
	textAlign: "left",
	borderRadius: 5
});
mainView.add(myGroupsBtn);

mGroupLabel = Titanium.UI.createLabel({
	text: Alloy.Globals.PHRASES.myGroupsTxt,
	font: {
		fontSize: 18,
		fontFamily: "Impact"
	},
	color: "#000000"
});
myGroupsBtn.add(mGroupLabel);

var addFriendsBtn = Titanium.UI.createButton({
	top:"10%",
	height: 50,
	width: 260,
	left: '10%',
	font : {
		fontFamily : font,
		fontSize: 22
	},
	title: fontawesome.icon('fa-plus'),
	backgroundColor: '#fff',
	color: '#000',
	textAlign: "left",
	borderRadius: 5
});
mainView.add(addFriendsBtn);

aFriendLabel = Titanium.UI.createLabel({
	text: Alloy.Globals.PHRASES.addFriendsTxt,
	font: {
		fontSize: 18,
		fontFamily: "Impact"
	},
	color: "#000000"
});
addFriendsBtn.add(aFriendLabel);

var createGroupBtn = Titanium.UI.createButton({
	top:"1%",
	height: 50,
	width: 260,
	left: '10%',
	font : {
		fontFamily : font,
		fontSize: 22
	},
	title: fontawesome.icon('fa-plus'),
	backgroundColor: '#fff',
	color: '#000',
	textAlign: "left",
	borderRadius: 5
});
mainView.add(createGroupBtn);

cGroupLabel = Titanium.UI.createLabel({
	text: Alloy.Globals.PHRASES.createGroupTxt,
	font: {
		fontSize: 18,
		fontFamily: "Impact"
	},
	color: "#000000"
});
createGroupBtn.add(cGroupLabel);

var shareBtn = Titanium.UI.createButton({
	top:"1%",
	height: 50,
	width: 260,
	left: '10%',
	font : {
		fontFamily : font,
		fontSize: 22
	},
	title: fontawesome.icon('fa-share-alt'),
	backgroundColor: '#fff',
	color: '#000',
	textAlign: "left",
	borderRadius: 5
});
mainView.add(shareBtn);

shareLabel = Titanium.UI.createLabel({
	text: Alloy.Globals.PHRASES.inviteFriendsTxt,
	font: {
		fontSize: 18,
		fontFamily: "Impact"
	},
	color: "#000000"
});
shareBtn.add(shareLabel);






$.friendZone.add(mainView);

