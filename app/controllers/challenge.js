/* Functions */
var clickListener = function(e) {
    gameArray[e.row.id].gameValue[0] = e.row.value;
    gameArray[e.row.id].gameValue[1] = 0;

    var children = e.section;

    var labels = [];

    e.row.add(Ti.UI.createLabel({
        id : 'selected_' + e.row.id,
        text : fontawesome.icon('fa-check'),
        textAlign : "center",
        right : 10,
        color : Alloy.Globals.themeColor(),
        parent : e.row,
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

    if (validate()) {
        if (answer == 1) {
            //postAnswer(gameArray);
        } else if (matchOTD == 1) {
            Ti.API.info("Matchens mästare");
        } else if (Alloy.Globals.COUPON != null) {
            for (var p in modalPickersToHide) {
                modalPickersToHide[p].touchEnabled = false;
            }

            updateChallenge();
        } else {
            for (var p in modalPickersToHide) {
                modalPickersToHide[p].touchEnabled = false;
            }

            saveChallenge();
        }
    }
};

function createGameType(gameType, gameObject, i, gameArray, index) {
    var type = gameType.type;
    var viewHeight = 70;
    var fontSize = 16;

    var gameTypeView = Ti.UI.createTableViewRow({
        id : index,
        hasChild : false,
        width : Ti.UI.FILL,
        left : 0,
        className : 'gameTypeRow' + i,
        height : 65,
        value : i + 1,
        selectionStyle : 'none',
    });
    //get the corresponding text inside each button from the JSON file
    var text = 'N/A';
    
    if(typeof Alloy.Globals.PHRASES.gameTypes[type] !== 'undefined') {
        text = Alloy.Globals.PHRASES.gameTypes[type].buttonValues[i + 1];
    }

    //if the json says team1 or team2. get the actual team names
    if (text == "team1") {
        text = gameObject.attributes.team_1.team_name;
    } else if (text == "team2") {
        text = gameObject.attributes.team_2.team_name;
    }

    //if text is too long make text smaller so it fits more.
    if (text.lenght > 26) {
        text = text.substring(0, 23) + '...';
    }

    var optionLabel = Ti.UI.createLabel({
        text : text,
        left : 20,

        font : {
            fontSize : fontSize,
        },
        color : "#FFF",
    });

    gameTypeView.add(optionLabel);

    gameTypeView.addEventListener("click", clickListener);
    return gameTypeView;

    //function that loops through and resets the color on all views. then changes the one clicked to the new colorw
    function changeColors(e) {
        for (var i in buttonViews) {
            buttonViews[i].backgroundColor = "#303030";
            e.source.backgroundColor = "#6d6d6d";
        }
    }

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
        className : 'gameTypeRow' + i,
        height : 80,
        value : i + 1,
        layout : 'horizontal',
        selectionStyle : 'none',
    });
    
    var width;
    
    if(isAndroid) {
        width = Ti.Platform.displayCaps.platformWidth / 3;
    } else {
        width = gameTypeView.toImage().width / 3;
    }
    
    var optionOne = Ti.UI.createView({
       id : index,
       height : 80,
       width: width
    });
    
    optionOne.add(Ti.UI.createView({
        id : index,
        height : 60,
        width : 60,
        borderRadius : 30,
        borderWidth : 3,
        borderColor : '#FFF'
    }));
    
    optionOne.add(Ti.UI.createLabel({
        text : '1',
        id : index,
        color : '#FFF',
        font : Alloy.Globals.getFontCustom(20, 'Bold')
    }));
    
    var optionTwo = Ti.UI.createView({
       id : index,
       height : 80,
       width: width
    });
    
    optionTwo.add(Ti.UI.createView({
        id : index,
        height : 60,
        width : 60,
        borderRadius : 30,
        borderWidth : 3,
        borderColor : '#FFF'
    }));
    
    optionTwo.add(Ti.UI.createLabel({
        id : index,
        text : 'X',
        color : '#FFF',
        font : Alloy.Globals.getFontCustom(20, 'Bold')
    }));
    
    var optionThree = Ti.UI.createView({
       id : index,
       height : 80,
       width: width
    });
    
    optionThree.add(Ti.UI.createView({
        id : index,
        height : 60,
        width : 60,
        borderRadius : 30,
        borderWidth : 3,
        borderColor : '#FFF'
    }));
    
    optionThree.add(Ti.UI.createLabel({
        id : index,
        text : '2',
        color : '#FFF',
        font : Alloy.Globals.getFontCustom(20, 'Bold')
    }));
    
    // add event click listener for these to set option value
    
    optionOne.addEventListener('click', function(e) {
        if(isAndroid) {
            e.row = e.source;
        }
        
        gameArray[e.row.id].gameValue[0] = 1;
        gameArray[e.row.id].gameValue[1] = 0;
        optionTwo.children[0].backgroundColor = '#000'; 
        optionTwo.children[1].color = '#FFF';
        optionThree.children[0].backgroundColor = '#000'; 
        optionThree.children[1].color = '#FFF';
        optionOne.children[0].backgroundColor = '#D8D8D8'; 
        optionOne.children[1].color = '#000'; 

        if (validate()) {
            if (answer == 1) {
                //postAnswer(gameArray);
            } else if (matchOTD == 1) {
                Ti.API.info("Matchens mästare");
            } else if (Alloy.Globals.COUPON != null) {
                for (var p in modalPickersToHide) {
                    modalPickersToHide[p].touchEnabled = false;
                }

                updateChallenge();
            } else {
                for (var p in modalPickersToHide) {
                    modalPickersToHide[p].touchEnabled = false;
                }

                saveChallenge();
            }
        }
    });

    optionTwo.addEventListener('click', function(e) {
        if(isAndroid) {
            e.row = e.source;
        }
        
        gameArray[e.row.id].gameValue[0] = 2;
        gameArray[e.row.id].gameValue[1] = 0;
        optionTwo.children[0].backgroundColor = '#D8D8D8';
        optionTwo.children[1].color = '#000';
        optionThree.children[0].backgroundColor = '#000'; 
        optionThree.children[1].color = '#FFF'; 
        optionOne.children[0].backgroundColor = '#000'; 
        optionOne.children[1].color = '#FFF';
        
        if (validate()) {
            if (answer == 1) {
                //postAnswer(gameArray);
            } else if (matchOTD == 1) {
                Ti.API.info("Matchens mästare");
            } else if (Alloy.Globals.COUPON != null) {
                for (var p in modalPickersToHide) {
                    modalPickersToHide[p].touchEnabled = false;
                }

                updateChallenge();
            } else {
                for (var p in modalPickersToHide) {
                    modalPickersToHide[p].touchEnabled = false;
                }

                saveChallenge();
            }
        }
    });
    
    optionThree.addEventListener('click', function(e) {
        if(isAndroid) {
            e.row = e.source;
        }
        
        gameArray[e.row.id].gameValue[0] = 3;
        gameArray[e.row.id].gameValue[1] = 0;
        optionTwo.children[0].backgroundColor = '#000'; 
        optionTwo.children[1].color = '#FFF';
        optionThree.children[0].backgroundColor = '#D8D8D8';
        optionThree.children[1].color = '#000'; 
        optionOne.children[0].backgroundColor = '#000'; 
        optionOne.children[1].color = '#FFF'; 
        
        if (validate()) {
            if (answer == 1) {
                //postAnswer(gameArray);
            } else if (matchOTD == 1) {
                Ti.API.info("Matchens mästare");
            } else if (Alloy.Globals.COUPON != null) {
                for (var p in modalPickersToHide) {
                    modalPickersToHide[p].touchEnabled = false;
                }

                updateChallenge();
            } else {
                for (var p in modalPickersToHide) {
                    modalPickersToHide[p].touchEnabled = false;
                }

                saveChallenge();
            }
        }
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
        className : 'gameTypeRow' + i,
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
        if(Ti.Platform.displayCaps.platformWidth > 320 && !isAndroid) {
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

                            if (validate()) {
                                if (answer == 1) {
                                    Ti.API.info("svara");
                                    //postAnswer(gameArray);
                                } else if (matchOTD == 1) {
                                    Ti.API.info("MATCHENS MÄSTARE");
                                } else if (Alloy.Globals.COUPON != null) {
                                    for (var p in modalPickersToHide) {
                                        modalPickersToHide[p].touchEnabled = false;
                                    }

                                    updateChallenge();
                                } else {
                                    for (var p in modalPickersToHide) {
                                        modalPickersToHide[p].touchEnabled = false;
                                    }

                                    saveChallenge();
                                }
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
            ///SKAPA EN SELECT
            var
            visualPrefs;
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
                    //top : 30,
                    //left : 5,
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
            modalPickersToHide[gameType.type + count + gameID] = picker;

            picker.text = '-';
            //picker.text = '-';

            picker.self.addEventListener('change', function(e) {

                var id = e.source.id;
                var ind = id.indexOf("_");
                i = id.substring(0, ind);
                var d = id.indexOf("-");
                var gameID = id.substring(d + 1, id.length);
                var arrayIndex = id.substring(ind + 1, d);
                picker.value = modalPickersToHide[arrayIndex + gameID].value;
                gameArray[index].gameValue[i] = picker.value;
                if (gameType.number_of_values == 1) {
                    gameArray[index].gameValue[1] = 0;
                }

                if (validate()) {
                    if (answer == 1) {
                        Ti.API.info("svara");
                        //postAnswer(gameArray);
                    } else if (matchOTD == 1) {
                        Ti.API.info("matchens mästare");
                    } else if (Alloy.Globals.COUPON != null) {
                        for (var p in modalPickersToHide) {
                            modalPickersToHide[p].touchEnabled = false;
                        }

                        updateChallenge();
                    } else {
                        for (var p in modalPickersToHide) {
                            modalPickersToHide[p].touchEnabled = false;
                        }

                        saveChallenge();
                    }

                };
            });

            optionsView.add(picker);

            //pickers.push(picker);

        }

    }

    gameTypeView.add(logosView);
    gameTypeView.add(optionsView);
    return gameTypeView;
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

    submitButton = Alloy.Globals.createButtonView(Alloy.Globals.themeColor(), "#FFF", Alloy.Globals.PHRASES.respondTxt);

    submitButton.addEventListener("click", function(e) {
        if (validate()) {
            for (var p in modalPickersToHide) {
                modalPickersToHide[p].touchEnabled = false;
            }

            postAnswer(gameArray);
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.notAllValuesErrorTxt);
        }
    });

    submitView.add(submitButton);

    return submitView;
}

function createSubmitButtonMatchOTD() {
    var submitView = Titanium.UI.createTableViewRow({
        id : 'submitButton',
        hasChild : false,
        width : Ti.UI.FILL,
        left : 0,
        className : 'gameTypeRow',
        height : 90,
    });

    submitButton = Alloy.Globals.createButtonView(Alloy.Globals.themeColor(), "#FFF", Alloy.Globals.PHRASES.respondTxt);

    submitButton.addEventListener("click", function(e) {
        if (validate()) {
            for (var p in modalPickersToHide) {
                modalPickersToHide[p].touchEnabled = false;
            }

            postMatchOfTheDay();
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.notAllValuesErrorTxt);
        }
    });

    submitView.add(submitButton);
    return submitView;
}

function doOnError() {
    for (var p in modalPickersToHide) {
        modalPickersToHide[p].touchEnabled = true;
    }
}

function createBetAmountView() {
    var betAmountView = Ti.UI.createTableViewRow({
        id : 'betamount',
        hasChild : false,
        width : Ti.UI.FILL,
        left : 0,
        className : 'gameTypeRow',
        height : 75,
    });

    var coinsAmount = Ti.UI.createLabel({
        left : 20,
        text : bet_amount,
        color : "#FFF",
        font : {
            fontSize : 16,
            fontFamily : Alloy.Globals.getFont(),
        },
    });

    betAmountView.add(coinsAmount);
    return betAmountView;
}

function postMatchOfTheDay() {
    if (Alloy.Globals.checkConnection()) {
        indicator.openIndicator();
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            Ti.API.error('Bad Sever =>' + e.error);
            indicator.closeIndicator();

            if (JSON.parse(this.responseText).indexOf(Alloy.Globals.PHRASES.coinsInfoTxt.toLowerCase()) != -1) {
                // not enough coins
                // show dialog with "link" to the store
                var alertWindow = Titanium.UI.createAlertDialog({
                    title : Alloy.Globals.PHRASES.betbattleTxt,
                    message : JSON.parse(this.responseText),
                    buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.storeTxt]
                });

                alertWindow.addEventListener('click', function(e) {
                    switch (e.index) {
                    case 0:
                        alertWindow.hide();
                        break;
                    case 1:
                        var win = Alloy.createController('store').getView();

                        if (!isAndroid) {
                            Alloy.Globals.NAV.openWindow(win, {
                                animated : true
                            });
                        } else {
                            win.open({
                                fullScreen : true
                            });
                        }
                        alertWindow.hide();
                        break;
                    }
                });
                alertWindow.show();

            } else {
                // any other "bad request error"
                var errorText = "";
                try{
                    errorText = JSON.parse(this.responseText);
                    Alloy.Globals.showFeedbackDialog(errorText);
                } catch(e) {
                    //
                }
                
                if(errorText === "") {
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                }
            }
        };

        try {
            xhr.open('POST', Alloy.Globals.BETKAMPENPOSTMATCHOTDURL);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
            xhr.setTimeout(Alloy.Globals.TIMEOUT);

            // build the json string
            var param = '{"lang" : "' + Alloy.Globals.LOCALE + '", "bet_amount": "' + bet_amount + '", "gameID": "' + gameID + '", "gamevalue": {';

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
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            indicator.closeIndicator();
        }

        xhr.onload = function() {
            if (this.status == '200') {

                if (this.readyState == 4) {
                    indicator.closeIndicator();
                    var response = JSON.parse(this.responseText);
                    var answer = false;

                    if (response == 1) {
                        //Svarat på match of the day
                        Alloy.Globals.showToast(Alloy.Globals.PHRASES.matchOfTheDayMsg);
                        answer = true;
                    } else if (response == 2) {
                        Alloy.Globals.showToast(Alloy.Globals.PHRASES.alreadyPostedMatchOTD);
                        answer = true;
                    } else {
                        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                    }

                    if (answer) {
                        prevWin.close();
                        $.challengeWindow.close();

                        var args = {
                            gameID : gameID,
                        };
                        
                        // set status as answered
                        Ti.App.fireEvent('challengesViewRefresh');
                        var win = Alloy.createController('showMatchOTD', args).getView();

                        if (!isAndroid) {
                            Alloy.Globals.NAV.openWindow(win, {
                                animated : true
                            });
                        } else {
                            win.open({
                                fullScreen : true
                            });
                        }
                    }

                }
            } else {
                indicator.closeIndicator();
                Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
                Ti.API.error("Error =>" + this.response);
            }
        };
    } else {
        indicator.closeIndicator();
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }
}

