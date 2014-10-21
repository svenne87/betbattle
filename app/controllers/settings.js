var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
	top : 200,
	text : Alloy.Globals.PHRASES.loadingTxt
});

var fontawesome = require('lib/IconicFont').IconicFont({
	font : 'lib/FontAwesome'
});

var isAndroid = false;

if (OS_ANDROID) {
    isAndroid = true;
	$.settingsWindow.orientationModes = [Titanium.UI.PORTRAIT];

	$.settingsWindow.addEventListener('open', function() {
		Alloy.Globals.setAndroidCouponMenu($.settingsWindow.activity);
		
		$.settingsWindow.activity.actionBar.onHomeIconItemSelected = function() {
			$.settingsWindow.close();
			$.settingsWindow = null;
		};
		$.settingsWindow.activity.actionBar.displayHomeAsUp = true;
		$.settingsWindow.activity.actionBar.title = Alloy.Globals.PHRASES.settingsTxt;
	});
} else {
    $.settingsWindow.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.settingsTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });
}

var picker;

// hide modal pickers (ios)
$.settingsWindow.addEventListener('close', function() {
	indicator.closeIndicator();
	if (!isAndroid) {
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
			Ti.API.error('Bad Sever =>' + JSON.stringify(e));
			if(e.code === 400) {
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.nameUnique);
			}
		};

		try {
			xhr.open('POST', Alloy.Globals.BETKAMPENSETTINGURL);
			xhr.setRequestHeader("content-type", "application/json");
			xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
			xhr.setTimeout(Alloy.Globals.TIMEOUT);
			xhr.send(param);
		} catch(e) {
			indicator.closeIndicator();
			Alloy.Globals.showFeedbackDialog(JSON.stringify(e));
		}

		xhr.onload = function() {
			if (this.status == '200') {
				if (this.readyState == 4) {
					if (type === 0) {
						// store value about push
						Ti.App.Properties.setBool("pushSetting", valueToStore);
					} else if(type === 1) {
						// name change
						Alloy.Globals.PROFILENAME = valueToStore;
						
						// set name in view
						$.profile_name_value_label.text = valueToStore;   
                        if(Alloy.Globals.PROFILENAME.length > 10) {
                            $.profile_name_value_label.text = Alloy.Globals.PROFILENAME.substring(0, 7) + '...';
                        }
						
						// update event
						Ti.App.fireEvent('app:updateMenu');
					}
					Alloy.Globals.showToast(JSON.parse(this.responseText));
				}
				indicator.closeIndicator();
			} else {
				indicator.closeIndicator();
				Alloy.Globals.showToast(JSON.parse(this.responseText));
				Ti.API.error("Error =>" + this.response);
			}
		};
	} else {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
	}
}

