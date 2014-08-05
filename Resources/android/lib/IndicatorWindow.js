function createIndicatorWindow(args) {
    function openIndicator() {
        activityIndicator.show();
    }
    function closeIndicator() {
        activityIndicator.hide();
    }
    var width = 180, height = 50;
    var args = args || {};
    var top = args.top || 140;
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
    activityIndicator = Ti.UI.Android.createProgressIndicator({
        message: "Laddar...",
        location: Ti.UI.Android.PROGRESS_INDICATOR_DIALOG,
        type: Ti.UI.Android.PROGRESS_INDICATOR_INDETERMINANT,
        cancelable: false
    });
    var label = Titanium.UI.createLabel({
        left: 10,
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        text: L("Laddar..."),
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