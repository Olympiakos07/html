$(document).ready(function(){

	//=====ON LOAD=====//
	fill_form();

	//=====SUBMIT=====//
	$("form").off('submit');
	$("form").submit(function(){
		var validations = [
			[$("#from-account-list"), "has_selected", "not_selected"],
			[$("#beneficiary-iban-international"), "not_empty", "not_empty"],
			[$("#beneficiary-name-1"), "not_empty", "not_empty"],
			[[$("#beneficiary-bank-swift-code"), "min", 8], "char_length", "smaller_than_8"],
			[$("#beneficiary-bank-name"), "not_empty", "not_empty"],
			[$("#payment-details-line-1"), "not_empty", "not_empty"],
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
		var FromAccount = find_selected_account_number("#from-account-list", "-1");
		var TransactionTemplateName = $("#template-name").val();
		
		var BenAccount = $("#beneficiary-iban-international").val();
		var BenName1 = $("#beneficiary-name-1").val();
		var BenName2 = $("#beneficiary-name-2").val();
		var BenAdr = $("#beneficiary-address").val();
		var BenSwiftCode = $("#beneficiary-bank-swift-code").val();
		if($("#beneficiary-bank-name").val().length > 35){
			var BenBankName1 = $("#beneficiary-bank-name").val().substring(0, 35);
			var BenBankName2 = $("#beneficiary-bank-name").val().substring(35);
		}else{
			var BenBankName1 = $("#beneficiary-bank-name").val();
			var BenBankName2 = "";
		}
		var BenBankAdr = $("#beneficiary-bank-address").val();
		
		//
		var desc1 = $("#payment-details-line-1").val();
		var desc2 = $("#payment-details-line-2").val();
		var desc3 = $("#payment-details-line-3").val();
		var b2b1 = $("#bank-to-bank-info-1").val();
		var b2b2 = $("#bank-to-bank-info-2").val();
		var b2b3 = $("#bank-to-bank-info-3").val();
		var statCode = $("#statistical-code").val();
		var documents = $("#documents").val();
		var serviceType = $("#swift-priority-dialog li.selected .hidden-value").text();
		var chargeType = $("#swift-charges-dialog li.selected .hidden-value").text();
		var transactionId = '0137';
		var ActionFlag = $('span.hidden-value.action-mode').text();

		submit_data = {
			"FromAccount": FromAccount,
			"BenAccount": BenAccount,
			"BenName1": BenName1,
			"BenName2": BenName2,
			"BenAdr": BenAdr,
			"BenSwiftCode": BenSwiftCode,
			"BenBankName1": BenBankName1,
			"BenBankName2": BenBankName2,
			"BenBankAdr": BenBankAdr,
			"desc1": desc1,
			"desc2": desc2,
			"desc3": desc3,
			"b2b1": b2b1,
			"b2b2": b2b2,
			"b2b3": b2b3,
			"statCode": statCode,
			"documents": documents,
			"serviceType": serviceType,
			"chargeType": chargeType,
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
		$("#beneficiary-iban-international").val($("input[name=BenAccount]").val());
		var index = find_account_index("from-account-list", $("input[name=FromAccount]").val());
		$("#from-account-list li:eq(" + index + ")").addClass("selected");
		$("#template-name").val($("input[name=transactionTemplateName]").val());
		
		$("#beneficiary-name-1").val($("input[name=BenName1]").val());
		$("#beneficiary-name-2").val($("input[name=BenName2]").val());
		$("#beneficiary-address").val($("input[name=BenAdr]").val());
		$("#beneficiary-bank-swift-code").val($("input[name=BenSwiftCode]").val());
		$("#beneficiary-bank-name").val($("input[name=BenBankName1]").val() + $("input[name=BenBankName2]").val());
		$("#beneficiary-bank-address").val($("input[name=BenBankAdr]").val());
		$("#payment-details-line-1").val($("input[name=desc1]").val()).blur();
		$("#payment-details-line-2").val($("input[name=desc2]").val()).blur();
		$("#payment-details-line-3").val($("input[name=desc3]").val()).blur();
		$("#bank-to-bank-info-1").val($("input[name=b2b1]").val()).blur();
		$("#bank-to-bank-info-2").val($("input[name=b2b2]").val()).blur();
		$("#bank-to-bank-info-3").val($("input[name=b2b3]").val()).blur();
		$("#statistical-code").val($("input[name=statCode]").val()).blur();
		$("#documents").val($("input[name=documents]").val()).blur();
		
		var selected_service_type = $("input[name=serviceType]").val();
		$("#swift-priority-dialog li").each(function(){
			var service_type_code = $(this).find('span.hidden-value.code').text();
			if ( service_type_code === selected_service_type ){
				$("#swift-priority-dialog li").removeClass('selected');
				$(this).addClass('selected');
				var service_type_value = $(this).find('span.swift-priority-value').text();
				$("#swift-priority").text(service_type_value);
			}
		});
		
		var selected_charge_type = $("input[name=chargeType]").val();
		$("#swift-charges-dialog li").each(function(){
			var charge_type_code = $(this).find('span.hidden-value.code').text();
			if ( charge_type_code === selected_charge_type ){
				$("#swift-charges-dialog li").removeClass('selected');				
				$(this).addClass('selected');
				var charge_type_value = $(this).find('span.swift-charges-value').text();
				$("#swift-charges").text(charge_type_value);
			}
		});
		
		general_fill_form();
	}

});