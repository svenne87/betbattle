var apns = function() {
    var typesArray = [];

    // only send types with if iOS version is less than 8
    if (parseInt(Ti.Platform.version.split(".")[0]) < 8) {
        typesArray = [Titanium.Network.NOTIFICATION_TYPE_BADGE, Titanium.Network.NOTIFICATION_TYPE_ALERT];
    }

    Titanium.Network.registerForPushNotifications({
        types : typesArray,
        success : function(e) {
            var deviceToken = e.deviceToken;
            Ti.API.info("Push notification device token is: " + deviceToken);
            Ti.API.info("Push notification types: " + Titanium.Network.remoteNotificationTypes);
            Ti.API.info("Push notification enabled: " + Titanium.Network.remoteNotificationsEnabled);

            // send token to our server
            Alloy.Globals.postDeviceToken(e.deviceToken);
        },
        error : function(e) {
            Ti.API.info("Error during registration: " + e.error);
        },
        callback : function(e) {
            var refreshNeeded = false; // should allways run this if we can't solve it
            Ti.API.log("Checking app status.... " + Alloy.Globals.appStatus);
            if(Alloy.Globals.appStatus) {
                if(Alloy.Globals.appStatus === 'foreground') {
                    refreshNeeded = true;
                }
            }
            
            // called when a push notification is received.
            Titanium.Media.vibrate();
            var data = e.data;

            var badge = data.badge;
            if (badge > 0) {
                Titanium.UI.iPhone.appBadge = badge;
            }

            if (data.alert != '') {
                var type = data.challenge_type;

                if (type === '1') {
                    type = 'accept';
                } else if (type === '2') {
                    type = 'pending';
                } else if (type === '3') {
                    type = 'finished';
                } else if (type === '4') {
                    type = 'achievement';
                } else if (type === '0') {
                    type = 'message';
                }

                var message = e.data.alert;

                var my_alert = Ti.UI.createAlertDialog({
                    title : Alloy.Globals.PHRASES.betbattleTxt,
                    message : message
                });
                my_alert.show();
                my_alert.addEventListener('click', function(e) {
                    my_alert.hide();
                    Ti.UI.iPhone.setAppBadge(0);
                    Titanium.UI.iPhone.appBadge = 0;

                    if (Alloy.Globals.MAINWIN !== null) {
                        
                        var obj = {
                            controller : 'challengesView',
                            arg : {
                                refresh : true
                            }
                        };

                        var args = {
                            refresh : true
                        };
                        var win = null;

                        if (type === 'accept') {
                            args = {
                                answer : 1,
                                group : data.extra_data.group,
                                bet_amount : data.extra_data.bet_amount,
                                push_cid : data.extra_data.cid
                            };
                            win = Alloy.createController('challenge', args).getView();
                        } else if (type === 'pending') {
                            args = {
                                cid : data.extra_data.cid
                            };
                            win = Alloy.createController('showChallenge', args).getView();
                        } else if (type === 'finished') {
                            win = Alloy.createController('challenges_finished').getView();
                        } else if (type === 'achievement') {     
                            var player = Ti.Media.createSound({
                                url : "sound/unlocked.wav"
                            });

                            var indWin = Ti.UI.createWindow();
                            //  view
                            var indView = Titanium.UI.createView({
                                top : '85%',
                                height : 80,
                                width : '100%',
                                backgroundColor : '#FFF',
                                opacity : 0.9,
                                layout : 'horizontal'
                            });

                            indWin.add(indView);

                            var image = Ti.UI.createImageView({
                                image : Alloy.Globals.BETKAMPENURL + '/achievements/' + data.extra_data.image,
                                width : "15%",
                                height : Ti.UI.SIZE,
                                left : 0,
                                top : 10
                            });
                            var mess = Titanium.UI.createLabel({
                                text : message,
                                right : 0,
                                color : '#000',
                                width : '75%',
                                top : 25,
                                height : 'auto',
                                textAlign : 'center',
                                font : Alloy.Globals.getFontCustom(12, 'Bold'),
                            });
                            indView.add(image);
                            indView.add(mess);
                            indWin.open();

                            player.play();

                            var interval = interval ? interval : 2500;
                            setTimeout(function() {
                                indWin.close({
                                    opacity : 0,
                                    duration : 2000
                                });
                                player.stop();
                            }, interval);

                        } else if (type === 'message') {
                            // nothing
                        }
                        
                        if(refreshNeeded) {
                            Ti.API.log("Do tha refresh man....");
                            // issues with updateView when we don't need it
                            if(type !== 'message' && type !== 'achievement') {
                                Ti.App.fireEvent('app:updateView', obj);
                            } else {
                                Ti.App.fireEvent('challengesViewRefresh');
                            }   
                        }
                        
                        /*
                        // issues with updateView when we don't need it
                        if(type !== 'message' && type !== 'achievement') {
                            Ti.App.fireEvent('app:updateView', obj);
                        } else {
                            Ti.App.fireEvent('challengesViewRefresh');
                        }
                        */
                        
                        if (win !== null) {
                            Alloy.Globals.NAV.openWindow(win);                    
                        }

                        if (Alloy.Globals.WINDOWS.length > 0) {
                            for (var w in Alloy.Globals.WINDOWS) {
                                Alloy.Globals.WINDOWS[w].setOpacity(0);
                            }

                            for (var w in Alloy.Globals.WINDOWS) {
                                if (Alloy.Globals.WINDOWS[w] === win) {
                                    Alloy.Globals.WINDOWS[w].close();
                                }
                            }
                        }

                        if (win !== null) {
                            Alloy.Globals.WINDOWS.push(win);
                        }
                    } else {                 
                        var loginSuccessWindow = Alloy.createController('main').getView();
                        loginSuccessWindow.open({
                            fullScreen : true
                        });
                        loginSuccessWindow = null;

                        var win = null;

                        if (type === 'accept') {
                            args = {
                                answer : 1,
                                group : data.extra_data.group,
                                bet_amount : data.extra_data.bet_amount
                            };
                            Alloy.Globals.CHALLENGEINDEX = data.extra_data.cid;
                            win = Alloy.createController('challenge', args).getView();

                        } else if (type === 'pending') {
                            args = {
                                cid : cid
                            };

                            // This is never called?
                            // TODO cid : data.extra_data.cid ?

                            win = Alloy.createController('showChallenge', args).getView();
                        } else if (type === 'finished') {
                            win = Alloy.createController('challenges_finished').getView();
                        } else if (type === 'achievement') {
                            var player = Ti.Media.createSound({
                                url : "sound/unlocked.wav"
                            });

                            var indWin = Ti.UI.createWindow();
                            //  view
                            var indView = Titanium.UI.createView({
                                top : '85%',
                                height : 80,
                                width : '100%',
                                backgroundColor : '#FFF',
                                opacity : 0.9,
                                layout : 'horizontal'
                            });

                            indWin.add(indView);

                            var image = Ti.UI.createImageView({
                                image : Alloy.Globals.BETKAMPENURL + '/achievements/' + data.extra_data.image,
                                width : "15%",
                                height : Ti.UI.SIZE,
                                left : 0,
                                top : 10
                            });
                            var mess = Titanium.UI.createLabel({
                                text : message,
                                right : 0,
                                color : '#000',
                                width : '75%',
                                top : 25,
                                height : 'auto',
                                textAlign : 'center',
                                font : Alloy.Globals.getFontCustom(12, 'Bold'),
                            });
                            indView.add(image);
                            indView.add(mess);
                            indWin.open();

                            player.play();

                            var interval = interval ? interval : 2500;
                            setTimeout(function() {
                                indWin.close({
                                    opacity : 0,
                                    duration : 2000
                                });
                                player.stop();
                            }, interval);
                        } else if (type === 'message') {
                            // nothing
                        }

                        if (win !== null) {
                            Alloy.Globals.NAV.openWindow(win);
                        }

                        if (win !== null) {
                            Alloy.Globals.WINDOWS.push(win);
                        }
                    }
                });

            }
        }
    });
};
exports = {
    apns : apns
};
