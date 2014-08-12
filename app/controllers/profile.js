var args = arguments[0] || {};

function getProfile(){
	
}

function buildProfile(){
	
}

var topView = Ti.UI.createView({
	class : "topView",
	height:"50%",
	width: "100%",
	top:0,
	backgroundColor: "transparent",
	layout: "vertical"
});

var botView = Ti.UI.createView({
	class : "botView",
	height: "50%",
	width: "100%",
	bottom: 0,
	backgroundColor: "black",
	opacity: "0.55",
	layout: "vertical"
});


//create the top of the profile
var profileName = Ti.UI.createLabel({
	text: "Giacomo Palma",
	textAlign: "center",
	top:0,
	font: {
		fontSize: 18,
		fontFamily: "Impact"
	},
	color: "#757575"
});
topView.add(profileName);

var profileTopView = Ti.UI.createView({
	width:"90%",
	height:"45%",
	//backgroundColor: "red",
	layout: "horizontal",
});
topView.add(profileTopView);

var profilePositionView = Ti.UI.createView({
	width:"33.33%",
	height:"100%",
	//backgroundColor: "yellow",
	layout: "vertical",
});
profileTopView.add(profilePositionView);

var profilePositionIcon = Ti.UI.createImageView({
	top : 25,
	image : "images/Topplista.png",
	width:35,
	height:35,
});
profilePositionView.add(profilePositionIcon);

var profilePosition = Ti.UI.createLabel({
	text: "3",
	top: 5,
	textAlign: "center",
	font: {
		fontSize: 16,
		fontFamily: "Impact",
	},
	color: "#c5c5c5"
});
profilePositionView.add(profilePosition);

var profilePictureView = Ti.UI.createView({
	width:"33.33%",
	height:"100%",
});
profileTopView.add(profilePictureView);

var profilePic = Ti.UI.createImageView({
	image : "https://graph.facebook.com/678845345/picture?type=large",
	width: 90,
	height: 90,
	borderRadius : 45
});
profilePictureView.add(profilePic);

var profileLevelView = Ti.UI.createView({
	width:"33.33%",
	height:"100%",
	layout: "vertical",
	//backgroundColor: "green",
});
profileTopView.add(profileLevelView);

var level = 4;
var profileLevelIcon = Ti.UI.createImageView({
	image: "https://secure.jimdavislabs.se/betkampen_vm/levels/shirt"+level+".png",
	width: 35,
	height: 35,
	top: 25,
});
profileLevelView.add(profileLevelIcon);

var profileLevel = Ti.UI.createLabel({
	text : "DRIBBLAREN",
	textAlign: "center",
	color:"c5c5c5",
	top: 5,
	font:{
		fontSize: 16,
		fontFamily: "Impact",
	}
});
profileLevelView.add(profileLevel);

var profileBotView = Ti.UI.createView({
	width:"90%",
	top : 20,
	height:"30%",
	//backgroundColor: "red",
	layout: "horizontal",
});
topView.add(profileBotView);

var longGreyBorder = Ti.UI.createImageView({
	image: "images/grey-border.png",
	top:0,
	width:"100%",
	//height:2,
});
profileBotView.add(longGreyBorder);

var profileStatsView = Ti.UI.createView({
	height:"70%",
	//backgroundColor: "red",
	width:"100%",
	bottom: 5,
	left: 25,
	top: 2,
	layout: "horizontal",
});

profileBotView.add(profileStatsView);

var profileCoinsView = Ti.UI.createView({
	width: "25%",
	height:"100%",
	//backgroundColor:"green",
	layout: "vertical",	
});
profileStatsView.add(profileCoinsView);

var coins = Ti.UI.createLabel({
	text: "1235",
	textAlign: "center",
	font:{
		fontSize: 22,
		fontFamily: "Impact",
	},
	color: "c5c5c5",
});

var coinsText = Ti.UI.createLabel({
	text: "Coins",
	textAlign:"center",
	font:{
		fontSize:14,
		fontFamily: "Impact",
	},
	color: "c5c5c5",
});

profileCoinsView.add(coins);
profileCoinsView.add(coinsText);

var smallGreyBorderLeft = Ti.UI.createImageView({
	image: "images/grey-border-small.png",
	right: 0,
	height: "100%",
});
profileStatsView.add(smallGreyBorderLeft);

var profilePointsView = Ti.UI.createView({
	width: "25%",
	height:"100%",
	layout: "vertical",
	//backgroundColor:"yellow",
});
profileStatsView.add(profilePointsView);

var points = Ti.UI.createLabel({
	text: "2204",
	textAlign: "center",
	color:"c5c5c5",
	font:{
		fontSize:22,
		fontFamily:"Impact",
	}
});

var pointsText = Ti.UI.createLabel({
	text: "Poäng",
	textAlign: "center",
	color: "c5c5c5",
	font:{
		fontSize: 14,
		fontFamily: "Impact",
	}
});

profilePointsView.add(points);
profilePointsView.add(pointsText);

var smallGreyBorderRight = Ti.UI.createImageView({
	image: "images/grey-border-small.png",
	left: 0,
	height: "100%",	
});
profileStatsView.add(smallGreyBorderRight);

var profileWinsView = Ti.UI.createView({
	width: "25%",
	height:"100%",
	layout: "vertical"
	//backgroundColor:"red",
});
profileStatsView.add(profileWinsView);

var wins = Ti.UI.createLabel({
	text: "210",
	textAlign: "center",
	color: "c5c5c5",
	font:{
		fontSize: 22,
		fontFamily: "Impact",
	}
});

var winsText = Ti.UI.createLabel({
	text: "Vinster",
	textAlign: "center",
	color: "c5c5c5",
	font:{
		fontSize: 14,
		fontFamily: "Impact",
	}
});

profileWinsView.add(wins);
profileWinsView.add(winsText);

var LongGreyBorderBot = Ti.UI.createImageView({
	image: "images/grey-border.png",
	bottom: 0,
	width:"100%",
});
profileBotView.add(LongGreyBorderBot);

//Create the list of Achievements
var achievementsLabel = Ti.UI.createLabel({
	text: "UTMÄRKELSER",
	textAlign: "center",
	color: "c5c5c5",
	font:{
		fontSize: 22,
		fontFamily: "Impact",
	}
});
botView.add(achievementsLabel);

var achievementsView = Ti.UI.createView({
	height: "45%",
	width: "100%",
	zIndex: "100",
	bottom: 0,
	//backgroundColor: "red",
});
$.profile.add(achievementsView);
	
	var scrollView = Ti.UI.createScrollView({
		contentWidth:Ti.UI.FILL,
		contentHeight:Ti.UI.SIZE,
		top:10,
		left: 20,
		showVerticalScrollIndicator:true,
		showHorizontalScrollIndicator:false,
		layout:"horizontal",
	});

	for (var i = 0; i < 20; i++){
		var achievement = Ti.UI.createImageView({
			image : "https://secure.jimdavislabs.se/betkampen_vm/achievements/en_vinst.png",
			width: 60,
			height: 60,
			left: 10,
			top: 10,
		});
		scrollView.add(achievement);
	}
achievementsView.add(scrollView);	

$.profile.add(topView);
$.profile.add(botView);

