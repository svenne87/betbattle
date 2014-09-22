// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};

// Global variables
Alloy.Globals.APPID = "9999SWEDENTEST";
Alloy.Globals.FACEBOOKOBJECT
Alloy.Globals.BETKAMPEN
Alloy.Globals.DEVICETOKEN
Alloy.Globals.FACEBOOK
Alloy.Globals.CHALLENGEOBJECTARRAY = [];
Alloy.Globals.BETKAMPENUID = 0;
Alloy.Globals.PROFILENAME
Alloy.Globals.CHALLENGEINDEX
Alloy.Globals.LEAGUES
Alloy.Globals.AVAILABLELANGUAGES
Alloy.Globals.SLIDERZINDEX = 1;
Alloy.Globals.TIMEOUT = 30000;
Alloy.Globals.CURRENTVIEW
Alloy.Globals.PREVIOUSVIEW
Alloy.Globals.NAV = null;
Alloy.Globals.MAINVIEW
Alloy.Globals.MAINWIN = null;
Alloy.Globals.LANDINGWIN = null;
Alloy.Globals.WINDOWS = [];
Alloy.Globals.OPEN = true;
Alloy.Globals.CLOSE = true;
Alloy.Globals.RESUME = true;
Alloy.Globals.FBERROR = true;
Alloy.Globals.PHRASES = {};
Alloy.Globals.TiBeacon = null;
Alloy.Globals.AcceptedBeacon1 = false;
Alloy.Globals.AcceptedBeacon2 = false;
Alloy.Globals.AcceptedBeacon3 = false;
Alloy.Globals.connect
Alloy.Globals.COUPON = null;
Alloy.Globals.hasCoupon = false;

//initialize beacons
if (OS_IOS) {
	Alloy.Globals.TiBeacon = require('org.beuckman.tibeacons');
} else if (OS_ANDROID) {
	Alloy.Globals.TiBeacon = require('miga.tibeacon');
}

// try to get stored language
var lang = JSON.parse(Ti.App.Properties.getString('language'));

if ( typeof lang == 'undefined' || lang == '' || lang == null) {
	Alloy.Globals.LOCALE = Titanium.Locale.getCurrentLanguage().toLowerCase();
} else {
	lang = lang.language;
	Alloy.Globals.LOCALE = lang;
}

