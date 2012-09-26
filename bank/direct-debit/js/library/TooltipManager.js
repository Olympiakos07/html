/**
 * Displays a custom tooltip on hover
 *
 * @author Achilleas Tsoumitas
 */
var TooltipManager = (function() {

	"use strict";

	var instantiated;

	$(document).ready(function() {
		$("body").on("mouseover mouseout", ".show-text-tooltip", function() {
			var title;
			if (event.type === 'mouseover') {
				title = $(this).attr("title");
				$(this).attr("title", "");
				$(this).attr("temp", title);
				var text = title;
				if (!text) {
					text = $(this).text();
				}
				var offset = $(this).offset();
				var left = offset.left + 30;
				var top = offset.top + 30;
				$("body").append('<div id="tooltip" style="z-index: 100000; position: absolute; left: ' + left + 'px; top: ' + top + 'px;">' + text + '</div>');
			} else {
				title = $(this).attr("temp");
				$(this).removeAttr("temp");
				$(this).attr("title", title);
				$("#tooltip").remove();
			}
		});
	});

	function initialize() {

		return {

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