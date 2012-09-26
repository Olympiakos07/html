/**
 * Resizes labels font when needed
 *
 * @author Achilleas Tsoumitas
 */
var LabelSizeManager = (function() {

	"use strict";
	var instantiated;

	$(document).ready(function() {
		/**
		 * Fixes the problem with big labels
		 */
		$(".utility-company-fields .label").each(function() {
			var parent = $(this).parent(".utility-company-fields");
			LabelSizeManager.getInstance().wrapLongWords(this);
			LabelSizeManager.getInstance().adjustSize(this, parent);
		});
		$("fieldset.step .label:not(.dont-adjust-size)").each(function() {
			var parent = $(this).closest("fieldset.step");
			LabelSizeManager.getInstance().adjustSize(this, parent);
		});
		/**
		 * Resizes labels in pages without fieldsets
		 */
		$(".no-step-guide .step .content .label label").each(function() {
			if ($(this).text().length > 22) {
				$(this).css("font-size", "10px")
			}
		});
	});

	function initialize() {

		return {
			/**
			 * Resizes the font according to the label size
			 *
			 * @param  {String} selector The selector of the label to resize
			 * @param  {HTMLElement} parent   Its parent
			 */
			adjustSize: function(selector, parent) {
				var changedDisplay = false;
				if (parent.css("display") == "none") {
					parent.css("display", "block");
					changedDisplay = true;
				}
				if ($(selector).height() > 20) {
					$(selector).addClass("big-label-font-resize").addClass("big-label-position-reset");
					if ($(selector).height() > 32) {
						$(selector).addClass("big-label-font-resize-max");
					}
				}
				if ($(selector).height() < 20 && $(selector).height() != 0) {
					$(selector).removeClass("big-label-position-reset");
				}
				if (changedDisplay) {
					parent.css("display", "none");
				}
			},
			wrapLongWords: function(selector) {

				var labelText = $(selector).find("label").text();

				if (labelText.length > 15 && labelText.match(/ /g) === null) {

					labelText = labelText.substring(0, 15) + "-<br />" + labelText.substring(15, labelText.length);
					$(selector).find("label").html(labelText);
				}
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