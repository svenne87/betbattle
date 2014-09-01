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
		xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
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
		if (opponents[opponent].uid === Alloy.Globals.BETKAMPENUID) {
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

		var win = Alloy.createController('showChallenge').getView();

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

			if (obj.attributes.group.name != null) {
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
		height : 70,
		backgroundColor : 'transparent',
		//opacity: 0.6,
		layout : "absolute",
	});

	var tableHeaderBG = Ti.UI.createView({
		height : 70,
		top : 0,
		backgroundColor : '#000',
		opacity : '0.4',
	});

	tableHeaderView.add(tableHeaderBG);

	var userInfoView = Ti.UI.createView({
		top : 0,
		height : 70,
		zIndex : "1000",
		opacity : 1,
		layout : 'horizontal',
		backgroundColor : "transparent",
	});

	var userInfoViewLeft = Ti.UI.createView({
		top : 0,
		left : 0,
		height : 70,
		width : "33%",
		layout : 'vertical',
		backgroundColor : 'transparent',
		//opacity: "0.7"
	});

	var userInfoViewRight = Ti.UI.createView({
		top : 0,
		right : 0,
		height : 70,
		width : "33%",
		layout : 'vertical',
		backgroundColor : 'transparent'
	});

	userInfoViewLeft.add(Ti.UI.createImageView({
		//left : 60,
		//top : 15,
		height : 15,
		width : 20,
		top : "30%",
		image : '/images/totalt_saldo.png'
	}));

	userInfoViewRight.add(Ti.UI.createImageView({
		//left : 60,
		height : 15,
		width : 15,
		top : "30%",
		image : '/images/vinster_top.png'
	}));

	userInfoCoinsLabel = Ti.UI.createLabel({
		//left : 5,
		//top : 12,
		text : Alloy.Globals.PHRASES.loadingTxt,
		font : {
			fontSize : Alloy.Globals.getFontSize(1),
			//fontWeight : 'bold',
			fontFamily : 'Impact',
		},
		color : Alloy.Globals.themeColor()
	});

	userInfoWinsLabel = Ti.UI.createLabel({
		//left : 10,
		text : '',
		font : {
			fontSize : Alloy.Globals.getFontSize(1),
			//fontWeight : 'bold',
			fontFamily : 'Impact',
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
	var userInfoViewCenter = Ti.UI.createView({
		width : "33%",
		height : 70,
		backgroundColor : "transparent",
	});

	var image;
	if (Alloy.Globals.FACEBOOKOBJECT) {
		image = 'https://graph.facebook.com/' + Alloy.Globals.FACEBOOKOBJECT.id + '/picture';
	} else {
		image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + Alloy.Globals.BETKAMPENUID + '.png';
	}

	var centerImageView = Ti.UI.createImageView({
		//left : 0,
		height : 40,
		width : 40,
		borderRadius : 20,
		image : image
	});
	
	centerImageView.addEventListener('error',function(e){
		// fallback for image
		centerImageView.image = '/images/no_pic.png';
	});

	userInfoViewCenter.add(centerImageView);

	var rightPos = '2%';

	userInfoView.addEventListener('click', function() {
		var win = Alloy.createController('profile').getView();
		Alloy.Globals.CURRENTVIEW =  win;
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

	userInfoViewLeft.add(userInfoCoinsLabel);
	userInfoViewRight.add(userInfoWinsLabel);
	userInfoView.add(userInfoViewLeft);
	userInfoView.add(userInfoViewCenter);
	userInfoView.add(userInfoViewRight);

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
			width : '100%',
			//backgroundImage: '/images/profileBG.jpg',
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

	sections[0] = Ti.UI.createTableViewSection({
		headerView : Ti.UI.createView({
			height : 0.1,
		}),
		footerView : Ti.UI.createView({
			height : 0.1,
		}),
	});

	var acceptRow = Ti.UI.createTableViewRow({
		title : "Nya Utmaningar",
		height : 30,
		id : "new",
		width : Ti.UI.FILL,
		color : "#FFF",
		backgroundColor : 'transparent',
		font : {
			fontSize : 14,
		}
	});

	var pendingRow = Ti.UI.createTableViewRow({
		title : "Pågående Utmaningar",
		height : 30,
		id : "pending",
		width : Ti.UI.FILL,
		color : "#FFF",
		backgroundColor : 'transparent',
		font : {
			fontSize : 14,
		}
	});

	var finishedRow = Ti.UI.createTableViewRow({
		title : "Avslutade Utmaningar",
		height : 30,
		id : "finished",
		width : Ti.UI.FILL,
		color : "#FFF",
		backgroundColor : 'transparent',
		font : {
			fontSize : 14,
		}
	});

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

	acceptRow.add(Ti.UI.createLabel({
		font : {
			fontFamily : font
		},
		text : fontawesome.icon('icon-chevron-right'),
		right : rightPercentage,
		color : '#c5c5c5',
		fontSize : 80,
		height : 'auto',
		width : 'auto'
	}));

	pendingRow.add(Ti.UI.createLabel({
		font : {
			fontFamily : font
		},
		text : fontawesome.icon('icon-chevron-right'),
		right : rightPercentage,
		color : '#c5c5c5',
		fontSize : 80,
		height : 'auto',
		width : 'auto',
	}));

	finishedRow.add(Ti.UI.createLabel({
		font : {
			fontFamily : font,
		},
		text : fontawesome.icon('icon-chevron-right'),
		right : rightPercentage,
		color : '#c5c5c5',
		fontSize : 80,
		height : 'auto',
		width : 'auto',
	}));

	//dataSet = [{title: "Nya Utmaningar", title: "Pågående Utmaningar", title: "Avslutade Utmaningar"}];
	sections[0].add(acceptRow);
	sections[0].add(pendingRow);
	sections[0].add(finishedRow);

	//sections[0] =Alloy.Globals.PHRASES.newChallengesTxt createSectionsForTable(Alloy.Globals.PHRASES.tournamentsTxt);
	sections[1] = createSectionsForTable("Just Nu");
	//sections[2] = createSectionsForTable(Alloy.Globals.PHRASES.pendingChallengesTxt);
	//sections[3] = createSectionsForTable(Alloy.Globals.PHRASES.finishedChallengesTxt);

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
		} else if (x === 3) {
			// create 'accept' / 'pending' tournaments rows
			if (arrayObj.length > 0) {
				for (var i = 0; i < arrayObj.length; i++) {
					sections[1].add(constructChallengeRows(arrayObj[i], i, 'tournament'));
				}
			} else if (arrayObj.length === 0) {
				challengesTournamentsCount = 1;
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
				Ti.API.info("CLICKADE ROW : " + JSON.stringify(e.rowData));
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

					} else if (e.rowData.id === 'new') {
						var win = Alloy.createController('challenges_new').getView();

						if (OS_IOS) {
							Alloy.Globals.NAV.openWindow(win, {
								animated : true,
							});
						} else if (OS_ANDROID) {
							win.open({
								fullScreen : true,
							});
						}

					} else if (e.rowData.id === 'pending') {
						var win = Alloy.createController('challenges_pending').getView();

						if (OS_IOS) {
							Alloy.Globals.NAV.openWindow(win, {
								animated : true,
							});
						} else if (OS_ANDROID) {
							win.open({
								fullScreen : true,
							});
						}
					} else if (e.rowData.id === 'finished') {
						var win = Alloy.createController('challenges_finished').getView();

						if (OS_IOS) {
							Alloy.Globals.NAV.openWindow(win, {
								animated : true,
							});
						} else if (OS_ANDROID) {
							win.open({
								fullScreen : true,
							});
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

function createLeagueAndUidObj(response) {
	Alloy.Globals.BETKAMPENUID = response.betkampen_uid;
	Alloy.Globals.LEAGUES = [];
	Alloy.Globals.AVAILABLELANGUAGES = [];

	for (var i = 0; i < response.leagues.length; i++) {
		var league = {
			id : response.leagues[i].id,
			name : response.leagues[i].name,
			sport : response.leagues[i].sport,
			logo : response.leagues[i].logo,
			actvie : response.leagues[i].active
		};
		// store all active leagues
		Alloy.Globals.LEAGUES.push(league);
	}
	        for (var i = 0; response.languages.length > i; i++) {
            var language = {
            	id : response.languages[i].id,
                name: response.languages[i].name,
                imageLocation: response.languages[i].imageLocation,
                description: response.languages[i].description
            };
            Alloy.Globals.AVAILABLELANGUAGES.push(language);
        }
}

/* Only used for Betkampen token sign in! */
var refreshTry = 0;

function loginBetkampenAuthenticated() {
	// Get betkampenID with valid token
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onerror = function(e) {
		Ti.API.error('Bad Sever =>' + JSON.stringify(e));
		if (e.code == 401) {
			// if this is first try, then try refresh token
			if (refreshTry === 0) {
				refreshTry = 1;
				authWithRefreshToken();
			}
		} else {
			indicator.closeIndicator();
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
		}
	};

	try {
		xhr.open('POST', Alloy.Globals.BETKAMPENLOGINURL);
		xhr.setRequestHeader("content-type", "application/json");
		xhr.setTimeout(Alloy.Globals.TIMEOUT);
		var param = '{"access_token" : "' + Alloy.Globals.BETKAMPEN.token + '", "lang":"' + Alloy.Globals.LOCALE + '"}';
		xhr.send(param);
	} catch(e) {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.internetMayBeOffErrorTxt);
		indicator.closeIndicator();
	}

	xhr.onload = function() {
		if (this.status == '200') {
			if (this.readyState == 4) {
				var response = null;
				try {
					response = JSON.parse(this.responseText);
				} catch(e) {
					indicator.closeIndicator();
					Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
				}

				if (response !== null) {
					createLeagueAndUidObj(response);

					if (Alloy.Globals.BETKAMPENUID > 0) {
						getChallenges();
					}
				} else {
					indicator.closeIndicator();
					Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.loginCredentialsError);
				}
			} else {
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
				indicator.closeIndicator();
				Ti.API.log("3");
			}
		} else {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
			Ti.API.error("Error =>" + this.response);
			indicator.closeIndicator();
			Ti.API.log("4");
		}
	};
}

// Try to authenticate using refresh token
function authWithRefreshToken() {
	if (Alloy.Globals.checkConnection()) {
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onerror = function(e) {
			Ti.API.error('Bad Sever reAuth =>' + JSON.stringify(e));
			indicator.closeIndicator();
			refreshTry = 0;
			// reAuth failed. Need to login again. 400 = invalid token
			Ti.App.Properties.removeProperty("BETKAMPEN");
			Alloy.Globals.BETKAMPEN = null;
			Alloy.Globals.CLOSE = false;
			Alloy.Globals.CURRENTVIEW  = null;
			Alloy.Globals.NAV.close();
			var login = Alloy.createController('login').getView();
			login.open({modal : false});
			login = null;
			
			if (e.code != 400) {
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
			}
		};
		try {
			xhr.open('POST', Alloy.Globals.BETKAMPENEMAILLOGIN);
			xhr.setTimeout(Alloy.Globals.TIMEOUT);

			var params = {
				grant_type : 'refresh_token',
				refresh_token : Alloy.Globals.BETKAMPEN.refresh_token,
				client_id : 'betkampen_mobile',
				client_secret : 'not_so_s3cr3t'
			};
			xhr.send(params);
		} catch(e) {
			indicator.closeIndicator();
			refreshTry = 0;
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
		}
		xhr.onload = function() {
			if (this.status == '200') {
				if (this.readyState == 4) {
					var response = '';
					try {
						response = JSON.parse(this.responseText);
					} catch(e) {

					}

					Alloy.Globals.BETKAMPEN = {
						token : "TOKEN " + response.access_token,
						valid : response.expires_in,
						refresh_token : Alloy.Globals.BETKAMPEN.refresh_token // since we don't get a new one here
					};
					Alloy.Globals.storeToken();
					// brand new token, try to authenticate
					loginBetkampenAuthenticated();
				} else {
					Ti.API.log(this.response);
				}
			} else {
				Ti.API.error("Error =>" + this.response);
				indicator.closeIndicator();
				refreshTry = 0;
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
			}
		};
	} else {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
	}
}

function getChallenges() {
	// Get challenges
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onerror = function(e) {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
		if (OS_IOS) {
			if ( typeof refresher !== 'undefined') {
				refresher.endRefreshing();
			}
		}
		Ti.API.error('Bad Sever =>' + e.error);
		indicator.closeIndicator();
	};

	try {
		xhr.open('GET', Alloy.Globals.BETKAMPENCHALLENGESURL + '/?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
		xhr.setRequestHeader("challengesView-type", "application/json");
		xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
		xhr.setTimeout(Alloy.Globals.TIMEOUT);
		xhr.send();
	} catch(e) {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
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
		Ti.App.addEventListener('resume', function() {
			if (Alloy.Globals.CURRENTVIEW !== null) {
				// check connection
				if (Alloy.Globals.checkConnection()) {
					if (Alloy.Globals.FACEBOOKOBJECT) {
						// TODO handle Facebook reAuth?
						indicator.openIndicator();
						getChallenges();
					} else {
						// Betkampen check and if needed refresh token
						Ti.API.log("resume...");
						Alloy.Globals.readToken();
						indicator.openIndicator();
						loginBetkampenAuthenticated();
					}
					Ti.UI.iPhone.setAppBadge(0);
				} else {
					Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionError);
					userInfoCoinsLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
					userInfoWinsLabel.setText('');
					// TODO add retry?
				}
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
