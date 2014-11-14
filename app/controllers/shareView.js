var fontawesome = require('lib/IconicFont').IconicFont({
    font : 'lib/FontAwesome'
});

var font = 'FontAwesome';

if (OS_ANDROID) {
    font = 'fontawesome-webfont';
    $.share.orientationModes = [Titanium.UI.PORTRAIT];

    $.share.addEventListener('open', function() {
        Alloy.Globals.setAndroidCouponMenu($.share.activity);

        $.share.activity.actionBar.onHomeIconItemSelected = function() {
            $.share.close();
            $.share = null;
        };
        $.share.activity.actionBar.displayHomeAsUp = true;
        $.share.activity.actionBar.title = Alloy.Globals.PHRASES.shareTxt;
    });
} else {
    $.share.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.shareTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });
}

var mainView = Ti.UI.createScrollView({
    class : "topView",
    height : "100%",
    width : "100%",
    top : 0,
    backgroundColor : "transparent",
    layout : "vertical"
});

//----------------------------------------------------------------------EMAIL-----------------------------------------------------------------------------
var mailBtn = Alloy.Globals.createButtonView("#FFF", "#000", Alloy.Globals.PHRASES.sendMailTxt);
mainView.add(mailBtn);

var mailIconLabel = Titanium.UI.createLabel({
    font : {
        fontFamily : font,
        fontSize : 22
    },
    text : fontawesome.icon('fa-file-text-o'),
    left : '5%',
    color : '#000',
});
mailBtn.add(mailIconLabel);

//----------------------------------------------------------------------SMS-----------------------------------------------------------------------------
var smsBtn = Alloy.Globals.createButtonView("#FFF", "#000", Alloy.Globals.PHRASES.sendSMSTxt);
mainView.add(smsBtn);

var smsIconLabel = Titanium.UI.createLabel({
    font : {
        fontFamily : font,
        fontSize : 22
    },
    text : fontawesome.icon('fa-mobile'),
    left : '5%',
    color : '#000',
});
smsBtn.add(smsIconLabel);


//----------------------------------------------------------------------FACEBOOK-----------------------------------------------------------------------------

    var fbUserBtn = Alloy.Globals.createButtonView('#3B5998', '#FFF', Alloy.Globals.PHRASES.shareFBTxt);
    mainView.add(fbUserBtn);

    var fbIconLabel = Titanium.UI.createLabel({
        font : {
            fontFamily : font,
            fontSize : 22
        },
        text : fontawesome.icon('fa-facebook'),
        left : '5%',
        color : '#fff',
    });
    fbUserBtn.add(fbIconLabel);


//-------------------------------------------------------------------TWITTER--------------------------------------------------------------------------------
if (OS_IOS) {
    if (Titanium.Platform.canOpenURL('twitter://')) {

        var twitterBtn = Alloy.Globals.createButtonView("#00ACED", "#FFF", Alloy.Globals.PHRASES.shareTwitterTxt);
        mainView.add(twitterBtn);

        var twitterIconLabel = Titanium.UI.createLabel({
            font : {
                fontFamily : font,
                fontSize : 22
            },
            text : fontawesome.icon('fa-twitter'),
            left : '5%',
            color : '#fff',
        });
        twitterBtn.add(twitterIconLabel);

    }
} else {
    var twitterBtn = Alloy.Globals.createButtonView("#00ACED", "#FFF", Alloy.Globals.PHRASES.shareTwitterTxt);
    mainView.add(twitterBtn);

    var twitterIconLabel = Titanium.UI.createLabel({
        font : {
            fontFamily : font,
            fontSize : 22
        },
        text : fontawesome.icon('fa-twitter'),
        left : '5%',
        color : '#fff',
    });
    twitterBtn.add(twitterIconLabel);

}
//---------------------------------------------------------------------------------------------------------------------------------------------------
var googleBtn = Alloy.Globals.createButtonView("#DD4B39", "#FFF", Alloy.Globals.PHRASES.shareGoogleTxt);
mainView.add(googleBtn);

var gplusIconLabel = Titanium.UI.createLabel({
    font : {
        fontFamily : font,
        fontSize : 22
    },
    text : fontawesome.icon('fa-google-plus'),
    left : '5%',
    color : '#fff',
});
googleBtn.add(gplusIconLabel);

// functions for the buttons

