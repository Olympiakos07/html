
<%@page import="ebanking.framework.helpers.TransactionCode"%>
<%@page import="ebanking.servlets.AJAXServlet"%>
<%@page import="ebanking.framework.params.WebParams"%>
<%@page language="java" contentType="text/javascript; charset=UTF-8"%>

<%-- GIV:variable used in payments.js--%>
	var transferOwnFXtxnID = '<%=TransactionCode.TRANSFER_OWN_FX%>';
	var transferOwnTxnID  = '<%=TransactionCode.TRANSFER_OWN%>';


	function get_html_form(transaction_id, template_id, beneficiary_id, index, old_index){		
		var thisPage = 'unified_payments';
		var thisPageUrl = 'unified_payments_form';
		
		
		if(template_id == ''){
			template_id = "none";
		}
		if(beneficiary_id == ''){
			beneficiary_id = "none";
		}
		
		if(1==2){
			alert('benefid...'+beneficiary_id);
			alert('templid...'+template_id);
			alert('transaction_id...'+transaction_id);
		}
		
		data1 = {
			<%=WebParams.ajaxServletMethod.id()%>: '<%=AJAXServlet.Operations.unifiedPaymentsFlowControl%>',
			<%=WebParams.nextPage.id()%>: thisPage,
			<%=WebParams.conversationId.id()%>: thisPage,
			goToPage : thisPageUrl,
			<%=WebParams.templateId.id()%>: template_id,
			<%=WebParams.selectedBeneficiary.id()%>: beneficiary_id,
			<%=WebParams.fromTransactionID.id()%>: transaction_id
		}
		var modal = $("#modal-from-intra-to-bill");
		////alert('123');
		if(modal.length > 0) {//br207.mod
			if(modal.hasClass("submitted")) {
				$("#modal-from-intra-to-bill").removeClass("submitted");
				var toAccount = $("#beneficiary-iban-intrabank").val().replace(/ /g, "").substring(14).replace(/^[0]+/g,"");
				var paymOrder = $("#payment-order-number").val();
				var fromAccount = find_selected_account_number("#from-account-list", "-1");
				var amount = $("#amount-textfield").val();
				
				if (!modal.find(".information:eq(1)").hasClass("hidden")){
					//if not same-currency, clear these parameters
					fromAccount = '';
					amount = '';
				}
			
				data1.<%=WebParams.comesFromIntrabankPmts.id()%> = 'true';
				data1.<%=WebParams.fromAccount.id()%> = fromAccount;
				data1.<%=WebParams.utilityCompanyAccn.id()%> = toAccount;
				data1.<%=WebParams.transactionAmount.id()%> = amount;
				data1.<%=WebParams.paymentOrder.id()%> = paymOrder;
			}
		}
		
		jQuery.ajax({
      			url: '<%=AJAXServlet.EntryPoint%>',
       		type: 'POST',
       		data: data1,
			dataType: 'html',
       		async: false,
       		cache: false,
       		timeout: 19000,
       		error: function(){
       			remove_loading();
				//alert('error...');
			},
       		success: function(data){
       			payments_form.update_html(data, index, old_index);
			}
   		});
    }
    
    function get_json_data(transaction_id, template_id, beneficiary_id, index){
    	alert('asd');
    	var entryPoint = '<%=AJAXServlet.EntryPoint%>';
    	var thisPage = 'unified_payments';
    	$.post(
				entryPoint,
				{
					<%=WebParams.ajaxServletMethod.id()%>: '<%=AJAXServlet.Operations.getTemplateDetailsAsJSON%>',
					<%=WebParams.conversationId.id()%>: thisPage,
					<%=WebParams.templateId.id()%>: template_id,
					<%=WebParams.selectedBeneficiary.id()%>: beneficiary_id,
					<%=WebParams.fromTransactionID.id()%>: transaction_id
				},
				function(data){
					payments_form.update_data(data, index);
				}, 
				"json"
			);
    }
    
    function get_currencies(currency1, currency2, transaction_id){
		show_loading();
		var entryPoint = '<%=AJAXServlet.EntryPoint%>';
		var thisPage = 'unified_payments';
		$.post(
			entryPoint,
			{
				<%=WebParams.ajaxServletMethod.id()%>: '<%=AJAXServlet.Operations.validateSelectedCurrencies%>', 
				<%=WebParams.conversationId.id()%>: thisPage,
				<%=WebParams.fromAccountCurrency.id()%>: currency1, 
				<%=WebParams.toAccountCurrency.id()%>: currency2, 
				<%=WebParams.fromTransactionID.id()%>: transaction_id
			},
			function(data){
				remove_loading();
				amount.update_currencies_markup(data.currencies);
			}, 
			"json"
		);
	}
    
    
    