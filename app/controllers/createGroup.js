var fontawesome = require('lib/IconicFont').IconicFont({
    font : 'lib/FontAwesome'
});

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

var context;
var friends = [];
var sections = [];
var selectedFriends = [];
var table;
var hasChild = false;
var groupName;
var isSubmitting = false;
var isAndroid = false;
var font = 'FontAwesome';
var iOSVersion;

if (OS_ANDROID) {
    context = require('lib/Context');
    font = 'fontawesome-webfont';
    hasChild = false;
    isAndroid = true;
    $.createGroup.windowSoftInputMode = Ti.UI.Android.SOFT_INPUT_ADJUST_PAN;
    
    $.createGroup.addEventListener('open', function() {
        Alloy.Globals.setAndroidCouponMenu($.createGroup.activity);

        $.createGroup.activity.actionBar.onHomeIconItemSelected = function() {
           	if($.createGroup) {
           		$.createGroup.close();
            	$.createGroup = null;
           	}
        };
        $.createGroup.activity.actionBar.displayHomeAsUp = true;
        $.createGroup.activity.actionBar.title = Alloy.Globals.PHRASES.createGroupTxt + " ";
    });
    
    if(friends.length === '0') {
        indicator.openIndicator();
    }
    
} else {
    iOSVersion = parseInt(Ti.Platform.version);

    $.createGroup.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.createGroupTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });
}

$.createGroup.addEventListener('close', function() {
    indicator.closeIndicator();
});

function onOpen(evt) {
    if(isAndroid) {
        context.on('createGroupActivity', this.activity);
    }
}

function onClose(evt) {
    if(isAndroid) {
        context.off('createGroupActivity');
    }
}

var sectionView = Ti.UI.createView({
    height : 75,
    backgroundColor : '#303030',
    backgroundGradient : {
        type : "linear",
        startPoint : {
            x : "0%",
            y : "0%"
        },
        endPoint : {
            x : "0%",
            y : "100%"
        },
        colors : [{
            color : "#151515",

        }, {
            color : "#2E2E2E",

        }]
    },
    layout : 'vertical'
});

var secondSectionView = Ti.UI.createView({
    height : 75,
    backgroundColor : '#303030',
    backgroundGradient : {
        type : "linear",
        startPoint : {
            x : "0%",
            y : "0%"
        },
        endPoint : {
            x : "0%",
            y : "100%"
        },
        colors : [{
            color : "#151515",

        }, {
            color : "#2E2E2E",

        }]
    },
    layout : 'vertical'
});

sectionView.add(Ti.UI.createLabel({
    top : 20,
    width : Ti.UI.FILL,
    left : 60,
    text : Alloy.Globals.PHRASES.stateGroupNameTxt + " ",
    font : Alloy.Globals.getFontCustom(18, 'Bold'),
    color : '#FFF'
}));

if (!isAndroid) {
    table = Titanium.UI.createTableView({
        left : 0,
        top : 0,
        class : "topView",
        headerView : Ti.UI.createView({
            height : 0.5
        }),
        height : '85%',
        width : Ti.UI.FILL,
        backgroundColor : 'transparent',
        style : Ti.UI.iPhone.TableViewStyle.GROUPED,
        separatorInsets : {
            left : 0,
            right : 0
        },
        separatorStyle : Titanium.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE,
        separatorColor : '#303030'
    });

    if (iOSVersion < 7) {
        table.separatorStyle = Titanium.UI.iPhone.TableViewSeparatorStyle.NONE;
        table.separatorColor = 'transparent';
    }

    sections[0] = Ti.UI.createTableViewSection({
        headerView : sectionView,
        footerView : Ti.UI.createView({
            height : 0.1
        })
    });

    sections[1] = Ti.UI.createTableViewSection({
        headerView : secondSectionView,
        footerView : Ti.UI.createView({
            height : 0.1
        })
    });

} else {
    table = Titanium.UI.createTableView({
        width : Ti.UI.FILL,
        left : 0,
        class : "topView",
        top : 0,
        height : '85%',
        backgroundColor : '#000',
        separatorColor : '#303030'
    });

    table.footerView = Ti.UI.createView({
        height : 0.5,
        backgroundColor : '#303030'
    });
    
    sections[0] = Ti.UI.createTableViewSection({
        headerView : sectionView
    });

    sections[1] = Ti.UI.createTableViewSection({
        headerView : secondSectionView
    });
}

