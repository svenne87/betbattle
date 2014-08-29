Ti.App.addEventListener("sliderToggled", function(e) {
	if ( typeof table !== 'undefined') {
		if (e.hasSlided) {
			table.touchEnabled = false;
		} else {
			table.touchEnabled = true;
		}
	}
});

// refresh this view
Ti.App.addEventListener("newChallengeRefresh", function(e) {
	indicator.openIndicator();
	getGames(leagueId);
});

// create gameListObject
function createGameListObject(response) {
	var array = [];

	for (var i = 0; i < response.length; i++) {

		var gameValues = [];
		for (var x = 0; x < response[i].game_values.length; x++) {
			var gameValue = response[i].game_values[x];
			// store in array
			gameValues.push(gameValue);
		}

		var team_1 = {
			team_id : response[i].team_1.team_id,
			team_logo : response[i].team_1.team_logo,
			team_name : response[i].team_1.team_name
		};
		var team_2 = {
			team_id : response[i].team_2.team_id,
			team_logo : response[i].team_2.team_logo,
			team_name : response[i].team_2.team_name
		};

		var gameListObject = Alloy.createModel('gameListObject', {
			game_id : response[i].game_id,
			game_type : response[i].game_type,
			game_date : response[i].game_date,
			status : response[i].status,
			league_id : response[i].league_id,
			round : response[i].round_id,
			team_1 : team_1,
			team_2 : team_2,
			game_values : gameValues
		});
		// add to the array
		array.push(gameListObject);
	}
	return array;
}

// create a "no games found view"
function createNoGamesView() {
	$.newChallenge.add(Ti.UI.createLabel({
		width : '100%',
		text : Alloy.Globals.PHRASES.noGamesTxt,
		left : 60,
		top : 40,
		font : {
			fontSize : Alloy.Globals.getFontSize(2),
			fontWeight : '400',
			fontFamily : Alloy.Globals.getFont()
		},
		color : '#FFF'
	}));
}

// create sinle table row
function createTableRow(obj) {
	// error in json sent, date in milliseconds is missing 000 at the end?
	var dateFix = parseInt(obj.attributes.game_date + '000');
	var date = new Date(dateFix);

	var dateString = date.toUTCString();
	dateString = dateString.substring(5, (dateString.length - 7));

	var child;

	if (OS_IOS) {
		child = true;
	} else if (OS_ANDROID) {
		child = false;
	}

	var row = $.UI.create('TableViewRow', {
		classes : ['challengesSectionDefault'],
		id : obj.attributes.round,
		hasChild : child
	});

	// add custom icon on Android to symbol that the row has child
	if (child != true) {
		var fontawesome = require('lib/IconicFont').IconicFont({
			font : 'lib/FontAwesome'
		});

		var font = 'FontAwesome';
		var rightPercentage = '5%';

		if (OS_ANDROID) {
			font = 'fontawesome-webfont';

			if (Titanium.Platform.displayCaps.platformWidth < 350) {
				rightPercentage = '3%';
			}
		}

		row.add(Ti.UI.createLabel({
			font : {
				fontFamily : font
			},
			text : fontawesome.icon('icon-chevron-right'),
			right : rightPercentage,
			color : '#FFF',
			fontSize : 80,
			height : 'auto',
			width : 'auto'
		}));
	}

	row.add(Ti.UI.createLabel({
		text : dateString,
		top : 10,
		left : 20,
		font : {
			fontSize : Alloy.Globals.getFontSize(1),
			fontWeight : 'normal',
			fontFamily : Alloy.Globals.getFont()
		},
		color : '#FFF'
	}));

	row.add(Ti.UI.createLabel({
		text : obj.attributes.team_1.team_name + " - " + obj.attributes.team_2.team_name,
		top : 30,
		left : 20,
		font : {
			fontSize : Alloy.Globals.getFontSize(1),
			fontWeight : 'normal',
			fontFamily : Alloy.Globals.getFont()
		},
		color : '#FFF'
	}));

	row.add(Ti.UI.createView({
		top : 50,
		layout : 'vertical',
		height : 12
	}));
	row.gameID = obj.attributes.id;
	row.teamNames = obj.attributes.team_1.team_name + " - " + obj.attributes.team_2.team_name;
	row.className = date.toUTCString();
	return row;
}

