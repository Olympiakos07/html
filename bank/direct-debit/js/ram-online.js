var page_mode;
function find_page_mode(){
	if($("#templates-list").is(":visible")){
		page_mode = "saved-template";
	}else if($("#predefined-beneficiaries-ram-fund").is(":visible")){
		page_mode = "select-asset";
	}
}
find_page_mode();

function update_visibles(){
	if(page_mode != "saved-template"){
		$("#templates-list").slideUp();
		$("#predefined-beneficiaries-ram-fund").delay(500).slideDown();
	}else{
		$("#predefined-beneficiaries-ram-fund").slideUp();
		$("#templates-list").delay(500).slideDown();
	}
	
	setTimeout(function(){mainHeightFix()}, 1000);
}

function list_clicked(id, index, old_index){
	if(id == "templates-list"){
		ramTemplate_onClick();
		//scroll.list(200);
		$("#from-account-list li.selected").click();
	}else if(id == "from-account-list"){
		var currency = find_account_currency($("#from-account-list li.selected"));
		$("#currency-iso").text(currency);
	}
	$("#step-1, #step-2").find(".validation-error").remove();
}

function list_action_clicked(id, index, action){
	page_mode = "select-asset";
	//update_visibles();
	ramTemplate_onClick();
	$("#recipient-choice-dialog li:last").click();
	//and select
//	$("#predefined-beneficiaries-ram-fund li").each(function(){
//		if($(this).find("a span").text().replace(/ /g, "") == $("#templates-list li:eq("+index+") .hidden-value.toAccountSecond").text()){
//			$(this).addClass("selected");
//		}
//	});
	
}

function dialog_clicked(id, index, old_index){
	if(id == "recipient-choice-dialog"){
		if($("#" + id + " li:eq(" + index + ")").hasClass("saved-templates")){
			page_mode = "saved-template";
			update_visibles();
		}else{
			page_mode = "select-asset";	
			update_visibles();
		}
		$(".reset").click();
	}else if(id == "is-3rd-party"){
		if(index == 1){
			$(this).closest(".step").find(".validation-error").remove();
			$(".no-3rd-party-fields").slideUp().removeClass("open");
			$(".yes-3rd-party-fields").delay(400).slideDown().addClass("open");
		}else{
			$(".yes-3rd-party-fields").slideUp().removeClass("open");
			$(".no-3rd-party-fields").delay(400).slideDown().addClass("open");
		}
	}
}

function resetClicked(){
	$("#is-3rd-party li:first").click();
}

$(document).ready(function() {

	//=====ON LOAD=====//
	setTimeout(function(){find_page_mode()}, 2000);
	
	$("#predefined-beneficiaries-ram-fund li a span").each(function(){
		$(this).text(split_iban($(this).text()));
	});

	//=====EVENTS=====//
	
//	$("#third-party-name, #third-party-cnp").change(function(){
//		var name = $("#third-party-name").val();
//		var cnp = $("#third-party-cnp").val();
//		if(name != "" && cnp != ""){
//			$("#step-5").addClass("active").removeClass("error");
//		}else{
//			$("#step-5").removeClass("active");
//		}
//	});

	if($("span.restoredState").text() != ""){
		restore_state($("span.restoredState").text());
		setTimeout(function(){find_page_mode()}, 500);
		scroll.list(500);
	}

	//=====SUBMIT=====//
	$("form").submit(function(){
		var validations = [
			[$("#from-account-list"), "has_selected", "not_selected"],
			[$("#amount-textfield"), "valid_amount", "invalid_amount"],
			[$("#amount-textfield"), "not_zero", "amount_zero"],
		];

		if(page_mode == "saved-template"){
			var validation = [$("#templates-list"), "has_selected", "not_selected"];
			validations.push(validation);
		}else if(page_mode == "select-asset"){
			var validation = [$("#predefined-beneficiaries-ram-fund"), "has_selected", "not_selected"];
			validations.push(validation);
		}

		if($("#is-3rd-party li.selected span.yes-3rd-party").length > 0){
			validation = [$("#third-party-name"), "not_empty", "not_empty"];
			validations.push(validation);
			validation = [$("#third-party-cnp"), "not_empty", "not_empty"];
			validations.push(validation);
		}

		if($("#transaction-planner-dialog li:last").hasClass("selected")){
			var validation = [$("#recurring-interval"), "not_empty", "not_empty"];
			validations.push(validation);
			validation = [$("#recurring-interval"), "not_zero", "amount_zero"];
			validations.push(validation);
		}

		var validator = new Validator();
		var submit_status = validator.validate(validations, true, true);

		//cross currency is not allowed
		if (submit_status){
			var currency2 = find_account_currency($("#from-account-list li.selected"));
			var currency1 = $("#predefined-beneficiaries-ram-fund li.selected .hidden-value.currency").text();
			var foundError = validator.checkEquality([currency1, "equal", currency2]);
			if(foundError){
				submit_status = false;
				validator.displayError($("#from-account-list"), "not_equal", "not_equal");
			}
		}
		console.log("submit_status="+submit_status);

		if($("span.validation-error").length != 0)
			submit_status = false;
		
		if(submit_status == true){
			save_state();
			//fill in the hidden fields
			fill_hidden_fields();
			show_loading();
		}

		return submit_status;
	});

	//=====CREATE AND FILL HIDDEN FIELDS=====//
	function fill_hidden_fields(){
		// fill in hidden fields
		$("input[name=ToAccount]").val($("#predefined-beneficiaries-ram-fund li.selected .hidden-value.id").text());
		$("input[name=FromAccount]").val(find_selected_account_number("#from-account-list", "-1"));
		$("input[name=TransactionDate]").val($("#start-date").val());
		$("input[name=TransactionAmount]").val($("#amount-textfield").val());
		
		if($("#is-3rd-party li.selected span.no-3rd-party").length>0){
			$("input[name=thirdParty]").val("0");
		}else{
			$("input[name=thirdParty]").val("1");
			$("input[name=thirdParty_cnp]").val($("#third-party-cnp").val());
			$("input[name=thirdParty_name]").val($("#third-party-name").val());
		}
		
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

});