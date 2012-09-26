$(document).ready(function() {

	"use strict";

	

	var AppView = Backbone.View.extend({
		el: $("body"),
		initialize: function() {
			this.validator = new Validator();
			$("#select-file-description-format-label").removeClass("show-dialog").addClass("disabled");
			// this.state = new pageState();
			// this.pageState.restoreState();
		},
		//register events
		events: {
			"click .enable-dd": "enableDelimitedSelect",
			"click .disable-dd": "disableDelimitedSelect",
			"submit form": "submit"
		},
		enableDelimitedSelect: function() {
			$("#select-file-description-format-label").addClass("show-dialog").removeClass("disabled");
		},
		disableDelimitedSelect: function() {
			$("#select-file-description-format-label").removeClass("show-dialog").addClass("disabled");
		},
		/**
		 * sdfgsdfg
		 * @return {sedgsd} dfgsdgsfd
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

			var submit_status = this.validator.validate(validations, true, true);

			console.log("submit_status=" + submit_status);

			if ($("span.validation-error").length) {
				submit_status = false;
			}

			if (submit_status) {
				// this.pageState.saveState();
				this.fillHiddenFields();
				show_loading(false);
			}

			return submitStatus;
		},
		fillHiddenFields: function() {
			$("input[name=FileType]").val($("#select-file-type li.selected .hidden-value").text());
			$("input[name=fileFormatDescription]").val($("#select-file-description-format li.selected .hidden-value").text());
			$("input[name=FileDescription]").val($("#file-description").val());
		}
	});

	var appview = new AppView();

});
