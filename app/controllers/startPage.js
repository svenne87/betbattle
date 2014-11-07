/*

var args = arguments[0] || {};
var isAndroid = false;
Alloy.Globals.LANDINGWIN = $.startPage;

if (OS_ANDROID) {
    isAndroid = true;
    $.landingPage.activity.actionBar.hide();
    Ti.Gesture.addEventListener('orientationchange', function(e) {
        Ti.Android.currentActivity.setRequestedOrientation(Ti.Android.SCREEN_ORIENTATION_PORTRAIT);
    });
    $.landingPage.orientationModes = [Titanium.UI.PORTRAIT];
} else {
    Alloy.Globals.NAV = $.nav;
    $.landingPage.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.betbattleTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });
}

var beacons = [];

function getBeacons() {
Ti.API.info("getBeacons");
if (Alloy.Globals.checkConnection()) {
// show indicator and disable button

var xhr = Titanium.Network.createHTTPClient();
xhr.onerror = function(e) {
Ti.API.error('Bad Sever =>' + e.error);
};

try {
xhr.open('GET', Alloy.Globals.BETKAMPENGETGETBEACONSURL + '?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
xhr.setRequestHeader("content-type", "application/json");
//xhr.setRequestHeader("Authorization", Alloy.Globals.FACEBOOK.accessToken);
xhr.setTimeout(Alloy.Globals.TIMEOUT);

xhr.send();
} catch(e) {
Ti.API.info("ERROR CATCH");
Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
}
xhr.onload = function() {
Ti.API.info("ONLOAD " + JSON.stringify(this));
if (this.status == '200') {

if (this.readyState == 4) {
Ti.API.log("respoooonse-------------->: " + this.responseText);
var beacons = JSON.parse(this.responseText);

if (OS_IOS) {
Alloy.Globals.TiBeacon.addEventListener("changeAuthorizationStatus", function(e) {
if (e.status != "authorized") {
Ti.API.error("not authorized");
}
});

var dialogShown = false;
Alloy.Globals.TiBeacon.addEventListener("bluetoothStatus", function(e) {
if (e.status != "on" && !dialogShown && appResume != 0) {
dialogShown = true;
var dialog = Ti.UI.createAlertDialog({
message : Alloy.Globals.PHRASES.activateBlutoothMsg,
title : 'Bluetooth',
ok : 'Ok',
});
//dialog.show();
}
});

Alloy.Globals.TiBeacon.requestBluetoothStatus();

function enterRegion(e) {
for (var i = 0; i < beacons.length; i++) {
Ti.API.info("BEACON FOUND ID : " + e.identifier);
Ti.API.info("BEACON RETREIVED ID : " + beacons[i].identifier);

if (e.identifier == beacons[i].identifier) {
if (Alloy.Globals.appStatus == 'foreground') {
getPromotion(beacons[i].id);
} else if (Alloy.Globals.appStatus == 'background') {
Alloy.Globals.sendLocalNotification("Kampanj", "Du har hittat en ny kampanj!", beacons[i].id);
}

}
}

Alloy.Globals.TiBeacon.startRangingForBeacons(e);
}

function exitRegion(e) {
for (var i = 0; i < beacons.length; i++) {
if (e.identifier == beacons[i].identifier) {
//alert("Du lämnar konferensrumemt nu. Tack för besöket!");
}
}

}

function updateInformation(e) {
/*if (e.identifier == 'conference' && e.proximity == "near"){
//alert("Du är i konferensrummet nu. Grattis!");
}else if (e.identifier == 'hall' && e.proximity == "near"){
//alert("Du är i hallen nu. Grattis!");
}else if (e.identifier == 'kitchen' && e.proximity == "near"){
//alert("Du är i köket! Glöm inte kaffet!");
}*/
/*       }

Alloy.Globals.TiBeacon.addEventListener("enteredRegion", enterRegion);
Alloy.Globals.TiBeacon.addEventListener("beaconProximity", updateInformation);
Alloy.Globals.TiBeacon.addEventListener("exitedRegion", exitRegion);

for (var i = 0; i < beacons.length; i++) {
Alloy.Globals.TiBeacon.startMonitoringForRegion({
uuid : beacons[i].uuid,
identifier : beacons[i].identifier,
major : beacons[i].major,
minor : beacons[i].minor
});
}

} else if (OS_ANDROID) {

if (Ti.Platform.version >= 4.3) {

Alloy.Globals.TiBeacon.initBeacon({
success : onSuccess,
error : onError,
interval : 5,
region : onRegion,
found : onFound,
});

function onSuccess(e) {
Ti.API.info("SUCCESS : " + JSON.stringify(e));
}

function onRegion(e) {
Ti.API.info("BEACON : " + JSON.stringify(e));
e = e.device;
for (var i = 0; i < beacons.length; i++) {
if (e.uuidDashed == beacons[i].uuid) {
if (e.major == beacons[i].major && e.minor == beacons[i].minor) {
//getPromotion(beacons[i].id);
Ti.API.info("BEACON ON REGION");
}
}
}
}

function onFound(e) {
Ti.API.info("FOUND : " + JSON.stringify(e));
e = e.device;
for (var i = 0; i < beacons.length; i++) {
if (e.uuidDashed == beacons[i].uuid) {
if (e.major == beacons[i].major && e.minor == beacons[i].minor) {
if (Alloy.Globals.appStatus == 'foreground') {
getPromotion(beacons[i].id);
} else if (Alloy.Globals.appStatus == 'background') {
Alloy.Globals.sendLocalNotification("Kampanj", "Du har hittat en ny kampanj!", beacons[i].id);
}
}
}
}
}

function onError(e) {
Ti.API.info("ERROR BEACON : " + JSON.stringify(e));
}

if (Alloy.Globals.TiBeacon.isEnabled()) {
Alloy.Globals.TiBeacon.startScanning();
}

}

}
} else {
Ti.API.error("ERROR: " + this);
Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
}
} else {
Ti.API.error("Error =>" + this.response);
Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
}
};

} else {
Ti.API.info("NO CONNECTION");
Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
}
}

function createBeaconDialog(msg, title, link, beacon) {
var dialog = Ti.UI.createAlertDialog({
cancel : 1,
buttonNames : [Alloy.Globals.PHRASES.confirmBtnTxt, Alloy.Globals.PHRASES.abortBtnTxt],
message : msg,
title : title,
});
dialog.addEventListener('click', function(e) {
if (e.index === e.source.cancel) {
Ti.API.info('The cancel button was clicked');
} else {
Ti.API.info(link);
beacon = true;
}
});
dialog.show();
}

function getPromotion(beaconID) {
if (Alloy.Globals.checkConnection()) {
// show indicator and disable button

var xhr = Titanium.Network.createHTTPClient();
xhr.onerror = function(e) {
Ti.API.error('Bad Sever =>' + e.error);
};

try {
xhr.open('GET', Alloy.Globals.BETKAMPENGETPROMOTIONURL + '?beaconID=' + beaconID + '&lang=' + Alloy.Globals.LOCALE);
xhr.setRequestHeader("content-type", "application/json");
//xhr.setRequestHeader("Authorization", Alloy.Globals.FACEBOOK.accessToken);
xhr.setTimeout(Alloy.Globals.TIMEOUT);

xhr.send();
} catch(e) {
Ti.API.info("ERROR CATCH");
Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
}
xhr.onload = function() {
Ti.API.info("ONLOAD " + JSON.stringify(this));
if (this.status == '200') {

if (this.readyState == 4) {
//Ti.API.log("respoooonse: " +this.responseText);
var promo = JSON.parse(this.responseText);

if (promo.type == 1) {
createPromoTypeOne(promo);
}
if (promo.type == 2) {
createPromoTypeTwo(promo);
}
if (promo.type == 3) {
createPromoTypeThree(promo);
}

} else {
Ti.API.error("ERROR: " + this);
Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
}
} else {
Ti.API.error("Error =>" + this.response);
Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
}
};

} else {
Ti.API.info("NO CONNECTION");
Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
}
}

function createPromoTypeOne(promo) {
w = null;
w = Ti.UI.createWindow({
title : promo.title,
backgroundColor : "#000",
layout : "vertical",
height : "90%",
}),
b = Titanium.UI.createButton({
title : Alloy.Globals.PHRASES.promoCloseBtnTxt
});
w.title = promo.title;
w.barColor = 'black';

w.add(b);

b.addEventListener('click', function() {
w.close();
beaconIsOpen = false;
});

var titleView = Ti.UI.createLabel({
width : "100%",
height : "10%",
text : promo.title,
textAlign : "center",
color : "#FFF",
font : {
fontSize : 18,
fontFamily : "Impact",
}
});
w.add(titleView);

var image = Ti.UI.createImageView({
image : Alloy.Globals.BETKAMPENURL + '/promotions/images/' + promo.image,
width : "100%",
height : "45%",
});
w.add(image);

var text = Ti.UI.createLabel({
width : "100%",
height : "45%",
text : promo.text,
textAlign : "center",
color : "#FFF",
font : {
fontSize : 16,
fontFamily : "Impact",
}
});
w.add(text);
if (beaconIsOpen == false) {
w.open({
modal : true
});
beaconIsOpen = true;
}

}

function createPromoTypeTwo(promo) {
w = null;
w = Ti.UI.createWindow({
title : promo.title,
backgroundColor : "#000",
layout : "vertical",
height : "90%",
});
b = Titanium.UI.createButton({
title : Alloy.Globals.PHRASES.promoCloseBtnTxt
});

w.title = promo.title;
w.barColor = 'black';
w.add(b);
b.addEventListener('click', function() {
w.close();
beaconIsOpen = false;
});

var image = Ti.UI.createImageView({
image : Alloy.Globals.BETKAMPENURL + '/promotions/images/' + promo.image,
width : "100%",
height : "100%",
});
w.add(image);
if (beaconIsOpen == false) {
w.open({
modal : true
});
beaconIsOpen = true;
}

}

function createPromoTypeThree(promo) {
w = null;
w = Ti.UI.createWindow({
title : promo.title,
backgroundColor : "#000",
layout : "vertical",
height : "90%",
});
b = Titanium.UI.createButton({
title : Alloy.Globals.PHRASES.promoCloseBtnTxt
});

w.title = promo.title;
w.barColor = 'black';
w.add(b);
b.addEventListener('click', function() {
w.close();
beaconIsOpen = false;
});

var titleView = Ti.UI.createLabel({
width : "100%",
height : "10%",
text : promo.title,
textAlign : "center",
color : "#FFF",
font : {
fontSize : 18,
fontFamily : "Impact",
}
});
w.add(titleView);

var image = Ti.UI.createImageView({
image : Alloy.Globals.BETKAMPENURL + '/promotions/images/' + promo.image,
width : "100%",
height : "40%",
});
w.add(image);

var text = Ti.UI.createLabel({
width : "100%",
height : "35%",
text : promo.text,
textAlign : "center",
color : "#FFF",
font : {
fontSize : 16,
fontFamily : "Impact",
}
});
w.add(text);

var btn = Ti.UI.createView({
width : "50%",
height : "10%",
backgroundColor : "#c5c5c5",
});

var btnText = Ti.UI.createLabel({
text : promo.title,
textAlign : "center",
font : {
fontSize : 14,
fontFamily : "Impact",
},
color : "#000",
});

btn.add(btnText);
w.add(btn);
btn.addEventListener("click", function(e) {
w.close();
Ti.API.info("CLICKAR");
var win = Alloy.createController(promo.button_link).getView();
if (OS_IOS) {
Alloy.Globals.NAV.openWindow(win, {
animated : true
});
//Alloy.Globals.INDEXWIN = win;
win = null;
} else if (OS_ANDROID) {
win.open({
fullScreen : true
});
}
});
if (beaconIsOpen == false) {
w.open({
modal : true
});
beaconIsOpen = true;
}

}

var top_view = Ti.UI.createView({
id : "top_view",
backgroundColor : "#303030",
height : "75%",
width : "100%",
//top: "10%",
layout : "vertical"
});

var bot_view = Ti.UI.createView({
backgroundColor : "#303030",
id : "bot_view",
height : "25%",
width : "100%",
layout : "horizontal"
});

var top_img = Ti.UI.createView({
backgroundImage : "/images/top_img.png",
height : "33.33%",
width : "100%"
});

var mid_img = Ti.UI.createView({
backgroundImage : "/images/mid_img.png",
height : "33.33%",
width : "100%"
});

var bot_img = Ti.UI.createView({
backgroundImage : "/images/bot_img.png",
height : "33.33%",
width : "100%"
});

//create views to act as borders
var border1 = Ti.UI.createView({
width : "100%",
height : 2,
backgroundColor : "orange",
bottom : "0px"
});

var border2 = Ti.UI.createView({
width : "100%",
height : 2,
backgroundColor : "orange",
bottom : "0px"
});

var border3 = Ti.UI.createView({
width : "100%",
height : 2,
backgroundColor : "orange",
bottom : "0px"
});

//Add the black transparent view with the text inside.
var blackLabelTop = Ti.UI.createView({
height : "25%",
width : "100%",
backgroundColor : "#000",
opacity : "0.6",
bottom : 2
});
var blackLabelMid = Ti.UI.createView({
height : "25%",
width : "100%",
backgroundColor : "#000",
opacity : "0.6",
bottom : 2
});
var blackLabelBot = Ti.UI.createView({
height : "25%",
width : "100%",
backgroundColor : "#000",
opacity : "0.6",
bottom : 2
});

top_img.add(Ti.UI.createLabel({
text : Alloy.Globals.PHRASES.landingPageHalfPot,
zIndex : "100",
height : "25%",
width : "60%",
color : "#FFF",
left : 10,
bottom : 1,
font : Alloy.Globals.getFontCustom(18, "Bold")
}));

top_img.add(Ti.UI.createLabel({
text : Alloy.Globals.PHRASES.landingPageHalfPotBtn,
zIndex : "100",
height : "25%",
width : "30%",
color : "#FFF",
textAlign : "right",
right : 25,
bottom : 1,
font : Alloy.Globals.getFontCustom(12, "Bold")
}));
top_img.add(Ti.UI.createView({
width : 8,
height : 8,
zIndex : "110",
backgroundImage : "/images/arrow.png",
right : 10,
bottom : 10
}));

top_img.addEventListener("click", function(e) {
// check connection
if (!Alloy.Globals.checkConnection()) {
Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
return;
}

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
text : Alloy.Globals.PHRASES.landingPageMatch,
zIndex : "100",
height : "25%",
width : "80%",
backgroundColor : "red",
color : "#FFF",
left : 10,
bottom : 1,
font : Alloy.Globals.getFontCustom(18, "Bold")
}));
mid_img.add(Ti.UI.createLabel({
text : Alloy.Globals.PHRASES.landingPageMatchBtn,
zIndex : "100",
height : "25%",
width : "30%",
color : "#FFF",
textAlign : "right",
right : 25,
bottom : 1,
font : Alloy.Globals.getFontCustom(12, "Bold")
}));
mid_img.add(Ti.UI.createView({
width : 8,
height : 8,
zIndex : "110",
backgroundImage : "/images/arrow.png",
right : 10,
bottom : 10
}));

var custom_font = "Base02";
if (OS_ANDROID) {
custom_font = "Base-02";
}
bot_img.add(Ti.UI.createLabel({
text : Alloy.Globals.PHRASES.landingPageZone,
zIndex : "100",
height : "25%",
width : "60%",
color : "#FFF",
left : 10,
bottom : 1,
font : Alloy.Globals.getFontCustom(18, "Bold")
}));
bot_img.add(Ti.UI.createLabel({
text : Alloy.Globals.PHRASES.landingPageZoneBtn,
zIndex : "100",
height : "25%",
width : "30%",
textAlign : "right",
color : "#FFF",
right : 25,
bottom : 1,
font : Alloy.Globals.getFontCustom(12, "Bold")
}));
bot_img.add(Ti.UI.createView({
width : 8,
height : 8,
zIndex : "110",
backgroundImage : "/images/arrow.png",
right : 10,
bottom : 10
}));

//create the two buttons at the bottom
var inviteBtn = Ti.UI.createView({
width : "50%",
height : "100%",
backgroundImage : "/images/inviteBtn.png",
left : "0px"
});

var profileBtn = Ti.UI.createView({
width : "50%",
height : "100%",
backgroundImage : "/images/profileBtn.png",
left : "0px"
});

profileBtn.add(Ti.UI.createLabel({
height : "20%",
width : "100%",
textAlign : "center",
bottom : 20,
font : Alloy.Globals.getFontCustom(18, "Bold"),
color : "#FFF",
text : Alloy.Globals.PHRASES.landingPageProfileBtn
}));

profileBtn.addEventListener("click", function(e) {
// check connection
if (!Alloy.Globals.checkConnection()) {
Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
return;
}

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
height : "20%",
width : "100%",
textAlign : "center",
bottom : "20%",
font : Alloy.Globals.getFontCustom(18, "Bold"),
color : "#FFF",
text : Alloy.Globals.PHRASES.landingPageInviteBtnBot
}));

inviteBtn.add(Ti.UI.createLabel({
height : "20%",
width : "100%",
textAlign : "left",
bottom : "40%",
left : "20%",
font : Alloy.Globals.getFontCustom(18, "Bold"),
color : "#FFF",
text : Alloy.Globals.PHRASES.landingPageInviteBtnTop
}));

inviteBtn.addEventListener("click", function(e) {
var win = Alloy.createController('shareView').getView();
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
});

function createTopView(resp) {

var img = "";
if (resp !== null) {
img = resp.image;
} else {
img = "/images/top_img.png";
}
top_img = Ti.UI.createView({
backgroundImage : img,
height : "33.33%",
width : "100%"
});

mid_img = Ti.UI.createView({
backgroundImage : "/images/mid_img.png",
height : "33.33%",
width : "100%"
});

bot_img = Ti.UI.createView({
backgroundImage : "/images/bot_img.png",
height : "33.33%",
width : "100%"
});

//create views to act as borders
var border1 = Ti.UI.createView({
width : "100%",
height : 2,
backgroundColor : "orange",
bottom : "0px"
});

var border2 = Ti.UI.createView({
width : "100%",
height : 2,
backgroundColor : "orange",
bottom : "0px"
});

var border3 = Ti.UI.createView({
width : "100%",
height : 2,
backgroundColor : "orange",
bottom : "0px"
});

//Add the black transparent view with the text inside.
var blackLabelTop = Ti.UI.createView({
height : "25%",
width : "100%",
backgroundColor : "#000",
opacity : "0.6",
bottom : 2
});
var blackLabelMid = Ti.UI.createView({
height : "25%",
width : "100%",
backgroundColor : "#000",
opacity : "0.6",
bottom : 2
});
var blackLabelBot = Ti.UI.createView({
height : "25%",
width : "100%",
backgroundColor : "#000",
opacity : "0.6",
bottom : 2
});
var labelText = "";
var btnLabelTxt = "";
if (resp !== null) {
labelText = resp.title;
btnLabelTxt = "";
} else {
labelText = Alloy.Globals.PHRASES.landingPageHalfPot;
btnLabelTxt = Alloy.Globals.PHRASES.landingPageHalfPotBtn;
}
top_img.add(Ti.UI.createLabel({
text : labelText,
zIndex : "100",
height : "25%",
width : "60%",
color : "#FFF",
left : 10,
bottom : 1,
font : Alloy.Globals.getFontCustom(18, "Bold")
}));

top_img.add(Ti.UI.createLabel({
text : btnLabelTxt,
zIndex : "100",
height : "25%",
width : "30%",
color : "#FFF",
textAlign : "right",
right : 25,
bottom : 1,
font : Alloy.Globals.getFontCustom(12, "Bold")
}));
top_img.add(Ti.UI.createView({
width : 8,
height : 8,
zIndex : "110",
backgroundImage : "/images/arrow.png",
right : 10,
bottom : 10
}));

if (resp !== null) {
top_img.addEventListener("click", function(e) {
var params = {
link : resp.url
};
var win = Alloy.createController('webview', params).getView();
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
} else {
top_img.addEventListener("click", function(e) {

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
}

mid_img.add(Ti.UI.createLabel({
text : Alloy.Globals.PHRASES.landingPageMatch,
zIndex : "100",
height : "25%",
width : "70%",
color : "#FFF",
left : 10,
bottom : 1,
font : Alloy.Globals.getFontCustom(18, "Bold")
}));
mid_img.add(Ti.UI.createLabel({
text : Alloy.Globals.PHRASES.landingPageMatchBtn,
zIndex : "100",
height : "25%",
width : "30%",
color : "#FFF",
textAlign : "right",
right : 25,
bottom : 1,
font : Alloy.Globals.getFontCustom(12, "Bold")
}));
mid_img.add(Ti.UI.createView({
width : 8,
height : 8,
zIndex : "110",
backgroundImage : "/images/arrow.png",
right : 10,
bottom : 10
}));

var custom_font = "Base02";
if (OS_ANDROID) {
custom_font = "Base-02";
}
bot_img.add(Ti.UI.createLabel({
text : Alloy.Globals.PHRASES.landingPageZone,
zIndex : "100",
height : "25%",
width : "60%",
color : "#FFF",
left : 10,
bottom : 1,
font : Alloy.Globals.getFontCustom(18, "Bold")
}));
bot_img.add(Ti.UI.createLabel({
text : Alloy.Globals.PHRASES.landingPageZoneBtn,
zIndex : "100",
height : "25%",
width : "30%",
textAlign : "right",
color : "#FFF",
right : 25,
bottom : 1,
font : Alloy.Globals.getFontCustom(12, "Bold")
}));
bot_img.add(Ti.UI.createView({
width : 8,
height : 8,
zIndex : "110",
backgroundImage : "/images/arrow.png",
right : 10,
bottom : 10
}));

bot_img.addEventListener("click", function(e) {
// check connection
if (!Alloy.Globals.checkConnection()) {
Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
return;
}

indicator.openIndicator();
args.dialog = indicator;

var loginSuccessWindow = Alloy.createController('main', args).getView();
if (OS_IOS) {
loginSuccessWindow.open({
fullScreen : true,
});
} else if (OS_ANDROID) {
loginSuccessWindow.open({
fullScreen : true,
navBarHidden : false,
orientationModes : [Titanium.UI.PORTRAIT]
});
}
loginSuccessWindow = null;
});

///Get the match for "Matchens Mästare"
var matchWrapperView = Ti.UI.createView({
width : "50%",
height : "70%",
layout : "horizontal",
top : 0,
});

team1Logo = Ti.UI.createImageView({
width : 50,
height : 50,
});

matchWrapperView.add(team1Logo);

var versusLabel = Ti.UI.createLabel({
width : "30%",
height : "100%",
text : "VS",
textAlign : "center",
color : "#FFFFFF",
font : Alloy.Globals.getFontCustom(22, "Bold")
});
matchWrapperView.add(versusLabel);

team2Logo = Ti.UI.createImageView({
width : 50,
height : 50,
});
matchWrapperView.add(team2Logo);

mid_img.add(matchWrapperView);

top_img.add(border1);
mid_img.add(border2);
bot_img.add(border3);

top_img.add(blackLabelTop);
mid_img.add(blackLabelMid);
bot_img.add(blackLabelBot);

top_view.add(top_img);
top_view.add(mid_img);
top_view.add(bot_img);

$.landingPage.remove(loadingLabel);
}

function createBotView() {
//create the two buttons at the bottom
var inviteBtn = Ti.UI.createView({
width : "50%",
height : "100%",
backgroundImage : "/images/inviteBtn.png",
left : "0px"
});

var profileBtn = Ti.UI.createView({
width : "50%",
height : "100%",
backgroundImage : "/images/profileBtn.png",
left : "0px"
});

profileBtn.add(Ti.UI.createLabel({
height : "20%",
width : "100%",
textAlign : "center",
bottom : 20,
font : Alloy.Globals.getFontCustom(18, "Bold"),
color : "#FFF",
text : Alloy.Globals.PHRASES.landingPageProfileBtn
}));

profileBtn.addEventListener("click", function(e) {
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
height : "20%",
width : "100%",
textAlign : "center",
bottom : "20%",
font : Alloy.Globals.getFontCustom(18, "Bold"),
color : "#FFF",
text : Alloy.Globals.PHRASES.landingPageInviteBtnBot
}));

inviteBtn.add(Ti.UI.createLabel({
height : "20%",
width : "100%",
textAlign : "left",
bottom : "40%",
left : "20%",
font : Alloy.Globals.getFontCustom(18, "Bold"),
color : "#FFF",
text : Alloy.Globals.PHRASES.landingPageInviteBtnTop
}));

inviteBtn.addEventListener("click", function(e) {
var win = Alloy.createController('shareView').getView();
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
});
bot_view.add(profileBtn);
bot_view.add(inviteBtn);
}

///Get the match for "Matchens Mästare"
var matchWrapperView = Ti.UI.createView({
width : "50%",
height : "70%",
layout : "horizontal",
top : 0,
});

var team1Logo = Ti.UI.createImageView({
width : 50,
height : 50,
});
matchWrapperView.add(team1Logo);

var versusLabel = Ti.UI.createLabel({
width : "30%",
height : "100%",
text : "VS",
textAlign : "center",
color : "#FFFFFF",
font : Alloy.Globals.getFontCustom(22, "Bold")
});
matchWrapperView.add(versusLabel);

var team2Logo = Ti.UI.createImageView({
width : 50,
height : 50,
});
matchWrapperView.add(team2Logo);

mid_img.add(matchWrapperView);

function getTopImgView() {
if (Alloy.Globals.checkConnection()) {
$.landingPage.add(loadingLabel);
var xhr = Titanium.Network.createHTTPClient();
xhr.onerror = function(e) {
versusLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
Ti.API.error('Bad Sever =>' + e.error);
};

try {
xhr.open('GET', Alloy.Globals.BETKAMPENGETTOPLANDINGPAGE + '?lang=' + Alloy.Globals.LOCALE + '&location=landingPage');
xhr.setRequestHeader("content-type", "application/json");
xhr.setTimeout(Alloy.Globals.TIMEOUT);

xhr.send();
} catch(e) {
versusLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
$.landingPage.remove(loadingLabel);
}

xhr.onload = function() {
if (this.status == '200') {
if (this.readyState == 4) {
var resp = null;
try {
Ti.API.info("RESPONSE INNAN PARSE : " + JSON.stringify(this.responseText));
resp = JSON.parse(this.responseText);

} catch (e) {
resp = null;
//Ti.API.info("Match NULL");
}

if (resp !== null) {
Ti.API.info("RESPONSE TOP : " + JSON.stringify(resp));
createTopView(resp);
createBotView();
getMatchOfTheDay();
} else {
Ti.API.info("RESPONSE TOP = NULL");
createTopView(resp);
createBotView();
getMatchOfTheDay();
}
}

} else {
$.landingPage.remove(loadingLabel);
versusLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
Ti.API.error("Error =>" + this.response);
}
};
} else {
Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
}
}

function isLowerCase(str) {
return str === str.toLowerCase();
}

function getMatchOfTheDay() {
// check connection
if (!Alloy.Globals.checkConnection()) {
Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
return;
}

$.landingPage.add(loadingLabel);

var xhr = Titanium.Network.createHTTPClient();
xhr.onerror = function(e) {
versusLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
Ti.API.error('Bad Sever =>' + e.error);
$.landingPage.remove(loadingLabel);
};

try {
xhr.open('GET', Alloy.Globals.BETKAMPENGETMOTDINFO + '?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
xhr.setRequestHeader("content-type", "application/json");
xhr.setTimeout(Alloy.Globals.TIMEOUT);

xhr.send();
} catch(e) {
versusLabel.setText(Alloy.Globals.PHRASES.unknownErrorTxt);
$.landingPage.remove(loadingLabel);
}

xhr.onload = function() {
if (this.status == '200') {
if (this.readyState == 4) {
$.landingPage.remove(loadingLabel);
var match = null;
try {
match = JSON.parse(this.responseText);
Ti.API.info("MATCH : " + JSON.stringify(match));
} catch (e) {
match = null;
Ti.API.info("Match NULL");
}

if (match !== null) {
team1Logo.image = Alloy.Globals.BETKAMPENURL + match.team1_image;
team2Logo.image = Alloy.Globals.BETKAMPENURL + match.team2_image;

// fix for images delivered from us/api
if (!isLowerCase(match.team1_image)) {
team1Logo.width = 30;
team1Logo.height = 30;
}

// fix for images delivered from us/api
if (!isLowerCase(match.team2_image)) {
team2Logo.width = 30;
team2Logo.height = 30;
}

mid_img.addEventListener("click", function(e) {
// check connection
var argss = {
match : match
};
var win = Alloy.createController('matchDay', argss).getView();
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
$.landingPage.remove(loadingLabel);
}
};

};

//create the topView and the botView that will contain everything
var top_view = Ti.UI.createView({
id : "top_view",
backgroundColor : "#303030",
height : "75%",
width : "100%",
//top: "10%",
layout : "vertical"
});

var bot_view = Ti.UI.createView({
backgroundColor : "#303030",
id : "bot_view",
height : "25%",
width : "100%",
layout : "horizontal"
});

//declare the views for each section
var top_img;
var mid_img;
var bot_img;

//delcare the logo variables to getMatchOfTheDay function can access them
var team1Logo;
var team2Logo;

if (OS_ANDROID) {
$.landingPage.addEventListener('open', function() {
getTopImgView();
$.landingPage.add(top_view);
$.landingPage.add(bot_view);
getBeacons();

});
} else if (OS_IOS) {
$.landingPage.addEventListener('open', function() {
//fill each section and view with content
getTopImgView();
$.landingPage.add(top_view);
$.landingPage.add(bot_view);
getBeacons();
});
}
*/

/*var test = {
title: "Hamburgarmeny!",
text: "Passa på idag! Innan matchen är slut kostar en meny endast 25kr. Visa oss att du har appen installerad på mobilen för att få ta del av erbjudandet.",
image: "hamburger-menu.png",
button_link: "halfPot",
};
createPromoTypeThree(test);

// fetch coupon here to keep it up to date in all views
//Alloy.Globals.getCoupon();

 */
