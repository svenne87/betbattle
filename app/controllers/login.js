/* Functions */
var listener = function() {
    login();
};

function setButtonOpacity(value) {
    $.loginBtn.setOpacity(value);
    $.facebookBtn.setOpacity(value);
    $.registerBtn.setOpacity(value);
}

function removeEvent() {
    $.facebookBtn.removeEventListener('click', listener);
}

function addEvent() {
    $.facebookBtn.addEventListener('click', listener);
}

function createLeagueAndUidObj(response) {
    Ti.API.log(JSON.stringify(response));
    Alloy.Globals.BETKAMPENUID = response.betkampen_uid;
    Alloy.Globals.PROFILENAME = response.profile_name;
    Alloy.Globals.LEAGUES = [];
    Alloy.Globals.AVAILABLELANGUAGES = [];
    Alloy.Globals.VERSIONS = response.versions;
    user_team = response.user_team;

    for (var i = 0; i < response.leagues.length; i++) {
        var league = {
            id : response.leagues[i].id,
            name : response.leagues[i].name,
            sport : response.leagues[i].sport,
            logo : response.leagues[i].logo,
            active : response.leagues[i].active,
            sport_name : response.leagues[i].sport_name,
            sort_order : response.leagues[i].sort_order
        };
        // store all active leagues
        Alloy.Globals.LEAGUES.push(league);
    }
    for (var i = 0; response.languages.length > i; i++) {
        var language = {
            id : response.languages[i].id,
            name : response.languages[i].name,
            imageLocation : response.languages[i].imageLocation,
            description : response.languages[i].description
        };
        Alloy.Globals.AVAILABLELANGUAGES.push(language);
    }
}

function getChallengesAndStart() {
    // Get challenges
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onerror = function(e) {
        Ti.API.error('Bad Sever =>' + e.error);
        indicator.closeIndicator();
        addEvent();
        isSubmitting = false;
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
    };

    try {
        xhr.open('GET', Alloy.Globals.BETKAMPENCHALLENGESURL + '/?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
        xhr.setTimeout(Alloy.Globals.TIMEOUT);
        Ti.API.log(Alloy.Globals.BETKAMPEN.token);

        xhr.send();
    } catch(e) {
        Ti.API.error('Bad Sever =>' + e.error);
        indicator.closeIndicator();
        addEvent();
        isSubmitting = false;
        setButtonOpacity(1);
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
    }
    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {
                var response = null;

                try {
                    response = JSON.parse(this.responseText);
                } catch(e) {
                    indicator.closeIndicator();
                    addEvent();
                    setButtonOpacity(1);
                    isSubmitting = false;
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                }

                // construct array with objects
                Alloy.Globals.CHALLENGEOBJECTARRAY = Alloy.Globals.constructChallenge(response);

                // login success
                var args = {
                    dialog : indicator
                };

                if (user_team.data.length > 0) {
                    var loginSuccessWindow = Alloy.createController('landingPage', args).getView();
                    Alloy.Globals.CURRENTVIEW = loginSuccessWindow;
                    if (OS_IOS) {
                        loginSuccessWindow.open({
                            fullScreen : true
                        });

                        loginSuccessWindow = null;

                    } else if (OS_ANDROID) {
                        loginSuccessWindow.open({
                            fullScreen : true,
                            exitOnClose : false,
                            orientationModes : [Titanium.UI.PORTRAIT]
                        });
                        loginSuccessWindow = null;
                    }

                    addEvent();
                    $.login.close();

                    if (Alloy.Globals.INDEXWIN !== null) {
                        Alloy.Globals.INDEXWIN.close();
                    }

                } else {
                    var loginSuccessWindow = Alloy.createController('pickTeam', args).getView();
                    Alloy.Globals.CURRENTVIEW = loginSuccessWindow;
                    if (OS_IOS) {
                        loginSuccessWindow.open({
                            fullScreen : true
                        });
                        loginSuccessWindow = null;

                    } else if (OS_ANDROID) {
                        loginSuccessWindow.open({
                            fullScreen : true,
                            orientationModes : [Titanium.UI.PORTRAIT]
                        });
                        loginSuccessWindow = null;
                    }

                    addEvent();
                    $.login.close();

                    if (Alloy.Globals.INDEXWIN !== null) {
                        Alloy.Globals.INDEXWIN.close();
                    }

                }
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                indicator.closeIndicator();
                addEvent();
                setButtonOpacity(1);
                isSubmitting = false;
            }
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            indicator.closeIndicator();
            addEvent();
            isSubmitting = false;
            setButtonOpacity(1);
            Ti.API.error("Error =>" + this.response);
        }
    };
}

