var args = arguments[0] || {};

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
	top : 200,
	text : Alloy.Globals.PHRASES.loadingTxt
});

var fontawesome = require('lib/IconicFont').IconicFont({
	font : 'lib/FontAwesome'
});

var font = 'FontAwesome';

if (OS_ANDROID) {
	font = 'fontawesome-webfont';
}
var mod = require('bencoding.blur');
var openWindows = [];

var mainView = Ti.UI.createScrollView({
	class : "topView",
	height : "100%",
	width : "100%",
	top : 0,
	backgroundColor : "transparent",
	layout : "vertical"
});

var friendLabel = Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.myFriendsTxt,
	textAlign : "center",
	top : 10,
	font : {
		fontSize : 22,
		fontFamily : "Impact"
	},
	color : "#FFF"
});
mainView.add(friendLabel);

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
	text : Alloy.Globals.PHRASES.nameTxt,
	left : '10%',
	color : "#fff",
	font : {
		fontSize : 18,
		fontFamily : "Impact"
	},
});
infoTxt.add(nameInfo);

var scoreInfo = Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.deleteTxt,
	left : '82%',
	color : "#fff",
	font : {
		fontSize : 18,
		fontFamily : "Impact"
	},
});
infoTxt.add(scoreInfo);

function createGUI(obj) {
		var friend = Ti.UI.createView({
			top : 2,
			width : "100%",
			height : 45,
		});
			
	mainView.add(friend);

	var friendInfo = Ti.UI.createView({
		backgroundColor : '#fff',
		width : "78%",
		left : "1%",
		opacity : 0.7,
		borderRadius : 5
	});

	friend.add(friendInfo);
	friendInfo.addEventListener("click", function(e){
							
							if(OS_ANDROID){
								var w = Ti.UI.createView({
									height: "100%",
									width: "100%",
									backgroundColor: 'transparent',
									top: 0,
									left: 0,
									zIndex: "1000",
								});
								
								var blur = mod.createBasicBlurView({
									width: 150,
									height: 150,
									//image : e.source.image,
									borderRadius: 10,
									blurRadius : 35,
									//opacity: '0.5',
								});
								w.add(blur);
								
								var modal = Ti.UI.createView({
									height: 250,
									width: 250,
									backgroundColor: '#c5c5c5',
									borderRadius: 10,
									opacity: 0.5,
								});
								w.add(modal);
								
								var textWrapper = Ti.UI.createView({
									width: 150,
									height: 150,
								});
								w.add(textWrapper);
								
								var achievementTitle = Ti.UI.createLabel({
									text: Alloy.Globals.PHRASES.abortBtnTxt,
									textAlign: "center",
									color: "#FFFFFF",
									zIndex: "2000",
									font: {
										fontSize: 18,
										fontFamily: "Impact",
									},
									top:25,
								});
								textWrapper.add(achievementTitle);
								
								var achievementDescription = Ti.UI.createLabel({
									text: Alloy.Globals.PHRASES.abortBtnTxt,
									textAlign: "center",
									color: "#FFFFFF",
									width: "90%",
									zIndex: "2000",
									top: 50,
								});
								textWrapper.add(achievementDescription);
								
								textWrapper.addEventListener("click", function(e){
									modal.hide();
									w.hide();
									modal = null;
									w = null;
								});
								
								$.myFriends.add(w);
							}else{//iphone
								var t = Titanium.UI.create2DMatrix();
								t = t.scale(0);
								
								//create a transparent overlay that fills the screen to prevent openingen multiple windows
								var transparent_overlay = Ti.UI.createView({
									width: Ti.UI.FILL,
									height: Ti.UI.FILL,
									backgroundColor : 'transparent',
									top: 0, 
									left: 0,
									zIndex: 100,
								});
								$.myFriends.add(transparent_overlay);
								
								var w = Titanium.UI.createWindow({
									backgroundColor:'#ff00ff',
									//borderWidth:8,
									//borderColor:'#999',
									height:250,
									width:250,
									borderRadius:10,
									opacity:1,
									zIndex : 1000,
									transform:t
								});
								// create first transform to go beyond normal size
								var t1 = Titanium.UI.create2DMatrix();
								t1 = t1.scale(1.1);
								var a = Titanium.UI.createAnimation();
								a.transform = t1;
								a.duration = 200;
							
								// when this animation completes, scale to normal size
								a.addEventListener('complete', function()
								{
									Titanium.API.info('here in complete');
									var t2 = Titanium.UI.create2DMatrix();
									t2 = t2.scale(1.0);
									w.animate({transform:t2, duration:200});
							
								});
								
							
								var friendStats = Ti.UI.createLabel({
									text: 'Score',//Alloy.Globals.PHRASES.abortBtnTxt,
									textAlign: "center",
									color: "#FFFFFF",
									top:25,
									font: {
										fontSize: 18,
										fontFamily: "Impact",
									}
								});
								w.add(achievementTitle);
								
								var achievementDescription = Ti.UI.createLabel({
									text: Alloy.Globals.PHRASES.abortBtnTxt,
									textAlign: "center",
									color: "#FFFFFF",
									width: "90%",
									top: 50,
								});
								w.add(achievementDescription);
								
								w.addEventListener('click', function()
								{
									var t3 = Titanium.UI.create2DMatrix();
									t3 = t3.scale(0);
									w.close({transform:t3,duration:300});
									transparent_overlay.hide();
									transparent_overlay = null;
								});
								
								openWindows.push(w);
								transparent_overlay.add(w.open(a));
								//w.open(a);
								
							}
							
						});
	
	//profilepicture
	var image;
	if(obj.fbid !== null) {
		image = "https://graph.facebook.com/"+ obj.fbid +"/picture?type=large";
	} else {
		// get betkampen image
		image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + obj.id + '.png';
	}

	var profilePic = Titanium.UI.createImageView({
	image : image,
		height : 35,
		width : 35,
		left : '3%',
		borderRadius: 17
	});
	profilePic.addEventListener('error',function(e){
		// fallback for image
		profilePic.image = '/images/no_pic.png';
	});

	friendInfo.add(profilePic);

	boardName = obj.name.toString();
	if (boardName.length > 22) {
		boardName = boardName.substring(0, 22);
	}
	var name = Ti.UI.createLabel({
		text : boardName,
		left : '20%',
		font : {
			fontSize : 18,
			fontFamily : "Impact"
		},
	});
	friendInfo.add(name);

	var deleteBtn = Ti.UI.createButton({
		top : "0.4%",
		height : 45,
		width : '19%',
		left : '80%',
		id : obj.id,
		fName : obj.name,
		font : {
			fontFamily : font,
			fontSize : 32
		},
		title : fontawesome.icon('fa-trash-o'),
		backgroundColor : '#fff',
		color : '#000',
		opacity : 0.7,
		borderRadius : 5
	});
	friend.add(deleteBtn);

	deleteBtn.addEventListener('click', function(e) {

		//deletefriend
		var aL = Titanium.UI.createAlertDialog({
			title : Alloy.Globals.PHRASES.betbattleTxt,
			message : Alloy.Globals.PHRASES.removeFriendTxt + ' ' + e.source.fName,
			buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.abortBtnTxt],
			cancel : 1,
			id : e.source.id,
			fName : e.source.fName
		});

		aL.addEventListener('click', function(e) {
			switch(e.index) {
			case 0:
				var removeFriend = Ti.Network.createHTTPClient();
				removeFriend.open("POST", Alloy.Globals.BETKAMPENDELETEFRIENDURL);
				var params = {
					uid : Alloy.Globals.BETKAMPENUID,
					fid : e.source.id
				};
				removeFriend.send(params);
				//Ti.API.info(params);
				//deleteBtn.visible = false;
				//friendInfo.borderColor = '#ff0000';
				var win = Alloy.createController('myFriends').getView();
						if (OS_IOS) {
							Alloy.Globals.NAV.openWindow(win, {
								animated : false
							});
						} else {
							win.open({
								fullScreen : true
							});
							win = null;
						}
						$.myFriends.close();
						Alloy.Globals.showToast(e.source.fName + ' ' + Alloy.Globals.PHRASES.groupMemberDeletedTxt);
						
				break;
			case 1:
				Titanium.API.info('cancel');
				break;
			}

		});
		aL.show();

	});

}

