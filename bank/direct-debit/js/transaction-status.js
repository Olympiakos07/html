$(document).ready(function() {

	"use strict";

	var AppView = Backbone.View.extend({
		el: $("body"),
		initialize: function() {
			var self = this;

			this.validator = new Validator();

			// set dates
			$("#start-date").val(oDate.date());
			$("#end-date").val(oDate.date());

			//restore state
			if ($("span.restoredState").text()) {
				restore_state($("span.restoredState").text());
			}
		},
		events: {
			"click input.toggle-extra-filters": "toggleExtraFilters",
			"click #transaction-status li": "toggleErrorMessageCategory",
			"click ul.group-payment-transaction-status li": "changeGroupPaymentDisplay",
			"click input[type=submit]": "submit"
		},
		/**
		 * Opens/closes the extra filters
		 */
		toggleExtraFilters: function(event) {
			var text;
			if ($("fieldset.extra-filter").is(":visible")) {
				$(event.currentTarget).removeClass("open");
				$("fieldset.extra-filter").slideUp();
				text = $("span.toggle-extra-filters-text").text();
				$("span.toggle-extra-filters-text").text($("input.toggle-extra-filters").val());
				$("input.toggle-extra-filters").val(text);
			} else {
				$(event.currentTarget).addClass("open");
				$("fieldset.extra-filter").slideDown();
				text = $("span.toggle-extra-filters-text").text();
				$("span.toggle-extra-filters-text").text($("input.toggle-extra-filters").val());
				$("input.toggle-extra-filters").val(text);
			}
			// also check error message category
			this.toggleErrorMessageCategory();
		},
		/**
		 * Controls the error message category filter display
		 * @param  {Event} event
		 */
		toggleErrorMessageCategory: function(event) {
			var element = event && $(event.currentTarget) || $("#transaction-status li.selected");
			if (element.hasClass("posted") || !$("input.toggle-extra-filters").hasClass("open")) {
				$("#error-message-category").closest("fieldset").slideUp();
			} else {
				$("#error-message-category").closest("fieldset").slideDown();
			}
		},
		/**
		 * Updates the visible transactions based on the selected filter
		 * @param  {Event} event
		 */
		changeGroupPaymentDisplay: function(event) {
			var element = $(event.currentTarget);
			if (element.hasClass("all")) {
				element.closest("table").find("tbody").find("tr").show();
			} else if (element.hasClass("posted")) {
				element.closest("table").find("span.approve").closest("tr").show();
				element.closest("table").find("span.reject").closest("tr").hide();
			} else if (element.hasClass("rejected")) {
				element.closest("table").find("span.reject").closest("tr").show();
				element.closest("table").find("span.approve").closest("tr").hide();
			}
			//also update the number
			var transactions = element.hasClass("all") ? element.closest("table").find("span.approve").closest("tr").length : element.closest("table").find("tbody").find("tr").filter(":visible").length;
			element.closest("td").find("span.visible").text(transactions);
		},
		/**
		 * On apply filters button click, do the usual stuff
		 */
		submit: function() {

			var validations = [];

			if ($("fieldset.extra-filter").is(":visible")) {
				//amounts validations
				if ($("#from-account").val() !== "" || $("#to-account").val() !== "") {
					validations.push([
						[$("#to-amount"), "min", $("#from-amount").val()], "compare_numbers", "amount_to_must_be_bigger_error_message_here"]);
					validations.push([$("#from-amount"), "not_empty", "not_empty_error_message_here"]);
					validations.push([$("#to-amount"), "not_empty", "not_empty_error_message_here"]);
				}

				//transaction status etc validations
				validations.push([$("#select-transaction-category"), "not_selected", "not_selected_error_message_here"]);
				validations.push([$("#select-transaction-type"), "not_selected", "not_selected_error_message_here"]);

				if ($("#select-group-payment").is(":visible")) {
					validations.push([$("#select-group-payment"), "not_selected", "not_selected_error_message_here"]);
				}

				validations.push([$("#select-file-reference"), "not_selected", "not_selected_error_message_here"]);
			}


			var submitStatus = this.validator.validate(validations, true, true);

			console.log("submitStatus=" + submitStatus);

			if ($("span.validation-error").length) {
				submitStatus = false;
			}

			if (submitStatus) {
				save_state();
				this.fillHiddenFields();
				ModalManager.getInstance().loader.show(false);
			}

			return submitStatus;
		},
		fillHiddenFields: function() {
			$("input[name=MinDate]").val($("#start-date").val());
			$("input[name=MaxDate]").val($("#end-date").val());
			$("input[name=dateOption]").val($("#select-date-type li.selected .hidden-value").text());
			$("input[name=CategCode]").val($("#select-transaction-category li.selected .hidden-value").text());
			$("input[name=trans_type]").val($(".select-transaction-type:visible li.selected .hidden-value").text());
			$("input[name=MatchingMethod]").val($("#select-beneficiary-search-type li.selected .hidden-value").text());
			$("input[name=BeneficiaryName]").val($("#beneficiary-name").val());
			$("input[name=BeneficiaryAccount]").val($("#beneficiary-account").val());
			$("input[name=BeneficiaryGroup]").val($("#beneficiary-group:visible li.selected .hidden-value").text());
			$("input[name=FromAccount]").val($("#from-account-list li.selected .hidden-value").text());
			//$("input[name=TranStatus]").val($("#file-description").val());
			// the transaction status checkboxes will also be submitted automatically
			$("input[name=fileIdFilter]").val($("#file-reference li.selected .hidden-value").text());
		}
	});

	var appview = new AppView();

});