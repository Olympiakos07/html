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