var args = arguments[0] || {};

Ti.API.info("Args = " + JSON.stringify(args));

function getChallengeShow(){
	Ti.API.info("SKickar: "+ args.challengeID);
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onerror = function(e) {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
		//alert(JSON.parse(this.responseText));
		
		Ti.API.error('Bad Sever =>' + e.error);
		//$.facebookBtn.enabled = true;
	};

	try {
		xhr.open('GET', Alloy.Globals.BETKAMPENCHALLENGESHOWURL + '?cid=' + args.challengeID + '&lang=' + Alloy.Globals.LOCALE);
		xhr.setRequestHeader("challengesView-type", "application/json");
		//xhr.setRequestHeader("Authorization", Alloy.Globals.FACEBOOK.accessToken);
		xhr.setTimeout(Alloy.Globals.TIMEOUT);
		xhr.send();
	} catch(e) {
		Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
		//alert(JSON.parse(this.responseText));
		
	}
	xhr.onload = function() {
		if (this.status == '200') {
			if (this.readyState == 4) {
				var response = JSON.parse(this.responseText);
				// construct array with objects
				Ti.API.info("challengeShow: " + JSON.stringify(response));	
				showResults(response);	
			} else {
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
				//$.facebookBtn.enabled = true;
			}
		} else {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
		
			//$.facebookBtn.enabled = true;
			Ti.API.error("Error =>" + this.response);
		}
	};
	
}

function showResults(challenge){
	//var gameView
	
	
}

getChallengeShow();
