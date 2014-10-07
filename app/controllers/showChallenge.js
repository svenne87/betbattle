var args = arguments[0] || {};
var view;
var botView;
var groupName = args.group;

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

var iOSVersion;

if (OS_IOS) {
    iOSVersion = parseInt(Ti.Platform.version);
}

var fontawesome = require('lib/IconicFont').IconicFont({
    font : 'lib/FontAwesome'
});

var font = 'FontAwesome';

if (OS_ANDROID) {
    font = 'fontawesome-webfont';
}

var imageErrorHandler = function (e) {
    e.image = '/images/no_pic.png';  
};


function createGameType(gameType, game, values, index, sections) {
    var type = gameType.type;
    
    var gameTypeView = Ti.UI.createView({
        height : 75,
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
    if(gameTypeText.length > 20) {
        gameTypeText = gameTypeText.substring(0, 17) + '...';
    }
    
    gameTypeView.add(Ti.UI.createLabel({
        text : gameTypeText,
        left : 10,
        top : 24,
        height : Ti.UI.SIZE,
        width : Ti.UI.SIZE,
        font : Alloy.Globals.getFontCustom(18, 'Regular'),
        color : '#FFF'
    }));
    
    var resultText = '';
    
    for (var i = 0; i < game.result_values.length; i++) {
        if (game.result_values[i].game_type === type && game.result_values[i].gid === game.game_id) {
            if (gameType.number_of_values === '1') {
                // check for the gametype "draw"
                resultText = '(' + Alloy.Globals.PHRASES.gameTypes[type].buttonValues[game.result_values[i].value_1] + ')';
                
                //if the json says team1 or team2. get the actual team  names
                if (resultText === "(team1)") {
                    resultText = game.team_1.team_name;
                } else if (valueText === "(team2)") {
                    resultText = game.team_2.team_name;
                }
                
                if(resultText.length > 15) {
                    resultText = valueText.substring(0, 12) + '...';
                }
       
                // resultText will be undefined if it's gametype "draw" 
                if(typeof resultText === 'undefined') {
                    resultText = '(' + game.result_values[i].value_1 + ')';
                }            
            } else if (gameType.number_of_values === '2') {
                resultText = '(' + game.result_values[i].value_1 + " - " + game.result_values[i].value_2 + ')';
            }
        }
    }

    gameTypeView.add(Ti.UI.createLabel({
        text : resultText,
        right : 10,
        top : 24,
        height : Ti.UI.SIZE,
        width : Ti.UI.SIZE,
        font : Alloy.Globals.getFontCustom(18, 'Regular'),
        color : '#FFF'
    }));

    // create a section for each game type
    sections[index] = Ti.UI.createTableViewSection({
        headerView : gameTypeView,
        footerView : Ti.UI.createView({
            height : 0.1
        })
    });
    
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
            
            if(profileName.length > 18) {
                profileName = profileName.substring(0, 15) + '...';
            }

            var nameLabel = Ti.UI.createLabel({
                text : profileName,
                left : 40,
                height : Ti.UI.SIZE,
                width : Ti.UI.SIZE,
                font : Alloy.Globals.getFontCustom(16, 'Regular'),
                color : '#FFF'
            });

            // print out all the participants values
            var valueText = '';
            if (gameType.number_of_values === '1') {
                // check for the gametype "draw"
                valueText = Alloy.Globals.PHRASES.gameTypes[type].buttonValues[values[i].value_1];
                
                //if the json says team1 or team2. get the actual team names
                if (valueText === "team1") {
                    valueText = game.team_1.team_name;
                } else if (valueText === "team2") {
                    valueText = game.team_2.team_name;
                }
                
                if(valueText.length > 15) {
                    valueText = valueText.substring(0, 12) + '...';
                }
       
                // valueText will be undefined if it's gametype "draw" 
                if(typeof valueText === 'undefined') {
                    valueText = values[i].value_1;
                }            
            } else if (gameType.number_of_values === '2') {
                valueText = values[i].value_1 + " - " + values[i].value_2;
            }

            var valueLabel = Ti.UI.createLabel({
                text : valueText,
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
            if(correct) {
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

function createLayout(game, values, games, currentStanding, isFirst) {
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

    header.add(Ti.UI.createLabel({
        top : 10,
        left : 10,
        height : Ti.UI.SIZE,
        width : Ti.UI.SIZE,
        font : Alloy.Globals.getFontCustom(22, 'Regular'),
        color : '#FFF',
        text : teamNames
    }));

    if (teamNames.length > 30) {
        header.font = Alloy.Globals.getFontCustom(18, 'Regular');
    } else if (teamNames.length > 40) {
        header.font = Alloy.Globals.getFontCustom(16, 'Regular');
    }
    
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
        text : game.game_date_string
    }));
    
    header.add(Ti.UI.createView({
        top : 12,
        height : 0.5,
        backgroundColor : '#6d6d6d',
        width : Ti.UI.FILL
    }));

    view.add(header);

    var table;

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
            width : Ti.UI.FILL,
            height : '85%',
            backgroundColor : '#000',
            style : Ti.UI.iPhone.TableViewStyle.GROUPED,
            separatorInsets : {
                left : 0,
                right : 0
            },
            separatorStyle : separatorS,
            separatorColor : separatorColor
        });
    } else if (OS_ANDROID) {
        table = Titanium.UI.createTableView({
            width : Ti.UI.FILL,
            height : '85%',
            backgroundColor : '#000',
            separatorColor : '#6d6d6d',
        });
    }
    
    // remove empty space
    table.headerView = Ti.UI.createView({
        height : 0.1
    });

    var sections = [];

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

        standingsView.add(Ti.UI.createLabel({
            text : Alloy.Globals.PHRASES.scoreInfoTxt,
            left : 10,
            top : 24,
            height : Ti.UI.SIZE,
            width : Ti.UI.SIZE,
            font : Alloy.Globals.getFontCustom(18, 'Regular'),
            color : '#FFF'
        }));

        sections[0] = Ti.UI.createTableViewSection({
            headerView : standingsView,
            footerView : Ti.UI.createView({
                height : 0.1
            })
        });

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

            if (tmpObj.playerName.length > 25) {
                tmpObj.playerName = tmpObj.playerName.substring(0, 22) + '...';
            }

            var nameLabel = Ti.UI.createLabel({
                left : 40,
                height : Ti.UI.SIZE,
                width : Ti.UI.SIZE,
                font : Alloy.Globals.getFontCustom(16, 'Regular'),
                color : '#FFF',
                text : tmpObj.playerName
            });

            var scoreLabel = Ti.UI.createLabel({
                right : 10,
                height : Ti.UI.SIZE,
                width : Ti.UI.SIZE,
                font : Alloy.Globals.getFontCustom(16, 'Regular'),
                color : '#FFF',
                text : tmpObj.points
            });

            row.add(nameLabel);
            row.add(scoreLabel);

            sections[0].add(row);
        }
    }

    // create each game type
    var gametypes = game.game_types;
    for (var y in gametypes) {
        // send in y and sections to add the data to the correct section. (y+1 will be that section, since section[0] is used)
        createGameType(gametypes[y], game, values, ((y -0 )+ 1), sections);
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
            text : Alloy.Globals.PHRASES.scrollNextGame,
            top : 25,
            left : 10,
            font : Alloy.Globals.getFontCustom(16, 'Regular'),
            color : "#FFF"
        }));

        table.footerView = footerView;
    }

    table.setData(sections);
    view.add(table);
    $.showChallenge.addView(view);
}

