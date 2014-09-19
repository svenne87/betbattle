var args = arguments[0] || {};

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
	top : 200,
	text : Alloy.Globals.PHRASES.loadingTxt
});

var fontawesome = require('lib/IconicFont').IconicFont({
	font : 'lib/FontAwesome'
});

var font = 'FontAwesome';

if (OS_ANDROID) {
	font = 'fontawesome-webfont';
	$.friendSearch.addEventListener('open', function() {
		$.friendSearch.activity.actionBar.onHomeIconItemSelected = function() {
			$.friendSearch.close();
			$.friendSearch = null;
		};
		$.friendSearch.activity.actionBar.displayHomeAsUp = true;
		$.friendSearch.activity.actionBar.title = Alloy.Globals.PHRASES.betbattleTxt;
	});
}

$.friendSearch.addEventListener('close', function() {
	indicator.closeIndicator
});
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

var searchView = Ti.UI.createView({
	width : '100%',
	height : 40,
	top : '2%'
});
mainView.add(searchView);

var searchText = Ti.UI.createTextField({
	color : '#336699',
	backgroundColor : '#707070',
	borderColor : '#000',
	left : '1%',
	width : '69%',
	height : 40,
	hintText : Alloy.Globals.PHRASES.searchHintTxt,
	tintColor : '#000',
	keyboardType : Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType : Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});
searchView.add(searchText);

var searchBtn = Ti.UI.createButton({
	width : '28%',
	left : '71%',
	height : 40,
	font : {
		fontFamily : font,
		fontSize : 27
	},
	title : fontawesome.icon('fa-search'),
	backgroundColor : '#fff',
	color : '#000',
	borderRadius : 5,
});
searchView.add(searchBtn);
//search starting when you click searchbutton
searchBtn.addEventListener('click', function(e) {
	getSearchResult();
	//searchText.removeEventListener('return');
});
//or when you just click return on the keyboard
/*searchText.addEventListener('return', function(e) {
getSearchResult();
});*/

//refresh
var refreshBtn = Ti.UI.createButton({
	width : '70%',
	left : '15%',
	height : 40,
	top : '-8%',
	visible : false,
	title : Alloy.Globals.PHRASES.newSearchTxt,
	backgroundColor : '#fff',
	font : {
				fontSize : 19,
				fontFamily : "Impact"
			},
	color : '#000',
	borderRadius : 5,
});
mainView.add(refreshBtn);

refreshBtn.addEventListener('click', function(e) {
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
	$.friendSearch.close();
});

