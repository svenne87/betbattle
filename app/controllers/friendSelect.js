Ti.App.addEventListener("sliderToggled", function(e) {
    if ( typeof listView !== 'undefined') {
        if (e.hasSlided) {
            listView.touchEnabled = false;
        } else {
            listView.touchEnabled = true;
        }
    }
});

// challenge friends
function challengeFriends(groupName) {
    if (Alloy.Globals.checkConnection()) {
        // show indicator and disable button
        indicator.openIndicator();
        submitButton.touchEnabled = false;

        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            indicator.closeIndicator();
            submitButton.touchEnabled = true;

            if (JSON.parse(this.responseText).indexOf('coins') != -1) {
                // not enough coins
                // show dialog with "link" to the store
                var alertWindow = Titanium.UI.createAlertDialog({
                    title : 'Betkampen',
                    message : JSON.parse(this.responseText),
                    buttonNames : [Alloy.Globals.PHRASES.okConfirmBtnTxt, Alloy.Globals.PHRASES.storeTxt]
                });

                alertWindow.addEventListener('click', function(e) {
                    switch (e.index) {
                    case 0:
                        alertWindow.hide();
                        break;
                    case 1:
                        var win = Alloy.createController('store').getView();
                        Alloy.Globals.WINDOWS.push(win);

                        if (OS_IOS) {
                            Alloy.Globals.NAV.openWindow(win, {
                                animated : true
                            });
                        } else if (OS_ANDROID) {
                            win.open({
                                fullScreen : false
                            });
                            win = null;
                        }
                        alertWindow.hide();
                        break;
                    }
                });
                alertWindow.show();

            } else {
                // any other "bad request error"
                Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
            }

            Ti.API.error('Bad Sever =>' + e.error);
        };

        try {
            xhr.open('POST', Alloy.Globals.BETKAMPENCHALLENGEDONEURL);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
            xhr.setTimeout(Alloy.Globals.TIMEOUT);

            param += ', "new_group":"' + groupName + '", "friends":[{';

            for (var i = 0; i < facebookFriendsChallenge.length; i++) {
                param += '"' + facebookFriendsChallenge[i].id + '":"' + facebookFriendsChallenge[i].name;

                if (i == (facebookFriendsChallenge.length - 1)) {
                    // last one
                    param += '"';
                } else {
                    param += '", ';
                }
            }

            param += '}]}';

            Ti.API.log(param);

            xhr.send(param);
        } catch(e) {
            indicator.closeIndicator();
            submitButton.touchEnabled = true;
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        }
        xhr.onload = function() {
            if (this.status == '200') {
                indicator.closeIndicator();

                if (this.readyState == 4) {
                    Ti.API.log(this.responseText);
                    var response = JSON.parse(this.responseText);

                    if ( typeof response.from !== 'undefined') {
                        var fb = Alloy.Globals.FACEBOOK;
                        fb.appid = Ti.App.Properties.getString('ti.facebook.appid');

                        fb.dialog("apprequests", {
                            message : response.from + " " + Alloy.Globals.PHRASES.hasChallengedYouBetBattleTxt + " " + Alloy.Globals.INVITEURL,
                            to : response.to,
                        }, function(responseFb) {

                            if (responseFb.result || typeof responseFb.result === 'undefined') {
                                // show dialog and if ok close window
                                response.message = response.message.replace(/(<br \/>)+/g, "\n");
                                var alertWindow = Titanium.UI.createAlertDialog({
                                    title : Alloy.Globals.PHRASES.betbattleTxt,
                                    message : response.message,
                                    buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt]
                                });

                                alertWindow.addEventListener('click', function() {
                                    submitButton.touchEnabled = true;
                                    // change view
                                    var arg = {
                                        refresh : true
                                    };

                                    var obj = {
                                        controller : 'challengesView',
                                        arg : arg
                                    };
                                    Ti.App.fireEvent('app:updateView', obj);

                                    for (win in Alloy.Globals.WINDOWS) {
                                        Alloy.Globals.WINDOWS[win].close();

                                        if (OS_ANDROID) {
                                            Alloy.Globals.WINDOWS[win] = null;
                                        }
                                    }
                                });
                                alertWindow.show();
                            }
                        });

                    } else {
                        response = response.replace(/(<br \/>)+/g, "\n");
                        // show dialog and if ok close window
                        var alertWindow = Titanium.UI.createAlertDialog({
                            title : Alloy.Globals.PHRASES.betbattleTxt,
                            message : response,
                            buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt]
                        });

                        alertWindow.addEventListener('click', function() {
                            submitButton.touchEnabled = true;
                            // change view
                            var arg = {
                                refresh : true
                            };

                            var obj = {
                                controller : 'challengesView',
                                arg : arg
                            };
                            Ti.App.fireEvent('app:updateView', obj);

                            for (win in Alloy.Globals.WINDOWS) {
                                Alloy.Globals.WINDOWS[win].close();
                            }
                        });
                        alertWindow.show();

                    }
                } else {
                    submitButton.touchEnabled = true;
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                }
            } else {
                indicator.closeIndicator();
                submitButton.touchEnabled = true;
                Ti.API.error("Error =>" + this.response);
                Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
            }
        };

    } else {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }
}

