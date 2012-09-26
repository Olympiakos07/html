/*jshint smarttabs:true */
/**
 * A function that handles all the ajax requests
 *
 * TODO: Ask if my idea for the multiple server error will be implemented
 */

/*var data = {
	"errors": {
		"hasErrors": false,
		"messages": ["sdfsdf", "sfsdfsd"]
	},
	"response": {
		"accounts": [
			{
				"accountNumber": "34242342",
				"restrictions": true
			},
			{
				"accountNumber": "2333223",
				"restrictions": false
			}
		]
	}
};*/

var AjaxRequest;

(function() {
	"use strict";

	/**
	 * The constructor
	 */
	AjaxRequest = function() {};

	/**
	 * Makes the actual request
	 * @param  {String} url             The url of the server that we want to communicate with
	 * @param  {Object} requestData     The data that we want to send to the server
	 * @param  {String} dataType        The accepted values are "json", "html", "xml", "script". This tag is currently not used, as jQuery will automatically try to detect the type by the mime of the response
	 */
	AjaxRequest.prototype.request = function(url, requestData, dataType) {
		//save the object functions because "this" will change inside the post request
		var self = this;
		var success = this.success;
		var error = this.error;
		var complete = this.complete;

		$.post(url, requestData, function(responseData) {
			// check for server errors
			var errorMessage = "";
			if (responseData.errors && responseData.errors.hasErrors) {
				for (var i = 0, length = responseData.errors.messages.length; i < length; i++) {
					errorMessage += responseData.errors.messages[i] + " ";
				}
				errorMessage = errorMessage.substr(0, errorMessage.length - 1);
			}
			// if we found server errors, call error method instead
			if (errorMessage) {
				self.error(responseData, errorMessage);
			} else {
				success(responseData);
			}

		}, dataType).error(function(responseData) {
			error(responseData, "");
		}).complete(function(responseData) {
			complete(responseData);
		});
	};

	/**
	 * If defined by the user as a function, it is called after the ajax request has succeeded and the server responded without errors
	 * @param  {Object} responseData The responce data
	 */
	AjaxRequest.prototype.success = function(responseData) {};

	/**
	 * It is called after the ajax request has failed to communicate with the server or the server responded with error messages, else this is empty
	 * @param  {Object} responseData         The default request data responce
	 * @param  {String} errorMessage If the server responded with an error message and this is the concatenation of the error messages issued
	 */
	AjaxRequest.prototype.error = function(responseData, errorMessage) {
		//display validator error that the server is not responding
		//if a second request, started by the user with a button is not responding
		// prompt the user to try the transaction later
		// since a validation error exists on the screen, the transaction cannot be submitted
		console.log("open server side errors modal");
	};

	/**
	 * If defined by the user as a function, it is called after the ajax request is completed
	 * either with success or error
	 * @param  {Object} responseData The responce data
	 */
	AjaxRequest.prototype.complete = function(responseData) {};

}());

/**
 * An object that provides useful amount functions
 *
 * @author Achilleas Tsoumitas
 */
