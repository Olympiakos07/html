var page_type = 'domestic';

$(document).ready(function(){

	//=====ON LOAD=====//
	fill_form();

	$(document).on("blur", "#beneficiary-iban-domestic", function(){
		$(this).closest(".step").find(".validation-error").remove();
	});
	
	//=====SUBMIT=====//
	$("form").off('submit');
	$("form").submit(function(){
		var validations = [
			[$("#beneficiary-iban-domestic"), "not_empty", "not_empty"],
			[$("#beneficiary-name"), "not_empty", "not_empty"],
			[$("#from-account-list"), "has_selected", "not_selected"],
			[$("#payment-details-line-1"), "not_empty", "not_empty"],
			[$("#template-name"), "not_empty", "not_empty"],
			[$("#payment-order-no"), "not_empty", "not_empty"]
		];

		if($("#available-for-mobile li.selected").hasClass("available")){
			var validation = [$("#amount-textfield"), "valid_amount", "not_valid_amount"];
			validations.push(validation);				
			var validation = [$("#amount-textfield"), "not_zero", "amount_zero"];
			validations.push(validation);
			var validation = [[$("#amount-textfield"), "max", max_amount], "compare_numbers", "amount_over_limit"];
			validations.push(validation);
			var validation = [$("#amount-textfield"), "not_empty", "not_empty"];
			validations.push(validation);
		}

		if($("#beneficiary-id").val() != "" ||
		   $("#beneficiary-iban-domestic").val().replace(/ /g, "").substring(4, 8).toUpperCase() == "TREZ"
		){
			validation = [$("#beneficiary-id"), "has_number", "no_number"];
			validations.push(validation);
			validation = [$("#beneficiary-id"), "not_empty", "not_empty"];
			validations.push(validation);
		}

		var validator = new Validator();
		var submit_status = validator.validate(validations, true, true);
		
		console.log("submit_status="+submit_status);
		
		if($("span.validation-error").length != 0)
			submit_status = false;

		if(submit_status == true ){
			fill_hidden_fields();
			authorization.call();
		}

		return false;
	});

	//=====CREATE AND FILL HIDDEN FIELDS=====//
	function fill_hidden_fields(){
		// fill in hidden fields
		var IBANAccountNumber = $("#beneficiary-iban-domestic").val();
		IBANAccountNumber = IBANAccountNumber.replace(/\s/g,'');
		var FromAccount = find_selected_account_number("#from-account-list", "-1");
		var desc1 = $("#payment-details-line-1").val();
		var desc2 = $("#payment-details-line-2").val();
		var PaymentOrderNum = $("#payment-order-no").val();
		var BeneficiaryIdentification = $("#beneficiary-id").val();
		var BeneficiaryFullName = $("#beneficiary-name").val();
		var TransactionTemplateName = $("#template-name").val();
		var transactionId = '0111';
		var ActionFlag = $('span.hidden-value.action-mode').text();


		submit_data = {
			"IBANAccountNumber": IBANAccountNumber,
			"FromAccount": FromAccount,
			"DetailsOfPayment1": desc1,
			"DetailsOfPayment2": desc2,
			"PaymentOrder": PaymentOrderNum,
			"transactionTemplateName": TransactionTemplateName,
			"BeneficiaryIdentification": BeneficiaryIdentification,
			"BeneficiaryFullName": BeneficiaryFullName,
			"fromTransactionID": transactionId,
			"actionFlag" : ActionFlag
		}
		
		if ( ActionFlag === template_action_modify ){
			submit_data.transactionTemplate = $("#manage-templates-list li.selected span.hidden-value.transaction-template").text();
		}

		general_fill_hidden_fields();
	}

	//populate the form with the data by the hidden fields
	function fill_form(){
		$("#beneficiary-iban-domestic").val($("input[name=IBANAccountNumber]").val());
		var index = find_account_index("from-account-list", $("input[name=FromAccount]").val());
		$("#from-account-list li:eq(" + index + ")").addClass("selected");
		$("#payment-details-line-1").val($("input[name=DetailsOfPayment1]").val()).blur();
		$("#payment-details-line-2").val($("input[name=DetailsOfPayment2]").val()).blur();
		$("#payment-order-no").val($("input[name=PaymentOrder]").val());
		$("#template-name").val($("input[name=transactionTemplateName]").val());
		$("#beneficiary-id").val($("input[name=BeneficiaryIdentification]").val());
		$("#beneficiary-name").val($("input[name=BeneficiaryFullName]").val());
		
		general_fill_form();

	}
});