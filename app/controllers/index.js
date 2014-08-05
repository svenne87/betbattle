/* This is the app's entry point */

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
	top : 200
});

function openLogin() {
	if (OS_IOS) {

		var login = Alloy.createController('login').getView();

		login.open({
			modal : false
		});
		Alloy.Globals.INDEXWIN = login;
		login = null;

	} else if (OS_ANDROID) {
		var login = Alloy.createController('login').getView();

		login.open({
			closeOnExit : true,
			fullScreen : true,
			navBarHidden : true
		});
		login.orientationModes = [Titanium.UI.PORTRAIT];
		Alloy.Globals.INDEXWIN = login;
		login = null;
	}
}

function doError() {
	indicator.closeIndicator();

	var alertWindow = Titanium.UI.createAlertDialog({
		title : 'Något gick fel!',
		message : 'Ett fel uppstod vid hämtande av ditt språk. Vänligen försök igen.',
		buttonNames : ['Försök igen', 'Stäng']
	});

	alertWindow.addEventListener('click', function(e) {
		switch (e.index) {
			case 0:
				alertWindow.hide();
				indicator.openIndicator();
				getLanguage();
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
			xhr.open('GET', Alloy.Globals.GETLANGUAGE + '?lang=' + Titanium.Locale.getCurrentLanguage());
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

					Alloy.Globals.PHRASES  = JSON.parse(file1.read().text);
					openLogin();
				}
				indicator.closeIndicator();
			} else {
				doError();
				Ti.API.error("Error =>" + this.response);
			}
		};
	} else {
		Alloy.Globals.showFeedbackDialog('Ingen anslutning!');
	}
}


// run it
getLanguage();


// byta tutorial bilderna innan update's

// Android beter sig konstigt vid klickande på push (app igång?)
// Android kunna avbryta "loading" ??
// handle session facebook dismissed!!!!
// lägga alla pågående turneringar i fliken aktuella?
// sök ios tomma rader är vita (ios 6)

// facebook ios, Facebook.getExpirationDate()  // kolla datum för token

// Hålla koll på vad för enhet som användare reggar sig ifrån (och version)

// Val av liga sedan lag. (tema för specifikt lag (ifrån backend?))

// Regga med facebook / email + lös. (sätt visningsnamn sen)

// Hålla isär poäng och saldo (nya namn)

// Språkstöd både för klient och api (backend)

// Bryta ut allt i titanium i moduler och köra olika GUI för iOS och Android (så alla vi kan jobba i det)

// nytt backend för oauth? token baserat iaf

// Inställningar
