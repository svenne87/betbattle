
var sections = [];
var table = null;
var fontawesome = require('lib/IconicFont').IconicFont({
	font : 'lib/FontAwesome'
});

var font = 'FontAwesome';

if (OS_ANDROID) {
	font = 'fontawesome-webfont';
}
var mainView = Ti.UI.createView({
	class : "topView",
	height : "100%",
	width : "100%",
	top : 0,
	backgroundColor : "transparent",
	layout : "vertical"
});

var header = Ti.UI.createView({
	 	height : '15%',
        width : Ti.UI.FILL,
       
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

var groupLabel = Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.myGroupsTxt,
	classes : ['no_remove'],
	//textAlign : "center",
	left: 20,
	font : Alloy.Globals.getFontCustom(20, "Bold"),
	color : "#FFF"
});
header.add(groupLabel);
mainView.add(header);



function getGroups() {
	groupObjects = [];

	if (OS_IOS) {
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
								id : response[i].members[x].uid,
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
		$.myGroups.close();
	});

}

function createViews(array) {
	

	///*******Create Table View*******///

			var tableHeaderView = Ti.UI.createView({
				height : 0.1
			});
		
			var fontawesome = require('lib/IconicFont').IconicFont({
				font : 'lib/FontAwesome'
			});
		
			var font = 'FontAwesome';
		
			if (OS_ANDROID) {
				font = 'fontawesome-webfont';
			}
		
			var tableFooterView = Ti.UI.createView({
				height : 0.1
			});
		
			if (OS_IOS) {
				var separatorS;
				var separatorCol;
		
				if (iOSVersion < 7) {
					separatorS = Titanium.UI.iPhone.TableViewSeparatorStyle.NONE;
					separatorColor = 'transparent';
				} else {
					separatorS = Titanium.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE;
					separatorColor = '#6d6d6d';
				}
		
				table = Titanium.UI.createTableView({
					//width : Ti.UI.FILL,
					left : 0,
					headerView : tableHeaderView,
					footerView : tableFooterView,
					height : '85%',
					width : '100%',
					//backgroundImage: '/images/profileBG.jpg',
					backgroundColor : 'transparent',
					style : Ti.UI.iPhone.TableViewStyle.GROUPED,
					separatorInsets : {
						left : 0,
						right : 0
					},
					id : 'challengeTable',
					separatorStyle : separatorS,
					separatorColor : separatorColor
				});
			} else if (OS_ANDROID) {
				table = Titanium.UI.createTableView({
					width : Ti.UI.FILL,
					left : 0,
					headerView : tableHeaderView,
					height : '85%',
					//backgroundColor : '#303030',
					separatorColor : '#6d6d6d',
					id : 'challengeTable'
				});
			}
			
			sections[0] = Ti.UI.createTableViewSection({
				headerView : Ti.UI.createView({
					height : 0.1
				}),
				footerView : Ti.UI.createView({
					height : 0.1
				}),
			});

		
	// Rows
	for (var i = 0; i < array.length; i++) {
		var child = true;
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
				fontSize: 22
			},
			text: fontawesome.icon('fa-users'),
			left: 20,
			color: '#FFF',
		});

		group.add(iconLabel);
		
		var name = Ti.UI.createLabel({
			classes : ['remove'],
			text : array[i].attributes.name,
			id : array[i].attributes.id,
			left : 50,
			font : Alloy.Globals.getFontCustom(16, "Regular"),
			color: "#FFF",
		});
		group.add(name);

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
			//alert('editera mig' + e.source.id);
			gID = e.row.id;
			gName = e.row.gName;
			gAdmin = e.row.creator;
			var win = Alloy.createController('editGroup', gID, gName, gAdmin).getView();
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
		$.myGroups.activity.actionBar.title = Alloy.Globals.PHRASES.betbattleTxt;

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
