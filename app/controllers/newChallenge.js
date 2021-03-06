Ti.App.addEventListener("sliderToggled", function(e) {
    if ( typeof table !== 'undefined') {
        if (e.hasSlided) {
            table.touchEnabled = false;
        } else {
            table.touchEnabled = true;
        }
    }
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
            date_string : response[i].date_string,
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
        width : Ti.UI.FILL,
        text : Alloy.Globals.PHRASES.noGamesTxt+ " ",
        left : 60,
        top : 40,
        font : Alloy.Globals.getFontCustom(16, 'Regular'),
        color : '#CCC'
    }));
}

// create sinle table row
function createTableRow(obj) {
	var teamOne = obj.attributes.team_1.team_name;
    var teamTwo = obj.attributes.team_2.team_name;
    
    if(teamOne && teamTwo) {
    	
    	// error in json sent, date in milliseconds is missing 000 at the end?
    	var dateFix = parseInt(obj.attributes.game_date + '000');

    	var date = obj.attributes.date_string;

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

		var time = obj.attributes.date_string;
		time = time.substring(time.length - 8);
		time = time.substring(0, 5);

		var dateString = date + ' ' + time;

		var child;

		if (OS_IOS) {
			child = true;
		} else if (OS_ANDROID) {
			child = false;
		}

		var row = $.UI.create('TableViewRow', {
			backgroundColor : '#000',
			id : obj.attributes.round,
			hasChild : child,
			height : 75,
			width : Ti.UI.FILL
		});

		var fontawesome = require('lib/IconicFont').IconicFont({
			font : 'lib/FontAwesome'
		});

		var font = 'FontAwesome';

		// add custom icon on Android to symbol that the row has child
		if (child != true) {
			var rightPercentage = '5%';

			font = 'fontawesome-webfont';

			if (Titanium.Platform.displayCaps.platformWidth < 350) {
				rightPercentage = '3%';
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

		if (teamOne.length + teamTwo.length > 35) {
			teamOne = teamOne.substring(0, 13);
			teamOne = teamOne + '...';

			teamTwo = teamTwo.substring(0, 13);
			teamTwo = teamTwo + '...';
		} else {
			if (teamOne.length > 17) {
				teamOne = teamOne.substring(0, 14);
				teamOne = teamOne + '...';
			}

			if (teamTwo.length > 17) {
				teamTwo = teamTwo.substring(0, 14);
				teamTwo = teamTwo + '...';
			}
		}

		row.add(Ti.UI.createLabel({
			text : teamOne + " - " + teamTwo + " ",
			top : 15,
			left : 20,
			font : Alloy.Globals.getFontCustom(16, 'Regular'),
			color : '#FFF'
		}));

		row.add(Ti.UI.createLabel({
			left : 20,
			top : 40,
			font : {
				fontFamily : font
			},
			text : fontawesome.icon('fa-clock-o'),
			color : Alloy.Globals.themeColor()
		}));

		row.add(Ti.UI.createLabel({
			text : dateString + " ",
			top : 38,
			left : 35,
			font : Alloy.Globals.getFontCustom(12, 'Regular'),
			color : Alloy.Globals.themeColor()
		}));

		row.add(Ti.UI.createView({
			top : 50,
			layout : 'vertical',
			height : 12
		}));

		if (OS_IOS) {
			// keep track of the table total heigth, to decide when to start fetching more
			currentSize += row.toImage().height;
		}

		row.gameID = obj.attributes.game_id;
		row.teamNames = obj.attributes.team_1.team_name + " - " + obj.attributes.team_2.team_name;
		row.className = 'matchRow';
		return row;
		
    } else {
    	return false;
    }
}

// show the tableView
function createAndShowTableView(league, array) {
    // check if table exists, and if it does simply remove it
    var children = $.newChallenge.children;
    for (var i = 0; i < children.length; i++) {
        if (children[i].id === 'newChallengeTable' || children[i].id === 'scrollView') {
            $.newChallenge.remove(children[i]);
            children[i] = null;
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
        heigth : Ti.UI.FILL,
        width : Ti.UI.FILL,
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
                initialTableSize = 0;
                currentSize = 0;
                overlap = 62;
                getGames(leagueId, true, 0, 20);
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
                refresher.endRefreshing();
            }
        });
    }

    var tableHeaderView = Ti.UI.createView({
        height : 0.1
    });

    if (OS_IOS) {
        // Table
        table = Ti.UI.createTableView({
            headerView : tableHeaderView,
            height : 'auto',
            refreshControl : refresher,
            backgroundColor : '#303030',
            separatorColor : '#303030',
            tableSeparatorInsets : {
                left : 0,
                right : 0
            },
            separatorStyle : Titanium.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE,
        });
    } else {
        // Table
        table = Ti.UI.createTableView({
            headerView : tableHeaderView,
            height : 'auto',
            backgroundColor : '#303030',
            separatorColor : '#303030'
        });
        
        table.addEventListener('scroll',function(e) {       	 
			if(e.firstVisibleItem > 1 && typeof swipeRefresh !== 'undefined' && swipeRefresh !== null) {
          		swipeRefresh.setEnabled(false);
	     	}  else {
	     		swipeRefresh.setEnabled(true);
	     	}
		});
    }

    var footerView = Ti.UI.createView({
        height : 75,
        width : Ti.UI.FILL,
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
        layout : 'vertical'
    });

    footerView.add(Ti.UI.createView({
        top : -0.7,
        height : 0.5,
        width : Ti.UI.FILL,
        backgroundColor : '#303030'
    }));

    footerViewText = Ti.UI.createLabel({
        text : '',
        top : 25,
        left : 20,
        color : '#CCC',
        font : Alloy.Globals.getFontCustom(12, 'Regular')
    });

    footerView.add(footerViewText);

    footerView.add(Ti.UI.createView({
        top : 30.8,
        height : 0.5,
        width : Ti.UI.FILL,
        backgroundColor : '#303030'
    }));

    table.footerView = footerView;

    var data = [];

    // Rows
    for (var i = 0; i < array.length; i++) {
        // each row is created
        var row = createTableRow(array[i]);
        if(row) {
        	data.push(row);
        }
    }

    table.setData(data);

    if (OS_IOS) {
        // get initial table size for iOS
        table.addEventListener('postlayout', function() {
            initialTableSize = table.rect.height;
        });
    }

    table.addEventListener('scroll', function(_evt) {
        if (OS_IOS) {
            // include a timeout for better UE
            setTimeout(function() {
                if (currentSize - overlap < _evt.contentOffset.y + initialTableSize) {
                    if (isLoading) {
                        return;
                    }

                    if (totalNumberOfGames <= numberOfGamesFetched) {
                        // can't load more
                        return;
                    } else {
                        // try to fetch 20 more games each time
                        getGames(leagueId, false, ((numberOfGamesFetched - 0) + 20), 20);
                    }
                }
            }, 500);
        } else {
            if (_evt.firstVisibleItem + _evt.visibleItemCount == _evt.totalItemCount) {
                if (isLoading) {
                    return;
                }

                if (totalNumberOfGames <= numberOfGamesFetched) {
                    // can't load more
                    return;
                } else {
                    setTimeout(function() {
                        // try to fetch 20 more games each time
                        getGames(leagueId, false, ((numberOfGamesFetched - 0) + 20), 20);
                    }, 200);
                }
            }
        }

    });

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
                    gameID : gameID,
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

    /* Custom pull to refresh fix for Android */
    if (OS_ANDROID) {
        var swipeRefreshModule = require('com.rkam.swiperefreshlayout');

        swipeRefresh = swipeRefreshModule.createSwipeRefresh({
            view : table,
            height : Ti.UI.FILL,
            width : Ti.UI.FILL,
            id : 'scrollView'
        });

        swipeRefresh.addEventListener('refreshing', function() {
            if (Alloy.Globals.checkConnection()) {
                indicator.openIndicator();
                getGames(leagueId, true, 0, 20);
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
                swipeRefresh.setRefreshing(false);
            }
        });

        $.newChallenge.add(swipeRefresh);
    } else {
        tableView.add(table);
        $.newChallenge.add(tableView);
    }
}

