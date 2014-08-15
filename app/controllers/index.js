/* This is the app's entry point */
var TiBeacons = require('org.beuckman.tibeacons');
var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
	top : 200
});

function ensureModel(e) {
	
	var atts = {
		id: e.uuid+" "+e.major+" "+e.minor,
		identifier: e.identifier,
		uuid: e.uuid,
		major: parseInt(e.major),
		minor: parseInt(e.minor),
		proximity: e.proximity
	};
	
	var model;
	var models = Alloy.Collections.iBeacon.where({id:atts.id});
	
	if (models.length == 0) {
		model = Alloy.createModel("iBeacon", atts);
		Alloy.Collections.iBeacon.add(model);
	}
	else {
		model = models[0];
Ti.API.info("found model "+models[0].get("identifier"));	
	}

	return model;
}

function enterRegion(e) {
	alert(e);
	var model = ensureModel(e);
	
	TiBeacons.startRangingForBeacons(e);
}

TiBeacons.addEventListener("enteredRegion", enterRegion);

        TiBeacons.startMonitoringForRegion({
            uuid : "B9407F30-F5F8-466E-AFF9-25556B57FE6D",
            identifier : "Test Region 1",
            major: 25458,
            minor: 53209
        });
        TiBeacons.startMonitoringForRegion({
        	uuid : "B9407F30-F5F8-466E-AFF9-25556B57FE6D",
        	identifier: "blue",
        	major: 41796, 
        	minor: 19133,
        });
        TiBeacons.startMonitoringForRegion({
        	uuid: "B9407F30-F5F8-466E-AFF9-25556B57FE6D",
        	identifier: "lightBlue",
        	major: 51092,
        	minor: 34572,
        });
        TiBeacons.startMonitoringForRegion({
            uuid : "00000000-0000-0000-0000-000000000001",
            major: 1,
            identifier : "Test Region 2"
        });
        TiBeacons.startMonitoringForRegion({
            uuid : "00000000-0000-0000-0000-000000000002",
            major: 1,
            minor: 2,
            identifier : "Test Region 3"
        });

        TiBeacons.startMonitoringForRegion({
            uuid : "B9407F30-F5F8-466E-AFF9-25556B57FE6D",
            identifier : "Estimote"
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
		title : 'Something went wrong!',
		message : 'An error occured while trying to fetch your local language files. Please try again.',
		buttonNames : ['Retry', 'Cancel']
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
					
					
					openLogin();
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

// run it
var language = Ti.App.Properties.getString('languageSelected');

// check if a language file has been downloaded
if(language) {
	// set current language
	try {
		var file1 = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, 'language.json');
		Alloy.Globals.PHRASES = JSON.parse(file1.read().text);
		openLogin();
	} catch (e) {
		getLanguage();
	}

} else {
	getLanguage();
}

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
