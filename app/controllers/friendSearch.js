var args = arguments[0] || {};

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

var fontawesome = require('lib/IconicFont').IconicFont({
    font : 'lib/FontAwesome'
});

var context;
var font = 'FontAwesome';
var iOSVersion;
var isAndroid = true;
var table;
var sections = [];
var friendResp = null;

if (OS_ANDROID) {
    context = require('lib/Context');
    font = 'fontawesome-webfont';
    $.friendSearch.addEventListener('open', function() {
        Alloy.Globals.setAndroidCouponMenu($.friendSearch.activity);

        $.friendSearch.activity.actionBar.onHomeIconItemSelected = function() {
            if($.friendSearch) {
            	$.friendSearch.close();
            	$.friendSearch = null;
            }
        };
        $.friendSearch.activity.actionBar.displayHomeAsUp = true;
        $.friendSearch.activity.actionBar.title = Alloy.Globals.PHRASES.searchBtnTxt;
    });
} else {
    isAndroid = false;
    iOSVersion = parseInt(Ti.Platform.version);
    $.friendSearch.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.searchBtnTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });
}

function onOpen(evt) {
    if(isAndroid) {
        context.on('friendSearchActivity', this.activity);
    }
}

function onClose(evt) {
    if(isAndroid) {
        context.off('friendSearchActivity');
    }
}

$.friendSearch.addEventListener('close', function() {
    indicator.closeIndicator();
});

var mainView = Ti.UI.createView({
    class : "topView",
    height : "100%",
    id : 'mainView',
    width : "100%",
    top : 0,
    backgroundColor : "transparent",
    layout : "vertical"
});

var searchView = Ti.UI.createView({
    width : '100%',
    height : 50,
    top : 30
});

mainView.add(searchView);

var searchText = Ti.UI.createTextField({
    color : '#336699',
    backgroundColor : '#CCC',
    left : 18,
    width : '90%',
    height : 50,
    hintText : Alloy.Globals.PHRASES.searchHintTxt,
    tintColor : '#000',
    keyboardType : Titanium.UI.KEYBOARD_DEFAULT,
    returnKeyType : Titanium.UI.RETURNKEY_DEFAULT,
    borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});
searchView.add(searchText);

var searchBtn = Alloy.Globals.createButtonView(Alloy.Globals.themeColor(), "#FFF", Alloy.Globals.PHRASES.searchBtnTxt);

var searchIcon = Ti.UI.createLabel({
    left : 20,
   	font : {
   		fontFamily : font
    },
    text : fontawesome.icon('fa-search'),
    color : "#FFF",
});

searchBtn.add(searchIcon);

mainView.add(searchBtn);

var tableHeaderView = Ti.UI.createView({
    height : 0.1
});

var tableFooterView = Ti.UI.createView({
    height : 0.1
});

if (!isAndroid) {
    table = Titanium.UI.createTableView({
        left : 0,
        top : 20,
        headerView : tableHeaderView,
        footerView : tableFooterView,
        height : '75%',
        width : Ti.UI.FILL,
        backgroundColor : 'transparent',
        style : Ti.UI.iPhone.TableViewStyle.GROUPED,
        tableSeparatorInsets : {
            left : 0,
            right : 0
        },
        id : 'searchTable',
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
        top : 20,
        headerView : tableHeaderView,
        height : '75%',
        separatorColor : '#303030',
        id : 'searchTable'
    });
}

sections[0] = Ti.UI.createTableViewSection({
    headerView : Ti.UI.createView({
        height : 0.1
    }),
    footerView : Ti.UI.createView({
        height : 0.1
    })
});

mainView.add(table);

//search starting when you click searchbutton
searchBtn.addEventListener('click', function(e) {
	if(isAndroid) {
		searchText.blur();
	}
	
	getSearchResult(); 
});

//or when you just click return on the keyboard
searchText.addEventListener('return', function(e) {
    if(typeof searchText.value === 'undefined') {
        return;
    }
    
    if(searchText.value.toLowerCase() !== Alloy.Globals.PROFILENAME.toLowerCase()) {
        getSearchResult(); 
    } else {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.selfSearchTxt);
    }
});