function getChallengeShow() {
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onerror = function(e) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        Ti.API.info('FEL : ' + JSON.stringify(this.responseText));
        Ti.API.error('Bad Sever =>' + e.error);
        indicator.closeIndicator();
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

    }
    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {
                var response = JSON.parse(this.responseText);
                showResults(response);
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            }
        } else {
            indicator.closeIndicator();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("Error =>" + this.response);
        }
    };

}

function createBorderView() {
    $.showChallenge.add(Titanium.UI.createView({
        height : '1dp',
        width : '100%',
        backgroundColor : '#6d6d6d'
    }));
}

function showResults(challenge) {
    var isFirst = false;
    $.showChallenge.hide();

    for (var y in challenge.games) {
        if (y === '0') {
            isFirst = true;
        }

        // create layout
       createLayout(challenge.games[y], challenge.values, challenge.games, challenge.current_standing, isFirst);
       isFirst = false;
    }

    setTimeout(function() {
        indicator.closeIndicator();
        // show layout
        $.showChallenge.show();
    }, 400);

}

if (OS_ANDROID) {
    $.showChallengeWindow.scrollType = 'vertical';
    $.showChallengeWindow.orientationModes = [Titanium.UI.PORTRAIT];

    $.showChallengeWindow.addEventListener('open', function() {
        Alloy.Globals.setAndroidCouponMenu($.showChallengeWindow.activity);

        $.showChallengeWindow.activity.actionBar.onHomeIconItemSelected = function() {
            $.showChallengeWindow.close();
            $.showChallengeWindow = null;
        };
        $.showChallengeWindow.activity.actionBar.displayHomeAsUp = true;
        $.showChallengeWindow.activity.actionBar.title = Alloy.Globals.PHRASES.betbattleTxt;
        indicator.openIndicator();
    });
}
if (Alloy.Globals.checkConnection()) {
    if (OS_IOS) {
        indicator.openIndicator();
    }

    getChallengeShow();
} else {
    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
}


// TODO fix current result in matches (visa rätt score under match och visa bokc bara vid börjad match), fix standings, att game types visas i fel ordning (kan vara på ej rättade?)
