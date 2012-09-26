$(document).ready(function() {

	"use strict";

	var validator = new Validator();
	var updateTransactionsAjaxRequest = new AjaxRequest();
	var signatureMatrixAjaxRequest = new AjaxRequest();

	var allCheckboxesManager = new CheckboxesManager("transaction-management", "select-transaction");
	var financialInformationCheckboxesManager = new CheckboxesManager("financial-information", "select-transaction");
	//ADD HERE ALL THE REST CHECKBOXES MANAGERS

	var AppView = Backbone.View.extend({
		el: $("body"),
		initialize: function() {
			//initialize apply limit button
			$(".apply-limit").button({
				icons: {
					primary: "ui-icon-arrowstop-1-n"
				},
				disabled: true
			});
			$(".apply-limit").button({
				label: ""
			});
			//restore state
			if($("span.restoredState").text() !== ""){
				restore_state($("span.restoredState").text());
			}

			updateTransactionsAjaxRequest.success = function(data) {
				appview.updateTransactionsAjaxRequestSuccess(data);
			}
			updateTransactionsAjaxRequest.error = function(data) {
				console.log(data);
			}
			signatureMatrixAjaxRequest.success = function(data) {
				appview.signatureMatrixAjaxRequestSuccess(data);
			}
			signatureMatrixAjaxRequest.error = function(data) {
				console.log(data);
			}

			//ALL CHECKBOXES MANAGERS MUST HAVE THE SAME CALLBACK
			allCheckboxesManager.clickCallback = function(event) {
				appview.checkboxesManagerClickCallback(this, event);
			}
			financialInformationCheckboxesManager.clickCallback = function(event) {
				appview.checkboxesManagerClickCallback(this, event);
			}
		},
		//register events
		events: {
			"click .users li": "changedUser",
			"click .select-transaction": "selectTransaction",
			"click .open-signature-matrix": "openSignatureMatrix",
			"submit form": "submit"
		},
		/**
		 * On user change, make an ajax request to learn the transaction that this user has selected etc.
		 *
		 * @param  {Event} event
		 */
		changedUser: function(event) {
			var url = $(".update-transactions-url").text();
			var data = {
				"userId": $(event.currentTarget).index()
			}
			ModalManager.getInstance().loader.show(true);
			updateTransactionsAjaxRequest.request(url, data, "json");
		},
		/**
		 * Enables/disables the max amount fields for this transaction
		 *
		 * @param  {Event} event
		 */
		selectTransaction: function(event) {
			// The event might be triggered by code, so find the correct html element
			var element = event.srcElement || event.target;
			// debugger;
			if ($(element).closest("tr").find(".select-transaction").is(":checked") || event.isTrigger) {
				$(element).closest("tr").find(".has-limit").removeClass("disabled").prop("disabled", false);
				$(element).closest("tr").find(".apply-limit").button({
					disabled: false
				}).addClass("dont-control");
			} else {
				$(element).closest("tr").find(".has-limit").addClass("disabled").prop("disabled", true);
				$(element).closest("tr").find(".apply-limit").button({
					disabled: true
				}).addClass("dont-control");
			}
		},
		/**
		 * Update visible transactions and their visible elements
		 *
		 * @param  {Object} data The server response
		 */
		updateTransactionsAjaxRequestSuccess: function(data) {
			//show transactions table if its not visible
			if (!$(".transactions").is(":visible")) {
				$("#users-list").removeClass("huge").addClass("medium");
				MainPageHeightManager.getInstance().resetHeight();
				$(".transactions").delay(500).slideDown(1000, function() {
					appview.updateTableDesign();
				});
			} else {
				setTimeout(function() {
					appview.updateTableDesign();
				}, 1000);
			}

			for (var i = 0, length = data.response.transactions.length; i < length; i++) {
				var transaction = data.response.transactions[i];
				if (transaction.visible) {
					$(".id-" + transaction.id).closest("tr").css("display", "auto");
					$(".id-" + transaction.id).closest("tr").find(".select-transaction").removeClass("dont-control");
					//check signature matrix
					if (transaction.hasSignatureMatrix) {
						$(".id-" + transaction.id).closest("tr").find(".open-signature-matrix").parent().css("display", "table-cell");
						$(".id-" + transaction.id).closest("tr").find(".select-transaction").parent().css("display", "none");
						$(".id-" + transaction.id).closest("tr").find(".select-transaction").addClass("dont-control");
					} else {
						$(".id-" + transaction.id).closest("tr").find(".open-signature-matrix").parent().css("display", "none");
						$(".id-" + transaction.id).closest("tr").find(".select-transaction").parent().css("display", "table-cell");
						//check if selected
						if (transaction.isSelected) {
							$(".id-" + transaction.id).closest("tr").find(".select-transaction").trigger("click");
						}
					}
					//check amount
					if (transaction.hasAmount) {
						//display it
						$(".id-" + transaction.id).closest("tr").find(".max-amount").parent().css("display", "table-cell");
						//update amount
						$(".id-" + transaction.id).closest("tr").find(".has-limit").val(transaction.amount);
						// max amount checkbox
						if ($(".id-" + transaction.id).closest("tr").find(".max-amount").text() === transaction.amount) {
							$(".id-" + transaction.id).closest("tr").find(".apply-limit").next().addClass("ui-state-active");
						}
					} else {
						$(".id-" + transaction.id).closest("tr").find(".max-amount").parent().css("display", "none");
					}
				} else {
					$(".id-" + transaction.id).closest("tr").css("display", "none");
					$(".id-" + transaction.id).closest("tr").find(".select-transaction").addClass("dont-control");
				}
			};

			// fix the height. Add some delay so that all animations are complete before this
			setTimeout(function() {
				MainPageHeightManager.getInstance().fixHeight();
			}, 2000);
		},
		/**
		 * Fixes colspans and removes and headers without visible children
		 */
		updateTableDesign: function() {
			$(".table-separator").each(function() {
				//hide any subtitles without visible lis
				if ($(this).nextUntil(".table-separator").filter(":visible").length === 0) {
					$(this).css("display", "none");
				}
				//find the biggest number of visible tds inside this group of trs and append the correct colspan to any other tds in this group of trs
				var length;
				//if ($(this).nextUntil(".table-separator").filter(":visible").length) {
				length = $(this).index() + $(this).nextUntil(".table-separator").filter(":visible").length + 1;
				//} else {
				//length = 10;
				//}
				for (var i = $(this).index() + 1; i < length; i++) {
					if ($("#transaction-management tbody tr:eq(" + i + ")").filter(":visible").find("td").filter(":visible").length > 1) {
						$(this).nextUntil(".table-separator").filter(":visible").each(function() {
							if ($(this).find("td:visible").length !== 2) {
								$(this).find("td:visible").attr("colspan", "2");
							}
						});
					}
				}
			});
			ModalManager.getInstance().loader.hide();
		},
		/**
		 * Open da Matrix Neo
		 */
		openSignatureMatrix: function(event) {
			var url = "getVerifierSignatureMatrix";
			var data = {
				"conversationId": $(".hidden-value.conversationId").text(),
				"userId": $(event.currentTarget).index(),
				"transactionId": $(event.currentTarget).closest("tr").find(".hidden-value.transactionId").text()
				// why on earth do we need the description? o.O
				// if we really need this, call me
				//"transactionDesc": 
			}
			ModalManager.getInstance().loader.show(true);
			signatureMatrixAjaxRequestSuccess.request(url, data, "html");
		},
		/**
		 * On request replay, empty the modal, add the new html and open it
		 *
		 * @param  {Object} data Request response
		 */
		signatureMatrixAjaxRequestSuccess: function(data) {
			$("#modal-display-signature-matrix").empty().append(data.response);
			$("#modal-display-signature-matrix").dialog("open");
		},
		/**
		 * If the checked checkbox is the the check-all, then run an each and find the checkboxes that have max amount field
		 * 
		 * @param  {CheckboxesManager} manager The CheckboxesManager that caused this callback
		 * @param  {Event} event
		 */
		checkboxesManagerClickCallback: function(manager, event) {
			if ($(event.currentTarget).hasClass("check-all")) {
				$("#" + manager.container).find(".select-transaction:visible").each(function() {
					var event = {
						srcElement: $(this)
					}
					appview.selectTransaction(event);
				});
			}
		},
		/**
		 * Submit functionality
		 */
		submit: function() {
			var validations = [
				[$("#FileName"), "not_empty", "not_selected_file"],
				[$("#select-file-type"), "has_selected", "not_selected"],
				[$("#file-description"), "not_empty", "not_empty"]
			];

			if (!$("#select-file-description-format").hasClass("disabled")) {
				var validation = [$("#select-file-description-format"), "has_selected", "not_selected"];
				validations.push(validation);
			}

			var submit_status = validator.validate(validations, true, true);

			console.log("submit_status=" + submit_status);

			if ($("span.validation-error").length) {
				submit_status = false;
			}

			if (submit_status) {
				save_state();
				this.fillHiddenFields();
				show_loading(false);
			}

			return submit_status;
		},
		fillHiddenFields: function() {
			$("input[name=FileType]").val($("#select-file-type li.selected .hidden-value").text());
			$("input[name=fileFormatDescription]").val($("#select-file-description-format li.selected .hidden-value").text());
			$("input[name=FileDescription]").val($("#file-description").val());
		}
	});

	var appview = new AppView();

});