function createFriendsGUI(obj) {
    //adding your friends to array to check so you dont add same friend again
    var fr = [];
    
    if (friendResp.length !== null) {
        for (var s = 0; s < friendResp.length; s++) {
            fr.push(friendResp[s].id);
        }
    } 
    
    function isInArray(fr, search) {
        return (fr.indexOf(search) >= 0) ? true : false;
    }

    //add label and line to view when results is showed
    var row = Ti.UI.createTableViewRow({
        width : Ti.UI.FILL,
        height : 65,
        name : obj.name.toString(),
        id : obj.id,
        isFriend : false,
        fName : obj.name.toString(),
    });
    
    //profilepicture
    var image;
    if (obj.fb_id !== null) {
        image = "https://graph.facebook.com/" + obj.fb_id + "/picture?type=large";
    } else {
        // get betkampen image
        image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + obj.id + '.png';
    }

    var profilePic = Titanium.UI.createImageView({
       // defaultImage : '/images/no_pic.png',
        image : image,
        width : 40,
        left : 10,
        height : 40,
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

    //short down username so its fits on the screen
    boardName = obj.name.toString();
    if (boardName.length > 22) {
        boardName = boardName.substring(0, 19) + '...';
    }
    var name = Ti.UI.createLabel({
        text : boardName + ' ',
        left : 60,
        font : Alloy.Globals.getFontCustom(16, "Regular"),
        color : "#FFF",
        fName : obj.name.toString(),
    });
    row.add(name);

    //check if you already are friends
    if (isInArray(fr, obj.id)) {
        //if you are disable add button
        var rowIcon = Ti.UI.createLabel({
            right : 10,
            id : obj.id,
            font : {
                fontFamily : font,
                fontSize : 32
            },
            text : fontawesome.icon('fa-check'),
            color : Alloy.Globals.themeColor(),
            fName : obj.name.toString(),
        });
        row.add(rowIcon);
        row.isFriend = true;
    } else if (obj.id == Alloy.Globals.BETKAMPENUID) {
        row.isFriend = true;

        var rowIcon = Ti.UI.createLabel({
            right : 10,
            id : obj.id,
            font : {
                fontFamily : font,
                fontSize : 32
            },
            text : fontawesome.icon('fa-check'),
            color : Alloy.Globals.themeColor(),
            fName : obj.name.toString(),
        });
        row.add(rowIcon);
        row.setBackgroundColor(Alloy.Globals.themeColor());
    } else {
        // add button for adding your new friend
        var rowIcon = Ti.UI.createLabel({
            right : 10,
            id : obj.id,
            font : {
                fontFamily : font,
                fontSize : 32
            },
            text : fontawesome.icon('fa-plus'),
            color : '#FFF',
            fName : obj.name.toString()
        });
        row.add(rowIcon);
        row.isFriend = false;
    }

    row.addEventListener('click', function(e) {
        if (e.row.isFriend == false) {
            //add friend to friendlist
            addFriend(e.source.id, e.source.fName, rowIcon);
            e.row.isFriend = true;
        } else if (e.row.isFriend == true) {
            //if you clicked on wrong person and click again you remove him from your friendlist
            deleteFriend(e.source.id, e.source.fName, rowIcon);
            e.row.isFriend = false;
        }
    });

    sections[0].add(row);
}

function createGroupsGUI(obj, isMember) {

    //add label and line to view when results is showed
    var row = Ti.UI.createTableViewRow({
        width : Ti.UI.FILL,
        height : 65,
        name : obj.name.toString(),
        id : obj.id,
        isGroup : false,
        fName : obj.name.toString(),
        groupCreator : obj.fb_id,
    });

    var mgIconLabel = Titanium.UI.createLabel({
    	font : {
        	fontFamily : font,
        	fontSize : 22
    	},
   		 text : fontawesome.icon('fa-users'),
   	 	left : 20,
    	color : '#FFF',
	});
	
	row.add(mgIconLabel);

    //short down username so its fits on the screen
    boardName = obj.name.toString();
    if (boardName.length > 22) {
        boardName = boardName.substring(0, 19) + '...';
    }
    var name = Ti.UI.createLabel({
        text : boardName + ' ',
        left : 60,
        font : Alloy.Globals.getFontCustom(16, "Regular"),
        color : "#FFF",
        fName : obj.name.toString(),
        groupCreator : obj.fb_id,
    });
    row.add(name);

    //check if you are a part of this group
    if (isMember) {
        //if you are disable add button
        var rowIcon = Ti.UI.createLabel({
            right : 10,
            id : obj.id,
            font : {
                fontFamily : font,
                fontSize : 32
            },
            text : fontawesome.icon('fa-check'),
            color : Alloy.Globals.themeColor(),
            fName : obj.name.toString(),
            groupCreator : obj.fb_id,
        });
        row.add(rowIcon);
        row.isGroup = true;
    } else {
        // add button for adding your new friend
        var rowIcon = Ti.UI.createLabel({
            right : 10,
            id : obj.id,
            font : {
                fontFamily : font,
                fontSize : 32
            },
            text : fontawesome.icon('fa-plus'),
            color : '#FFF',
            fName : obj.name.toString(),
            groupCreator : obj.fb_id,
        });
        row.add(rowIcon);
        row.isGroup = false;
    }

    row.addEventListener('click', function(e) {
        if (e.row.isGroup == false) {
            // join group
            joinGroup(e.source.id, rowIcon);
            e.row.isGroup = true;
        } else if (e.row.isGroup == true) {
            // leave group
            if(e.source.groupCreator !== Alloy.Globals.BETKAMPENUID) {
            	leaveGroup(e.source.id, rowIcon);
            	e.row.isGroup = false;
         	} else {
        		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.leaveGroupErrorTxt);
         	}
        }
    });

    sections[1].add(row);
}

// create sections for the table
function createSectionsForTable(sectionText) {
    var sectionView = $.UI.create('View', {
        classes : ['challengesSection']
    });

    sectionView.add(Ti.UI.createLabel({
        top : '25%',
        width : Ti.UI.FILL,
        left : 60,
        text : sectionText,
        font : Alloy.Globals.getFontCustom(18, 'Bold'),
        color : '#FFF'
    }));

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

function getSearchResult() {
    if (!Alloy.Globals.checkConnection()) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        return;
    }

    if (searchText.value.length > 2) {
        var client = Ti.Network.createHTTPClient({
            // function called when the response data is available
            onload : function(e) {
              	var response = JSON.parse(this.responseText);
                
                // clear rows
                table.setData([]);
				
				// friends and groups section	
               	sections[0] = createSectionsForTable(Alloy.Globals.PHRASES.FriendsTxt);
				sections[1] = createSectionsForTable(Alloy.Globals.PHRASES.GroupsTxt);                
				
				if (response.search.friends.length > 0) {
					friendResp = response.friends;
                    
                    for (var i = 0; i < response.search.friends.length; i++) {                     
                        if (response.search.friends[i].id !== Alloy.Globals.BETKAMPENUID) {
                        	createFriendsGUI(response.search.friends[i]);
                        } 
                        
                        if(i == 50) break; // limit    
                    }
				} else {
					var row = Ti.UI.createTableViewRow({
                        height : 65,
                        width : Ti.UI.FILL,
                        name : 'remove',
                        selectionStyle : 'none'
                    });

                    var resultLabel = Ti.UI.createLabel({
                        text : Alloy.Globals.PHRASES.noResultTxt + " " + searchText.value + " ",
                        left : 20,
                        font : Alloy.Globals.getFontCustom(16, "Regular"),
                        color : "#FFF"
                    });

                    row.add(resultLabel);
                    sections[0].add(row);				
				}
				
				if (response.search.groups.length > 0) {
					for (var i = 0; i < response.search.groups.length; i++) {                     
                        createGroupsGUI(response.search.groups[i], response.search.groups[i].is_member);
     
                        if(i == 50) break; // limit
                    }				
				} else {
					var row = Ti.UI.createTableViewRow({
                        height : 65,
                        width : Ti.UI.FILL,
                        name : 'remove',
                        selectionStyle : 'none'
                    });

                    var resultLabel = Ti.UI.createLabel({
                        text : Alloy.Globals.PHRASES.noResultTxt + " " + searchText.value + " ",
                        left : 20,
                        font : Alloy.Globals.getFontCustom(16, "Regular"),
                        color : "#FFF"
                    });

                    row.add(resultLabel);
                    sections[1].add(row);	
				}

				table.setData(sections);
                indicator.closeIndicator();
            },
            // function called when an error occurs, including a timeout
            onerror : function(e) {
                Ti.API.debug(e.error);
                indicator.closeIndicator();
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            }
        });
        // Prepare the connection. search in users table after what you searched
        client.open("GET", Alloy.Globals.BETKAMPENFRIENDSEARCHURL + '?search=' + searchText.value + '&lang=' + Alloy.Globals.LOCALE);
        client.setRequestHeader("content-type", "application/json");
        client.setTimeout(Alloy.Globals.TIMEOUT);
        client.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
        indicator.openIndicator();
        // Send the request.
        client.send();
    } else {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.searchCharsTxt);
    }
}

