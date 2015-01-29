// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};

// Global variables
Alloy.Globals.APPID = "9999SWEDENTEST";
Alloy.Globals.FACEBOOKOBJECT;
Alloy.Globals.BETKAMPEN;
Alloy.Globals.DEVICETOKEN;
Alloy.Globals.FACEBOOK;
Alloy.Globals.CHALLENGEOBJECTARRAY = [];
Alloy.Globals.BETKAMPENUID = 0;
Alloy.Globals.PROFILENAME;
Alloy.Globals.CHALLENGEINDEX;
Alloy.Globals.LEAGUES;
Alloy.Globals.AVAILABLELANGUAGES;
Alloy.Globals.SLIDERZINDEX = 1;
Alloy.Globals.TIMEOUT = 40000;
Alloy.Globals.CURRENTVIEW;
Alloy.Globals.PREVIOUSVIEW;
Alloy.Globals.NAV = null;
Alloy.Globals.MAINVIEW;
Alloy.Globals.MAINWIN = null;
Alloy.Globals.LANDINGWIN = null;
Alloy.Globals.WINDOWS = [];
Alloy.Globals.androidPauseEvent = null;
Alloy.Globals.androidResumeEvent = null;
Alloy.Globals.iosPauseEvent = null;
Alloy.Globals.iosResumeEvent = null;
Alloy.Globals.challengesViewRefreshEvent = null;
Alloy.Globals.userInfoUpdateEvent = null;
Alloy.Globals.OPEN = true;
Alloy.Globals.CLOSE = true;
Alloy.Globals.RESUME = true;
Alloy.Globals.PHRASES = {};
Alloy.Globals.TiBeacon = null;
Alloy.Globals.AcceptedBeacon1 = false;
Alloy.Globals.AcceptedBeacon2 = false;
Alloy.Globals.AcceptedBeacon3 = false;
Alloy.Globals.connect;
Alloy.Globals.VERSIONS;
Alloy.Globals.COUPON = null;
Alloy.Globals.hasCoupon = false;
Alloy.Globals.couponOpen = false;
Alloy.Globals.appStatus = 'foreground';
Alloy.Globals.FONT = getFont();
Alloy.Globals.FONTBOLD = getBoldFont();
Alloy.Globals.deviceHeight = Ti.Platform.displayCaps.platformHeight;
Alloy.Globals.deviceWidth = Ti.Platform.displayCaps.platformWidth;

function getFont() {
    if (OS_ANDROID) {
        return {
            fontSize : 20,
            fontFamily : 'OpenSans-Regular',
            fontWeight : 'Regular'
        };
    } else {
        return {
            fontSize : 18,
            fontFamily : 'OpenSans',
            fontWeight : 'Regular'
        };
    }
}

Alloy.Globals.getFontCustom = function(size, weight) {
    if (OS_ANDROID) {
        return {
            fontSize : (size - 0) + 2,
            fontFamily : 'OpenSans-' + weight,
            fontWeight : weight
        };
    } else if (OS_IOS) {
        if (weight !== 'Regular') {
            return {
                fontSize : size,
                fontFamily : 'OpenSans-' + weight,
                fontWeight : weight
            };
        } else {
            return {
                fontSize : size,
                fontFamily : 'OpenSans',
                fontWeight : weight
            };
        }

    }
};

function getBoldFont() {
    if (OS_ANDROID) {
        return {
            fontSize : 20,
            fontFamily : 'OpenSans-Bold',
            fontWeight : 'Bold'
        };
    } else {
        return {
            fontSize : 18,
            fontFamily : 'OpenSans-Bold',
            fontWeight : 'Bold'
        };
    }
}

/*
//initialize beacons
if (OS_IOS) {
Alloy.Globals.TiBeacon = require('org.beuckman.tibeacons');
} else if (OS_ANDROID) {
Alloy.Globals.TiBeacon = require('miga.tibeacon');
}
*/

// try to get stored language
var lang = JSON.parse(Ti.App.Properties.getString('language'));

if ( typeof lang == 'undefined' || lang == '' || lang == null) {
    Alloy.Globals.LOCALE = Titanium.Locale.getCurrentLanguage().toLowerCase();
} else {
    lang = lang.language;
    Alloy.Globals.LOCALE = lang;
}

