var uie = require('lib/IndicatorWindow');
var indicator = uie.createIndicatorWindow({
	top : 200,
	text : Alloy.Globals.PHRASES.loadingTxt
});

if (OS_IOS) {
	var InAppProducts = require('com.logicallabs.inappproducts');

	var iOSVersion;

	if (OS_IOS) {
		iOSVersion = parseInt(Ti.Platform.version);
	}
	
	var heightVal = 50;
	var topPos = 30;
	var textFontSize = Alloy.Globals.getFontSize(2);
	
	if(iOSVersion < 7) {
		heightVal = 40;
		topPos = 19;
		textFontSize = 16;
	}

	// This call (or any other) may fail on Android if the module hasn't finished
	// its initialization routine yet -- always wait for the stateChange event!!!
	Ti.API.info('Module ready? ' + (InAppProducts.getSupportStatus() !== InAppProducts.SUPPORT_STATUS_ERROR));

	// Note: These product IDs must match the product IDs you configure on
	// iTunes Connect and Android Developer Console!
	var productIDs = ["apps.topgame.betkampen.coins.20", "apps.topgame.betkampen.coins.40", "apps.topgame.betkampen.coins.100"];
	var productObjects;
	var purchaseStateToString;

	function stateChangeEventFunction(e) {
		Ti.API.info('Received stateChange event with state ' + e.state);
		switch(InAppProducts.state) {
			case InAppProducts.STATE_NOT_READY:
				Alloy.Globals.showFeedbackDialog('Modulen är inte redo!');
				if (e.errorCode) {
					Ti.API.info('Initialization error code: ' + e.errorCode);
				}
				if (e.errorMessage) {
					Ti.API.info('Initialization error msg: ' + e.errorMessage);
				}
				break;
			case InAppProducts.STATE_READY:
				Ti.API.log('Module ready.');
				break;
			case InAppProducts.STATE_NOT_SUPPORTED:
				Alloy.Globals.showFeedbackDialog('This does not work in the emulator!');
				break;
			default:
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.moduleNotReadyTxt);
		}
	}

	function receivedProductsEventFunction(e) {
		if (e.errorCode) {
			indicator.closeIndicator();
			fetchProductsError();
		} else {
			Ti.API.info('getProducts succeeded!');

			productObjects = e.products;
			Ti.API.info('Product count: ' + productObjects.length);

			Ti.API.info("Invalid IDs: " + JSON.stringify(e.invalid));

			indicator.closeIndicator();
			buildGUI(productObjects);
		}
	}

	function purchaseUpdateEventFunction(e) {
		Ti.API.info('Received purchaseUpdate event');
		indicator.openIndicator();

		if (e.errorCode) {
			// This only happens on Android. On iOS, there is no error
			// condition associated with the purchaseUpdate event, although
			// the purchase itself may be in PURCHASE_STATE_FAILED state.
			indicator.closeIndicator();
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.purchaseFailureTxt);
		} else {
			Ti.API.info('Product: ' + e.purchase.SKU + ' state: ' + purchaseStateToString(e.purchase.state));
			switch (e.purchase.state) {
				case InAppProducts.PURCHASE_STATE_PURCHASED:
					// This is a possible state on both iOS and Android
					completePurchaseServer(e.purchase.SKU, e.purchase.receipt);
					break;
				case InAppProducts.PURCHASE_STATE_CANCELED:
					// Android only
					indicator.closeIndicator();
					Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.purchaseCanceledTxt);
					break;
				case InAppProducts.PURCHASE_STATE_REFUNDED:
					// Android only
					break;
				case InAppProducts.PURCHASE_STATE_PURCHASING:
					// iOS only
					break;
				case InAppProducts.PURCHASE_STATE_FAILED:
					// iOS only
					indicator.closeIndicator();
					Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.purchaseFailureTxt);
					break;
				case InAppProducts.PURCHASE_STATE_RESTORED:
					// iOS only
					break;
			}

			if (InAppProducts.autoCompletePurchases === false) {
				// This is for iOS only; autoCompletePurchases is constant
				// true on Android as there is no need/ability to separately
				// complete purchases; they are essentially always
				// auto-completed.
				switch (e.purchase.state) {
					case InAppProducts.PURCHASE_STATE_PURCHASED:
					case InAppProducts.PURCHASE_STATE_FAILED:
					case InAppProducts.PURCHASE_STATE_RESTORED:

						Ti.API.info('Completing purchase...');
						e.purchase.complete();
						break;
				}
			}
		}
	}

	function addEventListeners() {
		/*
		 * module events
		 */
		InAppProducts.addEventListener('stateChange', stateChangeEventFunction);
		InAppProducts.addEventListener('receivedProducts', receivedProductsEventFunction);
		InAppProducts.addEventListener('purchaseUpdate', purchaseUpdateEventFunction);
	}

	purchaseStateToString = function(state) {
		switch (state) {
			case InAppProducts.PURCHASE_STATE_PURCHASED:
				return 'purchased';
			case InAppProducts.PURCHASE_STATE_CANCELED:
				// Android only
				return 'canceled';
			case InAppProducts.PURCHASE_STATE_REFUNDED:
				// Android only
				return 'refunded';
			case InAppProducts.PURCHASE_STATE_PURCHASING:
				// iOS only
				return "purchasing";
			case InAppProducts.PURCHASE_STATE_FAILED:
				// iOS only
				return "failed";
			case InAppProducts.PURCHASE_STATE_RESTORED:
				// iOS only
				return "restored";
			default:
				return 'unknown';
		}
	};

	function retry(identifier, receipt, msg) {
		var alertWindow = Titanium.UI.createAlertDialog({
			title : Alloy.Globals.PHRASES.commonErrorTxt,
			message : msg,
			buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.retryTxt]
		});

		alertWindow.addEventListener('click', function(e) {
			switch (e.index) {
				case 0:
					alertWindow.hide();
					break;
				case 1:
					completePurchaseServer(identifier, receipt);
					alertWindow.hide();
					break;
			}
		});
		alertWindow.show();
	}

	function completePurchaseServer(identifier, receipt) {

		var receiptTextEncoded = Ti.Utils.base64encode(receipt).text;
		var receiptText64String = receiptTextEncoded.replace(/\r/g, '').replace(/\n/g, '');

		// check connection
		if (Alloy.Globals.checkConnection()) {
			var xhr = Titanium.Network.createHTTPClient();
			xhr.onerror = function(e) {
				indicator.closeIndicator();
				retry(identifier, receipt, Alloy.Globals.PHRASES.commonErrorTxt);
			};

			try {
				xhr.open('POST', Alloy.Globals.BETKAMPENCOINSURL);
				xhr.setRequestHeader("content-type", "application/json");
				xhr.setTimeout(Alloy.Globals.TIMEOUT);
				var storeTest = 0;
				//TODO should be 0 for Production
				var param = '{"receipt":"' + receiptText64String + '", "coins_item":"' + identifier + '", "sandbox":"' + storeTest + '", "user":"' + Alloy.Globals.FACEBOOKOBJECT.id + '", "betkampen_id":"' + Alloy.Globals.BETKAMPENUID + '"}';

				xhr.send(param);
			} catch(e) {
				indicator.closeIndicator();
				retry(identifier, receipt, Alloy.Globals.PHRASES.commonErrorTxt);
			}
			xhr.onload = function() {
				if (this.status == '200') {
					indicator.closeIndicator();
					if (this.readyState == 4) {
						Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));
					} else {
						retry(identifier, receipt, JSON.parse(this.responseText));
					}
				} else {
					indicator.closeIndicator();
					retry(identifier, receipt, JSON.parse(this.responseText));
				}
			};
		} else {
			indicator.closeIndicator();
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
		}
	}

	function purchaseCurrentProduct(prod) {
		var developerPayloadRaw = Ti.Utils.base64encode(Alloy.Globals.FACEBOOKOBJECT.id).text;
		var appPayload = developerPayloadRaw.replace(/\r/g, '').replace(/\n/g, '');

		if (Alloy.Globals.checkConnection()) {
			var product = productObjects[prod];
			//var appPayload;

			//appPayload = 'AppPayloadRandom#' + Math.round(Math.random() * 1000);
			Ti.API.info('Purchasing product ' + product.SKU + ' with app payload ' + appPayload);
			product.purchase({
				quantity : 1,
				applicationPayload : appPayload
			});
		} else {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
		}

	}

	function buildGUI(products) {
		try {
			products.sort(function(a, b) {
				if (a.priceAsNumber < b.priceAsNumber)
					return -1;
				if (a.priceAsNumber > b.priceAsNumber)
					return 1;
				return 0;
			});
		} catch(e) {
			// should not be an issue
		}

		for (product in products) {
			var buyCoinsButton = Ti.UI.createButton({
				title : products[product].priceAsString,
				top : topPos,
				textAlign : 'center',
				height : heightVal,
				width : '70%',
				borderRadius : 6,
				font : {
					fontFamily : Alloy.Globals.getFont(),
					fontSize : Alloy.Globals.getFontSize(2)
				},
				color : '#FFF',
				backgroundImage : 'none',
				backgroundColor : '#58B101',
				index : product
			});
			buyCoinsButton.addEventListener('click', function(e) {
				purchaseCurrentProduct(e.source.index);
			});

			$.store.add(buyCoinsButton);

			$.store.add(Ti.UI.createLabel({
				top : 5,
				font : {
					fontFamily : Alloy.Globals.getFont(),
					fontSize : textFontSize
				},
				color : '#FFF',
				text : 'Ger ' + products[product].title,
				textAlign : 'center'
			}));

		}
	}

	function fetchProductsError() {
		var alertWindow = Titanium.UI.createAlertDialog({
			title : Alloy.Globals.PHRASES.commonErrorTxt,
			message : Alloy.Globals.PHRASES.purchaseFetchTxt,
			buttonNames : [Alloy.Globals.PHRASES.retryTxt, Alloy.Globals.PHRASES.closeBtnTxt]
		});

		alertWindow.addEventListener('click', function(e) {
			switch (e.index) {
				case 0:
					alertWindow.hide();
					indicator.openIndicator();
					InAppProducts.getProducts({
						SKUs : productIDs
					});
					break;
				case 1:
					alertWindow.hide();
					break;
			}
		});
		alertWindow.show();
	}

	function init() {

		Ti.API.info('Initializing app...');

		var imageView = Ti.UI.createImageView({
			height : 142,
			width : '100%',
			image : '/images/header.png'
		});

		imageView.add(Ti.UI.createLabel({
			top : 50,
			color : '#FFF',
			font : {
				fontFamily : Alloy.Globals.getFont(),
				fontSize : Alloy.Globals.getFontSize(3)
			},
			text : Alloy.Globals.PHRASES.buyCoinsTxt
		}));

		$.store.add(imageView);
		indicator.openIndicator();

		addEventListeners();

		if (InAppProducts.state === InAppProducts.STATE_READY) {
			if (Alloy.Globals.checkConnection()) {
				if (InAppProducts.getProducts({
					SKUs : productIDs
				})) {
					Ti.API.info('getProducts request started successfully.');
				} else {
					indicator.closeIndicator();
					fetchProductsError();
				}
			} else {
				indicator.closeIndicator();
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
			}
		}

		Ti.API.info('... initialization complete!');
	}

	init();

	$.store.addEventListener('close', function() {
		InAppProducts.removeEventListener('stateChange', stateChangeEventFunction);
		InAppProducts.removeEventListener('receivedProducts', receivedProductsEventFunction);
		InAppProducts.removeEventListener('purchaseUpdate', purchaseUpdateEventFunction);

		indicator.closeIndicator();
		InAppProducts = null;
		$.destroy();
		$.store = null;
	});

} else if (OS_ANDROID) {
	$.store.orientationModes = [Titanium.UI.PORTRAIT];

	$.store.addEventListener('open', function() {
		$.store.activity.actionBar.onHomeIconItemSelected = function() {
			$.store.close();
		};
		$.store.activity.actionBar.displayHomeAsUp = true;
		$.store.activity.actionBar.title = Alloy.Globals.PHRASES.betbattleTxt;
	});

	$.store.addEventListener('close', function() {
		indicator.closeIndicator();
	});

	function makePurchase(product) {
		// check connection
		if (Alloy.Globals.checkConnection()) {

			var xhr = Titanium.Network.createHTTPClient();
			xhr.onerror = function(e) {
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
				indicator.closeIndicator();
			};

			try {
				xhr.open('POST', Alloy.Globals.BETKAMPENCOINSANDROIDURL + '?uid=' + Alloy.Globals.BETKAMPENUID);
				xhr.setRequestHeader("content-type", "application/json");
				xhr.setTimeout(Alloy.Globals.TIMEOUT);

				var param = JSON.stringify(product);

				xhr.send(param);

				logInApp(param);
			} catch(e) {
				Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
				indicator.closeIndicator();
			}
			xhr.onload = function() {
				if (this.status == '200') {
					indicator.closeIndicator();
					if (this.readyState == 4) {
						Alloy.Globals.showFeedbackDialog(JSON.parse(this.responseText));

					} else {
						var alertWindow = Titanium.UI.createAlertDialog({
							title : Alloy.Globals.PHRASES.commonErrorTxt,
							message : JSON.parse(this.responseText),
							buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.retryTxt]
						});

						alertWindow.addEventListener('click', function(e) {
							switch (e.index) {
								case 0:
									alertWindow.hide();
									break;
								case 1:
									makePurchase(product);
									alertWindow.hide();
									break;
							}
						});
					}
				} else {
					indicator.closeIndicator();
					var alertWindow = Titanium.UI.createAlertDialog({
						title : Alloy.Globals.PHRASES.commonErrorTxt,
						message : JSON.parse(this.responseText),
						buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt, Alloy.Globals.PHRASES.retryTxt]
					});

					alertWindow.addEventListener('click', function(e) {
						switch (e.index) {
							case 0:
								alertWindow.hide();
								break;
							case 1:
								makePurchase(product);
								alertWindow.hide();
								break;
						}
					});
				}
			};
		} else {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.noConnectionErrorTxt);
		}
	}

	var InAppBilling = require('ti.inappbilling');

	var status = false;

	var PUBLIC_KEY = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlxb/6H5UAlfdtBk66M1DeVOaXcvHTHx6R2nnLtN/n6LQVnPYF7t8UaoqIW+KgpjpIx3Ffopki26Wm83aHxkBq5L2Q5+I2laH8RpUWR6w0cz4Gv+7j0inQwX7GpE52EetREupqHrCz3CfhVPKMVGxLQsKCXFZewaocWGTh3fDRzk+nJK8NtlM1HvQIeFW/sAqtx+hNyKRd4nNQ5AZidM9J9WfTQwDZfh1lgvDra9ysSppD29ZHnCp9taZD0ntbOdM/QBxr+4ur+h/Jl43vT9tjBmIsRxip/I0Op3f1DOamoNwPV/PdhwjuzYFbAMvtJxCav+z6Pn9coPV98HEYz1R/wIDAQAB';

	// Read more about the developer payload in the "Verify the Developer Payload"
	// section of the documentation. It is not necessary to change this to run the example.
	var developerPayloadRaw = Ti.Utils.base64encode(Alloy.Globals.FACEBOOKOBJECT.id).text;
	var DEVELOPER_PAYLOAD = developerPayloadRaw.replace(/\r/g, '').replace(/\n/g, '');

	InAppBilling.addEventListener('setupcomplete', function(e) {
		logInApp('Setup response: ' + responseString(e.responseCode));
		if (e.success) {
			status = true;
			logInApp('Setup completed successfully!');
			InAppBilling.queryInventory({
				moreItems : ['apps.topgame.betkampen.coins.20', 'apps.topgame.betkampen.coins.40', 'apps.topgame.betkampen.coins.100']
			});
		} else {
			logInApp('Setup FAILED.');
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
			indicator.closeIndicator();
		}
	});

	InAppBilling.addEventListener('queryinventorycomplete', function(e) {
		logInApp('Query Inventory response: ' + responseString(e.responseCode));
		var inventory = e.inventory;
		var productIds = ['apps.topgame.betkampen.coins.20', 'apps.topgame.betkampen.coins.40', 'apps.topgame.betkampen.coins.100'];

		var purchase;
		var toConsume = null;

		indicator.closeIndicator();
		if (e.success) {
			for (var i = 0, j = productIds.length; i < j; i++) {

				if (inventory.hasDetails(productIds[i])) {
					var productDetails = (inventory.getDetails(productIds[i]));
					// build UI
					createPurchaseButton(productDetails);
				}

				// TODO should handle if a purchase is interrupted before serverside? will work with what I have?

			}

			logInApp('success!!!');
		} else {
			Alloy.Globals.showFeedbackDialog(Alloy.Globals.PHRASES.commonErrorTxt);
			// TODO retry?
		}
	});

	InAppBilling.addEventListener('consumecomplete', function(e) {
		logInApp('Consume response: ' + responseString(e.responseCode));
		if (e.success) {
			// send to backend
			makePurchase(e.purchase);
		}
	});

	InAppBilling.addEventListener('purchasecomplete', function(e) {
		logInApp('Purchase response: ' + responseString(e.responseCode));
		if (e.success && e.purchase) {
			logInApp(purchaseProperties(e.purchase));
			indicator.openIndicator();
			InAppBilling.consume({
				purchases : [e.purchase]
			});
		}
	});

	function runSetup() {
		logInApp('Running startSetup...');
		InAppBilling.startSetup({
			publicKey : PUBLIC_KEY
		});
		logInApp('Wait for setup to complete successfully');
	}

	function responseString(responseCode) {
		switch (responseCode) {
			case InAppBilling.RESULT_OK:
				return 'OK';
			case InAppBilling.RESULT_USER_CANCELED:
				return 'USER CANCELED';
			case InAppBilling.RESULT_BILLING_UNAVAILABLE:
				return 'BILLING UNAVAILABLE';
			case InAppBilling.RESULT_ITEM_UNAVAILABLE:
				return 'ITEM UNAVAILABLE';
			case InAppBilling.RESULT_DEVELOPER_ERROR:
				return 'DEVELOPER ERROR';
			case InAppBilling.RESULT_ERROR:
				return 'RESULT ERROR';
			case InAppBilling.RESULT_ITEM_ALREADY_OWNED:
				return 'RESULT ITEM ALREADY OWNED';
			case InAppBilling.RESULT_ITEM_NOT_OWNED:
				return 'RESULT ITEM NOT OWNED';

			case InAppBilling.IAB_RESULT_REMOTE_EXCEPTION:
				return 'IAB RESULT REMOTE EXCEPTION';
			case InAppBilling.IAB_RESULT_BAD_RESPONSE:
				return 'IAB RESULT BAD RESPONSE';
			case InAppBilling.IAB_RESULT_VERIFICATION_FAILED:
				return 'IAB RESULT VERIFICATION FAILED';
			case InAppBilling.IAB_RESULT_SEND_INTENT_FAILED:
				return 'IAB RESULT SEND INTENT FAILED';
			case InAppBilling.IAB_RESULT_UNKNOWN_PURCHASE_RESPONSE:
				return 'IAB RESULT UNKNOWN PURCHASE RESPONSE';
			case InAppBilling.IAB_RESULT_MISSING_TOKEN:
				return 'IAB RESULT MISSING TOKEN';
			case InAppBilling.IAB_RESULT_UNKNOWN_ERROR:
				return 'IAB RESULT UNKNOWN ERROR';
			case InAppBilling.IAB_RESULT_SUBSCRIPTIONS_NOT_AVAILABLE:
				return 'IAB RESULT SUBSCRIPTIONS NOT AVAILABLE';
			case InAppBilling.IAB_RESULT_INVALID_CONSUMPTION:
				return 'IAB RESULT INVALID CONSUMPTION';
		}
		return '';
	}

	function purchaseStateString(state) {
		switch (state) {
			case InAppBilling.PURCHASE_STATE_PURCHASED:
				return 'PURCHASE STATE PURCHASED';
			case InAppBilling.PURCHASE_STATE_CANCELED:
				return 'PURCHASE STATE CANCELED';
		}
		return '';
	}

	function purchaseTypeString(state) {
		switch (state) {
			case InAppBilling.ITEM_TYPE_INAPP:
				return 'ITEM TYPE INAPP';
		}
		return '';
	}

	function purchaseProperties(p) {
		var str = 'type: ' + purchaseTypeString(p.type) + '\norderId: ' + p.orderId + '\npackageName: ' + p.packageName + '\nproductId: ' + p.productId + '\npurchaseTime: ' + new Date(p.purchaseTime) + '\npurchaseState: ' + purchaseStateString(p.purchaseState) + '\ndeveloperPayload: ' + p.developerPayload + '\ntoken: ' + p.token;

		return str;
	}

	////////////////////////////////////////////////////////
	// UI
	////////////////////////////////////////////////////////
	
	var imageView = Ti.UI.createView({
		top : 0,
		height : 142,
		width : '100%',
		backgroundImage : '/images/header.png'
	});

	imageView.add(Ti.UI.createLabel({
		top : 50,
		color : '#FFF',
		font : {
			fontFamily : Alloy.Globals.getFont(),
			fontWeight : 'normal',
			fontSize : Alloy.Globals.getFontSize(3)
		},
		text : Alloy.Globals.PHRASES.buyCoinsTxt
	}));

	$.store.add(imageView);

	// used to create button for product
	function createPurchaseButton(product) {

		var buyCoins = Ti.UI.createButton({
			title : product.price,
			top : 30,
			width : '70%',
			borderRadius : 6,
			textAlign : 'center',
			height : 40,
			font : {
				fontFamily : Alloy.Globals.getFont(),
				fontSize : Alloy.Globals.getFontSize(2)
			},
			color : '#FFF',
			backgroundImage : 'none',
			backgroundColor : '#58B101'
		});
		buyCoins.addEventListener('click', function() {
			InAppBilling.purchase({
				productId : product.productId,
				type : InAppBilling.ITEM_TYPE_INAPP,
				developerPayload : DEVELOPER_PAYLOAD
			});
		});
		$.store.add(buyCoins);

		$.store.add(Ti.UI.createLabel({
			top : 5,
			font : {
				fontFamily : Alloy.Globals.getFont(),
				fontSize : Alloy.Globals.getFontSize(1)
			},
			color : '#FFF',
			text : product.description,
			textAlign : 'center'
		}));
	}

	if (PUBLIC_KEY === '<< Public Key >>') {
		// The public key is required, see the declaration of the
		// PUBLIC_KEY variable for more details.
		Alloy.Globals.showFeedbackDialog("Please put your app's public key in PUBLIC_KEY in this example.");
	} else {
		// Setup must be run and complete successfully before any other
		// module methods are called.

		indicator.openIndicator();

		try {
			runSetup();
		} catch (IllegalStateException) {
			// TODO handle this more??  ....

			if (IllegalStateException.message === 'Setup already completed.') {
				InAppBilling.queryInventory({
					moreItems : ['apps.topgame.betkampen.coins.20', 'apps.topgame.betkampen.coins.40', 'apps.topgame.betkampen.coins.100']
				});
				logInApp("Setup was already made... Starting query for products.");
			} else {
				var alertWindow = Titanium.UI.createAlertDialog({
					title : Alloy.Globals.PHRASES.betbattleErrorTxt,
					message : Alloy.Globals.PHRASES.criticalErrorTxt,
					buttonNames : [Alloy.Globals.PHRASES.okConfirmTxt]
				});

				alertWindow.addEventListener('click', function(e) {
					switch (e.index) {
						case 0:
							alertWindow.hide();
							$.store.exitOnClose = true;
							$.store.close();
							Alloy.Globals.MAINWIN.close();
							var activity = Titanium.Android.currentActivity;
							activity.finish();
							break;
					}
				});
				setTimeout(function() {
					alertWindow.show();
				}, 300);
			}
		}
	}

	// Util - Logs in app and console
	function logInApp(text) {
		Ti.API.info(text);
	}

}