function doError() {
    indicator.closeIndicator();
    addEvent();
    isSubmitting = false;
    setButtonOpacity(1);

    var alertWindow = Titanium.UI.createAlertDialog({
        title : Alloy.Globals.PHRASES.commonErrorTxt,
        message : Alloy.Globals.PHRASES.facebookConnectionErrorTxt + ' ' + Alloy.Globals.PHRASES.retryTxt,
        buttonNames : [Alloy.Globals.PHRASES.retryBtnTxt, Alloy.Globals.PHRASES.closeBtnTxt]
    });

    alertWindow.addEventListener('click', function(e) {
        switch (e.index) {
        case 0:
            alertWindow.hide();
            indicator.openIndicator();
            loginAuthenticated(fb);
            break;
        case 1:
            alertWindow.hide();

            /*
             if (OS_ANDROID) {
             var activity = Titanium.Android.currentActivity;
             activity.finish();
             $.login.close();
             }
             */
            break;
        }
    });
    alertWindow.show();
}

function loginAuthenticated(fb) {
    // Get betkampenID with valid facebook token
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onerror = function(e) {
        Ti.API.error('Bad Sever =>' + e.error);
        indicator.closeIndicator();
        addEvent();
        isSubmitting = false;
        setButtonOpacity(1);
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
    };

    try {
        xhr.open('POST', Alloy.Globals.BETKAMPENLOGINURL);
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setTimeout(Alloy.Globals.TIMEOUT);
        var param = '{"access_token" : "' + fb.accessToken + '", "lang":"' + Alloy.Globals.LOCALE + '"}';
        xhr.send(param);
    } catch(e) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.internetMayBeOffErrorTxt);
        indicator.closeIndicator();
        addEvent();
        isSubmitting = false;
        setButtonOpacity(1);
    }

    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {
                var response = null;

                try {
                    response = JSON.parse(this.responseText);
                } catch(e) {
                    indicator.closeIndicator();
                    addEvent();
                }

                if (response !== null) {
                    createLeagueAndUidObj(response);

                    if (Alloy.Globals.BETKAMPENUID > 0) {
                        getChallengesAndStart();
                    }
                } else {
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                    indicator.closeIndicator();
                    addEvent();
                }

            }
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("Error =>" + this.response);
            indicator.closeIndicator();
            addEvent();
            isSubmitting = false;
            setButtonOpacity(1);
        }
    };
}

function login() {
    if(isSubmitting) {
        return;
    }
    
    // check login
    if (Alloy.Globals.checkConnection()) {
        isSubmitting = true;
        setButtonOpacity(0);
        
        if (!args.reauth) {
            fb.authorize();
        } else {
            removeEvent();
            indicator.openIndicator();

            if (!fb.loggedIn) {
                fb.authorize();
            } else {
                loginAuthenticated(fb);
            }
        }

    } else {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        //removeEvent();
        //addEvent();
    }
}

/* Initial */
var args = arguments[0] || {};
var user_team;
var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

var isSubmitting = false;
var downloadView = null;
var isDownloading = false;
/* Main Flow */
$.loginBtn.setBackgroundColor(Alloy.Globals.themeColor());
$.registerBtn.setBackgroundColor(Alloy.Globals.themeColor());
addTutorialImages();

// add facebook icon to the "login with facebook button"
var fontawesome = require('lib/IconicFont').IconicFont({
    font : 'lib/FontAwesome'
});

var font = 'FontAwesome';

if (OS_ANDROID) {
    font = 'fontawesome-webfont';
}

$.facebookBtn.add(Ti.UI.createLabel({
    font : {
        fontFamily : font
    },
    text : fontawesome.icon('fa-facebook'),
    left : '10%',
    color : '#FFF',
    fontSize : 40
}));

var fb; 

// app id and permission's
//fb.appid = Ti.App.Properties.getString('ti.facebook.appid');

if (OS_IOS) {
    $.login.hideNavBar();
    fb = require('com.facebook');
    fb.permissions = ['email', 'public_profile'];
} else {
    fb = require('facebook');
    fb.appid = "1403709019858016";
    fb.permissions = ['email', 'public_profile'];
}
fb.forceDialogAuth = false;
Alloy.Globals.connect = true;