function updateChallenge() {
    if (Alloy.Globals.checkConnection()) {
        indicator.openIndicator();
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("FEL : " + JSON.stringify(e));
            Ti.API.error('Bad Sever =>' + e.error);
            indicator.closeIndicator();
            doOnError();
        };

        try {
            xhr.open('POST', Alloy.Globals.BETKAMPENUPDATECHALLENGEURL);
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
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            indicator.closeIndicator();
            doOnError();
        }

        xhr.onload = function() {
            if (this.status == '200') {

                if (this.readyState == 4) {

                    var response = JSON.parse(this.responseText);
                    if (response == 1) {
                        Alloy.Globals.getCoupon(true, indicator);
                    } else if (response == 2) {
                        indicator.closeIndicator();
                        Alloy.Globals.showToast(Alloy.Globals.PHRASES.couponGameExistsMsg);
                    }

                }
            } else {
                indicator.closeIndicator();
                Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
                Ti.API.error("Error =>" + this.response);
                doOnError();
            }
        };
    } else {
        indicator.closeIndicator();
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        doOnError();
    }
}

function saveChallenge() {
    if (Alloy.Globals.checkConnection()) {
        var xhr = Titanium.Network.createHTTPClient();
        indicator.openIndicator();
        xhr.onerror = function(e) {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("FEL : " + JSON.stringify(e));
            Ti.API.error('Bad Sever =>' + e.error);
            doOnError();
        };

        try {
            xhr.open('POST', Alloy.Globals.BETKAMPENSAVECHALLENGEURL);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
            xhr.setTimeout(Alloy.Globals.TIMEOUT);

            // build the json string
            var param = '{"lang" : "' + Alloy.Globals.LOCALE + '", "betkampen_id":"' + Alloy.Globals.BETKAMPENUID + '", "gameID": "' + gameID + '", "gamevalue": {';

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
            doOnError();
        }

        xhr.onload = function() {
            if (this.status == '200') {

                if (this.readyState == 4) {

                    var response = JSON.parse(this.responseText);
                    if (response == 1) {
                        Alloy.Globals.getCoupon(true, indicator);
                    } else {
                        indicator.closeIndicator();
                        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                    }

                    // show dialog and if ok close window
                }
            } else {
                indicator.closeIndicator();
                Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
                Ti.API.error("Error =>" + this.response);
                doOnError();
            }
        };
    } else {
        indicator.closeIndicator();
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        doOnError();
    }
}

