function get_template_data(transaction_template){

	/*if(template_type == "transfer-own"){
		var data = {
			"to-account-list": "10953875",
			"from-account-list": "84762587",
			"comments": "23424",
			"template-name": "fire",
		}
	}else if(template_type == "intrabank"){
		var data = {
			"beneficiary-iban-intrabank": "8492761",
			"from-account-list": "84762587",
			"payment-details-line-1": "23424",
			"payment-details-line-2": "details 2",
			"payment-order-number": "232",
			"template-name": "fire",
			"available-for-mobile": false,
			"amount-textfield": "",
			"apply-maximum-limit": false
		}
	}else if(template_type == "domestic"){
		var data = {
			"beneficiary-iban-domestic": "8492761",
			"beneficiary-name": "10953634",
			"beneficiary-id": "detail",
			"from-account-list": "84762587",
			"payment-details-line-1": "23424",
			"payment-details-line-2": "details 2",
			"payment-order-number": "232",
			"template-name": "fire",
			"available-for-mobile": false,
			"amount-textfield": "",
			"apply-maximum-limit": false
		}
	}else if(template_type == "international"){
		var data = {
			"beneficiary-iban-international": "10953634",
			"beneficiary-name-1": "detail",
			"beneficiary-name-2": "84762587",
			"beneficiary-address": "23424",
			"beneficiary-bank-swift-code": "details 2",
			"beneficiary-bank-name": "my name",
			"beneficiary-bank-address": "address",
			"from-account-list": "84762587",
			"payment-details-line-1": "details1",
			"payment-details-line-2": "details2",
			"payment-details-line-3": "details3",
			"bank-to-bank-info-1": "info",
			"bank-to-bank-info-2": "info",
			"bank-to-bank-info-3": "info",
			"statistical-code": "code",
			"documents": "docs",
			"template-name": "fire",
			"available-for-mobile": false,
			"amount-textfield": "",
			"apply-maximum-limit": false
		}
	}else if(template_type == "ram-online"){
		var data = {
			"predefined-beneficiaries-ram-fund": "RO83RZBR0000060012072001",
			"from-account-list": "84762587",
			"is-third-party": true,
			"third-party-name": "23424",
			"third-party-cnp": "Sasdfa",
			"template-name": "fire"
		}
	}*/


	/*$.post(
			entryPoint,
			{operation:operation, conversationId:conversationId, TemplateID:template_id, TransactionID:transaction_id},
			function(data){
				templates.update_data(data);
			}, 
			"json"
	);*/
}

function get_template_html(transaction_id, transaction_template){
	data = '<script type="text/javascript" src="file:///home/knorcedger/Labs/Repos/Raiffeisen-Usability-Redesign/js/templates-create-transfer-own.js"></script><fieldset id="step-2" class="step"><span class="no">2</span><div class="content"><div class="label">							<label>To My Account</label></div><div class="fields"><ul id="to-account-list" class="list accounts medium save-state" tabindex="2"><li class="current currency-RON"><a href="#">My Salary <span>(10953875)</span></a><span class="total neg">- RON 80.13</span></li><li class="current currency-USD"><a href="#">84762587</a><span class="total">USD 300,000.00</span></li><li class="savings currency-EUR"><a href="#">Home Savings <span>(10985287)</span></a><span class="total">EUR 4,125.37</span></li></ul></div></div></fieldset><fieldset id="step-3" class="step"><span class="no">3</span><div class="content"><div class="label">From Account</div><div class="fields"><ul id="from-account-list" class="list accounts medium save-state" tabindex="3"><li class="current currency-RON"><a href="#">My Salary <span>(10953875)</span></a><span class="total neg">- RON 80.13</span></li><li class="current currency-USD"><a href="#">84762587</a><span class="total">USD 300,000.00</span></li><li class="savings currency-EUR"><a href="#">Home Savings <span>(10985287)</span></a><span class="total">EUR 4,125.37</span></li></ul></div></div></fieldset><fieldset id="step-4" class="step"><span class="no">4</span><div class="content"><div class="label">Comments</div><div class="fields"><input type="text" id="comments" class="field field-large has-counter save-state" maxlength="30" tabindex="4" /><div class="helper"><p>(<span class="chars-remaining">30</span> characters remaining)</p></div></div></div></fieldset><fieldset id="step-5" class="step"><span class="no">5</span><div class="content"><div class="label">Template Name</div><div class="fields"><input type="text" id="template-name" class="field save-state" maxlength="20" tabindex="5" /></div></div></fieldset>';

	/*$.post(
			entryPoint,
			{operation:operation, conversationId:conversationId, action:action, fromTransactionID:transaction_id, transactionTemplate:transaction_template},
			function(data){
				templates.update_html(data);
			}, 
			"json"
	);*/

	templates.update_html(data);
}