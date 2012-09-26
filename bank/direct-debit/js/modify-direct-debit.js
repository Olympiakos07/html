$(document).ready(function() {
	
	//=====ON LOAD=====//
	
	//kyrD:20120215:Usability:directDebit start
	 var index = find_account_index("from-account-list",$("#fromAccountNumDummy").val());
     $("#from-account-list li:eq("+index+")").addClass("selected");
	//kyrD:20120215:Usability:directDebit end
	
	var max_amount = $(".max-amount").text();
	var char = max_amount.substring(max_amount.length-3, max_amount.length-2);
	if(char == "." || char == ","){
		max_amount = max_amount.substring(0, max_amount.length-3);
		var cents = max_amount.substring(max_amount.length-2, max_amount.length);
	}
	//replace , and .
	max_amount = max_amount.replace(",", "").replace(".", "");
	//add cents again, its a number, so its a .
	max_amount = parseInt(max_amount+"."+cents);


	// restore_state("#third-party-name|input|asfsvs~#utility-company-0-field-1|input|~#utility-company-0-field-2|input|~#utility-company-0-field-3|input|~#utility-company-1-field-0|input|~#utility-company-1-field-2|input|~#utility-company-1-field-3|input|~#utility-company-2-field-1|input|~#utility-company-2-field-2|input|~#utility-company-2-field-3|input|~#utility-company-3-field-1|input|~#utility-company-3-field-2|input|~#utility-company-3-field-3|input|~#utility-company-4-field-1|input|~#utility-company-4-field-2|input|~#utility-company-4-field-3|input|~#utility-company-5-field-1|input|sfws~#utility-company-5-field-2|input|efwsd~#utility-company-5-field-3|input|fsdf~#amount-textfield|input|32.00~#start-date|input|07/12/2011~#third-party|checkbox|true~#apply-maximum-limit|checkbox|false~#utility-company-list|list|6~#from-account-list|list|2~#third-party-name-label-container|visibility|block~#third-party-name-container|visibility|block~#utility-company-fields-none|visibility|none~#utility-company-fields-0|visibility|none~#utility-company-fields-1|visibility|none~#utility-company-fields-2|visibility|none~#utility-company-fields-3|visibility|none~#utility-company-fields-4|visibility|none~#utility-company-fields-5|visibility|table-cell");
	if($("span.restoredState").text() != ""){
		restore_state($("span.restoredState").text());
	}
	
	//=====RESET=====//
//	$("#main .form-header .reset").click(function(){
		//$("#step-1").addClass("active");
		//$("#utility-company-list li:eq(1)").addClass("selected");
		//var temp = $("#utility-company-list li:eq(1)").attr("id").split("-");
		//var id = temp[2];
		//show_company_filters(id);
		//step 3 fix
		//$("#third-party").removeAttr("checked");
		//$("#third-party").parent().next().slideUp().removeClass("open");
		//$("#third-party").parent().next().next().slideUp().removeClass("open");
		//uncheck
		//$("#apply-maximum-limit").removeAttr("checked");
//	});

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
	
	
	//on click, apply limit, remove errors
	$("#apply-maximum-limit").live("click", function(){
		$("#amount-textfield").val($(".max-amount").text());
		$("#amount-textfield").parent().find(".validation-error").remove();
	});



	//=====REAL TIME VALIDATIONS=====//
	
	//cant be over max amount
	$("#amount-textfield").keyup(function(event){
		//if he changed the value from max amount limit, remove checkbox
		var limit = $(".max-amount").text().replace(new RegExp(thousands_separator, 'g'), "");
		if($(this).val() != limit){
			$("#apply-maximum-limit").removeAttr("checked");
		}
		$("#amount-textfield").parent().find(".validation-error").remove();
	});

	$("#amount-textfield").live("blur", function(){
		//validate amount
		var validations = [
		    [$("#amount-textfield"), "not_zero", "amount_zero"],
			[[$("#amount-textfield"), "max", max_amount], "compare_numbers", "amount_over_limit"]
		];
		
		var validator = new Validator();
		var status = validator.validate(validations, false, true);

		//add/remove class active
		if(status){
			$(this).closest(".step").addClass("active");
			$("#step-5").find(".error").remove();
		}else{
			$(this).closest(".step").removeClass("active");
		}
		if($(this).val() == ""){
			$(this).closest(".step").removeClass("active");			
		}
	});
	
	//contract status checkbox
//GIV:Active_debits_20122102_4:Removed:
//	$("#contractStatus").live("click", function(){
//		if($(this).is(':checked')){
//			$("#contractStatusInActiveText").addClass("hidden");
//			$("#contractStatusActiveText").removeClass("hidden");
//		}else{
//			$("#contractStatusActiveText").addClass("hidden");
//			$("#contractStatusInActiveText").removeClass("hidden");
//		}
//	});
	
	//=====VALIDATIONS=====//
	//$("form").submit(function(){
	$("input:submit").click(function(){
		var validations = [
			///[$("#utility-company-list"), "has_selected", "not_selected_company"],
			[$("#from-account-list"), "has_selected", "not_selected_account"],
			[$("#amount-textfield"), "valid_amount", "not_valid_amount"],
			[$("#amount-textfield"), "not_zero", "amount_zero"],
			[[$("#amount-textfield"), "max", max_amount], "compare_numbers", "amount_over_limit"]
			///[$("#start-date"), "not_empty", "not_empty_date"],
		//	[$("#terms-checkbox"), "is_checked", "not_agreed_with_terms"] // kyrD:20120214:Usability:directDebit 

		];

		if(!$("#step-4 .content:visible .fields:eq(0)").hasClass("hidden")){
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
		$("#step-4").find("#utility-company-fields-"+id).css("display", "table-cell");
		//$("#step-4").find("#utility-company-fields-"+id).find(".field").removeAttr("disabled");
		//also remove errors
		$("#step-4").find(".error").remove();
	}

	//=====CREATE AND FILL HIDDEN FIELDS=====//
	function create_hidden_fields(){
		
		//find values
		var maxAmount = $("#amount-textfield").val();
		//var account = $("#from-account-list li.selected span.hidden-value.fromAccount").text();
		var account = find_selected_account_number("#from-account-list", "-1");
		
		if ( $("#third-party:checked").length > 0 ){
			$("input[name='thirdParty']").val("1");
			$("input[name='thirdParty_name']").val( $("#third-party-name").val() );
		}
		if ( $("#contractStatus:checked").length > 0 ){
			$("input[name='contractStatus']").val("1");
		}else{
			$("input[name='contractStatus']").val("0");
		}
		// fill in hidden fields
		$("input[name='TransactionAmount']").val(maxAmount);
		$("input[name='FromAccount']").val(account);
	}
	
	$("#cancel").click(function(){
		show_loading(false);
		$("input[name=nextPage]").val($(".hidden-value.cancelNextPage").text());
		$("form").submit();
	});
	
});
