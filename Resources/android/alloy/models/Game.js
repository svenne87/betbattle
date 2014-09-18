var Alloy = require('alloy'),
    _ = require("alloy/underscore")._,
	model, collection;

exports.definition = {
	config: {
	},
	extendModel: function(Model) {
		_.extend(Model.prototype, {
			// extended functions and properties go here
		});

		return Model;
	},
	extendCollection: function(Collection) {
		_.extend(Collection.prototype, {
			// extended functions and properties go here
		});

		return Collection;
	}
};

model = Alloy.M('game',
	exports.definition,
	[]
);

collection = Alloy.C('game',
	exports.definition,
	model
);

exports.Model = model;
exports.Collection = collection;
