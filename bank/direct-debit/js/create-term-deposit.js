
$(document).ready(function() {
	
	var currency = "";

	//=====EVENTS=====//
	$("#main .form-header .reset").click(function(){
		$(".currency-iso").text("");
		$("#step-2, #step-3, #step-4, #step-2 .helper, #createTimeDeposit-duration-interest, #slider-container").slideUp();
		$("#step-1 ul.accounts").addClass("huge").removeClass("medium");
		$("#terms-checkbox").attr("disabled", "disabled").attr("checked", false);
		$("#to-account-list").empty();
	});

	//updates currency in amount field
	//and shows only accounts with that currency in step 4
	$("#from-account-list li").click(function(){
		currency = find_account_currency($(this));

		var currency_old = $(".currency-iso").text();
		$(".currency-iso").text(currency);

		if(currency != currency_old){
			show_loading(true);
			
			$("#step-2, #step-3").slideDown();
			$(".validation-error").remove();
			$(this).parent().removeClass("huge").addClass("medium");
			$("#step-4, #createTimeDeposit-duration-interest").slideUp();
			$("#to-account-list").empty();
			$("#terms-checkbox").attr("disabled", "disabled").attr("checked", false);
			
			$.post(
					ctdv_AjaxEntryPoint,
					{
					 'operation':						ctdv_TimeOffersWithProductsPerCurrencyOp,
					 'conversationId':					$('input[name=conversationId]').val(),
					 'TransactionCurrency':				currency
					},
					function(jsArray){
						update_offers_and_durations(jsArray);
					}, 
					"json"
			);
		}
	});
	
	function update_offers_and_durations(jsArray){
		$("#offers-list").empty();
		$("#slider-container").slideUp();
		$("#createTimeDeposit-duration-slider").slider("option", "value", 0);
		var offers = [];
		$.each(jsArray, function(index, offer) {
			//console.log(index);
			var temp = index.split("-");
			var id = temp[1];
			var markup = '<li class="'+index+'">'+offer.description+'<span class="hidden hidden-value code">'+offer.code+'</span>';

			for(i=0; i < offer.durations.length; i++){
				//update labels of the slider too 
				if(i == 0){
					update_slider_label(offer.durations[0]);
				}
				markup += '<span class="hidden slider-step id-'+i+'">'+offer.durations[i]+'</span>';
			}
			markup += "</li>";
			offers[id] = markup;
		});
		
		//add now
		for(i=0; i < offers.length; i++){
			$(offers[i]).appendTo("#offers-list");
		}
		if(is_restore != ""){
			var value = ajax_states["offers-list"];
			$("#offers-list").children("li:eq("+value+")").click();
		}
		remove_loading();
		
		scroll.list(500);
		
		setTimeout(function(){mainHeightFix()}, 500);
	}

	//on amount change, check if its empty and bigger than minimum, and update interests
	$("#createTimeDeposit-amount").keyup(function(){
		//update_interest_and_accounts("");
	});

	$("#createTimeDeposit-amount").blur(function(){
		if($(this).val() != "" && check_minimum_amount()){
			update_interest_and_accounts("");
			$("#step-2").addClass("active");
		}else{
			$("#step-2").removeClass("active");
		}
	});

	//on offer selection, show slider, define minimum amount and check it
	$("#offers-list li").live("click", function(){
		//enable the checkbox
		$("#terms-checkbox").removeAttr("disabled");
		//
		update_slider_points($(this).children(".slider-step").length - 1);
		//
		if(is_restore != ""){
			console.log(ajax_states);
			var value = ajax_states["createTimeDeposit-duration-slider"];
			console.log(value);
			$("#createTimeDeposit-duration-slider").slider("value", value);
			update_slider_label($("#offers-list li.selected .slider-step.id-"+value+"").text());
		}else{
			//reset slider dot
			$(".slider").slider("option", "value", 0);
			//and its label
			update_slider_label($("#offers-list li.selected .slider-step.id-0").text());
		}
		
		//show it, if not already shown
		$("#step-3 #slider-container").slideDown();
		update_interest_and_accounts($(".slider").slider("option", "value"));
	});

	function update_slider_points(steps){
		$("#createTimeDeposit-duration-slider").slider("option", "max", steps);
	}

	function check_minimum_amount(){
		var result = false;
		var minimum_amount = $("#step-2").find(".limit.minimum-amount").text();
		if(minimum_amount != ""){
			var input_amount = $("#createTimeDeposit-amount").val();
			//localize amounts
//			if(locale == "en_US"){
//				var minimum_amount_number = parseFloat(minimum_amount.replace(new RegExp(removed_separator, "g"), ""));
//				var input_amount_number = parseFloat(input_amount.replace(new RegExp(removed_separator, "g"), ""));
//			}else{
//				var minimum_amount_number = parseFloat(minimum_amount.replace(/\./g, "").replace(",", "."));
//				var input_amount_number = parseFloat(input_amount.replace(/\./g, "").replace(",", "."));
//			}
			var minimum_amount_number = amount_to_number(minimum_amount);
			var input_amount_number = amount_to_number(input_amount);
			if(minimum_amount_number > input_amount_number){
				$("#step-2").find(".helper").empty().append("<span class='validation-error minimum-amount-error'>"+error_messages["minimum_amount"]+" "+minimum_amount+"</span>");
				result = false;
			}else{
				//if we have no other error by valid amount validation, then empty it
				$("#step-2").find(".validation-error.minimum-amount-error").remove();
				result = true;
			}
		}else{
			result = true;
		}
		if(input_amount == "" || input_amount == "0.00" || input_amount == "0,00"){
			$("#step-2").find(".helper").empty().append("<span class='validation-error minimum-amount-error'>"+error_messages["minimum_amount"]+" "+minimum_amount+"</span>");			
		}
		return result;
	}

	//update interest rate and maturity date
	function update_interest_and_accounts(slider_value){
		console.log(slider_value);
		//gather data for the ajax request
		var offer_code = $("#offers-list li.selected").find(".hidden-value.code").text();
		var amount = $("#createTimeDeposit-amount").val();
		if($("#step-3 #slider-container").is(":visible") || is_restore){
			console.log("is visible step3");
			if(slider_value === "" || is_restore){
				var slider_value = $("#createTimeDeposit-duration-slider").slider("option", "value");			
			}
			var duration = $("#offers-list li.selected .slider-step.id-"+slider_value).text();
		}else{
			var duration = "";
		}
		
		console.log("duration..."+duration);
		console.log("offer_code..."+offer_code);
		
		if(amount == ""){
			//check_minimum_amount();
		}
		
		//if the data are valid, do the request
		if(offer_code != "" && duration != ""){
			show_loading(true);
			$.post(
					ctdv_AjaxEntryPoint,
					{
					 'operation':								ctdv_TimeOffersPrdCodeRatesOp,
					 'conversationId':							$('input[name=conversationId]').val(),
					 'OfferCode':								offer_code,
					 'TransactionAmount':						amount,
					 'Duration':								duration,
					 'TransactionCurrency':						currency
					},
					function(jsArray){
						remove_loading();
						update_interest_and_accounts_data(jsArray);
						getInfoLinks();//Get info files after products have been loaded
					}, 
					"json"
			);
		}
	}

	//update disposion accounts in step 4
	function update_interest_and_accounts_data(jsArray){
	console.log(jsArray);
		//$.each(jsArray, function(index, data) {
			//if(index == "rate_data"){
				if(amount_to_number(jsArray.rate_data.rate) != 0){
					console.log("Data rate is not 0 and the # is shown")
					$("#createTimeDeposit-duration-interest").css("display", "block");
					$(".value-interest").text(" "+jsArray.rate_data.rate/*+"%"*/);
				}else{
					$("#createTimeDeposit-duration-interest").css("display", "none");
				}
				if(amount_to_number(jsArray.rate_data.special_rate.replace("%", "").trim()) != 0
						&& $("#createTimeDeposit-amount").val() != ""
						&& amount_to_number(jsArray.rate_data.rate) != 0
				){
//				if(jsArray.rate_data.special_rate != "0" && jsArray.rate_data.special_rate != "0.0" && jsArray.rate_data.special_rate != "0,0"
//				   &&(jsArray.rate_data.rate != "0" && jsArray.rate_data.rate != "0.0" && jsArray.rate_data.rate != "0,0")
//				   ){
				   console.log("Special Rate & Rate are 0 and # is shown");
					$("#createTimeDeposit-duration-special-interest").show();
					$(".special-interest .value").text(" "+jsArray.rate_data.special_rate/*+"%"*/);
				}else{
					$("#createTimeDeposit-duration-special-interest").hide();
				}
				$(".value-expiryDate").text(jsArray.rate_data.maturity_date);
			//}else if(index == "disposition_accounts"){
				if(jsArray.disposition_accounts.display == "true"){
					//update step 4
					$("#step-4 .label label").text(jsArray.disposition_accounts.label);
					if($("#to-account-list").is(":empty")){
						$("#from-account-list li").each(function(){
							if($(this).hasClass("currency-"+currency)){
								var item = $(this).html();
								var classes = $(this).attr("class").replace(/selected/g, "");
								$("#to-account-list").append("<li class='"+classes+"'>"+item+"</li>");
							}
						});
					}
					$("#step-4").slideDown();
				}else{
					$("#step-4").slideUp();					
				}
			//}else if(index == "product_code"){
				$("input[name=ProductCode]").val(jsArray.product_code.code);
			//}else if(index == "minimum_amount"){
				$(".limit.minimum-amount").text(jsArray.minimum_amount.amount);
				check_minimum_amount();
			//}
		//});
		if(is_restore != ""){
			console.log(ajax_states);
			var value = ajax_states["to-account-list"];
			$("#to-account-list").children("li:eq("+value+")").addClass("selected");
			is_restore = false;
		}
		//
		//$("#createTimeDeposit-duration-interest").slideDown();
		setTimeout(function(){mainHeightFix()}, 500);
	}

	$(function() {
		$("#createTimeDeposit-duration-slider").slider("destroy");
		$("#createTimeDeposit-duration-slider").slider({
			value: 0,
			min: 0,
			max: 12,
			step: 1,
			slide: function( event, ui ) {
				update_slider_label($("#offers-list li.selected .slider-step.id-"+ui.value).text());
				update_interest_and_accounts(ui.value);
			}
		});
	});
	
	function update_slider_label(date){
		var duration = date.replace("d", "").replace("m", "").replace("y", "");
		$("#createTimeDeposit-duration .duration").text(duration);
		var period = date.substring(date.length-1, date.length);
		if(period == "m"){
			if(duration == 1){
				var periodtxt = month_locale;
			}else{
				var periodtxt = months_locale;
			}
		}else if(period == "d"){
			if(duration == 1){
				var periodtxt = day_locale;
			}else{
				var periodtxt = days_locale;
			}
		}
		$("#createTimeDeposit-duration .period").text(periodtxt);
	}

	$(".slider-focus-handler").live("focus", function(){
		$(".ui-slider-handle").focus();
	});

	//check_inputers = setTimeout("restore_state('#createTimeDeposit-amount|input|2,432,342.00~#from-account-list|list|1~#offers-list|list|1~#disposition-account-list|list|1~#createTimeDeposit-duration-slider|slider|1~#createTimeDeposit-duration-slider|visibility|block~#disposition-account-list|visibility|block~#from-account-list|trigger|click~#offers-list|trigger|click')", 1000);
	// TODO: Find a better way to deal with this, and remove the timer. Slider is not initiated when restore is executed 
	//check_input = setTimeout("restore_state('#createTimeDeposit-amount|input|23,232,434.00~#from-account-list|list|1~#offers-list|list|1~#disposition-account-list|list|1~#createTimeDeposit-duration-slider|slider|1#disposition-account-list|visibility|block~#from-account-list|trigger|click~#offers-list|trigger|click')", 1000);
	//restore_state("#createTimeDeposit-amount|input|23,232,434.00~#from-account-list|list|1~#offers-list|list|2~#from-account-list|trigger|click~#offers-list|trigger|click");

	if($("span.restoredState").text() != ""){
		setTimeout('restore_state($("span.restoredState").text())',2000);
		$(".step").addClass("active");
	}

	//=====FORM SUBMIT=====//
	$("form").submit(function() {
		var validations = [
			[$("#from-account-list"), "has_selected", "not_selected"],
			[$("#createTimeDeposit-amount"), "not_empty", "not_empty"],
			[$("#offers-list"), "has_selected", "not_selected"],
			[$("#terms-checkbox"), "is_checked", "not_agreed_with_terms"]
		];

		if($("#to-account-list").is(":visible")){
			var validation = [$("#to-account-list"), "has_selected", "not_selected"];
			validations.push(validation);
		}

		var validator = new Validator();
		var submit_status = validator.validate(validations, true, true);
		
		if($(".validation-error").length > 0){
			$("#createTimeDeposit-amount").focus();
			submit_status = false;
		}
		
		console.log("submit_status="+submit_status);

		if(submit_status == true){
			show_loading(false);
			save_state();
			//fill in the hidden fields
			fill_hidden_fields();
		}

		return submit_status;
	});

	//=====FILL HIDDEN FIELDS=====//
	function fill_hidden_fields(){
		$("input[name=FromAccount]").val(find_selected_account_number("#from-account-list", "-1"));
		//$("input[name=ProductCode]").val(find_account_currency($("#from-account-list li.selected")));
		$("input[name=TransactionCurrency]").val(find_account_currency($("#from-account-list li.selected")));//GIV:UIF_20120309
		$("input[name=TransactionAmount]").val($("#createTimeDeposit-amount").val());
		$("input[name=OfferCode]").val($("#offers-list li.selected .hidden-value").text());
		if($("#to-account-list").is(":visible")){
			$("input[name=ToAccount]").val(find_selected_account_number("#to-account-list", "-1"));
		}
	}

});


