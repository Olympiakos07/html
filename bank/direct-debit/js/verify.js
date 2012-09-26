function checkboxWithDialogClicked(id, open){
	if($("#save-beneficiary-dialog").hasClass("open") || $("#save-template-dialog").hasClass("open")){
	//if($(".checkbox-with-dialog").is(":checked")){
		$("input:submit").addClass("disabled").attr("disabled", true);
	}else{
		$("input:submit").removeClass("disabled").removeAttr("disabled");
	}
}

$(document).ready(function(){
	
	//=====ON LOAD=====//

	if( $("#template-mobile-limit").length > 0 ) {
		var max_amount_txt = $("#max-available-mobile-limit").val();
		var max_amount = amount_to_number(max_amount_txt);
	}

	//=====EVENTS=====//

	//on click, apply limit, remove errors
	$("#apply-maximum-limit").live("click", function(){
		$("#template-mobile-limit").val(max_amount_txt);
		$("#template-mobile-limit").parent().find(".validation-error").remove();
	});

	//cant be over max amount
	$("#template-mobile-limit").keyup(function(event){
		//if he changed the value from max amount limit, remove checkbox
		if($(this).val() != max_amount_txt){
			$("#apply-maximum-limit").removeAttr("checked");
		}
		
	});

	//on form submit
	$("input:submit").click(function(){
		if($("#password").length > 0) {
			var validations = [
				[$("#password"), "not_empty", "authorization_code_is_empty"]
			];
			var validator = new Validator();
			var submit_status = validator.validate(validations, true, true);
		}else{
			submit_status = true;
		}

		if(submit_status){
			fill_hidden_fields();
			show_loading(false);
		}
		
		return submit_status;
	});

	$("#save-beneficiary-dialog .button.close-parent-dialog").click(function(){
		if($("#beneficiary-checkbox").length > 0){
			validations = [
				[$("#beneficiary-name-to-save"), "not_empty", "beneficiary_name_is_empty"]
			];
			var validator = new Validator();
			var submit_status = validator.validate(validations, true, true);
		}
	});

	$("#save-template-dialog .button.close-parent-dialog").click(function(){
		if($("#template-checkbox").length > 0){
			validations = [
				[$("#template-name-to-save"), "not_empty", "template_name_is_empty"]
			];
			if($("#template-is-for-mobile").is(":checked")){
				var validation = [$("#template-mobile-limit"), "not_empty", "not_empty"]
				validations.push(validation);
				validation = [[$("#template-mobile-limit"), "max", max_amount], "compare_numbers", "amount_over_limit"];
				validations.push(validation);
			}
			var validator = new Validator();
			var submit_status = validator.validate(validations, true, true);
		}
	});

	$("#template-is-for-mobile").click(function(){
		if($(this).is(":checked")){
			$("#template-mobile-limit").removeClass("disabled").removeAttr("disabled");
			$("#apply-maximum-limit").removeClass("disabled").removeAttr("disabled");
		}else{
			$("#template-mobile-limit").addClass("disabled").attr("disabled", true);
			$("#apply-maximum-limit").addClass("disabled").attr("disabled", true);
		}
	})

	$("#cancel").click(function(){
		show_loading(false);
		$("input[name=nextPage]").val($(".hidden-value.cancelNextPage").text());
		$("form").submit();
	});
});

function fill_hidden_fields() {
	if($("#template-checkbox").length > 0 && $("#template-checkbox").is(":checked")){
		$("input[name=transactionTemplateName]").val($("#template-name-to-save").val());
		
		if($("#template-is-for-mobile").length > 0 && $("#template-is-for-mobile").is(":checked")){
			$("input[name=MobileLimit]").val($("#template-mobile-limit").val());
			if($("#apply-maximum-limit").length > 0 && $("#apply-maximum-limit").is(":checked")){
				$("input[name=MobileLimit]").val("-1");
			}
		}
	}
	if($("#beneficiary-checkbox").length > 0 && $("#beneficiary-checkbox").is(":checked")){
		$("input[name=BeneficiaryDescription]").val($("#beneficiary-name-to-save").val());
	}
	
}