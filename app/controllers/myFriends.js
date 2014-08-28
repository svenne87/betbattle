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

var friendLabel = Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.myFriendsTxt,
	textAlign : "center",
	top : 10,
	font : {
		fontSize : 22,
		fontFamily : "Impact"
	},
	color : "#FFF"
});
mainView.add(friendLabel);

var infoTxt = Ti.UI.createView({
	top:20,
	backgroundColor : '#EA7337',
	backgroundGradient : {
		type : "linear",
		startPoint : {
			x : "0%",
			y : "0%"
		},
		endPoint : {
			x : "0%",
			y : "100%"
		},
		colors : [{
			color : "#F09C00",
		}, {
			color : "#D85000",
		}]
	},
	width : "100%",
	height : 30

});
mainView.add(infoTxt); 

var nameInfo = Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.nameTxt,
	left : '10%',
	color : "#fff",
	font : {
		fontSize : 18,
		fontFamily : "Impact"
	},
});
infoTxt.add(nameInfo);

var scoreInfo = Ti.UI.createLabel({
	text : 'Ta bort',//Alloy.Globals.PHRASES.pointsTxt,
	left : '82%',
	color : "#fff",
	font : {
		fontSize : 18,
		fontFamily : "Impact"
	},
});
infoTxt.add(scoreInfo);

function createGUI(obj){
	var friend = Ti.UI.createView({
		top : '0.4%',
		width : "100%",
		height : 40,

	});
	mainView.add(friend);

	var friendInfo = Ti.UI.createView({
		backgroundColor : '#fff',
		width : "82.5%",
		left : "1%",
		opacity : 0.7,
		borderRadius : 10
	});

	friend.add(friendInfo);

	var profilePic = Titanium.UI.createImageView({
		image : "/images/no_pic.png",
		height : 25,
		width : 25,
		left : '2%'
	});
	friendInfo.add(profilePic);

	var name = Ti.UI.createLabel({
		text : obj.name,
		left : '15%',
		font : {
			fontSize : 14
		},
	});
	friendInfo.add(name);

	var deleteBtn = Ti.UI.createButton({
		top : "0.4%",
		//height : '8%',
		width : '15%',
		left : '84%',
		font : {
			fontFamily : font,
			fontSize : 27
		},
		title : fontawesome.icon('fa-trash-o'),
		backgroundColor : '#fff',
		color : '#000',
		opacity : 0.7,
		borderRadius : 10
	});
	friend.add(deleteBtn);

deleteBtn.addEventListener('click', function(e) {
		alert('vill du ta bort mig?? ' + i);
	});

}


var xhr = Ti.Network.createHTTPClient({
	// function called when the response data is available
	onload : function(e) {
		Ti.API.info("Received text: " + this.responseText);
		var friends = JSON.parse(this.responseText);

		for (var i = 0; i < friends.length; i++) {
			//alert(friends[i].name);
			createGUI(friends[i], i);
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
xhr.open('GET', Alloy.Globals.BETKAMPENGETFRIENDSURL + '?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);

xhr.setRequestHeader("content-type", "application/json");
xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
xhr.setTimeout(Alloy.Globals.TIMEOUT);

xhr.send();


$.myFriends.add(mainView);