// urls. Everything live needs to be done over SSL
Alloy.Globals.INVITEURL = 'https://apps.facebook.com/betkampen';
Alloy.Globals.BETKAMPENURL = 'http://31.216.36.213/betbattle';
//'http://secure.jimdavislabs.se/secure/betkampen_vm';
Alloy.Globals.BETKAMPENLOGINURL = Alloy.Globals.BETKAMPENURL + '/api/login.php';
Alloy.Globals.BETKAMPENCHALLENGESURL = Alloy.Globals.BETKAMPENURL + '/api/challenges_v2.php';
Alloy.Globals.BETKAMPENUSERURL = Alloy.Globals.BETKAMPENURL + '/api/user_stats.php';
//
Alloy.Globals.BETKAMPENGAMESURL = Alloy.Globals.BETKAMPENURL + '/api/get_challenge_game.php';
Alloy.Globals.BETKAMPENANSWERURL = Alloy.Globals.BETKAMPENURL + '/api/answer_challenge.php';
Alloy.Globals.BETKAMPENGETGAMESURL = Alloy.Globals.BETKAMPENURL + '/api/get_available_games.php';
Alloy.Globals.BETKAMPENGETGAMESFORCHALLENGEURL = Alloy.Globals.BETKAMPENURL + '/api/get_game.php';
Alloy.Globals.BETKAMPENGETGAMESFORTOURNAMENT = Alloy.Globals.BETKAMPENURL + '/api/get_tournament_game.php';
Alloy.Globals.BETKAMPENGETGROUPSURL = Alloy.Globals.BETKAMPENURL + '/api/get_groups.php';
Alloy.Globals.BETKAMPENCHALLENGEDONEURL = Alloy.Globals.BETKAMPENURL + '/api/challenge_done.php';
Alloy.Globals.BETKAMPENDEVICETOKENURL = Alloy.Globals.BETKAMPENURL + '/api/store_device_token.php';
Alloy.Globals.BETKAMPENCOINSURL = Alloy.Globals.BETKAMPENURL + '/api/get_coins.php';
Alloy.Globals.BETKAMPENCHECKCOINSURL = Alloy.Globals.BETKAMPENURL + '/api/check_coins.php';
Alloy.Globals.BETKAMPENCOINSANDROIDURL = Alloy.Globals.BETKAMPENURL + '/api/get_coins_android.php';
Alloy.Globals.BETKAMPENSHAREURL = Alloy.Globals.BETKAMPENURL + '/api/share.php';
Alloy.Globals.GETLANGUAGE = Alloy.Globals.BETKAMPENURL + '/api/get_language.php';
Alloy.Globals.BETKAMPENACHIEVEMENTSURL = Alloy.Globals.BETKAMPENURL + '/api/get_achievements.php';
Alloy.Globals.BETKAMPENEMAILLOGIN = Alloy.Globals.BETKAMPENURL + '/api/token.php';
// get oauth token at login
Alloy.Globals.BETKAMPENEMAILREG = Alloy.Globals.BETKAMPENURL + '/api/email_registration.php';
//Email registration
Alloy.Globals.BETKAMPENGETMOTDINFO = Alloy.Globals.BETKAMPENURL + '/api/get_match_day_info.php';
//matchens mästare
Alloy.Globals.BETKAMPENGETTICKETS = Alloy.Globals.BETKAMPENURL + '/api/get_user_tickets.php';
Alloy.Globals.BETKAMPENSETTINGURL = Alloy.Globals.BETKAMPENURL + '/api/settings.php';
Alloy.Globals.BETKAMPENIMAGEUPLOADURL = Alloy.Globals.BETKAMPENURL + '/api/image_upload.php';
Alloy.Globals.BETKAMPENGETFRIENDSURL = Alloy.Globals.BETKAMPENURL + '/api/get_friends.php';
Alloy.Globals.BETKAMPENGETGETBEACONSURL = Alloy.Globals.BETKAMPENURL + '/api/get_beacons.php';
Alloy.Globals.BETKAMPENGETPROMOTIONURL = Alloy.Globals.BETKAMPENURL + '/api/get_promotion.php';
Alloy.Globals.BETKAMPENCHALLENGESHOWURL = Alloy.Globals.BETKAMPENURL + '/api/show_challenge.php';
Alloy.Globals.BETKAMPENLOGOUTURL = Alloy.Globals.BETKAMPENURL + '/api/logout.php';
Alloy.Globals.BETKAMPENDELTEGROUPURL = Alloy.Globals.BETKAMPENURL + '/api/remove_group.php';
//delete your own group
Alloy.Globals.BETKAMPENREMOVEGROUPMEMBERURL = Alloy.Globals.BETKAMPENURL + '/api/remove_group_member.php';
//leave group or remove group member
Alloy.Globals.BETKAMEPNCHANGEGROUPNAMEURL = Alloy.Globals.BETKAMPENURL + '/api/edit_group_name.php';
// change groupname
Alloy.Globals.BETKAMPENADDGROUPMEMBERSURL = Alloy.Globals.BETKAMPENURL + '/api/add_group_member.php';
//add groupmembers
Alloy.Globals.BETKAMPENGETGROUPMEMBERSURL = Alloy.Globals.BETKAMPENURL + '/api/get_group_members.php';
// get all groupmembers
Alloy.Globals.BETKAMPENDELETEFRIENDURL = Alloy.Globals.BETKAMPENURL + '/api/remove_friend.php';
// delete friends from your friendlist
Alloy.Globals.BETKAMPENCREATEGROUPURL = Alloy.Globals.BETKAMPENURL + '/api/add_group.php';
// create a new group and add you as admin
Alloy.Globals.BETKAMPENFRIENDSEARCHURL = Alloy.Globals.BETKAMPENURL + '/api/get_users_search.php';
// search in db for friends
Alloy.Globals.BETKAMPENADDFRIENDSURL = Alloy.Globals.BETKAMPENURL + '/api/add_friends.php';
// add friends to your friendlist
Alloy.Globals.BETKAMPENSAVECHALLENGEURL = Alloy.Globals.BETKAMPENURL + '/api/save_challenge.php';
Alloy.Globals.BETKAMPENUPDATECHALLENGEURL = Alloy.Globals.BETKAMPENURL + '/api/update_challenge.php';
Alloy.Globals.BETKAMPENGETCOUPONURL = Alloy.Globals.BETKAMPENURL + '/api/get_coupon.php';
Alloy.Globals.BETKAMPENDELETECOUPONGAMEURL = Alloy.Globals.BETKAMPENURL + '/api/delete_coupon_game.php';
Alloy.Globals.BETKAMPENCHALLENGEGROUPURL = Alloy.Globals.BETKAMPENURL + '/api/challenge_group.php';
Alloy.Globals.BETKAMPENCHALLENGEFRIENDSURL = Alloy.Globals.BETKAMPENURL + '/api/challenge_friend.php';
Alloy.Globals.BETKAMPENGAMETOEDITURL = Alloy.Globals.BETKAMPENURL + '/api/get_game_edit.php';
Alloy.Globals.BETKAMPENSAVEEDITURL = Alloy.Globals.BETKAMPENURL + '/api/save_game_edit.php';
Alloy.Globals.BETKAMPENGETTOPLANDINGPAGE = Alloy.Globals.BETKAMPENURL + '/api/get_dynamic_view.php';
Alloy.Globals.BETKAMPENUNLOCKACHIEVEMENTURL = Alloy.Globals.BETKAMPENURL + '/api/unlock_achievement.php';
Alloy.Globals.BETKAMPENPOSTMATCHOTDURL = Alloy.Globals.BETKAMPENURL + '/api/respond_match_day.php';
Alloy.Globals.BETKAMPENGETMATCHOTDSTATUSURL = Alloy.Globals.BETKAMPENURL + '/api/get_match_day_status.php';
Alloy.Globals.BETKAMPENMATCHOTDSHOWURL = Alloy.Globals.BETKAMPENURL + '/api/get_match_day_show.php';
Alloy.Globals.BETKAMPENCHECKRATESTATUS = Alloy.Globals.BETKAMPENURL + '/api/check_rate_status.php';
// check if user has rated app Google play/appstore
Alloy.Globals.BETKAMPENSETRATESTATUS = Alloy.Globals.BETKAMPENURL + '/api/update_rate_status.php';
// update rate status. 0 remind me/1 dont remind me/2 has rated

