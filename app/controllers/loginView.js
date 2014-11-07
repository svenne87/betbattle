var error = Alloy.Globals.PHRASES.loginError;
var uie = require('lib/IndicatorWindow');

var indicator;
var user_team;
var args = arguments[0] || {};

var abortBtn = Alloy.Globals.createButtonView('#d50f25', '#FFF', Alloy.Globals.PHRASES.abortBtnTxt);
var signInBtn = Alloy.Globals.createButtonView('#FFF', '#000', Alloy.Globals.PHRASES.signInTxt);

var emailReg = -1;
if ( typeof args.email !== 'undefined') {
    emailReg = args.email;
}

var passwordReg = -1;
if ( typeof args.password !== 'undefined') {
    passwordReg = args.password;
}

if (emailReg !== -1 && passwordReg !== -1) {
    // auto login
    login(true);
    // TODO dölja inloggning i bakgrund??
}
var isAndroid = false;

if (OS_ANDROID) {
    isAndroid = true;

    $.loginView.orientationModes = [Titanium.UI.PORTRAIT];

    $.loginView.addEventListener('open', function() {
        $.loginView.activity.actionBar.onHomeIconItemSelected = function() {
            $.loginView.close();
            $.loginView = null;
        };
        $.loginView.activity.actionBar.displayHomeAsUp = true;
        $.loginView.activity.actionBar.title = Alloy.Globals.PHRASES.signInTxt;
    });

    $.loginView.windowSoftInputMode = Ti.UI.Android.SOFT_INPUT_ADJUST_PAN;

    var headerView = Ti.UI.createView({
        height : 1,
        top : 5,
        width : Ti.UI.FILL,
        layout : 'vertical',
        backgroundColor : "#303030",
    });

    var footerView = Ti.UI.createView({
        height : 1,
        top : 5,
        width : Ti.UI.FILL,
        layout : 'vertical',
        backgroundColor : "#303030",
    });
} else {
    $.loginView.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.signInTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });

    var headerView = Ti.UI.createView({
        height : 0.3,
        top : 0,
        width : Ti.UI.FILL,
        layout : 'vertical',
        backgroundColor : '#303030',
    });

    var footerView = Ti.UI.createView({
        height : 0,
        top : 0,
        width : Ti.UI.FILL,
        layout : 'vertical',
        backgroundColor : "transparent",
    });
}

$.table.setHeaderView(headerView);
$.table.setFooterView(footerView);
$.info_label.text = $.info_label.text + ':';

abortBtn.top = -2;
signInBtn.top = 0;

$.abort_row.add(abortBtn);
$.sign_in_row.add(signInBtn);

// Event Listeners to simulate hint text
var passChange = false;
var emailChange = false;

if (isAndroid) {
    $.loginPass.enabled = true;
    $.loginPass.addEventListener('focus', function() {
        $.loginPass.passwordMask = true;
        if (!passChange) {
            $.loginPass.setValue('');
        }
    });
}

$.loginPass.addEventListener('click', function() {
    $.loginPass.passwordMask = true;

    if (!isAndroid) {
        $.loginPass.enabled = true;
        $.loginPass.focus();
    }

    if (!passChange) {
        $.loginPass.setValue('');
    }
});

$.loginPass.addEventListener('blur', function() {
    if (!isAndroid) {
        $.loginPass.enabled = false;
    }

    if ($.loginPass.value !== '' && $.loginPass.value !== null && $.loginPass.value !== ' ' && $.loginPass.value !== Alloy.Globals.PHRASES.passwordTxt) {
        passChange = true;
    } else {
        passChange = false;
    }

    if (!passChange) {
        $.loginPass.setValue(Alloy.Globals.PHRASES.passwordTxt);
        $.loginPass.passwordMask = false;
    }
});

