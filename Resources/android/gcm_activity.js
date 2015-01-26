!function(activity, gcm) {
    var intent = activity.intent;
    intent.hasExtra("ntfId") && (gcm.data = {
        ntfId: intent.getIntExtra("ntfId", 0),
        message: intent.getStringExtra("message", "UTF-8"),
        title: intent.getStringExtra("title"),
        challenge_type: intent.getStringExtra("challenge_type"),
        extra_data: intent.getStringExtra("extra_data")
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
}(Ti.Android.currentActivity, require("net.iamyellow.gcmjs"));