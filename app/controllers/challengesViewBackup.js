/*
Ti.App.addEventListener("sliderToggled", function(e) {
if ( typeof table !== 'undefined') {
if (e.hasSlided) {
table.touchEnabled = false;
} else {
table.touchEnabled = true;
}
}
});*/
var mod = require('bencoding.blur');
// update coins
Ti.App.addEventListener('updateCoins', function(coins) {
	var currentCoins = -1;
	try {
		var currentCoinsText = userInfoCoinsLabel.getText();
		currentCoins = parseInt(currentCoinsText);
		coins = parseInt(coins.coins);
	} catch (e) {

	}

	if (currentCoins > -1) {
		currentCoins = currentCoins + coins;
		userInfoCoinsLabel.setText(Alloy.Globals.PHRASES.coinsInfoTxt + ": " + currentCoins.toString());
	}
});

// refresh this view
Ti.App.addEventListener("challengesViewRefresh", function(e) {
	if (Alloy.Globals.checkConnection()) {
		indicator.openIndicator();

		if (OS_ANDROID) {
			var children = $.challengesView.children;
			$.challengesView.removeAllChildren();

			for (var i = 0; i < children.length; i++) {
				if (children[i].id === 'challengeTable') {
					$.challengesView.remove(children[i]);
					children[i] = null;
				}
			}
		}
		getChallenges();
	} else {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
		userInfoCoinsLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
		userInfoWinsLabel.setText('');
	}
});