Alloy.Globals.performTimeout = function(func) {
	if (OS_ANDROID) {
		setTimeout(function() { func;
		}, 300);
	} else { func;
	}

};

Alloy.Globals.storeToken = function() {
	Ti.App.Properties.setString("BETKAMPEN", JSON.stringify(Alloy.Globals.BETKAMPEN));
};

Alloy.Globals.readToken = function() {
	if (Ti.App.Properties.hasProperty("BETKAMPEN")) {
		Alloy.Globals.BETKAMPEN = JSON.parse(Ti.App.Properties.getString('BETKAMPEN'));
	}
};

Alloy.Globals.setAndroidCouponMenu = function(activity) {
	activity.onCreateOptionsMenu = function(e) {
		ticket = e.menu.add( ticketIcon = {
			showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
			icon : 'images/ticketBtn.png',
			itemId : 1
		});

		var couponOpen = false;
		//Add event listener to ticket button
		ticket.addEventListener("click", function() {
			if (couponOpen)
				return;
			if (Alloy.Globals.hasCoupon) {
				couponOpen = true;
				var win = Alloy.createController('showCoupon').getView();
				win.addEventListener('close', function() {
					win = null;
					couponOpen = false;
				});
				win.open({
					fullScreen : true
				});
				win = null;
			}
		});
	};

	activity.onPrepareOptionsMenu = function(e) {
		var menu = e.menu;

		if (Alloy.Globals.hasCoupon) {
			menu.findItem(1).setIcon('images/ticketBtnRed.png');
		} else {
			menu.findItem(1).setIcon('images/ticketBtn.png');
		}
	};

	activity.invalidateOptionsMenu();
};