// post the challenge answer to server
function postAnswer(gameArray) {
    // check connection
    if (Alloy.Globals.checkConnection()) {
        indicator.openIndicator();
        submitButton.touchEnabled = false;
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            indicator.closeIndicator();
            submitButton.touchEnabled = true;

            if (JSON.parse(this.responseText).indexOf(Alloy.Globals.PHRASES.coinsInfoTxt.toLowerCase()) != -1) {
                // not enough coins
                // show dialog with "link" to the store
                var alertWindow = Titanium.UI.createAlertDialog({
                    title : Alloy.Globals.PHRASES.betbattleTxt,
                    message : JSON.parse(this.responseText),
                    buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.storeTxt]
                });

                alertWindow.addEventListener('click', function(e) {
                    switch (e.index) {
                    case 0:
                        alertWindow.hide();
                        break;
                    case 1:
                        var win = Alloy.createController('store').getView();

                        if (!isAndroid) {
                            Alloy.Globals.NAV.openWindow(win, {
                                animated : true
                            });
                        } else {
                            win.open({
                                fullScreen : true
                            });
                        }
                        alertWindow.hide();
                        break;
                    }
                });
                alertWindow.show();

            } else {
                // any other "bad request error"
                var errorText = "";
                try{
                    errorText = JSON.parse(this.responseText);
                    Alloy.Globals.showFeedbackDialog(errorText);
                } catch(e) {
                    //
                }
                
                if(errorText === "") {
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                }
            }
        };

        try {
            xhr.open('POST', Alloy.Globals.BETKAMPENANSWERURL);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
            xhr.setTimeout(Alloy.Globals.TIMEOUT);

            // build the json string
            var param;

            if (tournamentIndex === -1) {
                // for normal challenge
                param = '{"lang" : "' + Alloy.Globals.LOCALE + '", "cid":"' + challengeObject.attributes.id + '", "gamevalue": {';
            } else {
                // for tournament
                param = '{"lang" : "' + Alloy.Globals.LOCALE + '", "betkampen_id":"' + betkampenId + '", "tournament":"' + challengeObject.attributes.id + '", "round":"' + gameObjects[0].attributes.round_id + '", "league":"' + gameObjects[0].attributes.league_id + '", "gamevalue": {';
            }
            var arr = [];
            var count = 0;
            for (var i in gameArray) {
                // is array
                if (arr.indexOf(gameArray[i].game_id) == -1) {
                    count++;
                    arr.push(gameArray[i].game_id);
                }

                param += '"' + i + '": {"gameID" : "' + gameArray[i].game_id + '", ';
                param += '"gameType" : "' + gameArray[i].gameType + '", ';
                param += '"values": [';
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
                    param += ']}, ';
                } else {
                    // last one
                    param += ']}';
                }

            }

            param += '}}';
            
            xhr.send(param);
        } catch(e) {
            indicator.closeIndicator();
            submitButton.touchEnabled = true;
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        }

        xhr.onload = function() {
            if (this.status == '200') {
                indicator.closeIndicator();

                if (this.readyState == 4) {
                    var response = JSON.parse(this.responseText);
                    Alloy.Globals.showToast(response);

                    // change view
                    var arg = {
                        refresh : true
                    };
                    var obj = {
                        controller : 'challengesView',
                        arg : arg
                    };
                    
                    
                    Ti.App.fireEvent('app:updateView', obj);

                    for (var win in Alloy.Globals.WINDOWS) {
                        if (Alloy.Globals.WINDOWS[win].id === 'challenges_finished' || Alloy.Globals.WINDOWS[win].id === 'challenges_accept' || Alloy.Globals.WINDOWS[win].id === 'challenges_new') {
                            Ti.API.log("Släck -> " + Alloy.Globals.WINDOWS[win].id);
                            Alloy.Globals.WINDOWS[win].setOpacity(0);   
                        }      
                    }
                    
                    $.challengeWindow.setOpacity(0);
             
                    for (var win in Alloy.Globals.WINDOWS) {
                        if (Alloy.Globals.WINDOWS[win].id === 'challenges_finished' || Alloy.Globals.WINDOWS[win].id === 'challenges_accept' || Alloy.Globals.WINDOWS[win].id === 'challenges_new') {
                            Ti.API.log("Stäng -> " + Alloy.Globals.WINDOWS[win].id);
                            Alloy.Globals.WINDOWS[win].close();
                        }
                    }
                    
                    $.challengeWindow.close();

                } else {
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                    submitButton.touchEnabled = true;
                }
            } else {
                Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
                indicator.closeIndicator();
                submitButton.touchEnabled = true;
                Ti.API.error("Error =>" + this.response);
            }
        };
    } else {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        indicator.closeIndicator();
    }
}

