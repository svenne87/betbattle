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
	top : 20,
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
	text : Alloy.Globals.PHRASES.deleteTxt,
	left : '82%',
	color : "#fff",
	font : {
		fontSize : 18,
		fontFamily : "Impact"
	},
});
infoTxt.add(scoreInfo);

function createGUI(obj) {
	if (OS_ANDROID) {
		var friend = Ti.UI.createView({
			top : '0.4%',
			width : "100%",
			height : 35,

		});
	} else if (OS_IOS) {
		var friend = Ti.UI.createView({
			top : '0.4%',
			width : "100%",
			height : '6.5%',

		});
	}
	mainView.add(friend);

	var friendInfo = Ti.UI.createView({
		backgroundColor : '#fff',
		width : "82.5%",
		left : "1%",
		opacity : 0.7,
		borderRadius : 5
	});

	friend.add(friendInfo);
	
	//profilepicture
	var image;
	if(obj.fbid !== null) {
		image = "https://graph.facebook.com/"+ obj.fbid +"/picture?type=large";
	} else {
		// get betkampen image
		image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + obj.id + '.png';
	}

	var profilePic = Titanium.UI.createImageView({
	image : image,
		height : 25,
		width : 25,
		left : '2%'
	});
	profilePic.addEventListener('error',function(e){
		// fallback for image
		profilePic.image = '/images/no_pic.png';
	});

	friendInfo.add(profilePic);

	boardName = obj.name.toString();
	if (boardName.length > 26) {
		boardName = boardName.substring(0, 26);
	}
	var name = Ti.UI.createLabel({
		text : boardName,
		left : '15%',
		font : {
			fontSize : 16,
			fontFamily : "Impact"
		},
	});
	friendInfo.add(name);

	var deleteBtn = Ti.UI.createButton({
		top : "0.4%",
		//height : '8%',
		width : '15%',
		left : '84%',
		id : obj.id,
		fName : obj.name,
		font : {
			fontFamily : font,
			fontSize : 27
		},
		title : fontawesome.icon('fa-trash-o'),
		backgroundColor : '#fff',
		color : '#000',
		opacity : 0.7,
		borderRadius : 5
	});
	friend.add(deleteBtn);

	deleteBtn.addEventListener('click', function(e) {

		//deletefriend
		var aL = Titanium.UI.createAlertDialog({
			title : 'Alert',
			message : Alloy.Globals.PHRASES.removeFriendTxt + ' ' + e.source.fName,
			buttonNames : ['OK', 'Cancel'],
			cancel : 1,
			id : e.source.id
		});

		aL.addEventListener('click', function(e) {
			switch(e.index) {
			case 0:
				var removeFriend = Ti.Network.createHTTPClient();
				removeFriend.open("POST", Alloy.Globals.BETKAMPENDELETEFRIENDURL);
				var params = {
					uid : Alloy.Globals.BETKAMPENUID,
					fid : e.source.id
				};
				removeFriend.send(params);
				//Ti.API.info(params);
				deleteBtn.visible = false;
				friendInfo.borderColor = '#ff0000';
				break;
			case 1:
				Titanium.API.info('cancel');
				break;
			}

		});
		aL.show();

	});

}

function createBtn() {
	var addFriendsLabel = Ti.UI.createLabel({
		text : Alloy.Globals.PHRASES.noFriendsTxt,
		textAlign : "center",
		top : 10,
		font : {
			fontSize : 22,
			fontFamily : "Impact"
		},
		color : "#FFF"
	});
	mainView.add(addFriendsLabel);

	var openFriendSearchBtn = Ti.UI.createButton({
		height : 40,
		width : '60%',
		left : '20%',
		top : '0.5%',
		title : Alloy.Globals.PHRASES.addFriendsTxt,
		backgroundColor : '#FFF',
		color : '#000',
		borderRadius : 5
	});
	mainView.add(openFriendSearchBtn);

	openFriendSearchBtn.addEventListener('click', function(e) {
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
		$.myFriends.close();
	});

}

var xhr = Ti.Network.createHTTPClient({
	// function called when the response data is available
	onload : function(e) {
		Ti.API.info("Received text: " + this.responseText);
		var friends = JSON.parse(this.responseText);
		if (friends.length == 0) {
			createBtn();
		} else {
			for (var i = 0; i < friends.length; i++) {
				//alert(friends[i].name);
				createGUI(friends[i]);
			}
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
