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

var iOSVersion;

if (OS_IOS) {
	iOSVersion = parseInt(Ti.Platform.version);
}

var fontawesome = require('lib/IconicFont').IconicFont({
	font : 'lib/FontAwesome'
});

var fontAwe = 'FontAwesome';

if (OS_ANDROID) {
	fontAwe = 'fontawesome-webfont';
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
				Ti.API.info("TEAM" + JSON.stringify(gameObject.attributes.team_1.team_name));
				text = gameObject.attributes.team_1.team_name;
			} else if (text == "team2") {
				text = gameObject.attributes.team_2.team_name;
			}
			//if text is too long make text smaller so it fits more.
			
			var optionLabel = Ti.UI.createLabel({
				text : text,
				//top : 5,
				//borderColor : "#c5c5c5",
				//borderWidth : 1,
				//left : 5,
				//value : i + 1,
				//width: Ti.UI.FILL,
				left: 20,
				
				font : {
					fontSize : fontSize,
				},
				color:"#FFF",
			});
			
			gameTypeView.add(optionLabel);
			
			
			var val = gameArray[index].gameValue[0];
			if(gameTypeView.value == val){
				gameTypeView.setBackgroundColor(Alloy.Globals.themeColor());
				gameTypeView.add(Ti.UI.createLabel({
					id : 'selected_' + gameTypeView.id,
						text : fontawesome.icon('fa-check'),
						textAlign : "center",
						right : 10,
						color : "#FFF",
						parent : gameTypeView,
						font : {
							fontSize : 30,
							fontFamily : fontAwe,
						},
						height : "auto",
						width : "auto",
				}));
			}
			/*for (var x in children.rows){
				children.rows[x].setBackgroundColor("#000");
				if(children.rows[x].value == val){
					children.rows[x].setBackgroundColor(Alloy.Globals.themeColor());
					children.rows[x].add(Ti.UI.createLabel({
						id : 'selected_' + children.rows[x].id,
						text : fontawesome.icon('fa-check'),
						textAlign : "center",
						right : 10,
						color : "#FFF",
						parent : gameTypeView,
						font : {
							fontSize : 30,
							fontFamily : fontAwe,
						},
						height : "auto",
						width : "auto",
					}));
				}
			}*/
			
			gameTypeView.addEventListener("click", function(e){
				Ti.API.info("CLICKADE PÅ EN ROW : " + JSON.stringify(e));
				gameArray[index].gameValue[0] = e.row.value;
				gameArray[index].gameValue[1] = 0;
				var children = table.data[e.row.id];
				var labels = [];
				
				//Ti.API.info("TABLE CHILDREN : " + JSON.stringify(children.rows));
				//changeColors(e);
				e.row.add(Ti.UI.createLabel({
						id : 'selected_' + e.row.id,
						text : fontawesome.icon('fa-check'),
						textAlign : "center",
						right : 10,
						color : "#FFF",
						parent : gameTypeView,
						font : {
							fontSize : 30,
							fontFamily : fontAwe,
						},
						height : "auto",
						width : "auto",
				}));
				
				for (var x in children.rows){
					children.rows[x].setBackgroundColor("#000");
					labels = children.rows[x].getChildren();
					if(children.rows[x].value != e.row.value){
						for (var k in labels){
							var selected = "selected_"+e.row.id;
							if(labels[k].id == selected){
								children.rows[x].remove(labels[k]);
							}
						}
					}
				}
				e.row.setBackgroundColor(Alloy.Globals.themeColor());
				
				
				Ti.API.info("gameArray : " + JSON.stringify(gameArray));
				
			});
			return gameTypeView;
}

