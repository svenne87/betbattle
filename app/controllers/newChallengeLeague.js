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

// create sections for the table
function createSectionsForTable(sectionText) {
    var sectionView = $.UI.create('View', {
        classes : ['challengesSection']
    });

    sectionView.add(Ti.UI.createLabel({
        top : '25%',
        width : Ti.UI.FILL,
        left : 60,
        text : sectionText,
        font : Alloy.Globals.getFontCustom(18, 'Bold'),
        color : '#FFF'
    }));

    if (!isAndroid) {
        return Ti.UI.createTableViewSection({
            headerView : sectionView,
            footerView : Ti.UI.createView({
                height : 0.1
            })
        });
    } else {
        return Ti.UI.createTableViewSection({
            headerView : sectionView
        });
    }
}

var table;
var leagues = Alloy.Globals.LEAGUES;
var sections = [];
var isAndroid = false;

if (OS_ANDROID) {
    isAndroid = true;
}

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
    var iOSVersion = parseInt(Ti.Platform.version);

    if (iOSVersion < 7) {
        table.separatorStyle = Titanium.UI.iPhone.TableViewSeparatorStyle.NONE;
        table.separatorColor = 'transparent';
    } else {
        table.separatorStyle = Titanium.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE;
    }

    table.separatorInsets = {
        left : 0,
        right : 0
    };
    table.footerView = Ti.UI.createView({
        height : 0.5,
        backgroundColor : '#303030'
    });
} else if (OS_ANDROID) {
    table.headerView = Ti.UI.createView({
        height : 0.5,
        backgroundColor : '#303030'
    });

    table.footerView = Ti.UI.createView({
        height : 0.5,
        backgroundColor : '#303030'
    });
}

// function to divide array, based on "sport_name"
function splitByType(arr) {
    return arr.reduce(function(memo, x) {
        if (!memo[x.sport_name]) {
            memo[x.sport_name] = [];
        }
        memo[x.sport_name].push(x);
        return memo;
    }, {});
}

// function to sort array, base on "sort_order"
function compare(a, b) {
    a.sort_order = (a.sort_order - 0);
    b.sort_order = (b.sort_order - 0);

    if (a.sort_order > b.sort_order)
        return -1;
    if (a.sort_order < b.sort_order)
        return 1;
    return 0;
}

// devide into different sports
var context;
var sports = splitByType(leagues);
var count = 0;
var child;

if (OS_ANDROID) {
    context = require('lib/Context');
    child = false;
} else {
    child = true;
}

function onOpen(evt) {
    if(isAndroid) {
        context.on('newChallengeLeagueActivity', this.activity);
    }
}

function onClose(evt) {
    if(isAndroid) {
        context.off('newChallengeLeagueActivity');
    }
}

// add rows to table
for (var z in sports) {
    sports[z] = sports[z].sort(compare);

    sections[count] = createSectionsForTable(Alloy.Globals.PHRASES[sports[z][0].sport_name + 'Txt']);

    for (var x in sports[z]) {
        var league = sports[z][x];

        var tableRow = $.UI.create('TableViewRow', {
            backgroundColor : '#000',
            id : league.id,
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
        var url = league.logo.replace('logos', 'logos/mobile');
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
            // defaultImage : '/images/Liga_Default.png'
        });
        
       	if(!isAndroid) {
    		leagueImageView.setDefaultImage('/images/Liga_Default.png');
    	}   

        leagueImageView.addEventListener('error', function(e) {
            e.source.image = '/images/Liga_Default.png';
        });

        tableRow.add(leagueImageView);

        var leagueName = league.name;

        if (leagueName.length > 20) {
            leagueName = leagueName.substring(0, 17);
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
        sections[count].add(tableRow);
    }
    count++;
}
table.setData(sections);

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
