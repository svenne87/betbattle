var args = arguments[0] || {};

var gameID = args.gameID;
var topView;
var botView;

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

var iOSVersion;

if (OS_IOS) {
    iOSVersion = parseInt(Ti.Platform.version);
}

 var sections = [];
 var table = null;
 
function createGameType(type, values, game) {
   
	
    var gameValueWrapper = Ti.UI.createTableViewRow({
        width : Ti.UI.FILL,
        height: 70,
        backgroundColor:"transparent",
        layout : 'absolute',
    });

    

    for (var i in values) {
        if (values[i].game_type == type.type) {
            //Ti.API.info("value : " + JSON.stringify(values[i]));
            //Ti.API.info("Type : " + type.type);
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

            if (type.option_type == "button") {
                var text = Alloy.Globals.PHRASES.gameTypes[type.type].buttonValues[values[i].value_1];

                if (text == "team1") {
                    //Ti.API.info("TEAM" + JSON.stringify(gameObject.attributes.team_1.team_name));
                    //Ti.API.info("ANDRA");
                    text = game.team_1.team_name;
                } else if (text == "team2") {
                    text = game.team_2.team_name;
                }
            } else if (type.option_type = "select") {
                var text = "";
                if (type.number_of_values == 1) {
                    text = values[i].value_1;
                } else if (type.number_of_values == 2) {
                    text = values[i].value_1 + " - " + values[i].value_2;
                }
            }

            var color = "#000000";
            if (correct) {
                color = "#d6d6d6";
            } else {
                color = "#000000";
            }
            gameValueWrapper.setBackgroundColor(color);
            
            var gameValueLabel = Ti.UI.createLabel({
                text : text,
                font : Alloy.Globals.getFontCustom(18, "Regular"),
                color : "#FFF",
                left: 20,
            });
            gameValueWrapper.add(gameValueLabel);
        }

    }

   
  

 
  	return gameValueWrapper;
    
}

function createLayout(resp) {
	Ti.API.info("VISA MATCHOTD " + JSON.stringify(resp));
	Ti.API.info("TEAM 1 " + resp.game.team_1.team_name);
	
    view = Ti.UI.createView({
        height : 'auto',
        width : 'auto',
        layout : 'vertical',
       
    });
    
    
   

	var tableHeaderView = Ti.UI.createView({
		height : 0.1,
		width : Ti.UI.FILL,
		backgroundColor : 'transparent',
		layout : "absolute",
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
			height : '100%',
			width : '100%',
			//backgroundImage: '/images/profileBG.jpg',
			backgroundColor : 'transparent',
			style : Ti.UI.iPhone.TableViewStyle.GROUPED,
			separatorInsets : {
				left : 0,
				right : 0
			},
			id : 'winnersTable',
			separatorStyle : separatorS,
			separatorColor : separatorColor,
		});
		
		
		
		
		
	} else if (OS_ANDROID) {
		table = Titanium.UI.createTableView({
			width : Ti.UI.FILL,
			left : 0,
			headerView : tableHeaderView,
			height : '100%',
			backgroundColor : 'transparent',
			separatorColor : '#6d6d6d',
			id : 'challengeTable'
		});
		
	}
    
    var matchHeader = Ti.UI.createView({
    	height: 70,
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
    
    var matchLabel = Ti.UI.createLabel({
    	text: resp.game.team_1.team_name + " - " + resp.game.team_2.team_name,
    	font: Alloy.Globals.getFontCustom(20, "Bold"),
    	color:"#FFF",
    	left: 20,
    	top: 15,
    });
    
    var matchDateLabel = Ti.UI.createLabel({
    	text: resp.game.game_date_string,
    	font: Alloy.Globals.getFontCustom(14, "Regular"),
    	color: Alloy.Globals.themeColor(),
    	left: 20,
    	top: 40,
    });
    
    matchHeader.add(matchLabel);
    matchHeader.add(matchDateLabel);
    
	sections[0] = Ti.UI.createTableViewSection({
		headerView: matchHeader,
		footerView : Ti.UI.createView({
			height: 0.1
		})
	});
	var rowUser = Ti.UI.createTableViewRow({
		height: 65,
		width: Ti.UI.FILL,
	});
	
    var usersCountLabel = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.showMatchOTDusers + resp.stats.count,
        font : Alloy.Globals.getFontCustom(18, "Regular"),
        color : "#FFF",
        left:20,
    });
	rowUser.add(usersCountLabel);
	
    var rowPot = Ti.UI.createTableViewRow({
    	height: 65,
    	width: Ti.UI.FILL,
    });
    
    var potSize = resp.stats.count * resp.stats.bet_amount;
    var potSizeLabel = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.showMatchOTDpot + potSize,
        font : Alloy.Globals.getFontCustom(18, "Regular"),
        color : "#FFF",
        left: 20,
    });
    
    rowPot.add(potSizeLabel);
    
    sections[0].add(rowUser);
    sections[0].add(rowPot);

    
    

    for (var i in resp.game.game_types) {
    	 var gameTypeViewDesc = Ti.UI.createView({
	        height : 65,
	        width : Ti.UI.FILL,
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
	
	    var gameTypeDescription = Ti.UI.createLabel({
	        text : Alloy.Globals.PHRASES.gameTypes[resp.game.game_types[i].type].description,
	        left: 20,
	        font : Alloy.Globals.getFontCustom(18, "Bold"),
	        color : "#FFF",
	    });
	    gameTypeViewDesc.add(gameTypeDescription);
		var sectionIndex = sections.length;
		sections[sectionIndex] = Ti.UI.createTableViewSection({
			headerView: gameTypeViewDesc,
			footerView: Ti.UI.createView({
				height: 0.1
			}),
		});
        sections[sectionIndex].add(createGameType(resp.game.game_types[i], resp.values, resp.game));
    }

	table.setData(sections);
    view.add(table);

    $.showMatchOTD.add(view);
}

function getChallengeShow() {
    if (OS_IOS) {
        indicator.openIndicator();
    }

    //Ti.API.info("SKickar: "+ gameID);
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onerror = function(e) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        //alert(JSON.parse(this.responseText));
        Ti.API.info('FEL : ' + JSON.stringify(this.responseText));
        Ti.API.error('Bad Sever =>' + e.error);
        indicator.closeIndicator();
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
        indicator.closeIndicator();
    }
    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {
                //Ti.API.info("reeturn : " + JSON.stringify(this.responseText));
                var response = JSON.parse(this.responseText);
                // construct array with objects

                //Ti.API.info("MatchOTDShow: " + JSON.stringify(response));
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
        indicator.closeIndicator();
    };

}

if (OS_ANDROID) {
    $.showMatchOTD.orientationModes = [Titanium.UI.PORTRAIT];

    $.showMatchOTD.addEventListener('open', function() {
        Alloy.Globals.setAndroidCouponMenu($.showMatchOTD.activity);

        $.showMatchOTD.activity.actionBar.onHomeIconItemSelected = function() {
            $.showMatchOTD.close();
            $.showMatchOTD = null;
        };
        $.showMatchOTD.activity.actionBar.displayHomeAsUp = true;
        $.showMatchOTD.activity.actionBar.title = Alloy.Globals.PHRASES.matchTxt;
        //indicator.openIndicator();
    });
} else {
    $.showMatchOTD.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.matchTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });
}

getChallengeShow();
