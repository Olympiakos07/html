var recipients = {};
var page_type = "";

function list_clicked(id, index, changed){
	if ( id == 'beneficiary-list' ){
		recipients.change(index);
	}
}

function reset_fields(){
	$("#from-account-list-intrabank li").removeClass('selected');
	$("#from-account-list-domestic li").removeClass('selected');
	$("#from-account-list-international li").removeClass('selected');
	
	$("input:not(:submit, :reset)").val("");
	update_char_counters();
	
	$("#available-for-mobile li.not-available").click();
	
	$("#swift-priority-dialog li").removeClass('selected');
	$("#swift-priority-dialog li:first-child").addClass("selected");
	$('#swift-priority').text( $('#swift-priority-dialog li.selected span.swift-priority-value').text() );
	$("#swift-charges-dialog li").removeClass('selected');
	$("#swift-charges-dialog li:first-child").addClass("selected");
	$('#swift-charges').text( $('#swift-charges-dialog li.selected span.swift-charges-value').text() );
	
}


$(document).ready(function(){

	//=====ON LOAD=====//

	//=====EVENTS=====//
	
	recipients = {
		
		change: function(index){

			// var type = find_account_type("#beneficiary-list", index);

			//fix height and enable submit button
			$("#step-1").children("div.content").height("auto");
			$(".form .buttons input").removeAttr("disabled");
			//remove errors from previous beneficiaries
			$(".validation-error").remove();

			//show steps
			$("#step-2, #step-3, #step-4").slideDown();

			page_type = find_account_type($("#beneficiary-list li:eq("+index+")"));

			//show the proper html elements
			$(".content.hidden").css("display", "none");
			$(".content." + page_type).css("display", "table-cell");
			
			if($.browser.msie && $.browser.version=="7.0"){
				$("#step2, #step3, #step4").css("position", "relative");
				$(".content." + page_type).css("display", "block");
			}
			//
			$(".list.accounts").css("display", "none");
			$("#from-account-list-"+page_type).css("display", "block");

			if($("#beneficiary-list li:eq("+index+")").hasClass("available-for-mobile")){
				$(".available-for-mobile-step").css("display", "block");
			}else{
				$(".available-for-mobile-step").css("display", "none");
			}
			
			if (page_type == 'international'){
				$("#step-5").css("display", "block");
			}
			else{
				$("#step-5").css("display", "none");
			}
			
			var max_mobile_limit = $('span.hidden-value.' +page_type+ '-mobile-limit').text();
			if ( max_mobile_limit == '-1' ){
				max_amount = '';
				$('span.max-amount').text('');
			}
			else{
				max_amount = amount_to_number(max_mobile_limit);
				$('span.max-amount').text(max_mobile_limit);
			}
			
			reset_fields();
		}
	}

	$('.reset.button').click(function(){
		$('#step-2, #step-3, #step-4, #step-5').slideUp();
		$('input[type=submit]').addClass('disabled').attr('disabled','disabled');
	});
	
	//=====SUBMIT=====//
	$("form").submit(function(){
		if(page_type == "intrabank"){
			var validations = [
				[$("#from-account-list-intrabank"), "has_selected", "not_selected"],
				[$("#template-name"), "not_empty", "not_empty"]
			];
		}else if(page_type == "domestic"){
			var validations = [
				[$("#from-account-list-domestic"), "has_selected", "not_selected"],
				[$("#payment-details-line-1-domestic"), "not_empty", "not_empty"],
				[$("#payment-order-no-domestic"), "not_empty", "not_empty"],
				[$("#template-name"), "not_empty", "not_empty"]
			];
		}else if(page_type == "international"){
			var validations = [
				[$("#from-account-list-international"), "has_selected", "not_selected"],
				[$("#payment-details-line-1-international"), "not_empty", "not_empty"],
				[$("#template-name"), "not_empty", "not_empty"]
			];
		}else if(page_type == ""){
			var validations = [
				[$("#beneficiary-list"), "has_selected", "not_selected"]
			];
		}

		if($("#available-for-mobile li.selected").hasClass("available") && $(".available-for-mobile-step").is(":visible") ){
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

		if($("span.validation-error").length != 0){
			submit_status = false;
		}
		
		if(submit_status == true){
			fill_hidden_fields();
			authorization.call();
		}

		return false;
	});

	//=====CREATE AND FILL HIDDEN FIELDS=====//
	function fill_hidden_fields(){
		// fill in hidden fields
		var IBANAccountNumber = $("#beneficiary-list li.selected span.hidden-value.beneficiary-iban").text();
		var ToAccount = '';
		var FromAccount = find_selected_account_number("#from-account-list-" + page_type, "-1");
		var desc1 = $("#payment-details-line-1-" +page_type).val();
		var desc2 = $("#payment-details-line-2-" +page_type).val();
		var desc3 = $("#payment-details-line-3-" +page_type).val();
		var PaymentOrderNo = $("#payment-order-no-" +page_type).val();
		var TransactionTemplateName = $("#template-name").val();
		var transactionId = '0009';
		var ActionFlag = template_action_create;

		
		if ( page_type == 'intrabank' ){
			ToAccount = IBANAccountNumber;
			if ( ToAccount.length >=10 ){
				ToAccount = ToAccount.substr(ToAccount.length-10);
			}
			
			submit_data = {
				"ToAccount": ToAccount,
				"IBANAccountNumber": IBANAccountNumber,
				"FromAccount": FromAccount,
				"Comments": desc1,
				"SecondDescription": desc2,
				"PaymentOrder": PaymentOrderNo,
				"transactionTemplateName": TransactionTemplateName,
				"fromTransactionID": transactionId,
				"actionFlag" : ActionFlag
			}
		}
		else if ( page_type == 'domestic' ){
			transactionId = '0111';
			var BeneficiaryIdentification = $("#beneficiary-list li.selected span.hidden-value.beneficiary-id").text();
			var BeneficiaryFullName = $("#beneficiary-list li.selected span.hidden-value.beneficiary-name").text();
			
			submit_data = {
				"IBANAccountNumber": IBANAccountNumber,
				"FromAccount": FromAccount,
				"DetailsOfPayment1": desc1,
				"DetailsOfPayment2": desc2,
				"PaymentOrder": PaymentOrderNo,
				"transactionTemplateName": TransactionTemplateName,
				"BeneficiaryIdentification": BeneficiaryIdentification,
				"BeneficiaryFullName": BeneficiaryFullName,
				"fromTransactionID": transactionId,
				"actionFlag" : ActionFlag
			}
		}
		else if ( page_type='international' ){
			transactionId = '0137';
			var b2b1 = $("#bank-to-bank-info-1").val();
			var b2b2 = $("#bank-to-bank-info-2").val();
			var b2b3 = $("#bank-to-bank-info-3").val();
			var statCode = $("#statistical-code").val();
			var documents = $("#documents").val();
			var BenName1 = $("#beneficiary-list li.selected span.hidden-value.beneficiary-name-1").text();
			var BenName2 = $("#beneficiary-list li.selected span.hidden-value.beneficiary-name-2").text();
			var BenAdr = $("#beneficiary-list li.selected span.hidden-value.beneficiary-address").text();
			var BenBankName1 = $("#beneficiary-list li.selected span.hidden-value.beneficiary-bank-name-1").text();
			var BenBankName2 = $("#beneficiary-list li.selected span.hidden-value.beneficiary-bank-name-2").text();
			var BenBankAdr = $("#beneficiary-list li.selected span.hidden-value.beneficiary-bank-address").text();
			var BenSwiftCode = $("#beneficiary-list li.selected span.hidden-value.beneficiary-bank-swift-code").text();
			var serviceType = $("#swift-priority-dialog li.selected .hidden-value").text();
			var chargeType = $("#swift-charges-dialog li.selected .hidden-value").text();
			
			submit_data = {
				"FromAccount": FromAccount,
				"BenAccount": IBANAccountNumber,
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
		}
		
		
		general_fill_hidden_fields();
	}

});