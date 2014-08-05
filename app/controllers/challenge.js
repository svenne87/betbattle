/* Functions */

// create new challenge and choose friends to challenge
function createChallengeAndChooseFriends(betkampenId, betAmount) {
	// build the json string
	var param = '{"betkampen_id":"' + betkampenId + '", "server_url":"' + Alloy.Globals.BETKAMPENURL + '", "round":"' + roundId + '", "bet_amount":"' + betAmount + '", "gamevalue": [{';

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
					title : 'Betkampen',
					message : JSON.parse(this.responseText),
					buttonNames : ['OK', 'Butik']
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
			xhr.setRequestHeader("Authorization", Alloy.Globals.FACEBOOK.accessToken);
			xhr.setTimeout(Alloy.Globals.TIMEOUT);

			// build the json string
			var param;

			if (tournamentIndex === -1) {
				// for normal challenge
				param = '{"betkampen_id":"' + betkampenId + '", "cid":"' + cid + '", "bet_amount":"' + betAmount + '", "gamevalue": [{';
			} else {
				// for tournament
				param = '{"betkampen_id":"' + betkampenId + '", "tournament":"' + challengeObject.attributes.id + '", "round":"' + gameObjects[0].attributes.round_id + '", "league":"' + gameObjects[0].attributes.league_id + '", "gamevalue": [{';
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
			Alloy.Globals.showFeedbackDialog('Något gick fel! Försök igen.');
		}

		xhr.onload = function() {
			if (this.status == '200') {
				indicator.closeIndicator();

				if (this.readyState == 4) {
					var response = JSON.parse(this.responseText);

					// show dialog and if ok close window
					var alertWindow = Titanium.UI.createAlertDialog({
						title : 'Betkampen',
						message : response,
						buttonNames : ['OK']
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
					Alloy.Globals.showFeedbackDialog('Något gick fel!');
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
		Alloy.Globals.showFeedbackDialog('Ingen anslutning!');
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

// who will win view
function createGameScoreView(game) {
	// change length limit for main label with team - team
	var topFixAndroid = 1;
	var heightFix = 40;

	if (OS_ANDROID) {
		topFixAndroid = -4;
		heightFix = 35;
	}

	var gameView = Titanium.UI.createView({
		class : game.attributes.game_id,
		height : '80dp',
		width : 'auto',
		backgroundColor : '#303030'
	});

	$.challenge.add(Titanium.UI.createLabel({
		height : heightFix,
		top : 10,
		width : '100%',
		textAlign : 'center',
		backgroundColor : '#303030',
		color : '#FFF',
		text : game.attributes.team_1.team_name + ' - ' + game.attributes.team_2.team_name,
		font : {
			fontFamily : Alloy.Globals.getFont(),
			fontSize : Alloy.Globals.getFontSize(2)
		}
	}));

	var selectViewOne = Titanium.UI.createView({
		height : 60,
		width : 60,
		left : '5%',
		borderRadius : 30,
		borderWidth : 4,
		borderColor : '#FFF',
		backgroundColor : '#303030'
	});

	selectViewOne.add(Titanium.UI.createLabel({
		height : 'auto',
		top : topFixAndroid,
		color : '#FFF',
		font : {
			fontFamily : Alloy.Globals.getFont(),
			fontSize : Alloy.Globals.getFontSize(3)
		},
		text : '1'
	}));

	var selectViewTwo = Titanium.UI.createView({
		height : 60,
		width : 60,
		right : '5%',
		borderRadius : 30,
		borderWidth : 4,
		borderColor : '#FFF',
		backgroundColor : '#303030'
	});

	selectViewTwo.add(Titanium.UI.createLabel({
		height : 'auto',
		top : topFixAndroid,
		color : '#FFF',
		font : {
			fontFamily : Alloy.Globals.getFont(),
			fontSize : Alloy.Globals.getFontSize(3)
		},
		text : '2'
	}));

	var selectViewThree = Titanium.UI.createView({
		height : 60,
		width : 60,
		left : '42%',
		borderRadius : 30,
		borderWidth : 4,
		borderColor : '#FFF',
		backgroundColor : '#303030'
	});

	selectViewThree.add(Titanium.UI.createLabel({
		height : 'auto',
		top : topFixAndroid,
		color : '#FFF',
		font : {
			fontFamily : Alloy.Globals.getFont(),
			fontSize : Alloy.Globals.getFontSize(3)
		},
		text : 'X'
	}));

	// object to store game id and value
	var gameObj = new Object();
	gameObj.gameId = game.attributes.game_id;
	gameObj.gameValue = -1;
	gameArray.push(gameObj);
	var index = gameArray.indexOf(gameObj);

	// when pressing '1'
	selectViewOne.addEventListener('click', function() {
		selectViewTwo.backgroundColor = '#303030';
		selectViewThree.backgroundColor = '#303030';
		selectViewOne.backgroundColor = '#6d6d6d';
		gameArray[index].gameValue = 1;
	});

	// when pressing '2'
	selectViewTwo.addEventListener('click', function() {
		selectViewOne.backgroundColor = '#303030';
		selectViewThree.backgroundColor = '#303030';
		selectViewTwo.backgroundColor = '#6d6d6d';
		gameArray[index].gameValue = 2;
	});

	// when pressing 'X'
	selectViewThree.addEventListener('click', function() {
		selectViewOne.backgroundColor = '#303030';
		selectViewTwo.backgroundColor = '#303030';
		selectViewThree.backgroundColor = '#6d6d6d';
		gameArray[index].gameValue = 3;
	});

	gameView.add(selectViewOne);
	gameView.add(selectViewTwo);
	gameView.add(selectViewThree);
	$.challenge.add(gameView);
}

// first goal view
function createFirstGoalView(game) {

	var firstGoalView = Titanium.UI.createView({
		class : game.attributes.game_id,
		height : '180dp',
		width : '100%',
		backgroundColor : '#303030'
	});

	$.challenge.add(Titanium.UI.createLabel({
		height : 40,
		width : '100%',
		top : 10,
		textAlign : 'center',
		backgroundColor : '#303030',
		color : '#FFF',
		font : {
			fontFamily : Alloy.Globals.getFont(),
			fontSize : Alloy.Globals.getFontSize(2)
		},
		text : 'Vilket lag gör första målet?'
	}));

	var teamOneButton = Titanium.UI.createView({
		top : 10,
		height : 40,
		width : '80%',
		color : '#FFF',
		borderRadius : 2,
		backgroundColor : '#303030',
		borderColor : '#FFF',
		borderWidth : 2
	});

	teamOneButton.add(Titanium.UI.createLabel({
		color : '#FFF',
		font : {
			fontFamily : Alloy.Globals.getFont(),
			fontSize : Alloy.Globals.getFontSize(1)
		},
		text : game.attributes.team_1.team_name
	}));

	var teamTwoButton = Titanium.UI.createView({
		top : 110,
		height : 40,
		width : '80%',
		color : '#FFF',
		borderRadius : 2,
		backgroundColor : '#303030',
		borderColor : '#FFF',
		borderWidth : 2
	});

	teamTwoButton.add(Titanium.UI.createLabel({
		color : '#FFF',
		font : {
			fontFamily : Alloy.Globals.getFont(),
			fontSize : Alloy.Globals.getFontSize(1)
		},
		text : game.attributes.team_2.team_name
	}));

	var noTeamButton = Titanium.UI.createView({
		top : 60,
		height : 40,
		width : '80%',
		borderRadius : 2,
		color : '#FFF',
		backgroundColor : '#303030',
		borderColor : '#FFF',
		borderWidth : 2
	});

	noTeamButton.add(Titanium.UI.createLabel({
		color : '#FFF',
		font : {
			fontFamily : Alloy.Globals.getFont(),
			fontSize : Alloy.Globals.getFontSize(1)
		},
		text : 'Inget mål'
	}));

	// object to store game id and value
	var gameObj = new Object();
	gameObj.gameId = game.attributes.game_id;
	gameObj.gameValue = -1;
	gameArray.push(gameObj);
	var index = gameArray.indexOf(gameObj);

	// when pressing team one
	teamOneButton.addEventListener('click', function() {
		gameArray[index].gameValue = 1;
		teamTwoButton.backgroundColor = '#303030';
		teamOneButton.backgroundColor = '#6d6d6d';
		noTeamButton.backgroundColor = '#303030';
	});

	// when pressing team two
	teamTwoButton.addEventListener('click', function() {
		gameArray[index].gameValue = 2;
		teamOneButton.backgroundColor = '#303030';
		teamTwoButton.backgroundColor = '#6d6d6d';
		noTeamButton.backgroundColor = '#303030';
	});

	// when pressing no team
	noTeamButton.addEventListener('click', function() {
		gameArray[index].gameValue = 3;
		teamOneButton.backgroundColor = '#303030';
		teamTwoButton.backgroundColor = '#303030';
		noTeamButton.backgroundColor = '#6d6d6d';
	});

	firstGoalView.add(teamOneButton);
	firstGoalView.add(teamTwoButton);
	firstGoalView.add(noTeamButton);
	$.challenge.add(firstGoalView);
}

// number of red cards
function createRedCardsView(game) {
	var viewHeight = 60;

	if (OS_ANDROID) {
		viewHeight = Ti.UI.SIZE;
	}

	var cardsView = Titanium.UI.createView({
		class : game.attributes.game_id,
		height : viewHeight,
		width : '100%',
		backgroundColor : '#303030'
	});

	$.challenge.add(Titanium.UI.createLabel({
		height : 40,
		width : '100%',
		top : 10,
		opacity : 0.85,
		borderRadius : 3,
		color : '#FFF',
		textAlign : 'center',
		font : {
			fontFamily : Alloy.Globals.getFont(),
			fontSize : Alloy.Globals.getFontSize(2)
		},
		text : 'Tippa antal gula kort'
	}));

	// object to store game id and value
	var gameObj = new Object();
	gameObj.gameId = game.attributes.game_id;
	gameObj.gameValue = 0;
	gameArray.push(gameObj);
	var index = gameArray.indexOf(gameObj);

	// create 1-10 values
	var data = [];

	if (OS_ANDROID) {
		for (var i = 0; i <= 15; i++) {
			data.push(Titanium.UI.createPickerRow({
				title : '        ' + i + '    ',
				value : i
			}));
		};

		var numberPicker = Titanium.UI.createPicker({
			type : Titanium.UI.PICKER_TYPE_PLAIN,
			width : Ti.UI.SIZE,
			top : 10,
			height : Ti.UI.SIZE,
		});

		// on first picker change
		numberPicker.addEventListener('change', function(e) {
			var val = e.selectedValue[0].replace(/ /g, '');
			val = parseInt(val);
			gameArray[index].gameValue = val;
		});

		numberPicker.add(data);

		numberPicker.columns[0].width = Ti.UI.SIZE;
		numberPicker.columns[0].height = Ti.UI.SIZE;
		numberPicker.selectionIndicator = true;

		cardsView.add(numberPicker);

	} else if (OS_IOS) {
		for (var i = 0; i <= 15; i++) {
			data.push(Titanium.UI.createPickerRow({
				title : '' + i,
				value : i
			}));
		};

		var ModalPicker = require("lib/ModalPicker");
		var visualPrefs = {
			top : 5,
			opacity : 0.85,
			borderRadius : 3,
			backgroundColor : '#FFF',
			width : 140,
			height : 40,
			textAlign : 'center'
		};

		var numberPicker = new ModalPicker(visualPrefs, data);
		modalPickersToHide.push(numberPicker);
		numberPicker.text = '0';

		numberPicker.self.addEventListener('change', function(e) {
			gameArray[index].gameValue = numberPicker.value;
		});

		cardsView.add(numberPicker);
	}

	$.challenge.add(cardsView);
}

// result view
function createResultView(title, game) {
	var viewHeight = 70;

	if (OS_ANDROID) {
		viewHeight = Ti.UI.SIZE;
	}

	var resultView = Titanium.UI.createView({
		class : game.attributes.game_id,
		height : viewHeight,
		width : '100%',
		backgroundColor : '#303030'
	});

	$.challenge.add(Titanium.UI.createLabel({
		height : 40,
		width : '100%',
		textAlign : 'center',
		top : 10,
		backgroundColor : '#303030',
		color : '#FFF',
		font : {
			fontFamily : Alloy.Globals.getFont(),
			fontSize : Alloy.Globals.getFontSize(2)
		},
		text : title
	}));

	resultView.add(Titanium.UI.createLabel({
		top : 5,
		left : 5,
		width : '48%',
		height : 'auto',
		backgroundColor : '#303030',
		color : '#FFF',
		font : {
			fontFamily : Alloy.Globals.getFont(),
			fontSize : Alloy.Globals.getFontSize(1)
		},
		text : game.attributes.team_1.team_name
	}));

	resultView.add(Titanium.UI.createLabel({
		top : 5,
		right : 5,
		height : 'auto',
		width : '48%',
		textAlign : 'right',
		backgroundColor : '#303030',
		color : '#FFF',
		font : {
			fontFamily : Alloy.Globals.getFont(),
			fontSize : Alloy.Globals.getFontSize(1)
		},
		text : game.attributes.team_2.team_name
	}));

	// object to store game id and value
	var gameObj = new Object();
	gameObj.gameId = game.attributes.game_id;
	var valueArray = new Array(0, 0);
	gameObj.gameValue = valueArray;
	gameArray.push(gameObj);
	var index = gameArray.indexOf(gameObj);

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

		var teamOnePicker = Titanium.UI.createPicker({
			top : 30,
			left : 5,
			width : Ti.UI.SIZE,
			height : Ti.UI.SIZE
		});

		var teamTwoPicker = Titanium.UI.createPicker({
			top : 30,
			right : 5,
			height : Ti.UI.SIZE,
			width : Ti.UI.SIZE
		});

		// on first picker change
		teamOnePicker.addEventListener('change', function(e) {
			e.selectedValue[0] = e.selectedValue[0].replace(/ /g, '');
			gameArray[index].gameValue[0] = e.selectedValue[0];
		});

		// on second picker change
		teamTwoPicker.addEventListener('change', function(e) {
			e.selectedValue[0] = e.selectedValue[0].replace(/ /g, '');
			gameArray[index].gameValue[1] = e.selectedValue[0];
		});

		teamOnePicker.add(data);
		teamTwoPicker.add(data);
		teamOnePicker.columns[0].width = Ti.UI.SIZE;
		teamOnePicker.columns[0].height = Ti.UI.SIZE;
		teamTwoPicker.columns[0].width = Ti.UI.SIZE;
		teamTwoPicker.columns[0].height = Ti.UI.SIZE;

		resultView.add(teamOnePicker);
		resultView.add(teamTwoPicker);

	} else if (OS_IOS) {

		// create 1-15 values
		for (var i = 0; i <= 15; i++) {
			data.push(Titanium.UI.createPickerRow({
				title : '' + i,
				value : i
			}));
		};

		var ModalPicker = require("lib/ModalPicker");
		var visualPrefsOne = {
			top : 30,
			left : 5,
			opacity : 0.85,
			borderRadius : 3,
			backgroundColor : '#FFF',
			width : 140,
			height : 40,
			textAlign : 'center'
		};

		var teamOnePicker = new ModalPicker(visualPrefsOne, data);
		modalPickersToHide.push(teamOnePicker);

		teamOnePicker.text = '0';

		teamOnePicker.self.addEventListener('change', function(e) {
			gameArray[index].gameValue[0] = teamOnePicker.value;
		});

		var visualPrefsTwo = {
			top : 30,
			right : 5,
			opacity : 0.85,
			borderRadius : 3,
			backgroundColor : '#FFF',
			width : 140,
			height : 40,
			textAlign : 'center'
		};

		var teamTwoPicker = new ModalPicker(visualPrefsTwo, data);
		modalPickersToHide.push(teamTwoPicker);
		teamTwoPicker.text = '0';

		teamTwoPicker.self.addEventListener('change', function(e) {
			gameArray[index].gameValue[1] = teamTwoPicker.value;
		});

		resultView.add(teamOnePicker);
		resultView.add(teamTwoPicker);
	}

	$.challenge.add(resultView);

	$.challenge.add(Ti.UI.createView({
		layout : 'vertical',
		height : 10,
		backgroundColor : '#303030',
		width : '100%'
	}));
}

// Bet coins view, when answering a challenge
function createBetCoinsView(coinsToJoin) {
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
			fontFamily : Alloy.Globals.getFont(),
			fontSize : Alloy.Globals.getFontSize(2)
		},
		text : coinsToJoin + ' BetKampen coins'
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
			fontFamily : Alloy.Globals.getFont(),
			fontSize : Alloy.Globals.getFontSize(2)
		},
		text : 'Välj coins att satsa'
	}));

	$.challenge.add(betView);

	// create 20, 40, 60, 80, 100 values
	var betArray = ['20', '40', '60', '80', '100'];
	var data = [];

	if (OS_ANDROID) {
		// default
		data.push(Titanium.UI.createPickerRow({
			title : '        Välj',
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
			title : 'Välj',
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

		var betPicker = new ModalPicker(visualPrefs, data);
		modalPickersToHide.push(betPicker);

		betPicker.text = 'Välj';

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
		backgroundColor : '#58B101',
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
					Alloy.Globals.showFeedbackDialog('Ingen Anslutning!');
				}
			}

		} else {
			Alloy.Globals.showFeedbackDialog('Allt är inte korrekt valt!');
		}
	});

	submitView.add(submitButton);
	$.challenge.add(submitView);
}

