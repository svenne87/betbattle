var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
	top : 200
});

var url = Alloy.Globals.BETKAMPENURL + '/webviews/terms_wv.php';
var win = $.terms;

if(OS_ANDROID){
	$.terms.orientationModes = [Titanium.UI.PORTRAIT];

	$.terms.addEventListener('open', function(){
		$.terms.activity.actionBar.onHomeIconItemSelected = function() { $.terms.close(); $.terms = null; };
   		$.terms.activity.actionBar.displayHomeAsUp = true;
   		$.terms.activity.actionBar.title = 'Betkampen';
		indicator.openIndicator();
	});
/*
	$.terms.addEventListener('androidback', function(){
    	$.terms.close();   	
    	$.terms = null;
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


