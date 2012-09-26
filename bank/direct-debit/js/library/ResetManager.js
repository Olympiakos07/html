/**
 * Does many default resets when the .reset button is clicked on a page
 */
var ResetManager = (function() {

	"use strict";

	var instantiated;

	$(document).ready(function() {
		$("body").on("click", "#main .form-header .reset", function() {
			ResetManager.getInstance().reset()
		});
	});

	function initialize() {


		return {
			/**
			 * Create hidden spans with the default values for dropdowns and dates, to restore on reset
			 */
			saveDefaultsForReset: function() {
				var text;
				$(".show-dialog.dd:not(.no-default)").each(function() {
					if (!$(this).prev().hasClass("default-text")) {
						text = $(this).text();
						$("<span class='hidden default-text'>" + text + "</span>").insertBefore($(this));
					}
				});
				$("#start-date, #end-date").each(function() {
					if (!$(this).prev().hasClass("default-text")) {
						text = $(this).val();
						$("<span class='hidden default-text'>" + text + "</span>").insertBefore($(this));
					}
				});
			},
			/**
			 * Does the reset
			 */
			reset: function() {
				var text;
				//remove active from steps
				$("fieldset.step:not(.always-active)").removeClass("active");
				//reset inputs
				$("input:text").not(".datepicker, .no-reset").val("");

				//close all dialogs and reset them
				$(".dsq-dialog:not(.no-reset)").slideUp().removeClass('open');
				$(".dsq-dialog:not(.no-reset) li").removeClass("selected");
				$(".dsq-dialog:not(.no-reset, .none-preselected) li:first-child").addClass("selected");
				$(".dsq-dialog:not(.no-reset, #terms-dialog)").each(function(i) {
					if ($(this).parent().prev().prev().hasClass("default-text")) {
						text = $(this).parent().prev().prev().text();
					} else {
						text = $(this).find("li:first").children(":first").text();
					}
					if ($(this).parent().prev().find("span").length > 0) {
						$(this).parent().prev().find("span").text(text);
					} else {
						$(this).parent().prev().text(text);
					}
				});
				//reset dates allowed selections
				ResetManager.getInstance().resetAvailableDates();
				//reset date on step 4
				if ($("#transaction-planner-dialog").length > 0) {
					$("#start-date").val(today_date);
					$("#end-date").val(today_date);
					DatepickersManager.getInstance().setTransactionPlannerDateText();
					$("#step-4 .multi-sending-fields").slideUp();
					$(".first-send-difference").hide();
					$("#recurring-interval").val('1');
					$("#step-4 .sendings-estimation").text('1');
					//reset months/days dd to last child
					$(".dsq-dialog#recurring-duration-dialog li").removeClass("selected");
					$(".dsq-dialog#recurring-duration-dialog li:last-child").addClass("selected");
					$(".recurring-period").text(months_locale);
				} else {
					$("#start-date:not(.no-reset)").val($("#start-date").prev(".default-text").text());
				}
				//reset file uploads
				$(".file-upload").each(function() {
					var markup = "<input id='" + $(".file-upload").attr("id") + "' class='file-upload' type='file' accept='" + $(".file-upload").attr("accept") + "' tabindex='" + $(".file-upload").attr("tabindex") + "' />"
					$(this).replaceWith(markup);
				});
				//counters
				$("input.has-counter").each(function(i) {
					var m = $(this).attr("maxlength");
					$(this).next().find("span").text(m);
				});
				//remove error messages
				$("span.validation-error").remove();
				//terms checkbox
				$("#terms-checkbox").removeAttr("checked");
				//remove selected from lists, unless they are single-preselect and have only 1 li
				$(".list").each(function() {
					if ($(this).find("li:not(.non-selectable)").length == 1 && $(this).hasClass("single-preselect")) {
						var event = jQuery.Event("click");
						event.emulated = true;
						$(this).find("li").trigger(event);
					} else {
						$(this).find("li").removeClass("selected");
					}
					if ($(this).hasClass('has-preselected')) {
						if ($(this).hasClass('click-preselected')) {
							$(this).find('li.preselect').trigger('click');
						} else {
							$(this).find('li.preselect').addClass('selected');
						}
					}
				})
				//reset filtering too on lists, but not on lists with hidden fields
				//those lists are handled by their specific js
				$(".list").each(function() {
					if (!$(this).hasClass("no-reset")) {
						$(this).find("li").slideDown();
					}
				});
				//scroll all the lists
				scroll.reset();
				scroll.list([], 300);
				//call the specific reset function
				if (typeof(resetClicked) != "undefined") {
					resetClicked();
				}
				ResetManager.getInstance().callback();
				//fix main height
				setTimeout(function() {
					MainPageHeightManager.getInstance().fixHeight()
				}, 500);
			},
			resetAvailableDates: function() {
				$("#start-date.past-datepicker, #end-date.past-datepicker").datepicker("option", "maxDate", 0).datepicker("option", "minDate", -3000);
				$("#start-date:not(.past-datepicker), #end-date:not(.past-datepicker)").datepicker("option", "minDate", 0).datepicker("option", "maxDate", 3000);
			},
			/**
			 * Overwrite me plz. Called after all default resets are done, so you can add your specific resets
			 */
			callback: function() {

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