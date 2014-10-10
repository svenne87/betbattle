var args = arguments[0] || {};

var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

if (OS_ANDROID) {
    $.groupStats.addEventListener('open', function() {
        Alloy.Globals.setAndroidCouponMenu($.groupStats.activity);

        $.groupStats.activity.actionBar.onHomeIconItemSelected = function() {
            $.groupStats.close();
            $.groupStats = null;
        };
        $.groupStats.activity.actionBar.displayHomeAsUp = true;
        $.groupStats.activity.actionBar.title = Alloy.Globals.PHRASES.groupLeaderTxt;

        getStats();
        indicator.openIndicator();
    });
} else {
    $.groupStats.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.groupLeaderTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });
}

$.groupStats.addEventListener('close', function() {
    indicator.closeIndicator();
});

var scoreView = Ti.UI.createScrollView({
    class : "topView",
    height : "50%",
    width : "100%",
    top : '0%',
    backgroundColor : "transparent",
    layout : "vertical"
});
var statsView = Ti.UI.createScrollView({
    class : "topView",
    height : "50%",
    width : "100%",
    top : '50%',
    backgroundColor : "transparent",
    layout : "vertical"
});

var leaderboardLabel = Ti.UI.createLabel({
    text : Alloy.Globals.PHRASES.groupLeaderTxt,
    textAlign : "center",
    top : 10,
    font : {
        fontSize : 22,
        fontFamily : "Impact"
    },
    color : "#FFF"
});
scoreView.add(leaderboardLabel);

var statsLabel = Ti.UI.createLabel({
    text : Alloy.Globals.PHRASES.statsTxt,
    textAlign : "center",
    top : 10,
    font : {
        fontSize : 22,
        fontFamily : "Impact"
    },
    color : "#FFF"
});
statsView.add(statsLabel);

var infoTxt = Ti.UI.createView({
    backgroundColor : '#EA7337',
    backgroundGradient : {
        type : "linear",
        startPoint : {
            x : "0%",
            y : "0%"
        },
        endPoint : {
            x : "0%",
            y : "100%"
        },
        colors : [{
            color : "#F09C00",
        }, {
            color : "#D85000",
        }]
    },
    width : "100%",
    height : 30

});
scoreView.add(infoTxt);

var nrInfo = Ti.UI.createLabel({
    text : Alloy.Globals.PHRASES.positionTxt,
    left : '2%',
    color : "#fff",
    font : {
        fontSize : 18,
        fontFamily : "Impact"
    },
});
infoTxt.add(nrInfo);

var nameInfo = Ti.UI.createLabel({
    text : Alloy.Globals.PHRASES.nameTxt,
    left : '40%',
    color : "#fff",
    font : {
        fontSize : 18,
        fontFamily : "Impact"
    },
});
infoTxt.add(nameInfo);

var scoreInfo = Ti.UI.createLabel({
    text : Alloy.Globals.PHRASES.pointsTxt,
    left : '83%',
    color : "#fff",
    font : {
        fontSize : 18,
        fontFamily : "Impact"
    },
});
infoTxt.add(scoreInfo);

function createGUI(obj, i) {

    var totalLeader = Ti.UI.createView({
        top : 1,
        backgroundColor : '#fff',
        width : "100%",
        height : 35,
        opacity : 0.7

    });

    var nr = Ti.UI.createLabel({
        text : i + 1,
        left : '2%',
        font : {
            fontSize : 18,
            fontFamily : "Impact"
        },
    });
    totalLeader.add(nr);

    var image;
    if (obj.fbid !== null) {
        image = "https://graph.facebook.com/" + obj.fbid + "/picture?type=large";
    } else {
        // get betkampen image
        image = Alloy.Globals.BETKAMPENURL + '/profile_images/' + obj.uid + '.png';
    }

    var profilePic = Titanium.UI.createImageView({
        image : image,
        height : 30,
        width : 30,
        left : '10%',
        borderRadius : 15
    });
    profilePic.addEventListener('error', function(e) {
        // fallback for image
        profilePic.image = '/images/no_pic.png';
    });

    totalLeader.add(profilePic);

    boardName = obj.username.toString();
    if (boardName.length > 22) {
        boardName = boardName.substring(0, 22);
    }
    var name = Ti.UI.createLabel({
        text : boardName,
        left : '22%',
        font : {

            fontSize : 16,
            fontFamily : "Impact"
        },
    });

    totalLeader.add(name);

    var coins = Ti.UI.createLabel({
        text : obj.score,
        left : '85%',
        font : {
            fontSize : 16,
            fontFamily : "Impact"
        },
    });
    totalLeader.add(coins);
    scoreView.add(totalLeader);
}

function getStats() {
    var getUID = Ti.Network.createHTTPClient();
    getUID.onload = function() {
        Ti.API.info(this.responseText);
        var info = JSON.parse(this.responseText);
        indicator.closeIndicator();

        for (var i = 0; i < info.data.length; i++) {
            createGUI(info.data[i], i);
        }

    };

    getUID.onerror = function() {
        indicator.closeIndicator();
    };

    getUID.open('GET', Alloy.Globals.BETKAMPENGETGROUPMEMBERSURL + '?gid=' + gid + '&lang=' + Alloy.Globals.LOCALE);
    getUID.send();
}

if (OS_IOS) {
    getStats();
    indicator.openIndicator();
}

$.groupStats.add(scoreView);
$.groupStats.add(statsView);
