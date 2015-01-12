var args = arguments[0] || {};
var view;
var botView;
var groupName = args.group;
var headerScoreLabel;
var pendingStandingsArray = [];
var challengeFinished = false;
var refresher;
var swipeRefresh = null;
var androidViews = [];
var firstSections; 
var firstTable;

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

var iOSVersion;
var isAndroid = true;

if (OS_IOS) {
    iOSVersion = parseInt(Ti.Platform.version);
    isAndroid = false;
}

var fontawesome = require('lib/IconicFont').IconicFont({
    font : 'lib/FontAwesome'
});

var font = 'FontAwesome';

if (isAndroid) {
    font = 'fontawesome-webfont';

    $.showChallengeWindow.scrollType = 'vertical';
    $.showChallengeWindow.orientationModes = [Titanium.UI.PORTRAIT];

    $.showChallengeWindow.addEventListener('open', function() {
        Alloy.Globals.setAndroidCouponMenu($.showChallengeWindow.activity);

        $.showChallengeWindow.activity.actionBar.onHomeIconItemSelected = function() {
            $.showChallengeWindow.close();
            $.showChallengeWindow = null;
        };
        $.showChallengeWindow.activity.actionBar.displayHomeAsUp = true;
        $.showChallengeWindow.activity.actionBar.title = Alloy.Globals.PHRASES.showChallengeTxt;
        indicator.openIndicator();
    });
} else {
    $.showChallengeWindow.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.showChallengeTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });
}

var imageErrorHandler = function(e) {
    e.image = '/images/no_pic.png';
};

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

function compare(a, b) {
    if ((a.points - 0) > (b.points - 0))
        return -1;
    if ((a.points - 0) < (b.points - 0))
        return 1;
    return 0;
}

