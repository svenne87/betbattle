/* Function */
var args = arguments[0] || {};
var coins = -1;
if ( typeof args.coins !== 'undefined') {
    coins = args.coins;
}
Ti.App.addEventListener("sliderToggled", function(e) {
    if ( typeof table !== 'undefined') {
        if (e.hasSlided) {
            table.touchEnabled = false;
        } else {
            table.touchEnabled = true;
        }
    }
});

var globalType = 0;

var tableWrapper = Ti.UI.createView({
    height : "65%",
    width : Ti.UI.FILL
});

function createMemberRow(member, subRow) {
    //profilepicture
    var userWrapper = Ti.UI.createView({
        height : 40,
        width : Ti.UI.FILL,
    });

    var image;

    if (member.fbid !== null) {
        image = "https://graph.facebook.com/" + member.fbid + "/picture?type=large";
    } else {
        // get betkampen image
        image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + member.id + '.png';
    }

    var profilePic = Ti.UI.createImageView({
        defaultImage : '/images/no_pic.png',
        image : image,
        height : 20,
        width : 20,
        left : 10,
        borderRadius : 10,
    });

    profilePic.addEventListener('error', imageErrorHandler);

    userWrapper.add(profilePic);
    userWrapper.add(Ti.UI.createLabel({
        text : member.name,
        left : 60,
        width : 'auto',
        font : Alloy.Globals.getFontCustom(14, "Regular"),
        color : '#FFF',
        backgroundColor : 'transparent'
    }));

    var rowLine = Ti.UI.createView({
        backgroundColor : "#303030",
        height : 0.5,
        width : Ti.UI.FILL
    });

    subRow.add(userWrapper);
    subRow.add(rowLine);
}

function getFriends() {
    selectedGroupIds = [];
    friendsChallenge = [];

    indicator.openIndicator();

    // Get groups with members
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onerror = function(e) {
        indicator.closeIndicator();
        endRefresher();
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        Ti.API.error('Bad Sever =>' + e.error);
    };

    try {
        xhr.open('GET', Alloy.Globals.BETKAMPENGETFRIENDSURL + '?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);

        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
        xhr.setTimeout(Alloy.Globals.TIMEOUT);

        xhr.send();
    } catch(e) {
        indicator.closeIndicator();
        endRefresher();
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
    }
    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {
                var response = JSON.parse(this.responseText);

                if (response.length > 0) {
                    friendObjects = [];
                    for (var i = 0; i < response.length; i++) {

                        var friendObject = Alloy.createModel('friend', {
                            fbid : response[i].fbid,
                            id : response[i].id,
                            name : response[i].name
                        });

                        // add to array
                        friendObjects.push(friendObject);
                    }

                    // create the views
                    createViews(friendObjects, '2');
                } else {
                    Ti.API.info("Inga Vänner");
                }

            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            }
            indicator.closeIndicator();
            if(isAndroid) {
                endRefresher();
            }
        } else {
            indicator.closeIndicator();
            endRefresher();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("Error =>" + this.response);
        }
    };

}

function getGroups() {
    selectedGroupIds = [];
    friendsChallenge = [];

    if (!isAndroid || notFirstRun) {
        indicator.openIndicator();
    }

    // Get groups with members
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onerror = function(e) {
        indicator.closeIndicator();
        endRefresher();
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
        endRefresher();
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
    }
    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {
                var response = JSON.parse(this.responseText);
                if (response.length > 0) {
                    groupObjects = [];
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
                    createViews(groupObjects, '1');
                } else {

                    tab_groups.setBackgroundColor('#242424');
                    tab_groups.backgroundGradient = {
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
                            color : "#2E2E2E",
                            offset : 0.0
                        }, {
                            color : "#151515",
                            offset : 1.0
                        }]
                    };
                    tab_friends.setBackgroundColor(Alloy.Globals.themeColor());
                    
                    var emptyLabel = Ti.UI.createLabel({
                       height : 40,
                       top : 40,
                       width : Ti.UI.FILL, 
                       font : Alloy.Globals.getFontCustom(16, "Regular"),
                       color : '#FFF',
                       left : 20,
                       text : Alloy.Globals.PHRASES.noGroupsTxt
                    });
                    
                    //.add(emptyLabel);
                    //getFriends();  // TODO
                }

            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            }
            indicator.closeIndicator();
            if(isAndroid) {
                endRefresher();
            }
        } else {
            indicator.closeIndicator();
            endRefresher();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("Error =>" + this.response);
        }
    };
}

