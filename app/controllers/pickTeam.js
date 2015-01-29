var args = arguments[0] || {};
var context;
var selectedFavoriteTeamLabel = null;
selectedFavoriteTeamLabel = args.label;
var showNav = false;
showNav = args.navOpen;

var uie = require('lib/IndicatorWindow');
var submitting;
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

var isAndroid = false;
var selectedSport;
var isSending;

if (OS_ANDROID) {
    isAndroid = true;
    context = require('lib/Context');
    $.pickTeam.orientationModes = [Titanium.UI.PORTRAIT];

    $.pickTeam.addEventListener('open', function() {
        Alloy.Globals.setAndroidCouponMenu($.pickTeam.activity);

        $.pickTeam.activity.actionBar.onHomeIconItemSelected = function() {
            $.pickTeam.close();
            $.pickTeam = null;
        };
        $.pickTeam.activity.actionBar.displayHomeAsUp = true;
        $.pickTeam.activity.actionBar.title = Alloy.Globals.PHRASES.leagueChooseTxt;
    });

} else {
    $.pickTeam.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.leagueChooseTxt,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });
}

function onOpen(evt) {
    if(isAndroid) {
        context.on('pickTeamActivity', this.activity);
    }
}

function onClose(evt) {
    if(isAndroid) {
        context.off('pickTeamActivity');
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

var tableHeaderView = Ti.UI.createView({
    height : 0.5,
});

var pickView = Ti.UI.createView({
    height : '10%',
    width : Ti.UI.FILL,
    backgroundColor : '#000'
});

var pickLabel = Ti.UI.createLabel({
    width : Ti.UI.FILL,
    height : Ti.UI.SIZE,
    textAlign : 'center',
    top : 20,
    text : Alloy.Globals.PHRASES.leagueChooseTxt + ' ',
    font : Alloy.Globals.getFontCustom(18, 'Bold'),
    color : '#FFF'
});

if (!showNav) {
    pickView.add(pickLabel);
    $.pickTeam.add(pickView);
}

table = Titanium.UI.createTableView({
    width : Ti.UI.FILL,
    left : 0,
    headerView : tableHeaderView,
    height : '100%',
    backgroundColor : '#000',
    separatorColor : '#303030'
});

if (!isAndroid) {
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
} else {
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

function displaySports() {
    pickLabel.setText(Alloy.Globals.PHRASES.leagueChooseTxt + ' ');
    sections = [];

    if (isAndroid) {
        child = false;
    } else {
        child = true;
    }

    // devide into different sports
    var sports = splitByType(leagues);
    var count = 0;
    var child;
    // add rows to table
    for (var z in sports) {
        sports[z] = sports[z].sort(compare);

        sections[count] = createSectionsForTable(Alloy.Globals.PHRASES[sports[z][0].sport_name + 'Txt']);

        for (var x in sports[z]) {
            var league = sports[z][x];

            var tableRow = $.UI.create('TableViewRow', {
                backgroundColor : '#000',
                id : league.id,
                name : sports[z][0].id,
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
                defaultImage : '/images/Liga_Default.png'
            });

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
                text : leagueName + " ",
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
}

function createTeamUI(teams) {
    pickLabel.setText("");

    if (isAndroid) {
        child = false;
    } else {
        child = true;
    }

    sections = [];
    sections[0] = createSectionsForTable(Alloy.Globals.PHRASES.picTeamTxt);

    var emptyRow = Ti.UI.createTableViewRow({
        backgroundColor : '#000',
        hasChild : false,
        height : 75,
        name : 'emptyRow',
        className : 'team'
    });

    emptyRow.add(Ti.UI.createLabel({
        width : Ti.UI.SIZE,
        height : Ti.UI.SIZE,
        left : 65,
        text : Alloy.Globals.PHRASES.backToLeagues + " ",
        font : Alloy.Globals.getFontCustom(16, 'Regular'),
        color : '#FFF'
    }));

    // add custom icon on Android to symbol that the row has child
    if (child != true) {
        var fontawesome = require('lib/IconicFont').IconicFont({
            font : 'lib/FontAwesome'
        });
        font = 'fontawesome-webfont';
    } else {
        var fontawesome = require('lib/IconicFont').IconicFont({
            font : 'lib/FontAwesome'
        });
        font = 'FontAwesome';
    }

    emptyRow.add(Ti.UI.createLabel({
        font : {
            fontFamily : font
        },
        text : fontawesome.icon('icon-chevron-left'),
        left : '5%',
        color : '#FFF',
        fontSize : 80,
        height : 'auto',
        width : 'auto'
    }));

    emptyRow.addEventListener('click', function(e) {
        displaySports();
    });

    sections[0].add(emptyRow);

    for (var team in teams) {
        var currTeam = teams[team];

        var tableRow = Ti.UI.createTableViewRow({
            backgroundColor : '#000',
            id : currTeam.tid,
            name : currTeam.name,
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
        var imageLocation = Alloy.Globals.BETKAMPENURL + currTeam.team_logo;

        var teamImageView = Ti.UI.createImageView({
            left : 10,
            height : 40,
            width : 40,
            borderRadius : 20,
            backgroundColor : "FFF",
            image : imageLocation,
            defaultImage : '/images/Liga_Default.png'
        });

        teamImageView.addEventListener('error', function(e) {
            e.source.image = '/images/Liga_Default.png';
        });

        tableRow.add(teamImageView);

        var teamName = currTeam.name;

        if (teamName.length > 20) {
            teamName = teamName.substring(0, 17);
            teamName = teamName + '...';
        }

        tableRow.add(Ti.UI.createLabel({
            width : Ti.UI.SIZE,
            height : Ti.UI.SIZE,
            left : 65,
            text : teamName + " ",
            font : Alloy.Globals.getFontCustom(16, 'Regular'),
            color : '#FFF'
        }));

        tableRow.className = 'team';
        sections[0].add(tableRow);
    }

    table.setData(sections);
}

var selectEvent = function(e) {
    if (e.name === 'emptyRow') {
        return;
    }

    if (isSending) {
        return;
    }

    if (e.row.className === 'league') {
        if (Alloy.Globals.checkConnection()) {
            selectedSport = e.row.name;
            getTeams(e.row.id);
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        }
    } else if (e.row.className === 'team') {
        if (Alloy.Globals.checkConnection()) {
            // post user team
            teamPicked(e.row.id, e.row.name);
        } else {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
        }
    }

};

displaySports();
// when clicking a table row
table.addEventListener('click', selectEvent);

//getting teams from db with league id
function getTeams(lid) {
    indicator.openIndicator();

    var xhr = Ti.Network.createHTTPClient({
        onload : function(e) {
            var team = JSON.parse(this.responseText);
            createTeamUI(team.data);
            indicator.closeIndicator();
        },
        // function called when an error occurs, including a timeout
        onerror : function(e) {
            Ti.API.debug(e.error);
            indicator.closeIndicator();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        }
    });
    // Prepare the connection.
    xhr.open('GET', Alloy.Globals.BETKAMPENGETTEAMS + '?lid=' + lid + '&lang=' + Alloy.Globals.LOCALE);

    xhr.setRequestHeader("content-type", "application/json");
    xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
    xhr.setTimeout(Alloy.Globals.TIMEOUT);

    xhr.send();
}

//inserts your team in db with your uid and team id
function teamPicked(tid, name) {
    indicator.openIndicator();
    isSending = true;

    var xhr = Ti.Network.createHTTPClient({
        onload : function(e) {
            indicator.closeIndicator();
            
            Ti.App.Properties.setString("favorite_team", name);

            //show toast of your favorite team
            Alloy.Globals.showToast(Alloy.Globals.PHRASES.youTeamTxt + ' ' + name);

            if (!showNav) {
                // kepp in memory
                var tmp = Alloy.createController('landingPage', args).getView();
                    
                // open main
                 var loginSuccessWindow = Alloy.createController('main', args).getView();
                 
                if (OS_IOS) {
                    loginSuccessWindow.open({
                        fullScreen : true
                    });
                    loginSuccessWindow = null;

                } else if (OS_ANDROID) {
                    loginSuccessWindow.open({
                        fullScreen : true,
                        orientationModes : [Titanium.UI.PORTRAIT]
                    });
                    loginSuccessWindow = null;
                }
            } else {
                if(selectedFavoriteTeamLabel !== null) {
                    if(name.length > 12) {
                        selectedFavoriteTeamLabel.setText(name.substring(0, 9) + "...");
                    } else {
                        selectedFavoriteTeamLabel.setText(name);
                    }
                }
            }

            isSending = false;
            $.pickTeam.close();

            if (!showNav) {
                if (Alloy.Globals.INDEXWIN !== null) {
                    Alloy.Globals.INDEXWIN.close();
                }
            }
        },
        // function called when an error occurs, including a timeout
        onerror : function(e) {
            isSending = false;
            Ti.API.debug(e.error);
            indicator.closeIndicator();
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
        }
    });

    // Prepare the connection.
    xhr.open("POST", Alloy.Globals.BETKAMPENSETUSERTEAM + '?lang=' + Alloy.Globals.LOCALE);
    xhr.setRequestHeader("content-type", "application/json");
    xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
    xhr.setTimeout(Alloy.Globals.TIMEOUT);

    var update = 0;
    if (showNav) {
        update = 1;
    }

    var params = '{"tid":"' + tid + '", "sid":"' + selectedSport + '", "update": "' + update + '"}';

    xhr.send(params);
}

$.pickTeam.add(table);
