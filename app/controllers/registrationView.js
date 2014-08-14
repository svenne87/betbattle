var win = Titanium.UI.currentWindow;

var testresults;

function checkemail(emailAddress)
{
	var str = emailAddress;
	var filter = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
	if (filter.test(str))
	{
		testresults = true;
	}
	else
	{
		testresults = false;
	}
	return (testresults);
};

var createReq = Titanium.Network.createHTTPClient();
createReq.onload = function()
{
	if (this.responseText == "Insert failed" || this.responseText == "That username or email already exists")
	{
		$.signUpBtn.enabled = true;
		$.signUpBtn.opacity = 1;
		alert(Alloy.Globals.PHRASES.commonErrorTxt);
	} 
	else
	{
		var alertDialog = Titanium.UI.createAlertDialog({
		    title: 'Alert',
		    message: Alloy.Globals.PHRASES.regComplete,
		    buttonNames: ['OK']
		});
		alertDialog.show();
		alertDialog.addEventListener('click',function(e)
		{
			var loginWindow = Alloy.createController('loginView').getView();
			loginWindow.open();
			$.registrationView.close();
		});
	}
};

$.signUpBtn.addEventListener('click',function(e)
{
	if ($.regUsername.value != '' && $.regPass.value != '' && $.regPassAgain.value != '' && $.regEmail.value != '')
	{
		if ($.regPass.value != $.regPassAgain.value)
		{
			alert(Alloy.Globals.PHRASES.noMatchPass);
		}
		else
		{
			if (!checkemail($.regEmail.value))
			{
				alert(Alloy.Globals.PHRASES.validEmail);
			}
			else
			{
				$.signUpBtn.enabled = false;
				$.signUpBtn.opacity = 0.3;
				createReq.open("POST", Alloy.Globals.BETKAMPENEMAILREG);
				var params = {
					name: $.regUsername.value,
					password: Ti.Utils.md5HexDigest($.regPass.value),
					email: $.regEmail.value
				};
				createReq.send(params);
			}
		}
	}
	else
	{
		alert(Alloy.Globals.PHRASES.allFields);
	}
});

$.abortRegBtn.addEventListener('click', function(e){
	var login = Alloy.createController('login').getView();
	login.open();
	$.registrationView.close();
});


