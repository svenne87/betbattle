/* Function */

Ti.App.addEventListener("sliderToggled", function(e) {
	if ( typeof table !== 'undefined') {
		if (e.hasSlided) {
			table.touchEnabled = false;
		} else {
			table.touchEnabled = true;
		}
	}
});

// refresh this view
Ti.App.addEventListener("groupSelectRefresh", function(e) {
	indicator.openIndicator();
	getGroups();
});

function getGroups() {

	if (OS_IOS) {
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
		xhr.setRequestHeader("Authorization", Alloy.Globals.FACEBOOK.accessToken);
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
					for (var i = 0; i < response.length; i++) {
						var membersArray = [];
						for (var x = 0; x < response[i].members.length; x++) {
							// member object
							var member = {
								fbid : response[i].members[x].fbid,
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
					createViews(groupObjects);
				} else {
					indicator.openIndicator();
					setTimeout(function() {
						var arg = {
							param : params
						};
						var win = Alloy.createController('friendSelect', arg).getView();
						Alloy.Globals.WINDOWS.push(win);

						if (OS_IOS) {
							Alloy.Globals.NAV.openWindow(win, {
								animated : true
							});
						} else if (OS_ANDROID) {
							win.open({
								fullScreen : true
							});
						}

						indicator.closeIndicator();
					}, 1500);
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

function challengeGroup(array, param) {
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
			xhr.open('POST', Alloy.Globals.BETKAMPENCHALLENGEDONEURL);
			xhr.setRequestHeader("content-type", "application/json");
			xhr.setRequestHeader("Authorization", Alloy.Globals.FACEBOOK.accessToken);
			xhr.setTimeout(Alloy.Globals.TIMEOUT);

			// add groups to params
			param += ', "groups": [{';

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

								if (OS_ANDROID) {
									Alloy.Globals.WINDOWS[win] = null;
								}
							}
						});
						alertWindow.show();
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

function createSubmitButtons() {

	var buttonHeight = 40;
	var viewHeight = '20%';

	Ti.API.log(Titanium.Platform.displayCaps.platformHeight);
	if (OS_ANDROID) {
		if (Titanium.Platform.displayCaps.platformHeight < 600) {
			buttonHeight = 30;
			table.height = '75%';
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
			title : 'Utmana',
			height : 30,
			top : -1,
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
			title : 'Utmana',
			height : buttonHeight,
			top : -1,
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

		if (selectedGroupIds.length === 1) {
			// call function to send to server
			challengeGroup(selectedGroupIds, params);
		} else {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.groupChallengeErrorTxt);
		}

	});

	if (iOSVersion < 7) {
		friendsButton = Ti.UI.createButton({
			title : Alloy.Globals.PHRASES.showFriendsTxt,
			height : 30,
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
		friendsButton = Ti.UI.createButton({
			title : Alloy.Globals.PHRASES.showFriendsTxt,
			height : buttonHeight,
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

	friendsButton.addEventListener('click', function() {
		var arg = {
			param : params
		};

		/*
		 // change view
		 var obj = {
		 controller : 'friendSelect',
		 arg : arg
		 };
		 Ti.App.fireEvent('app:updateView', obj);
		 TODO ANDROID
		 */

		var win = Alloy.createController('friendSelect', arg).getView();
		Alloy.Globals.WINDOWS.push(win);

		if (OS_IOS) {
			Alloy.Globals.NAV.openWindow(win, {
				animated : true
			});
		} else if (OS_ANDROID) {
			win.open({
				fullScreen : true
			});
		}
	});

	submitButtonsView.add(Titanium.UI.createView({
		id : 'marginView',
		layout : 'vertical',
		height : 10
	}));

	submitButtonsView.add(friendsButton);

	submitButtonsView.add(Titanium.UI.createView({
		id : 'marginView',
		layout : 'vertical',
		height : 10
	}));

	submitButtonsView.add(submitButton);
	$.groupSelect.add(submitButtonsView);
}

function createViews(array) {
	// check if table exists, and if it does simply remove it
	var children = $.groupSelect.children;
	for (var i = 0; i < children.length; i++) {
		if (children[i].id === 'groupsTable') {
			$.groupSelect.remove(children[i]);
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
			if(Alloy.Globals.checkConnection()){
				getGroups();
			} else {
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
				refresher.endRefreshing();
			}
		});
	}

	var tableHeaderView = Ti.UI.createView({
		height : '142dp',
		backgroundImage : '/images/header.png'
	});

	tableHeaderView.add(Ti.UI.createLabel({
		width : '100%',
		textAlign : 'center',
		top : 50,
		text : Alloy.Globals.PHRASES.chooseGroupTxt,
		font : {
			fontSize : Alloy.Globals.getFontSize(3),
			fontWeight : 'normal',
			fontFamily : Alloy.Globals.getFont()
		},
		color : '#FFF'
	}));

	// Table
	table = Ti.UI.createTableView({
		headerView : tableHeaderView,
		height : '80%',
		id : 'groupsTable',
		refreshControl : refresher,
		backgroundColor : '#303030'
	});

	table.footerView = Ti.UI.createView({
		height : 0.5,
		backgroundColor : '#6d6d6d'
	});

	if (OS_IOS) {
		table.separatorInsets = {
			left : 0,
			right : 0
		};
	}

	var data = [];

	// Rows
	for (var i = 0; i < array.length; i++) {

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

			subRow.add(Ti.UI.createImageView({
				image : 'https://graph.facebook.com/' + array[i].attributes.members[x].fbid + '/picture',
				height : 40,
				width : 40,
				left : 10,
				top : 5
			}));

			subRow.add(Ti.UI.createLabel({
				text : array[i].attributes.members[x].name,
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
		data.push(row);
	}

	table.setData(data);

	// add event listener
	table.addEventListener("click", function(e) {
		// check if we press the button on the row
		if (e.source.name === 'detailsBtn') {

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

		} else {
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

			buttonsPushed.push(e.row);

			for (var i = 0; i < buttonsPushed.length; i++) {
				// change color of lastpressed buttons
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
			// since we are not selecting several groups right now
			e.row.setBackgroundColor(Alloy.Globals.themeColor());
			e.row.backgroundGradient = {};
			selectedGroupIds[0] = e.row.id;
		}
	});

	$.groupSelect.add(table);
	createSubmitButtons();
}

var args = arguments[0] || {};
var params = args.param || null;
var groupObjects = [];
var selectedGroupIds = [];
var submitButton;
var marginView;
var buttonsPushed = [];
var table;
var friendsButton;
var refresher;

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
	/*
	 $.groupSelectWindow.addEventListener('androidback', function(){
	 $.groupSelectWindow.close();
	 $.groupSelectWindow = null;
	 });
	 */
}

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