var args = arguments[0] || {};
var view;
var botView;
var groupName = args.group;
var scoreArray;
var scoreView = null;

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
	top : 200,
	text : Alloy.Globals.PHRASES.loadingTxt
});

function createGameType(gameType, game, values) {
	//Ti.API.info("gameTYPE : " + JSON.stringify(gameType));
	var type = gameType.type;
	//Ti.API.info("TYPE : " + type);
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
		//Ti.API.info("BUTTON");
		var optionsView = Ti.UI.createView({
			height : Ti.UI.SIZE,
			width : 285,
			layout : "vertical",
			//backgroundColor: "red",
		});

		var fontSize = 18;
		var buttonViews = [];
		//Ti.API.info("funka då" + JSON.stringify(values));
		Ti.API.info(values.length);
		for (var i = 0; i < values.length; i++) {
			if (values[i].game_type == type && values[i].gid == game.game_id) {
				var correct = false;
				for (var m in game.result_values) {
					if (values[i].game_type == game.result_values[m].game_type) {
						if (values[i].value_1 == game.result_values[m].value_1) {
							if (values[i].value_2 == game.result_values[m].value_2) {
								correct = true;

								/*
								for (var x = 0; x < scoreArray.length; x++) {
									if (values[i].uid === scoreArray[x].uid) {
										// set points to correct user in scoreArray
										scoreArray[x].count++;
									}
								}*/
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
					//Ti.API.info("TEAM" + JSON.stringify(gameObject.attributes.team_1.team_name));
					Ti.API.info("ANDRA");
					text = game.team_1.team_name;
				} else if (text == "team2") {
					text = game.team_2.team_name;
				}
				//if text is too long make text smaller so it fits more.
				if (text.length > 9) {
					fontSize = 12;
				}
				Ti.API.info("TEAM : " + text);

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
		Ti.API.info("OPTIONVIEW : " + JSON.stringify(optionsView));
	} else if (gameType.option_type == "select") {
		//Ti.API.info("SELECT");
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

								/*
								for (var x = 0; x < scoreArray.length; x++) {
									if (values[i].uid === scoreArray[x].uid) {
										// set points to correct user in scoreArray
										scoreArray[x].count++;
									}
								}*/
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

function createLayout(game, values, games) {
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

	var image = Ti.UI.createView({
		width : '100%',
		height : 70,
		//backgroundImage : '/images/profileBG.jpg'
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

	view.add(image);
	view.add(botView);

	var currentGroupName = groupName;

	Ti.API.info("grupp : " + currentGroupName);
	if (currentGroupName == null || typeof currentGroupName == undefined) {

	} else {
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
/*
	if (game.result_values.length > 0) {
		scoreView = Ti.UI.createView({
			top : 10,
			height : 10,
			width : Ti.UI.FILL,
			layout : 'vertical',
			backgroundColor : "#303030",
		});
		botView.add(scoreView);
	}
*/
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
			Ti.API.info("sista matchen");
		} else {
			Ti.API.info("inte sista");
			view.add(slide);
		}
	}


	Alloy.Globals.performTimeout(doRest(game, games, values));
	$.showChallenge.addView(view);
}

function getChallengeShow() {
	Ti.API.info("SKickar: " + args.cid);
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
				Ti.API.info("reeturn : " + JSON.stringify(this.responseText));
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
	//var thisUid = -1;

	for (var y in challenge.games) {
		
		/*
		scoreArray = [];

		for (var x = 0; x < challenge.values.length; x++) {
			// add all participants in this challenge to the array
			if (thisUid !== challenge.values[x].uid) {
				var player = {};
				player.uid = challenge.values[x].uid;
				player.name = challenge.values[x].name;
				player.count = 0;
				scoreArray.push(player);
			}
			thisUid = challenge.values[x].uid;
		}
	*/
		// create layout
		createLayout(challenge.games[y], challenge.values, challenge.games);

/*
		if (scoreView) {
			var scoreTextLabel = Ti.UI.createLabel({
				text : Alloy.Globals.PHRASES.scoreInfoTxt,
				top : 5,
				textAlign : "center",
				color : "#FFF",
				font : {
					fontSize : 18,
					fontFamily : "Impact",
				}
			});
			
			scoreView.add(scoreTextLabel);
			
			// after layout has rendered set correct values to all players (in first view)
			var scoreHeight = scoreTextLabel.toImage().height + 5;

			for (var i = 0; i < scoreArray.length; i++) {
				var scoreLabel = Ti.UI.createLabel({
					top : 5,
					width : '100%',
					textAlign : 'center',
					backgroundColor : '#303030',
					color : "#FFF",
					font : {
						fontFamily : Alloy.Globals.getFont(),
						fontSize : Alloy.Globals.getFontSize(1)
					},
					text : scoreArray[i].name + ': ' + scoreArray[i].count
				});

				scoreView.add(scoreLabel);
				scoreHeight += scoreLabel.toImage().height + 5;
			}
			// set height for scoreView
			scoreView.setHeight(scoreHeight + 20);
		}*/
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
