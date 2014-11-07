var args = arguments[0] || {};

var wrapperView = null;
var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
    top : 200,
    text : Alloy.Globals.PHRASES.loadingTxt
});

var iOSVersion;
var isAndroid = true;

if (OS_IOS) {
    isAndroid = false;
    iOSVersion = parseInt(Ti.Platform.version);

    $.previousMatchOTD.titleControl = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.matchOTDPreviousBtn,
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        color : '#FFF'
    });
} else {
    isAndroid = true;
    $.previousMatchOTD.orientationModes = [Titanium.UI.PORTRAIT];

    $.previousMatchOTD.addEventListener('open', function() {
        $.previousMatchOTD.activity.actionBar.onHomeIconItemSelected = function() {
            $.previousMatchOTD.close();
            $.previousMatchOTD = null;
        };
        $.previousMatchOTD.activity.actionBar.displayHomeAsUp = true;
        $.previousMatchOTD.activity.actionBar.title = Alloy.Globals.PHRASES.matchOTDPreviousBtn;
    });
}

function getPreviousMatchDay() {
    indicator.openIndicator();
    if (Alloy.Globals.checkConnection()) {
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onerror = function(e) {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            indicator.closeIndicator();
            Ti.API.error('Bad Sever =>' + e.error);
        };

        try {
            xhr.open('GET', Alloy.Globals.BETKAMPENPREVIOUSMATCHDAY + '?lang=' + Alloy.Globals.LOCALE + '&uid=' + Alloy.Globals.BETKAMPENUID);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.setRequestHeader("Authorization", Alloy.Globals.BETKAMPEN.token);
            xhr.setTimeout(Alloy.Globals.TIMEOUT);
            xhr.send();
        } catch(e) {
            Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
            indicator.closeIndicator();
        }

        xhr.onload = function() {
            if (this.status == '200') {
                if (this.readyState == 4) {
                    indicator.closeIndicator();
                    var resp = null;
                    try {
                        resp = JSON.parse(this.responseText);

                    } catch (e) {
                        resp = null;
                    }
                    showPreviousMatch(resp);
                }

            } else {
                indicator.closeIndicator();
                Ti.API.error("Error =>" + this.response);
            }
        };
    } else {
        indicator.closeIndicator();
        Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
    }

}

