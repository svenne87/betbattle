function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function createGameType(gameType) {
        var viewHeight;
        viewHeight = "button" == gameType.option_type ? 20 * gameType.options + 40 : "80dp";
        var gameTypeView = Ti.UI.createView({
            width: Ti.UI.FILL,
            height: viewHeight,
            layout: "vertical"
        });
        var gameTypeDescription = Ti.UI.createLabel({
            text: "VIlket lag gör första målet?!",
            textAlign: "center",
            color: "#FFF",
            font: {
                fontSize: 18,
                fontFamily: "Impact"
            }
        });
        gameTypeView.add(gameTypeDescription);
        var optionsView = Ti.UI.createView({
            width: Ti.UI.FILL,
            layout: "vertical"
        });
        if ("button" == gameType.option_type) for (var i = 0; gameType.options > i; i++) {
            var buttonView = Ti.UI.createButton({
                title: "Hellos " + i,
                top: 5,
                width: 100,
                height: 20
            });
            optionsView.add(buttonView);
        } else if ("select" == gameType.option_type) for (var i = 0; gameType.options >= i; i++) ;
        gameTypeView.add(optionsView);
        $.challenge.add(gameTypeView);
    }
    function createChallengeAndChooseFriends(betkampenId, betAmount) {
        var param = '{"lang" : "' + Alloy.Globals.LOCALE + '", "betkampen_id":"' + betkampenId + '", "server_url":"' + Alloy.Globals.BETKAMPENURL + '", "round":"' + roundId + '", "bet_amount":"' + betAmount + '", "gamevalue": [{';
        for (var i in gameArray) if (void 0 === gameArray[i].gameValue.length) {
            param += '"' + gameArray[i].gameId + '":' + '"' + gameArray[i].gameValue;
            param += i != gameArray.length - 1 ? '", ' : '"';
        } else {
            param += '"' + gameArray[i].gameId + '": [';
            for (var x in gameArray[i].gameValue) {
                param += '"' + gameArray[i].gameValue[x];
                param += x != gameArray[i].gameValue.length - 1 ? '", ' : '"';
            }
            param += i != gameArray.length - 1 ? "], " : "]";
        }
        param += "}]";
        var arg = {
            param: param
        };
        var win = Alloy.createController("groupSelect", arg).getView();
        Alloy.Globals.WINDOWS.push(win);
        Alloy.Globals.NAV.openWindow(win, {
            animated: true
        });
    }
    function postAnswer(betkampenId, cid, betAmount) {
        if (Alloy.Globals.checkConnection()) {
            var xhr = Titanium.Network.createHTTPClient();
            xhr.onerror = function(e) {
                indicator.closeIndicator();
                submitButton.touchEnabled = true;
                if (-1 != JSON.parse(this.responseText).indexOf("coins")) {
                    var alertWindow = Titanium.UI.createAlertDialog({
                        title: Alloy.Globals.PHRASES.betbattleTxt,
                        message: JSON.parse(this.responseText),
                        buttonNames: [ Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.storeTxt ]
                    });
                    alertWindow.addEventListener("click", function(e) {
                        switch (e.index) {
                          case 0:
                            alertWindow.hide();
                            break;

                          case 1:
                            var win = Alloy.createController("store").getView();
                            Alloy.Globals.NAV.openWindow(win, {
                                animated: true
                            });
                            alertWindow.hide();
                        }
                    });
                    alertWindow.show();
                } else Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
                Ti.API.error("Bad Sever =>" + e.error);
            };
            try {
                xhr.open("POST", Alloy.Globals.BETKAMPENANSWERURL);
                xhr.setRequestHeader("content-type", "application/json");
                xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
                xhr.setTimeout(Alloy.Globals.TIMEOUT);
                var param;
                param = -1 === tournamentIndex ? '{"lang" : "' + Alloy.Globals.LOCALE + '", "betkampen_id":"' + betkampenId + '", "cid":"' + cid + '", "bet_amount":"' + betAmount + '", "gamevalue": [{' : '{"lang" : "' + Alloy.Globals.LOCALE + '", "betkampen_id":"' + betkampenId + '", "tournament":"' + challengeObject.attributes.id + '", "round":"' + gameObjects[0].attributes.round_id + '", "league":"' + gameObjects[0].attributes.league_id + '", "gamevalue": [{';
                for (var i in gameArray) if (void 0 === gameArray[i].gameValue.length) {
                    param += '"' + gameArray[i].gameId + '":' + '"' + gameArray[i].gameValue;
                    param += i != gameArray.length - 1 ? '", ' : '"';
                } else {
                    param += '"' + gameArray[i].gameId + '": [';
                    for (var x in gameArray[i].gameValue) {
                        param += '"' + gameArray[i].gameValue[x];
                        param += x != gameArray[i].gameValue.length - 1 ? '", ' : '"';
                    }
                    param += i != gameArray.length - 1 ? "], " : "]";
                }
                param += "}]}";
                Ti.API.log(param);
                xhr.send(param);
            } catch (e) {
                indicator.closeIndicator();
                submitButton.touchEnabled = true;
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            }
            xhr.onload = function() {
                if ("200" == this.status) {
                    indicator.closeIndicator();
                    if (4 == this.readyState) {
                        var response = JSON.parse(this.responseText);
                        var alertWindow = Titanium.UI.createAlertDialog({
                            title: Alloy.Globals.PHRASES.betbattleTxt,
                            message: response,
                            buttonNames: [ Alloy.Globals.PHRASES.okConfirmTxt ]
                        });
                        alertWindow.addEventListener("click", function() {
                            submitButton.touchEnabled = true;
                            var arg = {
                                refresh: true
                            };
                            var obj = {
                                controller: "challengesView",
                                arg: arg
                            };
                            Ti.App.fireEvent("app:updateView", obj);
                            $.challengeWindow.close();
                        });
                        alertWindow.show();
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
    function createBorderView() {
        $.challenge.add(Titanium.UI.createView({
            height: "1dp",
            width: "100%",
            backgroundColor: "#6d6d6d"
        }));
    }
    function createGameScoreView(game) {
        var topFixAndroid = 1;
        var heightFix = 40;
        var gameView = Titanium.UI.createView({
            "class": game.attributes.game_id,
            height: "80dp",
            width: "auto",
            backgroundColor: "#303030"
        });
        $.challenge.add(Titanium.UI.createLabel({
            height: heightFix,
            top: 10,
            width: "100%",
            textAlign: "center",
            backgroundColor: "#303030",
            color: "#FFF",
            text: game.attributes.team_1.team_name + " - " + game.attributes.team_2.team_name,
            font: {
                fontFamily: Alloy.Globals.getFont(),
                fontSize: Alloy.Globals.getFontSize(2)
            }
        }));
        var selectViewOne = Titanium.UI.createView({
            height: 60,
            width: 60,
            left: "5%",
            borderRadius: 30,
            borderWidth: 4,
            borderColor: "#FFF",
            backgroundColor: "#303030"
        });
        selectViewOne.add(Titanium.UI.createLabel({
            height: "auto",
            top: topFixAndroid,
            color: "#FFF",
            font: {
                fontFamily: Alloy.Globals.getFont(),
                fontSize: Alloy.Globals.getFontSize(3)
            },
            text: "1"
        }));
        var selectViewTwo = Titanium.UI.createView({
            height: 60,
            width: 60,
            right: "5%",
            borderRadius: 30,
            borderWidth: 4,
            borderColor: "#FFF",
            backgroundColor: "#303030"
        });
        selectViewTwo.add(Titanium.UI.createLabel({
            height: "auto",
            top: topFixAndroid,
            color: "#FFF",
            font: {
                fontFamily: Alloy.Globals.getFont(),
                fontSize: Alloy.Globals.getFontSize(3)
            },
            text: "2"
        }));
        var selectViewThree = Titanium.UI.createView({
            height: 60,
            width: 60,
            left: "42%",
            borderRadius: 30,
            borderWidth: 4,
            borderColor: "#FFF",
            backgroundColor: "#303030"
        });
        selectViewThree.add(Titanium.UI.createLabel({
            height: "auto",
            top: topFixAndroid,
            color: "#FFF",
            font: {
                fontFamily: Alloy.Globals.getFont(),
                fontSize: Alloy.Globals.getFontSize(3)
            },
            text: "X"
        }));
        var gameObj = new Object();
        gameObj.gameId = game.attributes.game_id;
        gameObj.gameValue = -1;
        gameArray.push(gameObj);
        var index = gameArray.indexOf(gameObj);
        selectViewOne.addEventListener("click", function() {
            selectViewTwo.backgroundColor = "#303030";
            selectViewThree.backgroundColor = "#303030";
            selectViewOne.backgroundColor = "#6d6d6d";
            gameArray[index].gameValue = 1;
        });
        selectViewTwo.addEventListener("click", function() {
            selectViewOne.backgroundColor = "#303030";
            selectViewThree.backgroundColor = "#303030";
            selectViewTwo.backgroundColor = "#6d6d6d";
            gameArray[index].gameValue = 2;
        });
        selectViewThree.addEventListener("click", function() {
            selectViewOne.backgroundColor = "#303030";
            selectViewTwo.backgroundColor = "#303030";
            selectViewThree.backgroundColor = "#6d6d6d";
            gameArray[index].gameValue = 3;
        });
        gameView.add(selectViewOne);
        gameView.add(selectViewTwo);
        gameView.add(selectViewThree);
        $.challenge.add(gameView);
    }
    function createFirstGoalView(game) {
        var firstGoalView = Titanium.UI.createView({
            "class": game.attributes.game_id,
            height: "180dp",
            width: "100%",
            backgroundColor: "#303030"
        });
        $.challenge.add(Titanium.UI.createLabel({
            height: 40,
            width: "100%",
            top: 10,
            textAlign: "center",
            backgroundColor: "#303030",
            color: "#FFF",
            font: {
                fontFamily: Alloy.Globals.getFont(),
                fontSize: Alloy.Globals.getFontSize(2)
            },
            text: Alloy.Globals.PHRASES.firstGoalTxt
        }));
        var teamOneButton = Titanium.UI.createView({
            top: 10,
            height: 40,
            width: "80%",
            color: "#FFF",
            borderRadius: 2,
            backgroundColor: "#303030",
            borderColor: "#FFF",
            borderWidth: 2
        });
        teamOneButton.add(Titanium.UI.createLabel({
            color: "#FFF",
            font: {
                fontFamily: Alloy.Globals.getFont(),
                fontSize: Alloy.Globals.getFontSize(1)
            },
            text: game.attributes.team_1.team_name
        }));
        var teamTwoButton = Titanium.UI.createView({
            top: 110,
            height: 40,
            width: "80%",
            color: "#FFF",
            borderRadius: 2,
            backgroundColor: "#303030",
            borderColor: "#FFF",
            borderWidth: 2
        });
        teamTwoButton.add(Titanium.UI.createLabel({
            color: "#FFF",
            font: {
                fontFamily: Alloy.Globals.getFont(),
                fontSize: Alloy.Globals.getFontSize(1)
            },
            text: game.attributes.team_2.team_name
        }));
        var noTeamButton = Titanium.UI.createView({
            top: 60,
            height: 40,
            width: "80%",
            borderRadius: 2,
            color: "#FFF",
            backgroundColor: "#303030",
            borderColor: "#FFF",
            borderWidth: 2
        });
        noTeamButton.add(Titanium.UI.createLabel({
            color: "#FFF",
            font: {
                fontFamily: Alloy.Globals.getFont(),
                fontSize: Alloy.Globals.getFontSize(1)
            },
            text: Alloy.Globals.PHRASES.noGoalTxt
        }));
        var gameObj = new Object();
        gameObj.gameId = game.attributes.game_id;
        gameObj.gameValue = -1;
        gameArray.push(gameObj);
        var index = gameArray.indexOf(gameObj);
        teamOneButton.addEventListener("click", function() {
            gameArray[index].gameValue = 1;
            teamTwoButton.backgroundColor = "#303030";
            teamOneButton.backgroundColor = "#6d6d6d";
            noTeamButton.backgroundColor = "#303030";
        });
        teamTwoButton.addEventListener("click", function() {
            gameArray[index].gameValue = 2;
            teamOneButton.backgroundColor = "#303030";
            teamTwoButton.backgroundColor = "#6d6d6d";
            noTeamButton.backgroundColor = "#303030";
        });
        noTeamButton.addEventListener("click", function() {
            gameArray[index].gameValue = 3;
            teamOneButton.backgroundColor = "#303030";
            teamTwoButton.backgroundColor = "#303030";
            noTeamButton.backgroundColor = "#6d6d6d";
        });
        firstGoalView.add(teamOneButton);
        firstGoalView.add(teamTwoButton);
        firstGoalView.add(noTeamButton);
        $.challenge.add(firstGoalView);
    }
    function createRedCardsView(game) {
        var viewHeight = 60;
        var cardsView = Titanium.UI.createView({
            "class": game.attributes.game_id,
            height: viewHeight,
            width: "100%",
            backgroundColor: "#303030"
        });
        $.challenge.add(Titanium.UI.createLabel({
            height: 40,
            width: "100%",
            top: 10,
            opacity: .85,
            borderRadius: 3,
            color: "#FFF",
            textAlign: "center",
            font: {
                fontFamily: Alloy.Globals.getFont(),
                fontSize: Alloy.Globals.getFontSize(2)
            },
            text: Alloy.Globals.PHRASES.nrOfYellowCardsTxt
        }));
        var gameObj = new Object();
        gameObj.gameId = game.attributes.game_id;
        gameObj.gameValue = 0;
        gameArray.push(gameObj);
        var index = gameArray.indexOf(gameObj);
        var data = [];
        var i;
        var numberPicker;
        for (var i = 0; 15 >= i; i++) data.push(Titanium.UI.createPickerRow({
            title: "" + i,
            value: i
        }));
        var ModalPicker = require("lib/ModalPicker");
        var visualPrefs = {
            top: 5,
            opacity: .85,
            borderRadius: 3,
            backgroundColor: "#FFF",
            width: 140,
            height: 40,
            textAlign: "center"
        };
        var numberPicker = new ModalPicker(visualPrefs, data, Alloy.Globals.PHRASES.chooseConfirmBtnTxt, Alloy.Globals.PHRASES.closeBtnTxt);
        modalPickersToHide.push(numberPicker);
        numberPicker.text = "0";
        numberPicker.self.addEventListener("change", function() {
            gameArray[index].gameValue = numberPicker.value;
        });
        cardsView.add(numberPicker);
        $.challenge.add(cardsView);
    }
    function createResultView(title, game) {
        var viewHeight = 70;
        var resultView = Titanium.UI.createView({
            "class": game.attributes.game_id,
            height: viewHeight,
            width: "100%",
            backgroundColor: "#303030"
        });
        $.challenge.add(Titanium.UI.createLabel({
            height: 40,
            width: "100%",
            textAlign: "center",
            top: 10,
            backgroundColor: "#303030",
            color: "#FFF",
            font: {
                fontFamily: Alloy.Globals.getFont(),
                fontSize: Alloy.Globals.getFontSize(2)
            },
            text: title
        }));
        resultView.add(Titanium.UI.createLabel({
            top: 5,
            left: 5,
            width: "48%",
            height: "auto",
            backgroundColor: "#303030",
            color: "#FFF",
            font: {
                fontFamily: Alloy.Globals.getFont(),
                fontSize: Alloy.Globals.getFontSize(1)
            },
            text: game.attributes.team_1.team_name
        }));
        resultView.add(Titanium.UI.createLabel({
            top: 5,
            right: 5,
            height: "auto",
            width: "48%",
            textAlign: "right",
            backgroundColor: "#303030",
            color: "#FFF",
            font: {
                fontFamily: Alloy.Globals.getFont(),
                fontSize: Alloy.Globals.getFontSize(1)
            },
            text: game.attributes.team_2.team_name
        }));
        var gameObj = new Object();
        gameObj.gameId = game.attributes.game_id;
        var valueArray = new Array(0, 0);
        gameObj.gameValue = valueArray;
        gameArray.push(gameObj);
        var index = gameArray.indexOf(gameObj);
        var data = [];
        var i;
        var teamOnePicker;
        var teamTwoPicker;
        for (var i = 0; 15 >= i; i++) data.push(Titanium.UI.createPickerRow({
            title: "" + i,
            value: i
        }));
        var ModalPicker = require("lib/ModalPicker");
        var visualPrefsOne = {
            top: 30,
            left: 5,
            opacity: .85,
            borderRadius: 3,
            backgroundColor: "#FFF",
            width: 140,
            height: 40,
            textAlign: "center"
        };
        var teamOnePicker = new ModalPicker(visualPrefsOne, data, Alloy.Globals.PHRASES.chooseConfirmBtnTxt, Alloy.Globals.PHRASES.closeBtnTxt);
        modalPickersToHide.push(teamOnePicker);
        teamOnePicker.text = "0";
        teamOnePicker.self.addEventListener("change", function() {
            gameArray[index].gameValue[0] = teamOnePicker.value;
        });
        var visualPrefsTwo = {
            top: 30,
            right: 5,
            opacity: .85,
            borderRadius: 3,
            backgroundColor: "#FFF",
            width: 140,
            height: 40,
            textAlign: "center"
        };
        var teamTwoPicker = new ModalPicker(visualPrefsTwo, data, Alloy.Globals.PHRASES.chooseConfirmBtnTxt, Alloy.Globals.PHRASES.closeBtnTxt);
        modalPickersToHide.push(teamTwoPicker);
        teamTwoPicker.text = "0";
        teamTwoPicker.self.addEventListener("change", function() {
            gameArray[index].gameValue[1] = teamTwoPicker.value;
        });
        resultView.add(teamOnePicker);
        resultView.add(teamTwoPicker);
        $.challenge.add(resultView);
        $.challenge.add(Ti.UI.createView({
            layout: "vertical",
            height: 10,
            backgroundColor: "#303030",
            width: "100%"
        }));
    }
    function createBetCoinsView(coinsToJoin) {
        var coinsView = Titanium.UI.createView({
            height: 50,
            width: "100%",
            backgroundColor: "#303030"
        });
        coinsView.add(Titanium.UI.createLabel({
            height: 40,
            width: "100%",
            top: 5,
            backgroundColor: "#303030",
            color: "#FFF",
            textAlign: "center",
            font: {
                fontFamily: Alloy.Globals.getFont(),
                fontSize: Alloy.Globals.getFontSize(2)
            },
            text: coinsToJoin + " " + Alloy.Globals.PHRASES.betbattleTxt + " " + Alloy.Globals.PHRASES.coinsTxt
        }));
        $.challenge.add(coinsView);
    }
    function createBetCoinsChooseView() {
        var viewHeight = 60;
        var betView = Titanium.UI.createView({
            height: viewHeight,
            width: "100%",
            layout: "vertical",
            backgroundColor: "#303030"
        });
        betView.add(Titanium.UI.createLabel({
            height: 40,
            width: "100%",
            top: 10,
            backgroundColor: "#303030",
            color: "#FFF",
            textAlign: "center",
            font: {
                fontFamily: Alloy.Globals.getFont(),
                fontSize: Alloy.Globals.getFontSize(2)
            },
            text: Alloy.Globals.PHRASES.chooseCoinsBetTxt
        }));
        $.challenge.add(betView);
        var betArray = [ "20", "40", "60", "80", "100" ];
        var data = [];
        var i;
        var i;
        var betPicker;
        data.push(Titanium.UI.createPickerRow({
            title: Alloy.Globals.PHRASES.chooseConfirmBtnTxt,
            value: -1
        }));
        for (var i = 0; betArray.length > i; i++) data.push(Titanium.UI.createPickerRow({
            title: "" + betArray[i],
            value: betArray[i]
        }));
        var ModalPicker = require("lib/ModalPicker");
        var visualPrefs = {
            top: 0,
            opacity: .85,
            borderRadius: 3,
            backgroundColor: "#FFF",
            width: 140,
            height: 40,
            textAlign: "center"
        };
        var betPicker = new ModalPicker(visualPrefs, data, Alloy.Globals.PHRASES.chooseConfirmBtnTxt, Alloy.Globals.PHRASES.closeBtnTxt);
        modalPickersToHide.push(betPicker);
        betPicker.text = Alloy.Globals.PHRASES.chooseConfirmBtnTxt;
        betPicker.self.addEventListener("change", function() {
            coinsToJoin = betPicker.value;
        });
        $.challenge.add(betPicker);
        $.challenge.add(Ti.UI.createView({
            layout: "vertical",
            height: 10,
            backgroundColor: "#303030",
            width: "100%"
        }));
    }
    function createSubmitButtonView(buttonText, betkampenId, cid) {
        var height = 100;
        var top = 30;
        var submitView = Titanium.UI.createView({
            height: height,
            width: "100%",
            backgroundColor: "#303030"
        });
        submitButton = Titanium.UI.createButton({
            top: top,
            width: "70%",
            height: 40,
            color: "#FFF",
            backgroundColor: Alloy.Globals.themeColor(),
            borderRadius: 6,
            font: {
                fontFamily: Alloy.Globals.getFont(),
                fontSize: Alloy.Globals.getFontSize(2)
            },
            title: buttonText,
            backgroundImage: "none"
        });
        submitButton.addEventListener("click", function() {
            if (1 == validate()) if (-1 === roundId) {
                indicator.openIndicator();
                submitButton.touchEnabled = false;
                postAnswer(betkampenId, cid, coinsToJoin);
            } else Alloy.Globals.checkConnection() ? createChallengeAndChooseFriends(betkampenId, coinsToJoin) : Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt); else Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.notAllValuesErrorTxt);
        });
        submitView.add(submitButton);
        $.challenge.add(submitView);
    }
    function validate() {
        for (var i in gameArray) if (-1 === gameArray[i].gameValue) return false;
        if (-1 === coinsToJoin) return false;
        return true;
    }
    function createLayout() {
        function doRest() {
            if (-1 === roundId) {
                coinsToJoin = gameObjects[0].attributes.pot;
                "undefined" == typeof coinsToJoin && (coinsToJoin = parseInt(challengeObject.attributes.potential_pot) / challengeObject.attributes.opponents.length);
            }
            var gameTip = {
                options: 2,
                id: 1,
                option_type: "button",
                number_of_values: 1
            };
            createGameType(gameTip);
            createBorderView();
            -1 === roundId ? createBetCoinsView(coinsToJoin) : createBetCoinsChooseView();
            createBorderView();
            -1 === roundId ? createSubmitButtonView("Svara", Alloy.Globals.BETKAMPENUID, challengeObject.attributes.id) : createSubmitButtonView(Alloy.Globals.PHRASES.challengeBtnTxt, Alloy.Globals.BETKAMPENUID, -1);
        }
        var image = Ti.UI.createView({
            width: "100%",
            height: 70,
            backgroundImage: "/images/profileBG.jpg"
        });
        if (0 === leagueName.length) for (var i in Alloy.Globals.LEAGUES) if (Alloy.Globals.LEAGUES[i].id == gameObjects[0].attributes.league_id) {
            leagueName = Alloy.Globals.LEAGUES[i].name;
            break;
        }
        var fontSize = Alloy.Globals.getFontSize(3);
        teamNames.length > 20 && (fontSize = 28);
        image.add(Ti.UI.createLabel({
            top: 0,
            font: {
                fontFamily: Alloy.Globals.getFont(),
                fontSize: fontSize
            },
            color: "#FFF",
            width: "100%",
            opacity: .85,
            borderRadius: 3,
            textAlign: "center",
            text: teamNames
        }));
        $.challenge.add(image);
        if (-1 === roundId && null !== challengeObject) {
            var currentGroupName = null;
            "undefined" != typeof challengeObject.attributes.group.name ? currentGroupName = challengeObject.attributes.group.name : "undefined" != typeof challengeObject.attributes.group[0].name && (currentGroupName = challengeObject.attributes.group[0].name);
            if (null !== currentGroupName) {
                $.challenge.add(Ti.UI.createLabel({
                    top: 5,
                    width: "100%",
                    textAlign: "center",
                    backgroundColor: "#303030",
                    color: "#FFF",
                    text: Alloy.Globals.PHRASES.challengeWithGroupTxt + ":",
                    font: {
                        fontFamily: Alloy.Globals.getFont(),
                        fontSize: Alloy.Globals.getFontSize(2),
                        fontWeight: "bold"
                    }
                }));
                $.challenge.add(Ti.UI.createLabel({
                    top: 5,
                    width: "100%",
                    textAlign: "center",
                    backgroundColor: "#303030",
                    color: Alloy.Globals.themeColor(),
                    text: currentGroupName,
                    font: {
                        fontFamily: Alloy.Globals.getFont(),
                        fontSize: Alloy.Globals.getFontSize(2)
                    }
                }));
            }
        }
        for (var i in gameObjects) {
            Alloy.Globals.performTimeout(createBorderView());
            var gameType = parseInt(gameObjects[i].attributes.game_type);
            switch (gameType) {
              case 1:
                Alloy.Globals.performTimeout(createGameScoreView(gameObjects[i]));
                break;

              case 2:
                Alloy.Globals.performTimeout(createFirstGoalView(gameObjects[i]));
                break;

              case 3:
                Alloy.Globals.performTimeout(createResultView(Alloy.Globals.PHRASES.resultTxt, gameObjects[i]));
                break;

              case 4:
                Alloy.Globals.performTimeout(createRedCardsView(gameObjects[i]));
                break;

              case 5:
                Alloy.Globals.performTimeout(createResultView(Alloy.Globals.PHRASES.resultAfterFirstPeriodTxt, gameObjects[i]));
                break;

              case 6:
                Alloy.Globals.performTimeout(createResultView(Alloy.Globals.PHRASES.resultAfterSecondPeriodTxt, gameObjects[i]));
                break;

              case 7:
                Alloy.Globals.performTimeout(createResultView(Alloy.Globals.PHRASES.halfTimeResultTxt, gameObjects[i]));
            }
        }
        Alloy.Globals.performTimeout(doRest());
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "challenge";
    if (arguments[0]) {
        __processArg(arguments[0], "__parentSymbol");
        __processArg(arguments[0], "$model");
        __processArg(arguments[0], "__itemTemplate");
    }
    var $ = this;
    var exports = {};
    $.__views.challengeWindow = Ti.UI.createWindow({
        layout: "vertical",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        backgroundColor: "#303030",
        apiName: "Ti.UI.Window",
        classes: [ "container" ],
        id: "challengeWindow"
    });
    $.__views.challengeWindow && $.addTopLevelView($.__views.challengeWindow);
    $.__views.challenge = Ti.UI.createScrollView({
        layout: "vertical",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        contentHeight: Ti.UI.SIZE,
        contentWidth: Ti.UI.SIZE,
        backgroundColor: "#303030",
        showVerticalScrollIndicator: true,
        showHorizontalScrollIndicator: false,
        apiName: "Ti.UI.ScrollView",
        id: "challenge",
        classes: []
    });
    $.__views.challengeWindow.add($.__views.challenge);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var args = arguments[0] || {};
    var roundId = -1;
    "undefined" != typeof args.round && (roundId = args.round);
    var leagueName = "";
    "undefined" != typeof args.leagueName && (leagueName = args.leagueName);
    var teamNames = "";
    "undefined" != typeof args.teamNames && (teamNames = args.teamNames);
    var leagueId = -1;
    "undefined" != typeof args.leagueId && (leagueId = args.leagueId);
    var tournamentIndex = -1;
    "undefined" != typeof args.tournamentIndex && (tournamentIndex = args.tournamentIndex);
    var tournamentRound = -1;
    "undefined" != typeof args.tournamentRound && (tournamentRound = args.tournamentRound);
    var coinsToJoin = -1;
    var index = -1;
    var challengeObject = null;
    var modalPickersToHide = [];
    if (-1 === roundId) if (-1 === tournamentIndex) {
        index = Alloy.Globals.CHALLENGEINDEX;
        challengeObject = Alloy.Globals.CHALLENGEOBJECTARRAY[0][index];
    } else challengeObject = Alloy.Globals.CHALLENGEOBJECTARRAY[3][tournamentIndex];
    var gameObjects = [];
    var gameArray = [];
    var uie = require("lib/IndicatorWindow");
    var indicator = uie.createIndicatorWindow({
        top: 200,
        text: Alloy.Globals.PHRASES.loadingTxt
    });
    var submitButton;
    var menuText = Alloy.Globals.PHRASES.createChallengeTxt;
    -1 === roundId && (menuText = challengeObject.attributes.league[0].league_name);
    $.challengeWindow.addEventListener("close", function() {
        indicator.closeIndicator();
        for (picker in modalPickersToHide) modalPickersToHide[picker].close();
    });
    if (Alloy.Globals.checkConnection()) {
        indicator.openIndicator();
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            indicator.closeIndicator();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("Bad Sever =>" + e.error);
        };
        try {
            -1 === roundId ? -1 === tournamentIndex ? xhr.open("GET", Alloy.Globals.BETKAMPENGAMESURL + "/?uid=" + Alloy.Globals.BETKAMPENUID + "&cid=" + challengeObject.attributes.id + "&lang=" + Alloy.Globals.LOCALE) : xhr.open("GET", Alloy.Globals.BETKAMPENGETGAMESFORTOURNAMENT + "/?uid=" + Alloy.Globals.BETKAMPENUID + "&tid=" + challengeObject.attributes.id + "&round=" + challengeObject.attributes.round + "&lang=" + Alloy.Globals.LOCALE) : xhr.open("GET", Alloy.Globals.BETKAMPENGETGAMESFORCHALLENGEURL + "/?uid=" + Alloy.Globals.BETKAMPENUID + "&league=" + leagueId + "&round=" + roundId + "&lang=" + Alloy.Globals.LOCALE);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
            xhr.setTimeout(Alloy.Globals.TIMEOUT);
            xhr.send();
        } catch (e) {
            indicator.closeIndicator();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        }
        xhr.onload = function() {
            if ("200" == this.status) if (4 == this.readyState) {
                var response = JSON.parse(this.responseText);
                for (var i in response) {
                    var teamOneName = response[i].team_1.team_name;
                    teamOneName.length > 16 && (teamOneName = teamOneName.substring(0, 13) + "...");
                    var teamTwoName = response[i].team_2.team_name;
                    teamTwoName.length > 16 && (teamTwoName = teamTwoName.substring(0, 13) + "...");
                    var team_1 = {
                        team_id: response[i].team_1.team_id,
                        team_logo: response[i].team_1.team_logo,
                        team_name: teamOneName
                    };
                    var team_2 = {
                        team_id: response[i].team_2.team_id,
                        team_logo: response[i].team_2.team_logo,
                        team_name: teamTwoName
                    };
                    var gameObject = Alloy.createModel("game", {
                        game_date: response[i].game_date,
                        game_id: response[i].game_id,
                        game_type: response[i].game_type,
                        league_id: response[i].league_id,
                        league_name: response[i].league_name,
                        round_id: response[i].round_id,
                        status: response[i].status,
                        team_1: team_1,
                        team_2: team_2,
                        pot: response[i].pot
                    });
                    gameObjects.push(gameObject);
                }
                Alloy.Globals.checkCoins();
                indicator.closeIndicator();
                createLayout();
            } else {
                indicator.closeIndicator();
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            } else {
                indicator.closeIndicator();
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                Ti.API.error("Error =>" + this.response);
            }
        };
    } else Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;