var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
	top : 200
});

var url = Alloy.Globals.BETKAMPENURL + '/webviews/scoreboard_wv.php';

var win = $.scoreView;

if(OS_ANDROID){
	$.scoreView.orientationModes = [Titanium.UI.PORTRAIT];
	
	$.scoreView.addEventListener('open', function(){
		$.scoreView.activity.actionBar.onHomeIconItemSelected = function() { $.scoreView.close(); $.scoreView = null; };
   		$.scoreView.activity.actionBar.displayHomeAsUp = true;
   		$.scoreView.activity.actionBar.title = 'Betkampen';
		indicator.openIndicator();
	});
/*	
	$.scoreView.addEventListener('androidback', function(){
    	$.scoreView.close();   	
    	$.scoreView = null;
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
win.add(extwebview);
//adding webview in current window

extwebview.addEventListener('load', function() {
	indicator.closeIndicator();
	//Hide the Loading indicator after the webview loaded
});


win.addEventListener('close', function(){
	indicator.closeIndicator();
});