if (Alloy.Globals.FBERROR) {
    Ti.API.log("Försöker iaf 1..." + fb.loggedIn);
    // Kommer inte in i appen med
    // funkar inte heller -> exitOnClose="false"

    // need to keep track if event was already added, since it is beeing added several times otherwise.
    fb.addEventListener('login', function(e) {
        isSubmitting = true;
        setButtonOpacity(0);
        Ti.API.log("Försöker iaf 11...");

        if (Alloy.Globals.connect == true) {
            indicator.openIndicator();
        }
        Alloy.Globals.FBERROR = false;
        if (Alloy.Globals.connect == true) {
            if (e.success) {

                // set tokens
                Alloy.Globals.FACEBOOK = fb;
                Alloy.Globals.BETKAMPEN = {
                    token : fb.accessToken
                };

                Alloy.Globals.FACEBOOKOBJECT = Alloy.createModel('facebook', {
                    id : e.data.id,
                    locale : e.data.locale,
                    username : e.data.name,
                    fullName : e.data.name,
                    firstName : e.data.first_name,
                    lastName : e.data.last_name,
                    email : e.data.email
                });

                removeEvent();
                setTimeout(function() {
                    loginAuthenticated(fb);
                }, 300);
            } else if (e.error) {
                isSubmitting = false;
                setButtonOpacity(1);
                
                if (e.error.indexOf('OTHER:') !== 0){
                    Alloy.Globals.showFeedbackDialog(e.error); 
                } else {
                   Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.facebookAbortConnectionTxt); 
                }
                
                //addEvent();
                indicator.closeIndicator();
            } else if (e.cancelled) {
                isSubmitting = false;
                setButtonOpacity(1);
                indicator.closeIndicator();
                //addEvent();
            }
        }
    });
}

addEvent();

// Har satt Alloy.Globals.FBERROR till false för att inte öppna flera gånger, sätta till true vid error??
// set correct language phrase
$.facebookBtnText.text = Alloy.Globals.PHRASES.loginFacebookButtonTxt;

// try to get Betkampen token
Alloy.Globals.readToken();

// check login
if (Alloy.Globals.checkConnection()) {
    if (fb.loggedIn) {
        isSubmitting = true;
        setButtonOpacity(0);
        removeEvent();
        if (OS_ANDROID) {
            $.login.addEventListener('open', function() {
                indicator.openIndicator();
            });
            setTimeout(function() {
                loginAuthenticated(fb);
                // fb.authorize(); TODO Issue with fb module?
            }, 300);
        } else if (OS_IOS) {
            if (!args.reauth) {
                setTimeout(function() {
                    indicator.openIndicator();
                    fb.authorize();
                    //loginAuthenticated(fb); //TODO Issue with fb module?
                }, 300);
            } else {
                addEvent();
            }

        }
    } else if (Alloy.Globals.BETKAMPEN) {
        setButtonOpacity(0);      
        isSubmitting = true;
        // Betkampen auto sign in
        indicator.openIndicator();
        loginBetkampenAuthenticated();
    }
} else {
    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
}

/* Only used for Betkampen token sign in! */
var refreshTry = 0;

function loginBetkampenAuthenticated() {
    // Get betkampenID with valid token
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onerror = function(e) {
        Ti.API.error('Bad Sever =>' + JSON.stringify(e));
        if (e.code == 401) {
            // if this is first try, then try refresh token
            if (refreshTry === 0) {
                refreshTry = 1;
                authWithRefreshToken();
            }
        } else {
            isSubmitting = false;
            setButtonOpacity(1);
            indicator.closeIndicator();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        }
    };

    try {
        xhr.open('POST', Alloy.Globals.BETKAMPENLOGINURL);
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setTimeout(Alloy.Globals.TIMEOUT);
        var param = '{"access_token" : "' + Alloy.Globals.BETKAMPEN.token + '", "lang":"' + Alloy.Globals.LOCALE + '"}';
        xhr.send(param);
    } catch(e) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.internetMayBeOffErrorTxt);
        indicator.closeIndicator();
        isSubmitting = false;
        setButtonOpacity(1);
    }

    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {
                var response = null;
                try {
                    response = JSON.parse(this.responseText);
                } catch(e) {
                    indicator.closeIndicator();
                    setButtonOpacity(1);
                    isSubmitting = false;
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                }

                if (response !== null) {
                    createLeagueAndUidObj(response);

                    if (Alloy.Globals.BETKAMPENUID > 0) {
                        getChallengesAndStart();
                    }
                } else {
                    indicator.closeIndicator();
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.loginCredentialsError);
                }
            }
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("Error =>" + this.response);
            indicator.closeIndicator();
            isSubmitting = false;
            setButtonOpacity(1);
        }
    };
}

