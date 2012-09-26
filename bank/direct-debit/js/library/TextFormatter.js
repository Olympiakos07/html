/**
 * Provides some functions that format a value
 * Also attaches events for fields that call those functions by having specific classes
 *
 * @author Achilleas Tsoumitas
 */
var TextFormatter = (function() {

	"use strict";

	var instantiated;

	$(document).ready(function(){

		$("body").on("keyup blur", ".field.format-iban", function() {
			TextFormatter.getInstance().resizeFont(this);
		});

		$("body").on("focus", ".field.format-iban", function(){
			$(this).val($(this).val().replace(/ /g, ""));
		});

		$("body").on("blur", ".field.format-iban", function(){
			if($(this).val().indexOf(" ") === -1){
				$(this).val(TextFormatter.getInstance().splitIban($(this).val()));
			}
		});

		$("body").on("blur", ".field.check-iban", function(){
			if($(this).hasClass("intrabank")){
				check_iban($(this).attr("id"), $(this).val(), "intrabank");
			}else if($(this).hasClass("domestic")){
				check_iban($(this).attr("id"), $(this).val(), "domestic");
			}
		});

		/**
		 * On focusout format amount
		 */
		$("body").on("focusout", ".field.format-amount", function(){
			if($(this).val() !== ""){
				$(this).val(AmountUtilities.getInstance().removeThousandSeparators($(this).val()));

				var validator = new Validator();
				var error = validator.checkValidAmount($(this).val());
				if(error){
					validator.displayError($(this), "format_amount", "invalid_amount");
				}else{
					$(this).parent().find(".validation-error.format_amount").remove();
					$(this).val(AmountUtilities.getInstance().formatAmount($(this).val()));
				}
			}
		});

		/**
		 * On focus, remove amount formatting
		 */
		$("body").on("focus", ".field.format-amount", function(){
			if($(this).hasClass("no-decimals")){
				var temp = $(this).val().split(decimal_separator);
				var result = temp[0];
				$(this).val(AmountUtilities.getInstance().removeThousandSeparators(result));
			}else{
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
			resizeFont: function(selector){
				if($(selector).length > 0){
					var length = $(selector).val().length;
					if(length > 18 && length < 21){
						$(selector).css("font-size", "11px");
					}else if(length >= 21 && length <= 29){
						$(selector).css("font-size", "10px");
					}else if(length > 29){
						$(selector).css("font-size", "9px");
					}else{
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
			splitIban: function(iban){
				if(iban && iban.trim().length > 18){
					//first remove any spaces
					iban = iban.replace(/ /g, "");
					var splits = parseInt(iban.length/4, 10);
					if(iban.length%4 !== 0){
						splits++;
					}
					var result = "";
					for(var i = 0; i < splits; i++){
						result += iban.substr(i * 4, 4) + " ";
					}
					//remove last space
					if(result.substr(result.length-1, result.length) === " "){
						result = result.substr(0, result.length-1);
					}

					return result;
				}else{
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