Alloy.Globals.themeColor = function() {
	var theme = 2;
	switch(theme) {
	case 1:
		return '#58B101';
	case 2:
		return '#ea7337';
	}
};

Alloy.Globals.getFont = function() {
	if (OS_IOS) {
		return 'Helvetica Neue';
	} else if (OS_ANDROID) {
		return 'Roboto-Regular';
	}
};

Alloy.Globals.getFontSize = function(target) {
	var font;

	if (OS_IOS) {
		if (target === 1) {
			// normal
			font = 16;
		} else if (target === 2) {
			// section
			font = 22;
		} else if (target === 3) {
			// header
			font = 44;
		}
		return font;
	} else if (OS_ANDROID) {
		if (target === 1) {
			// normal
			font = 18;
		} else if (target === 2) {
			// section
			font = 24;
		} else if (target === 3) {
			// header
			font = 48;
		}
		return font;
	}
};

// show feedback dialog
Alloy.Globals.showFeedbackDialog = function(msg) {
	var alertWindow = Titanium.UI.createAlertDialog({
		title : Alloy.Globals.PHRASES.betbattleTxt,
		message : msg,
		buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt]
	});

	alertWindow.addEventListener('click', function(e) {
		switch (e.index) {
		case 0:
			alertWindow.hide();
			break;
		}
	});
	alertWindow.show();
};

Alloy.Globals.showToast = function(msg) {
	if (OS_ANDROID) {
		var delToast = Ti.UI.createNotification({
			duration : Ti.UI.NOTIFICATION_DURATION_LONG,
			message : msg
		});
		delToast.show();
	} else {
		indWin = Titanium.UI.createWindow();

		//  view
		var indView = Titanium.UI.createView({
			top : '80%',
			height : 30,
			width : '80%',
			backgroundColor : '#000',
			opacity : 0.9
		});

		indWin.add(indView);

		// message
		var message = Titanium.UI.createLabel({
			text : msg,
			color : '#fff',
			width : 'auto',
			height : 'auto',
			textAlign : 'center',
			font : {
				fontSize : 12,
				fontWeight : 'bold'
			}
		});

		indView.add(message);
		indWin.open();

		var interval = interval ? interval : 1500;
		setTimeout(function() {
			indWin.close({
				opacity : 0,
				duration : 1000
			});
		}, interval);
	}
};

Alloy.Globals.unlockAchievement = function(achID) {
	if (Alloy.Globals.checkConnection()) {
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onerror = function(e) {
			Ti.API.error('Bad Sever =>' + e.error);
		};

		try {
			xhr.open('POST', Alloy.Globals.BETKAMPENUNLOCKACHIEVEMENTURL + '?achID=' + achID + '&lang=' + Alloy.Globals.LOCALE);
			xhr.setRequestHeader("content-type", "application/json");
			xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
			xhr.setTimeout(Alloy.Globals.TIMEOUT);

			// build the json string

			xhr.send();
		} catch(e) {
			//
		}

		xhr.onload = function() {
			if (this.status == '200') {
				if (this.readyState == 4) {
					var response = '';
					try {
						Ti.API.info("UNLOCK : " + JSON.stringify(this.responseText));
						response = JSON.parse(this.responseText);
					} catch(e) {

					}

					Ti.API.log(response);
					if (response == 1) {
						Ti.API.info("redan låst upp");
					} else if (response.image != null) {
						Ti.API.info("visa toast");
						var player = Ti.Media.createSound({
							url : "sound/unlocked.wav"
						});
						indWin = Titanium.UI.createWindow();

						//  view
						var indView = Titanium.UI.createView({
							top : '80%',
							height : 50,
							width : '100%',
							backgroundColor : '#000',
							opacity : 0.9,
							layout : 'horizontal',
						});

						indWin.add(indView);

						// message
						var image = Ti.UI.createImageView({
							image : Alloy.Globals.BETKAMPENURL + '/achievements/' + response.image,
							width : "15%",
							height : Ti.UI.SIZE,
							left : 0,
						});
						var message = Titanium.UI.createLabel({
							text : Alloy.Globals.PHRASES.achievementUnlocked + Alloy.Globals.PHRASES.achievements[response.id].title,
							right : 0,
							color : '#fff',
							width : '75%',
							height : 'auto',
							textAlign : 'center',
							font : {
								fontSize : 12,
								fontWeight : 'bold'
							}
						});
						indView.add(image);
						indView.add(message);
						indWin.open();

						player.play();

						var interval = interval ? interval : 2500;
						setTimeout(function() {
							indWin.close({
								opacity : 0,
								duration : 1000
							});
						}, interval);
					} else {
						Ti.API.info("nått fel");
					}

				} else {
					Ti.API.log(this.response);
				}
			} else {
				Ti.API.error("Error =>" + this.response);
			}
		};
	} else {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
	}
};

