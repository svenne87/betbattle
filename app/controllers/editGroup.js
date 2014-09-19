var args = arguments[0] || {};
var friends = null;

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
	top : 200,
	text : Alloy.Globals.PHRASES.loadingTxt
});

$.editGroup.addEventListener('close', function() {
	indicator.closeIndicator();
});

if (OS_ANDROID) {
	$.editGroup.addEventListener('open', function() {
		$.editGroup.activity.actionBar.onHomeIconItemSelected = function() {
			$.editGroup.close();
			$.editGroup = null;
		};
		$.editGroup.activity.actionBar.displayHomeAsUp = true;
		$.editGroup.activity.actionBar.title = Alloy.Globals.PHRASES.betbattleTxt;

		// sometimes the view remain in memory, then we don't need to show the "loading"
		if (!friends) {
			indicator.openIndicator();
		}
	});
}

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

var groupLabel = Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.editGroupTxt,
	textAlign : "center",
	top : 10,
	font : {
		fontSize : 18,
		fontFamily : "Impact"
	},
	color : "#FFF"
});
mainView.add(groupLabel);

// if you are group admin
if (gAdmin == Alloy.Globals.BETKAMPENUID) {

	var groupNameLabel = Ti.UI.createLabel({
		text : Alloy.Globals.PHRASES.changeGroupNameTxt,
		textAlign : "center",
		top : 10,
		font : {
			fontSize : 18,
			fontFamily : "Impact"
		},
		color : "#FFF"
	});
	mainView.add(groupNameLabel);

	var groupName = Ti.UI.createTextField({
		color : '#336699',
		backgroundColor : '#ccc',
		borderColor : '#000',
		top : 7,
		left : '20%',
		width : '60%',
		height : 40,
		value : gName,
		tintColor : '#000',
		keyboardType : Titanium.UI.KEYBOARD_DEFAULT,
		returnKeyType : Titanium.UI.RETURNKEY_DEFAULT,
		borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
	});
	mainView.add(groupName);

	if (OS_ANDROID) {

		var first = true;
		groupName.addEventListener('focus', function f(e) {
			if (first) {
				first = false;
				groupName.blur();
			} else {
				groupName.removeEventListener('focus', f);
			}
		});
	}

	var groupNameBtn = Ti.UI.createButton({
		height : 40,
		width : '60%',
		left : '20%',
		top : 4,
		id : gID,
		title : Alloy.Globals.PHRASES.saveTxt,
		backgroundColor : '#FFF',
		color : '#000',
		font : {
			fontSize : 19,
			fontFamily : "Impact"
		},
		borderRadius : 5
	});
	mainView.add(groupNameBtn);

	groupNameBtn.addEventListener('click', function(e) {
		if (groupName.value.length > 2 && groupName.value.length <= 15) {
			var editName = Ti.Network.createHTTPClient();

			editName.open("POST", Alloy.Globals.BETKAMEPNCHANGEGROUPNAMEURL + '/?lang=' + Alloy.Globals.LOCALE);
			var params = {
				groupID : e.source.id,
				group_name : groupName.value,
			};
			editName.send(params);
			Ti.App.fireEvent('groupSelectRefresh');
			$.editGroup.close();
		} else if (groupName.value.length < 3) {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.shortGroupNameTxt);
		} else if (groupName.value.length > 15) {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.longGroupNameTxt);
		}
	});
}
var line = Ti.UI.createView({
	width : '100%',
	height : '1%',
	top : '2%',
	backgroundColor : '#fff'
});
mainView.add(line);

var memberLabel = Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.membersTxt,
	textAlign : "center",
	top : '1%',
	font : {
		fontSize : 18,
		fontFamily : "Impact"
	},
	color : "#FFF"
});
mainView.add(memberLabel);