// get coins for user
function getUserInfo() {

	var xhr = Titanium.Network.createHTTPClient();
	xhr.onerror = function(e) {
		userInfoCoinsLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
		userInfoWinsLabel.setText('');
		Ti.API.error('Bad Sever =>' + e.error);
	};

	try {
		xhr.open('POST', Alloy.Globals.BETKAMPENUSERURL + '?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
		xhr.setRequestHeader("content-type", "application/json");
		xhr.setRequestHeader("Authorization", Alloy.Globals.FACEBOOK.accessToken);
		xhr.setTimeout(Alloy.Globals.TIMEOUT);

		xhr.send();
	} catch(e) {
		userInfoCoinsLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
		userInfoWinsLabel.setText('');
	}

	xhr.onload = function() {
		if (this.status == '200') {
			if (this.readyState == 4) {
				var userInfo = null;
				try {
					userInfo = JSON.parse(this.responseText);
				} catch (e) {
					userInfo = null;
				}

				if (userInfo !== null) {
					userInfoCoinsLabel.setText(Alloy.Globals.PHRASES.coinsInfoTxt + ": " + userInfo.totalCoins);
					userInfoWinsLabel.setText(Alloy.Globals.PHRASES.scoreInfoTxt + ": " + userInfo.totalPoints);
				}
			}
		} else {
			userInfoCoinsLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
			userInfoWinsLabel.setText('');
			Ti.API.error("Error =>" + this.response);
		}
	};
}

function checkTournament(obj) {
	var opponents = obj.attributes.opponents;

	for (opponent in opponents) {
		if (opponents[opponent].fbid === Alloy.Globals.FACEBOOKOBJECT.attributes.id) {
			// this is me
			if (opponents[opponent].status == 2) {
				// I have already posted a answer for this tournament round
				return true;
			}
		}
	}
	return false;
}

// check for users that have status 2 in challenge/tournament
function checkActiveUsers(array) {
	var activeUserCount = 0;
	for (a in array) {
		if (array[a].status == '2') {
			activeUserCount++;
		}
	}
	return activeUserCount;
}

function getDynamicLeftPos(oppCount) {
	if (OS_IOS) {
		var dynamicLeftPos = 80;

		// will move the text deppending on the amount of participants in the tournament
		if (oppCount > 9 && oppCount <= 99) {
			dynamicLeftPos = 85;
		} else if (oppCount > 99 && oppCount <= 999) {
			dynamicLeftPos = 90;
		}
		/* else if (oppCount > 999) {
		 dynamicLeftPos = 100;
		 }*/

	} else if (OS_ANDROID) {
		var dynamicLeftPos = 80;

		// will move the text deppending on the amount of participants in the tournament
		if (oppCount > 9 && oppCount <= 99) {
			dynamicLeftPos = 85;
		} else if (oppCount > 99 && oppCount <= 999) {
			dynamicLeftPos = 95;
		}
		/* else if (oppCount > 999) {
		 dynamicLeftPos = 105;
		 }*/
	}

	return dynamicLeftPos;
}

// show pending and finished challenges and tournaments in a webview
function showChallengeInWebView(challengeId, roundId, groupName) {
	if (Alloy.Globals.checkConnection()) {
		var url;

		if (groupName === null) {
			groupName = '';
		}

		if (roundId == -1) {
			url = Alloy.Globals.BETKAMPENURL + '/webviews/show_challenge_wv.php?fbid=' + Alloy.Globals.FACEBOOKOBJECT.id + '&uid=' + Alloy.Globals.BETKAMPENUID + '&cid=' + challengeId + '&group=' + groupName;
		} else {
			url = Alloy.Globals.BETKAMPENURL + '/webviews/show_challenge_wv.php?fbid=' + Alloy.Globals.FACEBOOKOBJECT.id + '&uid=' + Alloy.Globals.BETKAMPENUID + '&tid=' + challengeId + '&rid=' + roundId + '&group=' + groupName;
		}

		var win = Ti.UI.createWindow({});

		if (OS_IOS) {
			indicator.openIndicator();
		} else if (OS_ANDROID) {
			win.orientationModes = [Titanium.UI.PORTRAIT];

			win.addEventListener('open', function() {
				win.activity.actionBar.onHomeIconItemSelected = function() {
					win.close();
					win = null;
				};
				win.activity.actionBar.displayHomeAsUp = true;
				indicator.openIndicator();
			});
		}

		//display loading spinner until webview gets loaded
		var extwebview;

		if (OS_ANDROID) {
			extwebview = Titanium.UI.createWebView({
				top : 0,
				left : 0,
				right : 0,
				url : url,
				height : Ti.UI.FILL,
				width : Ti.UI.FILL,
				backgroundColor : '#303030',
				softKeyboardOnFocus : Titanium.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS
			});
		} else {
			extwebview = Titanium.UI.createWebView({
				top : 0,
				left : 0,
				right : 0,
				url : url,
				height : Ti.UI.FILL,
				width : Ti.UI.FILL,
				backgroundColor : '#303030'
			});
		}
		extwebview.hideLoadIndicator = true;
		win.add(extwebview);
		//adding webview in current window

		extwebview.addEventListener('load', function() {
			indicator.closeIndicator();
			//Hide the Loading indicator after the webview loaded
		});

		if (OS_IOS) {
			Alloy.Globals.NAV.openWindow(win, {
				animated : true
			});
		} else if (OS_ANDROID) {
			win.open({
				fullScreen : true
			});
		}

		win.addEventListener('close', function() {
			indicator.closeIndicator();
		});

	} else {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
	}
}

// create sections for the table
function createSectionsForTable(sectionText) {
	var sectionView = $.UI.create('View', {
		classes : ['challengesSection']
	});

	sectionView.add(Ti.UI.createLabel({
		top : '25%',
		width : '100%',
		textAlign : 'center',
		text : sectionText,
		font : {
			fontSize : Alloy.Globals.getFontSize(2),
			fontWeight : 'normal',
			fontFamily : 'Impact',
		},
		color : '#FFF'
	}));

	if (OS_IOS) {
		return Ti.UI.createTableViewSection({
			headerView : sectionView,
			footerView : Ti.UI.createView({
				height : 0.1
			})
		});
	} else if (OS_ANDROID) {
		return Ti.UI.createTableViewSection({
			headerView : sectionView
		});
	}

}

// show empty row if no games found
function createEmptyTableRow(text) {
	var row = Ti.UI.createTableViewRow({
		hasChild : false,
		width : Ti.UI.FILL,
		left : 0,
		name : 'empty',
		height : 60
	});

	row.add(Ti.UI.createLabel({
		text : Alloy.Globals.PHRASES.noneTxt + ' ' + text + ' ' + Alloy.Globals.PHRASES.foundTxt,
		left : 60,
		font : {
			fontSize : Alloy.Globals.getFontSize(1),
			fontWeight : 'normal',
			fontFamily : Alloy.Globals.getFont()
		},
		color : '#FFF'
	}));

	if (iOSVersion < 7) {
		row.add(Ti.UI.createView({
			height : 0.5,
			top : 57,
			backgroundColor : '#6d6d6d',
			width : '120%'
		}));
	}

	return row;
}

// build and return rows that are of the type 'Accept' , 'Pending' and 'Finished'
function constructChallengeRows(obj, index, type) {
	var child = true;
	if (OS_ANDROID) {
		child = false;
	}

	var row = Ti.UI.createTableViewRow({
		id : index,
		hasChild : child,
		width : Ti.UI.FILL,
		left : 0,
		className : type,
		height : 70
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

	var imageLocation;
	if (type === 'tournament' || type === 'tournament_finished') {
		imageLocation = '/images/Topplista.png';
	} else {
		imageLocation = '/images/ikon_spelanasta.png';
	}

	row.add(Ti.UI.createImageView({
		image : imageLocation,
		left : 15,
		top : 20,
		width : 30,
		height : 30
	}));

	var date = obj.attributes.time;
	date = date.substring(0, 10);
	date = date.substring(5);

	// check first char
	if (date.charAt(0) == '0') {
		date = date.substring(1);
	}

	// change position
	var datePartOne = date.substring(date.lastIndexOf('-'));
	datePartOne = datePartOne.replace('-', '');
	if (datePartOne.charAt(0) == '0') {
		datePartOne = datePartOne.substring(1);
	}

	var datePartTwo = date.substring(0, date.indexOf('-'));
	date = datePartOne + '/' + datePartTwo;

	var time = obj.attributes.time;
	time = time.substring(time.length - 8);
	time = time.substring(0, 5);

	var firstRowView = Ti.UI.createView({
		layout : 'hotizontal',
		top : -22
	});

	var betGroupName = Alloy.Globals.PHRASES.unknownGroupTxt;

	if (type !== 'tournament' && type !== 'tournament_finished') {
		// for normal challenge
		try {
			betGroupName = obj.attributes.group[0].name;
		} catch(e) {
			// do nothing
		}
		
		if (betGroupName.length > 9) {
			betGroupName = betGroupName.substring(0, 7) + '...';
		}
	} else { 
		// for tournament's
		if ((type === 'tournament' && obj.attributes.opponents.length === 1) || (type === 'tournament_finished' && obj.attributes.opponents.length === 1)) {
			betGroupName = Alloy.Globals.PHRASES.betbattleTxt;
		} else {
			betGroupName = Alloy.Globals.PHRASES.tournamentTxt;

			if(obj.attributes.group.name != null) {
				betGroupName = obj.attributes.group.name;
			} 
			
			if (betGroupName.length === 0 || betGroupName === '') {
				betGroupName = 'Turnering';
			} else if (betGroupName === 'BetKampen Community') {
				betGroupName = Alloy.Globals.PHRASES.betbattleTxt;
			}

			if (betGroupName.length > 9) {
				betGroupName = betGroupName.substring(0, 7) + '...';
			}
		}
	}

	firstRowView.add(Ti.UI.createLabel({
		left : 60,
		text : betGroupName,
		font : {
			fontSize : Alloy.Globals.getFontSize(1),
			fontWeight : 'bold',
			fontFamily : Alloy.Globals.getFont()
		},
		color : Alloy.Globals.themeColor()
	}));

	var startTextLeftPos = 150;
	var textLeftPos = 200;
	var potTextPos = 171;

	if (OS_ANDROID) {
		startTextLeftPos = 155;
		textLeftPos = 205;
		potTextPos = 167;
	}

	firstRowView.add(Ti.UI.createLabel({
		left : startTextLeftPos,
		font : {
			fontSize : Alloy.Globals.getFontSize(1),
			fontWeight : 'bold',
			fontFamily : Alloy.Globals.getFont()
		},
		text : Alloy.Globals.PHRASES.startTxt + ': ',
		color : '#FFF'
	}));

	var topPos = 35;
	var size = Alloy.Globals.getFontSize(1);
	if (OS_IOS && iOSVersion < 7) {
		size = 15;
		topPos = 36;
	}

	firstRowView.add(Ti.UI.createLabel({
		left : textLeftPos,
		text : ' ' + date + ' ' + time,
		font : {
			fontSize : size,
			fontWeight : 'normal',
			fontFamily : Alloy.Globals.getFont()
		},
		color : '#FFF',
		top : topPos
	}));

	var secondRowView = Ti.UI.createView({
		layout : 'hotizontal',
		top : 28
	});

	var oppCount = 0;

	if (type === 'tournament' && checkTournament(obj) === true && obj.attributes.opponents.length === 1) {
		oppCount = parseInt(obj.attributes.opponentCount);
	} else {
		var oppCount = parseInt(obj.attributes.opponents.length);

		if (oppCount === 1 && obj.attributes.group.name === 'BetKampen Community') {
			oppCount = parseInt(obj.attributes.opponentCount);
		}
	}

	secondRowView.add(Ti.UI.createLabel({
		left : 60,
		text : oppCount.toString(),
		font : {
			fontSize : Alloy.Globals.getFontSize(1),
			fontWeight : 'bold',
			fontFamily : Alloy.Globals.getFont()
		},
		color : Alloy.Globals.themeColor()
	}));

	secondRowView.add(Ti.UI.createLabel({
		left : getDynamicLeftPos(oppCount),
		text : Alloy.Globals.PHRASES.participantTxt,
		font : {
			fontSize : Alloy.Globals.getFontSize(1),
			fontWeight : 'normal',
			fontFamily : Alloy.Globals.themeColor()
		},
		color : '#FFF'
	}));

	secondRowView.add(Ti.UI.createLabel({
		left : potTextPos,
		text : Alloy.Globals.PHRASES.potTxt + ':',
		font : {
			fontSize : Alloy.Globals.getFontSize(1),
			fontWeight : 'bold',
			fontFamily : Alloy.Globals.getFont()
		},
		color : '#FFF'
	}));

	var currentPot = Alloy.Globals.PHRASES.unknownSmallTxt;

	if ((type === 'tournament' && obj.attributes.opponents.length === 1) || (type === 'tournament_finished' && obj.attributes.opponents.length === 1)) {
		try {
			currentPot = obj.attributes.tournamentPot;
		} catch (e) {
			currentPot = Alloy.Globals.PHRASES.unknownSmallTxt;
		}
	} else if ((type === 'tournament' && obj.attributes.opponents.length > 1) || (type === 'tournament_finished' && obj.attributes.opponents.length > 1)) {
		try {
			var activeUsers = checkActiveUsers(obj.attributes.opponents);
			currentPot = activeUsers * obj.attributes.tournamentPot;
		} catch (e) {
			currentPot = Alloy.Globals.PHRASES.unknownSmallTxt;
		}
	} else {
		try {
			currentPot = obj.attributes.pot;
		} catch (e) {
			currentPot = Alloy.Globals.PHRASES.unknownSmallTxt;
		}
	}

	secondRowView.add(Ti.UI.createLabel({
		left : textLeftPos,
		text : ' ' + currentPot,
		font : {
			fontSize : Alloy.Globals.getFontSize(1),
			fontFamily : Alloy.Globals.getFont()
		},
		color : '#FFF'
	}));

	// Add info to the created row
	row.add(firstRowView);
	row.add(secondRowView);

	row.add(Ti.UI.createView({
		top : 60,
		heigth : 14,
		layout : 'horizontal'
	}));

	if (iOSVersion < 7) {
		row.add(Ti.UI.createView({
			height : 0.5,
			top : 65,
			backgroundColor : '#6d6d6d',
			width : '120%'
		}));
	}

	return row;
}

// create the hole table view with sections and checks if there are no challenges
function constructTableView(array) {

	if (OS_IOS) {
		refresher = Ti.UI.createRefreshControl({
			tintColor : Alloy.Globals.themeColor()
		});

		// will refresh on pull
		refresher.addEventListener('refreshstart', function(e) {
			if (Alloy.Globals.checkConnection()) {
				getChallenges();
			} else {
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
				refresher.endRefreshing();
				userInfoCoinsLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
				userInfoWinsLabel.setText('');
			}

		});
	}

	// check if table exists, and if it does simply remove it
	var children = $.challengesView.children;
	for (var i = 0; i < children.length; i++) {
		if (children[i].id === 'challengeTable') {
			$.challengesView.remove(children[i]);
			children[i] = null;
		}
	}

	var sections = [];

	var tableHeaderView = Ti.UI.createView({
		height : 80,
		backgroundColor : 'transparent'
	});

	var userInfoView = Ti.UI.createView({
		top : 0
	});

	var userInfoViewTop = Ti.UI.createView({
		top : 0,
		height : 35,
		layout : 'horizontal',
		//backgrounColor : '#000000',
		//opacity: "0.7"
	});

	var userInfoViewBottom = Ti.UI.createView({
		top : 35,
		height : 35,
		layout : 'horizontal',
		//backgrounColor : '#000000'
	});

	userInfoViewTop.add(Ti.UI.createImageView({
		left : 60,
		top : 15,
		height : 15,
		width : 20,
		image : '/images/totalt_saldo.png'
	}));
	
	userInfoViewBottom.add(Ti.UI.createImageView({
		left : 60,
		height : 15,
		width : 15,
		image : '/images/vinster_top.png'
	}));

	userInfoCoinsLabel = Ti.UI.createLabel({
		left : 5,
		top : 12,
		text : Alloy.Globals.PHRASES.loadingTxt,
		font : {
			fontSize : Alloy.Globals.getFontSize(1),
			fontWeight : 'bold',
			fontFamily : Alloy.Globals.getFont()
		},
		color : Alloy.Globals.themeColor()
	});

	userInfoWinsLabel = Ti.UI.createLabel({
		left : 10,
		text : '',
		font : {
			fontSize : Alloy.Globals.getFontSize(1),
			fontWeight : 'bold',
			fontFamily : Alloy.Globals.getFont()
		},
		color : Alloy.Globals.themeColor()
	});

	var fontawesome = require('lib/IconicFont').IconicFont({
		font : 'lib/FontAwesome'
	});

	var font = 'FontAwesome';

	if (OS_ANDROID) {
		font = 'fontawesome-webfont';
	}

	var leftImageView = Ti.UI.createImageView({
		left : 10,
		height : 40,
		width : 40,
		borderRadius: 20,
		image : 'https://graph.facebook.com/' + Alloy.Globals.FACEBOOKOBJECT.id + '/picture'
	});

	var rightPos = '2%';

	var chevronColor = '#F9F9F9';
	if (OS_IOS && iOSVersion < 7) {
		chevronColor = '000';
	}

	var rightInfoLabel = Ti.UI.createLabel({
		right : rightPos,
		top : 0,
		height : 70,
		width : 20,
		font : {
			fontFamily : font
		},
		text : fontawesome.icon('fa-chevron-right'),
		color : chevronColor,
		fontSize : 80
	});

	userInfoView.addEventListener('click', function() {
		var win = Alloy.createController('profile').getView();
		if (OS_IOS) {
			Alloy.Globals.NAV.openWindow(win, {
				animated : true
			});
		} else {
			win.open({
				fullScreen : true
			});
		}
	});

	userInfoViewTop.add(userInfoCoinsLabel);
	userInfoViewBottom.add(userInfoWinsLabel);
	userInfoView.add(userInfoViewTop);
	userInfoView.add(userInfoViewBottom);
	userInfoView.add(rightInfoLabel);
	userInfoView.add(leftImageView);

	/*userInfoView.add(Ti.UI.createView({
		top : 68,
		height : 0.5,
		width : '100%',
		backgroundColor : '#6d6d6d'
	}));*/
	tableHeaderView.add(userInfoView);

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
			height : '100%',
			width: '100%',
			backgroundImage: '/images/profileBG.jpg',
			backgroundColor : 'transparent',
			style : Ti.UI.iPhone.TableViewStyle.GROUPED,
			separatorInsets : {
				left : 0,
				right : 0
			},
			id : 'challengeTable',
			refreshControl : refresher,
			separatorStyle : separatorS,
			separatorColor : separatorColor
		});
	} else if (OS_ANDROID) {
		table = Titanium.UI.createTableView({
			width : Ti.UI.FILL,
			left : 0,
			headerView : tableHeaderView,
			height : '100%',
			//backgroundColor : '#303030',
			separatorColor : '#6d6d6d',
			id : 'challengeTable'
		});
	}

	//sections[0] = createSectionsForTable(Alloy.Globals.PHRASES.tournamentsTxt);
	sections[1] = createSectionsForTable(Alloy.Globals.PHRASES.newChallengesTxt);
	sections[2] = createSectionsForTable(Alloy.Globals.PHRASES.pendingChallengesTxt);
	sections[3] = createSectionsForTable(Alloy.Globals.PHRASES.finishedChallengesTxt);

	// there will be 3 types: 'tournaments'/'accept', 'pending' and finished (in that order)
	var challengesTournamentsCount = 0;
	// set this to 1 if there are no challenges

	// looping array backwards to print out tournaments first
	for (var x = array.length; x >= 0; x--) {
		var arrayObj = array[x];

		if (x === 0) {
			// create 'accept' rows
			if (arrayObj.length > 0) {
				for (var i = 0; i < arrayObj.length; i++) {
					sections[1].add(constructChallengeRows(arrayObj[i], i, 'accept'));
				}
			} else if (arrayObj.length === 0 && challengesTournamentsCount > 0) {
				sections[1].add(createEmptyTableRow(Alloy.Globals.PHRASES.challengesSmallTxt + '/' + Alloy.Globals.PHRASES.tournamentsSmallTxt));
			}
		} else if (x === 1) {
			// create 'pending' rows
			if (arrayObj.length > 0) {
				for (var i = 0; i < arrayObj.length; i++) {
					sections[2].add(constructChallengeRows(arrayObj[i], i, 'pending'));
				}
			} else if (arrayObj.length === 0) {
				sections[2].add(createEmptyTableRow(Alloy.Globals.PHRASES.challengesSmallTxt));
			}
		} else if (x === 2) {
			// create 'finished' rows
			if (arrayObj.length > 0) {
				for (var i = 0; i < arrayObj.length; i++) {
					sections[3].add(constructChallengeRows(arrayObj[i], i, 'finished'));
				}
			} else if (arrayObj.length === 0) {
				sections[3].add(createEmptyTableRow(Alloy.Globals.PHRASES.challengesSmallTxt));
			}
		} else if (x === 3) {
			// create 'accept' / 'pending' tournaments rows
			if (arrayObj.length > 0) {
				for (var i = 0; i < arrayObj.length; i++) {
					sections[1].add(constructChallengeRows(arrayObj[i], i, 'tournament'));
				}
			} else if (arrayObj.length === 0) {
				challengesTournamentsCount = 1;
			}
		} else if (x === 4) {
			// create 'finished' tournament rounds rows
			if (arrayObj.length > 0) {
				for (var i = 0; i < arrayObj.length; i++) {
					sections[3].add(constructChallengeRows(arrayObj[i], i, 'tournament_finished'));
				}
			}
		}
	}

	table.setData(sections);

	// when clicking a row
	table.addEventListener('click', function(e) {
		if (Alloy.Globals.SLIDERZINDEX == 2) {
			return;
		}

		// e.rowData is null in android
		if (OS_ANDROID) {
			// fix for android
			e.rowData = e.row;
		}

		if (e.rowData !== null) {
			if (Alloy.Globals.checkConnection()) {

				if ( typeof e.rowData.id !== 'undefined') {
					if (e.rowData.className === 'accept') {
						var obj = Alloy.Globals.CHALLENGEOBJECTARRAY[0][e.rowData.id];
						if (obj.attributes.show !== 0) {
							// view challenge
							Alloy.Globals.CHALLENGEINDEX = e.rowData.id;
							var win = Alloy.createController('challenge').getView();

							if (OS_IOS) {
								Alloy.Globals.NAV.openWindow(win, {
									animated : true
								});
							} else if (OS_ANDROID) {
								win.open({
									fullScreen : true
								});
							}
						} else {
							Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.roundHasStartedErrorTxt);
						}

					} else if (e.rowData.className === 'tournament') {
						// get correct tournament object, 3 will contain all tournaments
						var obj = Alloy.Globals.CHALLENGEOBJECTARRAY[3][e.rowData.id];
						// check if my status is 2, that mean I already have answered this challenge
						if (checkTournament(obj) === true) {
							// open in webview
							var group = null;
							try {
								group = obj.attributes.group.name;
							} catch(e) {
								group = null;
							}

							if ( typeof group === undefined) {
								group = null;
							}

							showChallengeInWebView(obj.attributes.id, obj.attributes.round, group);
							group = null;
						} else {
							if (obj.attributes.show !== 0) {
								// open to answer tournament round
								var arg = {
									tournamentIndex : e.rowData.id,
									tournamentRound : obj.attributes.round
								};

								var win = Alloy.createController('challenge', arg).getView();

								if (OS_IOS) {
									Alloy.Globals.NAV.openWindow(win, {
										animated : true
									});

								} else if (OS_ANDROID) {
									win.open({
										fullScreen : true
									});
								}
							} else {
								Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.roundHasStartedErrorTxt);
							}

						}
					} else if (e.rowData.className === 'pending') {
						// get correct object, 1 == pending
						var obj = Alloy.Globals.CHALLENGEOBJECTARRAY[1][e.rowData.id];
						// open a webview with the pending challenge
						var group = null;
						try {
							group = obj.attributes.group[0].name;
						} catch(e) {
							group = null;
						}

						if ( typeof group === undefined) {
							group = null;
						}

						showChallengeInWebView(obj.attributes.id, -1, group);
						obj = null;
						group = null;

					} else if (e.rowData.className === 'finished') {
						// get correct object, 2 == finished
						var obj = Alloy.Globals.CHALLENGEOBJECTARRAY[2][e.rowData.id];
						// open a web view to view the finished challenge
						var group = null;
						try {
							group = obj.attributes.group[0].name;
						} catch(e) {
							group = null;
						}

						if ( typeof group === undefined) {
							group = null;
						}

						showChallengeInWebView(obj.attributes.id, -1, group);
						obj = null;
						group = null;

					} else if (e.rowData.className === 'tournament_finished') {
						// get correct object, 4 == finished_torunament rounds
						var obj = Alloy.Globals.CHALLENGEOBJECTARRAY[4][e.rowData.id];
						// open web view
						var group = null;
						try {
							group = obj.attributes.group.name;
						} catch(e) {
							group = null;
						}

						if ( typeof group === undefined) {
							group = null;
						}

						showChallengeInWebView(obj.attributes.id, obj.attributes.round, group);
						obj = null;
						group = null;
					}

				}
			} else {
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
			}
		}
	});

	$.challengesView.add(table);
}

