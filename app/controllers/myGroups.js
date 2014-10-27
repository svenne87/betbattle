var sections = [];
var table = null;
var isAndroid = true;
var child = false;

var fontawesome = require('lib/IconicFont').IconicFont({
    font : 'lib/FontAwesome'
});

var font = 'fontawesome-webfont';

if (OS_IOS) {
    $.myGroups.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.myGroupsTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });

    child = true;
    isAndroid = false;
    font = 'FontAwesome';
}

if (isAndroid) {
    var rightPercentage = '5%';

    if (Titanium.Platform.displayCaps.platformWidth < 350) {
        rightPercentage = '3%';
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

function getGroups() {
    groupObjects = [];

    if (!isAndroid) {
        indicator.openIndicator();
    }

    // Get groups with members
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onerror = function(e) {
        indicator.closeIndicator();

        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        Ti.API.error('Bad Sever =>' + e.error);
    };

    try {
        xhr.open('GET', Alloy.Globals.BETKAMPENGETGROUPSURL + '/?lang=' + Alloy.Globals.LOCALE);

        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
        xhr.setTimeout(Alloy.Globals.TIMEOUT);

        xhr.send();
    } catch(e) {
        indicator.closeIndicator();

        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
    }
    xhr.onload = function() {
        Ti.API.log(this.responseText);
        if (this.status == '200') {
            if (this.readyState == 4) {
                var response = JSON.parse(this.responseText);

                if (response.length > 0) {
                    response.sort(function(a, b) {
                        var x = a.name.toLowerCase();
                        var y = b.name.toLowerCase();
                        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                    });
                    for (var i = 0; i < response.length; i++) {
                        var membersArray = [];
                        for (var x = 0; x < response[i].members.length; x++) {
                            // member object
                            var member = {
                                id : response[i].members[x].id,
                                fbid : response[i].members[x].fbid,
                                name : response[i].members[x].name
                            };
                            membersArray.push(member);
                        }

                        var groupObject = Alloy.createModel('group', {
                            creator : response[i].creator,
                            id : response[i].id,
                            name : response[i].name,
                            members : membersArray
                        });

                        // add to array
                        groupObjects.push(groupObject);
                    }

                    // create the views
                    createViews(groupObjects);
                } else {
                    createBtn();
                }

            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            }
            indicator.closeIndicator();
        } else {
            indicator.closeIndicator();

            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("Error =>" + this.response);
        }
    };
}

function createBtn() {
    var addGroupLabel = Ti.UI.createLabel({
        classes : ['no-remove'],
        text : Alloy.Globals.PHRASES.noGroupsTxt,
        textAlign : "center",
        top : 10,
        font : Alloy.Globals.getFontCustom(18, "Regular"),
        color : "#FFF"
    });
    mainView.add(addGroupLabel);

    var openCreateGroupBtn = Alloy.Globals.createButtonView("#FFF", "#000", Alloy.Globals.PHRASES.createGroupTxt);

    mainView.add(openCreateGroupBtn);

    openCreateGroupBtn.addEventListener('click', function(e) {
        var win = Alloy.createController('createGroup').getView();
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
        $.myGroups.close();
    });

}

function createViews(array) {
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
            height : '85%',
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
            height : '85%',
            separatorColor : '#303030',
            id : 'challengeTable'
        });
        
        table.footerView = Ti.UI.createView({
           height : 0.5,
           width : Ti.UI.FILL,
           backgroundColor : '#303030' 
        });
    }

    if (!isAndroid) {
        sections[0] = Ti.UI.createTableViewSection({
            headerView : Ti.UI.createView({
                height : 0.1
            }),
            footerView : Ti.UI.createView({
                height : 0.1
            })
        });
    } else {
        sections[0] = Ti.UI.createTableViewSection({});
    }

    // Rows
    for (var i = 0; i < array.length; i++) {
        var group = Ti.UI.createTableViewRow({
            classes : ['remove'],
            hasChild : child,
            width : Ti.UI.FILL,
            left : 0,
            className : 'gameTypeRow',
            height : 75,
            id : array[i].attributes.id,
            creator : array[i].attributes.creator,
            gName : array[i].attributes.name,
        });

        //mainView.add(group);

        var iconLabel = Titanium.UI.createLabel({
            font : {
                fontFamily : font,
                fontSize : 22
            },
            text : fontawesome.icon('fa-users'),
            left : 20,
            color : '#FFF',
        });

        group.add(iconLabel);

        var name = Ti.UI.createLabel({
            classes : ['remove'],
            text : array[i].attributes.name,
            id : array[i].attributes.id,
            left : 50,
            font : Alloy.Globals.getFontCustom(16, "Regular"),
            color : "#FFF",
        });
        group.add(name);

        if (!child) {
            group.add(Ti.UI.createLabel({
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

        /*if (array[i].attributes.creator == Alloy.Globals.BETKAMPENUID) {
         var deleteBtn = Ti.UI.createButton({
         classes : ['remove'],
         height : 45,
         width : '18%',
         left : '81.2%',
         id : array[i].attributes.id,
         admin : '1',
         font : {
         fontFamily : font,
         fontSize : 30
         },
         title : fontawesome.icon('fa-trash-o'),
         backgroundColor : '#fff',
         color : '#000',
         opacity : 0.7,
         borderRadius : 10
         });
         } else {
         var deleteBtn = Ti.UI.createButton({
         classes : ['remove'],
         height : 45,
         width : '18%',
         left : '81.2%',
         id : array[i].attributes.id,
         admin : '0',
         creator : array[i].attributes.creator,
         font : {
         fontFamily : font,
         fontSize : 30
         },
         title : fontawesome.icon('fa-ban'),
         backgroundColor : '#fff',
         color : '#000',
         opacity : 0.7,
         borderRadius : 10
         });
         }*/

        /*.addEventListener('click', function(e) {
         // delete group
         if (e.source.admin == '1') {
         var aD = Titanium.UI.createAlertDialog({
         title : Alloy.Globals.PHRASES.betbattleTxt,
         message : Alloy.Globals.PHRASES.deleteGroupTxt,
         buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.abortBtnTxt],
         cancel : 1,
         id : e.source.id
         });

         aD.addEventListener('click', function(e) {
         switch(e.index) {
         case 0:
         var deleteGroup = Ti.Network.createHTTPClient();
         deleteGroup.onload = function() {
         Ti.API.info(this.ResponseText);
         if (this.responseText == 'Erased') {
         //alert(Alloy.Globals.PHRASES.groupDeletedTxt);
         } else {
         alert(Alloy.Globals.PHRASES.commonErrorTxt);
         }
         };
         deleteGroup.open("POST", Alloy.Globals.BETKAMPENDELTEGROUPURL + '/?lang=' + Alloy.Globals.LOCALE);
         var params = {
         group_id : e.source.id,
         id : Alloy.Globals.BETKAMPENUID,
         };
         deleteGroup.send(params);
         var win = Alloy.createController('myGroups').getView();
         Alloy.Globals.showToast(Alloy.Globals.PHRASES.groupDeletedTxt);

         if (OS_IOS) {
         Alloy.Globals.NAV.openWindow(win, {
         animated : false
         });
         } else {
         win.open({
         fullScreen : true
         });
         win = null;
         }
         $.myGroups.close();
         break;
         case 1:
         Titanium.API.info('cancel');
         break;
         }

         });
         aD.show();
         //leave group
         } else {
         var aL = Titanium.UI.createAlertDialog({
         title : Alloy.Globals.PHRASES.betbattleTxt,
         message : Alloy.Globals.PHRASES.leaveGroupTxt,
         buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.abortBtnTxt],
         cancel : 1,
         id : e.source.id
         });

         aL.addEventListener('click', function(e) {
         switch(e.index) {
         case 0:
         var leaveGroup = Ti.Network.createHTTPClient();

         leaveGroup.open("POST", Alloy.Globals.BETKAMPENREMOVEGROUPMEMBERURL);
         var params = {
         group_id : e.source.id,
         id : Alloy.Globals.BETKAMPENUID,
         member_to_remove : Alloy.Globals.BETKAMPENUID,
         };
         leaveGroup.send(params);
         var win = Alloy.createController('myGroups').getView();
         if (OS_IOS) {
         Alloy.Globals.NAV.openWindow(win, {
         animated : false
         });
         } else {
         win.open({
         fullScreen : true
         });
         win = null;
         }
         $.myGroups.close();
         break;
         case 1:
         Titanium.API.info('cancel');
         break;
         }

         });
         aL.show();

         }

         });*/

        group.addEventListener('click', function(e) {
            var args = {
                row : e.row.children[1],
                gID : e.row.id,
                gName : e.row.gName,
                gAdmin : e.row.creator
            };

            var win = Alloy.createController('editGroup', args).getView();
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
            //$.myGroups.close();
        });

        sections[0].add(group);
    }

    table.setData(sections);
    mainView.add(table);
}

var args = arguments[0] || {};
var params = args.param || null;
var groupObjects = [];
var refresher;

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

var iOSVersion;

if (OS_IOS) {
    iOSVersion = parseInt(Ti.Platform.version);
}

// check connection
if (Alloy.Globals.checkConnection()) {
    getGroups();
} else {
    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
}

if (OS_ANDROID) {
    $.myGroups.addEventListener('open', function() {
        Alloy.Globals.setAndroidCouponMenu($.myGroups.activity);

        $.myGroups.activity.actionBar.onHomeIconItemSelected = function() {
            $.myGroups.close();
            $.myGroups = null;
        };
        $.myGroups.activity.actionBar.displayHomeAsUp = true;
        $.myGroups.activity.actionBar.title = Alloy.Globals.PHRASES.myGroupsTxt;

        // sometimes the view remain in memory, then we don't need to show the "loading"
        if (groupObjects.length === 0) {
            indicator.openIndicator();
        }
    });
}
$.myGroups.addEventListener('close', function() {
    indicator.closeIndicator();
});

$.myGroups.add(mainView);