function challengeGroup(array) {
    if (Alloy.Globals.checkConnection()) {
        // show indicator and disable button
        indicator.openIndicator();
        isSubmitting = true;

        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            indicator.closeIndicator();
            isSubmitting = false;
            Ti.API.info("ERROR RESPONSE : " + JSON.stringify(this.responseText));
            Ti.API.error('Bad Sever =>' + e.error);
            if (JSON.parse(this.responseText).indexOf(Alloy.Globals.PHRASES.coinsInfoTxt.toLowerCase()) != -1) {
                // not enough coins
                // show dialog with "link" to the store
                var alertWindow = Titanium.UI.createAlertDialog({
                    title : Alloy.Globals.PHRASES.betbattleTxt,
                    message : JSON.parse(this.responseText),
                    buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.storeTxt]
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
                var errorText = "";
                try{
                    errorText = JSON.parse(this.responseText);
                    Alloy.Globals.showFeedbackDialog(errorText);
                } catch(e) {
                    //
                }
                
                if(errorText === "") {
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                }
            }
        };

        try {
            xhr.open('POST', Alloy.Globals.BETKAMPENCHALLENGEGROUPURL);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
            xhr.setTimeout(Alloy.Globals.TIMEOUT);

            var param = "";
            // add groups to params
            param += '{"cid": ' + Alloy.Globals.COUPON.id + ', "lang" : "' + Alloy.Globals.LOCALE + '", "coins": ' + coins + ', "groups": [{';

            for (var i = 0; i < array.length; i++) {
                for (var x = 0; x < groupObjects.length; x++) {
                    if (groupObjects[x].attributes.id === array[i]) {
                        param += '"' + array[i] + '":"' + groupObjects[x].attributes.name;

                        if (i != (array.length - 1)) {
                            param += '", ';
                        } else {
                            // last one
                            param += '"';
                        }
                    }
                }
            }

            param += '}]}';
            xhr.send(param);
        } catch(e) {
            indicator.closeIndicator();
            isSubmitting = false;
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        }
        xhr.onload = function() {
            if (this.status == '200') {
                indicator.closeIndicator();

                if (this.readyState == 4) {
                    var response = JSON.parse(this.responseText);
                    response = response.replace(/(<br \/>)+/g, "\n");
                    // show dialog and if ok close window
                    Alloy.Globals.showToast(response, true);
                   
                    // change view
                    var arg = {
                        refresh : true
                    };
                    var obj = {
                        controller : 'challengesView',
                        arg : arg
                    };
                   
                    Ti.App.fireEvent('app:updateView', obj);
                    
                    for (var win in Alloy.Globals.WINDOWS) {
                        Alloy.Globals.WINDOWS[win].setOpacity(0);
                    }
                    
                    $.groupSelectWindow.close();
                    
                    for (var win in Alloy.Globals.WINDOWS) {
                        Alloy.Globals.WINDOWS[win].close();
                    }       
                    
                } else {
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                    isSubmitting = false;
                }
            } else {
                Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
                indicator.closeIndicator();
                isSubmitting = false;
                Ti.API.error("Error =>" + this.response);
            }
        };

    } else {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }
}

