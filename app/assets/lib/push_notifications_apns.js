var apns = function(){
  Titanium.Network.registerForPushNotifications({
    types: [
        Titanium.Network.NOTIFICATION_TYPE_BADGE,
        Titanium.Network.NOTIFICATION_TYPE_ALERT
    ],
    success:function(e)
    {
        var deviceToken = e.deviceToken;
        Ti.API.info("Push notification device token is: "+deviceToken);
        Ti.API.info("Push notification types: "+Titanium.Network.remoteNotificationTypes);
        Ti.API.info("Push notification enabled: "+Titanium.Network.remoteNotificationsEnabled);
     
       	// send token to our server
       	Alloy.Globals.postDeviceToken(e.deviceToken);
    },
    error:function(e)
    {
        Ti.API.info("Error during registration: "+e.error);
    },
    callback:function(e)
    {
        // called when a push notification is received.
      Titanium.Media.vibrate();
      //var data = JSON.parse(e.data);
      var data = e.data;
      var badge = data.badge;
      if(badge > 0){
        Titanium.UI.iPhone.appBadge = badge;
      }
      var message = data.alert;
      if(message != ''){
        var my_alert = Ti.UI.createAlertDialog({title:'Betkampen', message:message});
        my_alert.show();
        my_alert.addEventListener('click', function(e) {
			my_alert.hide();
			Ti.App.fireEvent('challengesViewRefresh');
			Ti.UI.iPhone.setAppBadge(0);
		});
        
      }
    }
  }); 
};
exports = {apns:apns};