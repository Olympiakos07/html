/**
 * Resizes the #main element of the page to fit with the height of the sidebar
 *
 * @author Achilleas Tsoumitas
 */
var MainPageHeightManager = (function() {

	"use strict";

	var instantiated;

	function initialize() {

		return {
			/**
			 * Fixes the problem with some pages not having #main as long as #side is
			 *
			 * @param  {Boolean} heightAuto If we want to set the height back to auto
			 */
			fixHeight: function(heightAuto) {
				// find last visible fieldset
				var selector = "";
				var visibleFieldsets = $(".form fieldset:visible").not(".buttons");
				if (visibleFieldsets.length === 0 || (visibleFieldsets.closest(".form").parent().next().length > 0 && visibleFieldsets.closest(".form").parent().next().is(":visible"))) {
					selector = $("#main");
				} else {
					selector = $(".form fieldset:visible:not(.buttons):last");
				}

				$(".modified-height").height("auto").removeClass("modified-height");
				var mainHeight = $("#main").height();
				var sideHeight = $("#side").height();
				var diff = sideHeight - mainHeight;

				//if size smaller, increase it
				if (diff > 15) {
					var currentHeight = selector.height();
					if (selector.attr("id") !== $("#main").attr("id") && selector.find(".content").length > 0) {
						selector.find(".content").height(currentHeight + diff - 10).addClass("modified-height");
					} else {
						selector.height(currentHeight + diff - 10).addClass("modified-height");
					}
				} else {
					$(".modified-height").height("auto").removeClass("modified-height");
				}
			},

			/**
			 * Reset the modified height
			 */
			resetHeight: function() {
				$(".modified-height").height("auto").removeClass("modified-height");
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