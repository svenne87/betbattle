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

var tableWrapper = Ti.UI.createView({
    height : "65%",
    width : Ti.UI.FILL,

});

function createMemberRow(member, subRow) {
    //profilepicture
   var userWrapper = Ti.UI.createView({
   		height:40,
   		width: Ti.UI.FILL,
   });
    
    var image = '/images/no_pic.png';
    Ti.API.info("MEMBERS : " + JSON.stringify(member));
    if (member.fbid != null) {
        image = "https://graph.facebook.com/" + member.fbid + "/picture?type=large";
    } else {
        // get betkampen image
        image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + member.id + '.png';
    }

    //Ti.API.info("IMAGE : " + typeof image);
    var profilePic = Ti.UI.createImageView({
        image : image,
        height : 20,
        width : 20,
        left : 10,
        borderRadius: 10,
    });

    profilePic.addEventListener("error", function(e) {
        Ti.API.info("fel på bild");
        e.source.image = '/images/no_pic.png';
    });
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
		backgroundColor:"#6d6d6d",
		height: 0.5,
		width:Ti.UI.FILL
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
        if (OS_IOS) {
            if ( typeof refresher !== 'undefined') {
                refresher.endRefreshing();
            }
        }
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
        if (OS_IOS) {
            if ( typeof refresher !== 'undefined') {
                refresher.endRefreshing();
            }
        }
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
                    createViews(friendObjects, 2);
                } else {
                    Ti.API.info("Inga Vänner");
                }

            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            }
            indicator.closeIndicator();
        } else {
            indicator.closeIndicator();
            if (OS_IOS) {
                if ( typeof refresher !== 'undefined') {
                    refresher.endRefreshing();
                }
            }
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("Error =>" + this.response);
        }
    };

}

function getGroups() {
    selectedGroupIds = [];
    friendsChallenge = [];

    if (OS_IOS || notFirstRun) {
        indicator.openIndicator();
    }

    // Get groups with members
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onerror = function(e) {
        indicator.closeIndicator();
        if (OS_IOS) {
            if ( typeof refresher !== 'undefined') {
                refresher.endRefreshing();
            }
        }
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
        if (OS_IOS) {
            if ( typeof refresher !== 'undefined') {
                refresher.endRefreshing();
            }
        }
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
                    createViews(groupObjects, 1);
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
                    getFriends();
                }

            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            }
            indicator.closeIndicator();
        } else {
            indicator.closeIndicator();
            if (OS_IOS) {
                if ( typeof refresher !== 'undefined') {
                    refresher.endRefreshing();
                }
            }
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("Error =>" + this.response);
        }
    };
}

