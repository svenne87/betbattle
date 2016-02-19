/*
var args = arguments[0] || {};

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

var fontawesome = require('lib/IconicFont').IconicFont({
    font : 'lib/FontAwesome'
});

var context;
var font = 'FontAwesome';
var myFbFriends = null;
var isAndroid = true;
var table = null;
var sections = [];

var iOSVersion;

if (OS_IOS) {
    iOSVersion = parseInt(Ti.Platform.version);
    isAndroid = false;

    $.fbFriends.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.fbFriendsTxt,
        font : Alloy.Globals.getFontCustom(16, "Bold"),
        color : '#FFF'
    });
}

if (isAndroid) {
    context = require('lib/Context');
    font = 'fontawesome-webfont';

    $.fbFriends.addEventListener('open', function() {
        Alloy.Globals.setAndroidCouponMenu($.fbFriends.activity);

        $.fbFriends.activity.actionBar.onHomeIconItemSelected = function() {
            $.fbFriends.close();
            $.fbFriends = null;
        };
        $.fbFriends.activity.actionBar.displayHomeAsUp = true;
        $.fbFriends.activity.actionBar.title = Alloy.Globals.PHRASES.fbFriendsTxt;
    });
}

$.fbFriends.addEventListener('close', function() {
    indicator.closeIndicator();
});

function onOpen(evt) {
    if(isAndroid) {
        context.on('fbFriendsActivity', this.activity);
    }
}

function onClose(evt) {
    if(isAndroid) {
        context.off('fbFriendsActivity');
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
if (Alloy.Globals.FACEBOOKOBJECT == null) {

    //USER IS NOT CONNECTED WITH FACEBOOK----------------------------------------------------------------------------------------------------------------------------------

    var connectLabel = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.notFbUserTxt + '\n' + Alloy.Globals.PHRASES.connectToGetFriendsTxt + " ",
        textAlign : "center",
        top : 10,
        font : Alloy.Globals.getFontCustom(16, "Regular"),
        color : "#FFF"
    });
    mainView.add(connectLabel);

    var fb = require('facebook');

    // app id and permission's
    fb.appid = '1403709019858016';
    fb.permissions = ['email', 'public_profile'];

    fb.forceDialogAuth = false;
    Alloy.Globals.connect = false;

    fb.addEventListener('login', function(e) {
        if (Alloy.Globals.connect == false) {
            if (e.success) {
                var fbid = Ti.Network.createHTTPClient();
                fbid.open("POST", Alloy.Globals.BETKAMPENURL + '/api/connect_account_fb.php');
                var params = {
                    fb_id : fb.uid,
                    uid : Alloy.Globals.BETKAMPENUID
                };
                fbid.send(params);

                if (isAndroid) {
                    // close
                    Alloy.Globals.MAINWIN.close();
                    Alloy.Globals.LANDINGWIN.close();

                    var activity = Titanium.Android.currentActivity;
                    activity.finish();
                    // start app again
                    var intent = Ti.Android.createIntent({
                        action : Ti.Android.ACTION_MAIN,
                        url : 'Betkampen.js'
                    });
                    intent.addCategory(Ti.Android.CATEGORY_LAUNCHER);
                    Ti.Android.currentActivity.startActivity(intent);
                } else {
                    // restart app
                    Ti.App._restart();
                }
            }
        }
    });

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
    
    fbUserBtn.addEventListener('click', function(e) {
       fb.authorize(); 
    });
    
    fbUserBtn.add(fbIconLabel);

} else {
    var fb = Alloy.Globals.FACEBOOK;
    //USER IS CONNECTED WITH FACEBOOK-----------------------------------------------------------------------------------------------------------
    var header = Ti.UI.createView({
        height : 0.1
    });

    mainView.add(header);

    var tableHeaderView = Ti.UI.createView({
        height : 0.1
    });

    var tableFooterView = Ti.UI.createView({
        height : 0.1
    });

    if (!isAndroid) {
        table = Titanium.UI.createTableView({
            left : 0,
            headerView : tableHeaderView,
            footerView : tableFooterView,
            height : '95%',
            width : '100%',
            backgroundColor : 'transparent',
            style : Ti.UI.iPhone.TableViewStyle.GROUPED,
            separatorInsets : {
                left : 0,
                right : 0
            },
            id : 'challengeTable',
            separatorStyle : Titanium.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE,
            separatorColor : '#303030'
        });

        if (iOSVersion < 7) {
            table.separatorStyle = Titanium.UI.iPhone.TableViewSeparatorStyle.NONE;
            table.separatorColor = 'transparent';
        }
    } else if (OS_ANDROID) {
        table = Titanium.UI.createTableView({
            width : Ti.UI.FILL,
            left : 0,
            headerView : tableHeaderView,
            height : '95%',
            separatorColor : '#303030',
            id : 'challengeTable'
        });
    }

    function createGUI(obj) {

        if (isAndroid) {
            child = false;
        } else {
            child = true;
        }

        var row = Ti.UI.createTableViewRow({
            id : obj.id,
            hasChild : child,
            width : Ti.UI.FILL,
            left : 0,
            className : 'gameTypeRow',
            height : 75,
        });

        // add custom icon on Android to symbol that the row has child
        if (child != true) {
            var fontawesome = require('lib/IconicFont').IconicFont({
                font : 'lib/FontAwesome'
            });

            font = 'fontawesome-webfont';

            tableRow.add(Ti.UI.createLabel({
                font : {
                    fontFamily : font
                },
                text : fontawesome.icon('icon-chevron-right'),
                right : '5%',
                color : '#FFF',
                fontSize : 80,
                height : 'auto',
                width : 'auto'
            }));
        }

        boardName = obj.name.toString();
        if (boardName.length > 30) {
            boardName = boardName.substring(0, 27) + '...';
        }
        var name = Ti.UI.createLabel({
            text : boardName + " ",
            left : 60,
            font : Alloy.Globals.getFontCustom(16, "Regular"),
            color : "#FFF",
        });
        row.add(name);

        var profileImageView = Ti.UI.createImageView({
            left : 10,
            height : 40,
            width : 40,
            borderRadius : 20,
            image : obj.picture.data.url,
            defaultImage : '/images/no_pic.png'
        });
        
        profileImageView.addEventListener('error', function(e) {
            e.source.image = '/images/no_pic.png';
        });

        row.add(profileImageView);

        return row;
    }

    
    var fb = Alloy.Globals.FACEBOOK;

    function sortByName(a, b) {
        var x = a.name.toLowerCase().replace(' ', '');
        var y = b.name.toLowerCase().replace(' ', '');
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    }
    
    function performFacebookPost(id) {
// göra som vanlig share här, skicka med namn och förklarande text mä...

        var data = {
            url : Alloy.Globals.PHRASES.appLinkTxt,
            namespaceObject : 'betbattle:bet',
            objectName : 'bet',
            imageUrl : Alloy.Globals.BETKAMPENURL + '/images/betbattle.png',
            title : Alloy.Globals.PHRASES.fbPostCaptionTxt,
            description : Alloy.Globals.PHRASES.fbPostDescriptionTxt,
            namespaceAction : 'betbattle:place',
            friendsId : [id]
        }; 

        Alloy.Globals.unlockAchievement(5);
        fb.share(data);
    }
    

    // gets friends that can be invited
    function getFbFriendsWithApp() {
        indicator.openIndicator();

        fb.requestWithGraphPath('/me/taggable_friends', {
            fields : 'name, picture, id'
        }, 'GET', function(e) {

            if (e.success) {
                var data = [];

                if (OS_IOS) {
                    data = e.result;
                } else {
                    data = JSON.parse(e.result);
                }

                var data = e.result;
                myFbFriends = data.data;

                myFbFriends = myFbFriends.sort(sortByName);

                sections[0] = Ti.UI.createTableViewSection({
                    headerView : Ti.UI.createView({
                        height : 0.1
                    }),
                    footerView : Ti.UI.createView({
                        height : 0.1
                    }),
                });
                                                                                                                 
                for (var i = 0; i < myFbFriends.length; i++) {
                    sections[0].add(createGUI(myFbFriends[i]));
                }

                table.setData(sections);
                mainView.add(table);
                indicator.closeIndicator();
            } else {
                indicator.closeIndicator();
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            }
        });
    }

    if (Alloy.Globals.checkConnection()) {
        getFbFriendsWithApp();
    } else {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }

}

$.fbFriends.add(mainView);

*/