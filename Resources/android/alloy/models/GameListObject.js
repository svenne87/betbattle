exports.definition = {
    config: {},
    extendModel: function(Model) {
        _.extend(Model.prototype, {});
        return Model;
    },
    extendCollection: function(Collection) {
        _.extend(Collection.prototype, {});
        return Collection;
    }
};

var Alloy = require("alloy"), _ = require("alloy/underscore")._, model, collection;

model = Alloy.M("gameListObject", exports.definition, []);

collection = Alloy.C("gameListObject", exports.definition, model);

exports.Model = model;

exports.Collection = collection;