// function to split array based on game id
function splitByGameId(arr) {
  return arr.reduce(function(memo, x) {
    if (!memo[x.game_id]) { memo[x.game_id] = []; }
    
    memo[x.game_id].push(x);
    return memo;
  }, {});
}

// validate
function validate() {
    
    // if there is several views and this ain't the last page
    if($.challenge.views.length > 1 && $.challenge.currentPage !== ($.challenge.views.length - 1)) {
        var badValueCount = 0;  
        
        // check if we can "auto change" view
        for (var i in gameArray) {
            // find the values for the correct game displayed in this view             
            if(gameArray[i].game_id === $.challenge.views[$.challenge.currentPage].id) {
                // check to see if the page need to change (if all values on that that page is selected)             
                for (var y in gameArray[i].gameValue) {                
                    if (gameArray[i].gameValue[y] === -1) {
                        // bad value found, we can't change page
                        badValueCount++;
                    }
                }
             
            }
        }
        
        if(badValueCount === 0) {
            // all values for this view have been selected
            $.challenge.scrollToView($.challenge.currentPage + 1);  
        }    
    }


    // keep this check separate to make sure that the first loop always runs
    for (var i in gameArray) {
        // check to see if values are set
        for (var y in gameArray[i].gameValue) {
            if (gameArray[i].gameValue[y] === -1) {
                return false;
            }
        }
    }
    return true;
}

