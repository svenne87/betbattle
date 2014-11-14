var args = arguments[0] || {};
var gameID = args.gameID;
var couponTable = args.table || null;
var couponWin = args.couponWin || null;
var gameObjects = [];
var gameArray = [];

var games = null;
if (Alloy.Globals.COUPON && Alloy.Globals.COUPON.games.length > 0) {
    games = Alloy.Globals.COUPON.games;
} else {
    Alloy.Globals.showToast("Fel i coupons....");
    $.editGame.close();
}

var amount_games = games.length;
var amount_deleted = 0;
var modalPickersToHide = [];

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

var iOSVersion;
var isAndroid = true;

var fontawesome = require('lib/IconicFont').IconicFont({
    font : 'lib/FontAwesome'
});

var fontAwe = 'fontawesome-webfont';

if (OS_IOS) {
    isAndroid = false;
    fontAwe = 'FontAwesome';
    iOSVersion = parseInt(Ti.Platform.version);
    $.editGame.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.editTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });
}

$.editGame.addEventListener('close', function() {
    indicator.closeIndicator();

    for (var p in modalPickersToHide) {
        modalPickersToHide[p].touchEnabled = true;
    }

    // hide modal pickers (ios)
    if (!isAndroid) {
        for (picker in modalPickersToHide) {
            modalPickersToHide[picker].close();
        }
    }
});

function removeCouponGame(gameID) {
    if (Alloy.Globals.checkConnection()) {
        indicator.openIndicator();
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            indicator.closeIndicator();
            Ti.API.error('Bad Sever =>' + e.error);
        };

        try {
            xhr.open('POST', Alloy.Globals.BETKAMPENDELETECOUPONGAMEURL + '?lang=' + Alloy.Globals.LOCALE + '&gameID=' + gameID + '&cid=' + Alloy.Globals.COUPON.id);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
            xhr.setTimeout(Alloy.Globals.TIMEOUT);

            xhr.send();
        } catch(e) {
            indicator.closeIndicator();
        }

        xhr.onload = function() {
            if (this.status == '200') {
                if (this.readyState == 4) {
                    var response = null;
                    response = JSON.parse(this.responseText);
                    Alloy.Globals.showToast(Alloy.Globals.PHRASES.couponGameRemoved);
                    amount_deleted++;

                    // make sure match is removed so that we can check the dates for matches in the array
                    for (var i in games) {
                        if (games[i].game_id == gameID) {
                            var index = Alloy.Globals.COUPON.games.indexOf(games[i]);
                            Alloy.Globals.COUPON.games.splice(index, 1);
                        }
                    }

                    // remove table row
                    var index = couponTable.getIndexByName(gameID);
                    couponTable.deleteRow(index);

                    if (amount_deleted == amount_games) {
                        couponWin.setOpacity(0);
                        couponWin.close();
                    }
                    Alloy.Globals.getCoupon();
                    $.editGame.setOpacity(0);
                    $.editGame.close();
                }
            } else {
                Ti.API.error("Error =>" + this.response);
            }
            indicator.closeIndicator();
        };
    }
}