function createBtn() {
	var addFriendsLabel = Ti.UI.createLabel({
		text : Alloy.Globals.PHRASES.noFriendsTxt,
		textAlign : "center",
		top : 10,
		font : {
			fontSize : 22,
			fontFamily : "Impact"
		},
		color : "#FFF"
	});
	mainView.add(addFriendsLabel);

	var openFriendSearchBtn = Ti.UI.createButton({
		height : 40,
		width : '60%',
		left : '20%',
		top : '0.5%',
		title : Alloy.Globals.PHRASES.addFriendsTxt,
		backgroundColor : '#FFF',
		color : '#000',
		borderRadius : 5
	});
	mainView.add(openFriendSearchBtn);

	openFriendSearchBtn.addEventListener('click', function(e) {
		var win = Alloy.createController('friendSearch').getView();
		if (OS_IOS) {
			Alloy.Globals.NAV.openWindow(win, {
				animated : true
			});
		} else {
			win.open({
				fullScreen : true
			});
			win = null;
		}
		$.myFriends.close();
	});

}
var friends = null;

var xhr = Ti.Network.createHTTPClient({
	// function called when the response data is available
	onload : function(e) {
		Ti.API.info("Received text: " + this.responseText);
		friends = JSON.parse(this.responseText);
		if (friends.length == 0) {
			createBtn();
		} else {
			friends.sort(function(a, b) {
				var x = a.name.toLowerCase();
				var y = b.name.toLowerCase();
				return ((x < y) ? -1 : ((x > y) ? 1 : 0));
			});
			for (var i = 0; i < friends.length; i++) {
				//alert(friends[i].name);
				createGUI(friends[i]);
			}
		}
		indicator.closeIndicator();
	},
	// function called when an error occurs, including a timeout
	onerror : function(e) {
		Ti.API.debug(e.error);
		indicator.closeIndicator();
		//alert('error');
	},
	timeout : Alloy.Globals.TIMEOUT // in milliseconds
});
// Prepare the connection.
xhr.open('GET', Alloy.Globals.BETKAMPENGETFRIENDSURL + '?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);

xhr.setRequestHeader("content-type", "application/json");
xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
xhr.setTimeout(Alloy.Globals.TIMEOUT);

if(OS_IOS){
	indicator.openIndicator();
}

xhr.send();

if(OS_ANDROID){
	$.myFriends.addEventListener('open', function() {
		$.myFriends.activity.actionBar.onHomeIconItemSelected = function() {
			$.myFriends.close();
			$.myFriends = null;
		};
		$.myFriends.activity.actionBar.displayHomeAsUp = true;
		$.myFriends.activity.actionBar.title = Alloy.Globals.PHRASES.betbattleTxt;
			
		// sometimes the view remain in memory, then we don't need to show the "loading"
		if(!friends) {
			indicator.openIndicator();
		}
	});
}
$.myFriends.addEventListener('close', function() {
	indicator.closeIndicator();
});


$.myFriends.add(mainView);

$.myFriends.addEventListener('close', function() {
	if(openWindows.length > 0) {
		for(var i = 0; i < openWindows.length; i++) {
			openWindows[i].close();
		}	
	}
});