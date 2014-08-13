var Alloy = require("alloy"), _ = require("alloy/underscore")._, model, collection;

exports.definition = {
    config: {},
    extendModel: function(Model) {
        _.extend(Model.prototype, {
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

model = Alloy.M("facebook", exports.definition, []);

collection = Alloy.C("facebook", exports.definition, model);

exports.Model = model;

exports.Collection = collection;