// urls. Everything live needs to be done over SSL
Alloy.Globals.INVITEURL = 'https://apps.facebook.com/betkampen';
Alloy.Globals.BETKAMPENURL = 'http://31.216.36.213/betbattle';
//'http://secure.jimdavislabs.se/secure/betkampen_vm';
Alloy.Globals.BETKAMPENLOGINURL = Alloy.Globals.BETKAMPENURL + '/api/login.php';
Alloy.Globals.BETKAMPENCHALLENGESURL = Alloy.Globals.BETKAMPENURL + '/api/challenges_v2.php';
Alloy.Globals.BETKAMPENUSERURL = Alloy.Globals.BETKAMPENURL + '/api/user_stats.php';
Alloy.Globals.BETKAMPENGAMESURL = Alloy.Globals.BETKAMPENURL + '/api/get_challenge_game.php';
Alloy.Globals.BETKAMPENANSWERURL = Alloy.Globals.BETKAMPENURL + '/api/answer_challenge.php';
Alloy.Globals.BETKAMPENGETGAMESURL = Alloy.Globals.BETKAMPENURL + '/api/get_available_games.php';
Alloy.Globals.BETKAMPENGETGAMESFORCHALLENGEURL = Alloy.Globals.BETKAMPENURL + '/api/get_game.php';
Alloy.Globals.BETKAMPENGETGAMESFORTOURNAMENT = Alloy.Globals.BETKAMPENURL + '/api/get_tournament_game.php';
Alloy.Globals.BETKAMPENGETGROUPSURL = Alloy.Globals.BETKAMPENURL + '/api/get_groups.php';
Alloy.Globals.BETKAMPENCHALLENGEDONEURL = Alloy.Globals.BETKAMPENURL + '/api/challenge_done.php';
Alloy.Globals.BETKAMPENDEVICETOKENURL = Alloy.Globals.BETKAMPENURL + '/api/store_device_token.php';
Alloy.Globals.BETKAMPENCOINSURL = Alloy.Globals.BETKAMPENURL + '/api/get_coins.php';
Alloy.Globals.BETKAMPENCHECKCOINSURL = Alloy.Globals.BETKAMPENURL + '/api/check_coins.php';
Alloy.Globals.BETKAMPENCOINSANDROIDURL = Alloy.Globals.BETKAMPENURL + '/api/get_coins_android.php';
Alloy.Globals.BETKAMPENSHAREURL = Alloy.Globals.BETKAMPENURL + '/api/share.php';
Alloy.Globals.GETLANGUAGE = Alloy.Globals.BETKAMPENURL + '/api/get_language.php';
Alloy.Globals.BETKAMPENACHIEVEMENTSURL = Alloy.Globals.BETKAMPENURL + '/api/get_achievements.php';
Alloy.Globals.BETKAMPENEMAILLOGIN = Alloy.Globals.BETKAMPENURL + '/api/token.php';
// get oauth token at login
Alloy.Globals.BETKAMPENEMAILREG = Alloy.Globals.BETKAMPENURL + '/api/email_registration.php';
//Email registration
Alloy.Globals.BETKAMPENGETMOTDINFO = Alloy.Globals.BETKAMPENURL + '/api/get_match_day_info.php';
//matchens mästare
Alloy.Globals.BETKAMPENGETTICKETS = Alloy.Globals.BETKAMPENURL + '/api/get_user_tickets.php';
Alloy.Globals.BETKAMPENSETTINGURL = Alloy.Globals.BETKAMPENURL + '/api/settings.php';
Alloy.Globals.BETKAMPENIMAGEUPLOADURL = Alloy.Globals.BETKAMPENURL + '/api/image_upload.php';
Alloy.Globals.BETKAMPENGETFRIENDSURL = Alloy.Globals.BETKAMPENURL + '/api/get_friends.php';
Alloy.Globals.BETKAMPENGETGETBEACONSURL = Alloy.Globals.BETKAMPENURL + '/api/get_beacons.php';
Alloy.Globals.BETKAMPENGETPROMOTIONURL = Alloy.Globals.BETKAMPENURL + '/api/get_promotion.php';
Alloy.Globals.BETKAMPENCHALLENGESHOWURL = Alloy.Globals.BETKAMPENURL + '/api/show_challenge.php';
Alloy.Globals.BETKAMPENLOGOUTURL = Alloy.Globals.BETKAMPENURL + '/api/logout.php';
Alloy.Globals.BETKAMPENDELTEGROUPURL = Alloy.Globals.BETKAMPENURL + '/api/remove_group.php';
//delete your own group
Alloy.Globals.BETKAMPENREMOVEGROUPMEMBERURL = Alloy.Globals.BETKAMPENURL + '/api/remove_group_member.php';
//leave group or remove group member
Alloy.Globals.BETKAMEPNCHANGEGROUPNAMEURL = Alloy.Globals.BETKAMPENURL + '/api/edit_group_name.php';
// change groupname
Alloy.Globals.BETKAMPENADDGROUPMEMBERSURL = Alloy.Globals.BETKAMPENURL + '/api/add_group_member.php';
//add groupmembers
Alloy.Globals.BETKAMPENGETGROUPMEMBERSURL = Alloy.Globals.BETKAMPENURL + '/api/get_group_members.php';
// get all groupmembers
Alloy.Globals.BETKAMPENDELETEFRIENDURL = Alloy.Globals.BETKAMPENURL + '/api/remove_friend.php';
// delete friends from your friendlist
Alloy.Globals.BETKAMPENCREATEGROUPURL = Alloy.Globals.BETKAMPENURL + '/api/add_group.php';
// create a new group and add you as admin
Alloy.Globals.BETKAMPENFRIENDSEARCHURL = Alloy.Globals.BETKAMPENURL + '/api/get_users_search.php';
// search in db for friends
Alloy.Globals.BETKAMPENADDFRIENDSURL = Alloy.Globals.BETKAMPENURL + '/api/add_friends.php';
// add friends to your friendlist
Alloy.Globals.BETKAMPENSAVECHALLENGEURL = Alloy.Globals.BETKAMPENURL + '/api/save_challenge.php';
Alloy.Globals.BETKAMPENUPDATECHALLENGEURL = Alloy.Globals.BETKAMPENURL + '/api/update_challenge.php';
Alloy.Globals.BETKAMPENGETCOUPONURL = Alloy.Globals.BETKAMPENURL + '/api/get_coupon.php';
Alloy.Globals.BETKAMPENDELETECOUPONGAMEURL = Alloy.Globals.BETKAMPENURL + '/api/delete_coupon_game.php';
Alloy.Globals.BETKAMPENCHALLENGEGROUPURL = Alloy.Globals.BETKAMPENURL + '/api/challenge_group.php';
Alloy.Globals.BETKAMPENCHALLENGEFRIENDSURL = Alloy.Globals.BETKAMPENURL + '/api/challenge_friend.php';
Alloy.Globals.BETKAMPENGAMETOEDITURL = Alloy.Globals.BETKAMPENURL + '/api/get_game_edit.php';
Alloy.Globals.BETKAMPENSAVEEDITURL = Alloy.Globals.BETKAMPENURL + '/api/save_game_edit.php';
Alloy.Globals.BETKAMPENGETTOPLANDINGPAGE = Alloy.Globals.BETKAMPENURL + '/api/get_dynamic_view.php';
Alloy.Globals.BETKAMPENUNLOCKACHIEVEMENTURL = Alloy.Globals.BETKAMPENURL + '/api/unlock_achievement.php';
Alloy.Globals.BETKAMPENPOSTMATCHOTDURL = Alloy.Globals.BETKAMPENURL + '/api/respond_match_day.php';
Alloy.Globals.BETKAMPENGETMATCHOTDSTATUSURL = Alloy.Globals.BETKAMPENURL + '/api/get_match_day_status.php';
Alloy.Globals.BETKAMPENMATCHOTDSHOWURL = Alloy.Globals.BETKAMPENURL + '/api/get_match_day_show.php';
Alloy.Globals.BETKAMPENCHECKRATESTATUS = Alloy.Globals.BETKAMPENURL + '/api/check_rate_status.php';
// check if user has rated app Google play/appstore
Alloy.Globals.BETKAMPENSETRATESTATUS = Alloy.Globals.BETKAMPENURL + '/api/update_rate_status.php';
// update rate status. 0 remind me/1 dont remind me/2 has rated
Alloy.Globals.BETKAMPENADDBONUSCOINS = Alloy.Globals.BETKAMPENURL + '/api/add_bonus_coins.php';
//send amount and uid to add bonus coins
Alloy.Globals.BETKAMPENADDEXPERIENCE = Alloy.Globals.BETKAMPENURL + '/api/add_xp.php';
//send xp_amount and uid to add experience
Alloy.Globals.BETKAMPENGETUSERTEAM = Alloy.Globals.BETKAMPENURL + '/api/get_user_team.php';
// get user team
Alloy.Globals.BETKAMPENGETTEAMS = Alloy.Globals.BETKAMPENURL + '/api/get_teams.php';
// get all teams
Alloy.Globals.BETKAMPENSETUSERTEAM = Alloy.Globals.BETKAMPENURL + '/api/add_user_team.php';
//set user team
Alloy.Globals.BETKAMPENPREVIOUSMATCHDAY = Alloy.Globals.BETKAMPENURL + '/api/get_last_match_day.php';
Alloy.Globals.SCOREBOARDURL = Alloy.Globals.BETKAMPENURL + '/api/get_scoreboard.php';
Alloy.Globals.BETKAMPENGETTUTORIALURL = Alloy.Globals.BETKAMPENURL + '/api/get_tutorial_images.php';
Alloy.Globals.FINISHEDCHALLENGESURL = Alloy.Globals.BETKAMPENURL + '/api/get_finished_challenges.php';

