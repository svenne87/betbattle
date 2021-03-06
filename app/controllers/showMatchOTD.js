var args = arguments[0] || {};
var context;
var gameID = args.gameID;
var topView;
var botView;
var refresher;
var swipeRefresh = null;
var headerScoreLabel;
var view;

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

var imageErrorHandler = function(e) {
    e.source.image = '/images/no_pic.png';
};

var fontawesome = require('lib/IconicFont').IconicFont({
    font : 'lib/FontAwesome'
});

var font = 'fontawesome-webfont';

var isOpen = false;
var isAndroid = true;
var iOSVersion;

if (OS_IOS) {
    font = 'FontAwesome';
    isAndroid = false;
    iOSVersion = parseInt(Ti.Platform.version);
} else {
    context = require('lib/Context');
    var swipeRefreshModule = require('com.rkam.swiperefreshlayout');
}

var sections = [];
var table = null;

function onOpen(evt) {
    if(isAndroid) {
        context.on('showMatchOTDActivity', this.activity);
    }
}

function onClose(evt) {
    if(isAndroid) {
        context.off('showMatchOTDActivity');
    }
}

function checkDate(date) {
    // check if match has started
    var gameDateMilli = date + "000";
    var gameDate = new Date((gameDateMilli - 0));
    var now = new Date();

    if (now.getTime() >= gameDate.getTime()) {
        return true;
    }
    return false;
}