// show the tableView
function createAndShowTableView(league, array) {
	// check if table exists, and if it does simply remove it
	Ti.API.info("Array" + JSON.stringify(array));
	var children = $.newChallenge.children;
	for (var i = 0; i < children.length; i++) {
		if (children[i].id === 'newChallengeTable') {
			$.newChallenge.remove(children[i]);
		}
	}

	leagueId = league;

	for (var i in Alloy.Globals.LEAGUES) {
		if (Alloy.Globals.LEAGUES[i].id == leagueId) {
			leagueName = Alloy.Globals.LEAGUES[i].name;
		}
	}

	// View
	var tableView = Ti.UI.createView({
		heigth : '100%',
		width : '100%',
		layout : 'vertical',
		id : 'newChallengeTable'
	});

	if (OS_IOS) {
		refresher = Ti.UI.createRefreshControl({
			tintColor : Alloy.Globals.themeColor()
		});

		// will refresh on pull
		refresher.addEventListener('refreshstart', function(e) {
			if (Alloy.Globals.checkConnection()) {
				getGames(leagueId);
			} else {
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
				refresher.endRefreshing();
			}

		});
	}

	var tableHeaderView = Ti.UI.createView({
		height : "10%",
		width : Ti.UI.FILL,
		backgroundColor : "transparent",
	});

	tableHeaderView.add(Ti.UI.createLabel({
		text : Alloy.Globals.PHRASES.pickMatchTxt,
		textAlign : "center",
		color : "#FFF",
		font : {
			fontSize : Alloy.Globals.getFontSize(2),
			fontFamily : "Impact",
		}
	}));

	if (OS_IOS) {
		// Table
		table = Ti.UI.createTableView({
			headerView : tableHeaderView,
			height : 'auto',
			refreshControl : refresher,
			backgroundColor : '#303030',
			separatorInsets : {
				left : 0,
				right : 0
			}
		});
	} else {
		// Table
		table = Ti.UI.createTableView({
			headerView : tableHeaderView,
			height : 'auto',
			backgroundColor : '#303030'
		});

	}

	var footerView = Ti.UI.createView({
		height : 60,
		backgroundColor : 'transparent',
		layout : 'vertical'
	});
	
	footerView.add(Ti.UI.createLabel({
		text : Alloy.Globals.PHRASES.showningMatchesTxt + ': 1-10',
		textAlign : "center",
		color : Alloy.Globals.themeColor(),
		font : {
			fontSize : 10,
			fontFamily : Alloy.Globals.getFont(),
		}
	}));
	
	footerView.add(Ti.UI.createLabel({
		text : Alloy.Globals.PHRASES.loadMoreTxt + '...',
		textAlign : "center",
		color : Alloy.Globals.themeColor(),
		font : {
			fontSize : 10,
			fontFamily : Alloy.Globals.getFont(),
		}
	}));

	footerView.addEventListener('click', function() {
		Ti.API.log('load more...');
		// TODO
		table.appendRow(createTableRow(array[0]));
	});

	table.footerView = footerView;

	var data = [];

	// Rows
	for (var i = 0; i < array.length; i++) {
		// each row is created
		data.push(createTableRow(array[i]));
	}

	table.setData(data);

	// add event listener
	table.addEventListener("click", function(e) {
		if (Alloy.Globals.SLIDERZINDEX == 2) {
			return;
		}

		// open challenge view here, with arguments (roundId) for a new challenge

		// e.rowData is null in android
		if (OS_ANDROID) {
			// fix for android
			e.rowData = e.row;
		}

		if (e.rowData !== null && typeof e.rowData.id !== 'undefined') {
			Ti.API.info("maatch" + JSON.stringify(e.rowData));
			var matchDate = new Date(e.rowData.className);
			matchDate.setHours(matchDate.getHours() - 2);
			var now = new Date();

			var teamNames = e.rowData.teamNames;
			var gameID = e.rowData.gameID;

			if (now.getTime() > matchDate.getTime()) {
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.roundHasStartedErrorTxt);
			} else {
				var arg = {
					round : e.row.id,
					leagueName : leagueName,
					leagueId : leagueId,
					teamNames : teamNames,
					gameID: gameID,
				};

				var win = Alloy.createController('challenge', arg).getView();
				Alloy.Globals.WINDOWS.push(win);

				if (OS_IOS) {
					Alloy.Globals.NAV.openWindow(win, {
						animated : true
					});
				} else if (OS_ANDROID) {
					win.open({
						fullScreen : true
					});
				}
			}
		}
	});

	tableView.add(table);
	$.newChallenge.add(tableView);
}

