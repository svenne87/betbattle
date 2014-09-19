var args = arguments[0] || {};

var games = Alloy.Globals.COUPON.games;
var modalPickersToHide = []; 
var coinsToJoin = -1;
var rows = [];
var amount_games = games.length;
var amount_deleted = 0;
var added = false;
 
function checkFriends(){
	if(Alloy.Globals.checkConnection()){
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onerror = function(e) {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
			//alert(JSON.parse(this.responseText));
			
			
			Ti.API.error('Bad Sever =>' + e.error);
			added = false;
			//$.facebookBtn.enabled = true;
		};
	
		try {
			xhr.open('GET', Alloy.Globals.BETKAMPENGETFRIENDSURL + '?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
			xhr.setRequestHeader("challengesView-type", "application/json");
			xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
			xhr.setTimeout(Alloy.Globals.TIMEOUT);
			xhr.send();
		} catch(e) {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
			//alert(JSON.parse(this.responseText));
			added = false;
		}
		xhr.onload = function() {
			added = false;
			if (this.status == '200') {
				if (this.readyState == 4) {
					var response = JSON.parse(this.responseText);
					// construct array with objects
					Ti.API.info("VÄNNER : " + response.length);
					if(response.length > 0){
						if(validate()){
							var arg = {
								coins : coinsToJoin
							};
							var win = Alloy.createController('groupSelect', arg).getView();
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
						}else{
							Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.coinsNoBetError);
						}
					}else{
						
						var message = Alloy.Globals.PHRASES.noFriendsChallengePrompt;			
						var my_alert = Ti.UI.createAlertDialog({title:'Betkampen', message:message});
			        	my_alert.show();
			        	my_alert.addEventListener('click', function(e) {
			        		
							my_alert.hide();
							
							var win = Alloy.createController('friendZone').getView();
							if (OS_IOS) {
								Alloy.Globals.NAV.openWindow(win, {
									animated : true
								});
							} else {
								win.open({
									fullScreen : true
								});
								win = null;
							}
							$.showCoupon.close();
						
						});
					}
					
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
	}else{
		added = false;
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
	}
	
} 
 
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
					 Alloy.Globals.showToast(Alloy.Globals.PHRASES.couponGameRemoved);
					amount_deleted++;
					/*for(var i in games){
						if(games[i].game_id == gameID){
							var index = Alloy.Globals.COUPON.games.indexOf(games[i]);
							Alloy.Globals.COUPON.games.splice(index, 1);		
						}
					}*/
					
					// remove view
					$.scrollView.remove(rows[gameID]);
					rows[gameID] = null;
					
					if(amount_deleted == amount_games){
						$.showCoupon.close();
					}
					Alloy.Globals.getCoupon();
				}
			} else {
				Ti.API.error("Error =>" + this.response);
			}
		};
	}
}