function downloadTutorial() {
    var platform = "";
    if (Alloy.Globals.checkConnection()) {
        isDownloading = true;
        
        if (OS_IOS) {
            platform = "iphone";
        } else if (OS_ANDROID) {
            platform = "android";
        }
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            Ti.API.error('Bad Sever =>' + JSON.stringify(e));
            indicator.closeIndicator();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            isDownloading = false;
        };

        try {
            xhr.open('POST', Alloy.Globals.BETKAMPENGETTUTORIALURL + "?lang=" + Alloy.Globals.LOCALE + '&platform=' + platform);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setTimeout(Alloy.Globals.TIMEOUT);
            xhr.send();
        } catch(e) {
            indicator.closeIndicator();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            isDownloading = false;
        }

        xhr.onload = function() {
            if (this.status == '200') {
                if (this.readyState == 4) {
                    var response = JSON.parse(this.responseText);
                    var imageLocationArray = [];
                    var doneCount = 0;

                    indicator.setText("Downloading tutorial...");
                    indicator.openIndicator();

                    // download each file
                    for (var img in response) {
                        var inline_function = function(img) {
                            var imageDownloader = Titanium.Network.createHTTPClient();
                            imageDownloader.setTimeout(Alloy.Globals.TIMEOUT);

                            imageDownloader.onload = function(e) {
                                var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'tut_' + response[img] + '.png');
                                f.write(this.responseData);
                                imageLocationArray.push({path: f.nativePath, name : img});
                                doneCount++;

                                if (doneCount == response.length) {
                                    // store the array on phone
                                    Ti.App.Properties.setString("tutorial_images", JSON.stringify(imageLocationArray));
                                    indicator.closeIndicator();
                                    indicator.setText(Alloy.Globals.PHRASES.loadingTxt);
                                    isDownloading = false;
                                    addTutorialImages();
                                }
                            };

                            imageDownloader.open("GET", Alloy.Globals.BETKAMPENURL + '/tutorial/' + platform + '/' + Alloy.Globals.LOCALE + '/tut_' + response[img] + '.png');
                            imageDownloader.send();
                        };
                        inline_function(img);
                    }
                }
            }
        };
    } else {
        indicator.closeIndicator();
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
    }

}

// function to sort array, base on "name"
function compare(a, b) {
    a.name = (a.name - 0);
    b.name = (b.name - 0);

    if (a.name < b.name)
        return -1;
    if (a.name > b.name)
        return 1;
    return 0;
}

function addTutorialImages() {
    var addView = false;
    if (downloadView === null) {
        addView = true;
        downloadView = Ti.UI.createView({
            height : Ti.UI.FILL,
            width : Ti.UI.FILL,
            backgroundImage: '/images/Default-Portrait.png',
            id : 'remove'
        });

        var downloadButton = Alloy.Globals.createButtonView(Alloy.Globals.themeColor(), '#FFF', Alloy.Globals.PHRASES.downloadTutorial);
        downloadButton.setTop('75%');
        downloadButton.setHeight('9%');
        downloadButton.setWidth('80%');
        downloadButton.setBorderRadius(3);
        downloadButton.children[0].font.fontSize = 16;

        downloadButton.addEventListener('click', function() {
            if(isDownloading) {
                return;
            }
            
            // display welcome dialog
            var alertWindow = Titanium.UI.createAlertDialog({
                title : Alloy.Globals.PHRASES.betbattleTxt,
                message : Alloy.Globals.PHRASES.getTutorialTxt,
                buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.abortBtnTxt]
            });

            alertWindow.addEventListener('click', function(ev) {
                switch(ev.index) {
                case 0:
                    downloadTutorial();
                    break;
                case 1:
                    alertWindow.hide();
                }
            });
            alertWindow.show();

        });

        downloadView.add(downloadButton);
    }

    // get all available images
    var images = JSON.parse(Ti.App.Properties.getString('tutorial_images'));

    if (images !== null && images.length > 0) {  
             
        images = images.sort(compare);
              
        for (var img in images) {
            var view = Ti.UI.createView({
                height : Ti.UI.FILL,
                width : Ti.UI.FILL,
            });

            var imageView;

            if (OS_IOS) {
                imageView = Ti.UI.createImageView({
                    image : images[img].path,
                    top : '5%',
                    height : '95%',
                    width : Ti.UI.FILL
                });
            } else {
                imageView = Ti.UI.createImageView({
                    image : images[img].path,
                    height : Ti.UI.FILL,
                    width : Ti.UI.FILL
                });
            }

            view.add(imageView);
            $.scrollableView.addView(view);
            downloadView = null;
        }
    } else {
        if(addView) {
           $.scrollableView.addView(downloadView);
        }
    }
}

