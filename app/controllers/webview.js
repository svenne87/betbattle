var args = arguments[0] || {};

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});
var extwebview;
var url = Alloy.Globals.BETKAMPENURL + args.link;
var win = $.webview;

if (OS_ANDROID) {
    $.webview.orientationModes = [Titanium.UI.PORTRAIT];

    $.webview.addEventListener('open', function() {
        $.webview.activity.actionBar.onHomeIconItemSelected = function() {
            $.webview.close();
            $.webview = null;
        };
        $.webview.activity.actionBar.displayHomeAsUp = true;
        $.webview.activity.actionBar.title = Alloy.Globals.PHRASES.betbattleTxt;
        indicator.openIndicator();
    });

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
    $.webview.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.betbattleTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });

    indicator.openIndicator();

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

win.addEventListener('close', function() {
    indicator.closeIndicator();
});

win.add(extwebview);
//adding webview in current window

