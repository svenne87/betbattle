var win = Titanium.UI.currentWindow;

var loginReq = Titanium.Network.createHTTPClient();
loginReq.onload = function()
{
	var json = this.responseText;
	var response = JSON.parse(json);
	if (response.logged == true)
	{
		alert("Welcome " + response.username + ". Your email is: " + response.email);
	}
	else
	{
		alert(response.message);
	}
};

loginReq.onerror = function()
{
	alert("Network error");
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
