var Alloy = require('alloy'),
    _ = require("alloy/underscore")._,
	model, collection;

exports.definition = {
	config: {
		 // table schema and adapter information
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

model = Alloy.M('challenge',
	exports.definition,
	[]
);

collection = Alloy.C('challenge',
	exports.definition,
	model
);

exports.Model = model;
exports.Collection = collection;
