var args = arguments[0] || {};


var top_view = Ti.UI.createView({
	id: "top_view",
	backgroundColor: "white",
	height: "75%",
	width: "100%",
	//top: "10%",
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
	backgroundImage: "/images/top_img.png",
	height: "33.33%",
	width:"100%"
});

var mid_img = Ti.UI.createView({
	backgroundImage: "/images/mid_img.png",
	height: "33.33%",
	width:"100%"
});

var bot_img = Ti.UI.createView({
	backgroundImage: "/images/bot_img.png",
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
	text: Alloy.Globals.PHRASES.landingPageHalfPot,
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
	text:Alloy.Globals.PHRASES.landingPageHalfPotBtn,
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
	backgroundImage: "/images/arrow.png",
	right:10,
	bottom:10
}));

top_img.addEventListener("click", function(e){
	
		var win = Alloy.createController('halfPot').getView();
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

mid_img.add(Ti.UI.createLabel({
	text: Alloy.Globals.PHRASES.landingPageMatch,
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
	text:Alloy.Globals.PHRASES.landingPageMatchBtn,
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
	backgroundImage: "/images/arrow.png",
	right:10,
	bottom:10
}));


var custom_font = "Base02";
if(Ti.Platform.osname == "Android"){
	custom_font = "Base-02";
}
bot_img.add(Ti.UI.createLabel({
	text: Alloy.Globals.PHRASES.landingPageZone,
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
	text:Alloy.Globals.PHRASES.landingPageZoneBtn,
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
	backgroundImage: "/images/arrow.png",
	right:10,
	bottom:10
}));

//create the two buttons at the bottom
var inviteBtn = Ti.UI.createView({
	width:"50%",
	height:"100%",
	backgroundImage: "/images/inviteBtn.png",
	left: "0px"
});

var profileBtn = Ti.UI.createView({
	width:"50%",
	height:"100%",
	backgroundImage: "/images/profileBtn.png",
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
	text: Alloy.Globals.PHRASES.landingPageProfileBtn
}));

profileBtn.addEventListener("click", function(e){
	var win = Alloy.createController('profile').getView();
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
	text: Alloy.Globals.PHRASES.landingPageInviteBtnBot
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
	text: Alloy.Globals.PHRASES.landingPageInviteBtnTop
}));

inviteBtn.addEventListener("click", function(e){
	var win = Alloy.createController('shareView').getView();
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
	
	});
	
}


///Get the match for "Matchens Mästare"
var matchWrapperView = Ti.UI.createView({
	width: "50%",
	height: "70%",
	layout: "horizontal",
	top: 0,
});

var team1Logo = Ti.UI.createImageView({
	width: 50,
	height: 50,
});
matchWrapperView.add(team1Logo);

var versusLabel = Ti.UI.createLabel({
	width: "30%",
	height: "100%",
	text: "VS",
	textAlign: "center",
	color: "#FFFFFF",
	font:{
		fontSize: 22,
		fontFamily: "Impact",
	}
});
matchWrapperView.add(versusLabel);

var team2Logo = Ti.UI.createImageView({
	width: 50,
	height: 50,
});
matchWrapperView.add(team2Logo);


mid_img.add(matchWrapperView);

function getMatchOfTheDay(){
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onerror = function(e) {
		versusLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
		Ti.API.error('Bad Sever =>' + e.error);
	};

	try {
		xhr.open('GET', Alloy.Globals.BETKAMPENGETMOTDINFO + '?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
		xhr.setRequestHeader("content-type", "application/json");
		xhr.setTimeout(Alloy.Globals.TIMEOUT);

		xhr.send();
	} catch(e) {
		versusLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
	}

	xhr.onload = function() {
		if (this.status == '200') {
			if (this.readyState == 4) {
					var match = null;
				try {
					match = JSON.parse(this.responseText);
				} catch (e) {
					match = null;
					Ti.API.info("Match NULL");
				}

				if (match !== null) {
					team1Logo.image = Alloy.Globals.BETKAMPENURL + match.team1_image;
					team2Logo.image = Alloy.Globals.BETKAMPENURL + match.team2_image;
					
					mid_img.addEventListener("click", function(e){
						var arg = {
							round : match.roundID,
							leagueName : match.leagueName,
							leagueId : match.leagueID
						};
					
						var win = Alloy.createController('challenge', arg).getView();
						Alloy.Globals.WINDOWS.push(win);
					
						if (OS_IOS) {
							Alloy.Globals.NAV.openWindow(win, {
								animated : true
							});
						} else if (OS_ANDROID) {
							win.open({
								fullScreen : true
							});
						}
					});
				}
			}
			
		} else {
			versusLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
			Ti.API.error("Error =>" + this.response);
		}
	};
	
};

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
getMatchOfTheDay();
$.landingPage.add(top_view);
$.landingPage.add(bot_view);