function addFriend(frid, name, rowIcon) {
    if (!Alloy.Globals.checkConnection()) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        return;
    }

    table.touchEnabled = false;
    var xhr = Titanium.Network.createHTTPClient();

    xhr.onerror = function(e) {
        indicator.closeIndicator();
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        Ti.API.error('Bad Sever =>' + e.error);
        table.touchEnabled = true;
    };

    try {
        indicator.openIndicator();
        xhr.open('POST', Alloy.Globals.BETKAMPENADDFRIENDSURL + '?frid=' + frid + '&fb=0&lang=' + Alloy.Globals.LOCALE);
        xhr.setRequestHeader("challengesView-type", "application/json");
        xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
        xhr.setTimeout(Alloy.Globals.TIMEOUT);
        xhr.send();
    } catch(e) {
        indicator.closeIndicator();
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        table.touchEnabled = true;
    }
    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {
                var response = JSON.parse(this.responseText);
                Alloy.Globals.showToast(Alloy.Globals.PHRASES.friendSuccess + ' ' + name);
                table.touchEnabled = true;
                rowIcon.setText(fontawesome.icon('fa-check'));
            	rowIcon.setColor(Alloy.Globals.themeColor());
            } 
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("Error =>" + this.response);
            table.touchEnabled = true;
        }
        indicator.closeIndicator();
    };
}