// validate
function validate() {
	for (var i in gameArray) {
		if (gameArray[i].gameValue === -1) {
			return false;
		}
	}

	if (coinsToJoin === -1) {
		return false;
	}

	return true;
}

// create the layout views
function createLayout() {

	var image = Ti.UI.createView({
		width : '100%',
		height : 142,
		backgroundImage : '/images/header.png'
	});

	// fetch league name, if not set
	if (leagueName.length === 0) {
		for (var i in Alloy.Globals.LEAGUES) {
			if (Alloy.Globals.LEAGUES[i].id == gameObjects[0].attributes.league_id) {
				leagueName = Alloy.Globals.LEAGUES[i].name;
				break;
			}
		}
	}

	var fontSize = Alloy.Globals.getFontSize(3);

	if (leagueName.length > 10) {
		fontSize = 36;
	}

	image.add(Ti.UI.createLabel({
		top : 50,
		font : {
			fontFamily : Alloy.Globals.getFont(),
			fontSize : fontSize
		},
		color : '#FFF',
		width : '100%',
		opacity : 0.85,
		borderRadius : 3,
		textAlign : 'center',
		text : leagueName
	}));

	$.challenge.add(image);
	
	if (roundId === -1 && challengeObject !== null) {
		var currentGroupName = null;
		
		if(typeof challengeObject.attributes.group.name !== 'undefined') {
			currentGroupName = challengeObject.attributes.group.name;
		} else if(typeof challengeObject.attributes.group[0].name !== 'undefined') {
			currentGroupName = challengeObject.attributes.group[0].name;
		}
		
		if(currentGroupName !== null){
			$.challenge.add(Ti.UI.createLabel({
				top : 5,
				width : '100%',
				textAlign : 'center',
				backgroundColor : '#303030',
				color : '#FFF',
				text : 'Utmaning med gruppen:',
				font : {
					fontFamily : Alloy.Globals.getFont(),
					fontSize : Alloy.Globals.getFontSize(2),
					fontWeight : 'bold'
				}
			}));
			
			$.challenge.add(Ti.UI.createLabel({
				top : 5,
				width : '100%',
				textAlign : 'center',
				backgroundColor : '#303030',
				color : '#58B101',
				text : currentGroupName,
				font : {
					fontFamily : Alloy.Globals.getFont(),
					fontSize : Alloy.Globals.getFontSize(2)
				}
			}));
		}
	}


	for (var i in gameObjects) {

		Alloy.Globals.performTimeout(createBorderView());

		// create views
		var gameType = parseInt(gameObjects[i].attributes.game_type);
		switch(gameType) {
			case 1:
				// winner
				Alloy.Globals.performTimeout(createGameScoreView(gameObjects[i]));
				break;
			case 2:
				// first goal
				Alloy.Globals.performTimeout(createFirstGoalView(gameObjects[i]));
				break;
			case 3:
				// result
				Alloy.Globals.performTimeout(createResultView('Resultatet i matchen', gameObjects[i]));
				break;
			case 4:
				// number of red cards
				Alloy.Globals.performTimeout(createRedCardsView(gameObjects[i]));
				break;
			case 5:
				// result after the first period
				Alloy.Globals.performTimeout(createResultView('Resultat efter första perioden', gameObjects[i]));
				break;
			case 6:
				// result after the second period
				Alloy.Globals.performTimeout(createResultView('Resultat efter andra perioden', gameObjects[i]));
				break;
			case 7:
				// result after the first halftime
				Alloy.Globals.performTimeout(createResultView('Resultat efter halvlek', gameObjects[i]));
				break;
		}

	}

	function doRest() {

		if (roundId === -1) {
			// tournament fix
			coinsToJoin = gameObjects[0].attributes.pot;

			if ( typeof coinsToJoin === 'undefined') {
				coinsToJoin = parseInt(challengeObject.attributes.potential_pot) / challengeObject.attributes.opponents.length;
			}
		}

		createBorderView();

		if (roundId === -1) {
			createBetCoinsView(coinsToJoin);
		} else {
			createBetCoinsChooseView();
		}

		createBorderView();

		if (roundId === -1) {
			createSubmitButtonView('Svara', Alloy.Globals.BETKAMPENUID, challengeObject.attributes.id);
		} else {
			// -1 here indicates that we are creating a challenge
			createSubmitButtonView('Utmana', Alloy.Globals.BETKAMPENUID, -1);
		}
	}


	Alloy.Globals.performTimeout(doRest());
}

