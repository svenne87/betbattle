/* Functions */

function createGameType(gameType, gameObject) {
	var type = gameType.type;
	var viewHeight = "100dp";

	var gameTypeView = Ti.UI.createView({
		width : Ti.UI.FILL,
		height : viewHeight,
		layout : "vertical",
	});

	var gameTypeDescription = Ti.UI.createLabel({
		text : Alloy.Globals.PHRASES.gameTypes[type].description,
		textAlign : "center",
		color : "#FFF",
		//height: "30%",
		font : {
			fontSize : 18,
			fontFamily : "Impact",
		}
	});

	gameTypeView.add(gameTypeDescription);

	// object to store game id and value
	var gameObj = new Object();
	gameObj.game_id = gameObject.attributes.game_id;
	gameObj.gameType = gameType.type;
	var valueArray = new Array(-1, -1);
	gameObj.gameValue = valueArray;
	gameArray.push(gameObj);
	var index = gameArray.indexOf(gameObj);

	if (gameType.option_type == "button") {
		var optionsView = Ti.UI.createView({
			//height: "70%",
			width : 285,
			layout : "horizontal",
		});

		var fontSize = 18;
		var buttonViews = [];
		for (var i = 0; i < gameType.options; i++) {

			//get the corresponding text inside each button from the JSON file
			var text = Alloy.Globals.PHRASES.gameTypes[type].buttonValues[i + 1];

			//if the json says team1 or team2. get the actual team  names
			if (text == "team1") {
				Ti.API.info("TEAM" + JSON.stringify(gameObject.attributes.team_1.team_name));
				text = gameObject.attributes.team_1.team_name;
			} else if (text == "team2") {
				text = gameObject.attributes.team_2.team_name;
			}
			//if text is too long make text smaller so it fits more.
			if (text.length > 9) {
				fontSize = 12;
			}
			var buttonView = Ti.UI.createButton({
				title : text,
				top : 5,
				borderColor : "#c5c5c5",
				borderWidth : 1,
				left : 5,
				value : i + 1,
				font : {
					fontSize : fontSize,
				},
				borderRadius : 5,
				width : 90,
				height : 40
			});

			buttonViews.push(buttonView);

		}
		//add click event to all buttonviews. this is done here so that we can change color correctly when clicking one
		for (var i in buttonViews) {
			buttonViews[i].addEventListener("click", function(e) {

				Ti.API.info("Clickade " + JSON.stringify(e));
				gameArray[index].gameValue[0] = e.source.value;
				gameArray[index].gameValue[1] = 0;
				changeColors(e);
				Ti.API.info("gameArray : " + JSON.stringify(gameArray));
				if (validate()) {
					if (answer == 1) {
						Ti.API.info("svara");
						//postAnswer(gameArray);
					} else if (matchOTD == 1) {
						Ti.API.info("Matchens mästare");
					} else if (Alloy.Globals.COUPON != null) {
						Ti.API.info("update");
						updateChallenge();
					} else {
						Ti.API.info("save");
						saveChallenge();
					}
				}
			});
			optionsView.add(buttonViews[i]);
		}

		//function that loops through and resets the color on all views. then changes the one clicked to the new colorw
		function changeColors(e) {
			for (var i in buttonViews) {
				buttonViews[i].backgroundColor = "#303030";
				e.source.backgroundColor = "#6d6d6d";
			}
		}

	} else if (gameType.option_type == "select") {
		var layoutType = 'horizontal';
		if (gameType.options <= 1) {
			layoutType = 'absolute';
		}
		var optionsView = Ti.UI.createView({
			//height: "70%",
			width : 250,
			layout : layoutType,
		});
		var data = [];

		if (OS_ANDROID) {
			var pickerLabels = [];

			for (var i = 0; i < gameType.options; i++) {
				var pickerLabel = Ti.UI.createLabel({
					top : 10,
					left : 15,
					backgroundColor : '#FFF',
					borderRadius : 2,
					width : 100,
					height : 40,
					text : '-',
					textAlign : 'center',
					index : i
				});

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
									gameArray[index].gameValues[1] = 0;
								}
								if (validate()) {
									if (answer == 1) {
										Ti.API.info("svara");
										//postAnswer(gameArray);
									} else if (matchOTD == 1) {
										Ti.API.info("MATCHENS MÄSTARE");
									} else if (Alloy.Globals.COUPON != null) {
										Ti.API.info("update");
										updateChallenge();
									} else {
										Ti.API.info("save");
										saveChallenge();
									}
								}
							}
						},
					});
				});
				optionsView.add(pickerLabel);
			}

		} else if (OS_IOS) {

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
						left : 5,
						id : "picker_" + i,
						opacity : 0.85,
						borderRadius : 3,
						backgroundColor : '#FFF',
						width : 120,
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
						width : 120,
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

				Ti.API.info("Y VÄRDE : " + i);
				picker.self.addEventListener('change', function(e) {

					var id = e.source.id;
					var ind = id.indexOf("_");
					i = id.substring(0, ind);
					var d = id.indexOf("-");
					var gameID = id.substring(d + 1, id.length);
					var arrayIndex = id.substring(ind + 1, d);
					Ti.API.info("INDEX : " + arrayIndex);
					Ti.API.info("ID : " + gameID);
					picker.value = modalPickersToHide[arrayIndex + gameID].value;

					gameArray[index].gameValue[i] = picker.value;
					if (gameType.number_of_values == 1) {
						gameArray[index].gameValue[1] = 0;
					}
					Ti.API.info("gameArray : " + JSON.stringify(gameArray));
					if (validate()) {
						if (answer == 1) {
							Ti.API.info("svara");
							//postAnswer(gameArray);
						} else if (matchOTD == 1) {
							Ti.API.info("matchens mästare");
						} else if (Alloy.Globals.COUPON != null) {

							Ti.API.info("update");
							updateChallenge();
						} else {
							Ti.API.info("save");
							saveChallenge();
						}

					};
				});

				optionsView.add(picker);

				//pickers.push(picker);

			}

		}

	}
	gameTypeView.add(optionsView);
	view.add(gameTypeView);
}