var groupNameRow = Ti.UI.createTableViewRow({
    height : 75,
    width : Ti.UI.FILL,
    backgroundColor : '#000',
    hasChild : false,
    selectionStyle : 'none'
});

groupName = Ti.UI.createTextField({
    color : '#336699',
    backgroundColor : '#CCC',
    top : 18,
    left : '20%',
    width : '60%',
    height : 40,
    tintColor : '#000',
    zIndex : 999,
    keyboardType : Titanium.UI.KEYBOARD_DEFAULT,
    returnKeyType : Titanium.UI.RETURNKEY_DEFAULT,
    borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});

groupNameRow.add(groupName);

sections[0].add(groupNameRow);

var rowClick = function(e) {
    // find label
    for (var i = e.row.children.length - 1; i >= 0; i--) {
        // find correct child
        if (e.row.children[i].id === 'statusIcon') {
            if (e.row.children[i].text === fontawesome.icon('fa-check')) {
                // had this selected, now unselect
                var index = selectedFriends.indexOf(e.row.name);
                selectedFriends.splice(index, 1);
                e.row.children[i].text = fontawesome.icon('fa-plus');
                e.row.children[i].color = '#FFF';
            } else {
                // select row and add friend
                selectedFriends.push(e.source.name);
                e.row.children[i].text = fontawesome.icon('fa-check');
                e.row.children[i].color = Alloy.Globals.themeColor();
            }
            break;
        }
    }
};

var imageErrorHandler = function(e) {
    e.source.image = '/images/no_pic.png';
};

function createEmptyRow() {
    var noFriendsRow = Ti.UI.createTableViewRow({
        height : 75,
        width : Ti.UI.FILL,
        backgroundColor : '#000',
        hasChild : false,
        selectionStyle : 'none'
    });

    var noFriendsTxt = Alloy.Globals.PHRASES.noFriendsForGroupTxt;

    if (noFriendsTxt.length > 65) {
        noFriendsTxt = noFriendsTxt.substring(0, 62) + '...';
    }

    var noFriendsLabel = Ti.UI.createLabel({
        text : noFriendsTxt + " ",
        textAlign : "center",
        top : 15,
        font : Alloy.Globals.getFontCustom(16, 'Regular'),
        color : "#FFF"
    });

    secondSectionView.add(noFriendsLabel);

    var openFriendSearchBtn = Alloy.Globals.createButtonView('#FFF', '#000', Alloy.Globals.PHRASES.addFriendsTxt);
    openFriendSearchBtn.top = 5;
    openFriendSearchBtn.zIndex = 999;

    openFriendSearchBtn.addEventListener('click', function(e) {
        var win = Alloy.createController('friendSearch').getView();
        Alloy.Globals.WINDOWS.push(win);

        if (!isAndroid) {
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

    noFriendsRow.add(openFriendSearchBtn);
    sections[1].add(noFriendsRow);
}

function createFriendRow(friendObj) {
    var friendRow = Ti.UI.createTableViewRow({
        height : 75,
        width : Ti.UI.FILL,
        backgroundColor : '#000',
        hasChild : hasChild,
        selectionStyle : 'none',
        name : friendObj.id
    });

    friendRow.addEventListener('click', rowClick);

    var image;
    if (friendObj.fbid !== null) {
        image = "https://graph.facebook.com/" + friendObj.fbid + "/picture?type=large";
    } else {
        // get betkampen image
        image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + friendObj.id + '.png';
    }

    var profileImage = Ti.UI.createImageView({
        //defaultImage : '/images/no_pic.png',
        image : image,
        width : 40,
        left : 10,
        height : 40,
        borderRadius : 20
    });
    
    if(!isAndroid) {
    	profileImage.setDefaultImage('/images/no_pic.png');
    }

    profileImage.addEventListener('error', imageErrorHandler);

    friendRow.add(profileImage);

    var profileName = friendObj.name;

    if (profileName.length > 18) {
        profileName = profileName.substring(0, 15) + '...';
    }

    var nameLabel = Ti.UI.createLabel({
        text : profileName + " ",
        left : 60,
        height : Ti.UI.SIZE,
        width : Ti.UI.SIZE,
        font : Alloy.Globals.getFontCustom(16, 'Regular'),
        color : '#FFF'
    });

    friendRow.add(nameLabel);

    var statusIcon = Ti.UI.createLabel({
        right : 20,
        id : 'statusIcon',
        height : Ti.UI.SIZE,
        width : Ti.UI.SIZE,
        font : {
            fontFamily : font,
            fontSize : 26
        },
        text : fontawesome.icon('fa-plus'),
        color : '#FFF'
    });

    friendRow.add(statusIcon);
    sections[1].add(friendRow);
}

function createSaveBtn() {
    var botView = Ti.UI.createView({
        top : '85%',
        height : '15%',
        width : Ti.UI.FILL,
        layout : 'vertical'
    });

    var saveBtn = Alloy.Globals.createButtonView(Alloy.Globals.themeColor(), '#FFF', Alloy.Globals.PHRASES.saveTxt);
    saveBtn.top = 5;

    saveBtn.addEventListener('click', function(e) {
        if (isSubmitting) {
            return;
        }

        if (groupName.value.length > 2 && groupName.value.length <= 15) {
            // check so we have selected friends
            if (selectedFriends.length > 0) {
                // send the data to server
                if (Alloy.Globals.checkConnection()) {
                    isSubmitting = true;
                    createGroup();
                } else {
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
                }
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noFriendsForGroupTxt);
            }
        } else if (groupName.value.length < 3 || groupName.value.length > 15) {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.groupNameErrorTxt);
        }
    });

    botView.add(saveBtn);
    $.createGroup.add(botView);
}

// create the group
function createGroup() {
    indicator.openIndicator();
    var xhr = Titanium.Network.createHTTPClient();

    xhr.onerror = function(e) {
        Ti.API.error('Bad Sever =>' + e.error);
        isSubmitting = false;
        indicator.closeIndicator();

        Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
    };

    try {
        xhr.open('POST', Alloy.Globals.BETKAMPENCREATEGROUPURL);
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
        xhr.setTimeout(Alloy.Globals.TIMEOUT);

        // build the json string

        var param = '{"group_name":"' + groupName.value + '", "friends":[';

        for (var i in selectedFriends) {
            param += '"' + selectedFriends[i];
            if (i != (selectedFriends.length - 1)) {
                param += '", ';
            } else {
                // last one
                param += '"';
            }
        }

        param += '], "lang":"' + Alloy.Globals.LOCALE + '"}';
        xhr.send(param);
    } catch(e) {
        isSubmitting = false;
        indicator.closeIndicator();
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
    }

    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {
                var response = '';
                try {
                    response = JSON.parse(this.responseText);
                } catch(e) {

                }

                Alloy.Globals.showToast(response);
                // unlock achievement create group
                Alloy.Globals.unlockAchievement(10);
                $.createGroup.close();
            }
        } else {
            Alloy.Globals.showToast(this.response);
        }
        isSubmitting = false;
        indicator.closeIndicator();
    };
}

