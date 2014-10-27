var args = arguments[0] || {};

var gameID = args.gameID;
var topView;
var botView;

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

var isOpen = false;
var isAndroid = true;
var iOSVersion;

if (OS_IOS) {
    isAndroid = false;
    iOSVersion = parseInt(Ti.Platform.version);
}

var sections = [];
var table = null;

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
                    text = game.team_1.team_name;
                } else if (text == "team2") {
                    text = game.team_2.team_name;
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
            if (correct) {
                color = "#303030";
            } else {
                color = "#000000";
            }
            gameValueWrapper.setBackgroundColor(color);

            var gameValueLabel = Ti.UI.createLabel({
                text : text,
                font : Alloy.Globals.getFontCustom(18, "Regular"),
                color : "#FFF",
                left : 20,
            });
            gameValueWrapper.add(gameValueLabel);
        }
    }
    return gameValueWrapper;
}

function createLayout(resp) {
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
            separatorColor : '#303030'
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
            separatorColor : '#6d6d6d',
            id : 'challengeTable'
        });
        
        table.footerView = Ti.UI.createView({
           height : 0.5,
           width : Ti.UI.FILL,
           backgroundColor : '#303030' 
        });
    }

    var matchHeader = Ti.UI.createView({
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

    var matchLabel = Ti.UI.createLabel({
        text : resp.game.team_1.team_name + " - " + resp.game.team_2.team_name,
        font : Alloy.Globals.getFontCustom(20, "Bold"),
        color : "#FFF",
        left : 20,
        top : 12,
    });

    var matchDateLabel = Ti.UI.createLabel({
        text : resp.game.game_date_string,
        font : Alloy.Globals.getFontCustom(14, "Regular"),
        color : Alloy.Globals.themeColor(),
        left : 20,
        top : 40,
    });

    matchHeader.add(matchLabel);
    matchHeader.add(matchDateLabel);

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

    var rowPot = Ti.UI.createTableViewRow({
        height : 65,
        width : Ti.UI.FILL,
    });

    var potSize = resp.stats.count * resp.stats.bet_amount;
    var potSizeLabel = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.showMatchOTDpot + potSize,
        font : Alloy.Globals.getFontCustom(18, "Regular"),
        color : "#FFF",
        left : 20,
    });

    rowPot.add(potSizeLabel);

    sections[0].add(rowUser);
    sections[0].add(rowPot);

    for (var i in resp.game.game_types) {
        var gameTypeViewDesc = Ti.UI.createView({
            height : 65,
            width : Ti.UI.FILL,
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

        var gameTypeDescription = Ti.UI.createLabel({
            text : Alloy.Globals.PHRASES.gameTypes[resp.game.game_types[i].type].description,
            left : 20,
            font : Alloy.Globals.getFontCustom(18, "Bold"),
            color : "#FFF",
        });

        gameTypeViewDesc.add(gameTypeDescription);
        var sectionIndex = sections.length;

        if (!isAndroid) {
            sections[sectionIndex] = Ti.UI.createTableViewSection({
                headerView : gameTypeViewDesc,
                footerView : Ti.UI.createView({
                    height : 0.1
                }),
                name : resp.game.game_types[i].type
            });
        } else {
            sections[sectionIndex] = Ti.UI.createTableViewSection({
                headerView : gameTypeViewDesc,
                name : resp.game.game_types[i].type
            });
        }
        
        sections[sectionIndex].add(createGameType(resp.game.game_types[i], resp.values, resp.game));
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

    $.showMatchOTD.add(view);
}

function getChallengeShow() {
    if (!isAndroid) {
        indicator.openIndicator();
    }

    //Ti.API.info("SKickar: "+ gameID);
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onerror = function(e) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        Ti.API.error('Bad Sever =>' + e.error);
        indicator.closeIndicator();
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
    }
    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {
                var response = JSON.parse(this.responseText);
                createLayout(response);
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            }
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("Error =>" + this.response);
        }
        indicator.closeIndicator();
    };
}

if (isAndroid) {
    $.showMatchOTD.orientationModes = [Titanium.UI.PORTRAIT];

    $.showMatchOTD.addEventListener('open', function() {
        Alloy.Globals.setAndroidCouponMenu($.showMatchOTD.activity);

        $.showMatchOTD.activity.actionBar.onHomeIconItemSelected = function() {
            $.showMatchOTD.close();
            $.showMatchOTD = null;
        };
        $.showMatchOTD.activity.actionBar.displayHomeAsUp = true;
        $.showMatchOTD.activity.actionBar.title = Alloy.Globals.PHRASES.matchTxt;
        Ti.API.log(" status " + isOpen);  // TODO
        if(!isOpen) {        
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

getChallengeShow();
