var mainView = Ti.UI.createView({
	class : "topView",
	height:"100%",
	width: "100%",
	top:0,
	backgroundColor: "transparent",
	layout: "vertical"
});


var socialShareLabel = Ti.UI.createLabel({
	text: 'kåv kåv kåv',
	textAlign: "center",
	top:30,
	font: {
		fontSize: 22,
		fontFamily: "Impact"
	},
	color: "#FFF"
});
mainView.add(socialShareLabel);

$.friendBoard.add(mainView);
