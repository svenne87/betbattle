function createIndicatorWindow(args) {
    function osIndicatorStyle() {
        style = Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN;
        return style;
    }
    function openIndicator() {
        win.open();
        activityIndicator.show();
    }
    function closeIndicator() {
        activityIndicator.hide();
        win.close();
    }
    var width = 180, height = 50;
    var args = args || {};
    var top = args.top || 140;
    var text = args.text || "Loading...";
    var win = Titanium.UI.createWindow({
        height: height,
        width: width,
        top: top,
        borderRadius: 4,
        touchEnabled: false,
        backgroundColor: "#5E5E5E",
        opacity: .8
    });
    var view = Ti.UI.createView({
        width: Ti.UI.SIZE,
        height: Ti.UI.FILL,
        center: {
            x: width / 2,
            y: height / 2
        },
        layout: "horizontal"
    });
    var activityIndicator;
    activityIndicator = Ti.UI.createActivityIndicator({
        style: osIndicatorStyle(),
        left: 0,
        height: Ti.UI.FILL,
        width: 30
    });
    var label = Titanium.UI.createLabel({
        left: 10,
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        text: L(text),
        color: "#fff",
        font: {
            fontFamily: "Helvetica",
            fontSize: 16,
            fontWeight: "bold"
        }
    });
    view.add(activityIndicator);
    view.add(label);
    win.add(view);
    win.openIndicator = openIndicator;
    win.closeIndicator = closeIndicator;
    return win;
}

exports.createIndicatorWindow = createIndicatorWindow;