var page_type = 'intrabank';

$(document).ready(function(){
	
	//=====ON LOAD=====//
	fill_form();

	//=====SUBMIT=====//
	$("form").off('submit');
	$("form").submit(function(){
		var validations = [
			[$("#beneficiary-iban-intrabank"), "not_empty", "not_empty"],
			[$("#from-account-list"), "has_selected", "not_selected"],
			[$("#template-name"), "not_empty", "not_empty"]
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

		var validator = new Validator();
		var submit_status = validator.validate(validations, true, true);
		
		console.log("submit_status="+submit_status);
		
		if($("span.validation-error").length != 0)
			submit_status = false;

		if(submit_status == true){
			fill_hidden_fields();
			authorization.call();
		}

		return false;
	});

	//=====CREATE AND FILL HIDDEN FIELDS=====//
	function fill_hidden_fields(){
		// fill in hidden fields
		var IBANAccountNumber = $("#beneficiary-iban-intrabank").val();
		IBANAccountNumber = IBANAccountNumber.replace(/\s/g,'');
		var ToAccount = IBANAccountNumber;
		if ( ToAccount.length >=10 ){
			ToAccount = ToAccount.substr(ToAccount.length-10);
		}
		var FromAccount = find_selected_account_number("#from-account-list", "-1");
		var Comments = $("#payment-details-line-1").val();
		var secondDescr = $("#payment-details-line-2").val();
		var PaymentOrderNo = $("#payment-order-no").val();
		var TransactionTemplateName = $("#template-name").val();
		var transactionId = '0009';
		var ActionFlag = $('span.hidden-value.action-mode').text();
		
		submit_data = {
			"ToAccount": ToAccount,
			"IBANAccountNumber": IBANAccountNumber,
			"FromAccount": FromAccount,
			"Comments": Comments,
			"SecondDescription": secondDescr,
			"PaymentOrder": PaymentOrderNo,
			"transactionTemplateName": TransactionTemplateName,
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
		$("#beneficiary-iban-intrabank").val($("input[name=IBANAccountNumber]").val());
		var index = find_account_index("from-account-list", $("input[name=FromAccount]").val());
		$("#from-account-list li:eq(" + index + ")").addClass("selected");
		$("#payment-details-line-1").val($("input[name=Comments]").val()).blur();
		$("#payment-details-line-2").val($("input[name=SecondDescription]").val()).blur();
		$("#template-name").val($("input[name=transactionTemplateName]").val());
		$("#payment-order-no").val($("input[name=PaymentOrder]").val());
		
		general_fill_form();
	}
});