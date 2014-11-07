var args = arguments[0] || {};
var beaconIsOpen = false;
var appResume = args.resume;
var isAndroid = false;

var uie = require('lib/IndicatorWindow');

var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

$.landingPageWin.setOpacity(0);

if (OS_ANDROID) {
    isAndroid = true;
}


function showFbLogin() {
    Alloy.Globals.CURRENTVIEW = null;
    Alloy.Globals.NAV.close();
    Ti.App.Properties.removeProperty("BETKAMPEN");
    Alloy.Globals.BETKAMPEN = null;
    Alloy.Globals.FACEBOOKOBJECT = null;
    var login = Alloy.createController('login', {
        reauth : true
    }).getView();
    login.open({
        modal : false
    });
    login = null;
}

function createLeagueAndUidObj(response) {
    Alloy.Globals.BETKAMPENUID = response.betkampen_uid;
    Alloy.Globals.PROFILENAME = response.profile_name;
    Alloy.Globals.LEAGUES = [];
    Alloy.Globals.AVAILABLELANGUAGES = [];
    Alloy.Globals.VERSIONS = response.versions;

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

    // check if language or tutorial has been changed, if it has download the new version
    Alloy.Globals.checkVersions(indicator);
}

/* Only used for Betkampen token sign in! */
var refreshTry = 0;

function loginBetkampenAuthenticated(status) {
    // Get betkampenID with valid token
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onerror = function(e) {
        Ti.API.error('Bad Sever =>' + JSON.stringify(e));
        if (e.code == 401) {
            if (status === 1) {
                // if this is first try, then try refresh token
                if (refreshTry === 0) {
                    refreshTry = 1;
                    authWithRefreshToken();
                }
            } else if (status === 2) {
                // Facebook failed to reAuth, present login screen
                showFbLogin();
            }
        } else {
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
    }

    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {
                var response = null;
                try {
                    response = JSON.parse(this.responseText);
                } catch(e) {
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                }

                if (response !== null) {
                    createLeagueAndUidObj(response);
                    if (Alloy.Globals.BETKAMPENUID > 0) {
                        Ti.API.log("Running refresh...");
                        Ti.App.fireEvent('challengesViewRefresh');
                    }
                }
            }
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("Error =>" + this.response);
            Ti.API.log("4");
        }
    };
}

// Try to authenticate using refresh token
function authWithRefreshToken() {
    if (Alloy.Globals.checkConnection()) {
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            Ti.API.error('Bad Sever reAuth =>' + JSON.stringify(e));
            refreshTry = 0;
            // reAuth failed. Need to login again. 400 = invalid token
            Ti.App.Properties.removeProperty("BETKAMPEN");
            Alloy.Globals.BETKAMPEN = null;
            Alloy.Globals.CLOSE = false;
            Alloy.Globals.CURRENTVIEW = null;
            Alloy.Globals.NAV.close();
            var login = Alloy.createController('login').getView();
            login.open({
                modal : false
            });
            login = null;

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
            refreshTry = 0;
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
                    loginBetkampenAuthenticated(1);
                } else {
                    Ti.API.log(this.response);
                }
            } else {
                Ti.API.error("Error =>" + this.response);
                refreshTry = 0;
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            }
        };
    } else {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }
}

Ti.App.addEventListener('pause', function(e) {
    Ti.API.info("APP In background");
    Alloy.Globals.appStatus = 'background';
});

// resume listener for ios and android
if (!isAndroid) {
    if (Alloy.Globals.OPEN && Alloy.Globals.RESUME) {
        Alloy.Globals.RESUME = false;
        Ti.App.addEventListener('resume', function() {
            Ti.API.log(" KöR resume... ");

            if (Alloy.Globals.CURRENTVIEW !== null) {
                // check connection
                Alloy.Globals.appStatus = 'foreground';
                if (Alloy.Globals.checkConnection()) {
                    if (Alloy.Globals.FACEBOOKOBJECT) {
                        var fb = Alloy.Globals.FACEBOOK;
                        if (fb) {
                            if (fb.loggedIn) {
                                loginBetkampenAuthenticated(2);
                                // TODO Test, run methods, need to authorize??  Testa /me och se om de svara 401 etc. då visa login...
                            } else {
                                // not logged in, show Betkampen login view
                                showFbLogin();
                            }
                        }
                    } else {
                        // Betkampen check and if needed refresh token
                        Ti.API.log("resume...");
                        Alloy.Globals.readToken();
                        loginBetkampenAuthenticated(1);
                    }
                    Ti.UI.iPhone.setAppBadge(0);
                } else {
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionError);
                    // TODO add retry?
                }
            }
        });
    }
} else if (isAndroid) {
    var bc = Ti.Android.createBroadcastReceiver({
        onReceived : function() {
            //Ti.App.fireEvent('challengesViewRefresh');

            if (Alloy.Globals.checkConnection()) {
                Alloy.Globals.appStatus = 'foreground';

                if (Alloy.Globals.FACEBOOKOBJECT) {
                    var fb = Alloy.Globals.FACEBOOK;
                    //        Alloy.Globals.BETKAMPEN.token = Alloy.Globals.BETKAMPEN.token + 'aa';  // TODO
                    if (fb) {
                        if (fb.loggedIn) {
                            loginBetkampenAuthenticated(2);
                            // TODO Test, run methods, need to authorize??  Testa /me och se om de svara 401 etc. då visa login...
                        } else {
                            // not logged in, show Betkampen login view
                            showFbLogin();
                        }
                    }
                } else {
                    // Betkampen check and if needed refresh token
                    Ti.API.log("resume...");
                    Alloy.Globals.readToken();
                    loginBetkampenAuthenticated(1);
                }
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionError);
            }
        }
    });

    Ti.Android.registerBroadcastReceiver(bc, [Ti.Android.ACTION_SCREEN_OFF]);
}