// create the layout views
function createLayout(gameObject) {         
    view = Ti.UI.createView({
        height : Ti.UI.FILL,
        width : 'auto',
        layout : 'vertical',
        id : gameObject.attributes.game_id
        //showVerticalScrollIndicator : true,
    });

    var image = Ti.UI.createView({
        height : "15%",
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
        },
    });

    // fetch league name, if not set
    if (leagueName.length === 0) {
        for (var i in Alloy.Globals.LEAGUES) {
            if (Alloy.Globals.LEAGUES[i].id == gameObject.attributes.league_id) {
                leagueName = Alloy.Globals.LEAGUES[i].name;
                break;
            }
        }
    }

    var topMargin = 12;
    var fontSize = Alloy.Globals.getFontSize(2);

    if (teamNames == null) {
        var teamNames = gameObject.attributes.team_1.team_name + " - " + gameObject.attributes.team_2.team_name;
    }

    if (teamNames.length > 22) {
        fontSize = 18;
        topMargin = 16;
    }
    if (teamNames.length > 32) {
        fontSize = 16;
        topMargin = 20;
    }
    if (teamNames.length > 37) {
        if (gameObject.attributes.team_1.team_name.length > 17) {
            gameObject.attributes.team_1.team_name = gameObject.attributes.team_1.team_name.substring(0, 14) + '...';
        }

        if (gameObject.attributes.team_2.team_name.length > 17) {
            gameObject.attributes.team_2.team_name = gameObject.attributes.team_2.team_name.substring(0, 14) + '...';
        }

        teamNames = gameObject.attributes.team_1.team_name + " - " + gameObject.attributes.team_2.team_name;
    }

    image.add(Ti.UI.createLabel({
        top : 10,
        left : 20,
        font : Alloy.Globals.getFontCustom(fontSize, "Bold"),
        color : '#FFF',
        left : 20,
        text : teamNames + ' '
    }));

    image.add(Ti.UI.createLabel({
        left : 20,
        top : 3,
        font : {
            fontFamily : fontAwe
        },
        text : fontawesome.icon('fa-clock-o'),
        color : Alloy.Globals.themeColor()
    }));

    image.add(Ti.UI.createLabel({
        top : -17,
        left : 35,
        font : Alloy.Globals.getFontCustom(12, 'Regular'),
        color : Alloy.Globals.themeColor(),
        text : gameObject.attributes.game_date_string + '  ',
    }));

    view.add(image);
         
    function doRest(gameObject) {

        if (roundId === -1) {
            // tournament fix
            coinsToJoin = gameObjects[0].attributes.pot;
            
            if ( typeof args.push_cid !== 'undefined' && typeof bet_amount !== 'undefined') {
                coinsToJoin = bet_amount; 
            } else if ( typeof coinsToJoin === 'undefined' && typeof challengeObject.attributes.opponents !== 'undefined') {
                coinsToJoin = parseInt(challengeObject.attributes.potential_pot) / challengeObject.attributes.opponents.length;
            } 
        }

        ///*******Create Table View*******///
        var tableHeaderView = Ti.UI.createView({
            height : 0.1
        });
    
        if (!isAndroid) {
            table = Titanium.UI.createTableView({
                left : 0,
                headerView : tableHeaderView,
                footerView : tableFooterView,
                height : '85%',
                width : Ti.UI.FILL,
                backgroundColor : 'transparent',
                style : Ti.UI.iPhone.TableViewStyle.GROUPED,
                separatorInsets : {
                    left : 0,
                    right : 0
                },
                id : 'challengeTable',
                separatorColor : '#303030',
                separatorStyle : Titanium.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE
            });

            if (iOSVersion < 7) {
                table.separatorStyle = Titanium.UI.iPhone.TableViewSeparatorStyle.NONE;
                table.separatorColor = 'transparent';
            }

        } else {
            table = Titanium.UI.createTableView({
                width : Ti.UI.FILL,
                left : 0,
                height : '85%',
                separatorColor : '#303030',
                id : 'challengeTable'
            });
        }

        var sections = [];

        var fontawesome = require('lib/IconicFont').IconicFont({
            font : 'lib/FontAwesome'
        });
        var tableFooterView;
        var font = 'FontAwesome';

        if (isAndroid) {
            font = 'fontawesome-webfont';
        }

        if (gameObjects.indexOf(gameObject) == (gameObjects.length - 1)) {
            tableFooterView = Ti.UI.createView({
                height : 0.1
            });
        } else {
            tableFooterView = Ti.UI.createView({
                height : 75,
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
            var slide = Ti.UI.createLabel({
                left : 20,
                height : 'auto',
                text : Alloy.Globals.PHRASES.scrollNextGame + '  ',
                textAlign : "center",
                font : {
                    fontFamily : Alloy.Globals.getFont(),
                    fontSize : 16,
                },
                color : Alloy.Globals.themeColor()
            });

            tableFooterView.add(slide);
            table.footerView = tableFooterView;

        }

        ///*******Create game types******///
        var gametypes = gameObject.attributes.game_types;
            
        for (var y in gametypes) {
            // object to store game id and value
            var gameObj = new Object();
            gameObj.game_id = gameObject.attributes.game_id;
            gameObj.gameType = gametypes[y].type;
            var valueArray = new Array(-1, -1);
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
            
            var gameTypeLabelTxt = 'N/A';
            
            if(typeof Alloy.Globals.PHRASES.gameTypes[gametypes[y].type] !== 'undefined') {
                gameTypeLabelTxt = Alloy.Globals.PHRASES.gameTypes[gametypes[y].type].description + '  ';
            }

            var gameTypeLabel = Ti.UI.createLabel({
                text : gameTypeLabelTxt,
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

            var sectionIndexen = sections.length;

            if (!isAndroid) {
                sections[sectionIndexen] = Ti.UI.createTableViewSection({
                    id : gameObject.attributes.game_id + '' + y,
                    name : gametypes[y].type,
                    headerView : gameTypeHeaderView,
                    footerView : Ti.UI.createView({
                        height : 0.1
                    })
                });
            } else {
                sections[sectionIndexen] = Ti.UI.createTableViewSection({
                    id : gameObject.attributes.game_id + '' + y,
                    name : gametypes[y].type,
                    headerView : gameTypeHeaderView
                });
            }

            if (gametypes[y].option_type == "button") {
                if(gametypes[y].type === '1') {
                    sections[sectionIndexen].add(createGameTypeWinnerResult(gametypes[y], gameObject, i, gameArray, index));
                } else {
                    for (var i = 0; i < gametypes[y].options; i++) {
                        sections[sectionIndexen].add(createGameType(gametypes[y], gameObject, i, gameArray, index));   
                    }
                }
            } else if (gametypes[y].option_type == "select") {
                sections[sectionIndexen].add(createSelectGameType(gametypes[y], gameObject, i, gameArray, index));    
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

        if (gameObjects.indexOf(gameObject) == (gameObjects.length - 1)) {
            // last game
            if (answer == 1 || matchOTD == 1) {
                if (bet_amount > 0) {
                    var sectionIndex = sections.length;

                    var gameTypeHeaderView = Ti.UI.createView({
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

                    var gameTypeLabel = Ti.UI.createLabel({
                        text : Alloy.Globals.PHRASES.coinsToBetTxt,
                        left : 20,
                        font : Alloy.Globals.getFontCustom(18, "Bold"),
                        color : "#FFF"
                    });

                    var coinsAmountLabel = Ti.UI.createLabel({
                        text : bet_amount,
                        right : 20,
                        font : Alloy.Globals.getFontCustom(18, "Bold"),
                        color : "#FFF"
                    });
                    gameTypeHeaderView.add(gameTypeLabel);
                    gameTypeHeaderView.add(coinsAmountLabel);

                    if (!isAndroid) {
                        sections[sectionIndex] = Ti.UI.createTableViewSection({
                            headerView : gameTypeHeaderView,
                            footerView : Ti.UI.createView({
                                height : 0.1
                            })
                        });

                    } else {
                        sections[sectionIndex] = Ti.UI.createTableViewSection({
                            headerView : gameTypeHeaderView
                        });
                    }

                    //sections[sectionIndex].add(createBetAmountView());

                }

                if (!isAndroid) {
                    sections[sectionIndex + 1] = Ti.UI.createTableViewSection({
                        headerView : Ti.UI.createView({
                            height : 0.1
                        }),
                        footerView : Ti.UI.createView({
                            height : 10
                        })
                    });

                } else {
                    sections[sectionIndex + 1] = Ti.UI.createTableViewSection({});
                }

                if (answer == 1) {
                    sections[sectionIndex + 1].add(createSubmitButtonAnswer());
                }

                if (matchOTD == 1) {
                    if (bet_amount > 0) {
                        createBetAmountView();
                    }
                    sections[sectionIndex + 1].add(createSubmitButtonMatchOTD());
                }

            }

        }

        table.setData(sections);
        
        if(!isAndroid) {
            // Titanium 3.5.0 bug?
            $.challenge.addView(view);
        }
        
        view.add(table);
    }


    Alloy.Globals.performTimeout(doRest(gameObject));
    if(isAndroid) {
        $.challenge.addView(view);  
    }
}

/* Flow */
// used to create a new challenge
var view;
var args = arguments[0] || {};
// roundId will be -1 as long as we are not creating a new challenge
var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});
var table = null;
var context;
var iOSVersion;
var isAndroid = true;

if (OS_IOS) {
    isAndroid = false;
    iOSVersion = parseInt(Ti.Platform.version);
} 

var fontawesome = require('lib/IconicFont').IconicFont({
    font : 'lib/FontAwesome'
});

var fontAwe = 'FontAwesome';

if (isAndroid) {
    context = require('lib/Context');
    fontAwe = 'fontawesome-webfont';
}

function onOpen(evt) {
    if(isAndroid) {
        context.on('challengeActivity', this.activity);
    }
}

function onClose(evt) {
    if(isAndroid) {
        context.off('challengeActivity');
    }
}

var prevWin = args.win;

var roundId = -1;
if ( typeof args.round !== 'undefined') {
    roundId = args.round;
}
var groupName = '';
if ( typeof args.group !== 'undefined') {
    groupName = args.group;
}
var leagueName = '';
if ( typeof args.leagueName !== 'undefined') {
    leagueName = args.leagueName;
}

var gameID = -1;
if ( typeof args.gameID !== 'undefined') {
    gameID = args.gameID;
}

var teamNames = '';
if ( typeof args.teamNames !== 'undefined') {
    teamNames = args.teamNames;
}

var leagueId = -1;
if ( typeof args.leagueId !== 'undefined') {
    leagueId = args.leagueId;
}

var answer = -1;
if ( typeof args.answer !== 'undefined') {
    answer = args.answer;
}

var matchOTD = -1;
if ( typeof args.matchOTD !== 'undefined') {
    matchOTD = args.matchOTD;
}

var bet_amount = -1;
if ( typeof args.bet_amount !== 'undefined') {
    bet_amount = args.bet_amount;
}
// for posting answer on tournaments
var tournamentIndex = -1;
if ( typeof args.tournamentIndex !== 'undefined') {
    tournamentIndex = args.tournamentIndex;
}

var tournamentRound = -1;
if ( typeof args.tournamentRound !== 'undefined') {
    tournamentRound = args.tournamentRound;
}

var coinsToJoin = -1;
var index = -1;
var challengeObject = null;

var modalPickersToHide = [];

// answer challenge / tournament
if (roundId === -1) {
    if (tournamentIndex === -1) {
        // for challenges
        // index in array for challenge object
        index = Alloy.Globals.CHALLENGEINDEX;
        // get specific object
        challengeObject = Alloy.Globals.CHALLENGEOBJECTARRAY[0][index];
    } else {
        // for tournaments, get correct tournament object from the correct array
        challengeObject = Alloy.Globals.CHALLENGEOBJECTARRAY[3][tournamentIndex];
    }
}

if ( typeof args.push_cid !== 'undefined') {
    challengeObject = Alloy.createModel('challenge', {id :args.push_cid});
}

// array to store game object
var gameObjects = [];

// array to store all objects of the type game, with gameId and gameValue (for the json string)
var gameArray = [];

// needs to be global in this context
var submitButton;

// create menu label
var menuText = Alloy.Globals.PHRASES.createChallengeTxt;
if (roundId === -1) {
    menuText = Alloy.Globals.PHRASES.answerTxt;
} else if (matchOTD == 1) {
    menuText = Alloy.Globals.PHRASES.answerTxt;
}

if (isAndroid) {
    $.challenge.scrollType = 'vertical';
    $.challengeWindow.orientationModes = [Titanium.UI.PORTRAIT];

    $.challengeWindow.addEventListener('open', function() {
        Alloy.Globals.setAndroidCouponMenu($.challengeWindow.activity);

        $.challengeWindow.activity.actionBar.onHomeIconItemSelected = function() {
            $.challengeWindow.close();
            $.challengeWindow = null;
        };
        $.challengeWindow.activity.actionBar.displayHomeAsUp = true;
        $.challengeWindow.activity.actionBar.title = menuText;
    });
} else {
    $.challengeWindow.titleControl = Ti.UI.createLabel({
        text : menuText,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });
}

$.challengeWindow.addEventListener('close', function() {
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

// check connection
if (Alloy.Globals.checkConnection()) {
    if (!isAndroid) {
        indicator.openIndicator();
    }

    // Get games for challenge || new game
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onerror = function(e) {
        indicator.closeIndicator();
        Ti.API.error('Bad Sever =>' + e.error);
        
        var alertWindow = Titanium.UI.createAlertDialog({
            title : 'BetBattle',
            message : Alloy.Globals.PHRASES.commonErrorTxt,
            buttonNames : ['OK']
        });

        alertWindow.addEventListener('click', function(e) {
            switch (e.index) {
            case 0:
                alertWindow.hide();
                $.challengeWindow.close();
                break;
            }
        });
        alertWindow.show();
    };

    try {
        if (roundId === -1) {
            if (tournamentIndex === -1) {
                xhr.open('GET', Alloy.Globals.BETKAMPENGAMESURL + '/?uid=' + Alloy.Globals.BETKAMPENUID + '&cid=' + challengeObject.attributes.id + '&lang=' + Alloy.Globals.LOCALE);                          
            } else {
                xhr.open('GET', Alloy.Globals.BETKAMPENGETGAMESFORTOURNAMENT + '/?uid=' + Alloy.Globals.BETKAMPENUID + '&tid=' + challengeObject.attributes.id + '&round=' + challengeObject.attributes.round + '&lang=' + Alloy.Globals.LOCALE);
            }
        } else {
            xhr.open('GET', Alloy.Globals.BETKAMPENGETGAMESFORCHALLENGEURL + '/?uid=' + Alloy.Globals.BETKAMPENUID + '&gameID=' + gameID + '&lang=' + Alloy.Globals.LOCALE);
        }

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

                    var gameObject = Alloy.createModel('game', {
                        game_date : res.game_date,
                        game_date_string : res.game_date_string,
                        game_id : res.game_id,
                        game_type : res.game_type,
                        game_types : res.game_types,
                        league_id : res.league_id,
                        league_name : res.league_name,
                        round_id : res.round_id,
                        status : res.status,
                        team_1 : team_1,
                        team_2 : team_2,
                        pot : res.pot
                    });
                    // add to an array
                    gameObjects.push(gameObject);
                }

                // create the layout and check for coins
                Alloy.Globals.checkCoins();

                if (!isAndroid) {
                    // clear old children
                    $.challenge.removeAllChildren();

                    for (child in $.challenge.children) {
                        $.challenge.children[child] = null;
                    }
                }
               
                // create views for each gameObject
                for (var i = 0; i < gameObjects.length; i++) {
                    createLayout(gameObjects[i]);
                }
           
                indicator.closeIndicator();
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
