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
Alloy.Globals.FACEBOOKOBJECT;
Alloy.Globals.FACEBOOK;
Alloy.Globals.CHALLENGEOBJECTARRAY = [];
Alloy.Globals.BETKAMPENUID = 0;
Alloy.Globals.CHALLENGEINDEX;
Alloy.Globals.LEAGUES;
Alloy.Globals.AVAILABLELANGUAGES;
Alloy.Globals.SLIDERZINDEX = 1;
Alloy.Globals.TIMEOUT = 30000;
Alloy.Globals.CURRENTVIEW;
Alloy.Globals.PREVIOUSVIEW;
Alloy.Globals.NAV = null;
Alloy.Globals.MAINVIEW;
Alloy.Globals.MAINWIN = null;
Alloy.Globals.WINDOWS = [];
Alloy.Globals.OPEN = true;
Alloy.Globals.CLOSE = true;
Alloy.Globals.FBERROR = true;
Alloy.Globals.PHRASES = {};

// try to get stored language
var lang = JSON.parse(Ti.App.Properties.getString('language'));
lang = lang.language;

if(typeof lang == 'undefined' || lang == '' || lang == null) {
	Alloy.Globals.LOCALE = Titanium.Locale.getCurrentLanguage().toLowerCase();
} else {
	Alloy.Globals.LOCALE = lang;
}


// urls. Everything live needs to be done over SSL
Alloy.Globals.INVITEURL = 'https://apps.facebook.com/betkampen';
Alloy.Globals.BETKAMPENURL = 'http://secure.jimdavislabs.se/secure/betkampen_vm';   //
Alloy.Globals.BETKAMPENLOGINURL = Alloy.Globals.BETKAMPENURL + '/api/login.php';    //
Alloy.Globals.BETKAMPENCHALLENGESURL = Alloy.Globals.BETKAMPENURL + '/api/challenges_v2.php';  //
Alloy.Globals.BETKAMPENUSERURL = Alloy.Globals.BETKAMPENURL + '/api/user_stats.php'; //
Alloy.Globals.BETKAMPENGAMESURL = Alloy.Globals.BETKAMPENURL + '/api/get_challenge_game.php';  //
Alloy.Globals.BETKAMPENANSWERURL = Alloy.Globals.BETKAMPENURL + '/api/answer_challenge.php';   //
Alloy.Globals.BETKAMPENGETGAMESURL = Alloy.Globals.BETKAMPENURL + '/api/get_available_games.php'; //
Alloy.Globals.BETKAMPENGETGAMESFORCHALLENGEURL = Alloy.Globals.BETKAMPENURL + '/api/get_game_and_types_for_challenge.php';  //
Alloy.Globals.BETKAMPENGETGAMESFORTOURNAMENT = Alloy.Globals.BETKAMPENURL + '/api/get_tournament_game.php'; //
Alloy.Globals.BETKAMPENGETGROUPSURL = Alloy.Globals.BETKAMPENURL + '/api/get_groups.php';   //
Alloy.Globals.BETKAMPENCHALLENGEDONEURL = Alloy.Globals.BETKAMPENURL + '/api/challenge_done.php';   //
Alloy.Globals.BETKAMPENDEVICETOKENURL = Alloy.Globals.BETKAMPENURL + '/api/store_device_token.php';  //
Alloy.Globals.BETKAMPENCOINSURL = Alloy.Globals.BETKAMPENURL + '/api/get_coins.php';
Alloy.Globals.BETKAMPENCHECKCOINSURL = Alloy.Globals.BETKAMPENURL + '/api/check_coins.php';   //
Alloy.Globals.BETKAMPENCOINSANDROIDURL = Alloy.Globals.BETKAMPENURL + '/api/get_coins_android.php';
Alloy.Globals.BETKAMPENSHAREURL = Alloy.Globals.BETKAMPENURL + '/api/share.php';  //
Alloy.Globals.GETLANGUAGE = Alloy.Globals.BETKAMPENURL + '/api/get_language.php'; //

Alloy.Globals.performTimeout = function(func) {
	if (OS_ANDROID) {
		setTimeout(function() { func;
		}, 300);
	} else { func;
	}

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

// check network
Alloy.Globals.checkConnection = function() {
	return Titanium.Network.online;
};

// post device token to our backend
Alloy.Globals.postDeviceToken = function(deviceToken) {
	// check connection
	if (Alloy.Globals.checkConnection()) {
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onerror = function(e) {
			Ti.API.error('Bad Sever =>' + e.error);
		};

		try {
			xhr.open('POST', Alloy.Globals.BETKAMPENDEVICETOKENURL);
			xhr.setRequestHeader("content-type", "application/json");
			xhr.setRequestHeader("Authorization", Alloy.Globals.FACEBOOK.accessToken);
			xhr.setTimeout(Alloy.Globals.TIMEOUT);

			// build the json string
			var param = '{"device_token":"' + deviceToken + '", "device_type":"' + Ti.Platform.osname + '", "lang":"' + Alloy.Globals.LOCALE +'"}';
	
			xhr.send(param);
		} catch(e) {
			//
		}

		xhr.onload = function() {
			if (this.status == '200') {
				if (this.readyState == 4) {
					var response = '';
					try {
						response = this.response;
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
			xhr.setRequestHeader("Authorization", Alloy.Globals.FACEBOOK.accessToken);
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
					fbid : response[i].opponents[x].fbid,
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
					fbid : response[i].winners[z].fbid,
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
					fbid : response[i].c_fbid,
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

