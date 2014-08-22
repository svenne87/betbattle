var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
	top : 200,
	text : Alloy.Globals.PHRASES.loadingTxt
});

var fontawesome = require('lib/IconicFont').IconicFont({
	font : 'lib/FontAwesome'
});

if (OS_ANDROID) {
	$.settingsWindow.orientationModes = [Titanium.UI.PORTRAIT];

	$.settingsWindow.addEventListener('open', function() {
		$.settingsWindow.activity.actionBar.onHomeIconItemSelected = function() {
			$.settingsWindow.close();
			$.settingsWindow = null;
		};
		$.settingsWindow.activity.actionBar.displayHomeAsUp = true;
		$.settingsWindow.activity.actionBar.title = Alloy.Globals.PHRASES.betbattleTxt;
	});
}

var picker;

// hide modal pickers (ios)
$.settingsWindow.addEventListener('close', function() {
	indicator.closeIndicator();
	if (OS_IOS) {
		picker.close();
	}
});

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

function sendSettingsServer(param, type, valueToStore) {
	// check connection
	if (Alloy.Globals.checkConnection()) {
		indicator.openIndicator();

		var xhr = Titanium.Network.createHTTPClient();
		xhr.onerror = function(e) {
			indicator.closeIndicator();
			Ti.API.error('Bad Sever =>' + e.error);
		};

		try {
			xhr.open('POST', Alloy.Globals.BETKAMPENSETTINGURL);
			xhr.setRequestHeader("content-type", "application/json");
			xhr.setRequestHeader("Authorization", Alloy.Globals.FACEBOOK.accessToken);
			xhr.setTimeout(Alloy.Globals.TIMEOUT);

			xhr.send(param);
		} catch(e) {
			indicator.closeIndicator();
			Alloy.Globals.showFeedbackDialog(JSON.parse(this.response));
		}

		xhr.onload = function() {
			if (this.status == '200') {
				if (this.readyState == 4) {
					if (type === 0) {
						// store value about push
						Ti.App.Properties.setBool("pushSetting", valueToStore);
					} else if (type === 1) {
						// store value about profile name
						Ti.App.Properties.setString("profileNameSetting", valueToStore);
					}

					Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));

				} else {
					Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
				}
				indicator.closeIndicator();
			} else {
				indicator.closeIndicator();
				Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
				Ti.API.error("Error =>" + this.response);
			}
		};
	} else {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
	}
}

