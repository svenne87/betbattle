/* This is the app's entry point */

var opened = Ti.App.Properties.getString('appLaunch');
var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200
});

function doLogin() {
    var login = Alloy.createController('login').getView();

    if (OS_IOS) {
        login.open({
            modal : false
        });
        Alloy.Globals.INDEXWIN = login;
        login = null;
        $.indexWin.close();
    } else if (OS_ANDROID) {
        login.open({
            closeOnExit : true,
            fullScreen : true,
            navBarHidden : true
        });
        login.orientationModes = [Titanium.UI.PORTRAIT];
        Alloy.Globals.INDEXWIN = login;
        login = null;

        $.indexWin.close();
        var activity = Titanium.Android.currentActivity;
        activity.finish();
    }
}

function doDowloadError() {
    // display welcome dialog
    var alertWindow = Titanium.UI.createAlertDialog({
        title : Alloy.Globals.PHRASES.betbattleTxt,
        message : "An error occured when downloading app tutorial content, retry?",
        buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.abortBtnTxt]
    });

    alertWindow.addEventListener('click', function(ev) {
        switch(ev.index) {
        case 0:
            //finally
            downloadTutorial();
            break;
        case 1:
            Ti.App.Properties.setString("appLaunch", JSON.stringify({
                opened : true
            }));
            doLogin();
            break;
        }
    });
    alertWindow.show();
}

function downloadTutorial() {
    var platform = "";
    if (Alloy.Globals.checkConnection()) {
        indicator.setText("Downloading app content...");
        indicator.openIndicator();

        if (OS_IOS) {
            platform = "iphone";
        } else if (OS_ANDROID) {
            platform = "android";
        }
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            Ti.API.error('Bad Sever =>' + JSON.stringify(e));
            indicator.closeIndicator();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            doDowloadError();
        };

        try {
            xhr.open('POST', Alloy.Globals.BETKAMPENGETTUTORIALURL + "?lang=" + Alloy.Globals.LOCALE + '&platform=' + platform);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setTimeout(Alloy.Globals.TIMEOUT);
            xhr.send();
        } catch(e) {
            indicator.closeIndicator();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            doDowloadError();
        }

        xhr.onload = function() {
            if (this.status == '200') {
                if (this.readyState == 4) {
                    var response = JSON.parse(this.responseText);
                    var imageLocationArray = [];
                    var doneCount = 0;

                    indicator.setText("Downloading app content...");
                    indicator.openIndicator();

                    // download each file
                    for (var img in response) {
                        var inline_function = function(img) {
                            var imageDownloader = Titanium.Network.createHTTPClient();
                            imageDownloader.setTimeout(Alloy.Globals.TIMEOUT);

                            imageDownloader.onload = function(e) {
                                var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'tut_' + response[img] + '.png');
                                f.write(this.responseData);
                                imageLocationArray.push(f.nativePath);
                                doneCount++;

                                if (doneCount == response.length) {
                                    // store the array on phone
                                    Ti.App.Properties.setString("tutorial_images", JSON.stringify(imageLocationArray));
                                    indicator.closeIndicator();

                                    // display welcome dialog
                                    var alertWindow = Titanium.UI.createAlertDialog({
                                        title : Alloy.Globals.PHRASES.betbattleTxt,
                                        message : Alloy.Globals.PHRASES.welcomePhrase,
                                        buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt]
                                    });

                                    alertWindow.addEventListener('click', function(ev) {
                                        switch(ev.index) {
                                        case 0:
                                            //finally
                                            Ti.App.Properties.setString("appLaunch", JSON.stringify({
                                                opened : true
                                            }));
                                            doLogin();
                                            break;
                                        default:
                                            Ti.App.Properties.setString("appLaunch", JSON.stringify({
                                                opened : true
                                            }));
                                            doLogin();
                                            break;
                                        }
                                    });
                                    alertWindow.show();

                                }
                            };

                            imageDownloader.open("GET", Alloy.Globals.BETKAMPENURL + '/tutorial/' + platform + '/' + Alloy.Globals.LOCALE + '/tut_' + response[img] + '.png');
                            imageDownloader.send();
                        };
                        inline_function(img);
                    }
                }
            }
        };
    } else {
        indicator.closeIndicator();
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
    }
}

function openLogin() {
    if (!opened) {
        downloadTutorial();
    } else {
        doLogin();
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
if (language) {
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


// när man stänger fönster, dölj med opacity innan...  
// http://developer.appcelerator.com/question/145806/how-to-prevent-duplicate-actions-in-titanium