function createGameType(gameType, gameObject, i, gameArray, index) {
    var type = gameType.type;
    var viewHeight = 75;
    var fontSize = 16;

    var gameTypeView = Ti.UI.createTableViewRow({
        width : Ti.UI.FILL,
        height : viewHeight,
        id : index,
        hasChild : false,
        width : Ti.UI.FILL,
        left : 0,
        className : 'gameTypeRow',
        height : 75,
        value : i + 1
    });

    //get the corresponding text inside each button from the JSON file
    var text = Alloy.Globals.PHRASES.gameTypes[type].buttonValues[i + 1];

    //if the json says team1 or team2. get the actual team  names
    if (text == "team1") {
        text = gameObject.attributes.team_1.team_name;
    } else if (text == "team2") {
        text = gameObject.attributes.team_2.team_name;
    }
    //if text is too long make text smaller so it fits more.

    var optionLabel = Ti.UI.createLabel({
        text : text,
        left : 20,

        font : {
            fontSize : fontSize,
        },
        color : "#FFF",
    });

    gameTypeView.add(optionLabel);

    var val = gameArray[index].gameValue[0];
    if (gameTypeView.value == val) {
        gameTypeView.add(Ti.UI.createLabel({
            id : 'selected_' + gameTypeView.id,
            text : fontawesome.icon('fa-check'),
            textAlign : "center",
            right : 10,
            color : Alloy.Globals.themeColor(),
            parent : gameTypeView,
            font : {
                fontSize : 30,
                fontFamily : fontAwe,
            },
            height : "auto",
            width : "auto",
        }));
    }

    gameTypeView.addEventListener("click", function(e) {
        gameArray[index].gameValue[0] = e.row.value;
        gameArray[index].gameValue[1] = 0;
        var children = table.data[e.row.id];
        var labels = [];

        e.row.add(Ti.UI.createLabel({
            id : 'selected_' + e.row.id,
            text : fontawesome.icon('fa-check'),
            textAlign : "center",
            right : 10,
            color : Alloy.Globals.themeColor(),
            parent : gameTypeView,
            font : {
                fontSize : 30,
                fontFamily : fontAwe,
            },
            height : "auto",
            width : "auto",
        }));

        for (var x in children.rows) {
            labels = children.rows[x].getChildren();
            if (children.rows[x].value != e.row.value) {
                for (var k in labels) {
                    var selected = "selected_" + e.row.id;
                    if (labels[k].id == selected) {
                        children.rows[x].remove(labels[k]);
                    }
                }
            }
        }
    });
    return gameTypeView;
}

function createGameTypeWinnerResult(gameType, gameObject, i, gameArray, index) {
    var type = gameType.type;
    var viewHeight = 70;
    var fontSize = 16;

    var gameTypeView = Ti.UI.createTableViewRow({
        id : index,
        hasChild : false,
        width : Ti.UI.FILL,
        left : 0,
        className : 'gameTypeRow',
        height : 80,
        value : i + 1,
        layout : 'horizontal',
        selectionStyle : 'none',
    });

    var optionOne = Ti.UI.createView({
        height : 80,
        width : gameTypeView.toImage().width / 3
    });

    optionOne.add(Ti.UI.createView({
        height : 60,
        width : 60,
        borderRadius : 30,
        borderWidth : 3,
        borderColor : '#FFF'
    }));

    optionOne.add(Ti.UI.createLabel({
        text : '1',
        color : '#FFF',
        font : Alloy.Globals.getFontCustom(20, 'Bold')
    }));

    var optionTwo = Ti.UI.createView({
        height : 80,
        width : gameTypeView.toImage().width / 3
    });

    optionTwo.add(Ti.UI.createView({
        height : 60,
        width : 60,
        borderRadius : 30,
        borderWidth : 3,
        borderColor : '#FFF'
    }));

    optionTwo.add(Ti.UI.createLabel({
        text : 'X',
        color : '#FFF',
        font : Alloy.Globals.getFontCustom(20, 'Bold')
    }));

    var optionThree = Ti.UI.createView({
        height : 80,
        width : gameTypeView.toImage().width / 3
    });

    optionThree.add(Ti.UI.createView({
        height : 60,
        width : 60,
        borderRadius : 30,
        borderWidth : 3,
        borderColor : '#FFF'
    }));

    optionThree.add(Ti.UI.createLabel({
        text : '2',
        color : '#FFF',
        font : Alloy.Globals.getFontCustom(20, 'Bold')
    }));

    if (gameArray[index].gameValue[0] === '1') {
        optionOne.children[0].backgroundColor = '#303030';
    } else if (gameArray[index].gameValue[0] === '2') {
        optionTwo.children[0].backgroundColor = '#303030';
    } else if (gameArray[index].gameValue[0] === '3') {
        optionThree.children[0].backgroundColor = '#303030';
    }

    optionOne.addEventListener('click', function(e) {
        gameArray[e.row.id].gameValue[0] = 1;
        gameArray[e.row.id].gameValue[1] = 0;
        optionTwo.children[0].backgroundColor = '#000';
        optionThree.children[0].backgroundColor = '#000';
        optionOne.children[0].backgroundColor = '#303030';
    });

    optionTwo.addEventListener('click', function(e) {
        gameArray[e.row.id].gameValue[0] = 2;
        gameArray[e.row.id].gameValue[1] = 0;
        optionTwo.children[0].backgroundColor = '#303030';
        optionThree.children[0].backgroundColor = '#000';
        optionOne.children[0].backgroundColor = '#000';
    });

    optionThree.addEventListener('click', function(e) {
        gameArray[e.row.id].gameValue[0] = 3;
        gameArray[e.row.id].gameValue[1] = 0;
        optionTwo.children[0].backgroundColor = '#000';
        optionThree.children[0].backgroundColor = '#303030';
        optionOne.children[0].backgroundColor = '#000';
    });

    gameTypeView.add(optionOne);
    gameTypeView.add(optionTwo);
    gameTypeView.add(optionThree);

    return gameTypeView;
}

