var apns = function() {
    var typesArray = [Titanium.Network.NOTIFICATION_TYPE_BADGE, Titanium.Network.NOTIFICATION_TYPE_ALERT];
    
    // check if version is < 8
    if (parseInt(Ti.Platform.version.split(".")[0]) < 8) {
        Titanium.Network.registerForPushNotifications({
            types : typesArray,
            success : deviceTokenSucces,
            error : deviceTokenFailure,
            callback : handlePush
        }); 
    } else {  
         Ti.App.iOS.addEventListener('usernotificationsettings', function registerForPush() {
 
            // Remove event listener once registered for push notifications
            Ti.App.iOS.removeEventListener('usernotificationsettings', registerForPush); 
 
            Ti.Network.registerForPushNotifications({
                success : deviceTokenSucces,
                error : deviceTokenFailure,
                callback : handlePush
            });
        });
 
        // Register notification types to use
        Ti.App.iOS.registerUserNotificationSettings({
            types: typesArray
        });   
    }
    
    function deviceTokenSucces(e) {
        var deviceToken = e.deviceToken;
        // send token to our server
        Alloy.Globals.postDeviceToken(e.deviceToken);
    }
    function deviceTokenFailure(e) {
        Ti.API.info("Error during registration: " + e.error);
    }
    function handlePush(e) {
            var refreshNeeded = false;
            Ti.API.log("Checking app status.... " + Alloy.Globals.appStatus);

            if (Alloy.Globals.appStatus) {
                if (Alloy.Globals.appStatus === 'foreground') {
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

                function handlePush() {
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
                            if (Alloy.Globals.WINDOWS.length > 1) {
                               var checkWindow = Alloy.Globals.WINDOWS[Alloy.Globals.WINDOWS.length - 1];
                               if(checkWindow.id === 'showChallengeWindow') {
                                   if(typeof checkWindow.cid !== 'undefined') {
                                        args.state = 'live-state';
                                        win = Alloy.createController('showChallenge', args).getView();
                                   }
                               }
                            }
                        }

                        if (refreshNeeded) {
                            Ti.API.log("Do tha refresh man....");
                            // issues with updateView when we don't need it
                            if (type !== 'message' && type !== 'achievement') {
                                Ti.App.fireEvent('app:updateView', obj);
                            } else {
                                Ti.App.fireEvent('challengesViewRefresh');
                            }
                        }

                        if (win !== null) {                            
                            Alloy.Globals.NAV.openWindow(win);
                        }

                        if (Alloy.Globals.WINDOWS.length > 1) {
                            for (var w in Alloy.Globals.WINDOWS) {
                                if (type !== 'message') {
                                    if (Alloy.Globals.WINDOWS[w].id === 'challenges_finished' || Alloy.Globals.WINDOWS[w].id === 'challenges_accept') {
                                        Alloy.Globals.WINDOWS[w].setOpacity(0);
                                    }
                                }
                            }

                            for (var w in Alloy.Globals.WINDOWS) {
                                if (Alloy.Globals.WINDOWS[w] !== win) {
                                    if (type !== 'message') {
                                        if (Alloy.Globals.WINDOWS[w].id === 'challenges_finished' || Alloy.Globals.WINDOWS[w].id === 'challenges_accept') {
                                            Alloy.Globals.WINDOWS[w].close();
                                        }
                                    }

                                }
                            }
                        }
                        
                        if (win !== null) {
                            Alloy.Globals.WINDOWS.push(win);
                        }
                    }
                }

                if (refreshNeeded) {
                    var my_alert = Ti.UI.createAlertDialog({
                        title : Alloy.Globals.PHRASES.betbattleTxt,
                        message : message
                    });
                    my_alert.show();
                    my_alert.addEventListener('click', function(e) {
                        my_alert.hide();
                        handlePush();
                    });
                } else {
                    // not inside app, no need for dialog
                    handlePush();
                }
                Ti.UI.iPhone.setAppBadge(0);
                Titanium.UI.iPhone.appBadge = 0;
            }
        }
};
exports = {
    apns : apns
};
