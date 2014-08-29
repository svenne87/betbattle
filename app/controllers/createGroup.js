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
	text : Alloy.Globals.PHRASES.createGroupTxt,
	textAlign : "center",
	top : 10,
	font : {
		fontSize : 22,
		fontFamily : "Impact"
	},
	color : "#FFF"
});
mainView.add(groupLabel);

var groupNameLabel = Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.stateGroupNameTxt,
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
	borderColor : '#ff0000',
	top : '1%',
	left : '20%',
	width : '60%',
	height : 40,
	tintColor : '#000',
	keyboardType : Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType : Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});
mainView.add(groupName);

groupName.addEventListener('return', function(e) {
	if (e.source.value.length > 2) {
		groupName.borderColor = '#00ff00';
	} else if (e.source.value.length < 3) {
		groupName.borderColor = '#ff0000';
	}
});
var saveName = Ti.UI.createButton({
	height : 40,
	width : '60%',
	left : '20%',
	top : '0.5%',
	title : Alloy.Globals.PHRASES.pickFriendsTxt,
	backgroundColor : '#FFF',
	color : '#000',
	borderRadius : 5
});
mainView.add(saveName);

//saves groupname
saveName.addEventListener('click', function(e) {
	if (groupName.value.length > 2) {
		var gName = Ti.Network.createHTTPClient();
		gName.onload = function() {
			if (this.responseText == "namnet finns redan") {
				alert(Alloy.Globals.PHRASES.groupNameExistsTxt);
			} else if (this.responseText == "Tillagd") {
				groupName.visible = false;
				saveName.visible = false;
				//adds label with groupname
				groupNameLabel.text = groupName.value;
				//get the group id
				getGroup();

			}
		};
		gName.open("POST", Alloy.Globals.BETKAMPENURL + '/api/add_group.php');
		var params = {
			id : Alloy.Globals.BETKAMPENUID,
			group_name : groupName.value
		};
		gName.send(params);

	} else if (groupName.value.length < 3) {
		alert(Alloy.Globals.PHRASES.shortGroupNameTxt);
	}
});

l = 0;

//get all your friends
function createFriendGUI(obj, groupId, i) {
	l++;
	if (l == 1) {
		var line = Ti.UI.createView({
			width : '100%',
			height : '1%',
			top : '-15%',
			backgroundColor : '#fff'
		});
		mainView.add(line);

		var memberLabel = Ti.UI.createLabel({
			text : Alloy.Globals.PHRASES.addMembersTxt,
			textAlign : "center",
			top : '1%',
			font : {
				fontSize : 18,
				fontFamily : "Impact"
			},
			color : "#FFF"
		});
		mainView.add(memberLabel);
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
	//add button to select member
	var addBtn = Ti.UI.createButton({
		width : '18%',
		left : '81%',
		id : obj.id,
		name : obj.name,
		gid : groupId,
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
	addBtn.addEventListener('click', function(e) {
		//click once add person to group
		if (click == 0) {
			addBtn.backgroundColor = '#00ff00';
			addBtn.title = fontawesome.icon('fa-check');
			member.borderColor = '#00ff00';
			var addMember = Ti.Network.createHTTPClient();
			addMember.open("POST", Alloy.Globals.BETKAMPENURL + '/api/add_group_member.php');
			var params = {
				group_id : e.source.gid,
				id : e.source.id,
				name : e.source.name,
				admin : 0
			};
			addMember.send(params);
			Ti.API.info(params);
			click++;
			//click again to remove friend from group
		} else if (click == 1) {
			addBtn.backgroundColor = '#fff';
			addBtn.title = fontawesome.icon('fa-plus');
			member.borderColor = '#fff';
			
			var removeMember = Ti.Network.createHTTPClient();
			removeMember.open("POST", Alloy.Globals.BETKAMPENURL + '/api/remove_group_member.php');
			var params = {
				group_id : e.source.gid,
				id : Alloy.Globals.BETKAMPENUID,
				member_to_remove : e.source.id,
			};
			removeMember.send(params); 

			Ti.API.info(params);
			click--;
		}

	});
	
}


//get friends from db
function getFriends(groupId) {
	var xhr = Ti.Network.createHTTPClient({
		// function called when the response data is available
		onload : function(e) {
			//Ti.API.info("Received text: " + this.responseText);
			var friends = JSON.parse(this.responseText);

			for (var i = 0; i < friends.length; i++) {
				//send friends and group id to friend selector
				createFriendGUI(friends[i], groupId, i);
			}
			//create button to save group when you have selected friends
			var saveGroupBtn = Ti.UI.createButton({
			height : 40,
			width : '60%',
			left : '20%',
			top : '2%',
			title : Alloy.Globals.PHRASES.saveTxt,
			backgroundColor : '#FFF',
			color : '#000',
			borderRadius : 5
		});
		mainView.add(saveGroupBtn);
		
		//close down window when you are finished
		saveGroupBtn.addEventListener('click', function(e){
			$.createGroup.close();
		});
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
}

//get the group id by groupname from db
function getGroup() {
	var groupId = null;
	var client = Ti.Network.createHTTPClient({
		// function called when the response data is available
		onload : function(e) {
			//Ti.API.info("Received text: " + this.responseText);
			groupId = JSON.parse(this.responseText);
			//Ti.API.info(groupId.data[0].gID);
			getName(groupId.data[0].gID);
			getFriends(groupId.data[0].gID);

		},
		// function called when an error occurs, including a timeout
		onerror : function(e) {
			Ti.API.debug(e.error);
			//alert('error');
		},
		timeout : Alloy.Globals.TIMEOUT // in milliseconds
	});
	// Prepare the connection.
	client.open("GET", Alloy.Globals.BETKAMPENURL + '/api/get_members.php?gname=' + groupNameLabel.text);
	// Send the request.
	client.send();
}

//get your one namn to add as admin in your group
function getName(groupID) {
	var myName = null;
	var client = Ti.Network.createHTTPClient({
		// function called when the response data is available
		onload : function(e) {
			Ti.API.info("Received text: " + this.responseText);
			myName = JSON.parse(this.responseText);

			//Ti.API.info(myName.data[0].name + '->' + groupID);
			setAdmin(groupID, myName.data[0].name);

		},
		// function called when an error occurs, including a timeout
		onerror : function(e) {
			Ti.API.debug(e.error);
			//alert('error');
		},
		timeout : Alloy.Globals.TIMEOUT // in milliseconds
	});
	// Prepare the connection.
	client.open("GET", Alloy.Globals.BETKAMPENURL + '/api/get_members.php?myUid=' + Alloy.Globals.BETKAMPENUID);
	// Send the request.
	client.send();
}

//set you as admin
function setAdmin(groupId, myName) {
	var adminName = Ti.Network.createHTTPClient();

	adminName.open("POST", Alloy.Globals.BETKAMPENURL + '/api/add_group_member.php');
	var params = {
		group_id : groupId,
		id : Alloy.Globals.BETKAMPENUID,
		name : myName,
		admin : 1
	};
	adminName.send(params);
	//Ti.API.info(params);
}


$.createGroup.add(mainView);
