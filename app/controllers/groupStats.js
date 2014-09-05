var args = arguments[0] || {};

var scoreView = Ti.UI.createScrollView({
	class : "topView",
	height : "50%",
	width : "100%",
	top : '0%',
	backgroundColor : "transparent",
	layout : "vertical"
});
var statsView = Ti.UI.createScrollView({
	class : "topView",
	height : "50%",
	width : "100%",
	top : '50%',
	backgroundColor : "transparent",
	layout : "vertical"
});

var leaderboardLabel = Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.groupLeaderTxt,
	textAlign : "center",
	top : 10,
	font : {
		fontSize : 22,
		fontFamily : "Impact"
	},
	color : "#FFF"
});
scoreView.add(leaderboardLabel);

var statsLabel = Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.statsTxt,
	textAlign : "center",
	top : 10,
	font : {
		fontSize : 22,
		fontFamily : "Impact"
	},
	color : "#FFF"
});
statsView.add(statsLabel);

function createGUI(obj, i) {

	var totalLeader = Ti.UI.createView({
		top : 1,
		backgroundColor : '#fff',
		width : "99%",
		height : 35,
		opacity : 0.7,
		borderRadius : 5

	});

	var nr = Ti.UI.createLabel({
		text : i + 1,
		left : '2%',
		font : {
			fontSize : 18,
			fontFamily : "Impact"
		},
	});
	totalLeader.add(nr);

	var image;
	if (obj.fbid !== null) {
		image = "https://graph.facebook.com/" + obj.fbid + "/picture?type=large";
	} else {
		// get betkampen image
		image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + obj.uid + '.png';
	}

	var profilePic = Titanium.UI.createImageView({
		image : image,
		height : 30,
		width : 30,
		left : '15%',
		borderRadius : 5
	});
	profilePic.addEventListener('error', function(e) {
		// fallback for image
		profilePic.image = '/images/no_pic.png';
	});

	totalLeader.add(profilePic);

	boardName = obj.username.toString();
	if (boardName.length > 22) {
		boardName = boardName.substring(0, 22);
	}

	var name = Ti.UI.createLabel({
		text : boardName,
		left : '27%',
		font : {
			fontSize : 14
		},
	});

	totalLeader.add(name);

	var coins = Ti.UI.createLabel({
		text : obj.score,
		left : '85%',
		font : {
			fontSize : 16,
			fontFamily : "Impact"
		},
	});
	totalLeader.add(coins);
	scoreView.add(totalLeader);
}

var getUID = Ti.Network.createHTTPClient();
getUID.onload = function() {
	Ti.API.info(this.responseText);
	var info = JSON.parse(this.responseText);

	for (var i = 0; i < info.data.length; i++) {
		createGUI(info.data[i], i);
	}
};
getUID.open('GET', Alloy.Globals.BETKAMPENGETGROUPMEMBERSURL + '?gid=' + gid + '&lang=' + Alloy.Globals.LOCALE);
getUID.send();

$.groupStats.add(scoreView);
$.groupStats.add(statsView);