a = 0;
function createGUI(obj) {
	//adding your friends to array to check so you dont add same friend again
	var fr = [];
	if (friendResp.length == null) {

	} else {
		for (var s = 0; s < friendResp.length; s++) {
			fr.push(friendResp[s].id);

		}
	}
	function isInArray(fr, search) {
		return (fr.indexOf(search) >= 0) ? true : false;
	}

	//you can not add yourself as a friend

	a++;
	//add label and line to view when results is showed
	if (a == 1) {
		var resultLabel = Ti.UI.createLabel({
			text : Alloy.Globals.PHRASES.topresultsTxt + " " + searchText.value,
			textAlign : "center",
			top : 10,
			font : {
				fontSize : 18,
				fontFamily : "Impact"
			},
			color : "#FFF"
		});
		mainView.add(resultLabel);

		var line = Ti.UI.createView({
			width : '100%',
			height : '1%',
			top : '1%',
			backgroundColor : '#fff'
		});
		mainView.add(line);
	}

	var row = Ti.UI.createView({
		width : '100%',
		height : 45,
		top : 2
	});
	mainView.add(row);

	var member = Ti.UI.createView({
		width : '78%',
		backgroundColor : '#fff',
		color : '#000',
		opacity : 0.7,
		borderRadius : 5,
		left : '1%'
	});
	row.add(member);
	//profilepicture
	var image;
	if (obj.fbid !== null) {
		image = "https://graph.facebook.com/" + obj.fbid + "/picture?type=large";
	} else {
		// get betkampen image
		image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + obj.fid + '.png';
	}

	var profilePic = Titanium.UI.createImageView({
	image : image,
		height : 35,
		width : 35,
		left : '3%',
		borderRadius: 17
	});
	profilePic.addEventListener('error', function(e) {
		// fallback for image
		profilePic.image = '/images/no_pic.png';
	});
	member.add(profilePic);
	//short down username so its fits on the screen
	boardName = obj.name.toString();
	if (boardName.length > 22) {
		boardName = boardName.substring(0, 22);
	}
	var name = Ti.UI.createLabel({
		text : boardName,
		left : '20%',
		font : {
			fontSize : 18,
			fontFamily : "Impact"
		},
	});
	member.add(name);

	//check if you already are friends
	if (isInArray(fr, obj.fid)) {
		//if you are disable add button
		var addBtn = Ti.UI.createButton({
			hight: 45,
			width : '19%',
			left : '80%',
			id : obj.fid,
			font : {
				fontFamily : font,
				fontSize : 32
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
	} else if (obj.fid == Alloy.Globals.BETKAMPENUID) {
		var addBtn = Ti.UI.createButton({
			height: 45,
			width : '19%',
			left : '80%',
			id : obj.fid,
			font : {
				fontFamily : font,
				fontSize : 32
			},
			title : fontawesome.icon('fa-times'),
			backgroundColor : '#ff0000',
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
			width : '19%',
			left : '80%',
			id : obj.fid,
			fName : obj.name,
			font : {
				fontFamily : font,
				fontSize : 32
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
			//add friend to friendlist
			addBtn.backgroundColor = '#00ff00';
			addBtn.title = fontawesome.icon('fa-check');
			member.borderColor = '#00ff00';
			var addFriends = Ti.Network.createHTTPClient();
			addFriends.open("POST", Alloy.Globals.BETKAMPENADDFRIENDSURL);
			var params = {
				uid : Alloy.Globals.BETKAMPENUID,
				fid : e.source.id
			};
			addFriends.send(params);
			//alert(Alloy.Globals.PHRASES.friendSuccess + ' ' + e.source.fName);
			Alloy.Globals.showToast(Alloy.Globals.PHRASES.friendSuccess + ' ' + e.source.fName);

			click++;
		} else if (click == 1) {
			//if you clicked on wrong person and click again you remove him from your friendlist
			addBtn.backgroundColor = '#fff';
			addBtn.title = fontawesome.icon('fa-plus');
			member.borderColor = '#fff';
			var removeFriend = Ti.Network.createHTTPClient();
			removeFriend.open("POST", Alloy.Globals.BETKAMPENDELETEFRIENDURL);
			var params = {
				uid : Alloy.Globals.BETKAMPENUID,
				fid : e.source.id
			};
			removeFriend.send(params);
			click--;
		}

	});
}


function getSearchResult() {
	if (!Alloy.Globals.checkConnection()) {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
		return;
	}

	if (searchText.value.length > 2) {
		var client = Ti.Network.createHTTPClient({
			// function called when the response data is available
			onload : function(e) {
				var response = JSON.parse(this.responseText);
				// if response is empty show no result text
				if (response.data.length == 0) {
					var resultLabel = Ti.UI.createLabel({
						text : Alloy.Globals.PHRASES.noResultTxt + " " + searchText.value,
						textAlign : "center",
						top : 10,
						font : {
							fontSize : 18,
							fontFamily : "Impact"
						},
						color : "#FFF"
					});
					mainView.add(resultLabel);
					var line = Ti.UI.createView({
						width : '100%',
						height : '1%',
						top : '1%',
						backgroundColor : '#fff'
					});
					mainView.add(line);
					searchView.visible = false;
					refreshBtn.visible = true;
					//creating gui with top ten result of your search
				} else {
					searchView.visible = false;
					refreshBtn.visible = true;
					for (var i = 0; i < response.data.length; i++) {
						if (i == 10) {
							break;
						}
						createGUI(response.data[i]);

					}
				}
				indicator.closeIndicator();
			},
			// function called when an error occurs, including a timeout
			onerror : function(e) {
				Ti.API.debug(e.error);
				indicator.closeIndicator();
			},
			timeout : Alloy.Globals.TIMEOUT // in milliseconds
		});
		// Prepare the connection. search in users table after what you searched
		client.open("GET", Alloy.Globals.BETKAMPENFRIENDSEARCHURL + '?search=' + searchText.value + '&lang=' + Alloy.Globals.LOCALE);
		indicator.openIndicator();
		// Send the request.
		client.send();
	} else {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.searchCharsTxt);
	}
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

$.friendSearch.add(mainView);