function createSubmitButtonAnswer() {
	var submitView = Titanium.UI.createView({
		height : 70,
		width : '100%',
		backgroundColor : '#303030'
	});

	submitButton = Titanium.UI.createButton({
		top : 10,
		width : '70%',
		height : 40,
		color : '#FFF',
		backgroundColor : Alloy.Globals.themeColor(),
		borderRadius : 6,
		font : {
			fontFamily : Alloy.Globals.getFont(),
			fontSize : Alloy.Globals.getFontSize(2)
		},
		title : Alloy.Globals.PHRASES.respondTxt,
		backgroundImage : 'none',
		touchEnabled : true,
	});

	submitButton.addEventListener("click", function(e) {
		Ti.API.info("post answer");
		if (validate()) {
			postAnswer(gameArray);
		} else {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.notAllValuesErrorTxt);
		}
	});

	submitView.add(submitButton);

	view.add(submitView);
}

function createSubmitButtonMatchOTD() {
	var submitView = Titanium.UI.createView({
		height : 70,
		width : '100%',
		backgroundColor : '#303030'
	});

	submitButton = Titanium.UI.createButton({
		top : 10,
		width : '70%',
		height : 40,
		color : '#FFF',
		backgroundColor : Alloy.Globals.themeColor(),
		borderRadius : 6,
		font : {
			fontFamily : Alloy.Globals.getFont(),
			fontSize : Alloy.Globals.getFontSize(2)
		},
		title : Alloy.Globals.PHRASES.respondTxt,
		backgroundImage : 'none',
		touchEnabled : true,
	});

	submitButton.addEventListener("click", function(e) {
		Ti.API.info("match of the day");
		if (validate()) {
			postMatchOfTheDay();
		} else {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.notAllValuesErrorTxt);
		}
	});

	submitView.add(submitButton);

	view.add(submitView);
}

<<<<<<< HEAD
function createBetAmountView(){
	var betAmountView = Ti.UI.createView({
		height: 70,
		width: '100%',
		backgroundColor : '#303030',
		layout: 'vertical'
	});
	
	var coinsLabel = Ti.UI.createLabel({
		text: "Coins att satsa",
		color:"#FFF",
		font:{
			fontSize: 18,
			fontFamily: "Impact"
		},
		textAlign: "center",
	});
	
	var coinsAmount = Ti.UI.createLabel({
		text: bet_amount,
		color:"#FFF",
		font:{
			fontSize:18,
			fontFamily:"Impact",
		},
		textAlign:"center",
	});
	
	betAmountView.add(coinsLabel);
	betAmountView.add(coinsAmount);
	view.add(betAmountView);
}

