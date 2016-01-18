var args = arguments[0] || {};
var context;
var match_id;
var headerScoreLabel;

if(args.match_id) {
	match_id = args.match_id;	
}

var wrapperView = null;
var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

var iOSVersion;
var isAndroid = true;

var imageErrorHandler = function(e) {
    e.image = '/images/no_pic.png';
};

var fontawesome = require('lib/IconicFont').IconicFont({
    font : 'lib/FontAwesome'
});

var font = 'fontawesome-webfont';

if (OS_IOS) {
    isAndroid = false;
    font = 'FontAwesome';
    iOSVersion = parseInt(Ti.Platform.version);

    $.previousMatchOTD.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.matchOTDPreviousBtn,
        font : Alloy.Globals.getFontCustom(16, "Bold"),
        color : '#FFF'
    });
} else {
    context = require('lib/Context');
    isAndroid = true;
    $.previousMatchOTD.orientationModes = [Titanium.UI.PORTRAIT];

    $.previousMatchOTD.addEventListener('open', function() {
        $.previousMatchOTD.activity.actionBar.onHomeIconItemSelected = function() {
            $.previousMatchOTD.close();
            $.previousMatchOTD = null;
        };
        $.previousMatchOTD.activity.actionBar.displayHomeAsUp = true;
        $.previousMatchOTD.activity.actionBar.title = Alloy.Globals.PHRASES.matchOTDPreviousBtn;
    });
}

function onOpen(evt) {
    if(isAndroid) {
        context.on('previousMatchOTDActivity', this.activity);
    }
}

function onClose(evt) {
    if(isAndroid) {
        context.off('previousMatchOTDActivity');
    }
}

function getPreviousMatchDay() {
    indicator.openIndicator();
    if (Alloy.Globals.checkConnection()) {
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            indicator.closeIndicator();
            Ti.API.error('Bad Sever =>' + JSON.stringify(e));
        };

        try {
            xhr.open('GET', Alloy.Globals.BETKAMPENPREVIOUSMATCHDAY + '?lang=' + Alloy.Globals.LOCALE + '&game_id=' + match_id);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
            xhr.setTimeout(Alloy.Globals.TIMEOUT);
            xhr.send();
        } catch(e) {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            indicator.closeIndicator();
        }

        xhr.onload = function() {
            if (this.status == '200') {
                if (this.readyState == 4) {
                    indicator.closeIndicator();
                    var resp = null;
                    try {
                        resp = JSON.parse(this.responseText);

                    } catch (e) {
                        resp = null;
                    }
                    
                    if(resp != 0) {
                        showPreviousMatch(resp);
                    } else {
                        $.previousMatchOTD.close();
                        Alloy.Globals.showToast(Alloy.Globals.PHRASES.noGamesTxt);
                    }
                }

            } else {
                indicator.closeIndicator();
                Ti.API.error("Error =>" + this.response);
            }
        };
    } else {
        indicator.closeIndicator();
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
    }

}

function createSectionsForTable(sectionText) {
    var sectionView = $.UI.create('View', {
        classes : ['winnersSection'],
        height : 70,
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
        },
    });

    sectionView.add(Ti.UI.createLabel({
        width : Ti.UI.FILL,
        left : 20,
        text : sectionText + ' ',
        font : Alloy.Globals.getFontCustom(18, "Regular"),
        color : '#FFF'
    }));

    if (!isAndroid) {
        return Ti.UI.createTableViewSection({
            headerView : sectionView,
            footerView : Ti.UI.createView({
                height : 0.1
            })
        });
    } else {
        return Ti.UI.createTableViewSection({
            headerView : sectionView
        });
    }

}

function constructChallengeRows(obj, index) {
    var row = Ti.UI.createTableViewRow({
        id : index,
        hasChild : false,
        width : Ti.UI.FILL,
        left : 0,
        className : 'winnerRow',
        height : 65,
        selectionStyle : 'none',
    });

    var imageLocation;

    if (obj.fbid !== null) {
        imageLocation = "https://graph.facebook.com/" + obj.fbid + "/picture?type=large";
    } else {
        // get betkampen image
        imageLocation = Alloy.Globals.BETKAMPENURL + '/profile_images/' + obj.uid + '.png';
    }

    var imageHolder = Ti.UI.createImageView({
        defaultImage : '/images/no_pic.png',
        image : imageLocation,
        left : 20,
        width : 30,
        height : 30,
        borderRadius : 15
    });

    // default if no image is found
    imageHolder.addEventListener('error', function(e) {
        imageHolder.image = '/images/no_pic.png';
    });

    row.add(imageHolder);

    var participantsValueLabel = Ti.UI.createLabel({
        left : 60,
        text : obj.name + ' ',
        font : Alloy.Globals.getFontCustom(16, "Regular"),
        color : '#FFF'
    });

    row.add(participantsValueLabel);
    return row;
}

