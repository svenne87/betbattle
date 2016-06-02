var args = arguments[0] || {};
var pastRow = args.row;
var pastRowName = args.rowName;
var gAdmin = args.gAdmin;
var gName = args.gName;
var groupTable = args.table;
var gID = args.gID;
var friends = null;
var iOSVersion;
var child = false;
var isAndroid = true;
var context;

if (OS_IOS) {
    iOSVersion = parseInt(Ti.Platform.version);
    isAndroid = false;

    $.editGroup.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.editGroupTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });
}
var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});
var table = null;
var sections = [];

$.editGroup.addEventListener('close', function() {
    indicator.closeIndicator();
});

var fontawesome = require('lib/IconicFont').IconicFont({
    font : 'lib/FontAwesome'
});

var font = 'FontAwesome';

if (isAndroid) {
    context = require('lib/Context');
    child = false;
    font = 'fontawesome-webfont';

    $.editGroup.addEventListener('open', function() {
        Alloy.Globals.setAndroidCouponMenu($.editGroup.activity);

        $.editGroup.activity.actionBar.onHomeIconItemSelected = function() {
            if($.editGroup) {
            	$.editGroup.close();
            	$.editGroup = null;
            }
        };
        $.editGroup.activity.actionBar.displayHomeAsUp = true;
        $.editGroup.activity.actionBar.title = Alloy.Globals.PHRASES.editGroupTxt;

        // sometimes the view remain in memory, then we don't need to show the "loading"
        if (friends === null) {
            indicator.openIndicator();
        }
    });
}

function onOpen(evt) {
    if(isAndroid) {
        context.on('editGroupActivity', this.activity);
    }
}

function onClose(evt) {
    if(isAndroid) {
        context.off('editGroupActivity');
    }
}

var mainView = Ti.UI.createView({
    class : "topView",
    height : "100%",
    width : "100%",
    top : 0,
    backgroundColor : "transparent",
    layout : "vertical"
});

if (gAdmin == Alloy.Globals.BETKAMPENUID) {

    var groupNameLabel = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.changeGroupNameTxt + " ",
        left : 20,
        font : Alloy.Globals.getFontCustom(18, "Regular"),
        color : "#FFF"
    });
    mainView.add(groupNameLabel);

    var groupName = Ti.UI.createTextField({
        color : '#336699',
        backgroundColor : '#ccc',
        borderColor : '#000',
        top : 7,
        width : '90%',
        height : 50,
        value : gName,
        tintColor : '#000',
        keyboardType : Titanium.UI.KEYBOARD_DEFAULT,
        returnKeyType : Titanium.UI.RETURNKEY_DEFAULT,
        borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
    });
    mainView.add(groupName);

    if (isAndroid) {
        var first = true;
        groupName.addEventListener('focus', function f(e) {
            if (first) {
                first = false;
                groupName.blur();
            } else {
                groupName.removeEventListener('focus', f);
            }
        });
    }
}

