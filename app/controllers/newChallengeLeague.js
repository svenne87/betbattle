Ti.App.addEventListener("sliderToggled", function(e) {
	if ( typeof table !== 'undefined') {
		if (e.hasSlided) {
			table.touchEnabled = false;
		} else {
			table.touchEnabled = true;
		}
	}
});



function openChallengesForLeague(league) {
	var arg = {
		leagueId : league
	};
	Ti.API.info("leageID: " + league);
	/*
	// change view
	var obj = {
		controller : 'newChallenge',
		arg : arg
	};
	TODO ANDROID 
	Ti.App.fireEvent('app:updateView', obj);
	*/
	
	var win =  Alloy.createController('newChallenge', arg).getView();
	// store window
	Alloy.Globals.WINDOWS.push(win);
	
	if(OS_IOS){
		Alloy.Globals.NAV.openWindow(win, {
			animated : true
		});
	} else {
		win.open({
			fullScreen : true
		});
	}

}

var table;
var leagues = Alloy.Globals.LEAGUES;

var tableHeaderView = Ti.UI.createView({
	height : '142dp',
	backgroundImage : '/images/header.png'
	//backgroundColor: 'transparent',
});

tableHeaderView.add(Ti.UI.createLabel({
	top : 50,
	text : Alloy.Globals.PHRASES.leagueChooseTxt,
	font : {
		fontSize : Alloy.Globals.getFontSize(3),
		fontWeight : 'normal',
		fontFamily : 'Impact',
	},
	color : '#FFF'
}));

table = Titanium.UI.createTableView({
	width : Ti.UI.FILL,
	left : 0,
	headerView : tableHeaderView,
	height : '100%',
	backgroundImage: 'images/profileBG.jpg',
	backgroundColor : 'transparent',
	separatorColor : '#6d6d6d'
});

if (OS_IOS) {
	table.separatorInsets = {
		left : 0,
		right : 0
	};
	table.footerView = Ti.UI.createView({
		height : 0.5
	});
} else if (OS_ANDROID) {
	table.footerView = Ti.UI.createView({
		height : 0.5,
		backgroundColor : '#6d6d6d'
	});
}

// add rows to table
var data = [];
for (var i in leagues) {
	var child;

	if (OS_ANDROID) {
		child = false;
	} else if (OS_IOS) {
		child = true;
	}

	var tableRow = $.UI.create('TableViewRow', {
		classes : ['challengesSectionDefault'], 
		id :leagues[i].id, 
		hasChild : child
	});

	// add custom icon on Android to symbol that the row has child
	if (child != true) {
		var fontawesome = require('lib/IconicFont').IconicFont({
			font : 'lib/FontAwesome'
		});

		font = 'fontawesome-webfont';

		tableRow.add(Ti.UI.createLabel({
			font : {
				fontFamily : font
			},
			text : fontawesome.icon('icon-chevron-right'),
			right : '5%',
			color : '#FFF',
			fontSize : 80,
			height : 'auto',
			width : 'auto'
		}));
	}

	// fix to get mobile images
	var url = leagues[i].logo.replace('logos', 'logos/mobile');
	var finalUrl = url.replace(' ', '');
	var finalUrl = finalUrl.toLowerCase();
	var imageLocation = Alloy.Globals.BETKAMPENURL + finalUrl;

	var leagueImageView = Ti.UI.createImageView({
		top : 10,
		left : 5,
		height : 40,
		width : 40,
		image : imageLocation
	});
	
	leagueImageView.addEventListener('error',function(e){
      leagueImageView.image = '/images/Skapa_Utmaning_Default.png';
	});
	
	tableRow.add(leagueImageView);
	
	var leagueName = leagues[i].name;
	
	if(leagueName.length > 17) {
		leagueName = leagueName.substring(0, 14);
		leagueName = leagueName + '...';
	}

	tableRow.add(Ti.UI.createLabel({
		width : '80%',
		height : 'auto',
		left : 60,
		top : 15,
		text : leagueName,
		font : {
			fontSize : Alloy.Globals.getFontSize(2),
			fontWeight : 'normal',
			fontFamily : Alloy.Globals.getFont()
		},
		color : '#FFF'
	}));

	//tableRow.add(leagueImage);
	tableRow.className = 'league';
	data.push(tableRow);
}
table.setData(data);

// when clicking a table row
table.addEventListener('click', function(e) {
	if (Alloy.Globals.SLIDERZINDEX == 2) {
		return;
	}
	
	if(Alloy.Globals.checkConnection()){
		// get games and build UI
		openChallengesForLeague(e.row.id);	
	} else {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
	}
});

if(OS_ANDROID){
	$.newChallengeLeague.orientationModes = [Titanium.UI.PORTRAIT];
	
	$.newChallengeLeague.addEventListener('open', function(){
		$.newChallengeLeague.activity.actionBar.onHomeIconItemSelected = function() { $.newChallengeLeague.close(); $.newChallengeLeague = null; };
   		$.newChallengeLeague.activity.actionBar.displayHomeAsUp = true;
   		$.newChallengeLeague.activity.actionBar.title = Alloy.Globals.PHRASES.betbattleTxt;
	});
/*
	$.newChallengeLeague.addEventListener('androidback', function(){
    	$.newChallengeLeague.close();   	
    	$.newChallengeLeague = null;
	});
*/
}

$.newChallengeLeague.add(table);