function isLowerCase(str) {
    return str === str.toLowerCase();
}

function createSelectGameType(gameType, gameObject, i, gameArray, index) {
    var respHeight = 80;
    var respOptionsHeight = 40;
    var respTop = 20;

    if (gameType.options > 1) {
        respHeight = 140;
        respOptionsHeight = 70;
        respTop = 70;
    }

    var type = gameType.type;
    var viewHeight = 70;
    var fontSize = 16;

    var gameTypeView = Ti.UI.createTableViewRow({
        id : type,
        hasChild : false,
        width : Ti.UI.FILL,
        left : 0,
        className : 'gameTypeRow',
        height : respHeight,
        value : i + 1,
        touchEnabled : false,
        selectionStyle : 'none',
    });

    var layoutType = 'horizontal';
    if (gameType.options <= 1) {
        layoutType = 'absolute';
    }
    var optionsView = Ti.UI.createView({
        width : Ti.UI.FILL,
        top : respTop,
        height : respOptionsHeight,
        layout : layoutType
    });

    var logosView = Ti.UI.createView({
        width : Ti.UI.FILL,
        top : 10,
        height : 50,
        layout : 'horizontal',

    });
    var data = [];
    if (gameType.options > 1) {
        var logoWrapper = Ti.UI.createView({
            width : 50,
            height : 50,
            borderRadius : 25,
            backgroundColor : '#FFF',
            layout : 'absolute',
            left : ((Ti.Platform.displayCaps.platformWidth / 4) - 15)
        });
        
        var leftPos = 15;
        if(Ti.Platform.displayCaps.platformWidth > 320) {
            leftPos = 30;
        }

        var logoWrapper2 = Ti.UI.createView({
            width : 50,
            height : 50,
            borderRadius : 25,
            backgroundColor : '#FFF',
            layout : 'absolute',
            left : ((Ti.Platform.displayCaps.platformWidth / 4 + leftPos))
        });

        var team_logo = Ti.UI.createImageView({
            defaultImage : '/images/no_team.png',
            image : Alloy.Globals.BETKAMPENURL + gameObject.attributes.team_1.team_logo,
            width : 50,
            height : 50
        });

        // fix for images delivered from us/api
        if (!isLowerCase(gameObject.attributes.team_1.team_logo)) {
            team_logo.width = 30;
            team_logo.height = 30;
        }

        var team2_logo = Ti.UI.createImageView({
            defaultImage : '/images/no_team.png',
            image : Alloy.Globals.BETKAMPENURL + gameObject.attributes.team_2.team_logo,
            width : 50,
            height : 50
        });

        // fix for images delivered from us/api
        if (!isLowerCase(gameObject.attributes.team_2.team_logo)) {
            team2_logo.width = 30;
            team2_logo.height = 30;
        }

        team_logo.addEventListener('error', function(e) {
            team_logo.image = '/images/no_team.png';
        });

        team2_logo.addEventListener('error', function(e) {
            team2_logo.image = '/images/no_team.png';
        });

        logoWrapper.add(team_logo);
        logoWrapper2.add(team2_logo);

        logosView.add(logoWrapper);
        logosView.add(logoWrapper2);
    }

    if (isAndroid) {
        var pickerLabels = [];

        for (var i = 0; i < gameType.options; i++) {
            var pre_val = gameArray[index].gameValue[i];
            var pickerLabel;

            if (gameType.options > 1) {
                pickerLabel = Ti.UI.createLabel({
                    top : 20,
                    left : '14%',
                    backgroundColor : '#FFF',
                    borderRadius : 2,
                    width : 100,
                    height : 40,
                    text : '-',
                    textAlign : 'center',
                    index : i
                });
            } else {
                pickerLabel = Ti.UI.createLabel({
                    top : 0,
                    left : '35%',
                    backgroundColor : '#FFF',
                    borderRadius : 2,
                    width : 100,
                    height : 40,
                    text : '-',
                    textAlign : 'center',
                    index : i
                });
            }

            pickerLabels.push(pickerLabel);

            pickerLabel.addEventListener('click', function(event) {
                Alloy.createWidget('danielhanold.pickerWidget', {
                    id : 'sColumn' + event.source.index,
                    outerView : $.challenge,
                    hideNavBar : false,
                    type : 'single-column',
                    selectedValues : [1],
                    pickerValues : [{
                        1 : '0',
                        2 : '1',
                        3 : '2',
                        4 : '3',
                        5 : '4',
                        6 : '5',
                        7 : '6',
                        8 : '7',
                        9 : '8',
                        10 : '9',
                        11 : '10',
                        12 : '11',
                        13 : '12',
                        14 : '13',
                        15 : '14',
                        16 : '15'
                    }],
                    onDone : function(e) {
                        if (e.data) {
                            // set selected value
                            pickerLabels[event.source.index].setText(e.data[0].value);
                            gameArray[index].gameValue[event.source.index] = e.data[0].value;

                            if (gameType.number_of_values == 1) {
                                gameArray[index].gameValue[1] = 0;
                            }

                        }
                    },
                });
            });

            modalPickersToHide.push(pickerLabel);
            optionsView.add(pickerLabel);
        }

    } else {

        var pickers = [];
        // create 1-15 values
        for (var i = 0; i <= 15; i++) {
            data.push(Titanium.UI.createPickerRow({
                title : '' + i,
                value : i
            }));
        };
        for (var i = 0; i < gameType.options; i++) {
            var pre_val = gameArray[index].gameValue[i];
            var visualPrefs;
            var ModalPicker = require("lib/ModalPicker");
            if (layoutType == 'horizontal') {
                visualPrefs = {
                    //top : 30,
                    left : '10%',
                    id : "picker_" + i,
                    opacity : 0.85,
                    borderRadius : 3,
                    backgroundColor : '#FFF',
                    width : '36%',
                    height : 40,
                    textAlign : 'center'
                };
            } else if (layoutType == 'absolute') {
                visualPrefs = {
                    id : "picker_" + i,
                    opacity : 0.85,
                    borderRadius : 3,
                    backgroundColor : '#FFF',
                    width : 130,
                    height : 40,
                    textAlign : 'center'
                };
            }

            var picker = null;
            var count = i + 1;
            var gameID = gameObject.attributes.game_id;
            var id = i + "_" + gameType.type + count + "-" + gameID;
            picker = new ModalPicker(visualPrefs, data, Alloy.Globals.PHRASES.chooseConfirmBtnTxt, Alloy.Globals.PHRASES.closeBtnTxt, id);

            picker.text = pre_val;

            picker.self.addEventListener('change', function(e) {

                var id = e.source.id;
                var ind = id.indexOf("_");
                i = id.substring(0, ind);
                var d = id.indexOf("-");
                var gameID = id.substring(d + 1, id.length);
                var arrayIndex = id.substring(ind + 1, d);
                gameArray[index].gameValue[i] = e.source.value;
                if (gameType.number_of_values == 1) {
                    gameArray[index].gameValue[1] = 0;
                }
            });

            optionsView.add(picker);
            modalPickersToHide.push(picker);

        }

    }

    gameTypeView.add(logosView);
    gameTypeView.add(optionsView);
    return gameTypeView;
}

