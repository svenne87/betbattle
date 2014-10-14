var apns = function(){
    var typesArray = [];
    
    // only send types with if iOS version is less than 8
    if(parseInt(Ti.Platform.version.split(".")[0]) < 8) {
        typesArray = [
            Titanium.Network.NOTIFICATION_TYPE_BADGE,
            Titanium.Network.NOTIFICATION_TYPE_ALERT
        ];
    }  
    
  Titanium.Network.registerForPushNotifications({
    types: typesArray,
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
      Ti.API.info("DATA : " + JSON.stringify(data));
      var badge = data.badge;
      if(badge > 0){
        Titanium.UI.iPhone.appBadge = badge;
      }
      var message = data.alert;
      if(message != ''){
         var type = '';
         
         if(message.charAt(0) === '1') {
             message = message.substring(1);
             type = 'accept';
         } else if (message.charAt(0) === '2'){
             message = message.substring(1);
             type = 'pedning';
         } else if(message.charAt(0) === '3') {
             message = message.substring(1);
             type = 'finished';
         }
                
         var my_alert = Ti.UI.createAlertDialog({title:Alloy.Globals.PHRASES.betbattleTxt, message:message});
         my_alert.show();
         my_alert.addEventListener('click', function(e) {
            Ti.API.info("CLICKADE PÅ NOTIFICATION");
        	Ti.API.info("BADGE : " + JSON.stringify(Ti.UI.iPhone.appBadge));
			my_alert.hide();
			Ti.UI.iPhone.setAppBadge(0);
			Titanium.UI.iPhone.appBadge = 0;
	         
            if(Alloy.Globals.MAINWIN !== null) {
                var obj = {
                    controller : 'challengesView',
                    arg : {refresh : true}
                };
                
                var args = {refresh:true};
                var win = null;
                
                if(type === 'accept') {
                    win = Alloy.createController('challenges_new', args).getView();
                } else if(type === 'pending') {
                    win = Alloy.createController('challenges_pending', args).getView();
                } else if(type === 'finished') {
                    win = Alloy.createController('challenges_finished', args).getView();   
                }
                
                Ti.App.fireEvent('app:updateView', obj);
               
                if(win !== null) {
                    Alloy.Globals.NAV.openWindow(win);
                    win = null;  
                } 
          
                for(var w in Alloy.Globals.WINDOWS) {
                    Ti.API.log(Alloy.Globals.WINDOWS[w] + " " + win);
                   if(Alloy.Globals.WINDOWS[w] === win) {
                      Alloy.Globals.WINDOWS[w].close();
                   }
                }
  
            } else {
                var loginSuccessWindow = Alloy.createController('main').getView();
                loginSuccessWindow.open({
                    fullScreen : true
                });
                loginSuccessWindow = null;
                
                var win = null;
                
                if(type === 'accept') {
                    win = Alloy.createController('challenges_new').getView();
                } else if(type === 'pending') {
                    win = Alloy.createController('challenges_pending').getView();
                } else if(type === 'finished') {
                    win = Alloy.createController('challenges_finished').getView();   
                }
               
                if(win !== null) {
                    Alloy.Globals.NAV.openWindow(win);
                    win = null;  
                }      
            }			
		});
        
      }
    }
  }); 
};
exports = {apns:apns};