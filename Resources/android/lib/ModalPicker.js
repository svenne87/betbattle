function ModalPicker(prefs, data, selectTxt, closeTxt) {
    var self = Ti.UI.createLabel(prefs);
    self.id = null;
    var subWin = Ti.UI.createWindow({
        backgroundColor: "blue",
        top: Ti.Platform.displayCaps.platformHeight - 1,
        height: 256,
        width: 320,
        navBarHidden: true
    });
    var select = Ti.UI.createButton({
        title: selectTxt,
        style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
        color: "#FFF",
        backgroundImage: "none",
        width: 100
    });
    var close = Ti.UI.createButton({
        title: closeTxt,
        style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
        color: "#FFF",
        backgroundImage: "none",
        width: 100
    });
    var flexSpace = Ti.UI.createButton({
        systemButton: Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });
    var toolbar = Ti.UI.iOS.createToolbar({
        items: [ close, flexSpace, select ],
        top: 0,
        borderTop: true,
        borderBottom: false,
        barColor: "#303030"
    });
    select.addEventListener("click", function() {
        self.text = picker.getSelectedRow(0).title;
        self.value = picker.getSelectedRow(0).value;
        self.fireEvent("change");
        subWin.animate({
            top: Ti.Platform.displayCaps.platformHeight
        });
    });
    close.addEventListener("click", function() {
        subWin.animate({
            top: Ti.Platform.displayCaps.platformHeight
        });
    });
    subWin.add(toolbar);
    var picker = Ti.UI.createPicker({
        bottom: 0
    });
    picker.add(data);
    picker.selectionIndicator = true;
    subWin.add(picker);
    self.addEventListener("click", function() {
        subWin.open();
        subWin.animate({
            top: Ti.Platform.displayCaps.platformHeight - 274
        });
    });
    self.close = function() {
        subWin.close();
    };
    return self;
}

module.exports = ModalPicker;