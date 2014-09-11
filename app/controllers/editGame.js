var args = arguments[0] || {};
var gameID = args.gameID;
var gameObjects = [];
var gameArray = [];
var modalPickersToHide = [];
var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
	top : 200,
	text : Alloy.Globals.PHRASES.loadingTxt
});

function createGameType(gameType, gameObject) {
	var type = gameType.type;
	var viewHeight = "100dp";

	var gameTypeView = Ti.UI.createView({
		width : Ti.UI.FILL,
		height : viewHeight,
		layout : "vertical",
		backgroundColor: "#303030",
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
	Ti.API.info("OBJECT ???? " + JSON.stringify(gameObject));
	for (var i in gameObject.attributes.values){
		var value = gameObject.attributes.values[i];
		if(value.game_type == type){
			var valueArray = new Array(value.value_1, value.value_2);
		}
		Ti.API.info("EN VALUE : " + JSON.stringify(value));
	}
	
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
			Ti.API.info("BUTTON : " + JSON.stringify(buttonViews[i]));
			for(var k in gameObject.attributes.values){
				if(buttonViews[i].value == gameArray[index].gameValue[0] && gameObject.attributes.values[k].game_type == type){
					buttonViews[i].backgroundColor = "#6d6d6d";
				}	
			}
			buttonViews[i].addEventListener("click", function(e) {
				
				Ti.API.info("Clickade " + JSON.stringify(e));
				gameArray[index].gameValue[0] = e.source.value;
				gameArray[index].gameValue[1] = 0;
				changeColors(e);
				Ti.API.info("gameArray : " + JSON.stringify(gameArray));
				
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
					Ti.API.info("selcted");
					e.selectedValue[0] = e.selectedValue[0].replace(/ /g, '');
					gameArray[index].gameValue[i] = e.selectedValue[0];
					if (gameType.number_of_values == 1) {
						gameArray[index].gameValues[1] = 0;
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
				var gameID = gameObject.attributes.game_id;
				var id = i + "_" + gameType.type + count + "-" + gameID;
				picker = new ModalPicker(visualPrefs, data, Alloy.Globals.PHRASES.chooseConfirmBtnTxt, Alloy.Globals.PHRASES.closeBtnTxt, id);
				modalPickersToHide[gameType.type + count + gameID] = picker;
				
				picker.text = gameArray[index].gameValue[i];
				//picker.text = '-';

				Ti.API.info("Y VÄRDE : " + i);
				picker.self.addEventListener('change', function(e) {

					var id = e.source.id;
					var ind = id.indexOf("_");
					i = id.substring(0, ind);
					var d = id.indexOf("-");
					var gameID = id.substring(d+1, id.length);
					var arrayIndex = id.substring(ind + 1, d);
					Ti.API.info("INDEX : " + arrayIndex);
					Ti.API.info("ID : " + gameID);
					picker.value = modalPickersToHide[arrayIndex+gameID].value;

					gameArray[index].gameValue[i] = picker.value;
					if (gameType.number_of_values == 1) {
						gameArray[index].gameValue[1] = 0;
					}
					Ti.API.info("gameArray : " + JSON.stringify(gameArray)); 
					
				});

				optionsView.add(picker);

				//pickers.push(picker);

			}

		}

	}
	gameTypeView.add(optionsView);
	view.add(gameTypeView);
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
	view = Ti.UI.createScrollView({
		height : 'auto',
		width : 'auto',
		layout : 'vertical',
		showVerticalScrollIndicator: true,
	});

	var image = Ti.UI.createView({
		width : '100%',
		height : 70,
		//backgroundImage : '/images/profileBG.jpg'
	});

	

	var fontSize = Alloy.Globals.getFontSize(2);
	var teamNames = gameObject.attributes.team_1.team_name +" - "+ gameObject.attributes.team_2.team_name;  
	
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


	function doRest(gameObject) {

		

		///*******Create game types******///
		var gametypes = gameObject.attributes.game_types;
		for (var y in gametypes) {
			createGameType(gametypes[y], gameObject);
			//createBorderView();
		}

		createBorderView();
	
		createSubmitButtonAnswer();	
		
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
	$.editGame.add(view);
}

function createBorderView() {
	view.add(Titanium.UI.createView({
		height : '1dp',
		width : '100%',
		backgroundColor : '#6d6d6d'
	}));
}

function createSubmitButtonAnswer(){
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
		title : Alloy.Globals.PHRASES.saveTxt,
		backgroundImage : 'none',
		touchEnabled: true,
	});

	submitButton.addEventListener("click", function(e){
		Ti.API.info("post answer");
		if(validate()){
			Ti.API.info("UPPDATERA");
			updateCouponGame();
		}else{
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.notAllValuesErrorTxt);
		}
	});
		
	submitView.add(submitButton);
	
	view.add(submitView);
}

function updateCouponGame(){
	if (Alloy.Globals.checkConnection()) {
	
	// Get game to edit
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onerror = function(e) {
		indicator.closeIndicator();
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
		Ti.API.info("ERROREROROR " + JSON.stringify(e));
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
				Ti.API.info("UPPDATERAT ELLER : " + JSON.stringify(this.responseText));
				response = JSON.parse(this.responseText);
				if(response == 1){
					Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.couponEditedGameFeedback);
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

function getGame(){
	if (Alloy.Globals.checkConnection()) {
	
	// Get game to edit
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onerror = function(e) {
		indicator.closeIndicator();
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
		Ti.API.error('Bad Sever =>' + e.error);
	};

	try {
		
		xhr.open('GET', Alloy.Globals.BETKAMPENGAMETOEDITURL + '/?gid=' + gameID + '&cid=' +Alloy.Globals.COUPON.id + '&lang=' + Alloy.Globals.LOCALE);
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
				Ti.API.info("RESPONSE : " + JSON.stringify(this.responseText));
				var response = JSON.parse(this.responseText);
				// Simple work around, if response ain't an array, then simpy add it to one, to use the same code
				if (response.length == null) {
					var array = [];
					array.push(response);
					response = array;
					array = null;
				}
				Ti.API.info("PARSED RESPONSE: " + JSON.stringify(response));
				// This response contains one or several games for a challenge. And each game contains a  set of game types valid for that game
				for (resp in response) {
					//Ti.API.info("EN RESPONSE: " + JSON.stringify(resp));
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
					Ti.API.info("VALUES : " + JSON.stringify(res.values));
					for (var y in res.values){
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

				

				if (OS_ANDROID) {
					// clear old children
					$.editGame.removeAllChildren();

					for (child in $.challenge.children) {
						$.editGame.children[child] = null;
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
}

getGame();