/* Create Rows and add to table */
function appendToRow(array) {
    for (var i = 0; i < array.length; i++) {
    	var row = createTableRow(array[i]);
    	if(row) {
    		 table.appendRow(row);
    	}   
    }
}

/* Set text with information about how many games we are displaying */
function setDisplayText() {
    if (totalNumberOfGames <= numberOfGamesFetched) {
        footerViewText.setText(Alloy.Globals.PHRASES.showningMatchesTxt + ': ' + totalNumberOfGames + '/' + totalNumberOfGames + " ");
    } else {
        footerViewText.setText(Alloy.Globals.PHRASES.showningMatchesTxt + ': ' + numberOfGamesFetched + '/' + totalNumberOfGames + " ");
    }
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

// will fetch games from API
function getGames(league, firstTime, start, rows) {     
    // check connection
    if (Alloy.Globals.checkConnection()) {
        if (isLoading) {
            return;
        }

        if (OS_IOS && firstTime) {
            indicator.openIndicator();
        } else if (!firstTime) {
            indicator.openIndicator();
        }

        // Get games available to challenge
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            isLoading = false;
            Ti.API.error('Bad Sever =>' + e.error);
            indicator.closeIndicator();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);

            endRefresher();
        };

        try {
            xhr.open('GET', Alloy.Globals.BETKAMPENGETGAMESURL + '/?uid=' + Alloy.Globals.BETKAMPENUID + '&league=' + league + '&lang=' + Alloy.Globals.LOCALE + '&start=' + start + '&rows=' + rows);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
            xhr.setTimeout(Alloy.Globals.TIMEOUT);
            isLoading = true;
            xhr.send();
        } catch(e) {
            isLoading = false;
            indicator.closeIndicator();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            endRefresher();
        }
        xhr.onload = function() {
            if (this.status == '200') {
                if (this.readyState == 4) {
                    var response = JSON.parse(this.responseText);
                    // create gameListObjects and use that array to create table
                    var array = createGameListObject(response.games);
                    // keep track of all games available
                    totalNumberOfGames = response.totalCount;

                    if (totalNumberOfGames <= numberOfGamesFetched) {
                        numberOfGamesFetched = totalNumberOfGames;
                    } else {
                        numberOfGamesFetched = start;
                    }

                    if (array.length > 0) {
                        if (firstTime) {
                            // if this is the first time we are calling this method or if this is a refresh, then rebuild table
                            createAndShowTableView(league, array);
                            numberOfGamesFetched = 0;
                            footerViewText.setText(Alloy.Globals.PHRASES.showningMatchesTxt + ': ' + 20 + '/' + totalNumberOfGames + " ");
                            
                            if(totalNumberOfGames < 20) {
                            	footerViewText.setText(Alloy.Globals.PHRASES.showningMatchesTxt + ': ' + totalNumberOfGames + '/' + totalNumberOfGames + " ");
                            }
                        } else {
                            // not first time, then just add rows
                            appendToRow(array);

                            // we can't fetch more games
                            if (((numberOfGamesFetched - 0) + 20) >= totalNumberOfGames) {
                                // all games are visible. update values
                                numberOfGamesFetched = totalNumberOfGames;
                            }
                            setDisplayText();
                        }
                    } else {
                    	if(table) {
                    		if(table.data[0].rowCount < 1) {
                    			createNoGamesView();
                    		}
                    	} else {
                    		createNoGamesView();
                    	}
                    }
                } else {
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                }

                if (OS_ANDROID) {
                    if ( typeof swipeRefresh !== 'undefined') {
                        swipeRefresh.setRefreshing(false);
                    }
                }

                indicator.closeIndicator();
                isLoading = false;
            } else {
                isLoading = false;
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                indicator.closeIndicator();
                endRefresher();
                Ti.API.error("Error =>" + this.response);
            }
        };

    } else {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }
}

