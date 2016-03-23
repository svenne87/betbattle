var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

var args = arguments[0] || {};
var url = Alloy.Globals.BETKAMPENURL + args.url;
var extwebview;
var context;
var isAndroid = false;

if (OS_ANDROID) {
    isAndroid = true;
    context = require('lib/Context');
    $.dynamicWebViewWin.orientationModes = [Titanium.UI.PORTRAIT];

    $.dynamicWebViewWin.addEventListener('open', function() {
        $.dynamicWebViewWin.activity.actionBar.onHomeIconItemSelected = function() {
            if($.dynamicWebViewWin) {
            	$.dynamicWebViewWin.close();
            	$.dynamicWebViewWin = null;
            }
        };
        $.dynamicWebViewWin.activity.actionBar.displayHomeAsUp = true;
        $.dynamicWebViewWin.activity.actionBar.title = args.title;
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
    $.dynamicWebViewWin.titleControl = Ti.UI.createLabel({
        text : args.title,
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

$.dynamicWebViewWin.addEventListener('close', function() {
    indicator.closeIndicator();
});

$.dynamicWebViewWin.add(extwebview);
//adding webview in current window

function onOpen(evt) {
    if(isAndroid) {
        context.on('dynamicWebViewActivity', this.activity);
    }
}

function onClose(evt) {
    if(isAndroid) {
        context.off('dynamicWebViewActivity');
    }
}
