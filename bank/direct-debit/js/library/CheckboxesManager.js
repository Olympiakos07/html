/**
 * Controls a group of checkboxes
 * 
 * @author Achilleas Tsoumitas
 */
var CheckboxesManager;

(function() {

	"use strict";

	/**
	 * Defines a new checkboxmanager
	 * @param {String} id The id of an element that includes all the checkboxes of the manager
	 */
	CheckboxesManager = function(id) {
		this.id = id;
		this.checkedCheckboxes = 0;
		// TODO: Save the specified check-all button for in case many exist inside the checkboxes manager.
		// Think if another way is possible
		// this.checkAllCheckbox = $("#" + id).
		this.initialize();
	};

	// CheckboxesManager.prototype.id = "";
	//CheckboxesManager.prototype.checkedCheckboxes = 0;

	/**
	 * A function that is called upon instantiation
	 */
	CheckboxesManager.prototype.initialize = function() {
		this._updateCheckedCheckboxes();
		var manager = this;
		$("#" + this.id).on("click", ".check-all", function(event) {
			if ($(this).is(":checked")) {
				manager._checkAll();
			} else {
				manager._uncheckAll();
			}
			manager._checkboxClicked(event);
		});
		$("#" + this.id).on("click", "input:not(.check-all):checkbox", function(event) {
			if ($("#" + manager.id).find("input:not(.check-all):checkbox:checked").length === $("#" + manager.id).find("input:not(.check-all):checkbox").length) {
				manager._checkAll();
			} else {
				manager._uncheckCheckboxAll();
			}
			manager._checkboxClicked(event);
		});
	};

	/**
	 * Checks all checkboxes
	 */
	CheckboxesManager.prototype._checkAll = function() {
		$("#" + this.id).find("input:not(.dont-control):checkbox:visible").prop("checked", true);
	};

	/**
	 * Unchecks all checkboxes
	 */
	CheckboxesManager.prototype._uncheckAll = function() {
		$("#" + this.id).find("input:not(.dont-control):checkbox:visible").prop("checked", false);
	};

	/**
	 * Unchecks the check-all checkbox
	 * @return {[type]} [description]
	 */
	CheckboxesManager.prototype._uncheckCheckboxAll = function() {
		$("#" + this.id).find("input.check-all:not(.dont-control):checkbox:visible").prop("checked", false);
	};

	/**
	 * Called on each checkbox click
	 * @param  {Event} event 
	 */
	CheckboxesManager.prototype._checkboxClicked = function(event) {
		this._updateCheckedCheckboxes();
		this.clickCallback(event);
	};

	/**
	 * Updates the number of checked checkboxes
	 */
	CheckboxesManager.prototype._updateCheckedCheckboxes = function() {
		this.checkedCheckboxes = $("#" + this.id).find("input:not(.check-all, .dont-control):checkbox:visible:checked").length;
	};

	/**
	 * A callback, called on any checkbox click
	 * @param  {Event} event 
	 */
	CheckboxesManager.prototype.clickCallback = function(event) {};

}());