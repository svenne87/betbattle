function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function changeLanguageConfirm(lang) {
        var languageDescription = Alloy.Globals.AVAILABLELANGUAGES[lang].description;
        var alertWindow = Titanium.UI.createAlertDialog({
            title: Alloy.Globals.PHRASES.betbattleTxt,
            message: Alloy.Globals.PHRASES.confirmLanguageChangeTxt + ' "' + languageDescription + '"?',
            buttonNames: [ Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.abortBtnTxt ]
        });
        alertWindow.addEventListener("click", function(e) {
            switch (e.index) {
              case 0:
                alertWindow.hide();
                Alloy.Globals.LOCALE = Alloy.Globals.AVAILABLELANGUAGES[lang].name;
                getLanguage();
                break;

              case 1:
                alertWindow.hide();
            }
        });
        alertWindow.show();
    }
    function sendSettingsServer(param, type, valueToStore) {
        if (Alloy.Globals.checkConnection()) {
            indicator.openIndicator();
            var xhr = Titanium.Network.createHTTPClient();
            xhr.onerror = function(e) {
                indicator.closeIndicator();
                Ti.API.error("Bad Sever =>" + e.error);
            };
            try {
                xhr.open("POST", Alloy.Globals.BETKAMPENSETTINGURL);
                xhr.setRequestHeader("content-type", "application/json");
                xhr.setRequestHeader("Authorization", Alloy.Globals.FACEBOOK.accessToken);
                xhr.setTimeout(Alloy.Globals.TIMEOUT);
                xhr.send(param);
            } catch (e) {
                indicator.closeIndicator();
                Alloy.Globals.showFeedbackDialog(JSON.parse(this.response));
            }
            xhr.onload = function() {
                if ("200" == this.status) {
                    if (4 == this.readyState) {
                        0 === type ? Ti.App.Properties.setBool("pushSetting", valueToStore) : 1 === type && Ti.App.Properties.setString("profileNameSetting", valueToStore);
                        Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
                    } else Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
                    indicator.closeIndicator();
                } else {
                    indicator.closeIndicator();
                    Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
                    Ti.API.error("Error =>" + this.response);
                }
            };
        } else Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }
    function createGUI() {
        $.settingsView.add(Ti.UI.createLabel({
            height: "auto",
            top: 20,
            width: "100%",
            textAlign: "center",
            backgroundColor: "transparent",
            color: "#FFF",
            text: "Settings",
            font: {
                fontFamily: "Impact",
                fontSize: Alloy.Globals.getFontSize(2)
            }
        }));
        var row = Ti.UI.createView({
            top: 20,
            backgroundColor: "#FFF",
            width: "97%",
            height: 60,
            opacity: .7,
            borderRadius: 10
        });
        row.add(Ti.UI.createLabel({
            text: Alloy.Globals.PHRASES.changeLanguageTxt,
            textAlign: "center",
            top: 20,
            left: 5,
            font: {
                fontSize: Alloy.Globals.getFontSize(1),
                fontFamily: "Impact"
            },
            color: "#000"
        }));
        row.add(createPickers());
        $.settingsView.add(row);
        var secondRow = Ti.UI.createView({
            top: 20,
            backgroundColor: "#FFF",
            width: "97%",
            height: 60,
            opacity: .7,
            borderRadius: 10
        });
        secondRow.add(Ti.UI.createLabel({
            text: Alloy.Globals.PHRASES.settingsPushTxt,
            textAlign: "center",
            top: 20,
            left: 5,
            font: {
                fontSize: Alloy.Globals.getFontSize(1),
                fontFamily: "Impact"
            },
            color: "#000"
        }));
        var pushEnabled;
        Ti.App.Properties.hasProperty("pushSetting") || Ti.App.Properties.setBool("pushSetting", true);
        pushEnabled = Ti.App.Properties.getBool("pushSetting");
        var basicSwitch;
        var RealSwitch = require("com.yydigital.realswitch");
        basicSwitch = RealSwitch.createRealSwitch({
            right: 40,
            top: 15,
            width: 90,
            value: pushEnabled
        });
        basicSwitch.addEventListener("change", function() {
            var param = '{"push_status":"' + basicSwitch.value + '", "app_identifier":"' + Alloy.Globals.APPID + '", "lang":"' + Alloy.Globals.LOCALE + '"}';
            sendSettingsServer(param, 0, basicSwitch.value);
        });
        secondRow.add(basicSwitch);
        $.settingsView.add(secondRow);
        var thirdRow = Ti.UI.createView({
            top: 20,
            backgroundColor: "#FFF",
            width: "97%",
            height: 60,
            opacity: .7,
            borderRadius: 10
        });
        thirdRow.add(Ti.UI.createLabel({
            text: Alloy.Globals.PHRASES.settingsPicTxt,
            textAlign: "center",
            top: 20,
            left: 5,
            font: {
                fontSize: Alloy.Globals.getFontSize(1),
                fontFamily: "Impact"
            },
            color: "#000"
        }));
        var rightPos = 60;
        var font = "FontAwesome";
        rightPos = 40;
        font = "fontawesome-webfont";
        thirdRow.add(Ti.UI.createLabel({
            font: {
                fontFamily: font
            },
            text: fontawesome.icon("icon-chevron-right"),
            right: rightPos,
            color: "#000",
            fontSize: 80,
            height: "auto",
            width: "auto"
        }));
        thirdRow.addEventListener("click", function() {
            Ti.Media.openPhotoGallery({
                success: function(event) {
                    if (Alloy.Globals.checkConnection()) {
                        var image = event.media;
                        uploadIndicator.show();
                        var xhr = Titanium.Network.createHTTPClient();
                        xhr.onerror = function(e) {
                            Ti.API.error("Bad Sever =>" + e.error);
                            uploadIndicator.hide();
                        };
                        xhr.onsendstream = function(e) {
                            uploadIndicator.value = e.progress;
                        };
                        try {
                            xhr.open("POST", Alloy.Globals.BETKAMPENIMAGEUPLOADURL + "?lang=" + Alloy.Globals.LOCALE);
                            xhr.setRequestHeader("Authorization", Alloy.Globals.FACEBOOK.accessToken);
                            xhr.setRequestHeader("Content-Type", "multipart/form-data");
                            xhr.setTimeout(Alloy.Globals.TIMEOUT);
                            xhr.send({
                                media: image,
                                filename: "profile_image_" + Alloy.Globals.BETKAMPENUID + ".png"
                            });
                        } catch (e) {
                            uploadIndicator.hide();
                        }
                        xhr.onload = function() {
                            if ("200" == this.status) {
                                if (4 == this.readyState) {
                                    var response = JSON.parse(this.responseText);
                                    Alloy.Globals.showFeedbackDialog(response);
                                } else Ti.API.log(this.response);
                                uploadIndicator.hide();
                            } else {
                                uploadIndicator.hide();
                                Ti.API.error("Error =>" + this.response);
                            }
                        };
                    } else Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
                },
                cancel: function() {},
                error: function() {
                    Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
                },
                allowEditing: true,
                mediaTypes: [ Ti.Media.MEDIA_TYPE_PHOTO ]
            });
        });
        $.settingsView.add(thirdRow);
        var fourthRow = Ti.UI.createView({
            top: 20,
            backgroundColor: "#FFF",
            width: "97%",
            height: 60,
            opacity: .7,
            borderRadius: 10
        });
        fourthRow.add(Ti.UI.createLabel({
            text: Alloy.Globals.PHRASES.settingsProfileTxt,
            textAlign: "center",
            top: 20,
            left: 5,
            font: {
                fontSize: Alloy.Globals.getFontSize(1),
                fontFamily: "Impact"
            },
            color: "#000"
        }));
        fourthRow.add(Ti.UI.createLabel({
            font: {
                fontFamily: font
            },
            text: fontawesome.icon("icon-chevron-right"),
            right: rightPos,
            color: "#000",
            fontSize: 80,
            height: "auto",
            width: "auto"
        }));
        fourthRow.addEventListener("click", function() {
            var dialog;
            var profileName = Ti.App.Properties.getString("profileNameSetting");
            var confirm = Alloy.Globals.PHRASES.okConfirmTxt;
            var cancel = Alloy.Globals.PHRASES.abortBtnTxt;
            var titleTxt = Alloy.Globals.PHRASES.profileNameTitleTxt;
            var messageTxt = Alloy.Globals.PHRASES.profileNameMessageTxt + ": " + profileName;
            var textfield = Ti.UI.createTextField();
            textfield.value = profileName;
            dialog = Ti.UI.createAlertDialog({
                title: titleTxt,
                message: messageTxt,
                androidView: textfield,
                buttonNames: [ confirm, cancel ]
            });
            dialog.addEventListener("click", function(e) {
                if (0 == e.index) {
                    var text;
                    text = textfield.value;
                    if (text.length > 2 && 16 > text.length) {
                        profileName = text;
                        var param = '{"profile_name":"' + profileName + '", "app_identifier":"' + Alloy.Globals.APPID + '", "lang":"' + Alloy.Globals.LOCALE + '"}';
                        sendSettingsServer(param, 1, profileName);
                    } else Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.groupNameErrorTxt);
                } else dialog.hide();
            });
            dialog.show();
        });
        $.settingsView.add(fourthRow);
        var fifthRow = Ti.UI.createView({
            top: 20,
            backgroundColor: "#FFF",
            width: "97%",
            height: 60,
            opacity: .7,
            borderRadius: 10
        });
        fifthRow.add(Ti.UI.createLabel({
            text: Alloy.Globals.PHRASES.settingsBluetoothTxt,
            textAlign: "center",
            top: 20,
            left: 5,
            font: {
                fontSize: Alloy.Globals.getFontSize(1),
                fontFamily: "Impact"
            },
            color: "#000"
        }));
        fifthRow.add(Ti.UI.createLabel({
            font: {
                fontFamily: font
            },
            text: fontawesome.icon("icon-chevron-right"),
            right: rightPos,
            color: "#000",
            fontSize: 80,
            height: "auto",
            width: "auto"
        }));
        fifthRow.addEventListener("click", function() {
            var intent = Ti.Android.createIntent({
                className: "com.android.settings.bluetooth.BluetoothSettings",
                packageName: "com.android.settings",
                action: Ti.Android.ACTION_MAIN
            });
            Ti.Android.currentActivity.startActivity(intent);
        });
        $.settingsView.add(fifthRow);
        var style = Titanium.UI.iPhone.ProgressBarStyle.PLAIN;
        style = Titanium.UI.Android.PROGRESS_INDICATOR_STATUS_BAR;
        var uploadIndicator = Titanium.UI.createProgressBar({
            width: 200,
            height: 50,
            min: 0,
            max: 1,
            value: 0,
            style: style,
            top: 10,
            message: Alloy.Globals.PHRASES.imageUploadTxt + "...",
            font: {
                fontSize: Alloy.Globals.getFontSize(1),
                fontWeight: "bold"
            },
            color: "#888"
        });
        $.settingsView.add(uploadIndicator);
        uploadIndicator.hide();
    }
    function createPickers() {
        var data = [];
        var currentLocale = JSON.parse(Ti.App.Properties.getString("language"));
        var currentLanguage;
        for (var lang in Alloy.Globals.AVAILABLELANGUAGES) {
            currentLocale.language == Alloy.Globals.AVAILABLELANGUAGES[lang].name && (currentLanguage = Alloy.Globals.AVAILABLELANGUAGES[lang].description);
            data.push(Titanium.UI.createPickerRow({
                title: Alloy.Globals.AVAILABLELANGUAGES[lang].description,
                value: lang
            }));
        }
        picker = Titanium.UI.createPicker({
            type: Titanium.UI.PICKER_TYPE_PLAIN,
            width: Ti.UI.SIZE,
            top: 20,
            height: Ti.UI.SIZE,
            right: 40
        });
        picker.addEventListener("change", function() {
            changeLanguageConfirm(picker.getSelectedRow(0).value);
        });
        picker.add(data);
        picker.columns[0].width = Ti.UI.SIZE;
        picker.columns[0].height = Ti.UI.SIZE;
        picker.selectionIndicator = true;
        return picker;
    }
    function showAlertWithRestartNote() {
        var alertWindow = Titanium.UI.createAlertDialog({
            title: Alloy.Globals.PHRASES.betbattleTxt,
            message: Alloy.Globals.PHRASES.appRestartTxt,
            buttonNames: [ Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.abortBtnTxt ]
        });
        alertWindow.addEventListener("click", function(e) {
            switch (e.index) {
              case 0:
                alertWindow.hide();
                Alloy.Globals.MAINWIN.close();
                Alloy.Globals.LANDINGWIN.close();
                $.settingsWindow.exitOnClose = true;
                $.settingsWindow.close();
                var activity = Titanium.Android.currentActivity;
                activity.finish();
                var intent = Ti.Android.createIntent({
                    action: Ti.Android.ACTION_MAIN,
                    url: "Betkampen.js"
                });
                intent.addCategory(Ti.Android.CATEGORY_LAUNCHER);
                Ti.Android.currentActivity.startActivity(intent);
                break;

              case 1:
                alertWindow.hide();
            }
        });
        alertWindow.show();
    }
    function getLanguage() {
        if (Alloy.Globals.checkConnection()) {
            indicator.openIndicator();
            var xhr = Titanium.Network.createHTTPClient();
            xhr.onerror = function(e) {
                Ti.API.error("Bad Sever =>" + e.error);
                doError();
            };
            try {
                xhr.open("GET", Alloy.Globals.GETLANGUAGE + "?lang=" + Alloy.Globals.LOCALE);
                xhr.setRequestHeader("content-type", "application/json");
                xhr.setTimeout(Alloy.Globals.TIMEOUT);
                xhr.send();
            } catch (e) {
                doError();
            }
            xhr.onload = function() {
                if ("200" == this.status) {
                    if (4 == this.readyState) {
                        var file1 = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, "language.json");
                        file1.write(this.responseText);
                        Alloy.Globals.PHRASES = JSON.parse(file1.read().text);
                        Ti.App.Properties.setString("language", JSON.stringify({
                            language: Alloy.Globals.LOCALE
                        }));
                        Ti.App.Properties.setString("languageSelected", JSON.stringify({
                            languageSelected: true
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
                title: "Bet Battle",
                message: "No internet connection detected!",
                buttonNames: [ "OK" ]
            });
            alertWindow.addEventListener("click", function(e) {
                switch (e.index) {
                  case 0:
                    alertWindow.hide();
                }
            });
            alertWindow.show();
        }
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "settings";
    if (arguments[0]) {
        __processArg(arguments[0], "__parentSymbol");
        __processArg(arguments[0], "$model");
        __processArg(arguments[0], "__itemTemplate");
    }
    var $ = this;
    var exports = {};
    $.__views.settingsWindow = Ti.UI.createWindow({
        layout: "vertical",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        backgroundImage: "/images/profileBG.jpg",
        apiName: "Ti.UI.Window",
        classes: [ "container" ],
        id: "settingsWindow"
    });
    $.__views.settingsWindow && $.addTopLevelView($.__views.settingsWindow);
    $.__views.settingsView = Ti.UI.createView({
        layout: "vertical",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        backgroundColor: "transparent",
        apiName: "Ti.UI.View",
        id: "settingsView",
        classes: []
    });
    $.__views.settingsWindow.add($.__views.settingsView);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var uie = require("lib/IndicatorWindow");
    var indicator = uie.createIndicatorWindow({
        top: 200,
        text: Alloy.Globals.PHRASES.loadingTxt
    });
    var fontawesome = require("lib/IconicFont").IconicFont({
        font: "lib/FontAwesome"
    });
    $.settingsWindow.orientationModes = [ Titanium.UI.PORTRAIT ];
    $.settingsWindow.addEventListener("open", function() {
        $.settingsWindow.activity.actionBar.onHomeIconItemSelected = function() {
            $.settingsWindow.close();
            $.settingsWindow = null;
        };
        $.settingsWindow.activity.actionBar.displayHomeAsUp = true;
        $.settingsWindow.activity.actionBar.title = Alloy.Globals.PHRASES.betbattleTxt;
    });
    var picker;
    $.settingsWindow.addEventListener("close", function() {
        indicator.closeIndicator();
    });
    createGUI();
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;