function createSectionsForTable(sectionText) {
    var sectionView = $.UI.create('View', {
        classes : ['winnersSection'],
        height : 70,
        backgroundColor : '#303030',
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
                color : "#151515",

            }, {
                color : "#2E2E2E",

            }]
        },
    });

    sectionView.add(Ti.UI.createLabel({
        width : Ti.UI.FILL,
        left : 20,
        text : sectionText + ' ',
        font : Alloy.Globals.getFontCustom(18, "Bold"),
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

function constructChallengeRows(obj, index) {
    var row = Ti.UI.createTableViewRow({
        id : index,
        hasChild : false,
        width : Ti.UI.FILL,
        left : 0,
        className : 'winnerRow',
        height : 65,
        selectionStyle : 'none',
    });

    var imageLocation;
Ti.API.log(JSON.stringify(obj)); // TODO
    if (obj.fbid !== null) {
        imageLocation = "https://graph.facebook.com/" + obj.fbid + "/picture?type=large";
    } else {
        // get betkampen image
        imageLocation = Alloy.Globals.BETKAMPENURL + '/profile_images/' + obj.uid + '.png';
    }

    var imageHolder = Ti.UI.createImageView({
        defaultImage : '/images/no_pic.png',
        image : imageLocation,
        left : 20,
        width : 30,
        height : 30,
        borderRadius : 15
    });

    // default if no image is found
    imageHolder.addEventListener('error', function(e) {
        imageHolder.image = '/images/no_pic.png';
    });

    row.add(imageHolder);

    var participantsValueLabel = Ti.UI.createLabel({
        left : 60,
        text : obj.name + ' ',
        font : Alloy.Globals.getFontCustom(16, "Regular"),
        color : '#FFF'
    });

    row.add(participantsValueLabel);
    return row;
}

function constructTableView(obj) {
    var sections = [];

    var tableHeaderView = Ti.UI.createView({
        height : 0.1,
        width : Ti.UI.FILL,
        backgroundColor : 'transparent',
        layout : "absolute",
    });

    if (!isAndroid) {
        table = Titanium.UI.createTableView({
            left : 0,
            headerView : tableHeaderView,
            height : '100%',
            width : '100%',
            backgroundColor : 'transparent',
            style : Ti.UI.iPhone.TableViewStyle.GROUPED,
            separatorInsets : {
                left : 0,
                right : 0
            },
            id : 'winnersTable',
            separatorStyle : Titanium.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE,
            separatorColor : '#303030',
        });

        if (iOSVersion < 7) {
            table.separatorStyle = Titanium.UI.iPhone.TableViewSeparatorStyle.NONE;
            table.separatorColor = 'transparent';
        }

    } else {
        table = Titanium.UI.createTableView({
            width : Ti.UI.FILL,
            left : 0,
            headerView : tableHeaderView,
            height : '100%',
            backgroundColor : 'transparent',
            separatorColor : '#303030',
            id : 'challengeTable'
        });

        table.footerView = Ti.UI.createView({
            height : 0.5,
            width : Ti.UI.FILL,
            backgroundColor : '#303030'
        });
    }

    var teamHeader = Ti.UI.createView({
        height : 70,
        backgroundColor : '#303030',
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
                color : "#151515",

            }, {
                color : "#2E2E2E",

            }]
        },
    });

    var teamsLabel = Ti.UI.createLabel({
        height : 30,
        text : obj.match.team1_name + " - " + obj.match.team2_name + ' ',
        left : 20,
        color : "#FFF",
        font : Alloy.Globals.getFontCustom(18, "Bold"),
        top : 12
    });

    var dateLabel = Ti.UI.createLabel({
        height : 20,
        top : 40,
        left : 20,
        text : obj.match.game_date + ' ',
        color : Alloy.Globals.themeColor(),
        font : Alloy.Globals.getFont(14, "Regular"),
    });

    teamHeader.add(teamsLabel);
    teamHeader.add(dateLabel);

    if (!isAndroid) {
        sections[0] = Ti.UI.createTableViewSection({
            headerView : teamHeader,
            footerView : Ti.UI.createView({
                height : 0.1,
            })
        });
    } else {
        sections[0] = Ti.UI.createTableViewSection({
            headerView : teamHeader
        });
    }

    var bet_amount = obj.match.bet_amount;
    var count = obj.stats.count;
    var winners_count = obj.winners.length;

    var total_pot = bet_amount * count;
    var win_amount = 0;
    if (winners_count > 0) {
        win_amount = Math.floor(total_pot / winners_count);
    }

    var participantRow = Ti.UI.createTableViewRow({
        height : 65,
        width : Ti.UI.FILL,
    });

    var winAmountRow = Ti.UI.createTableViewRow({
        height : 65,
        width : Ti.UI.FILL
    });

    var matchParticipantsLabel = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.matchOTDparticipants + ': ' + count + ' ',
        left : 20,
        color : "#FFF",
        font : Alloy.Globals.getFontCustom(16, "Regular"),
    });

    participantRow.add(matchParticipantsLabel);

    var matchWinnersPot = Ti.UI.createLabel({
        text : Alloy.Globals.PHRASES.matchOTDwinAmount + ': ' + win_amount + ' ',
        left : 20,
        color : "#FFF",
        font : Alloy.Globals.getFontCustom(16, "Regular"),
    });

    winAmountRow.add(matchWinnersPot);

    sections[0].add(participantRow);
    sections[0].add(winAmountRow);

    sections[1] = createSectionsForTable(Alloy.Globals.PHRASES.matchOTDwinners);

    if (obj.winners.length > 0) {
        for (var i in obj.winners) {
            sections[1].add(constructChallengeRows(obj.winners[i], i));
        }

    } else {
        var emptyRow = Ti.UI.createTableViewRow({
            height : 65,
            width : Ti.UI.FILL,
        });

        emptyRow.add(Ti.UI.createLabel({
            text : Alloy.Globals.PHRASES.noneTxt + ' ' + Alloy.Globals.PHRASES.matchOTDwinners.toLowerCase() + ' ' + Alloy.Globals.PHRASES.foundTxt + ' ',
            left : 20,
            font : Alloy.Globals.getFontCustom(16, "Regular"),
            color : "#FFF"
        }));

        sections[1].add(emptyRow);
    }

    table.setData(sections);

    table.addEventListener('swipe', function(e) {
        if (e.direction !== 'up' && e.direction !== 'down') {
            Ti.API.log(e.direction);

            table.touchEnabled = false;
            Ti.App.fireEvent('app:slide');
            table.touchEnabled = true;
        }
    });

    $.previousMatchOTD.add(table);

}

function showPreviousMatch(obj) {

    constructTableView(obj);
}

getPreviousMatchDay();
