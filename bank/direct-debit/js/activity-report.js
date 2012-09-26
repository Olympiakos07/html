$(document).ready(function(){
	
	//=====ON LOAD=====//
	$("#start-date").attr("disabled", "disabled").val(today_date);
	$("#end-date").attr("disabled", "disabled").val(today_date);
	$("#only-today").attr("checked", "checked");

	if($("#transactions-report tbody tr").length == 0){
		$("#show-transactions").parent().height(35);
		$("#show-transactions").parent().parent().removeClass('bottom');
	}

	//=====EVENTS=====//
	$("#from-account-list li").click(function(){
		$("#show-transactions, #download-pdf, #download-excel, #download-mt").removeAttr("disabled");
	});

	//only today checkbox
	$("#only-today").change(function(){
		if($(this).attr("checked")){
			$("#start-date").attr("disabled", "disabled").val(today_date);
			$("#end-date").attr("disabled", "disabled").val(today_date);
		}else{
			$("#start-date").removeAttr("disabled");
			$("#end-date").removeAttr("disabled");
		}
	});

	// Show more filters
	$("#show-all-filters").click(function() {
		show_all_filters(this);
	});

	function show_all_filters(item){
		$(".hidden-filter").slideToggle().toggleClass("open");
		$(item).toggleClass("open");
		var old_text = $(item).text();
		var new_text = $(".show-less-filters").text();
		$(".show-less-filters").text(old_text);
		$(item).text(new_text);
	}

	$("#download-pdf, #download-excel, #download-mt").click(function(){
		$("form").submit();
	});

	// restore_state("#start-date|input|29/01/2012~#end-date|input|29/01/2012~#from-amount|input|~#to-amount|input|~#beneficiary-name|input|dcsdfs~#beneficiary-fiscal-code|input|~#beneficiary-account|input|~#only-today|checkbox|false~#from-account-list|list|0~#select-transaction-type|dsq-dialog|0~#from-account-list|trigger|click~#show-all-filters|trigger|click");
	if($("span.restoredState").text() != ""){
		show_loading();
		restore_state($("span.restoredState").text());
		//check if we need to open all filters
		if($("#from-amount").val() != "" || $("#beneficiary-name").val() != "" || $("#beneficiary-fiscal-code").val() != "" || $("#beneficiary-account").val() != ""){
			show_all_filters($("#show-all-filters"));
		}
	}

	$("form").submit(function(){
		if($("#show-all-filters").hasClass("open") && ($("#from-amount").val() != "" || $("#to-amount").val() != "")){
			var validations = [
				[[$("#from-amount").val(), "max", $("#to-amount").val()], "compare_numbers", "from_amount_bigger_than_to"],
				[$("#from-amount").val(), "not_empty", "not_empty"],
				[$("#to-amount").val(), "not_empty", "not_empty"]
			];

			var submit_status = validator(validations, true);
		}else{
			var submit_status = true;
		}

		console.log("submit_status="+submit_status);

		if($("span.validation-error").length != 0){
			submit_status = false;
		}

		if(submit_status == true){
			save_state();
			//fill in the hidden fields
			create_hidden_fields();
			show_loading();
		}

		return false;
	});

	//=====CREATE AND FILL HIDDEN FIELDS=====//
	function create_hidden_fields(){
		//find values
		var fromDate = $("#start-date").val();
		var toDate = $("#end-date").val();
		var fromAmount = $("#from-amount").val();
		var toAmount = $("#to-amount").val();
		var transactionType = $("#select-transaction-type li.selected .hidden-value").text();
		var beneficiaryName = $("#beneficiary-name").val();
		var beneficiaryAccount = $("#beneficiary-account").val();
		var beneficiaryFiscalCode = $("#beneficiary-fiscal-code").val();
		var accountNumber = find_selected_account_number("#from-account-list", "-1")
		// fill in hidden fields
		$("input[name=fromDate]").val(fromDate);
		$("input[name=toDate]").val(toDate);
		$("input[name=fromAmount]").val(fromAmount);
		$("input[name=toAmount]").val(toAmount);
		$("input[name=transactionType]").val(transactionType);
		$("input[name=beneficiaryName]").val(beneficiaryName);
		$("input[name=beneficiaryAccount]").val(beneficiaryAccount);
		$("input[name=beneficiaryFiscalCode]").val(beneficiaryFiscalCode);
		$("input[name=accountNumber]").val(accountNumber);
	}
	
});