// challenge friends
function challengeFriends() {
    if (Alloy.Globals.checkConnection()) {
        // show indicator and disable button
        indicator.openIndicator();
        isSubmitting = true;

        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            indicator.closeIndicator();
            isSubmitting = false;
            Ti.API.info("ERROR PARSE : " + JSON.stringify(this.responseText));
            if (JSON.parse(this.responseText).indexOf(Alloy.Globals.PHRASES.coinsInfoTxt.toLowerCase()) != -1) {
                // not enough coins
                // show dialog with "link" to the store
                var alertWindow = Titanium.UI.createAlertDialog({
                    title : Alloy.Globals.PHRASES.betbattleTxt,
                    message : JSON.parse(this.responseText),
                    buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.storeTxt]
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
                var errorText = "";
                try{
                    errorText = JSON.parse(this.responseText);
                    Alloy.Globals.showFeedbackDialog(errorText);
                } catch(e) {
                    //
                }
                
                if(errorText === "") {
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                }
            }

            Ti.API.error('Bad Sever =>' + e.error);
        };

        try {
            xhr.open('POST', Alloy.Globals.BETKAMPENCHALLENGEFRIENDSURL + '/?lang=' + Alloy.Globals.LOCALE);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
            xhr.setTimeout(Alloy.Globals.TIMEOUT);
            var param = "";
            param += '{"coins": ' + coins + ', "lang" :"' + Alloy.Globals.LOCALE + '", "cid":"' + Alloy.Globals.COUPON.id + '", "friends":[{';

            for (var i = 0; i < friendsChallenge.length; i++) {
                param += '"' + friendsChallenge[i].id + '":"' + friendsChallenge[i].name;

                if (i == (friendsChallenge.length - 1)) {
                    // last one
                    param += '"';
                } else {
                    param += '", ';
                }
            }

            param += '}]}';

            xhr.send(param);
        } catch(e) {
            indicator.closeIndicator();
            isSubmitting = false;
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        }
        xhr.onload = function() {
            if (this.status == '200') {
                indicator.closeIndicator();

                if (this.readyState == 4) {
                    var response = JSON.parse(this.responseText);

                    response = response.replace(/(<br \/>)+/g, "\n");
                    // show dialog and if ok close window   
                    Alloy.Globals.showToast(response, true);                           
   
                    // change view
                    var arg = {
                        refresh : true
                    };
                    var obj = {
                        controller : 'challengesView',
                        arg : arg
                    };
                    
                    Ti.App.fireEvent('app:updateView', obj);
                    
                    for (var win in Alloy.Globals.WINDOWS) {
                        Alloy.Globals.WINDOWS[win].setOpacity(0);
                    }
                    
                    $.groupSelectWindow.close();
                    
                    for (var win in Alloy.Globals.WINDOWS) {
                        Alloy.Globals.WINDOWS[win].close();
                    }

                } else {
                    isSubmitting = false;
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                }
            } else {
                indicator.closeIndicator();
                isSubmitting = false;
                Ti.API.error("Error =>" + this.response);
                Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
            }
        };

    } else {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }
}

function createSubmitButtons(type) {
    submitButton = null;
    var buttonHeight = 40;
    var viewHeight = '20%';

    botView.removeAllChildren();

    if (isAndroid) {
        if (Titanium.Platform.displayCaps.platformHeight < 600) {
            buttonHeight = 30;
            table.setHeight('75%');
            viewHeight = '25%';
        }
    }

    var submitButtonsView = Ti.UI.createView({
        height : viewHeight,
        width : 'auto',
        layout : 'vertical',
        backgroundColor : 'transparent',
        id : 'submitButtonsView'
    });

    submitButton = Alloy.Globals.createButtonView(Alloy.Globals.themeColor(), "#FFF", Alloy.Globals.PHRASES.challengeBtnTxt);
    submitButton.id = "submitButton";
    submitButton.top = 15;

    submitButton.addEventListener('click', function() {
        if (isSubmitting) {
            return;
        }

        if (type === '1') {
            if (selectedGroupIds.length === 1) {
                // call function to send to server
                Ti.API.info("challenge : Group");
                challengeGroup(selectedGroupIds);
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.groupChallengeErrorTxt);
            }
        }

        if (type === '2') {
            if (friendsChallenge.length > 0) {
                Ti.API.info("challenge : Friends");
                challengeFriends();
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.friendChallengeErrorTxt);
            }

        }

    });

    botView.add(submitButton);
}

