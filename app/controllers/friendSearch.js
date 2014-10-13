var args = arguments[0] || {};

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

var fontawesome = require('lib/IconicFont').IconicFont({
    font : 'lib/FontAwesome'
});

var font = 'FontAwesome';
var iOSVersion;
if (OS_ANDROID) {
    font = 'fontawesome-webfont';
    $.friendSearch.addEventListener('open', function() {
        Alloy.Globals.setAndroidCouponMenu($.friendSearch.activity);

        $.friendSearch.activity.actionBar.onHomeIconItemSelected = function() {
            $.friendSearch.close();
            $.friendSearch = null;
        };
        $.friendSearch.activity.actionBar.displayHomeAsUp = true;
        $.friendSearch.activity.actionBar.title = Alloy.Globals.PHRASES.addFriendsTxt;
    });
} else {
	iOSVersion = parseInt(Ti.Platform.version);
    $.friendSearch.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.addFriendsTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });
}

$.friendSearch.addEventListener('close', function() {
    indicator.closeIndicator();
});
var mainView = Ti.UI.createView({
    class : "topView",
    height : "100%",
    id: 'mainView',
    width : "100%",
    top : 0,
    backgroundColor : "transparent",
    layout : "vertical"
});


var searchView = Ti.UI.createView({
    width : '100%',
    height : 40,
    top : '2%'
});
mainView.add(searchView);

var searchText = Ti.UI.createTextField({
    color : '#336699',
    backgroundColor : '#707070',
    borderColor : '#000',
    left : 18,
    width : '90%',
    height : 40,
    hintText : Alloy.Globals.PHRASES.searchHintTxt,
    tintColor : '#000',
    keyboardType : Titanium.UI.KEYBOARD_DEFAULT,
    returnKeyType : Titanium.UI.RETURNKEY_DEFAULT,
    borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});
searchView.add(searchText);

var searchBtn = Alloy.Globals.createButtonView("#FFF", "#000", Alloy.Globals.PHRASES.searchBtnTxt);

var searchIcon = Ti.UI.createLabel({
	left: 20,
	text: fontawesome.icon('fa-search'),
	font: font,
	color:"#000",
});

searchBtn.add(searchIcon);

mainView.add(searchBtn);
//search starting when you click searchbutton
searchBtn.addEventListener('click', function(e) {
	var children = $.friendSearch.children;
	for(var i in children){
		if(children[i].id == 'mainView'){
			mainChildren = children[i].children;
			for(var k in mainChildren){
				if(mainChildren[k].id == 'challengeTable'){
					Ti.API.info("HITTADE TABLE");
					children[i].remove(mainChildren[k]);
					mainChildren[k] = null;
				}
				
			}
			
			
		}
	}
	sections = [];
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
            
    mainView.add(table);
    getSearchResult();
    //searchText.removeEventListener('return');
});
//or when you just click return on the keyboard
/*searchText.addEventListener('return', function(e) {
getSearchResult();
});*/

var table = null;
var sections = [];


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
            
            mainView.add(table);
