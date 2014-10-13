var args = arguments[0] || {};

 var wrapperView = null;
var uie = require('lib/IndicatorWindow');
 var indicator = uie.createIndicatorWindow({
	top : 200,
	text : Alloy.Globals.PHRASES.loadingTxt
 });
	
 var iOSVersion;

 if (OS_IOS) {
	iOSVersion = parseInt(Ti.Platform.version);
 }
 
 if (OS_ANDROID) {
    isAndroid = true;

    $.previousMatchOTD.orientationModes = [Titanium.UI.PORTRAIT];

    $.previousMatchOTD.addEventListener('open', function() {
        $.previousMatchOTD.activity.actionBar.onHomeIconItemSelected = function() {
            $.previousMatchOTD.close();
            $.previousMatchOTD = null;
        };
        $.previousMatchOTD.activity.actionBar.displayHomeAsUp = true;
        $.previousMatchOTD.activity.actionBar.title = Alloy.Globals.PHRASES.matchOTDPreviousBtn;
    });
} else {
    $.previousMatchOTD.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.matchOTDPreviousBtn,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });

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

function createSectionsForTable(sectionText) {
	
	var sectionView = $.UI.create('View', {
		classes : ['winnersSection'],
		height : 70,
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


	sectionView.add(Ti.UI.createLabel({
		width : '100%',
		left: 20,
		text : sectionText,
		font : Alloy.Globals.getFontCustom(20, "Bold"),
		color : '#FFF'
	}));

	if (OS_IOS) {
		return Ti.UI.createTableViewSection({
			headerView : sectionView,
			footerView : Ti.UI.createView({
				height : 0.1
			})
		});
	} else if (OS_ANDROID) {
		return Ti.UI.createTableViewSection({
			headerView : sectionView
		});
	}

}


function constructChallengeRows(obj, index) {

	var row = Ti.UI.createTableViewRow({
		id : index,
		hasChild : false,
		width : Ti.UI.FILL,
		left : 0,
		className : 'winnerRow',
		height : 65,
		selectionStyle:'none',
	});


	var imageLocation = Alloy.Globals.BETKAMPENURL + '/profile_images/' + obj.uid + '.png';


	row.add(Ti.UI.createImageView({
		image : imageLocation,
		left : 15,
		width : 30,
		height : 30
	}));

	

	


	var participantsValueLabel = Ti.UI.createLabel({
		left : 60,
		text : obj.name,
		font : {
			fontSize : Alloy.Globals.getFontSize(1),
			fontWeight : 'bold',
			fontFamily : Alloy.Globals.getFont()
		},
		color : "#FFF"
	});
	
	row.add(participantsValueLabel);

	
/*
	row.add(Ti.UI.createView({
		top : 60,
		heigth : 14,
		layout : 'horizontal'
	}));

	if (iOSVersion < 7) {
		row.add(Ti.UI.createView({
			height : 0.5,
			top : 65,
			backgroundColor : '#6d6d6d',
			width : '120%'
		}));
	}*/

	return row;
}

function constructTableView(obj) {
	

	
	var sections = [];

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

	var teamHeader = Ti.UI.createView({
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

	var teamsLabel = Ti.UI.createLabel({
			height: 30,
			text: obj.match.team1_name + " - " + obj.match.team2_name,
			left:20,
			color:"#FFF",
			font:Alloy.Globals.getFontCustom(20, "Bold"),
			top: 15
		});
		
		var dateLabel = Ti.UI.createLabel({
			height: 20,
			top:40,
			left:20,
			text: obj.match.game_date,
			color: Alloy.Globals.themeColor(),
			font: Alloy.Globals.getFont(14, "Regular"),
		});
		
		teamHeader.add(teamsLabel);
		teamHeader.add(dateLabel);
	
	sections[0] = Ti.UI.createTableViewSection({
			headerView : teamHeader,
			footerView : Ti.UI.createView({
				height : 0.1,
			})
		});
		
		
	var bet_amount = obj.match.bet_amount;
	var count = obj.stats.count;
	var winners_count = obj.winners.length;
	
	var total_pot = bet_amount * count;
	var win_amount = 0;
	if(winners_count > 0){
		win_amount = Math.floor(total_pot/winners_count);
	}
	
	
	var participantRow = Ti.UI.createTableViewRow({
		height: 65,
		width: Ti.UI.FILL,
	});
	
	var winAmountRow = Ti.UI.createTableViewRow({
		height: 65,
		width: Ti.UI.FILL
	});
	
	var matchParticipantsLabel = Ti.UI.createLabel({
		text: "Participants : " + count,
		left: 20,
		color:"#FFF",
		font:Alloy.Globals.getFontCustom(18, "Regular"),
	});
	
	participantRow.add(matchParticipantsLabel);
	
	var matchWinnersPot = Ti.UI.createLabel({
		text: "Win amount : " + win_amount,
		left: 20,
		color:"#FFF",
		font:Alloy.Globals.getFontCustom(18, "Regular"),
	});
	
	winAmountRow.add(matchWinnersPot);	
		
	sections[0].add(participantRow);
	sections[0].add(winAmountRow);	
		
	sections[1] = createSectionsForTable("Winners");

	if(obj.winners.length > 0){
		for(var i in obj.winners){
			sections[1].add(constructChallengeRows(obj.winners[i], i));
		}
	
	}else{
		var emptyRow = Ti.UI.createTableViewRow({
			height: 65,
			width: Ti.UI.FILL,
		});
		
		emptyRow.add(Ti.UI.createLabel({
			text: "Det fanns inga vinnare den här matchen",
			left: 20,
			font: Alloy.Globals.getFontCustom(18, "Regular"),
			color:"#FFF"
		}));
		
		sections[1].add(emptyRow);
	}
	

	table.setData(sections);
	
	table.addEventListener('swipe', function(e) {
		if(e.direction !== 'up' && e.direction !== 'down'){
			Ti.API.log(e.direction);
			
			table.touchEnabled = false;
			Ti.App.fireEvent('app:slide');
			table.touchEnabled = true;
		}
	});
	
	

	$.previousMatchOTD.add(table);			
	
	
}

function showPreviousMatch(obj){

	
	constructTableView(obj);
	
}










getPreviousMatchDay();