function createBtnViews() {
    // if you are group admin
    if (gAdmin == Alloy.Globals.BETKAMPENUID) {

        var groupNameBtn = Alloy.Globals.createButtonView(Alloy.Globals.themeColor(), "#FFF", Alloy.Globals.PHRASES.saveTxt);
        mainView.add(groupNameBtn);

        var isSubmitting = false;

        groupNameBtn.addEventListener('click', function(e) {
            if (isSubmitting) {
                return;
            }

            if (groupName.value === gName) {
                Alloy.Globals.showToast(Alloy.Globals.PHRASES.updateTxt);
                return;
            }

            if (groupName.value.length > 2 && groupName.value.length <= 15) {
                var editName = Ti.Network.createHTTPClient();
                isSubmitting = true;
                indicator.openIndicator();
                editName.setTimeout(Alloy.Globals.TIMEOUT);
                editName.open("POST", Alloy.Globals.BETKAMEPNCHANGEGROUPNAMEURL + '/?lang=' + Alloy.Globals.LOCALE);
                var params = {
                    groupID : gID,
                    group_name : groupName.value,
                };

                editName.send(params);

                editName.onerror = function(e) {
                    isSubmitting = false;
                    indicator.closeIndicator();
                    Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
                };

                editName.onload = function(e) {
                    if (this.status == '200') {
                        if (this.readyState == 4) {
                            gName = groupName.value;
                            Alloy.Globals.showToast(JSON.parse(this.responseText));
                        }
                    }

                    isSubmitting = false;
                    indicator.closeIndicator();
                };

                // update row text
                pastRow.text = groupName.value;
                gName = groupName.value;

            } else if (groupName.value.length < 3 || groupName.value.length > 15) {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.groupNameErrorTxt);
            }
        });

        var removeGroupView = Ti.UI.createView({
            height : 75,
            width : Ti.UI.FILL,
            layout : 'vertical'
        });

        var removeGroupBtn = Alloy.Globals.createButtonView("#d50f25", "#FFF", Alloy.Globals.PHRASES.removeTxt);

        removeGroupBtn.addEventListener('click', function() {
            // check connection
            if (!Alloy.Globals.checkConnection()) {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
                return;
            }

            var aD = Titanium.UI.createAlertDialog({
                title : Alloy.Globals.PHRASES.betbattleTxt,
                message : Alloy.Globals.PHRASES.deleteGroupTxt,
                buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.abortBtnTxt],
                cancel : 1
            });

            aD.addEventListener('click', function(e) {
                switch(e.index) {
                case 0:
                    indicator.openIndicator();
                    var xhr = Ti.Network.createHTTPClient();

                    xhr.onerror = function(e) {
                        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                        Ti.API.error('Bad Sever =>' + e.error);
                    };

                    try {
                        xhr.open("POST", Alloy.Globals.BETKAMPENDELTEGROUPURL + '/?lang=' + Alloy.Globals.LOCALE);
                        xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
                        xhr.setTimeout(Alloy.Globals.TIMEOUT);
                        var params = {
                            group_id : gID,
                            id : Alloy.Globals.BETKAMPENUID,
                        };
                        xhr.send(params);
                    } catch(e) {
                        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                    }

                    xhr.onload = function() {
                        if (this.status == '200') {
                            if (this.readyState == 4) {
                                var response = JSON.parse(this.responseText);
                            }
                        }

                        // remove table row
                        var index = groupTable.getIndexByName(gID);
                        groupTable.deleteRow(index);

                        Alloy.Globals.showToast(response);
                        $.editGroup.close();
                    };
                    break;
                case 1:
                    break;
                }

            });
            aD.show();
        });

        removeGroupView.add(removeGroupBtn);
        mainView.add(removeGroupView);
    }
    // TODO
    else {
        var leaveGroupView = Ti.UI.createView({
            height : 75,
            width : Ti.UI.FILL,
            layout : 'vertical'
        });

        var leaveGroupBtn = Alloy.Globals.createButtonView("#d50f25", "#FFF", Alloy.Globals.PHRASES.leaveTxt);

        leaveGroupBtn.addEventListener('click', function() {
            // check connection
            if (!Alloy.Globals.checkConnection()) {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
                return;
            }

            var aD = Titanium.UI.createAlertDialog({
                title : Alloy.Globals.PHRASES.betbattleTxt,
                message : Alloy.Globals.PHRASES.leaveGroupTxt,
                buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.abortBtnTxt],
                cancel : 1
            });

            aD.addEventListener('click', function(e) {
                switch(e.index) {
                case 0:

                    indicator.openIndicator();
                    var xhr = Ti.Network.createHTTPClient();

                    xhr.onerror = function(e) {
                        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                        Ti.API.error('Bad Sever =>' + e.error);
                    };

                    try {
                        xhr.open("POST", Alloy.Globals.BETKAMPENREMOVEGROUPMEMBERURL + '/?lang=' + Alloy.Globals.LOCALE);
                        xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
                        xhr.setTimeout(Alloy.Globals.TIMEOUT);
                        var params = {
                            group_id : gID,
                            member_to_remove : Alloy.Globals.BETKAMPENUID,
                        };
                        xhr.send(params);
                    } catch(e) {
                        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                    }

                    xhr.onload = function() {
                        if (this.status == '200') {
                            if (this.readyState == 4) {
                                var response = JSON.parse(this.responseText);
                            }
                        }

                        // remove table row
                        var index = groupTable.getIndexByName(gID);
                        groupTable.deleteRow(index);

                        Alloy.Globals.showToast(Alloy.Globals.PHRASES.groupleftTxt);
                        $.editGroup.close();
                    };
                    break;

                case 1:
                    break;
                }

            });
            aD.show();
        });

        leaveGroupView.add(leaveGroupBtn);
        mainView.add(leaveGroupView);
    }
}