// get facebook friends
function getFacebookFriends() {
    // check if listView and buttons exists, and if it does simply remove it
    var children = $.friendSelect.children;
    for (var i = 0; i < children.length; i++) {
        if (children[i].id === 'groupsTable') {
            $.friendSelect.remove(children[i]);
        }
        if (children[i].id === 'submitButtonsView') {
            $.friendSelect.remove(children[i]);
        }
    }
    // fetch friends and then build the view
    var facebookObject = Alloy.Globals.FACEBOOKOBJECT;
    var fb = Alloy.Globals.FACEBOOK;

    if (OS_IOS) {
        indicator.openIndicator();
    }

    var query = "SELECT uid, name, pic_square, hometown_location  FROM user ";
    query += "where uid IN (SELECT uid2 FROM friend WHERE uid1 = " + fb.uid + ")";
    query += "order by last_name limit 1000";
    fb.request("fql.query", {
        query : query
    }, function(r) {
        if (r.success) {
            indicator.closeIndicator();
            facebookFriendsObjects = JSON.parse(r.result);
            createFriendsView(facebookFriendsObjects);
        } else {
            indicator.closeIndicator();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        }
    });

}

function createSubmitButtons() {

    var submitButtonsView = Ti.UI.createView({
        height : '20%',
        width : '100%',
        backgroundColor : '#303030',
        layout : 'vertical'
    });

    submitButton = Titanium.UI.createButton({
        title : 'Utmana',
        height : 40,
        top : 5,
        width : '70%',
        id : 'submitButton',
        borderRadius : 6,
        backgroundColor : Alloy.Globals.themeColor(),
        font : {
            fontSize : Alloy.Globals.getFontSize(2),
            fontWeight : 'normal',
            fontFamily : Alloy.Globals.getFont()
        },
        color : '#FFF',
        backgroundImage : 'none'
    });

    submitButton.addEventListener('click', function() {
        if (facebookFriendsChallenge.length > 0) {
            var dialog;
            var confirm = Alloy.Globals.PHRASES.okConfirmTxt;
            var cancel = Alloy.Globals.PHRASES.abortBtnTxt;

            if (OS_IOS) {
                dialog = Ti.UI.createAlertDialog({
                    title : Alloy.Globals.PHRASES.stateGroupNameTxt,
                    message : Alloy.Globals.PHRASES.groupCreationInfoTxt,
                    style : Ti.UI.iPhone.AlertDialogStyle.PLAIN_TEXT_INPUT,
                    buttonNames : [confirm, cancel]
                });

            } else if (OS_ANDROID) {
                var textfield = Ti.UI.createTextField();
                dialog = Ti.UI.createAlertDialog({
                    title : Alloy.Globals.PHRASES.stateGroupNameTxt,
                    message : Alloy.Globals.PHRASES.groupCreationInfoTxt,
                    androidView : textfield,
                    buttonNames : [confirm, cancel]
                });
            }

            dialog.addEventListener('click', function(e) {
                if (e.index == 0) {
                    var text;

                    if (OS_IOS) {
                        text = e.text;
                    } else if (OS_ANDROID) {
                        text = textfield.value;
                    }

                    if (text.length > 2 && text.length < 16) {
                        challengeFriends(text);
                    } else {
                        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.groupNameErrorTxt);
                    }
                } else {
                    dialog.hide();
                }
            });
            dialog.show();
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.friendChallengeErrorTxt);
        }
    });

    marginView = Titanium.UI.createView({
        id : 'marginView',
        height : 10
    });

    //submitButtonsView.add(groupsButton);
    submitButtonsView.add(marginView);
    submitButtonsView.add(submitButton);
    submitButton.add(marginView);
    $.friendSelect.add(submitButtonsView);
}

