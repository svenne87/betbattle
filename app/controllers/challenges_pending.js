var args = arguments[0] || {};
var iOSVersion;

if (OS_IOS) {
	iOSVersion = parseInt(Ti.Platform.version);
}
var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
	top : 200,
	text : Alloy.Globals.PHRASES.loadingTxt
});

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
					$.challenges_pending.removeAllChildren();
					for (child in $.challenges_pending.children) {

						$.challenges_pending.children[child] = null;
					}
				}
				constructTableView(Alloy.Globals.CHALLENGEOBJECTARRAY);
				
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
				
			}

		});
	}

	// check if table exists, and if it does simply remove it
	var children = $.challenges_pending.children;
	for (var i = 0; i < children.length; i++) {
		if (children[i].id === 'challengeTable') {
			$.challenges_pending.remove(children[i]);
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

	var tableHeaderLabel = Ti.UI.createLabel({
		text: "Pågående Utmaningar",
		textAlign: "center",
		color: "#FFF",
		font:{
			fontSize:18,
			fontFamily: "Impact",
		},
		height : 70,
		top : 0, 
	});
	
	tableHeaderView.add(tableHeaderLabel);


	var fontawesome = require('lib/IconicFont').IconicFont({
		font : 'lib/FontAwesome'
	});

	var font = 'FontAwesome';

	if (OS_ANDROID) {
		font = 'fontawesome-webfont';
	}


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
		headerView: Ti.UI.createView({
			height: 0.1,
		}),
		footerView: Ti.UI.createView({
			height: 0.1,
		}),
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

	var challengesTournamentsCount = 0;
	// set this to 1 if there are no challenges

	// looping array backwards to print out tournaments first
	Ti.API.info("arrayen : " + JSON.stringify(array));
	for (var x = array.length; x >= 0; x--) {
		var arrayObj = array[x];

		if (x === 1) {
			// create 'pending' rows
			if (arrayObj.length > 0) {
				for (var i = 0; i < arrayObj.length; i++) {
					sections[0].add(constructChallengeRows(arrayObj[i], i, 'pending'));
				}
			} else if (arrayObj.length === 0 && challengesTournamentsCount > 0) {
				sections[0].add(createEmptyTableRow(Alloy.Globals.PHRASES.challengesSmallTxt + '/' + Alloy.Globals.PHRASES.tournamentsSmallTxt));
			}
		} else if (x === 3) {
			// create 'accept' / 'pending' tournaments rows
			if (arrayObj.length > 0) {
				for (var i = 0; i < arrayObj.length; i++) {
					sections[0].add(constructChallengeRows(arrayObj[i], i, 'tournament'));
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
					if (e.rowData.className === 'pending') {
						var obj = Alloy.Globals.CHALLENGEOBJECTARRAY[1][e.rowData.id];
						if (obj.attributes.show !== 0) {
							// view challenge
							Alloy.Globals.CHALLENGEINDEX = e.rowData.id;
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
							var arg = {
									tournamentIndex : e.rowData.id,
									tournamentRound : obj.attributes.round,
									group : group,
								};

								var win = Alloy.createController('showChallenge', arg).getView();

								if (OS_IOS) {
									Alloy.Globals.NAV.openWindow(win, {
										animated : true
									});

								} else if (OS_ANDROID) {
									win.open({
										fullScreen : true
									});
								}
	
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
					} 
				}
			} else {
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
			}
		}
	});

	$.challenges_pending.add(table);
}
if (OS_ANDROID) {
	font = 'fontawesome-webfont';

	$.challenges_pending.orientationModes = [Titanium.UI.PORTRAIT];

	$.challenges_pending.addEventListener('open', function() {
		$.challenges_pending.activity.actionBar.onHomeIconItemSelected = function() {
			$.challenges_pending.close();
			$.challenges_pending = null;
		};
		$.challenges_pending.activity.actionBar.displayHomeAsUp = true;
		$.challenges_pending.activity.actionBar.title = Alloy.Globals.PHRASES.betbattleTxt;
		indicator.openIndicator();
	});
	/*
	 $.newChallenge.addEventListener('androidback', function(){
	 $.newChallenge.close();
	 $.newChallenge = null;
	 });
	 */

}
constructTableView(Alloy.Globals.CHALLENGEOBJECTARRAY);

