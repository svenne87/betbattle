var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
	top : 200,
	text : Alloy.Globals.PHRASES.loadingTxt
});

var picker;

// hide modal pickers (ios)
$.settingsWindow.addEventListener('close', function() {
	indicator.closeIndicator();
	if (OS_IOS) {
		picker.close();
	}
});

$.settingsView.add(Ti.UI.createLabel({
	height : 20,
	top : 20,
	width : '100%',
	textAlign : 'center',
	backgroundColor : '#303030',
	color : '#FFF',
	text : Alloy.Globals.PHRASES.changeLanguageTxt,
	font : {
		fontFamily : Alloy.Globals.getFont(),
		fontSize : Alloy.Globals.getFontSize(2)
	}
}));

function changeLanguageConfirm(lang) {

	var languageDescription = Alloy.Globals.AVAILABLELANGUAGES[lang].description;
	
	var alertWindow = Titanium.UI.createAlertDialog({
		title : Alloy.Globals.PHRASES.betbattleTxt,
		message : Alloy.Globals.PHRASES.confirmLanguageChangeTxt + ' "' + languageDescription + '"?',
		buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.abortBtnTxt]
	});

	alertWindow.addEventListener('click', function(e) {
		switch (e.index) {
		case 0:
			alertWindow.hide();
			Alloy.Globals.LOCALE = Alloy.Globals.AVAILABLELANGUAGES[lang].name;
			getLanguage();
			break;
		case 1:
			alertWindow.hide();
			break;
		}
	});
	alertWindow.show();
}

function createPickers() {		
	var data = [];
	var currentLocale = JSON.parse(Ti.App.Properties.getString('language'));
	var currentLanguage;
	
	for(var lang in Alloy.Globals.AVAILABLELANGUAGES) {
		if(currentLocale.language == Alloy.Globals.AVAILABLELANGUAGES[lang].name) {
			currentLanguage = Alloy.Globals.AVAILABLELANGUAGES[lang].description;
		}
		
		data.push(Titanium.UI.createPickerRow({
			title : Alloy.Globals.AVAILABLELANGUAGES[lang].description,
			value : lang
		}));
	}
	
	if (OS_ANDROID) {	
		picker = Titanium.UI.createPicker({
			type : Titanium.UI.PICKER_TYPE_PLAIN,
			width : Ti.UI.SIZE,
			top : 20,
			height : Ti.UI.SIZE,
		});

		// on picker change
		picker.addEventListener('change', function(e) {
			changeLanguageConfirm(e.selectedValue[0]);  //.replace(/ /g, '')
		});

		picker.add(data);

		picker.columns[0].width = Ti.UI.SIZE;
		picker.columns[0].height = Ti.UI.SIZE;
		picker.selectionIndicator = true;

	} else if (OS_IOS) {
		var ModalPicker = require("lib/ModalPicker");
		var visualPrefs = {
			top : 5,
			opacity : 0.85,
			borderRadius : 3,
			backgroundColor : '#FFF',
			width : 140,
			height : 40,
			textAlign : 'center'
		};

		picker = new ModalPicker(visualPrefs, data, Alloy.Globals.PHRASES.chooseConfirmBtnTxt);
		
		picker.text = currentLanguage;
	
		picker.self.addEventListener('change', function(e) {
			changeLanguageConfirm(picker.value);
		});

	}
	$.settingsView.add(picker);
}

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

// run it
createPickers();


// TODO fix so we can notify clients about a language change in phrases.