function addPointPendingStandings(game_type, nrOfValues, uid) {    
    if (pendingStandingsArray.length > 0) {
        var point = 1;
        if (nrOfValues === '2') {
            // this game type gives 2 points
            point = 2;
        }

        // find correct user
        for (var player in pendingStandingsArray) {
            if (pendingStandingsArray[player].uid === uid) {
                // user found
                pendingStandingsArray[player].points = ((pendingStandingsArray[player].points - 0) + point);
                break;
            }
        }
    }
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
            if(game.result_values[i].gid === game.game_id && game.result_values[i].game_type === '20') {
                endTimeResultText = game.result_values[i].value_1 + ' - ' + game.result_values[i].value_2;
            }
            
            // over time
            if(game.result_values[i].gid === game.game_id && game.result_values[i].game_type === '21') {
                var otResult = game.result_values[i].value_1 + ' - ' + game.result_values[i].value_2;

                if(otResult !== '0 - 0') {
                    ot = true;
                }
            }
            
            // penalty
            if(game.result_values[i].gid === game.game_id && game.result_values[i].game_type === '22') {
                var ptResult = game.result_values[i].value_1 + ' - ' + game.result_values[i].value_2;
                
                if(ptResult !== '0 - 0') {
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
                    // check if game typ is 1, winning team. Should be cleared out when the match is "live" and the score is more than 0-0
                    if (type === '1' && game.status === '3' && game.result_values[1].value_1 === '0' && game.result_values[1].value_1 === "0") {
                        resultText = '';
                    }

                } else if (gameType.number_of_values === '2') {
                    resultText = game.result_values[i].value_1 + " - " + game.result_values[i].value_2;
                    
                    if (game.result_values[i].game_type === '3') {
                        if (game.status === '2') {
                            // final score, update header label
                            
                            // if there was ot or pn the end result would not be the same as our final result
                            if(resultText !== endTimeResultText) {
                                var desc = '';
                                
                                if(ot) {
                                    desc = Alloy.Globals.PHRASES.overTimeTxt;
                                } else if(pt) {
                                    desc = Alloy.Globals.PHRASES.penaltyTxt;
                                }
                                 
                                if(ot && pt) {
                                    desc = Alloy.Globals.PHRASES.penaltyAndOverTimeTxt;
                                }
                                
                                if(desc !== '') {
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

            if (values[i].fb_id !== null) {
                image = "https://graph.facebook.com/" + values[i].fb_id + "/picture?type=large";
            } else {
                // get betkampen image
                image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + values[i].uid + '.png';
            }

            var profileImgView = Ti.UI.createImageView({
                defaultImage : '/images/no_pic.png',
                image : image,
                left : 10,
                height : 20,
                width : 20,
                borderRadius : 10,
            });

            profileImgView.addEventListener('error', imageErrorHandler);

            var profileName = values[i].name;

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
                // add point to correct user in pending standings array
                addPointPendingStandings(values[i].game_type, gameType.number_of_values, values[i].uid);

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

function createLayout(game, values, games, currentStanding, isFirst, isFinished, isLast) {
    // isFinished will be true if all matches are finished
    if (currentStanding.length > 0 && isFinished) {
        challengeFinished = true;
    } else {
        // only show standings if a match has started
        if (checkDate(game.game_date)) {
            currentStanding = pendingStandingsArray;
        }
    }

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
        height : Ti.UI.FILL,
        width : Ti.UI.FILL,
        layout : 'vertical'
    });

    var header = Ti.UI.createView({
        height : '15%',
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

    var teamNames = game.team_1.team_name + " - " + game.team_2.team_name;
    var fontResponsive = Alloy.Globals.getFontCustom(22, 'Regular');

    if (teamNames.length > 22) {
        fontResponsive = Alloy.Globals.getFontCustom(18, 'Regular');
    }
    if (teamNames.length > 32) {
        fontResponsive = Alloy.Globals.getFontCustom(18, 'Regular');
    }
    if (teamNames.length > 37) {
        if (game.team_1.team_name.length > 17) {
            game.team_1.team_name = game.team_1.team_name.substring(0, 14) + '...';
        }

        if (game.team_2.team_name.length > 17) {
            game.team_2.team_name = game.team_2.team_name.substring(0, 14) + '...';
        }

        teamNames = game.team_1.team_name + " - " + game.team_2.team_name;
    }

    header.add(Ti.UI.createLabel({
        top : 10,
        left : 10,
        height : Ti.UI.SIZE,
        width : Ti.UI.SIZE,
        font : fontResponsive,
        color : '#FFF',
        text : teamNames + ' '
    }));

    if (!checkDate(game.game_date)) {
        header.add(Ti.UI.createLabel({
            left : 10,
            top : 3,
            font : {
                fontFamily : font
            },
            text : fontawesome.icon('fa-clock-o'),
            color : Alloy.Globals.themeColor()
        }));

        header.add(Ti.UI.createLabel({
            top : -17,
            left : 25,
            height : Ti.UI.SIZE,
            width : Ti.UI.SIZE,
            font : Alloy.Globals.getFontCustom(12, 'Regular'),
            color : Alloy.Globals.themeColor(),
            text : game.game_date_string + ' '
        }));
    } else {
        if (game.status === '2') {
            // game has started, show result
            header.add(Ti.UI.createLabel({
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

            header.add(headerScoreLabel);
        } else if (game.status === '3') {
            liveIcon = Ti.UI.createImageView({
                left : 12,
                top : 3,
                image : '/images/ikon_1_live.png',
                height : 10,
                width : 10,
            });

            header.add(liveIcon);

            var liveLabel = Ti.UI.createLabel({
                text : "Live",
                left : 25,
                top : -15,
                font : Alloy.Globals.getFontCustom(12, "Regular"),
                color : Alloy.Globals.themeColor()
            });

            header.add(liveLabel);

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

            header.add(headerScoreLabel);
        }
    }

    view.add(header);

    if (!isAndroid) {
        refresher = Ti.UI.createRefreshControl({
            tintColor : Alloy.Globals.themeColor()
        });

        // will refresh on pull
        refresher.addEventListener('refreshstart', function(e) {
            if (Alloy.Globals.checkConnection()) {
                indicator.openIndicator();
                pendingStandingsArray = [];
                // clear children
                for (var c = ($.showChallenge.getViews().length - 1); c >= 0; c--) {
                    $.showChallenge.removeView($.showChallenge.getViews()[c]);
                }

                getChallengeShow();
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
                refresher.endRefreshing();
            }

        });
    }

    var table;

    if (!isAndroid) {
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
            width : Ti.UI.FILL,
            height : '85%',
            backgroundColor : '#000',
            style : Ti.UI.iPhone.TableViewStyle.GROUPED,
            separatorInsets : {
                left : 0,
                right : 0
            },
            separatorStyle : separatorS,
            separatorColor : separatorColor,
            selectionStyle : 'none',
            refreshControl : refresher
        });
    } else {
        table = Titanium.UI.createTableView({
            width : Ti.UI.FILL,
            height : '85%',
            backgroundColor : '#000',
            separatorColor : '#303030',
            selectionStyle : 'none'
        });
    }

    // remove empty space
    table.headerView = Ti.UI.createView({
        height : 0.1
    });

    var sections = [];

    // create each game type
    var gametypes = game.game_types;
    for (var y in gametypes) {
        // send in y and sections to add the data to the correct section. (y+1 will be that section, since section[0] is used)
        createGameType(gametypes[y], game, values, ((y - 0 ) + 1), sections);
    }
    
        // create standings view
    if (currentStanding.length > 0 && isFirst) {
        // standings
        var standingsView = Ti.UI.createView({
            height : 75,
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

        if (challengeFinished) {
            standingsView.add(Ti.UI.createLabel({
                text : Alloy.Globals.PHRASES.standingFinishedTxt,
                left : 10,
                top : 24,
                height : Ti.UI.SIZE,
                width : Ti.UI.SIZE,
                font : Alloy.Globals.getFontCustom(18, 'Regular'),
                color : '#FFF'
            }));
        } else {
            standingsView.add(Ti.UI.createLabel({
                text : Alloy.Globals.PHRASES.standingPendingTxt,
                left : 10,
                top : 24,
                height : Ti.UI.SIZE,
                width : Ti.UI.SIZE,
                font : Alloy.Globals.getFontCustom(18, 'Regular'),
                color : '#FFF'
            }));
        }

        if (isAndroid) {
            sections[0] = Ti.UI.createTableViewSection({
                headerView : standingsView
            });

        } else {
            sections[0] = Ti.UI.createTableViewSection({
                headerView : standingsView,
                footerView : Ti.UI.createView({
                    height : 0.1
                })
            });

        }

        // keep track of these, since we add the standings rows to section[0] then setData
        firstSections = sections;
        firstTable = table; 
    }


    if (!challengeFinished && isLast) {
        // sort array and add standings tabel. Only do this after the last game
        currentStanding.sort(compare);
        
        for (var i = 0; i < currentStanding.length; i++) {
            var tmpObj = currentStanding[i];
            var image = '';

            if (i === 0) {
                image = '/images/gold.png';
            } else if (i === 1) {
                image = '/images/silver.png';
            } else if (i === 2) {
                image = '/images/bronze.png';
            }

            var row = Ti.UI.createTableViewRow({
                hasChild : false,
                width : Ti.UI.FILL,
                left : 0,
                name : 'standings',
                height : 40,
                selectionStyle : 'none'
            });

            if (image !== '') {
                var leftImageView = Ti.UI.createImageView({
                    left : 10,
                    height : 20,
                    width : 20,
                    borderRadius : 10,
                    image : image
                });

                row.add(leftImageView);
            }

            if (tmpObj.playerName.length > 15) {
                tmpObj.playerName = tmpObj.playerName.substring(0, 12) + '...';
            }

            var nameLabel = Ti.UI.createLabel({
                left : 40,
                height : Ti.UI.SIZE,
                width : Ti.UI.SIZE,
                font : Alloy.Globals.getFontCustom(16, 'Regular'),
                color : '#FFF',
                text : tmpObj.playerName + ' '
            });

            if (challengeFinished) {
                var potTextLabel = Ti.UI.createLabel({
                    right : 10,
                    height : Ti.UI.SIZE,
                    width : Ti.UI.SIZE,
                    font : Alloy.Globals.getFontCustom(16, 'Regular'),
                    color : Alloy.Globals.themeColor(),
                    text : tmpObj.earnings || '0'
                });

                row.add(potTextLabel);

                var potIconLabel = Ti.UI.createLabel({
                    right : potTextLabel.toImage().width + 13,
                    font : {
                        fontFamily : font
                    },
                    text : fontawesome.icon('fa-database'),
                    color : Alloy.Globals.themeColor()
                });

                row.add(potIconLabel);

                var pointsTextLabel = Ti.UI.createLabel({
                    right : potTextLabel.toImage().width + 13 + potIconLabel.toImage().width + 5,
                    height : Ti.UI.SIZE,
                    width : Ti.UI.SIZE,
                    font : Alloy.Globals.getFontCustom(16, 'Regular'),
                    color : Alloy.Globals.themeColor(),
                    text : tmpObj.points + "p " + Alloy.Globals.PHRASES.gaveTxt + " " || '0' + "p " + Alloy.Globals.PHRASES.gaveTxt + " "
                });

                row.add(pointsTextLabel);
            } else {
                var potTextLabel = Ti.UI.createLabel({
                    right : 10,
                    id : tmpObj.uid,
                    height : Ti.UI.SIZE,
                    width : Ti.UI.SIZE,
                    font : Alloy.Globals.getFontCustom(16, 'Regular'),
                    color : Alloy.Globals.themeColor(),
                    text : tmpObj.points || '0'
                });

                row.add(potTextLabel);
            }

            row.add(nameLabel);

            if(isFirst && isLast) {
                // only one game
                sections[0].add(row);
            } else {
                firstSections[0].add(row);
            }
        }
        
        if(games.length > 1) {
            // more than one game
            if(firstTable && firstSections) {
                firstTable.setData(firstSections);
            }
        }
 
    }
    
    // add slide text, if this is not the last game
    if (games.indexOf(game) !== (games.length - 1)) {
        // not last game
        var footerView = Ti.UI.createView({
            height : 75,
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

        footerView.add(Ti.UI.createLabel({
            text : Alloy.Globals.PHRASES.scrollNextGame + ' ',
            top : 25,
            left : 10,
            font : Alloy.Globals.getFontCustom(16, 'Regular'),
            color : "#FFF"
        }));

        table.footerView = footerView;
    } else {
        if (isAndroid) {
            table.footerView = Ti.UI.createView({
                width : Ti.UI.FILL,
                backgroundColor : '#303030',
                height : 0.5
            });
        }
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

    if (isAndroid) {
        var swipeRefreshModule = require('com.rkam.swiperefreshlayout');

        swipeRefresh = swipeRefreshModule.createSwipeRefresh({
            view : view,
            height : Ti.UI.FILL,
            width : Ti.UI.FILL,
            id : 'swiper'
        });

        swipeRefresh.addEventListener('refreshing', function(e) {
            if (Alloy.Globals.checkConnection()) {
                pendingStandingsArray = [];
                setTimeout(function() {
                    indicator.openIndicator();
                    androidViews = [];

                    for (var view in $.showChallenge.getViews()) {
                        androidViews.push($.showChallenge.getViews()[view]);
                    }

                    getChallengeShow();
                }, 800);
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
                swipeRefresh.setRefreshing(false);
            }
        });
        view.add(table);
        $.showChallenge.addView(swipeRefresh);

    } else {
        view.add(table);
        $.showChallenge.addView(view);
    }
}

function endRefresher() {
    if (!isAndroid) {
        if ( typeof refresher !== 'undefined' && refresher !== null) {
            refresher.endRefreshing();
        }
    } else {
        if ( typeof swipeRefresh !== 'undefined' && swipeRefresh !== null) {
            swipeRefresh.setRefreshing(false);
        }
    }
}

function getChallengeShow() {
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onerror = function(e) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        Ti.API.info('FEL : ' + JSON.stringify(this.responseText));
        Ti.API.error('Bad Sever =>' + e.error);
        indicator.closeIndicator();
        endRefresher();
    };

    try {
        xhr.open('GET', Alloy.Globals.BETKAMPENCHALLENGESHOWURL + '?cid=' + args.cid + '&lang=' + Alloy.Globals.LOCALE);
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
                showResults(response);
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            }

            // custom to handle pull to refresh on android
            if (isAndroid && androidViews.length > 0) {
                // clear children
                for (var view in androidViews) {
                    $.showChallenge.removeView(androidViews[view]);
                }
            }
        } else {
            indicator.closeIndicator();
            endRefresher();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("Error =>" + this.response);
        }
    };

}

function showResults(challenge) {
    var isFirst = false;
    var isLast = false;
    var isFinished = false;
    var finishedGamesCount = 0;
    $.showChallenge.hide();

    for (var y in challenge.games) {
        // count all finished matches
        if (challenge.games[y].status === '2') {
            finishedGamesCount++;
        }
    }

    // get all participants for this challenge and store them for point counting
    var tmpType = null;
    var tmpGid = null;
    for (var player in challenge.values) {
        if (tmpType === null && tmpGid === null) {
            tmpType = challenge.values[player].game_type;
            tmpGid = challenge.values[player].gid;
        }

        if (challenge.values[player].game_type === tmpType && challenge.values[player].gid === tmpGid) {
            // only add participants once
            var tmpPlayer = {
                uid : challenge.values[player].uid,
                points : 0,
                playerName : challenge.values[player].name
            };
            pendingStandingsArray.push(tmpPlayer);
        }
    }

    if (finishedGamesCount === challenge.games.length) {
        // all matches are finished
        isFinished = true;
    }

    for (var y in challenge.games) {
        if (y === '0') {
            isFirst = true;
        } 

        if(y == (challenge.games.length - 1)) {
            isLast = true;
        }

        // create layout
        createLayout(challenge.games[y], challenge.values, challenge.games, challenge.current_standing, isFirst, isFinished, isLast);
        isFirst = false;
        isLast = false;
    }

    setTimeout(function() {
        indicator.closeIndicator();
        // show layout
        $.showChallenge.show();
    }, 400);
}

if (Alloy.Globals.checkConnection()) {
    if (OS_IOS) {
        indicator.openIndicator();
    }

    getChallengeShow();
} else {
    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
}
