/* Function */
var args = arguments[0] || {};
var coins = -1;
var challengeCode = "";
var hasInvited = false;
var fb = args.fb;

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

var tableWrapper = Ti.UI.createView({
	height : "80%",
	width : Ti.UI.FILL
});

function getFriendsAndGroups() {
	selectedGroups = [];
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
		xhr.open('GET', Alloy.Globals.BETKAMPENGETFRIENDSANDGROUPSURL + '?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
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
				friendObjects = [];
				groupObjects = [];
				
				if(response.friends.length > 0) {
					for (var i = 0; i < response.friends.length; i++) {
						var friendObject = Alloy.createModel('friend', {
							fbid : response.friends[i].fbid,
							id : response.friends[i].id,
							name : response.friends[i].name
						});

						// add to array
						friendObjects.push(friendObject);
					}
				}
				
				if(response.groups.length > 0) {
					for (var i = 0; i < response.groups.length; i++) {
						var groupsObject = Alloy.createModel('group', {
							id : response.groups[i].id,
							name : response.groups[i].name
						});

						// add to array
						groupObjects.push(groupsObject);
					}
				}
				// create the views
				createViews(friendObjects, groupObjects);
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

/*
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

			if (friendsChallenge.length > 0) {
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

					$.groupSelectWindow.setOpacity(0);

					for (var win in Alloy.Globals.WINDOWS) {
						Alloy.Globals.WINDOWS[win].close();
					}

					$.groupSelectWindow.close();

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
*/
function challengeFriendsAndGroups() {
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
			xhr.open('POST', Alloy.Globals.BETKAMPENCHALLENGEFRIENDSANDGROUPSURL + '/?lang=' + Alloy.Globals.LOCALE);
			xhr.setRequestHeader("content-type", "application/json");
			xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
			xhr.setTimeout(Alloy.Globals.TIMEOUT);
				
			var param = "";
			param += '{"coins": ' + coins + ', "lang" :"' + Alloy.Globals.LOCALE + '", "cid":"' + Alloy.Globals.COUPON.id + '", "friends":[{';

			if (friendsChallenge.length > 0) {
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

			param += '}]';
			
			param += ', "groups": [{';

            for (var x = 0; x < selectedGroups.length; x++) {
     			param += '"' + selectedGroups[x].id + '":"' + selectedGroups[x].name;

                if (x != (selectedGroups.length - 1)) {
                	param += '", ';
                } else {
                    // last one
                    param += '"';
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

					$.groupSelectWindow.setOpacity(0);

					for (var win in Alloy.Globals.WINDOWS) {
						Alloy.Globals.WINDOWS[win].close();
					}

					$.groupSelectWindow.close();

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

/*
function challengeGroups() {
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
            xhr.open('POST', Alloy.Globals.BETKAMPENCHALLENGEGROUPURL);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
            xhr.setTimeout(Alloy.Globals.TIMEOUT);

            // add groups to params
            var param = '{"cid": ' + Alloy.Globals.COUPON.id + ', "lang" : "' + Alloy.Globals.LOCALE + '", "coins": ' + coins + ', "groups": [{';

            for (var x = 0; x < selectedGroups.length; x++) {
     			param += '"' + selectedGroups[x].id + '":"' + selectedGroups[x].name;

                if (x != (selectedGroups.length - 1)) {
                	param += '", ';
                } else {
                    // last one
                    param += '"';
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

					$.groupSelectWindow.setOpacity(0);

					for (var win in Alloy.Globals.WINDOWS) {
						Alloy.Globals.WINDOWS[win].close();
					}

					$.groupSelectWindow.close();

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
*/

function createSubmitButtons() {
	submitButton = null;
	var buttonHeight = 40;
	var viewHeight = '20%';

	botView.removeAllChildren();

	/*
	if (isAndroid) {
		if (Titanium.Platform.displayCaps.platformHeight < 600) {
			buttonHeight = 30;
			table.setHeight('80%');
			viewHeight = '20%';
		}
	}
	*/

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
	
		if (friendsChallenge.length > 0 || selectedGroups.length > 0 || hasInvited) {
			challengeFriendsAndGroups();
		} else {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.friendChallengeErrorTxt);
		}
	
	
		/*
		if(selectedGroups.length > 0) {
			challengeGroups();
		} else {
			if (friendsChallenge.length > 0 || hasInvited) {
				challengeFriends();
			} else {
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.friendChallengeErrorTxt);
			}
		}
		*/
	});

	botView.add(submitButton);
}

function inviteSms() {
	if (!isAndroid) {
		var module = require('com.omorandi');
		var sms = module.createSMSDialog();

		//check if the feature is available on the device at hand
		if (!sms.isSupported()) {
			// when executed on iOS versions < 4.0 and in the emulator
			Alloy.Globals.showFeedbackDialog('This device does not support sending sms!');
		} else {
			sms.barColor = '#336699';
			sms.messageBody = Alloy.Globals.PHRASES.smsMsg + '.' + '\n' + Alloy.Globals.PHRASES.inviteCodeText + ': ' + challengeCode + '\n' + Alloy.Globals.PHRASES.appLinkTxt;

			sms.addEventListener('complete', function(e) {
				if (e.result == sms.SENT) {
					submitButton.setVisible(true);
					tableWrapper.setHeight('80%');
					Alloy.Globals.unlockAchievement(5);
				} else if (e.result == sms.FAILED) {
					Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
				}
			});
			sms.open({
				animated : true
			});
			hasInvited = true;
		}
	} else {
		var intent = Ti.Android.createIntent({
			action : Ti.Android.ACTION_SENDTO,
			data : 'smsto:'
		});
		intent.putExtra('sms_body', Alloy.Globals.PHRASES.smsMsg + "." + "\n" + Alloy.Globals.PHRASES.inviteCodeText + ": " + challengeCode + "\n" + Alloy.Globals.PHRASES.appLinkTxt);

		try {
			hasInvited = true;
			submitButton.setVisible(true);
			tableWrapper.setHeight('80%');
		   	Ti.Android.currentActivity.startActivity(intent);
		   	Alloy.Globals.unlockAchievement(5);
		} catch (ActivityNotFoundException) {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
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
		if (e.success) {
			hasInvited = true;
			submitButton.setVisible(true);
			tableWrapper.setHeight('80%');
			Alloy.Globals.unlockAchievement(5);
		}
	});
}

function inviteFacebook() {
	fb.addEventListener('shareCompleted', function(e) {
		if (e.success) {
			Alloy.Globals.unlockAchievement(5);
			hasInvited = true;
			submitButton.setVisible(true);
			tableWrapper.setHeight('80%');
		}
	});
	
	if (fb.getCanPresentShareDialog()) {
		fb.presentShareDialog({
			link : Alloy.Globals.PHRASES.appLinkTxt,
			name : Alloy.Globals.PHRASES.fbPostCaptionTxt,
			caption : Alloy.Globals.PHRASES.fbPostCaptionTxt,
			description : Alloy.Globals.PHRASES.inviteCodeText + ": " + challengeCode, // Alloy.Globals.PHRASES.fbPostDescriptionTxt + "." + "\n" +
			picture : 'http://31.216.36.213/betbattle/admin/images/logo_betkampen-150x150.png'
		});
	} else {
		fb.presentWebShareDialog({
			link : Alloy.Globals.PHRASES.appLinkTxt,
			name : Alloy.Globals.PHRASES.fbPostCaptionTxt,
			caption : Alloy.Globals.PHRASES.fbPostCaptionTxt,
			description : Alloy.Globals.PHRASES.inviteCodeText + ": " + challengeCode, // Alloy.Globals.PHRASES.fbPostDescriptionTxt + "." + "\n" +
			picture : 'http://31.216.36.213/betbattle/admin/images/logo_betkampen-150x150.png'
		});
	}
}

function addRowEventListener(row, type) {
	row.addEventListener("click", function(e) {
		if (e.source.inviteType !== 'friend' && e.source.inviteType !== 'group') {
			if (e.source.inviteType === 'sms') {
				// sms invite
				inviteSms();
			} else if (e.source.inviteType === 'email') {
				// email invite
				inviteEmail();
			} else if (e.source.inviteType === 'facebook') {
				// facebook invite
				inviteFacebook();
			}
		 } else if (e.source.inviteType === 'friend') {
			// handle friend
			var friend = {
				name : e.source.name,
				id : e.source.id
			};

			var iconText = fontawesome.icon('fa-check');
			var iconColor = '#FF7D40';
			var index = -1;
			
			// clear all selected groups and store friend rows clicked
			// selectedGroups = [];
			selectedFriendRows.push(e.source);
			
			/*
			for(var x in selectedGroupRows) {
				for(var z in selectedGroupRows[x].children) {
					if(selectedGroupRows[x].children[z].id === 'icon') {
						selectedGroupRows[x].children[z].text = fontawesome.icon('fa-plus');
						selectedGroupRows[x].children[z].color = '#FFF';
						break;
					}
				}
			}
			*/
			
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
			
			if(friendsChallenge.length > 0 || hasInvited === true) {
				submitButton.setVisible(true);
				tableWrapper.setHeight('80%');
			} else {
				submitButton.setVisible(false);
				tableWrapper.setHeight('100%');
			}	
		} else if (e.source.inviteType === 'group') {
			// handle group
			var group = {
				name : e.source.name,
				id : e.source.id
			};
			
			var iconText = fontawesome.icon('fa-check');
			var iconColor = '#FF7D40';
			var index = -1;
			
			selectedGroupRows.push(e.source);

			// remove group if already in list
			for (var i in selectedGroups) {
				if (selectedGroups[i].id == group.id) {
					// group already in list, store index to remove
					iconText = fontawesome.icon('fa-plus');
					iconColor = '#FFF';
					index = i;
					break;
				}
			}

			if (index != -1) {
				selectedGroups.splice(index, 1);
			} else {
				selectedGroups.push(group);
			}

			for (var k in e.source.children) {
				if (e.source.children[k].id === 'icon') {
					e.source.children[k].text = iconText;
					e.source.children[k].color = iconColor;
					break;
				}
			}

			if(selectedGroups.length > 0 || hasInvited === true) {
				submitButton.setVisible(true);
				tableWrapper.setHeight('80%');
			} else {
				submitButton.setVisible(false);
				tableWrapper.setHeight('100%');
			}	
		}
	});
}


function createMemberRow(member) {
	var memberRow = Ti.UI.createTableViewRow({
		height : 75,
		id : member.attributes.id,
		name : member.attributes.name,		
		inviteType : 'friend',
		width : Ti.UI.FILL,
		color : "#FFF",
		backgroundColor : 'transparent',
		font : Alloy.Globals.getFont(),
		hasChild : false,
		selectionStyle : 'none'
	});
	
	var image;
	   
    if (member.attributes.fbid !== null) {
    	image = "https://graph.facebook.com/" + member.attributes.fbid + "/picture?type=large";
    } else {
        // get betkampen image
        image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + member.attributes.id + '.png';
    }
      
    var detailsImg = Ti.UI.createImageView({
     	//defaultImage : '/images/no_pic.png',
        name : 'profilePic',
        width : 35,
        height : 35,
        borderRadius : 17,
        left : 10,
		touchEnabled: false,
        image : image
    });
    
    if(!isAndroid) {
    	detailsImg.setDefaultImage('/images/no_pic.png');
    }
    
    detailsImg.addEventListener('error', imageErrorHandler);
    memberRow.add(detailsImg);

    var detailsLabel = Ti.UI.createLabel({
    	text : member.attributes.name + " ",
        textAlign : "center",
        left : 60,
        touchEnabled: false,
        font : Alloy.Globals.getFontCustom(16, 'Regular'),
        color : '#FFF'
    });
    
    memberRow.add(detailsLabel);
     
    var iconLabel = Ti.UI.createLabel({
   		right : 10,
        font : {
        	fontFamily : font,
           	fontSize : 20
        },
        id : 'icon',
        touchEnabled: false,
        text : fontawesome.icon('fa-plus'),
        color : '#FFF',
    });

    memberRow.add(iconLabel);
    addRowEventListener(memberRow, 'friend');
    
    return memberRow;
}

function createGroupRow(group) {
	var groupRow = Ti.UI.createTableViewRow({
		height : 75,
		id : group.attributes.id,
		name : group.attributes.name,		
		inviteType : 'group',
		width : Ti.UI.FILL,
		color : "#FFF",
		backgroundColor : 'transparent',
		font : Alloy.Globals.getFont(),
		hasChild : false,
		selectionStyle : 'none'
	});
	
	var mgIconLabel = Titanium.UI.createLabel({
    	font : {
        	fontFamily : font,
        	fontSize : 22
    	},
    	text : fontawesome.icon('fa-users'),
    	left : 20,
    	touchEnabled: false,
    	color : '#FFF',
	});
	
	groupRow.add(mgIconLabel);

    var detailsLabel = Ti.UI.createLabel({
    	text : group.attributes.name + " ",
        textAlign : "center",
        left : 60,
        touchEnabled: false,
        font : Alloy.Globals.getFontCustom(16, 'Regular'),
        color : '#FFF'
    });
    
    groupRow.add(detailsLabel);
     
    var iconLabel = Ti.UI.createLabel({
   		right : 10,
        font : {
        	fontFamily : font,
           	fontSize : 20
        },
        id : 'icon',
        touchEnabled: false,
        text : fontawesome.icon('fa-plus'),
        color : '#FFF',
    });

    groupRow.add(iconLabel);
    addRowEventListener(groupRow, 'group');
    
    return groupRow;
}

function createInviteRow(type, hasChild) {
	var rowId = '';
	var rowName = '';
	var rowText = '';
	var rowIcon = '';

	if (type == 'sms') {
		rowId = 'inviteSms';
		rowName = 'inviteSms';
		rowText = Alloy.Globals.PHRASES.sendSMSTxt;
		rowIcon = fontawesome.icon('fa-mobile');
	} else if (type == 'email') {
		rowId = 'inviteEmail';
		rowName = 'inviteEmail';
		rowText = Alloy.Globals.PHRASES.sendMailTxt;
		rowIcon = fontawesome.icon('fa-file-text-o');
	} else if (type == 'facebook') {
		rowId = 'inviteFacebook';
		rowName = 'inviteFacebook';
		rowText = Alloy.Globals.PHRASES.shareFBTxt;
		rowIcon = fontawesome.icon('fa-facebook');
	}

	var inviteRow = Ti.UI.createTableViewRow({
		height : 75,
		id : rowId,
		name : rowName,
		inviteType : type,
		width : Ti.UI.FILL,
		color : "#FFF",
		backgroundColor : 'transparent',
		font : Alloy.Globals.getFont(),
		hasChild : hasChild,
		selectionStyle : 'none'
	});

	var inviteIcon = Titanium.UI.createLabel({
		font : {
			fontFamily : font,
			fontSize : 28
		},
		text : rowIcon,
		left : '5%',
		color : '#FFF',
		touchEnabled : false
	});

	inviteRow.add(inviteIcon);

	var inviteTextLabel = Ti.UI.createLabel({
		text : rowText + " ",
		textAlign : "center",
		left : 60,
		touchEnabled: false,
		font : Alloy.Globals.getFontCustom(16, 'Regular'),
		color : '#FFF'
	});

	inviteRow.add(inviteTextLabel);
	addRowEventListener(inviteRow, type);
	
	return inviteRow;
}

function createViews(friendArray, groupArray) {
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
				getFriendsAndGroups();

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
			tableSeparatorInsets : {
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
		
		table.addEventListener('scroll',function(e) {       	 
			if(e.firstVisibleItem > 1 && typeof swipeRefresh !== 'undefined' && swipeRefresh !== null) {
          		swipeRefresh.setEnabled(false);
	     	}  else {
	     		swipeRefresh.setEnabled(true);
	     	}
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

	sections[0] = createSectionsForTable(Alloy.Globals.PHRASES.inviteFriendsTxt + " ", true);

	// create invite rows
	sections[0].add(createInviteRow('sms', hasChild));
	sections[0].add(createInviteRow('email', hasChild));
	sections[0].add(createInviteRow('facebook', hasChild));
	
	if(groupArray.length !== 0) {
		sections[1] = createSectionsForTable(Alloy.Globals.PHRASES.GroupsTxt + " ", false);
		
		for (var i = 0; i < groupArray.length; i++) {
    		sections[1].add(createGroupRow(groupArray[i]));
    	}
	}
	
	
	if (friendArray.length !== 0) {
		sections[2] = createSectionsForTable(Alloy.Globals.PHRASES.FriendsTxt + " ", false);
		
		for (var i = 0; i < friendArray.length; i++) {
    		sections[2].add(createMemberRow(friendArray[i]));
    	}
	}
	table.setData(sections);

	tableWrapper.removeAllChildren();
	tableWrapper.add(table);
	createSubmitButtons();

	// hide submit
	tableWrapper.setHeight('100%');
	submitButton.setVisible(false);
}

// create sections for the table
function createSectionsForTable(sectionText, visible) {
	var sectionView = $.UI.create('View', {
		classes : ['challengesSection']
	});

	if(visible) {
		sectionView.add(Ti.UI.createLabel({
			top : '25%',
			width : Ti.UI.FILL,
			left : 10,
			text : sectionText,
			font : Alloy.Globals.getFontCustom(18, 'Regular'),
			color : '#FFF'
		}));
	} else {
		if(!isAndroid) {
			sectionView = Ti.UI.createView({
				height : 0.5,
				backgroundColor : '#303030',
			});
		} else {
			sectionView = Ti.UI.createView({
				height : 1,
				backgroundColor : 'transparent',
				backgroundColor : '#303030',
			});
		}
	}
	
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
	e.source.image = '/images/no_pic.png';
};

var context;
var args = arguments[0] || {};
//var params = args.param || null;
var groupObjects = [];
var friendObjects = [];
var selectedGroups = [];
var friendsChallenge = [];
var selectedFriendRows = [];
var selectedGroupRows = [];
var submitButton;
var isSubmitting = false;
var marginView;
var table;
var sections = [];
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
			if($.groupSelectWindow) {
				$.groupSelectWindow.close();
				$.groupSelectWindow = null;
			}
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
	if (isAndroid) {
		context.on('groupSelectActivity', this.activity);
	}
}

function onClose(evt) {
	if (isAndroid) {
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
		height : '80%',
		width : Ti.UI.FILL,
		id : 'swiper'
	});

	swipeRefresh.addEventListener('refreshing', function(e) {
		if (Alloy.Globals.checkConnection()) {
			setTimeout(function() {
				indicator.openIndicator();
				getFriendsAndGroups();
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
	getFriendsAndGroups();
	notFirstRun = true;
} else {
	Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
}