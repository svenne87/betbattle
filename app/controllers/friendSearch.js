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
            $.friendSearch.close();
            $.friendSearch = null;
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
    text : fontawesome.icon('fa-search'),
    font : font,
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
        height : '85%',
        width : Ti.UI.FILL,
        backgroundColor : 'transparent',
        style : Ti.UI.iPhone.TableViewStyle.GROUPED,
        separatorInsets : {
            left : 0,
            right : 0
        },
        id : 'challengeTable',
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
        height : '85%',
        separatorColor : '#303030',
        id : 'challengeTable'
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
    if(searchText.value.toLowerCase() !== Alloy.Globals.PROFILENAME.toLowerCase()) {
        getSearchResult(); 
    } else { 
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.selfSearchTxt);
    }
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
        width : Ti.UI.FILL,
        height : 65,
        name : obj.name.toString(),
        id : obj.fid,
        isFriend : false,
        fName : obj.name.toString(),
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
        defaultImage : '/images/no_pic.png',
        image : image,
        width : 40,
        left : 10,
        height : 40,
        borderRadius : 20
    });

    profilePic.addEventListener('error', function(e) {
        // fallback for image
        profilePic.image = '/images/no_pic.png';
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
            color : Alloy.Globals.themeColor(),
            fName : obj.name.toString(),
        });
        row.add(rowIcon);
        row.isFriend = true;
    } else if (obj.fid == Alloy.Globals.BETKAMPENUID) {
        row.isFriend = true;

        var rowIcon = Ti.UI.createLabel({
            right : 10,
            id : obj.fid,
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
            id : obj.fid,
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
            rowIcon.setText(fontawesome.icon('fa-check'));
            rowIcon.setColor(Alloy.Globals.themeColor());
            addFriend(e.source.id, e.source.fName);
            e.row.isFriend = true;

        } else if (e.row.isFriend == true) {
            //if you clicked on wrong person and click again you remove him from your friendlist
            rowIcon.setText(fontawesome.icon('fa-plus'));
            rowIcon.setColor("#FFF");
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
        var client = Ti.Network.createHTTPClient({
            // function called when the response data is available
            onload : function(e) {
                var response = JSON.parse(this.responseText);
                // clear rows
                table.setData([]);

                sections[0] = Ti.UI.createTableViewSection({
                    headerView : Ti.UI.createView({
                        height : 0.1
                    }),
                    footerView : Ti.UI.createView({
                        height : 0.1
                    })
                });

                if (response.search.data.length > 0) {
                    friendResp = response.friends;
                    
                    for (var i = 0; i < response.search.data.length; i++) {                     
                        if (response.search.data[i].fid === Alloy.Globals.BETKAMPENUID || i == 10) {
                            break;
                        } 
                        createGUI(response.search.data[i]);
                    }
                    table.setData(sections);
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
                    table.setData(sections);
                }
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

function addFriend(frid, name) {
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
            } 
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("Error =>" + this.response);
            table.touchEnabled = true;
        }
        indicator.closeIndicator();
    };
}

function deleteFriend(frid, name) {
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