function createFriendsView(array) {
    var fontawesome = require('lib/IconicFont').IconicFont({
        font : 'lib/FontAwesome'
    });

    var font = 'FontAwesome';

    if (OS_ANDROID) {
        font = 'fontawesome-webfont';
    }

    // create default template to use in listView
    var templateHeight;
    var topLabelPos = 10;

    if (OS_IOS) {
        templateHeight = 60;
        topLabelPos = 20;
    } else {
        templateHeight = Ti.UI.SIZE;
    }

    var facebookTemplate = {
        childTemplates : [{
            type : 'Ti.UI.ImageView',
            bindId : 'pic',
            properties : {
                width : 50,
                height : 50,
                left : 0
            }
        }, {
            type : 'Ti.UI.Label',
            bindId : 'textLabel',
            properties : {
                color : '#FFF',
                font : {
                    fontSize : Alloy.Globals.getFontSize(1),
                    fontWeight : 'normal',
                    fontFamily : Alloy.Globals.getFont()
                },
                left : 70,
                height : 'auto',
                top : topLabelPos,
                textAlign : 'left',
                width : 'auto'
            }
        }, {
            type : 'Ti.UI.Label',
            bindId : 'selectLabel',
            properties : {
                color : '#FFF',
                font : {
                    fontFamily : font,
                    fontSize : 30
                },
                right : 10,
                height : 'auto',
                width : 'auto'
            }
        }],
        properties : {
            height : templateHeight
        }
    };

    var search = Titanium.UI.createSearchBar({
        barColor : '#303030',
        showCancel : true,
        height : 43,
        hintText : Alloy.Globals.PHRASES.searchFriendsTxt,
        top : 0,
        color : '#FFF',
        backgroundColor : '#303030'
    });

    search.addEventListener('cancel', function() {
        search.blur();
    });

    search.addEventListener('change', function(e) {
        listView.searchText = e.value;
    });

    // create listView with all facebook friends
    listView = Ti.UI.createListView({
        id : 'facebookFriends',
        height : '80%',
        templates : {
            'template' : facebookTemplate
        },
        defaultItemTemplate : 'template',
        searchView : search,
        caseInsensitiveSearch : true,
        allowsSelection : true,
        backgroundColor : '#303030'
    });

    listView.footerView = Ti.UI.createView({
        height : 0.5,
        backgroundColor : '#6d6d6d'
    });

    if (OS_IOS) {
        listView.separatorInsets = {
            left : 0,
            right : 0
        };
    }

    var sections = [];

    var listHeaderView = Ti.UI.createView({
        height : '142dp',
        backgroundImage : '/images/header.png'
    });

    var listHeaderLabel = Ti.UI.createLabel({
        width : '100%',
        textAlign : 'center',
        top : 50,
        text : Alloy.Globals.PHRASES.showFriendsTxt,
        font : {
            fontSize : Alloy.Globals.getFontSize(3),
            fontWeight : 'normal',
            fontFamily : Alloy.Globals.getFont()
        },
        color : '#FFF'
    });

    listHeaderView.add(listHeaderLabel);

    // create the section for the ListView
    var dataSection = Ti.UI.createListSection({
        headerView : listHeaderView
    });

    // Add the section to the section array, we will have one element in the
    // array and we MUST define it, unlike in the tableView
    sections.push(dataSection);

    var selectionStyle;

    if (OS_IOS) {
        selectionStyle = Titanium.UI.iPhone.ListViewCellSelectionStyle.BLUE;
    }

    // this is pretty straight forward, assigning the values to the specific
    // properties in the template we defined above
    var items = [];
    for (var i in array) {
        items.push({
            selectLabel : {
                text : "",
                id : i
            },
            textLabel : {
                text : array[i].name
            },
            pic : {
                image : array[i].pic_square
            },
            properties : {
                searchableText : array[i].name,
                itemId : array[i].uid,
                color : '#FFF',
                backgroundColor : '#303030',
                selectionStyle : selectionStyle
                //selectedBackgroundColor : 'transparent'
            }
        });
    }
    dataSection.setItems(items);

    // when all done, assign the section array to the ListView
    listView.sections = sections;

    listView.addEventListener('itemclick', function(e) {
        var selected = dataSection.getItemAt(e.itemIndex);

        if (OS_ANDROID) {
            // working fix for titanium bug timob-16079
            var searchKey = listView.getSearchText();

            if (searchKey !== '' && typeof searchKey !== 'undefined') {
                searchKey = searchKey.toLowerCase();
                var section = listView.sections[e.sectionIndex];
                // get results manually
                var _results = _.filter(section.items, function(_item) {
                    return _item.properties.searchableText.toLowerCase().indexOf(searchKey) !== -1;
                });

                for (var i = 0; i < _results.length; i++) {
                    if (_results[i].properties.itemId == e.itemId) {
                        e.itemIndex = i;
                        selected = _results[e.itemIndex];
                        e.itemIndex = selected.selectLabel.id;
                        break;
                    }
                }
            }
        }

        //selected.properties.accessoryType = Ti.UI.LIST_ACCESSORY_TYPE_CHECKMARK;

        if (selected.selectLabel.text.length > 0) {
            selected.selectLabel.text = "";
        } else {
            selected.selectLabel.text = fontawesome.icon('fa-check');
        }

        var friend = {
            name : selected.textLabel.text,
            id : e.itemId
        };
        var index = -1;
        // remove friend if already in list
        for (var i in facebookFriendsChallenge) {
            if (facebookFriendsChallenge[i].id == e.itemId) {
                // friend already in list, store index to remove
                index = i;
                break;
            }
        }

        if (index != -1) {
            facebookFriendsChallenge.splice(index, 1);
        } else {
            facebookFriendsChallenge.push(friend);
        }

        dataSection.updateItemAt(e.itemIndex, selected);
    });

    $.friendSelect.add(listView);
    createSubmitButtons();
}

var facebookFriendsObjects = [];
var facebookFriendsChallenge = [];
var listView;
var submitButton;
var groupsButton;
var args = arguments[0] || {};
var param = args.param || null;

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

if (OS_ANDROID) {
    $.friendSelectWindow.orientationModes = [Titanium.UI.PORTRAIT];

    $.friendSelectWindow.addEventListener('open', function() {
        Alloy.Globals.setAndroidCouponMenu($.friendSelectWindow.activity);

        $.friendSelectWindow.activity.actionBar.onHomeIconItemSelected = function() {
            $.friendSelectWindow.close();
            $.friendSelectWindow = null;
        };
        $.friendSelectWindow.activity.actionBar.displayHomeAsUp = true;
        $.friendSelectWindow.activity.actionBar.title = Alloy.Globals.PHRASES.pickFriendsTxt;
        indicator.openIndicator();
    });
} else {
    $.friendSelectWindow.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.pickFriendsTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });

}

$.friendSelectWindow.addEventListener('close', function() {
    indicator.closeIndicator();
});

// check connection
if (Alloy.Globals.checkConnection()) {
    getFacebookFriends();
} else {
    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
}