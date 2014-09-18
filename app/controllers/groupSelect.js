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
	height : "75%",
	width : Ti.UI.FILL,

});
// refresh this view
Ti.App.addEventListener("groupSelectRefresh", function(e) {
	indicator.openIndicator();
	getGroups();
});

function createMemberRow(member, subRow) {
	//profilepicture
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
		height : 40,
		width : 40,
		left : 10,
		top : 5
	});

	profilePic.addEventListener("error", function(e) {
		Ti.API.info("fel på bild");
		e.source.image = '/images/no_pic.png';
	});
	subRow.add(profilePic);
	subRow.add(Ti.UI.createLabel({
		text : member.name,
		top : -30,
		left : 60,
		width : 'auto',
		font : {
			fontSize : Alloy.Globals.getFontSize(1),
			fontWeight : 'normal',
			fontFamily : Alloy.Globals.getFont()
		},
		color : '#FFF',
		backgroundColor : '#303030'
	}));

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
	
	if(OS_IOS || notFirstRun) {
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
					tab_groups.setBackgroundColor("black");
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

			Ti.API.error('Bad Sever =>' + e.error);
		};

		try {
			xhr.open('POST', Alloy.Globals.BETKAMPENCHALLENGEGROUPURL);
			xhr.setRequestHeader("content-type", "application/json");
			xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
			xhr.setTimeout(Alloy.Globals.TIMEOUT);

			var param = "";
			// add groups to params
			param += '{"cid": ' + Alloy.Globals.COUPON.id + ', "coins": ' + coins + ', "groups": [{';

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
					var alertWindow = Titanium.UI.createAlertDialog({
						title : Alloy.Globals.PHRASES.betbattleTxt,
						message : response,
						buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt]
					});

					alertWindow.addEventListener('click', function() {
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
					});
					alertWindow.show();

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
			param += '{"coins": ' + coins + ', "cid":"' + Alloy.Globals.COUPON.id + '", "friends":[{';

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
					var alertWindow = Titanium.UI.createAlertDialog({
						title : Alloy.Globals.PHRASES.betbattleTxt,
						message : response,
						buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt]
					});

					alertWindow.addEventListener('click', function() {
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
					});
					alertWindow.show();

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
		backgroundColor : '#303030',
		id : 'submitButtonsView'
	});

	if (iOSVersion < 7) {
		submitButton = Titanium.UI.createButton({
			title : Alloy.Globals.PHRASES.challengeBtnTxt,
			height : 30,
			//top : 0,
			width : '70%',
			id : 'submitButton',
			backgroundColor : Alloy.Globals.themeColor(),
			borderRadius : 6,
			font : {
				fontFamily : Alloy.Globals.getFont(),
				fontSize : Alloy.Globals.getFontSize(2)
			},
			color : '#FFF',
			backgroundImage : 'none'
		});

	} else {
		submitButton = Titanium.UI.createButton({
			title : Alloy.Globals.PHRASES.challengeBtnTxt,
			height : buttonHeight,
			//top : 0,
			width : '70%',
			id : 'submitButton',
			backgroundColor : Alloy.Globals.themeColor(),
			borderRadius : 6,
			font : {
				fontFamily : Alloy.Globals.getFont(),
				fontSize : Alloy.Globals.getFontSize(2)
			},
			color : '#FFF',
			backgroundImage : 'none'
		});
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
			backgroundColor : '#303030'
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
			backgroundColor : '#303030'
		});

	}

	table.footerView = Ti.UI.createView({
		height : 0.5,
		backgroundColor : '#6d6d6d'
	});

	var data = [];

	var hasChild;

	if (OS_IOS) {
		hasChild = true;
	} else if (OS_ANDROID) {
		hasChild = false;
	}

	// Rows
	for (var i = 0; i < array.length; i++) {
		if (type == 1) {
			var subRow = Ti.UI.createTableViewRow({
				layout : 'vertical',
				backgroundColor : '#303030',
				selectionStyle : 'none',
				height : 'auto'
			});

			subRow.footerView = Ti.UI.createView({
				height : 0.5,
				backgroundColor : '#6d6d6d'
			});

			subRow.add(Ti.UI.createView({
				height : 10
			}));

			for (var x = 0; x < array[i].attributes.members.length; x++) {
				createMemberRow(array[i].attributes.members[x], subRow);
			}

			subRow.add(Ti.UI.createView({
				height : 20
			}));

			// array with views for the sub in table row
			var subRowArray = [];
			subRowArray.push(subRow);

			var hasChild;

			if (OS_IOS) {
				hasChild = true;
			} else if (OS_ANDROID) {
				hasChild = false;
			}

			var row = $.UI.create('TableViewRow', {
				classes : ['challengesSectionDefault'],
				id : array[i].attributes.id,
				hasChild : hasChild,
				isparent : true,
				opened : false,
				//name: array[i].attributes.name,
				sub : subRowArray,
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
				hasChild : hasChild,
				isparent : true,
				opened : false,
				name : array[i].attributes.name,
				height : 40,
				//sub : subRowArray,
			});

			var detailsImg = Ti.UI.createImageView({
				name : 'profilePic',
				width : 30,
				height : 30,
				//top : 11,
				left : 5,
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

			var detailsImg = Ti.UI.createImageView({
				name : 'detailsBtn',
				width : 35,
				height : 35,
				top : 11,
				left : 5,
				id : array[i].attributes.round,
				image : '/images/p.png'
			});

			row.add(detailsImg);

			if (OS_ANDROID) {
				row.add(Ti.UI.createLabel({
					font : {
						fontFamily : font
					},
					text : fontawesome.icon('icon-chevron-right'),
					right : '5%',
					color : '#FFF',
					fontSize : 80,
					height : 'auto',
					width : 'auto'
				}));
			}

			row.className = 'one_image_per_row';
		}

		data.push(row);
	}

	table.setData(data);

	// add event listener
	table.addEventListener("click", function(e) {
		// check if we press the button on the row

		if (e.source.name === 'detailsBtn') {
			if (type == 1) {
				// change Image
				if (e.source.image == '/images/p.png') {
					e.source.image = '/images/m.png';
				} else {
					e.source.image = '/images/p.png';
				}
				// This will show group members
				//Is this a parent cell?
				if (e.row.isparent) {
					//Is it opened?
					if (e.row.opened) {
						for (var i = e.row.sub.length; i > 0; i = i - 1) {
							table.deleteRow(e.index + i);
						}
						e.row.opened = false;
					} else {
						//Add the children.
						var currentIndex = e.index;
						for (var i = 0; i < e.row.sub.length; i++) {
							table.insertRowAfter(currentIndex, e.row.sub[i]);
							currentIndex++;
						}
						e.row.opened = true;
					}
				}
			}
		} else {
			// change Image
			if (type == 1) {
				if (e.source.image == '/images/p.png') {
					e.source.image = '/images/m.png';
				} else {
					e.source.image = '/images/p.png';
				}
			}
			// This will show group members
			//Is this a parent cell?
			if (type == 1) {
				if (e.row.isparent) {
					//Is it opened?
					if (e.row.opened) {
						for (var i = e.row.sub.length; i > 0; i = i - 1) {
							table.deleteRow(e.index + i);
						}
						e.row.opened = false;
					} else {
						//Add the children.
						var currentIndex = e.index;
						for (var i = 0; i < e.row.sub.length; i++) {
							table.insertRowAfter(currentIndex, e.row.sub[i]);
							currentIndex++;
						}
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
					buttonsPushed[i].setBackgroundColor('#242424');
					buttonsPushed[i].backgroundGradient = {
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
				}
			}
			// since we are not selecting several groups right now
			Ti.API.info("friend array: " + JSON.stringify(friendsChallenge));
			if (clicked) {
				//e.row.children[(e.row.children.length)-1] = null;
				e.row.remove(e.row.children[e.row.children.length - 1]);
				e.row.setBackgroundColor('#242424');
				e.row.backgroundGradient = {
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
			} else {
				if (type == 2) {
					e.row.add(Ti.UI.createLabel({
						id : 'selected_' + e.row.id,
						text : fontawesome.icon('fa-check'),
						textAlign : "center",
						right : 10,
						color : "#FFF",
						parent : row,
						font : {
							fontSize : 30,
							fontFamily : font,
						},
						height : "auto",
						width : "auto",
					}));
				}
				e.row.setBackgroundColor(Alloy.Globals.themeColor());
				e.row.backgroundGradient = {};
			}

		}
	});

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
		$.groupSelectWindow.activity.actionBar.onHomeIconItemSelected = function() {
			$.groupSelectWindow.close();
			$.groupSelectWindow = null;
		};
		$.groupSelectWindow.activity.actionBar.displayHomeAsUp = true;
		$.groupSelectWindow.activity.title = Alloy.Globals.PHRASES.betbattleTxt;
		indicator.openIndicator();
	});
}

var iOSVersion;

if (OS_IOS) {
	iOSVersion = parseInt(Ti.Platform.version);
}

var topView = Ti.UI.createView({
	height : 40,
	width : Ti.UI.FILL,
	layout : 'horizontal',
});

var botView = Ti.UI.createView({
	height : 60,
	width : Ti.UI.FILL,
	layout : 'absolute',
});

var tab_groups = Ti.UI.createView({
	height : 40,
	width : "50%",
	backgroundColor : Alloy.Globals.themeColor(),
});

tab_groups.add(Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.GroupsTxt,
	textAlign : "center",
	color : "#FFFFFF",
	font : {
		fontSize : 14,
		fontFamily : "Impact",
	}
}));

var tab_friends = Ti.UI.createView({
	height : 40,
	width : "50%",
	backgroundColor : "black",
});

tab_friends.add(Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.FriendsTxt,
	textAlign : "center",
	color : "#c5c5c5",
	font : {
		fontSize : 14,
		fontFamily : "Impact",
	}
}));

topView.add(tab_groups);
topView.add(tab_friends);

$.groupSelect.add(topView);

tab_groups.addEventListener("click", function(e) {
	tab_groups.setBackgroundColor(Alloy.Globals.themeColor());
	tab_friends.setBackgroundColor("black");
	getGroups();
});

tab_friends.addEventListener("click", function(e) {
	tab_groups.setBackgroundColor("black");
	tab_friends.setBackgroundColor(Alloy.Globals.themeColor());
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