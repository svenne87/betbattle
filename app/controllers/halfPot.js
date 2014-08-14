var args = arguments[0] || {};

var topView = Ti.UI.createView({
	height: "50%",
	width: "100%",
	top: 0,
});

var botView = Ti.UI.createView({
	height: "50%",
	width: "100%",
	//backgroundColor: "#383838",
	//layout: "horizontal",
	bottom: 0,
});

var potAmountView = Ti.UI.createView({
	height: "100%",
	width: "100%",
	backgroundColor : "#eaeaea",
	opacity: "0.3",
});
topView.add(potAmountView);

var potAmountLabelTop = Ti.UI.createLabel({
	height: "100%",
	width: "100%",
	top: -30,
	text: Alloy.Globals.PHRASES.halfPotCurrentLabel,
	textAlign : "center",
	color: "#FFFFFF",
	zIndex : "100",
	font:{
		fontSize: 22,
		fontFamily: "Impact",
	}
});
topView.add(potAmountLabelTop);

var potAmountLabelBottom = Ti.UI.createLabel({
	height: "100%",
	width: "100%",
	top: 30,
	text: "134 000 "+Alloy.Globals.PHRASES.currency,
	textAlign: "center",
	color: "#FFFFFF",
	zIndex: "100",
	font:{
		fontSize: 38,
		fontFamily: "Impact",
	}
});
topView.add(potAmountLabelBottom);
var tickets = 5;
if(tickets < 1){
	var infoText = Alloy.Globals.PHRASES.halfPotInfoTextFirst + tickets + Alloy.Globals.PHRASES.halfPotInfoTextMoreTickets + Alloy.Globals.PHRASES.halfPotBuyText;	
}else if(tickets == 1){
	var infoText = Alloy.Globals.PHRASES.halfPotInfoTextFirst + tickets + Alloy.Globals.PHRASES.halfPotInfoTextOneTicket + Alloy.Globals.PHRASES.halfPotBuyMoreText;
}else{
	var infoText = Alloy.Globals.PHRASES.halfPotInfoTextFirst + tickets + Alloy.Globals.PHRASES.halfPotInfoTextMoreTickets + Alloy.Globals.PHRASES.halfPotBuyMoreText;
}


var lotteryInfoLabel = Ti.UI.createLabel({
	height:"30%",
	width: "100%",
	//backgroundColor: "",
	top: 0,
	text: infoText,
	textAlign: "center",
	color: "#FFFFFF",
});
botView.add(lotteryInfoLabel);

var yourTicketsBtn = Ti.UI.createView({
	left: 10,
	bottom: 20,
    width: 140,
    height: 100,
    borderRadius: 10,
    backgroundGradient: {
        type: 'linear',
        startPoint: { x: '50%', y: '0%' },
        endPoint: { x: '50%', y: '100%' },
        colors: [ { color: '#f09b00'}, { color: '#d85100'} ],
    }
});

yourTicketsBtn.addEventListener("click", function(e){
	var win = Alloy.createController('yourTickets').getView();
		if (OS_IOS) {
			Alloy.Globals.NAV.openWindow(win, {
				animated : true
			});
		} else {
			win.open({
				fullScreen : true
			});
		}
});

var yourTicketsLabel = Ti.UI.createLabel({
	text: Alloy.Globals.PHRASES.yourTicketsBtn,
	textAlign: "center",
	color: "#FFFFFF",
	font:{
		fontSize: 18,
		fontFamily: "Impact",
	}
});
yourTicketsBtn.add(yourTicketsLabel);

botView.add(yourTicketsBtn);



var buyTicketsBtn = Ti.UI.createView({
	right: 10,
	bottom: 20,
	width: 140,
	height: 100,
	borderRadius: 10,
	backgroundGradient : {
		type: 'linear',
		startPoint: {x : '50%', y : '0%'},
		endPoint : {x: '50%', y : '100%'},
		colors: [{color: '#0a3258'}, {color: '#071e34'}],
	}	
});

buyTicketsBtn.addEventListener("click", function(e){
	var win = Alloy.createController('buyTickets').getView();
		if (OS_IOS) {
			Alloy.Globals.NAV.openWindow(win, {
				animated : true
			});
		} else {
			win.open({
				fullScreen : true
			});
		}
});

var buyTicketsLabel = Ti.UI.createLabel({
	text: Alloy.Globals.PHRASES.buyTicketsBtn,
	textAlign: "center",
	color: "#FFFFFF",
	font:{
		fontSize: 18,
		fontFamily: "Impact",
	}
});
buyTicketsBtn.add(buyTicketsLabel);

botView.add(buyTicketsBtn);


$.halfPot.add(topView);
$.halfPot.add(botView);
