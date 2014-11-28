var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

var isAndroid = false;

if (OS_ANDROID) {
    isAndroid = true;
    
    $.registrationView.windowSoftInputMode = Ti.UI.Android.SOFT_INPUT_ADJUST_PAN;

    $.registrationView.orientationModes = [Titanium.UI.PORTRAIT];

    $.registrationView.addEventListener('open', function() {
        $.registrationView.activity.actionBar.onHomeIconItemSelected = function() {
            $.registrationView.close();
            $.registrationView = null;
        };
        $.registrationView.activity.actionBar.displayHomeAsUp = true;
        $.registrationView.activity.actionBar.title = Alloy.Globals.PHRASES.regTxt;
    });

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
    $.registrationView.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.regTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : 'white'
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

$.regEmail.autocapitalization = Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE;

$.table.setHeaderView(headerView);
$.table.setFooterView(footerView);
$.info_label.text = $.info_label.text + ':';

function checkemail(emailAddress) {
    var testresults;
    var str = emailAddress;
    var filter = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (filter.test(str)) {
        testresults = true;
    } else {
        testresults = false;
    }
    return testresults;
};

var createReq = Titanium.Network.createHTTPClient();
    createReq.onload = function() {
    indicator.closeIndicator();
    var response = JSON.parse(this.responseText);
    if (this.status == '200') {
        if (this.readyState == 4) { 
            // success
            var alertDialog = Titanium.UI.createAlertDialog({
                title : Alloy.Globals.PHRASES.betbattleTxt,
                message : Alloy.Globals.PHRASES.regComplete,
                buttonNames : ['OK']
            });
            
            alertDialog.addEventListener('click', function(e) {
                var args = {
                    email : $.regEmail.value,
                    password : $.regPass.value
                };
                var loginWindow = Alloy.createController('loginView', args).getView();
                
                if(OS_IOS)  {
                    Alloy.Globals.NAV.openWindow(loginWindow);
                } else {
                    loginWindow.open();
                }
                         
                $.registrationView.close();
            });
            
            alertDialog.show();
        }
    } else {
        signUpBtn.touchEnabled = true;
        signUpBtn.opacity = 1;
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        Ti.API.error("Error =>" + this.response);
    }
};
createReq.onerror = function(e) {
    indicator.closeIndicator();
    signUpBtn.touchEnabled = true;
    signUpBtn.opacity = 1;
    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
    Ti.API.error("Error =>" + e.error);
};

var abortBtn = Alloy.Globals.createButtonView('#d50f25', '#FFF', Alloy.Globals.PHRASES.abortBtnTxt + ' ');
var signUpBtn = Alloy.Globals.createButtonView(Alloy.Globals.themeColor(), '#FFF', Alloy.Globals.PHRASES.regTxt + ' ');

abortBtn.top = -2;
signUpBtn.top = 0;

$.abort_row.add(abortBtn);
$.signup_row.add(signUpBtn);

// Event Listeners to simulate hint text
var passChange = false;
var passAgainChange = false;
var emailChange = false;

if (isAndroid) {
    $.regPass.enabled = true;
    $.regPass.addEventListener('focus', function() {
        $.regPass.passwordMask = true;
        if (!passChange) {
            $.regPass.setValue('');
        }
    });
}

$.regPass.addEventListener('click', function() {
    $.regPass.passwordMask = true;

    if(!isAndroid) {
        $.regPass.enabled = true;
        $.regPass.focus();
    }   

    if (!passChange) {
        $.regPass.setValue('');
    }
});

$.regPass.addEventListener('blur', function() {
    if(!isAndroid) {
       $.regPass.enabled = false; 
    }
    
    if ($.regPass.value !== '' && $.regPass.value !== null && $.regPass.value !== ' ' && $.regPass.value !== Alloy.Globals.PHRASES.passwordTxt) {
        passChange = true;
    } else {
        passChange = false;
    }

    if (!passChange) {
        $.regPass.setValue(Alloy.Globals.PHRASES.passwordTxt);
        $.regPass.passwordMask = false;
    }
});

$.regPass.addEventListener('return', function() {
    if(!isAndroid) {
        $.regPass.enabled = false;
    }

    if ($.regPass.value !== '' && $.regPass.value !== null && $.regPass.value !== ' ' && $.regPass.value !== Alloy.Globals.PHRASES.passwordTxt) {
        passChange = true;
    } else {
        passChange = false;
    }

    if (!passChange) {
        $.regPass.setValue(Alloy.Globals.PHRASES.passwordTxt);
        $.regPass.passwordMask = false;
    }
});

if (isAndroid) {
    $.regPassAgain.enabled = true;
    $.regPassAgain.addEventListener('focus', function() {
        $.regPassAgain.passwordMask = true;
        
        if (!passAgainChange) {
            $.regPassAgain.setValue('');
        }
    });
}

$.regPassAgain.addEventListener('click', function() {
    $.regPassAgain.passwordMask = true;
    
    if(!isAndroid) {
        $.regPassAgain.enabled = true;
        $.regPassAgain.focus();  
    }

    if (!passAgainChange) {
        $.regPassAgain.setValue('');
    }
});

$.regPassAgain.addEventListener('blur', function() {
    if(!isAndroid) {
        $.regPassAgain.enabled = false;
    }   

    if ($.regPassAgain.value !== '' && $.regPassAgain.value !== null && $.regPassAgain.value !== ' ' && $.regPassAgain.value !== Alloy.Globals.PHRASES.passwordAgainTxt) {
        passAgainChange = true;
    } else {
        passAgainChange = false;
    }

    if (!passAgainChange) {
        $.regPassAgain.setValue(Alloy.Globals.PHRASES.passwordAgainTxt);
        $.regPassAgain.passwordMask = false;
    }
});

$.regPassAgain.addEventListener('return', function() {
    if(!isAndroid) {
        $.regPassAgain.enabled = false;    
    }

    if ($.regPassAgain.value !== '' && $.regPassAgain.value !== null && $.regPassAgain.value !== ' ' && $.regPassAgain.value !== Alloy.Globals.PHRASES.passwordAgainTxt) {
        passAgainChange = true;
    } else {
        passAgainChange = false;
    }

    if (!passAgainChange) {
        $.regPassAgain.setValue(Alloy.Globals.PHRASES.passwordAgainTxt);
        $.regPassAgain.passwordMask = false;
    }
});

if (isAndroid) {
    $.regEmail.enabled = true;
    $.regEmail.addEventListener('focus', function() {
        if (!emailChange) {
            $.regEmail.setValue('');
        }
    });
}

$.regEmail.addEventListener('click', function() {
    if(!isAndroid) {
        $.regEmail.enabled = true;
        $.regEmail.focus();      
    }

    if (!emailChange) {
        $.regEmail.setValue('');
    }
});

$.regEmail.addEventListener('blur', function() {
    if(!isAndroid) {
        $.regEmail.enabled = false;    
    }

    if ($.regEmail.value !== '' && $.regEmail.value !== null && $.regEmail.value !== ' ' && $.regEmail.value !== Alloy.Globals.PHRASES.emailTxt) {
        emailChange = true;
    } else {
        emailChange = false;
    }

    if (!emailChange) {
        $.regEmail.setValue(Alloy.Globals.PHRASES.emailTxt);
    }
});

$.regEmail.addEventListener('return', function() {
    if(!isAndroid) {
        $.regEmail.enabled = false;  
    }

    if ($.regEmail.value !== '' && $.regEmail.value !== null && $.regEmail.value !== ' ' && $.regEmail.value !== Alloy.Globals.PHRASES.emailTxt) {
        emailChange = true;
    } else {
        emailChange = false;
    }

    if (!emailChange) {
        $.regEmail.setValue(Alloy.Globals.PHRASES.emailTxt);
    }
});

abortBtn.addEventListener('click', function(e) {
    // var login = Alloy.createController('login').getView();
    //login.open();
    $.registrationView.close();
});

signUpBtn.addEventListener('click', function(e) {
    if ($.regPass.value === Alloy.Globals.PHRASES.passwordTxt || $.regPassAgain.value === Alloy.Globals.PHRASES.passwordAgainTxt || $.regEmail.value === Alloy.Globals.PHRASES.emailTxt) {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.allFields);
        return;
    }

    if ($.regPass.value != '' && $.regPassAgain.value != '' && $.regEmail.value != '') {
        if ($.regPass.value != $.regPassAgain.value) {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noMatchPass);
        } else {
            if (!checkemail($.regEmail.value)) {
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.validEmail);
            } else {
                $.regEmail.value = $.regEmail.value.toLowerCase();
                signUpBtn.touchEnabled = false;
                signUpBtn.opacity = 0.3;

                indicator.openIndicator();
                createReq.open("POST", Alloy.Globals.BETKAMPENEMAILREG);
                var params = '{"email":"' + $.regEmail.value + '", "password":"' + $.regPass.value + '", "lang":"' + Alloy.Globals.LOCALE + '"}';
                createReq.setRequestHeader("content-type", "application/json");
                createReq.setTimeout(Alloy.Globals.TIMEOUT);

                try {
                    createReq.send(params);
                } catch(e) {
                    indicator.closeIndicator();
                    signUpBtn.touchEnabled = true;
                    signUpBtn.opacity = 1;
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                    Ti.API.error("Error");
                }
            }
        }
    } else {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.allFields);
    }
});

