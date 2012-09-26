$(document).ready(function(){

	//=====ON LOAD=====//
	var max_amount = 0;
	var max_amount_txt = "0";
	$("#start-date").val(today_date);

	//=====EVENTS=====//
	$(".reset").click(function(){
		$(".fail, .success").remove();
		$("#step-4").addClass("active");
		max_amount = 0;
	});

	$("#transfer-amount").blur(function(){
		if($(this).parent().find(".success").length > 0){
			$("#step-3").addClass("active");
		}else{
			$("#step-3").removeClass("active");			
		}
	});

	$("#comment-textfield").blur(function(){
		if($(this).val() != ""){
			$("#step-5").addClass("active");
		}else{
			$("#step-5").removeClass("active");			
		}
	});

	$("#from-account-list li").click(function(){
		var currency = find_account_currency($("#from-account-list li:eq("+$(this).index()+")"));
		max_amount = parseFloat(amount_to_number($("#from-account-list li:eq("+$(this).index()+") .hidden-value.maxAmount").text()));
		max_amount_txt = $("#from-account-list li:eq("+$(this).index()+") .hidden-value.maxAmount").text();
		$("#step-3 .helper").empty().append("<span class='success'>The maximum amount is "+max_amount_txt+" "+currency+"</span><br />");
		check_max_amount($(this).index());
		setTimeout(account_validations.cross_currency_validation, 100);
	});

	$("#to-account-list li").click(function(){
		setTimeout(account_validations.cross_currency_validation, 100);
	});

	$("#transfer-amount").keyup(function(){
		check_max_amount("-1");
	});

	//check ownership ajax validation and cross currency
	var account_validations = {

		//check the currencis of from and to accounts
		//display error if they are not the same
		//also validate ownership if asked
		cross_currency_validation: function(validate_ownership){
			var currency_from = find_account_currency($("#from-account-list li.selected"));
			var currency_to = find_account_currency($("#to-account-list li.selected"));
			if(currency_to != currency_from && currency_from != "" && currency_to != ""){
				$("#modal-0 .ownership").addClass("hidden");
				$("#modal-0 .cross-currency").removeClass("hidden");
				$("#modal-0").dialog("open");
				return false;
			}else{
				if(validate_ownership == false){
					return true;
				}else{
					account_validations.ownership_validation();
				}
			}
		},

		ownership_validation: function(){
			fromAccount = find_selected_account_number("#from-account-list", "-1");
			toAccount = find_selected_account_number("#to-account-list", "-1");

			//run the ajax request only if both accounts are selected
			if(fromAccount != "" && toAccount != ""){

				//this is a dummy response and must be replaced with the actual ajax request below
				if(fromAccount == "84762587"){
					var jsArray = {
						"haserrors": "0",
						"message": ""
					}
				}else{
					var jsArray = {
						"haserrors": "1",
						"message": "Its not your account error"
					}
				}
				return account_validations.display_error(jsArray);

				/*$.post(
					entryPoint,
					{operation:operation, conversationId:conversationId, FromAccount:fromAccount, ToAccount:toAccount},
					function(jsArray){
						account_validations.display_error(jsArray);
					}, 
					"json"
				);*/
			}
		},

		display_error: function(jsArray){
			console.log("inside display error");
			if(jsArray.haserrors == "1"){
				$("#modal-0 .ownership").removeClass("hidden").text(jsArray.message);
				$("#modal-0 .cross-currency").addClass("hidden");
				$("#modal-0").dialog("open");
				return false;
			}else{
				return true;
			}
		}
	}

	function check_max_amount (index){
		var input = parseFloat($("#transfer-amount").val().replace(",", ""));
		if(index == "-1"){
			if($("#from-account-list li.selected").length > 0){
				max_amount = parseFloat(amount_to_number($("#from-account-list li.selected .hidden-value.maxAmount").text()));
				max_amount_txt = $("#from-account-list li.selected .hidden-value.maxAmount").text();
				var currency = find_account_currency($("#from-account-list li.selected"));
			}	
		}else{
			max_amount = parseFloat(amount_to_number($("#from-account-list li:eq("+index+") .hidden-value.maxAmount").text()));
			max_amount_txt = $("#from-account-list li:eq("+index+") .hidden-value.maxAmount").text();
			var currency = find_account_currency($("#from-account-list li:eq("+index+")"));
		}
console.log("input="+input);
console.log("max_amount="+max_amount);
		if($("#transfer-amount").val() == ""){
			$("#step-3 .helper .fail").addClass("success").removeClass("fail");
		}
		if(($("#transfer-amount").val() != "" || index != "-1") && max_amount != 0){
			if(input > max_amount){
				console.log("bigger");
				$("#step-3 .helper").empty().append("<span class='fail'>The maximum amount is "+max_amount_txt+" "+currency+"</span><br />");
			}else{
				console.log("smaller");
				$("#step-3 .helper").empty().append("<span class='success'>The maximum amount is "+max_amount_txt+" "+currency+"</span><br />");
			}
		}
	}

	//=====FORM SUBMIT=====//
	$("form").submit(function(){

		if(max_amount == 0){
			if($("#from-account-list li.selected").length > 0){
				max_amount = parseFloat(amount_to_number($("#from-account-list li.selected .hidden-value.maxAmount").text()));
			}
		}

		var validations = [
			[$("#from-account-list"), "has_selected", "not_selected_account"],
			[$("#to-account-list"), "has_selected", "not_selected_account"],
			[$("#transfer-amount").val(), "valid_amount", "not_valid_amount"],
			[$("#transfer-amount").val(), "not_zero", "not_zero"]
		];

		if(max_amount != 0){
			var validation = [[$("#transfer-amount").val(), "max", max_amount], "compare_numbers", "empty_string"];
			validations.push(validation);
		}

		var submit_status = validator(validations, true);
		
		if($("span.validation-error").length != 0){
			submit_status = false;
		}

		if(submit_status == true){
			submit_status = account_validations.cross_currency_validation(false);
		}

		if($("span.validation-error").length != 0){
			submit_status = false;
		}

		if(submit_status == true){
			submit_status = account_validations.ownership_validation();
		}

		console.log("submit_status="+submit_status);

		if($("*").find(".fail").length > 0){
			submit_status = false;
		}

		if($("span.validation-error").length != 0){
			submit_status = false;
		}

		if(submit_status == true){
			show_loading();
			//save_state();
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
		$("input[name=TransactionAmount]").val($("#transfer-amount").val());
		$("input[name=TransactionDate]").val($("#start-date").val());
		$("input[name=Comments]").val($("#comment-textfield").val());
	}

})