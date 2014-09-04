var args = arguments[0] || {};

var games = Alloy.Globals.COUPON.games;

for (var i in games){
	Ti.API.info("games" + JSON.stringify(games[i]));
}
