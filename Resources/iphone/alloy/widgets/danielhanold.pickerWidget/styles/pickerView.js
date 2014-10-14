function WPATH(s) {
    var index = s.lastIndexOf("/");
    var path = -1 === index ? "danielhanold.pickerWidget/" + s : s.substring(0, index) + "/danielhanold.pickerWidget/" + s.substring(index + 1);
    return path;
}

module.exports = [ {
    isId: true,
    priority: 100000.9001,
    key: "facebookBtn",
    style: {
        top: "65%",
        height: "9%",
        width: "80%",
        backgroundColor: "#336699",
        borderRadius: 3
    }
}, {
    isId: true,
    priority: 100100.0013,
    key: "pickerView",
    style: {
        backgroundColor: "white",
        bottom: 0,
        height: 260,
        zIndex: 99
    }
}, {
    isId: true,
    priority: 100100.0014,
    key: "toolbar",
    style: {
        top: 0,
        barColor: "white"
    }
}, {
    isId: true,
    priority: 100100.0015,
    key: "picker",
    style: {
        top: 44,
        selectionIndicator: true,
        useSpinner: true
    }
} ];