// will fetch games from API
function getGames(league) {
	// check connection
	if (Alloy.Globals.checkConnection()) {

		if (OS_IOS) {
			indicator.openIndicator();
		}

		// Get games available to challenge
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onerror = function(e) {
			Ti.API.error('Bad Sever =>' + e.error);
			indicator.closeIndicator();
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
			if (OS_IOS) {
				if ( typeof refresher !== 'undefined') {
					refresher.endRefreshing();
				}
			}
		};

		try {
			xhr.open('GET', Alloy.Globals.BETKAMPENGETGAMESURL + '/?uid=' + Alloy.Globals.BETKAMPENUID + '&league=' + league + '&lang=' + Alloy.Globals.LOCALE);
			xhr.setRequestHeader("content-type", "application/json");
			xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
			xhr.setTimeout(Alloy.Globals.TIMEOUT);

			xhr.send();
		} catch(e) {
			indicator.closeIndicator();
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
			if (OS_IOS) {
				if ( typeof refresher !== 'undefined') {
					refresher.endRefreshing();
				}
			}
		}
		xhr.onload = function() {
			if (this.status == '200') {
				if (this.readyState == 4) {
					Ti.API.info("getGames = " + JSON.stringify(this.responseText));
					var response = JSON.parse(this.responseText);
					// create gameListObjects and use that array to create table
					var array = createGameListObject(response);

					if (array.length > 0) {
						createAndShowTableView(league, array);
					} else {
						createNoGamesView();
					}

				} else {
					Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
				}
				indicator.closeIndicator();
			} else {
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
				indicator.closeIndicator();
				if (OS_IOS) {
					if ( typeof refresher !== 'undefined') {
						refresher.endRefreshing();
					}
				}
				Ti.API.error("Error =>" + this.response);
			}
		};

	} else {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
	}
}

/* Flow */
var leagueName = '';
var leagueId = -1;
var table;
var refresher;

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

	$.newChallenge.orientationModes = [Titanium.UI.PORTRAIT];

	$.newChallenge.addEventListener('open', function() {
		$.newChallenge.activity.actionBar.onHomeIconItemSelected = function() {
			$.newChallenge.close();
			$.newChallenge = null;
		};
		$.newChallenge.activity.actionBar.displayHomeAsUp = true;
		$.newChallenge.activity.actionBar.title = Alloy.Globals.PHRASES.betbattleTxt;
		indicator.openIndicator();
	});
	/*
	 $.newChallenge.addEventListener('androidback', function(){
	 $.newChallenge.close();
	 $.newChallenge = null;
	 });
	 */

}

$.newChallenge.addEventListener('close', function() {
	indicator.closeIndicator();
});

var args = arguments[0] || {};
if ( typeof args.leagueId !== 'undefined') {
	leagueId = args.leagueId;
	// get games for that specific league
	getGames(leagueId);
}