//Custom methods
//THIS IS A GENERIC METHOD FOR OBTAINING INFO FILES
function getInfoLinks()
{
	var offerCode = $("#offers-list li.selected .hidden-value").text();
	var productType = $("input[name=ProductType]").val();
	var productCode = $("input[name=ProductCode]").val();
	var transactionID=$("input[name=txnIDforInfoFiles]").val();
	var majorType = $("input[name=majorForInfoFiles]").val();

	$.post(
			ctdv_AjaxEntryPoint,
			{
				'operation':				ctdv_TransferTimeLinksOp,
				'conversationId':			$('input[name=conversationId]').val(),
				'OfferCode':				offerCode,
				'ProductType':				productType,
				'ProductCode':				productCode,
				'fromTransactionID':		transactionID,
				'MajorCode':				majorType
			},
			function(jsArray){					
				$("#terms-dialog li:eq(1)").empty();
				$.each(jsArray, function(pdfIndex, data) {
					if(data.linkType==1)//is a file
						var markup = "<p class='link' ><a target='_blank' href='"+data.link+"'>"+data.label+"</a></p>";
					else//is a http link
						var markup = "<p class='link external' ><a target='_blank' href='"+data.link+"'>"+data.label+"</a></p>";
					$(markup).appendTo("#terms-dialog li:eq(1)");
				});
			}, 
			"json"
	);
}