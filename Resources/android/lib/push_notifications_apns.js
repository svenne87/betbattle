var apns = function() {
    Titanium.Network.registerForPushNotifications({
        types: [ Titanium.Network.NOTIFICATION_TYPE_BADGE, Titanium.Network.NOTIFICATION_TYPE_ALERT ],
        success: function(e) {
            var deviceToken = e.deviceToken;
            Ti.API.info("Push notification device token is: " + deviceToken);
            Ti.API.info("Push notification types: " + Titanium.Network.remoteNotificationTypes);
            Ti.API.info("Push notification enabled: " + Titanium.Network.remoteNotificationsEnabled);
            Alloy.Globals.postDeviceToken(e.deviceToken);
        },
        error: function(e) {
            Ti.API.info("Error during registration: " + e.error);
        },
        callback: function(e) {
            Titanium.Media.vibrate();
            var data = e.data;
            Ti.API.info("DATA : " + JSON.stringify(data));
            var badge = data.badge;
            badge > 0 && (Titanium.UI.iPhone.appBadge = badge);
            var message = data.alert;
            if ("" != message) {
                var my_alert = Ti.UI.createAlertDialog({
                    title: "Betkampen",
                    message: message
                });
                my_alert.show();
                my_alert.addEventListener("click", function() {
                    Ti.API.info("CLICKADE PÅ NOTIFICATION");
                    Ti.API.info("BADGE : " + JSON.stringify(Ti.UI.iPhone.appBadge));
                    my_alert.hide();
                    Ti.UI.iPhone.setAppBadge(0);
                    Titanium.UI.iPhone.appBadge = 0;
                    args = {
                        refresh: 1
                    };
                    var loginSuccessWindow = Alloy.createController("main", args).getView();
                    loginSuccessWindow.open({
                        fullScreen: true,
                        navBarHidden: false,
                        orientationModes: [ Titanium.UI.PORTRAIT ]
                    });
                    loginSuccessWindow = null;
                });
            }
        }
    });
};

exports = {
    apns: apns
};