// check network
Alloy.Globals.checkConnection = function() {
	return Titanium.Network.online;
};

// post device token to our backend
Alloy.Globals.postDeviceToken = function(deviceToken) {
	Alloy.Globals.DEVICETOKEN = deviceToken;
	// check connection
	if (Alloy.Globals.checkConnection()) {
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onerror = function(e) {
			Ti.API.error('Bad Sever =>' + e.error);
		};

		try {
			xhr.open('POST', Alloy.Globals.BETKAMPENDEVICETOKENURL);
			xhr.setRequestHeader("content-type", "application/json");
			xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
			xhr.setTimeout(Alloy.Globals.TIMEOUT);

			// build the json string
			var param = '{"device_token":"' + deviceToken + '", "device_type":"' + Ti.Platform.osname + '", "lang":"' + Alloy.Globals.LOCALE + '"}';
			xhr.send(param);
		} catch(e) {
			//
		}

		xhr.onload = function() {
			if (this.status == '200') {
				if (this.readyState == 4) {
					var response = '';
					try {
						response = JSON.parse(this.responseText);
					} catch(e) {

					}

					Ti.API.log(response);
				} else {
					Ti.API.log(this.response);
				}
			} else {
				Ti.API.error("Error =>" + this.response);
			}
		};
	} else {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
	}
};

// check coins for user
Alloy.Globals.checkCoins = function() {
	// check connection
	if (Alloy.Globals.checkConnection()) {
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onerror = function(e) {
			Ti.API.error('Bad Sever =>' + e.error);
		};

		try {
			xhr.open('POST', Alloy.Globals.BETKAMPENCHECKCOINSURL + '?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
			xhr.setRequestHeader("content-type", "application/json");
			xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
			xhr.setTimeout(Alloy.Globals.TIMEOUT);

			xhr.send();
		} catch(e) {
			//
		}

		xhr.onload = function() {
			if (this.status == '200') {
				if (this.readyState == 4) {
					var coins = null;
					try {
						coins = JSON.parse(this.responseText);
						coins = parseInt(coins);
					} catch (e) {
						coins = null;
					}
					if (coins !== null) {
						if (coins <= 0) {
							var alertWindow = Titanium.UI.createAlertDialog({
								title : Alloy.Globals.PHRASES.betbattleTxt,
								message : Alloy.Globals.PHRASES.noCoinsErrorTxt,
								buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.storeTxt]
							});

							alertWindow.addEventListener('click', function(e) {
								switch (e.index) {
								case 0:
									alertWindow.hide();
									break;
								case 1:
									var win = Alloy.createController('store').getView();

									if (OS_IOS) {
										Alloy.Globals.NAV.openWindow(win, {
											animated : true
										});
									} else {
										win.open({
											fullscreen : false
										});
										win = null;
									}

									alertWindow.hide();
									break;
								}
							});
							alertWindow.show();
						}
					}

				}
			} else {
				Ti.API.error("Error =>" + this.response);
			}
		};
	}
};

