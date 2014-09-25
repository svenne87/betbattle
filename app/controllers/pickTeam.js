var mainView = Ti.UI.createScrollView({
	class : "topView",
	height : "100%",
	width : "100%",
	top : 0,
	backgroundColor : "transparent",
	layout : "vertical"
});

var picLeagueLabel = Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.leagueChooseTxt,
	textAlign : "center",
	top : 30,
	font : {
		fontSize : 19,
		fontFamily : "Impact"
	},
	color : "#FFF"
});

mainView.add(picLeagueLabel);

var topView = Ti.UI.createScrollView({
	class : "topView",
	height : "100%",
	width : "100%",
	top : 40,
	backgroundColor : "transparent",
	layout : "vertical"
});
var g = 0;
//listing all active leagues from db
var league = Alloy.Globals.LEAGUES;
for (var i = 0; i < league.length; i++) {
	
	if (g == 0){
	var row = Ti.UI.createView({
		width : '100%',
		height : 45,
		top : 20
	});
	topView.add(row);
	
	g++;
	}else{
	var row = Ti.UI.createView({
		width : '100%',
		height : 45,
		top : 2
	});
	topView.add(row);	
	}

	var getTeamBtn = Ti.UI.createView({
		width : '98%',
		backgroundColor : '#fff',
		color : '#000',
		id : league[i].id,
		liga : league[i].name,
		opacity : 0.7,
		borderRadius : 5,
		left : '1%'
	});
	row.add(getTeamBtn);
	// league logo
	var url = league[i].logo.replace('logos', 'logos/mobile');
	var finalUrl = url.replace(' ', '');
	var finalUrl = finalUrl.toLowerCase();
	var imageLocation = Alloy.Globals.BETKAMPENURL + finalUrl;

	var leaguePic = Titanium.UI.createImageView({
		image : imageLocation,
		height : 35,
		width : 35,
		id : league[i].id,
		liga : league[i].name,
		left : '3%',
		borderRadius : 17
	});
	getTeamBtn.add(leaguePic);
//league name
	var leagueName = Ti.UI.createLabel({
		text : league[i].name,
		liga : league[i].name,
		id : league[i].id,
		left : '20%',
		font : {
			fontSize : 18,
			fontFamily : "Impact"
		},
	});
	getTeamBtn.add(leagueName);

	getTeamBtn.addEventListener('click', function(e) {
		//hide league chooser
		topView.hide();
		//changing label to be named after the league of your choise
		picLeagueLabel.text = Alloy.Globals.PHRASES.selectedLeagueTxt +' '+ e.source.liga + '\n' + Alloy.Globals.PHRASES.picTeamTxt;
		// getting the teams of choosen league
		getTeams(e.source.id);
	});
}
var h = 0;
function createGUI(obj) {
	if (h == 0){
	var row = Ti.UI.createView({
		width : '100%',
		height : 35,
		top : 20
	});
	mainView.add(row);
	h++;
	}else{
	var row = Ti.UI.createView({
		width : '100%',
		height : 35,
		top : 2
	});
	mainView.add(row);	
	}

	var goBtn = Ti.UI.createView({
		width : '70%',
		backgroundColor : '#fff',
		color : '#000',
		id : obj.tid,
		lag: obj.name,
		opacity : 0.7,
		borderRadius : 5,
		left : '15%'
	});
	row.add(goBtn);
	
	//team logo

	var url = obj.team_logo.replace('logos', 'logos');
	var finalUrl = url.replace(' ', '');
	var finalUrl = finalUrl.toLowerCase();
	var imageLocation = Alloy.Globals.BETKAMPENURL + finalUrl;

	var teamPic = Titanium.UI.createImageView({
		image : imageLocation,
		height : 35,
		width : 35,
		id : obj.tid,
		lag: obj.name,
		left : '3%',
		borderRadius : 17
	});
	goBtn.add(teamPic);
	
	//team name

	var name = Ti.UI.createLabel({
		text : obj.name,
		lag: obj.name,
		id : obj.tid,
		left : '30%',
		font : {
			fontSize : 17,
			fontFamily : "Impact"
		},
	});
	goBtn.add(name);

	goBtn.addEventListener('click', function(e) {
		//open function with team id and team name of your choise
		teamPicked(e.source.id, e.source.lag);
	});
}

//getting teams from db with league id
function getTeams(lid) {
	var xhr = Ti.Network.createHTTPClient({
		onload : function(e) {
			Ti.API.info("Received text: " + this.responseText);
			var team = JSON.parse(this.responseText);
			for (var i = 0; i < team.data.length; i++) {
				createGUI(team.data[i]);
			}

		},
		// function called when an error occurs, including a timeout
		onerror : function(e) {
			Ti.API.debug(e.error);
			//alert('error');
		},
		timeout : Alloy.Globals.TIMEOUT // in milliseconds
	});
	// Prepare the connection.
	xhr.open('GET', Alloy.Globals.BETKAMPENGETTEAMS + '?lid=' + lid + '&lang=' + Alloy.Globals.LOCALE);

	xhr.setRequestHeader("content-type", "application/json");
	xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
	xhr.setTimeout(Alloy.Globals.TIMEOUT);

	xhr.send();
}

//inserts your team in db with your uid and team id
function teamPicked(tid, name) {
	//show toast of your favorite team
	Alloy.Globals.showToast(Alloy.Globals.PHRASES.youTeamTxt +' '+ name);
	var addTeam = Ti.Network.createHTTPClient();
			addTeam.open("POST", Alloy.Globals.BETKAMPENSETUSERTEAM + '?lang=' + Alloy.Globals.LOCALE);
			var params = {
				uid : Alloy.Globals.BETKAMPENUID,
				tid : tid
			};
			addTeam.send(params);
			
			// send you to landingpage
	if (OS_IOS) {
		var loginSuccessWindow = Alloy.createController('landingPage').getView();
		loginSuccessWindow.open({
			fullScreen : true,
			transition : Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT
		});
		loginSuccessWindow = null;

	} else if (OS_ANDROID) {
		var loginSuccessWindow = Alloy.createController('landingPage').getView();
		loginSuccessWindow.open({
			fullScreen : true,
			orientationModes : [Titanium.UI.PORTRAIT]
		});
		loginSuccessWindow = null;
	}

	$.pickTeam.close();

	if (Alloy.Globals.INDEXWIN !== null) {
		Alloy.Globals.INDEXWIN.close();
	}

	if (OS_ANDROID) {
		var activity = Titanium.Android.currentActivity;
		activity.finish();
	}
}

$.pickTeam.add(mainView);
$.pickTeam.add(topView);