function getChallenges() {
	// Get challenges
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onerror = function(e) {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
		//alert(JSON.parse(this.responseText));
		if (OS_IOS) {
			if ( typeof refresher !== 'undefined') {
				refresher.endRefreshing();
			}
		}
		Ti.API.error('Bad Sever =>' + e.error);
		indicator.closeIndicator();
		//$.facebookBtn.enabled = true;
	};

	try {
		xhr.open('GET', Alloy.Globals.BETKAMPENCHALLENGESURL + '/?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
		xhr.setRequestHeader("challengesView-type", "application/json");
		xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
		xhr.setTimeout(Alloy.Globals.TIMEOUT);
		xhr.send();
	} catch(e) {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
		//alert(JSON.parse(this.responseText));
		if (OS_IOS) {
			if ( typeof refresher !== 'undefined') {
				refresher.endRefreshing();
			}
		}
		indicator.closeIndicator();
	}
	xhr.onload = function() {
		if (this.status == '200') {
			if (this.readyState == 4) {
				var response = JSON.parse(this.responseText);
				// construct array with objects
				Alloy.Globals.CHALLENGEOBJECTARRAY = Alloy.Globals.constructChallenge(response);

				if (OS_ANDROID) {
					$.challengesView.removeAllChildren();
					for (child in $.challengesView.children) {

						$.challengesView.children[child] = null;
					}
				}
				constructTableView(Alloy.Globals.CHALLENGEOBJECTARRAY);
				getUserInfo();
			} else {
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
				//$.facebookBtn.enabled = true;
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
			//$.facebookBtn.enabled = true;
			Ti.API.error("Error =>" + this.response);
		}
	};
}

/* Flow */
var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
	top : 200,
	text : Alloy.Globals.PHRASES.loadingTxt
});
var refresher;
var table;
var userInfoCoinsLabel;
var userInfoWinsLabel;