Alloy.Globals.performTimeout = function(func) {
    if (OS_ANDROID) {
        setTimeout(function() { func;
        }, 300);
    } else { func;
    }

};

Alloy.Globals.getLanguage = function(indicator) {
    // check connection
    if (Alloy.Globals.checkConnection()) {
        if (indicator !== null) {
            indicator.openIndicator();
        }

        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            Ti.App.Properties.setString("language_version", JSON.stringify("0"));
            Ti.API.error('Bad Sever =>' + e.error);
            if (indicator !== null) {
                indicator.closeIndicator();
            }
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        };

        try {
            xhr.open('GET', Alloy.Globals.GETLANGUAGE + '?lang=' + Alloy.Globals.LOCALE);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setTimeout(Alloy.Globals.TIMEOUT);

            xhr.send();
        } catch(e) {
            Ti.App.Properties.setString("language_version", JSON.stringify("0"));
            if (indicator !== null) {
                indicator.closeIndicator();
            }
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        }

        xhr.onload = function() {
            if (this.status == '200') {
                if (this.readyState == 4) {
                    // write it to the file system
                    var file1 = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, 'language.json');
                    file1.write(this.responseText);

                    Alloy.Globals.PHRASES = JSON.parse(file1.read().text);

                    // store language version
                    Ti.App.Properties.setString("language_version", JSON.stringify(Alloy.Globals.VERSIONS.language_version));

                    // store language and that we have selected a language
                    Ti.App.Properties.setString("language", JSON.stringify({
                        language : Alloy.Globals.LOCALE
                    }));
                    Ti.App.Properties.setString("languageSelected", JSON.stringify({
                        languageSelected : true
                    }));

                    Alloy.Globals.showAlertWithRestartNote(1);
                }
                if (indicator !== null) {
                    indicator.closeIndicator();
                }
            } else {
                Ti.App.Properties.setString("language_version", JSON.stringify("0"));
                if (indicator !== null) {
                    indicator.closeIndicator();
                }
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                Ti.API.error("Error =>" + this.response);
            }
        };
    } else {
        var alertWindow = Titanium.UI.createAlertDialog({
            title : 'BetBattle',
            message : 'No internet connection detected!',
            buttonNames : ['OK']
        });

        alertWindow.addEventListener('click', function(e) {
            switch (e.index) {
            case 0:
                alertWindow.hide();
                break;
            }
        });
        alertWindow.show();
    }
};