$.loginPass.addEventListener('return', function() {
    if (!isAndroid) {
        $.loginPass.enabled = false;
    }

    if ($.loginPass.value !== '' && $.loginPass.value !== null && $.loginPass.value !== ' ' && $.loginPass.value !== Alloy.Globals.PHRASES.passwordTxt) {
        passChange = true;
    } else {
        passChange = false;
    }

    if (!passChange) {
        $.loginPass.setValue(Alloy.Globals.PHRASES.passwordTxt);
        $.loginPass.passwordMask = false;
    } else {
        if ($.loginPass.value === Alloy.Globals.PHRASES.passwordTxt || $.loginEmail.value === Alloy.Globals.PHRASES.emailTxt) {
            Alloy.Globals.showFeedbackDialog(error);
            return;
        }

        if ($.loginEmail.value != '' && $.loginPass.value != '') {
            // this is due to a strange titanium bug with the garbage collector
            indicator = uie.createIndicatorWindow({
                top : 200,
                text : Alloy.Globals.PHRASES.loadingTxt
            });

            $.loginEmail.value = $.loginEmail.value.toLowerCase();

            indicator.openIndicator();
            login(false);
        } else {
            Alloy.Globals.showFeedbackDialog(error);
        }
    }
});

if (isAndroid) {
    $.loginEmail.enabled = true;
    $.loginEmail.addEventListener('focus', function() {
        if (!emailChange) {
            $.loginEmail.setValue('');
        }
    });
}

$.loginEmail.addEventListener('click', function() {
    if (!isAndroid) {
        $.loginEmail.enabled = true;
        $.loginEmail.focus();
    }

    if (!emailChange) {
        $.loginEmail.setValue('');
    }
});

$.loginEmail.addEventListener('blur', function() {
    if (!isAndroid) {
        $.loginEmail.enabled = false;
    }

    if ($.loginEmail.value !== '' && $.loginEmail.value !== null && $.loginEmail.value !== ' ' && $.loginEmail.value !== Alloy.Globals.PHRASES.emailTxt) {
        emailChange = true;
    } else {
        emailChange = false;
    }

    if (!emailChange) {
        $.loginEmail.setValue(Alloy.Globals.PHRASES.emailTxt);
    }
});

$.loginEmail.addEventListener('return', function() {
    if (!isAndroid) {
        $.loginEmail.enabled = false;
    }

    if ($.loginEmail.value !== '' && $.loginEmail.value !== null && $.loginEmail.value !== ' ' && $.loginEmail.value !== Alloy.Globals.PHRASES.emailTxt) {
        emailChange = true;
    } else {
        emailChange = false;
    }

    if (!emailChange) {
        $.loginEmail.setValue(Alloy.Globals.PHRASES.emailTxt);
    }
});

function createLeagueAndUidObj(response) {
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
        signInBtn.enabled = true;
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
    };

    try {
        xhr.open('GET', Alloy.Globals.BETKAMPENCHALLENGESURL + '/?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
        xhr.setTimeout(Alloy.Globals.TIMEOUT);

        xhr.send();
    } catch(e) {
        Ti.API.error('Bad Sever =>' + e.error);
        indicator.closeIndicator();
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
    }
    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {
                var response = null;

                try {
                    Ti.API.info("LOG TEST : " + JSON.stringify(this.responseText));
                    response = JSON.parse(this.responseText);
                } catch(e) {
                    indicator.closeIndicator();
                    signInBtn.enabled = true;
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                }

                // construct array with objects
                if (response !== null) {
                    Alloy.Globals.CHALLENGEOBJECTARRAY = Alloy.Globals.constructChallenge(response);
                }

                // login success
                var args = {
                    dialog : indicator
                };

                for (var win in Alloy.Globals.WINDOWS) {
                    Alloy.Globals.WINDOWS[win].close();
                }

                var loginSuccessWindow = Alloy.createController('landingPage', args).getView();
                Alloy.Globals.CURRENTVIEW = loginSuccessWindow;

                if (user_team.data.length > 0) {
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

                    $.loginView.close();

                } else {
                    var loginSuccessWindow = Alloy.createController('pickTeam', args).getView();

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

                    $.loginView.close();
                }

            }
        } else {
            signInBtn.enabled = true;
            indicator.closeIndicator();
            Ti.API.error("Error =>" + this.response);
        }
    };
}

// TODO Handle if registered with fb and no password stored, if we want to login using betkampen?