function createBorderView() {
	$.scrollView.add(Titanium.UI.createView({
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
		text: Alloy.Globals.PHRASES.challengeBtnTxt,
		textAlign: "center",
		font:{
			fontSize: 18,
			fontFamily: "Impact",
		},
		color: "#FFF",
	}));
	
	buttonView.addEventListener("click", function(e){
		if(!added){
			checkFriends();
			added = true;
		}
		
	});
	wrapperView.add(buttonView);
	$.scrollView.add(wrapperView);
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

	$.scrollView.add(betView);

	// create 20, 40, 60, 80, 100 values
	var betArray = ['20', '40', '60', '80', '100'];
	var data = [];

	if (OS_ANDROID) {
		coinsToJoin = -1;
		var betPicker = Ti.UI.createLabel({
			top : 10,
			backgroundColor : '#FFF',
			borderRadius : 2,
			width : 120,
			height : 40,
			text : Alloy.Globals.PHRASES.chooseConfirmBtnTxt,
			textAlign : 'center'
		});
		
		betPicker.addEventListener('click', function() {
			Alloy.createWidget('danielhanold.pickerWidget', {
				id : 'sColumnBetPicker',
				outerView : $.showCoupon,
				hideNavBar : false,
				type : 'single-column',
				selectedValues : [20],
				pickerValues : [{20: '20', 40: '40', 60: '60', 80: '80', 100: '100'}],
				onDone : function(e) {
					if (e.data) {
						betPicker.setText(e.data[0].value);
						coinsToJoin = e.data[0].value;
					}
				},
			});
		});

		$.scrollView.add(betPicker);

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

		$.scrollView.add(betPicker);
	}

	$.scrollView.add(Ti.UI.createView({
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
		width: "48%",
		height: "50%",
		left: 0,
		type: "deleteBtn",
		id: games[i].game_id,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: "#c5c5c5",
	});
	deleteBtn.add(Ti.UI.createLabel({
		text: Alloy.Globals.PHRASES.couponDeleteBtnText,
		font: {
			fontSize: 14,
			fontFamily: "Impact",
		},
		//backgroundColor: "red",
		textAlign: "center",
		type: "deleteBtn",
		id: games[i].game_id,
		color: "#FFF",
	}));
	
	
	
	var editBtn = Ti.UI.createView({
		width: "48%",
		height: "50%",
		right: 0,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: "#c5c5c5",
		id: games[i].game_id,
		type: "editBtn",
	});
	editBtn.add(Ti.UI.createLabel({
		text: Alloy.Globals.PHRASES.couponEditBtnText,
		//backgroundColor: "green",
		textAlign:"center",
		font : {
			fontSize:14,
			fontFamily: "Impact",
		},
		color: "#FFF",
		id: games[i].game_id,
		type: "editBtn",
	}));
	
	buttonsView.add(deleteBtn);
	buttonsView.add(editBtn);
	
	row.add(teamsView);
	row.add(buttonsView);
	
	row.add(Titanium.UI.createView({
		height : '1dp',
		width : '100%',
		backgroundColor : '#6d6d6d'
	}));

	rows[games[i].game_id] = row;	
}

function validate(){
	if(coinsToJoin == -1){
		return false;
	}else{
		return true;
	}
}

//loop through rows array and add eventlistener to the deleteBtn.
// This is done in order to remove the correct row when clicking and not the last one on the list
//this is because of how titanium handles adding eventlisteners.
for(var i in rows){
	$.scrollView.add(rows[i]);
	var children = rows[i].getChildren();
	for(var y in children){
		var childrens = children[y].getChildren();
		for(var k in childrens){
			Ti.API.info("children : " + JSON.stringify(childrens[k]));
			if (childrens[k].type == "deleteBtn"){
				childrens[k].addEventListener("click", function(e){
					var msg = Alloy.Globals.PHRASES.couponGameRemoveConfirm;
					if(games.length == 1){
						msg = Alloy.Globals.PHRASES.couponGameRemoveFinalConfirm;
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
							removeCouponGame(e.source.id);
						}else if(d.index == 1){
							
						}
					});
					
					alertWindow.show();
				});
			}else if(childrens[k].type == "editBtn"){
				childrens[k].addEventListener("click", function(e){
					var args = {
						gameID : e.source.id,
					};
					
					var win = Alloy.createController("editGame", args).getView();
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
			}	
		}
		
	}
}
if (OS_ANDROID) {
	font = 'fontawesome-webfont';

	$.showCoupon.orientationModes = [Titanium.UI.PORTRAIT];

	$.showCoupon.addEventListener('open', function() {
		$.showCoupon.activity.actionBar.onHomeIconItemSelected = function() {
			$.showCoupon.close();
			$.showCoupon = null;
		};
		$.showCoupon.activity.actionBar.displayHomeAsUp = true;
		$.showCoupon.activity.actionBar.title = Alloy.Globals.PHRASES.betbattleTxt;
	});

}


createCoinsView();
createBorderView();
createSubmitButtonView();