var isRemoving = false;

var removeMemberClick = function(e) {
    if (isRemoving) {
        return;
    }

    var thisRow = e.row;

    if ( typeof e.row.mName === 'undefined') {
        e.row.mName = e.row.fName;
    }

    //delete member
    var aL = Titanium.UI.createAlertDialog({
        title : Alloy.Globals.PHRASES.betbattleTxt,
        message : Alloy.Globals.PHRASES.removeFriendTxt + ' ' + e.row.mName + '?',
        buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.abortBtnTxt],
        cancel : 1,
        id : e.row.id,
        uid : e.row.uid,
        mName : e.row.mName
    });

    aL.addEventListener('click', function(e) {
        switch(e.index) {
        case 0:
            if (!Alloy.Globals.checkConnection()) {
                Alloy.Globals.showToast(Alloy.Globals.noConnectionErrorTxt);
                return;
            }
            indicator.openIndicator();
            isRemoving = true;

            var removeMember = Ti.Network.createHTTPClient();
            removeMember.open("POST", Alloy.Globals.BETKAMPENREMOVEGROUPMEMBERURL + '/?lang=' + Alloy.Globals.LOCALE);
            removeMember.setTimeout(Alloy.Globals.TIMEOUT);
            removeMember.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);

            var params = {
                group_id : e.source.id,
                member_to_remove : e.source.uid,
            };
            removeMember.send(params);

            removeMember.onload = function() {
                isRemoving = false;
                if (this.status == '200') {
                    if (this.readyState == 4) {
                        sections[0].remove(thisRow);
                        sections[1].add(thisRow);
                        table.setData(sections);
                        thisRow.removeEventListener('click', removeMemberClick);
                        thisRow.addEventListener('click', addMemberClick);

                        thisRow.add(Ti.UI.createLabel({
                            right : 15,
                            font : {
                                fontFamily : font,
                                fontSize : 30
                            },
                            text : fontawesome.icon('fa-plus'),
                            color : '#FFF',
                            id : 'awesome'
                        }));

                        //table.setData(sections);
                        Alloy.Globals.showToast(e.source.mName + ' ' + Alloy.Globals.PHRASES.groupMemberDeletedTxt);
                    }
                }
                indicator.closeIndicator();
            };

            removeMember.onerror = function(e) {
                isRemoving = false;
                indicator.closeIndicator();
                Alloy.Globals.showToast(Alloy.Globals.PHRASES.commonErrorTxt);
            };

            break;
        case 1:
            Titanium.API.info('cancel');
            break;
        }

    });
    aL.show();
};

var isAdding = false;