function loginAuthenticated() {
    // Get betkampenID with valid token
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onerror = function(e) {
        Ti.API.error('Bad Sever =>' + e.error);
        indicator.closeIndicator();
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
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
        signInBtn.enabled = true;
    }

    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {
                var response = null;
                try {
                    Ti.API.info("LOG TEST 2 :" + JSON.stringify(this.responseText));
                    response = JSON.parse(this.responseText);
                } catch(e) {
                    Ti.API.info("LOG TEST 22 : " + JSON.stringify(this.responseText));
                    indicator.closeIndicator();
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                }

                if (response !== null) {
                    createLeagueAndUidObj(response);

                    if (Alloy.Globals.BETKAMPENUID > 0) {
                        getChallengesAndStart();
                    }
                } else {
                    //////
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                    indicator.closeIndicator();
                    signInBtn.enabled = true;
                }

            }
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("Error =>" + this.response);
            indicator.closeIndicator();
            signInBtn.enabled = true;
        }
    };
}

function showBadCredentialsAlert() {
    var alertDialog = Titanium.UI.createAlertDialog({
        title : Alloy.Globals.PHRASES.betbattleTxt,
        message : Alloy.Globals.PHRASES.loginCredentialsError,
        buttonNames : ['OK', Alloy.Globals.PHRASES.regTxt]
    });

    alertDialog.addEventListener('click', function(e) {
        switch(e.index) {
            case 0:
                alertDialog.hide();
                break;
            case 1:
                alertDialog.hide();
                var regWindow = Alloy.createController('registrationView').getView();
                
                if(OS_IOS) {
                    Alloy.Globals.NAV.openWindow(regWindow);
                } else {
                    regWindow.open();
                }
                
                $.loginView.close();
        }
    });

    alertDialog.show();
}

function login(auto) {
    var user;
    var pass;
    if (auto) {
        // login from register
        user = emailReg;
        pass = passwordReg;
    } else {
        user = $.loginEmail.value;
        pass = $.loginPass.value;
    }

    if (Alloy.Globals.checkConnection()) {
        signInBtn.enabled = false;
        var loginReq = Titanium.Network.createHTTPClient();
        try {
            loginReq.open("POST", Alloy.Globals.BETKAMPENEMAILLOGIN);
            var params = {
                grant_type : 'password',
                username : user,
                password : pass,
                client_id : 'betkampen_mobile',
                client_secret : 'not_so_s3cr3t'
            };
            loginReq.setTimeout(Alloy.Globals.TIMEOUT);
            loginReq.send(params);
        } catch(e) {
            Ti.API.error('Bad Sever =>' + e.error);
            indicator.closeIndicator();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            signInBtn.enabled = true;
        }

        loginReq.onload = function() {
            if (this.status == '200') {
                if (this.readyState == 4) {
                    var json = this.responseText;
                    Ti.API.info("LOG TEST 3 :" + JSON.stringify(json));
                    var response = JSON.parse(json);
                    // token received, store it for API requests
                    Alloy.Globals.BETKAMPEN = {
                        token : "TOKEN " + response.access_token,
                        valid : response.expires_in,
                        refresh_token : response.refresh_token
                    };

                    Alloy.Globals.storeToken();
                    loginAuthenticated();
                }
            } else {
                Ti.API.log(this.responseText);
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.loginCredentialsError);
            }
        };
        loginReq.onerror = function(e) {
            Ti.API.error('Bad Sever =>' + JSON.stringify(e));
            signInBtn.enabled = true;
            indicator.closeIndicator();
            if (e.code === 400) {
                // OAuth return 400 on credentials error
                // TODO
                showBadCredentialsAlert();
               // Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.loginCredentialsError);
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            }
        };
    } else {
        indicator.closeIndicator();
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }
}

signInBtn.addEventListener('click', function(e) {
    if ($.loginPass.value === Alloy.Globals.PHRASES.passwordTxt || $.loginEmail.value === Alloy.Globals.PHRASES.emailTxt) {
        Alloy.Globals.showFeedbackDialog(error);
        return;
    }

    if ($.loginEmail.value != '' && $.loginPass.value != '') {
        // this is due to a strange titanium bug with the garbage collector
        indicator = uie.createIndicatorWindow({
            top : 200,
            text : Alloy.Globals.PHRASES.loadingTxt
        });

        $.loginEmail.value = $.loginEmail.value.toLowerCase();

        indicator.openIndicator();
        login(false);
    } else {
        Alloy.Globals.showFeedbackDialog(error);
    }
});

abortBtn.addEventListener('click', function(e) {
    $.loginView.close();
});

