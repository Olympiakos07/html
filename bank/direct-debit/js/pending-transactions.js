//TODO, dont use online-activity.js

$(document).ready(function() {

	"use strict";

	// checkbox manager for approval status
	var statusCheckboxesManager = new CheckboxesManager("approval-status-selection");
	// checkbox manager for the selected transactions
	var transactionsCheckboxesManager = new CheckboxesManager("transactions-table");
	//
	var transactionsSelectionAjaxRequest = new AjaxRequest();
	//
	var validator = new Validator();

	var AppView = Backbone.View.extend({
		el: $("body"),
		initialize: function() {
			// set dates
			// TODO: main.js, update with ODate
			$("#start-date").val(today_date);
			$("#end-date").val(today_date);
			// TODO:main.js, objects dont exist yet
			// this.state = new pageState();
			// this.pageState.restoreState();
			
			var selectedTransactionsFromOtherPages = $(".selected-transactions-info .selected").text();
			$("<span class='hidden selected-from-other-pages'>" + selectedTransactionsFromOtherPages + "</span>").appendTo(".selected-transactions-info");

			// @overwrite
			transactionsCheckboxesManager.clickCallback = function(event) {
				appview.transactionsCheckboxClickCallback(event);
			};

			//this needs testing on the server
			// @overwrite
			transactionsSelectionAjaxRequest.success = function(data) {
				appview.transactionsSelectionSuccess(data);
			};
			// @overwrite
			transactionsSelectionAjaxRequest.error = function(data) {
				appview.transactionsSelectionError(data);
			};

			this.checkVerifierActionsAvailability();

		},
		events: {
			"click .toggle-filters": "toggleFilters",
			"click .select-transaction-type .group-payment": "showGroupFilter",
			"click .select-transaction-type li:not(.group-payment), .select-transaction-category li:not(.group-payment)": "hideGroupFilter",
			"click #select-all, #clear-all": "transactionsSelection",
			"click #approve-transactions, #reschedule-transactions, #reject-transactions": "verifierActions",
			"click #submit-filters": "submitFilters",
			"click .pagination li": "changePage"
		},
		/**
		 * Check if the verifier action buttons must be enabled or not
		 */
		checkVerifierActionsAvailability: function() {
			if (parseInt($(".selected-transactions-info .selected").text(), 10) === 0) {
				$(".verifier-action").addClass("disabled").prop("disabled", true);
			} else {
				$(".verifier-action").removeClass("disabled").prop("disabled", false);
			}
		},
		/**
		 * Called on a transactions checkbox click
		 * @param  {Event} event 
		 */
		transactionsCheckboxClickCallback: function(event) {
			//remove any server errors
			$(".validation-error.server_error").remove();

			// update the number of selected transactions
			var number = parseInt($(".selected-transactions-info .selected-from-other-pages").text(), 10) + transactionsCheckboxesManager.checkedCheckboxes;
			$(".selected-transactions-info .selected").text(number);

			appview.checkVerifierActionsAvailability();
		},
		/**
		 * Opens/closes the additional filters
		 */
		toggleFilters: function() {
			var text;
			if ($(".extra-fields").is(":visible")) {
				$(".extra-fields").slideUp();
				text = $(".toggle-filters-text").text();
				$(".toggle-filters-text").text($(".toggle-filters").val());
				$(".toggle-filters").val(text);
			} else {
				$(".extra-fields").slideDown();
				text = $(".toggle-filters-text").text();
				$(".toggle-filters-text").text($(".toggle-filters").val());
				$(".toggle-filters").val(text);
			}
		},
		showGroupFilter: function() {
			$(".group-filter").fadeIn();
		},
		hideGroupFilter: function() {
			$(".group-filter").fadeOut();
		},
		/**
		 * Called when "Select All" or "Clear All" buttons are clicked
		 * and does the ajax request
		 * @param  {Event} event 
		 */
		transactionsSelection: function(event) {
			var url = $(".transactions-selection-url").text();
			var isAll;
			if (event.currentTarget.id === "select-all") {
				isAll = true;
				transactionsCheckboxesManager._checkAll();
			} else if (event.currentTarget.id === "clear-all") {
				isAll = false;
				transactionsCheckboxesManager._uncheckAll();
			}
			var data = {
				"isAll": isAll
			};
			//call it
			transactionsSelectionAjaxRequest.request(url, data, "json");
		},
		/**
		 * On ajax request success
		 * @param  {Object} data 
		 */
		transactionsSelectionSuccess: function(data) {
			$(".selected-transactions-info .selected").text(data.response.selected);
		},
		/**
		 * On ajax request error, display the error
		 * @param  {Object} data          
		 * @param  {String} errorMessages The server eror messages (if they exist)
		 */
		transactionsSelectionError: function(data, errorMessages) {
			if (errorMessages) {
				validator.displayError($("#clear-all"), "server_error", errorMessages);
			} else {
				transactionsCheckboxesManager._uncheckAll();
				validator.displayError($("#clear-all"), "server_error", "server_error");
			}
		},
		/**
		 * On a verifier action button click
		 * @param  {Event} event 
		 */
		verifierActions: function(event) {
			console.log(event.currentTarget.id);
			//find the submit url
			var submitUrl = $(".verifier-actions-submit-url").text();

			//create the form
			var form = $("<form>", {
				"action": submitUrl,
				"method": "POST"
			});

			// add the checked transactions to the form
			form = appview.appendTransactions(form);

			//and submit it
			form.submit();
		},
		/**
		 * On apply filters button click, do the usual stuff
		 */
		submitFilters: function() {

			var submit_status = true;

			//at least one status must be checked
			if (statusCheckboxesManager.checkedCheckboxes === 0) {
				validator.displayError($("#approval-status-selection label:last"), "at_least_one_checked", "at_least_one_checked");
				submit_status = false;
			}

			console.log("submit_status=" + submit_status);

			if ($("span.validation-error").length) {
				submit_status = false;
			}

			if (submit_status) {
				//TODO:main.js
				// this.pageState.saveState();
				this.fillHiddenFields();
				show_loading(false);
			}

			return submit_status;
		},
		/**
		 * On change page
		 * @param  {Event} event 
		 */
		changePage: function(event) {
			//find the new page number
			var newPage;
			if ($(event.currentTarget).hasClass("prev")) {
				newPage = parseInt($(".pagination li.current").text(), 10) - 1;
			} else if ($(event.currentTarget).hasClass("next")) {
				newPage = parseInt($(".pagination li.current").text(), 10) + 1;
			} else {
				newPage = $(event.currentTarget).text();
			}

			//find the submit url
			var submitUrl = $(".pagination-submit-url").text();

			//create the form
			var form = $("<form>", {
				"action": submitUrl,
				"method": "POST"
			}).append($("<input>", {
				"name": "pageNumber",
				"value": newPage
			})).append($("<input>", {
				"name": "listId",
				"value": ""
			})).append($("<input>", {
				"name": "secondaryListPaging",
				"value": ""
			}));

			// add the checked transactions to the form
			form = appview.appendTransactions(form);

			//and submit it
			form.submit();
		},
		/**
		 * Adds the checked and unchecked transactions keys as inputs to the form
		 * @param  {HTMLElement} form 
		 * @return {HTMLElement} 
		 */
		appendTransactions: function(form) {
			var i = 0;
			var j = 0;
			$("#transactions-table tbody input:checkbox").each(function() {
				var value = $(this).closest("tr").find(".hidden-value.transactionKey").text();
				if ($(this).is(":checked")) {
					i++;
					form.append($("<input>", {
						"name": "selectedTransaction" + i,
						"value": value
					}));
				} else {
					j++;
					form.append($("<input>", {
						"name": "notselectedTransaction" + j,
						"value": value
					}));
				}
			});

			return form;
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