// function to show alert box to restart app
Alloy.Globals.showAlertWithRestartNote = function(auto) {

    var alertWindow = Titanium.UI.createAlertDialog({
        title : Alloy.Globals.PHRASES.betbattleTxt,
        message : Alloy.Globals.PHRASES.appRestartTxt,
        buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.abortBtnTxt]
    });

    if (auto === 1) {
        alertWindow.message = Alloy.Globals.PHRASES.languageRestartTxt;
    }

    alertWindow.addEventListener('click', function(e) {
        switch (e.index) {
        case 0:
            alertWindow.hide();
            if (OS_ANDROID) {
                // close
                Alloy.Globals.MAINWIN.close();
                Alloy.Globals.CURRENTVIEW.close();

                var activity = Titanium.Android.currentActivity;

                // remove old event listeners
                Ti.App.removeEventListener('paused', Alloy.Globals.androidPauseEvent);
                Ti.App.removeEventListener('resumed', Alloy.Globals.androidResumeEvent);
                Ti.App.removeEventListener('challengesViewRefresh', Alloy.Globals.challengesViewRefreshEvent);
                Ti.App.removeEventListener('userInfoUpdate', Alloy.Globals.userInfoUpdateEvent);

                activity.finish();

                // start app again
                var intent = Ti.Android.createIntent({
                    action : Ti.Android.ACTION_MAIN,
                    url : 'Betbattle.js'
                });
                intent.addCategory(Ti.Android.CATEGORY_LAUNCHER);
                Ti.Android.currentActivity.startActivity(intent);

            } else {
                // set value that app restarts
                Ti.App.Properties.setBool("restart", true);

                if (Alloy.Globals.FACEBOOKOBJECT) {
                    // keep track if we are signed in with facebook
                    Ti.App.Properties.setBool("facebook", true);
                }

                // restart app
                Ti.App._restart();
            }
            break;
        case 1:
            alertWindow.hide();
            break;
        }
    });
    alertWindow.show();
};

Alloy.Globals.getTutorial = function(indicator) {
    var platform = "";
    if (Alloy.Globals.checkConnection()) {
        indicator.openIndicator();

        if (OS_IOS) {
            platform = "iphone";
        } else if (OS_ANDROID) {
            platform = "android";
        }
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            Ti.API.error('Bad Sever =>' + JSON.stringify(e));
            Ti.App.Properties.setString("tutorial_version", JSON.stringify("0"));
            indicator.closeIndicator();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        };

        try {
            xhr.open('POST', Alloy.Globals.BETKAMPENGETTUTORIALURL + "?lang=" + Alloy.Globals.LOCALE + '&platform=' + platform);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setTimeout(Alloy.Globals.TIMEOUT);

            xhr.send();
        } catch(e) {
            Ti.App.Properties.setString("tutorial_version", JSON.stringify("0"));
            indicator.closeIndicator();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        }

        xhr.onload = function() {
            if (this.status == '200') {
                if (this.readyState == 4) {
                    var response = JSON.parse(this.responseText);
                    var imageLocationArray = [];
                    var doneCount = 0;

                    // download each file
                    for (var img in response) {
                        var inline_function = function(img) {
                            var imageDownloader = Titanium.Network.createHTTPClient();
                            imageDownloader.setTimeout(Alloy.Globals.TIMEOUT);

                            imageDownloader.onload = function(e) {
                                var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'tut_' + response[img] + '.png');
                                f.write(this.responseData);
                                imageLocationArray.push(f.nativePath);
                                doneCount++;

                                if (doneCount == response.length) {
                                    // store the array on phone
                                    Ti.App.Properties.setString("tutorial_images", JSON.stringify(imageLocationArray));
                                    indicator.closeIndicator();

                                    Alloy.Globals.showToast(Alloy.Globals.PHRASES.downloadCompleteTxt);
                                }
                            };

                            imageDownloader.open("GET", Alloy.Globals.BETKAMPENURL + '/tutorial/' + platform + '/' + Alloy.Globals.LOCALE + '/tut_' + response[img] + '.png');
                            imageDownloader.send();
                        };
                        inline_function(img);
                    }
                }
            } else {
                Ti.App.Properties.setString("tutorial_version", JSON.stringify("0"));
                indicator.closeIndicator();
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            }
        };
    }
};

Alloy.Globals.checkVersions = function(indicator) {
    // check if any versions are stored (if the app runs for the first time, there will be no versions stored.)
    Ti.API.log("checking language...");

    if (Ti.App.Properties.hasProperty("language_version")) {
        // stored version found, check if it's out dated
        var currentLanguageVersion = JSON.parse(Ti.App.Properties.getString('language_version'));

        if (Alloy.Globals.VERSIONS.language_version !== currentLanguageVersion) {
            // update needed
            Alloy.Globals.getLanguage(null);
            /*
             var alertWindow = Titanium.UI.createAlertDialog({
             title : Alloy.Globals.PHRASES.betbattleTxt,
             message : Alloy.Globals.PHRASES.newLanguageTxt,
             buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.abortBtnTxt],
             persistent : true
             });

             alertWindow.addEventListener('click', function(e) {
             switch (e.index) {
             case 0:
             // get new language and store version
             alertWindow.hide();
             Ti.App.Properties.setString("language_version", JSON.stringify(Alloy.Globals.VERSIONS.language_version));
             Alloy.Globals.getLanguage(null);
             break;
             case 1:
             Ti.App.Properties.setString("language_version", JSON.stringify(Alloy.Globals.VERSIONS.language_version));
             alertWindow.hide();
             break;
             }
             });
             alertWindow.show();
             */
        }

    } else {
        // store current version
        Ti.App.Properties.setString("language_version", JSON.stringify(Alloy.Globals.VERSIONS.language_version));
    }

    if (Ti.App.Properties.hasProperty("tutorial_version")) {
        // stored version found, check if it's out dated
        var currentTutorialVersion = JSON.parse(Ti.App.Properties.getString('tutorial_version'));

        if (Alloy.Globals.VERSIONS.tutorial_version !== currentTutorialVersion) {
            // update needed
            var alertWindow = Titanium.UI.createAlertDialog({
                title : Alloy.Globals.PHRASES.betbattleTxt,
                message : Alloy.Globals.PHRASES.newTutorialTxt,
                buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.abortBtnTxt],
                persistent : true
            });

            alertWindow.addEventListener('click', function(e) {
                switch (e.index) {
                case 0:
                    // get new tutorial images and store version
                    alertWindow.hide();
                    Ti.App.Properties.setString("tutorial_version", JSON.stringify(Alloy.Globals.VERSIONS.tutorial_version));
                    Alloy.Globals.getTutorial(indicator);
                    break;
                case 1:
                    Ti.App.Properties.setString("tutorial_version", JSON.stringify(Alloy.Globals.VERSIONS.tutorial_version));
                    alertWindow.hide();
                    break;
                }
            });
            alertWindow.show();
        }

    } else {
        // store current version
        Ti.App.Properties.setString("tutorial_version", JSON.stringify(Alloy.Globals.VERSIONS.tutorial_version));
    }
};

