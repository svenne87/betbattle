var args = arguments[0] || {};

var header = Ti.UI.createView({
	height: "15%",
	width: Ti.UI.FILL,
	backgroundColor : "transparent",
});

var headerText = Ti.UI.createLabel({
	text: "Pågående Utmaningar",
	textAlign: "center",
	color: "#FFF",
	font: {
		fontSize: 24,
		fontFamily: "Impact",
	}
});

header.add(headerText);

$.challenges_pending.add(header);