a = 0;
function createGUI(obj) {
    //adding your friends to array to check so you dont add same friend again
    var fr = [];
    if (friendResp.length == null) {

    } else {
        for (var s = 0; s < friendResp.length; s++) {
            fr.push(friendResp[s].id);

        }
    }
    function isInArray(fr, search) {
        return (fr.indexOf(search) >= 0) ? true : false;
    }

    //you can not add yourself as a friend

    a++;
    //add label and line to view when results is showed
   

    var row = Ti.UI.createTableViewRow({
        width : '100%',
        height : 65,
        id: obj.fid,
        isFriend : false,
        fName :  obj.name.toString(),
    });
    
    //mainView.add(row);

    //profilepicture
    var image;
    if (obj.fbid !== null) {
        image = "https://graph.facebook.com/" + obj.fbid + "/picture?type=large";
    } else {
        // get betkampen image
        image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + obj.fid + '.png';
    }

    var profilePic = Titanium.UI.createImageView({
        image : image,
        height : 35,
        width : 35,
        left : 20,
        borderRadius : 17
    });
    profilePic.addEventListener('error', function(e) {
        // fallback for image
        profilePic.image = '/images/no_pic.png';
    });
    row.add(profilePic);
    //short down username so its fits on the screen
    boardName = obj.name.toString();
    if (boardName.length > 22) {
        boardName = boardName.substring(0, 22);
    }
    var name = Ti.UI.createLabel({
        text : boardName,
        left : 50,
        font : Alloy.Globals.getFontCustom(18, "Regular"),
        color:"#FFF",
        fName :  obj.name.toString(),
    });
    row.add(name);


	
    //check if you already are friends
    if (isInArray(fr, obj.fid)) {
        //if you are disable add button
        
       // row.add(addBtn);
       	var rowIcon = Ti.UI.createLabel({
       		 right : 10,
             id : obj.fid,
			 font : {
	                    fontFamily : font,
	                    fontSize : 32
	                },
	         text : fontawesome.icon('fa-check'),
	         color : '#FFF',
	         fName :  obj.name.toString(),
		});
		row.add(rowIcon);
		row.setBackgroundColor(Alloy.Globals.themeColor());
        row.isFriend = true;
    } else if (obj.fid == Alloy.Globals.BETKAMPENUID) {
       row.isFriend = true;
        //row.add(addBtn);
       var rowIcon = Ti.UI.createLabel({
       		 right : 10,
             id : obj.fid,
			 font : {
	                    fontFamily : font,
	                    fontSize : 32
	                },
	         text : fontawesome.icon('fa-check'),
	         color : '#FFF',
	         fName :  obj.name.toString(),
		});
		row.add(rowIcon);
		row.setBackgroundColor(Alloy.Globals.themeColor());
    } else {
        // add button for adding your new friend
        var rowIcon = Ti.UI.createLabel({
        	right : 10,
             id : obj.fid,
			 font : {
	                    fontFamily : font,
	                    fontSize : 32
	                },
	         text : fontawesome.icon('fa-plus'),
	         color : '#FFF',
	         fName :  obj.name.toString()
		});
		row.add(rowIcon);
       row.isFriend = false;
    }

    row.addEventListener('click', function(e) {
        if (e.row.isFriend == false) {
            //add friend to friendlist
         	rowIcon.setText(fontawesome.icon('fa-check'));
            e.row.setBackgroundColor(Alloy.Globals.themeColor());
           	addFriend(e.source.id, e.source.fName);
			e.row.isFriend = true;
           
        } else if (e.row.isFriend == true) {
            //if you clicked on wrong person and click again you remove him from your friendlist
           
          	rowIcon.setText(fontawesome.icon('fa-plus'));
            e.row.setBackgroundColor('transparent');
            deleteFriend(e.source.id, e.source.fName);
          	e.row.isFriend = false;
        }

    });
    
    sections[0].add(row);
}

function getSearchResult() {
    if (!Alloy.Globals.checkConnection()) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        return;
    }

    if (searchText.value.length > 2) {
    	table.removeAllChildren();
    	sections[0].removeAllChildren();
        var client = Ti.Network.createHTTPClient({
            // function called when the response data is available
            onload : function(e) {
                var response = JSON.parse(this.responseText);
                // if response is empty show no result text
                if (response.data.length == 0) {
                	var row = Ti.UI.createTableViewRow({
                		height: 65,
                		width: Ti.UI.FILL,
                	});
                	
                    var resultLabel = Ti.UI.createLabel({
                        text : Alloy.Globals.PHRASES.noResultTxt + " " + searchText.value,
                        left:20,
                        font : Alloy.Globals.getFontCustom(18, "Regular"),
                        color : "#FFF"
                    });
                    row.add(resultLabel);
                    sections[0].add(row);
                    
                   table.setData(sections);
                   // refreshBtn.visible = true;
                    //creating gui with top ten result of your search
                } else {
                  
                    for (var i = 0; i < response.data.length; i++) {
                        if (i == 10) {
                            break;
                        }
                        createGUI(response.data[i]);

                    }
                    
                    table.setData(sections);
                    
                }
                indicator.closeIndicator();
            },
            // function called when an error occurs, including a timeout
            onerror : function(e) {
                Ti.API.debug(e.error);
                indicator.closeIndicator();
            },
            timeout : Alloy.Globals.TIMEOUT // in milliseconds
        });
        // Prepare the connection. search in users table after what you searched
        client.open("GET", Alloy.Globals.BETKAMPENFRIENDSEARCHURL + '?search=' + searchText.value + '&lang=' + Alloy.Globals.LOCALE);
        indicator.openIndicator();
        // Send the request.
        client.send();
    } else {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.searchCharsTxt);
    }
}


