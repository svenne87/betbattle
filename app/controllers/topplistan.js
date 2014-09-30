var args = arguments[0] || {};

var mod = require('bencoding.blur');
var openWindows = [];

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
	top : 200,
	text : Alloy.Globals.PHRASES.loadingTxt
});

var mainView = Ti.UI.createScrollView({
	class : "topView",
	height : "100%",
	width : "100%",
	top : 0,
	backgroundColor : "transparent",
	layout : "vertical"
});

var leaderboardLabel = Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.scoreboardTxt,
	textAlign : "center",
	top : 10,
	font : {
		fontSize : 22,
		fontFamily : "Impact"
	},
	color : "#FFF"
});
mainView.add(leaderboardLabel);

var infoTxt = Ti.UI.createView({
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

var nrInfo = Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.positionTxt,
	left : '2%',
	color : "#fff",
	font : {
		fontSize : 18,
		fontFamily : "Impact"
	},
});
infoTxt.add(nrInfo);

var nameInfo = Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.nameTxt,
	left : '40%',
	color : "#fff",
	font : {
		fontSize : 18,
		fontFamily : "Impact"
	},
});
infoTxt.add(nameInfo);

var scoreInfo = Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.pointsTxt,
	left : '83%',
	color : "#fff",
	font : {
		fontSize : 18,
		fontFamily : "Impact"
	},
});
infoTxt.add(scoreInfo);