function createGameType(gameType, game, values, index, sections) {
    var type = gameType.type;

    var gameTypeView = Ti.UI.createView({
        height : 65,
        width : Ti.UI.FILL,
        layout : 'absolute',
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

    var gameTypeText = Alloy.Globals.PHRASES.gameTypes[type].displayResult;
    if (gameTypeText.length > 20) {
        gameTypeText = gameTypeText.substring(0, 17) + '...';
    }

    gameTypeView.add(Ti.UI.createLabel({
        text : gameTypeText + ' ',
        left : 20,
        top : 10,
        height : Ti.UI.SIZE,
        width : Ti.UI.SIZE,
        font : Alloy.Globals.getFontCustom(18, 'Regular'),
        color : '#FFF'
    }));
	
    var gameTypeScoreLabel = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.giveTxt + " " + gameType.number_of_values + " " + Alloy.Globals.PHRASES.pointsTxt + '  ',
        top : 37,
        left : 20,
        font : Alloy.Globals.getFontCustom(12, "Regular"),
        color : Alloy.Globals.themeColor()
    });

    gameTypeView.add(gameTypeScoreLabel);

    var resultText = '';
    var endTimeResultText = '';
    var ot = false;
    var pt = false;

    // only print for challenges that have started
    if (checkDate(game.game_date)) {

        // check to find  actuall end result. Check here since this is not a game type that gives points
        for (var i = 0; i < game.result_values.length; i++) {
            if (game.result_values[i].gid === game.game_id && game.result_values[i].game_type === '20') {
                endTimeResultText = game.result_values[i].value_1 + ' - ' + game.result_values[i].value_2;
            }

            // over time
            if (game.result_values[i].gid === game.game_id && game.result_values[i].game_type === '21') {
                var otResult = game.result_values[i].value_1 + ' - ' + game.result_values[i].value_2;

                if (otResult !== '0 - 0') {
                    ot = true;
                }
            }

            // penalty
            if (game.result_values[i].gid === game.game_id && game.result_values[i].game_type === '22') {
                var ptResult = game.result_values[i].value_1 + ' - ' + game.result_values[i].value_2;

                if (ptResult !== '0 - 0') {
                    pt = true;
                }
            }
        }

        for (var i = 0; i < game.result_values.length; i++) {
            if (game.result_values[i].game_type === type && game.result_values[i].gid === game.game_id) {
                if (gameType.number_of_values === '1') {
                    if ( typeof Alloy.Globals.PHRASES.gameTypes[type].buttonValues !== 'undefined') {
                        // check for the gametype "draw"
                        resultText = Alloy.Globals.PHRASES.gameTypes[type].buttonValues[game.result_values[i].value_1];

                        //if the json says team1 or team2. get the actual team names
                        if (resultText === "team1") {
                            resultText = game.team_1.team_name;
                        } else if (resultText === "team2") {
                            resultText = game.team_2.team_name;
                        }

                        // if the game is in progress and result first goal, winning team etc. is draw
                        if (game.status === '3') {
                            if (game.result_values[i].value_1 === '2') {
                                resultText = "-";
                            }
                        }

                        // resultText will be undefined if it's gametype "draw"
                        if ( typeof resultText === 'undefined') {
                            // if game is pending and the status is "no score", hide it
                            resultText = "-";
                        }

                        if (resultText.length > 15) {
                            resultText = resultText.substring(0, 12) + '...';
                        }
                    } else {
                        // Yellow card
                        resultText = game.result_values[i].value_1;
                    }
                    // check if game type is 1, winning team. Should be cleared out when the match is "live" and the score is more than 0-0
                    if (type === '1' && game.status === '3' && game.result_values[1].value_1 === '0' && game.result_values[1].value_1 === "0") {
                        resultText = '';
                    }

                } else if (gameType.number_of_values === '2') {
                    resultText = game.result_values[i].value_1 + " - " + game.result_values[i].value_2;

                    if (game.result_values[i].game_type === '3') {
                        if (game.status === '2') {
                            // final score, update header label

                            // if there was ot or pn the end result would not be the same as our final result
                            if (resultText !== endTimeResultText) {
                                var desc = '';

                                if (ot) {
                                    desc = Alloy.Globals.PHRASES.overTimeTxt;
                                } else if (pt) {
                                    desc = Alloy.Globals.PHRASES.penaltyTxt;
                                }

                                if (ot && pt) {
                                    desc = Alloy.Globals.PHRASES.penaltyAndOverTimeTxt;
                                }

                                if (desc !== '') {
                                    headerScoreLabel.setText(resultText + "    (" + endTimeResultText + " " + desc + ")");
                                    headerScoreLabel.width = Ti.UI.FILL;
                                } else {
                                    if(endTimeResultText !== '0 - 0'){
                                        headerScoreLabel.setText(resultText + "    (" + endTimeResultText + ")");                                   
                                    } else {
                                        headerScoreLabel.setText(resultText); 
                                    }
                                    headerScoreLabel.width = Ti.UI.FILL;
                                }
                            } else {
                                headerScoreLabel.setText(resultText);
                            }
                        } else if (game.status === '3') {
                            // current score, update header label
                            headerScoreLabel.setText("(" + resultText + ") ");
                        }
                    }
                }
            }
        }
    }

    gameTypeView.add(Ti.UI.createLabel({
        text : resultText + ' ',
        right : 10,
        top : 10,
        height : Ti.UI.SIZE,
        width : Ti.UI.SIZE,
        font : Alloy.Globals.getFontCustom(18, 'Regular'),
        color : Alloy.Globals.themeColor()
    }));

    if (isAndroid) {
        // create a section for each game type
        sections[index] = Ti.UI.createTableViewSection({
            headerView : gameTypeView,
            name : type
        });
    } else {
        // create a section for each game type
        sections[index] = Ti.UI.createTableViewSection({
            headerView : gameTypeView,
            footerView : Ti.UI.createView({
                height : 0.1
            }),
            name : type
        });
    }

    // loop all values
    for (var i = 0; i < values.length; i++) {
        if (values[i].game_type === type && values[i].gid === game.game_id) {
            var correct = false;
            // only check games that has started
            if (checkDate(game.game_date)) {
                for (var m in game.result_values) {
                    if (values[i].game_type === game.result_values[m].game_type) {
                        if (values[i].value_1 === game.result_values[m].value_1) {
                            if (values[i].value_2 === game.result_values[m].value_2) {
                                correct = true;
                                break;
                            }
                        }
                    }
                }
            }

            var row = Ti.UI.createTableViewRow({
                hasChild : false,
                width : Ti.UI.FILL,
                left : 0,
                className : 'gameType',
                height : 40,
                selectionStyle : 'none'
            });

            if (Alloy.Globals.FACEBOOKOBJECT != null) {
                image = "https://graph.facebook.com/" + Alloy.Globals.FACEBOOKOBJECT.attributes.id + "/picture?type=large";
            } else {
                // get betkampen image
                image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + Alloy.Globals.BETKAMPENUID + '.png';
            }

            var profileImgView = Ti.UI.createImageView({
                // defaultImage : '/images/no_pic.png',
                image : image,
                left : 10,
                height : 20,
                width : 20,
                borderRadius : 10,
            });
			
			if(!isAndroid) {
				profileImgView.setDefaultImage('/images/no_pic.png');
			}
			
            profileImgView.addEventListener('error', imageErrorHandler);

            var profileName = Alloy.Globals.PROFILENAME;

            if (profileName.length > 18) {
                profileName = profileName.substring(0, 15) + '...';
            }

            var nameLabel = Ti.UI.createLabel({
                text : profileName + ' ',
                left : 40,
                height : Ti.UI.SIZE,
                width : Ti.UI.SIZE,
                font : Alloy.Globals.getFontCustom(16, 'Regular'),
                color : '#FFF'
            });

            // print out all the participants values
            var valueText = '';
            if (gameType.number_of_values === '1') {
                if ( typeof Alloy.Globals.PHRASES.gameTypes[type].buttonValues !== 'undefined') {
                    // check for the gametype "draw"
                    valueText = Alloy.Globals.PHRASES.gameTypes[type].buttonValues[values[i].value_1];

                    //if the json says team1 or team2. get the actual team names
                    if (valueText === "team1") {
                        valueText = game.team_1.team_name;
                    } else if (valueText === "team2") {
                        valueText = game.team_2.team_name;
                    }

                    // valueText will be undefined if it's gametype "draw"
                    if ( typeof valueText === 'undefined') {
                        valueText = values[i].value_1;
                    }

                    if (valueText.length > 15) {
                        valueText = valueText.substring(0, 12) + '...';
                    }
                } else {
                    // This will handle yellow cards
                    valueText = values[i].value_1;
                }
            } else if (gameType.number_of_values === '2') {
                valueText = values[i].value_1 + " - " + values[i].value_2;
            }

            var valueLabel = Ti.UI.createLabel({
                text : valueText + ' ',
                right : 10,
                height : Ti.UI.SIZE,
                width : Ti.UI.SIZE,
                font : Alloy.Globals.getFontCustom(16, 'Regular'),
                color : '#FFF'
            });

            row.add(profileImgView);
            row.add(nameLabel);
            row.add(valueLabel);

            // if the player guessed correct
            if (correct) {           	
                var correctValueLabel = Ti.UI.createLabel({
                    font : {
                        fontFamily : font
                    },
                    text : fontawesome.icon('fa-check'),
                    right : valueLabel.toImage().width + 15,
                    color : '#00FF33',
                    height : Ti.UI.SIZE,
                    width : Ti.UI.SIZE
                });

                row.add(correctValueLabel);
            }
            sections[index].add(row);
        }
    }
}

