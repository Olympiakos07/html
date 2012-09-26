function resetClicked(){
	//show_utility_company_fields("none");
	$("#predefined-beneficiaries-utility-company li:eq(1)").click();
}

$(document).ready(function(){

	//=====ON LOAD=====//
	fill_form();

	//=====EVENTS=====//
/*	$(".reset").off('click');
	$(".reset").click(function(){
		show_utility_company_fields("none");
	});*/

	//on utility company select, show appropriate fields in step 4
	$("#predefined-beneficiaries-utility-company li").off('click');
	$("#predefined-beneficiaries-utility-company li:not(.non-selectable)").click(function(){
		//show correct utility company fields
		var temp = $(this).attr("id").split("-");
		var id = temp[2];
		show_utility_company_fields(id);
	});

	function show_utility_company_fields(id){
		$(".utility-company-fields").slideUp();
		$("#utility-company-fields-"+id).delay(500).slideDown();
	}

	//=====SUBMIT=====//
	$("form").off('submit');
	$("form").submit(function(){
		
		var validations = [
			[$("#predefined-beneficiaries-utility-company"), "has_selected", "not_selected"],
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

		$(".utility-company-fields input").each(function(){
			if($(this).is(":visible")){
				validation = [$(this), "not_empty", "not_empty"];
				validations.push(validation);
			}
		});

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
		var IBANAccountNumber = $("#predefined-beneficiaries-utility-company li.selected span.hidden-value.id").text();
		var FromAccount = find_selected_account_number("#from-account-list", "-1");
		var PaymentOrderNum = $("#payment-order-no").val();
		var TransactionTemplateName = $("#template-name").val();
		var transactionId = '0109';
		var ActionFlag = $('span.hidden-value.action-mode').text();

		submit_data = {
			"UtilityCompanyAccn": IBANAccountNumber,
			"FromAccount": FromAccount,
			"PaymentOrder": PaymentOrderNum,
			"transactionTemplateName": TransactionTemplateName,
			"fromTransactionID": transactionId,
			"actionFlag" : ActionFlag
		}
		
		$("#utility-company-fields-" +IBANAccountNumber+ " input").each(function(){
			submit_data[ $(this).attr('name') ] = $(this).val();
		});
		
		if ( ActionFlag === template_action_modify ){
			submit_data.transactionTemplate = $("#manage-templates-list li.selected span.hidden-value.transaction-template").text();
		}

		general_fill_hidden_fields();
	}

	//populate the form with the data by the hidden fields
	function fill_form(){
		var selected_company = $("input[name=UtilityCompanyAccn]").val();
		fill_selected_company_fields(selected_company);
		
		$("#predefined-beneficiaries-utility-company").val();
		var index = find_account_index("from-account-list", $("input[name=FromAccount]").val());
		$("#from-account-list li:eq(" + index + ")").addClass("selected");
		$("#payment-order-no").val($("input[name=PaymentOrder]").val());
		$("#template-name").val($("input[name=transactionTemplateName]").val());
		
		general_fill_form();
	}
	
	function fill_selected_company_fields(selected_company){
		if ( $('#predefined-beneficiaries-utility-company li#utility-company-' +selected_company).length >0 ){
			$('#predefined-beneficiaries-utility-company li').removeClass('selected');
			$('#predefined-beneficiaries-utility-company li#utility-company-' +selected_company).addClass('selected');
			show_utility_company_fields(selected_company);
			for (i=1; i<=10; i++){
				$('#utility-company-' +selected_company+ '-field-' +i).val( $('#idField' +i+ '_val').val() );
			}
		}
	}

});