var addMemberClick = function(e) {
    var thisRow = e.row;

    if ( typeof e.row.fName === 'undefined') {
        e.row.fName = e.row.mName;
    }

    var aL = Titanium.UI.createAlertDialog({
        title : Alloy.Globals.PHRASES.betbattleTxt,
        message : Alloy.Globals.PHRASES.addMemberTxt + '\n' + e.row.fName + '?',
        buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.abortBtnTxt],
        backgroundColor : '#000',
        cancel : 1,
        id : e.row.id,
        uid : e.row.uid,
        //fId : e.row.fId,
        fName : e.row.fName
    });

    aL.addEventListener('click', function(e) {
        switch(e.index) {
        case 0:
            if (!Alloy.Globals.checkConnection()) {
                Alloy.Globals.showToast(Alloy.Globals.noConnectionErrorTxt);
                return;
            }
            isAdding = true;
            indicator.openIndicator();
            var addMember = Ti.Network.createHTTPClient();
            addMember.open("POST", Alloy.Globals.BETKAMPENADDGROUPMEMBERSURL + '/?lang=' + Alloy.Globals.LOCALE);
            addMember.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
            addMember.setTimeout(Alloy.Globals.TIMEOUT);
            var params = {
                group_id : e.source.id,
                //id : e.source.fId,
                id : e.source.uid,
                name : e.source.fName,
                admin : 0
            };
            addMember.send(params);

            addMember.onload = function() {
                isAdding = false;
                if (this.status == '200') {
                    if (this.readyState == 4) {
                        sections[1].remove(thisRow);
                        sections[0].add(thisRow);
                        table.setData(sections);
                        thisRow.removeEventListener('click', addMemberClick);
                        thisRow.addEventListener('click', removeMemberClick);

                        for (var child in thisRow.children) {
                            if (thisRow.children[child].id === 'awesome') {
                                thisRow.remove(thisRow.children[child]);
                            }
                        }

                        //table.setData(sections);
                        Alloy.Globals.showToast(e.source.fName + ' ' + Alloy.Globals.PHRASES.groupMemberAddedTxt);
                    }
                }
                indicator.closeIndicator();
            };

            addMember.onerror = function(e) {
                Ti.API.log(this.responseText);
                isAdding = false;
                Alloy.Globals.showToast(Alloy.Globals.PHRASES.commonErrorTxt);
                indicator.closeIndicator();
            };

            break;
        case 1:
            Titanium.API.info('cancel');
            break;
        }

    });
    aL.show();

};

function createGUI(obj) {
    if (gAdmin == Alloy.Globals.BETKAMPENUID) {
        var row = Ti.UI.createTableViewRow({
            hasChild : child,
            width : Ti.UI.FILL,
            left : 0,
            className : 'gameTypeRow',
            height : 75,
            id : gID,
            uid : obj.uid,
            mName : obj.username,
        });

        //profilepicture
        var image;
        if (obj.fbid !== null) {
            image = "https://graph.facebook.com/" + obj.fbid + "/picture?type=large";
        } else {
            // get betkampen image
            image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + obj.uid + '.png';
        }

        var profilePic = Titanium.UI.createImageView({
            //defaultImage : '/images/no_pic.png',
            image : image,
            height : 40,
            width : 40,
            left : 10,
            borderRadius : 20
        });
        
       	if(!isAndroid) {
       		profilePic.setDefaultImage('/images/no_pic.png');
       	}
       	
        profilePic.addEventListener('error', function(e) {
            // fallback for image
            e.source.image = '/images/no_pic.png';
        });

        row.add(profilePic);

        boardName = obj.username.toString();
        if (boardName.length > 22) {
            boardName = boardName.substring(0, 19) + '...';
        }
        var name = Ti.UI.createLabel({
            text : boardName + " ",
            left : 60,
            color : "#FFF",
            font : Alloy.Globals.getFontCustom(16, "Regular")
        });
        row.add(name);
        //add delete button to members not your self
        if (obj.uid == Alloy.Globals.BETKAMPENUID) {

        } else {
            row.addEventListener('click', removeMemberClick);
        }
        return row;
        // if your not admin show members and add friends to group
    } else {
        var row = Ti.UI.createTableViewRow({
            hasChild : child,
            width : Ti.UI.FILL,
            left : 0,
            className : 'gameTypeRow',
            height : 75,
            id : gID,
            uid : obj.uid,
            mName : obj.username,
        });

        var image;
        if (obj.fbid !== null) {
            image = "https://graph.facebook.com/" + obj.fbid + "/picture?type=large";
        } else {
            // get betkampen image
            image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + obj.uid + '.png';
        }

        var profilePic = Titanium.UI.createImageView({
            //defaultImage : "/images/no_pic.png",
            image : image,
            height : 40,
            width : 40,
            left : 10,
            borderRadius : 20
        });
        
        if(!isAndroid) {
       		profilePic.setDefaultImage('/images/no_pic.png');
       	}
        
        profilePic.addEventListener('error', function(e) {
            // fallback for image
            e.source.image = '/images/no_pic.png';
        });
        row.add(profilePic);

        var name = Ti.UI.createLabel({
            text : obj.username + " ",
            left : 60,
            color : "#FFF",
            font : Alloy.Globals.getFontCustom(16, "Regular"),
        });
        row.add(name);
        return row;
    }

}