function createSelectGameType(gameType, gameObject, i, gameArray, index){
	var type = gameType.type;
	var viewHeight = 70;
	var fontSize = 16;
	
	var gameTypeView = Ti.UI.createTableViewRow({
		id : type,
		hasChild : false,
		width : Ti.UI.FILL,
		left : 0,
		className : 'gameTypeRow',
		height : 140,
		value : i + 1,
		touchEnabled : false,
		selectionStyle : 'none',
	});
	
	var layoutType = 'horizontal';
		if (gameType.options <= 1) {
			layoutType = 'absolute';
		}
		var optionsView = Ti.UI.createView({
			//height: "70%",
			width : Ti.UI.FILL,
			top: 70,
			height: 70,
			layout : layoutType,
			
		});
		
		var logosView = Ti.UI.createView({
			width: Ti.UI.FILL,
			top: 10,
			height: 50,
			layout: 'horizontal',
		
		});
		var data = [];
		Ti.API.info("GAMETYPE OPTIONS : " + gameType.options);
		if(gameType.options > 1){
			Ti.API.info("Lägger in bild");
			Ti.API.info("BILD : " + gameObject.attributes.team_1.team_logo);
					var logoWrapper = Ti.UI.createView({
						width: 130,
						height: 50,
						left: 20,
						layout: 'absolute',	
					});
					
					var logoWrapper2 = Ti.UI.createView({
						width: 130,
						left: 20,
						layout: 'absolute',
					});
					
					var team_logo = Ti.UI.createImageView({
						image: Alloy.Globals.BETKAMPENURL + gameObject.attributes.team_1.team_logo,
						width: 50,
						height: 50,
						//left: 40,
					});
					
					var team2_logo = Ti.UI.createImageView({
						image: Alloy.Globals.BETKAMPENURL + gameObject.attributes.team_2.team_logo,
						width: 50,
						height: 50,
						//left : 40,
					});
					
					
					logoWrapper.add(team_logo);
					logoWrapper2.add(team2_logo);
					
					logosView.add(logoWrapper);
					logosView.add(logoWrapper2);
		}
		
		if (OS_ANDROID) {
			var pickerLabels = [];

			for (var i = 0; i < gameType.options; i++) {
				var pre_val = gameArray[index].gameValue[i];
				var pickerLabel = Ti.UI.createLabel({
					top : 20,
					left : 15,
					backgroundColor : '#FFF',
					borderRadius : 2,
					width : 100,
					height : 40,
					text : pre_val,
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
				
				var pre_val = gameArray[index].gameValue[i];
				var visualPrefs;
				var ModalPicker = require("lib/ModalPicker");
				if (layoutType == 'horizontal') {
					visualPrefs = {
						//top : 30,
						left : 20,
						id : "picker_" + i,
						opacity : 0.85,
						borderRadius : 3,
						backgroundColor : '#FFF',
						width : 130,
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

				picker.text = pre_val;
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
					
				});

				optionsView.add(picker);

				//pickers.push(picker);

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

	if (teamNames.length > 20) {
		fontSize = 20;
	}

	image.add(Ti.UI.createLabel({
		top : 30,
		left: 20,
		font : {
			fontFamily : Alloy.Globals.getFont(),
			fontSize : fontSize
		},
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
	       height: 0.1
	    }); 
	
		var fontawesome = require('lib/IconicFont').IconicFont({
			font : 'lib/FontAwesome'
		});
	
		var font = 'FontAwesome';
	
		if (OS_ANDROID) {
			font = 'fontawesome-webfont';
		}
		
		var tableFooterView = Ti.UI.createView({
			height: 0.1
		});
		
		if (OS_IOS) {
			var separatorS;
			var separatorCol;
	
			if (iOSVersion < 7) {
				separatorS = Titanium.UI.iPhone.TableViewSeparatorStyle.NONE;
				separatorColor = 'transparent';
			} else {
				separatorS = Titanium.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE;
				separatorColor = '#6d6d6d';
			}
			
	
			table = Titanium.UI.createTableView({
				//width : Ti.UI.FILL,
				left : 0,
				headerView : tableHeaderView,
				footerView : tableFooterView,
				height : '85%',
				width: '100%',
				//backgroundImage: '/images/profileBG.jpg',
				backgroundColor : 'transparent',
				style : Ti.UI.iPhone.TableViewStyle.GROUPED,
				separatorInsets : {
					left : 0,
					right : 0
				},
				id : 'challengeTable',
				separatorStyle : separatorS,
				separatorColor : separatorColor
			});
		} else if (OS_ANDROID) {
			table = Titanium.UI.createTableView({
				width : Ti.UI.FILL,
				left : 0,
				headerView : tableHeaderView,
				height : '85%',
				//backgroundColor : '#303030',
				separatorColor : '#6d6d6d',
				id : 'challengeTable'
			});
		}
		
		///*******Create game types******///
		var gametypes = gameObject.attributes.game_types;
		for (var y in gametypes) {
					
			var gameObj = new Object();
			gameObj.game_id = gameObject.attributes.game_id;
			gameObj.gameType = gametypes[y].type;
			Ti.API.info("OBJECT ???? " + JSON.stringify(gameObject));
			for (var i in gameObject.attributes.values) {
				var value = gameObject.attributes.values[i];
				if (value.game_type == gametypes[y].type) {
					var valueArray = new Array(value.value_1, value.value_2);
				}
				Ti.API.info("EN VALUE : " + JSON.stringify(value));
			}
		
			gameObj.gameValue = valueArray;
			gameArray.push(gameObj);
			var index = gameArray.indexOf(gameObj);
			
			
			var gameTypeHeaderView = Ti.UI.createView({
				height: 75,
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
				text: Alloy.Globals.PHRASES.gameTypes[gametypes[y].type].description,
				//textAlign: "left",
				//width: Ti.UI.FILL,
				left: 20,
				font:{
					fontFamily: Alloy.Globals.getFont(),
					fontSize: 16,
				},
				color: "#FFF"
			});
			gameTypeHeaderView.add(gameTypeLabel);
			
			sections[y] = Ti.UI.createTableViewSection({
							headerView: gameTypeHeaderView,
							footerView: Ti.UI.createView({
								height: 0.1,
							}),
						});
			if(gametypes[y].option_type == "button"){
				for (var i = 0; i < gametypes[y].options; i++) {
					sections[y].add(createGameType(gametypes[y], gameObject, i, gameArray, index));
				}
			}else if(gametypes[y].option_type == "select"){
				sections[y].add(createSelectGameType(gametypes[y], gameObject, i, gameArray, index));
			}
			//createBorderView();
		}
		var sectionIndex = sections.length;
		sections[sectionIndex+1] = Ti.UI.createTableViewSection({
					headerView: Ti.UI.createView({
						height: 0.1,
					}),
					footerView: Ti.UI.createView({
						height: 10,
					})
				});
		sections[sectionIndex+1].add(createSubmitButtonAnswer());
		
		table.setData(sections);
		
		view.add(table);
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
	indicator.closeIndicator();
}

function createBorderView() {
	view.add(Titanium.UI.createView({
		height : '1dp',
		width : '100%',
		backgroundColor : '#6d6d6d'
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
		Ti.API.info("post answer");
		if (validate()) {
			Ti.API.info("UPPDATERA");
			updateCouponGame();
		} else {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.notAllValuesErrorTxt);
		}
	});

	submitView.add(submitButton);

	return submitView;
}

function updateCouponGame() {
	if (Alloy.Globals.checkConnection()) {
		indicator.openIndicator();

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

		if (OS_IOS) {
			indicator.openIndicator();
		}

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

if (OS_ANDROID) {
	$.editGame.orientationModes = [Titanium.UI.PORTRAIT];

	$.editGame.addEventListener('open', function() {
		Alloy.Globals.setAndroidCouponMenu($.editGame.activity);
		
		$.editGame.activity.actionBar.onHomeIconItemSelected = function() {
			$.editGame.close();
			$.editGame = null;
		};
		$.editGame.activity.actionBar.displayHomeAsUp = true;
		$.editGame.activity.actionBar.title = Alloy.Globals.PHRASES.betbattleTxt;
		indicator.openIndicator();
	});
}
