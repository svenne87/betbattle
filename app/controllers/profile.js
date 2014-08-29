var args = arguments[0] || {};

if (OS_ANDROID) {
	$.profile.addEventListener('open', function() {
		$.profile.activity.actionBar.onHomeIconItemSelected = function() {
			$.profile.close();
			$.profile = null;
		};
		$.profile.activity.actionBar.displayHomeAsUp = true;
		$.profile.activity.actionBar.title = Alloy.Globals.PHRASES.betbattleTxt;
	});
}

//variables to use in class
var userInfo = null;
var mod = require('bencoding.blur');

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
	text: ""+Ti.App.Properties.getString('profileNameSetting'),
	textAlign: "center",
	top:10,
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
	image : "/images/Topplista.png",
	width:35,
	height:35,
});
profilePositionView.add(profilePositionIcon);

var profilePosition = Ti.UI.createLabel({
	text: Alloy.Globals.PHRASES.loadingTxt,
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

var image;
if(typeof Alloy.Globals.FACEBOOKOBJECT !== 'undefined') {
	image = "https://graph.facebook.com/"+Alloy.Globals.FACEBOOKOBJECT.id+"/picture?type=large";
} else {
	// get betkampen image
	image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + Alloy.Globals.BETKAMPENUID + '.png';
}

var profilePic = Ti.UI.createImageView({
	image : image, 
	width: 90,
	height: 90,
	borderRadius : 45
});

// default if no image is found
profilePic.addEventListener('error',function(e){
	profilePic.image = '/images/no_pic.png';
});


profilePictureView.add(profilePic);

var profileLevelView = Ti.UI.createView({
	width:"33.33%",
	height:"100%",
	layout: "vertical",
	//backgroundColor: "green",
});
profileTopView.add(profileLevelView);

var profileLevelIcon = Ti.UI.createImageView({
	//image: "https://secure.jimdavislabs.se/betkampen_vm/levels/shirt"+level+".png",
	width: 35,
	height: 35,
	top: 25,
});
profileLevelView.add(profileLevelIcon);
					
var profileLevel = Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.loadingTxt,
	textAlign: "center",
	color:"#c5c5c5",
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
	image: "/images/grey-border.png",
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
	text: "",
	textAlign: "center",
	font:{
		fontSize: 22,
		fontFamily: "Impact",
	},
	color: "#c5c5c5",
});

var coinsText = Ti.UI.createLabel({
	text: Alloy.Globals.PHRASES.loadingTxt,
	textAlign:"center",
	font:{
		fontSize:14,
		fontFamily: "Impact",
	},
	color: "#c5c5c5",
});

profileCoinsView.add(coins);
profileCoinsView.add(coinsText);

var smallGreyBorderLeft = Ti.UI.createImageView({
	image: "/images/grey-border-small.png",
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
	text: "",
	textAlign: "center",
	color:"#c5c5c5",
	font:{
		fontSize:22,
		fontFamily:"Impact",
	}
});

var pointsText = Ti.UI.createLabel({
	text: Alloy.Globals.PHRASES.loadingTxt,
	textAlign: "center",
	color: "#c5c5c5",
	font:{
		fontSize: 14,
		fontFamily: "Impact",
	}
});

profilePointsView.add(points);
profilePointsView.add(pointsText);

var smallGreyBorderRight = Ti.UI.createImageView({
	image: "/images/grey-border-small.png",
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
	text: "",
	textAlign: "center",
	color: "#c5c5c5",
	font:{
		fontSize: 22,
		fontFamily: "Impact",
	}
});

var winsText = Ti.UI.createLabel({
	text: Alloy.Globals.PHRASES.loadingTxt,
	textAlign: "center",
	color: "#c5c5c5",
	font:{
		fontSize: 14,
		fontFamily: "Impact",
	}
});

profileWinsView.add(wins);
profileWinsView.add(winsText);
if(OS_IOS){
	var LongGreyBorderBot = Ti.UI.createImageView({
	image: "/images/grey-border.png",
	bottom: 0,
	width:"100%",
});
}
if(OS_ANDROID){
	var LongGreyBorderBot = Ti.UI.createImageView({
	image: "/images/grey-border.png",
	bottom: 0,
	top:"85%",
	width:"100%",
});
}

