exports.definition = {
    config: {},
    extendModel: function(Model) {
        _.extend(Model.prototype, {
            validate: function(attrs) {
                for (var key in attrs) {
                    var value = attrs[key];
                    if ("id" === key && 0 >= value.length) return "Error: No Facebook id!";
                    if ("birthday" === key && 0 >= value.length) return "Error: No birthday!";
                    if ("locale" === key && 0 >= value.length) return "Error: No locale!";
                    if ("location" === key && 0 >= value.length) return "Error: No location!";
                    if ("username" === key && 0 >= value.length) return "Error: No username!";
                    if ("username" === key && 0 >= value.length) return "Error: No username!";
                    if ("fullName" === key && 0 >= value.length) return "Error: No fullname!";
                    if ("firstName" === key && 0 >= value.length) return "Error: No firstname!";
                    if ("lastName" === key && 0 >= value.length) return "Error: No lastname!";
                    if ("gender" === key && 0 >= value.length) return "Error: No gender!";
                }
            },
            customProperty: "facebook",
            customFunction: function() {
                Ti.API.info("Facebook model, with all needed information.");
            }
        });
        return Model;
    },
    extendCollection: function(Collection) {
        _.extend(Collection.prototype, {});
        return Collection;
    }
};

var Alloy = require("alloy"), _ = require("alloy/underscore")._, model, collection;

model = Alloy.M("facebook", exports.definition, []);

collection = Alloy.C("facebook", exports.definition, model);

exports.Model = model;

exports.Collection = collection;