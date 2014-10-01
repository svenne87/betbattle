 var args = arguments[0] || {};
 
 var wrapperView = null;
 var match = args.match;
 var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
	top : 200,
	text : Alloy.Globals.PHRASES.loadingTxt
});
 Ti.API.info("Matcheeeen" + JSON.stringify(match));
 
var nextMatch = Ti.UI.createView({
	width: 150,
	height: 50,
	borderRadius : 5,
	backgroundColor: "black",
	top: 300,
});


var nextMatchLabel = Ti.UI.createLabel({
	text: "Next Match",
	font:{
		fontSize: 16,
		fontFamily: "Impact",
	},
	color: "#FFF",
	textAlign: "center"
});



nextMatch.addEventListener("click", function(e){
	checkResponded(match);
});

nextMatch.add(nextMatchLabel);


function checkResponded(match){
	Ti.API.info("CLIKCADE MACHENS MÄSTARE");
	indicator.openIndicator();
	if(Alloy.Globals.checkConnection()){
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onerror = function(e) {
			versusLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
			indicator.closeIndicator();
			Ti.API.error('Bad Sever =>' + e.error);
		};
	
		try {
			xhr.open('GET', Alloy.Globals.BETKAMPENGETMATCHOTDSTATUSURL + '?lang=' + Alloy.Globals.LOCALE + '&gameID=' + match.game_id);
			xhr.setRequestHeader("content-type", "application/json");
			xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
			xhr.setTimeout(Alloy.Globals.TIMEOUT);
			xhr.send();
		} catch(e) {
			Ti.API.info("FAIL : " + JSON.stringify(e));
			indicator.closeIndicator();
		}
	
		xhr.onload = function() {
			if (this.status == '200') {
				if (this.readyState == 4) {
						indicator.closeIndicator();
						var resp = null;
					try {
						Ti.API.info("RESPONSE INNAN PARSENNNN : " + JSON.stringify(this.responseText));
						resp = JSON.parse(this.responseText);
						
					} catch (e) {
						resp = null;
						//Ti.API.info("Match NULL");
					}
	
					if (resp == 2) {
						Ti.API.info("RESPONSE TOP : " + JSON.stringify(resp));
						Ti.API.info("MATCH ID TILL MATCHENS MÄSTARE : " + match.game_id);
						var arg = {
							round : match.roundID,
							leagueName : match.leagueName,
							leagueId : match.leagueID,
							gameID : match.game_id,
							matchOTD : 1,
							bet_amount : match.bet_amount
						};

						var win = Alloy.createController('challenge', arg).getView();
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
					}else if(resp == 1){
						var arg = {
							gameID : match.game_id,
						};

						var win = Alloy.createController('showMatchOTD', arg).getView();
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
				}
				
			} else {
				indicator.closeIndicator();
				Ti.API.error("Error =>" + this.response);
			}
		};
	}else{
		indicator.closeIndicator();
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
	}
}



function getPreviousMatchDay(){
	Ti.API.info("CLIKCADE MACHENS MÄSTARE");
	indicator.openIndicator();
	if(Alloy.Globals.checkConnection()){
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onerror = function(e) {
			versusLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
			indicator.closeIndicator();
			Ti.API.error('Bad Sever =>' + e.error);
		};
	
		try {
			xhr.open('GET', Alloy.Globals.BETKAMPENPREVIOUSMATCHDAY + '?lang=' + Alloy.Globals.LOCALE + '&uid=' + Alloy.Globals.BETKAMPENUID);
			xhr.setRequestHeader("content-type", "application/json");
			xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
			xhr.setTimeout(Alloy.Globals.TIMEOUT);
			xhr.send();
		} catch(e) {
			Ti.API.info("FAIL : " + JSON.stringify(e));
			indicator.closeIndicator();
		}
	
		xhr.onload = function() {
			if (this.status == '200') {
				if (this.readyState == 4) {
						indicator.closeIndicator();
						var resp = null;
					try {
						Ti.API.info("RESPONSE INNAN PARSENNNN : " + JSON.stringify(this.responseText));
						resp = JSON.parse(this.responseText);
						
					} catch (e) {
						resp = null;
						//Ti.API.info("Match NULL");
					}
	
					Ti.API.info("responsen previous" + JSON.stringify(resp));
					showPreviousMatch(resp);
					wrapperView.add(nextMatch);
					$.matchDay.add(wrapperView);
				}
				
			} else {
				indicator.closeIndicator();
				Ti.API.error("Error =>" + this.response);
			}
		};
	}else{
		indicator.closeIndicator();
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
	}
	
}


function showPreviousMatch(obj){
	wrapperView = Ti.UI.createView({
		height: Ti.UI.FILL,
		width: Ti.UI.FILL,
		layout: 'vertical'
	});
	
	var teamsLabel = Ti.UI.createLabel({
		height: 30,
		text: obj.match.team1_name + " - " + obj.match.team2_name,
		textAlign: "center",
		color:"#FFF",
		font:{
			fontSize: 18,
			fontFamily: "Impact",
		},
		top: 5
	});
	
	var winnersLabel = Ti.UI.createView({
		text: "Winners: ",
		textAlign: "center",
		color: "#FFF",
		font:{
			fontSize: 16,
			fontFamily: "Impact",
		}
	});
	
	var winnersView = Ti.UI.createView({
		width: Ti.UI.FILL,
		height: "auto",
		layout: "vertical"
	});
	
	for(var i in obj.winners){
		var winnerLabel = Ti.UI.createLabel({
			text: obj.winners[i].name,
			textAlign: "center",
			color: "#FFF",
			font:{
				fontSize: 16
			}
		});	
		
		winnersView.add(winnerLabel);	
	}

	wrapperView.add(teamsLabel);
	wrapperView.add(winnersLabel);
	wrapperView.add(winnersView);
}


getPreviousMatchDay();

/*
 * 

 * 
 * 
 */