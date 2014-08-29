var args = arguments[0] || {};

var b = Titanium.UI.createButton({
	title : 'Back'
});
$.editGroup.leftNavButton = b;
b.addEventListener('click', function() {
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

	$.editGroup.close();
});

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
		top : '4%',
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
		top : '1%',
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

	var groupNameBtn = Ti.UI.createButton({
		height : 40,
		width : '60%',
		left : '20%',
		top : '0.5%',
		id : gID,
		title : Alloy.Globals.PHRASES.saveTxt,
		backgroundColor : '#FFF',
		color : '#000',
		borderRadius : 5
	});
	mainView.add(groupNameBtn);

	groupNameBtn.addEventListener('click', function(e) {
		if (groupName.value.length > 2) {
			var editName = Ti.Network.createHTTPClient();

			editName.open("POST", Alloy.Globals.BETKAMPENURL + '/api/edit_group_name.php');
			var params = {
				groupID : e.source.id,
				group_name : groupName.value,
			};
			editName.send(params);
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

			$.editGroup.close();
		} else if (groupName.value.length < 3) {
			alert(Alloy.Globals.PHRASES.shortGroupNameTxt);
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
			height : 35,
			top : '0.3%'
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
		var image;
		if(typeof Alloy.Globals.FACEBOOKOBJECT !== 'undefined') {
			image = "https://graph.facebook.com/"+Alloy.Globals.FACEBOOKOBJECT.id+"/picture?type=large";
		} else {
			// get betkampen image
			image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + Alloy.Globals.BETKAMPENUID + '.png';
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
		//add delete button to members not your self
		if (obj.mID == Alloy.Globals.BETKAMPENUID) {

		} else {
			var deleteBtn = Ti.UI.createButton({
				width : '18%',
				left : '81%',
				id : gID,
				mId : obj.mID,
				mName : obj.name,
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
			row.add(deleteBtn);

			deleteBtn.addEventListener('click', function(e) {
				//delete member
				var aL = Titanium.UI.createAlertDialog({
					title : 'Alert',
					message : Alloy.Globals.PHRASES.removeFriendTxt + e.source.mName,
					buttonNames : ['OK', 'Cancel'],
					cancel : 1,
					id : e.source.id,
					mId : e.source.mId,
					mName : e.source.mName
				});

				aL.addEventListener('click', function(e) {
					switch(e.index) {
					case 0:
						var removeMember = Ti.Network.createHTTPClient();

						removeMember.open("POST", Alloy.Globals.BETKAMPENURL + '/api/remove_group_member.php');
						var params = {
							group_id : e.source.id,
							id : Alloy.Globals.BETKAMPENUID,
							member_to_remove : e.source.mId,
						};
						removeMember.send(params);
						Ti.API.info(params);
						deleteBtn.visible = false;
						member.backgroundColor = '#ff0000';
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
			height : 35,
			top : '0.3%'
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

		var profilePic = Titanium.UI.createImageView({
			image : "/images/no_pic.png",
			height : 25,
			width : 25,
			left : '2%'
		});
		member.add(profilePic);

		var name = Ti.UI.createLabel({
			text : obj.name,
			left : '15%',
			font : {
				fontSize : 18,
				fontFamily : "Impact"
			},
		});
		member.add(name);
	}
}

var e = 0;
function createFriendGUI(friend, i) {
	var fr = [];
	if (members.data.length == 0) {

	} else {
		for (var s = 0; s < members.data.length; s++) {
			fr.push(members.data[s].mID);

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
			height : 35,
			top : '0.3%'
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

		var profilePic = Titanium.UI.createImageView({
			image : "/images/no_pic.png",
			height : 25,
			width : 25,
			left : '2%'
		});
		member.add(profilePic);

		boardName = friend.name.toString();
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
		//add delete button to members not your self
		Ti.API.info(gID + ' ' + friend.id + ' ' + friend.name);
		var addBtn = Ti.UI.createButton({
			width : '18%',
			left : '81%',
			id : gID,
			fId : friend.id,
			fName : friend.name,
			font : {
				fontFamily : font,
				fontSize : 27
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
				title : 'Alert',
				message : Alloy.Globals.PHRASES.addMemberTxt + e.source.fName,
				buttonNames : ['OK', 'Cancel'],
				cancel : 1,
				id : e.source.id,
				fId : e.source.fId,
				fName : e.source.fName
			});

			aL.addEventListener('click', function(e) {
				switch(e.index) {
				case 0:
					var addMember = Ti.Network.createHTTPClient();

					addMember.open("POST", Alloy.Globals.BETKAMPENURL + '/api/add_group_member.php');
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
var members = null;
var client = Ti.Network.createHTTPClient({
	// function called when the response data is available
	onload : function(e) {
		//Ti.API.info("Received text: " + this.responseText);
		members = JSON.parse(this.responseText);

		for (var i = 0; i < members.data.length; i++) {
			//alert(members.data[i].name);
			createGUI(members.data[i]);
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
client.open("GET", Alloy.Globals.BETKAMPENURL + '/api/get_members.php?gid=' + gID);
// Send the request.
client.send();

//get friends from db
var xhr = Ti.Network.createHTTPClient({
	// function called when the response data is available
	onload : function(e) {
		Ti.API.info("Received text: " + this.responseText);
		var friends = JSON.parse(this.responseText);

		for (var i = 0; i < friends.length; i++) {
			//alert(friends[i].name);
			createFriendGUI(friends[i], i);
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

$.editGroup.add(mainView);
