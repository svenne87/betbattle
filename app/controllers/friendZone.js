var args = arguments[0] || {};

var fontawesome = require('lib/IconicFont').IconicFont({
	font : 'lib/FontAwesome'
});

var font = 'FontAwesome';

if (OS_ANDROID) {
	font = 'fontawesome-webfont';
}

var mainView = Ti.UI.createScrollView({
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


var fbFriendBtn = Titanium.UI.createView({
	//title: Alloy.Globals.PHRASES.fbFriendsTxt,
	top:"5%",
	height: '10%',
	width: '80%',
	left: '10%',
	backgroundColor: '#3B5998',
	borderRadius: 5
});
mainView.add(fbFriendBtn);

var fbIconLabel = Titanium.UI.createLabel({
	font : {
		fontFamily : font,
		fontSize: 22
	},
	text: fontawesome.icon('fa-facebook'),
	left: '5%',
	color: '#fff',
});
fbFriendBtn.add(fbIconLabel);

var fbLabel = Titanium.UI.createLabel({
	text:  Alloy.Globals.PHRASES.fbFriendsTxt,
	font: {
		fontSize: 18,
		fontFamily: "Impact"
	},
	color: "#fff"
});
fbFriendBtn.add(fbLabel);

var myFriendBtn = Titanium.UI.createView({
	top:"1%",
	height: '10%',
	width: '80%',
	left: '10%',
	backgroundColor: '#fff',
	borderRadius: 5
});
mainView.add(myFriendBtn);

var mFIconLabel = Titanium.UI.createLabel({
	font : {
		fontFamily : font,
		fontSize: 22
	},
	text: fontawesome.icon('fa-user'),
	left: '5%',
	color: '#000',
});
myFriendBtn.add(mFIconLabel);

var mFriendLabel = Titanium.UI.createLabel({
	text: Alloy.Globals.PHRASES.myFriendsTxt,
	font: {
		fontSize: 18,
		fontFamily: "Impact"
	},
	color: "#000000"
});
myFriendBtn.add(mFriendLabel);


var myGroupsBtn = Titanium.UI.createView({
	top:"1%",
	height: '10%',
	width: '80%',
	left: '10%',
	backgroundColor: '#fff',
	borderRadius: 5
});
mainView.add(myGroupsBtn);

var mgIconLabel = Titanium.UI.createLabel({
	font : {
		fontFamily : font,
		fontSize: 22
	},
	text: fontawesome.icon('fa-users'),
	left: '5%',
	color: '#000',
});
myGroupsBtn.add(mgIconLabel);

var mGroupLabel = Titanium.UI.createLabel({
	text: Alloy.Globals.PHRASES.myGroupsTxt,
	font: {
		fontSize: 18,
		fontFamily: "Impact"
	},
	color: "#000000"
});
myGroupsBtn.add(mGroupLabel);

var addFriendsBtn = Titanium.UI.createView({
	top:"10%",
	height: '10%',
	width: '80%',
	left: '10%',
	backgroundColor: '#fff',
	borderRadius: 5
});
mainView.add(addFriendsBtn);

var afIconLabel = Titanium.UI.createLabel({
	font : {
		fontFamily : font,
		fontSize: 22
	},
	text: fontawesome.icon('fa-plus'),
	left: '5%',
	color: '#000',
});
addFriendsBtn.add(afIconLabel);

var aFriendLabel = Titanium.UI.createLabel({
	text: Alloy.Globals.PHRASES.addFriendsTxt,
	font: {
		fontSize: 18,
		fontFamily: "Impact"
	},
	color: "#000000"
});
addFriendsBtn.add(aFriendLabel);

var createGroupBtn = Titanium.UI.createView({
	top:"1%",
	height: '10%',
	width: '80%',
	left: '10%',
	backgroundColor: '#fff',
	borderRadius: 5
});
mainView.add(createGroupBtn);

var cgIconLabel = Titanium.UI.createLabel({
	font : {
		fontFamily : font,
		fontSize: 22
	},
	text: fontawesome.icon('fa-plus'),
	left: '5%',
	color: '#000',
});
createGroupBtn.add(cgIconLabel);

cGroupLabel = Titanium.UI.createLabel({
	text: Alloy.Globals.PHRASES.createGroupTxt,
	font: {
		fontSize: 18,
		fontFamily: "Impact"
	},
	color: "#000000"
});
createGroupBtn.add(cGroupLabel);

var shareBtn = Titanium.UI.createView({
	top:"1%",
	height: '10%',
	width: '80%',
	left: '10%',
	backgroundColor: '#fff',
	borderRadius: 5
});
mainView.add(shareBtn);

var sIconLabel = Titanium.UI.createLabel({
	font : {
		fontFamily : font,
		fontSize: 22
	},
	text: fontawesome.icon('fa-share-alt'),
	left: '5%',
	color: '#000',
});
shareBtn.add(sIconLabel);

shareLabel = Titanium.UI.createLabel({
	text: Alloy.Globals.PHRASES.inviteFriendsTxt,
	font: {
		fontSize: 18,
		fontFamily: "Impact"
	},
	color: "#000000"
});
shareBtn.add(shareLabel);

fbFriendBtn.addEventListener('click', function(e){
	// check connection
	if (!Alloy.Globals.checkConnection()) {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
		return;
	}
	
	var win = Alloy.createController('fbFriends').getView();
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
myFriendBtn.addEventListener('click', function(e){
	// check connection
	if (!Alloy.Globals.checkConnection()) {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
		return;
	}
	
	var win = Alloy.createController('myFriends').getView();
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

myGroupsBtn.addEventListener('click', function(e){
	// check connection
	if (!Alloy.Globals.checkConnection()) {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
		return;
	}
	
	var win = Alloy.createController('myGroups').getView();
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

addFriendsBtn.addEventListener('click', function(e){
	// check connection
	if (!Alloy.Globals.checkConnection()) {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
		return;
	}
	
	var win = Alloy.createController('friendSearch').getView();
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

createGroupBtn.addEventListener('click', function(e){
	// check connection
	if (!Alloy.Globals.checkConnection()) {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
		return;
	}
	
	var win = Alloy.createController('createGroup').getView();
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

shareBtn.addEventListener('click', function(e){
	// check connection
	if (!Alloy.Globals.checkConnection()) {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
		return;
	}
	
	var win = Alloy.createController('shareView').getView();
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


$.friendZone.addEventListener('open', function() {
	$.friendZone.activity.actionBar.onHomeIconItemSelected = function() {
		$.friendZone.close();
		$.friendZone = null;
	};
	$.friendZone.activity.actionBar.displayHomeAsUp = true;
	$.friendZone.activity.actionBar.title = Alloy.Globals.PHRASES.betbattleTxt;
});

$.friendZone.add(mainView);

