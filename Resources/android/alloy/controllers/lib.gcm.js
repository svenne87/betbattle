function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "lib.gcm";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    exports.destroy = function() {};
    _.extend($, $.__views);
    (function(API) {
        var gcm = require("net.iamyellow.gcmjs");
        API.doRegistration = function(callbacks) {
            gcm.registerForPushNotifications(callbacks);
        };
        API.doUnregistration = function() {
            gcm.unregisterForPushNotifications();
        };
        API.getData = function() {
            var data = gcm.data;
            return data ? data : null;
        };
        API.setData = function(data) {
            gcm.data = data;
        };
    })(module.exports);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;