//get friends from db
function getFriends() {
    indicator.openIndicator();
    var xhr = Ti.Network.createHTTPClient({
        // function called when the response data is available
        onload : function(e) {
            friends = JSON.parse(this.responseText);
            friends.sort(function(a, b) {
                var x = a.name.toLowerCase();
                var y = b.name.toLowerCase();
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });

            if (friends.length > 0) {
                var addFriendTxt = Alloy.Globals.PHRASES.addMembersTxt;

                if (addFriendTxt.length > 28) {
                    addFriendTxt = addFriendTxt.substring(0, 25) + '...';
                }

                var friendsLabel = Ti.UI.createLabel({
                    text : addFriendTxt + " ",
                    textAlign : "center",
                    top : 20,
                    font : Alloy.Globals.getFontCustom(18, 'Bold'),
                    color : "#FFF"
                });

                secondSectionView.add(friendsLabel);

                for (var i = 0; i < friends.length; i++) {
                    createFriendRow(friends[i]);
                }

                createSaveBtn();

            } else {
                createEmptyRow();
            }

            table.setData(sections);
            indicator.closeIndicator();
        },
        // function called when an error occurs, including a timeout
        onerror : function(e) {
            Ti.API.debug(e.error);
            indicator.closeIndicator();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        }
    });

    try {
        // Prepare the connection.
        xhr.open('GET', Alloy.Globals.BETKAMPENGETFRIENDSURL + '?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
        xhr.setTimeout(Alloy.Globals.TIMEOUT);
        xhr.send();
    } catch(e) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
    }
}

if (Alloy.Globals.checkConnection()) {
    getFriends();
} else {
    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
}

$.createGroup.add(table);
