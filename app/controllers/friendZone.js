var args = arguments[0] || {};
var context;

var fontawesome = require('lib/IconicFont').IconicFont({
    font : 'lib/FontAwesome'
});

var font = 'FontAwesome';
var isAndroid = true;
var iOSVersion;

var child = false;

if (OS_IOS) {
    isAndroid = false;
    child = true;
    iOSVersion = parseInt(Ti.Platform.version);
    $.friendZone.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.friendZoneTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });
} else {
    context = require('lib/Context');
}

function onOpen(evt) {
    if(isAndroid) {
        context.on('friendZoneActivity', this.activity);
    }
}

function onClose(evt) {
    if(isAndroid) {
        context.off('friendZoneActivity');
    }
}

var mainView = Ti.UI.createView({
    height : "100%",
    width : "100%",
    top : 0,
    backgroundColor : "transparent",
    layout : "vertical"
});

// create sections for the table
function createSectionsForTable(sectionText) {
    var sectionView = $.UI.create('View', {
        classes : ['challengesSection']
    });

    sectionView.add(Ti.UI.createLabel({
        top : '25%',
        width : Ti.UI.FILL,
        left : 60,
        text : sectionText,
        font : Alloy.Globals.getFontCustom(18, 'Bold'),
        color : '#FFF'
    }));

    if (!isAndroid) {
        return Ti.UI.createTableViewSection({
            headerView : sectionView,
            footerView : Ti.UI.createView({
                height : 0.1
            })
        });
    } else {
        return Ti.UI.createTableViewSection({
            headerView : sectionView
        });
    }
}

var header = Ti.UI.createView({
    height : 0.1,
});

mainView.add(header);

///*******Create Table View*******///
var sections = [];

var tableHeaderView = Ti.UI.createView({
    height : 0.1
});

if (isAndroid) {
    font = 'fontawesome-webfont';
    var rightPercentage = '5%';

    if (Titanium.Platform.displayCaps.platformWidth < 350) {
        rightPercentage = '3%';
    }
}

var tableFooterView = Ti.UI.createView({
    height : 0.1
});

