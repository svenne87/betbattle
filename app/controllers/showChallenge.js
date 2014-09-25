var args = arguments[0] || {};
var view;
var botView;
var groupName = args.group;

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
	top : 200,
	text : Alloy.Globals.PHRASES.loadingTxt
});

function createGameType(gameType, game, values) {
	var type = gameType.type;
	var viewHeight = "100dp";

	var gameTypeView = Ti.UI.createView({
		width : Ti.UI.FILL,
		height : Ti.UI.SIZE,
		layout : "vertical",
		backgroundColor : "#303030",
		top : 10,
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

	if (gameType.option_type == "button") {
		var optionsView = Ti.UI.createView({
			height : Ti.UI.SIZE,
			width : 285,
			layout : "vertical",
			//backgroundColor: "red",
		});

		var fontSize = 18;
		var buttonViews = [];
		for (var i = 0; i < values.length; i++) {
			if (values[i].game_type == type && values[i].gid == game.game_id) {
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

				var valueRow = Ti.UI.createView({
					width : "100%",
					height : 50,
					layout : "absolute",
					//backgroundColor: "#c5c5c5",
				});

				var nameLabel = Ti.UI.createLabel({
					height : 50,
					width : 150,
					left : 5,
					top : 5,
					text : values[i].name,
					font : {
						fontFamily : Alloy.Globals.getFont(),
						fontSize : 18,
					},
					color : "#FFF"
				});

				var text = Alloy.Globals.PHRASES.gameTypes[type].buttonValues[values[i].value_1];

				//if the json says team1 or team2. get the actual team  names
				if (text == "team1") {
					text = game.team_1.team_name;
				} else if (text == "team2") {
					text = game.team_2.team_name;
				}
				//if text is too long make text smaller so it fits more.
				if (text.length > 9) {
					fontSize = 12;
				}

				var color = "#303030";
				if (correct) {
					color = "#58B101";
				}

				var buttonView = Ti.UI.createButton({
					title : text,
					top : 5,
					borderColor : "#c5c5c5",
					borderWidth : 1,
					right : 5,
					value : i + 1,
					font : {
						fontSize : fontSize,
					},
					borderRadius : 5,
					backgroundColor : color,
					width : 90,
					height : 40
				});

				valueRow.add(nameLabel);
				valueRow.add(buttonView);
				buttonViews.push(valueRow);
			}
			//get the corresponding text inside each button from the JSON file

		}
		//add click event to all buttonviews. this is done here so that we can change color correctly when clicking one
		for (var i in buttonViews) {
			optionsView.add(buttonViews[i]);
		}
	} else if (gameType.option_type == "select") {
		var layoutType = 'vertical';

		var optionsView = Ti.UI.createView({
			height : Ti.UI.SIZE,
			width : 285,
			layout : layoutType,
			//backgroundColor: "green",
		});

		var valueRows = [];
		for (var i = 0; i < values.length; i++) {
			if (values[i].game_type == type && values[i].gid == game.game_id) {
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
				var valueRow = Ti.UI.createView({
					width : "100%",
					height : 50,
					layout : 'absolute'
				});

				var nameLabel = Ti.UI.createLabel({
					height : 50,
					width : 150,
					left : 5,
					top : 5,
					text : values[i].name,
					font : {
						fontFamily : Alloy.Globals.getFont,
						fontSize : 18,
					},
					color : "#FFF"
				});
				var valueText = "";
				if (gameType.number_of_values == 1) {
					valueText = values[i].value_1;
				} else if (gameType.number_of_values == 2) {
					valueText = values[i].value_1 + " - " + values[i].value_2;
				}

				var color = "#303030";
				if (correct) {
					color = "#58B101";
				}

				var buttonView = Ti.UI.createButton({
					title : valueText,
					top : 5,
					borderColor : "#c5c5c5",
					borderWidth : 1,
					right : 5,
					value : i + 1,
					font : {
						fontSize : fontSize,
					},
					borderRadius : 5,
					backgroundColor : color,
					width : 90,
					height : 40
				});

				valueRow.add(nameLabel);
				valueRow.add(buttonView);
				valueRows.push(valueRow);
			}
		}

		for (var i in valueRows) {
			optionsView.add(valueRows[i]);
		}
	}
	gameTypeView.add(optionsView);
	botView.add(gameTypeView);

}

function createLayout(game, values, games, currentStanding, isFirst) {
	view = Ti.UI.createScrollView({
		height : 'auto',
		width : 'auto',
		layout : 'vertical',
		//backgroundColor:"blue",
		showVerticalScrollIndicator : true,
	});
	
	botView = Ti.UI.createView({
		height : 'auto',
		width : Ti.UI.FILL,
		layout : 'vertical',
		backgroundColor : "#303030",
	});

	// check if this is the first slide
	if (isFirst) {
		var currentGroupName = groupName;

		 if (currentGroupName !== null && typeof currentGroupName !== 'undefined' && currentGroupName !== '') {
			botView.add(Ti.UI.createLabel({
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

			botView.add(Ti.UI.createLabel({
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

		if (currentStanding.length > 0) {
			// create view with current standings
			var currentStandingsView = Ti.UI.createView({
				height : Ti.UI.SIZE,
				width : Ti.UI.FILL,
				top : 20,
				layout : 'vertical',
				backgroundColor : '#303030'
			});

			currentStandingsView.add(Ti.UI.createLabel({
				text : Alloy.Globals.PHRASES.scoreInfoTxt,
				textAlign : "center",
				color : "#FFF",
				//height: "30%",
				font : {
					fontSize : 18,
					fontFamily : "Impact"
				}
			}));

			for (var i = 0; i < currentStanding.length; i++) {
				var tmpObj = currentStanding[i];
				
				if(i === 0) {
				    // leader
				} 
				
				var standingView = Ti.UI.createView({
					height : Ti.UI.SIZE,
					width : Ti.UI.FILL,
					layout : 'absolute',
				});

				var standingNameLabel = Ti.UI.createLabel({
					top : 5,
					left : 20,
					width : Ti.UI.SIZE,
					textAlign : 'left',
					backgroundColor : '#303030',
					color : '#FFF',
					text : tmpObj.playerName,
					font : {
						fontFamily : Alloy.Globals.getFont(),
						fontSize : Alloy.Globals.getFontSize(1)
					}
				});
				standingView.add(standingNameLabel);

				var standingPointsLabel = Ti.UI.createLabel({
					top : 5,
					right : 20,
					width : 'auto',
					textAlign : 'center',
					backgroundColor : '#303030',
					color : '#FFF',
					text : tmpObj.points,
					font : {
						fontFamily : Alloy.Globals.getFont(),
						fontSize : Alloy.Globals.getFontSize(1)
					}
				});

				standingView.add(standingPointsLabel);
				currentStandingsView.add(standingView);

				tmpObj = null;
			}
			
			currentStandingsView.add(Ti.UI.createLabel({
				top : 10,
				left : 20,
				width : Ti.UI.FILL,
				textAlign : 'left',
				backgroundColor : '#303030',
				color : '#FFF',
				text : currentStanding[0].time,
				font : {
					fontFamily : Alloy.Globals.getFont(),
					fontSize : 10
				}
			}));

			botView.add(currentStandingsView);
		}

	}

	var image = Ti.UI.createView({
		width : '100%',
		height : 70,
	});

	var fontSize = Alloy.Globals.getFontSize(2);
	var teamNames = game.team_1.team_name + " - " + game.team_2.team_name;

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

	botView.add(image);
	view.add(botView);

	function doRest(game, games, values) {
		var gametypes = game.game_types;
		for (var y in gametypes) {
			createGameType(gametypes[y], game, values);
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

		if (games.indexOf(game) == (games.length - 1)) {
			// last game
		} else {
			// not last game
			view.add(slide);
		}
	}


	Alloy.Globals.performTimeout(doRest(game, games, values));
	$.showChallenge.addView(view);
}

function getChallengeShow() {
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onerror = function(e) {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
		//alert(JSON.parse(this.responseText));
		Ti.API.info('FEL : ' + JSON.stringify(this.responseText));
		Ti.API.error('Bad Sever =>' + e.error);
		indicator.closeIndicator();
		//$.facebookBtn.enabled = true;
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
		//alert(JSON.parse(this.responseText));

	}
	xhr.onload = function() {
		if (this.status == '200') {
			if (this.readyState == 4) {
				var response = JSON.parse(this.responseText);
				// construct array with objects
				Ti.API.info("challengeShow: " + JSON.stringify(response));
				showResults(response);
			} else {
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
				//$.facebookBtn.enabled = true;
			}
		} else {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);

			//$.facebookBtn.enabled = true;
			Ti.API.error("Error =>" + this.response);
		}
		indicator.closeIndicator();
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

	for (var y in challenge.games) {
		if (y === '0') {
			isFirst = true;
		}
		// create layout
		createLayout(challenge.games[y], challenge.values, challenge.games, challenge.current_standing, isFirst);
		isFirst = false;
	}
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
	getChallengeShow();
} else {
	Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
}
