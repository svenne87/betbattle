var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
	top : 200
});

var url = Alloy.Globals.BETKAMPENURL + '/webviews/profile_wv.php?fbid=' + Alloy.Globals.FACEBOOKOBJECT.id + '&uid=' + Alloy.Globals.BETKAMPENUID + '&authorization=' + Alloy.Globals.FACEBOOK.accessToken;
var win = $.profile;

if(OS_ANDROID){
	$.profile.orientationModes = [Titanium.UI.PORTRAIT];
	
	$.profile.addEventListener('open', function(){
		$.profile.activity.actionBar.onHomeIconItemSelected = function() { $.profile.close(); $.profile = null; };
   		$.profile.activity.actionBar.displayHomeAsUp = true;
   		$.profile.activity.actionBar.title = 'Betkampen';
		indicator.openIndicator();
	});


} else {
	indicator.openIndicator();
}
//display loading spinner until webview gets loaded
var extwebview;

if (OS_ANDROID) {
	extwebview = Titanium.UI.createWebView({
		top : 0,
		left : 0,
		right : 0,
		url : url,
		height : Ti.UI.FILL,
		width : Ti.UI.FILL,
		backgroundColor : '#303030',
		softKeyboardOnFocus : Titanium.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS
	});
} else {
	extwebview = Titanium.UI.createWebView({
		top : 0,
		left : 0,
		right : 0,
		url : url,
		height : Ti.UI.FILL,
		width : Ti.UI.FILL,
		backgroundColor : '#303030'
	});
}

extwebview.hideLoadIndicator = true;
extwebview.addEventListener('load', function() {
	indicator.closeIndicator();
	//Hide the Loading indicator after the webview loaded
});


win.addEventListener('close', function(){
	indicator.closeIndicator();
});

win.add(extwebview);
//adding webview in current window