function createLayout(resp) {
	// set the length of the images you have in your sequence
    var loaderArrayLength = 2;

    // initialize the index to 1
    var loaderIndex = 1;

    var liveIcon = null;
    // this function will be called by the setInterval
    function loadingAnimation() {
        // set the image property of the imageview by constructing the path with the loaderIndex variable
        try {
            liveIcon.image = "/images/ikon_" + loaderIndex + "_live.png";
        } catch (e) {

        }

        //increment the index so that next time it loads the next image in the sequence
        loaderIndex++;
        // if you have reached the end of the sequence, reset it to 1
        if (loaderIndex === 3) {
            loaderIndex = 1;
        }
    }

    view = Ti.UI.createView({
        height : 'auto',
        width : 'auto',
        layout : 'vertical'
    });
    
    var tableHeaderView = Ti.UI.createView({
        height : 0.1,
        width : Ti.UI.FILL,
        backgroundColor : 'transparent',
        layout : "absolute",
    });

    if (!isAndroid) {

        refresher = Ti.UI.createRefreshControl({
            tintColor : Alloy.Globals.themeColor()
        });

        table = Titanium.UI.createTableView({
            left : 0,
            headerView : tableHeaderView,
            height : '100%',
            width : '100%',
            backgroundColor : 'transparent',
            style : Ti.UI.iPhone.TableViewStyle.GROUPED,
            tableSeparatorInsets : {
                left : 0,
                right : 0
            },
            refreshControl : refresher,
            id : 'winnersTable',
            separatorStyle : Titanium.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE,
            separatorColor : '#303030'
        });

        if (iOSVersion < 7) {
            table.separatorStyle = Titanium.UI.iPhone.TableViewSeparatorStyle.NONE;
            table.separatorColor = 'transparent';
        }

        // will refresh on pull
        refresher.addEventListener('refreshstart', function(e) {
            if (Alloy.Globals.checkConnection()) {
                indicator.openIndicator();
                // clear children
                $.showMatchOTD.remove(view);

                getChallengeShow();
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
                refresher.endRefreshing();
            }

        });

    } else {
        table = Titanium.UI.createTableView({
            width : Ti.UI.FILL,
            left : 0,
            headerView : tableHeaderView,
            height : '100%',
            backgroundColor : 'transparent',
            separatorColor : '#303030',
            id : 'challengeTable'
        });

        table.footerView = Ti.UI.createView({
            height : 0.5,
            width : Ti.UI.FILL,
            backgroundColor : '#303030'
        });
          
		table.addEventListener('scroll',function(e) {       	 
			if(e.firstVisibleItem > 1 && typeof swipeRefresh !== 'undefined' && swipeRefresh !== null) {
          		swipeRefresh.setEnabled(false);
	     	}  else {
	     		swipeRefresh.setEnabled(true);
	     	}
	     });	    
    }
    
    var matchHeader = Ti.UI.createView({
        height : 70,
        width : Ti.UI.FILL,
        layout : 'vertical',
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

    var teamNames = resp.game.team_1.team_name + " - " + resp.game.team_2.team_name;
    var fontResponsive = Alloy.Globals.getFontCustom(22, 'Regular');

    if (teamNames.length > 22) {
        fontResponsive = Alloy.Globals.getFontCustom(18, 'Regular');
    }
    if (teamNames.length > 32) {
        fontResponsive = Alloy.Globals.getFontCustom(18, 'Regular');
    }
    if (teamNames.length > 37) {
        if (resp.game.team_1.team_name.length > 17) {
            resp.game.team_1.team_name = resp.game.team_1.team_name.substring(0, 14) + '...';
        }

        if (resp.game.team_2.team_name.length > 17) {
            resp.game.team_2.team_name = resp.game.team_2.team_name.substring(0, 14) + '...';
        }

        teamNames = resp.game.team_1.team_name + " - " + game.team_2.team_name;
    }

	matchHeader.add(Ti.UI.createLabel({
        top : 10,
        left : 10,
        height : Ti.UI.SIZE,
        width : Ti.UI.SIZE,
        font : fontResponsive,
        color : '#FFF',
        text : teamNames + ' '
    }));
    
    if (!checkDate(resp.game.game_date)) {    	
        matchHeader.add(Ti.UI.createLabel({
            left : 10,
            top : 3,
            font : {
                fontFamily : font
            },
            text : fontawesome.icon('fa-clock-o'),
            color : Alloy.Globals.themeColor()
        }));

        matchHeader.add(Ti.UI.createLabel({
            top : -17,
            left : 25,
            height : Ti.UI.SIZE,
            width : Ti.UI.SIZE,
            font : Alloy.Globals.getFontCustom(12, 'Regular'),
            color : Alloy.Globals.themeColor(),
            text : resp.game.game_date_string + ' '
        }));
    } else {
        if (resp.game.status === '2') {
            // game has started, show result
            matchHeader.add(Ti.UI.createLabel({
                left : 12,
                top : 3,
                font : {
                    fontFamily : font
                },
                text : fontawesome.icon('fa-caret-right'),
                color : Alloy.Globals.themeColor()
            }));

            headerScoreLabel = Ti.UI.createLabel({
                top : -17,
                left : 25,
                height : Ti.UI.SIZE,
                width : Ti.UI.SIZE,
                font : Alloy.Globals.getFontCustom(12, 'Regular'),
                color : Alloy.Globals.themeColor(),
                text : ' '
            });

            matchHeader.add(headerScoreLabel);
        } else if (resp.game.status === '3') {
            liveIcon = Ti.UI.createImageView({
                left : 12,
                top : 3,
                image : '/images/ikon_1_live.png',
                height : 10,
                width : 10,
            });

            matchHeader.add(liveIcon);

            var liveLabel = Ti.UI.createLabel({
                text : "Live",
                left : 25,
                top : -15,
                font : Alloy.Globals.getFontCustom(12, "Regular"),
                color : Alloy.Globals.themeColor()
            });

            matchHeader.add(liveLabel);

            var loaderAnimate = setInterval(loadingAnimation, 280);

            headerScoreLabel = Ti.UI.createLabel({
                top : -18,
                left : 55,
                height : Ti.UI.SIZE,
                width : Ti.UI.SIZE,
                font : Alloy.Globals.getFontCustom(12, 'Regular'),
                color : Alloy.Globals.themeColor(),
                text : ' '
            });
            matchHeader.add(headerScoreLabel);
        }
    }

    if (!isAndroid) {
        sections[0] = Ti.UI.createTableViewSection({
            headerView : matchHeader,
            footerView : Ti.UI.createView({
                height : 0.1
            })
        });
    } else {
        sections[0] = Ti.UI.createTableViewSection({
            headerView : matchHeader
        });
    }
	
	/*
    var rowUser = Ti.UI.createTableViewRow({
        height : 65,
        width : Ti.UI.FILL,
    });
    var usersCountLabel = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.showMatchOTDusers + resp.stats.count,
        font : Alloy.Globals.getFontCustom(18, "Regular"),
        color : "#FFF",
        left : 20,
    });
    rowUser.add(usersCountLabel);
	*/
    var rowPot = Ti.UI.createTableViewRow({
        height : 65,
        width : Ti.UI.FILL,
    });

    var potSize = resp.stats.count * resp.stats.bet_amount;
    potSize = (potSize - 0) + (resp.stats.extra_pot - 0);
    
    var potSizeLabel = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.showMatchOTDpot + potSize,
        font : Alloy.Globals.getFontCustom(18, "Regular"),
        color : "#FFF",
        left : 20,
    });

    rowPot.add(potSizeLabel);

   // sections[0].add(rowUser);
    sections[0].add(rowPot);

    // create each game type
    var gametypes = resp.game.game_types;
    for (var y in gametypes) {
        // send in y and sections to add the data to the correct section. (y+1 will be that section, since section[0] is used)
        createGameType(gametypes[y], resp.game, resp.values, ((y - 0 ) + 1), sections);
    }

    // add name to the section with game type and then custom to make the "final result" end up last in sections
    var customSection = null;

    // find "final result game type" and place it last in array
    for (var s in sections) {
        if (sections[s].name === '3') {
            customSection = sections[s];
            sections.splice(s, 1);
            break;
        }
    }

    if (customSection !== null) {
        sections.push(customSection);
    }

    customSection = null;

    table.setData(sections);
    view.add(table);

    if (isAndroid) {
        swipeRefresh = swipeRefreshModule.createSwipeRefresh({
            view : view,
            height : Ti.UI.FILL,
            width : Ti.UI.FILL,
            id : 'swiper',
        });

        swipeRefresh.addEventListener('refreshing', function(e) {
            if (Alloy.Globals.checkConnection()) {
                setTimeout(function() {
                    indicator.openIndicator();
                    //view.remove(table);
                    $.showMatchOTD.remove(swipeRefresh);
                    getChallengeShow();
                }, 800);
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
                swipeRefresh.setRefreshing(false);
            }
        });
        $.showMatchOTD.add(swipeRefresh);

    } else {
        $.showMatchOTD.add(view); 
    }
}

