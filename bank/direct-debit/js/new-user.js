/**
 * On each dialog click
 * @param  {string} id        The id of the list that was clicked
 * @param  {integer} index     The index of the selected item
 * @param  {integer} old_index The id of the previously selected item
 */
function dialog_clicked(id, index, old_index){
	if(id == "select-user-type"){
		var item = $("#" + id + " li.selected");
		if (item.hasClass("enable-fields")) {
			item.closest("fieldset").find(".fields .field.disabled").removeClass("disabled").removeAttr("disabled");
			item.closest("fieldset").find(".fields input:checkbox").removeAttr("disabled");
		} else {
			resetClicked(true);
		}
	}
}

/**
 * Function that is called by the reset button after the default resets have been executed
 * @param  {boolean} resetOnlyLimits Is used to define if the function was called by the dropdown, so we need to run some default resets ourselves
 */
function resetClicked(resetOnlyLimits){
	$(".apply-limit").removeAttr("checked").addClass("disabled").attr("disabled", true);	
	$(".has-limit").addClass("disabled").attr("disabled", true);	
	if(resetOnlyLimits){
		$(".has-limit").val("").closest(".step").find(".validation-error").remove();
	}
}

$(document).ready(function(){

	/**
	 * ON LOAD
	 */
	
	var validator = new Validator();

	/**
	 * EVENTS
	 */

	//email validation on blur
	$("#email").blur(function() {
		if ($(this).val() != "") {
			var validations = [
				[$(this), "is_email", "not_valid_email"],
			];
			validator.validate(validations, false, true);
		}
	});

	if ($("span.restoredState").text() != ""){
		restore_state($("span.restoredState").text());
	}
	
	/**
	 * FORM SUBMIT
	 */
	$("form").submit(function() {
		var validations = [
			[$("#email"), "is_email", "not_valid_email"]
		];
		var submit_status = validator.validate(validations, true, true);

		if(submit_status && $(".validation-error").length == 0){
			save_state();
			fill_hidden_fields();
			show_loading(false);
		}

		return submit_status;
	});

	/**
	 * Is called upon successfull submit to fill the hidden fields that are sent to the server
	 */
	function fill_hidden_fields(){

		$("input[name=username]").val($("#username").val());
		$("input[name=DecTokenReferenceNumber]").val($("#token-reference-number").val());
		$("input[name=TokenReferenceNumber]").val($("#token-reference-number").val());
		$("input[name=email]").val($("#email").val());
		$("input[name=FirstName]").val($("#first-name").val());
		$("input[name=LastName]").val($("#last-name").val());
		$("input[name=UserType]").val($("#select-user-type li.selected .hidden-value.user-type").text());
		$("input[name=MaxTransferAmount]").val($("#transfer-limit").val());
		$("input[name=MaxPaymentAmount]").val($("#payment-limit").val());

	}

});