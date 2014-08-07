function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function openLogin() {
        var login;
        var login = Alloy.createController("login").getView();
        login.open({
            modal: false
        });
        Alloy.Globals.INDEXWIN = login;
        login = null;
    }
    function doError() {
        indicator.closeIndicator();
        var alertWindow = Titanium.UI.createAlertDialog({
            title: "Something went wrong!",
            message: "An error occured while trying to fetch your local language files. Please try again.",
            buttonNames: [ "OK", "Cancel" ]
        });
        alertWindow.addEventListener("click", function(e) {
            switch (e.index) {
              case 0:
                alertWindow.hide();
                indicator.openIndicator();
                getLanguage();
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
    this.__controllerPath = "index";
    if (arguments[0]) {
        __processArg(arguments[0], "__parentSymbol");
        __processArg(arguments[0], "$model");
        __processArg(arguments[0], "__itemTemplate");
    }
    var $ = this;
    var exports = {};
    $.__views.index = Ti.UI.createWindow({
        layout: "vertical",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        backgroundColor: "transparent",
        apiName: "Ti.UI.Window",
        classes: [ "container" ],
        id: "index"
    });
    $.__views.index && $.addTopLevelView($.__views.index);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var uie = require("lib/IndicatorWindow");
    var indicator = uie.createIndicatorWindow({
        top: 200
    });
    getLanguage();
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;