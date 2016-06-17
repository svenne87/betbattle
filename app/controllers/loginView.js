var error = Alloy.Globals.PHRASES.loginError;
var uie = require('lib/IndicatorWindow');

var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

var deviceHeight = Ti.Platform.displayCaps.platformHeight;

if(deviceHeight <= 480) {
    $.space_row.height  = 5;
} else if(deviceHeight >= 667) {
    $.space_row.height  = 60;
}

var user_team;
var args = arguments[0] || {};

var abortBtn = Alloy.Globals.createButtonView('#d50f25', '#FFF', Alloy.Globals.PHRASES.abortBtnTxt + ' ');
var signInBtn = Alloy.Globals.createButtonView(Alloy.Globals.themeColor(), '#FFF', Alloy.Globals.PHRASES.signInTxt + ' ');

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
}
var isAndroid = false;

if (OS_ANDROID) {
    isAndroid = true;

    $.loginView.orientationModes = [Titanium.UI.PORTRAIT];

    $.loginView.addEventListener('open', function() {
        $.loginView.activity.actionBar.onHomeIconItemSelected = function() {
            if($.loginView) {
            	$.loginView.close();
            	$.loginView = null;	
            }
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
} else {
    $.loginEmail.autocapitalization = Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE;
    
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
}

$.table.setHeaderView(headerView);
$.info_label.text = $.info_label.text + ':';

abortBtn.top = -2;
signInBtn.top = 0;

$.abort_row.add(abortBtn);
$.sign_in_row.add(signInBtn);


var resetPasswordView = Ti.UI.createView({
	width : Ti.UI.FILL,
    layout : 'vertical',
    backgroundColor : "transparent",
	height: Ti.UI.SIZE
});

if(isAndroid) {
    var footerView = Ti.UI.createView({
        height : 1,
        top : 5,
        width : Ti.UI.FILL,
        layout : 'vertical',
        backgroundColor : "#303030",
    });
	resetPasswordView.add(footerView);
}

var resetPasswordViewLabel = Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.resetPasswordTxt + '?',
	left: 20,
	width: "90%",
   	font : Alloy.Globals.getFontCustom(16, 'Regular'),
    color : '#FFF'
});

if(!isAndroid) {
	resetPasswordViewLabel.autocapitalization = Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE;
}

resetPasswordView.add(resetPasswordViewLabel);

resetPasswordView.addEventListener('click', function(e) {
	
	var textFieldView = Ti.UI.createView({
	});
	
	var emailField = Titanium.UI.createTextField({
        hintText: '',
        height: 60,
        width: 250,
        borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
    });
    
    textFieldView.add(emailField);
	
	var emailDialog = Titanium.UI.createAlertDialog({
    	title : Alloy.Globals.PHRASES.resetPasswordTxt,
        message : Alloy.Globals.PHRASES.emailTxt,
        androidView: textFieldView,
       	buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.abortBtnTxt],
        cancel : 1
    });
    
    if(!isAndroid) {
    	emailDialog.style = Ti.UI.iPhone.AlertDialogStyle.PLAIN_TEXT_INPUT;
    }
   	
    emailDialog.addEventListener('click', function(e) {
    	switch(e.index) {
        	case 0:
        		var emailValue = '';
				
				if(isAndroid) {
					emailValue = emailField.value;
				} else {
					emailValue = e.text;
				}

                indicator.openIndicator();
            	
                var xhr = Ti.Network.createHTTPClient();

                xhr.onerror = function(e) {
                	indicator.closeIndicator();
					Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText)); // Alloy.Globals.PHRASES.passwordResetErrorTxt
                   	Ti.API.error('Bad Sever => ' + e.error);
                };
				
                try {
                	xhr.open("POST", Alloy.Globals.RESETPASSWORDURL);
                	xhr.setRequestHeader("content-type", "application/json");
                    xhr.setTimeout(Alloy.Globals.TIMEOUT);
                    
                    var params = '{"email" : "' + emailValue + '", "lang" : "' + Alloy.Globals.LOCALE + '"}'; 
                    xhr.send(params);
                } catch(e) {
                    Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText)); // Alloy.Globals.PHRASES.commonErrorTxt
					indicator.closeIndicator();
                }

                xhr.onload = function() {
                	indicator.closeIndicator();
      
                    if (this.status == '200') {
                        if (this.readyState == 4) {
                        	var data = JSON.parse(this.responseText);
							
							Alloy.Globals.showFeedbackDialog(data);
							emailDialog.hide();
                        }
                    } else {
                    	Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
                    }
                };
               	break;
            case 1:
                break;
        }

     });
     emailDialog.show();
});

$.table.setFooterView(resetPasswordView);

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

var loginEvent = function() {
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
};

$.loginPass.addEventListener('return', loginEvent);

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

function hideShowLogin(hide) {
    if(hide) {
        $.sign_in_row.setOpacity(0.5);
        $.info.setOpacity(0.5);
        $.table.setOpacity(0.5);
        $.abort_row.setOpacity(0.5);
        $.space_row.setOpacity(0.5);
        indicator.openIndicator();
    } else {
        indicator.closeIndicator();
        $.sign_in_row.setOpacity(1);
        $.info.setOpacity(1);
        $.table.setOpacity(1);
        $.abort_row.setOpacity(1);
        $.space_row.setOpacity(1);
    }
}