Alloy.Globals.storeToken = function() {
    Ti.App.Properties.setString("BETKAMPEN", JSON.stringify(Alloy.Globals.BETKAMPEN));
};

Alloy.Globals.readToken = function() {
    if (Ti.App.Properties.hasProperty("BETKAMPEN")) {
        Alloy.Globals.BETKAMPEN = JSON.parse(Ti.App.Properties.getString('BETKAMPEN'));
    }
};

Alloy.Globals.createButtonView = function(buttonColor, fontColor, text) {
    var buttonView = Ti.UI.createView({
        width : "90%",
        height : 65,
        borderRadius : 5,
        backgroundColor : buttonColor,
        top : 10,
    });

    var buttonLabel = Ti.UI.createLabel({
        text : text,
        font : Alloy.Globals.FONT,
        color : fontColor,
        textAlign : "center"
    });

    buttonView.add(buttonLabel);

    return buttonView;
};

Alloy.Globals.setAndroidCouponMenu = function(activity) {
    activity.onCreateOptionsMenu = function(e) {
        ticket = e.menu.add( ticketIcon = {
            showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
            icon : 'images/ticketBtn.png',
            itemId : 1
        });

        var couponOpen = false;
        //Add event listener to ticket button
        ticket.addEventListener("click", function() {
            if (couponOpen)
                return;
            if (Alloy.Globals.hasCoupon) {
                couponOpen = true;
                var win = Alloy.createController('showCoupon').getView();
                win.addEventListener('close', function() {
                    win = null;
                    couponOpen = false;
                });
                win.open({
                    fullScreen : true
                });
                win = null;
            }
        });
    };

    activity.onPrepareOptionsMenu = function(e) {
        var menu = e.menu;

        if (Alloy.Globals.hasCoupon) {
            menu.findItem(1).setIcon('images/ikoner_kupong_red.png');
            // menu.findItem(1).setOpacity(1);
            menu.findItem(1).setVisible(true);
        } else {
            menu.findItem(1).setIcon('images/ikoner_kupong.png');
            // menu.findItem(1).setOpacity(0);
            menu.findItem(1).setVisible(false);
        }
    };

    activity.invalidateOptionsMenu();

    // set onResume for each activity in order to keep them updated with correct coupon
    activity.addEventListener("resume", function() {
        // will rebuild menu and keep coupon up to date
        activity.invalidateOptionsMenu();
    });
};

Alloy.Globals.themeColor = function() {
    var theme = 2;
    switch(theme) {
    case 1:
        return '#58B101';
    case 2:
        return '#FF7D40';
    // #f43710
    }
};

Alloy.Globals.getFont = function() {
    if (OS_IOS) {
        return 'Helvetica Neue';
    } else if (OS_ANDROID) {
        return 'Roboto-Regular';
    }
};

Alloy.Globals.getFontSize = function(target) {
    var font;

    if (OS_IOS) {
        if (target === 1) {
            // normal
            font = 16;
        } else if (target === 2) {
            // section
            font = 22;
        } else if (target === 3) {
            // header
            font = 44;
        }
        return font;
    } else if (OS_ANDROID) {
        if (target === 1) {
            // normal
            font = 18;
        } else if (target === 2) {
            // section
            font = 24;
        } else if (target === 3) {
            // header
            font = 48;
        }
        return font;
    }
};

Alloy.Globals.sendLocalNotification = function(msgTitle, msgContent, beaconID) {
    if (OS_IOS) {
        // The following code snippet schedules an alert to be sent
        var notification = Ti.App.iOS.scheduleLocalNotification({
            // Alert will display 'slide to update' instead of 'slide to view'
            // or 'Update' instead of 'Open' in the alert dialog
            // alertAction: "update",
            // Alert will display the following message
            alertBody : "msgContent",
            // The badge value in the icon will be changed to 1
            //badge: 1,
            // Alert will be sent in three seconds
            //date: new Date(new Date().getTime() + 3000),
            // The following sound file will be played
            //sound: "/alert.wav",
            // The following URL is passed to the application
            userInfo : {
                "beaconID" : beaconID
            }
        });
    } else if (OS_ANDROID) {

        var AppIntent = Ti.Android.createIntent({
            flags : Titanium.Android.FLAG_ACTIVITY_CLEAR_TOP | Titanium.Android.FLAG_ACTIVITY_SINGLE_TOP,
            className : 'ti.modules.titanium.ui.TiTabActivity',
            packageName : Ti.App.id
        });
        AppIntent.addCategory(Ti.Android.CATEGORY_LAUNCHER);

        var NotificationClickAction = Ti.Android.createPendingIntent({
            activity : Ti.Android.currentActivity,
            intent : AppIntent,
            flags : Ti.Android.FLAG_UPDATE_CURRENT,
            type : Ti.Android.PENDING_INTENT_FOR_ACTIVITY
        });

        var NotificationMembers = {
            contentTitle : msgTitle,
            contentText : msgContent,
            tickerText : msgContent,
            icon : Ti.App.Android.R.drawable.appicon,
            number : beaconID,
            //when : new Date().getTime(),
            flags : (Ti.Android.FLAG_ONGOING_EVENT | Ti.Android.FLAG_NO_CLEAR),
            contentIntent : NotificationClickAction
        };

        Ti.Android.NotificationManager.notify(1, Ti.Android.createNotification(NotificationMembers));
    }
};

