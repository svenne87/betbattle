/* This is the app's entry point */
var TiBeacons = require('org.beuckman.tibeacons');
var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
	top : 200
});


function enterRegion(e) {
	alert(e);
	if(e.identifier == 'conference'){
		alert("Du är nära Konferensrummet. Ska jag sätta på TV:n ?")
	}else if(e.identifier == 'hall'){
		alert("Du är nära hallen nu);
	}else if(e.identifier == 'kitchen'){
		alert("Du är nära köket.");
	}
	
	TiBeacons.startRangingForBeacons(e);
}

function updateInformation(e){
	if (e.identifier == 'conference' && e.proximity == "near"){
		alert("Du är i konferensrummet nu. Grattis!");
	}else if (e.identifier == 'hall' && e.proximity == "near"){
		alert("Du är i hallen nu. Grattis!");
	}else if (e.identifier == 'kitchen' && e.proximity == "near"){
		alert("Du är i köket! Glöm inte kaffet!");
	}
}

TiBeacons.addEventListener("enteredRegion", enterRegion);
TiBeacons.addEventListener("beaconProximity", updateInformation);

        TiBeacons.startMonitoringForRegion({
            uuid : "B9407F30-F5F8-466E-AFF9-25556B57FE6D",
            identifier : "conference",
            major: 25458,
            minor: 53209
        });
        TiBeacons.startMonitoringForRegion({
        	uuid : "B9407F30-F5F8-466E-AFF9-25556B57FE6D",
        	identifier: "hall",
        	major: 41796, 
        	minor: 19133,
        });
        TiBeacons.startMonitoringForRegion({
        	uuid: "B9407F30-F5F8-466E-AFF9-25556B57FE6D",
        	identifier: "kitchen",
        	major: 51092,
        	minor: 34572,
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
