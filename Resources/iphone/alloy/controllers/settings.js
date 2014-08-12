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
        var ModalPicker = require("lib/ModalPicker");
        var visualPrefs = {
            top: 5,
            opacity: .85,
            borderRadius: 3,
            backgroundColor: "#FFF",
            width: 140,
            height: 40,
            textAlign: "center"
        };
        picker = new ModalPicker(visualPrefs, data, Alloy.Globals.PHRASES.chooseConfirmBtnTxt);
        picker.text = currentLanguage;
        picker.self.addEventListener("change", function() {
            changeLanguageConfirm(picker.value);
        });
        $.settingsView.add(picker);
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
                Ti.App._restart();
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
        backgroundColor: "#303030",
        apiName: "Ti.UI.Window",
        classes: [ "container" ],
        id: "settingsWindow"
    });
    $.__views.settingsWindow && $.addTopLevelView($.__views.settingsWindow);
    $.__views.settingsView = Ti.UI.createView({
        layout: "vertical",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
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
    var picker;
    $.settingsWindow.addEventListener("close", function() {
        indicator.closeIndicator();
        picker.close();
    });
    $.settingsView.add(Ti.UI.createLabel({
        height: 20,
        top: 20,
        width: "100%",
        textAlign: "center",
        backgroundColor: "#303030",
        color: "#FFF",
        text: Alloy.Globals.PHRASES.changeLanguageTxt,
        font: {
            fontFamily: Alloy.Globals.getFont(),
            fontSize: Alloy.Globals.getFontSize(2)
        }
    }));
    createPickers();
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;