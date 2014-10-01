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
					
					$.previousMatchOTD.add(wrapperView);
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
		height:40
	});

	sectionView.add(Ti.UI.createLabel({
		top : '25%',
		width : '100%',
		textAlign : 'center',
		text : sectionText,
		font : {
			fontSize : Alloy.Globals.getFontSize(2),
			fontWeight : 'normal',
			fontFamily : 'Impact',
		},
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
		height : 50,
		selectionStyle:'none',
	});


	var imageLocation = Alloy.Globals.BETKAMPENURL + '/profile_images/' + obj.uid + '.png';


	row.add(Ti.UI.createImageView({
		image : imageLocation,
		left : 15,
		width : 30,
		height : 30
	}));

	

	var secondRowView = Ti.UI.createView({
		top : 0,
		layout : 'absolute', 
		width : 'auto'
	});


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
	
	secondRowView.add(participantsValueLabel);

	row.add(secondRowView);
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
		height : 20,
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
			height : '70%',
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
		sections[0] = Ti.UI.createTableViewSection({
			headerView : Ti.UI.createView({
				height : 0.1,
			}),
			footerView : Ti.UI.createView({
				height : 0.1,
			})
		});
	} else if (OS_ANDROID) {
		table = Titanium.UI.createTableView({
			width : Ti.UI.FILL,
			left : 0,
			headerView : tableHeaderView,
			//height : '100%',
			backgroundColor : 'transparent',
			separatorColor : '#6d6d6d',
			id : 'challengeTable'
		});
		sections[0] = Ti.UI.createTableViewSection({});
	}

	


	

	sections[1] = createSectionsForTable("Winners");

	for(var i in obj.winners){
		sections[1].add(constructChallengeRows(obj.winners[i], i));
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
	
	

	wrapperView.add(table);			
	
	
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
	
	var dateLabel = Ti.UI.createLabel({
		height: 20,
		text: obj.match.game_date,
		textAlign: "center",
		color: "#FFF",
		font: {
			fontSize: 16,
		}
	});
	
	var bet_amount = obj.match.bet_amount;
	var count = obj.stats.count;
	var winners_count = obj.winners.length;
	
	var total_pot = bet_amount * count;
	var win_amount = Math.floor(total_pot/winners_count);
	
	var matchParticipantsLabel = Ti.UI.createLabel({
		top: 15,
		text: "Participants : " + count,
		textAlign: "center",
		color:"#FFF",
		font:{
			fontSize: 18,
			fontFamily: "Impact",
		},
	});
	
	var matchWinnersPot = Ti.UI.createLabel({
		text: "Win amount : " + win_amount,
		textAlign: "center",
		color:"#FFF",
		font:{
			fontSize: 18,
			fontFamily: "Impact"
		}
	});
	
	
	
	wrapperView.add(teamsLabel);
	wrapperView.add(dateLabel);
	wrapperView.add(matchParticipantsLabel);
	wrapperView.add(matchWinnersPot);
	
	constructTableView(obj);
	
}










getPreviousMatchDay();
