/**
 * Manages the enter keypress
 *
 * @author Achilleas Tsoumitas
 */
var EnterKeyManager = (function() {

	"use strict";

	var instantiated;

	$(document).ready(function() {
		/**
		 * On enter keystroke, do the correct action
		 *
		 * @param  {event} event
		 */
		$("body").on("keydown", function(event) {
			if (event.keyCode === 13 && !$("body").hasClass("disable-enter-submit")) {
				event.preventDefault();

				var focusedElement = $("#" + document.activeElement.id);

				//blur the focused element so that any ajax requests are called
				focusedElement.trigger("blur");

				// if the focused element is inside a modal
				if ($(".cyber-receipt-message, .dialog-message").is(":visible")) {
					// $(".dialog-message:visible").find(".button:visible:first").click();
					$(".cyber-receipt-message:visible, .dialog-message:visible").find(".button:visible:first").trigger('click');
				} else if ($(".is-tooltip").is(":visible")) {
					$(".is-tooltip:visible").find(".button:visible:first").click();
				} else if (focusedElement.closest("form").length) {
					// if a the focused element is inside a form, submit that form
					focusedElement.closest("form").submit();
				} else if ($("form:visible:first input[type=submit]:visible:not(:disabled)").length) {
					$("form:visible:first").submit();
				}
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