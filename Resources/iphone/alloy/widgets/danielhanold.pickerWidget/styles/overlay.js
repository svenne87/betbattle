function WPATH(s) {
    var index = s.lastIndexOf("/");
    var path = -1 === index ? "danielhanold.pickerWidget/" + s : s.substring(0, index) + "/danielhanold.pickerWidget/" + s.substring(index + 1);
    return path;
}

module.exports = [ {
    isId: true,
    priority: 100000.0011,
    key: "overlay",
    style: {
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        backgroundColor: "#000"
    }
}, {
    isId: true,
    priority: 100101.0012,
    key: "overlay",
    style: {
        opacity: .25
    }
} ];