function deleteFriend(frid, name, rowIcon) {
    if (!Alloy.Globals.checkConnection()) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        return;
    }

    table.touchEnabled = false;
    var xhr = Titanium.Network.createHTTPClient();

    xhr.onerror = function(e) {
        indicator.closeIndicator();
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        Ti.API.error('Bad Sever =>' + e.error);
        table.touchEnabled = true;
    };

    try {
        indicator.openIndicator();
        xhr.open('POST', Alloy.Globals.BETKAMPENDELETEFRIENDURL + '?frid=' + frid + '&fb=0&lang=' + Alloy.Globals.LOCALE);
        xhr.setRequestHeader("challengesView-type", "application/json");
        xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
        xhr.setTimeout(Alloy.Globals.TIMEOUT);
        xhr.send();
    } catch(e) {
        indicator.closeIndicator();
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        table.touchEnabled = true;
    }

    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {
                var response = JSON.parse(this.responseText);
                Alloy.Globals.showToast(name + Alloy.Globals.PHRASES.friendRemovedTxt);
                table.touchEnabled = true;
                rowIcon.setText(fontawesome.icon('fa-plus'));
            	rowIcon.setColor("#FFF");
            }
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("Error =>" + this.response);
            table.touchEnabled = true;
        }
        indicator.closeIndicator();
    };
}

function joinGroup(group_id, rowIcon) {
    if (!Alloy.Globals.checkConnection()) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        return;
    }

    table.touchEnabled = false;
    var xhr = Titanium.Network.createHTTPClient();

    xhr.onerror = function(e) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        Ti.API.error('Bad Sever =>' + e.error);
        table.touchEnabled = true;
    };

    try {
        indicator.openIndicator();
        xhr.open('POST', Alloy.Globals.BETKAMPENADDGROUPMEMBERSURL + '?lang=' + Alloy.Globals.LOCALE);
        xhr.setRequestHeader("challengesView-type", "application/json");
        xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
        xhr.setTimeout(Alloy.Globals.TIMEOUT);
        
        var params = {
        	group_id : group_id,
            id : Alloy.Globals.BETKAMPENUID,
            name : Alloy.Globals.PROFILENAME,
            admin : 0
        };
        xhr.send(params);   
    } catch(e) {
        indicator.closeIndicator();
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        table.touchEnabled = true;
    }
    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {
                var response = JSON.parse(this.responseText);
                Alloy.Globals.showToast(Alloy.Globals.PHRASES.joinGroupTxt);
                table.touchEnabled = true;
                rowIcon.setText(fontawesome.icon('fa-check'));
            	rowIcon.setColor(Alloy.Globals.themeColor());
            } 
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("Error =>" + this.response);
            table.touchEnabled = true;
        }
        indicator.closeIndicator();
    };
}

function leaveGroup(group_id, rowIcon) {
    if (!Alloy.Globals.checkConnection()) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        return;
    }

    table.touchEnabled = false;
    var xhr = Titanium.Network.createHTTPClient();

    xhr.onerror = function(e) {
        indicator.closeIndicator();
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        Ti.API.error('Bad Sever =>' + e.error);
        table.touchEnabled = true;
    };

    try {
        indicator.openIndicator();
        xhr.open("POST", Alloy.Globals.BETKAMPENREMOVEGROUPMEMBERURL + '?lang=' + Alloy.Globals.LOCALE);
        xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
        xhr.setTimeout(Alloy.Globals.TIMEOUT);
        var params = {
        	group_id : group_id,
            member_to_remove : Alloy.Globals.BETKAMPENUID,
        };
        xhr.send(params);   
    } catch(e) {
        indicator.closeIndicator();
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        table.touchEnabled = true;
    }

    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {
                var response = JSON.parse(this.responseText);
                Alloy.Globals.showToast(Alloy.Globals.PHRASES.groupleftTxt);
                table.touchEnabled = true;
                rowIcon.setText(fontawesome.icon('fa-plus'));
            	rowIcon.setColor("#FFF");
            }
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("Error =>" + this.response);
            table.touchEnabled = true;
        }
        indicator.closeIndicator();
    };
}


$.friendSearch.add(mainView);