function createGUI(obj) {
	if (gAdmin == Alloy.Globals.BETKAMPENUID) {
		var row = Ti.UI.createView({
			width : '100%',
			height : 40,
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
			image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + obj.uid + '.png';
		}

		var profilePic = Titanium.UI.createImageView({
			image : image,
			height : 35,
			width : 35,
			left : '3%',
			borderRadius : 17
		});
		profilePic.addEventListener('error', function(e) {
			// fallback for image
			profilePic.image = '/images/no_pic.png';
		});

		member.add(profilePic);

		boardName = obj.username.toString();
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
		//add delete button to members not your self
		if (obj.uid == Alloy.Globals.BETKAMPENUID) {

		} else {
			var deleteBtn = Ti.UI.createButton({
				width : '19%',
				left : '80%',
				id : gID,
				uid : obj.uid,
				mName : obj.username,
				font : {
					fontFamily : font,
					fontSize : 30
				},
				title : fontawesome.icon('fa-trash-o'),
				backgroundColor : '#fff',
				color : '#000',
				opacity : 0.7,
				borderRadius : 5
			});
			row.add(deleteBtn);

			deleteBtn.addEventListener('click', function(e) {
				//delete member
				var aL = Titanium.UI.createAlertDialog({
					title : Alloy.Globals.PHRASES.betbattleTxt,
					message : Alloy.Globals.PHRASES.removeFriendTxt + ' ' + e.source.mName + '?',
					buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.abortBtnTxt],
					cancel : 1,
					id : e.source.id,
					uid : e.source.uid,
					mName : e.source.mName
				});

				aL.addEventListener('click', function(e) {
					switch(e.index) {
					case 0:
						var removeMember = Ti.Network.createHTTPClient();

						removeMember.open("POST", Alloy.Globals.BETKAMPENREMOVEGROUPMEMBERURL + '/?lang=' + Alloy.Globals.LOCALE);
						var params = {
							group_id : e.source.id,
							id : Alloy.Globals.BETKAMPENUID,
							member_to_remove : e.source.uid,
						};
						removeMember.send(params);
						Ti.API.info(params);
						deleteBtn.visible = false;
						member.backgroundColor = '#ff0000';
						Alloy.Globals.showToast(e.source.mName + ' ' + Alloy.Globals.PHRASES.groupMemberDeletedTxt);

						break;
					case 1:
						Titanium.API.info('cancel');
						break;
					}

				});
				aL.show();

			});
		}
		// if your not admin show members and add friends to group
	} else {
		var row = Ti.UI.createView({
			width : '100%',
			height : 40,
			top : 2
		});
		mainView.add(row);

		var member = Ti.UI.createView({
			width : '98%',
			backgroundColor : '#fff',
			color : '#000',
			opacity : 0.7,
			borderRadius : 5,
			left : '1%'
		});
		row.add(member);

		/*var profilePic = Titanium.UI.createImageView({
		 image : "/images/no_pic.png",
		 height : 25,
		 width : 25,
		 left : '2%'
		 });*/
		var image;
		if (obj.fbid !== null) {
			image = "https://graph.facebook.com/" + obj.fbid + "/picture?type=large";
		} else {
			// get betkampen image
			image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + obj.uid + '.png';
		}

		var profilePic = Titanium.UI.createImageView({
			image : image,
			height : 35,
			width : 35,
			left : '3%',
			borderRadius : 17
		});
		profilePic.addEventListener('error', function(e) {
			// fallback for image
			profilePic.image = '/images/no_pic.png';
		});
		member.add(profilePic);

		var name = Ti.UI.createLabel({
			text : obj.username,
			left : '20%',
			font : {
				fontSize : 18,
				fontFamily : "Impact"
			},
		});
		member.add(name);
	}
}