var deviceToken;

if (!isAndroid) {
    // Check if the device is running iOS 8 or later, before registering for local notifications
    //Ti.Platform.name == "iPhone OS" &&
    if (parseInt(Ti.Platform.version.split(".")[0]) >= 8) {
        Ti.App.iOS.registerUserNotificationSettings({
            types : [Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT, Ti.App.iOS.UESR_NOTIFICATION_TYPE_BADGE]
        });
    }

    if (appResume != 0)
        $.landingPageWin.addEventListener('open', function() {
            var apns = require('lib/push_notifications_apns');
            apns.apns();
        });

} else {
    function doPush(type) {
        if (Alloy.Globals.MAINWIN !== null) {
            var obj = {
                controller : 'challengesView',
                arg : {
                    refresh : true
                }
            };

            var args = {
                refresh : true
            };
            var win = null;

            if (type === 'accept') {
                win = Alloy.createController('challenges_new', args).getView();
            } else if (type === 'pending') {
                win = Alloy.createController('challenges_pending', args).getView();
            } else if (type === 'finished') {
                win = Alloy.createController('challenges_finished', args).getView();
            }

            //Ti.App.fireEvent('app:updateView', obj);

            for (var w in Alloy.Globals.WINDOWS) {
                if (Alloy.Globals.WINDOWS[w] === win) {
                    Alloy.Globals.WINDOWS[w].close();
                }
            }

            Alloy.Globals.WINDOWS.push(win);

            if (win !== null) {
                win.open();
                //win = null;
            }
        } else {
            var winMain = Alloy.createController('main').getView();
            winMain.open({
                fullScreen : true
            });
            winMain = null;

            var win = null;

            if (type === 'accept') {
                win = Alloy.createController('challenges_new').getView();
            } else if (type === 'pending') {
                win = Alloy.createController('challenges_pending').getView();
            } else if (type === 'finished') {
                win = Alloy.createController('challenges_finished').getView();
            }

            if (win !== null) {
                win.open();
                //win = null;
            }

            Alloy.Globals.WINDOWS.push(win);
        }
    }

    var gcm = require('net.iamyellow.gcmjs');
    var pendingData = gcm.data;
    if (pendingData && pendingData !== null) {
        // if we're here is because user has clicked on the notification
        // and we set extras for the intent
        // and the app WAS NOT running
        // (don't worry, we'll see more of this later)
        Ti.API.info('******* data (started) ' + JSON.stringify(pendingData));
    }

    gcm.registerForPushNotifications({
        success : function(ev) {
            // on successful registration
            // post to our server
            Alloy.Globals.postDeviceToken(ev.deviceToken);
            Ti.API.info('******* success, ' + ev.deviceToken);
        },
        error : function(ev) {
            // when an error occurs
            Ti.API.info('******* error, ' + ev.error);
        },
        callback : function(e) {
            // when a gcm notification is received WHEN the app IS IN FOREGROUND
            var type = '';

            if (e.message.charAt(0) === '1') {
                e.message = e.message.substring(1);
                type = 'accept';
            } else if (e.message.charAt(0) === '2') {
                e.message = e.message.substring(1);
                type = 'pedning';
            } else if (e.message.charAt(0) === '3') {
                e.message = e.message.substring(1);
                type = 'finished';
            }
            try {
                var alertWindow = Titanium.UI.createAlertDialog({
                    title : e.title,
                    message : e.message,
                    buttonNames : ['OK']
                });

                alertWindow.addEventListener('click', function(e) {
                    doPush(type);
                    alertWindow.hide();
                });
                alertWindow.show();
            } catch(e) {
                // something went wrong
            }
        },
        unregister : function(ev) {
            // on unregister
            Ti.API.info('******* unregister, ' + ev.deviceToken);
        },
        data : function(data) {
            // if we're here is because user has clicked on the notification
            // and we set extras in the intent
            // and the app WAS RUNNING (=> RESUMED)
            // (again don't worry, we'll see more of this later)
            var type = '';

            if (data.message.charAt(0) === '1') {
                data.message = data.message.substring(1);
                type = 'accept';
            } else if (data.message.charAt(0) === '2') {
                data.message = data.message.substring(1);
                type = 'pedning';
            } else if (data.message.charAt(0) === '3') {
                data.message = data.message.substring(1);
                type = 'finished';
            }

            try {
                var alertWindow = Titanium.UI.createAlertDialog({
                    title : data.title,
                    message : data.message,
                    buttonNames : ['OK']
                });

                alertWindow.addEventListener('click', function(e) {
                    alertWindow.hide();
                    doPush(type);
                });
                alertWindow.show();
            } catch(e) {
                // something went wrong
            }
        }
    });
    // in order to unregister:
    // require('net.iamyellow.gcmjs').unregister();
}


// General App
if (Alloy.Globals.checkConnection()) {
    indicator.openIndicator();
    args.dialog = indicator;

    var loginSuccessWindow = Alloy.createController('main', args).getView();
    if (!isAndroid) {
        loginSuccessWindow.open({
            fullScreen : true,
        });
    } else {
        loginSuccessWindow.open({
            fullScreen : true,
            navBarHidden : false,
            orientationModes : [Titanium.UI.PORTRAIT]
        });
    }
    loginSuccessWindow = null;
    $.landingPageWin.close();
}