function createGUI() {
	$.settingsView.add(Ti.UI.createLabel({
		height : 'auto',
		top : 20,
		width : '100%',
		textAlign : 'center',
		backgroundColor : 'transparent',
		color : '#FFF',
		text : "Settings",
		font : {
			fontFamily : "Impact",
			fontSize : Alloy.Globals.getFontSize(2)
		}
	}));

	var row = Ti.UI.createView({
		top : 20,
		backgroundColor : '#FFF',
		width : "97%",
		height : 60,
		opacity : 0.7,
		borderRadius : 10
	});

	row.add(Ti.UI.createLabel({
		text : Alloy.Globals.PHRASES.changeLanguageTxt,
		textAlign : "center",
		height : 'auto',
		left : 5,
		font : {
			fontSize : Alloy.Globals.getFontSize(1),
			fontFamily : "Impact"
		},
		color : "#000"
	}));

	row.add(createPickers());
	$.settingsView.add(row);

	var secondRow = Ti.UI.createView({
		top : 20,
		backgroundColor : '#FFF',
		width : "97%",
		height : 60,
		opacity : 0.7,
		borderRadius : 10
	});

	secondRow.add(Ti.UI.createLabel({
		text : Alloy.Globals.PHRASES.settingsPushTxt,
		textAlign : "center",
		height : 'auto',
		left : 5,
		font : {
			fontSize : Alloy.Globals.getFontSize(1),
			fontFamily : "Impact"
		},
		color : "#000"
	}));

	var pushEnabled;

	// true will be set if no stored value is found
	if (!Ti.App.Properties.hasProperty("pushSetting")) {
		Ti.App.Properties.setBool("pushSetting", true);
	}

	pushEnabled = Ti.App.Properties.getBool('pushSetting');
	var basicSwitch;

	if (OS_IOS) {
		basicSwitch = Ti.UI.createSwitch({
			right : 60,
			top : 15,
			width : 40,
			titleOn : Alloy.Globals.PHRASES.onTxt,
			titleOff : Alloy.Globals.PHRASES.offTxt,
			value : pushEnabled
		});
	} else if (OS_ANDROID) {
		var RealSwitch = require('com.yydigital.realswitch');
		
		basicSwitch = RealSwitch.createRealSwitch({
			right : 40,
			top : 15,
			width : 90,
			value : pushEnabled
		});
	}
	
	basicSwitch.addEventListener('change', function(e) {
		// build the json string
		var param = '{"push_status":"' + basicSwitch.value + '", "app_identifier":"' + Alloy.Globals.APPID + '", "lang":"' + Alloy.Globals.LOCALE + '"}';
		// send to backend
		sendSettingsServer(param, 0, basicSwitch.value);
	});

	secondRow.add(basicSwitch);
	$.settingsView.add(secondRow);

	var thirdRow = Ti.UI.createView({
		top : 20,
		backgroundColor : '#FFF',
		width : "97%",
		height : 60,
		opacity : 0.7,
		borderRadius : 10
	});

	thirdRow.add(Ti.UI.createLabel({
		text : Alloy.Globals.PHRASES.settingsPicTxt,
		textAlign : "center",
		height : 'auto',
		left : 5,
		font : {
			fontSize : Alloy.Globals.getFontSize(1),
			fontFamily : "Impact"
		},
		color : "#000"
	}));

	var rightPos = 60;
	var font = 'FontAwesome';
	
	if(OS_ANDROID) {
		rightPos = 40;
		font = 'fontawesome-webfont';
	}

	thirdRow.add(Ti.UI.createLabel({
		font : {
			fontFamily : font
		},
		text : fontawesome.icon('icon-chevron-right'),
		right : rightPos,
		color : '#000',
		fontSize : 80,
		height : 'auto',
		width : 'auto'
	}));

	thirdRow.addEventListener('click', function() {
		Ti.Media.openPhotoGallery({
			success : function(event) {

				// check connection
				if (Alloy.Globals.checkConnection()) {
					var image = event.media;
					uploadIndicator.show();

					var xhr = Titanium.Network.createHTTPClient();
					xhr.onerror = function(e) {
						Ti.API.error('Bad Sever =>' + e.error);
						uploadIndicator.hide();
					};

					xhr.onsendstream = function(e) {
						// upload progress
						uploadIndicator.value = e.progress;
					};

					try {
						xhr.open('POST', Alloy.Globals.BETKAMPENIMAGEUPLOADURL + '?lang=' + Alloy.Globals.LOCALE);
						xhr.setRequestHeader("Authorization", Alloy.Globals.FACEBOOK.accessToken);
						xhr.setRequestHeader("Content-Type", "multipart/form-data");
						//xhr.setRequestHeader("Content-Type", "image/png");
						xhr.setTimeout(Alloy.Globals.TIMEOUT);

						xhr.send({
							media : image,
							filename : 'profile_image_' + Alloy.Globals.BETKAMPENUID + '.png'
						});
					} catch(e) {
						uploadIndicator.hide();
					}

					xhr.onload = function() {
						if (this.status == '200') {
							if (this.readyState == 4) {
								var response = JSON.parse(this.responseText);
								Alloy.Globals.showFeedbackDialog(response);
							} else {
								Ti.API.log(this.response);
							}
							uploadIndicator.hide();
						} else {
							uploadIndicator.hide();
							Ti.API.error("Error =>" + this.response);
						}
					};
				} else {
					Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
				}
			},
			cancel : function() {
				// Do nothing
			},
			error : function() {
				// some error trying to access photos
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
			},
			allowEditing : true,
			mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
		});

	});

	$.settingsView.add(thirdRow);

	var fourthRow = Ti.UI.createView({
		top : 20,
		backgroundColor : '#FFF',
		width : "97%",
		height : 60,
		opacity : 0.7,
		borderRadius : 10
	});

	fourthRow.add(Ti.UI.createLabel({
		text : Alloy.Globals.PHRASES.settingsProfileTxt,
		textAlign : "center",
		height : 'auto',
		left : 5,
		font : {
			fontSize : Alloy.Globals.getFontSize(1),
			fontFamily : "Impact"
		},
		color : "#000"
	}));

	fourthRow.add(Ti.UI.createLabel({
		font : {
			fontFamily : font
		},
		text : fontawesome.icon('icon-chevron-right'),
		right : rightPos,
		color : '#000',
		fontSize : 80,
		height : 'auto',
		width : 'auto'
	}));

	fourthRow.addEventListener('click', function() {
		var dialog;
		var profileName = Ti.App.Properties.getString('profileNameSetting');
		var confirm = Alloy.Globals.PHRASES.okConfirmTxt;
		var cancel = Alloy.Globals.PHRASES.abortBtnTxt;
		var titleTxt = Alloy.Globals.PHRASES.profileNameTitleTxt;
		var messageTxt = Alloy.Globals.PHRASES.profileNameMessageTxt + ": " + profileName;

		if (OS_IOS) {
			dialog = Ti.UI.createAlertDialog({
				title : titleTxt,
				message : messageTxt,
				style : Ti.UI.iPhone.AlertDialogStyle.PLAIN_TEXT_INPUT,
				buttonNames : [confirm, cancel]
			});

		} else if (OS_ANDROID) {
			var textfield = Ti.UI.createTextField();
			textfield.value = profileName;

			dialog = Ti.UI.createAlertDialog({
				title : titleTxt,
				message : messageTxt,
				androidView : textfield,
				buttonNames : [confirm, cancel]
			});
		}

		dialog.addEventListener('click', function(e) {
			if (e.index == 0) {
				var text;

				if (OS_IOS) {
					text = e.text;
				} else if (OS_ANDROID) {
					text = textfield.value;
				}

				if (text.length > 2 && text.length < 16) {
					// set new profileName
					profileName = text;
					// build the json string
					var param = '{"profile_name":"' + profileName + '", "app_identifier":"' + Alloy.Globals.APPID + '", "lang":"' + Alloy.Globals.LOCALE + '"}';
					// send to backend
					sendSettingsServer(param, 1, profileName);

				} else {
					Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.groupNameErrorTxt);
				}
			} else {
				dialog.hide();
			}
		});
		dialog.show();
	});

	$.settingsView.add(fourthRow);

	var fifthRow = Ti.UI.createView({
		top : 20,
		backgroundColor : '#FFF',
		width : "97%",
		height : 60,
		opacity : 0.7,
		borderRadius : 10
	});

	fifthRow.add(Ti.UI.createLabel({
		text : Alloy.Globals.PHRASES.settingsBluetoothTxt,
		textAlign : "center",
		height : 'auto',
		left : 5,
		font : {
			fontSize : Alloy.Globals.getFontSize(1),
			fontFamily : "Impact"
		},
		color : "#000"
	}));

	fifthRow.add(Ti.UI.createLabel({
		font : {
			fontFamily : font
		},
		text : fontawesome.icon('icon-chevron-right'),
		right : rightPos,
		color : '#000',
		fontSize : 80,
		height : 'auto',
		width : 'auto'
	}));

	fifthRow.addEventListener('click', function() {
		if (OS_IOS) {
			Ti.Platform.openURL('prefs:root=Brightness prefs:root=General&path=Bluetooth');
		} else if (OS_ANDROID) {
			var intent = Ti.Android.createIntent({
				className : 'com.android.settings.bluetooth.BluetoothSettings',
				packageName : 'com.android.settings',
				action : Ti.Android.ACTION_MAIN,
			});
			Ti.Android.currentActivity.startActivity(intent);
		}
	});

	$.settingsView.add(fifthRow);

	// Indicator for file upload.
	var style = Titanium.UI.iPhone.ProgressBarStyle.PLAIN;
	if (OS_ANDROID) {
		style = Titanium.UI.Android.PROGRESS_INDICATOR_STATUS_BAR;
	}

	var uploadIndicator = Titanium.UI.createProgressBar({
		width : 200,
		height : 50,
		min : 0,
		max : 1,
		value : 0,
		visible  : false,
		style : style,
		top : 10,
		message : Alloy.Globals.PHRASES.imageUploadTxt + "...",
		font : {
			fontSize : Alloy.Globals.getFontSize(1),
			fontWeight : 'bold'
		},
		color : '#FFF'
	});

	$.settingsView.add(uploadIndicator);
}