// construct Challenge objects
Alloy.Globals.constructChallenge = function(responseAPI) {
	// 3 arrays will be returned from server, one for each type: accept, pending, finished
	// for each challenge object returned create a challenge object and store in array
	var finalArray = [];

	for (var c = 0; c < responseAPI.length; c++) {

		response = responseAPI[c];
		var array = [];

		for (var i = 0; i < response.length; i++) {

			// get opponents for each challenge
			var cOpponents = [];
			for (var x = 0; x < response[i].opponents.length; x++) {
				// build object
				var opponent = {
					fbid : response[i].opponents[x].uid,
					name : response[i].opponents[x].name,
					status : response[i].opponents[x].status
				};
				// store in array
				cOpponents.push(opponent);
			}

			// get winner/winners for each challenge
			var cWinners = [];
			for (var z = 0; z < response[i].winners.length; z++) {
				// build object
				var winner = {
					name : response[i].winners[z].name,
					uid : response[i].winners[z].uid
				};
				cWinners.push(winner);
			}

			if (c == 3 || c == 4) {
				// handle tournaments
				var challenge = Alloy.createModel('challenge', {
					id : response[i].id,
					name : response[i].t_name,
					time : response[i].game_date,
					opponents : cOpponents,
					winners : cWinners,
					group : response[i].group,
					league : response[i].league_id,
					round : response[i].rnd,
					opponentCount : response[i].count_opps,
					tournamentPot : response[i].pot,
					show : response[i].show
				});

			} else {
				// handle normal challenge's
				var challenge = Alloy.createModel('challenge', {
					id : response[i].c_id,
					name : response[i].c_name,
					uid : response[i].c_uid,
					time : response[i].c_time,
					status : response[i].status,
					opponents : cOpponents,
					pot : response[i].pot,
					potential_pot : response[i].potential_pot,
					winners : cWinners,
					group : response[i].group,
					league : response[i].league,
					round : response[i].round,
					show : response[i].show
				});
			}

			array.push(challenge);
		}
		finalArray.push(array);
	}

	return finalArray;
};

Alloy.Globals.getCoupon = function(uid) {
	// check connection
	if (Alloy.Globals.checkConnection()) {
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onerror = function(e) {
			Ti.API.error('Bad Sever =>' + e.error);
		};

		try {
			xhr.open('POST', Alloy.Globals.BETKAMPENGETCOUPONURL + '?lang=' + Alloy.Globals.LOCALE);
			xhr.setRequestHeader("content-type", "application/json");
			xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
			xhr.setTimeout(Alloy.Globals.TIMEOUT);

			xhr.send();
		} catch(e) {
			//
		}

		xhr.onload = function() {
			if (this.status == '200') {
				if (this.readyState == 4) {
					var response = null;
					Ti.API.info("responsen" + JSON.stringify(this.responseText));
					response = JSON.parse(this.responseText);
					Ti.API.info("Response Coupon: " + JSON.stringify(response));
					Alloy.Globals.COUPON = response;
					if (response == 0) {
						Alloy.Globals.COUPON = null;
						Alloy.Globals.hasCoupon = false;
						if (OS_IOS) {
							var children = Alloy.Globals.NAV.getChildren();
							for (var i in children) {
								if (children[i].id == "ticketView") {
									var labels = children[i].getChildren();
									for (var y in labels) {
										if (labels[y].id == "badge") {
											labels[y].setBackgroundColor("transparent");
											labels[y].setBorderColor("transparent");
											labels[y].setText("");
										}
										if (labels[y].id == "label") {
											labels[y].setColor("#303030");
										}
									}
								}
							}
						} else if (OS_ANDROID) {
							// will rebuild action bar menu
							Ti.App.fireEvent('app:rebuildAndroidMenu');
						}
					} else if (Alloy.Globals.COUPON.games.length > 0) {
						Alloy.Globals.hasCoupon = true;

						if (OS_IOS) {
							Ti.API.info("challenge succces");
							var children = Alloy.Globals.NAV.getChildren();
							for (var i in children) {
								if (children[i].id == "ticketView") {
									var labels = children[i].getChildren();
									for (var y in labels) {
										if (labels[y].id == "badge") {
											labels[y].setBackgroundColor("red");
											labels[y].setBorderColor("#c5c5c5");
											labels[y].setText("" + Alloy.Globals.COUPON.games.length);
										}
										if (labels[y].id == "label") {
											labels[y].setColor("#FFF");
										}
									}

								}
							}
						} else if (OS_ANDROID) {
							// will rebuild action bar menu
							Ti.App.fireEvent('app:rebuildAndroidMenu');
						}
					}
				} else {
					Ti.API.error("Error =>" + this.response);
				}
			}
		};
	}
};
