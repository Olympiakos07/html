var AccountTypeFilter = (function() {

	"use strict";

	var instantiated;

	//initialize();
	$(document).ready(function() {
		$("body").on("click", ".account-type-filter ul li", function() {
			AccountTypeFilter.getInstance().filter($(this));
		});
	});

	function initialize() {

		return {
			filter: function(element) {
				var id = element.find(".hidden-value").text();

				if (id != "all") {
					var list = element.closest(".account-type-filter").parent().find(".list");

					for (var i = list.find("li").length; i > 0; i--) {
						var li = list.find("li:eq(" + (i - 1) + ")");
						if (id === li.find(".hidden-value").text() || li.find(".hidden-value").text() === "all") {
							li.slideDown();
						} else {
							li.slideUp();
						}
					}
				} else {
					element.closest(".account-type-filter").parent().find(".list li").slideDown();
				}
				//on animations complete, call callback
				element.closest(".account-type-filter").parent().find(".list li").promise().done(function() {
					AccountTypeFilter.getInstance().callback();
				});
			},
			callback: function() {
				//mainHeightFix(true);
			}
		};
	}

	return {
		getInstance: function() {
			if (!instantiated) {
				instantiated = initialize();
			}
			return instantiated;
		}
	};
})();