function createPickers() {
	var data = [];
	var currentLocale = JSON.parse(Ti.App.Properties.getString('language'));
	var currentLanguage;

	for (var lang in Alloy.Globals.AVAILABLELANGUAGES) {
		if (currentLocale.language == Alloy.Globals.AVAILABLELANGUAGES[lang].name) {
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
			height : Ti.UI.SIZE,
			right : 40
		});

		// on picker change
		picker.addEventListener('change', function(e) {
			changeLanguageConfirm(picker.getSelectedRow(0).value);
		});

		picker.add(data);

		picker.columns[0].width = Ti.UI.SIZE;
		picker.columns[0].height = Ti.UI.SIZE;
		picker.selectionIndicator = true;

	} else if (OS_IOS) {
		var ModalPicker = require("lib/ModalPicker");
		var visualPrefs = {
			top : 10,
			right : 10,
			borderRadius : 3,
			backgroundColor : '#FFF',
			width : 140,
			height : 40,
			textAlign : 'center'
		};

		picker = new ModalPicker(visualPrefs, data, Alloy.Globals.PHRASES.chooseConfirmBtnTxt, Alloy.Globals.PHRASES.closeBtnTxt);

		picker.text = currentLanguage;

		picker.self.addEventListener('change', function(e) {
			changeLanguageConfirm(picker.value);
		});

	}
	return picker;
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
			if (OS_ANDROID) {
				// close
				Alloy.Globals.MAINWIN.close();
				Alloy.Globals.LANDINGWIN.close();
				$.settingsWindow.exitOnClose = true;
				$.settingsWindow.close();

				var activity = Titanium.Android.currentActivity;
				activity.finish();

				// start app again
				var intent = Ti.Android.createIntent({
					action : Ti.Android.ACTION_MAIN,
					url : 'Betkampen.js'
				});
				intent.addCategory(Ti.Android.CATEGORY_LAUNCHER);
				Ti.Android.currentActivity.startActivity(intent);
			} else {
				// restart app
				Ti.App._restart();
			}
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
createGUI();

// TODO handle it in backend!!!!! test and fix all php files
// TODO images are forced as .png right now..
// TODO fix so we can notify clients about a language change in phrases.

