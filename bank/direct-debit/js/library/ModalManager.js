/**
 * An object that shows/hide the loader
 * Attaches events to initialize any other modal and the errors modal as well
 *
 * @author Achilleas Tsoumitas
 */
var ModalManager = (function() {

	"use strict";

	var instantiated;

	/**
	 * Initializes the dialog
	 */

	function initializeLoaderModal() {
		$("#modal-loading").dialog({
			modal: true,
			width: 300,
			height: 100,
			dialogClass: "modal",
			autoOpen: false,
			title: ''
			/*,
			closeOnEscape: false*/
		});
	}

	/**
	 * Adds the desired/required markup for the loader last item inside the body tag
	 * @param {Boolean} showImage
	 */

	function addLoaderMarkup(showImage) {
		var markup;
		if (showImage) {
			markup = '<div id="modal-loading"><img src="' + img_path + 'ajax-loader.gif" /> <span class="text">' + loading_locale + '</span></div>';
		} else {
			markup = '<div id="modal-loading"><span class="text">' + loading_locale + '</span></div>';
		}
		$("body").append(markup);
	}

	/**
	 * Close button for the errors modal
	 */
	$(document).ready(function() {
		// TODO: Remove this event afte jsp chane is made as well
		$("body").on("click", "#close-errors-modal", function() {
			$("#errors-modal").dialog("close");
		});
		$("body").on("click", ".dialog-close", function() {
			$(".dialog").dialog("close");
		});
	});

	function initialize() {

		return {
			loader: {
				/**
				 * Displays the loader dialog
				 * @param  {Boolean} showImage If we want to show the spinning image. Use false when submitting a form
				 */
				show: function(showImage) {
					//dont show it if its already visible
					if (!$("#modal-loading").parents(".ui-dialog").is(":visible")) {
						//first destroy any existing modal
						if ($("#modal-loading").length) {
							this.destroy();
						}

						addLoaderMarkup(showImage);
						initializeLoaderModal();

						//hide dialog titlebar
						$("#modal-loading").parent().find(".ui-dialog-titlebar").css("display", "none");

						$("#modal-loading").dialog("open");
					}
				},
				/**
				 * It hides the loader
				 */
				hide: function() {
					$("#modal-loading").dialog("close");
					$(".ui-dialog-titlebar").show();
				},
				/**
				 * It destroys the loader
				 * Removes its markup too, because on second show, we might have a different value for the showImage, so we might need new markup
				 */
				destroy: function() {
					$("#modal-loading").dialog("destroy").remove();
				}
			},
			modals: {
				/**
				 * Initializes and modals found on the DOM
				 */
				initialize: function() {
					$(".cyber-receipt-message, .dialog-message").each(function() {
						var modalWidth;
						if ($(this).hasClass("extra-wide-modal")) {
							modalWidth = 940;
						} else if ($(this).hasClass("wide-modal")) {
							modalWidth = 690;
						} else {
							modalWidth = 560;
						}
						$(this).dialog({
							modal: true,
							width: modalWidth,
							dialogClass: "modal",
							autoOpen: false,
							open: function(event, ui) {
								// this if is obsolete and must be removed
								if (typeof(modalOpened) !== "undefined") {
									modalOpened(event, ui);
								}

								ModalManager.getInstance().modals.opened(event, ui);
							},
							close: function(event, ui) {
								// this if is obsolete and must be removed
								if (typeof(modalClosed) !== "undefined") {
									modalClosed(event, ui);
								}

								ModalManager.getInstance().modals.closed(event, ui);
							},
							destroy: function(event, ui) {
								// this if is obsolete and must be removed
								if (typeof(modalDestroyed) !== "undefined") {
									modalDestroyed(event, ui);
								}

								ModalManager.getInstance().modals.destroyed(event, ui);
							}
						});
						if ($(this).attr("id") === "modal-converter") {
							$(this).dialog({
								position: ["center", 100]
							});
						}
					});
					//also attach the event
					$(document).on("click", ".download-cyber-receipt, .dialog-message-button", function() {
						// TODO: this needs to be fixed, with a proper if
						if ($(this).attr("disabled") != "disabled" && $(this).attr("disabled") != "true") {
							var temp = $(this).attr("id").split("-");
							var id = temp[1];
							if ($("#modal-" + id).is(':data(dialog)') === false) {
								ModalManager.getInstance().modals.initialize();
							}
							$("#modal-" + id).dialog("open");
						}
					});
				},
				destroy: function() {
					$(".cyber-receipt-message, .dialog-message").dialog("destroy");
				},
				opened: function(event, ui) {

				},
				closed: function(event, ui) {

				},
				destroyed: function(event, ui) {

				}
			},
			errorsModal: {
				/**
				 * Initialize the errors modal
				 */
				initialize: function() {
					$("#errors-modal").dialog({
						modal: true,
						width: 560,
						dialogClass: "modal",
						autoOpen: true,
						close: function(event, ui) {
							if (typeof(errorModalClosed) !== "undefined") {
								errorModalClosed(event, ui);
							}
						}
						ModalManager.getInstance().errorsModal.closed(event, ui);
					});
				},
				closed: function(event, ui) {

				}
			}
		}
	};

	return {
		getInstance: function() {
			if (!instantiated) {
				instantiated = initialize();
			}
			return instantiated;
		}
	};
})();