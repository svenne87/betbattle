function WPATH(s) {
    var index = s.lastIndexOf("/");
    var path = -1 === index ? "ds.slideMenu/" + s : s.substring(0, index) + "/ds.slideMenu/" + s.substring(index + 1);
    return path;
}

module.exports = [ {
    isClass: true,
    priority: 10000.9004,
    key: "challengesSection",
    style: {
        backgroundColor: "#ea7337",
        backgroundGradient: {
            type: "linear",
            startPoint: {
                x: "0%",
                y: "0%"
            },
            endPoint: {
                x: "0%",
                y: "100%"
            },
            colors: [ {
                color: "#EC814B",
                offset: 0
            }, {
                color: "#CA5215",
                offset: 1
            } ]
        }
    }
}, {
    isId: true,
    priority: 100000.0002,
    key: "leftMenu",
    style: {
        top: "0dp",
        left: "0dp",
        width: "250dp",
        zIndex: "2",
        backgroundColor: "#303030"
    }
}, {
    isId: true,
    priority: 100000.0003,
    key: "rightMenu",
    style: {
        top: "0dp",
        right: "0dp",
        width: "250dp",
        zIndex: "1",
        backgroundColor: "#303030"
    }
}, {
    isId: true,
    priority: 100000.0004,
    key: "navview",
    style: {
        top: "0dp",
        left: "0dp",
        width: Ti.Platform.displayCaps.platformWidth,
        height: "0dp",
        backgroundImage: "/ds.slideMenu/NavBackground.png"
    }
}, {
    isId: true,
    priority: 100000.0005,
    key: "movableview",
    style: {
        left: "0",
        zIndex: "3",
        width: Ti.Platform.displayCaps.platformWidth
    }
}, {
    isId: true,
    priority: 100000.0006,
    key: "contentview",
    style: {
        left: "0dp",
        width: Ti.Platform.displayCaps.platformWidth,
        height: Ti.UI.Fill,
        top: "0dp",
        backgroundColor: "#303030"
    }
}, {
    isId: true,
    priority: 100000.0007,
    key: "shadowview",
    style: {
        shadowColor: "black",
        shadowOffset: {
            x: "0",
            y: "0"
        },
        shadowRadius: "2.5"
    }
}, {
    isId: true,
    priority: 100000.0008,
    key: "leftButton",
    style: {
        backgroundImage: "none",
        image: "/ds.slideMenu/ButtonMenu.png",
        left: "0",
        top: "0",
        width: "60",
        height: "44",
        style: "none"
    }
}, {
    isId: true,
    priority: 100000.0009,
    key: "rightButton",
    style: {
        backgroundImage: "none",
        image: "/ds.slideMenu/ButtonMenu.png",
        right: "0",
        top: "0",
        width: "60",
        height: "44",
        style: "none"
    }
}, {
    isId: true,
    priority: 100000.9001,
    key: "betbattleLogo",
    style: {
        top: "30%",
        image: "/images/betkampenlogo.png"
    }
}, {
    isId: true,
    priority: 100000.90019999999,
    key: "facebookBtn",
    style: {
        top: "30%",
        height: "7%",
        width: "68.5%",
        backgroundColor: "#336699",
        borderRadius: 3
    }
}, {
    isId: true,
    priority: 100101.9003,
    key: "nav",
    style: {
        backgroundColor: "#ea7337",
        backgroundGradient: {
            type: "linear",
            startPoint: {
                x: "0%",
                y: "0%"
            },
            endPoint: {
                x: "0%",
                y: "100%"
            },
            colors: [ {
                color: "#EC814B",
                offset: 0
            }, {
                color: "#CA5215",
                offset: 1
            } ]
        }
    }
} ];