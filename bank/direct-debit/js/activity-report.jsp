<%@page import="ebanking.servlets.AJAXServlet"%>
<%@page import="ebanking.framework.params.WebParams"%>
$(document).ready(function(){
	
	//=====ON LOAD=====//
	$("#start-date").attr("disabled", "disabled").val(today_date);
	$("#end-date").attr("disabled", "disabled").val(today_date);
	
	$("#only-today").attr("checked", "checked");

	if($("#transactions-report tbody tr").length == 0){
		$("#show-transactions").parent().height(35);
		$("#show-transactions").parent().parent().removeClass('bottom');
	}
	
	if ($("#from-account-list li.selected").length > 0){
		$("#show-transactions, #download-pdf, #download-excel, #download-mt").removeAttr("disabled");
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
			$("#start-date").removeAttr("disabled").val(yesterday_date);
			$("#end-date").removeAttr("disabled").val(yesterday_date);
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

	if($("span.restoredState").text() != ""){
		restore_state($("span.restoredState").text());
		if($("#from-amount").val()!="" || $("#beneficiary-name").val()!="" || $("#beneficiary-fiscal-code").val()!="" || $("#beneficiary-account").val()!=""){
			show_all_filters($("#show-all-filters"));
		}
	}
	
	$("form").submit(function(){
		if($("#show-all-filters").hasClass("open") && ($("#from-amount").val() != "" || $("#to-amount").val() != "")){
			var validations = [
				[[$("#from-amount"), "max", $("#to-amount").val()], "compare_numbers", "from_amount_bigger_than_to"],
				[$("#from-amount"), "not_empty", "not_empty"],//GIV:20120216:Act_report_20110202_4:added not empty validations
				[$("#to-amount"), "not_empty", "not_empty"]
			];

			var validator = new Validator();
			var submit_status = validator.validate(validations, true, true);
		}else{
			var submit_status = true;
		}

		console.log("submit_status="+submit_status);

		if($("span.validation-error").length != 0)
			submit_status = false;

		if(submit_status == true){
			save_state();
			//fill in the hidden fields
			create_hidden_fields();
			show_loading(false);
		}

		return submit_status;
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
		$("input[name=FromDate]").val(fromDate);
		$("input[name=ToDate]").val(toDate);
		$("input[name=MinTransactionAmount]").val(fromAmount);
		$("input[name=MaxTransactionAmount]").val(toAmount);
		$("input[name=TransactionType]").val(transactionType);
		$("input[name=Beneficiary]").val(beneficiaryName);
		$("input[name=BeneficiaryAccount]").val(beneficiaryAccount);
		$("input[name=BeneficiaryFiscalCode]").val(beneficiaryFiscalCode);
		$("input[name=FromAccount]").val(accountNumber);
		$("input[name=ClearCacheId]").val("true");
		$("input[name=CurrentPage]").val("1");
		if($("#only-today").attr("checked")){
			$("input[name=dateOption]").val("current");	
		}else{
			$("input[name=dateOption]").val("history");	
		}
		
	}
	
		$("#download-pdf, #download-excel, #download-mt").click(function(){


		if($(this).attr("id")=="download-mt"){
			$("input[name=FileType]").val("MT942");
			var format = "mt942";
		}else if($(this).attr("id")=="download-excel"){
			$("input[name=FileType]").val("XLS");
			var format = "xls";
		}else if($(this).attr("id")=="download-pdf"){
			$("input[name=FileType]").val("PDF");
			var format = "pdf";
		}
		create_hidden_fields();
		save_state();
		var fromDate = $("#start-date").val();
		var toDate = $("#end-date").val();
		var fromAmount = $("#from-amount").val();
		var toAmount = $("#to-amount").val();
		var transactionType = $("#select-transaction-type li.selected .hidden-value").text();
		var beneficiaryName = $("#beneficiary-name").val();
		var beneficiaryAccount = $("#beneficiary-account").val();
		var beneficiaryFiscalCode = $("#beneficiary-fiscal-code").val();
		var from_account = find_selected_account_number("#from-account-list", "-1");
		var type = find_account_type($("#from-account-list li.selected"));
		var restoredState = $("input[name=restoredState]").val();
		if($("#only-today").attr("checked")){
			$("input[name=dateOption]").val("current");
			var dateOption = "current";	
		}else{
			$("input[name=dateOption]").val("history");
			var dateOption = "history";	
		}
		var convId = $("input[name=<%=WebParams.conversationId.id()%>]").val();
		
				

		
				<%--
		//these are summy data and must be replaced with the real ajax request below
		var jsArray = {
				"location": "/download_file",
				"title": "",
				"message": ""
			}
		var jsArray = {
				"location": "",
				"title": "My title",
				"message": "my message"
			}

		download_statements(jsArray);
		--%>
		$.post(
				'<%=AJAXServlet.EntryPoint%>/<%=AJAXServlet.Operations.downloadActivityReport.id()%>',<%--This type of call invokes the ajax validator filter--%>
				{
					<%--=WebParams.ajaxServletMethod.id() %>: '<%=AJAXServlet.Operations.downloadActivityReport.id()--%>
					<%=WebParams.conversationId.id() %>: jQuery('input[name=<%=WebParams.conversationId.id()%>]').val(),
					<%=WebParams.fromDate.id()%>: fromDate, 
					<%=WebParams.toDate.id()%>: toDate, 
					<%=WebParams.fromAccount.id() %>: from_account,
					<%=WebParams.fromAmount.id() %>: fromAmount,
					<%=WebParams.toAmount.id() %>: toAmount,
					<%=WebParams.transactionType.id() %>: transactionType,
					<%=WebParams.beneficiaryName.id() %>: beneficiaryName,
					<%=WebParams.beneficiaryAccount.id() %>: beneficiaryAccount,
					<%=WebParams.beneficiaryFiscalCode.id() %>: beneficiaryFiscalCode,
					<%=WebParams.selectedFormat.id() %>: format,
					<%=WebParams.dateOption.id() %>: dateOption,
					restored_state: restoredState
					
				<%--
					operation:operation, 
					conversationId:conversationId, 
					'StartingStatementDate[]': statements, 
					FromAccount:from_account, 
					FromAccountType:type, 
					SelectedFormat: format
				--%>
				},
				function(jsArray){
					download_activityReport(jsArray);
				}, 
				"json"
		);
	});

	function download_activityReport(jsArray){
		if(jsArray.location != ""){
			window.location = jsArray.location;
		}else{
			$("#errors-modal").remove();
			var markup = '<%@page import="ebanking.transaction.framework.Environment"%><div id="errors-modal" class="dialog dialog-message hidden" title="'+jsArray.title+'"><p>'+jsArray.message+'</p></div>';
			$("body").append(markup);
			$("#errors-modal").dialog({
				modal: true,
				width: 560,
				dialogClass: "modal",
				autoOpen: true
			});
		}
	}
	
});