function createViews(array, type) {
    globalType = type;
    
    // check if table exists, and if it does simply remove it
    var children = tableWrapper.children;
    for (var i = 0; i < children.length; i++) {
        if (children[i].id === 'groupsTable') {
            tableWrapper.remove(children[i]);
        }
        if (children[i].id === 'submitButtonsView') {
            $.groupSelect.remove(children[i]);
        }
        children[i] = null;
    }

    if (!isAndroid) {
        refresher = Ti.UI.createRefreshControl({
            tintColor : Alloy.Globals.themeColor()
        });

        // will refresh on pull
        refresher.addEventListener('refreshstart', function(e) {
            if (Alloy.Globals.checkConnection()) {
                if (type === '1') {
                    getGroups();
                } else if (type === '2') {
                    getFriends();
                }

            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
                refresher.endRefreshing();
            }
        });
    } 
    
    // Table
    var hasChild = false;

    if (!isAndroid) {
        hasChild = true;

        table = Ti.UI.createTableView({
            height : Ti.UI.FILL,
            id : 'groupsTable',
            refreshControl : refresher,
            backgroundColor : 'transparent',
            separatorInsets : {
                left : 0,
                right : 0
            },
            separatorColor : '#303030',
            separatorStyle : Titanium.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE
        });

        if (iOSVersion < 7) {
            table.separatorStyle = Titanium.UI.iPhone.TableViewSeparatorStyle.NONE;
            table.separatorColor = 'transparent';
        }
    } else {
        table = Ti.UI.createTableView({
            height : Ti.UI.FILL,
            id : 'groupsTable',
            backgroundColor : '#000',
            separatorColor : '#303030'
        });
    }

    table.footerView = Ti.UI.createView({
        height : 0.5,
        backgroundColor : '#303030'
    });

    var data = [];

    // Rows
    for (var i = 0; i < array.length; i++) {
        if (type == 1) {
            var subRowArray = [];
            var count = 0;
            var subRow = Ti.UI.createTableViewRow({
                layout : 'vertical',
                backgroundColor : 'transparent',
                selectionStyle : 'none',
                height : 'auto'
            });

            subRow.footerView = Ti.UI.createView({
                height : 0.5,
                backgroundColor : '#303030'
            });

            for (var x = 0; x < array[i].attributes.members.length; x++) {
                createMemberRow(array[i].attributes.members[x], subRow);
                count++;
            }

            // array with views for the sub in table row

            var row = $.UI.create('TableViewRow', {
                classes : ['challengesSectionDefault'],
                id : array[i].attributes.id,
                hasChild : false,
                isparent : true,
                opened : false,
                parent : table,
                height : 70,
                memberCount : count,
                //name: array[i].attributes.name,
                sub : subRow
            });

            row.add(Ti.UI.createLabel({
                text : array[i].attributes.name,
                top : 14,
                left : 60,
                font : Alloy.Globals.getFontCustom(16, 'Regular'),
                color : '#FFF'
            }));

        } else {
            //profilepicture
            var image;
            if (array[i].attributes.fbid !== null) {
                image = "https://graph.facebook.com/" + array[i].attributes.fbid + "/picture?type=large";
            } else {
                // get betkampen image
                image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + array[i].attributes.id + '.png';
            }

            var row = $.UI.create('TableViewRow', {
                classes : ['challengesSectionDefault'],
                id : array[i].attributes.id,
                hasChild : false,
                isparent : true,
                opened : false,
                parent : table,
                name : array[i].attributes.name,
                height : 70,
                //sub : subRowArray,
            });

            var detailsImg = Ti.UI.createImageView({
                defaultImage : '/images/no_pic.png',
                name : 'profilePic',
                width : 35,
                height : 35,
                //top : 11,
                borderRadius : 17,
                left : 10,
                id : "img-" + array[i].attributes.id,
                image : image
            });

            detailsImg.addEventListener('error', imageErrorHandler);

            row.add(detailsImg);

            row.add(Ti.UI.createLabel({
                text : array[i].attributes.name,
                textAlign : "center",
                left : 60,
                font : Alloy.Globals.getFontCustom(16, 'Regular'),
                color : '#FFF'
            }));
        }

        if (type === '1') {
            row.add(Ti.UI.createLabel({
                text : Alloy.Globals.PHRASES.nrOfMembersTxt + ': ' + array[i].attributes.members.length,
                top : 34,
                left : 60,
                font : Alloy.Globals.getFontCustom(16, 'Regular'),
                color : '#FFF'
            }));

            row.add(Ti.UI.createView({
                top : 50,
                layout : 'vertical',
                height : 8
            }));

            var detailsImg = Ti.UI.createLabel({
                name : 'detailsBtn',
                width : 35,
                height : 35,

                left : 10,
                color : "#FFF",
                id : array[i].attributes.round,
                font : {
                    fontFamily : font,
                    fontSize : 22
                },
                text : fontawesome.icon('fa-users'),
            });

            row.add(detailsImg);

            row.className = 'one_image_per_row';
        }
        var iconLabel = Ti.UI.createLabel({
            right : 10,
            font : {
                fontFamily : font,
                fontSize : 32
            },
            id : 'icon',
            parent : row,
            text : fontawesome.icon('fa-plus'),
            color : '#FFF',

        });

        row.add(iconLabel);
        row.addEventListener("click", function(e) {
            // This will show group members
            //Is this a parent cell?
            if (type === '1') {
                if (e.row.isparent) {
                    //get all rows and clear the checked icon from them when a row is clicked.
                    var rows = table.data[0].rows;

                    for (var r in rows) {
                        if (rows[r] !== e.row && rows[r].opened) {
                            // another open row

                            for (var k in rows[r].children) {
                                if (rows[r].children[k].id === 'icon-checked' && rows[r].children[k].parent === rows[r]) {
                                    rows[r].remove(rows[r].children[k]);
                                    rows[r].children[k] = null;
                                }
                            }

                            var labelIcon = Ti.UI.createLabel({
                                right : 10,
                                font : {
                                    fontFamily : font,
                                    fontSize : 32
                                },
                                id : 'icon',
                                parent : row,
                                text : fontawesome.icon('fa-plus'),
                                color : '#FFF',
                            });

                            rows[r].add(labelIcon);
                            var index = table.data[0].rows.indexOf(rows[r]);
                            table.deleteRow(index + 1);
                            rows[r].opened = false;
                            rows[r].clicked = false;
                        }
                    }

                    //Is it opened?
                    if (e.row.opened) {
                        for (var k in e.row.children) {
                            if ( typeof e.row.children[k] !== 'undefined') {
                                if (e.row.children[k].id === 'icon-checked' && e.row.children[k].parent === e.row) {
                                    e.row.remove(e.row.children[k]);
                                    e.row.children[k] = null;
                                }
                            }
                        }
                        table.deleteRow(e.index + 1);

                        e.row.opened = false;
                    } else {
                        //Add the children.
                        var currentIndex = table.data[0].rows.indexOf(e.row);
                        table.insertRowAfter(currentIndex, e.row.sub);

                        e.row.opened = true;
                    }
                }
                selectedGroupIds[0] = e.row.id;
            }
            if (type === '2') {

                var friend = {
                    name : e.row.name,
                    id : e.row.id
                };

                var index = -1;
                var clicked = false;
                // remove friend if already in list
                for (var i in friendsChallenge) {
                    if (friendsChallenge[i].id == e.row.id) {
                        // friend already in list, store index to remove
                        clicked = true;
                        index = i;
                        break;
                    }
                }

                if (index != -1) {

                    friendsChallenge.splice(index, 1);
                } else {

                    friendsChallenge.push(friend);
                }
            }

            // since we are not selecting several groups right now

            if (e.row.clicked) {
                // un select and close row
                e.row.clicked = false;
                for (var k in e.row.children) {
                    if ( typeof e.row.children[k] !== 'undefined') {
                        if (e.row.children[k].id === 'icon-checked' && e.row.children[k].parent === e.row) {
                            e.row.remove(e.row.children[k]);
                            e.row.children[k] = null;
                        }
                    }
                }

                var labelIcon = Ti.UI.createLabel({
                    right : 10,
                    font : {
                        fontFamily : font,
                        fontSize : 32
                    },
                    id : 'icon',
                    parent : row,
                    text : fontawesome.icon('fa-plus'),
                    color : '#FFF',
                });

                e.row.add(labelIcon);

            } else {
                // select row
                e.row.clicked = true;
                for (var k in e.row.children) {
                    if ( typeof e.row.children[k] !== 'undefined') {
                        if (e.row.children[k].id === 'icon' && e.row.children[k].parent === e.row) {
                            e.row.children[k] = null;
                            e.row.remove(e.row.children[k]);
                        }
                    }
                }

                var labelIcon = Ti.UI.createLabel({
                    right : 10,
                    font : {
                        fontFamily : font,
                        fontSize : 32
                    },
                    id : 'icon-checked',
                    parent : row,
                    text : fontawesome.icon('fa-check'),
                    color : Alloy.Globals.themeColor(),
                });

                e.row.add(labelIcon);
            }
        });

        data.push(row);
    }

    table.setData(data);

    tableWrapper.removeAllChildren();
    tableWrapper.add(table);
    createSubmitButtons(type);
}

