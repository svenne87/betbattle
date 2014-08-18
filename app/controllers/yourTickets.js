var args = arguments[0] || {};

var scrollView = Ti.UI.createScrollView({
	contentWidth:Ti.UI.FILL,
	contentHeight:Ti.UI.SIZE,
	top:10,
	left: 20,
	showVerticalScrollIndicator:true,
	showHorizontalScrollIndicator:false,
	layout:"horizontal",
});

function getUserTickets(){
	
	
					var tickets = args.Tickets;
					Ti.API.info("tickets: " + JSON.stringify(tickets));
					if(tickets == 0){
						var ticketView = Ti.UI.createView({
							width: "100%",
							height: "100%",
							backgroundColor: 'transparent',
						});
						
						var ticketLabel = Ti.UI.createLabel({
							text: Alloy.Globals.PHRASES.yourTicketsNoTickets,
							textAlign: "center",
							color: "white",
							font : {
								fontSize: 38,
								fontFamily: "Impact",
							}
						});
						ticketView.add(ticketLabel);
						scrollView.add(ticketView);
					}else{
						for(var i = 0; i < tickets.length; i++){
						var ticketView  = Ti.UI.createView({
							width: "30%",
							height: 80,
							backgroundColor: "white",
							right: 10,
							top: 10,
							borderRadius: 5,
						});
						
						var ticketLabel = Ti.UI.createLabel({
							text: tickets[i].ticket,
							textAlign: "center",
							color: "black",
							font:{
								fontSize: 28,
								fontFamily: "Impact",
							}
						});
						ticketView.add(ticketLabel);
						
						scrollView.add(ticketView);	
					}	
					}
					
};


getUserTickets();
$.yourTickets.add(scrollView);
