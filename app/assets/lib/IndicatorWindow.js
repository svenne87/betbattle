/**
 * Indicator window with a spinner and a label
 *
 * @param {Object} args
 */
function createIndicatorWindow(args) {

	var width = 180, height = 50;

	var args = args || {};
	var top = args.top || 140;
	var text = args.text || "Loading...";

	var win = Titanium.UI.createWindow({
		height : height,
		width : width,
		top : top,
		borderRadius : 4,
		touchEnabled : false,
		backgroundColor : '#5E5E5E',
		opacity : 0.8
	});

	var view = Ti.UI.createView({
		width : Ti.UI.SIZE,
		height : Ti.UI.FILL,
		center : {
			x : (width / 2),
			y : (height / 2)
		},
		layout : 'horizontal'
	});

	function osIndicatorStyle() {
		style = Ti.UI.ActivityIndicatorStyle.PLAIN;

		if ('iPhone OS' !== Ti.Platform.name) {
			style = Ti.UI.ActivityIndicatorStyle.DARK;
		}

		return style;
	}

	var activityIndicator;
	if (OS_IOS) {
		activityIndicator = Ti.UI.createActivityIndicator({
			style : osIndicatorStyle(),
			left : 0,
			height : Ti.UI.FILL,
			width : 30
		});
	} else {
		activityIndicator = Ti.UI.Android.createProgressIndicator({
  			message: text,
  			location: Ti.UI.Android.PROGRESS_INDICATOR_DIALOG,
  			type: Ti.UI.Android.PROGRESS_INDICATOR_INDETERMINANT,
  			cancelable: false,
		});
	}

	var label = Titanium.UI.createLabel({
		left : 10,
		width : Ti.UI.FILL,
		height : Ti.UI.FILL,
		text : L(text),
		color : '#fff',
		font : {
            fontSize : 16,
            fontFamily : 'OpenSans-Regular',
            fontWeight : 'Regular'
		},
	});

	view.add(activityIndicator);
	view.add(label);
	win.add(view);

	function openIndicator() {
		if(OS_IOS){
			win.open();
		}
		
		setTimeout(function() {
			activityIndicator.show();
        }, 100);
	}


	win.openIndicator = openIndicator;

	function closeIndicator() {		
		if(OS_IOS){
			win.close();
		}
		
		setTimeout(function() {
			activityIndicator.hide();
        }, 300);
	}


	win.closeIndicator = closeIndicator;
	
    function setText(text) {
        if(OS_IOS) {
            label.setText(text);
        } else {
            activityIndicator.setMessage(text);
        }       
    }
    
    win.setText = setText;
    
	return win;
}

// Public interface
exports.createIndicatorWindow = createIndicatorWindow;