function createGUI(obj, i) {

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

	if (isInArray(fr, obj.id)) {
		var totalLeader = Ti.UI.createView({
			top : 1,
			backgroundColor : '#fff',
			width : "100%",
			height : 45,
			opacity : 0.7,
			id : obj.id,
			name : obj.name,
			fbid : obj.fbid,
			score : obj.score,
			wins : obj.wins,
			level : obj.level,
			teamName : obj.team.data[0].name,
			teamLogo : obj.team.data[0].team_logo,
			friend : true

		});
	} else if (obj.id == Alloy.Globals.BETKAMPENUID) {
		var totalLeader = Ti.UI.createView({
			top : 1,
			backgroundColor : '#fff',
			width : "100%",
			height : 45,
			opacity : 0.7,
			id : obj.id,
			name : obj.name,
			fbid : obj.fbid,
			score : obj.score,
			wins : obj.wins,
			level : obj.level,
			teamName : obj.team.data[0].name,
			teamLogo : obj.team.data[0].team_logo,
			friend : true

		});
	} else {
		var totalLeader = Ti.UI.createView({
			top : 1,
			backgroundColor : '#fff',
			width : "100%",
			height : 45,
			opacity : 0.7,
			id : obj.id,
			name : obj.name,
			fbid : obj.fbid,
			score : obj.score,
			wins : obj.wins,
			level : obj.level,
			teamName : obj.team.data[0].name,
			teamLogo : obj.team.data[0].team_logo,
			friend : false

		});
	}
	totalLeader.addEventListener("click", function(e) {
		if (OS_ANDROID) {
			var w = Ti.UI.createView({
				height : "100%",
				width : "100%",
				backgroundColor : 'transparent',
				top : 0,
				left : 0,
				zIndex : "1000",
			});
			
			var url = e.source.teamLogo.replace('logos', 'logos');
			var finalUrl = url.replace(' ', '');
			var finalUrl = finalUrl.toLowerCase();
			var images = Alloy.Globals.BETKAMPENURL + finalUrl;	

			var modal = Ti.UI.createView({
				height : 250,
				width : "85%",
				backgroundColor : '#fff',
				borderRadius : 10,
			});
			w.add(modal);

			var textWrapper = Ti.UI.createView({
				height : 250,
				width : "85%"
			});
			w.add(textWrapper);

			friendName = obj.name.toString();
			if (friendName.length > 18) {
				friendName = boardName.substring(0, 18);
			}

			var friendStats = Ti.UI.createLabel({
				text : friendName,
				left : '38%',
				color : "#000",
				top : 45,
				font : {
					fontSize : 18,
					fontFamily : "Impact",
				}
			});
			modal.add(friendStats);

			var image;
			if (obj.fbid !== null) {
				image = "https://graph.facebook.com/" + obj.fbid + "/picture?type=large";
			} else {
				// get betkampen image
				image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + obj.id + '.png';
			}

			var profilePic = Titanium.UI.createImageView({
				image : image,
				height : 90,
				width : 90,
				left : '2%',
				top : 10,
				borderRadius : 45
			});
			profilePic.addEventListener('error', function(e) {
				// fallback for image
				profilePic.image = Alloy.Globals.BETKAMPENURL + '/profile_images/0.png';
			});

			modal.add(profilePic);

			if (e.source.friend == true) {
				var frLvl = Ti.UI.createLabel({
				text : Alloy.Globals.PHRASES.levelTxt + ': ' + e.source.level,
				left : '5%',
				color : "#000",
				top : 110,
				font : {
					fontSize : 18,
					fontFamily : "Impact",
				}
			});
			modal.add(frLvl);

			var frScore = Ti.UI.createLabel({
				text: Alloy.Globals.PHRASES.scoreInfoTxt + ': ' + e.source.score,
				left : '5%',
				color : "#000",
				top : 130,
				font : {
					fontSize : 18,
					fontFamily : "Impact",
				}
			});
			modal.add(frScore);

			var frWins = Ti.UI.createLabel({
				text : Alloy.Globals.PHRASES.winsInfoTxt + ': ' + e.source.wins,
				left : '5%',
				color : "#000",
				top : 150,
				font : {
					fontSize : 18,
					fontFamily : "Impact",
				}
			});
			modal.add(frWins);
			} else {
				var addFriendBtn = Ti.UI.createButton({
					height : 40,
					width : '60%',
					left : '20%',
					top : 115,
					id : e.source.id,
					fName : e.source.name,
					title : Alloy.Globals.PHRASES.addFriendsTxt,
					backgroundColor : '#85d711',
					color : '#000',
					font : {
						fontSize : 19,
						fontFamily : "Impact"
					},
					borderRadius : 5
				});
				modal.add(addFriendBtn);

				addFriendBtn.addEventListener('click', function(e) {
					var addFriends = Ti.Network.createHTTPClient();
					addFriends.open("POST", Alloy.Globals.BETKAMPENADDFRIENDSURL);
					var params = {
						uid : Alloy.Globals.BETKAMPENUID,
						fid : e.source.id
					};
					addFriends.send(params);
					//alert(Alloy.Globals.PHRASES.friendSuccess + ' ' + e.source.fName);
					Alloy.Globals.showToast(Alloy.Globals.PHRASES.friendSuccess + ' ' + e.source.fName);
					var win = Alloy.createController('Topplistan').getView();
					if (OS_IOS) {
						Alloy.Globals.NAV.openWindow(win, {
							animated : false
						});
					} else {
						win.open({
							fullScreen : true
						});
						win = null;
					}
					$.scoreView.close();

				});
			}

			var favTeam = Ti.UI.createLabel({
				text : Alloy.Globals.PHRASES.favTeamTxt,
				left : "5%",
				color : "#000",
				top : 190,
				font : {
					fontSize : 18,
					fontFamily : "Impact",
				}
			});
			modal.add(favTeam);

			var frTeam = Ti.UI.createLabel({
				text : e.source.teamName,
				left : "5%",
				color : "#000",
				top : 210,
				font : {
					fontSize : 18,
					fontFamily : "Impact",
				}
			});
			modal.add(frTeam);

			var url = e.source.teamLogo.replace('logos', 'logos');
			var finalUrl = url.replace(' ', '');
			var finalUrl = finalUrl.toLowerCase();
			var images = Alloy.Globals.BETKAMPENURL + finalUrl;

			var profilePics = Titanium.UI.createImageView({
				image : images,
				height : 70,
				width : 70,
				right : '2%',
				top : 170,
				borderRadius : 35
			});

			modal.add(profilePics);

			/* When clicking on the modal */
			textWrapper.addEventListener("click", function(e) {
				modal.hide();
				modal = null;
			});

			/* When clicking outside of the modal */
			w.addEventListener('click', function() {
				w.hide();
				w = null;
			});

			$.scoreView.add(w);
		} else {//iphone
			var t = Titanium.UI.create2DMatrix();
			t = t.scale(0);

			//create a transparent overlay that fills the screen to prevent openingen multiple windows
			var transparent_overlay = Ti.UI.createView({
				width : Ti.UI.FILL,
				height : Ti.UI.FILL,
				backgroundColor : 'transparent',
				top : 0,
				left : 0,
				zIndex : 100,
			});
			$.scoreView.add(transparent_overlay);

			var w = Titanium.UI.createWindow({
				backgroundColor : '#fff',
				height : 250,
				width : "85%",
				borderRadius : 10,
				opacity : 1,
				zIndex : 1000,
				transform : t
			});
			// create first transform to go beyond normal size
			var t1 = Titanium.UI.create2DMatrix();
			t1 = t1.scale(1.1);
			var a = Titanium.UI.createAnimation();
			a.transform = t1;
			a.duration = 200;

			// when this animation completes, scale to normal size
			a.addEventListener('complete', function() {
				Titanium.API.info('here in complete');
				var t2 = Titanium.UI.create2DMatrix();
				t2 = t2.scale(1.0);
				w.animate({
					transform : t2,
					duration : 200
				});

			});
			friendName = obj.name.toString();
			if (friendName.length > 18) {
				friendName = boardName.substring(0, 18);
			}

			var friendStats = Ti.UI.createLabel({
				text : friendName,
				left : '38%',
				color : "#000",
				top : 45,
				font : {
					fontSize : 18,
					fontFamily : "Impact",
				}
			});
			w.add(friendStats);

			var friend = Ti.UI.createView({
				top : 2,
				width : "100%",
				height : 45,
			});
			w.add(friend);
			var image;
			if (obj.fbid !== null) {
				image = "https://graph.facebook.com/" + obj.fbid + "/picture?type=large";
			} else {
				// get betkampen image
				image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + obj.id + '.png';
			}

			var profilePic = Titanium.UI.createImageView({
				image : image,
				height : 90,
				width : 90,
				left : '2%',
				top : 10,
				borderRadius : 45
			});
			profilePic.addEventListener('error', function(e) {
				// fallback for image
				profilePic.image = '/images/no_pic.png';
			});

			friend.add(profilePic);

			if (e.source.friend == true) {
				var frLvl = Ti.UI.createLabel({
					text : Alloy.Globals.PHRASES.levelTxt + ': ' + e.source.level,
					left : "5%",
					color : "#000",
					top : 110,
				});
				friend.add(frLvl);

				var frScore = Ti.UI.createLabel({
					text : Alloy.Globals.PHRASES.scoreInfoTxt + ': ' + e.source.score,
					left : "5%",
					color : "#000",
					top : 130,
				});
				friend.add(frScore);

				var frWins = Ti.UI.createLabel({
					text : Alloy.Globals.PHRASES.winsInfoTxt + ': ' + e.source.wins,
					left : "5%",
					color : "#000",
					top : 150,
				});
				friend.add(frWins);
			} else {
				var addFriendBtn = Ti.UI.createButton({
					height : 40,
					width : '60%',
					left : '20%',
					top : 115,
					id : e.source.id,
					fName : e.source.name,
					title : Alloy.Globals.PHRASES.addFriendsTxt,
					backgroundColor : '#85d711',
					color : '#000',
					font : {
						fontSize : 19,
						fontFamily : "Impact"
					},
					borderRadius : 5
				});
				w.add(addFriendBtn);

				addFriendBtn.addEventListener('click', function(e) {
					var addFriends = Ti.Network.createHTTPClient();
					addFriends.open("POST", Alloy.Globals.BETKAMPENADDFRIENDSURL);
					var params = {
						uid : Alloy.Globals.BETKAMPENUID,
						fid : e.source.id
					};
					addFriends.send(params);
					//alert(Alloy.Globals.PHRASES.friendSuccess + ' ' + e.source.fName);
					Alloy.Globals.showToast(Alloy.Globals.PHRASES.friendSuccess + ' ' + e.source.fName);
					var win = Alloy.createController('Topplistan').getView();
					if (OS_IOS) {
						Alloy.Globals.NAV.openWindow(win, {
							animated : false
						});
					} else {
						win.open({
							fullScreen : true
						});
						win = null;
					}
					$.scoreView.close();

				});
			}

			var favTeam = Ti.UI.createLabel({
				text : Alloy.Globals.PHRASES.favTeamTxt,
				left : "5%",
				color : "#000",
				top : 190,
			});
			friend.add(favTeam);

			var frTeam = Ti.UI.createLabel({
				text : e.source.teamName,
				left : "5%",
				color : "#000",
				top : 210,
			});
			friend.add(frTeam);

			var url = e.source.teamLogo.replace('logos', 'logos');
			var finalUrl = url.replace(' ', '');
			var finalUrl = finalUrl.toLowerCase();
			var images = Alloy.Globals.BETKAMPENURL + finalUrl;

			var profilePics = Titanium.UI.createImageView({
				image : images,
				height : 70,
				width : 70,
				right : '2%',
				top : 170,
				borderRadius : 35
			});

			friend.add(profilePics);

			w.addEventListener('click', function() {
				var t3 = Titanium.UI.create2DMatrix();
				t3 = t3.scale(0);
				w.close({
					transform : t3,
					duration : 300
				});
				transparent_overlay.hide();
				transparent_overlay = null;
			});

			openWindows.push(w);
			transparent_overlay.add(w.open(a));
			//w.open(a);

		}

	});

	var nr = Ti.UI.createLabel({
		text : i + 1,
		left : '2%',
		touchEnabled : false,
		font : {
			fontSize : 18,
			fontFamily : "Impact"
		},
	});
	totalLeader.add(nr);

	if (i == 0) {
		var value = Titanium.UI.createImageView({
			image : "/images/gold.png",
			height : 20,
			width : 20,
			touchEnabled : false,
			left : '6%'
		});
		totalLeader.add(value);
	} else if (i == 1) {
		var value = Titanium.UI.createImageView({
			image : "/images/silver.png",
			height : 20,
			width : 20,
			touchEnabled : false,
			left : '6%'
		});
		totalLeader.add(value);
	} else if (i == 2) {
		var value = Titanium.UI.createImageView({
			image : "/images/bronze.png",
			height : 20,
			width : 20,
			touchEnabled : false,
			left : '6%'
		});
		totalLeader.add(value);
	}

	var image;
	if (obj.fbid !== null) {
		image = "https://graph.facebook.com/" + obj.fbid + "/picture?type=large";
	} else {
		// get betkampen image
		image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + obj.id + '.png';
	}

	var profilePic = Titanium.UI.createImageView({
		image : image,
		height : 35,
		width : 35,
		left : '15%',
		id : obj.id,
		name : obj.name,
		fbid : obj.fbid,
		score : obj.score,
		wins : obj.wins,
		level : obj.level,
		teamName : obj.team.data[0].name,
		teamLogo : obj.team.data[0].team_logo,
		borderRadius : 17
	});
	profilePic.addEventListener('error', function(e) {
		// fallback for image
		profilePic.image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + 0 + '.png';
	});

	totalLeader.add(profilePic);

	boardName = obj.name.toString();
	if (boardName.length > 18) {
		boardName = boardName.substring(0, 18);
	}
	if (i == 0) {
		if (obj.id == Alloy.Globals.BETKAMPENUID) {
			Alloy.Globals.unlockAchievement(4);
		}
		var name = Ti.UI.createLabel({
			text : Alloy.Globals.PHRASES.chipleaderTxt + "\n" + boardName,
			left : '29%',
			touchEnabled : false,
			font : {
				fontSize : 16
			},
		});
	} else if (i == 1) {
		var name = Ti.UI.createLabel({
			text : Alloy.Globals.PHRASES.runnerUppTxt + "\n" + boardName,
			left : '29%',
			touchEnabled : false,
			font : {
				fontSize : 16
			},
		});
	} else if (i == 2) {
		var name = Ti.UI.createLabel({
			text : Alloy.Globals.PHRASES.thirdPlaceTxt + "\n" + boardName,
			left : '29%',
			touchEnabled : false,
			font : {
				fontSize : 16
			},
		});
	} else {
		var name = Ti.UI.createLabel({
			text : boardName,
			left : '29%',
			touchEnabled : false,
			font : {
				fontSize : 16
			},
		});
	}
	totalLeader.add(name);

	var coins = Ti.UI.createLabel({
		text : obj.score,
		left : '85%',
		touchEnabled : false,
		font : {
			fontSize : 16,
			fontFamily : "Impact"
		},
	});
	totalLeader.add(coins);

	mainView.add(totalLeader);
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

if (OS_IOS) {
	indicator.openIndicator();
}



var name = null;
var client = Ti.Network.createHTTPClient({
	// function called when the response data is available
	onload : function(e) {
		Ti.API.info("Received text: " + this.responseText);
		name = JSON.parse(this.responseText);
		//teamName = name.data[0].name;
		//teamLogo = name.data[0].team_logo;
		for (var i = 0; i < name.length; i++) {
			createGUI(name[i], i);
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
client.open("GET", Alloy.Globals.BETKAMPENURL + '/api/get_scoreboard.php?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);

client.setRequestHeader("content-type", "application/json");
client.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
client.setTimeout(Alloy.Globals.TIMEOUT);// Send the request.
client.send();



if (OS_ANDROID) {
	$.scoreView.addEventListener('open', function() {
		Alloy.Globals.setAndroidCouponMenu($.scoreView.activity);

		$.scoreView.activity.actionBar.onHomeIconItemSelected = function() {
			$.scoreView.close();
			$.scoreView = null;
		};
		$.scoreView.activity.actionBar.displayHomeAsUp = true;
		$.scoreView.activity.actionBar.title = Alloy.Globals.PHRASES.betbattleTxt;

		// sometimes the view remain in memory, then we don't need to show the "loading"
		if (!name) {
			indicator.openIndicator();
		}
	});
}

$.scoreView.addEventListener('close', function() {
	indicator.closeIndicator();
});

$.scoreView.add(mainView);

$.scoreView.addEventListener('close', function() {
	if (openWindows.length > 0) {
		for (var i = 0; i < openWindows.length; i++) {
			openWindows[i].close();
		}
	}
});
