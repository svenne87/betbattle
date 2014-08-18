var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
	top : 200,
	text : Alloy.Globals.PHRASES.loadingTxt
});

var url = 'https://plus.google.com/share?url=http://itunes.apple.com/app/id884939881';
var win = $.gplus;

if(OS_ANDROID){
	$.gplus.orientationModes = [Titanium.UI.PORTRAIT];

	$.gplus.addEventListener('open', function(){
		$.gplus.activity.actionBar.onHomeIconItemSelected = function() { $.gplus.close(); $.gplus = null; };
   		$.gplus.activity.actionBar.displayHomeAsUp = true;
   		$.gplus.activity.actionBar.title = Alloy.Globals.PHRASES.betbattleTxt;
		indicator.openIndicator();
	});
/*
	$.gplus.addEventListener('androidback', function(){
    	$.gplus.close();   	
    	$.gplus = null;
	});
*/	
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
//extwebview.hideLoadIndicator = true;

extwebview.addEventListener('load', function() {
	indicator.closeIndicator();
	//Hide the Loading indicator after the webview loaded
});


win.addEventListener('close', function(){
	indicator.closeIndicator();
});

win.add(extwebview);
//adding webview in current window


