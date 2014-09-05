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
		text : Alloy.Globals.PHRASES.notFbUserTxt + '\n' + Alloy.Globals.PHRASES.connectToGetFriendsTxt,
		textAlign : "center",
		top : 10,
		font : {
			fontSize : 18,
			fontFamily : "Impact"
		},
		color : "#FFF"
	});
	mainView.add(connectLabel);

	var fb = require('facebook');

	// app id and permission's
	fb.appid = Ti.App.Properties.getString('ti.facebook.appid');

	if (OS_IOS) {
		fb.permissions = ['email', 'user_birthday', 'user_friends', 'user_location', 'user_games_activity', 'friends_games_activity'];
	} else {
		fb.permissions = ['email', 'user_birthday', 'user_friends', 'user_location', 'user_games_activity', 'friends_games_activity', 'publish_actions'];
	}
	fb.forceDialogAuth = false;
	Alloy.Globals.connect = false;
	Ti.API.info(Alloy.Globals.connect);

	fb.addEventListener('login', function(e) {
		if (Alloy.Globals.connect == false) {
			if (e.success) {
				var fbid = Ti.Network.createHTTPClient();
				fbid.open("POST", Alloy.Globals.BETKAMPENURL + '/api/connect_account_fb.php');
				var params = {
					fb_id : fb.uid,
					uid : Alloy.Globals.BETKAMPENUID
				};
				fbid.send(params);
				Ti.API.info(params);
				if (OS_ANDROID) {
					// close
					Alloy.Globals.MAINWIN.close();
					Alloy.Globals.LANDINGWIN.close();

					var activity = Titanium.Android.currentActivity;
					activity.finish();

					// start app again
					var intent = Ti.Android.createIntent({
						action : Ti.Android.ACTION_MAIN,
						url : 'Betkampen.js'
					});
					intent.addCategory(Ti.Android.CATEGORY_LAUNCHER);
					Ti.Android.currentActivity.startActivity(intent);
				} else {
					// restart app
					Ti.App._restart();
				}
			}
		}
	});

	mainView.add(fb.createLoginButton({
		top : 10,
		style : fb.BUTTON_STYLE_WIDE
	}));

} else {

	//USER IS CONNECTED WITH FACEBOOK-----------------------------------------------------------------------------------------------------------

	var faceBookLabel = Ti.UI.createLabel({
		text : Alloy.Globals.PHRASES.fbUserFriendsLbl,
		textAlign : "center",
		top : 10,
		font : {
			fontSize : 18,
			fontFamily : "Impact"
		},
		color : "#FFF"
	});
	mainView.add(faceBookLabel);

	getFbFriendsWithApp();

	function createGUI(obj) {
		var fr = [];
		if (friendResp.length == null) {

		} else {
			for (var s = 0; s < friendResp.length; s++) {
				fr.push(friendResp[s].fbid);

			}
		}
		function isInArray(fr, search) {
			return (fr.indexOf(search) >= 0) ? true : false;
		}

		var row = Ti.UI.createView({
			width : '100%',
			height : 35,
			top : 1
		});
		mainView.add(row);

		var member = Ti.UI.createView({
			width : '79%',
			backgroundColor : '#fff',
			color : '#000',
			opacity : 0.7,
			borderRadius : 5,
			left : '1%'
		});
		row.add(member);

		//profilepicture

		var profilePic = Titanium.UI.createImageView({
			image : image = "https://graph.facebook.com/" + obj.id + "/picture?type=large",
			height : 25,
			width : 25,
			left : '2%'
		});

		member.add(profilePic);

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
		member.add(name);

		if (isInArray(fr, obj.id)) {
			//if you already are friends disable add button
			var addBtn = Ti.UI.createButton({
				width : '18%',
				left : '81%',
				id : obj.id,
				font : {
					fontFamily : font,
					fontSize : 27
				},
				title : fontawesome.icon('fa-check'),
				backgroundColor : '#00ff00',
				color : '#000',
				opacity : 0.7,
				borderRadius : 5,
				enabled : false
			});
			row.add(addBtn);
			var click = 1;
		} else {
			// add button for adding your new friend
			var addBtn = Ti.UI.createButton({
				width : '18%',
				left : '81%',
				id : obj.id,
				fName : obj.name,
				font : {
					fontFamily : font,
					fontSize : 27
				},
				title : fontawesome.icon('fa-plus'),
				backgroundColor : '#fff',
				color : '#000',
				opacity : 0.7,
				borderRadius : 5,
			});
			row.add(addBtn);
			var click = 0;
		}

		addBtn.addEventListener('click', function(e) {
		 if (click == 0) {
		 //add fb friend to friendlist
		 addBtn.backgroundColor = '#00ff00';
		 addBtn.title = fontawesome.icon('fa-check');
		 member.borderColor = '#00ff00';
		 var getUID = Ti.Network.createHTTPClient();
		 getUID.onload = function() {
		 	Ti.API.info(this.responseText);
		 	uid = JSON.parse(this.responseText);
		 	name = e.source.fName; 
		 	addFbFriend(uid, name);
		 	click++;
		 };
		 getUID.open('GET', Alloy.Globals.BETKAMPENURL + '/api/get_uid_from_fbid.php?fbid='+ e.source.id + '&lang=' + Alloy.Globals.LOCALE);
		 getUID.send();
		 } else if (click == 1) {
		 //if you clicked on wrong person and click again you remove him from your friendlist
		 addBtn.backgroundColor = '#fff';
		 addBtn.title = fontawesome.icon('fa-plus');
		 member.borderColor = '#fff';
		 var getUID = Ti.Network.createHTTPClient();
		 getUID.onload = function() {
		 	Ti.API.info(this.responseText);
		 	uid = JSON.parse(this.responseText);
		 	delFbFriend(uid);
		 	click--;
		 };
		 getUID.open('GET', Alloy.Globals.BETKAMPENURL + '/api/get_uid_from_fbid.php?fbid='+ e.source.id + '&lang=' + Alloy.Globals.LOCALE);
		 getUID.send();
		 }

		 });
	}

	//getInvitableFbFriends();

	function getFbFriendsWithApp() {
		Titanium.Facebook.requestWithGraphPath('v2.1/me/friends', {
			fields : 'name'
		}, 'GET', function(e) {
			var data = JSON.parse(e.result);
			myFbFriends = data.data;
			//Ti.API.info(data);
			myFbFriends = myFbFriends.sort(sortByName);
			for (var i = 0; i < myFbFriends.length; i++) {
				createGUI(myFbFriends[i]);
			}
		});

	}

	function getInvitableFbFriends() {
		Titanium.Facebook.requestWithGraphPath('v2.1/me/invitable_friends', {
			fields : 'name'
		}, 'GET', function(e) {
			var data = JSON.parse(e.result);
			myFbFriends = data.data;
			//Ti.API.info(data);
			myFbFriends = myFbFriends.sort(sortByName);
			for (var i = 0; i < myFbFriends.length; i++) {
				Ti.API.info(myFbFriends[i].name + ' id ' + myFbFriends[i].id);
			}
		});

	}

}
function sortByName(a, b) {
	var x = a.name.toLowerCase();
	var y = b.name.toLowerCase();
	return ((x < y) ? -1 : ((x > y) ? 1 : 0));
}

var friendResp = null;
// get all users friends to see if you already are friends with the searchresult
var xhr = Ti.Network.createHTTPClient({
	onload : function(e) {
		Ti.API.info("Received text: " + this.responseText);
		friendResp = JSON.parse(this.responseText);

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

function addFbFriend(uid, name){
	var addFriends = Ti.Network.createHTTPClient();
		 addFriends.open("POST", Alloy.Globals.BETKAMPENADDFRIENDSURL);
		 var params = {
		 uid : Alloy.Globals.BETKAMPENUID,
		 fid : uid
		 };
		 addFriends.send(params);
		 alert(Alloy.Globals.PHRASES.friendSuccess + ' ' + name);
}
function delFbFriend(uid, name){
		 var removeFriend = Ti.Network.createHTTPClient();
		 removeFriend.open("POST", Alloy.Globals.BETKAMPENDELETEFRIENDURL);
		 var params = {
		 uid : Alloy.Globals.BETKAMPENUID,
		 fid : uid
		 };
		 removeFriend.send(params);
}

$.fbFriends.add(mainView);
