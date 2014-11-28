var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

var url = Alloy.Globals.BETKAMPENURL + '/webviews/terms_wv.php';
var win = $.terms;
var extwebview;

if (OS_ANDROID) {
    $.terms.orientationModes = [Titanium.UI.PORTRAIT];

    $.terms.addEventListener('open', function() {
        $.terms.activity.actionBar.onHomeIconItemSelected = function() {
            $.terms.close();
            $.terms = null;
        };
        $.terms.activity.actionBar.displayHomeAsUp = true;
        $.terms.activity.actionBar.title = Alloy.Globals.PHRASES.termsTxt;
        indicator.openIndicator();
    });
    extwebview = Titanium.UI.createWebView({
        top : 0,
        left : 0,
        right : 0,
        url : url,
        height : Ti.UI.FILL,
        width : Ti.UI.FILL,
        backgroundColor : '#000',
        softKeyboardOnFocus : Titanium.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS
    });

} else {
    $.terms.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.termsTxt,
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
        backgroundColor : '#000'
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