function postMatchOfTheDay(){
=======
function postMatchOfTheDay() {
>>>>>>> 5dc9ee3afade0ff21a443e99db9ebe1b9367114c
	if (Alloy.Globals.checkConnection()) {
		indicator.openIndicator();
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onerror = function(e) {
			Ti.API.error("FEL : " + JSON.stringify(e));
			Ti.API.error('Bad Sever =>' + e.error);
			indicator.closeIndicator();
		};

		try {
			xhr.open('POST', Alloy.Globals.BETKAMPENPOSTMATCHOTDURL);
			xhr.setRequestHeader("content-type", "application/json");
			xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
			xhr.setTimeout(Alloy.Globals.TIMEOUT);

			// build the json string
			var param = '{"lang" : "' + Alloy.Globals.LOCALE + '", "gameID": "' + gameID + '", "gamevalue": {';

			for (var i in gameArray) {
				Ti.API.info("skickar gameArray : " + JSON.stringify(gameArray[i]));
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

			Ti.API.info("JSON STRING : " + param);

			xhr.send(param);
		} catch(e) {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
			indicator.closeIndicator();
		}

		xhr.onload = function() {
			if (this.status == '200') {

				if (this.readyState == 4) {
					indicator.closeIndicator();
					Ti.API.info("RESPONSE : " + JSON.stringify(this.responseText));
					var response = JSON.parse(this.responseText);
					if (response == 1) {
						//Svarat på match of the day
						Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.matchOfTheDayMsg);
<<<<<<< HEAD
						$.challengeWindow.close();
					} else if(response == 2){
=======
					} else if (response == 2) {
>>>>>>> 5dc9ee3afade0ff21a443e99db9ebe1b9367114c
						Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.alreadyPostedMatchOTD);
						$.challengeWindow.close();
					} else {
						Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
						$.challengeWindow.close();
					}
					Ti.API.info("response: " + JSON.stringify(response));

				} else {
					Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
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

/* Used to show alert with info on coupon save/update */
function showCouponAlert() {
	// show dialog with options to add more matches or go to ticket
	var alertWindow = Titanium.UI.createAlertDialog({
		title : Alloy.Globals.PHRASES.betbattleTxt,
		message : Alloy.Globals.PHRASES.couponSavedMsg,
		buttonNames : [Alloy.Globals.PHRASES.addMoreMatchesTxt, Alloy.Globals.PHRASES.goToTicketTxt]
	});


	alertWindow.addEventListener('click', function(e) {
		switch (e.index) {
		case 0:
			alertWindow.hide();
			$.challengeWindow.close();
			break;
		case 1:
			alertWindow.hide();

			var window = Alloy.createController('showCoupon').getView();
			Alloy.Globals.CURRENTVIEW =  window;
			
			window.open({
				fullScreen : true
			});
			
			for (win in Alloy.Globals.WINDOWS) {
				if(win !== 0){
					Alloy.Globals.WINDOWS[win].close();
				}
			}
			break;
		}
	});
	alertWindow.show();
}

function updateChallenge() {
	if (Alloy.Globals.checkConnection()) {
		indicator.openIndicator();
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onerror = function(e) {
			Ti.API.error("FEL : " + JSON.stringify(e));
			Ti.API.error('Bad Sever =>' + e.error);
			indicator.closeIndicator();
		};

		try {
			xhr.open('POST', Alloy.Globals.BETKAMPENUPDATECHALLENGEURL);
			xhr.setRequestHeader("content-type", "application/json");
			xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
			xhr.setTimeout(Alloy.Globals.TIMEOUT);

			// build the json string
			var param = '{"lang" : "' + Alloy.Globals.LOCALE + '", "cid":"' + Alloy.Globals.COUPON.id + '", "gameID": "' + gameID + '", "gamevalue": {';

			for (var i in gameArray) {
				Ti.API.info("skickar gameArray : " + JSON.stringify(gameArray[i]));
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

			Ti.API.info("JSON STRING : " + param);

			xhr.send(param);
		} catch(e) {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
			indicator.closeIndicator();
		}

		xhr.onload = function() {
			if (this.status == '200') {

				if (this.readyState == 4) {
					indicator.closeIndicator();
					Ti.API.info("RESPONSE : " + JSON.stringify(this.responseText));
					var response = JSON.parse(this.responseText);
					if (response == 1) {
						Alloy.Globals.getCoupon();			
						//Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.couponSavedMsg);
						showCouponAlert();
					} else if (response == 2) {
						Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.couponGameExistsMsg);
					}
					Ti.API.info("response: " + JSON.stringify(response));

				} else {
					Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
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

function saveChallenge() {

	if (Alloy.Globals.checkConnection()) {
		var xhr = Titanium.Network.createHTTPClient();
		indicator.openIndicator();
		xhr.onerror = function(e) {
			Ti.API.error("FEL : " + JSON.stringify(e));
			Ti.API.error('Bad Sever =>' + e.error);
		};

		try {
			xhr.open('POST', Alloy.Globals.BETKAMPENSAVECHALLENGEURL);
			xhr.setRequestHeader("content-type", "application/json");
			xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
			xhr.setTimeout(Alloy.Globals.TIMEOUT);

			// build the json string
			var param = '{"lang" : "' + Alloy.Globals.LOCALE + '", "betkampen_id":"' + Alloy.Globals.BETKAMPENUID + '", "gameID": "' + gameID + '", "gamevalue": {';

			for (var i in gameArray) {
				Ti.API.info("skickar gameArray : " + JSON.stringify(gameArray[i]));
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

			Ti.API.info("JSON STRING : " + param);

			xhr.send(param);
		} catch(e) {
			indicator.closeIndicator();
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
		}

		xhr.onload = function() {
			if (this.status == '200') {

				if (this.readyState == 4) {
					indicator.closeIndicator();
					Ti.API.info("RESPONSE : " + JSON.stringify(this.responseText));
					var response = JSON.parse(this.responseText);
					if (response == 1) {
						Alloy.Globals.getCoupon();
						//Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.couponSavedMsg);
						showCouponAlert();
					} else {
						Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
						//submitButton.touchEnabled = true;
					}

					// show dialog and if ok close window
				} else {
					Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
					//submitButton.touchEnabled = true;
				}
			} else {
				indicator.closeIndicator();
				Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
				Ti.API.error("Error =>" + this.response);
				//submitButton.touchEnabled = true;
			}
		};
	} else {
		indicator.closeIndicator();
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
		//submitButton.touchEnabled = true;
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

			if (JSON.parse(this.responseText).indexOf('coins') != -1) {
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

						if (OS_IOS) {
							Alloy.Globals.NAV.openWindow(win, {
								animated : true
							});
						} else if (OS_ANDROID) {
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
				Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
			}

			Ti.API.error('Bad Sever =>' + e.error);
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
			Ti.API.info("INNAN ALLT : " + JSON.stringify(gameArray));
			for (var i in gameArray) {
				Ti.API.info("skickar gameArray : " + JSON.stringify(gameArray[i]));
				// is array

				Ti.API.info("arraaaay : " + arr.indexOf(gameArray[i].game_id));
				if (arr.indexOf(gameArray[i].game_id) == -1) {
					count++;
					arr.push(gameArray[i].game_id);
					Ti.API.info("ANTAL MATCHER : " + count);
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
			Ti.API.info("Match ARRAYEN : " + JSON.stringify(arr));
			Ti.API.log("PARAM : " + param);

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
					Ti.API.info("POST ANSWER : " + JSON.stringify(this.responseText));
					var response = JSON.parse(this.responseText);

					// show dialog and if ok close window
					var alertWindow = Titanium.UI.createAlertDialog({
						title : Alloy.Globals.PHRASES.betbattleTxt,
						message : response,
						buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt]
					});

					alertWindow.addEventListener('click', function() {
						// change view
						var arg = {
							refresh : true
						};
						var obj = {
							controller : 'challengesView',
							arg : arg
						};
						Ti.App.fireEvent('app:updateView', obj);
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

// border view
function createBorderView() {
	$.challenge.add(Titanium.UI.createView({
		height : '1dp',
		width : '100%',
		backgroundColor : '#6d6d6d'
	}));
}

// Bet coins view, when answering a challenge
/*function createBetCoinsView(coinsToJoin) {
// handle if new bet

var coinsView = Titanium.UI.createView({
height : 50,
width : '100%',
backgroundColor : '#303030'
});

coinsView.add(Titanium.UI.createLabel({
height : 40,
width : '100%',
top : 5,
backgroundColor : '#303030',
color : '#FFF',
textAlign : 'center',
font : {
fontFamily : "Impact",
fontSize : Alloy.Globals.getFontSize(2)
},
text : coinsToJoin + ' ' + Alloy.Globals.PHRASES.betbattleTxt + ' ' + Alloy.Globals.PHRASES.coinsTxt
}));

$.challenge.add(coinsView);
}

// when creating a challenge
function createBetCoinsChooseView() {
var viewHeight = 60;

if (OS_ANDROID) {
viewHeight = Ti.UI.SIZE;
}

var betView = Titanium.UI.createView({
height : viewHeight,
width : '100%',
layout : 'vertical',
backgroundColor : '#303030'
});

betView.add(Titanium.UI.createLabel({
height : 40,
width : '100%',
top : 10,
backgroundColor : '#303030',
color : '#FFF',
textAlign : 'center',
font : {
fontFamily : "Impact",
fontSize : Alloy.Globals.getFontSize(2)
},
text : Alloy.Globals.PHRASES.chooseCoinsBetTxt
}));

$.challenge.add(betView);

// create 20, 40, 60, 80, 100 values
var betArray = ['20', '40', '60', '80', '100'];
var data = [];

if (OS_ANDROID) {
// default
data.push(Titanium.UI.createPickerRow({
title : '        ' + Alloy.Globals.PHRASES.chooseConfirmBtnTxt,
value : -1
}));

for (var i = 0; i < betArray.length; i++) {
data.push(Titanium.UI.createPickerRow({
title : '         ' + betArray[i] + '    ',
height : 40,
value : betArray[i]
}));
}

// fix scroll
for (var i = 0; i < 8; i++) {
data.push(Titanium.UI.createPickerRow({
title : '          ---',
value : -1,
opacity : 0,
visible : false
}));
}

var betPicker = Titanium.UI.createPicker({
top : 0,
height : Ti.UI.SIZE,
width : Ti.UI.SIZE,
showVerticalScrollIndicator : true,
selectionIndicator : true
});

betPicker.add(data);

betPicker.columns[0].width = Ti.UI.SIZE;
betPicker.columns[0].height = Ti.UI.SIZE;
betPicker.columns[0].font = {
fontSize : 40
};
betPicker.columns[0].fontSize = 40;

var spaceView = Ti.UI.createView({
height : 5,
id : 'spaceView'
});

betPicker.addEventListener('change', function(e) {
coinsToJoin = e.selectedValue[0].replace(/ /g, '');
});

$.challenge.add(betPicker);
$.challenge.add(spaceView);

} else if (OS_IOS) {
// default
data.push(Titanium.UI.createPickerRow({
title : Alloy.Globals.PHRASES.chooseConfirmBtnTxt,
value : -1
}));

for (var i = 0; i < betArray.length; i++) {
data.push(Titanium.UI.createPickerRow({
title : '' + betArray[i],
value : betArray[i]
}));
}

var ModalPicker = require("lib/ModalPicker");
var visualPrefs = {
top : 0,
opacity : 0.85,
borderRadius : 3,
backgroundColor : '#FFF',
width : 140,
height : 40,
textAlign : 'center'
};

var betPicker = new ModalPicker(visualPrefs, data, Alloy.Globals.PHRASES.chooseConfirmBtnTxt, Alloy.Globals.PHRASES.closeBtnTxt);
modalPickersToHide.push(betPicker);

betPicker.text = Alloy.Globals.PHRASES.chooseConfirmBtnTxt;

betPicker.self.addEventListener('change', function(e) {
coinsToJoin = betPicker.value;
});

$.challenge.add(betPicker);
}

$.challenge.add(Ti.UI.createView({
layout : 'vertical',
height : 10,
backgroundColor : '#303030',
width : '100%'
}));
}

// Answer / challenge view
function createSubmitButtonView(buttonText, betkampenId, cid) {
var height = 100;
var top = 30;

var submitView = Titanium.UI.createView({
height : height,
width : '100%',
backgroundColor : '#303030'
});

submitButton = Titanium.UI.createButton({
top : top,
width : '70%',
height : 40,
color : '#FFF',
backgroundColor : Alloy.Globals.themeColor(),
borderRadius : 6,
font : {
fontFamily : Alloy.Globals.getFont(),
fontSize : Alloy.Globals.getFontSize(2)
},
title : buttonText,
backgroundImage : 'none'
});

// on submit validate and post
submitButton.addEventListener('click', function() {
// 1 true 0 false
if (validate() == 1) {
if (roundId === -1) {
// show "loading indicator"
indicator.openIndicator();
submitButton.touchEnabled = false;

// normal challenge
postAnswer(betkampenId, cid, coinsToJoin);

} else {
if (Alloy.Globals.checkConnection()) {
createChallengeAndChooseFriends(betkampenId, coinsToJoin);
} else {
Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
}
}

} else {
Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.notAllValuesErrorTxt);
}
});

submitView.add(submitButton);
$.challenge.add(submitView);
}
*/
// validate
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

// create the layout views
function createLayout(gameObject) {
	view = Ti.UI.createScrollView({
		height : 'auto',
		width : 'auto',
		layout : 'vertical',
		showVerticalScrollIndicator : true,
	});

	var image = Ti.UI.createView({
		width : '100%',
		height : 70,
		backgroundImage : '/images/profileBG.jpg'
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

	var fontSize = Alloy.Globals.getFontSize(2);
	if (teamNames == null) {
		var teamNames = gameObject.attributes.team_1.team_name + " - " + gameObject.attributes.team_2.team_name;
	}
	if (teamNames.length > 20) {
		fontSize = 20;
	}

	image.add(Ti.UI.createLabel({
		top : 30,
		font : {
			fontFamily : Alloy.Globals.getFont(),
			fontSize : fontSize
		},
		color : '#FFF',
		width : '100%',
		opacity : 0.85,
		borderRadius : 3,
		textAlign : 'center',
		text : teamNames
	}));

	view.add(image);

	if (roundId === -1 && challengeObject !== null) {
		/*
		 var currentGroupName = null;

		 if(typeof challengeObject.attributes.group.name !== 'undefined') {
		 currentGroupName = challengeObject.attributes.group.name;
		 } else if(typeof challengeObject.attributes.group[0].name !== 'undefined') {
		 currentGroupName = challengeObject.attributes.group[0].name;
		 }
		 */
		var currentGroupName = groupName;

		if (currentGroupName !== null) {
			view.add(Ti.UI.createLabel({
				top : 5,
				width : '100%',
				textAlign : 'center',
				backgroundColor : '#303030',
				color : '#FFF',
				text : Alloy.Globals.PHRASES.challengeWithGroupTxt + ':',
				font : {
					fontFamily : Alloy.Globals.getFont(),
					fontSize : Alloy.Globals.getFontSize(2),
					fontWeight : 'bold'
				}
			}));

			view.add(Ti.UI.createLabel({
				top : 5,
				width : '100%',
				textAlign : 'center',
				backgroundColor : '#303030',
				color : Alloy.Globals.themeColor(),
				text : currentGroupName,
				font : {
					fontFamily : Alloy.Globals.getFont(),
					fontSize : Alloy.Globals.getFontSize(2)
				}
			}));
		}
	}

	function doRest(gameObject) {

		if (roundId === -1) {
			// tournament fix
			coinsToJoin = gameObjects[0].attributes.pot;

			if ( typeof coinsToJoin === 'undefined') {
				coinsToJoin = parseInt(challengeObject.attributes.potential_pot) / challengeObject.attributes.opponents.length;
			}
		}

		///*******Create game types******///
		var gametypes = gameObject.attributes.game_types;
		for (var y in gametypes) {
			createGameType(gametypes[y], gameObject);
		}

		var slide = Ti.UI.createLabel({
			text : Alloy.Globals.PHRASES.scrollNextGame,
			textAlign : "center",
			font : {
				fontFamily : "Impact",
				fontSize : 18,
			},
			color : "#FFF",
		});
		Ti.API.info("INDEX GAME : " + gameObjects.indexOf(gameObject));
		Ti.API.info("ARRAY LENGTH :  " + gameObjects.length);
		if (gameObjects.indexOf(gameObject) == (gameObjects.length - 1)) {
			Ti.API.info("sista matchen");
		} else {
			view.add(slide);
		}
		if (answer == 1) {
			createSubmitButtonAnswer();
		}
<<<<<<< HEAD
		if (matchOTD == 1){
			if(bet_amount > 0){
				createBetAmountView();
			}
=======
		if (matchOTD == 1) {
>>>>>>> 5dc9ee3afade0ff21a443e99db9ebe1b9367114c
			createSubmitButtonMatchOTD();
		
		}
		/*if (roundId === -1) {
		 createBetCoinsView(coinsToJoin);
		 } else {
		 createBetCoinsChooseView();
		 }

		 createBorderView();

		 if (roundId === -1) {
		 createSubmitButtonView('Svara', Alloy.Globals.BETKAMPENUID, challengeObject.attributes.id);
		 } else {
		 // -1 here indicates that we are creating a challenge
		 createSubmitButtonView(Alloy.Globals.PHRASES.challengeBtnTxt, Alloy.Globals.BETKAMPENUID, -1);
		 }*/
	}


	Alloy.Globals.performTimeout(doRest(gameObject));
	$.challenge.addView(view);
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
if( typeof args.bet_amount !== 'undefined') {
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

// array to store game object
var gameObjects = [];

// array to store all objects of the type game, with gameId and gameValue (for the json string)
var gameArray = [];

// needs to be global in this context
// create indicator window
var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
	top : 200,
	text : Alloy.Globals.PHRASES.loadingTxt
});
var submitButton;

// create menu label
var menuText = Alloy.Globals.PHRASES.createChallengeTxt;
if (roundId === -1) {
	menuText = challengeObject.attributes.league[0].league_name;
}

if (OS_ANDROID) {
	$.challenge.scrollType = 'vertical';
	$.challengeWindow.orientationModes = [Titanium.UI.PORTRAIT];

	$.challengeWindow.addEventListener('open', function() {
		$.challengeWindow.activity.actionBar.onHomeIconItemSelected = function() {
			$.challengeWindow.close();
			$.challengeWindow = null;
		};
		$.challengeWindow.activity.actionBar.displayHomeAsUp = true;
		$.challengeWindow.activity.actionBar.title = Alloy.Globals.PHRASES.betbattleTxt;
		indicator.openIndicator();
	});

	/*
	 $.challengeWindow.addEventListener('androidback', function(){
	 $.challengeWindow.close();
	 $.challengeWindow = null;
	 }); */
}

$.challengeWindow.addEventListener('close', function() {
	indicator.closeIndicator();
	// hide modal pickers (ios)
	if (OS_IOS) {
		for (picker in modalPickersToHide) {
			modalPickersToHide[picker].close();
		}
	}
});

// check connection
if (Alloy.Globals.checkConnection()) {

	if (OS_IOS) {
		indicator.openIndicator();
	}

	// Get games for challenge || new game
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onerror = function(e) {
		indicator.closeIndicator();
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
		Ti.API.error('Bad Sever =>' + e.error);
	};

	try {
		if (roundId === -1) {
			if (tournamentIndex === -1) {
				xhr.open('GET', Alloy.Globals.BETKAMPENGAMESURL + '/?uid=' + Alloy.Globals.BETKAMPENUID + '&cid=' + challengeObject.attributes.id + '&lang=' + Alloy.Globals.LOCALE);
			} else {
				xhr.open('GET', Alloy.Globals.BETKAMPENGETGAMESFORTOURNAMENT + '/?uid=' + Alloy.Globals.BETKAMPENUID + '&tid=' + challengeObject.attributes.id + '&round=' + challengeObject.attributes.round + '&lang=' + Alloy.Globals.LOCALE);
			}

		} else {
			Ti.API.info("skiickaar" + gameID);
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

				if (OS_ANDROID) {
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
