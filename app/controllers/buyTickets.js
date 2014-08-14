var args = arguments[0] || {};

var topLabel = Ti.UI.createLabel({
	text: "Köp Lotter",
	textAlign: "center",
	color: "#FFFFFF",
	font:{
		fontSize: 22,
		fontFamily: "Impact",
	}
});
$.buyTickets.add(topLabel);

var topBtnView = Ti.UI.createView({
	width: "100%",
	height: "20%",
	//backgroundColor: "red",
	top: 10,
});
$.buyTickets.add(topBtnView);

var oneTicketBtn = Ti.UI.createView({
	width: 150,
	height: 70,
	borderRadius: 10,
	backgroundGradient:{
		type: 'linear',
		startPoint:{x : "50%", y : "0%"},
		endPoint:{x:"50%", y : "100%"},
		colors: [{color: "#0a3258"}, {color: "#071e34"}],
	}
});
topBtnView.add(oneTicketBtn);

var oneTicketLabel = Ti.UI.createLabel({
	text: "Köp 1 Lott för 20kr",
	textAlign: "center",
	color: "#FFFFFF",
	font:{
		fontSize: 14,
		fontFamily: "Impact",
	}
});
oneTicketBtn.add(oneTicketLabel);

var midBtnView = Ti.UI.createView({
	width: "100%",
	height: "20%",
	top: 10,
	//backgroundColor: "blue",
});
$.buyTickets.add(midBtnView);

var twoTicketBtn = Ti.UI.createView({
	width: 150,
	height: 70,
	borderRadius: 10,
	backgroundGradient:{
		type: 'linear',
		startPoint:{x : "50%", y : "0%"},
		endPoint:{x:"50%", y : "100%"},
		colors: [{color: "#0a3258"}, {color: "#071e34"}],
	}
});
midBtnView.add(twoTicketBtn);

var twoTicketLabel = Ti.UI.createLabel({
	text: "Köp 2 Lotter för 40 kr",
	textAlign: "center",
	color: "#FFFFFF",
	font:{
		fontSize: 14,
		fontFamily: "Impact",
	}
});
twoTicketBtn.add(twoTicketLabel);

var botBtnView = Ti.UI.createView({
	width: "100%",
	height: "20%",
	top: 10,
	//backgroundColor: "green",
});
$.buyTickets.add(botBtnView);

var fiveTicketBtn = Ti.UI.createView({
	width: 150,
	height: 70,
	borderRadius: 10,
	backgroundGradient:{
		type: 'linear',
		startPoint:{x : "50%", y : "0%"},
		endPoint:{x:"50%", y : "100%"},
		colors: [{color: "#0a3258"}, {color: "#071e34"}],
	}
});
botBtnView.add(fiveTicketBtn);

var fiveTicketLabel = Ti.UI.createLabel({
	text: "Köp 5 Lotter för 100kr",
	textAlign: "center",
	color: "#FFFFFF",
	font:{
		fontSize: 14,
		fontFamily: "Impact",
	}
});
fiveTicketBtn.add(fiveTicketLabel);

var subBtnView = Ti.UI.createView({
	width: "100%",
	height: "20%",
	top: 10,
	//backgroundColor: "yellow",
});
$.buyTickets.add(subBtnView);

var subscribeBtn = Ti.UI.createView({
	width: 150,
	height: 70,
	borderRadius: 10,
	backgroundGradient:{
		type: 'linear',
		startPoint:{x : "50%", y : "0%"},
		endPoint:{x:"50%", y : "100%"},
		colors: [{color: "#f09b00"}, {color: "#d85100"}],
	}
});
subBtnView.add(subscribeBtn);

var subscribeLabel = Ti.UI.createLabel({
	text: "Köp prenumeration",
	textAlign: "center",
	color: "#FFFFFF",
	font:{
		fontSize: 14,
		fontFamily: "Impact",
	}
});
subscribeBtn.add(subscribeLabel);