var e = 0;
function createFriendGUI(friend, members) {
    var fr = [];
    if (members.data.length == 0) {

    } else {
        for (var s = 0; s < members.data.length; s++) {
            fr.push(members.data[s].uid);

        }
    }
    function isInArray(fr, search) {
        return (fr.indexOf(search) >= 0) ? true : false;
    }

    if (isInArray(fr, friend.id)) {
    } else {
        var row = Ti.UI.createTableViewRow({
            hasChild : child,
            width : Ti.UI.FILL,
            left : 0,
            className : 'gameTypeRow',
            height : 75,
            id : gID,
            uid : friend.id,
            //fId : friend.id,
            fName : friend.name,
        });

        var image;
        if (friend.fbid !== null) {
            image = "https://graph.facebook.com/" + friend.fbid + "/picture?type=large";
        } else {
            // get betkampen image
            image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + friend.id + '.png';
        }

        var profilePic = Titanium.UI.createImageView({
            //defaultImage : "/images/no_pic.png",
            image : image,
            height : 40,
            width : 40,
            left : 10,
            borderRadius : 20
        });
        
        if(!isAndroid) {
       		profilePic.setDefaultImage('/images/no_pic.png');
       	}       
        
        profilePic.addEventListener('error', function(e) {
            // fallback for image
            e.source.image = '/images/no_pic.png';
        });
        row.add(profilePic);

        boardName = friend.name.toString();
        if (boardName.length > 22) {
            boardName = boardName.substring(0, 19) + '...';
        }
        var name = Ti.UI.createLabel({
            text : boardName + " ",
            left : 60,
            color : "#FFF",
            font : Alloy.Globals.getFontCustom(16, "Regular"),
        });
        row.add(name);
        //add button to members
        var addBtn = Ti.UI.createLabel({

            right : 15,
            font : {
                fontFamily : font,
                fontSize : 30
            },
            text : fontawesome.icon('fa-plus'),
            color : '#FFF',
            id : 'awesome'

        });
        row.add(addBtn);
        row.addEventListener('click', addMemberClick);
        sections[1].add(row);
    }
}

