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
var myFbFriends = null;
var table = null;
var sections = [];

var iOSVersion;

if (OS_IOS) {
	iOSVersion = parseInt(Ti.Platform.version);
}

if (OS_ANDROID) {
	font = 'fontawesome-webfont';

	$.fbFriends.addEventListener('open', function() {
		Alloy.Globals.setAndroidCouponMenu($.fbFriends.activity);

		$.fbFriends.activity.actionBar.onHomeIconItemSelected = function() {
			$.fbFriends.close();
			$.fbFriends = null;
		};
		$.fbFriends.activity.actionBar.displayHomeAsUp = true;
		$.fbFriends.activity.actionBar.title = Alloy.Globals.PHRASES.betbattleTxt;

		// sometimes the view remain in memory, then we don't need to show the "loading"
		if (!myFbFriends) {
			indicator.openIndicator();
		}
	});
}

$.fbFriends.addEventListener('close', function() {
	indicator.closeIndicator();
});

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
		font : Alloy.Globals.getFontCustom(18, "Regular"),
		color : "#FFF"
	});
	mainView.add(connectLabel);

	var fb = require('facebook');

	// app id and permission's
	fb.appid = Ti.App.Properties.getString('ti.facebook.appid');

	if (OS_IOS) {
		fb.permissions = ['email'];
	} else {
		fb.permissions = ['email'];
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
	var fb = require('facebook');

	// app id and permission's
	fb.appid = Ti.App.Properties.getString('ti.facebook.appid');
	//USER IS CONNECTED WITH FACEBOOK-----------------------------------------------------------------------------------------------------------
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
	
	var faceBookLabel = Ti.UI.createLabel({
		text : Alloy.Globals.PHRASES.fbUserFriendsLbl,
		left : 20,
		font : Alloy.Globals.getFontCustom(20, "Bold"),
		color : "#FFF"
	});
	header.add(faceBookLabel);
	
	mainView.add(header);
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

	function createGUI(obj) {
		var fr = [];

		if (friendResp !== null) {
			for (var s = 0; s < friendResp.length; s++) {
				fr.push(friendResp[s].fbid);

			}
		}
		// TODO
		function isInArray(fr, search) {
			if (fr.length === 0)
				return false;
			return (fr.indexOf(search) >= 0) ? true : false;
		}
		var child = false;
		
		var row = Ti.UI.createTableViewRow({
			id : obj.id,
			hasChild : child,
			width : Ti.UI.FILL,
			left : 0,
			className : 'gameTypeRow',
			height : 75,
			isFriend : false
		});
		
		
		//profilepicture

		var profilePic = Titanium.UI.createImageView({
			image : image = "https://graph.facebook.com/" + obj.id + "/picture?type=large",
			height : 35,
			width : 35,
			left : 10,
			borderRadius : 17
		});

		row.add(profilePic);

		boardName = obj.name.toString();
		if (boardName.length > 22) {
			boardName = boardName.substring(0, 22);
		}
		var name = Ti.UI.createLabel({
			text : boardName,
			left : 50,
			font : Alloy.Globals.getFontCustom(16, "Regular"),
			color : "#FFF",
		});
		row.add(name);
		if (isInArray(fr, obj.id)) {
			//if you already are friends disable add button
			var addBtn = Ti.UI.createLabel({
				right : 10,
				id : obj.id,
				font : {
					fontFamily : font,
					fontSize : 32
				},
				text : fontawesome.icon('fa-check'),
				color : '#FFF',
			});
			row.add(addBtn);
			row.setBackgroundColor(Alloy.Globals.themeColor());
			row.isFriend = true;
		} else {
			// add button for adding your new friend
			var addBtn = Ti.UI.createLabel({
				right : 10,
				id : obj.id,
				fName : obj.name,
				font : {
					fontFamily : font,
					fontSize : 32
				},
				text : fontawesome.icon('fa-plus'),
				color : '#FFF',
			});
			row.add(addBtn);

		}

		row.addEventListener('click', function(e) {
			Ti.API.info("CLICKAT : " + JSON.stringify(e.row));
			if (e.row.isFriend == false) {
				//add fb friend to friendlist

				addBtn.text = fontawesome.icon('fa-check');
				e.row.setBackgroundColor(Alloy.Globals.themeColor());
				addFbFriend(e.row.id, obj.name); 
				e.row.isFriend = true;
				
			} else if (e.row.isFriend == true) {
				//if you clicked on wrong person and click again you remove him from your friendlist

				addBtn.text = fontawesome.icon('fa-plus');
				e.row.setBackgroundColor("transparent");
				deleteFbFriend(e.row.id, obj.name);
				e.row.isFriend = false;
			}

		});

		return row;
	}

	//getInvitableFbFriends();
	// gets friends how got the app installed
	function getFbFriendsWithApp() {
		
		fb.requestWithGraphPath('v2.1/me/friends', {
			fields : 'name'
		}, 'GET', function(e) {
			var data = JSON.parse(e.result);
			myFbFriends = data.data;
			//Ti.API.info(data);
			myFbFriends = myFbFriends.sort(sortByName);

			sections[0] = Ti.UI.createTableViewSection({
				headerView : Ti.UI.createView({
					height : 0.1
				}),
				footerView : Ti.UI.createView({
					height : 0.1
				}),
			});
			for (var i = 0; i < myFbFriends.length; i++) {
				sections[0].add(createGUI(myFbFriends[i]));
			}

			table.setData(sections);
			mainView.add(table);
			indicator.closeIndicator();
			// this gets a list of all your friends but it only sends requsts to people how got the app
			// you need a facebook canvas app to invite people who dont have the app in new fb sdk 2.0-2.1
			/*
			 var sendToFb = Ti.UI.createButton({
			 height : 45,
			 width : '80%',
			 left : '10%',
			 top : 40,
			 title : Alloy.Globals.PHRASES.inviteBtnTxt,
			 backgroundColor : '#3B5998',
			 color : '#fff',
			 font : {
			 fontSize : 19,
			 fontFamily : "Impact"
			 },
			 borderRadius : 3
			 });
			 mainView.add(sendToFb);

			 sendToFb.addEventListener('click', function(e) {

			 var data = {
			 app_id : fb.appid,
			 message : 'say what'
			 };
			 fb.dialog("apprequests", data, function(e) {
			 if (e.success && e.result) {
			 Alloy.Globals.addExperience(Alloy.Globals.BETKAMPENUID, 5);
			 Alloy.Globals.showToast(Alloy.Globals.PHRASES.inviteSentTxt);
			 } else {
			 if (e.error) {
			 Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.facebookConnectionErrorTxt);
			 } else {
			 Alloy.Globals.showToast(Alloy.Globals.PHRASES.abortInviteTxt);
			 }
			 }
			 });
			 });*/

			
		});

	}

	/*function getInvitableFbFriends() {
	 fb.requestWithGraphPath('me/invitable_friends', {
	 fields : 'id'
	 }, 'GET', function(e) {
	 Ti.API.info('Mitt resultat ' + e.result);
	 var data = JSON.parse(e.result);
	 Ti.API.info('Mitt resultat' + data);
	 invitableFbFriends = data.data;
	 //Ti.API.info(data);
	 invitableFbFriends = invitableFbFriends.sort(sortByName);
	 for (var i = 0; i < invitableFbFriends.length; i++) {
	 createGUI(invitableFbFriends[i]);
	 }
	 indicator.closeIndicator();
	 });

	 }*/

	function sortByName(a, b) {
		var x = a.name.toLowerCase();
		var y = b.name.toLowerCase();
		return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	}

	var friendResp = null;

	indicator.openIndicator();
	// get all users friends to see if you already are friends with the searchresult
	var xhr = Ti.Network.createHTTPClient({
		
		onload : function(e) {
			Ti.API.info("Received text: " + this.responseText);
			friendResp = JSON.parse(this.responseText);
			getFbFriendsWithApp();
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

function addFbFriend(fbid, name) {
	Ti.API.info("skickar in fbid : " + fbid);
	Ti.API.info("namnet som skickades : " + name);
	var xhr = Titanium.Network.createHTTPClient();
    xhr.onerror = function(e) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        Ti.API.info('FEL : ' + JSON.stringify(this.responseText));
        Ti.API.error('Bad Sever =>' + e.error);
     
    };

    try {
        xhr.open('POST', Alloy.Globals.BETKAMPENADDFRIENDSURL + '?frid=' + fbid + '&fb=1&lang=' + Alloy.Globals.LOCALE);
        xhr.setRequestHeader("challengesView-type", "application/json");
        xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
        xhr.setTimeout(Alloy.Globals.TIMEOUT);
        xhr.send();
    } catch(e) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        

    }
    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {
            	Ti.API.info("RESPONSE ADD FRIEND : " + JSON.stringify(this.responseText));
                var response = JSON.parse(this.responseText);
                Alloy.Globals.showToast(Alloy.Globals.PHRASES.friendSuccess + ' ' + name);
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            }
        } else {
            indicator.closeIndicator();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("Error =>" + this.response);
        }
    };
	
	//alert(Alloy.Globals.PHRASES.friendSuccess + ' ' + name);
	
}

function deleteFbFriend(fbid, name) {
	Ti.API.info("skickar in fbid : " + fbid);
	Ti.API.info("namnet som skickades : " + name);
	var xhr = Titanium.Network.createHTTPClient();
    xhr.onerror = function(e) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        Ti.API.info('FEL : ' + JSON.stringify(this.responseText));
        Ti.API.error('Bad Sever =>' + e.error);
     
    };

    try {
        xhr.open('POST', Alloy.Globals.BETKAMPENDELETEFRIENDURL + '?frid=' + fbid + '&fb=1&lang=' + Alloy.Globals.LOCALE);
        xhr.setRequestHeader("challengesView-type", "application/json");
        xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
        xhr.setTimeout(Alloy.Globals.TIMEOUT);
        xhr.send();
    } catch(e) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        

    }
    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {
            	Ti.API.info("RESPONSE DELETE FRIEND : " + JSON.stringify(this.responseText));
                var response = JSON.parse(this.responseText);
                Alloy.Globals.showToast(name + Alloy.Globals.PHRASES.friendRemovedTxt);
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            }
        } else {
            indicator.closeIndicator();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("Error =>" + this.response);
        }
    };

}

$.fbFriends.add(mainView);
