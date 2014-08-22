var args = arguments[0] || {};

var fontawesome = require('lib/IconicFont').IconicFont({
	font : 'lib/FontAwesome'
});

var font = 'FontAwesome';

if (OS_ANDROID) {
	font = 'fontawesome-webfont';
}

var mainView = Ti.UI.createScrollView({
	class : "topView",
	height : "100%",
	width : "100%",
	top : 0,
	backgroundColor : "transparent",
	layout : "vertical"
});

var groupLabel = Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.myGroupsTxt,
	textAlign : "center",
	top : 10,
	font : {
		fontSize : 22,
		fontFamily : "Impact"
	},
	color : "#FFF"
});
mainView.add(groupLabel);

var infoTxt = Ti.UI.createView({
	top : 20,
	backgroundColor : '#EA7337',
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
			color : "#F09C00",
		}, {
			color : "#D85000",
		}]
	},
	width : "100%",
	height : 30

});
mainView.add(infoTxt);

var nameInfo = Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.groupNameTxt,
	left : '5%',
	color : "#fff",
	font : {
		fontSize : 16,
		fontFamily : "Impact"
	},
});
infoTxt.add(nameInfo);

var scoreInfo = Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.editTxt + "/" + Alloy.Globals.PHRASES.deleteTxt,
	left : '64%',
	color : "#fff",
	font : {
		fontSize : 16,
		fontFamily : "Impact"
	},
});
infoTxt.add(scoreInfo);

function createGUI(obj, i) {

	var group = Ti.UI.createView({
	top : '0.4%',
	width : "100%",
	height : 40
	});
	
	mainView.add(group);

	var groupInfo = Ti.UI.createView({
		backgroundColor : '#fff',
		width : "67%",
		left : "1%",
		opacity : 0.7,
		borderRadius : 10
	});

	group.add(groupInfo);

	var name = Ti.UI.createLabel({
		text : obj.gName,
		left : '4%',
		font : {
			fontSize : 16,
			fontFamily : "Impact"
		},
	});
	groupInfo.add(name);
	
	var editBtn = Ti.UI.createButton({
		top : "0.4%",
		width : '15%',
		left : '68.5%',
		font : {
			fontFamily : font,
			fontSize : 27
		},
		title : fontawesome.icon('fa-wrench'),
		backgroundColor : '#fff',
		color : '#000',
		opacity : 0.7,
		borderRadius : 10
	});
	group.add(editBtn);

	if (obj.admin == Alloy.Globals.BETKAMPENUID) {
		var deleteBtn = Ti.UI.createButton({
			top : "0.4%",
			//height : '8%',
			width : '15%',
			left : '84%',
			font : {
				fontFamily : font,
				fontSize : 27
			},
			title : fontawesome.icon('fa-trash-o'),
			backgroundColor : '#fff',
			color : '#000',
			opacity : 0.7,
			borderRadius : 10
		});
	} else {
		var deleteBtn = Ti.UI.createButton({
			top : "0.4%",
			//height : '8%',
			width : '15%',
			left : '84%',
			font : {
				fontFamily : font,
				fontSize : 27
			},
			title : fontawesome.icon('fa-ban'),
			backgroundColor : '#fff',
			color : '#000',
			opacity : 0.7,
			borderRadius : 10
		});
	}
	group.add(deleteBtn);

	deleteBtn.addEventListener('click', function(e) {
		alert('vill du ta bort mig?? ' + i);
	});
	editBtn.addEventListener('click', function(e) {
		alert('editera mig');
	});
	
	//name.addEventListener('click', function(e){
		//alert('du klickade på' + obj.id);
	//});

}

var url = Alloy.Globals.BETKAMPENURL + '/api/groups.php?uid=' + Alloy.Globals.BETKAMPENUID;
var groups = null;
var client = Ti.Network.createHTTPClient({
	// function called when the response data is available
	onload : function(e) {
		Ti.API.info("Received text: " + this.responseText);
		groups = JSON.parse(this.responseText);
		//alert(groups.data);

		for (var i = 0; i < groups.data.length; i++) {
			createGUI(groups.data[i]);
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
client.open("GET", url);
// Send the request.
client.send();

$.myGroups.add(mainView);
