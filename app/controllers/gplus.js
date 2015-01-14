var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

var context;
var url = Alloy.Globals.PHRASES.shareUrlLink;
var win = $.gplus;
var isAndroid = false;

if (OS_ANDROID) {
    isAndroid = true;
    $.gplus.orientationModes = [Titanium.UI.PORTRAIT];

    $.gplus.addEventListener('open', function() {
        Alloy.Globals.setAndroidCouponMenu($.gplus.activity);

        $.gplus.activity.actionBar.onHomeIconItemSelected = function() {
            $.gplus.close();
            $.gplus = null;
        };
        $.gplus.activity.actionBar.displayHomeAsUp = true;
        $.gplus.activity.actionBar.title = Alloy.Globals.PHRASES.shareGoogleTxt;
        indicator.openIndicator();
    });

} else {
    $.gplus.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.shareGoogleTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });
}

//display loading spinner until webview gets loaded
var extwebview;

if (OS_ANDROID) {
    context = require('lib/Context');
    
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

win.addEventListener('close', function() {
    indicator.closeIndicator();
});

win.add(extwebview);
//adding webview in current window

function onOpen(evt) {
    if(isAndroid) {
        context.on('gPlusActivity', this.activity);
    }
}

function onClose(evt) {
    if(isAndroid) {
        context.off('gPlusActivity');
    }
}