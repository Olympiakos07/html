displayVariable = "table-cell";

$(document).ready(function() {

	//=====ON LOAD=====//

	var max_amount = $(".max-amount").text();
	var char = max_amount.substring(max_amount.length-3, max_amount.length-2);
	if(char == "." || char == ","){
		max_amount = max_amount.substring(0, max_amount.length-3);
		var cents = max_amount.substring(max_amount.length-2, max_amount.length);
	}
	//replace , and .
	max_amount = amount_to_number(max_amount);//.replace(",", "");//.replace(".", "");
	//add cents again, its a number, so its a .
	max_amount = parseInt(max_amount+"."+cents);

	//set date to today
	$("#start-date").val(today_date);

	// restore_state("#third-party-name|input|asfsvs~#utility-company-0-field-1|input|~#utility-company-0-field-2|input|~#utility-company-0-field-3|input|~#utility-company-1-field-0|input|~#utility-company-1-field-2|input|~#utility-company-1-field-3|input|~#utility-company-2-field-1|input|~#utility-company-2-field-2|input|~#utility-company-2-field-3|input|~#utility-company-3-field-1|input|~#utility-company-3-field-2|input|~#utility-company-3-field-3|input|~#utility-company-4-field-1|input|~#utility-company-4-field-2|input|~#utility-company-4-field-3|input|~#utility-company-5-field-1|input|sfws~#utility-company-5-field-2|input|efwsd~#utility-company-5-field-3|input|fsdf~#amount-textfield|input|32.00~#start-date|input|07/12/2011~#third-party|checkbox|true~#apply-maximum-limit|checkbox|false~#utility-company-list|list|6~#from-account-list|list|2~#third-party-name-label-container|visibility|block~#third-party-name-container|visibility|block~#utility-company-fields-none|visibility|none~#utility-company-fields-0|visibility|none~#utility-company-fields-1|visibility|none~#utility-company-fields-2|visibility|none~#utility-company-fields-3|visibility|none~#utility-company-fields-4|visibility|none~#utility-company-fields-5|visibility|table-cell");
	if($("span.restoredState").text() != ""){
		restore_state($("span.restoredState").text());
	}
	
	//=====RESET=====//
	$("#main .form-header .reset").click(function(){
		$("#step-1").addClass("active");
		$("#utility-company-list li:eq(1)").addClass("selected");
		var temp = $("#utility-company-list li:eq(1)").attr("id").split("-");
		var id = temp[2];
		show_company_filters(id);
		//step 3 fix
		$("#third-party").removeAttr("checked");
		$("#third-party").parent().next().slideUp().removeClass("open");
		$("#third-party").parent().next().next().slideUp().removeClass("open");
		//uncheck
		$("#apply-maximum-limit").removeAttr("checked");
	});

	//=====EVENTS=====//

	$("#step-1 li").live("click", function(){
		if($(this).hasClass("filter")){
			$("#step-1").removeClass("active");
		}
		//also remove active from step 4
		$("#step-4").removeClass("active");
	});

	//open/close third party fields
	$("#third-party").click(function(){
		var label = $(this).parent().next();
		var input = $(this).parent().next().next();
		if(label.hasClass("open")){
			label.slideUp().removeClass("open");
			input.slideUp().removeClass("open");
		}else{
			label.slideDown().addClass("open");
			input.slideDown().addClass("open");
		}
	});
	
	//on utility company select, show appropriate fields in step 4
	$("#utility-company-list li").live("click", function(){
		//show correct utility company fields
		var temp = $(this).attr("id").split("-");
		var id = temp[2];
		show_company_filters(id);
	});

	//on utility company field change, remove error
	$("#step-4 .field").live("keyup", function(){
		var fieldIAmTypingIn = $(this);
		$(this).parent().find(".validation-error").remove();
		//check if fields are empty to remove active state from step, and vica versa
		var allFieldsAreFilled = true;
		$("#step-4 .content:visible .fields:visible").each(function(){
			if($(this).children(".field").val() == "") {
				allFieldsAreFilled = false;
			}
		});
		if (allFieldsAreFilled) {
			fieldIAmTypingIn.closest(".step").addClass("active");
		} else {
			fieldIAmTypingIn.closest(".step").removeClass("active");
		}
	});

	//on click, apply limit, remove errors
	$("#apply-maximum-limit").live("click", function(){
		$("#amount-textfield").val($(".max-amount").text());
		$("#amount-textfield").parent().find(".validation-error").remove();
	});

	//on third party checkbox, remove error
	$("#third-party").live("click", function(){
		if(!$(this).is(':checked')){
			$("#third-party-name").parent().find(".validation-error").remove();
		}
	});

	//on third party change, remove error
	$("#third-party-name").live("keyup", function(){
		$(this).parent().find(".validation-error").remove();
	});

	//=====REAL TIME VALIDATIONS=====//
	//cant be empty
	$("#third-party-name").keyup(function(){
		var validations = [
			[$("#third-party-name"), "not_empty", "not_empty"]
		];
		var validator = new Validator();
		var status = validator.validate(validations, false, true);
		if(status){
			$(this).closest(".step").addClass("active");
		}else{
			$(this).closest(".step").removeClass("active");
		}
	});
	
	//cant be over max amount
	$("#amount-textfield").keyup(function(event){
		//if he changed the value from max amount limit, remove checkbox
		var limit = amount_to_number($(".max-amount").text());//replace(new RegExp(removed_separator, 'g'), "");
		if($(this).val() != limit){
			$("#apply-maximum-limit").removeAttr("checked");
		}
	});

	$("#amount-textfield").live("blur", function(){
		//validate amount
		var validations = [
		    [$("#amount-textfield"), "not_zero", "amount_zero"],
			[[$("#amount-textfield"), "max", max_amount], "compare_numbers", "amount_over_limit"],
			[$("#amount-textfield"), "valid_amount", "invalid_amount"]
		];
		var validator = new Validator();
		var status = validator.validate(validations, false, true);
		//add/remove class active
		if(status){
			$(this).closest(".step").addClass("active");
			$("#step-5").find(".validation-error").remove();
		}else{
			$(this).closest(".step").removeClass("active");
		}
		if($(this).val() == ""){
			$(this).closest(".step").removeClass("active");
		}
	});

	//on calendar date click..
	$("a.ui-state-default").live("click", function(){
		$("#step-6").addClass("active");
		$("#step-6").find(".validation-error").remove();
	});
	
	//=====VALIDATIONS=====//
	$("form").submit(function(){

		var validations = [
			[$("#utility-company-list"), "has_selected", "not_selected_company"],
			[$("#from-account-list"), "has_selected", "not_selected_account"],
			[$("#amount-textfield"), "valid_amount", "not_valid_amount"],
			[$("#amount-textfield"), "not_zero", "amount_zero"],
			[[$("#amount-textfield"), "max", max_amount], "compare_numbers", "amount_over_limit"],
			[$("#start-date"), "not_empty", "not_empty_date"],
			[$("#terms-checkbox"), "is_checked", "not_agreed_with_terms"]

		];

		if(!$("#step-4 .content:visible .fields:eq(0)").hasClass("hidden") && $("#step-4 .content:visible .fields:eq(0) .field").hasClass("save-state")){
			var validation = [$("#step-4 .content:visible .field:eq(0)"), "not_empty", "not_empty"];
			validations.push(validation);
		}
		if(!$("#step-4 .content:visible .fields:eq(1)").hasClass("hidden")){
			var validation = [$("#step-4 .content:visible .field:eq(1)"), "not_empty", "not_empty"];
			validations.push(validation);
		}
		if(!$("#step-4 .content:visible .fields:eq(2)").hasClass("hidden")){
			var validation = [$("#step-4 .content:visible .field:eq(2)"), "not_empty", "not_empty"];
			validations.push(validation);
		}

		if($("#third-party").is(':checked')){
			var validation = [$("#third-party-name"), "not_empty", "not_empty"];
			validations.push(validation);
		}
		
		var validator = new Validator();
		var submit_status = validator.validate(validations, true, true);

		console.log("submit_status="+submit_status);

		if($("span.validation-error").length != 0)
			submit_status = false;
		
		if(submit_status == true){
			save_state();
			//remove company fields that are not visible
			$(".utility-company-fields").each(function(){
				if(!$(this).is(":visible")){
					$(this).remove();
				}
			})
			//fill in the hidden fields
			create_hidden_fields();
			show_loading(false);
		}

		return submit_status;
	});

	function show_company_filters(id){
		$("#step-4").find(".content").css("display", "none");
		$("#step-4").find(".content").find(".field").val("");
		//$("#step-4").find(".content").find(".field").attr("disabled", "disabled");
		//display, enable these fields
		$("#step-4").find("#utility-company-fields-"+id).css("display", displayVariable);
		//$("#step-4").find("#utility-company-fields-"+id).find(".field").removeAttr("disabled");
		//also remove errors
		$("#step-4").find(".validation-error").remove();
		//z-index ie bug
		$(".utility-company-fields label").css("z-index", "99999");
	}

	//=====CREATE AND FILL HIDDEN FIELDS=====//
	function create_hidden_fields(){
		
		//find values
		var utilityCompanyId1 = $("#utility-company-list li.selected span.hidden-value.companyId1").text();
		var utilityCompanyId2 = $("#utility-company-list li.selected span.hidden-value.companyId2").text();
		var startDate = $("#start-date").val();
		var maxAmount = $("#amount-textfield").val();
//		var total = $("#from-account-list li.selected span.total").text();
//		var currency = total.substr( total.length-3 );
		//var account = $("#from-account-list li.selected span.hidden-value.fromAccount").text();
		var account = find_selected_account_number("#from-account-list", "-1");
		
		if ( $("#third-party:checked").length > 0 ){
			$("input[name='thirdParty']").val("1");
			$("input[name='thirdParty_name']").val( $("#third-party-name").val() );
		}
		
		// fill in hidden fields
		$("input[name='utilityCompanyId1']").val(utilityCompanyId1);
		$("input[name='utilityCompanyId2']").val(utilityCompanyId2);
		$("input[name='StartDate']").val(startDate);
		$("input[name='TransactionAmount']").val(maxAmount);
//		$("input[name='TransactionCurrency']").val(currency);
		$("input[name='FromAccount']").val(account);
	}

});