function createGUI() {
    if (isAndroid) {
        $.table.headerView = Ti.UI.createView({
            height : 0.5,
            backgroundColor : '#303030'
        });

        $.table.footerView = Ti.UI.createView({
            height : 0.5,
            backgroundColor : '#303030'
        });
    } else {
        $.table.headerView = Ti.UI.createView({
            height : 0.3,
            top : 0,
            width : Ti.UI.FILL,
            layout : 'vertical',
            backgroundColor : '#303030',
        });

        $.table.footerView = Ti.UI.createView({
            height : 0,
            top : 0,
            width : Ti.UI.FILL,
            layout : 'vertical',
            backgroundColor : "transparent",
        });
    }
   
    
    /* First row */
    $.language_row.add(createPickers());
    $.language_row.addEventListener('click', function() {
        if(picker.open) {
            // the picker is visible, don't do anything
            return;
        }
        picker.fireEvent('click'); 
    });
    
    /* Second row */
   var pushEnabled;

    // true will be set if no stored value is found
    if (!Ti.App.Properties.hasProperty("pushSetting")) {
        Ti.App.Properties.setBool("pushSetting", true);
    }

    pushEnabled = Ti.App.Properties.getBool('pushSetting');
    var basicSwitch;

    if (!isAndroid) {
        basicSwitch = Ti.UI.createSwitch({
            right : 10,
            width : 40,
            titleOn : Alloy.Globals.PHRASES.onTxt,
            titleOff : Alloy.Globals.PHRASES.offTxt,
            value : pushEnabled
        });
    } else {
        var RealSwitch = require('com.yydigital.realswitch');
        
        basicSwitch = RealSwitch.createRealSwitch({
            right : 20,
            width : 90,
            value : pushEnabled
        });
    }
    
    basicSwitch.addEventListener('change', function(e) {
        var value = 0;
        if(basicSwitch.value) {
            value = 1;
        }
        
        // build the json string
        var deviceType = Titanium.Platform.osname;
        var param = '{"device_token":"' + Alloy.Globals.DEVICETOKEN + '", "device_type":"' + deviceType + '", "push_status":' + value + ', "app_identifier":"' + Alloy.Globals.APPID + '", "lang":"' + Alloy.Globals.LOCALE + '"}';
        // send to backend
        if(Alloy.Globals.DEVICETOKEN){
            // only send if not emulator
            sendSettingsServer(param, 0, basicSwitch.value);
        } 
    });
    $.push_notification_row.selectionStyle = 'none';
    $.push_notification_row.add(basicSwitch);
    
    /* Third row */
    $.upload_indicator.message = $.upload_indicator.message + '...';
   
    $.profile_picture_row.addEventListener('click', function() {
        if(Alloy.Globals.FACEBOOKOBJECT) {
            Alloy.Globals.showToast(Alloy.Globals.PHRASES.fbImageChangeError);
            return;
        }
        
        Ti.Media.openPhotoGallery({
            success : function(event) {
                // check connection
                if (Alloy.Globals.checkConnection()) {
                    var image = event.media;
                    $.upload_indicator.show();

                    var xhr = Titanium.Network.createHTTPClient();
                    xhr.onerror = function(e) {
                        Ti.API.error('Bad Sever =>' + JSON.stringify(e));
                        $.upload_indicator.hide();
                        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.imageUploadError);
                    };

                    xhr.onsendstream = function(e) {
                        // upload progress
                        $.upload_indicator.value = e.progress;
                    };

                    try {
                        xhr.open('POST', Alloy.Globals.BETKAMPENIMAGEUPLOADURL + '?lang=' + Alloy.Globals.LOCALE);
                        xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
                        xhr.setTimeout(Alloy.Globals.TIMEOUT);

                        xhr.send({
                            media : image
                        });
                    } catch(e) {
                        $.upload_indicator.hide();
                        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                    }

                    xhr.onload = function() {
                        if (this.status == '200') {
                            var response = JSON.parse(this.responseText);
                            Alloy.Globals.showToast(response);
                            $.upload_indicator.hide();
                        } else {
                            $.upload_indicator.hide();
                            Ti.API.error("Error =>" + this.response);
                            Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
                        }
                    };
                } else {
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
                }
            },
            cancel : function() {
                // Do nothing
                // TODO
            },
            error : function() {
                // some error trying to access photos
                Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            },
            allowEditing : true,
            mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
        });

    });

   /* Fourth row */
   
   if(Alloy.Globals.PROFILENAME.length > 10) {
       $.profile_name_value_label.text = Alloy.Globals.PROFILENAME.substring(0, 7) + '...';
   }
   
   $.profile_name_row.addEventListener('click', function() {
        var dialog;
        var profileName = Alloy.Globals.PROFILENAME;
        var confirm = Alloy.Globals.PHRASES.okConfirmTxt;
        var cancel = Alloy.Globals.PHRASES.abortBtnTxt;
        var titleTxt = Alloy.Globals.PHRASES.profileNameTitleTxt;
        var messageTxt = Alloy.Globals.PHRASES.profileNameMessageTxt + ": " + profileName;

        if (!isAndroid) {
            dialog = Ti.UI.createAlertDialog({
                title : titleTxt,
                message : messageTxt,
                style : Ti.UI.iPhone.AlertDialogStyle.PLAIN_TEXT_INPUT,
                buttonNames : [confirm, cancel]
            });

        } else {
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
                    Alloy.Globals.showToast(Alloy.Globals.PHRASES.groupNameErrorTxt);
                }
            } else {
                dialog.hide();
            }
        });
        dialog.show();
    });

    /* Fifth row */
    $.bluetooth_settings_row.addEventListener('click', function() {
        if (!isAndroid) {
            Ti.Platform.openURL('prefs:root=Brightness prefs:root=General&path=Bluetooth');
        } else {
            var intent = Ti.Android.createIntent({
                className : 'com.android.settings.bluetooth.BluetoothSettings',
                packageName : 'com.android.settings',
                action : Ti.Android.ACTION_MAIN,
            });
            Ti.Android.currentActivity.startActivity(intent);
        }
    });
}

function createPickers() {
	var data = [];
	var dataAndroid = {};
	var currentLocale = JSON.parse(Ti.App.Properties.getString('language'));
	var currentLanguage;
	var currentLangPosAndroid;
	var pos = 0;
	
	for (var lang in Alloy.Globals.AVAILABLELANGUAGES) {
		if (currentLocale.language == Alloy.Globals.AVAILABLELANGUAGES[lang].name) {
			currentLanguage = Alloy.Globals.AVAILABLELANGUAGES[lang].description;
			
			// can't keep 0 index on android picker widget
			currentLangPosAndroid = (lang - 0) + 1;
		}

		data.push(Titanium.UI.createPickerRow({
			title : Alloy.Globals.AVAILABLELANGUAGES[lang].description,
			value : lang
		}));
		
		// for android picker widget
		pos = (lang - 0) + 1;
		dataAndroid[pos] = Alloy.Globals.AVAILABLELANGUAGES[lang].description;
	}

	if (isAndroid) {
		picker = Ti.UI.createLabel({
		    right : 20,
            backgroundColor : 'transparent',
            width : Ti.UI.SIZE,
            height : Ti.UI.SIZE,
            textAlign : 'left',
            color : '#FFF',
			text : currentLanguage,
			font : Alloy.Globals.FONT
		});
		
		picker.addEventListener('click', function() {
		    picker.open = true;
			Alloy.createWidget('danielhanold.pickerWidget', {
				id : 'sColumnLanguage',
				outerView : $.settingsWindow,
				hideNavBar : false,
				type : 'single-column',
				selectedValues : [currentLangPosAndroid],
				pickerValues : [dataAndroid],
				onDone : function(e) {
					if (e.data) {
						// change language
						// key can't be 0, that's why we need to "-1"
						changeLanguageConfirm(e.data[0].key - 1);
					}
					picker.open = false;
				},
			});
		});
	} else {
		var ModalPicker = require("lib/ModalPicker");
		var visualPrefs = {
			right : 20,
			backgroundColor : '#000',
			width : Ti.UI.SIZE,
			height : Ti.UI.SIZE,
			textAlign : 'left',
			color : '#FFF',
			font : Alloy.Globals.FONT
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
			if (isAndroid) {
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

// Lås table? if table > Alloy.Globals.deviceHeight = lås upp
// TODO fix so we can notify clients about a language change in phrases.
// TODO Bluetooth funkar inte ios
// TODO use toast and not dialog.