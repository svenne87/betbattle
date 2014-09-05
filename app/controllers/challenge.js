/* Functions */

function createGameType(gameType, gameObject) {
	var type = gameType.type;
	var viewHeight = "80dp";

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
					if (Alloy.Globals.COUPON != null) {
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
			// create 1-15 values
			for (var i = 0; i <= 15; i++) {
				data.push(Titanium.UI.createPickerRow({
					value : i,
					title : '        ' + i + '    ',
					fontSize : 30,
					fontWeight : 'bold'
				}));
			};
			for (var i = 0; i < gameType.options; i++) {
				var picker = Titanium.UI.createPicker({
					top : 30,
					left : 5,
					width : Ti.UI.SIZE,
					height : Ti.UI.SIZE
				});

				// on first picker change
				picker.addEventListener('change', function(e) {
					e.selectedValue[0] = e.selectedValue[0].replace(/ /g, '');
					gameArray[index].gameValue[i] = e.selectedValue[0];
					if (gameType.number_of_values == 1) {
						gameArray[index].gameValues[1] = 0;
					}
					if (validate()) {
						if (Alloy.Globals.COUPON != null) {
							Ti.API.info("update");
							updateChallenge();
						} else {
							Ti.API.info("save");
							saveChallenge();
						}
					}
				});

				picker.add(data);
				picker.columns[0].width = Ti.UI.SIZE;
				picker.columns[0].height = Ti.UI.SIZE;

				optionsView.add(picker);
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
				var id = i + "_" + gameType.type + count;
				picker = new ModalPicker(visualPrefs, data, Alloy.Globals.PHRASES.chooseConfirmBtnTxt, Alloy.Globals.PHRASES.closeBtnTxt, id);
				modalPickersToHide[gameType.type + count] = picker;

				picker.text = '-';
				//picker.text = '-';

				Ti.API.info("Y VÄRDE : " + i);
				picker.self.addEventListener('change', function(e) {

					var id = e.source.id;
					var ind = id.indexOf("_");
					i = id.substring(0, ind);
					var arrayIndex = id.substring(ind + 1, id.length);

					picker.value = modalPickersToHide[arrayIndex].value;

					gameArray[index].gameValue[i] = picker.value;
					if (gameType.number_of_values == 1) {
						gameArray[index].gameValue[1] = 0;
					}
					Ti.API.info("gameArray : " + JSON.stringify(gameArray));
					if (validate()) {
						if (Alloy.Globals.COUPON != null) {
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
						Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.couponSavedMsg);
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
						Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.couponSavedMsg);
					} else {
						Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
					}

					// show dialog and if ok close window
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

// create new challenge and choose friends to challenge
function createChallengeAndChooseFriends(betkampenId, betAmount) {
	// build the json string
	var param = '{"lang" : "' + Alloy.Globals.LOCALE + '", "betkampen_id":"' + betkampenId + '", "server_url":"' + Alloy.Globals.BETKAMPENURL + '", "round":"' + roundId + '", "bet_amount":"' + betAmount + '", "gamevalue": [{';

	for (var i in gameArray) {
		if (gameArray[i].gameValue.length === undefined) {
			// not an array
			param += '"' + gameArray[i].gameId + '":' + '"' + gameArray[i].gameValue;

			if (i != (gameArray.length - 1)) {
				param += '", ';
			} else {
				// last one
				param += '"';
			}
		} else {
			// is array
			param += '"' + gameArray[i].gameId + '": [';
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
	}
	param += '}]';

	var arg = {
		param : param
	};

	/*
	 // change view
	 var obj = {
	 controller : 'groupSelect',
	 arg : arg
	 };
	 Ti.App.fireEvent('app:updateView', obj);
	 TODO ANDROID
	 */

	var win = Alloy.createController('groupSelect', arg).getView();
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

// post the challenge answer to server
function postAnswer(betkampenId, cid, betAmount) {
	// check connection
	if (Alloy.Globals.checkConnection()) {
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
				param = '{"lang" : "' + Alloy.Globals.LOCALE + '", "betkampen_id":"' + betkampenId + '", "cid":"' + cid + '", "bet_amount":"' + betAmount + '", "gamevalue": [{';
			} else {
				// for tournament
				param = '{"lang" : "' + Alloy.Globals.LOCALE + '", "betkampen_id":"' + betkampenId + '", "tournament":"' + challengeObject.attributes.id + '", "round":"' + gameObjects[0].attributes.round_id + '", "league":"' + gameObjects[0].attributes.league_id + '", "gamevalue": [{';
			}

			for (var i in gameArray) {
				if (gameArray[i].gameValue.length === undefined) {
					// not an array
					param += '"' + gameArray[i].gameId + '":' + '"' + gameArray[i].gameValue;

					if (i != (gameArray.length - 1)) {
						param += '", ';
					} else {
						// last one
						param += '"';
					}
				} else {
					// is array
					param += '"' + gameArray[i].gameId + '": [';
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
			}
			param += '}]}';

			Ti.API.log(param);

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

					// show dialog and if ok close window
					var alertWindow = Titanium.UI.createAlertDialog({
						title : Alloy.Globals.PHRASES.betbattleTxt,
						message : response,
						buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt]
					});

					alertWindow.addEventListener('click', function() {
						submitButton.touchEnabled = true;

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
	view = Ti.UI.createView({
		height : 'auto',
		width : 'auto',
		layout : 'vertical'
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

	var fontSize = Alloy.Globals.getFontSize(3);

	if (teamNames.length > 20) {
		fontSize = 28;
	}

	image.add(Ti.UI.createLabel({
		top : 0,
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
		var currentGroupName = 'Debug';

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

		createBorderView();

		/*if (roundId === -1) {
		 createBetCoinsView(coinsToJoin);
		 } else {
		 createBetCoinsChooseView();w
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
				indicator.closeIndicator();

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