function endRefresher() {
    if (!isAndroid) {
        if ( typeof refresher !== 'undefined' && refresher !== null) {
            refresher.endRefreshing();
        }
    } else {
        if ( typeof swipeRefresh !== 'undefined' && swipeRefresh !== null) {
            swipeRefresh.setRefreshing(false);
        }
    }
}

var imageErrorHandler = function(e) {
    e.image = '/images/no_pic.png';
};

var args = arguments[0] || {};
//var params = args.param || null;
var groupObjects = [];
var friendObjects = [];
var selectedGroupIds = [];
var friendsChallenge = [];
var submitButton;
var isSubmitting = false;
var marginView;
var table;
var isAndroid = false;
var friendsButton;
var refresher = null;
var swipeRefresh = null;
var notFirstRun = false;

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

$.groupSelectWindow.addEventListener('close', function() {
    indicator.closeIndicator();
});

var fontawesome = require('lib/IconicFont').IconicFont({
    font : 'lib/FontAwesome'
});

var font = 'FontAwesome';

if (OS_ANDROID) {
    isAndroid = true;
    font = 'fontawesome-webfont';

    $.groupSelectWindow.orientationModes = [Titanium.UI.PORTRAIT];

    $.groupSelectWindow.addEventListener('open', function() {
        Alloy.Globals.setAndroidCouponMenu($.groupSelectWindow.activity);

        $.groupSelectWindow.activity.actionBar.onHomeIconItemSelected = function() {
            $.groupSelectWindow.close();
            $.groupSelectWindow = null;
        };
        $.groupSelectWindow.activity.actionBar.displayHomeAsUp = true;
        $.groupSelectWindow.activity.title = Alloy.Globals.PHRASES.chooseConfirmBtnTxt;
    });
}