var e = 0;
function createFriendGUI(friend, members) {
	var fr = [];
	if (members.data.length == 0) {

	} else {
		for (var s = 0; s < members.data.length; s++) {
			fr.push(members.data[s].uid);

		}
	}
	function isInArray(fr, search) {
		return (fr.indexOf(search) >= 0) ? true : false;
	}

	if (isInArray(fr, friend.id)) {
	} else {
		e++;
		if (e == 1) {
			var line2 = Ti.UI.createView({
				width : '100%',
				height : '1%',
				top : '2%',
				backgroundColor : '#fff'
			});
			mainView.add(line2);

			var addLabel = Ti.UI.createLabel({
				text : Alloy.Globals.PHRASES.addMembersTxt,
				textAlign : "center",
				top : '1%',
				font : {
					fontSize : 18,
					fontFamily : "Impact"
				},
				color : "#FFF"
			});
			mainView.add(addLabel);
		}
		var row = Ti.UI.createView({
			width : '100%',
			height : 40,
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

		/*var profilePic = Titanium.UI.createImageView({
		 image : "/images/no_pic.png",
		 height : 25,
		 width : 25,
		 left : '2%'
		 });*/
		var image;
		if (friend.fbid !== null) {
			image = "https://graph.facebook.com/" + friend.fbid + "/picture?type=large";
		} else {
			// get betkampen image
			image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + friend.id + '.png';
		}

		var profilePic = Titanium.UI.createImageView({
			image : image,
			height : 35,
			width : 35,
			left : '3%',
			borderRadius : 17
		});
		profilePic.addEventListener('error', function(e) {
			// fallback for image
			profilePic.image = '/images/no_pic.png';
		});
		member.add(profilePic);

		boardName = friend.name.toString();
		if (boardName.length > 22) {
			boardName = boardName.substring(0, 22);
		}
		var name = Ti.UI.createLabel({
			text : boardName,
			left : '20%',
			font : {
				fontSize : 16,
				fontFamily : "Impact"
			},
		});
		member.add(name);
		//add button to members
		Ti.API.info(gID + ' ' + friend.id + ' ' + friend.name);
		var addBtn = Ti.UI.createButton({
			width : '19%',
			left : '80%',
			id : gID,
			fId : friend.id,
			fName : friend.name,
			font : {
				fontFamily : font,
				fontSize : 30
			},
			title : fontawesome.icon('fa-plus'),
			backgroundColor : '#fff',
			color : '#000',
			opacity : 0.7,
			borderRadius : 5
		});
		row.add(addBtn);

		addBtn.addEventListener('click', function(e) {
			//delete member
			var aL = Titanium.UI.createAlertDialog({
				title : Alloy.Globals.PHRASES.betbattleTxt,
				message : Alloy.Globals.PHRASES.addMemberTxt + '\n' + e.source.fName + '?',
				buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.abortBtnTxt],
				backgroundColor : '#000',
				cancel : 1,
				id : e.source.id,
				fId : e.source.fId,
				fName : e.source.fName
			});

			aL.addEventListener('click', function(e) {
				switch(e.index) {
				case 0:
					var addMember = Ti.Network.createHTTPClient();

					addMember.open("POST", Alloy.Globals.BETKAMPENADDGROUPMEMBERSURL + '/?lang=' + Alloy.Globals.LOCALE);
					var params = {
						group_id : e.source.id,
						id : e.source.fId,
						name : e.source.fName,
						admin : 0
					};
					addMember.send(params);
					Ti.API.info(params);
					addBtn.visible = false;
					member.backgroundColor = '#00ff00';
					Alloy.Globals.showToast(e.source.fName + ' ' + Alloy.Globals.PHRASES.groupMemberAddedTxt);

					break;
				case 1:
					Titanium.API.info('cancel');
					break;
				}

			});
			aL.show();

		});
	}
}

//Get mebers from db
var client = Ti.Network.createHTTPClient({
	// function called when the response data is available
	onload : function(e) {
		Ti.API.info("Members: " + this.responseText);
		var members = JSON.parse(this.responseText);
		members.data.sort(function(a, b) {
			var x = a.username.toLowerCase();
			var y = b.username.toLowerCase();
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		});
		for (var i = 0; i < members.data.length; i++) {
			//alert(members.data[i].name);
			createGUI(members.data[i]);
		}
		getFriends(members);
	},
	// function called when an error occurs, including a timeout
	onerror : function(e) {
		Ti.API.debug(e.error);
		//alert('error');
	},
	timeout : Alloy.Globals.TIMEOUT // in milliseconds
});
// Prepare the connection.
client.open("GET", Alloy.Globals.BETKAMPENGETGROUPMEMBERSURL + '?gid=' + gID + '&lang=' + Alloy.Globals.LOCALE);
// Send the request.
client.send();

//get friends from db
function getFriends(members) {
	if (OS_IOS) {
		indicator.openIndicator();
	}

	var xhr = Ti.Network.createHTTPClient({
		// function called when the response data is available
		onload : function(e) {
			Ti.API.info("Received text: " + this.responseText);
			friends = JSON.parse(this.responseText);
			friends.sort(function(a, b) {
				var x = a.name.toLowerCase();
				var y = b.name.toLowerCase();
				return ((x < y) ? -1 : ((x > y) ? 1 : 0));
			});
			for (var i = 0; i < friends.length; i++) {
				//alert(friends[i].name);
				createFriendGUI(friends[i], members);
			}
			indicator.closeIndicator();
		},
		// function called when an error occurs, including a timeout
		onerror : function(e) {
			Ti.API.debug(e.error);
			//alert('error');
			indicator.closeIndicator();
		},
		timeout : Alloy.Globals.TIMEOUT // in milliseconds
	});
	// Prepare the connection.
	xhr.open('GET', Alloy.Globals.BETKAMPENGETFRIENDSURL + '?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);

	xhr.setRequestHeader("content-type", "application/json");
	xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
	xhr.setTimeout(Alloy.Globals.TIMEOUT);

	xhr.send();
}

$.editGroup.add(mainView);
