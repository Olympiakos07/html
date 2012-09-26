function show() {
	loadingScreen.show();
}

var loadingScreen;
$(document).ready(function() {

	//"use strict";

	/*debugger;

	function foo() {
		return bar();
		var bar = function() {
				return 3;
			};
		var bar = function() {
				return 8;
			};
	}
	alert(foo());*/

	var AppView = Backbone.View.extend({
		el: $("body"),
		initialize: function() {

			function fire() {
				var x = 3;
			}
			//this.initialize().fire();
			//this.enableDelimitedSelect();
		},
		//register events
		events: {
			"click .enable-dd": "enableDelimitedSelect"
		},
		enableDelimitedSelect: function() {
			debugger;
			$("#select-file-description-format-label").addClass("show-dialog").removeClass("disabled");
		}
	});

	var appview = new AppView;

});

function User(properties) {
	// Iterate through the properties of the object, and make sure
	// that it's properly scoped (as discussed previously)
	for (var i in properties) {
		(function() {
			// Create a new getter for the property
			this["get" + i] = function() {
				return properties[i];
			};
			// Create a new setter for the property
			this["set" + i] = function(val) {
				properties[i] = val;
			};
		})();
	}
}
// Create a new user object instance and pass in an object of
// properties to seed it with
var user = new User({
	name: "Bob",
	age: 44
});
// Just note that the name property does not exist, as it's private
// within the properties object
alert(user.name == null);
// However, we're able to access its value using the new getname()
// method, that was dynamically generated
alert(user.getname() == "Bob");
// Finally, we can see that it's possible to set and get the age using
// the newly generated functions
user.setage(22);
alert(user.getage() == 22);