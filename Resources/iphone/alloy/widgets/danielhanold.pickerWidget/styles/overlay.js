function WPATH(s) {
    var index = s.lastIndexOf("/");
    var path = -1 === index ? "danielhanold.pickerWidget/" + s : s.substring(0, index) + "/danielhanold.pickerWidget/" + s.substring(index + 1);
    return path;
}

module.exports = [ {
    isClass: true,
    priority: 10000.9003,
    key: "navLogo",
    style: {
        image: "images/lakers_header.png",
        left: 99,
        width: 130,
        height: 40
    }
}, {
    isClass: true,
    priority: 10000.9005,
    key: "challengesSection",
    style: {
        backgroundColor: "#EA7337",
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
                color: "#D85000",
                offset: 0
            }, {
                color: "#F09C00",
                offset: 1
            } ]
        }
    }
}, {
    isId: true,
    priority: 100000.001,
    key: "overlay",
    style: {
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        backgroundColor: "#000"
    }
}, {
    isId: true,
    priority: 100000.9001,
    key: "betbattleLogo",
    style: {}
}, {
    isId: true,
    priority: 100000.90019999999,
    key: "facebookBtn",
    style: {
        top: "75%",
        height: "7%",
        width: "68.5%",
        backgroundColor: "#336699",
        borderRadius: 3
    }
}, {
    isId: true,
    priority: 100101.0011,
    key: "overlay",
    style: {
        opacity: .25
    }
}, {
    isId: true,
    priority: 100101.9004,
    key: "nav",
    style: {
        translucent: false,
        statusBarStyle: Titanium.UI.iPhone.StatusBar.LIGHT_CONTENT,
        backgroundImage: "none",
        backgroundColor: "none",
        backgroundGradient: "none"
    }
} ];