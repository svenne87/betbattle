var args = arguments[0] || {};

var gameID = args.gameID;
var topView;
var botView;

function createGameType(type, values, game){
	var gameTypeView = Ti.UI.createView({
		height: 70,
		width: Ti.UI.FILL,
		backgroundColor:"transparent",
		layout:"vertical",
	});
	
	var gameTypeDescription = Ti.UI.createLabel({
		text: Alloy.Globals.PHRASES.gameTypes[type.type].description,
		textAlign: "center",
		font:{
			fontFamily: "Impact",
			fontSize: 18,
		},
		color:"#FFF",
	});
	gameTypeView.add(gameTypeDescription);
	
	var gameValueWrapper = Ti.UI.createView({
		width:Ti.UI.FILL,
		layout:'absolute',
	});
	
	var gameValueButton = Ti.UI.createView({
		borderColor : "#c5c5c5",
		borderWidth : 1,
		borderRadius : 5,
		backgroundColor:"#303030",
		width : 90,
		height : 35,
		layout:'absolute',
	});
	
	for(var i in values){
		if(values[i].game_type == type.type){
			Ti.API.info("value : " + JSON.stringify(values[i]));
			Ti.API.info("Type : " + type.type);
			var correct = false;
			for(var m in game.result_values){
				if(values[i].game_type == game.result_values[m].game_type){
					if(values[i].value_1 == game.result_values[m].value_1){
						if(values[i].value_2 == game.result_values[m].value_2){
							correct = true;
						}
					}
				}
			}
			
			
			if(type.option_type == "button"){
				var text = Alloy.Globals.PHRASES.gameTypes[type.type].buttonValues[values[i].value_1];
			
				if (text == "team1") {
					//Ti.API.info("TEAM" + JSON.stringify(gameObject.attributes.team_1.team_name));
					Ti.API.info("ANDRA");
					text = game.team_1.team_name;
				} else if (text == "team2") {
					text = game.team_2.team_name;
				}	
			}else if(type.option_type="select"){
				var text = "";
				if(type.number_of_values == 1){
					text = values[i].value_1;
				}else if(type.number_of_values == 2){
					text = values[i].value_1 + " - " + values[i].value_2;
				}
			}
			
			var color = "#303030";
			if(correct){
				color = "#d6d6d6";
			}else{
				color = "#303030";
			}
			gameValueButton.setBackgroundColor(color);
			var gameValueLabel = Ti.UI.createLabel({
				text: text,
				font:{
					fontSize: 16,
				},
				color:"#FFF",
				textAlign: "center",
			});	
			gameValueButton.add(gameValueLabel);
		}
		
	}
	
	gameValueWrapper.add(gameValueButton);
	gameTypeView.add(gameValueWrapper);
	
	botView.add(gameTypeView);
}


function createLayout(resp){
	view = Ti.UI.createScrollView({
		height : 'auto',
		width : 'auto',
		layout : 'vertical',
		//backgroundColor:"blue",
		showVerticalScrollIndicator: true,
	});
	topView = Ti.UI.createView({
		width: Ti.UI.FILL,
		height: "20%",
		backgroundColor: "transparent",
		layout:"vertical",
	});
	
	
	var usersCountLabel = Ti.UI.createLabel({
		text: Alloy.Globals.PHRASES.showMatchOTDusers + resp.stats.count,
		font:{
			fontFamily:"Impact",
			fontSize: 22,
		},
		color:"#FFF",
		textAlign:"center",
	});
	
	var potSize = resp.stats.count*resp.stats.bet_amount;
	var potSizeLabel = Ti.UI.createLabel({
		text: Alloy.Globals.PHRASES.showMatchOTDpot + potSize,
		font: {
			fontFamily:"Impact",
			fontSize: 22,
		},
		color:"#FFF",
		textAlign:"center"
	});
	
	topView.add(usersCountLabel);
	topView.add(potSizeLabel);
	
	botView = Ti.UI.createView({
		width: Ti.UI.FILL,
		height: "80%",
		backgroundColor:"#303030",
		layout: 'vertical',
		
	});
	
	for(var i in resp.game.game_types){
		createGameType(resp.game.game_types[i], resp.values, resp.game);
	}
	
	view.add(topView);
	view.add(botView);
	
	$.showMatchOTD.add(view);
}

function getChallengeShow(){
	Ti.API.info("SKickar: "+ gameID);
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onerror = function(e) {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
		//alert(JSON.parse(this.responseText));
		Ti.API.info('FEL : ' + JSON.stringify(this.responseText));
		Ti.API.error('Bad Sever =>' + e.error);
		//$.facebookBtn.enabled = true;
	};

	try {
		xhr.open('GET', Alloy.Globals.BETKAMPENMATCHOTDSHOWURL + '?gameID=' + gameID + '&lang=' + Alloy.Globals.LOCALE);
		xhr.setRequestHeader("challengesView-type", "application/json");
		xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
		xhr.setTimeout(Alloy.Globals.TIMEOUT);
		xhr.send();
	} catch(e) {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
		//alert(JSON.parse(this.responseText));
		
	}
	xhr.onload = function() {
		if (this.status == '200') {
			if (this.readyState == 4) {
				Ti.API.info("reeturn : " + JSON.stringify(this.responseText));
				var response = JSON.parse(this.responseText);
				// construct array with objects
				
				Ti.API.info("MatchOTDShow: " + JSON.stringify(response));	
				//showResults(response);
				createLayout(response);	
			} else {
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
				//$.facebookBtn.enabled = true;
			}
		} else {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
		
			//$.facebookBtn.enabled = true;
			Ti.API.error("Error =>" + this.response);
		}
	};
	
}


getChallengeShow();
