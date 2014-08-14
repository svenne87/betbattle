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

for(var i = 0; i < 5; i++){
	var ticketView  = Ti.UI.createView({
		width: "30%",
		height: 80,
		backgroundColor: "white",
		right: 10,
		top: 10,
		borderRadius: 5,
	});
	
	var ticketLabel = Ti.UI.createLabel({
		text: "D"+i+2+"F",
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


$.yourTickets.add(scrollView);
