var args = arguments[0] || {};
var top_view = Ti.UI.createView({
	id: "top_view",
	backgroundColor: "white",
	height: "65%",
	width: "100%",
	top: "10%",
	layout: "vertical"
});

var bot_view = Ti.UI.createView({
	backgroundColor: "white",
	id: "bot_view",
	height:"25%",
	width:"100%",
	layout: "horizontal"
});


var top_img = Ti.UI.createView({
	backgroundImage: "images/top_img.png",
	height: "33.33%",
	width:"100%"
});

var mid_img = Ti.UI.createView({
	backgroundImage: "images/mid_img.png",
	height: "33.33%",
	width:"100%"
});

var bot_img = Ti.UI.createView({
	backgroundImage: "images/bot_img.png",
	height: "33.33%",
	width:"100%"
});

//create views to act as borders
var border1 = Ti.UI.createView({
	width:"100%",
	height:2,
	backgroundColor: "orange",
	bottom:"0px"
});

var border2 = Ti.UI.createView({
	width:"100%",
	height:2,
	backgroundColor: "orange",
	bottom:"0px"
});


var border3 = Ti.UI.createView({
	width:"100%",
	height:2,
	backgroundColor: "orange",
	bottom:"0px"
});

//Add the black transparent view with the text inside.
var blackLabelTop = Ti.UI.createView({
	height: "25%",
	width:"100%",
	backgroundColor: "#000",
	opacity: "0.6",
	bottom: 2
});
var blackLabelMid = Ti.UI.createView({
	height: "25%",
	width:"100%",
	backgroundColor: "#000",
	opacity: "0.6",
	bottom: 2
});
var blackLabelBot = Ti.UI.createView({
	height: "25%",
	width:"100%",
	backgroundColor: "#000",
	opacity: "0.6",
	bottom: 2
});


top_img.add(Ti.UI.createLabel({
	text: "HALVA POTTEN",
	zIndex:"100",
	height:"25%",
	width:"60%",
	color:"#FFF",
	left:10,
	bottom:1,
	font: {
		fontSize: '20',
		fontFamily: 'Impact'
	}
}));

top_img.add(Ti.UI.createLabel({
	text:"INSATS 20kr",
	zIndex : "100",
	height:"25%",
	width: "30%",
	color:"#FFF",
	textAlign: "right",
	right:25,
	bottom:1,
	font:{
		fontSize: '14',
		fontFamily: 'Impact'
	}
}));
top_img.add(Ti.UI.createView({
	width:8,
	height:8,
	zIndex: "110",
	backgroundImage: "images/arrow.png",
	right:10,
	bottom:10
}));

mid_img.add(Ti.UI.createLabel({
	text: "BLI MATCHENS MÄSTARE",
	zIndex:"100",
	height:"25%",
	width:"60%",
	color:"#FFF",
	left:10,
	bottom:1,
	font: {
		fontSize: '20',
		fontFamily: 'Impact'
	}
}));
mid_img.add(Ti.UI.createLabel({
	text:"SPELA NU",
	zIndex : "100",
	height:"25%",
	width: "30%",
	color:"#FFF",
	textAlign: "right",
	right:25,
	bottom:1,
	font:{
		fontSize: '14',
		fontFamily: 'Impact'
	}
}));
mid_img.add(Ti.UI.createView({
	width:8,
	height:8,
	zIndex: "110",
	backgroundImage: "images/arrow.png",
	right:10,
	bottom:10
}));

var custom_font = "Base02";
if(Ti.Platform.osname == "Android"){
	custom_font = "Base-02";
}
bot_img.add(Ti.UI.createLabel({
	text: "CHALLENGE ZONE",
	zIndex:"100",
	height:"25%",
	width:"60%",
	color:"#FFF",
	left:10,
	bottom:1,
	font: {
		fontSize: '20',
		fontFamily: custom_font
	}
}));
bot_img.add(Ti.UI.createLabel({
	text:"UTMANA",
	zIndex : "100",
	height:"25%",
	width: "30%",
	textAlign: "right",
	color:"#FFF",
	right:25,
	bottom:1,
	font:{
		fontSize: '14',
		fontFamily: 'Impact'
	}
}));
bot_img.add(Ti.UI.createView({
	width:8,
	height:8,
	zIndex: "110",
	backgroundImage: "images/arrow.png",
	right:10,
	bottom:10
}));

//create the two buttons at the bottom
var inviteBtn = Ti.UI.createView({
	width:"50%",
	height:"100%",
	backgroundImage: "images/inviteBtn.png",
	left: "0px"
});

var profileBtn = Ti.UI.createView({
	width:"50%",
	height:"100%",
	backgroundImage: "images/profileBtn.png",
	left: "0px"
});

profileBtn.add(Ti.UI.createLabel({
	height:"20%",
	width:"100%",
	textAlign: "center",
	bottom: 20,
	font: {
		fontSize:'20',
		fontFamily: 'Impact'
	},
	color: "#FFF",
	text: "DIN PROFIL"
}));

inviteBtn.add(Ti.UI.createLabel({
	height:"20%",
	width:"100%",
	textAlign: "center",
	bottom:20,
	font:{
		fontSize:'20',
		fontFamily: 'Impact'
	},
	color:"#FFF",
	text: "DINA VÄNNER"
}));

inviteBtn.add(Ti.UI.createLabel({
	height:"20%",
	width:"100%",
	textAlign: "left",
	bottom:45,
	left: 28,
	font:{
		fontSize:'20',
		fontFamily: 'Impact'
	},
	color:"#FFF",
	text: "BJUD IN"
}));

bot_img.addEventListener("click", function(e){
				if (OS_IOS) {
					var loginSuccessWindow = Alloy.createController('main', args).getView();
					loginSuccessWindow.open({
						fullScreen : true,
						transition : Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT
					});
					loginSuccessWindow = null;

				} else if (OS_ANDROID) {
					var loginSuccessWindow = Alloy.createController('main', args).getView();
					loginSuccessWindow.open({
						fullScreen : true,
						navBarHidden : false,
						orientationModes : [Titanium.UI.PORTRAIT]
					});
					loginSuccessWindow = null;
				}
});

if(OS_IOS){
	Alloy.Globals.NAV = $.nav;
	var iOSVersion;

	if(OS_IOS){
		iOSVersion = parseInt(Ti.Platform.version);
	}
	
	if(iOSVersion < 7){
		$.landingPage.titleControl = Ti.UI.createLabel({
    	text : 'Betkampen',
    	font : {
        	fontSize : Alloy.Globals.getFontSize(2),
       	 	fontWeight : 'bold',
        	fontFamily : Alloy.Globals.getFont()
    	},
    		color : 'white'
		});
	} else {
		$.nav.add($.UI.create('ImageView', {
			classes : ['navLogo']
		}));
	}
}else{
	Ti.Gesture.addEventListener('orientationchange', function(e) {
 		Ti.Android.currentActivity.setRequestedOrientation(Ti.Android.SCREEN_ORIENTATION_PORTRAIT);
    });
	
	$.landingPage.orientationModes = [Titanium.UI.PORTRAIT];	
	$.landingPage.addEventListener('open', function(){	
	
	
}

top_img.add(border1);
mid_img.add(border2);
bot_img.add(border3);

top_img.add(blackLabelTop);
mid_img.add(blackLabelMid);
bot_img.add(blackLabelBot);

top_view.add(top_img);
top_view.add(mid_img);
top_view.add(bot_img);

bot_view.add(profileBtn);
bot_view.add(inviteBtn);

$.landingPage.add(top_view);
$.landingPage.add(bot_view);
