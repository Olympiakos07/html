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
		$("body").on("keydown", ".field.alphanumeric-validated", function(event){
			var charCodes;
			if($(this).hasClass("no-spaces")){
				charCodes = CharacterInputManager.getInstance().charCodeArrayCreator(["numbers", "letters"]);
			}else{
				charCodes = CharacterInputManager.getInstance().charCodeArrayCreator(["numbers", "letters", "space"]);
			}
			if(event.type === "keydown"){
				//dont print the key pressed if its not inside the allowed ones, or if its number but with shift key
				if(jQuery.inArray(event.keyCode, charCodes) === -1 || (event.shiftKey && !CharacterInputManager.getInstance().isLetterOrArrow(event.keyCode))){
					event.preventDefault(); 
				}
			}
		});

		$("body").on("keydown", ".field.alphanumericplus-validated", function(event){
			//we want only numbers
			var charCodes = CharacterInputManager.getInstance().charCodeArrayCreator(["numbers", "letters", "space"]);
			if(
			/* / */(!event.shiftKey && event.keyCode === 191) || 
			/* ? */(event.shiftKey && event.keyCode === 191) || 
			/* : */(event.shiftKey && event.keyCode === 186) || 
			/* ( */(event.shiftKey && event.keyCode === 57) || 
			/* ) */(event.shiftKey && event.keyCode === 48) || 
			/* . */(!event.shiftKey && event.keyCode === 190) || 
			/* , */(!event.shiftKey && event.keyCode === 188) || 
			/* ' */(!event.shiftKey && event.keyCode === 222) || 
			/* + */(event.shiftKey && event.keyCode === 187) || 
			/* { */(event.shiftKey && event.keyCode === 219) || 
			/* } */(event.shiftKey && event.keyCode === 221) || 
			/* - */(!event.shiftKey && event.keyCode === 189)
			){
				//type it
			}else{
				//aplhanumeric validation
				if(jQuery.inArray(event.keyCode, charCodes) === -1 || (event.shiftKey && !CharacterInputManager.getInstance().isLetterOrArrow(event.keyCode))){
					event.preventDefault();
				}
			}
		});

		//amount field
		$("body").on("keydown", ".field.amount-validated", function(event){
			//we want only numbers and maybe commas
			var charCodes;
			if($(this).hasClass("no-decimals")){
				charCodes = CharacterInputManager.getInstance().charCodeArrayCreator(["numbers"]);
			}else{
				charCodes = CharacterInputManager.getInstance().charCodeArrayCreator(["numbers", "commas"]);			
			}
			// if(
			/* . (!event.shiftKey && event.keyCode == 190) || 
			/* , *//*(!event.shiftKey && event.keyCode == 188)*/
			/*){
				if($(this).hasClass("no-decimals")){
					event.preventDefault(); 				
				}else if(locale == "en_US" && (!event.shiftKey && event.keyCode == 190)){
					//type it
				}else if(locale == "ro_RO" && (!event.shiftKey && event.keyCode == 188)){
					//type it
				}
			}else{*/
				//aplhanumeric validation
				if(event.ctrlKey && CharacterInputManager.getInstance().isLetterOrArrow(event.keyCode)){
					//type it
				}else if(jQuery.inArray(event.keyCode, charCodes) === -1 || (event.shiftKey && !CharacterInputManager.getInstance().isLetterOrArrow(event.keyCode))){
					event.preventDefault(); 
				}
			// }
		});

		/**
		 * Also remove the invalid characters on blur, because he might pasted the characters 
		 * or found another fancy way to insert them into the field
		 * 
		 * @param  {Event} event 
		 * @return {[type]}       [description]
		 */
		$(document).on("blur", ".field", function(event){
			//save input val
			var input = $(this).val();
			//
			var validationType = "";
			if($(this).hasClass("numeric-validated")){
				validationType = "numeric-validated";
			}else if($(this).hasClass("alphanumeric-validated")){
				validationType = "alphanumeric-validated";
			}else if($(this).hasClass("alphabetic-validated")){
				validationType = "alphabetic-validated";
			}else if($(this).hasClass("alphanumericplus-validated")){
				validationType = "alphanumericplus-validated";
			}else if($(this).hasClass("amount-validated")){
				validationType = "amount-validated";
			}
			if(validationType != ""){
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
				//regex = /[\ă\â\ţ\ş\î\Ă\Â\Ţ\Ş\Î]/g;
				//result = result.replace(regex, "");
				//result = result.toString().replace(/ă/g,'a').replace(/â/g,'a').replace(/ţ/g,'t').replace(/ş/g,'s').replace(/î/g,'i').replace(/Ă/g,'A').replace(/Â/g,'A').replace(/Ţ/g,'T').replace(/Ş/g,'S').replace(/Î/g,'I');

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