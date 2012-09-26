$(document).ready(function(){
	
	if($("span.restoredState").text() != ""){
		restore_state($("span.restoredState").text());
	}
	
	$("#from-account-list li, #to-account-list li").click(function(){
		setTimeout(account_validations.cross_currency_validation, 100);
	});

	//check ownership ajax validation and cross currency
	var account_validations = {

		//check the currencis of from and to accounts
		//display error if they are not the same
		cross_currency_validation: function(){
			var currency_from = find_account_currency($("#from-account-list li.selected"));
			var currency_to = find_account_currency($("#to-account-list li.selected"));
			if(currency_to != currency_from && currency_from != "" && currency_to != ""){
				$("#modal-0").dialog("open");
				return false;
			}else{
				return true;
			}
		}
	}

	//=====FORM SUBMIT/VALIDATIONS=====//
	$("form").submit(function(){
		var validations = [
			[$("#from-account-list"), "has_selected", "not_selected_account"],
			[$("#to-account-list"), "has_selected", "not_selected_account"]
		];

		var validator = new Validator();
		var submit_status = validator.validate(validations, true, true);

		if(submit_status == true){
			submit_status = account_validations.cross_currency_validation();
		}

		console.log("submit_status="+submit_status);

		if($("span.validation-error").length != 0)
			submit_status = false;
		
		if(submit_status == true){
			show_loading(false);
			save_state();
			fill_hidden_fields();
		}

		return submit_status;

	});

	//=====CREATE AND FILL HIDDEN FIELDS=====//
	function fill_hidden_fields(){
		var fromAccount = find_selected_account_number("#from-account-list", "-1");
		var toAccount = find_selected_account_number("#to-account-list", "-1");
			
		$("input[name=FromAccount]").val(fromAccount);
		$("input[name=ToAccount]").val(toAccount);
	}

});