var AmountUtilities = (function() {

	"use strict";

	var instantiated;

	var thousandSeparator, decimalSeparator;

	/**
	 * Calculate the decimal and thousand separators based on the locale
	 */
	if (locale === "en_US") {
		decimalSeparator = ".";
		thousandSeparator = ",";
	} else {
		decimalSeparator = ",";
		thousandSeparator = ".";
	}

	function initialize() {

		return {
			thousandSeparator: thousandSeparator,
			decimalSeparator: decimalSeparator,
			/**
			 * Removes any thousand separators from the given value
			 * @param  {String/Number} value
			 * @return {String} The value without thousand separators
			 */
			removeThousandSeparators: function(value) {
				if (locale === "en_US") {
					value = value.toString().replace(/\,/g, "");
				} else {
					value = value.toString().replace(/\./g, "");
				}

				return value;
			},
			/**
			 * Converts and amount (probably inputted by the user) so a valid number
			 * @param  {String/Number} value The value to convert
			 * @return {Number}
			 */
			amountToNumber: function(value) {
				value = AmountUtilities.getInstance().removeThousandSeparators(value);
				if (locale === "en_US") {
					value = parseFloat(value.toString());
				} else {
					value = parseFloat(value.toString().replace(/\,/g, "."));
				}

				return value;
			},
			/**
			 * Formats any given number to string that represents a number with 2 decimals and thousand separators
			 * @param  {String/Number} value The value to format
			 * @return {String}
			 */
			formatAmount: function(value) {
				value = CharacterInputManager.getInstance().removeInvalidCharacters("amount-validated", value);
				value = AmountUtilities.getInstance().amountToNumber(value);

				var result = Math.round(value * 100) / 100;

				var temp = result.toString().split(".");
				var intPart = temp[0].toString();
				var decimalPart;
				if (temp.length > 1) {
					decimalPart = temp[1].toString();
				}

				if (decimalPart === undefined) {
					decimalPart = "00";
				} else if (decimalPart.length === 1) {
					decimalPart += "0";
				}

				var formattedIntPart = "";

				for (var i = 0; i < intPart.length; i++) {
					formattedIntPart = intPart.charAt(intPart.length - 1 - i) + formattedIntPart;
					//if we already counted 3 charachers and thats not the last one, add separator
					if ((i + 1) % 3 === 0 && i !== intPart.length - 1) {
						formattedIntPart = thousandSeparator + formattedIntPart;
					}
				}

				result = formattedIntPart + decimalSeparator + decimalPart;

				return result;
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

/**
 * Restricts the user input in fields with certain classes.
 * Also provides some utility function like removeInvalidCharacters
 *
 * @author Achilleas Tsoumitas
 */
var CharacterInputManager = (function() {

	"use strict";

	var instantiated;

	$(document).ready(function() {

		//alphbetic field
		$("body").on("keydown", ".field.alphabetic-validated", function(event) {
			var charCodes;
			if ($(this).hasClass("no-spaces")) {
				charCodes = CharacterInputManager.getInstance().charCodeArrayCreator(["letters"]);
			} else {
				charCodes = CharacterInputManager.getInstance().charCodeArrayCreator(["letters", "space"]);
			}
			//dont print the key pressed if its not inside the allowed ones, or if its number but with shift key
			if (jQuery.inArray(event.keyCode, charCodes) === -1) {
				event.preventDefault();
			}
		});

		//numeric field
		$("body").on("keydown", ".field.numeric-validated", function(event) {
			//if($(this).hasClass("no-spaces")){
			var charCodes = CharacterInputManager.getInstance().charCodeArrayCreator(["numbers"]);
			// }else{
			// var char_codes = char_code_array_creator(["numbers", "space"]);
			// }
			//dont print the key pressed if its not inside the allowed ones, or if its number but with shift key
			if (jQuery.inArray(event.keyCode, charCodes) === -1 || (event.shiftKey && event.keyCode !== 9) || (event.shiftKey && !CharacterInputManager.getInstance().isLetterOrArrow(event.keyCode))) {
				//but, allow control +a, c.. or shift and arrows to select
				if (!(event.ctrlKey || (event.shiftKey && CharacterInputManager.getInstance().isLetterOrArrow(event.keyCode)))) {
					event.preventDefault();
				}
			}
		});

		// not sure if this is used anymore
		$("body").on("blur", ".field.numeric-validated.integer", function(event) {
			if ($(this).val() !== "") {
				var value = $(this).val().replace(/[0]+/g, "");
				if (value !== "") {
					$(this).val(parseInt(value, 10));
				} else {
					$(this).val("0");
				}
			}
		});

		//alphanumeric field
		$("body").on("keydown", ".field.alphanumeric-validated", function(event) {
			var charCodes;
			if ($(this).hasClass("no-spaces")) {
				charCodes = CharacterInputManager.getInstance().charCodeArrayCreator(["numbers", "letters"]);
			} else {
				charCodes = CharacterInputManager.getInstance().charCodeArrayCreator(["numbers", "letters", "space"]);
			}
			if (event.type === "keydown") {
				//dont print the key pressed if its not inside the allowed ones, or if its number but with shift key
				if (jQuery.inArray(event.keyCode, charCodes) === -1 || (event.shiftKey && !CharacterInputManager.getInstance().isLetterOrArrow(event.keyCode))) {
					event.preventDefault();
				}
			}
		});

		$("body").on("keydown", ".field.alphanumericplus-validated", function(event) {
			//we want only numbers
			var charCodes = CharacterInputManager.getInstance().charCodeArrayCreator(["numbers", "letters", "space"]);
			if ( /* / */ (!event.shiftKey && event.keyCode === 191) || /* ? */ (event.shiftKey && event.keyCode === 191) || /* : */ (event.shiftKey && event.keyCode === 186) || /* ( */ (event.shiftKey && event.keyCode === 57) || /* ) */ (event.shiftKey && event.keyCode === 48) || /* . */ (!event.shiftKey && event.keyCode === 190) || /* , */ (!event.shiftKey && event.keyCode === 188) || /* ' */ (!event.shiftKey && event.keyCode === 222) || /* + */ (event.shiftKey && event.keyCode === 187) || /* { */ (event.shiftKey && event.keyCode === 219) || /* } */ (event.shiftKey && event.keyCode === 221) || /* - */ (!event.shiftKey && event.keyCode === 189)) {
				//type it
				void(0);
			} else {
				//aplhanumeric validation
				if (jQuery.inArray(event.keyCode, charCodes) === -1 || (event.shiftKey && !CharacterInputManager.getInstance().isLetterOrArrow(event.keyCode))) {
					event.preventDefault();
				}
			}
		});

		//amount field
		$("body").on("keydown", ".field.amount-validated", function(event) {
			//we want only numbers and maybe commas
			var charCodes;
			if ($(this).hasClass("no-decimals")) {
				charCodes = CharacterInputManager.getInstance().charCodeArrayCreator(["numbers"]);
			} else {
				charCodes = CharacterInputManager.getInstance().charCodeArrayCreator(["numbers", "commas"]);
			}
			//alphanumeric validation
			if (event.ctrlKey && CharacterInputManager.getInstance().isLetterOrArrow(event.keyCode)) {
				//type it
				void(0);
			} else if (jQuery.inArray(event.keyCode, charCodes) === -1 || (event.shiftKey && !CharacterInputManager.getInstance().isLetterOrArrow(event.keyCode))) {
				event.preventDefault();
			}
		});

		/**
		 * Also remove the invalid characters on blur, because he might pasted the characters
		 * or found another fancy way to insert them into the field
		 *
		 * @param  {Event} event
		 * @return {[type]}       [description]
		 */
		$(document).on("blur", ".field", function(event) {
			//save input val
			var input = $(this).val();
			//
			var validationType = "";
			if ($(this).hasClass("numeric-validated")) {
				validationType = "numeric-validated";
			} else if ($(this).hasClass("alphanumeric-validated")) {
				validationType = "alphanumeric-validated";
			} else if ($(this).hasClass("alphabetic-validated")) {
				validationType = "alphabetic-validated";
			} else if ($(this).hasClass("alphanumericplus-validated")) {
				validationType = "alphanumericplus-validated";
			} else if ($(this).hasClass("amount-validated")) {
				validationType = "amount-validated";
			}
			if (validationType !== "") {
				$(this).val(CharacterInputManager.getInstance().removeInvalidCharacters(validationType, input));
			}
		});

	});


	function initialize() {

		return {
			/**
			 * Removes invalid characters based on validation type
			 *
			 * @param  {String} validationType The validation to be executed
			 * @param  {String} value          The value to strip
			 * @return {String}                The stripped down value
			 */
			removeInvalidCharacters: function(validationType, value) {
				var regex, result;
				value = value.toString();
				if (validationType === "numeric-validated") {
					regex = /[a-zA-Z,\.\`\~\!\@\#\$\%\^\&\*\(\)<\>\/\?\\\:\;\"\'\-\_\+\=\[\]\{\}]/g;
					result = value.replace(regex, "");
				} else if (validationType === "alphanumeric-validated") {
					regex = /[,\.\`\~\!\@\#\$\%\^\&\*\(\)<\>\/\?\\\:\;\"\'\-\_\+\=\[\]\{\}]/g;
					result = value.replace(regex, "");
				} else if (validationType === "alphabetic-validated") {
					regex = /[0-9,\.\`\~\!\@\#\$\%\^\&\*\(\)<\>\/\?\\\:\;\"\'\-\_\+\=\[\]\{\}]/g;
					result = value.replace(regex, "");
				} else if (validationType === "alphanumericplus-validated") {
					regex = /[\`\~\!\@\#\$\%\^\&\*<\>\\\;\"\_\=\[\]]/g;
					result = value.replace(regex, "");
				} else if (validationType === "amount-validated") {
					regex = /[a-zA-Z`\~\!\@\#\$\%\^\&\*\(\)<\>\/\?\\\:\;\"\'\-\_\+\=\[\]\{\}]/g;
					result = value.replace(regex, "");
				}

				//also replace the romanian characters, BUT ONLY ON NON PASSWORD FIELDS
				//regex = /[\Äƒ\Ã¢\Å£\Å?\Ã®\Ä‚\Ã‚\Å¢\Å?\Ã?]/g;
				//result = result.replace(regex, "");
				//result = result.toString().replace(/Äƒ/g,'a').replace(/Ã¢/g,'a').replace(/Å£/g,'t').replace(/Å?/g,'s').replace(/Ã®/g,'i').replace(/Ä‚/g,'A').replace(/Ã‚/g,'A').replace(/Å¢/g,'T').replace(/Å?/g,'S').replace(/Ã?/g,'I');
				return result;
			},
			/**
			 * Creates an array with the keyboard key codes that are allowed for characters specified
			 * @param  {Array} order Order some characters please. We offer "numbers", "letters", "space", "commas"
			 * @return {Array}       An array containing all the keycodes for the ordered characters
			 */
			charCodeArrayCreator: function(order) {
				//for comma, we need to know if are in english or romanian locale
				var commaCode;
				if (locale === "en_US") {
					commaCode = 190;
				} else {
					commaCode = 188;
				}
				var charCodes = [];
				for (var i = 0; i < 223; i++) {
					//numbers 48-57
					//numpad 96-105
					if (
					jQuery.inArray("numbers", order) !== -1 && (
					(i >= 48 && i <= 57) || (i >= 96 && i <= 105)) || jQuery.inArray("letters", order) !== -1 && (
					(i >= 65 && i <= 90)) || jQuery.inArray("space", order) !== -1 && (
					(i === 32)) || jQuery.inArray("commas", order) !== -1 && (
					(i === commaCode)) ||
					// also allow 8: backspace, 9: tab, 13: enter, 16: shift, 17: ctrl, 18: alt, 20: caps lock, 33: page up, 34: page down, 35: end, 36: home, 37: left arrow, 38: up, 39: right, 40: down, 46: delete
					//SHIFT was a bad boy and banned, we actually dont need it, each validation handles it its own way
					(i === 8 || i === 9 || i === 13 /*|| i === 16*/ || i === 17 || i === 18 || i === 20 || i === 33 || i === 34 || i === 35 || i === 36 || i === 37 || i === 38 || i === 39 || i === 40 || i === 46)) {
						charCodes.push(i);
					}
				}

				return charCodes;
			},
			/**
			 * Check if a keyCode is a letter or arrow
			 * @param  {Number}  keyCode
			 * @return {Boolean}
			 */
			isLetterOrArrow: function(keyCode) {
				if ((keyCode >= 65 && keyCode <= 90) || keyCode === 9 || (keyCode >= 37 && keyCode <= 40)) {
					return true;
				} else {
					return false;
				}
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

/**
 * This object has not changed during the main.js split
 */

/**
 * Updates the characters counters
 */

function update_char_counters() {
	"use strict";

	$(".field.has-counter").each(function() {
		var input = $(this).val();
		var input_size = input.length;
		var chars_left = $(this).attr("maxlength") - input_size;
		$(this).next().find(".chars-remaining").text(chars_left);
	});
}

var CharCounters = function() {};

/**
 * Updates the character remaining counters in input fields
 * @param  {array} elements An array containing the ids of the fields to update. If its undefined, all fields will update
 */
CharCounters.prototype.update = function(elements) {

	var i;

	if (!elements) {
		elements = [];
		i = 0;
		$(".field.has-counter").each(function() {
			elements[i] = $(this).attr("id");
			i++;
		});
	}
	for (i = 0, length = elements.length; i < length; i++) {
		var id = elements[i];
		var input = $("#" + id).val();
		var input_size = input.length;
		var chars_left = $("#" + id).attr("maxlength") - input_size;
		$("#" + id).nextAll(".helper").find(".chars-remaining").text(chars_left);
	}
};

$(document).ready(function() {

	//field with limited character number
	$(".field.has-counter").each(function() {
		if (!$(this).attr("maxlength")) {
			$(this).attr("maxlength", $(this).next().find(".chars-remaining").text());
		}
	});

	/**
	 * Update the character counter on blur or keyup
	 * @return {[type]} [description]
	 */
	$(document).on("keyup blur", ".field.has-counter", function() {
		if (!charCounters) {
			var charCounters = new CharCounters();
		}
		charCounters.update([$(this).attr("id")]);
	});
});

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
	 * @param {String} container The id of an element that contains all the checkboxes of the manager
	 */
	CheckboxesManager = function(containerId, checkboxesClass, checkAllClass) {
		this.containerId = containerId;
		
		this.checkboxesClass = this.checkboxesSelector = checkboxesClass;
		if (this.checkboxesClass) {
			this.checkboxesSelector = "." + this.checkboxesClass;
		} else {
			this.checkboxesSelector = "";
		}
		
		this.checkAllClass = this.checkAllSelector = checkAllClass;
		if (this.checkAllClass) {
			this.checkAllSelector = "." + this.checkAllClass;
		} else {
			this.checkAllSelector = "";
		}
		
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
		$("#" + this.containerId).on("click", this.checkboxesSelector + this.checkAllSelector, function(event) {
			manager._checkboxClicked(event);
		});
		$("#" + this.containerId).on("click", "input" + this.checkboxesSelector + ":not(" + this.checkAllSelector + "):checkbox", function(event) {
			manager._checkboxClicked(event);
		});
	};
	
	CheckboxesManager.prototype._allCheckboxClicked = function(event) {
		if ($(event.currentTarget).is(":checked")) {
			this._checkAll();
		} else {
			this._uncheckAll();
		}
	}

	CheckboxesManager.prototype._simpleCheckboxClicked = function(event) {
		if ($("#" + this.containerId).find("input" + this.checkboxesSelector + ":not(" + this.checkAllSelector + ", .dont-control):checkbox:checked").length === $("#" + this.containerId).find("input" + this.checkboxesSelector + ":not(" + this.checkAllSelector + ", .dont-control):checkbox").length) {
			this._checkCheckboxAll();
		} else {
			this._uncheckCheckboxAll();
		}
	}
	
	/**
	 * Checks all checkboxes
	 */
	CheckboxesManager.prototype._checkAll = function() {
		//$("#" + this.containerId).find("input" + this.checkboxesClass + ":not(.dont-control):checkbox").prop("checked", true);
		//$("#" + this.containerId).find("input" + this.checkboxesClass + ":not(.dont-control, check-all):checkbox:not(:checked)").trigger("click");
		$("#" + this.containerId).find("input" + this.checkboxesSelector + ":not(.dont-control):checkbox").prop("checked", true);
	};

	/**
	 * Unchecks all checkboxes
	 */
	CheckboxesManager.prototype._uncheckAll = function() {
		//$("#" + this.containerId).find("input" + this.checkboxesClass + ":not(.dont-control, .check-all):checkbox:checked").trigger("click");
		$("#" + this.containerId).find("input" + this.checkboxesSelector + ":not(.dont-control):checkbox").prop("checked", false);
	};

	/**
	 * Checks the check-all checkbox
	 */
	CheckboxesManager.prototype._checkCheckboxAll = function() {
		$("#" + this.containerId).find("input" + this.checkboxesSelector + this.checkAllSelector + ":not(.dont-control):checkbox").prop("checked", true);
	};
	
	/**
	 * Unchecks the check-all checkbox
	 */
	CheckboxesManager.prototype._uncheckCheckboxAll = function() {
		$("#" + this.containerId).find("input" + this.checkboxesSelector + this.checkAllSelector + ":not(.dont-control):checkbox").prop("checked", false);
	};

	/**
	 * Called on each checkbox click
	 * @param  {Event} event
	 */
	CheckboxesManager.prototype._checkboxClicked = function(event) {
		if ($(event.currentTarget).hasClass(this.checkAllClass)) {
			this._allCheckboxClicked(event);
		} else {
			this._simpleCheckboxClicked(event);			
		}
		this._updateCheckedCheckboxes();
		this.clickCallback(event);
	};

	/**
	 * Updates the number of checked checkboxes
	 */
	CheckboxesManager.prototype._updateCheckedCheckboxes = function() {
		this.checkedCheckboxes = $("#" + this.containerId).find("input" + this.checkboxesSelector + ":not(" + this.checkAllSelector + ", .dont-control):checkbox:visible:checked").length;
	};

	/**
	 * A callback, called on any checkbox click
	 * @param  {Event} event
	 */
	CheckboxesManager.prototype.clickCallback = function(event) {};

}());

///**
// * Controls a group of checkboxes
// *
// * @author Achilleas Tsoumitas
// */
//var CheckboxesManager;
//
//(function() {
//
//	"use strict";
//
//	/**
//	 * Defines a new checkboxmanager
//	 * @param {String} containerId The id of an element that contains all the checkboxes of the manager
//	 */
//	CheckboxesManager = function(containerId, checkboxesClass, checkAllClass) {
//		this.containerId = containerId;
//		this.checkboxesClass = checkboxesClass;
//		this.checkAllClass = checkAllClass;
//		if (this.checkboxesClass) {
//			this.checkboxesClass = "." + this.checkboxesClass;
//		} else {
//			this.checkboxesClass = "";
//		}
//		if (checkAllClass){
//			this.checkAllClass = "." + checkAllClass;
//		} else {
//			this.checkAllClass = ".check-all";
//		}
//		this.checkedCheckboxes = 0;
//		// TODO: Save the specified check-all button for in case many exist inside the checkboxes manager.
//		// Think if another way is possible
//		// this.checkAllCheckbox = $("#" + id).
//		this.initialize();
//	};
//
//	// CheckboxesManager.prototype.id = "";
//	//CheckboxesManager.prototype.checkedCheckboxes = 0;
//	/**
//	 * A function that is called upon instantiation
//	 */
//	CheckboxesManager.prototype.initialize = function() {
//		this._updateCheckedCheckboxes();
//		var manager = this;
//		$("#" + this.containerId).on("click", this.checkAllClass, function(event) {
//			if ($(this).is(":checked")) {
//				manager._checkAll();
//			} else {
//				manager._uncheckAll();
//			}
//			manager._checkboxClicked(event);
//			//event.stopPropagation();
//		});
//		$("#" + this.containerId).on("click", "input" + this.checkboxesClass + ":not(" + this.checkAllClass + "):checkbox", function(event) {
//			if ($("#" + manager.containerId).find("input" + manager.checkboxesClass + ":not(" + manager.checkAllClass + ", .dont-control):checkbox:checked").length === $("#" + manager.containerId).find("input" + manager.checkboxesClass + ":not(" + manager.checkAllClass + ", .dont-control):checkbox").length) {
//				manager._checkCheckboxAll();
//			} else {
//				manager._uncheckCheckboxAll();
//			}
//			manager._checkboxClicked(event);
//		});
//	};
//
//	/**
//	 * Checks all checkboxes
//	 */
//	CheckboxesManager.prototype._checkAll = function() {
//		$("#" + this.containerId).find("input" + this.checkboxesClass + ":not(.dont-control):checkbox").prop("checked", true);
//		$("#" + this.containerId).find("input" + this.checkboxesClass + ":not(.dont-control):checkbox"+":not(" + this.checkAllClass + ")").trigger("click");
//		//$("#" + this.containerId).find("input" + this.checkAllClass + ":not(.dont-control):checkbox").prop("checked", true);
//	};
//
//	/**
//	 * Unchecks all checkboxes
//	 */
//	CheckboxesManager.prototype._uncheckAll = function() {
//		$("#" + this.containerId).find("input" + this.checkboxesClass + ":not(.dont-control):checkbox").prop("checked", false);
//		$("#" + this.containerId).find("input" + this.checkboxesClass + ":not(.dont-control):checkbox"+":not(" + this.checkAllClass + ")").trigger("click");
//		//$("#" + this.containerId).find("input" + this.checkAllClass + ":not(.dont-control):checkbox").prop("checked", false);
//	};
//
//	/**
//	 * Checks the check-all checkbox
//	 * @return {[type]} [description]
//	 */
//	CheckboxesManager.prototype._checkCheckboxAll = function() {
//		$("#" + this.containerId).find("input" + this.checkAllClass +":not(.dont-control):checkbox").prop("checked", true);
//	};
//	
//	/**
//	 * Unchecks the check-all checkbox
//	 * @return {[type]} [description]
//	 */
//	CheckboxesManager.prototype._uncheckCheckboxAll = function() {
//		$("#" + this.containerId).find("input" + this.checkAllClass + ":not(.dont-control):checkbox").prop("checked", false);
//	};
//
//	/**
//	 * Called on each checkbox click
//	 * @param  {Event} event
//	 */
//	CheckboxesManager.prototype._checkboxClicked = function(event) {
//		this._updateCheckedCheckboxes();
//		this.clickCallback(event);
//	};
//
//	/**
//	 * Updates the number of checked checkboxes
//	 */
//	CheckboxesManager.prototype._updateCheckedCheckboxes = function() {
//		this.checkedCheckboxes = $("#" + this.containerId).find("input" + this.checkboxesClass + ":not(" + this.checkAllClass + ", .dont-control):checkbox:visible:checked").length;
//	};
//
//	/**
//	 * A callback, called on any checkbox click
//	 * @param  {Event} event
//	 */
//	CheckboxesManager.prototype.clickCallback = function(event) {};
//
//}());

/**
 * An object that manages all datepickers
 *
 * @author Achilleas Tsoumitas
 */
var DatepickersManager = (function() {

	"use strict";

	var instantiated;

	$(document).ready(function() {
		/**
		 * Datepickers localization
		 */
		$.datepicker.regional[locale] = {
			monthNames: monthNames,
			monthNamesShort: monthNamesShort,
			dayNames: dayNames,
			dayNamesMin: dayNamesMin
		};
		$.datepicker.setDefaults($.datepicker.regional[locale]);

		/**
		 * On datepicker click, try to setup the datepickers again in case some new came from html ajax request
		 * @return {[type]} [description]
		 */
		$("body").on("click", ".datepicker", function() {
			if ($(this).hasClass("past-datepicker")) {
				DatepickersManager.getInstance().setupPastDatepickers();
			} else if ($(this).hasClass("all-dates")) {
				DatepickersManager.getInstance().setupAllDatesDatepickers();
			} else if ($(this).hasClass("custom-date-datepicker")) {
				DatepickersManager.getInstance().setupCustomDatepickers();
			} else {
				DatepickersManager.getInstance().setupDatepickers();
			}
			$(this).datepicker("show");
		});

		/**
		 * Transaction planner step open/close
		 * @return {[type]} [description]
		 */
		$("body").on("click", "#transaction-planner-dialog li", function() {
			ResetManager.getInstance().resetAvailableDates();
			//set first input date to today
			DatepickersManager.getInstance().setTransactionPlannerDateText();
			var type = $(this).children().attr("class");
			//display multi repeat
			if (type === 'multi-sending') {
				$(".transaction-planner-step .multi-sending-fields").slideDown();
				$(".first-send-difference").show();
			} else {
				$(".transaction-planner-step").find(".validation-error").remove();
				$(".transaction-planner-step .multi-sending-fields").slideUp();
				$(".first-send-difference").hide();
			}
			setTimeout(function() {
				MainPageHeightManager.getInstance().fixHeight();
			}, 500);
		});

		/**
		 * On transactions planner step duration change
		 */
		$("body").on("click", "#recurring-duration-dialog li", function() {
			DatepickersManager.getInstance().sendingsCalculator();
			DatepickersManager.getInstance().setupPastDatepickers();
		});

		/**
		 * On transactions planner step recurring interval change
		 */
		$("body").on("keyup", ".transaction-planner-step #recurring-interval", function() {
			DatepickersManager.getInstance().sendingsCalculator();
		});

	});

	function initialize() {

		return {
			/**
			 * Calculates the sendings for steps with dates with repetition
			 */
			sendingsCalculator: function() {

				//find interval
				var interval = $(".transaction-planner-step #recurring-interval").val().trim();
				if (interval !== "") {
					interval = parseInt(interval, 10);
				}

				//find period
				var period;
				if ($(".transaction-planner-step #recurring-duration-dialog li.selected").hasClass("months")) {
					period = "months";
				} else {
					period = "days";
				}

				if (interval !== "") {
					//find the two dates to compare
					var date1 = $(".transaction-planner-step #start-date").val();
					var date2 = $(".transaction-planner-step #end-date").val();
					if (date1 !== '' && date2 !== '' && interval !== '') {
						var date1Array = date1.split('/');
						var date2Array = date2.split('/');
						var times;
						if (period === 'months') {
							/*var times = Math.floor(((date2_array[2] - date1_array[2]) * 12 + (date2_array[1] - date1_array[1]))/interval);
							if(times == 0){
								times = 1;
							}*/
							times = 0;
							date1 = new Date(date1Array[2], date1Array[1] - 1, date1Array[0]);
							date2 = new Date(date2Array[2], date2Array[1] - 1, date2Array[0]);
							while (date2 >= date1) {
								times++;
								date1 = new Date(date1Array[2], date1Array[1] - 1 + (interval * times), date1Array[0]);
								date2 = new Date(date2Array[2], date2Array[1] - 1, date2Array[0]);
							}
						} else {
							date1 = new Date(date1Array[2], date1Array[1] - 1, date1Array[0]);
							date2 = new Date(date2Array[2], date2Array[1] - 1, date2Array[0]);
							var oneDay = 1000 * 60 * 60 * 24;
							times = Math.floor((date2.getTime() - date1.getTime()) / (oneDay) / interval) + 1;
						}
						$(".transaction-planner-step .sendings-estimation").text(times);
					}
				} else {
					$(".transaction-planner-step .sendings-estimation").text(0);
				}
			},
			/**
			 * Initiates any custom datepickers
			 */
			setupCustomDatepickers: function() {
				//$(".custom-date.datepicker").each(function() {
				$(".custom-date.datepicker").datepicker({
					showOtherMonths: true,
					dateFormat: 'dd/mm/yy',
					/*minDate: 0,
						maxDate: 0,*/
					numberOfMonths: 1,
					firstDay: 1,
					changeMonth: true,
					changeYear: true
				});
				/*var last_date;
					if($(this).hasClass("without-today")){
						last_date = -1;
					}else{
						last_date = 0;
					}*/
				// if this functionality and past datepicker are needed,
				// add thos options after u create the datepicker
				//});
			},
			//limit the datepicker results, start date cant be after end date
			// setup_datepickers();
			setupDatepickers: function() {
				var lastDate;
				if ($("#start-date.datepicker.past-datepicker").hasClass("without-today")) {
					lastDate = -1;
				} else {
					lastDate = 0;
				}
				var dates = $("#start-date.datepicker:not(.past-datepicker), #end-date.datepicker:not(.past-datepicker, .single-date)").datepicker({
					showOtherMonths: true,
					dateFormat: 'dd/mm/yy',
					minDate: lastDate,
					numberOfMonths: 1,
					firstDay: 1,
					changeMonth: true,
					changeYear: true,
					onSelect: function(selectedDate) {

						var option = this.id === "start-date" ? "minDate" : "maxDate",
							instance = $(this).data("datepicker");
						var date = $.datepicker.parseDate(
						instance.settings.dateFormat || $.datepicker._defaults.dateFormat, selectedDate, instance.settings);
						dates.not(this).datepicker("option", option, date);
						//
						$("fieldset.transaction-planner-step").addClass("active");
						//all the following are to display the date text
						DatepickersManager.getInstance().updateDateString($(this), selectedDate);
						if (dates.not(this).attr("id") !== "start-date") {
							DatepickersManager.getInstance().updateDateString(dates.not(this), selectedDate);
						}

						if (!$(this).hasClass("single-date") && $(this).closest(".transaction-planner-step").length > 0) {
							DatepickersManager.getInstance().sendingsCalculator();
						}
					}
				});
			},
			setupAllDatesDatepickers: function() {
				var allDates = $("#start-date.datepicker.all-dates:not(.past-datepicker), #end-date.datepicker.all-dates:not(.past-datepicker, .single-date)").datepicker({
					showOtherMonths: true,
					dateFormat: 'dd/mm/yy',
					numberOfMonths: 1,
					firstDay: 1,
					changeMonth: true,
					changeYear: true,
					onSelect: function(selectedDate) {

						var option = this.id === "start-date" ? "minDate" : "maxDate",
							instance = $(this).data("datepicker");
						var date = $.datepicker.parseDate(
						instance.settings.dateFormat || $.datepicker._defaults.dateFormat, selectedDate, instance.settings);
						allDates.not(this).datepicker("option", option, date);
						//
						$("fieldset.transaction-planner-step").addClass("active");
						//all the following are to display the date text
						DatepickersManager.getInstance().updateDateString($(this), selectedDate);
						if (allDates.not(this).attr("id") !== "start-date") {
							DatepickersManager.getInstance().updateDateString(allDates.not(this), selectedDate);
						}

						if (!$(this).hasClass("single-date") && $(this).closest(".transaction-planner-step").length > 0) {
							DatepickersManager.getInstance().sendingsCalculator();
						}
					}
				});
			},
			setupPastDatepickers: function() {
				//limit the datepicker results for past datepickers
				//limit the datepicker results
				var lastDate;
				if ($("#start-date.datepicker.past-datepicker").hasClass("without-today")) {
					lastDate = -1;
				} else {
					lastDate = 0;
				}
				var pastDates = $("#start-date.datepicker.past-datepicker, #end-date.datepicker.past-datepicker").datepicker({
					showOtherMonths: true,
					dateFormat: 'dd/mm/yy',
					// minDate: -2000,
					maxDate: lastDate,
					numberOfMonths: 1,
					firstDay: 1,
					changeMonth: true,
					changeYear: true,
					onSelect: function(selectedDate) {
						var option = this.id === "start-date" ? "minDate" : "maxDate",
							instance = $(this).data("datepicker");
						var date = $.datepicker.parseDate(
						instance.settings.dateFormat || $.datepicker._defaults.dateFormat, selectedDate, instance.settings);
						pastDates.not(this).datepicker("option", option, date);
					}
				});
			},
			setTransactionPlannerDateText: function() {
				$(".transaction-planner-step #start-date, .transaction-planner-step #end-date").val(today_date);
				$(".transaction-planner-step .date-string").text(today_locale + " " + today.getDate() + " " + monthNames[today.getMonth()] + " " + today.getFullYear() + ".");
			},
			updateDateString: function(item, selectedDate) {
				var temp = selectedDate.split('/');
				var selectedDay = temp[0];
				var selectedMonth = temp[1];
				var selectedYear = temp[2];
				//create date object so we can find the day
				selectedDate = new Date(parseFloat(temp[2]), parseFloat(temp[1]) - 1, parseFloat(temp[0]));
				var day = selectedDate.getDay();
				//check what day he selected (today, tomorrow, or just day name)
				var dateName;
				if (selectedDate === todayDate) {
					dateName = todayLocale;
				} else {
					if (selectedYear === todayDate.split("/")[2] && selectedMonth === todayDate.split("/")[1] && parseInt(selectedDay, 10) - 1 === parseInt(todayDate.split("/")[0], 10)) {
						dateName = tomorrow_locale;
					} else {
						dateName = dayNames[day];
					}
				}
				//and display it
				item.parent().find(".date-string").text(dateName + " " + selectedDay + " " + monthNames[selectedMonth - 1] + " " + selectedYear + ".");
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

/**
 * Manages the drag and drop functionality between 2 lists
 *
 * @author Achilleas Tsoumitas
 */
var DragndropListManager = (function() {

	"use strict";

	var instantiated;

	$(document).ready(function() {

		/**
		 * Enables the drag list
		 */
		$(".list.drag li").draggable({
			containment: $(this).parent().parent(),
			cursor: "move",
			zIndex: 2700,
			snap: $(".drag, .drop"),
			helper: "clone",
			drag: function(event, ui) {
				console.log(ui);
				// $(ui.helper[0]).addClass("selected");
				// if ($(ui.helper[0]).hasClass("selected")) {
					var length = $(".drag li.selected").length - 1;
					$(".ui-draggable-dragging.selected a").text(length + " " + beneficiaries_locale);
				// }
			}
		});

		/**
		 * Enables the drop list
		 */
		$(".list.drop").droppable({
			activeClass: 'ui-state-highlight-droparea',
			hoverClass: 'drophover',
			drop: function(event, ui) {
				if (ui.draggable.hasClass("selected")) {
					$(".drag li.selected:visible").each(function() {
						var html = $('<div>').append($(this).clone()).remove().html();
						$(".drop").append(html);
						$(".drop li:last").attr("id", "item-" + $(this).index());
						$(".drop li:last").removeClass("selected").find(".actions").removeClass("hidden");
					});
					$(".drag li.selected:visible").draggable("disable");
					$(".drag li.selected:visible").addClass("disabled");
					$(".ui-draggable-dragging").remove();
					//
					$(".drag li.selected:visible").removeClass("selected");
				} else {
					var html = $('<div>').append(ui.draggable.clone()).remove().html();
					$(this).append(html);
					$(this).children("li:last").attr("id", "item-" + ui.draggable.index()).find(".actions").removeClass("hidden");
					ui.draggable.draggable("disable");
					ui.draggable.addClass("disabled");
				}
				//show all deletes
				//$(this).find(".actions").removeClass("hidden");
				$(this).parent().find('.validation-error').remove();
			}
		});

		/**
		 * Remove an element from the drop list
		 *
		 */
		$("body").on("click", ".list li .actions .delete", function() {
			if ($(this).closest("li").attr("id")) {
				var id = $(this).closest("li").attr("id").split("-")[1];
				$(".list.drag li:eq(" + id + ")").draggable("enable").removeClass("disabled");
				$(this).closest("li").remove();
			}
		});
	});

	function initialize() {

		return {

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

/**
 * A group of functions that allow us to extract info from dsq-dialogs (dropdowns and tooltips)
 *
 * @author Alexandros Sotiralis
 */
var DSQDialogUtilities = (function() {

	"use strict";

	var instantiated;

	function initialize() {

		return {
			/**
			 * Returns the index of the li in which the supplied value is contained.
			 * If the value is not found within the items of the dsq dialog, then -1
			 * is returned.
			 *
			 * @param  {String} id     The id of the dsq dialog
			 * @param  {String} value  The value we are searching for in the dsq dialog
			 * @return {Number}
			 */

			findValueIndex: function(id, value) {
				var result = -1;
				$("#" + id + " li").each(function(index) {
					if (value === $(this).find('span.hidden-value').text()) {
						result = index;
						return false; //breaking out from each loop
					}
				});
				return result;
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

/**
 * Manages the enter keypress
 *
 * @author Achilleas Tsoumitas
 */
var EnterKeyManager = (function() {

	"use strict";

	var instantiated;

	$(document).ready(function() {
		/**
		 * On enter keystroke, do the correct action
		 *
		 * @param  {event} event
		 */
		$("body").on("keydown", function(event) {
			if (event.keyCode === 13 && !$("body").hasClass("disable-enter-submit")) {
				event.preventDefault();

				var focusedElement = $("#" + document.activeElement.id);

				//blur the focused element so that any ajax requests are called
				focusedElement.trigger("blur");

				// if the focused element is inside a modal
				if ($(".cyber-receipt-message, .dialog-message").is(":visible")) {
					// $(".dialog-message:visible").find(".button:visible:first").click();
					$(".cyber-receipt-message:visible, .dialog-message:visible").find(".button:visible:first").trigger('click');
				} else if ($(".is-tooltip").is(":visible")) {
					$(".is-tooltip:visible").find(".button:visible:first").click();
				} else if (focusedElement.closest("form").length) {
					// if a the focused element is inside a form, submit that form
					focusedElement.closest("form").submit();
				} else if ($("form:visible:first input[type=submit]:visible:not(:disabled)").length) {
					$("form:visible:first").submit();
				}
			}
		});
	});

	function initialize() {

		return {

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

/**
 * An special tooltip created for the payments page
 *
 * @author  Achilleas Tsoumitas
 */
var Infotip;

(function() {

	"use strict";

	/**
	 * An info tooltip
	 */
	Infotip = function() {};

	/**
	 * The id of the infotip
	 * @type {String}
	 */
	Infotip.prototype.id = "";

	/**
	 * The infotip's timer that will eventually remove it (set with setTimeout)
	 * @type {Number}
	 */
	Infotip.prototype.timer = "";

	/**
	 * Initialize the info tip.
	 * Add its markup, set its timer, attach events
	 *
	 * setTimeout has a problem with this, documented here
	 * https://developer.mozilla.org/en/DOM/window.setTimeout
	 *
	 * @param  {Number} timeout The time (in ms) that the tooltip will appear
	 */
	Infotip.prototype.initialize = function(iconMarkup, arrowMarkup, timeout) {
		// Append the markup
		$("#" + this.id).append(iconMarkup);
		$("#" + this.id).append(arrowMarkup);
		// Close after timeout secs
		// avoid the "this" problem
		var object = this;
		this.timer = setTimeout(function() {
			object.remove();
		}, timeout);
		// Remove on click, mouseout event
		$("#" + this.id).closest("fieldset").on("click", ".label", function() {
			object.remove();
		});
		// Remove on tooltip mouseout
		$("#" + this.id).closest("fieldset").on("click, mouseout", "#" + this.id, function() {
			object.remove();
		});
		// Dont remove (stop timer) while hovering
		$("#" + this.id).closest("fieldset").on("mouseover", "#" + this.id, function() {
			clearTimeout(object.timer);
		});
	};

	/**
	 * Remove the infotip and clear its timer
	 * @return {[type]} [description]
	 */
	Infotip.prototype.remove = function() {
		$("#" + this.id).remove();
		clearTimeout(this.timer);
	};

}());

/**
 * Controls (makes possible) the keybard navigation
 *
 * @author Achilleas Tsoumitas
 */
var KeyboardNavigation = (function() {

	"use strict";

	var instantiated;

	var focusedItem = "";

	$(document).ready(function() {
		//on lists focus
		$("body").on("focus", "ul.list", function() {
			focusedItem = $(this);
			$(".dsq-dialog:not(.is-tooltip)").slideUp().removeClass('open');
		});
		//on input focus
		$("body").on("focus", "input:not(:checkbox)", function() {
			focusedItem = $(this);
			//closes dsq-dialogs when you press tab button to move to next focusable item
			$(".dsq-dialog:not(.is-tooltip)").slideUp().removeClass('open');
		});

		//on dropdowns focus (we put tabIndex on div, because ul is hidden and label tabIndex is not working)
		$("body").on("focus", "div.dsq-dialog-container", function(event) {
			/*var this_id = $(this).find("ul.dsq-dialog").attr("id");
			if(focusedItem != ""){
				var focusedItem_id = focusedItem.attr("id");
			}else{
				var focusedItem_id = "";
			}*/
			if ($(this).find("ul.dsq-dialog").length > 0) { // && focusedItem_id != this_id){
				focusedItem = $(this).find("ul.dsq-dialog");
				//close other dialogs
				//$(".dsq-dialog").slideUp().removeClass('open');
				//open this one
				if (!focusedItem.next().hasClass("open")) {
					//if its very big, display without animation, so that we can made overflow scrollable
					if ($(this).find("ul.dsq-dialog li").length > 20) {
						focusedItem.css("display", "block").addClass('open');
						$(this).find("ul.dsq-dialog").css("overflow-y", "scroll");
					} else {
						focusedItem.slideDown().addClass('open');
					}
				}
			}
		});

		$("body").on("keydown", ".list, .dsq-dialog-container", function(e) {
			if (e.keyCode === 37) {
				//alert( "left pressed" );
				return true;
			} else if (e.keyCode === 38) {
				//if out list has selected item
				var prevItem;
				if (!focusedItem.hasClass("closed")) {
					if (focusedItem.children("li").hasClass("selected")) {
						//if selected item is not the first one, move northern
						if (!focusedItem.children("li.selected").is(':first-child')) {
							//propose prev item
							prevItem = focusedItem.children("li.selected").prev();
							focusPrev(prevItem);
						}
					} else {
						//if none is already selected, focus the last one
						prevItem = focusedItem.children("li:last");
						focusPrev(prevItem);
					}
				}
				return false;
			} else if (e.keyCode === 39) {
				//alert( "left pressed" );
				return true;
				//on key down
			} else if (e.keyCode === 40) {
				//if out list has selected item
				var nextItem;
				if (!focusedItem.hasClass("closed")) {
					if (focusedItem.children("li").hasClass("selected")) {
						//if selected item is not the last one, move southern
						if (!focusedItem.children("li.selected").is(':last-child')) {
							//propose next item
							nextItem = focusedItem.children("li.selected").next();
							focusNext(nextItem);
						}
					} else {
						//if none is already selected, focus the first one
						nextItem = focusedItem.children("li:first");
						focusNext(nextItem);
					}
				}
				return false;
			}
		});

		function focusNext(nextItem) {
			//next item we received may be hidden, so loop
			for (var i = 0; i < 100; i++) {
				if (nextItem.is(':visible')) {
					focusedItem.children("li.selected").removeClass("selected");
					nextItem.addClass("selected");
					break;
				} else {
					//go to next item
					nextItem = nextItem.next();
				}
			}
			//send click event
			var event = jQuery.Event("click");
			event.inputMethod = "keyboard";
			focusedItem.children("li.selected").trigger(event);
			//move scrollbar
			var itemsNumber = focusedItem.height() / focusedItem.children("li").innerHeight();
			if (focusedItem.children("li.selected").index() + 1 > itemsNumber) {
				var scroll = focusedItem.children("li").outerHeight() + focusedItem.scrollTop();
				focusedItem.scrollTop(scroll);
			}
		}

		function focusPrev(prevItem) {
			//previous item may be hidden, so loop
			for (var i = 0; i < 100; i++) {
				if (prevItem.is(':visible')) {
					focusedItem.children("li.selected").removeClass("selected");
					prevItem.addClass("selected");
					break;
				} else {
					//go to previous item
					prevItem = prevItem.prev();
				}
			}
			//send click event
			var event = jQuery.Event("click");
			event.inputMethod = "keyboard";
			focusedItem.children("li.selected").trigger(event);
			//move scrollbar
			var itemsNumber = focusedItem.height() / focusedItem.children("li").innerHeight();
			if (focusedItem.children("li.selected").index() < focusedItem.children("li").length - itemsNumber) {
				var scroll = focusedItem.scrollTop() - focusedItem.children("li").outerHeight();
				focusedItem.scrollTop(scroll);
			}
		}

		/**
		 * Slider functionality (used in create time deposit)
		 * @param  {event} e
		 * @return {Boolean}   We always prevent default action
		 */
		$("body").on("keydown", ".slider", function(e) {
			var steps = $(this).find(".slider-step").length;
			var current_value, new_value;
			if (e.keyCode === 37) {
				//alert( "left pressed" );
				current_value = $(this).slider("option", "value");
				if (current_value !== 0) {
					new_value = parseInt(current_value, 10) - 1;
					$(this).slider("option", "value", new_value);
				}
				return false;
			} else if (e.keyCode === 38) {
				return false;
			} else if (e.keyCode === 39) {
				current_value = $(this).slider("option", "value");
				if (current_value !== steps - 1) {
					new_value = parseInt(current_value, 10) + 1;
					$(this).slider("option", "value", new_value);
				}
				return false;
				//on key down
			} else if (e.keyCode === 40) {
				return false;
			}
		});

	});

	function initialize() {

		return {
			focusedItem: focusedItem
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

/**
 * Resizes labels font when needed
 *
 * @author Achilleas Tsoumitas
 */
var LabelSizeManager = (function() {

	"use strict";
	var instantiated;

	$(document).ready(function() {
		/**
		 * Fixes the problem with big labels
		 */
		$(".utility-company-fields .label").each(function() {
			var parent = $(this).parent(".utility-company-fields");
			LabelSizeManager.getInstance().wrapLongWords(this);
			LabelSizeManager.getInstance().adjustSize(this, parent);
		});
		$("fieldset.step .label:not(.dont-adjust-size)").each(function() {
			var parent = $(this).closest("fieldset.step");
			LabelSizeManager.getInstance().adjustSize(this, parent);
		});
		/**
		 * Resizes labels in pages without fieldsets
		 */
		$(".no-step-guide .step .content .label label").each(function() {
			if ($(this).text().length > 22) {
				$(this).css("font-size", "10px");
			}
		});
	});

	function initialize() {

		return {
			/**
			 * Resizes the font according to the label size
			 *
			 * @param  {String} selector The selector of the label to resize
			 * @param  {HTMLElement} parent   Its parent
			 */
			adjustSize: function(selector, parent) {
				var changedDisplay = false;
				if (parent.css("display") === "none") {
					parent.css("display", "block");
					changedDisplay = true;
				}
				if ($(selector).height() > 20) {
					$(selector).addClass("big-label-font-resize").addClass("big-label-position-reset");
					if ($(selector).height() > 32) {
						$(selector).addClass("big-label-font-resize-max");
					}
				}
				if ($(selector).height() < 20 && $(selector).height() !== 0) {
					$(selector).removeClass("big-label-position-reset");
				}
				if (changedDisplay) {
					parent.css("display", "none");
				}
			},
			wrapLongWords: function(selector) {

				var labelText = $(selector).find("label").text();

				if (labelText.length > 15 && labelText.match(/ /g) === null) {

					labelText = labelText.substring(0, 15) + "-<br />" + labelText.substring(15, labelText.length);
					$(selector).find("label").html(labelText);
				}
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

/**
 * Manages mainly list events
 *
 * @author Achilleas Tsoumitas
 */
var ListManager = (function() {

	//"use strict";
	var instantiated;

	$(document).ready(function() {

		/**
		 * Save the scroll for lists. Important. live (on) events dones not work with scroll
		 */
		$(".list:not(.resizable)").scroll(function() {
			scroll.add(scroll.save($(this).attr("id")));
		});

		/**
		 * Lists on click
		 */
		$("body").on("click", ".list li:not(.non-selectable)", function(event) {
			listClickCallback(event);
		});

		/*$("body").on("mousedown", ".list.dragndrop li:not(.non-selectable)", function(event) {
			listClickCallback(event);
		});*/

		function listClickCallback(event) {
			var oldIndex = $(event.currentTarget).closest("ul").find("li.selected").index();

			var continueClick;
			if (typeof(listAllowClick) !== "undefined") {
				continueClick = listAllowClick($(event.currentTarget).closest(".list").attr("id"), $(event.currentTarget).index(), oldIndex, $(this).attr("class"));
			}
			
			if (!continueClick) {
				continueClick = ListManager.getInstance().listAllowClick($(event.currentTarget).closest(".list").attr("id"), $(event.currentTarget).index(), oldIndex, $(this).attr("class"));
			}

			if (continueClick) {


				// if we have a drag or drop list
				if ($(event.currentTarget).parent().hasClass("drag") || $(event.currentTarget).parent().hasClass("drop")) {
					if ($(event.currentTarget).parent().hasClass("drag") && $(event.currentTarget).hasClass("selected")) {
						$(event.currentTarget).removeClass("selected");
					} else if (!$(event.currentTarget).parent().hasClass("drag")) {
						$(event.currentTarget).siblings().removeClass("selected");
					} else if (!$(event.currentTarget).parent().hasClass("drop") && !$(event.currentTarget).hasClass("disabled")) {
						$(event.currentTarget).addClass("selected");
					}
				} else {
					$(event.currentTarget).siblings().removeClass("selected");
					$(event.currentTarget).addClass("selected");
				}



				//$(event.currentTarget).siblings().removeClass("selected");
				//$(event.currentTarget).addClass("selected");
				if ($(event.currentTarget).hasClass("filter")) {
					$(event.currentTarget).find(".input-filter").focus();
				}

				$(event.currentTarget).parent().parent().find("span.validation-error:not(.compare_numbers, .not_zero, .invalid_amount)").remove();

				updateStepCompletion();

				//scroll the lists only if the event is by user and not by restore
				if (!event.restore && !event.emulated) {
					if ($(event.currentTarget).closest(".list").hasClass("resizable")) {
						$(event.currentTarget).closest(".list").removeClass("resizable");
						//and let it scroll to the selected item
					} else {
						//save scroll
						scroll.add(scroll.save($(event.currentTarget).closest(".list").attr("id")));
					}
				} else if (event.emulated) {
					scroll.reset([$(event.currentTarget).closest(".list").attr("id")]);
					scroll.goScroll([$(event.currentTarget).closest(".list").attr("id")]);
				}

				//if list_clicked is defined, we call it, with list id and li index params
				if (typeof(list_clicked) !== "undefined") {
					list_clicked($(event.currentTarget).closest(".list").attr("id"), $(event.currentTarget).index(), oldIndex);
				}
				ListManager.getInstance().clicked($(event.currentTarget).closest(".list").attr("id"), $(event.currentTarget).index(), oldIndex);
			} 
			
			//also save the values in public attributes
			//mainly useful when continueClick = false
			ListManager.getInstance().id = $(event.currentTarget).closest(".list").attr("id");
			ListManager.getInstance().index = $(event.currentTarget).index();
			ListManager.getInstance().oldIndex = oldIndex;
			ListManager.getInstance().classes = $(this).attr("class");
		}

		/**
		 * List actions on click
		 */
		$("body").on("click", ".list li:not(.non-selectable) .actions a", function(event) {

			var oldIndex = $(this).closest(".list").find("li.selected").index();

			var continueClick = true;
			if (typeof(listAllowClick) !== "undefined") {
				continueClick = listAllowClick($(this).closest(".list").attr("id"), $(this).index(), oldIndex);
			}

			if (continueClick) {

				//select the clicked li only
				$(this).closest(".list").find("li").removeClass("selected");
				$(this).closest("li").addClass("selected");

				if (typeof(list_action_clicked) !== "undefined") {
					list_action_clicked($(this).closest(".list").attr("id"), $(this).closest("li").index(), oldIndex, $(this).attr("class"));
				}
				ListManager.getInstance().actionClicked($(this).closest(".list").attr("id"), $(this).closest("li").index(), oldIndex, $(this).attr("class"));
			}
			event.stopPropagation();
		});

		/**
		 * Trigger click event on list that are single preselect and have only 1 li
		 */
		$(".list.single-preselect").each(function() {
			if ($(this).find("li").length === 1) {
				var element = $(this).find("li");
				setTimeout(function() {
					element.trigger("click");
				}, 100);
			}
		});

		/**
		 * Makes steps with lists active. ITS NOT COMPLETE
		 */

		function updateStepCompletion() {
			for (var i = 1; i < 7; i++) {
				if ($("#step-" + i + " .list li").hasClass("selected")) {
					$("#step-" + i).addClass("active");
				}
			}
		}

		/**
		 * List filtering
		 */
		$("body").on("keyup", ".input-filter", function() {
			var input = $(this).val();
			$(this).parent().parent().children("li:not(:first)").each(function() {
				if ($(this).hasClass('filter-dont-show')) {
					$(this).slideUp();
					//continue with next iteration of each loop
					return;
				}
				//do the freaking search
				var text = $(this).find("*:not(.hidden-value)").text();
				// console.log(input);
				var regex = new RegExp(input, "i");
				if (regex.test(text)) {
					$(this).slideDown();
				} else {
					$(this).slideUp();
				}
			});
			setTimeout(function() {
				MainPageHeightManager.getInstance().fixHeight();
			}, 500);
		});

		/**
		 * Clear filter button
		 */
		$("body").on("click", ".clear-filter", function() {
			$(this).prev().val("");
			var event = jQuery.Event("keyup");
			$(this).parent().find(".input-filter").trigger(event);
			setTimeout(function() {
				MainPageHeightManager.getInstance().fixHeight();
			}, 500);
		});
	});

	function initialize() {

		return {
			id: "",
			index: "",
			oldIndex: "",
			classes: "",
			/**
			 * A callback called when a list li is clicked
			 * @param  {String} id       The id of the list that was clicked
			 * @param  {Number} index    The index of the clicked li
			 * @param  {Number} oldIndex The index of the previously selected li
			 */
			clicked: function(id, index, oldIndex) {

			},
			/**
			 * A callback called when an action is clicked
			 * @param  {String} id       The id of the list that was clicked
			 * @param  {Number} index    The index of the clicked li
			 * @param  {Number} oldIndex The index of the previously selected li
			 * @param  {String} classes  The classes of the action clicked, so we can identify which action was clicked when an li has more than 1 actions
			 */
			actionClicked: function(id, index, oldIndex, classes) {

			},
			/**
			 * A callback called when a list li is clicked and defines if we should continue with the click action
			 * @param  {String} id       The id of the list that was clicked
			 * @param  {Number} index    The index of the clicked li
			 * @param  {Number} oldIndex The index of the previously selected li
			 * @param  {String} classes  The classes of the action clicked, so we can identify which action was clicked when an li has more than 1 actions
			 */
			listAllowClick: function(id, index, oldIndex, classes) {
				return true;
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

/**
 * A group of functions that allow us to extract info from lists
 *
 * @author Achilleas Tsoumitas
 */
var ListUtilities = (function() {

	"use strict";

	var instantiated;

	function initialize() {

		return {
			/**
			 * A function the finds the account number of the selected or specified li of a list
			 *
			 * @param  {String} id    The id of the list
			 * @param  {Number} index The index of the li we want to find its account number. If its -1, the selected li will be scanned
			 * @return {String}       The account number found
			 */
			findAccountNumber: function(id, index) {
				var txt, accountNumber, temp;

				if (index !== -1) {
					txt = $("#" + id + " li:eq(" + index + ") a").html();
				} else {
					txt = $("#" + id + " li.selected a").html();
				}

				if (txt) {

					//if it has a nickname, it has a parenthesis, else, has no nickname
					if (txt.search(/\(/i) === -1) {
						//check if we also found markup, most probably the account has a product too
						if (txt.indexOf("<") !== -1) {
							temp = txt.split("<");
							accountNumber = temp[0];
						} else {
							accountNumber = txt;
						}
					} else {
						temp = txt.split("(");
						accountNumber = temp[1].split(")")[0];
					}

					return accountNumber;
				} else {
					return "";
				}
			},
			/**
			 * Finds the account nickname given a list id and an index
			 * @param  {String} id    The id of the list
			 * @param  {Number} index The index of the li we want to search for. If -1 is used, the selected one will be used
			 * @return {String}       The nickname found
			 */
			findAccountNickname: function(id, index) {
				var nickname;
				if (index !== -1) {
					nickname = $("#" + id + " li:eq(" + index + ") .nickname").text();
				} else {
					nickname = $("#" + id + " li.selected .nickname").text();
				}

				// if nickname is not found, try to find it from the markup
				if (!nickname) {
					//this functionality is not needed for now. If someone needs it, plz add the necessary code here
					//following what is done on the findAccountNumber function
					void(0);
				}

				return nickname;
			},
			/**
			 * Finds the account currency
			 * @param  {String} id    The id of the list
			 * @param  {Number} index The index of the li we want to search for. If -1 is used, the selected one will be used
			 * @return {String}       The currency found
			 */
			findAccountCurrency: function(id, index) {
				var currency = "";
				var classes;
				if (index !== -1) {
					classes = $("#" + id + " li:eq(" + index + ")").attr("class").split(" ");
				} else {
					classes = $("#" + id + " li.selected").attr("class").split(" ");
				}
				for (var i = 0; i < classes.length; i++) {
					if (classes[i].substring(0, 8) === "currency") {
						currency = classes[i].split("-")[1];
					}
				}
				return currency;
			},
			/**
			 * Finds the account type
			 * @param  {String} id    The id of the list
			 * @param  {Number} index The index of the li we want to search for. If -1 is used, the selected one will be used
			 * @return {String}       The currency found
			 */
			findAccountType: function(id, index) {
				var type = "";
				var classes;
				if (index !== -1) {
					classes = $("#" + id + " li:eq(" + index + ")").attr("class").split(" ");
				} else {
					classes = $("#" + id + " li.selected").attr("class").split(" ");
				}
				for (var i = 0; i < classes.length; i++) {
					if (classes[i].substring(0, 8) !== 'currency' && classes[i] !== "selected" && classes[i] !== "available-for-mobile") {
						type = classes[i];
					}
				}
			},
			/**
			 * Finds the account index
			 * @param  {String} id            The id of the list
			 * @param  {String} accountNumber The account number that we want to search for
			 * @return {Number}               The index that has this account number
			 */
			findAccountIndex: function(id, accountNumber) {
				var i = 0;
				var result = -1;
				$("#" + id + " li").each(function() {
					var number = ListUtilities.getInstance().findAccountNumber(id, i);
					if (number === accountNumber && result === -1) {
						result = i;
					}
					i++;
				});

				return result;
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

/**
 * object used for hiding/displaying items in a list (targetList)
 * based on the selected element of an other list (controllerList).
 * 
 * 
 * Css classes available for target list:
 * 	'owner-separator' : A target list item that does not contain info, but it is
 * 						a separator element. Li that have this class will be hidden
 * 						only if their section does not contain any visible li.
 * 						Eg if next visible element is an other separator.
 *  'owner-dont-hide' : Li that have this class will never be hidden.
 *  					Eg select-all type of element.
 *  'owner-'+xxx	  : Where xxx is an id of the elements that belong to a certain
 *  					group. This elements will be visible only if the xxx group is
 *  					selected to be displayed.
 *  					Eg for a list of accounts, each account may belong to a user.
 *  					Each account will have a class of 'owner-'+someId, where someId is a
 *  					value indicating the owner of this account. When we want to display
 *  					only the accounts of this user, then all account li that do not have
 *  					this class ('owner-'+someId) will be hidden.
 *  For an example of how these classes are used, you can see the account list in MyPortfolio page
 *  
 *  
 *  A callback function is available (can be overridden) if we need to perform any extra action 
 *  after the hide/show animations have completed on the elements of the target list. 
 *  
 */
var ListVisibilityManager;

(function() {

	"use strict";

	ListVisibilityManager = {
			
		/**
		 * Hides all items of a list that do not belong to the accountOwner supplied 
		 * (all li that do not have a class of 'owner-'+accountOwner )
		 * @param  {String} accountOwner    The id of the account owner that was selected
		 * @param  {String} targetListId 	The id of the list whose elements we want to display/hide
		 */
		updateTargetList: function(accountOwner, targetListId) {
			var callback = this.callback;

			if (accountOwner === 'ALL') {
				if ($('#' + targetListId).is(':visible')) {
					$("#" + targetListId + " li").slideDown();
					$("#" + targetListId + " li").promise().done(function() {
						mainHeightFix(true);
						callback(accountOwner, targetListId);
					});
				} else {
					$("#" + targetListId + " li").css('display', 'block');
				}
			} else {
				var $elementsToDisplay = $();
				var $elementsToHide = $();

				var $lastSeparator;
				var hideLastSeparator = false;
				$('#' + targetListId + ' li').each(function() {

					if ($(this).hasClass('owner-separator')) {
						if (hideLastSeparator) {
							$elementsToHide = $elementsToHide.add($lastSeparator);
						} else {
							if ($lastSeparator) {
								$elementsToDisplay = $elementsToDisplay.add($lastSeparator);
							}
						}

						$lastSeparator = $(this);
						hideLastSeparator = true;
					} else if ($(this).hasClass('owner-dont-hide')) {
						hideLastSeparator = false;
						$elementsToDisplay = $elementsToDisplay.add($(this));
					} else if ($(this).hasClass('owner-' + accountOwner)) {
						hideLastSeparator = false;
						$elementsToDisplay = $elementsToDisplay.add($(this));
					} else {
						$elementsToHide = $elementsToHide.add($(this));
					}
				});
				if ($lastSeparator) {
					if (hideLastSeparator) {
						$elementsToHide = $elementsToHide.add($lastSeparator);
					} else {
						$elementsToDisplay = $elementsToDisplay.add($lastSeparator);
					}
				}

				if ($('#' + targetListId).is(':visible')) {
					$elementsToHide.removeClass('selected').slideUp();
					$elementsToDisplay.slideDown();
					$elementsToHide.add($elementsToDisplay).promise().done(function() {
						mainHeightFix(true);
						callback(accountOwner, targetListId);
					});
				} else {
					$elementsToHide.removeClass('selected').css('display', 'none');
					$elementsToDisplay.css('display', 'block');
				}
			}
		},
		
		callback: function() {

		},
		
		/**
		 * In a page where we have a controller list ( eg account owner dsq dialog )
		 * and a target list (eg account list). If some items of the account list are 
		 * no longer available to the user (eg because the account list was updated through
		 * an AJAX call) we need to hide the respective controller list values. 
		 * 
		 * Eg in the controller list we have the options: owner1, owner2 (accounts exist for these owners
		 * at the target list). Suppose we are updating the target list, so that no account of 
		 * owner2 are available in the list. Now we need to remove the owner2 option from the 
		 * controller list. This is what this function does.
		 * 
		 * 
		 * This function iterates through the elements of the controller list. For each owner
		 * it finds, it looks at the target list to find out whether there are available elements
		 * of this owner. If no elements of this owner are found, then this owner option is hidden.
		 * If the only available options left in the controller list are 'ALL' and self elements, then
		 * the controller list is hidden as well.
		 * 
		 * 
		 * Css classes available for controller list:
		 *  'target-list-id'		: the id of the target list that is controlled through this controller list
		 *  'own-accounts-owner'	: the id of the basic owner (the user that has logged in)
		 * See account_owner_filter.jsp
		 * 
		 * 
		 * @param  {String} controllerListId    The id of the controller list
		 * @param  {String} targetListId 		The id of the target list
		 */
		filterControllerList: function(controllerListId, targetListId) {
			var ownAccountsOwner = $('#' + controllerListId).parent().find('.hidden-value.own-accounts-owner').text();

			var elementsToDisplay = $();
			var elementsToHide = $();

			var accountOwner;
			var containsOwnAccountsOption = false;
			$('#' + controllerListId + ' li').each(function() {
				accountOwner = $(this).find('.hidden-value.account-owner').text();

				if (accountOwner === 'ALL') {
					elementsToDisplay = elementsToDisplay.add($(this));
				} else if ($('#' + targetListId + ' li.owner-' + accountOwner).length > 0) {
					elementsToDisplay = elementsToDisplay.add($(this));
					if (accountOwner === ownAccountsOwner) {
						containsOwnAccountsOption = true;
					}
				} else {
					elementsToHide = elementsToHide.add($(this));
				}

			});

			var elementsToDisplayLength = elementsToDisplay.length;
			//			elementsToDisplayLength = $('#from-account-list li:visible').length;
			//			alert(elementsToDisplayLength);
			if (elementsToDisplayLength < 2 || //nothing or only ALL
			(elementsToDisplayLength === 2 && containsOwnAccountsOption)) { //ALL and own accounts
				if ($('#' + controllerListId).is(':visible')) {
					$('#' + controllerListId).parent().parent().slideUp();
				} else {
					$('#' + controllerListId).parent().parent().css('display', 'none');
				}
			} else {
				if ($('#' + controllerListId).is(':visible')) {
					//$('#' +controllerListId).parent().parent().slideDown();
					elementsToDisplay.slideDown();
					elementsToHide.removeClass('selected').slideUp();
				} else {
					$('#' + controllerListId).parent().parent().slideDown();
					elementsToDisplay.css('display', 'block');
					elementsToHide.removeClass('selected').css('display', 'none');
				}
			}
		}
	};

	$(document).ready(function() {
		$('body').on('click', '.owner-list li', function() {
			var controllerList = $(this).parent();
			var controllerListContainer = controllerList.parent();

			var accountOwner = $(this).find('.hidden-value.account-owner').text();
			var targetListId = controllerListContainer.find('.hidden-value.target-list-id').text();

			ListVisibilityManager.updateTargetList(accountOwner, targetListId);
		});
	});

}());

/**
 * An object that counts the remaining time for automatic logout
 *
 * @author Achilleas Tsoumitas
 */
var LogoutTimer = (function() {

	"use strict";

	var instantiated;

	var setIntervalTimer;

	/**
	 * Makes the actual counting
	 */

	function count() {
		if (LogoutTimer.getInstance().secondsRemaining > 0) {
			LogoutTimer.getInstance().secondsRemaining--;
			//the timer will appear at 120 seconds
			if (LogoutTimer.getInstance().secondsRemaining === 120) {
				$("#top-menu .soon").removeClass("transparent hidden");
			}
			//since its no visible, we must format it and display it
			if (LogoutTimer.getInstance().secondsRemaining <= 120) {
				var minutes = parseInt(LogoutTimer.getInstance().secondsRemaining / 60, 10);
				var seconds = LogoutTimer.getInstance().secondsRemaining - minutes * 60;
				if (minutes < 10) {
					minutes = "0" + minutes;
				}
				if (seconds < 10) {
					seconds = "0" + seconds;
				}

				var temp = $("#top-menu .soon").text().split(" ");

				$("#top-menu .soon").text(minutes + ":" + seconds + " " + temp[1]);
				if (LogoutTimer.getInstance().secondsRemaining === 0) {
					clearTimeout(setIntervalTimer);
				}
			}
		}
	}

	function initialize() {

		return {
			"secondsRemaining": 0,
			/**
			 * Starts the countdown
			 */
			start: function() {
				setIntervalTimer = setInterval(function() {
					count();
				}, 1000);
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

/**
 * Resizes the #main element of the page to fit with the height of the sidebar
 *
 * @author Achilleas Tsoumitas
 */
var MainPageHeightManager = (function() {

	"use strict";

	var instantiated;

	function initialize() {

		return {
			/**
			 * Fixes the problem with some pages not having #main as long as #side is
			 *
			 * @param  {Boolean} heightAuto If we want to set the height back to auto
			 */
			fixHeight: function(heightAuto) {
				// find last visible fieldset
				var selector = "";
				var visibleFieldsets = $(".form fieldset:visible").not(".buttons");
				if (visibleFieldsets.length === 0 || (visibleFieldsets.closest(".form").parent().next().length > 0 && visibleFieldsets.closest(".form").parent().next().is(":visible"))) {
					selector = $("#main");
				} else {
					selector = $(".form fieldset:visible:not(.buttons):last");
				}

				$(".modified-height").height("auto").removeClass("modified-height");
				var mainHeight = $("#main").height();
				var sideHeight = $("#side").height();
				var diff = sideHeight - mainHeight;

				//if size smaller, increase it
				if (diff > 15) {
					var currentHeight = selector.height();
					if (selector.attr("id") !== $("#main").attr("id") && selector.find(".content").length > 0) {
						selector.find(".content").height(currentHeight + diff - 10).addClass("modified-height");
					} else {
						selector.height(currentHeight + diff - 10).addClass("modified-height");
					}
				} else {
					$(".modified-height").height("auto").removeClass("modified-height");
				}
			},

			/**
			 * Reset the modified height
			 */
			resetHeight: function() {
				$(".modified-height").height("auto").removeClass("modified-height");
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

/**
 * Controls fields with max amount limit
 */
var MaxAmountCheckboxManager = (function() {

	"use strict";

	var instantiated;

	$(document).ready(function() {

		//on click, apply limit, remove errors
		$("body").on("click", ".apply-limit", function(event) {
			MaxAmountCheckboxManager.getInstance().applyLimit(event);
		});

		//cant be over max amount
		$("body").on("keyup", ".has-limit", function() {
			var maxAmount = AmountUtilities.getInstance().amountToNumber($(this).closest(".fields, td").find(".max-amount").text());
			//if he changed the value from max amount limit, remove checkbox
			if (AmountUtilities.getInstance().amountToNumber($(this).val()) !== maxAmount) {
				$(this).closest(".fields, td").find(".apply-limit").removeAttr("checked");
				$(this).closest(".fields, td").find(".apply-limit").next().removeClass("ui-state-active");
			}
		});

		//on blur, do the validations
		$("body").on("blur", ".has-limit", function(event) {
			MaxAmountCheckboxManager.getInstance().validateAmount(event);
		});
	});

	function initialize() {

		return {
			applyLimit: function(event) {
				var maxAmount = $(event.currentTarget).closest(".fields, td").find(".max-amount").text();
				$(event.currentTarget).closest(".fields, td").find(".has-limit").val(maxAmount);
				$(event.currentTarget).closest(".fields, td").find(".validation-error").remove();
			},
			validateAmount: function(event) {
				var maxAmount = $(event.currentTarget).closest(".fields, td").find(".max-amount").text();
				//validate amount
				var validations = [
					[$(event.currentTarget), "not_zero", "amount_zero"],
					[
						[$(event.currentTarget), "max", maxAmount], "compare_numbers", "amount_over_limit"],
					[$(event.currentTarget), "valid_amount", "invalid_amount"],
					[$(event.currentTarget), "not_empty", "not_empty"]
				];
				var validator = new Validator();

				var showErrors = true;
				if (!$(event.currentTarget).closest(".fields").length) {
					showErrors = false;
				}
				var status = validator.validate(validations, false, showErrors);
				//add/remove class active
				if (status) {
					$(event.currentTarget).closest(".step").addClass("active");
					$(event.currentTarget).closest(".step").find(".validation-error").remove();
				} else {
					$(event.currentTarget).closest(".step").removeClass("active");
					//
					if (!showErrors) {
						var lastError = validator.errors[validator.errors.length - 1];
						validator.displayError($(event.currentTarget).closest("td").find("label"), lastError.validationType, lastError.errorMessage);
					}
				}
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
						if ($(this).hasClass("full-modal")) {
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
						if ($(this).attr("disabled") !== "disabled" && $(this).attr("disabled") !== "true") {
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
							ModalManager.getInstance().errorsModal.closed(event, ui);
						}
					});
				},
				closed: function(event, ui) {

				}
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

/**
 * Provides date utilities
 */
var ODate;

(function() {
	"use strict";

	/**
	 * The constructor that also defines some default values
	 */
	ODate = function() {};

	/**
	 * Set defaults
	 */
	ODate.prototype._dateObject = new Date();

	ODate.prototype.dateFormat = "dd/mm/yyyy";

	ODate.prototype.locale = "en";
	ODate.prototype.regional = {
		"en": {
			"dayNames": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			"dayNamesShort": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
			"monthNamesShort": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			"monthNames": ["January", "February", "March", "April", "May", "June", "July", "AUgust", "September", "October", "November", "December"]
		}
	};

	/**
	 * Updates the todayDate object
	 * @param {Number} year
	 * @param {Number} month
	 * @param {Number} day
	 */
	ODate.prototype.setToday = function(year, month, day) {
		this._dateObject = new Date(year, month, day);
	};

	/**
	 * Adds years, months and days to today. Negative numbers can also be used
	 * @param {Number} years  The years to add. Must be integer
	 * @param {Number} months The months to add. Must be integer
	 * @param {NUmber} days   The days to add. Must be integer
	 */
	ODate.prototype.date = function(years, months, days) {
		var yearsToAdd = years && parseInt(years, 10) || 0;
		var monthsToAdd = months && parseInt(months, 10) || 0;
		var daysToAdd = days && parseInt(days, 10) || 0;

		return this._formatDate(new Date(this._dateObject.getFullYear() + yearsToAdd, this._dateObject.getMonth() + monthsToAdd, this._dateObject.getDate() + daysToAdd));
	};

	/**
	 * Returns the days that the asked month has
	 * @param  {Number} month
	 * @param  {Number} year
	 * @return {Number}
	 */
	ODate.prototype.daysInMonth = function(month, year) {
		return 32 - new Date(year, month - 1, 32).getDate();
	};

	/**
	 * Returns a formatted date given a date object and the desired format
	 * @param  {Date} date A date object
	 * @return {String}            The formatted date
	 */
	ODate.prototype._formatDate = function(date) {

		var expressions = {
			"dddd": this.regional[this.locale].dayNames[date.getDay()],
			"ddd": this.regional[this.locale].dayNamesShort[date.getDay()],
			"dd": this._addZero(date.getDate()),
			"d": date.getDate(),
			"mmmm": this.regional[this.locale].monthNames[date.getMonth()],
			"mmm": this.regional[this.locale].monthNamesShort[date.getMonth() + 1],
			"mm": this._addZero(date.getMonth() + 1),
			"m": date.getMonth() + 1,
			"yyyy": date.getFullYear(),
			"yy": date.getFullYear().toString().substring(2, 4)
		};

		//create the regular expression to replace the dateformat with actual data
		//add the first one and the for loop for the rest
		var regEx = new RegExp("(dddd)", "g");
		var i = 0;
		for (var property in expressions) {
			if (expressions.hasOwnProperty(property)) {
				if (i > 0) {
					var temp = new RegExp(property, "g");
					regEx = new RegExp(regEx.source + "|(" + temp.source + ")", "g");
				}
				i++;
			}
		}

		/**
		 * Replaces the expressions found
		 */

		function convert(str, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, offset, s) {
			if (p1) {
				return expressions.dddd;
			} else if (p2) {
				return expressions.ddd;
			} else if (p3) {
				return expressions.dd;
			} else if (p4) {
				return expressions.d;
			} else if (p5) {
				return expressions.mmmm;
			} else if (p6) {
				return expressions.mmm;
			} else if (p7) {
				return expressions.mm;
			} else if (p8) {
				return expressions.m;
			} else if (p9) {
				return expressions.yyyy;
			} else if (p10) {
				return expressions.yy;
			}
		}

		return this.dateFormat.replace(regEx, convert);
	};

	/**
	 * Add a leeding zeros to numbers smaller than 10
	 * @param  {String} value
	 * @return {String}
	 */
	ODate.prototype._addZero = function(value) {
		var result;
		if (value < 10) {
			result = "0" + value;
		} else {
			result = value;
		}

		return result;
	};
}());

/**
 * Save State
 * Saves the current state of all ids on the page
 *
 * works by saving a big string that contains 3 values for each field
 * saves id, type, state
 *
 * Finally saves it into a string to submit it to the server
 */

function save_state() {
	var str = "";
	$("form input[type=text].save-state, form textarea.save-state").each(function() {
		var id = "#" + $(this).attr("id");
		str += id + "|input|" + $(this).val().replace(/"/g, '&quot;') + "~";
	});
	$("form span.save-state").each(function() {
		var id = "#" + $(this).attr("id");
		str += id + "|span|" + $(this).text().replace(/"/g, '&quot;') + "~";
	});
	$("form div.save-state").each(function() {
		var id = "#" + $(this).attr("id");
		str += id + "|div|" + $(this).text().replace(/"/g, '&quot;') + "~";
	});
	$("form a.save-state").each(function() {
		var id = "#" + $(this).attr("id");
		str += id + "|a|" + $(this).text().replace(/"/g, '&quot;') + "~";
	});
	$("form .save-disable").each(function() {
		var id = "#" + $(this).attr("id");
		if ($(this).attr("disabled") === undefined) {
			str += id + "|disable|false~";
		} else {
			str += id + "|disable|" + $(this).attr("disabled") + "~";
		}
	});
	$("form .save-html").each(function() {
		var id = "#" + $(this).attr("id");
		str += id + "|html|" + $(this).html().replace(/"/g, '&quot;') + "~";
	});
	$("form input[type=checkbox].save-state").each(function() {
		var id = "#" + $(this).attr("id");
		str += id + "|checkbox|" + $(this).is(":checked") + "~";
	});
	$("form .list.save-state").each(function() {
		var id = "#" + $(this).attr("id");
		str += id + "|list|" + $(this).find(".selected").index() + "~";
		str += id + "|scroll|" + $(this).scrollTop() + "~";
	});
	$("form .dsq-dialog.save-state").each(function() {
		var id = "#" + $(this).attr("id");
		str += id + "|dsq-dialog|" + $(this).find(".selected").index() + "~";
	});
	$("form .slider.save-state").each(function() {
		var id = "#" + $(this).attr("id");
		str += id + "|slider|" + $("#createTimeDeposit-duration-slider").slider("option", "value") + "~";
	});
	$("form .save-class").each(function() {
		var id = "#" + $(this).attr("id");
		str += id + "|class|" + $(this).attr("class") + "~";
	});
	$("form .save-visibility").each(function() {
		var id = "#" + $(this).attr("id");
		str += id + "|visibility|" + $(this).css("display") + "~";
	});
	$("form .save-trigger").each(function() {
		var event_type;
		var id = "#" + $(this).attr("id");
		if ($(this).hasClass("event-click")) {
			event_type = "click";
		}
		str += id + "|trigger|" + event_type + "~";
	});
	$('form .save-children').each(function() {
		var id = "#" + $(this).attr('id');
		var children = '';
		$(this).children().each(function() {
			children += '#' + $(this).attr('id');
		});
		str += id + '|save-children|' + children + '~';
	});

	str = str.substring(0, str.length - 1);
	// console.log(str);
	$("input[name=restoredState]").val(str);
}

/**
 * State restore
 *
 * NEEDS ADDITIONAL DOCUMENTATION!!!!!!!
 */
var ajax_states = {};
var selectors = [];
var visibility_selectors = [];
var visibility_states = [];
var event_counter = 0;
var visibility_counter = 0;
var is_restore = false;

function restore_state(str) {
	is_restore = true;
	show_loading(true);
	var rules = str.split("~");
	for (var i = 0; i < rules.length; i++) {
		var rule = rules[i].split("|");
		var selector = rule[0];
		var type = rule[1];
		var state = rule[2];

		var id;

		if (type === "visibility") {
			visibility_selectors.push(selector);
			visibility_states.push(state);
			$(function() {
				//$(selector).addClass("hidden");
				// console.log("selector="+visibility_selectors[visibility_counter]+", state="+visibility_states[visibility_counter]);
				$(visibility_selectors[visibility_counter]).css("display", visibility_states[visibility_counter]);

				if (visibility_states[visibility_counter] !== "none") {
					$(visibility_selectors[visibility_counter]).addClass("open");
				}
				visibility_counter++;
			});
		} else if (type === "input") {
			if (state !== "") {
				state = state.replace(/&quot;/g, '"');
				if ($(selector).hasClass("state-by-ajax") || $(selector).length === 0) {
					id = selector.substring(1, selector.length);
					ajax_states[id] = state;
				} else {
					$(selector).val(state);
				}
				if ($(selector).next().find(".chars-remaining").length !== 0) {
					if (!charCounters) {
						var charCounters = new CharCounters();
					}
					charCounters.update([selector.substr(1)]);
				}
			}
		} else if (type === "span") {
			if (state !== "") {
				$(selector).text(state.replace(/&quot;/g, '"'));
			}
		} else if (type === "disable") {
			if (state === "false") {
				$(selector).removeAttr("disabled");
			} else {
				$(selector).attr("disabled", "disabled");
			}
		} else if (type === "html") {
			if (state !== "") {
				$(selector).html(state.replace(/&quot;/g, '"'));
			}
		} else if (type === "class") {
			if (state !== "") {
				$(selector).attr("class", state);
			}
		} else if (type === "div") {
			if (state !== "") {
				$(selector).text(state.replace(/&quot;/g, '"'));
			}
		} else if (type === "a") {
			if (state !== "") {
				$(selector).text(state.replace(/&quot;/g, '"'));
			}
		} else if (type === "checkbox") {
			if (state === "true") {
				$(selector).attr("checked", true);
			} else {
				$(selector).removeAttr("checked");
			}
		} else if (type === "list") {
			if (state !== "" && state !== "-1") {
				$(selector).children("li").removeClass("selected");
				if ($(selector).hasClass("state-by-ajax")) {
					id = selector.substring(1, selector.length);
					ajax_states[id] = state;
				} else {
					$(selector).children("li:eq(" + state + ")").addClass("selected");
					//$(selector).scrollTop($(selector + " li.selected").index() * $(selector + " li.selected").outerHeight());
				}
			}
			//console.log("list - s="+selector+" t="+type+" s="+state);
		} else if (type === "scroll") {
			if (state !== "") {
				$(selector).scrollTop(state);
				//also save it
				id = selector.substr(1);
				scroll.add({
					id: id,
					scroll: state
				});
			}
		} else if (type === "dsq-dialog") {
			//console.log("dialog - s="+selector+" t="+type+" s="+state);
			if (state !== "" && state !== "-1") {
				//set selected
				$(selector).children("li").removeClass("selected");
				$(selector).children("li:eq(" + state + ")").addClass("selected");
				//set text
				var receiver;
				if ($(selector).children("span").length > 0) {
					receiver = $(selector).parent().prev().children("span");
				} else {
					receiver = $(selector).parent().prev();
				}
				//console.log("r="+receiver.text());
				var value = $(selector).find("li.selected").children("*:not(.hidden-value)").text();
				//console.log("t="+value);
				receiver.text(value);
			}
		} else if (type === "slider") {
			//console.log("s="+selector+" t="+type+" s="+state);
			if ($(selector).hasClass("state-by-ajax")) {
				id = selector.substring(1, selector.length);
				ajax_states[id] = state;
			} else {
				$(selector).slider("option", "value", state);
			}
		} else if (type === "trigger") {
			if ($(selector).children("li.selected").length > 0 && ($(selector).hasClass("hidden") === false || $(selector).css("display") === "none")) {
				//console.log("s="+selector+" t="+type+" s="+state);
				/*if(selector == "#types-all"){
				$(function(){
						$("#types-all li:first").click();
						$("#predefined-beneficiaries-all li:eq(1)").click();
				});
					}*/
				if ($(selector).css("display") !== "none" || $(selector).hasClass("dsq-dialog")) {
					// alert($(selector).attr("id"));
					if ($(selector).hasClass("on-document-ready")) {
						selectors.push(selector);
						$(function() {
							// alert($(selectors[event_counter]).children("li.selected").text());
							var event = jQuery.Event("click");
							event.restore = true;
							event.selector = selectors[event_counter];
							$(selectors[event_counter]).children("li.selected").trigger(event);
							// $(selector).children("li.selected").click();
							event_counter++;
						});
					} else {
						var event = jQuery.Event("click");
						event.restore = true;
						event.selector = selector;
						$(selector).children("li.selected").trigger(event);
						event_counter++;
					}
				}
			}
		} else if (type === 'save-children') {
			if ($(selector).hasClass("state-by-ajax")) {
				id = selector.substring(1, selector.length);
				ajax_states[id] = state;
			}
		}
	}
	//enable terms if disabled
	$("#terms-checkbox").removeAttr("disabled");
	$(".step").addClass("active");

	//resize iban fonts
	$(".format-iban").each(function() {
		resize_font(this);
	});

	scroll.list([], 500);

	remove_loading();
}

/**
 * Converts an href link to a form and submits it so that no ugly urls appear on the address bar
 *
 * @author Ioannis Triantafyllou
 */
var RedirectManager = (function() {

	"use strict";

	var instantiated;

	$(document).ready(function() {
		$("body").on("click", ".javascript-redirect", function(event) {
			event.preventDefault();
			RedirectManager.getInstance().redirect($(this).attr("href"));
		});
	});

	function initialize() {

		return {
			/**
			 * This function is used to redirect to a url through the controller.
			 * 
			 * @param  {String} url    he redirection url
			 * @param  {Boolean} newTab Specifies if the redirection will occur in a new browser window
			 *
			 * @author Triantafyllou Ioannis
			 */
			redirect: function(url, newTab) {

				if (url !== '') {
					var questionMarkIndex = url.indexOf('?');
					var searchString = "";
					if (questionMarkIndex >= 0) {
						searchString = url.substring(questionMarkIndex + 1);
					}
					var actionValue = url.substring(0, questionMarkIndex);
					var params = this.getUrlParams(searchString);

					this.submitParamList(params, false, false, newTab, actionValue);
				}
			},


			/**
			 * This is a function that parses an href search string and returns a map containing key/value pairs of the parameters.
			 * The following assumptions are made about the url, in order for the function to work properly:
			 * 1) The parameters in the search string are in the format (variable name)=(variable value) without the parenthesis and separated by the character '&'.
			 * 2) The (variable name) part does not contain the ambersand character'&'.
			 * 3) The (variable value) part may contain the ambersand character'&' any number of times.
			 *
			 * @author Triantafyllou Ioannis
			 *
			 * @param  {String}  url          The redirection url
			 * @param  {Boolean} decodeParams Specifies if the params extracted from the url need to be url-decoded
			 */
			getUrlParams: function(url, decodeParams) {
				var paramPair;
				var additionRegex = /\+/g; //Regex for replacing addition symbol with a space
				var paramRegex = /(([^&=]+)=?([^&]*))|&/g; //Regex that matches either to a parameter pair or an ambersand
				var validParamRegex = /([^&=]+)=([^&]*)/g; //Regex that matches only to a valid parameter pair
				var decode = function(s) {
						return decodeURIComponent(s.replace(additionRegex, " "));
					};

				var urlParams = {};
				var ambersands = "";
				var paramPairs = {};
				var counter = -1;
				//first get the param pairs from the url
				while (paramPair = paramRegex.exec(url)) {
					if (paramPair[0] === "&") { //if the match was the ambersand
						ambersands += "&"; //add it to a temp string. It will be either added to the param pair's value, or ignored, if it is a param separator ambersand
					} else if (paramPair[0].match(validParamRegex)) { //if the match was a valid param pair
						if (ambersands !== "") { //check if there is a sequence of ambersands that have not been added yet to the previous pair. If so, add them now, except for the last one (separator).
							paramPairs[counter][0] += ambersands.substring(1);
							paramPairs[counter][3] += ambersands.substring(1);
							ambersands = "";
						}
						paramPairs[++counter] = paramPair; //add the valid param pair to the map
					} else { //fragment match that is not a valid param pair (e.g. the part " Spencer" of the param pair 'name="Marks & Spencer"'). It should be added to the previous valid pair.
						paramPairs[counter][0] += ambersands + paramPair[0];
						paramPairs[counter][3] += ambersands + paramPair[0];
						ambersands = "";
					}
				}

				//Add to the last param value the ambersands that may exist in the buffer string
				if (counter >= 0) {
					paramPairs[counter][0] += ambersands;
					paramPairs[counter][3] += ambersands;
				}

				//now create the params map
				paramPair = {};
				for (var i = 0; i <= counter; i++) {
					paramPair = paramPairs[i];
					if (decodeParams) {
						urlParams[paramPair[2]] = decode(paramPair[3]);
					} else {
						urlParams[paramPair[2]] = paramPair[3];
					}
				}
				return urlParams;
			},
			/**
			 * This function accepts a map of params (key/value pairs) as arguments and submits them in a new form.
			 * @author Triantafyllou Ioannis
			 *
			 * @param  {Object}  params              The parameters that will be submittted
			 * @param  {Boolean} includeCommonParams Specifies if the setup and conversationId params will be included
			 * @param  {Boolean} includeRestoreState Specifies if the restoredState param will be included
			 * @param  {Boolean} newTab	             Specifies if the target will be a new tab
			 * @param  {String}	 actionValue         Specifies what the form submit action will be. Default is Controller.
			 */
			submitParamList: function(params, includeCommonParams, includeRestoreState, newTab, actionValue) {
				var form = document.createElement("form");
				form.setAttribute("method", "post");
				form.setAttribute("action", "Controller");

				if (actionValue) {
					form.setAttribute("action", actionValue);
				}
				if (newTab) {
					form.setAttribute("target", "_blank");
				}

				if (includeCommonParams) {
					params[setup] = $("input[name=" + setup + "]").val();
					params[conversationId] = $("input[name=" + conversationId + "]").val();
				}

				if (includeRestoreState) {
					params[restoredState] = $("input[name=" + restoredState + "]").val();
				}

				for (var key in params) {
					if (params.hasOwnProperty(key)) {
						var hiddenField = document.createElement("input");
						hiddenField.setAttribute("type", "hidden");
						hiddenField.setAttribute("name", key);
						hiddenField.setAttribute("value", params[key]);

						form.appendChild(hiddenField);
					}
				}

				document.body.appendChild(form);
				form.submit();
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

/**
 * Does many default resets when the .reset button is clicked on a page
 */
var ResetManager = (function() {

	"use strict";

	var instantiated;

	$(document).ready(function() {
		$("body").on("click", "#main .form-header .reset", function() {
			ResetManager.getInstance().reset();
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
					var markup = "<input id='" + $(".file-upload").attr("id") + "' class='file-upload' type='file' accept='" + $(".file-upload").attr("accept") + "' tabindex='" + $(".file-upload").attr("tabindex") + "' />";
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
					if ($(this).find("li:not(.non-selectable)").length === 1 && $(this).hasClass("single-preselect")) {
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
				});
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
				if (typeof(resetClicked) !== "undefined") {
					resetClicked();
				}
				ResetManager.getInstance().callback();
				//fix main height
				setTimeout(function() {
					MainPageHeightManager.getInstance().fixHeight();
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

/**
 * Saves the scroll state and scrolls all the lists on the page after a certain delay
 */
var Scroll = function() {};
var scroll = new Scroll();

Scroll.prototype.savedScroll = [];

/**
 * It scrolls the lists with a timeout
 * @param  {Number} timeout The timeout
 */
Scroll.prototype.list = function(lists, timeout) {
	setTimeout(function() {
		scroll.goScroll(lists);
	}, 500);
};

/**
 * Saves the lists scroll values
 * @return {array} An array with the ids and scrolls of each list in the page
 */
Scroll.prototype.save = function(id) {
	//var savedScroll = [];
	var object;
	if (id) {
		var scroll = $("#" + id).scrollTop();
		object = {
			id: id,
			scroll: scroll
		};
	}
	/*else{
		$(".list").each(function(){
			var id = $(this).attr("id");
			savedScroll.push({id: id, scroll: $("#" + id).scrollTop()});
		});
	}*/
	return object;
};

/**
 * Checks if a scroll rule for this id already exists and updates it, or otherwiese, justs adds it at the end of savedScroll
 */
Scroll.prototype.add = function(object) {
	var found = false;
	for (var i = 0, length = this.savedScroll.length; i < length; i++) {
		if (this.savedScroll[i]) {
			if (this.savedScroll[i].id === object.id) {
				this.savedScroll[i].scroll = object.scroll;
				found = true;
			}
		}
	}

	if (!found) {
		this.savedScroll.push(object);
	}
};

/**
 * Scrolls all the list found in the page to either the saved values, or the selected item
 */
Scroll.prototype.goScroll = function(lists) {
	//if its "all" or empty, means to scroll all lists
	var i, j;
	if (!jQuery.isArray(lists) || lists.length === 0) {
		lists = [];
		j = 0;
		$(".list").each(function() {
			lists[j] = $(this).attr("id");
			j++;
		});
	}

	//if we have saved scrolls
	if (this.savedScroll.length > 0) {
		for (i = 0; i < this.savedScroll.length; i++) {
			if (this.savedScroll[i]) {
				//if we were told to scroll this list
				if ($.inArray(this.savedScroll[i].id, lists) !== -1) {
					//delete makes that array spot undefined
					delete lists[$.inArray(this.savedScroll[i].id, lists)];
					$("#" + this.savedScroll[i].id).scrollTop(this.savedScroll[i].scroll);
				}
			}
		}
	}
	//
	for (i = 0; i < lists.length; i++) {
		var id = lists[i];
		//if id hasnt become undefined by delete and has a selected item, scroll to it
		if (id && $("#" + id + " li.selected").length > 0) {
			if ($("#" + id + " li:first").hasClass("filter") && $("#" + id + " li.selected").index("#" + id + " li:visible") === 1) {
				$("#" + id).scrollTop(0);
			} else {
				$("#" + id).scrollTop($("#" + id + " li.selected").index("#" + id + " li:visible") * $("#" + id + " li.selected").outerHeight());
			}
		} else {
			$("#" + id).scrollTop(0);
		}
	}
};

/**
 * Resets the scroll
 */
Scroll.prototype.reset = function(lists) {
	if (lists && lists.length > 0) {
		//if we have saved scrolls
		if (this.savedScroll.length > 0) {
			for (var i = 0, length = this.savedScroll.length; i < length; i++) {
				if (this.savedScroll[i]) {
					//if we were told to scroll this list
					if ($.inArray(this.savedScroll[i].id, lists) !== -1) {
						//delete makes that array spot undefined
						delete this.savedScroll[i];
					}
				}
			}
		}
	} else {
		scroll.savedScroll = [];
	}
};

/**
 * Provides some functions that format a value
 * Also attaches events for fields that call those functions by having specific classes
 *
 * @author Achilleas Tsoumitas
 */
var TextFormatter = (function() {

	"use strict";

	var instantiated;

	$(document).ready(function() {

		$("body").on("keyup blur", ".field.format-iban", function() {
			TextFormatter.getInstance().resizeFont(this);
		});

		$("body").on("focus", ".field.format-iban", function() {
			$(this).val($(this).val().replace(/ /g, ""));
		});

		$("body").on("blur", ".field.format-iban", function() {
			if ($(this).val().indexOf(" ") === -1) {
				$(this).val(TextFormatter.getInstance().splitIban($(this).val()));
			}
		});

		$("body").on("blur", ".field.check-iban", function() {
			if ($(this).hasClass("intrabank")) {
				check_iban($(this).attr("id"), $(this).val(), "intrabank");
			} else if ($(this).hasClass("domestic")) {
				check_iban($(this).attr("id"), $(this).val(), "domestic");
			}
		});

		/**
		 * On focusout format amount
		 */
		$("body").on("focusout", ".field.format-amount", function() {
			if ($(this).val() !== "") {
				$(this).val(AmountUtilities.getInstance().removeThousandSeparators($(this).val()));

				var validator = new Validator();
				var error = validator.checkValidAmount($(this).val());
				if (error) {
					validator.displayError($(this), "format_amount", "invalid_amount");
				} else {
					$(this).parent().find(".validation-error.format_amount").remove();
					$(this).val(AmountUtilities.getInstance().formatAmount($(this).val()));
				}
			}
		});

		/**
		 * On focus, remove amount formatting
		 */
		$("body").on("focus", ".field.format-amount", function() {
			if ($(this).hasClass("no-decimals")) {
				var temp = $(this).val().split(decimal_separator);
				var result = temp[0];
				$(this).val(AmountUtilities.getInstance().removeThousandSeparators(result));
			} else {
				$(this).val(AmountUtilities.getInstance().removeThousandSeparators($(this).val()));
			}
		});

	});

	function initialize() {

		return {
			/**
			 * Resizes the font of an iban field so that all the characters are visible always
			 *
			 * @param  {String} selector The selector of the field containing the iban to resize
			 */
			resizeFont: function(selector) {
				if ($(selector).length > 0) {
					var length = $(selector).val().length;
					if (length > 18 && length < 21) {
						$(selector).css("font-size", "11px");
					} else if (length >= 21 && length <= 29) {
						$(selector).css("font-size", "10px");
					} else if (length > 29) {
						$(selector).css("font-size", "9px");
					} else {
						$(selector).css("font-size", "12px");
					}
				}
			},
			/**
			 * Splits an iban in parts of 4
			 *
			 * @param  {String} iban The iban
			 * @return {String}      The splitted iban
			 */
			splitIban: function(iban) {
				if (iban && iban.trim().length > 18) {
					//first remove any spaces
					iban = iban.replace(/ /g, "");
					var splits = parseInt(iban.length / 4, 10);
					if (iban.length % 4 !== 0) {
						splits++;
					}
					var result = "";
					for (var i = 0; i < splits; i++) {
						result += iban.substr(i * 4, 4) + " ";
					}
					//remove last space
					if (result.substr(result.length - 1, result.length) === " ") {
						result = result.substr(0, result.length - 1);
					}

					return result;
				} else {
					return iban;
				}
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

/**
 * Displays a custom tooltip on hover
 *
 * @author Achilleas Tsoumitas
 */
var TooltipManager = (function() {

	"use strict";

	var instantiated;

	$(document).ready(function() {
		$("body").on("mouseover mouseout", ".show-text-tooltip", function() {
			var title;
			if (event.type === 'mouseover') {
				title = $(this).attr("title");
				$(this).attr("title", "");
				$(this).attr("temp", title);
				var text = title;
				if (!text) {
					text = $(this).text();
				}
				var offset = $(this).offset();
				var left = offset.left + 30;
				var top = offset.top + 30;
				$("body").append('<div id="tooltip" style="z-index: 100000; position: absolute; left: ' + left + 'px; top: ' + top + 'px;">' + text + '</div>');
			} else {
				title = $(this).attr("temp");
				$(this).removeAttr("temp");
				$(this).attr("title", title);
				$("#tooltip").remove();
			}
		});
	});

	function initialize() {

		return {

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
			} else if(validationType == "check_file_type") {  //manesp:TXN:Usability2:UploadBeneficiaries 20120619
				if(!this.checkIsSpecificTypeFile(item)) {
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
			};
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
		if (typeof error_messages !== "undefined" && error_messages[specifiedErrorMessage]) {
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
	
	/**
	 * Checks if a specific file has an allowed extension
	 */
	this.checkIsSpecificTypeFile = function(item) {
		var isSpecificType = false;
		var filename = item[0].val();
		var listOfPermittedExtentions = item[2];
		var fileExtension = filename.substr( (filename.lastIndexOf('.') +1) );
		var validationItem;
		
		if(fileExtension.length > 0 && listOfPermittedExtentions!=null && listOfPermittedExtentions.length > 0) {
			for(var i = 0, length = listOfPermittedExtentions.length; i < length; i++) {
				validationItem = [fileExtension, item[1], listOfPermittedExtentions[i].trim()];
				
				if(!this.checkEquality(validationItem)) {
					isSpecificType = true;
					break;
				}
			}
		}
		
		return isSpecificType;
	};	
	
});


// initiate a converter object
var converter = {};

// TODO: Change the today date in settings.jsp of oDate
//this is the new way to use dates, useing ODate.js
var todayDate = today_date;
var oDate = new ODate();
oDate.setToday(todayDate.split("/")[2], todayDate.split("/")[1] - 1, todayDate.split("/")[0]);
//oDate.setToday(today_date.substring(6, 10), today_date.substring(3, 5), today_date.substring(0, 2));
var yesterday_date = oDate.date(0, 0, -1);
var one_month_back_date = oDate.date(0, -1, 0);

//these are deprecated, but we still have them here in case a js file uses them
//calculate yesterday
var yesterday = new Date();
yesterday.setDate(today.getDate() - 1);
// var yesterday_date = add_zero(yesterday.getDate()) + "/" + add_zero(yesterday.getMonth() + 1) + "/" + yesterday.getFullYear();
//calculate one month back
var one_month_back = new Date();
var days_in_previous_month = 32 - new Date(today.getFullYear(), today.getMonth() - 1, 32).getDate();
one_month_back.setDate(-(days_in_previous_month - today.getDate()));
// var one_month_back_date = add_zero(one_month_back.getDate()) + "/" + add_zero(one_month_back.getMonth() + 1) + "/" + one_month_back.getFullYear();

function add_zero(value) {
	return oDate._addZero(value);
}

var decimal_separator = AmountUtilities.getInstance().decimalSeparator;
var thousands_separator = AmountUtilities.getInstance().thousandSeparator;

function show_loading(show_image) {
	ModalManager.getInstance().loader.show(show_image);
}

function remove_loading() {
	ModalManager.getInstance().loader.hide();
}

function find_selected_account_number(list_selector, index) {
	return ListUtilities.getInstance().findAccountNumber(list_selector.substr(1), parseInt(index, 10));
}

function find_selected_account_nickname(list, index) {
	return ListUtilities.getInstance().findAccountNickname(list_selector.substr(1), parseInt(index, 10));
}

function find_account_currency(item) {
	return ListUtilities.getInstance().findAccountCurrency(item.closest("ul").attr("id"), item.index());
}

function find_account_type(item) {
	return ListUtilities.getInstance().findAccountType(item.closest("ul").attr("id"), item.index());
}

function find_account_index(id, account_number) {
	return ListUtilities.getInstance().findAccountIndex(id, account_number);
}

function split_iban(iban) {
	TextFormatter.getInstance().splitIban(iban);
}

var checkIbanRuns = false;
/**
 * Checks an iban if its valid. An ajax request is also performed if the basic iban structure
 *
 * IMPORTANT: This will be removed from main.js when payments.js is refactored
 *
 * @param  {String} id   The id of the input that contains the iban
 * @param  {String} iban The iban to check
 * @param  {String} type The type of iban (intrbank, domestic..)
 */

function check_iban(id, iban, type) {
	if (!checkIbanRuns) {
		checkIbanRuns = true;
		if (iban) {
			var result = {
				"currency": "",
				"iban": "",
				"isValid": "0",
				"isUtilityCompanyAccount": false
			};
			var validator = new Validator();
			//remove spaces added by format iban
			iban = iban.replace(/ /g, "").toUpperCase();
			if (type === "intrabank") {
				if (iban.length <= 10) {
					//if only numbers
					if (/^\d+$/.test(iban)) {
						show_loading(false);
						result = beneficiary_server_validation(id, iban, type);
					} else {
						validator.displayError($("#" + id), "check-iban", "invalid_iban");
					}
				} else {
					if (iban.substring(0, 2) !== "RO" || iban.substring(4, 8) !== "RZBR" || iban.length !== 24) {
						validator.displayError($("#" + id), "check-iban", "invalid_iban");
					} else {
						show_loading(false);
						result = beneficiary_server_validation(id, iban, type);
					}
				}
			} else if (type === "domestic") {
				if (iban.substring(0, 2) !== "RO" || iban.substring(4, 8) === "RZBR" || iban.length !== 24) {
					validator.displayError($("#" + id), "check-iban", "invalid_iban");
				} else {
					show_loading(false);
					result = beneficiary_server_validation(id, iban, type);
				}
			}

			//remove any previous values
			if ($("#" + id).parent().find(".iban-currency")) {
				$("#" + id).parent().find(".iban-currency").remove();
				$("#" + id).parent().find(".isUtilityCompanyAccount").remove();
			}

			//if we account is valid, add currency
			if (result.isValid === "1") {
				$("#" + id).val(split_iban(result.iban));
				resize_font("#" + id);

				var markup = "<span class='hidden-value iban-currency'>" + result.currency + "</span>";
				$("#" + id).parent().append(markup);
				$(".hidden-value.iban-currency").insertBefore($("#" + id));
				markup = "<span class='hidden-value isUtilityCompanyAccount'>" + result.isUtilityCompanyAccount + "</span>";
				$("#" + id).parent().append(markup);
				$(".hidden-value.isUtilityCompanyAccount").insertBefore($("#" + id));
				//and remove any errors
				$("#" + id).parent().find(".validation-error").remove();
			} else {
				validator.displayError($("#" + id), "check-iban", "invalid_iban");
			}
		} else {
			$("#" + id).parent().find(".iban-currency").remove();
			$("#" + id).parent().find(".isUtilityCompanyAccount").remove();
		}
		checkIbanRuns = false;
	}
}

function resize_font(selector) {
	TextFormatter.getInstance().resizeFont(selector);
}

function set_date_text() {
	return DatepickersManager.getInstance().setTransactionPlannerDateText();
}

function remove_thousand_separators(value) {
	return AmountUtilities.getInstance().removeThousandSeparators(value);
}

function amount_to_number(value) {
	return AmountUtilities.getInstance().amountToNumber(value);
}

function format_amount(input) {
	return AmountUtilities.getInstance().formatAmount(input);
}

function remove_invalid_characters(validation_type, input) {
	return CharacterInputManager.getInstance().removeInvalidCharacters(validation_type, input);
}

function initiate_dialogs() {
	ModalManager.getInstance().modals.initialize();
}

function destroy_dialogs() {
	ModalManager.getInstance().modals.destroy();
}

function initiate_error_dialog() {
	ModalManager.getInstance().errorsModal.initialize();
}

function sendings_calculator() {
	DatepickersManager.getInstance().sendingsCalculator();
}

function mainHeightFix() {
	MainPageHeightManager.getInstance().fixHeight();
}

function init_custom_date() {
	DatepickersManager.getInstance().setupCustomDatepickers();
}

/**
 * Bug fix for chrome scrollbar with modal/dialog
 */
(function($, undefined) {
	if ($.ui && $.ui.dialog) {
		$.ui.dialog.overlay.events = $.map('focus,keydown,keypress'.split(','), function(event) {
			return event + '.dialog-overlay';
		}).join(' ');
	}
}(jQuery));

$(document).ready(function() {

	AppView = Backbone.View.extend({
		el: $("body"),
		initialize: function() {
			LogoutTimer.getInstance().secondsRemaining = parseInt($("#top-menu .soon").text().split(" ")[0], 10);
			LogoutTimer.getInstance().start();

			/**
			 * On load, split any fields that contain ibans
			 */
			$(".iban").each(function() {
				$(this).text(split_iban($(this).text()));
			});

			//Turns the browser autocomplete in form inputs off
			$("form").attr("autocomplete", "off");

			//add utf-8 for the forms
			$("form").attr("accept-charset", "UTF-8");

			//Create dialogs (modals), so that they can be opened when necessary
			ModalManager.getInstance().modals.initialize();

			//Call mainHeightFix on load to fix any height problems
			MainPageHeightManager.getInstance().fixHeight();

			//fixes a welcome message bug
			var userInfoWidth = 960 - $("#logo").outerWidth() - $("#top-menu").outerWidth() - 40;
			$("#user .welcome-message").css("width", userInfoWidth + "px");

			// save reset defaults
			/**
			 * We call it with a delay so that any fill_fields functins can run before we save the default values
			 */
			setTimeout(function() {
				ResetManager.getInstance().saveDefaultsForReset();
			}, 1000);

			//initialize the modals on this page
			ModalManager.getInstance().modals.initialize();

			/**
			 * If errors returned by the server, initialize the errors modal
			 */
			if (!$("#errors-modal").hasClass("empty")) {
				ModalManager.getInstance().errorsModal.initialize();
			}
			
			/**
			 * If we have a transaction planner step on our page, set initial values
			 */
			if ($(".transaction-planner-step").length) {
				DatepickersManager.getInstance().setTransactionPlannerDateText();
			}

			/**
			 * Initiates tabs
			 */
			$(".tabs").tabs();

			/**
			 * Initiate prettyphoto
			 */
			if ($("a[rel^='prettyPhoto']").length > 0) {
				$("a[rel^='prettyPhoto']").prettyPhoto({
					default_width: 720,
					default_height: 480,
					social_tools: ' '
				});
			}

		},
		//register events
		events: {
			"click .modify-height": "modifyHeight",
			"click #menu li": "slideMenu",
			"click .buttons .checkbox-with-dialog:not(#terms-dialog)": "checkboxWithDialog",
			"click div.dialog-message .button": "openModalButtonLink",
			"click .capitalized": "capitalize",
			"click ul.clickable-li li:not(.non-clickable)": "clickableLi",
			"click #clear-dates": "clearDates",
			"change input:not(.custom-validation), textarea:not(.custom-validation)": "removeInputValidationError",
			"blur input.datepicker": "removeDatepickerValidationError",
			"click button.clear-input": "clearInput"
		},
		/**
		 * Call mainHeightFix on buttons that have the class modify-height
		 * @param  {Event} event
		 */
		modifyHeight: function(event) {
			setTimeout(function() {
				MainPageHeightManager.getInstance().fixHeight();
			}, 500);
		},
		/**
		 * Menu functionality
		 * @param  {Event} event
		 */
		slideMenu: function(event) {
			if ($(event.currentTarget).find("ul").length > 0 && $(event.currentTarget).find("ul").hasClass("active") === false) {
				$("#menu").find("ul").not(".active ul").not($(event.currentTarget).find("ul")).slideUp();
				$(event.currentTarget).find("ul").slideDown();
			}
		},
		/**
		 * Controls the checkboxes next to the submit buttons
		 *
		 * Hey, it has a callback too
		 */
		checkboxWithDialog: function(event) {
			$(event.currentTarget).parent().find(".validation-error").remove();
			var open;
			if (!$(event.currentTarget).is(":checked")) {
				$(event.currentTarget).parent().find(".dsq-dialog").slideUp().removeClass('open');
				open = false;
			} else {
				//$(".buttons .dsq-dialog").slideUp().removeClass('open');
				$(event.currentTarget).parent().find(".dsq-dialog").slideDown().addClass('open');
				open = true;
			}
			if (typeof(checkboxWithDialogClicked) !== "undefined") {
				checkboxWithDialogClicked($(event.currentTarget).parent().find(".dsq-dialog"), open);
			}
		},
		/**
		 * When we click enter while a modal is open, if the button clicked has href, redirect to this href
		 */
		openModalButtonLink: function(event) {
			var link = $(event.currentTarget).attr("href");
			if (link !== "#" && link.substr(0, 10) !== "javascript") {
				window.location = $(event.currentTarget).attr("href");
			}
		},
		/**
		 * Capitalized field
		 */
		capitalize: function(event) {
			$(event.currentTarget).val($(event.currentTarget).val().toUpperCase());
		},
		/**
		 * In portfolio, make the whole li clickable
		 */
		clickableLi: function(event) {
			event.preventDefault();
			show_loading(false);
			var link = $(event.currentTarget).find("a").attr("href");
			window.location = link;
		},
		/**
		 * The button to clear the dates fields
		 */
		clearDates: function(event) {
			ResetManager.getInstance().resetAvailableDates();
			$(event.currentTarget).closest(".fields").find("#start-date, #end-date, .custom-date").val("");
			$(event.currentTarget).parent().find(".validation-error").remove();
		},
		/**
		 * Remove error on input text change
		 */
		removeInputValidationError: function(event) {
			$(event.currentTarget).parent().find(".validation-error").remove();
		},
		removeDatepickerValidationError: function(event) {
			$(event.currentTarget).parent().find(".validation-error").remove();
		},
		clearInput: function(event) {
			$(event.currentTarget).parent().closest(":not(.helper)").find(".has-clear-button").val("");
			//update char counters
			if (!charCounters) {
				var charCounters = new CharCounters();
			}
			charCounters.update($(event.currentTarget).attr("id"));
			$("#modify-nickname").keyup();
		}
	});

	var appview = new AppView();

	function save_defaults_for_reset() {
		ResetManager.getInstance().saveDefaultsForReset();
	}

	function reset_available_dates() {
		ResetManager.getInstance().resetAvailableDates();
	}

	function adjust_size(selector, parent) {
		LabelSizeManager.getInstance().adjustSize(selector, parent);
	}

	function wrap_long_words(selector) {
		LabelSizeManager.getInstance().wrapLongWords(selector);
	}

	/**
	 * Converter
	 *
	 * Will remain inside main.js until payments is refactored and split into different pages
	 */

	//open converter
	$(document).on("click", "#show-converter", function() {
		//reset fields
		$("#top-amount-converter-field, #bottom-amount-converter-field").val("");
		//
		$("#currency1-dialog li:first").click();
		//
		$("#modal-converter").find(".validation-error").remove();
		//
		if ($("#amount-textfield").val() !== "") {
			$("#top-amount-converter-field").val($("#amount-textfield").val());
			$("#use-amount").removeClass("disabled").removeAttr("disabled", true);
		} else {
			$("#use-amount").addClass("disabled").attr("disabled", true);
		}
		//
		var currency_dialog;
		if (!$("#currency-iso").parent().hasClass("show-dialog")) {
			currency_dialog = "";
		} else {
			currency_dialog = $("#currency-dialog").html();
		}
		$("#currency1-dialog").html(currency_dialog);
		if ($("#currency1-dialog li").length > 0) {
			$("#currency1-dialog").parent().prev().text($("#currency-iso").text().trim());
			$("#currency1-dialog").parent().prev().addClass("show-dialog dd");
		} else {
			$("#currency1-dialog").parent().prev().removeClass("show-dialog dd");
			$("#currency1-dialog").parent().prev().text($("#currency-iso").text());
		}
	});

	$(document).on("keyup", "#top-amount-converter-field", function() {
		if ($(this).val().trim() !== "") {
			$("#use-amount").removeClass("disabled").removeAttr("disabled");
		} else {
			$("#use-amount").addClass("disabled").attr("disabled", true);
		}
	});

	//on convert (up/down) buttons click
	$(document).on("click", "#convert-top, #convert-bottom", function() {

		//clear errors
		$("#modal-converter").find(".validation-error").remove();

		var item;
		if (this.id === "convert-top") {
			item = {
				"type": "top",
				"opposite_type": "bottom",
				"id1": "1",
				"id2": "2"
			};
		} else {
			item = {
				"type": "bottom",
				"opposite_type": "top",
				"id1": "2",
				"id2": "1"
			};
		}

		var validations = [
			[$("#" + item.type + "-amount-converter-field"), "valid_amount", "not_valid_amount"],
			[$("#" + item.type + "-amount-converter-field"), "not_zero", "amount_zero"],
			[$("#" + item.type + "-amount-converter-field"), "not_empty", "not_empty"]
		];

		var validator = new Validator();
		var submit_status = validator.validate(validations, false, true);

		// console.log("submit_status="+submit_status);
		if (submit_status === true) {
			var currency1 = $("#currency1-dialog").parent().prev().text();
			var currency2 = $("#currency2-dialog").parent().prev().text();

			var result, amount1, amount2;
			if (currency1 !== currency2) {
				if (item.type === 'top') {
					amount1 = $("#" + item.type + "-amount-converter-field").val();
					amount2 = '';
				} else {
					amount1 = '';
					amount2 = $("#" + item.type + "-amount-converter-field").val();
				}
				var fromAccountCurrency = find_account_currency($("#from-account-list li.selected"));
				var toAccountCurrency = payments_find_to_account_currency();

				//show_loading(true);
				setTimeout(function() {
					get_converted_amount(item, currency1, currency2, amount1, amount2, fromAccountCurrency, toAccountCurrency);
				}, 100);
			} else {
				result = $("#" + item.type + "-amount-converter-field").val();
				converter.convertRequestResult(item, result);
			}
		}
	});

	converter = {
		convertRequestResult: function(item, result) {
			if (result !== -1) {
				$("#" + item.opposite_type + "-amount-converter-field").val(result);
				$("#use-amount").removeClass("disabled").removeAttr("disabled");
			} else {
				var validator = new Validator();
				validator.displayError($("#bottom-amount-converter-field"), "converter_error", "converter_error");
			}
			//remove_loading();
		}
	};

	//on calncel button click
	$(document).on("click", "#close-modal", function() {
		$(this).closest(".dialog-message").dialog("close");
	});

	//on use this amount button click
	$(document).on("click", "#use-amount", function() {

		if (!$(this).hasClass("disabled")) {
			var receiver = $(this).closest(".dialog-message").find(".hidden-value.receiver").text();
			$("#" + receiver).val($("#top-amount-converter-field").val());
			//
			var currencyIndex = $("#currency1-dialog li.selected").index();
			$("#currency-dialog li:eq(" + currencyIndex + ")").click();
			$(this).closest(".dialog-message").dialog("close");
			//also remove the error (if exists) from the amoutn field
			$("#amount-textfield").parent().find(".validation-error").remove();
		}
	});

	function payments_find_to_account_currency() {
		var result = "";
		//each takes care of finding if those exist
		$("#beneficiary-iban-intrabank, #beneficiary-iban-domestic").each(function() {
			check_iban($(this).attr("id"), $(this).val(), $(this).attr("id").split("-")[2]);
			if ($(this).parent().find(".iban-currency").length > 0) {
				result = $(this).parent().find(".iban-currency").text();
			}
		});
		if ($("#to-account-list li.selected").length > 0) {
			result = find_account_currency($("#to-account-list li.selected"));
		}
		return result;
	}

});