function ModalPicker(prefs, data, selectTxt, closeTxt, id) {

    var self = Ti.UI.createLabel(prefs);

    self.id = id;

	
	var marginHeight = 20;
	
	if(Ti.Platform.displayCaps.platformHeight > 600) {
		marginHeight = 60;
	}
	
    var subWin = Ti.UI.createWindow({
        backgroundColor: '#000',
        top: Ti.Platform.displayCaps.platformHeight - 1,
        height: ((Ti.Platform.displayCaps.platformHeight / 2) - marginHeight), // 274 256
        width: Ti.Platform.displayCaps.platformWidth, // 320,
        navBarHidden: true
    });

    var select = Ti.UI.createButton({
        title: selectTxt,
        font : Alloy.Globals.FONT,
        style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
        color : '#FFF',
        backgroundImage : 'none',
        width : 100,
        height: Ti.UI.SIZE
    });
    
    var close = Ti.UI.createButton({
    	title: closeTxt,
    	font : Alloy.Globals.FONT,
        style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
        color : '#FFF',
        backgroundImage : 'none',
        width : 100,
        height: Ti.UI.SIZE
    });


    var flexSpace = Ti.UI.createButton({
        systemButton: Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });

    var toolbar = Ti.UI.iOS.createToolbar({
        items: [close, flexSpace, select],
        top: 0,
        borderTop: true,
        borderBottom: false,
        barColor: '#000'
    });

    select.addEventListener('click', function () {
        self.text = picker.getSelectedRow(0).title;
        self.value = picker.getSelectedRow(0).value;
        self.fireEvent('change');
        subWin.animate({
            top: Ti.Platform.displayCaps.platformHeight
        });
    });
    
    close.addEventListener('click', function() {
        self.open = false;
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

    self.addEventListener('click', function () {
        self.open = true;
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