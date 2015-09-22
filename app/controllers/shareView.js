var fontawesome = require('lib/IconicFont').IconicFont({
    font : 'lib/FontAwesome'
});

var context;
var font = 'FontAwesome';
var isAndroid = false;

if (OS_ANDROID) {
    context = require('lib/Context');
    isAndroid = true;
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

function onOpen(evt) {
    if (isAndroid) {
        context.on('shareViewActivity', this.activity);
    }
}

function onClose(evt) {
    if (isAndroid) {
        context.off('shareViewActivity');
    }
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
var mailBtn = Alloy.Globals.createButtonView(Alloy.Globals.themeColor(), "#FFF", Alloy.Globals.PHRASES.sendMailTxt);
mainView.add(mailBtn);

var mailIconLabel = Titanium.UI.createLabel({
    font : {
        fontFamily : font,
        fontSize : 22
    },
    text : fontawesome.icon('fa-file-text-o'),
    left : '5%',
    color : '#FFF',
});
mailBtn.add(mailIconLabel);

//----------------------------------------------------------------------SMS-----------------------------------------------------------------------------
var smsBtn = Alloy.Globals.createButtonView(Alloy.Globals.themeColor(), "#FFF", Alloy.Globals.PHRASES.sendSMSTxt);
mainView.add(smsBtn);

var smsIconLabel = Titanium.UI.createLabel({
    font : {
        fontFamily : font,
        fontSize : 22
    },
    text : fontawesome.icon('fa-mobile'),
    left : '5%',
    color : '#FFF',
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
    if (isAndroid) {
        $.share.fbProxy = Alloy.Globals.FACEBOOK.createActivityWorker({
            lifecycleContainer : $.share
        });
        fb = Alloy.Globals.FACEBOOK;
    } else {
        fb = Alloy.Globals.FACEBOOK;
    }
} else {
    if (isAndroid) {
        var fbModule = require('facebook');
        $.share.fbProxy = fbModule.createActivityWorker({
            lifecycleContainer : $.share
        });
        fb = fbModule;
    } else {
        fb = require("facebook");
    }
}

/*
 
 var fb = require('facebook');
        fb.dialog('apprequests', {
            title: 'My title',
            message: 'My message'
        }, function (e) {
            Ti.API.debug(JSON.stringify(e));     
        });
        
        Request Dialog
 * */



fbUserBtn.addEventListener('click', function(e) {
    if (Alloy.Globals.checkConnection()) {
        if (isAndroid) {
            //if (fb.canPresentOpenGraphActionDialog) {
            performFacebookPost(fb);
            //} else {
            //    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.fbShareErrorTxt);
            //}
        } else {
            //if (fb.getCanPresentShareDialog()) {
            performFacebookPost(fb);
            //} else {
            //    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.fbShareErrorTxt);
            //}
        }
    } else {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }
});

function performFacebookPost(fb) {
	fb.presentSendRequestDialog({
        message: Alloy.Globals.PHRASES.fbPostDescriptionTxt + "." + "\n" + Alloy.Globals.PHRASES.myNameIsTxt + ": " + Alloy.Globals.PROFILENAME,
        title: Alloy.Globals.PHRASES.fbPostCaptionTxt,
        data: {
            player_name: Alloy.Globals.PROFILENAME
        },
        // to : '123456789, 123456788', lista vänner med permission user_friends
    });
   
    fb.addEventListener('requestDialogCompleted', function (e) {
        if (e.success) {
             Alloy.Globals.unlockAchievement(5);
        }
    });

/*
    var data = {
        url : Alloy.Globals.PHRASES.appLinkTxt,
        namespaceObject : 'betbattle:bet',
        objectName : 'bet',
        imageUrl : Alloy.Globals.BETKAMPENURL + '/images/betbattle.png',
        title : Alloy.Globals.PHRASES.fbPostCaptionTxt,
        description : Alloy.Globals.PHRASES.fbPostDescriptionTxt + "." + "\n" + Alloy.Globals.PHRASES.myNameIsTxt + ": " + Alloy.Globals.PROFILENAME,
        namespaceAction : 'betbattle:place'
    };

    Alloy.Globals.unlockAchievement(5);
    fb.share(data);
  */
}

// --------------------------------------------------------------- Share to TWITTER  -------------------------------------------------------------------------------
if (OS_IOS) {
    if (Titanium.Platform.canOpenURL('twitter://')) {
        twitterBtn.addEventListener('click', function(e) {
            Alloy.Globals.unlockAchievement(5);
            Titanium.Platform.openURL('twitter://post?message=' + Alloy.Globals.PHRASES.twitterMsg + "." + "\n" + Alloy.Globals.PHRASES.myNameIsTxt + ": " + Alloy.Globals.PROFILENAME + "\n" + Alloy.Globals.PHRASES.appLinkTxt);
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
            intTwitter.putExtra(Ti.Android.EXTRA_TEXT, Alloy.Globals.PHRASES.twitterMsg + "." + "\n" + Alloy.Globals.PHRASES.myNameIsTxt + ": " + Alloy.Globals.PROFILENAME + "\n" + Alloy.Globals.PHRASES.appLinkTxt);
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
emailDialog.messageBody = Alloy.Globals.PHRASES.mailMsg + "." + '\n' + Alloy.Globals.PHRASES.myNameIsTxt + ": " + Alloy.Globals.PROFILENAME + "\n" + Alloy.Globals.PHRASES.appLinkTxt;

mailBtn.addEventListener('click', function(e) {
    Alloy.Globals.unlockAchievement(5);
    emailDialog.open();
});

// --------------------------------------------------------------- Send SMS  -------------------------------------------------------------------------------
if (OS_IOS) {

    /*
     var sms = require('bencoding.sms').createSMSDialog({
     barColor : '#336699'
     });
     sms.setMessageBody(Alloy.Globals.PHRASES.smsMsg + '.' + '\n' + Alloy.Globals.PHRASES.myNameIsTxt + ": " + Alloy.Globals.PROFILENAME + "\n" + Alloy.Globals.PHRASES.appLinkTxt);

     smsBtn.addEventListener('click', function(e) {
     Alloy.Globals.unlockAchievement(5);
     sms.open();
     });
     */

    var module = require('com.omorandi');
    var sms = module.createSMSDialog();

    smsBtn.addEventListener('click', function(e) {
        //check if the feature is available on the device at hand
        if (!sms.isSupported()) {
            //falls here when executed on iOS versions < 4.0 and in the emulator
            Alloy.Globals.showFeedbackDialog('This device does not support sending sms!');
        } else {
            sms.barColor = '#336699';
            sms.messageBody = Alloy.Globals.PHRASES.smsMsg + '.' + '\n' + Alloy.Globals.PHRASES.myNameIsTxt + ": " + Alloy.Globals.PROFILENAME + "\n" + Alloy.Globals.PHRASES.appLinkTxt;

            sms.addEventListener('complete', function(e) {
                if (e.result == smsDialog.SENT) {
                    Alloy.Globals.unlockAchievement(5);
                } else if (e.result == smsDialog.FAILED) {
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                }
            });
            sms.open({animated: true});
        }
    });
} else if (OS_ANDROID) {

    var intent = Ti.Android.createIntent({
        action : Ti.Android.ACTION_SENDTO,
        data : 'smsto:'
    });
    intent.putExtra('sms_body', "'" + Alloy.Globals.PHRASES.smsMsg + "." + "\n" + Alloy.Globals.PHRASES.myNameIsTxt + ": " + Alloy.Globals.PROFILENAME + "\n" + Alloy.Globals.PHRASES.appLinkTxt + "'");

    smsBtn.addEventListener('click', function(e) {
        Alloy.Globals.unlockAchievement(5);
        Ti.Android.currentActivity.startActivity(intent);
    });

}

mainView.add(Ti.UI.createLabel({
    text : Alloy.Globals.PHRASES.shareDescription + ".",
    top : 20,
    width : '90%',
    left : 20,
    font : Alloy.Globals.getFontCustom(16, 'Regular'),
    color : '#FFF'
}));

$.share.add(mainView);
