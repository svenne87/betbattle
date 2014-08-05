exports.definition = {
	   config : {
        // table schema and adapter information
    },
	extendModel: function(Model) {
		_.extend(Model.prototype, {
			// extended functions and properties go here
			
			// Implement the validate method						
            validate: function (attrs) {
    	        for (var key in attrs) {
                    var value = attrs[key];
                    if (key === "id") {
                        if (value.length <= 0) {
                            return "Error: No Facebook id!";
                        }
                    }
                    if (key === "birthday") {
                        if (value.length <= 0) {
                            return "Error: No birthday!";
                        }	
                    }
                    if (key === "locale") {
                        if (value.length <= 0) {
                            return "Error: No locale!";
                        }	
                    }
                    if (key === "location") {
                        if (value.length <= 0) {
                            return "Error: No location!";
                        }	
                    }
                    if (key === "username") {
                        if (value.length <= 0) {
                            return "Error: No username!";
                        }	
                    }
                    if (key === "username") {
                        if (value.length <= 0) {
                            return "Error: No username!";
                        }	
                    }
                    if (key === "fullName") {
                        if (value.length <= 0) {
                            return "Error: No fullname!";
                        }	
                    }
                    if (key === "firstName") {
                        if (value.length <= 0) {
                            return "Error: No firstname!";
                        }	
                    }
                    if (key === "lastName") {
                        if (value.length <= 0) {
                            return "Error: No lastname!";
                        }	
                    }
                    if (key === "gender") {
                        if (value.length <= 0) {
                            return "Error: No gender!";
                        }	
                    }	
                }
            },
            // Extend Backbone.Model
            customProperty: 'facebook',
            customFunction: function() {
                Ti.API.info('Facebook model, with all needed information.');
            },	
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