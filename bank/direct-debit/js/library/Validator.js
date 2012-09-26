/**
 * The notorious js validator
 *
 * @author Achilleas Tsoumitas
 */
var Validator = (function() {

	"use strict";

	var submit = false;
	var displayErrors = true;
	var foundError = false;

	/**
	 * Saves the errors found when the displayErrors is set to false
	 * @type {Array}
	 */
	this.errors = [];

	/**
	 * Makes the validation
	 * @param  {Array} validations   The validations that need to be performed
	 * @param  {Boolean} submit        Do we run those validations on form submit?
	 * @param  {Boolean} displayErrors Do we want the validator to display errors?
	 */
	this.validate = function(validations, submit, displayErrors) {

		this.resetAttributes(submit, displayErrors);

		for (var i = 0, length = validations.length; i < length; i++) {

			var item, validationType, specifiedErrorMessage;

			if (validations[i] instanceof Array) {
				item = validations[i][0];
				validationType = validations[i][1];
				specifiedErrorMessage = validations[i][2];
			} else if (validations[i] instanceof Object) {
				item = validations[i].element;
				validationType = validations[i].validationType;
				specifiedErrorMessage = validations[i].errorMessage;
			}


			if (validationType === "valid_amount") {
				if (this.checkValidAmount(item.val())) {
					this.errorManagement(item, validationType, specifiedErrorMessage);
				}
			} else if (validationType === "has_selected") {
				if (this.checkHasSelected(item)) {
					this.errorManagement(item, validationType, specifiedErrorMessage);
				}
			} else if (validationType === "not_empty") {
				if (this.checkNotEmpty(item.val())) {
					this.errorManagement(item, validationType, specifiedErrorMessage);
				}
			} else if (validationType === "valid_iban") {
				if (this.checkValidIban(item.val())) {
					this.errorManagement(item, validationType, specifiedErrorMessage);
				}
			} else if (validationType === "equality") {
				if (this.checkEquality(item)) {
					this.errorManagement(item, validationType, specifiedErrorMessage);
				}
			} else if (validationType === "char_length") {
				if (this.checkCharLength(item)) {
					this.errorManagement(item, validationType, specifiedErrorMessage);
				}
			} else if (validationType === "compare_numbers") {
				if (this.checkCompareNumbers(item)) {
					this.errorManagement(item, validationType, specifiedErrorMessage);
				}
			} else if (validationType === "is_checked") {
				if (this.checkIsChecked(item)) {
					this.errorManagement(item, validationType, specifiedErrorMessage);
				}
			} else if (validationType === "not_zero") {
				if (this.checkNotZero(item.val())) {
					this.errorManagement(item, validationType, specifiedErrorMessage);
				}
			} else if (validationType === "is_email") {
				if (this.checkIsEmail(item.val())) {
					this.errorManagement(item, validationType, specifiedErrorMessage);
				}
			} else if (validationType === "has_letter") {
				if (this.checkHasLetter(item.val())) {
					this.errorManagement(item, validationType, specifiedErrorMessage);
				}
			} else if (validationType === "has_number") {
				if (this.checkHasNumber(item.val())) {
					this.errorManagement(item, validationType, specifiedErrorMessage);
				}
			}
		}

		if (foundError) {
			return false;
		} else {
			return true;
		}
	};

	/**
	 * A function that decides whethere to call or not the displayError function
	 * We basically avoid the if for each validation
	 *
	 * @param  {HTMLElement} item The element we validate
	 * @param  {String} validationType
	 * @param  {String} specifiedErrorMessage
	 */
	this.errorManagement = function(item, validationType, specifiedErrorMessage) {
		foundError = true;
		var realItem;
		if ($.isArray(item)) {
			realItem = item[0];
		} else {
			realItem = item;
		}
		if (displayErrors) {
			if (specifiedErrorMessage !== "") {
				this.displayError(realItem, validationType, specifiedErrorMessage);
			}
		} else {
			var error = {
				element: realItem,
				validationType: validationType,
				errorMessage: specifiedErrorMessage
			}
			this.errors.push(error);
		}
	};

	/**
	 * Displays an error
	 *
	 * @param  {HTMLElement} item The element we validate
	 * @param  {String} validationType
	 * @param  {String} specifiedErrorMessage
	 */
	this.displayError = function(item, validationType, specifiedErrorMessage) {
		console.log("failed validation=" + validationType + ", on item=" + item.attr("id"));
		if (submit) {
			if (item.hasClass("dsq-dialog")) {
				item.parent().focus();
			} else {
				item.focus();
			}
			submit = false;
		}

		var errorTxt;
		if (error_messages[specifiedErrorMessage]) {
			errorTxt = error_messages[specifiedErrorMessage];
		} else {
			errorTxt = specifiedErrorMessage;
		}

		//check if it has class helper to add it
		if (item.parent().find(".helper").length > 0) {
			var helper = item.parent().find(".helper");
			helper.children("span.validation-error").remove();
			helper.append("<span class='validation-error " + validationType + "'>" + errorTxt + "</span>");
		} else {
			var baseElement;
			for (var i = 0; i < 5; i++) {
				if (!item.next().hasClass("dont-move") && !item.next().hasClass("qMarkClass")) {
					baseElement = item;
					break;
				} else {
					item = item.next();
				}
			}
			if (!baseElement) {
				baseElement = item;
			}
			$('<div class="helper"><span class="validation-error ' + validationType + '">' + errorTxt + '</span></div>').insertAfter(baseElement);
		}
	};

	/**
	 * Resets the class attributes
	 */
	this.resetAttributes = function(submitValue, displayErrorsValue) {
		submit = submitValue;
		displayErrors = displayErrorsValue;
		foundError = false;
		this.errors = [];
	};

	/**
	 * Checks if an amount is valid
	 *
	 * @param  {String} value The value to be validated
	 * @return {Boolean} Validation result
	 */
	this.checkValidAmount = function(value) {
		var error = false;

		if (value === "") {
			error = true;
		} else {
			//if we have more than one ,
			//first found is not the last one too..
			if (value.indexOf(decimal_separator, 0) !== value.lastIndexOf(decimal_separator)) {
				error = true;
			}
			if (value === "." || value === ",") {
				error = true;
			}
			/*if(value.indexOf(".", 0) != value.lastIndexOf(".")){
				error = true;
			}*/
			/*if(locale == "en_US" && value.indexOf(",", 0)){
				error = true;
			}
			if(locale == "ro_RO" && value.indexOf(".", 0)){
				error = true;
			}*/
		}

		return error;
	};

	/**
	 * Check if a list has a selected item or not
	 *
	 * @param  {HTMLElement} item The item to be validated
	 * @return {Boolean} Validation result
	 */
	this.checkHasSelected = function(item) {
		var error = false;
		if (!item.children("li").hasClass("selected")) {
			error = true;
		} else {
			if (item.children("li.selected").hasClass("filter")) {
				error = true;
			}
		}

		return error;
	};

	/**
	 * Check if a value is empty or not
	 *
	 * @param  {String} value The value to be validated
	 * @return {Boolean} Validation result
	 */
	this.checkNotEmpty = function(value) {
		var error = false;
		if (value === undefined) {
			error = true;
		} else if (value.trim() === "") {
			error = true;
		}

		return error;
	};

	/**
	 * Check if a value is a valid iban or not
	 *
	 * @param  {String} value The value to be validated
	 * @return {Boolean} Validation result
	 */
	this.checkValidIban = function(value) {
		var error = false;
		var iban = value.trim();
		if (iban !== '') {
			if (iban.length < 24) {
				error = true;
			} else if (iban.substring(0, 2) !== "RO") {
				error = true;
			}
		} else {
			error = true;
		}

		return error;
	};

	/**
	 * Check if a value is equal to another. Special validation!
	 *
	 * The array contains 3 values
	 * 1. The value to be validated
	 * 2. The comparison to be made [equal, not_equal]
	 * 3. The comparison value
	 *
	 * @param  {array} value
	 * @return {Boolean} Validation result
	 */
	this.checkEquality = function(item) {
		var error = false;

		var value;
		if (jQuery.type(item[0]) === "string") {
			value = item[0].trim();
		} else {
			value = item[0].val().trim();
		}
		var compareType = item[1];
		var compareValue = item[2].trim();

		if (compareType === "equal") {
			if (value !== compareValue) {
				error = true;
			}
		} else if (compareType === "not_equal") {
			if (value === compareValue) {
				error = true;
			}
		}

		return error;
	};

	/**
	 * Check if a value has more or less characters than we want. Special validation!
	 *
	 * The array contains 3 values
	 * 1. The value to be validated
	 * 2. The comparison to be made [min, max, exactly]
	 * 3. The number to compare with
	 *
	 * @param  {array} value
	 * @return {Boolean} Validation result
	 */
	this.checkCharLength = function(item) {
		var error = false;

		var value;
		if (jQuery.type(item[0]) === "string") {
			value = item[0].trim();
		} else {
			value = item[0].val().trim();
		}
		var compareType = item[1];
		var size = item[2];

		if (compareType === "min") {
			if (value.length < size) {
				error = true;
			}
		} else if (compareType === "max") {
			if (value.length > size) {
				error = true;
			}
		} else if (compareType === "exactly") {
			if (value.length !== size) {
				error = true;
			}
		}

		return error;
	};

	/**
	 * Check if a value (number) is bigger/smaller than we want. Special validation!
	 *
	 * The array contains 3 values
	 * 1. The value to be validated
	 * 2. The comparison to be made [min, max]
	 * 3. The number to compare with
	 *
	 * @param  {array} value
	 * @return {Boolean} Validation result
	 */
	this.checkCompareNumbers = function(item) {
		var error = false;

		var value;
		if (jQuery.type(item[0]) === "number") {
			value = amount_to_number(item[0].trim());
		} else {
			value = amount_to_number(item[0].val().trim());
		}
		var compareType = item[1];
		var limit = amount_to_number(item[2]);

		if (compareType === "min") {
			if (value < limit) {
				error = true;
			}
		} else if (compareType === "max") {
			if (value > limit) {
				error = true;
			}
		}

		return error;
	};

	/**
	 * Validates if a checkbox is checked
	 *
	 * @param  {HTMLElement} item The checkbox to be validated
	 * @return {Boolean} Validation result
	 */
	this.checkIsChecked = function(item) {
		var error = false;

		if (!item.attr("checked")) {
			error = true;
		}

		return error;
	};

	/**
	 * Validates if a number is equal to zero or not
	 * @param  {float} value The value to be validated
	 * @return {Boolean} Validation result
	 */
	this.checkNotZero = function(value) {
		var error = false;

		value = amount_to_number(value);
		if (value === 0) {
			error = true;
		}

		return error;
	};

	/**
	 * Validates if a value has a valid email structure
	 *
	 * @param  {String} value The value to be validated
	 * @return {Boolean} Validation result
	 */
	this.checkIsEmail = function(value) {
		var error = false;

		var email = value.trim();

		var regex = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
		if (regex.test(email) === false) {
			error = true;
		}

		return error;
	};

	/**
	 * Validates if a value has at least one letter in it
	 *
	 * @param  {String} value The value to be validated
	 * @return {Boolean} Validation result
	 */
	this.checkHasLetter = function(value) {
		var error = false;

		value = value.trim();

		var regex = /[a-zA-Z]/;
		if (regex.test(value) === false) {
			error = true;
		}

		return error;
	};

	/**
	 * Validates if a value has at least one number in it
	 *
	 * @param  {String} value The value to be validated
	 * @return {Boolean} Validation result
	 */
	this.checkHasNumber = function(value) {
		var error = false;

		value = value.trim();

		var regex = /[0-9]/;
		if (regex.test(value) === false) {
			error = true;
		}

		return error;
	};

});