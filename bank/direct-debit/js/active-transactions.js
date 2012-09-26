function doCheckIBAN() {
	if($("#beneficiary-account").length > 0 && $("#transaction-type-list li.domestic").hasClass("selected")){
		check_iban("beneficiary-account", $("#beneficiary-account").val(), "domestic");
	}		
}

function list_clicked(id, index, old_index) {
	if(id == "transaction-type-list")
		if($("#transaction-type-list li:eq("+index+")").hasClass("domestic"))
			doCheckIBAN();
}

$(document).ready(function() {

	//=====EVENTS=====//
	$("#filters-trigger").click(function(){
		var old_text = $(this).text();
		var new_text = $(this).parent().find(".hide-text").text();
		$(this).parent().find(".hide-text").text(old_text);
		$(this).text(new_text);
		if($(this).hasClass("open")){
			$(".form").slideUp().removeClass("open");
			$(this).removeClass("open");
		}else{
			$(".form").slideDown().addClass("open");
			$(this).addClass("open");
			scroll.list(300);
		}
	});

	$("#beneficiary-account").blur(function(){
		doCheckIBAN();
	});

	$("#transaction-type-list li").click(function(){
		if($(this).hasClass("ram-fund")){
			$("#beneficiary-account").slideUp();
			$("#predefined-beneficiaries-ram-fund").delay(500).slideDown();
		}else{
			$("#predefined-beneficiaries-ram-fund").slideUp();
			$("#beneficiary-account").delay(500).slideDown();
		}
	});

	
	if($("span.restoredState").text() != ""){
		restore_state($("span.restoredState").text());
	}
	
	$("form").submit(function(event){
		//if($("#filters-trigger").hasClass("open")){
			
			var validations = [];
			
			if($("#from-amount").val() != "" || $("#to-amount").val() != ""){
				validations = [
					[[$("#from-amount"), "max", $("#to-amount").val()], "compare_numbers", "from_amount_bigger_than_to"],
					[$("#from-amount"), "not_zero", "amount_zero"],
					[$("#to-amount"), "not_zero", "amount_zero"],
					[$("#from-amount"), "not_empty", "not_empty"],
					[$("#to-amount"), "not_empty", "not_empty"]
				];
			}
			
			if($("#start-date").val() != "" || $("#end-date").val() != ""){
				var validation = [$("#start-date"), "not_empty", "not_empty"];
				validations.push(validation);
				validation = [$("#end-date"), "not_empty", "not_empty"];
				validations.push(validation);
			}

			var validator = new Validator();
			var submit_status = validator.validate(validations, true, true);
			
			if(($("#from-amount").val() != "" || $("#to-amount").val() != "") && $("#currency-dialog li.selected").index() == 0) {
				validator.displayError($("#currency-dialog"), "not_selected", "not_selected");
				submit_status = false;
			}
			
			
		if(submit_status == false && $("#filters-trigger").hasClass("open") == false){
			$("#filters-trigger").click();
		}
			
//		}else{
//			var submit_status = true;
//		}

		console.log("submit_status="+submit_status);

		if($("span.validation-error").length != 0)
			submit_status = false;
		
		if(submit_status == true){
			save_state();
			//fill in the hidden fields
			create_hidden_fields(event.source);
			show_loading(false);
		}

		return submit_status;
	});

	function create_hidden_fields(source) {
		var fromAccount;
		if( $("#from-account-list li.selected").hasClass("any-type") )
			fromAccount = "";
		else
			fromAccount = find_selected_account_number("#from-account-list", "-1");
		
		var minDate = $("#start-date").val();
		var maxDate = $("#end-date").val();
		var transType = $("#transaction-type-list li.selected .hidden-value").text();
		var minAmount = $("#from-amount").val();
		var maxAmount = $("#to-amount").val();
		var ccy = $("#currency-dialog li.selected .hidden-value.currency").text();	
		var benAccount = $("#beneficiary-account").val();
		if( $("#predefined-beneficiaries-ram-fund").is(":visible") ) {
			var benAccount = $("#predefined-beneficiaries-ram-fund li.selected a span").text();
			benAccount = benAccount.replace(/ /g,'');
		}
		$("input[name=FromAccount]").val(fromAccount);
		$("input[name=FromDate]").val(minDate);
		$("input[name=ToDate]").val(maxDate);
		$("input[name=trans_type]").val(transType);
		$("input[name=MinAmount]").val(minAmount);
		$("input[name=MaxAmount]").val(maxAmount);
		$("input[name=TransactionCurrency]").val(ccy);
		$("input[name=BeneficiaryAccount]").val(benAccount);
		$("input[name=nextPage]").val('get_active_transactions');
		$("input[name=HasMoreRecords]").val(false);
		if(source != "pagination")
			$("input[name=IsActiveTxnsSearch]").val('true');
	}

});

$(".icon.view").live("click", function() {
	var i = $(this).find(".index").text();
	var transId = $(this).find(".transaction-id").text();
	var nextPage = $(this).find(".next-page").text();
	go2verify(i, transId, nextPage, 'displayActive');
});
$(".icon.delete").live("click", function() {
	var i = $(this).find(".index").text();
	var transId = $(this).find(".transaction-id").text();
	var nextPage = $(this).find(".next-page").text();
	go2verify(i, transId, nextPage, 'deleteActive');
});

function go2verify(i, transId, nextPage, actionFlag) {
	$("input[name=actionFlag]").val(actionFlag);
	$("input[name=transactionListIndex]").val(i);
	$("input[name=fromTransactionID]").val(transId);
	$("input[name=nextPage]").val(nextPage);
	$("input[name=pageNumber]").val(getCurrentPage());
	
	document.forms[0].submit();
}

function getCurrentPage(){
	var currentPage = 1;
	if ( $('td.pagination li.current a').length >0 ){
		currentPage = $('td.pagination li.current a').text();
	}
	return currentPage;
}

