var displayVariable = "table-cell";

$(document).ready(function(){

	//=====ON LOAD=====//
	var min_amount = 0;
	var min_amount_txt = "0";
	var currency = "RON";

	//=====EVENTS=====//
	//reset
	$(".reset").click(function(){
		$(".fail, .success, .validation-error").remove();
		if($(".fields.to-my-account").length > 0) {
			$(".fields.to-other-account").hide(400);
			$(".fields.to-my-account").delay(500).show(400);
		}
		min_amount = 0;
	});

	$("#select-recipient-choise li").click(function(){
		if($(this).hasClass("to-my-account")){
			//reset
			$("#to-account-list li").removeClass("selected");
			$("#step-3 .helper").empty();
			//
			$(".fields.to-other-account").hide(400);
			$(".fields.to-my-account").delay(500).show(400);
			//
			$("#from-account-list-ToThird").parent().parent().css("display", "none");
			$("#from-account-list-ToOwn").parent().parent().css("display", displayVariable);
		}else if($(this).hasClass("to-other-account")){
			//reset
			$("#other-account").val("");
			$("#step-3 .helper").empty();
			//
			$(".fields.to-my-account").hide(400);
			$(".fields.to-other-account").delay(500).show(400);
			//
			$("#from-account-list-ToOwn").parent().parent().css("display", "none");
			$("#from-account-list-ToThird").parent().parent().css("display", displayVariable);
		}
		$("#step-2").find(".helper").empty();
		$("#step-2").removeClass("active");
		$("#step-3 .helper").find(".fail").remove();
		$("#step-3 .helper").find(".success").remove();
	});

	$("#other-account").blur(function(){
		if($(this).val() != ""){
			account_validations.is_eligible();
		}else{
			$("#step-2").find(".helper").empty();
			$("#step-2").removeClass("active");
			$("#step-3 .helper").find(".fail").remove();
			$("#step-3 .helper").find(".success").remove();
		}
	});

	$("#transfer-amount").blur(function(){
		$(this).parent().find(".validation-error").remove();
		if($(this).val() != ""){
			$("#step-3").addClass("active");
			check_min_amount("-1");
		}
	});

	$("#from-account-list-ToOwn li, #from-account-list-ToThird li").click(function(){
		setTimeout(account_validations.cross_currency_validation, 100);
	});

	$("#to-account-list li").click(function(){
		var currency = find_account_currency($("#to-account-list li:eq("+$(this).index()+")"));
		min_amount = parseInt($("#to-account-list li:eq("+$(this).index()+") .hidden-value.minAmount").text());
		min_amount_txt = $("#to-account-list li:eq("+$(this).index()+") .hidden-value.minAmount").text();
		$("#step-3 .helper").empty().append("<span class='success'>The minimum amount is "+min_amount_txt+" "+currency+"</span><br/ >");
		check_min_amount($(this).index());
		setTimeout(account_validations.cross_currency_validation, 100);
	});

	$("#transfer-amount").keyup(function(event){
		if(event.keyCode != "9"){
			check_min_amount("-1");
		}
	});

	function check_min_amount (index){
		var input = amount_to_number($("#transfer-amount").val());
		if(index == "-1"){
			if($("#to-account-list li.selected").length > 0){
				if($("#to-account-list li.selected").is(":visible")){
					min_amount = parseInt($("#to-account-list li.selected .hidden-value.minAmount").text());
					min_amount_txt = $("#to-account-list li.selected .hidden-value.minAmount").text();
					currency = find_account_currency($("#to-account-list li.selected"));
				}
			} else {
				min_amount_txt = $("#transfer-amount-helper span.amount").text()
				min_amount = amount_to_number($("#transfer-amount-helper span.amount").text());
				currency = $("#transfer-amount-helper span.currency").text()
			}	
		}else{
			if($("#to-account-list li.selected").is(":visible")){
				min_amount = parseInt($("#to-account-list li:eq("+index+") .hidden-value.minAmount").text());
				min_amount_txt = $("#to-account-list li:eq("+index+") .hidden-value.minAmount").text();
				currency = find_account_currency($("#to-account-list li:eq("+index+")"));
			}
		}

		if($("#transfer-amount").val() == ""){
			$("#step-3 .helper .fail").addClass("success").removeClass("fail");
		}
		if(($("#transfer-amount").val() != "" || index != "-1") && min_amount != 0){
			if(input < min_amount){
				console.log("bigger");
				$("#step-3 .helper").empty();
				$("#step-3 .helper").append(account_validations.create_message("fail", min_amount_txt, currency));
			}else{
				console.log("smaller");
				$("#step-3 .helper").empty().append(account_validations.create_message("success", min_amount_txt, currency));
			}
		}
	}

	$("#comment-textfield").blur(function(){
		if($(this).val() != ""){
			$("#step-5").addClass("active");
		}
	});

	var account_validations = {
		
		cross_currency_validation: function(){
			if($("#from-account-list-ToOwn").is(":visible")){
				var currency_from = find_account_currency($("#from-account-list-ToOwn li.selected"));
			}else{
				var currency_from = find_account_currency($("#from-account-list-ToThird li.selected"));				
			}
			if($("#to-account-list").is(":visible")){
				var currency_to = find_account_currency($("#to-account-list li.selected"));
			}else{
				var currency_to = $("#step-3 .helper span.currency").text();
			}

			if(currency_to != currency_from && currency_from != "" && currency_to != ""){
				$("#modal-0").dialog("open");
				return false;
			}else{
				return true;
			}
		},

		is_eligible: function(){
			show_loading(true);
			toAccount = $("#other-account").val();
			$.post(
					$("input[name=entryPointTranToTimeAccnt]").val(),
					{
						operation:			$("input[name=operationTranToTimeAccnt]").val(),
						//conversationId:	conversationId, NOT REQUIRED FOR THIS CALL
						ToAccount:			toAccount
					},
					function(jsArray){
						remove_loading();
						return account_validations.eligible_result(jsArray);
					}, 
					"json"
			);
		},

		eligible_result: function(jsArray){
			$("#step-2").find(".helper").text(jsArray.message);
			if(jsArray.isEligible == "1"){
				min_amount = parseFloat(jsArray.minDepositAmount);
				min_amount_txt = jsArray.minDepositAmount;
				currency = jsArray.minDepositAmountCurrency;
				$("#step-3 .helper").empty().append(account_validations.create_message("success", jsArray.minDepositAmount, jsArray.minDepositAmountCurrency));
				$("#step-2").addClass("active");
				$("#step-2").find(".helper").removeClass("validation-error");
				account_validations.cross_currency_validation(currency);
				check_min_amount("-1");
				return true;
			}else{
				$("#step-3 .helper").empty();
				$("#step-2").find(".helper").addClass("validation-error");
				min_amount = 0;
				return false;
			}
		},
		
		create_message: function(status, amount, currency){
			return "<span class='"+status+"'>The minimum amount is <span class='amount'>"+amount+"</span> <span class='currency'>"+currency+"</span></span><br/ >"
		}

	}

	if($("span.restoredState").text() != ""){
		setTimeout('restore_state($("span.restoredState").text())',1000);
		$(".step").addClass("active");
		setTimeout("min_amount_from_restore_state()", 2000);
	}

	//=====FORM SUBMIT/VALIDATIONS=====//
	$("form").submit(function(){
		
		if(min_amount == 0){
			if($("#to-account-list li.selected").length > 0){
				min_amount = parseFloat(amount_to_number($("#to-account-list li.selected .hidden-value.minAmount").text()));
			}else if($("#transfer-amount-helper span.amount").length > 0) {
				min_amount = $("#transfer-amount-helper span.amount").text();
			}	
		}
		
		if(account_validations.cross_currency_validation()) {
			var validations = [
				[$("#transfer-amount"), "valid_amount", "not_valid_amount"],
				[$("#transfer-amount"), "not_zero", "not_zero"]
			];
			
			if(min_amount != 0) {
				var validation = [[$("#transfer-amount"), "min", min_amount], "compare_numbers", "empty_string"];
				validations.push(validation);
			}
	
			if($(".fields.to-my-account").is(":visible")){
				var validation = [$("#to-account-list"), "has_selected", "not_selected_account"];
				validations.push(validation);
			}else{
				var validation = [$("#other-account"), "not_empty", "not_empty"];
				validations.push(validation);
			}
	
			if($("#from-account-list-ToOwn").is(":visible")){
				var validation = [$("#from-account-list-ToOwn"), "has_selected", "not_selected_account"];
				validations.push(validation);
			}
	
			if($("#from-account-list-ToThird").is(":visible")){
				var validation = [$("#from-account-list-ToThird"), "has_selected", "not_selected_account"];
				validations.push(validation);
			}
			
			if($("#transaction-planner-dialog li:last").hasClass("selected")){
				var validation = [$("#recurring-interval"), "not_empty", "not_empty"];
				validations.push(validation);
				validation = [$("#recurring-interval"), "not_zero", "not_zero"];
				validations.push(validation);
			}
	
			var validator = new Validator();
			var submit_status = validator.validate(validations, true, true);
			
	/*		if(submit_status == true){
				if($(".fields.to-my-account").is(":visible")){
					submit_status = account_validations.cross_currency_validation();
				}else{
					submit_status = account_validations.is_eligible();
				}
			}
	*/
			if(submit_status == true){
				if($(".fields.to-my-account").is(":visible")){
					submit_status = account_validations.cross_currency_validation();
				}else{
					if($(".to-other-account .helper").text() != "" && !$(".to-other-account .helper").hasClass("validation-error"))
						submit_status = true;
					else
						submit_status = false;
				}
			}
			
			if($("*").find(".fail").length > 0){
				submit_status = false;
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
		} 
		else 
			return false;
	});

	//=====CREATE AND FILL HIDDEN FIELDS=====//
	function fill_hidden_fields(){

		if($("#from-account-list-ToOwn").is(":visible")){
			var from_account_list = "#from-account-list-ToOwn";
		}else{
			var from_account_list = "#from-account-list-ToThird";
		}

		var fromAccount = find_selected_account_number(from_account_list, "-1");
		if($(".fields.to-my-account").is(":visible")){
			var toAccount = find_selected_account_number("#to-account-list", "-1");
		}else{
			var toAccount = $("#other-account").val();
		}
	
		console.log($("#select-recipient-choise li.selected .hidden-value").text());
		
		var txnType = $("#select-recipient-choise li.selected .hidden-value").text();
		if(txnType)
			$("input[name=TransferType]").val(txnType);
		$("input[name=FromAccount]").val(fromAccount);
		$("input[name=ToAccount]").val(toAccount);
		$("input[name=TransactionAmount]").val($("#transfer-amount").val());
		$("input[name=TransactionDate]").val($("#start-date").val());
		$("input[name=Comments]").val($("#comment-textfield").val());
		if($("#transaction-planner-dialog li:first").hasClass("selected")){
			var flag = "";
		}else{
			var flag = "on";
		}
		
		$("input[name=RepetitionFlag]").val(flag);
		$("input[name=RepetFreqEdit]").val($("#recurring-interval").val());
		if($("#recurring-duration-dialog li:first").hasClass("selected")){
			var combo = "D";
		}else{
			var combo = "M";
		}
		$("input[name=RepetFreqCombo]").val(combo);
		$("input[name=ExpirationDate]").val($("#end-date").val());
	}

})

	function min_amount_from_restore_state() {
		min_amount = $("#transfer-amount-helper span.amount").text();
	}