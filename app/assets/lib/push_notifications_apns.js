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
      //var data = e.data;
                                                        // TODO skicka med data till själva pushen, sitället för 1.2.3, verkar ju inte gå dölja på ios
      var badge = e.data.badge;
      if(badge > 0){
        Titanium.UI.iPhone.appBadge = badge;
      }
      e.data.alert = e.data.alert;
      if(e.data.alert != ''){
         var type = '';
         
         if(e.data.alert.charAt(0) === '1') {
             e.data.alert = e.data.alert.substring(1);
             type = 'accept';
         } else if (e.data.alert.charAt(0) === '2'){
             e.data.alert = e.data.alert.substring(1);
             type = 'pedning';
         } else if(e.data.alert.charAt(0) === '3') {
             e.data.alert = e.data.alert.substring(1);
             type = 'finished';
         }
         var message = e.data.alert;
                
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
                } 
          
                for(var w in Alloy.Globals.WINDOWS) {
                   if(Alloy.Globals.WINDOWS[w] === win) {
                      Alloy.Globals.WINDOWS[w].close();
                   }
                }
                if(win !== null) {
                    Alloy.Globals.WINDOWS.push(win);
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
                }      
                
                if(win !== null) {
                    Alloy.Globals.WINDOWS.push(win);
                }
            }			
		});
        
      }
    }
  }); 
};
exports = {apns:apns};