profileBotView.add(LongGreyBorderBot);


//Create the list of Achievements
var achievementsLabel = Ti.UI.createLabel({
	text: Alloy.Globals.PHRASES.profileAchievements,
	textAlign: "center",
	color: "#c5c5c5",
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

	
achievementsView.add(scrollView);	

//Get the user info
function getProfile(){
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onerror = function(e) {
		profileLevel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
		profilePosition.setText('');
		Ti.API.error('Bad Sever =>' + e.error);
	};

	try {
		xhr.open('POST', Alloy.Globals.BETKAMPENUSERURL + '?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
		xhr.setRequestHeader("content-type", "application/json");
		xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
		xhr.setTimeout(Alloy.Globals.TIMEOUT);

		xhr.send();
	} catch(e) {
		coinsText.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
		coins.setText('');
	}

	xhr.onload = function() {
		if (this.status == '200') {
			if (this.readyState == 4) {
					userInfo = null;
				try {
					userInfo = JSON.parse(this.responseText);
				} catch (e) {
					userInfo = null;
					Ti.API.info("UserInfo NULL");
				}

				if (userInfo !== null) {
					coins.setText(userInfo.totalCoins);
					coinsText.setText(Alloy.Globals.PHRASES.coinsInfoTxt);
					
					points.setText(userInfo.totalPoints);
					pointsText.setText(Alloy.Globals.PHRASES.scoreInfoTxt);
					
					wins.setText(userInfo.totalWins);
					winsText.setText(Alloy.Globals.PHRASES.winsInfoTxt);
					
					profilePosition.setText(userInfo.position);
					Ti.API.info("Position :"+userInfo.position);
					var level = userInfo.level.level;
					
					profileLevelIcon.setImage("https://secure.jimdavislabs.se/betkampen_vm/levels/shirt"+level+".png");
					profileLevel.setText(Alloy.Globals.PHRASES.levels[level]);
					
					//userInfoCoinsLabel.setTexst(Alloy.Globals.PHRASES.coinsInfoTxt + ": " + userInfo.totalCoins);
					//userInfoWinsLabel.setText(Alloy.Globals.PHRASES.winningsInfoTxt + ": " + userInfo.points);
				}
			}
			
		} else {
			winsText.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
			coins.setText('');
			Ti.API.error("Error =>" + this.response);
		}
	};
}

function getAchievements(){
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onerror = function(e) {
		achievementsLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
		Ti.API.error('Bad Sever =>' + JSON.stringify(e));
	};

	try {
		xhr.open('GET', Alloy.Globals.BETKAMPENACHIEVEMENTSURL + '?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
		xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
		//xhr.setRequestHeader("content-type", "application/json");
		xhr.setTimeout(Alloy.Globals.TIMEOUT);

		xhr.send();
	} catch(e) {
		achievementsLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
	}

	xhr.onload = function() {
		if (this.status == '200') {
			if (this.readyState == 4) {
					var achievements = null;
				try {
					achievements = JSON.parse(this.responseText);
				} catch (e) {
					achievements = null;
					Ti.API.info("Achievements NULL");
				}

				if (achievements !== null) {
					Ti.API.info(JSON.stringify(achievements[2]));
					for (var i = 0; i < achievements.length; i++){
						var achievement = Ti.UI.createImageView({
							id: achievements[i].id,
							image : Alloy.Globals.BETKAMPENURL + "/achievements/"+achievements[i].image,
							width: 60,
							height: 60,
							left: 10,
							top: 10,
						});
						
						
						var achID = achievement.id;
						achievement.addEventListener("click", function(e){
							
							if(OS_ANDROID){
								var w = Ti.UI.createView({
									height: "100%",
									width: "100%",
									backgroundColor: 'transparent',
									top: 0,
									left: 0,
									zIndex: "1000",
								});
								
								var blur = mod.createBasicBlurView({
									width: 150,
									height: 150,
									image : e.source.image,
									borderRadius: 10,
									blurRadius : 35,
									//opacity: '0.5',
								});
								w.add(blur);
								
								var modal = Ti.UI.createView({
									height: 150,
									width: 150,
									backgroundColor: '#c5c5c5',
									borderRadius: 10,
									opacity: 0.5,
								});
								w.add(modal);
								
								var textWrapper = Ti.UI.createView({
									width: 150,
									height: 150,
								});
								w.add(textWrapper);
								
								var achievementTitle = Ti.UI.createLabel({
									text: Alloy.Globals.PHRASES.achievements[e.source.id].title,
									textAlign: "center",
									color: "#FFFFFF",
									zIndex: "2000",
									font: {
										fontSize: 18,
										fontFamily: "Impact",
									},
									top:25,
								});
								textWrapper.add(achievementTitle);
								
								var achievementDescription = Ti.UI.createLabel({
									text: Alloy.Globals.PHRASES.achievements[e.source.id].description,
									textAlign: "center",
									color: "#FFFFFF",
									width: "90%",
									zIndex: "2000",
									top: 50,
								});
								textWrapper.add(achievementDescription);
								
								textWrapper.addEventListener("click", function(e){
									modal.hide();
									w.hide();
									modal = null;
									w = null;
								});
								
								$.profile.add(w);
							}else{
								var t = Titanium.UI.create2DMatrix();
								t = t.scale(0);
								
								//create a transparent overlay that fills the screen to prevent openingen multiple windows
								var transparent_overlay = Ti.UI.createView({
									width: Ti.UI.FILL,
									height: Ti.UI.FILL,
									backgroundColor : 'transparent',
									top: 0, 
									left: 0,
									zIndex: 100,
								});
								$.profile.add(transparent_overlay);
								
								var w = Titanium.UI.createWindow({
									backgroundColor:'transparent',
									//borderWidth:8,
									//borderColor:'#999',
									height:150,
									width:150,
									borderRadius:10,
									opacity:1,
									zIndex : 1000,
									transform:t
								});
								// create first transform to go beyond normal size
								var t1 = Titanium.UI.create2DMatrix();
								t1 = t1.scale(1.1);
								var a = Titanium.UI.createAnimation();
								a.transform = t1;
								a.duration = 200;
							
								// when this animation completes, scale to normal size
								a.addEventListener('complete', function()
								{
									Titanium.API.info('here in complete');
									var t2 = Titanium.UI.create2DMatrix();
									t2 = t2.scale(1.0);
									w.animate({transform:t2, duration:200});
							
								});
							
								var blur = mod.createBasicBlurView({
									width: 150,
									height: 150,
									image : e.source.image,
									blurRadius : 15,
								});
								
								w.add(blur);
								
								var greyGlass = Ti.UI.createView({
									width: 150,
									height: 150,
									backgroundColor: "#c5c5c5",
									opacity: 0.5,
									
								});
								
								w.add(greyGlass);
								
							
								var achievementTitle = Ti.UI.createLabel({
									text: Alloy.Globals.PHRASES.achievements[e.source.id].title,
									textAlign: "center",
									color: "#FFFFFF",
									top:25,
									font: {
										fontSize: 18,
										fontFamily: "Impact",
									}
								});
								w.add(achievementTitle);
								
								var achievementDescription = Ti.UI.createLabel({
									text: Alloy.Globals.PHRASES.achievements[e.source.id].description,
									textAlign: "center",
									color: "#FFFFFF",
									width: "90%",
									top: 50,
								});
								w.add(achievementDescription);
								
								w.addEventListener('click', function()
								{
									var t3 = Titanium.UI.create2DMatrix();
									t3 = t3.scale(0);
									w.close({transform:t3,duration:300});
									transparent_overlay.hide();
									transparent_overlay = null;
								});
								
								transparent_overlay.add(w.open(a));
								//w.open(a);
								
							}
							
						});
						
						
						scrollView.add(achievement);
					}
					//userInfoCoinsLabel.setText(Alloy.Globals.PHRASES.coinsInfoTxt + ": " + userInfo.totalCoins);
					//userInfoWinsLabel.setText(Alloy.Globals.PHRASES.winningsInfoTxt + ": " + userInfo.points);
				}
			}
		} else {
			achievementsLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
			Ti.API.error("Error =>" + this.response);
		}
	};
}
 

$.profile.add(topView);
$.profile.add(botView);
getProfile();
getAchievements();

