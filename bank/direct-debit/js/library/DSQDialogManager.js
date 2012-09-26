/**
 * Controls the dropdowns and some tooltips that are implemented with the dsq-dialog class
 *
 * @author Achilleas Tsoumitas
 */
var DSQDialogManager = (function() {

	//"use strict";

	var instantiated;

	$(document).ready(function() {
		/**
		 * Show dsq-dialog (dropdown)
		 */
		$("body").on("click", ".show-dialog", function(event) {
			if ($(this).next().find(".dsq-dialog").hasClass("open")) {
				$(".dsq-dialog").slideUp().removeClass('open');
			} else {
				$(".dsq-dialog").slideUp().removeClass('open');
				$(this).next().focus();
			}
		});

		/**
		 * On dsq-dialog (dropdown) click
		 */
		$("body").on("click", ".dsq-dialog:not(.is-tooltip) li", function(event) {
			//remove error
			$(this).parent().parent().find(".validation-error").remove();
			//find the receiver of the selected value
			var receiver;
			if ($(this).parent().parent().prev().children("span").length > 0) {
				receiver = $(this).parent().parent().prev().children("span");
			} else {
				receiver = $(this).parent().parent().prev();
			}

			var oldIndex = $(this).closest("ul").find("li.selected").index();

			//remove//add classes
			$(this).parent().children("li").removeClass("selected");
			$(this).addClass("selected");
			var value;
			if ($(this).find(".value").length > 0) {
				value = $(this).find(".value").text();
			} else {
				value = $(this).children("*:not(.hidden-value)").text();
			}
			receiver.html(value);
			if (event.inputMethod !== "keyboard") {
				$(this).parent().slideUp().removeClass('open');
			}

			//if list_clicked is defined, we call it, with list id and li index params
			if (typeof(dialog_clicked) !== "undefined") {
				dialog_clicked($(this).closest(".dsq-dialog").attr("id"), $(this).index(), oldIndex, event.emulated);
			}
			DSQDialogManager.getInstance().clicked($(this).closest(".dsq-dialog").attr("id"), $(this).index(), oldIndex, event.emulated);

			focused_item = "";

			//if the li contains a link and a redirect must be done, make the whole li clickable
			var link = $(this).find("a").attr("href");
			if (link) {
				if (link !== "#" && link.substr(0, 10) !== "javascript") {
					window.location = link;
				} else if (link.substr(0, 19) === "javascript:redirect") {
					link = link.substring(link.indexOf("(") + 2, link.lastIndexOf(")") - 1);
					RedirectManager.getInstance().redirect(link);
				}
			}

		});

		//close dialog (used for the agree button in terms checkbox)
		$("body").on("click", ".close-parent-dialog", function() {
			if ($(this).closest(".dsq-dialog").parent().find("span.validation-error").length === 0) {
				if ($(this).closest("#terms-checkbox").length > 0) {
					$("#terms-checkbox").attr("checked", true);
				}
				$(this).closest(".dsq-dialog").slideUp().removeClass("open");
			}
		});
	});

	function initialize() {

		return {
			/**
			 * A callback, called when a selection is made in any dsq-dialog on the page
			 * @param  {String} id       The id of the ul list that was clicked
			 * @param  {Number} index    The index of the clicked li
			 * @param  {Number} oldIndex The index of the previously selected li
			 * @param  {Boolean} emulated If the event was caused by user interaction of emulated by code
			 */
			clicked: function(id, index, oldIndex, emulated) {

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