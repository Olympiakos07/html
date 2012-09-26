function get_html_form(transaction_id, template_id, beneficiary_id, index){
	var thisPage = 'unified_payments';
	var thisPageUrl = 'unified_payments_form';

	if(template_id == ''){
		template_id = "none";
	}
	if(beneficiary_id == ''){
		beneficiary_id = "none";
	}

	//alert('benefid...'+beneficiary_id);
	//alert('templid...'+template_id);

	jQuery.ajax(
		{
			url: '<%=AJAXServlet.EntryPoint%>',
			type: 'POST',
			data: {
			<%=WebParams.ajaxServletMethod.id()%>: '<%=AJAXServlet.Operations.unifiedPaymentsFlowControl%>',
			<%=WebParams.nextPage.id()%>: thisPage,
			<%=WebParams.conversationId.id()%>: thisPage,
			goToPage : thisPageUrl,
			<%=WebParams.templateId.id()%>: template_id,
			<%=WebParams.selectedBeneficiary.id()%>: beneficiary_id,
			<%=WebParams.fromTransactionID.id()%>: transaction_id
		},
		dataType: 'html',
		async: false,
		cache: false,
		timeout: 19000,
		error: function(){
		remove_loading();
			alert('error...');
		},
		success: function(data, index){
			payments_form.update_html(data, reset);
		}
	});
}

function get_currencies(currency1, currency2, transaction_id){
	show_loading();
	$.post(
		entryPoint,
		{
			operation: operation, 
			Ccy1: currency1, 
			Ccy2: currency2, 
			transaction_id: transaction_id
		},
		function(data){
			remove_loading();
			return data.currencies;
		}, 
		"json"
	);
}