var args = arguments[0] || {};
if (args.refresh == 1) {
	if (Alloy.Globals.checkConnection()) {
		// refresh table with challenges
		indicator.openIndicator();
		getChallenges();
		getUserInfo();
	} else {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
		userInfoCoinsLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
		userInfoWinsLabel.setText('');
	}

}

var iOSVersion;

if (OS_IOS) {
	iOSVersion = parseInt(Ti.Platform.version);
}

$.challengesView.addEventListener('close', function() {
	indicator.closeIndicator();
});

// resume listener for ios and android
if (OS_IOS) {
	if (Alloy.Globals.OPEN) {
		// 	Ti.API.log(fb.getExpirationDate());  [INFO] :   2014-08-26 06:18:27 +0000  valid 2 months then?
		Ti.App.addEventListener('resume', function() {
			if (Alloy.Globals.CURRENTVIEW !== null) {
				// check connection
				if (Alloy.Globals.checkConnection()) {
					// TODO TEMP
					Alloy.Globals.FACEBOOK.authorize();
					Ti.API.log(Alloy.Globals.FACEBOOK.getExpirationDate());

			/* start temp */
			/*  http://stackoverflow.com/questions/20022284/titanium-facebook-module-doesnt-using-native-login?rq=1
					var now = new Date();
					var fbExpire = Alloy.Globals.FACEBOOK.getExpirationDate();
					fbExpire.setHours(fbExpire.getHours() - 2);
					Ti.API.log("Nu: " + now);
					Ti.API.log("Fb: " + fbExpire);

					if (now < fbExpire) {			// TODO should be: >
						Ti.API.log("ss");			// funkar inte, borde reautha?  https://jira.appcelerator.org/browse/TIMODOPEN-283
													
						Alloy.Globals.FACEBOOK.addEventListener('login', function(e) {
							if (e.success) {
								Ti.API.log("aa");
							} else if (e.error) {
								Alloy.Globals.showFeedbackDialog("Något gick fel! Du kanske avbröt inloggningen?");
							} else if (e.cancelled) {
							}
						});
						
					Alloy.Globals.FACEBOOK.authorize();
					}
					*/
			/*	End temp */ 
				
					Ti.UI.iPhone.setAppBadge(0);
					indicator.openIndicator();
					getChallenges();
				} else {
					Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionError);
					userInfoCoinsLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
					userInfoWinsLabel.setText('');
					// TODO add retry
				}
			} else {
			}
		});
	}
} else if (OS_ANDROID) {
	if (Alloy.Globals.checkConnection()) {
		var activity = Ti.Android.currentActivity;
		activity.addEventListener('resume', function(e) {
			indicator.openIndicator();
			getChallenges();
		});
	} else {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionError);
		userInfoCoinsLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
		userInfoWinsLabel.setText('');
	}
}

constructTableView(Alloy.Globals.CHALLENGEOBJECTARRAY);
getUserInfo();
