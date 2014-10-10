// ikoner, annan font, vänster, dela av med gradient, user pengar klocka, öka namn. de andra mindre

if(Alloy.Globals.hasCoupon){
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

 Ti.App.addEventListener("sliderToggled", function(e) {
	if ( typeof table !== 'undefined') {
 		if (e.hasSlided) {
			table.touchEnabled = false;
 		} else {
 			table.touchEnabled = true;
 		}
 	}
 });
 
var mod = require('bencoding.blur');

// refresh this view
Ti.App.addEventListener("challengesViewRefresh", function(e) {
	if (Alloy.Globals.checkConnection()) {
		indicator.openIndicator();

		if (OS_ANDROID) {
			var children = $.challengesView.children;
			$.challengesView.removeAllChildren();

			for (var i = 0; i < children.length; i++) {
				if (children[i].id === 'challengeTable' || children[i].id === 'scrollView') {
					$.challengesView.remove(children[i]);
					children[i] = null;
				}
			}
		}
		getChallenges();
	} else {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
	}
});

// get coins for user
function getUserInfo() {

	var xhr = Titanium.Network.createHTTPClient();
	xhr.onerror = function(e) {
		Ti.API.error('Bad Sever =>' + e.error);
	};

	try {
		xhr.open('POST', Alloy.Globals.BETKAMPENUSERURL + '?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
		xhr.setRequestHeader("content-type", "application/json");
		xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
		xhr.setTimeout(Alloy.Globals.TIMEOUT);
		xhr.send();
	} catch(e) {
		var error = { totalCoins : '', totalPoints : ''};
		Ti.App.fireEvent('app:coinsMenuInfo', error);
	}

	xhr.onload = function() {
		if (this.status == '200') {
			if (this.readyState == 4){
				Ti.API.info("USER FINO CHALLENGES : " + JSON.stringify(this.responseText));
				var userInfo = null;
				try {
					userInfo = JSON.parse(this.responseText);
				} catch (e) {
					userInfo = null;
				}

				if (userInfo !== null) {
					// Update menu
					Ti.App.fireEvent('app:coinsMenuInfo', userInfo);
				}
			}
		} else {
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
		top : '20%',
		width : Ti.UI.FILL,
		left : 60,
		text : sectionText,
		font : Alloy.Globals.getFontCustom(22, 'Regular'),
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
		height : 75
	});

	row.add(Ti.UI.createLabel({
		text : Alloy.Globals.PHRASES.noneTxt + ' ' + text + ' ' + Alloy.Globals.PHRASES.foundTxt,
		left : 40,
		font : Alloy.Globals.getFontCustom(16, 'Regular'),
		color : '#CCC'
	}));

	if (iOSVersion < 7) {
		row.add(Ti.UI.createView({
			height : 0.5,
			top : 57,
			backgroundColor : '#303030',
			width : '120%'
		}));
	}

	return row;
}

function createNewChallengeRow(){
	var tableFooterView = Ti.UI.createTableViewRow({
		height:65,
		hasChild: true,
	});
	
	tableFooterView.add(Ti.UI.createImageView({
		image: '/images/Skapa_Utmaning.png',
		width: 30,
		height: 30,
		left: 10,
	}));
	
	tableFooterView.add(Ti.UI.createLabel({
		text: Alloy.Globals.PHRASES.createChallengeTxt,
		font: Alloy.Globals.getFontCustom(16, "Regular"),
		color:"#FFF",
		left: 45,
	}));
	
	tableFooterView.addEventListener("click", function(e){
		var win = Alloy.createController('newChallengeLeague').getView();
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
	});
	
	return tableFooterView;
}
// build and return rows that are of the type 'Accept', 'Pending' and 'Finished'
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
		height : 95
	});
	
	var fontawesome = require('lib/IconicFont').IconicFont({
        font : 'lib/FontAwesome'
    });

    var font = 'FontAwesome';

	// add custom icon on Android to symbol that the row has child
	if (child != true) {
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
	} else if(type == 'accept'){
		imageLocation = '/images/status_go.png';
	}else if(type == 'pending'){
		imageLocation = '/images/status_waiting.png';
	}else{
		imageLocation = '/images/ikon_spelanasta.png';
	}
	
	// TMP TODO
	imageLocation = '/images/Skapa_Utmaning_Default.png';

	row.add(Ti.UI.createImageView({
		image : imageLocation,
		left : 10,
		width : 30,
		height : 30
	}));

	var firstRowView = Ti.UI.createView({
		top : -40,
		layout : 'absolute', 
		width : 'auto'
	});

	var betGroupName = Alloy.Globals.PHRASES.unknownGroupTxt;

	if (type !== 'tournament' && type !== 'tournament_finished') {
		// for normal challenge
		try {
			betGroupName = obj.attributes.group[0].name;
		} catch(e) {
			// do nothing
			betGroupName = "";
		}
		Ti.API.info("GRUPPNAMN: " + betGroupName);
		if(betGroupName <= 0){
			betGroupName = obj.attributes.name;
		}
		if (betGroupName.length > 15) {
			betGroupName = betGroupName.substring(0, 12) + '...';
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

			if (betGroupName.length > 15) {
				betGroupName = betGroupName.substring(0, 12) + '...';
			}
		}
	}

	firstRowView.add(Ti.UI.createLabel({
		left : 60,
		text : betGroupName,
		font : Alloy.Globals.getFontCustom(16, 'Regular'),
		color : '#FFF'
	}));

	var secondRowView = Ti.UI.createView({
		top : 4,
		layout : 'absolute', 
		width : 'auto'
	});
	
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
    
    var startTextLabel = Ti.UI.createLabel({
        left : 60,
        font : {
            fontFamily : font
        },
        text : fontawesome.icon('fa-clock-o'),
        color : Alloy.Globals.themeColor()
    });

    secondRowView.add(startTextLabel);

    var startTextValueLabel = Ti.UI.createLabel({
        left : 75,
        text : '' + date + ' ' + time,
        font : Alloy.Globals.getFontCustom(12, 'Regular'),
        color : Alloy.Globals.themeColor()
    });

    secondRowView.add(startTextValueLabel);

    var participantsTextLabel = Ti.UI.createLabel({
        left : 160,
        font : {
            fontFamily : font
        },
        text : fontawesome.icon('icon-user'),
        color : Alloy.Globals.themeColor()
    });

    secondRowView.add(participantsTextLabel);
   
    var oppCount = 0;

    if (type === 'tournament' && checkTournament(obj) === true && obj.attributes.opponents.length === 1) {
        oppCount = parseInt(obj.attributes.opponentCount);
    } else {
        var oppCount = parseInt(obj.attributes.opponents.length);

        if (oppCount === 1 && obj.attributes.group.name === 'BetKampen Community') {
            oppCount = parseInt(obj.attributes.opponentCount);
        }
    }

    var participantsValueLabel = Ti.UI.createLabel({
        left : 175,
        text : oppCount.toString() + ' ',
        font : Alloy.Globals.getFontCustom(12, 'Regular'),
        color : Alloy.Globals.themeColor()
    });
    
    secondRowView.add(participantsValueLabel);

    var potTextLabel =Ti.UI.createLabel({
        left : (160 + participantsValueLabel.toImage().width + 5 + participantsTextLabel.toImage().width + 2),
        font : {
            fontFamily : font
        },
        text : fontawesome.icon('icon-money'),
        color : Alloy.Globals.themeColor()
    });

    secondRowView.add(potTextLabel);

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

    var potValueLabel = Ti.UI.createLabel({
        left :  (160 + participantsValueLabel.toImage().width + 2 + participantsTextLabel.toImage().width + 6 + potTextLabel.toImage().width + 2),
        text : '' + currentPot,
        font : Alloy.Globals.getFontCustom(12, 'Regular'),
        color : Alloy.Globals.themeColor()
    });
    
    secondRowView.add(potValueLabel);
    
    var thirdRowView = Ti.UI.createView({
        top : 40,
        layout : 'absolute', 
        width : 'auto'
    });
        
    var text = '';

    if(type === 'accept') {
        text = Alloy.Globals.PHRASES.newTxt;
    } else if (type === 'pending') {
        Ti.API.log("match");
        text = Alloy.Globals.PHRASES.pendingTxt;
    }
    
    thirdRowView.add(Ti.UI.createLabel({
        left : 60,
        text : text,
        font : Alloy.Globals.getFontCustom(12, 'Regular'),
        color : Alloy.Globals.themeColor()
    }));

	// Add info to the created row
	row.add(firstRowView);
	row.add(secondRowView);
	row.add(thirdRowView);

	row.add(Ti.UI.createView({
		top : 60,
		heigth : 14,
		layout : 'horizontal'
	}));

	if (iOSVersion < 7) {
		row.add(Ti.UI.createView({
			height : 0.5,
			top : 65,
			backgroundColor : '#303030',
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
			}

		});
	}

	// check if table exists, and if it does simply remove it
	var children = $.challengesView.children;
	for (var i = 0; i < children.length; i++) {
		if (children[i].id === 'challengeTable' || children[i].id === 'scrollView') {
			$.challengesView.remove(children[i]);
			children[i] = null;
		}
	}

	var sections = [];

	var tableHeaderView = Ti.UI.createView({
		height : 80,
		width : Ti.UI.FILL,
		layout : "vertical",
	});

	tableHeaderView.add(Ti.UI.createView({
	    backgroundImage : '/images/header.png',
	    height : 80,
	    id: 'headerImage',
	    width : Ti.UI.FILL
	}));
	
	tableHeaderView.add(Ti.UI.createView({
        height : 0.1,
        width : Ti.UI.FILL,
        backgroundColor : 'transparent',
        layout : "absolute",
    }));

	if (OS_IOS) {
		var separatorS;
		var separatorCol;

		if (iOSVersion < 7) {
			separatorS = Titanium.UI.iPhone.TableViewSeparatorStyle.NONE;
			separatorColor = 'transparent';
		} else {
			separatorS = Titanium.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE;
			separatorColor = '#303030';
		}

		table = Titanium.UI.createTableView({
			//width : Ti.UI.FILL,
			left : 0,
			top: 0,
			headerView : tableHeaderView,
			height : Ti.UI.FILL,
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
		
		sections[0] = Ti.UI.createTableViewSection({
		    footerView : Ti.UI.createView({height : 0.1})
		});
	} else if (OS_ANDROID) {
		table = Titanium.UI.createTableView({
			width : Ti.UI.FILL,
			left : 0,
			headerView : tableHeaderView,
			height : '100%',
			backgroundColor : 'transparent',
			separatorColor : '#303030',
			id : 'challengeTable'
		});
		sections[0] = Ti.UI.createTableViewSection({});
	}
	getDynamicTopImage();
    var fontawesome = require('lib/IconicFont').IconicFont({
        font : 'lib/FontAwesome'
    });

    var font = 'FontAwesome';
    var rightPercentage = '5%';
    var isAndroid = false;
    var child = true;
    
    if (OS_ANDROID) {
        child = false;
        isAndroid = true;
        
        font = 'fontawesome-webfont';

        if (Titanium.Platform.displayCaps.platformWidth < 350) {
            rightPercentage = '3%';
        }
    }

	var acceptRow = Ti.UI.createTableViewRow({
		top: 0,
		height : 75,
		id : "new",
		width : Ti.UI.FILL,
		color : "#FFF",
		backgroundColor : 'transparent',
		font : Alloy.Globals.getFont(),
		hasChild : child
	});

	var pendingRow = Ti.UI.createTableViewRow({
		height : 75,
		id : "pending",
		width : Ti.UI.FILL,
		color : "#FFF",
		backgroundColor : 'transparent',
		font : Alloy.Globals.getFont(),
		hasChild : child
	});

	var finishedRow = Ti.UI.createTableViewRow({
		height : 75,
		id : "finished",
		width : Ti.UI.FILL,
		color : "#FFF",
		backgroundColor : 'transparent',
		font : Alloy.Globals.getFont(),
		hasChild : child
	});

    var visualImagePrefs = {
        left : 10,
        width : 30,
        height : 30,
        image : '/images/Skapa_Utmaning_Default.png',
    }; 

	acceptRow.add(Ti.UI.createImageView(visualImagePrefs));

	acceptRow.add(Ti.UI.createLabel({
		font : Alloy.Globals.getFontCustom(16, 'Regular'),
		text : Alloy.Globals.PHRASES.newChallengesTxt,
		color : '#FFF',
		left : 60,
		height : Ti.UI.SIZE,
		width : Ti.UI.SIZE
	}));
	

    if (isAndroid) {
        acceptRow.add(Ti.UI.createLabel({
            font : {

                fontFamily : font
            },
            text : fontawesome.icon('icon-chevron-right'),
            right : rightPercentage,
            color : '#c5c5c5',
            fontSize : 60,
            height : 'auto',
            width : 'auto'
        }));
    }

	
	pendingRow.add(Ti.UI.createImageView(visualImagePrefs));
	
	pendingRow.add(Ti.UI.createLabel({
		font : Alloy.Globals.getFontCustom(16, 'Regular'),
		text : Alloy.Globals.PHRASES.pendingChallengesTxt,
		color : '#FFF',
		left : 60,
		height : 'auto',
		width : 'auto'
	}));

    if (isAndroid) {
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
    }

	
	finishedRow.add(Ti.UI.createImageView(visualImagePrefs));
	
	finishedRow.add(Ti.UI.createLabel({
		font : Alloy.Globals.getFontCustom(16, 'Regular'),
		text : Alloy.Globals.PHRASES.finishedChallengesTxt,
		color : '#FFF',
		left : 60,
		height : 'auto',
		width : 'auto'
	}));

    if (isAndroid) {
        finishedRow.add(Ti.UI.createLabel({
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
    }


	sections[0].add(acceptRow);
	sections[0].add(pendingRow);
	sections[0].add(finishedRow);

	sections[1] = createSectionsForTable(Alloy.Globals.PHRASES.challengesViewHot);

	// there will be 3 types: 'tournaments'/'accept', 'pending' and finished (in that order)
	var challengesTournamentsCount = 0;
	// set this to 1 if there are no challenges
	var rightNowRows = 0;
	var acceptNowCount = 1;
	var pendingNowCount = 1;
	// looping array backwards to print out tournaments first
	for (var x = 0; x < array.length; x++) {
		var arrayObj = array[x];

		if (x === 0) {
			// create 'accept' rows
			if (arrayObj.length > 0) {
				for (var i = 0; i < arrayObj.length; i++) {
					if(rightNowRows < 4){
						rightNowRows++;
						sections[1].add(constructChallengeRows(arrayObj[i], i, 'accept'));
					}
				}
			} else if (arrayObj.length === 0 && challengesTournamentsCount > 0) {
				acceptNowCount = 0;
			}
		} else if(x === 1){
			
				if(arrayObj.length > 0){
					for(var i = 0; i < arrayObj.length; i++){
						if(rightNowRows < 4){
							rightNowRows++;
							sections[1].add(constructChallengeRows(arrayObj[i], i, 'pending'));
						}
					}
				}else{
					if(acceptNowCount == 0){
						pendingNowCount = 0;	
					}
				}
				
		}else if (x === 3) {
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
		
	if(rightNowRows == 0){
			sections[1].add(createEmptyTableRow(Alloy.Globals.PHRASES.challengesSmallTxt + '/' + Alloy.Globals.PHRASES.tournamentsSmallTxt));
			sections[1].add(createNewChallengeRow());
		}
	table.setData(sections);
	
	table.addEventListener('swipe', function(e) {
		if(e.direction !== 'up' && e.direction !== 'down'){
			Ti.API.log(e.direction);
			
			table.touchEnabled = false;
			Ti.App.fireEvent('app:slide');
			table.touchEnabled = true; 
		}
	});
	
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
							
							var count = obj.attributes.opponents.length;
							Ti.API.info("potential_pot " + obj.attributes.potential_pot);
							var bet_amount = obj.attributes.potential_pot/count;
							Ti.API.info("count : " + count);
							Ti.API.info("bet_amount" + bet_amount);
							
							var args = {
								answer : 1,
								bet_amount: bet_amount
							};
							Alloy.Globals.CHALLENGEINDEX = e.rowData.id;
							var win = Alloy.createController('challenge', args).getView();

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
						Alloy.Globals.WINDOWS.push(win);
						
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
						Alloy.Globals.WINDOWS.push(win);
						
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
						Alloy.Globals.WINDOWS.push(win);
						
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
							} else {
								Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.roundHasStartedErrorTxt);
							}

						}
					} else if (e.rowData.className === 'pending') {
						var obj = Alloy.Globals.CHALLENGEOBJECTARRAY[1][e.rowData.id];
						if (obj.attributes.show !== 0) {
							// view challenge
							var group = null;
							try {
								group = obj.attributes.group[0].name;
							} catch(e) {
								group = null;
							}

							if ( typeof group === undefined) {
								group = null;
							}
							var args = {
								cid : obj.attributes.id,
								group: group
							};
							
							Alloy.Globals.CHALLENGEINDEX = e.rowData.id;
							var win = Alloy.createController('showChallenge', args).getView();
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
						} else {
							Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.roundHasStartedErrorTxt);
						}

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
	
	if (OS_ANDROID) {	
		// https://github.com/raymondkam/Ti.SwipeRefreshLayout
			
		var swipeRefreshModule = require('com.rkam.swiperefreshlayout');
		
		swipeRefresh = swipeRefreshModule.createSwipeRefresh({
   		 	view: table,
   		 	height: Ti.UI.FILL,
    		width: Ti.UI.FILL,
    		id : 'scrollView'
		});
		
		swipeRefresh.addEventListener('refreshing', function() {
			if (Alloy.Globals.checkConnection()) {
				indicator.openIndicator();
				setTimeout(function(){
					getChallenges();
				}, 800);
			} else {
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
				swipeRefresh.setRefreshing(false);
			}
		});

		$.challengesView.add(swipeRefresh);
	} else {
		$.challengesView.add(table);	
	}
}


function getDynamicTopImage(){
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onerror = function(e) {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
		endRefresher();
		Ti.API.error('Bad Sever =>' + e.error);
		indicator.closeIndicator();
	};

	try {
		xhr.open('GET', Alloy.Globals.BETKAMPENGETTOPLANDINGPAGE + '/?location=' + 'challengesView' + '&lang=' + Alloy.Globals.LOCALE);
		xhr.setRequestHeader("challengesView-type", "application/json");
		xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
		xhr.setTimeout(Alloy.Globals.TIMEOUT);
		xhr.send();
	} catch(e) {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
		endRefresher();
		indicator.closeIndicator();
	}
	xhr.onload = function() {
		if (this.status == '200') {
			if (this.readyState == 4) {
				var response = JSON.parse(this.responseText);
				// construct array with objects
				Ti.API.info("TOP IMAGE RESPONSE: " + JSON.stringify(response));
				var header = table.getHeaderView();
				var views = header.getChildren();
				for (var i in views){
					if(views[i].id == 'headerImage'){
						views[i].setBackgroundImage(response.image);
						views[i].addEventListener("click", function(e){
							Ti.API.info("CLICKADE LOSS ");
							var params = {
								link: response.url
							};
							var win = Alloy.createController('webview', params).getView();
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
					}
				}
				
				
			} else {
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
			}
			
			if(OS_ANDROID) {
				if(typeof swipeRefresh !== 'undefined') {
					swipeRefresh.setRefreshing(false);
				}	
			}
			indicator.closeIndicator();
		} else {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
			indicator.closeIndicator();
			endRefresher();
			Ti.API.error("Error =>" + this.response);
		}
	};	
}

function endRefresher() {
	if (OS_IOS) {
		if ( typeof refresher !== 'undefined') {
			refresher.endRefreshing();
		}
	} else {
		if ( typeof swipeRefresh !== 'undefined') {
			swipeRefresh.setRefreshing(false);
		}
	}
}

function getChallenges() {
	// Get challenges
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onerror = function(e) {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
		endRefresher();
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
		endRefresher();
		indicator.closeIndicator();
	}
	xhr.onload = function() {
		if (this.status == '200') {
			if (this.readyState == 4) {
				var response = JSON.parse(this.responseText);
				// construct array with objects
				Alloy.Globals.CHALLENGEOBJECTARRAY = Alloy.Globals.constructChallenge(response);
		
				// Update menu with icon if there are new challenges
				Ti.App.fireEvent('app:updateMenu');

				if (OS_ANDROID) {
					$.challengesView.removeAllChildren();
					for (child in $.challengesView.children) {

						$.challengesView.children[child] = null;
					}
				}
				constructTableView(Alloy.Globals.CHALLENGEOBJECTARRAY);
				//getDynamicTopImage();
				getUserInfo();
			} else {
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
			}
			
			if(OS_ANDROID) {
				if(typeof swipeRefresh !== 'undefined') {
					swipeRefresh.setRefreshing(false);
				}	
			}
			indicator.closeIndicator();
		} else {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
			indicator.closeIndicator();
			endRefresher();
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
var swipeRefresh;

var args = arguments[0] || {};
if (args.refresh == 1) {
	if (Alloy.Globals.checkConnection()) {
		// refresh table with challenges
		indicator.openIndicator();
		getChallenges();
		getUserInfo();
		if(args.sent_challenge == 1){
			Alloy.Globals.unlockAchievement(11);
		}
	} else {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
	}

}


var iOSVersion;

if (OS_IOS) {
	iOSVersion = parseInt(Ti.Platform.version);
}

$.challengesView.addEventListener('close', function() {
	indicator.closeIndicator();
});


constructTableView(Alloy.Globals.CHALLENGEOBJECTARRAY);
getUserInfo();
Alloy.Globals.getCoupon();
