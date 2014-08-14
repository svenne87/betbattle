var win = Titanium.UI.currentWindow;

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
	top : 200,
	text : Alloy.Globals.PHRASES.loadingTxt
});

var loginReq = Titanium.Network.createHTTPClient();
loginReq.onload = function()
{
	var json = this.responseText;
	var response = JSON.parse(json);
	if (response.logged == true)
	{
		var args = {
					dialog : indicator
				};

		if (OS_IOS) {
					var loginSuccessWindow = Alloy.createController('landingPage', args).getView();
					loginSuccessWindow.open({
						fullScreen : true,
						transition : Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT
					});
					loginSuccessWindow = null;

				} else if (OS_ANDROID) {
					var loginSuccessWindow = Alloy.createController('landingPage', args).getView();
					loginSuccessWindow.open({
						fullScreen : true,
						navBarHidden : false,
						orientationModes : [Titanium.UI.PORTRAIT]
					});
					loginSuccessWindow = null;
				}
		//win.close();
		$.loginView.close();
	}
	else
	{
		alert(response.message);
	}
};

loginReq.onerror = function()
{
	alert(Alloy.Globals.PHRASES.internetMayBeOffErrorTxt);
};
var error = Alloy.Globals.PHRASES.loginError;

$.signInBtn.addEventListener('click', function(e)
{
	if ($.loginEmail.value != '' && $.loginPass.value != '')
	{
		loginReq.open("POST","http://secure.jimdavislabs.se/secure/betkampen_vm/api/email_login.php");
		var params = {
			email: $.loginEmail.value,
			password: Ti.Utils.md5HexDigest($.loginPass.value)
		};
		loginReq.send(params);
	}
	else
	{
		alert(error);
	}
});

$.abortLoginBtn.addEventListener('click', function(e){
	var login = Alloy.createController('login').getView();
	login.open();
	$.loginView.close();
	
});
