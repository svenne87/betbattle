function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "gcm";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    exports.destroy = function() {};
    _.extend($, $.__views);
    (function(service) {
        var serviceIntent = service.getIntent(), title = serviceIntent.hasExtra("title") ? serviceIntent.getStringExtra("title") : "", statusBarMessage = serviceIntent.hasExtra("message") ? serviceIntent.getStringExtra("message") : "", message = serviceIntent.hasExtra("message") ? serviceIntent.getStringExtra("message") : "", notificationId = function() {
            var str = "", now = new Date();
            var hours = now.getHours(), minutes = now.getMinutes(), seconds = now.getSeconds();
            str += (hours > 11 ? hours - 12 : hours) + "";
            str += minutes + "";
            str += seconds + "";
            var start = new Date(now.getFullYear(), 0, 0), diff = now - start, oneDay = 864e5, day = Math.floor(diff / oneDay);
            str += day * (hours > 11 ? 2 : 1);
            var ml = 0 | now.getMilliseconds() / 100;
            str += ml;
            return 0 | str;
        }();
        var ntfId = Ti.App.Properties.getInt("ntfId", 0), launcherIntent = Ti.Android.createIntent({
            className: "net.iamyellow.gcmjs.GcmjsActivity",
            action: "action" + ntfId,
            packageName: Ti.App.id,
            flags: Ti.Android.FLAG_ACTIVITY_NEW_TASK | Ti.Android.FLAG_ACTIVITY_SINGLE_TOP
        });
        launcherIntent.addCategory(Ti.Android.CATEGORY_LAUNCHER);
        launcherIntent.putExtra("ntfId", ntfId);
        ntfId += 1;
        Ti.App.Properties.setInt("ntfId", ntfId);
        var pintent = Ti.Android.createPendingIntent({
            intent: launcherIntent
        }), notification = Ti.Android.createNotification({
            contentIntent: pintent,
            contentTitle: title,
            contentText: message,
            tickerText: statusBarMessage,
            icon: Ti.App.Android.R.drawable.appicon,
            flags: Ti.Android.FLAG_AUTO_CANCEL | Ti.Android.FLAG_SHOW_LIGHTS
        });
        Ti.Android.NotificationManager.notify(notificationId, notification);
        service.stop();
    })(Ti.Android.currentService);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;