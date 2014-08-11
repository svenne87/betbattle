var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
	top : 200,
	text : Alloy.Globals.PHRASES.loadingTxt
});

var testEngButton = Ti.UI.createButton({
	height : 30,
	width : 100,
	top : 20,
	title : 'EN'
});

var testSvButton = Ti.UI.createButton({
	height : 30,
	width : 100,
	top : 60,
	title : 'SV'
});

testEngButton.addEventListener('click', function() {
	Alloy.Globals.LOCALE = 'en';
	getLanguage();
});

testSvButton.addEventListener('click', function() {
	Alloy.Globals.LOCALE = 'sv';
	getLanguage();
});

$.settingsView.add(testEngButton);
$.settingsView.add(testSvButton);

// function to show alert box to restart app
function showAlertWithRestartNote() {
	var alertWindow = Titanium.UI.createAlertDialog({
		title : Alloy.Globals.PHRASES.betbattleTxt,
		message : Alloy.Globals.PHRASES.appRestartTxt,
		buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.abortBtnTxt]
	});

	alertWindow.addEventListener('click', function(e) {
		switch (e.index) {
		case 0:
			alertWindow.hide();
			Ti.App._restart();
			break;
		case 1:
			alertWindow.hide();
			break;
		}
	});
	alertWindow.show();
}

// get correct language file for this device
function getLanguage() {
	// check connection
	if (Alloy.Globals.checkConnection()) {
		indicator.openIndicator();

		var xhr = Titanium.Network.createHTTPClient();
		xhr.onerror = function(e) {
			Ti.API.error('Bad Sever =>' + e.error);
			doError();
		};

		try {
			xhr.open('GET', Alloy.Globals.GETLANGUAGE + '?lang=' + Alloy.Globals.LOCALE);
			xhr.setRequestHeader("content-type", "application/json");
			xhr.setTimeout(Alloy.Globals.TIMEOUT);

			xhr.send();
		} catch(e) {
			//
			doError();
		}

		xhr.onload = function() {
			if (this.status == '200') {
				if (this.readyState == 4) {
					// write it to the file system
					var file1 = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, 'language.json');
					file1.write(this.responseText);

					Alloy.Globals.PHRASES = JSON.parse(file1.read().text);

					// store language and that we have selected a language
					Ti.App.Properties.setString("language", JSON.stringify({
						language : Alloy.Globals.LOCALE
					}));
					Ti.App.Properties.setString("languageSelected", JSON.stringify({
						languageSelected : true
					}));

					showAlertWithRestartNote();
				}
				indicator.closeIndicator();
			} else {
				doError();
				Ti.API.error("Error =>" + this.response);
			}
		};
	} else {
		var alertWindow = Titanium.UI.createAlertDialog({
			title : 'Bet Battle',
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
}