var iOSVersion;

if (!isAndroid) {
    iOSVersion = parseInt(Ti.Platform.version);

    $.groupSelectWindow.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.chooseConfirmBtnTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });
}

var topView = Ti.UI.createView({
    height : 70,
    width : Ti.UI.FILL,
    layout : 'horizontal',
});

var botView = Ti.UI.createView({
    height : 80,
    width : Ti.UI.FILL,
    layout : 'absolute',
});

var tab_groups = Ti.UI.createView({
    height : 70,
    width : (Alloy.Globals.deviceWidth/2),
    backgroundColor : Alloy.Globals.themeColor(),
});

tab_groups.add(Ti.UI.createLabel({
    text : Alloy.Globals.PHRASES.GroupsTxt,
    textAlign : "center",
    color : "#FFF",
    font : Alloy.Globals.getFontCustom(16, "Bold"),
}));

var tab_friends = Ti.UI.createView({
    height : 70,
    width : (Alloy.Globals.deviceWidth/2),
    backgroundColor : "#242424",
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
            color : "#2E2E2E",
            offset : 0.0
        }, {
            color : "#151515",
            offset : 1.0
        }]
    }

});

tab_friends.add(Ti.UI.createLabel({
    text : Alloy.Globals.PHRASES.FriendsTxt,
    textAlign : "center",
    color : "#c5c5c5",
    font : Alloy.Globals.getFontCustom(16, "Bold"),
}));

topView.add(tab_groups);
topView.add(tab_friends);

$.groupSelect.add(topView);

tab_groups.addEventListener("click", function(e) {
    tab_groups.backgroundGradient = {
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
            color : Alloy.Globals.themeColor(),
            offset : 0.0
        }, {
            color : Alloy.Globals.themeColor(),
            offset : 1.0
        }]
    };

    tab_friends.setBackgroundColor('#242424');
    tab_friends.backgroundGradient = {
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
            color : "#2E2E2E",
            offset : 0.0
        }, {
            color : "#151515",
            offset : 1.0
        }]
    };

    getGroups();
});

tab_friends.addEventListener("click", function(e) {
    tab_groups.setBackgroundColor('#242424');
    tab_groups.backgroundGradient = {
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
            color : "#2E2E2E",
            offset : 0.0
        }, {
            color : "#151515",
            offset : 1.0
        }]
    };

    tab_friends.backgroundGradient = {
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
            color : Alloy.Globals.themeColor(),
            offset : 0.0
        }, {
            color : Alloy.Globals.themeColor(),
            offset : 1.0
        }]
    };
    getFriends();
});

if (!isAndroid) {
    $.groupSelect.add(tableWrapper);
} else {
    var swipeRefreshModule = require('com.rkam.swiperefreshlayout');

    swipeRefresh = swipeRefreshModule.createSwipeRefresh({
        view : tableWrapper,
        height : '65%',
        width : Ti.UI.FILL,
        id : 'swiper'
    });

    swipeRefresh.addEventListener('refreshing', function(e) {
        if (Alloy.Globals.checkConnection()) {
            setTimeout(function() {
                indicator.openIndicator();
                if (globalType === '1') {
                    getGroups();
                } else if (globalType === '2') {
                    getFriends();
                }
            }, 800);
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
            swipeRefresh.setRefreshing(false);
        }
    });
    $.groupSelect.add(swipeRefresh);
}

$.groupSelect.add(botView);

// check connection
if (Alloy.Globals.checkConnection()) {
    getGroups();
    notFirstRun = true;
} else {
    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
}