/* Flow */
var context;
var leagueName = '';
var leagueId = -1;
var table;
var refresher;
var totalNumberOfGames = 20;
var numberOfGamesFetched = 0;
var footerViewText;
var isLoading = false;
var initialTableSize = 0;
var currentSize = 0;
var overlap = 62;
var swipeRefresh;

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

var fontawesome = require('lib/IconicFont').IconicFont({
    font : 'lib/FontAwesome'
});

var font = 'FontAwesome';
var isAndroid = false;

if (OS_ANDROID) {
    isAndroid = true;
    context = require('lib/Context');
    font = 'fontawesome-webfont';

    $.newChallenge.orientationModes = [Titanium.UI.PORTRAIT];

    $.newChallenge.addEventListener('open', function() {
        Alloy.Globals.setAndroidCouponMenu($.newChallenge.activity);

        $.newChallenge.activity.actionBar.onHomeIconItemSelected = function() {
            if($.newChallenge) {
                $.newChallenge.close();
            	$.newChallenge = null;	
            }
        };
        $.newChallenge.activity.actionBar.displayHomeAsUp = true;
        $.newChallenge.activity.actionBar.title = Alloy.Globals.PHRASES.pickMatchTxt;

        // sometimes the view remain in memory, then we don't need to show the "loading"
        if (totalNumberOfGames === 20) {
            indicator.openIndicator();
        }
    });
} else {
    $.newChallenge.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.pickMatchTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });
}

function onOpen(evt) {
    if(isAndroid) {
        context.on('newChallengeActivity', this.activity);
    }
}

function onClose(evt) {
    if(isAndroid) {
        context.off('newChallengeActivity');
    }
}

$.newChallenge.addEventListener('close', function() {
    indicator.closeIndicator();
});

var args = arguments[0] || {};
if ( typeof args.leagueId !== 'undefined') {
    leagueId = args.leagueId;
    // get games for that specific league. Start with fetching 20
    getGames(leagueId, true, 0, 20);
}