// show feedback dialog
Alloy.Globals.showFeedbackDialog = function(msg) {
    var alertWindow = Titanium.UI.createAlertDialog({
        title : Alloy.Globals.PHRASES.betbattleTxt,
        message : msg,
        buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt]
    });

    alertWindow.addEventListener('click', function(e) {
        switch (e.index) {
        case 0:
            alertWindow.hide();
            break;
        }
    });
    alertWindow.show();
};

//adding experience
Alloy.Globals.addExperience = function(uid, xp) {
    // check connection
    if (!Alloy.Globals.checkConnection()) {
        return;
    }

    var xhr = Ti.Network.createHTTPClient();

    xhr.onerror = function(e) {
        Ti.API.error('Bad Sever =>' + e.error);
    };

    try {
        xhr.open("POST", Alloy.Globals.BETKAMPENADDEXPERIENCE + '/?lang=' + Alloy.Globals.LOCALE);
        xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
        xhr.setTimeout(Alloy.Globals.TIMEOUT);

        var params = {
            xp : xp,
        };
        xhr.send(params);
    } catch(e) {
        // do nothing
    }

    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {
                var response = JSON.parse(this.responseText);
            }
        }
    };
};

//adding coins
Alloy.Globals.addBonusCoins = function(uid, amount) {
    // check connection
    if (!Alloy.Globals.checkConnection()) {
        return;
    }

    var xhr = Ti.Network.createHTTPClient();

    xhr.onerror = function(e) {
        Ti.API.error('Bad Sever =>' + e.error);
    };

    try {
        xhr.open("POST", Alloy.Globals.BETKAMPENADDBONUSCOINS + '/?lang=' + Alloy.Globals.LOCALE);
        xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
        xhr.setTimeout(Alloy.Globals.TIMEOUT);

        var params = {
            amount : amount,
        };
        xhr.send(params);
    } catch(e) {
        // do nothing
    }

    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {
                var response = JSON.parse(this.responseText);
            }
        }
    };

};

Alloy.Globals.showToast = function(msg, unlock) {
    if (OS_ANDROID) {
        var delToast = Ti.UI.createNotification({
            duration : Ti.UI.NOTIFICATION_DURATION_LONG,
            message : msg
        });
        delToast.show();

        if (unlock) {
            Alloy.Globals.unlockAchievement(11);
        }
    } else {
        indWin = Titanium.UI.createWindow();

        //  view
        var indView = Titanium.UI.createView({
            top : '80%',
            height : 40,
            width : Ti.UI.FILL,
            backgroundColor : '#FFF',
            opacity : 0.9
        });

        indWin.add(indView);

        // message
        var message = Titanium.UI.createLabel({
            text : msg,
            color : '#000',
            width : 'auto',
            height : 'auto',
            textAlign : 'center',
            font : Alloy.Globals.getFontCustom(12, 'Bold'),
        });

        indView.add(message);
        indWin.open();

        var interval = interval ? interval : 2500;
        setTimeout(function() {
            indWin.close({
                opacity : 0,
                duration : 2000
            });
            if (unlock) {
                Alloy.Globals.unlockAchievement(11);
            }

        }, interval);
    }
};

Alloy.Globals.unlockAchievement = function(achID) {
    if (Alloy.Globals.checkConnection()) {
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            Ti.API.error('Bad Sever =>' + e.error);
        };

        try {
            xhr.open('POST', Alloy.Globals.BETKAMPENUNLOCKACHIEVEMENTURL + '?achID=' + achID + '&lang=' + Alloy.Globals.LOCALE);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
            xhr.setTimeout(Alloy.Globals.TIMEOUT);

            // build the json string

            xhr.send();
        } catch(e) {
            //
        }

        xhr.onload = function() {
            if (this.status == '200') {
                if (this.readyState == 4) {
                    var response = '';
                    try {
                        Ti.API.info("UNLOCK : " + JSON.stringify(this.responseText));
                        response = JSON.parse(this.responseText);
                    } catch(e) {

                    }

                    Ti.API.log(response);
                    if (response == 1) {
                        Ti.API.info("redan låst upp");

                    } else if (response.image != null) {
                        Ti.API.info("visa toast");
                        var player = Ti.Media.createSound({
                            url : "sound/unlocked.wav"
                        });

                        var indWin;

                        if (OS_IOS) {
                            indWin = Titanium.UI.createWindow();
                        } else {
                            indWin = Titanium.UI.createWindow({
                                backgroundColor : 'transparent',
                                navBarHidden : true
                            });
                        }

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

                        // message
                        var image = Ti.UI.createImageView({
                            image : Alloy.Globals.BETKAMPENURL + '/achievements/' + response.image,
                            width : "15%",
                            height : Ti.UI.SIZE,
                            left : 0,
                            top : 10
                        });
                        var message = Titanium.UI.createLabel({
                            text : Alloy.Globals.PHRASES.achievementUnlocked + Alloy.Globals.PHRASES.achievements[response.id].title,
                            right : 0,
                            color : '#000',
                            width : '75%',
                            top : 25,
                            height : 'auto',
                            textAlign : 'center',
                            font : Alloy.Globals.getFontCustom(12, 'Bold'),
                        });
                        indView.add(image);
                        indView.add(message);
                        indWin.open();

                        if (OS_ANDROID) {
                            indWin.addEventListener('open', function() {
                                indWin.activity.actionBar.hide();
                            });
                        }

                        player.play();

                        var interval = interval ? interval : 2500;
                        setTimeout(function() {
                            indWin.close({
                                opacity : 0,
                                duration : 2000
                            });
                            player.stop();
                        }, interval);
                    } else {
                        Ti.API.info("nått fel");
                    }

                } else {
                    Ti.API.log(this.response);
                }
            } else {
                Ti.API.error("Error =>" + this.response);
            }
        };
    } else {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }
};