function endRefresher() {
    if (!isAndroid) {
        if ( typeof refresher !== 'undefined' && refresher !== null) {
            refresher.endRefreshing();
        }
    } else {
        if (swipeRefresh !== null && typeof swipeRefresh !== 'undefined') {
            swipeRefresh.setRefreshing(false);
        }
    }
}

function getChallengeShow() {
    if (!isAndroid) {
        indicator.openIndicator();
    }

    var xhr = Titanium.Network.createHTTPClient();
    xhr.onerror = function(e) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        Ti.API.error('Bad Sever =>' + e.error);
        indicator.closeIndicator();
        endRefresher();
    };

    try {
        xhr.open('GET', Alloy.Globals.BETKAMPENMATCHOTDSHOWURL + '?gameID=' + gameID + '&lang=' + Alloy.Globals.LOCALE);
        xhr.setRequestHeader("challengesView-type", "application/json");
        xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
        xhr.setTimeout(Alloy.Globals.TIMEOUT);
        xhr.send();
    } catch(e) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        indicator.closeIndicator();
        endRefresher();
    }
    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {
                var response = JSON.parse(this.responseText);

                if(isAndroid) {
                    if(typeof view !== 'undefined') {
                       // view.remove(swipeRefresh);
                        endRefresher();    
                    }
                } 
                createLayout(response);
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            }
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("Error =>" + this.response);
            endRefresher();
        }
        indicator.closeIndicator();
    };
}

