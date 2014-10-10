var args = arguments[0] || {};

var fontawesome = require('lib/IconicFont').IconicFont({
    font : 'lib/FontAwesome'
});

var font = 'FontAwesome';

var iOSVersion;

if (OS_IOS) {
    iOSVersion = parseInt(Ti.Platform.version);
    $.friendZone.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.friendZoneTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });

} else {
    font = 'fontawesome-webfont';
}

var mainView = Ti.UI.createView({
    height : "100%",
    width : "100%",
    top : 0,
    backgroundColor : "transparent",
    layout : "vertical"
});

var header = Ti.UI.createView({
    height : 0.1,
});

mainView.add(header);

///*******Create Table View*******///
var sections = [];

var tableHeaderView = Ti.UI.createView({
    height : 0.1
});

var fontawesome = require('lib/IconicFont').IconicFont({
    font : 'lib/FontAwesome'
});

var font = 'FontAwesome';

if (OS_ANDROID) {
    font = 'fontawesome-webfont';
}

var tableFooterView = Ti.UI.createView({
    height : 0.1
});

if (OS_IOS) {
    var separatorS;
    var separatorCol;

    if (iOSVersion < 7) {
        separatorS = Titanium.UI.iPhone.TableViewSeparatorStyle.NONE;
        separatorColor = 'transparent';
    } else {
        separatorS = Titanium.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE;
        separatorColor = '#6d6d6d';
    }

    table = Titanium.UI.createTableView({
        //width : Ti.UI.FILL,
        left : 0,
        headerView : tableHeaderView,
        footerView : tableFooterView,
        height : '85%',
        width : '100%',
        //backgroundImage: '/images/profileBG.jpg',
        backgroundColor : 'transparent',
        style : Ti.UI.iPhone.TableViewStyle.GROUPED,
        separatorInsets : {
            left : 0,
            right : 0
        },
        id : 'challengeTable',
        separatorStyle : separatorS,
        separatorColor : separatorColor
    });
} else if (OS_ANDROID) {
    table = Titanium.UI.createTableView({
        width : Ti.UI.FILL,
        left : 0,
        headerView : tableHeaderView,
        height : '85%',
        //backgroundColor : '#303030',
        separatorColor : '#6d6d6d',
        id : 'challengeTable'
    });
}

sections[0] = Ti.UI.createTableViewSection({
    headerView : Ti.UI.createView({
        height : 0.1,
    }),
    footerView : Ti.UI.createView({
        height : 10,
    })
});
var child = false;
if (OS_IOS) {
    child = true;
} else if (OS_ANDROID) {
    child = false;
}

var fbFriendBtn = Titanium.UI.createTableViewRow({
    //title: Alloy.Globals.PHRASES.fbFriendsTxt,
    id : 'fbFriendBtn',
    hasChild : child,
    width : Ti.UI.FILL,
    left : 0,
    className : 'gameTypeRow',
    height : 75,

});

if (child != true) {
    var rightPercentage = '5%';

    font = 'fontawesome-webfont';

    if (Titanium.Platform.displayCaps.platformWidth < 350) {
        rightPercentage = '3%';
    }

    row.add(Ti.UI.createLabel({
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
    font : Alloy.Globals.getFontCustom(18, "Regular"),
    color : "#fff",
    left : 50,
});
fbFriendBtn.add(fbLabel);

sections[0].add(fbFriendBtn);

var child = false;
if (OS_IOS) {
    child = true;
} else if (OS_ANDROID) {
    child = false;
}

var myFriendBtn = Titanium.UI.createTableViewRow({
    id : 'myFriendBtn',
    hasChild : child,
    width : Ti.UI.FILL,
    left : 0,
    className : 'gameTypeRow',
    height : 75,
});

if (child != true) {
    var rightPercentage = '5%';

    font = 'fontawesome-webfont';

    if (Titanium.Platform.displayCaps.platformWidth < 350) {
        rightPercentage = '3%';
    }

    row.add(Ti.UI.createLabel({
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
    font : Alloy.Globals.getFontCustom(18, "Regular"),
    color : "#FFF",
    left : 50,
});
myFriendBtn.add(mFriendLabel);
sections[0].add(myFriendBtn);

var child = false;
if (OS_IOS) {
    child = true;
} else if (OS_ANDROID) {
    child = false;
}

var myGroupsBtn = Titanium.UI.createTableViewRow({
    id : 'myGroupsBtn',
    hasChild : child,
    width : Ti.UI.FILL,
    left : 0,
    className : 'gameTypeRow',
    height : 75,
});

if (child != true) {
    var rightPercentage = '5%';

    font = 'fontawesome-webfont';

    if (Titanium.Platform.displayCaps.platformWidth < 350) {
        rightPercentage = '3%';
    }

    row.add(Ti.UI.createLabel({
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
    font : Alloy.Globals.getFontCustom(18, "Regular"),
    color : "#FFF",
    left : 50
});
myGroupsBtn.add(mGroupLabel);

sections[0].add(myGroupsBtn);

var child = false;
if (OS_IOS) {
    child = true;
} else if (OS_ANDROID) {
    child = false;
}

var addFriendsBtn = Titanium.UI.createTableViewRow({
    id : 'addFriendsBtn',
    hasChild : child,
    width : Ti.UI.FILL,
    left : 0,
    className : 'gameTypeRow',
    height : 75,
});

if (child != true) {
    var rightPercentage = '5%';

    font = 'fontawesome-webfont';

    if (Titanium.Platform.displayCaps.platformWidth < 350) {
        rightPercentage = '3%';
    }

    row.add(Ti.UI.createLabel({
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
    font : Alloy.Globals.getFontCustom(18, "Regular"),
    color : "#FFF",
    left : 50,
});
addFriendsBtn.add(aFriendLabel);

sections[0].add(addFriendsBtn);

var child = false;
if (OS_IOS) {
    child = true;
} else if (OS_ANDROID) {
    child = false;
}

var createGroupBtn = Titanium.UI.createTableViewRow({
    id : 'createGroupBtn',
    hasChild : child,
    width : Ti.UI.FILL,
    left : 0,
    className : 'gameTypeRow',
    height : 75,
});

if (child != true) {
    var rightPercentage = '5%';

    font = 'fontawesome-webfont';

    if (Titanium.Platform.displayCaps.platformWidth < 350) {
        rightPercentage = '3%';
    }

    row.add(Ti.UI.createLabel({
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
    font : Alloy.Globals.getFontCustom(18, "Regular"),
    color : "#FFF",
    left : 50,
});
createGroupBtn.add(cGroupLabel);

sections[0].add(createGroupBtn);

var child = false;
if (OS_IOS) {
    child = true;
} else if (OS_ANDROID) {
    child = false;
}
var shareBtn = Titanium.UI.createTableViewRow({
    id : 'shareBtn',
    hasChild : child,
    width : Ti.UI.FILL,
    left : 0,
    className : 'gameTypeRow',
    height : 75,
});

if (child != true) {
    var rightPercentage = '5%';

    font = 'fontawesome-webfont';

    if (Titanium.Platform.displayCaps.platformWidth < 350) {
        rightPercentage = '3%';
    }

    row.add(Ti.UI.createLabel({
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
    font : Alloy.Globals.getFontCustom(18, "Regular"),
    color : "#FFF",
    left : 50,
});
shareBtn.add(shareLabel);

sections[0].add(shareBtn);

fbFriendBtn.addEventListener('click', function(e) {
    // check connection
    if (!Alloy.Globals.checkConnection()) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        return;
    }

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