// Try to authenticate using refresh token
function authWithRefreshToken() {
    if (Alloy.Globals.checkConnection()) {
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            Ti.API.error('Bad Sever reAuth =>' + JSON.stringify(e));
            indicator.closeIndicator();
            refreshTry = 0;
            isSubmitting = false;
            setButtonOpacity(1);
            // reAuth failed. Need to login again. 400 = invalid token
            Alloy.Globals.BETKAMPEN = null;
            if (e.code != 400) {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            }
        };
        try {
            xhr.open('POST', Alloy.Globals.BETKAMPENEMAILLOGIN);
            xhr.setTimeout(Alloy.Globals.TIMEOUT);

            var params = {
                grant_type : 'refresh_token',
                refresh_token : Alloy.Globals.BETKAMPEN.refresh_token,
                client_id : 'betkampen_mobile',
                client_secret : 'not_so_s3cr3t'
            };
            xhr.send(params);
        } catch(e) {
            indicator.closeIndicator();
            refreshTry = 0;
            isSubmitting = false;
            setButtonOpacity(1);
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        }
        xhr.onload = function() {
            if (this.status == '200') {
                if (this.readyState == 4) {
                    var response = '';
                    try {
                        response = JSON.parse(this.responseText);
                    } catch(e) {

                    }

                    Alloy.Globals.BETKAMPEN = {
                        token : "TOKEN " + response.access_token,
                        valid : response.expires_in,
                        refresh_token : Alloy.Globals.BETKAMPEN.refresh_token // since we don't get a new one here
                    };
                    Alloy.Globals.storeToken();
                    // brand new token, try to authenticate
                    loginBetkampenAuthenticated();
                }
            } else {
                Ti.API.error("Error =>" + this.response);
                indicator.closeIndicator();
                refreshTry = 0;
                isSubmitting = false;
                setButtonOpacity(1);
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            }
        };
    } else {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }
}

$.scrollableView.addEventListener('scroll', function(e) {
    if(downloadView === null) {
        for(var sV in $.scrollableView.views) {
            if($.scrollableView.views[sV].id === 'remove') {
                $.scrollableView.removeView($.scrollableView.views[sV]);
                break;
            }
        }
    }
});

$.login.addEventListener('close', function() {
    indicator.closeIndicator();

    $.scrollableView.removeAllChildren();

    for (child in $.scrollableView.children) {
        $.scrollableView[child] = null;
    }

    children = null;
    $.scrollableView = null;

    $.destroy();
});

if (OS_ANDROID) {
    $.login.addEventListener('open', function() {
        $.login.activity.actionBar.hide();
    });

    $.login.addEventListener('android:back', function() {
        $.login.close();
        var activity = Titanium.Android.currentActivity;
        activity.finish();
    });
}

//----------------- email login
if (OS_IOS) {
    Alloy.Globals.NAV = $.nav;
}

// opening login view
$.loginBtn.addEventListener('click', function(e) {
    if(isSubmitting) {
        return;
    }

    var loginWindow = Alloy.createController('loginView').getView();
    if (OS_IOS) {
        $.nav.openWindow(loginWindow);
    } else {
        loginWindow.open();
    }
    //$.login.close();
    Alloy.Globals.WINDOWS.push($.login);
});

//open registration view
$.registerBtn.addEventListener('click', function(e) {
    if(isSubmitting) {
        return;
    }

    var regWindow = Alloy.createController('registrationView').getView();
    if (OS_IOS) {
        $.nav.openWindow(regWindow);
    } else {
        regWindow.open();
    }
    //$.login.close();
    Alloy.Globals.WINDOWS.push($.login);
});

$.registerBtnText.text = Alloy.Globals.PHRASES.registerTxt;
$.loginBtnText.text = Alloy.Globals.PHRASES.signInTxt;
