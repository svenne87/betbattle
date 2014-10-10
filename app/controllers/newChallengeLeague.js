Ti.App.addEventListener("sliderToggled", function(e) {
    if ( typeof table !== 'undefined') {
        if (e.hasSlided) {
            table.touchEnabled = false;
        } else {
            table.touchEnabled = true;
        }
    }
});

function openChallengesForLeague(league) {
    var arg = {
        leagueId : league
    };
    /*
     // change view
     var obj = {
     controller : 'newChallenge',
     arg : arg
     };
     TODO ANDROID
     Ti.App.fireEvent('app:updateView', obj);
     */

    var win = Alloy.createController('newChallenge', arg).getView();
    // store window
    Alloy.Globals.WINDOWS.push(win);

    if (OS_IOS) {
        Alloy.Globals.NAV.openWindow(win, {
            animated : true
        });
    } else {
        win.open({
            fullScreen : true
        });
    }

}

var table;
var leagues = Alloy.Globals.LEAGUES;

/*
 var tableHeaderView = Ti.UI.createView({
 height : '142dp',
 backgroundImage : '/images/header.png'
 //backgroundColor: 'transparent',
 });
 */

var tableHeaderView = Ti.UI.createView({
    height : 0.1
});

table = Titanium.UI.createTableView({
    width : Ti.UI.FILL,
    left : 0,
    headerView : tableHeaderView,
    height : Ti.UI.FILL,
    backgroundColor : '#000',
    separatorColor : '#303030'
});

if (OS_IOS) {
    table.separatorInsets = {
        left : 0,
        right : 0
    };
    table.footerView = Ti.UI.createView({
        height : 0.5,
        backgroundColor : '#303030'
    });
} else if (OS_ANDROID) {
    table.footerView = Ti.UI.createView({
        height : 0.5,
        backgroundColor : '#303030'
    });
}

// add rows to table
var data = [];
for (var i in leagues) {
    var child;

    if (OS_ANDROID) {
        child = false;
    } else if (OS_IOS) {
        child = true;
    }

    var tableRow = $.UI.create('TableViewRow', {
        backgroundColor : '#000',
        id : leagues[i].id,
        hasChild : child,
        height : 75
    });

    // add custom icon on Android to symbol that the row has child
    if (child != true) {
        var fontawesome = require('lib/IconicFont').IconicFont({
            font : 'lib/FontAwesome'
        });

        font = 'fontawesome-webfont';

        tableRow.add(Ti.UI.createLabel({
            font : {
                fontFamily : font
            },
            text : fontawesome.icon('icon-chevron-right'),
            right : '5%',
            color : '#FFF',
            fontSize : 80,
            height : 'auto',
            width : 'auto'
        }));
    }

    // fix to get mobile images
    var url = leagues[i].logo.replace('logos', 'logos/mobile');
    var finalUrl = url.replace(' ', '');
    var finalUrl = finalUrl.toLowerCase();
    var imageLocation = Alloy.Globals.BETKAMPENURL + finalUrl;

    var leagueImageView = Ti.UI.createImageView({
        left : 10,
        height : 40,
        width : 40,
        borderRadius : 20,
        backgroundColor : "white",
        image : imageLocation,
        defaultImage : '/images/Liga_Default.png'
    });

    leagueImageView.addEventListener('error', function(e) {
        leagueImageView.image = '/images/Liga_Default.png';
    });

    tableRow.add(leagueImageView);

    var leagueName = leagues[i].name;

    if (leagueName.length > 17) {
        leagueName = leagueName.substring(0, 14);
        leagueName = leagueName + '...';
    }

    tableRow.add(Ti.UI.createLabel({
        width : Ti.UI.SIZE,
        height : Ti.UI.SIZE,
        left : 65,
        text : leagueName,
        font : Alloy.Globals.getFontCustom(16, 'Regular'),
        color : '#FFF'
    }));

    //tableRow.add(leagueImage);
    tableRow.className = 'league';
    data.push(tableRow);
}
table.setData(data);

// when clicking a table row
table.addEventListener('click', function(e) {
    if (Alloy.Globals.SLIDERZINDEX == 2) {
        return;
    }

    if (Alloy.Globals.checkConnection()) {
        // get games and build UI
        openChallengesForLeague(e.row.id);
    } else {
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
    }
});

if (OS_ANDROID) {
    $.newChallengeLeague.orientationModes = [Titanium.UI.PORTRAIT];

    $.newChallengeLeague.addEventListener('open', function() {
        Alloy.Globals.setAndroidCouponMenu($.newChallengeLeague.activity);

        $.newChallengeLeague.activity.actionBar.onHomeIconItemSelected = function() {
            $.newChallengeLeague.close();
            $.newChallengeLeague = null;
        };
        $.newChallengeLeague.activity.actionBar.displayHomeAsUp = true;
        $.newChallengeLeague.activity.actionBar.title = Alloy.Globals.PHRASES.leagueChooseTxt;
    });
} else {
    $.newChallengeLeague.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.leagueChooseTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });

}

$.newChallengeLeague.add(table);