// --------------------------------------------------------------- Share to FACEBOOK  ------------------------------------------------------------------------------
// if user login with facebook

    var fb;
    
    if (Alloy.Globals.FACEBOOKOBJECT != null) {
        fb = Alloy.Globals.FACEBOOK;
    } else {
        fb = require("com.facebook");
    }

    fbUserBtn.addEventListener('click', function(e) {
        if (Alloy.Globals.checkConnection()) {
            if(fb.getCanPresentShareDialog()) {
                performFacebookPost(fb); 
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.fbShareErrorTxt);   
            }
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        }

    });
    
    var uie = require('lib/IndicatorWindow');
    var indicator = uie.createIndicatorWindow({
        top : 200,
        text : Alloy.Globals.PHRASES.loadingTxt
    });

    function performFacebookPost(fb) {

        var data = {
            url : Alloy.Globals.PHRASES.appLinkTxt,
            namespaceObject : 'betbattle:bet',
            objectName : 'bet',
            imageUrl : Alloy.Globals.BETKAMPENURL + '/images/betbattle.png',
            title : Alloy.Globals.PHRASES.fbPostCaptionTxt,
            description : Alloy.Globals.PHRASES.fbPostDescriptionTxt,
            namespaceAction : 'betbattle:place'
        }; 

        Alloy.Globals.unlockAchievement(5);
        fb.share(data);
    }

// --------------------------------------------------------------- Share to TWITTER  -------------------------------------------------------------------------------
if (OS_IOS) {
    if (Titanium.Platform.canOpenURL('twitter://')) {
        twitterBtn.addEventListener('click', function(e) {
            Alloy.Globals.unlockAchievement(5);
            Titanium.Platform.openURL('twitter://post?message=' + Alloy.Globals.PHRASES.twitterMsg + "\n" + Alloy.Globals.PHRASES.appLinkTxt);
        });
    }
} else if (OS_ANDROID) {
    function shareToTwitter() {
        try {
            var intTwitter = Ti.Android.createIntent({
                action : Ti.Android.ACTION_SEND,
                packageName : 'com.twitter.android',
                flags : Ti.Android.FLAG_ACTIVITY_NEW_TASK,
                type : 'text/plain'
            });
            intTwitter.putExtra(Ti.Android.EXTRA_TEXT, Alloy.Globals.PHRASES.twitterMsg + "\n" + Alloy.Globals.PHRASES.appLinkTxt);
            Alloy.Globals.unlockAchievement(5);
            Ti.Android.currentActivity.startActivity(intTwitter);
        } catch(x) {
            alert(Alloy.Globals.PHRASES.notInstalledTxt + ' ' + 'Twitter');
        }
    }


    twitterBtn.addEventListener('click', function(e) {
        shareToTwitter();
    });

}

// --------------------------------------------------------------- Share to GOOGLE+  -------------------------------------------------------------------------------

var goWin = Alloy.createController('gplus').getView();

googleBtn.addEventListener('click', function(e) {
    Alloy.Globals.unlockAchievement(5);
    if (OS_IOS) {
        Alloy.Globals.NAV.openWindow(goWin, {
            animated : true
        });
    } else if (OS_ANDROID) {
        goWin.open({
            fullScreen : true
        });
    }
});

// iPhone buttons

// --------------------------------------------------------------- Send EMAIL  ----------------------------------------------------------------------------

var emailDialog = Titanium.UI.createEmailDialog();
emailDialog.subject = Alloy.Globals.PHRASES.mailSubject;
emailDialog.messageBody = Alloy.Globals.PHRASES.mailMsg + '\n' + Alloy.Globals.PHRASES.appLinkTxt;

mailBtn.addEventListener('click', function(e) {
    Alloy.Globals.unlockAchievement(5);
    emailDialog.open();
});

// --------------------------------------------------------------- Send SMS  -------------------------------------------------------------------------------
if (OS_IOS) {
    var sms = require('bencoding.sms').createSMSDialog({
        barColor : '#336699'
    });
    sms.setMessageBody(Alloy.Globals.PHRASES.smsMsg + '\n' + Alloy.Globals.PHRASES.appLinkTxt);

    smsBtn.addEventListener('click', function(e) {
        Alloy.Globals.unlockAchievement(5);
        sms.open();
    });

} else if (OS_ANDROID) {

    var intent = Ti.Android.createIntent({
        action : Ti.Android.ACTION_SENDTO,
        data : 'smsto:'
    });
    intent.putExtra('sms_body', "'" + Alloy.Globals.PHRASES.smsMsg + "\n" + Alloy.Globals.PHRASES.appLinkTxt + "'");

    smsBtn.addEventListener('click', function(e) {
        Alloy.Globals.unlockAchievement(5);
        Ti.Android.currentActivity.startActivity(intent);
    });

}

$.share.add(mainView);
