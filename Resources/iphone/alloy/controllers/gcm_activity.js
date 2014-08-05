function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "gcm_activity";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    exports.destroy = function() {};
    _.extend($, $.__views);
    (function(activity, gcm) {
        var intent = activity.intent;
        intent.hasExtra("ntfId") && (gcm.data = {
            ntfId: intent.getIntExtra("ntfId", 0)
        });
        if (gcm.isLauncherActivity) {
            var mainActivityIntent = Ti.Android.createIntent({
                className: gcm.mainActivityClassName,
                packageName: Ti.App.id,
                flags: Ti.Android.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED | Ti.Android.FLAG_ACTIVITY_SINGLE_TOP
            });
            mainActivityIntent.addCategory(Ti.Android.CATEGORY_LAUNCHER);
            activity.startActivity(mainActivityIntent);
        } else activity.finish();
    })(Ti.Android.currentActivity, require("net.iamyellow.gcmjs"));
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;