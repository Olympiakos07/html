/**
 * Controls fields with max amount limit
 */
var MaxAmountCheckboxManager = (function() {

	"use strict";
	
	var instantiated;

	$(document).ready(function() {

		//on click, apply limit, remove errors
		$("body").on("click", ".apply-limit", function(){
			var maxAmount = $(this).closest(".fields, td").find(".max-amount").text();
			$(this).closest(".fields, td").find(".has-limit").val(maxAmount);
			$(this).closest(".fields, td").find(".validation-error").remove();
		});

		//cant be over max amount
		$("body").on("keyup", ".has-limit", function(){
			var maxAmount = amount_to_number($(this).closest(".fields, td").find(".max-amount").text());
			//if he changed the value from max amount limit, remove checkbox
			if(amount_to_number($(this).val()) != maxAmount){
				$(this).closest(".fields, td").find(".apply-limit").removeAttr("checked");
				$(this).closest(".fields, td").find(".apply-limit").next().removeClass("ui-state-active");
			}
		});

		//on blur, do the validations
		$("body").on("blur", ".has-limit", function(){
			var maxAmount = $(this).closest(".fields, td").find(".max-amount").text();
			//validate amount
			var validations = [
				[$(this), "not_zero", "amount_zero"],
				[[$(this), "max", maxAmount], "compare_numbers", "amount_over_limit"],
				[$(this), "valid_amount", "invalid_amount"],
				[$(this), "not_empty", "not_empty"]
			];
			var validator = new Validator();
			
			var showErrors = true
			if (!$(this).closest(".fields").length) {
				showErrors = false;
			}
			var status = validator.validate(validations, false, showErrors);
			//add/remove class active
			if(status){
				$(this).closest(".step").addClass("active");
				$(this).closest(".step").find(".validation-error").remove();
			}else{
				$(this).closest(".step").removeClass("active");
				//
				if (!showErrors) {
					var lastError = validator.errors[validator.errors.length - 1]
					validator.displayError($(this).closest("td").find("label"), lastError.validationType, lastError.errorMessage);
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