function createGameType(type, values, game) {
    var gameValueWrapper = Ti.UI.createTableViewRow({
        width : Ti.UI.FILL,
        height : 70,
        backgroundColor : "transparent",
        layout : 'absolute',
    });

    for (var i in values) {
        if (values[i].game_type == type.type) {
            var correct = false;
            for (var m in game.result_values) {
                if (values[i].game_type == game.result_values[m].game_type) {
                    if (values[i].value_1 == game.result_values[m].value_1) {
                        if (values[i].value_2 == game.result_values[m].value_2) {
                            correct = true;
                        }
                    }
                }
            }

            if (type.option_type == "button") {
                var text = Alloy.Globals.PHRASES.gameTypes[type.type].buttonValues[values[i].value_1];

                if (text == "team1") {
                    text = game.team1_name;
                } else if (text == "team2") {
                    text = game.team2_name;
                }
            } else if (type.option_type = "select") {
                var text = "";
                if (type.number_of_values == 1) {
                    text = values[i].value_1;
                } else if (type.number_of_values == 2) {
                    text = values[i].value_1 + " - " + values[i].value_2;
                }
            }

            var color = "#000000";

            gameValueWrapper.setBackgroundColor(color);

            var gameValueLabel = Ti.UI.createLabel({
                text : text,
                font : Alloy.Globals.getFontCustom(18, "Regular"),
                color : "#FFF",
                left : 20,
            });
            gameValueWrapper.add(gameValueLabel);

            // check if correct answer and if the game has started
            if (correct) {
                var correctValueLabel = Ti.UI.createLabel({
                    font : {
                        fontFamily : font
                    },
                    text : fontawesome.icon('fa-check'),
                    left : gameValueLabel.toImage().width + 25,
                    color : '#00FF33',
                    height : Ti.UI.SIZE,
                    width : Ti.UI.SIZE
                });

                gameValueWrapper.add(correctValueLabel);
            }

        }
    }
    return gameValueWrapper;
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

    headerScoreLabel = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.giveTxt + " " + gameType.number_of_values + " " + Alloy.Globals.PHRASES.pointsTxt + '  ',
        top : 37,
        left : 20,
        font : Alloy.Globals.getFontCustom(12, "Regular"),
        color : Alloy.Globals.themeColor()
    });

    gameTypeView.add(headerScoreLabel);

    var resultText = '';
    var endTimeResultText = '';
    var ot = false;
    var pt = false;

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

        for (var i = 0; i < game.result_values.length; i++) {
            if (game.result_values[i].game_type === type && game.result_values[i].gid === game.game_id) {
                if (gameType.number_of_values === '1') {
                    if ( typeof Alloy.Globals.PHRASES.gameTypes[type].buttonValues !== 'undefined') {
                        // check for the gametype "draw"
                        resultText = Alloy.Globals.PHRASES.gameTypes[type].buttonValues[game.result_values[i].value_1];

                        //if the json says team1 or team2. get the actual team names
                        if (resultText === "team1") {
                            resultText = game.team1_name;
                        } else if (resultText === "team2") {
                            resultText = game.team2_name;
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
                defaultImage : '/images/no_pic.png',
                image : image,
                left : 10,
                height : 20,
                width : 20,
                borderRadius : 10,
            });

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
                        valueText = game.team1_name;
                    } else if (valueText === "team2") {
                        valueText = game.team2_name;
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

function constructTableView(obj) {
    var sections = [];

    var tableHeaderView = Ti.UI.createView({
        height : 0.1,
        width : Ti.UI.FILL,
        backgroundColor : 'transparent',
        layout : "absolute",
    });

    if (!isAndroid) {
        table = Titanium.UI.createTableView({
            left : 0,
            headerView : tableHeaderView,
            height : '100%',
            width : '100%',
            backgroundColor : 'transparent',
            style : Ti.UI.iPhone.TableViewStyle.GROUPED,
            separatorInsets : {
                left : 0,
                right : 0
            },
            id : 'winnersTable',
            separatorStyle : Titanium.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE,
            separatorColor : '#303030',
        });

        if (iOSVersion < 7) {
            table.separatorStyle = Titanium.UI.iPhone.TableViewSeparatorStyle.NONE;
            table.separatorColor = 'transparent';
        }

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
    }

    var teamHeader = Ti.UI.createView({
        height : 70,
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
        },
    });
    
    var teamNames = obj.match.team1_name + " - " + obj.match.team2_name;
    var fontResponsive = Alloy.Globals.getFontCustom(22, 'Regular');

    if (teamNames.length > 22) {
        fontResponsive = Alloy.Globals.getFontCustom(18, 'Regular');
    }
    if (teamNames.length > 32) {
        fontResponsive = Alloy.Globals.getFontCustom(18, 'Regular');
    }
    if (teamNames.length > 37) {
        if (obj.match.team1_name.length > 17) {
            obj.match.team1_name = obj.match.team1_name.substring(0, 14) + '...';
        }

        if (obj.match.team2_name.length > 17) {
            obj.match.team2_name = obj.match.team2_name.substring(0, 14) + '...';
        }

        teamNames = obj.match.team1_name + " - " + obj.match.team2_name;
    }


    var teamsLabel = Ti.UI.createLabel({
        height : 30,
        text : teamNames + ' ',
        font : fontResponsive,
        left : 20,
        color : "#FFF",
        top : 12
    });

    var dateLabel = Ti.UI.createLabel({
        height : 20,
        top : 40,
        left : 20,
        text : obj.match.game_date + ' ',
        color : Alloy.Globals.themeColor(),
        font : Alloy.Globals.getFont(14, "Regular"),
    });

    teamHeader.add(teamsLabel);
    teamHeader.add(dateLabel);

    if (!isAndroid) {
        sections[0] = Ti.UI.createTableViewSection({
            headerView : teamHeader,
            footerView : Ti.UI.createView({
                height : 0.1,
            })
        });
    } else {
        sections[0] = Ti.UI.createTableViewSection({
            headerView : teamHeader
        });
    }

    var bet_amount = obj.match.bet_amount;
    var extra_pot = obj.stats.extra_pot;
    var count = obj.stats.count;
    var winners_count = obj.winners.length;

    var total_pot = bet_amount * count;
    
    if( count > 1 && extra_pot) {
    	total_pot = (total_pot - 0) + (extra_pot - 0);
    }
    
    var win_amount = 0;
    if (winners_count > 0) {
        win_amount = Math.floor(total_pot / winners_count);
    }

    var participantRow = Ti.UI.createTableViewRow({
        height : 65,
        width : Ti.UI.FILL,
    });

    var winAmountRow = Ti.UI.createTableViewRow({
        height : 65,
        width : Ti.UI.FILL
    });

    var matchParticipantsLabel = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.matchOTDparticipants + ': ' + count + ' ',
        left : 20,
        color : "#FFF",
        font : Alloy.Globals.getFontCustom(16, "Regular"),
    });

    participantRow.add(matchParticipantsLabel);

    var matchWinnersPot = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.matchOTDwinAmount + ': ' + win_amount + ' ',
        left : 20,
        color : "#FFF",
        font : Alloy.Globals.getFontCustom(16, "Regular"),
    });

    winAmountRow.add(matchWinnersPot);

    sections[0].add(participantRow);
    sections[0].add(winAmountRow);

    sections[1] = createSectionsForTable(Alloy.Globals.PHRASES.matchOTDwinners);

    if (obj.winners.length > 0) {
        for (var i in obj.winners) {
            sections[1].add(constructChallengeRows(obj.winners[i], i));
        }

    } else {
        var emptyRow = Ti.UI.createTableViewRow({
            height : 65,
            width : Ti.UI.FILL,
        });

        emptyRow.add(Ti.UI.createLabel({
            text : Alloy.Globals.PHRASES.noneTxt + ' ' + Alloy.Globals.PHRASES.matchOTDwinners.toLowerCase() + ' ' + Alloy.Globals.PHRASES.foundTxt + ' ',
            left : 20,
            font : Alloy.Globals.getFontCustom(16, "Regular"),
            color : "#FFF"
        }));

        sections[1].add(emptyRow);
    }

    // create each game type
    var gametypes = obj.game_types;
    obj.match.result_values = obj.results;
    
    for (var y in gametypes) {
        // send in y and sections to add the data to the correct section. (y+2 will be that section, since section[1] is used)
        createGameType(gametypes[y], obj.match, obj.game_values, ((y - 0 ) + 2), sections);
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

    table.addEventListener('swipe', function(e) {
        if (e.direction !== 'up' && e.direction !== 'down') {
            Ti.API.log(e.direction);

            table.touchEnabled = false;
            Ti.App.fireEvent('app:slide');
            table.touchEnabled = true;
        }
    });

    $.previousMatchOTD.add(table);

}

function showPreviousMatch(obj) {

    constructTableView(obj);
}

getPreviousMatchDay();