if (isAndroid) {
    $.showMatchOTD.orientationModes = [Titanium.UI.PORTRAIT];

    $.showMatchOTD.addEventListener('open', function() {
        Alloy.Globals.setAndroidCouponMenu($.showMatchOTD.activity);

        $.showMatchOTD.activity.actionBar.onHomeIconItemSelected = function() {
            if($.showMatchOTD) {
                $.showMatchOTD.close();
            	$.showMatchOTD = null;	
            }
        };
        $.showMatchOTD.activity.actionBar.displayHomeAsUp = true;
        $.showMatchOTD.activity.actionBar.title = Alloy.Globals.PHRASES.matchTxt;
        Ti.API.log(" status " + isOpen);
        // TODO
        if (!isOpen) {
            //indicator.openIndicator();
            isOpen = true;
        }
    });
} else {
    $.showMatchOTD.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.matchTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });
}

$.showMatchOTD.addEventListener('focus', function() {	
	if(!isAndroid) {	
		Alloy.Globals.focusWindow = function() { 
			if (Alloy.Globals.checkConnection()) {
				$.showMatchOTD.remove(view);
        		indicator.openIndicator();
            	setTimeout(function() {
           			getChallengeShow();
        		}, 500);
       		}
		};
		Ti.App.addEventListener('updateFocusWindow', Alloy.Globals.focusWindow);
	} else {
		indicator.openIndicator();
		$.showMatchOTD.remove(swipeRefresh);
		setTimeout(function() {
        	getChallengeShow();
        }, 500);
	}
});
$.showMatchOTD.addEventListener('blur', function() {
	if (!isAndroid) { 
		Ti.App.removeEventListener('updateFocusWindow', Alloy.Globals.focusWindow);
	}
});

if(!isAndroid) { 
	getChallengeShow();
}