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

// change english months to swedish
function changeMonth(month) {
	var returnMonth = month;

	if (month != -1) {
		returnMonth = sweMonths[month];
	}

	return returnMonth;
}

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
		text : 'Inga spel hittades',
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

// show the tableView
function createAndShowTableView(league, array) {
	// check if table exists, and if it does simply remove it
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
			tintColor : '#58B101'
		});

		// will refresh on pull
		refresher.addEventListener('refreshstart', function(e) {
			if (Alloy.Globals.checkConnection()) {
				getGames(leagueId);
			} else {
				Alloy.Globals.showFeedbackDialog('Ingen anslutning!');
				refresher.endRefreshing();
			}

		});
	}

	var tableHeaderView = Ti.UI.createView({
		height : '142dp',
		backgroundImage : '/images/header.png'
	});

	var nameFont = Alloy.Globals.getFontSize(3);

	if (leagueName.length > 13) {
		if (OS_ANDROID) {
			nameFont = 36;
		} else if (OS_IOS) {
			nameFont = 32;
		}
	}

	tableHeaderView.add(Ti.UI.createLabel({
		width : '100%',
		textAlign : 'center',
		top : 50,
		text : leagueName,
		font : {
			fontSize : nameFont,
			fontWeight : 'normal',
			fontFamily : Alloy.Globals.getFont()
		},
		color : '#FFF'
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

	table.footerView = Ti.UI.createView({
		height : 0.5,
		backgroundColor : '#6d6d6d'
	});

	var data = [];

	// Rows
	for (var i = 0; i < array.length; i++) {
		// error in json sent, date in milliseconds is missing 000 at the end?
		var dateFix = parseInt(array[i].attributes.game_date + '000');
		var date = new Date(dateFix);

		var dateString = date.toUTCString();
		dateString = dateString.substring(5, (dateString.length - 3));

		var subRow = Ti.UI.createTableViewRow({
			layout : 'vertical',
			selectionStyle : 'none',
			backgroundColor : '#303030'
		});

		subRow.footerView = Ti.UI.createView({
			height : 0.5,
			backgroundColor : '#6d6d6d'
		});

		subRow.add(Ti.UI.createView({
			height : 12
		}));

		for (var x = 0; x < array[i].attributes.game_values.length; x++) {

			subRow.add(Ti.UI.createLabel({
				text : array[i].attributes.game_values[x],
				left : 60,
				font : {
					fontSize : Alloy.Globals.getFontSize(1),
					fontWeight : 'normal',
					fontFamily : Alloy.Globals.getFont()
				},
				color : '#FFF',
				backgroundColor : '#303030'
			}));
		}

		subRow.add(Ti.UI.createView({
			height : 12
		}));

		// array with views for the sub in table row
		var subRowArray = [];
		subRowArray.push(subRow);

		var rowChild;
		if (OS_IOS) {
			rowChild = true;
		} else if (OS_ANDROID) {
			rowChild = false;
		}

		var row = Ti.UI.createTableViewRow({
			id : array[i].attributes.round,
			hasChild : rowChild,
			isparent : true,
			opened : false,
			sub : subRowArray,
			width : '100%',
			backgroundColor : '#242424',
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
					color : "#2E2E2E",
					offset : 0.0
				}, {
					color : "#151515",
					offset : 1.0
				}]
			},
		});

		row.add(Ti.UI.createLabel({
			text : dateString,
			top : 10,
			left : 60,
			font : {
				fontSize : Alloy.Globals.getFontSize(1),
				fontWeight : 'normal',
				fontFamily : Alloy.Globals.getFont()
			},
			color : '#58B101'
		}));

		row.add(Ti.UI.createLabel({
			text : 'Antal matcher: ' + array[i].attributes.game_values.length,
			top : 30,
			left : 60,
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

		var detailsImg = Ti.UI.createImageView({
			name : 'detailsBtn',
			width : 35,
			height : 35,
			top : 11,
			left : 5,
			id : array[i].attributes.round,
			image : '/images/p.png'
		});

		row.add(detailsImg);

		if (OS_ANDROID) {
			row.add(Ti.UI.createLabel({
				font : {
					fontFamily : font
				},
				text : fontawesome.icon('icon-chevron-right'),
				right : '5%',
				color : '#FFF',
				fontSize : 80,
				height : 'auto',
				width : 'auto'
			}));
		}

		row.className = date.toUTCString();
		data.push(row);
	}

	table.setData(data);

	// add event listener
	table.addEventListener("click", function(e) {
		if (Alloy.Globals.SLIDERZINDEX == 2) {
			return;
		}

		// check if we press the button on the row
		if (e.source.name === 'detailsBtn') {

			// change Image
			if (e.source.image == '/images/p.png') {
				e.source.image = '/images/m.png';
			} else {
				e.source.image = '/images/p.png';
			}

			// will show all matches
			//Is this a parent cell?
			if (e.row.isparent) {
				//Is it opened?
				if (e.row.opened) {
					for (var i = e.row.sub.length; i > 0; i = i - 1) {
						table.deleteRow(e.index + i);
					}
					e.row.opened = false;
				} else {
					//Add the children.
					var currentIndex = e.index;
					for (var i = 0; i < e.row.sub.length; i++) {
						table.insertRowAfter(currentIndex, e.row.sub[i]);
						currentIndex++;
					}
					e.row.opened = true;
				}
			}

		} else {
			// open challenge view here, with arguments (roundId) for a new challenge

			// e.rowData is null in android
			if (OS_ANDROID) {
				// fix for android
				e.rowData = e.row;
			}

			if (e.rowData !== null && typeof e.rowData.id !== 'undefined') {
				var matchDate = new Date(e.rowData.className);
				matchDate.setHours(matchDate.getHours() - 2);
				var now = new Date();

				if (now.getTime() > matchDate.getTime()) {
					Alloy.Globals.showFeedbackDialog('Denna omgången har redan börjat, därför kan du inte utmana någon på den.');
				} else {
					var arg = {
						round : e.row.id,
						leagueName : leagueName,
						leagueId : leagueId
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
			Alloy.Globals.showFeedbackDialog('Något gick fel! Försök igen.');
			if (OS_IOS) {
				if ( typeof refresher !== 'undefined') {
					refresher.endRefreshing();
				}
			}
		};

		try {
			xhr.open('GET', Alloy.Globals.BETKAMPENGETGAMESURL + '/?uid=' + Alloy.Globals.BETKAMPENUID + '&league=' + league);
			xhr.setRequestHeader("content-type", "application/json");
			xhr.setRequestHeader("Authorization", Alloy.Globals.FACEBOOK.accessToken);
			xhr.setTimeout(Alloy.Globals.TIMEOUT);

			xhr.send();
		} catch(e) {
			indicator.closeIndicator();
			Alloy.Globals.showFeedbackDialog('Något gick fel! Försök igen.');
			if (OS_IOS) {
				if ( typeof refresher !== 'undefined') {
					refresher.endRefreshing();
				}
			}
		}
		xhr.onload = function() {
			if (this.status == '200') {
				if (this.readyState == 4) {
					var response = JSON.parse(this.responseText);
					// create gameListObjects and use that array to create table
					var array = createGameListObject(response);

					if (array.length > 0) {
						createAndShowTableView(league, array);
					} else {
						createNoGamesView();
					}

				} else {
					Alloy.Globals.showFeedbackDialog('Något gick fel!');
				}
				indicator.closeIndicator();
			} else {
				Alloy.Globals.showFeedbackDialog('Server svarar med felkod' + this.status + ' ' + JSON.parse(this.responseText));
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
		Alloy.Globals.showFeedbackDialog('Ingen anslutning!');
	}
}

/* Flow */
var sweMonths = ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"];
var leagueName = '';
var leagueId = -1;
var table;
var refresher;

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
	top : 200
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
		$.newChallenge.activity.actionBar.title = 'Betkampen';
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

