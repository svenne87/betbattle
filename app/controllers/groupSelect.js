/* Function */
var args = arguments[0] || {};
var coins = -1;
var challengeCode = "";
var hasInvited = false;

if ( typeof args.coins !== 'undefined' && typeof args.challengeCode !== 'undefined') {
    coins = args.coins;
    challengeCode = args.challengeCode;
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

function createSingleInviteRow(inviteType) {
	var inviteIcon = '';
	var inviteText = '';
	
	if(inviteType === 'sms') {
		inviteIcon = fontawesome.icon('fa-mobile');
		inviteText = Alloy.Globals.PHRASES.sendSMSTxt + " ";
	} else if (inviteType === 'email') {
		inviteIcon = fontawesome.icon('fa-file-text-o');
		inviteText = Alloy.Globals.PHRASES.sendMailTxt;
	} else if (inviteType === 'facebook') {
		inviteIcon = fontawesome.icon('fa-facebook');
		inviteText = Alloy.Globals.PHRASES.shareFBTxt;
	} else if (inviteType === 'twitter') {
		 inviteIcon = fontawesome.icon('fa-twitter');
		 inviteText = Alloy.Globals.PHRASES.shareTwitterTxt;
	} else if (inviteType === 'google-plus') {
		inviteIcon = fontawesome.icon('fa-google-plus');
		inviteText = Alloy.Globals.PHRASES.shareGoogleTxt;
	}
	
	var rowHolderView = Ti.UI.createView({
		height: 70,
		width: Ti.UI.FILL,
		type : 'invite',
		inviteType : inviteType
	});
	
	var iconLabel = Titanium.UI.createLabel({
    	font : {
        	fontFamily : font,
        	fontSize : 28
    	},
    	text : inviteIcon,
    	left : '5%',
    	color : '#FFF',
    	touchEnabled : false
	});
	
	rowHolderView.add(iconLabel);
	
	var inviteTextLabel = Ti.UI.createLabel({
    	text : inviteText,
        textAlign : "center",
        left : 60,
        touchEnabled: false,
        parent : rowHolderView,
        font : Alloy.Globals.getFontCustom(16, 'Regular'),
        color : '#FFF'
    });
    
    rowHolderView.add(inviteTextLabel);
    
    var iconRightLabel = Ti.UI.createLabel({
   		right : 10,
        font : {
        	fontFamily : font,
           	fontSize : 28
        },
        id : 'icon',
        touchEnabled: false,
        parent : rowHolderView,
        text : fontawesome.icon('fa-arrow-right'),
        color : '#FFF',
    });
    
    rowHolderView.add(iconRightLabel);
        
    return rowHolderView;
}

function createInviteSubRows(subRow) {
	
	var rowLine = Ti.UI.createView({
    	height: 0.5,
    	width: Ti.UI.FILL,
    	backgroundColor: '#303030'
    }); 
    
    subRow.add(createSingleInviteRow('sms'));
    subRow.add(rowLine);
    
   	var rowLine = Ti.UI.createView({
    	height: 0.5,
    	width: Ti.UI.FILL,
    	backgroundColor: '#303030'
    }); 
    
    subRow.add(createSingleInviteRow('email'));
    subRow.add(rowLine);
    
    var rowLine = Ti.UI.createView({
    	height: 0.5,
    	width: Ti.UI.FILL,
    	backgroundColor: '#303030'
    }); 
    
    subRow.add(createSingleInviteRow('facebook'));
    subRow.add(rowLine);
    
    var rowLine = Ti.UI.createView({
    	height: 0.5,
    	width: Ti.UI.FILL,
    	backgroundColor: '#303030'
    }); 
    
    subRow.add(createSingleInviteRow('twitter'));
    subRow.add(rowLine);
    
    var rowLine = Ti.UI.createView({
    	height: 0.5,
    	width: Ti.UI.FILL,
    	backgroundColor: '#303030'
    }); 
    
    subRow.add(createSingleInviteRow('google-plus'));
    subRow.add(rowLine);
}

function createMemberRow(member, subRow) {
	var rowHolderView = Ti.UI.createView({
		height: 70,
		width: Ti.UI.FILL,
		id: member.attributes.id,
		name : member.attributes.name,
		type : 'friend'
	});
	
	var image;
	   
    if (member.attributes.fbid !== null) {
    	image = "https://graph.facebook.com/" + member.attributes.fbid + "/picture?type=large";
    } else {
        // get betkampen image
        image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + member.attributes.id + '.png';
    }
      
    var detailsImg = Ti.UI.createImageView({
     	defaultImage : '/images/no_pic.png',
        name : 'profilePic',
        width : 35,
        height : 35,
        borderRadius : 17,
        left : 10,
		touchEnabled: false,
        image : image
    });
    
    detailsImg.addEventListener('error', imageErrorHandler);
    rowHolderView.add(detailsImg);

    var detailsLabel = Ti.UI.createLabel({
    	text : member.attributes.name + " ",
        textAlign : "center",
        left : 60,
        touchEnabled: false,
        font : Alloy.Globals.getFontCustom(16, 'Regular'),
        color : '#FFF'
    });
    
    rowHolderView.add(detailsLabel);
     
    var iconLabel = Ti.UI.createLabel({
   		right : 10,
        font : {
        	fontFamily : font,
           	fontSize : 28
        },
        id : 'icon',
        touchEnabled: false,
        parent : rowHolderView,
        text : fontawesome.icon('fa-plus'),
        color : '#FFF',
    });

    rowHolderView.add(iconLabel);
    
    var rowLine = Ti.UI.createView({
    	height: 0.5,
    	width: Ti.UI.FILL,
    	backgroundColor: '#303030'
    }); 
    
    subRow.add(rowHolderView);
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
            if (isAndroid) {
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

            var errorTxt = "";
            try {
                errorTxt = JSON.parse(this.responseText);
            } catch(e) {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            }

            if (errorTxt.indexOf(Alloy.Globals.PHRASES.coinsInfoTxt.toLowerCase()) != -1) {
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
                try {
                    errorText = JSON.parse(this.responseText);
                    Alloy.Globals.showFeedbackDialog(errorText);
                } catch(e) {
                    //
                }

                if (errorText === "") {
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
			
			if(friendsChallenge.length > 0) {
            	for (var i = 0; i < friendsChallenge.length; i++) {
                	param += '"' + friendsChallenge[i].id + '":"' + friendsChallenge[i].name;

                	if (i == (friendsChallenge.length - 1)) {
                    	// last one
                    	param += '"';
                	} else {
                    	param += '", ';
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
        
        if (friendsChallenge.length > 0 || hasInvited) {
       		challengeFriends();
       	} else {
           	Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.friendChallengeErrorTxt);
        }
    });

    botView.add(submitButton);
}

function inviteSms() {
	if (!isAndroid) {
    	var module = require('com.omorandi');
    	var sms = module.createSMSDialog();

        //check if the feature is available on the device at hand
        if (!sms.isSupported()) {
            //falls here when executed on iOS versions < 4.0 and in the emulator
            Alloy.Globals.showFeedbackDialog('This device does not support sending sms!');
        } else {
            sms.barColor = '#336699';
            sms.messageBody = Alloy.Globals.PHRASES.smsMsg + '.' + '\n' + Alloy.Globals.PHRASES.inviteCodeText + ": " + challengeCode + "\n" + Alloy.Globals.PHRASES.appLinkTxt;

            sms.addEventListener('complete', function(e) {
                if (e.result == smsDialog.SENT) {
                    Alloy.Globals.unlockAchievement(5);
                } else if (e.result == smsDialog.FAILED) {
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                }
            });
            sms.open({animated: true});
            hasInvited = true;
        }
	} else {		
    	var intent = Ti.Android.createIntent({
        	action : Ti.Android.ACTION_SENDTO,
        	data : 'smsto:'
   	 	});
    	intent.putExtra('sms_body', "'" + Alloy.Globals.PHRASES.smsMsg + "." + "\n" + Alloy.Globals.PHRASES.inviteCodeText + ": " + challengeCode + "\n" + Alloy.Globals.PHRASES.appLinkTxt + "'");

        try {
        	Ti.Android.currentActivity.startActivity(intent);
       	 	Alloy.Globals.unlockAchievement(5);
       	 	hasInvited = true;
    	} catch (ActivityNotFoundException) {
        	Ti.UI.createNotification({
            	message : "Error"
       	 	}).show();
    	}    
	}
}

function inviteEmail() {
	var emailDialog = Titanium.UI.createEmailDialog();
	emailDialog.subject = Alloy.Globals.PHRASES.mailSubject;
	emailDialog.setToRecipients(['', '', '', '', '']);
	emailDialog.messageBody = Alloy.Globals.PHRASES.mailMsg + "." + '\n' + Alloy.Globals.PHRASES.inviteCodeText + ": " + challengeCode + "\n" + Alloy.Globals.PHRASES.appLinkTxt;
    emailDialog.open();
    
    emailDialog.addEventListener('complete', function(e) {
    	if(e.success) {
    		hasInvited = true;
    		Alloy.Globals.unlockAchievement(5);
    	}
    	
    	Ti.API.log(e);
    });
}

function inviteFacebook() {	
	var fb;

	if (Alloy.Globals.FACEBOOKOBJECT != null) {
    	if (isAndroid) {
        	$.showCoupon.fbProxy = Alloy.Globals.FACEBOOK.createActivityWorker({lifecycleContainer : $.showCoupon});
        	fb = Alloy.Globals.FACEBOOK;
    	} else {
        	fb = Alloy.Globals.FACEBOOK;
    	}
	} else {
    	if (isAndroid) {
        	var fbModule = require('facebook');
        	$.showCoupon.fbProxy = fbModule.createActivityWorker({lifecycleContainer : $.showCoupon});
        	fb = fbModule;
    	} else {
        	fb = require("facebook");
    	}
	}

    fb.addEventListener('shareCompleted', function (e) {
        if (e.success) {
        	Alloy.Globals.unlockAchievement(5);
            hasInvited = true;
        }
    });

    if(fb.getCanPresentShareDialog()) {
        fb.presentShareDialog({
            link: Alloy.Globals.PHRASES.appLinkTxt,
            name: Alloy.Globals.PHRASES.fbPostCaptionTxt,
            description: Alloy.Globals.PHRASES.fbPostDescriptionTxt + "." + "\n" + Alloy.Globals.PHRASES.inviteCodeText + ": " + challengeCode,
            caption: Alloy.Globals.PHRASES.fbPostCaptionTxt,
            picture: 'http://31.216.36.213/betbattle/admin/images/logo_betkampen-150x150.png'   
        });
    } else {
        fb.presentWebShareDialog({
            link: Alloy.Globals.PHRASES.appLinkTxt,
            name: Alloy.Globals.PHRASES.fbPostCaptionTxt,
            description: Alloy.Globals.PHRASES.fbPostDescriptionTxt + "." + "\n" + Alloy.Globals.PHRASES.inviteCodeText + ": " + challengeCode,
            caption: Alloy.Globals.PHRASES.fbPostCaptionTxt,
            picture: 'http://31.216.36.213/betbattle/admin/images/logo_betkampen-150x150.png'
        });
    }
}

function shareGoogle() {
	hasInvited = true;
	// Alloy.Globals.PHRASES.inviteCodeText
// challengeCode

// TOOD hur blir det med koden man skickar med??

/*
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
*/

}


function shareTwitter() {
	if (!isAndroid) {
    	if (Titanium.Platform.canOpenURL('twitter://')) {
            Alloy.Globals.unlockAchievement(5);
            hasInvited = true;
            Titanium.Platform.openURL('twitter://post?message=' + Alloy.Globals.PHRASES.twitterMsg + "." + "\n" + Alloy.Globals.PHRASES.inviteCodeText + ": " + challengeCode + "\n" + Alloy.Globals.PHRASES.appLinkTxt);
    	}
	} else {
        try {
            var intTwitter = Ti.Android.createIntent({
                action : Ti.Android.ACTION_SEND,
                packageName : 'com.twitter.android',
                flags : Ti.Android.FLAG_ACTIVITY_NEW_TASK,
                type : 'text/plain'
            });
            
            intTwitter.putExtra(Ti.Android.EXTRA_TEXT, Alloy.Globals.PHRASES.twitterMsg + "." + "\n" + Alloy.Globals.PHRASES.inviteCodeText + ": " + challengeCode + "\n" + Alloy.Globals.PHRASES.appLinkTxt);
            Alloy.Globals.unlockAchievement(5);
            Ti.Android.currentActivity.startActivity(intTwitter);
            hasInvited = true;
        } catch(x) {
            alert(Alloy.Globals.PHRASES.notInstalledTxt + ' ' + 'Twitter');
        }
  	} 
}

function addRowEventListener(row, type) {
	row.addEventListener("click", function(e) {
   		// This will sub rows  
       	if (e.row.isparent) {
       		var iconText = fontawesome.icon('fa-chevron-down');
       		
            //Is it opened?
            if (e.row.opened) {
                table.deleteRow(e.index + 1);
                e.row.opened = false;
            } else {
                //Add the children.
                var currentIndex = table.data[0].rows.indexOf(e.row);
                table.insertRowAfter(currentIndex, e.row.sub);
				iconText = fontawesome.icon('fa-chevron-up');
                e.row.opened = true;
            }
            
            for (var k in row.children) {
            	if (row.children[k].id === 'icon' && row.children[k].parent === row) {
                    row.children[k].text = iconText;
                    break;
                }
            }
        } else {
        	// sub row was clicked.
        	if(e.source.type !== 'friend') {

        		// Kolla igenom och testa så att alla olika dela funkar...
        		// TODO
        		
        		if(e.source.inviteType === 'sms') {
        			// sms invite
        			inviteSms();
        		} else if(e.source.inviteType === 'email') {
        			// email invite
        			inviteEmail();
        		} else if(e.source.inviteType === 'facebook') {
        			// facebook invite
        			inviteFacebook();
        		} else if(e.source.inviteType === 'twitter') {
        			// twitter share
        			shareTwitter();
        		} else if(e.source.inviteType === 'google-plus') {
        			// google share
        			shareGoogle();	
        		}
        	} else {
				// handle friend 
				var friend = {
					name : e.source.name,
            		id : e.source.id
        		};
		
				var iconText = fontawesome.icon('fa-check');
        		var iconColor = '#FF7D40';
        		var index = -1;
               
        		 // remove friend if already in list
        		 for (var i in friendsChallenge) {
         			if (friendsChallenge[i].id == friend.id) {
            			// friend already in list, store index to remove
            			iconText = fontawesome.icon('fa-plus');
            			iconColor = '#FFF';
                		index = i;
                		break;
            		}
         		}

         		if (index != -1) {
         			friendsChallenge.splice(index, 1);
         		} else {
					friendsChallenge.push(friend);
        	 	}
         
         		for (var k in e.source.children) {
         			if (e.source.children[k].id === 'icon') {
            			e.source.children[k].text = iconText;
            			e.source.children[k].color = iconColor;
                		break;
            		}
        		}
        	}
        }
	});
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
                if (globalType === '1') {
                    getGroups();
                } else if (globalType === '2') {
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
    
    table.headerView = Ti.UI.createView({
        height : 0.5,
        backgroundColor : '#303030'
    });
    
    table.footerView = Ti.UI.createView({
        height : 0.5,
        backgroundColor : '#303030'
    });

	// table row array
    var data = [];
   	
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

    for (var i = 0; i < array.length; i++) {
    	createMemberRow(array[i], subRow);
    }
  
    if(array.length === 0) {
    	// No friends found
   		subRow.hasChild = false,
   		subRow.height = 70;
   		
   		var emptyResultLabel = Ti.UI.createLabel({
       		text : Alloy.Globals.PHRASES.noneTxt + ' ' + Alloy.Globals.PHRASES.FriendsTxt + ' ' + Alloy.Globals.PHRASES.foundTxt + ' ',
        	left : 10,
        	height : 65,
        	textAlign: 'center',
       	 	font : Alloy.Globals.getFontCustom(16, 'Regular'),
       	 	color : '#FFF'
    	});
    	
    	subRow.add(emptyResultLabel);

    	if (iOSVersion < 7) {
        	subRow.add(Ti.UI.createView({
            	height : 0.5,
            	top : 57,
            	backgroundColor : '#303030',
            	width : '120%'
        	}));
    	}	
    }
    
    addRowEventListener(subRow);

	// create 2 expandable table rows
    var friendsRow = Ti.UI.createTableViewRow({
    	classes : ['challengesSectionDefault'],
        id : 'selectBetBattleFriends',
        hasChild : false,
        isparent : true,
        opened : false,
        parent : table,
        height : 70,
        sub : subRow
    });

    var friendsIconInviteLabel = Ti.UI.createLabel({
    	left : 10,
        font : {
        	fontFamily : font,
            fontSize : 28
        },
        text : fontawesome.icon('fa-users'),
        color : '#FFF',
    });

    friendsRow.add(friendsIconInviteLabel);

    var friendsLabel = Ti.UI.createLabel({
    	text : Alloy.Globals.PHRASES.FriendsTxt + " ",
        textAlign : 'center',
        left : 60,
        font : Alloy.Globals.getFontCustom(16, 'Bold'),
        color : '#FFF'
    });
    
    friendsRow.add(friendsLabel);
    
    var iconFriendsLabel = Ti.UI.createLabel({
    	right : 10,
        font : {
        	fontFamily : font,
            fontSize : 28
        },
        id : 'icon',
        parent : friendsRow,
        text : fontawesome.icon('fa-chevron-down'),
        color : '#FFF',
    });

    friendsRow.add(iconFriendsLabel);
    addRowEventListener(friendsRow);
	data.push(friendsRow);
	
	var secondSubRow = Ti.UI.createTableViewRow({
   		layout : 'vertical',
       	backgroundColor : 'transparent',
       	selectionStyle : 'none',
        height : 'auto'
    });

    secondSubRow.footerView = Ti.UI.createView({
        height : 0.5,
        backgroundColor : '#303030'
    });

    createInviteSubRows(secondSubRow);
	addRowEventListener(secondSubRow);
	
    var inviteRow = Ti.UI.createTableViewRow({
    	classes : ['challengesSectionDefault'],
        id : 'selectInviteType',
        hasChild : false,
        isparent : true,
        opened : false,
        parent : table,
        height : 70,
        sub : secondSubRow
    });

    var userIconInviteLabel = Ti.UI.createLabel({
    	left : 10,
        font : {
        	fontFamily : font,
            fontSize : 28
        },
        text : fontawesome.icon('fa-users'),
        color : '#FFF',
    });

    inviteRow.add(userIconInviteLabel);

    var inviteLabel = Ti.UI.createLabel({
    	text : Alloy.Globals.PHRASES.inviteFriendsTxt + " ",
        textAlign : 'center',
        left : 60,
        font : Alloy.Globals.getFontCustom(16, 'Bold'),
        color : '#FFF'
    });
    
    inviteRow.add(inviteLabel);
    
    var iconInviteLabel = Ti.UI.createLabel({
    	right : 10,
        font : {
        	fontFamily : font,
            fontSize : 28
        },
        id : 'icon',
        parent : inviteRow,
        text : fontawesome.icon('fa-chevron-down'),
        color : '#FFF',
    });

    inviteRow.add(iconInviteLabel);
    addRowEventListener(inviteRow);
	data.push(inviteRow);
    
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

var context;
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
var firstCheck = true;

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
    context = require('lib/Context');
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

function onOpen(evt) {
    if(isAndroid) {
        context.on('groupSelectActivity', this.activity);
    }
}

function onClose(evt) {
    if(isAndroid) {
        context.off('groupSelectActivity');
    }
}

var botView = Ti.UI.createView({
    height : 80,
    width : Ti.UI.FILL,
    layout : 'absolute',
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
    getFriends();
    //getGroups();
    notFirstRun = true;
} else {
    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
}