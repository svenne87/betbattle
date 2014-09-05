var args = arguments[0] || {};

var games = Alloy.Globals.COUPON.games;
var modalPickersToHide = []; 
var coinsToJoin = -1;
var rows = [];
 
function removeCouponGame(gameID){
	Ti.API.info("GAMEID : "+ gameID);
	if (Alloy.Globals.checkConnection()) {
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onerror = function(e) {
			Ti.API.error('Bad Sever =>' + e.error);
		};

		try {
			xhr.open('POST', Alloy.Globals.BETKAMPENDELETECOUPONGAMEURL + '?lang=' + Alloy.Globals.LOCALE + '&gameID=' + gameID + '&cid=' + Alloy.Globals.COUPON.id);
			xhr.setRequestHeader("content-type", "application/json");
			xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
			xhr.setTimeout(Alloy.Globals.TIMEOUT);

			xhr.send();
		} catch(e) {
			//
		}

		xhr.onload = function() {
			if (this.status == '200') {
				if (this.readyState == 4) {
					var response = null;
					Ti.API.info("Tagit bort" + JSON.stringify(this.responseText));
					response = JSON.parse(this.responseText);
					Alloy.Globals.showFeedbackDialog("Matchen har tagits bort från kupongen");
					/*for(var i in games){
						if(games[i].game_id == gameID){
							var index = Alloy.Globals.COUPON.games.indexOf(games[i]);
							Alloy.Globals.COUPON.games.splice(index, 1);		
						}
					}*/
					Alloy.Globals.getCoupon();
				}
			} else {
				Ti.API.error("Error =>" + this.response);
			}
		};
	}
}

function createBorderView() {
	$.showCoupon.add(Titanium.UI.createView({
		height : '1dp',
		width : '100%',
		backgroundColor : '#6d6d6d'
	}));
}

function createSubmitButtonView(){
	wrapperView = Ti.UI.createView({
		height: 50,
		width: Ti.UI.FILL,
		layout: 'absolute',
		backgroundColor: "transparent",
	});
	
	buttonView = Ti.UI.createView({
		width: 140,
		height: 45,
		backgroundColor: Alloy.Globals.themeColor(),
		borderRadius: 5,
	});
	
	buttonView.add(Ti.UI.createLabel({
		text: "Utmana",
		textAlign: "center",
		font:{
			fontSize: 18,
			fontFamily: "Impact",
		},
		color: "#FFF",
	}));
	
	buttonView.addEventListener("click", function(e){
		var win = Alloy.createController('groupSelect').getView();
		Alloy.Globals.CURRENTVIEW =  win;
		if (OS_IOS) {
			Alloy.Globals.NAV.openWindow(win, {
				animated : true
			});
		} else {
			win.open({
				fullScreen : true
			});
		}
	});
	wrapperView.add(buttonView);
	$.showCoupon.add(wrapperView);
}

function createCoinsView(){
	var viewHeight = 60;

	if (OS_ANDROID) {
		viewHeight = Ti.UI.SIZE;
	}

	var betView = Titanium.UI.createView({
		height : viewHeight,
		width : '100%',
		layout : 'vertical',
		backgroundColor : 'transparent'
	});

	betView.add(Titanium.UI.createLabel({
		height : 40,
		width : '100%',
		top : 10,
		backgroundColor : '#transparent',
		color : '#FFF',
		textAlign : 'center',
		font : {
			fontFamily : "Impact",
			fontSize : Alloy.Globals.getFontSize(2)
		},
		text : Alloy.Globals.PHRASES.chooseCoinsBetTxt
	}));

	$.showCoupon.add(betView);

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

		$.showCoupon.add(betPicker);
		$.showCoupon.add(spaceView);

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

		$.showCoupon.add(betPicker);
	}

	$.showCoupon.add(Ti.UI.createView({
		layout : 'vertical',
		height : 10,
		backgroundColor : 'transparent',
		width : '100%'
	}));
}

for (var i in games){
	Ti.API.info("games" + JSON.stringify(games[i]));
	var row = Ti.UI.createView({
		width: Ti.UI.FILL,
		id: "row_"+games[i].game_id,
		height: 70,
		backgroundColor: "transparent",
		layout: "horizontal",
	});
	
	var teamsView = Ti.UI.createView({
		width: "60%",
		height: "100%",
		backgroundColor: "transparent",
	});
	var teamsLabel = Ti.UI.createLabel({
		text: games[i].team_1.team_name + " - " + games[i].team_2.team_name,
		font: {
			fontSize: 16,
			fontFamily: "Impact",
		},
		color: "#FFF",
		textAlign:"left",
	});
	teamsView.add(teamsLabel);
	
	var buttonsView = Ti.UI.createView({
		width: "40%",
		height: "100%",
		backgroundColor: "transparent",
	});
	
	var deleteBtn = Ti.UI.createView({
		width: "50%",
		height: "50%",
		left: 0,
		type: "deleteBtn",
		id: games[i].game_id,
	});
	deleteBtn.add(Ti.UI.createLabel({
		text: "delete",
		font: {
			fontSize: 14,
			fontFamily: "Impact",
		},
		backgroundColor: "red",
		textAlign: "center",
		type: "deleteBtn",
		id: games[i].game_id,
	}));
	
	
	
	var editBtn = Ti.UI.createView({
		width: "50%",
		height: "50%",
		right: 0,
	});
	editBtn.add(Ti.UI.createLabel({
		text: "edit",
		backgroundColor: "green",
		textAlign:"center",
		font : {
			fontSize:14,
			fontFamily: "Impact",
		}
	}));
	
	buttonsView.add(deleteBtn);
	buttonsView.add(editBtn);
	
	row.add(teamsView);
	row.add(buttonsView);
	rows[games[i].game_id] = row;	
}

//loop through rows array and add eventlistener to the deleteBtn.
// This is done in order to remove the correct row when clicking and not the last one on the list
//this is because of how titanium handles adding eventlisteners.
for(var i in rows){
	$.showCoupon.add(rows[i]);
	var children = rows[i].getChildren();
	for(var y in children){
		var childrens = children[y].getChildren();
		for(var k in childrens){
			Ti.API.info("children : " + JSON.stringify(childrens[k]));
			if (childrens[k].type == "deleteBtn"){
				childrens[k].addEventListener("click", function(e){
					var msg = "Är du säker på att du vill ta bort matchen från kupongen?";
					if(games.length == 1){
						msg = "Är du säker på att du vill radera matchen? Hela kupongen kommer raderas";
					}
					var alertWindow = Titanium.UI.createAlertDialog({
						title: Alloy.Globals.PHRASES.betbattleTxt,
						message: msg,
						buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.abortBtnTxt]
					});
					
					alertWindow.addEventListener("click", function(d){
						Ti.API.info("valde : "+ e.source.id);
						alertWindow.hide();
						if(d.index == 0){
							rows[e.source.id].hide();
							removeCouponGame(e.source.id);
						}else if(d.index == 1){
							
						}
					});
					
					alertWindow.show();
					
					//rows[e.source.id].hide();
					//removeCouponGame(e.source.id);
				});
			}	
		}
		
	}
	createBorderView();
}

createCoinsView();
createBorderView();
createSubmitButtonView();