// check network
Alloy.Globals.checkConnection = function() {
    return Titanium.Network.online;
};

// post device token to our backend
Alloy.Globals.postDeviceToken = function(deviceToken) {
    Alloy.Globals.DEVICETOKEN = deviceToken;
    // check connection
    if (Alloy.Globals.checkConnection()) {
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            Ti.API.error('Bad Sever =>' + e.error);
        };

        try {
            xhr.open('POST', Alloy.Globals.BETKAMPENDEVICETOKENURL);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
            xhr.setTimeout(Alloy.Globals.TIMEOUT);

            // build the json string
            var param = '{"device_token":"' + deviceToken + '", "device_type":"' + Ti.Platform.osname + '", "lang":"' + Alloy.Globals.LOCALE + '"}';
            xhr.send(param);
        } catch(e) {
            //
        }

        xhr.onload = function() {
            if (this.status == '200') {
                if (this.readyState == 4) {
                    var response = '';
                    try {
                        response = JSON.parse(this.responseText);
                    } catch(e) {

                    }

                    Ti.API.log(response);
                } else {
                    Ti.API.log(this.response);
                }
            } else {
                Ti.API.error("Error =>" + this.response);
            }
        };
    } else {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }
};

// check coins for user
Alloy.Globals.checkCoins = function() {
    // check connection
    if (Alloy.Globals.checkConnection()) {
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            Ti.API.error('Bad Sever =>' + e.error);
        };

        try {
            xhr.open('POST', Alloy.Globals.BETKAMPENCHECKCOINSURL + '?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
            xhr.setTimeout(Alloy.Globals.TIMEOUT);

            xhr.send();
        } catch(e) {
            //
        }

        xhr.onload = function() {
            if (this.status == '200') {
                if (this.readyState == 4) {
                    var coins = null;
                    try {
                        coins = JSON.parse(this.responseText);
                        coins = parseInt(coins);
                    } catch (e) {
                        coins = null;
                    }
                    if (coins !== null) {
                        if (coins <= 0) {
                            var alertWindow = Titanium.UI.createAlertDialog({
                                title : Alloy.Globals.PHRASES.betbattleTxt,
                                message : Alloy.Globals.PHRASES.noCoinsErrorTxt,
                                buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.storeTxt]
                            });

                            alertWindow.addEventListener('click', function(e) {
                                switch (e.index) {
                                case 0:
                                    alertWindow.hide();
                                    break;
                                case 1:
                                    var win = Alloy.createController('store').getView();

                                    if (OS_IOS) {
                                        Alloy.Globals.NAV.openWindow(win, {
                                            animated : true
                                        });
                                    } else {
                                        win.open({
                                            fullscreen : false
                                        });
                                        win = null;
                                    }

                                    alertWindow.hide();
                                    break;
                                }
                            });
                            alertWindow.show();
                        }
                    }

                }
            } else {
                Ti.API.error("Error =>" + this.response);
            }
        };
    }
};

// construct Challenge objects
Alloy.Globals.constructChallenge = function(responseAPI) {
    // 3 arrays will be returned from server, one for each type: accept, pending, finished
    // for each challenge object returned create a challenge object and store in array
    var finalArray = [];

    for (var c = 0; c < responseAPI.length; c++) {
        response = responseAPI[c];
        var array = [];

        for (var i = 0; i < response.length; i++) {

            // get opponents for each challenge
            var cOpponents = [];
            for (var x = 0; x < response[i].opponents.length; x++) {
                // build object
                var opponent = {
                    fbid : response[i].opponents[x].uid,
                    name : response[i].opponents[x].name,
                    status : response[i].opponents[x].status
                };
                // store in array
                cOpponents.push(opponent);
            }

            // get winner/winners for each challenge
            var cWinners = [];
            for (var z = 0; z < response[i].winners.length; z++) {
                // build object
                var winner = {
                    name : response[i].winners[z].name,
                    uid : response[i].winners[z].uid
                };
                cWinners.push(winner);
            }

            if (c === 1) {
                // handle pending challenge's
                var leagues = response[i].leagues;
                var leagueMixed = false;

                for (var x = 0; x < leagues.length; x++) {
                    if (leagues[x].id !== leagues[0].id) {
                        leagueMixed = true;
                    }
                }

                var challenge = Alloy.createModel('challenge', {
                    id : response[i].c_id,
                    name : response[i].c_name,
                    uid : response[i].c_uid,
                    time : response[i].c_time,
                    status : response[i].status,
                    opponents : cOpponents,
                    pot : response[i].pot,
                    potential_pot : response[i].potential_pot,
                    winners : cWinners,
                    group : response[i].group,
                    leagues : response[i].leagues,
                    round : response[i].round,
                    show : response[i].show,
                    matches : response[i].matches,
                    leagueMixed : leagueMixed
                });

            } else if (c === 3 || c === 4) {
                // handle tournaments
                var challenge = Alloy.createModel('challenge', {
                    id : response[i].id,
                    name : response[i].t_name,
                    time : response[i].game_date,
                    opponents : cOpponents,
                    winners : cWinners,
                    group : response[i].group,
                    league : response[i].league_id,
                    round : response[i].rnd,
                    opponentCount : response[i].count_opps,
                    tournamentPot : response[i].pot,
                    show : response[i].show
                });
            } else {
                // handle normal challenge's

                var leagues = response[i].leagues;
                var leagueMixed = false;

                for (var x = 0; x < leagues.length; x++) {
                    if (leagues[x].id !== leagues[0].id) {
                        leagueMixed = true;
                    }
                }

                var challenge = Alloy.createModel('challenge', {
                    id : response[i].c_id,
                    name : response[i].c_name,
                    uid : response[i].c_uid,
                    time : response[i].c_time,
                    status : response[i].status,
                    opponents : cOpponents,
                    pot : response[i].pot,
                    potential_pot : response[i].potential_pot,
                    winners : cWinners,
                    group : response[i].group,
                    leagues : response[i].leagues,
                    round : response[i].round,
                    show : response[i].show,
                    matches : response[i].matches,
                    leagueMixed : leagueMixed
                });
            }

            array.push(challenge);
        }
        finalArray.push(array);
    }

    if (responseAPI.length > 5) {
        // last in array store match otd data
        var tmpObj;

        if ( typeof responseAPI[5].match_data !== 'undefined' && responseAPI[5].match_data !== null) {
            tmpObj = {
                "match_otd_status" : responseAPI[5].match_otd_status,
                "match_data" : responseAPI[5].match_data
            };
        } else {
            tmpObj = {
                "match_otd_status" : responseAPI[5].match_otd_status
            };
        }

        finalArray.push(tmpObj);
    }

    return finalArray;
};

