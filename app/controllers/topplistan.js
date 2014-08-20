var args = arguments[0] || {};

var mainView = Ti.UI.createScrollView({
	class : "topView",
	height : "100%",
	width : "100%",
	top : 0,
	backgroundColor : "transparent",
	layout : "vertical"
});

var leaderboardLabel = Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.scoreboardTxt,
	textAlign : "center",
	top : 10,
	font : {
		fontSize : 22,
		fontFamily : "Impact"
	},
	color : "#FFF"
});
mainView.add(leaderboardLabel);

function createGUI(obj, i) {
	var totalLeader = Ti.UI.createView({
		top : '0.03%',
		backgroundColor : '#fff',
		width : "97%",
		height : 40,
		opacity : 0.7,
		borderRadius : 10

	});

	var nr = Ti.UI.createLabel({
		text : i + 1,
		left : '2%',
		font : {
			fontSize : 18,
			fontFamily : "Impact"
		},
	});
	totalLeader.add(nr);
	
	if(i == 0){
	var value = Titanium.UI.createImageView({
		image : "/images/gold.png",
		height : 25,
		width : 25,
		left : '4%'
	});
	totalLeader.add(value);
}else if(i == 1){
	var value = Titanium.UI.createImageView({
		image : "/images/silver.png",
		height : 25,
		width : 25,
		left : '4%'
	});
	totalLeader.add(value);
}else if(i == 2){
	var value = Titanium.UI.createImageView({
		image : "/images/bronze.png",
		height : 25,
		width : 25,
		left : '4%'
	});
	totalLeader.add(value);
}

	var profilePic = Titanium.UI.createImageView({
		image : "/images/no_pic.png",
		height : 25,
		width : 25,
		left : '13%'
	});
	totalLeader.add(profilePic);
	
	boardName = obj.name.toString();
if(boardName.length > 22){
	boardName = boardName.substring(0,22);
}
if(i == 0){
	var name = Ti.UI.createLabel({
		text : "Chipleader\n" + boardName,
		left : '27%',
		font : {
			fontSize : 14
		},
	});
}else if(i == 1){
	var name = Ti.UI.createLabel({
		text : "Runner Up\n" + boardName,
		left : '27%',
		font : {
			fontSize : 14
		},
	});
}else if(i == 2){
	var name = Ti.UI.createLabel({
		text : "Third Place\n" + boardName,
		left : '27%',
		font : {
			fontSize : 14
		},
	});
}else{
	var name = Ti.UI.createLabel({
		text : boardName,
		left : '27%',
		font : {
			fontSize : 14
		},
	});
}
	totalLeader.add(name);

	var coins = Ti.UI.createLabel({
		text : obj.score,
		left : '85%',
		font : {
			fontSize : 16,
			fontFamily : "Impact"
		},
	});
	totalLeader.add(coins);
	mainView.add(totalLeader);
}

var url = Alloy.Globals.BETKAMPENURL + '/api/get_scoreboard.php';
var name = null;
var client = Ti.Network.createHTTPClient({
	// function called when the response data is available
	onload : function(e) {
		Ti.API.info("Received text: " + this.responseText);
		name = JSON.parse(this.responseText);

		for (var i = 0; i < name.scoreboard.length; i++) {
			createGUI(name.scoreboard[i], i);
		}
	},
	// function called when an error occurs, including a timeout
	onerror : function(e) {
		Ti.API.debug(e.error);
		alert('error');
	},
	timeout : Alloy.Globals.TIMEOUT // in milliseconds
});
// Prepare the connection.
client.open("GET", url);
// Send the request.
client.send();

$.scoreView.add(mainView); 