function validate() {
    for (var i in gameArray) {
        for (var y in gameArray[i].gameValue) {
            if (gameArray[i].gameValue[y] === -1) {
                return false;
            }
        }
    }
    return true;
}

function createLayout(gameObject) {
    view = Ti.UI.createView({
        height : Ti.UI.FILL,
        width : 'auto',
        layout : 'vertical',
    });

    var image = Ti.UI.createView({
        height : "15%",
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
        //backgroundImage : '/images/profileBG.jpg'
    });

    var fontSize = Alloy.Globals.getFontSize(2);
    var teamNames = gameObject.attributes.team_1.team_name + " - " + gameObject.attributes.team_2.team_name;

    if (teamNames.length > 22) {
        fontSize = 18;
    } else if (teamNames.length > 32) {
        fontSize = 16;
    }

    image.add(Ti.UI.createLabel({
        top : 30,
        left : 20,
        font : Alloy.Globals.getFontCustom(fontSize, "Bold"),
        color : '#FFF',
        width : '100%',
        opacity : 0.85,
        borderRadius : 3,
        text : teamNames
    }));

    view.add(image);

    function doRest(gameObject) {

        ///*******Create Table View*******///
        var sections = [];

        var tableHeaderView = Ti.UI.createView({
            height : 0.1
        });

        var tableFooterView = Ti.UI.createView({
            height : 0.1
        });

        if (!isAndroid) {
            table = Titanium.UI.createTableView({
                left : 0,
                headerView : tableHeaderView,
                footerView : tableFooterView,
                height : '75%',
                width : '100%',
                backgroundColor : 'transparent',
                style : Ti.UI.iPhone.TableViewStyle.GROUPED,
                separatorInsets : {
                    left : 0,
                    right : 0
                },
                id : 'challengeTable',
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
                height : '75%',
                separatorColor : '#303030',
                id : 'challengeTable'
            });
        }

        ///*******Create game types******///
        var gametypes = gameObject.attributes.game_types;
        for (var y in gametypes) {

            var gameObj = new Object();
            gameObj.game_id = gameObject.attributes.game_id;
            gameObj.gameType = gametypes[y].type;

            for (var i in gameObject.attributes.values) {
                var value = gameObject.attributes.values[i];
                if (value.game_type == gametypes[y].type) {
                    var valueArray = new Array(value.value_1, value.value_2);
                }
            }

            gameObj.gameValue = valueArray;
            gameArray.push(gameObj);
            var index = gameArray.indexOf(gameObj);

            var gameTypeHeaderView = Ti.UI.createView({
                height : 65,
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

            var gameTypeLabel = Ti.UI.createLabel({
                text : Alloy.Globals.PHRASES.gameTypes[gametypes[y].type].description + " ",
                top : 10,
                left : 20,
                font : Alloy.Globals.getFontCustom(18, "Bold"),
                color : "#FFF"
            });
            gameTypeHeaderView.add(gameTypeLabel);

            var gameTypeScoreLabel = Ti.UI.createLabel({
                text : Alloy.Globals.PHRASES.giveTxt + " " + gametypes[y].number_of_values + " " + Alloy.Globals.PHRASES.pointsTxt + '  ',
                top : 37,
                left : 20,
                font : Alloy.Globals.getFontCustom(12, "Regular"),
                color : Alloy.Globals.themeColor()
            });

            gameTypeHeaderView.add(gameTypeScoreLabel);

            if (!isAndroid) {
                sections[y] = Ti.UI.createTableViewSection({
                    headerView : gameTypeHeaderView,
                    footerView : Ti.UI.createView({
                        height : 0.1,
                    }),
                    name : gametypes[y].type
                });
            } else {
                sections[y] = Ti.UI.createTableViewSection({
                    headerView : gameTypeHeaderView,
                    name : gametypes[y].type
                });
            }

            if (gametypes[y].option_type == "button") {
                if (gametypes[y].type === '1') {
                    sections[y].add(createGameTypeWinnerResult(gametypes[y], gameObject, i, gameArray, index));
                } else {
                    for (var i = 0; i < gametypes[y].options; i++) {
                        sections[y].add(createGameType(gametypes[y], gameObject, i, gameArray, index));
                    }
                }
            } else if (gametypes[y].option_type == "select") {
                sections[y].add(createSelectGameType(gametypes[y], gameObject, i, gameArray, index));
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

        var sectionIndex = sections.length;

        if (!isAndroid) {
            sections[sectionIndex + 1] = Ti.UI.createTableViewSection({
                headerView : Ti.UI.createView({
                    height : 0.1,
                }),
                footerView : Ti.UI.createView({
                    height : 10,
                })
            });
        } else {
            sections[sectionIndex + 1] = Ti.UI.createTableViewSection({
                footerView : Ti.UI.createView({
                    height : 10,
                })
            });
        }

        sections[sectionIndex + 1].add(createSubmitButtonAnswer());
        sections[sectionIndex + 1].add(createRemoveCouponBtn());
        table.setData(sections);

        view.add(table);
    }


    Alloy.Globals.performTimeout(doRest(gameObject));
    $.editGame.add(view);
    indicator.closeIndicator();
}

function createBorderView() {
    view.add(Titanium.UI.createView({
        height : '1dp',
        width : '100%',
        backgroundColor : '#303030'
    }));
}

function createSubmitButtonAnswer() {
    var submitView = Titanium.UI.createTableViewRow({
        id : 'submitButton',
        hasChild : false,
        width : Ti.UI.FILL,
        left : 0,
        className : 'gameTypeRow',
        height : 90,
    });

    submitButton = Alloy.Globals.createButtonView(Alloy.Globals.themeColor(), "#FFF", Alloy.Globals.PHRASES.saveTxt);

    submitButton.addEventListener("click", function(e) {
        if (validate()) {
            for (var p in modalPickersToHide) {
                modalPickersToHide[p].touchEnabled = false;
            }

            updateCouponGame();
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.notAllValuesErrorTxt);
        }
    });

    submitView.add(submitButton);

    return submitView;
}

function createRemoveCouponBtn() {
    // if we want to remove the match from coupon
    if (couponTable) {

        var submitView = Titanium.UI.createTableViewRow({
            id : 'submitButton',
            hasChild : false,
            width : Ti.UI.FILL,
            left : 0,
            className : 'gameTypeRow',
            height : 90,
        });

        var removeBtn = Alloy.Globals.createButtonView('#d50f25', '#FFF', Alloy.Globals.PHRASES.deleteTxt);

        // remove game from coupon
        removeBtn.addEventListener('click', function() {
            var msg = Alloy.Globals.PHRASES.couponGameRemoveConfirm;
            if (games.length === '1') {
                msg = Alloy.Globals.PHRASES.couponGameRemoveFinalConfirm;
            }
            var alertWindow = Titanium.UI.createAlertDialog({
                title : Alloy.Globals.PHRASES.betbattleTxt,
                message : msg,
                buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.abortBtnTxt]
            });

            alertWindow.addEventListener("click", function(d) {
                alertWindow.hide();
                if (d.index == 0) {
                    removeCouponGame(gameID);
                }
            });
            alertWindow.show();
        });

        submitView.add(removeBtn);
        return submitView;
    }
}

function updateCouponGame() {
    if (Alloy.Globals.checkConnection()) {
        indicator.openIndicator();

        // Get game to edit
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            indicator.closeIndicator();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error('Bad Sever =>' + e.error);
        };

        try {
            xhr.open('POST', Alloy.Globals.BETKAMPENSAVEEDITURL);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
            xhr.setTimeout(Alloy.Globals.TIMEOUT);

            // build the json string
            var param = '{"lang" : "' + Alloy.Globals.LOCALE + '", "cid":"' + Alloy.Globals.COUPON.id + '", "gameID": "' + gameID + '", "gamevalue": {';

            for (var i in gameArray) {
                // is array
                param += '"' + gameArray[i].gameType + '": [';
                for (var x in gameArray[i].gameValue) {
                    param += '"' + gameArray[i].gameValue[x];
                    if (x != (gameArray[i].gameValue.length - 1)) {
                        param += '", ';
                    } else {
                        // last one
                        param += '"';
                    }
                }
                if (i != (gameArray.length - 1)) {
                    param += '], ';
                } else {
                    // last one
                    param += ']';
                }

            }
            param += '}}';
            xhr.send(param);
        } catch(e) {
            indicator.closeIndicator();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        }
        xhr.onload = function() {
            if (this.status == '200') {
                if (this.readyState == 4) {
                    response = JSON.parse(this.responseText);
                    if (response == 1) {
                        if (OS_ANDROID) {
                            var delToast = Ti.UI.createNotification({
                                duration : Ti.UI.NOTIFICATION_DURATION_LONG,
                                message : Alloy.Globals.PHRASES.couponEditedGameFeedback
                            });
                            delToast.show();
                        } else {
                            indWin = Titanium.UI.createWindow();

                            //  view
                            var indView = Titanium.UI.createView({
                                top : '80%',
                                height : 30,
                                width : '80%',
                                backgroundColor : '#000',
                                opacity : 0.9
                            });

                            indWin.add(indView);

                            // message
                            var message = Titanium.UI.createLabel({
                                text : Alloy.Globals.PHRASES.couponEditedGameFeedback,
                                color : '#fff',
                                width : 'auto',
                                height : 'auto',
                                textAlign : 'center',
                                font : {
                                    fontSize : 12,
                                    fontWeight : 'bold'
                                }
                            });

                            indView.add(message);
                            indWin.open();

                            var interval = interval ? interval : 1500;
                            setTimeout(function() {
                                indWin.close({
                                    opacity : 0,
                                    duration : 1000
                                });
                            }, interval);
                        }
                        indicator.closeIndicator();
                        $.editGame.close();
                    }
                } else {
                    indicator.closeIndicator();
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                }

            } else {
                indicator.closeIndicator();
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                Ti.API.error("Error =>" + this.response);
            }
        };

    } else {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }
}

function getGame() {
    if (Alloy.Globals.checkConnection()) {
        indicator.openIndicator();

        // Get game to edit
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            indicator.closeIndicator();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error('Bad Sever =>' + e.error);
        };

        try {
            xhr.open('GET', Alloy.Globals.BETKAMPENGAMETOEDITURL + '/?gid=' + gameID + '&cid=' + Alloy.Globals.COUPON.id + '&lang=' + Alloy.Globals.LOCALE);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
            xhr.setTimeout(Alloy.Globals.TIMEOUT);

            xhr.send();
        } catch(e) {
            indicator.closeIndicator();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        }
        xhr.onload = function() {
            if (this.status == '200') {
                if (this.readyState == 4) {
                    var response = JSON.parse(this.responseText);
                    // Simple work around, if response ain't an array, then simpy add it to one, to use the same code
                    if (response.length == null) {
                        var array = [];
                        array.push(response);
                        response = array;
                        array = null;
                    }
                    // This response contains one or several games for a challenge. And each game contains a  set of game types valid for that game
                    for (resp in response) {
                        var res = response[resp];
                        var teamOneName = res.team_1.team_name;

                        if (teamOneName.length > 16) {
                            teamOneName = teamOneName.substring(0, 13) + '...';
                        }

                        var teamTwoName = res.team_2.team_name;

                        if (teamTwoName.length > 16) {
                            teamTwoName = teamTwoName.substring(0, 13) + '...';
                        }

                        var team_1 = {
                            team_id : res.team_1.team_id,
                            team_logo : res.team_1.team_logo,
                            team_name : teamOneName
                        };
                        var team_2 = {
                            team_id : res.team_2.team_id,
                            team_logo : res.team_2.team_logo,
                            team_name : teamTwoName
                        };

                        var values = [];

                        for (var y in res.values) {
                            var value = {
                                game_type : res.values[y].game_type,
                                value_1 : res.values[y].value_1,
                                value_2 : res.values[y].value_2,
                            };
                            values.push(value);
                        }

                        var gameObject = Alloy.createModel('game', {
                            game_date : res.game_date,
                            game_id : res.game_id,
                            game_type : res.game_type,
                            game_types : res.game_types,
                            league_id : res.league_id,
                            league_name : res.league_name,
                            round_id : res.round_id,
                            status : res.status,
                            team_1 : team_1,
                            team_2 : team_2,
                            pot : res.pot,
                            values : values
                        });
                        // add to an array
                        gameObjects.push(gameObject);
                    }

                    // create views for each gameObject
                    for (var i = 0; i < gameObjects.length; i++) {
                        createLayout(gameObjects[i]);
                    }
                } else {
                    indicator.closeIndicator();
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                }

            } else {
                indicator.closeIndicator();
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                Ti.API.error("Error =>" + this.response);
            }
        };

    } else {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }
}

getGame();

if (isAndroid) {
    $.editGame.orientationModes = [Titanium.UI.PORTRAIT];

    $.editGame.addEventListener('open', function() {
        Alloy.Globals.setAndroidCouponMenu($.editGame.activity);

        $.editGame.activity.actionBar.onHomeIconItemSelected = function() {
            $.editGame.close();
            $.editGame = null;
        };
        $.editGame.activity.actionBar.displayHomeAsUp = true;
        $.editGame.activity.actionBar.title = Alloy.Globals.PHRASES.editTxt;
    });
}
