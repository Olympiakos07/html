
<%@page import="ebanking.framework.params.WebParams"%>
<%@page import="ebanking.servlets.AJAXServlet"%>
<%@page import="ebanking.framework.view.UsabilityViewUtils"%>

var entryPoint = '<%=AJAXServlet.EntryPoint%>';

function get_transaction_details(transactions, accNum){

	var dataToSend = JSON.stringify(transactions); 

	jQuery.post(entryPoint, {<%=WebParams.ajaxServletMethod.id() %>: '<%=AJAXServlet.Operations.transactionDetails %>', 
						jsnArray: dataToSend,
						AccNum: accNum},
		function(data){
		
			var jsonRespWithErrorMsgs = "";
									
			jQuery.each(data, function(index, jsonObj) { 

			 	//console.log("Response jsonObj-"+index+" = "+JSON.stringify(jsonObj)); 
				
				if(jsonObj.error==undefined){ //Servlet respond without errors
				
				    var tempDescArray = new Array();
				    tempDescArray = jsonObj.text.split('|');
				    var htmlDescMsg = "";
				    jQuery.each(tempDescArray, function(index, value){
				        htmlDescMsg = htmlDescMsg + value + "<br>";
				    });
				    
				    //console.log("Response divName:"+ jsonObj.divName); 
				    //console.log("Response text   :"+ htmlDescMsg); 
				    
				  	if($.trim(htmlDescMsg)!="<br>"){ //If there is at least one description
				  	jQuery('#'+ jsonObj.divName).html(htmlDescMsg).show();
				  		jQuery('#'+ jsonObj.divName).prev().hide();
				  	}else{
				  		jQuery('#'+ jsonObj.divName).prev().show();
				  	}
				  	
			  	}else{
			  		jsonRespWithErrorMsgs+= jsonObj.error +"\n";
			  	}
			});
			
			if(jsonRespWithErrorMsgs!=""){
				//alert(jsonRespWithErrorMsgs);
			}
						
		}, "json"
	);
}

function get_active_transactions(callerId){
	if (callerId == '<%=UsabilityViewUtils.directDebitsListId %>'){
		jQuery.post(entryPoint, {
					<%=WebParams.ajaxServletMethod.id() %>: '<%=AJAXServlet.Operations.getPagePart %>',
					<%=WebParams.ajaxServletSubMethod.id() %>: '<%=AJAXServlet.GET_PAGE_PART_ACTIVE_DIRECT_DEBITS %>',
					<%=WebParams.accountNumber.id() %>: jQuery('input[name=<%=WebParams.accountNumber.id() %>]').val(),
					<%=WebParams.accountType.id() %>: jQuery('input[name=<%=WebParams.accountType.id() %>]').val(),
					<%=WebParams.accountCurrency.id() %>: jQuery('input[name=<%=WebParams.accountCurrency.id() %>]').val(),
					<%=WebParams.accountDescription.id() %>: jQuery('input[name=<%=WebParams.accountDescription.id() %>]').val()
			},
			function(data){
				if (data.trim() != '') {
		                jQuery('#'+callerId).html(data);
	                }						
			}, "html"
		);
	}
	else if (callerId == '<%=UsabilityViewUtils.activeTransactionsListId %>'){
		jQuery.post(entryPoint, {
					<%=WebParams.ajaxServletMethod.id() %>: '<%=AJAXServlet.Operations.getPagePart %>',
					<%=WebParams.ajaxServletSubMethod.id() %>: '<%=AJAXServlet.GET_PAGE_PART_ACTIVE_TRANSFERS_PAYMENTS %>',
					<%=WebParams.accountNumber.id() %>: jQuery('input[name=AccountNumber]').val()
			},
			function(data){
				if (data.trim() != '') {
		                jQuery('#'+callerId).html(data);
	                }						
			}, "html"
		);			
	}
	else if (callerId == '<%=UsabilityViewUtils.loanPaymentsListId %>'){
		jQuery.post(entryPoint, {
					<%=WebParams.ajaxServletMethod.id() %>: '<%=AJAXServlet.Operations.getPagePart %>',
					<%=WebParams.ajaxServletSubMethod.id() %>: '<%=AJAXServlet.GET_PAGE_PART_ACTIVE_LOAN_PAYMENTS%>',
					theIBStp: jQuery('input[name=theIBStp]').val()
			},
			function(data){
				if (data.trim() != '') {
		                jQuery('#'+callerId).html(data);
	                }						
			}, "html"
		);
	}
}