function addFriend(frid, name) {
    table.touchEnabled = false;
    Ti.API.info("skickar in fbid : " + frid);
    Ti.API.info("namnet som skickades : " + name);
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onerror = function(e) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        Ti.API.info('FEL : ' + JSON.stringify(this.responseText));
        Ti.API.error('Bad Sever =>' + e.error);
        table.touchEnabled = true;
    };

    try {
        xhr.open('POST', Alloy.Globals.BETKAMPENADDFRIENDSURL + '?frid=' + frid + '&fb=0&lang=' + Alloy.Globals.LOCALE);
        xhr.setRequestHeader("challengesView-type", "application/json");
        xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
        xhr.setTimeout(Alloy.Globals.TIMEOUT);
        xhr.send();
    } catch(e) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        table.touchEnabled = true;

    }
    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {
                Ti.API.info("RESPONSE ADD FRIEND : " + JSON.stringify(this.responseText));
                var response = JSON.parse(this.responseText);
                Alloy.Globals.showToast(Alloy.Globals.PHRASES.friendSuccess + ' ' + name);
                table.touchEnabled = true;
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                table.touchEnabled = true;
            }
        } else {
            indicator.closeIndicator();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("Error =>" + this.response);
            table.touchEnabled = true;
        }
    };

    //alert(Alloy.Globals.PHRASES.friendSuccess + ' ' + name);

}

function deleteFriend(frid, name) {
    table.touchEnabled = false;
    Ti.API.info("skickar in fbid : " + frid);
    Ti.API.info("namnet som skickades : " + name);
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onerror = function(e) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        Ti.API.info('FEL : ' + JSON.stringify(this.responseText));
        Ti.API.error('Bad Sever =>' + e.error);
        table.touchEnabled = true;
    };

    try {
        xhr.open('POST', Alloy.Globals.BETKAMPENDELETEFRIENDURL + '?frid=' + frid + '&fb=0&lang=' + Alloy.Globals.LOCALE);
        xhr.setRequestHeader("challengesView-type", "application/json");
        xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
        xhr.setTimeout(Alloy.Globals.TIMEOUT);
        xhr.send();
    } catch(e) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        table.touchEnabled = true;

    }
    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {
                Ti.API.info("RESPONSE DELETE FRIEND : " + JSON.stringify(this.responseText));
                var response = JSON.parse(this.responseText);
                Alloy.Globals.showToast(name + Alloy.Globals.PHRASES.friendRemovedTxt);
                table.touchEnabled = true;
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                table.touchEnabled = true;
            }
        } else {
            indicator.closeIndicator();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("Error =>" + this.response);
            table.touchEnabled = true;
        }
    };

}

var friendResp = null;
// get all users friends to see if you already are friends with the searchresult
var xhr = Ti.Network.createHTTPClient({
    onload : function(e) {
        Ti.API.info("Received text: " + this.responseText);
        friendResp = JSON.parse(this.responseText);

    },
    // function called when an error occurs, including a timeout
    onerror : function(e) {
        Ti.API.debug(e.error);
        //alert('error');
    },
    timeout : Alloy.Globals.TIMEOUT // in milliseconds
});
// Prepare the connection.
xhr.open('GET', Alloy.Globals.BETKAMPENGETFRIENDSURL + '?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);

xhr.setRequestHeader("content-type", "application/json");
xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
xhr.setTimeout(Alloy.Globals.TIMEOUT);

xhr.send();

$.friendSearch.add(mainView);
