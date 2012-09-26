/*jshint smarttabs:true */
$(document).ready(function() {

	"use strict";

	// Define the beneficiary modal as a backbone model
	var Beneficiary = Backbone.Model.extend({
		initialize: function() {
			this.beneficiaryName = "";
			this.beneficiaryAccount = "";
			this.payeeType = "";
		}
	});

	// Define the group collection that contains beneficiaries
	var Group = Backbone.Collection.extend({
		model: Beneficiary
	});

	// Define the beneficiary view and its rendering function
	var BeneficiaryView = Backbone.View.extend({
		tagName: "tr",
		className: "beneficiary-container",
		template: $('#beneficiary-template').html(),

		render: function() {
			var tmpl = _.template(this.template);
			//debugger;
			this.$el.html(tmpl(this.model.toJSON()));
			return this;
		}
	});

	// Define the AppView
	var AppView = Backbone.View.extend({
		el: $(document.body),
		// renders this view's collection (the Group)
		render: function() {
			var self = this;

			//empty the tbody
			var tbody = $("tbody");
			var tbodyParent = tbody.parent();

			tbody.detach();
			tbody.empty();
			//and add the new beneficiaries
			var frag = document.createDocumentFragment();
			_.each(this.collection.models, function(item) {
				frag.appendChild(self.renderBeneficiary(item));
			}, this);
			tbody.append(frag);
			tbodyParent.append(tbody);

			//finally update the number of beneficiaries displayed
			this.updateSelectedBeneficiaries();
			//also check all checkboxes of the received beneficiaries
			this.beneficiariesCheckboxesManager._checkAll();
			// also update the total amount
			this.updateTotalAmount();
		},
		// renders a beneficiary model using a beneficiary view
		renderBeneficiary: function(item) {
			var beneficiaryView = new BeneficiaryView({
				model: item
			});
			return beneficiaryView.render().el;
			// $("tbody").append(beneficiaryView.render().el);
		},
		initialize: function() {
			var self = this;

			if ($("span.restoredState").text() !== "") {
				restore_state($("span.restoredState").text());
			}

			//if this doesnt work, call Achilleas, if this works, delete this comment plz
			//ok, this is not working, wait for Achilleas fix plz :)
			$("#start-date").val(oDate.date());

			// disable click on the group list if the beneficiary options segmenet is visible
			// the user must confirm this action first
			ListManager.getInstance().listAllowClick = function(id, index, oldIndex, classes) {
				if (id === "group-list" && $("#payment-beneficiary-options").is(":visible")) {
					return false;
				} else {
					return true;
				}
			};

			// on reset click
			ResetManager.getInstance().callback = function() {
				//hide the prepopulate (default) fields
				$(".prepopulator").slideUp().addClass("hidden");
				// if beneficiaries are visible...
				if ($("#payment-beneficiary-options").is(":visible")) {
					$("#payment-beneficiary-options").fadeOut();
					var text = $("span.submit-text").text();
					$("span.submit-text").text($("input[type=submit]").val());
					$("input[type=submit]").val(text);
				}
			}

			//create the validator object
			this.validator = new Validator();

			// create an AjaxRequest to update the beneficiaries
			this.updateBeneficiariesAjaxRequest = new AjaxRequest();

			// define the AjaxRequest callbacks
			this.updateBeneficiariesAjaxRequest.success = function(data) {
				self.updateBeneficiariesAjaxRequestSuccess(data);
			};
			this.updateBeneficiariesAjaxRequest.error = function(data) {
				//console.log(data);
			};

			// create a CheckboxesManager for the beneficiaries
			this.beneficiariesCheckboxesManager = new CheckboxesManager("payment-beneficiary-options");

			this.beneficiariesCheckboxesManager.clickCallback = function(event) {
				self.beneficiariesCheckboxesManagerClickCallback(event);
			};
		},
		//register events
		events: {
			"click #group-list li": "changeGroup",
			"click #submit-confirmation": "confirmedGroupChange",
			"click #cancel-confirmation": "cancelChangeGroup",
			"click .prepopulate-rows": "togglePrepopulateField",
			"keyup input.default-description": "setDefault",
			"blur input.default-description": "setDefault",
			"keyup input.default-amount": "setDefault",
			"blur input.default-amount": "setDefault",
			"change input.description-1": "valueChanged",
			"change input.amount": "valueChanged",
			"keyup input.amount, input.default-amount": "updateTotalAmount",
			"blur input.amount, input.default-amount": "updateTotalAmount",
			"submit form": "submit"
		},
		/**
		 * A new group has been clicked
		 * @param  {Event} event
		 */
		changeGroup: function(event) {
			if (ListManager.getInstance().index !== ListManager.getInstance().oldIndex) {
				if ($("#payment-beneficiary-options").is(":visible")) {
					$("#modal-confirm-group-change").dialog("open");
				} else {
					this.confirmedGroupChange(event);
				}
			}
		},
		/**
		 * The user confirmed that he wants to change group
		 * @param  {Event} event
		 */
		confirmedGroupChange: function(event) {
			//update the selected li
			if (event.target.id === "submit-confirmation") {
				$("#" + ListManager.getInstance().id + " li").removeClass("selected");
				$("#" + ListManager.getInstance().id + " li").eq(ListManager.getInstance().index).addClass("selected");
			}
			$("#modal-confirm-group-change").dialog("close");
			//var url = $(".change-group-url").text();
			var url = "http://test.o-some.com/implementation/group-payment.php";
			var data = {
				"operation": "myOperation",
				"groupId": $("#group-list li.selected span.hidden-value.groupId").text(),
				"actionFlag": $("input[name=actionFlag]").val()
			};
			ModalManager.getInstance().loader.show(true);
			this.updateBeneficiariesAjaxRequest.request(url, data, "json");
		},
		/**
		 * The user clicked cancel on the modal asking him to confoirm the group change
		 * @param  {Event} event
		 */
		cancelChangeGroup: function(event) {
			$("#modal-confirm-group-change").dialog("close");
		},
		/**
		 * Open/close the preopulate (default) fields
		 * @param  {[type]} event [description]
		 * @return {[type]}       [description]
		 */
		togglePrepopulateField: function(event) {
			var prepopulator = $(event.currentTarget).parent().find(".prepopulator");
			if (prepopulator.is(":visible")) {
				$(event.currentTarget).parent().find(".prepopulator").slideUp().addClass("hidden");
			} else {
				$(event.currentTarget).parent().find(".prepopulator").slideDown().removeClass("hidden");
			}
		},
		/**
		 * On checkbox click, update the selected beneficiaries
		 */
		beneficiariesCheckboxesManagerClickCallback: function(event) {
			//add/remove class dont-monitor to inputs of this beneficiary that was clicked
			if ($(event.currentTarget).is(":checked")) {
				$(event.currentTarget).closest("tr").find(".description-1, .amount").removeClass("dont-monitor");
			} else {
				$(event.currentTarget).closest("tr").find(".description-1, .amount").addClass("dont-monitor");
			}
			this.updateSelectedBeneficiaries();
			this.updateTotalAmount();
		},
		/**
		 * Updates the number of total and checked beneficiaries
		 */
		updateSelectedBeneficiaries: function() {

			var checkedTotal = $(".transactions input:checkbox:checked").not(".transactions thead input:checkbox").length;
			$("#number-of-beneficiaries-enabled").text(checkedTotal);

			var total = $(".transactions tbody tr").length;
			$("#number-of-beneficiaries-total").text(total);
		},
		/**
		 * Sets the default description or amount. Doesnt update fileds that the user already changed before.
		 * Those fields have the dont-monitor class
		 * If he deletes the default value and the dont-monitor field is also empty at this moment,
		 * the dont monitor class is removed
		 *
		 * @param {Event} event
		 */
		setDefault: function(event) {
			var receiver, source;
			// check if description or amount has been set
			if ($(event.currentTarget).hasClass("default-description")) {
				receiver = "input.description-1";
				source = "input.default-description";
			} else {
				receiver = "input.amount";
				source = "input.default-amount";
			}
			//if the default value is empty, update the dont-monitor inputs
			if ($(event.currentTarget).val() === "") {
				$(receiver + ".dont-monitor").each(function() {
					//if its value is empty and its checked
					if ($(this).val() === "" && $(this).closest("tr").find(":checkbox").is(":checked")) {
						$(this).removeClass("dont-monitor");
					}
				});
			}
			//and add the value
			$(receiver).not(".dont-monitor").val($(source).val());
		},
		/**
		 * On value change (description or amount) add dont-monitor class on this field
		 * @param  {Event} event
		 */
		valueChanged: function(event) {
			$(event.currentTarget).addClass("dont-monitor");
		},
		/**
		 * Add all the amounts and display the total amount
		 */
		updateTotalAmount: function() {
			var total = 0;
			$("input.amount").each(function() {
				//if it has a value and the beneficiary is checked
				if ($(this).val() && $(this).closest("tr").find(":checkbox").is(":checked")) {
					total += parseFloat($(this).val());
				}
			});
			// if invalid amounts have been entered, then make the total 0
			if (isNaN(total)) {
				total = 0;
			}
			$("#total-amount-label").text(AmountUtilities.getInstance().formatAmount(total));
		},
		/**
		 * On ajax request success, update (rerender) the view
		 * @param  {Object} data The server response
		 */
		updateBeneficiariesAjaxRequestSuccess: function(data) {
			ModalManager.getInstance().loader.hide();
			var group = new Group();
			var beneficiary;
			//fill the group with beneficiaries returned from the server
			for (var i = 0, length = data.response.beneficiaries.length; i < length; i++) {
				/*beneficiary = new Beneficiary({
					beneficiaryName: data.response.beneficiaries[i].beneficiaryName,
					beneficiaryAccount: data.response.beneficiaries[i].beneficiaryAccount,
					payeeType: data.response.beneficiaries[i].payeeType
				});*/
				beneficiary = new Beneficiary(data.response.beneficiaries[i]);
				group.push(beneficiary);
			}
			//defines this view's collection
			this.collection = group;
			//and rerender plz
			this.render();
		},
		/**
		 * Submit button has double functionality on this page
		 * 1. Display the beneficiaries details
		 * 2. Do the form submit
		 *
		 * @return {Boolean}
		 */
		submit: function() {
			var validations;
			if (!$("#payment-beneficiary-options").is(":visible")) {
				validations = [
					[$("#group-list"), "has_selected", "not_selected"],
					[$("#from-account-list"), "has_selected", "not_selected"]
				];
				if (this.validator.validate(validations, false, true)) {
					$("#payment-beneficiary-options").fadeIn();
					var text = $("span.submit-text").text();
					$("span.submit-text").text($("input[type=submit]").val());
					$("input[type=submit]").val(text);
				}

				return false;
			} else {
				validations = [
					[$("#FileName"), "not_empty", "not_selected_file"],
					[$("#select-file-type"), "has_selected", "not_selected"],
					[$("#file-description"), "not_empty", "not_empty"]
				];

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
			}
		},
		fillHiddenFields: function() {
			$("input[name=FileType]").val($("#select-file-type li.selected .hidden-value").text());
			$("input[name=fileFormatDescription]").val($("#select-file-description-format li.selected .hidden-value").text());
			$("input[name=FileDescription]").val($("#file-description").val());
		}
	});

	var appview = new AppView();

});