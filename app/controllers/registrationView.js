var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
	top : 200,
	text : Alloy.Globals.PHRASES.loadingTxt
});

var testresults;

function checkemail(emailAddress) {
	var str = emailAddress;
	var filter = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
	if (filter.test(str)) {
		testresults = true;
	} else {
		testresults = false;
	}
	return (testresults);
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
			alertDialog.show();
			alertDialog.addEventListener('click', function(e) {
				var args = {
					email : $.regEmail.value,
					password : $.regPass.value
				};
				var loginWindow = Alloy.createController('loginView', args).getView();
				loginWindow.open();
				$.registrationView.close();
			});
		}
	} else {
		$.signUpBtn.enabled = true;
		$.signUpBtn.opacity = 1;
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
		Ti.API.error("Error =>" + this.response);
	}
};
createReq.onerror = function(e) {
	indicator.closeIndicator();
	$.signUpBtn.enabled = true;
	$.signUpBtn.opacity = 1;
	Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
	Ti.API.error("Error =>" + e.error);
};

$.signUpBtn.addEventListener('click', function(e) {
	if ($.regPass.value != '' && $.regPassAgain.value != '' && $.regEmail.value != '') {
		if ($.regPass.value != $.regPassAgain.value) {
			alert(Alloy.Globals.PHRASES.noMatchPass);
		} else {
			if (!checkemail($.regEmail.value)) {
				alert(Alloy.Globals.PHRASES.validEmail);
			} else {
				$.signUpBtn.enabled = false;
				$.signUpBtn.opacity = 0.3;
				
				indicator.openIndicator();	
				createReq.open("POST", Alloy.Globals.BETKAMPENEMAILREG);
				var params = '{"email":"' + $.regEmail.value + '", "password":"' + $.regPass.value + '", "lang":"' + Alloy.Globals.LOCALE + '"}';
				createReq.setRequestHeader("content-type", "application/json");
				createReq.setTimeout(Alloy.Globals.TIMEOUT);
				
				try {
					createReq.send(params);
				} catch(e) {
					indicator.closeIndicator();
					$.signUpBtn.enabled = true;
					$.signUpBtn.opacity = 1;
					Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
					Ti.API.error("Error");
				}
			}
		}
	} else {
		alert(Alloy.Globals.PHRASES.allFields);
	}
});

$.abortRegBtn.addEventListener('click', function(e) {
	var login = Alloy.createController('login').getView();
	login.open();
	$.registrationView.close();
});

