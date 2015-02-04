var args = arguments[0] || {};
var beaconIsOpen = false;
var appResume = args.resume;
var isAndroid = false;

var uie = require('lib/IndicatorWindow');

var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

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
}

/* Only used for Betkampen token sign in! */
var refreshTry = 0;

function loginBetkampenAuthenticated(status) {
    // Get betkampenID with valid token
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onerror = function(e) {
        Ti.API.error('Bad Sever Login=> ' + Alloy.Globals.BETKAMPEN.token + " " + JSON.stringify(e));
        if (e.code == 401 || e.source.status == 401 || JSON.stringify(e) === "Unauthorized") {
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

// resume and pause listener for ios and android
if (!isAndroid) {
    Alloy.Globals.iosPauseEvent = function(e) {
        Ti.API.info("APP In background");
        Alloy.Globals.appStatus = 'background';
    };

    Ti.App.addEventListener('pause', Alloy.Globals.iosPauseEvent);

    Alloy.Globals.iosResumeEvent = function() {
        Ti.API.log(" KöR resume... ");

        // if (Alloy.Globals.CURRENTVIEW !== null) {
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
        //}
    };

    Ti.App.addEventListener('resume', Alloy.Globals.iosResumeEvent);
    //  }
} else if (isAndroid) {
    // when the app is resumed
    Alloy.Globals.androidResumeEvent = function() {
        Ti.API.log("resume");
        //Ti.App.fireEvent('challengesViewRefresh');

        if (Alloy.Globals.checkConnection()) {
            Alloy.Globals.appStatus = 'foreground';

            if (Alloy.Globals.FACEBOOKOBJECT) {
                $.landingPageWin.fbProxy = Alloy.Globals.FACEBOOK.createActivityWorker({
                    lifecycleContainer : $.landingPageWin
                });
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
    };

    Ti.App.addEventListener('resumed', Alloy.Globals.androidResumeEvent);

    // when the app is paused
    Alloy.Globals.androidPauseEvent = function() {
        Ti.API.log("pause");
    };

    Ti.App.addEventListener('paused', Alloy.Globals.androidPauseEvent);
}

var deviceToken;

if (!isAndroid) {
    // Check if the device is running iOS 8 or later, before registering for local notifications
    if (parseInt(Ti.Platform.version.split(".")[0]) >= 8) {
        Ti.App.iOS.registerUserNotificationSettings({
            types : [Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT, Ti.App.iOS.UESR_NOTIFICATION_TYPE_BADGE]
        });
    }

    if (appResume != 0) {
        var apns = require('lib/push_notifications_apns');
        apns.apns();
    }
} else {
    function doPush(type, push_data) {        
        if (typeof Alloy.Globals.MAINWIN !== 'undefined' && Alloy.Globals.MAINWIN !== null) {
            
            Ti.API.log("Resume should land here...");
            
            var obj = {
                controller : 'challengesView',
                arg : {
                    refresh : true
                }
            };

            if (push_data.extra_data !== null && typeof push_data.extra_data !== 'undefined' && push_data.extra_data !== "") {
                try {
                    push_data.extra_data = JSON.parse(push_data.extra_data);
                } catch(e) {
                    type = 'message';
                }
            }

            var args = {
                refresh : true
            };
            var win = null;

            if (type === 'accept') {
                args = {
                    answer : 1,
                    group : push_data.extra_data.group,
                    bet_amount : push_data.extra_data.bet_amount,
                    push_cid : push_data.extra_data.cid
                };

                win = Alloy.createController('challenge', args).getView();
            } else if (type === 'pending') {
                args = {
                    cid : push_data.extra_data.cid
                };
                win = Alloy.createController('showChallenge', args).getView();
            } else if (type === 'finished') {
                win = Alloy.createController('challenges_finished').getView();            
            } else if (type === 'achievement') {
                var player = Ti.Media.createSound({
                    url : "/sound/unlocked.wav"
                });

                var indWin = Ti.UI.createWindow({
                    backgroundColor : 'transparent',
                    navBarHidden : true
                });

                indWin.addEventListener('open', function() {
                    indWin.activity.actionBar.hide();
                });

                //  view
                var indView = Titanium.UI.createView({
                    top : '85%',
                    height : 80,
                    width : '100%',
                    backgroundColor : '#FFF',
                    opacity : 0.9,
                    layout : 'horizontal'
                });

                indWin.add(indView);

                var image = Ti.UI.createImageView({
                    image : Alloy.Globals.BETKAMPENURL + '/achievements/' + push_data.extra_data.image,
                    width : "15%",
                    height : Ti.UI.SIZE,
                    left : 0,
                    top : 10
                });
                var mess = Titanium.UI.createLabel({
                    text : push_data.message,
                    right : 0,
                    color : '#000',
                    width : '75%',
                    top : 25,
                    height : 'auto',
                    textAlign : 'center',
                    font : Alloy.Globals.getFontCustom(12, 'Bold'),
                });
                indView.add(image);
                indView.add(mess);
                indWin.open();

                player.play();

                var interval = interval ? interval : 2500;
                setTimeout(function() {
                    indWin.close({
                        opacity : 0,
                        duration : 2000
                    });
                    player.stop();
                    player.release();
                }, interval);
            } else if (type === 'message') {
                // nothing right now
            }

            if (win !== null) {
                win.open();
            }

            if (Alloy.Globals.WINDOWS.length > 0) {
                for (var w in Alloy.Globals.WINDOWS) {
                    Alloy.Globals.WINDOWS[w].setOpacity(0);
                }

                for (var w in Alloy.Globals.WINDOWS) {
                    if (Alloy.Globals.WINDOWS[w] === win) {
                        Alloy.Globals.WINDOWS[w].close();
                    }
                }
            }

            if (win !== null) {
                Alloy.Globals.WINDOWS.push(win);
            }

            Ti.App.fireEvent('challengesViewRefresh');

        } else {
            
            // TODO

            /*
            Ti.API.log("Resume should not get here...");
            // TODO har inte lyckats komma in hit....
            
            var loginSuccessWindow = Alloy.createController('main').getView();
            loginSuccessWindow.open({
                fullScreen : true
            });
            loginSuccessWindow = null;

            var win = null;

            if (type === 'accept') {
                args = {
                    answer : 1,
                    group : push_data.extra_data.group,
                    bet_amount : push_data.extra_data.bet_amount
                };

              // TODO  Alloy.Globals.CHALLENGEINDEX = push_data.extra_data.cid;
                win = Alloy.createController('challenge', args).getView();

            } else if (type === 'pending') {
                args = {
                    cid : push_data.extra_data.cid
                };
                win = Alloy.createController('showChallenge', args).getView();
            } else if (type === 'finished') {
                win = Alloy.createController('challenges_finished', args).getView();
            } else if (type === 'achievement') {
                var player = Ti.Media.createSound({
                    url : "/sound/unlocked.wav"
                });

                var indWin = Ti.UI.createWindow({
                    backgroundColor : 'transparent',
                    navBarHidden : true
                });

                indWin.addEventListener('open', function() {
                    indWin.activity.actionBar.hide();
                });

                //  view
                var indView = Titanium.UI.createView({
                    top : '85%',
                    height : 80,
                    width : '100%',
                    backgroundColor : '#FFF',
                    opacity : 0.9,
                    layout : 'horizontal'
                });

                indWin.add(indView);

                var image = Ti.UI.createImageView({
               // TODO     image : Alloy.Globals.BETKAMPENURL + '/achievements/' + push_data.extra_data.image,
                    width : "15%",
                    height : Ti.UI.SIZE,
                    left : 0,
                    top : 10
                });
                var mess = Titanium.UI.createLabel({
                  //  text : push_data.message,   // TODO
                    text : "this is a debug",
                    right : 0,
                    color : '#000',
                    width : '75%',
                    top : 25,
                    height : 'auto',
                    textAlign : 'center',
                    font : Alloy.Globals.getFontCustom(12, 'Bold'),
                });
                indView.add(image);
                indView.add(mess);
                indWin.open();

                player.play();

                var interval = interval ? interval : 2500;
                setTimeout(function() {
                    indWin.close({
                        opacity : 0,
                        duration : 2000
                    });
                    player.stop();
                    player.release();

                }, interval);
            } else if (type === 'message') {
                // nothing
            }

            if (win !== null) {
                win.open();
                //win = null;
            }
            
            if (win !== null) {
        //     TODO   Alloy.Globals.WINDOWS.push(win);
            }
            */
        }
    }

    var gcm = require('net.iamyellow.gcmjs');
    var pendingData = gcm.data;
    if (pendingData && pendingData !== null) {
        // if we're here is because user has clicked on the notification
        // and we set extras for the intent
        // and the app WAS NOT running
        // (don't worry, we'll see more of this later)
        
       // Ti.API.log("STATUS -> " + JSON.stringify(Ti.Android.currentActivity));  // TODO kan detta verkligen hjälpa??
       
       // kan kolla Ti.Android.currentActivity.intent ?? border startats med de... 
Ti.API.log(JSON.stringify(Ti.Android.currentActivity.intent));       
       
if(typeof Ti.Android.currentActivity.actionBar !== 'undefined' && typeof Alloy.Globals.PHRASES !== 'undefined') {
    if(Ti.Android.currentActivity.actionBar.title === Alloy.Globals.PHRASES.betbattleTxt) {
        
        

        var type = pendingData.challenge_type;

        if (type === '1') {
            type = 'accept';
        } else if (type === '2') {
            type = 'pending';
        } else if (type === '3') {
            type = 'finished';
        } else if (type === '4') {
            type = 'achievement';
        } else if (type === '0') {
            type = 'message';
        }

        try {
            setTimeout(function() {
                doPush(type, pendingData); 
                Ti.API.log("Resume Push");
            }, 2000);

        } catch(e) {
            // something went wrong
        }
}
  }
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
            var type = e.challenge_type;

            if (type === '1') {
                type = 'accept';
            } else if (type === '2') {
                type = 'pending';
            } else if (type === '3') {
                type = 'finished';
            } else if (type === '4') {
                type = 'achievement';
            } else if (type === '0') {
                type = 'message';
            }

            try {
                var alertWindow = Titanium.UI.createAlertDialog({
                    title : e.title,
                    message : e.message,
                    buttonNames : ['OK']
                });

                alertWindow.addEventListener('click', function(eve) {
                    doPush(type, e);
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

            var type = data.challenge_type;

            if (type === '1') {
                type = 'accept';
            } else if (type === '2') {
                type = 'pending';
            } else if (type === '3') {
                type = 'finished';
            } else if (type === '4') {
                type = 'achievement';
            } else if (type === '0') {
                type = 'message';
            }

            try {
                var alertWindow = Titanium.UI.createAlertDialog({
                    title : data.title,
                    message : data.message,
                    buttonNames : ['OK']
                });

                alertWindow.addEventListener('click', function(e) {
                    alertWindow.hide();
                    doPush(type, data);
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

/*
 // General App
 if (Alloy.Globals.checkConnection()) {
 indicator.openIndicator();
 args.dialog = indicator;

 Ti.API.log(Alloy.Globals.CURRENTVIEW);

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
 // loginSuccessWindow = null;
 }
 */

