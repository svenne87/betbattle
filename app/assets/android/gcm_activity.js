/*global Ti: true, require: true */

(function (activity, gcm) {

	var intent = activity.intent;
Ti.API.log(JSON.stringify(intent));
	if (intent.hasExtra('ntfId')) {
		gcm.data = {
			ntfId: intent.getIntExtra('ntfId', 0)
		};
	}
	
	if(intent.hasExtra("message")) {
	    gcm.data.message = intent.getStringExtra('message');
	}
	
	if(intent.hasExtra("title")) {
	    gcm.data.title = intent.getStringExtra('title');
	}

	if (gcm.isLauncherActivity) {
        var mainActivityIntent = Ti.Android.createIntent({
			className: gcm.mainActivityClassName,
			packageName: Ti.App.id,
			flags : Ti.Android.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED | Ti.Android.FLAG_ACTIVITY_SINGLE_TOP
		});	
		
		mainActivityIntent.addCategory(Ti.Android.CATEGORY_LAUNCHER);
		activity.startActivity(mainActivityIntent);
	}
	else {
		activity.finish();
	}

})(Ti.Android.currentActivity, require('net.iamyellow.gcmjs'));