if (!isAndroid) {
    var separatorS;
    var separatorCol;

    table = Titanium.UI.createTableView({
        left : 0,
        headerView : tableHeaderView,
        footerView : tableFooterView,
        height : Ti.UI.FILL,
        width : Ti.UI.FILL,
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

} else {
    table = Titanium.UI.createTableView({
        width : Ti.UI.FILL,
        left : 0,
        height : Ti.UI.FILL,
        separatorColor : '#303030',
        id : 'challengeTable'
    });

    table.headerView = Ti.UI.createView({
        height : 0.5,
        backgroundColor : '#303030'
    });

    table.footerView = Ti.UI.createView({
        height : 0.5,
        backgroundColor : '#303030'
    });
}

sections[0] = createSectionsForTable(Alloy.Globals.PHRASES.landingPageInviteBtnTop);
sections[1] = createSectionsForTable(Alloy.Globals.PHRASES.FriendsTxt);
sections[2] = createSectionsForTable(Alloy.Globals.PHRASES.GroupsTxt);

var fbFriendBtn = Titanium.UI.createTableViewRow({
    //title: Alloy.Globals.PHRASES.fbFriendsTxt,
    id : 'fbFriendBtn',
    hasChild : child,
    width : Ti.UI.FILL,
    left : 0,
    className : 'gameTypeRow',
    height : 75,

});

if (!child) {
    fbFriendBtn.add(Ti.UI.createLabel({
        font : {
            fontFamily : font
        },
        text : fontawesome.icon('icon-chevron-right'),
        right : rightPercentage,
        color : '#FFF',
        fontSize : 80,
        height : 'auto',
        width : 'auto'
    }));
}

var fbIconLabel = Titanium.UI.createLabel({
    font : {
        fontFamily : font,
        fontSize : 22
    },
    text : fontawesome.icon('fa-facebook'),
    left : 20,
    color : '#fff',
});
fbFriendBtn.add(fbIconLabel);

var fbLabel = Titanium.UI.createLabel({
    text : Alloy.Globals.PHRASES.fbFriendsTxt,
    font : Alloy.Globals.getFontCustom(16, "Regular"),
    color : "#fff",
    left : 50,
});
fbFriendBtn.add(fbLabel);

var myFriendBtn = Titanium.UI.createTableViewRow({
    id : 'myFriendBtn',
    hasChild : child,
    width : Ti.UI.FILL,
    left : 0,
    className : 'gameTypeRow',
    height : 75,
});

if (!child) {
    myFriendBtn.add(Ti.UI.createLabel({
        font : {
            fontFamily : font
        },
        text : fontawesome.icon('icon-chevron-right'),
        right : rightPercentage,
        color : '#FFF',
        fontSize : 80,
        height : 'auto',
        width : 'auto'
    }));
}

var mFIconLabel = Titanium.UI.createLabel({
    font : {
        fontFamily : font,
        fontSize : 22
    },
    text : fontawesome.icon('fa-user'),
    left : 20,
    color : '#FFF',
});
myFriendBtn.add(mFIconLabel);

var mFriendLabel = Titanium.UI.createLabel({
    text : Alloy.Globals.PHRASES.myFriendsTxt,
    font : Alloy.Globals.getFontCustom(16, "Regular"),
    color : "#FFF",
    left : 50,
});
myFriendBtn.add(mFriendLabel);

var myGroupsBtn = Titanium.UI.createTableViewRow({
    id : 'myGroupsBtn',
    hasChild : child,
    width : Ti.UI.FILL,
    left : 0,
    className : 'gameTypeRow',
    height : 75,
});

if (!child) {
    myGroupsBtn.add(Ti.UI.createLabel({
        font : {
            fontFamily : font
        },
        text : fontawesome.icon('icon-chevron-right'),
        right : rightPercentage,
        color : '#FFF',
        fontSize : 80,
        height : 'auto',
        width : 'auto'
    }));
}

var mgIconLabel = Titanium.UI.createLabel({
    font : {
        fontFamily : font,
        fontSize : 22
    },
    text : fontawesome.icon('fa-users'),
    left : 20,
    color : '#FFF',
});
myGroupsBtn.add(mgIconLabel);

var mGroupLabel = Titanium.UI.createLabel({
    text : Alloy.Globals.PHRASES.myGroupsTxt,
    font : Alloy.Globals.getFontCustom(16, "Regular"),
    color : "#FFF",
    left : 50
});
myGroupsBtn.add(mGroupLabel);

var addFriendsBtn = Titanium.UI.createTableViewRow({
    id : 'addFriendsBtn',
    hasChild : child,
    width : Ti.UI.FILL,
    left : 0,
    className : 'gameTypeRow',
    height : 75,
});

if (!child) {
    addFriendsBtn.add(Ti.UI.createLabel({
        font : {
            fontFamily : font
        },
        text : fontawesome.icon('icon-chevron-right'),
        right : rightPercentage,
        color : '#FFF',
        fontSize : 80,
        height : 'auto',
        width : 'auto'
    }));
}

var afIconLabel = Titanium.UI.createLabel({
    font : {
        fontFamily : font,
        fontSize : 22
    },
    text : fontawesome.icon('fa-plus'),
    left : 20,
    color : '#FFF',
});

addFriendsBtn.add(afIconLabel);

var aFriendLabel = Titanium.UI.createLabel({
    text : Alloy.Globals.PHRASES.addFriendsTxt,
    font : Alloy.Globals.getFontCustom(16, "Regular"),
    color : "#FFF",
    left : 50,
});

addFriendsBtn.add(aFriendLabel);

var createGroupBtn = Titanium.UI.createTableViewRow({
    id : 'createGroupBtn',
    hasChild : child,
    width : Ti.UI.FILL,
    left : 0,
    className : 'gameTypeRow',
    height : 75,
});

if (!child) {
    createGroupBtn.add(Ti.UI.createLabel({
        font : {
            fontFamily : font
        },
        text : fontawesome.icon('icon-chevron-right'),
        right : rightPercentage,
        color : '#FFF',
        fontSize : 80,
        height : 'auto',
        width : 'auto'
    }));
}

var cgIconLabel = Titanium.UI.createLabel({
    font : {
        fontFamily : font,
        fontSize : 22
    },
    text : fontawesome.icon('fa-plus'),
    left : 20,
    color : '#FFF',
});
createGroupBtn.add(cgIconLabel);

cGroupLabel = Titanium.UI.createLabel({
    text : Alloy.Globals.PHRASES.createGroupTxt,
    font : Alloy.Globals.getFontCustom(16, "Regular"),
    color : "#FFF",
    left : 50,
});

createGroupBtn.add(cGroupLabel);

/*
var shareBtn = Titanium.UI.createTableViewRow({
    id : 'shareBtn',
    hasChild : child,
    width : Ti.UI.FILL,
    left : 0,
    className : 'gameTypeRow',
    height : 75,
});

if (!child) {
    shareBtn.add(Ti.UI.createLabel({
        font : {
            fontFamily : font
        },
        text : fontawesome.icon('icon-chevron-right'),
        right : rightPercentage,
        color : '#FFF',
        fontSize : 80,
        height : 'auto',
        width : 'auto'
    }));
}

var sIconLabel = Titanium.UI.createLabel({
    font : {
        fontFamily : font,
        fontSize : 22
    },
    text : fontawesome.icon('fa-share-alt'),
    left : 20,
    color : '#FFF',
});
shareBtn.add(sIconLabel);

shareLabel = Titanium.UI.createLabel({
    text : Alloy.Globals.PHRASES.inviteFriendsTxt,
    font : Alloy.Globals.getFontCustom(16, "Regular"),
    color : "#FFF",
    left : 50,
});

shareBtn.add(shareLabel);
*/
var fb;

if (Alloy.Globals.FACEBOOKOBJECT != null) {
    if (isAndroid) {
        $.friendZone.fbProxy = Alloy.Globals.FACEBOOK.createActivityWorker({lifecycleContainer : $.friendZone});
        fb = Alloy.Globals.FACEBOOK;
    } else {
        fb = Alloy.Globals.FACEBOOK;
    }

} else {
    if(isAndroid) {
        var fbModule = require('facebook');
        $.friendZone.fbProxy = fbModule.createActivityWorker({lifecycleContainer : $.friendZone});
        fb = fbModule;
    } else {
        fb = require("facebook");
    }
}

fbFriendBtn.addEventListener('click', function(e) {

    if (Alloy.Globals.checkConnection()) {
        if (isAndroid) {
            if (fb.canPresentOpenGraphActionDialog) {
                performFacebookPost(fb);
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.fbShareErrorTxt);
            }
        } else {
            if (fb.getCanPresentShareDialog()) {
                performFacebookPost(fb);
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.fbShareErrorTxt);
            }
        }
    } else {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }

    function performFacebookPost(fb) {

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
    }

    /*
     var win = Alloy.createController('fbFriends').getView();
     if (OS_IOS) {
     Alloy.Globals.NAV.openWindow(win, {
     animated : true
     });
     } else {
     win.open({
     fullScreen : true
     });
     win = null;
     }
     */
});
myFriendBtn.addEventListener('click', function(e) {
    // check connection
    if (!Alloy.Globals.checkConnection()) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        return;
    }

    var win = Alloy.createController('myFriends').getView();
    if (OS_IOS) {
        Alloy.Globals.NAV.openWindow(win, {
            animated : true
        });
    } else {
        win.open({
            fullScreen : true
        });
        win = null;
    }
});