function createLeagueAndUidObj(response) {
    Alloy.Globals.BETKAMPENUID = response.betkampen_uid;
    Alloy.Globals.PROFILENAME = response.profile_name;
    Alloy.Globals.LEAGUES = [];
    Alloy.Globals.AVAILABLELANGUAGES = [];
    Alloy.Globals.VERSIONS = response.versions;
    user_team = response.user_team;

    for (var i = 0; i < response.all_leagues.length; i++) {
        var league = {
            id : response.all_leagues[i].id,
            name : response.all_leagues[i].name,
            sport : response.all_leagues[i].sport,
            logo : response.all_leagues[i].logo,
            active : response.all_leagues[i].active,
            sport_name : response.all_leagues[i].sport_name,
            sort_order : response.all_leagues[i].sort_order
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
        Ti.API.error('1. Bad Server =>' + e.error);
        indicator.closeIndicator();
        signInBtn.enabled = true;
        hideShowLogin(false);
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
    };

    try {
        xhr.open('GET', Alloy.Globals.BETKAMPENCHALLENGESURL + '/?uid=' + Alloy.Globals.BETKAMPENUID + '&lang=' + Alloy.Globals.LOCALE);
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
        xhr.setTimeout(Alloy.Globals.TIMEOUT);

        xhr.send();
    } catch(e) {
        Ti.API.error('2. Bad Server =>' + e.error);
        indicator.closeIndicator();
        hideShowLogin(false);
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
    }
    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {
                var response = null;     
                hideShowLogin(false);
                indicator.closeIndicator();       

                try {
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

                if (user_team.data.length > 0) {
                    // keep landing page in memory
                    var tmp = Alloy.createController('landingPage', args).getView();
                    
                    // open main
                    var loginSuccessWindow = Alloy.createController('main', args).getView();
                    // Alloy.Globals.CURRENTVIEW = loginSuccessWindow;
                    // Alloy.Globals.CURRENTVIEW.hide();
                    
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
                
                for (var win in Alloy.Globals.WINDOWS) {
                    Alloy.Globals.WINDOWS[win].close(); 
                } 
            }
        } else {
            signInBtn.enabled = true;
            indicator.closeIndicator();
            hideShowLogin(false);
            Ti.API.error("Error =>" + this.response);
        }
    };
}

// TODO Handle if registered with fb and no password stored, if we want to login using betkampen?

function loginAuthenticated() {
    // Get betkampenID with valid token
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onerror = function(e) {
        Ti.API.error('4. Bad Server =>' + e.error);
         indicator.closeIndicator();

         if (e.source.status == 400) {
            // OAuth return 400 on credentials error
            showBadCredentialsAlert();
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
        indicator.closeIndicator();
        hideShowLogin(false);
        signInBtn.enabled = true;
    }

    xhr.onload = function() {
        if (this.status == '200') {
            if (this.readyState == 4) {
                var response = null;
                try {
                    response = JSON.parse(this.responseText);
                } catch(e) {
                    indicator.closeIndicator();
                    hideShowLogin(false);
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
                    hideShowLogin(false);
                    signInBtn.enabled = true;
                }

            }
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            Ti.API.error("Error =>" + this.response);
            indicator.closeIndicator();
            hideShowLogin(false);
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
        hideShowLogin(true);
        $.loginView.setOpacity(0);
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
            Ti.API.error('3. Bad Server =>' + e.error);
            indicator.closeIndicator();   
            signInBtn.enabled = true;
            hideShowLogin(false);
            
            if(auto) {
            	$.loginView.setOpacity(1);
            }
            
            if (e.source.status == 400) {
                // OAuth return 400 on credentials error
                showBadCredentialsAlert();
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            }
        }

        loginReq.onload = function() {
            if (this.status == '200') {
                if (this.readyState == 4) {
                    var json = this.responseText;
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
                indicator.closeIndicator();
                Ti.API.log(this.responseText);
                hideShowLogin(false);
                signInBtn.enabled = true;
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.loginCredentialsError);
                
                if(auto) {
            		$.loginView.setOpacity(1);
            	}
            }
        };
        loginReq.onerror = function(e) {
            Ti.API.error('4 Bad Server =>' + JSON.stringify(e));
            signInBtn.enabled = true;
            hideShowLogin(false);
            indicator.closeIndicator();
 			
 		    if(auto) {
            	$.loginView.setOpacity(1);
            }
 			
            if (e.source.status == 400) {
                // OAuth return 400 on credentials error
                showBadCredentialsAlert();
            } else {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            }
        };
    } else {
        indicator.closeIndicator();
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }
}
var signInEvent = function(e) {
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
};
signInBtn.addEventListener('click', signInEvent);

$.loginView.addEventListener('close', function() {
    signInBtn.removeEventListener('click', signInEvent);
    $.loginPass.removeEventListener('return', loginEvent);
});

abortBtn.addEventListener('click', function(e) {
    $.loginView.close();
});

