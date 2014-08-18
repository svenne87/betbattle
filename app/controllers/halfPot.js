var args = arguments[0] || {};
var tickets = null;


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
function getUserTickets(){
	
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onerror = function(e) {
		//scrollView.add(Ti.UI.createLabel).setText(Alloy.Globals.PHRASES.unknownErrorTxt);
		Ti.API.error('Bad Sever =>' + e.error);
	};

	try {
		xhr.open('GET', Alloy.Globals.BETKAMPENGETTICKETS + '?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
		xhr.setRequestHeader("content-type", "application/json");
		xhr.setTimeout(Alloy.Globals.TIMEOUT);

		xhr.send();
	} catch(e) {
		//versusLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
		Ti.API.error("catch error" + e.error);
	}

	xhr.onload = function() {
		if (this.status == '200') {
			if (this.readyState == 4) {
					var ticketsDB = null;
				try {
					ticketsDB = JSON.parse(this.responseText);
				} catch (e) {
					ticketsDB = null;
					Ti.API.info("Tickets NULL");
				}

				if (ticketsDB !== null) {
					Ti.API.info("tickets: " + JSON.stringify(ticketsDB));
					tickets = ticketsDB;
					
					if(tickets ==  0){
						var infoText = Alloy.Globals.PHRASES.halfPotInfoTextFirst + tickets + Alloy.Globals.PHRASES.halfPotInfoTextMoreTickets + Alloy.Globals.PHRASES.halfPotBuyText;	
					}else if(tickets.length == 1){
						var infoText = Alloy.Globals.PHRASES.halfPotInfoTextFirst + tickets.length + Alloy.Globals.PHRASES.halfPotInfoTextOneTicket + Alloy.Globals.PHRASES.halfPotBuyMoreText;
					}else{
						var infoText = Alloy.Globals.PHRASES.halfPotInfoTextFirst + tickets.length + Alloy.Globals.PHRASES.halfPotInfoTextMoreTickets + Alloy.Globals.PHRASES.halfPotBuyMoreText;
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
				}
			}
			
		} else {
			//versusLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
			Ti.API.error("Error =>" + this.response);
		}
	};
	
};


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

getUserTickets();
yourTicketsBtn.addEventListener("click", function(e){
	var args = {
		Tickets : tickets,
	};
	var win = Alloy.createController('yourTickets', args).getView();
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