function getGroupMembers() {
     // check connection
    if (!Alloy.Globals.checkConnection()) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        return;
    }
    
    if (OS_IOS) {
        indicator.openIndicator();
    }
    
    //Get mebers from db
    var client = Ti.Network.createHTTPClient({
        // function called when the response data is available
        onload : function(e) {
            var members = JSON.parse(this.responseText);
            members.data.sort(function(a, b) {
                var x = a.username.toLowerCase();
                var y = b.username.toLowerCase();
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });

            var tableHeaderView = Ti.UI.createView({
                height : 0.1
            });

            var tableFooterView = Ti.UI.createView({
                height : 0.1
            });

            if (!isAndroid) {
                table = Titanium.UI.createTableView({
                    left : 0,
                    top : 5,
                    headerView : tableHeaderView,
                    footerView : tableFooterView,
                    height : '50%',
                    width : '100%',
                    backgroundColor : 'transparent',
                    style : Ti.UI.iPhone.TableViewStyle.GROUPED,
                    tableSeparatorInsets : {
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
                    top : 5,
                    headerView : tableHeaderView,
                    height : '50%',
                    separatorColor : '#303030',
                    id : 'challengeTable'
                });

                table.footerView = Ti.UI.createView({
                    height : 0.5,
                    backgroundColor : '#303030'
                });
            }

            if (gAdmin !== Alloy.Globals.BETKAMPENUID) {
                table.height = '80%';
                table.top = 0;
            }

            var memberHeaderView = Ti.UI.createView({
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
                }
            });

            var memberLabel = Ti.UI.createLabel({
                text : Alloy.Globals.PHRASES.membersTxt + " ",
                left : 20,
                font : Alloy.Globals.getFontCustom(18, "Bold"),
                color : "#FFF"
            });
            memberHeaderView.add(memberLabel);

            if (!isAndroid) {
                sections[0] = Ti.UI.createTableViewSection({
                    headerView : memberHeaderView,
                    footerView : Ti.UI.createView({
                        height : 0.1
                    }),
                });
            } else {
                sections[0] = Ti.UI.createTableViewSection({
                    headerView : memberHeaderView
                });
            }

            for (var i = 0; i < members.data.length; i++) {
                sections[0].add(createGUI(members.data[i]));
            }

            getFriends(members);
        },
        // function called when an error occurs, including a timeout
        onerror : function(e) {
            indicator.closeIndicator();
            Ti.API.debug(e.error);
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        }
    });
    // Prepare the connection.
    client.open("GET", Alloy.Globals.BETKAMPENGETGROUPMEMBERSURL + '?gid=' + gID + '&lang=' + Alloy.Globals.LOCALE);
    client.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
    client.setTimeout(Alloy.Globals.TIMEOUT);

    // Send the request.
    client.send();
}

//get friends from db
function getFriends(members) {
    // check connection
    if (!Alloy.Globals.checkConnection()) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        return;
    }
    
    var xhr = Ti.Network.createHTTPClient({
        // function called when the response data is available
        onload : function(e) {
            friends = JSON.parse(this.responseText);
            friends.sort(function(a, b) {
                var x = a.name.toLowerCase();
                var y = b.name.toLowerCase();
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });
            var friendHeaderView = Ti.UI.createView({
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
                }
            });

            var friendLabel = Ti.UI.createLabel({
                text : Alloy.Globals.PHRASES.addMembersTxt + " ",
                left : 20,
                font : Alloy.Globals.getFontCustom(18, "Bold"),
                color : "#FFF"
            });
            friendHeaderView.add(friendLabel);

            if (!isAndroid) {
                sections[1] = Ti.UI.createTableViewSection({
                    headerView : friendHeaderView,
                    footerView : Ti.UI.createView({
                        height : 0.1
                    })
                });
            } else {
                sections[1] = Ti.UI.createTableViewSection({
                    headerView : friendHeaderView
                });
            }

            for (var i = 0; i < friends.length; i++) {
                createFriendGUI(friends[i], members);
            }

            table.setData(sections);
            mainView.add(table);
            createBtnViews();
            indicator.closeIndicator();
        },
        // function called when an error occurs, including a timeout
        onerror : function(e) {
            Ti.API.debug(e.error);
            indicator.closeIndicator();
        }
    });
    // Prepare the connection.
    xhr.open('GET', Alloy.Globals.BETKAMPENGETFRIENDSURL + '?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
    xhr.setRequestHeader("content-type", "application/json");
    xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
    xhr.setTimeout(Alloy.Globals.TIMEOUT);

    xhr.send();
}

getGroupMembers();
$.editGroup.add(mainView);