function challengeGroup(array) {
    if (Alloy.Globals.checkConnection()) {
        // show indicator and disable button
        indicator.openIndicator();
        submitButton.touchEnabled = false;

        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            indicator.closeIndicator();
            submitButton.touchEnabled = true;
			Ti.API.info("ERROR RESPONSE : " + JSON.stringify(this.responseText));
			Ti.API.error('Bad Sever =>' + e.error);
            if (JSON.parse(this.responseText).indexOf('coins') != -1) {
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
                Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
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

            Ti.API.log("Params : " + param);

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
                    Ti.API.info("RESPONSE NO PARSE : " + JSON.stringify(this.responseText));
                    var response = JSON.parse(this.responseText);
                    Ti.API.info("RESPONSE : " + JSON.stringify(response));

                    response = response.replace(/(<br \/>)+/g, "\n");
                    // show dialog and if ok close window

                    Alloy.Globals.showToast(response);
                    var argu = {
                        refresh : 1,
                        sent_challenge : 1,
                    };
                    var loginSuccessWindow = Alloy.createController('main', argu).getView();
                    if (OS_IOS) {
                        loginSuccessWindow.open({
                            fullScreen : true,
                            transition : Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT
                        });
                    } else if (OS_ANDROID) {
                        loginSuccessWindow.open({
                            fullScreen : true,
                            navBarHidden : false,
                            orientationModes : [Titanium.UI.PORTRAIT]
                        });
                    }

                    loginSuccessWindow = null;
                    for (var win in Alloy.Globals.WINDOWS) {
                        if (win !== null) {
                            Alloy.Globals.WINDOWS[win].close();
                        }
                    }

                } else {
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                    submitButton.touchEnabled = true;
                }
            } else {
                Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
                indicator.closeIndicator();
                submitButton.touchEnabled = true;
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
        submitButton.touchEnabled = false;

        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            indicator.closeIndicator();
            submitButton.touchEnabled = true;
            Ti.API.info("ERROR PARSE : " + JSON.stringify(this.responseText));
            if (JSON.parse(this.responseText).indexOf('coins') != -1) {
                // not enough coins
                // show dialog with "link" to the store
                var alertWindow = Titanium.UI.createAlertDialog({
                    title : Alloy.Globals.PHRASES.betbattleTxt,
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
                    Ti.API.log("RESPONSE FRIENDS : " + JSON.stringify(this.responseText));
                    var response = JSON.parse(this.responseText);

                    response = response.replace(/(<br \/>)+/g, "\n");
                    // show dialog and if ok close window

                    Alloy.Globals.showToast(response);
                    var argu = {
                        refresh : 1,
                        sent_challenge : 1
                    };
                    var loginSuccessWindow = Alloy.createController('main', argu).getView();
                    if (OS_IOS) {
                        loginSuccessWindow.open({
                            fullScreen : true,
                            transition : Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT
                        });
                    } else if (OS_ANDROID) {
                        loginSuccessWindow.open({
                            fullScreen : true,
                            navBarHidden : false,
                            orientationModes : [Titanium.UI.PORTRAIT]
                        });
                    }
                    loginSuccessWindow = null;

                    for (win in Alloy.Globals.WINDOWS) {
                        if (win !== 0) {
                            Alloy.Globals.WINDOWS[win].close();
                        }
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

function createSubmitButtons(type) {
    submitButton = null;
    var buttonHeight = 40;
    var viewHeight = '20%';

    botView.removeAllChildren();
    Ti.API.log(Titanium.Platform.displayCaps.platformHeight);
    if (OS_ANDROID) {
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

    if (iOSVersion < 7) {
        submitButton = Alloy.Globals.createButtonView(Alloy.Globals.themeColor(), "#FFF", Alloy.Globals.PHRASES.challengeBtnTxt);
		submitButton.id = "submitButton";
    } else {
       submitButton = Alloy.Globals.createButtonView(Alloy.Globals.themeColor(), "#FFF", Alloy.Globals.PHRASES.challengeBtnTxt);
	   submitButton.id = "submitButton";
    }

    submitButton.addEventListener('click', function() {
        if (type == 1) {
            if (selectedGroupIds.length === 1) {
                // call function to send to server
                Ti.API.info("challenge : Group");
                challengeGroup(selectedGroupIds);
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.groupChallengeErrorTxt);
            }
        }

        if (type == 2) {
            if (friendsChallenge.length > 0) {
                Ti.API.info("challenge : Friends");
                challengeFriends();
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.friendChallengeErrorTxt);
            }

        }

    });

    //submitButtonsView.add();
    botView.add(submitButton);
}

function createViews(array, type) {
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

    if (OS_IOS) {
        refresher = Ti.UI.createRefreshControl({
            tintColor : Alloy.Globals.themeColor()
        });

        // will refresh on pull
        refresher.addEventListener('refreshstart', function(e) {
            if (Alloy.Globals.checkConnection()) {
                if (type == 1) {
                    getGroups();
                } else if (type == 2) {
                    getFriends();
                }

            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
                refresher.endRefreshing();
            }
        });
    }

    // Table
    if (OS_IOS) {
        table = Ti.UI.createTableView({
            height : '100%',
            id : 'groupsTable',
            refreshControl : refresher,
            backgroundColor : 'transparent'
        });

        table.separatorInsets = {
            left : 0,
            right : 0
        };
    } else {
        table = Ti.UI.createTableView({
            height : '100%',
            id : 'groupsTable',
            refreshControl : refresher,
            backgroundColor : 'transparent'
        });

    }

    table.footerView = Ti.UI.createView({
        height : 0.5,
        backgroundColor : '#6d6d6d'
    });

    var data = [];

    var hasChild;

    if (OS_IOS) {
        hasChild = false;
    } else if (OS_ANDROID) {
        hasChild = false;
    }

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
                backgroundColor : '#6d6d6d'
            });

           
			  Ti.API.info("SUB ROWEN INNAN" + JSON.stringify(subRow));
            	//Ti.API.info("MEMBER CREATE ROW LENGTH: " + array[i].attributes.members.length);
            for (var x = 0; x < array[i].attributes.members.length; x++) {
            	//Ti.API.info("MEMBER CREATE ROW : " + JSON.stringify(array[i].attributes.members));
             	createMemberRow(array[i].attributes.members[x], subRow);
               //Ti.API.info("MEMBER ROWEN " + JSON.stringify(memberRow));
               
               count++;
            }

           
			
            // array with views for the sub in table row
           
            Ti.API.info("SUB ROWEN " + JSON.stringify(subRow));
            

            var hasChild;

            if (OS_IOS) {
                hasChild = false;
            } else if (OS_ANDROID) {
                hasChild = false;
            }

            var row = $.UI.create('TableViewRow', {
                classes : ['challengesSectionDefault'],
                id : array[i].attributes.id,
                hasChild : false,
                isparent : true,
                opened : false,
                parent: table,
                height: 70,
                memberCount: count,
                //name: array[i].attributes.name,
                sub : subRow
            });

            row.add(Ti.UI.createLabel({
                text : array[i].attributes.name,
                top : 6,
                left : 60,
                font : {
                    fontSize : Alloy.Globals.getFontSize(1),
                    fontWeight : 'normal',
                    fontFamily : Alloy.Globals.getFont()
                },
                color : '#FFF'
            }));
            
            
        } else {
            //profilepicture
            Ti.API.info("VÄNNEN : " + JSON.stringify(array[i].attributes));
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
                parent: table,
                name : array[i].attributes.name,
                height : 70,
                //sub : subRowArray,
            });

            var detailsImg = Ti.UI.createImageView({
                name : 'profilePic',
                width : 35,
                height : 35,
                //top : 11,
                borderRadius: 17,
                left : 10,
                id : "img-" + array[i].attributes.id,
                image : image
            });
            detailsImg.addEventListener('error', function(e) {
                // fallback for image
                e.source.image = '/images/no_pic.png';
            });
            row.add(detailsImg);

            row.add(Ti.UI.createLabel({
                text : array[i].attributes.name,
                textAlign : "center",
                left : 60,
                font : {
                    fontSize : Alloy.Globals.getFontSize(1),
                    fontWeight : 'normal',
                    fontFamily : Alloy.Globals.getFont()
                },
                color : '#FFF'
            }));

			
            /*row.add(Ti.UI.createLabel({
             id: 'selected',
             text:fontawesome.icon('fa-check'),
             textAlign: "center",
             right: 10,
             color: "#FFF",
             parent: row,
             font: {
             fontSize: 30,
             fontFamily: font,
             },
             height: "auto",
             width: "auto",
             }));*/

        }

        if (type == 1) {
            row.add(Ti.UI.createLabel({
                text : Alloy.Globals.PHRASES.nrOfMembersTxt + ': ' + array[i].attributes.members.length,
                top : 26,
                left : 60,
                font : {
                    fontSize : Alloy.Globals.getFontSize(1),
                    fontWeight : 'normal',
                    fontFamily : Alloy.Globals.getFont()
                },
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
                color:"#FFF",
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
		row.addEventListener("click", function(e){
			
            // This will show group members
            //Is this a parent cell?
            if (type == 1) {
                if (e.row.isparent) {
        			
        			//get all rows and clear the checked icon from them when a row is clicked.
        			var rows = table.data[0].rows;
                	for (var s in rows){
                		Ti.API.info("ROWS TO FIX : " + JSON.stringify(rows[s]));
                		var oneRow = rows[s];
                		if(oneRow != e.row){
	                		if(oneRow.opened){
	                			for(var k in oneRow.children){
	              		
				              		if(oneRow.children[k].id == 'icon-checked' && oneRow.children[k].parent == oneRow){
				              			Ti.API.info("REMOVE AGAIN");
				              			oneRow.children[k] = null;
				              			oneRow.remove(oneRow.children[k]);
				              			var rowIndex = rows.indexOf(oneRow);
				              			table.deleteRow(rowIndex+1);
				              			oneRow.opened = false;
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
						                
						                oneRow.add(labelIcon);
				              		}
			              		}
	                		}
                		}
                	}
                	
                	Ti.API.info("KOMMER IN HIT? " );
                    //Is it opened?
                    if (e.row.opened) {
                    	Ti.API.info("OPENED");
                        for(var k in e.row.children){
              		
		              		if(e.row.children[k].id == 'icon-checked' && e.row.children[k].parent == e.row){
		              			Ti.API.info("REMOVE AGAIN");
		              			e.row.children[k] = null;
		              			e.row.remove(e.row.children[k]);
		              		}
		              	}
                        table.deleteRow(e.index + 1);
                        
                        e.row.opened = false;
                    } else {
                        //Add the children.
                        Ti.API.info("INTE OPENED");
                        var currentIndex = table.data[0].rows.indexOf(e.row);
                        Ti.API.info("E ROW COUNT" + e.row.memberCount);
                        Ti.API.info("E ROW SUB : " + e.row.sub.length);
                        Ti.API.info("E ROW SUB INNEHÅLL : " + JSON.stringify(e.row.sub));
                        
                        
                        Ti.API.info("member : " + JSON.stringify(e.row.sub));
                        table.insertRowAfter(currentIndex, e.row.sub);
                        
                        
                        e.row.opened = true;
                    }
                }
                selectedGroupIds[0] = e.row.id;
            }
            if (type == 2) {

                Ti.API.info("selected: " + JSON.stringify(e));
                var friend = {
                    name : e.row.name,
                    id : e.row.id
                };
                Ti.API.info("Friend : " + JSON.stringify(friend));
                var index = -1;
                var clicked = false;
                // remove friend if already in list
                for (var i in friendsChallenge) {
                    if (friendsChallenge[i].id == e.row.id) {
                        // friend already in list, store index to remove
                        //var string = "selected_"+e.row.id;
                        //$.string.setText();

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
            buttonsPushed.push(e.row);

            for (var i = 0; i < buttonsPushed.length; i++) {
                // change color of lastpressed buttons
                if (type == 1) {
                    
                }
            }
            // since we are not selecting several groups right now
            Ti.API.info("friend array: " + JSON.stringify(friendsChallenge));
            if (clicked) {
                //e.row.children[(e.row.children.length)-1] = null;
              	for(var k in e.row.children){
              		
              		if(e.row.children[k].id == 'icon-checked' && e.row.children[k].parent == e.row){
              			Ti.API.info("REMOVE AGAIN");
              			e.row.children[k] = null;
              			e.row.remove(e.row.children[k]);
              		}
              	}
               
                Ti.API.info("ICON LABEL " + JSON.stringify(iconLabel));
                
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
            	//e.row.children[(e.row.children.length)-1] = null;
            	for(var k in e.row.children){
              		if(e.row.children[k].id == 'icon' && e.row.children[k].parent == e.row){
              			Ti.API.info("REMOVE");
              			e.row.children[k] = null;
              			e.row.remove(e.row.children[k]);
              		}
              	}
            	Ti.API.info("ICON LABEL FÖRSTA " + JSON.stringify(iconLabel));
            	
                
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
                Ti.API.info("ICON LABEL EFTER CLICK " + JSON.stringify(iconLabel));
               // e.row.setBackgroundColor(Alloy.Globals.themeColor());
                
            }
		});
		
        data.push(row);
    }

    table.setData(data);

   

    tableWrapper.removeAllChildren();
    tableWrapper.add(table);
    createSubmitButtons(type);
}

var args = arguments[0] || {};
//var params = args.param || null;
var groupObjects = [];
var friendObjects = [];
var selectedGroupIds = [];
var friendsChallenge = [];
var submitButton;
var marginView;
var buttonsPushed = [];
var table;
var friendsButton;
var refresher;
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

if (OS_IOS) {
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
    width : "50%",
    backgroundColor : Alloy.Globals.themeColor(),
});

tab_groups.add(Ti.UI.createLabel({
    text : Alloy.Globals.PHRASES.GroupsTxt,
    textAlign : "center",
    color : "#FFFFFF",
    font : Alloy.Globals.getFontCustom(16, "Bold"),
}));

var tab_friends = Ti.UI.createView({
    height : 70,
    width : "50%",
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
    tab_groups.setBackgroundColor(Alloy.Globals.themeColor());
   	tab_groups.backgroundGradient = {};
   
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
    tab_friends.setBackgroundColor(Alloy.Globals.themeColor());
    tab_friends.backgroundGradient = {};
    getFriends();
});

$.groupSelect.add(tableWrapper);
$.groupSelect.add(botView);
// check connection
if (Alloy.Globals.checkConnection()) {
    getGroups();
    notFirstRun = true;
} else {
    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
}