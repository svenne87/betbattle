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
}
var mod = require('bencoding.blur');
var openWindows = [];
var sections = [];
var table = null;

var iOSVersion;

if (OS_IOS) {
	iOSVersion = parseInt(Ti.Platform.version);
}

var mainView = Ti.UI.createView({
	//class : "topView",
	height : "100%",
	width : "100%",
	top : 0,
	backgroundColor : "transparent",
	layout : "vertical"
});

var header = Ti.UI.createView({
	 	height : '15%',
        width : Ti.UI.FILL,
       
        backgroundColor : '#303030',
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
                color : "#151515",

            }, {
                color : "#2E2E2E",

            }]
        }
	});

var friendLabel = Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.myFriendsTxt,
	left: 20,
	font : Alloy.Globals.getFontCustom(20, "Bold"),
	color : "#FFF"
});
header.add(friendLabel);
mainView.add(header);

function createGUI(obj) {
	var child = true;
	
	var friend = Ti.UI.createTableViewRow({
		hasChild : child,
		width : Ti.UI.FILL,
		left : 0,
		className : 'gameTypeRow',
		height : 75,
		isFriend : false,
		id : obj.id,
		name : obj.name,
		fbid : obj.fbid,
		score : obj.score,
		wins : obj.wins,
		level : obj.level,
		teamName : obj.team.data[0].name,
		teamLogo : obj.team.data[0].team_logo,
	});

	
	friend.addEventListener("click", function(e) {

		//getFriendInfo(e.source.id);
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
				height : 330,
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
				font : Alloy.Globals.getFontCustom(16, "Regular")
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

			var frLvl = Ti.UI.createLabel({
				text : Alloy.Globals.PHRASES.levelTxt + ': ' + e.source.level,
				left : '5%',
				color : "#000",
				top : 110,
				font : Alloy.Globals.getFontCustom(16, "Regular")
			});
			modal.add(frLvl);

			var frScore = Ti.UI.createLabel({
				text: Alloy.Globals.PHRASES.scoreInfoTxt + ': ' + e.source.score,
				left : '5%',
				color : "#000",
				top : 130,
				font : Alloy.Globals.getFontCustom(16, "Regular")
			});
			modal.add(frScore);

			var frWins = Ti.UI.createLabel({
				text : Alloy.Globals.PHRASES.winsInfoTxt + ': ' + e.source.wins,
				left : '5%',
				color : "#000",
				top : 150,
				font :Alloy.Globals.getFontCustom(16, "Regular")
			});
			modal.add(frWins);

			var favTeam = Ti.UI.createLabel({
				text : Alloy.Globals.PHRASES.favTeamTxt,
				left : "5%",
				color : "#000",
				top : 190,
				font : Alloy.Globals.getFontCustom(16, "Regular")
			});
			modal.add(favTeam);

			var frTeam = Ti.UI.createLabel({
				text : e.source.teamName,
				left : "5%",
				color : "#000",
				top : 210,
				font : Alloy.Globals.getFontCustom(16, "Regular")
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

			$.myFriends.add(w);
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
			$.myFriends.add(transparent_overlay);

			var w = Titanium.UI.createWindow({
				backgroundColor : '#fff',
				height : 330,
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
				font : Alloy.Globals.getFontCustom(16, "Regular")
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
				profilePic.image = Alloy.Globals.BETKAMPENURL + '/profile_images/0.png';
			});

			friend.add(profilePic);

			var frLvl = Ti.UI.createLabel({
				text : Alloy.Globals.PHRASES.levelTxt + ': ' + e.source.level,
				left : "5%",
				color : "#000",
				top : 110,
				font : Alloy.Globals.getFontCustom(16, "Regular")
			});
			friend.add(frLvl);

			var frScore = Ti.UI.createLabel({
				text : Alloy.Globals.PHRASES.scoreInfoTxt + ': ' + e.source.score,
				left : "5%",
				color : "#000",
				top : 130,
				font : Alloy.Globals.getFontCustom(16, "Regular")
			});
			friend.add(frScore);

			var frWins = Ti.UI.createLabel({
				text : Alloy.Globals.PHRASES.winsInfoTxt + ': ' + e.source.wins,
				left : "5%",
				color : "#000",
				top : 150,
				font : Alloy.Globals.getFontCustom(16, "Regular")
			});
			friend.add(frWins);

			var favTeam = Ti.UI.createLabel({
				text : Alloy.Globals.PHRASES.favTeamTxt,
				left : "5%",
				color : "#000",
				top : 190,
				font : Alloy.Globals.getFontCustom(16, "Regular")
			});
			friend.add(favTeam);

			var frTeam = Ti.UI.createLabel({
				text : e.source.teamName,
				left : "5%",
				color : "#000",
				top : 210,
				font : Alloy.Globals.getFontCustom(16, "Regular")
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


			var buttonView = Ti.UI.createView({
				width : Ti.UI.SIZE,
	           // height : Ti.UI.SIZE,
	            layout : 'horizontal',
	            left : 10,
	            top : 245,
	            height: 40,
	            id: e.source.id,
	            fName : e.source.name
			});
			
			
			 buttonView.add(Ti.UI.createLabel({
	            width : Ti.UI.SIZE,
	            height : Ti.UI.SIZE,
	            top : 12,
	            left : 2,
	            text : fontawesome.icon('icon-trash'),
	            color : '#000',
	            font : {
	                fontFamily : font
	            },
	          	 id: e.source.id,
	            fName : e.source.name
	        }));
	
	        buttonView.add(Ti.UI.createLabel({
	            width : Ti.UI.SIZE,
	            height : Ti.UI.SIZE,
	            top : 8,
	            left : 6,
	            text : "Ta bort vän",
	            font : Alloy.Globals.getFontCustom(16, 'Regular'),
	            color : "#000",
	             id: e.source.id,
	            fName : e.source.name
	        }));
			
			buttonView.addEventListener("click", function(e) {
				var aL = Titanium.UI.createAlertDialog({
					title : Alloy.Globals.PHRASES.betbattleTxt,
					message : Alloy.Globals.PHRASES.removeFriendTxt + ' ' + e.source.fName + '?',
					buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.abortBtnTxt],
					cancel : 1,
					id : e.source.id,
					fName : e.source.fName
				});
		
				aL.addEventListener('click', function(e) {
					switch(e.index) {
					case 0:
						var removeFriend = Ti.Network.createHTTPClient();
						removeFriend.open("POST", Alloy.Globals.BETKAMPENDELETEFRIENDURL + '?frid=' + e.source.id + '&fb=0&lang=' + Alloy.Globals.LOCALE);
						removeFriend.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
						
						
						removeFriend.send();
						//Ti.API.info(params);
						//deleteBtn.visible = false;
						//friendInfo.borderColor = '#ff0000';
						var win = Alloy.createController('myFriends').getView();
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
						$.myFriends.close();
						Alloy.Globals.showToast(e.source.fName + ' ' + Alloy.Globals.PHRASES.groupMemberDeletedTxt);
		
						break;
					case 1:
						Titanium.API.info('cancel');
						break;
					}
		
				});
				aL.show();
		
			});
			
			w.add(buttonView);
			
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

	//profilepicture
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
		left : '3%',
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
		profilePic.image = Alloy.Globals.BETKAMPENURL + '/profile_images/0.png';
	});

	friend.add(profilePic);

	boardName = obj.name.toString();
	if (boardName.length > 22) {
		boardName = boardName.substring(0, 22);
	}
	var name = Ti.UI.createLabel({
		text : boardName,
		left : '20%',
		id : obj.id,
		name : obj.name,
		fbid : obj.fbid,
		score : obj.score,
		wins : obj.wins,
		level : obj.level,
		teamName : obj.team.data[0].name,
		teamLogo : obj.team.data[0].team_logo,
		font : Alloy.Globals.getFontCustom(18, "Regular"),
		color: "#FFF"
	});
	friend.add(name);

	
	return friend;
	/*deleteBtn.addEventListener('click', function(e) {

		//deletefriend
		var aL = Titanium.UI.createAlertDialog({
			title : Alloy.Globals.PHRASES.betbattleTxt,
			message : Alloy.Globals.PHRASES.removeFriendTxt + ' ' + e.source.fName,
			buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.abortBtnTxt],
			cancel : 1,
			id : e.source.id,
			fName : e.source.fName
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
				//deleteBtn.visible = false;
				//friendInfo.borderColor = '#ff0000';
				var win = Alloy.createController('myFriends').getView();
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
				$.myFriends.close();
				Alloy.Globals.showToast(e.source.fName + ' ' + Alloy.Globals.PHRASES.groupMemberDeletedTxt);

				break;
			case 1:
				Titanium.API.info('cancel');
				break;
			}

		});
		aL.show();

	});*/

}

function createBtn() {
	var addFriendsLabel = Ti.UI.createLabel({
		text : Alloy.Globals.PHRASES.noFriendsTxt,
		textAlign : "center",
		top : 10,
		font : Alloy.Globals.getFontCustom(20, "Regular"),
		color : "#FFF"
	});
	mainView.add(addFriendsLabel);

	var openFriendSearchBtn = Alloy.Globals.createButtonView("#FFF", "#000", Alloy.Globals.PHRASES.addFriendsTxt);
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

var friends = null;

var xhr = Ti.Network.createHTTPClient({
	// function called when the response data is available
	onload : function(e) {
		Ti.API.info("Received friends: " + this.responseText);
		friends = JSON.parse(this.responseText);
		if (friends.length == 0) {
			createBtn();
		} else {
			Ti.API.info("VÄNNER ? " + JSON.stringify(friends));
			
			friends.sort(function(a, b) {
				var x = a.name.toLowerCase();
				var y = b.name.toLowerCase();
				return ((x < y) ? -1 : ((x > y) ? 1 : 0));
			});
			
			///*******Create Table View*******///

			var tableHeaderView = Ti.UI.createView({
				height : 0.1
			});
		
			var fontawesome = require('lib/IconicFont').IconicFont({
				font : 'lib/FontAwesome'
			});
		
			var font = 'FontAwesome';
		
			if (OS_ANDROID) {
				font = 'fontawesome-webfont';
			}
		
			var tableFooterView = Ti.UI.createView({
				height : 0.1
			});
		
			if (OS_IOS) {
				var separatorS;
				var separatorCol;
		
				if (iOSVersion < 7) {
					separatorS = Titanium.UI.iPhone.TableViewSeparatorStyle.NONE;
					separatorColor = 'transparent';
				} else {
					separatorS = Titanium.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE;
					separatorColor = '#6d6d6d';
				}
		
				table = Titanium.UI.createTableView({
					//width : Ti.UI.FILL,
					left : 0,
					headerView : tableHeaderView,
					footerView : tableFooterView,
					height : '85%',
					width : '100%',
					//backgroundImage: '/images/profileBG.jpg',
					backgroundColor : 'transparent',
					style : Ti.UI.iPhone.TableViewStyle.GROUPED,
					separatorInsets : {
						left : 0,
						right : 0
					},
					id : 'challengeTable',
					separatorStyle : separatorS,
					separatorColor : separatorColor
				});
			} else if (OS_ANDROID) {
				table = Titanium.UI.createTableView({
					width : Ti.UI.FILL,
					left : 0,
					headerView : tableHeaderView,
					height : '85%',
					//backgroundColor : '#303030',
					separatorColor : '#6d6d6d',
					id : 'challengeTable'
				});
			}
			
			sections[0] = Ti.UI.createTableViewSection({
				headerView : Ti.UI.createView({
					height : 0.1
				}),
				footerView : Ti.UI.createView({
					height : 0.1
				}),
			});
			Ti.API.info("VÄNNERNA : " + JSON.stringify(friends));
			for (var i = 0; i < friends.length; i++) {
				//alert(friends[i].team.data);
				sections[0].add(createGUI(friends[i]));
			}
			
			table.setData(sections);
			mainView.add(table);

		}
		indicator.closeIndicator();
	},
	// function called when an error occurs, including a timeout
	onerror : function(e) {
		Ti.API.debug(e.error);
		indicator.closeIndicator();
		//alert('error');
	},
	timeout : Alloy.Globals.TIMEOUT // in milliseconds
});
// Prepare the connection.

Ti.API.info("ÄR DU HÄR ELLER?");
xhr.open('GET', Alloy.Globals.BETKAMPENGETFRIENDSURL + '?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);

xhr.setRequestHeader("content-type", "application/json");
xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
xhr.setTimeout(Alloy.Globals.TIMEOUT);

if (OS_IOS) {
	indicator.openIndicator();
}

xhr.send();

if (OS_ANDROID) {
	$.myFriends.addEventListener('open', function() {
		Alloy.Globals.setAndroidCouponMenu($.myFriends.activity);

		$.myFriends.activity.actionBar.onHomeIconItemSelected = function() {
			$.myFriends.close();
			$.myFriends = null;
		};
		$.myFriends.activity.actionBar.displayHomeAsUp = true;
		$.myFriends.activity.actionBar.title = Alloy.Globals.PHRASES.betbattleTxt;

		// sometimes the view remain in memory, then we don't need to show the "loading"
		if (!friends) {
			indicator.openIndicator();
		}
	});
}
$.myFriends.addEventListener('close', function() {
	indicator.closeIndicator();
});

$.myFriends.add(mainView);

$.myFriends.addEventListener('close', function() {
	if (openWindows.length > 0) {
		for (var i = 0; i < openWindows.length; i++) {
			openWindows[i].close();
		}
	}
});