/* Used to show alert with info on coupon save/update */
Alloy.Globals.showCouponAlert = function() {
    // show dialog with options to add more matches or go to ticket
    var alertWindow = Titanium.UI.createAlertDialog({
        title : Alloy.Globals.PHRASES.betbattleTxt,
        message : Alloy.Globals.PHRASES.couponSavedMsg,
        buttonNames : [Alloy.Globals.PHRASES.addMoreMatchesTxt, Alloy.Globals.PHRASES.goToTicketTxt]
    });

    alertWindow.addEventListener('click', function(e) {
        switch (e.index) {
        case 0:
            alertWindow.hide();

            if (Alloy.Globals.WINDOWS.length > 0) {
                Alloy.Globals.WINDOWS[Alloy.Globals.WINDOWS.length - 1].close();
            }

            break;
        case 1:
            alertWindow.hide();

            var window = Alloy.createController('showCoupon').getView();
            Alloy.Globals.CURRENTVIEW = window;

            if (OS_ANDROID) {
                window.open({
                    fullScreen : true
                });
            } else {
                Alloy.Globals.NAV.openWindow(window, {
                    animated : true
                });
            }

            for (win in Alloy.Globals.WINDOWS) {
                if (Alloy.Globals.WINDOWS[win].id === 'challengeWindow') {
                    Alloy.Globals.WINDOWS[win].close();
                }
            }

            Alloy.Globals.WINDOWS.push(window);
            break;
        }
    });
    alertWindow.show();
};

Alloy.Globals.getCoupon = function(showAlert, indicator) {
    // check connection
    if (Alloy.Globals.checkConnection()) {
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            Ti.API.error('Bad Sever =>' + e.error);
        };

        try {
            xhr.open('POST', Alloy.Globals.BETKAMPENGETCOUPONURL + '?lang=' + Alloy.Globals.LOCALE);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
            xhr.setTimeout(Alloy.Globals.TIMEOUT);

            xhr.send();
        } catch(e) {
            //
        }

        xhr.onload = function() {
            if (this.status == '200') {
                if (this.readyState == 4) {
                    var response = null;
                    Ti.API.info("responsen" + JSON.stringify(this.responseText));
                    response = JSON.parse(this.responseText);
                    Ti.API.info("Response Coupon: " + JSON.stringify(response));
                    Alloy.Globals.COUPON = response;
                    if (response == 0) {
                        Alloy.Globals.COUPON = null;
                        Alloy.Globals.hasCoupon = false;
                        if (OS_IOS) {
                            var children = Alloy.Globals.NAV.getChildren();
                            for (var i in children) {
                                if (children[i].id == "ticketView") {
                                    children[i].setOpacity(0);
                                    // hide the ticket icon

                                    var labels = children[i].getChildren();
                                    for (var y in labels) {
                                        if (labels[y].id == "badge") {
                                            labels[y].setBackgroundColor("transparent");
                                            labels[y].setBorderColor("transparent");
                                            labels[y].setText("");
                                        }
                                        if (labels[y].id == "label") {
                                            labels[y].setColor("#303030");
                                        }
                                    }
                                }
                            }
                        } else if (OS_ANDROID) {
                            // will rebuild action bar menu
                            Ti.App.fireEvent('app:rebuildAndroidMenu');
                        }
                    } else if (Alloy.Globals.COUPON.games.length > 0) {
                        Alloy.Globals.hasCoupon = true;

                        if (showAlert) {
                            indicator.closeIndicator();
                            Alloy.Globals.showCouponAlert();
                        }

                        if (OS_IOS) {
                            Ti.API.info("challenge succces");
                            var children = Alloy.Globals.NAV.getChildren();
                            if (Alloy.Globals.PREVIOUSVIEW !== 'profile') {
                                for (var i in children) {
                                    if (children[i].id == "ticketView") {
                                        children[i].setOpacity(1);
                                        // show the ticket icon

                                        var labels = children[i].getChildren();
                                        for (var y in labels) {
                                            if (labels[y].id == "badge") {
                                                labels[y].setBackgroundColor(Alloy.Globals.themeColor());
                                                labels[y].setBorderColor("#c5c5c5");
                                                labels[y].setText("" + Alloy.Globals.COUPON.games.length);
                                            }
                                            if (labels[y].id == "label") {
                                                labels[y].setColor("#FFF");
                                            }
                                        }
                                    }
                                }
                            }
                        } else if (OS_ANDROID) {
                            // will rebuild action bar menu
                            Ti.App.fireEvent('app:rebuildAndroidMenu');
                        }
                    }
                } else {
                    Ti.API.error("Error =>" + this.response);
                }
            }
        };
    }
};