/* Flow */
// used to create a new challenge
var args = arguments[0] || {};
// roundId will be -1 as long as we are not creating a new challenge

var roundId = -1;
if ( typeof args.round !== 'undefined') {
	roundId = args.round;
}

var leagueName = '';
if ( typeof args.leagueName !== 'undefined') {
	leagueName = args.leagueName;
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
	top : 200
});
var submitButton;

// create menu label
var menuText = 'Skapa Utmaning';
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
		$.challengeWindow.activity.actionBar.title = 'Betkampen';
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
		Alloy.Globals.showFeedbackDialog('Något gick fel, Försök igen!');
		Ti.API.error('Bad Sever =>' + e.error);
	};

	try {
		if (roundId === -1) {
			if (tournamentIndex === -1) {
				xhr.open('GET', Alloy.Globals.BETKAMPENGAMESURL + '/?uid=' + Alloy.Globals.BETKAMPENUID + '&cid=' + challengeObject.attributes.id);
			} else {
				xhr.open('GET', Alloy.Globals.BETKAMPENGETGAMESFORTOURNAMENT + '/?uid=' + Alloy.Globals.BETKAMPENUID + '&tid=' + challengeObject.attributes.id + '&round=' + challengeObject.attributes.round);
			}

		} else {
			xhr.open('GET', Alloy.Globals.BETKAMPENGETGAMESFORCHALLENGEURL + '/?uid=' + Alloy.Globals.BETKAMPENUID + '&league=' + leagueId + '&round=' + roundId);
		}

		xhr.setRequestHeader("content-type", "application/json");
		xhr.setRequestHeader("Authorization", Alloy.Globals.FACEBOOK.accessToken);
		xhr.setTimeout(Alloy.Globals.TIMEOUT);

		xhr.send();
	} catch(e) {
		indicator.closeIndicator();
		Alloy.Globals.showFeedbackDialog('Något gick fel, Försök igen!');
	}
	xhr.onload = function() {
		if (this.status == '200') {
			if (this.readyState == 4) {
				var response = JSON.parse(this.responseText);
				// the response is an array with the different game types
				// create objects for each game type
				for (var i in response) {
					var teamOneName = response[i].team_1.team_name;

					if (teamOneName.length > 16) {
						teamOneName = teamOneName.substring(0, 13) + '...';
					}

					var teamTwoName = response[i].team_2.team_name;

					if (teamTwoName.length > 16) {
						teamTwoName = teamTwoName.substring(0, 13) + '...';
					}

					var team_1 = {
						team_id : response[i].team_1.team_id,
						team_logo : response[i].team_1.team_logo,
						team_name : teamOneName
					};
					var team_2 = {
						team_id : response[i].team_2.team_id,
						team_logo : response[i].team_2.team_logo,
						team_name : teamTwoName
					};

					var gameObject = Alloy.createModel('game', {
						game_date : response[i].game_date,
						game_id : response[i].game_id,
						game_type : response[i].game_type,
						league_id : response[i].league_id,
						league_name : response[i].league_name,
						round_id : response[i].round_id,
						status : response[i].status,
						team_1 : team_1,
						team_2 : team_2,
						pot : response[i].pot
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

				createLayout();
			} else {
				indicator.closeIndicator();
				Alloy.Globals.showFeedbackDialog('Något gick fel!');
			}

		} else {
			indicator.closeIndicator();
			Alloy.Globals.showFeedbackDialog('Något gick fel! Försök igen.');
			Ti.API.error("Error =>" + this.response);
		}
	};

} else {
	Alloy.Globals.showFeedbackDialog('Ingen anslutning!');
}