myGroupsBtn.addEventListener('click', function(e) {
    // check connection
    if (!Alloy.Globals.checkConnection()) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        return;
    }

    var win = Alloy.createController('myGroups').getView();
    if (OS_IOS) {
        Alloy.Globals.NAV.openWindow(win, {
            animated : true
        });
    } else {
        win.open({
            fullScreen : true
        });
        win = null;
    }
});

addFriendsBtn.addEventListener('click', function(e) {
    // check connection
    if (!Alloy.Globals.checkConnection()) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        return;
    }

    var win = Alloy.createController('friendSearch').getView();
    if (OS_IOS) {
        Alloy.Globals.NAV.openWindow(win, {
            animated : true
        });
    } else {
        win.open({
            fullScreen : true
        });
        win = null;
    }
});

createGroupBtn.addEventListener('click', function(e) {
    // check connection
    if (!Alloy.Globals.checkConnection()) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        return;
    }

    var win = Alloy.createController('createGroup').getView();
    if (OS_IOS) {
        Alloy.Globals.NAV.openWindow(win, {
            animated : true
        });
    } else {
        win.open({
            fullScreen : true
        });
        win = null;
    }
});

/*
shareBtn.addEventListener('click', function(e) {
    // check connection
    if (!Alloy.Globals.checkConnection()) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        return;
    }

    var win = Alloy.createController('shareView').getView();
    if (OS_IOS) {
        Alloy.Globals.NAV.openWindow(win, {
            animated : true
        });
    } else {
        win.open({
            fullScreen : true
        });
        win = null;
    }
});
*/

//sections[0].add(shareBtn);
sections[0].add(fbFriendBtn);
sections[1].add(addFriendsBtn);
sections[1].add(myFriendBtn);
sections[2].add(createGroupBtn);
sections[2].add(myGroupsBtn);

table.setData(sections);
mainView.add(table);

if (OS_ANDROID) {
    $.friendZone.addEventListener('open', function() {
        Alloy.Globals.setAndroidCouponMenu($.friendZone.activity);

        $.friendZone.activity.actionBar.onHomeIconItemSelected = function() {
            $.friendZone.close();
            $.friendZone = null;
        };
        $.friendZone.activity.actionBar.displayHomeAsUp = true;
        $.friendZone.activity.actionBar.title = Alloy.Globals.PHRASES.friendZoneTxt;
    });
}

$.friendZone.add(mainView);

