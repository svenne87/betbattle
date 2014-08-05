/* This is the app's entry point */

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
