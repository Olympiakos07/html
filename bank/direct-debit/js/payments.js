//=====GLOBAL VARIABLES=====//
var actions = {};
var amount = {};
var page_mode = "select";
var page_type = "";
var menu_html = "";
var templates_list_html = "";
var beneficiary_list_html = "";
var payments_form = {};
var currency_dialog_tabindex = "";
var default_currencies = "";
//this is used for BR207
//var utility_company_account = "";
//var utility_company_amount = "";
var utility_company_info = {
		"toAccount": "",
		"amount": "",
		"fromAccount": ""
};

function list_clicked(id, index, old_index){
	if(id == "templates-list"){
		actions.change(index, old_index);
	}else if(id == "beneficiary-list"){
		actions.change(index, old_index);
	}else if(id == "from-account-list"){
		amount.update_available_currencies();
	}else if(id == "to-account-list"){
		amount.update_available_currencies();
	}
}

function list_action_clicked(id, index, old_index, action){
	page_mode = "edit";
	if(id == "templates-list" && action == "edit"){
		actions.edit(index, old_index);
	}else if(id == "beneficiary-list" && action == "edit"){
		actions.edit(index, old_index);
	}
}

function dialog_clicked(id, index, old_index){
	if(id == "recipient-choice-dialog"){
		var type = find_account_type($("#"+id+" li:eq("+index+")"));
		if(index != old_index || type == "saved-templates" || type == "saved-beneficiaries"){
			if(type == "saved-templates" || type == "saved-beneficiaries"){
				page_mode = "select";
			}else{
				page_mode = "edit";
			}
			payments_form.fetch_html(0, 0, "recipient-choice-dialog");
		}
	}
}

$(document).ready(function(){

	//=====ON LOAD=====//

	//save currencies
	default_currencies = $(".amount-step .label").html();
	
	//update page_type
	page_type = find_account_type($("#recipient-choice-dialog li.selected"));

	
	//split ibans
//	$("#templates-list li span.iban, #beneficiary-list li a span").each(function(){
//		if($(this).text().length == 24){
//			$(this).text(split_iban($(this).text()));
//		}
//	});

	$("#templates-list li:not(.hidden):first, #beneficiary-list li:first").addClass("selected");

	var templates_number = $("#templates-list li:not(.hidden)").length;
	var beneficiaries_number = $("#beneficiary-list li").length;

	//save lists and menu
	menu_html = $('<div>').append($("#menu-container").removeClass("hidden").clone()).remove().html();
	templates_list_html = $('<div>').append($("#templates-list").removeClass("hidden").clone()).remove().html();
	beneficiary_list_html = $('<div>').append($("#beneficiary-list").removeClass("hidden").clone()).remove().html();
	//and the remove them
	$("#menu-container").remove();
	$("#templates-list").remove();
	$("#beneficiary-list").remove();

	//place menu and templates list
	if(templates_number != 0){
		$("#step-1 .content").prepend(templates_list_html);
	}else if(beneficiaries_number != 0){
		$("#step-1 .content").prepend(beneficiary_list_html);		
	}else{
		$("#step-1 #edit-container").removeClass("hidden");
	}
	$("#step-1 .content").prepend(menu_html);

	//also split ibans
//	$(".check-iban").each(function(){
//		if($(this).val().length == 24){
//			$(this).val(split_iban($(this).val()));
//		}
//	});

	payments_form = {
		
		fetch_html: function(index, old_index, selector){
			
			var transaction_id = $("#"+selector+" li.selected .hidden-value.transaction-id").text();

			if(find_account_type($("#recipient-choice-dialog li.selected")) == "saved-templates") {
				var template_id = $("#templates-list li:not(.hidden):eq("+index+") .hidden-value.template-id").text();
				if(template_id == undefined || template_id == "" ) {
					template_id = "first";
				}
			} else {
				var template_id = "";
			}
			if(find_account_type($("#recipient-choice-dialog li.selected")) == "saved-beneficiaries"){
				var beneficiary_id = $("#beneficiary-list li:eq("+index+") .hidden-value.payeestp").text();
				if(beneficiary_id == undefined || beneficiary_id == "" ) {
					beneficiary_id = "first";
				}
			}else {
				var beneficiary_id = "";
			}

			show_loading(false);
			setTimeout(function(){get_html_form(transaction_id, template_id, beneficiary_id, index);}, 500);
		},

		update_html: function(data, index, old_index){
			page_type = $("#recipient-choice-dialog li.selected").attr("class").replace("selected", "").trim();
			//
			menu_html = $('<div>').append($("#menu-container").clone()).remove().html();
			
			//templates_list_html_temp = $('<div>').append($("#templates-list").removeClass("hidden").clone()).remove().html();
			if($("#templates-list").length > 0 ) { 
				templates_list_html_temp = "<ul id='templates-list' class='" + $("#templates-list").attr("class") + "' tabindex='" + $("#templates-list").attr("tabindex") + "'>" + $("#templates-list").html() + "</ul>";
			}else{
				templates_list_html_temp = '';
			}
			
			if(templates_list_html_temp != ""){
				templates_list_html = templates_list_html_temp;
			}
			beneficiary_list_html_temp = $('<div>').append($("#beneficiary-list").removeClass("hidden").clone()).remove().html();
			if(beneficiary_list_html_temp != ""){
				beneficiary_list_html = beneficiary_list_html_temp;
			}
			$("form").empty();
			$("form").html(data);
			$(".dsq-dialog").slideUp();
			
			initializeTooltips(0);
			
			default_currencies = $(".amount-step .label").html();
			//
			actions.update_step_1(index, old_index);
			update_char_counters();

			if($("#end-date").length > 0){
				sendings_calculator();
			}

			set_date_text();
			scroll.list(300);
       		remove_loading();
		},

		fetch_data: function(index, selector){
		
			var transaction_id = $("#"+selector+" li.selected .hidden-value.transaction-id").text();

			if(find_account_type($("#recipient-choice-dialog li.selected")) == "saved-templates") {
				var template_id = $("#templates-list li.selected .hidden-value.template-id").text();
				if(template_id == undefined || template_id == "" ) {
					template_id = "first";
				}
			} else {
				var template_id = "";
			}
			if(find_account_type($("#recipient-choice-dialog li.selected")) == "saved-beneficiaries"){
				var beneficiary_id = $("#beneficiary-list li.selected .hidden-value.payeestp").text();
				if(beneficiary_id == undefined || beneficiary_id == "" ) {
					beneficiary_id = "first";
				}
			}else {
				var beneficiary_id = "";
			}
			get_json_data(transaction_id, template_id, beneficiary_id, index);	
		},

		update_data: function(data, index){
			
			if(page_type == "transfer-own"){
				$("#from-account-list li").removeClass("selected");
				var selected = find_account_index("from-account-list", data.from_account_list);
				$("#from-account-list li:eq("+selected+")").addClass("selected");

				$("#to-account-list li").removeClass("selected");
				var selected = find_account_index("to-account-list", data.from_account_list);
				$("#to-account-list li:eq("+selected+")").addClass("selected");

				$("#payment-details-line-1").val(data.payment_details_line_1);
			}else if(page_type == "intrabank"){
				$("#from-account-list li").removeClass("selected");
				var selected = find_account_index("from-account-list", data.from_account_list);
				$("#from-account-list li:eq("+selected+")").addClass("selected");

				$("#payment-details-line-1").val(data.payment_details_line_1);
				$("#payment-details-line-2").val(data.payment_details_line_2);
				$("#payment-order-number").val(data.payment_order);						
			}
/*
			$("#beneficiary-iban-"+page_type).val(jsArray.to_account);


			$("#payment-details-line-1").val(jsArray.details_line_1);
			$("#payment-details-line-2").val(jsArray.details_line_2);
			$("#payment-order-number").val(jsArray.payment_order_number);
			//if edit mode
			if(page_mode == "edit"){
				var index = $("#step-1 ul.list:visible li.selected").index();
				actions.update_step_1(index);
			}*/
		}

	}

	actions = {

		change: function(index, old_index){
			//check if we selected a template of the same or different type
			//same type, means ajax responds with json object, different type, ajax returns html
			if(page_type == "saved-templates"){
				var list = "templates-list";
			}else if(page_type == "saved-beneficiaries"){
				var list = "beneficiary-list";
			}

			if(index != old_index){
				payments_form.fetch_html(index, old_index, list);
			}
			
		},

		edit: function(index, old_index){
			if(page_type == "saved-templates"){
				var list = "templates-list";
			}else if(page_type == "saved-beneficiaries"){
				var list = "beneficiary-list";
			}
			
			if(index != old_index){
				payments_form.fetch_html(index, old_index, list);
			}else{
				actions.update_step_1(index, old_index);
			}
			
		},

		from_account_change: function(index){
			var currency = find_account_currency($("#from-account-list li:eq("+index+")"));
			$(".currency-iso").text(currency);
		},

		update_recurring_duration_dialog: function(selector){
			//set selected
			$(selector).children("li").removeClass("selected")
			$(selector).children("li:eq(0)").addClass("selected");
			//set text
			if($(selector).children("span").length > 0){
				var receiver = $(selector).parent().prev().children("span");
			}else{
				var receiver = $(selector).parent().prev();
			}
			var value = $(selector).find("li.selected").children("*:not(.hidden-value)").text();
			receiver.text(value);
		},

		update_step_1: function(index, old_index){

///////////////update preselected transfer-own and utility list item
			/*if(page_type == "saved-templates" || page_type == "saved-beneficiaries"){
				
				var type = find_account_type($("#templates-list li.selected"));
			}else if(page_type == "saved-beneficiaries"){
				var type = find_account_type($("#beneficiary-list li.selected"));
			}*/

			if(page_mode == "select"){
				if(page_type == "saved-templates"){
					$("#step-1 .content").prepend(templates_list_html);
					//reset the list
					$("#templates-list li").removeClass("selected");
					$("#templates-list li:not(.hidden):eq("+index+")").addClass("selected");
					//also add menu
					$("#step-1 .content").prepend(menu_html);
					actions.fill_fields(index, "templates-list");
				}else if(page_type == "saved-beneficiaries"){
					//reset the list
					if(index != -1){
						$("#step-1 .content").prepend(beneficiary_list_html);
						$("#beneficiary-list li").removeClass("selected");
						$("#beneficiary-list li:eq("+index+")").addClass("selected");
						//also add menu
						$("#step-1 .content").prepend(menu_html);
					}else{
						$("#templates-list").remove();
						$("#step-1 .content").append(beneficiary_list_html);
						//$("#menu-container").remove();
					}
					$("#step-1 #beneficiary-list").css("display", "block");
					actions.fill_fields(index, "beneficiary-list");
				}else{
					$("#step-1 .content").prepend(menu_html);
					$("#step-1 #edit-container").removeClass("hidden");
				}
			}else if(page_mode == "edit"){
				
				if($("#recipient-choice-dialog").length==0) {
					$("#step-1 .content").prepend(menu_html);
				}
				//$("#step-1 #edit-container").removeClass("hidden");
				$("#step-1 #edit-container").css("display", "block");
				
//				var temp_transaction_id = -1; // it is updated only for saved-templates and saved-beneficiaries page_types
				if(page_type == "saved-templates"){
					if($("#templates-list").length == 0){
						$("#step-1 .content").prepend(templates_list_html);
					}
					$("#step-1 #templates-list").css("display", "none");
					if(index != old_index){
						actions.fill_fields(index, "templates-list");
					}
//					temp_transaction_id = $("#templates-list li:eq("+index+") .hidden-value.transaction-id").text();
					var selected_account_type = find_account_type($("#templates-list li:not(.hidden):eq(" + index + ")"));
				}else if(page_type == "saved-beneficiaries"){
//					temp_transaction_id = $("#beneficiary-list li:eq("+index+") .hidden-value.transaction-id").text();
					if($("#beneficiary-list").length == 0){
						$("#step-1 .content").prepend(beneficiary_list_html);
					}
					$("#step-1 #beneficiary-list").css("display", "none");
					if(index != old_index){
						actions.fill_fields(index, "beneficiary-list");
					}
					var selected_account_type = find_account_type($("#beneficiary-list li:eq(" + index + ")"));
				}else if(utility_company_info.toAccount != "" || utility_company_info.amount != "" || utility_company_info.fromAccount != ""){
					var index = $("#recipient-choice-dialog li.utility-company").index();
					actions.fill_fields(index, "recipient-choice-dialog");
				}

				//also split ibans
				$(".check-iban").each(function(){
					if($(this).val().length == 24){
						$(this).val(split_iban($(this).val()));
						resize_font(this);
					}
				});
				
				/*if(temp_transaction_id != -1){
					if($("#recipient-choice-dialog").length > 0) {
						$("#recipient-choice-dialog li").each(function(){
							var menu_transaction_id = $(this).find(".hidden-value.transaction-id").text(); 
							if(menu_transaction_id == temp_transaction_id){
								$("#recipient-choice-dialog li").removeClass("selected");
								$(this).addClass("selected");
								var temp_text = $("#recipient-choice-dialog li.selected span:not(.hidden-value)").text();
								$(this).closest(".dsq-dialog-container").prev().text(temp_text);
							}
						}); 
					}
				}*/
				
				if(page_mode == "edit" && selected_account_type != undefined){
					if($("#recipient-choice-dialog").length > 0) {
						$("#recipient-choice-dialog li").removeClass("selected");
						$("#recipient-choice-dialog li." + selected_account_type).addClass("selected");
						var temp_text = $("#recipient-choice-dialog li.selected span:not(.hidden-value)").text();
						$("#recipient-choice-dialog").closest(".dsq-dialog-container").prev().text(temp_text);
					}
				}
				
				page_type = find_account_type($("#recipient-choice-dialog li.selected"));
				if(page_type == "intrabank") {
					$("#beneficiary-iban-intrabank").blur();
				}
			}
			
			if(page_type == "international"){
				$("#currency-iso").parent().addClass("show-dialog dd");
			}
			
			scroll.list(300);
			
			//close it in csae it remained open
			$(".dsq-dialog").slideUp();
			
			setTimeout(function(){mainHeightFix()}, 500);
		},

		fill_fields: function(index, selector){
			//fields that exist on every type
			$("#from-account-list li").removeClass("selected");
			
			var tempFromAccountNumber = $("input[name=FromAccount]").val();
			if(page_type=="saved-templates"){
				tempFromAccountNumber = $("#templates-list li.selected .hidden-value.fromAccountNumber").text();
			}
			var from_account_index = find_account_index("from-account-list", tempFromAccountNumber);
			if(from_account_index != -1){
				$("#from-account-list li:eq("+from_account_index+")").addClass("selected");
			}
//			$("#currency-iso").text($("input[name=TransactionCurrency]").val());
//			$("#amount-textfield").val($("input[name=TransactionAmount]").val());
			//and now the specific ones
			var type = find_account_type($("#"+selector+" li:eq("+index+")"));
			if(type == "transfer-own"){
				var to_account_index = find_account_index("to-account-list", $("input[name=ToAccount]").val());
				$("#to-account-list li:eq("+to_account_index+")").addClass("selected");
				$("#payment-details-line-1").val($("input[name=Comments]").val());
			}else if(type == "intrabank"){
				$("#beneficiary-iban-intrabank").val($("input[name=IBANAccountNumber]").val());
				$("#payment-details-line-1").val($("input[name=Comments]").val());
				$("#payment-details-line-2").val($("input[name=SecondDescription]").val());
				$("#payment-order-number").val($("input[name=PaymentOrder]").val());
			}else if(type == "domestic"){
				$("#beneficiary-iban-domestic").val($("input[name=IBANAccountNumber]").val());
				$("#beneficiary-name").val($("input[name=BeneficiaryFullName]").val());
				$("#beneficiary-id").val($("input[name=BeneficiaryIdentification]").val());
				$("#payment-details-line-1").val($("input[name=DetailsOfPayment1]").val());
				$("#payment-details-line-2").val($("input[name=DetailsOfPayment2]").val());
				$("#payment-order-number").val($("input[name=PaymentOrder]").val());
			}else if(type == "international"){
				$("#beneficiary-iban-international").val($("input[name=BenAccount]").val());
				$("#beneficiary-name-1").val($("input[name=BenName1]").val());
				$("#beneficiary-name-2").val($("input[name=BenName2]").val());
				$("#beneficiary-id").val($("input[name=BeneficiaryIdentification]").val());
				$("#beneficiary-address").val($("input[name=BenAdr]").val());
				$("#beneficiary-bank-swift-code").val($("input[name=BenSwiftCode]").val());
				$("#beneficiary-bank-name").val($("input[name=BenBankName1]").val() + $("input[name=BenBankName2]").val());
				$("#beneficiary-bank-address").val($("input[name=BenBankAdr]").val());

				$("#payment-details-line-1").val($("input[name=desc1]").val());
				$("#payment-details-line-2").val($("input[name=desc2]").val());
				$("#payment-details-line-3").val($("input[name=desc3]").val());
				$("#bank-to-bank-info-1").val($("input[name=b2b1]").val());
				$("#bank-to-bank-info-2").val($("input[name=b2b2]").val());
				$("#bank-to-bank-info-3").val($("input[name=b2b3]").val());
				$("#statistical-code").val($("input[name=statCode]").val());
				$("#documents").val($("input[name=documents]").val());
				//
				
				$("#swift-priority-dialog li").each(function(){
					if($(this).find(".hidden-value.code").text() == $("input[name=serviceType]").val()){
						$("#swift-priority-dialog li").removeClass("selected");
						$(this).addClass("selected");
						var text = $(this).find("span:not(.hidden-value)").text();
						$(this).parent().prev().text(text);
						$("#swift-priority").text(text);
					}
				});
				
				$("#swift-charges-dialog li").each(function(){
					if($(this).find(".hidden-value.code").text() == $("input[name=chargeType]").val()){
						$("#swift-charges-dialog li").removeClass("selected");
						$(this).addClass("selected");
						var text = $(this).find("span:not(.hidden-value)").text();
						$("#swift-charges").text(text);
					}
				});
			}else if(type == "utility-company"){
				$("#payment-order-number").val($("input[name=PaymentOrder]").val());
				
				if(utility_company_info.toAccount != ""){
					var tmp = utility_company_info.toAccount.replace(/ /g, "").substring(14, 24).replace(/^[0]+/g, "");
					var compAccount = tmp;
				}else{
					var compAccount = $("input[name=UtilityCompanyAccn]").val();
				}

				for(var i=1; i<11; i++){
					$("#utility-company-fields-"+compAccount+" input[name=idField"+i+"]").val($("input[name=temp_idField"+i+"]").val());
				}
				$("#predefined-beneficiaries-utility-company li#utility-company-"+compAccount).click();
				//for BR207
				var i = 0;
				$("#from-account-list li").each(function(){
					var temp_account = find_selected_account_number("#from-account-list", i);
					if(temp_account == utility_company_info.fromAccount){
						$(this).addClass("selected");
					}
					i++;
				});
				
				$("#amount-textfield").val(utility_company_info.amount);
				utility_company_info.toAccount = "";
				utility_company_info.amount = "";
				utility_company_info.fromAccount = "";
			}
			$(".format-iban").each(function(){
				$(this).val(split_iban($(this).val()));
				resize_font(this);
			});
			amount.update_available_currencies();
		},
		
		check_future_dated_or_recurring: function(){
			var temp = $("#start-date").val().split("/");
			var temp2 = $("#end-date").val().split("/");
			var selected_start_date = new Date(temp[2], temp[1]-1, temp[0]);
			var selected_end_date = new Date(temp2[2], temp2[1]-1, temp2[0]);
			if(today < selected_start_date || !$("#transaction-planner-dialog li:first").hasClass("selected")){
				return true;
			}else{
				return false;
			}
		},

		find_to_account_currency: function(){
			var result = "";
			//each takes care of finding if those exist
			$("#beneficiary-iban-intrabank, #beneficiary-iban-domestic").each(function(){
				
				if(page_mode == "edit"){
					check_iban($(this).attr("id"), $(this).val(), $(this).attr("id").split("-")[2]);
				}
				if($(this).parent().find(".iban-currency").length > 0){
					result = $(this).parent().find(".iban-currency").text();
				}
			});
			if($("#to-account-list li.selected").length > 0){
				result = find_account_currency($("#to-account-list li.selected"));
			}
			return result;
		},
		
		fromIntrabankToUtilityCompany: function(){
			var item = $(".hidden-value.isUtilityCompanyAccount");
			if(item.length > 0){
				var toCcy = $(".hidden-value.iban-currency").text();
				var fromCcy = find_account_currency($("#from-account-list li.selected"));
				
				var acc = $("#beneficiary-iban-intrabank").val();
				
				var itemText = item.text();
				if(itemText=='true') {
					var rejectedAccounts = $("input[name=rejectedBillPaymentAccounts]").val().split("|");
					var alreadyChecked = $.inArray( acc, rejectedAccounts) != -1;
					if(!alreadyChecked){
						if(fromCcy != toCcy || actions.check_future_dated_or_recurring()) {
							$("#modal-from-intra-to-bill").find(".information:eq(1)").removeClass("hidden");
						} else {
							$("#modal-from-intra-to-bill").find(".information:eq(1)").addClass("hidden");
						}
						
						initiate_dialogs(false);
						$("#modal-from-intra-to-bill").dialog("open");
					}
				}
			}
		},
		
		fromIntrabankToUtilityCompanySubmit: function(){
			$("#modal-from-intra-to-bill").dialog("destroy");
			var index = $("#recipient-choice-dialog li.utility-company").index();
			var old_index = $("#recipient-choice-dialog li.intrabank").index();
			//save utility company info
			utility_company_info.toAccount = $("#beneficiary-iban-intrabank").val();
			//if cross currency, dont save the from account
			var currency_from = find_account_currency($("#from-account-list li.selected"));
			var currency_to = actions.find_to_account_currency();
			if(currency_from == currency_to){
				utility_company_info.fromAccount = find_selected_account_number("#from-account-list", "-1");
				utility_company_info.amount = $("#amount-textfield").val();
			}else{
				utility_company_info.fromAccount = "";
			}
			//emulate click on util comp menu selection
			$("#recipient-choice-dialog li:eq("+index+")").click();
		},
		
		fromIntrabankToUtilityCompanyCancel: function(){
			$("#modal-from-intra-to-bill").dialog("close");
			$("#modal-from-intra-to-bill").find(".information:eq(1)").addClass("hidden");
			var acc = $("#beneficiary-iban-intrabank").val();
			var temp = $("input[name=rejectedBillPaymentAccounts]").val();
			temp +=  acc+"|";
			$("input[name=rejectedBillPaymentAccounts]").val(temp);
		}
		
	};

	amount = {

		find_converted_amount: function(){
			var currency = $("#currency-iso").text();
			if($("#amount-textfield").val() != "" && $("#amount-textfield").next().find(".validation-error").length == 0 && currency != "RON"){

				//this is dummy response and must be deleted in production and uncomment the following code block
				var data = {
					"amount": "13.00"
				};

				//amount.update_converted_amount(data)
				/*$.post(
						entryPoint,
						{operation:operation, conversationId:conversationId, amount:amount, CCY:currency},
						function(jsArray){
							amount.update_converted_amount(jsArray)
						}, 
						"json"
				);*/
			}
		},

		update_converted_amount: function(data){
			if($("#amount-textfield").next().length == 0){
				$("#amount-textfield").parent().append("<div class='helper'><span class='converted'>"+data.amount+" RON</span></div>");
			}else{
				$("#amount-textfield").next().find(".converted").remove();
				$("#amount-textfield").next().append("<span class='converted'>"+data.amount+" RON</span>");
			}
		},

		update_available_currencies: function(){
			var currency1 = find_account_currency($("#from-account-list li.selected"));
			var currency2 = actions.find_to_account_currency();
			//international doesnt change list provided by the server
			if(
				page_type == "international" ||
				(page_type == "saved-templates" && find_account_type($("#templates-list li.selected")) == "international") ||
				(page_type == "saved-beneficiaries" && find_account_type($("#beneficiary-list li.selected")) == "international") )
			{
				//do nothing
			}else{
				//check the cases for the found currencies
				if(currency1 == currency2 && currency1 != ""){
					$("#currency-iso").text(currency1);
					amount.manage_currencies_tabindex("remove");
				}else if(currency1 != "" && currency2 == ""){
					if(page_type == "utility-company" || (page_type == "saved-templates" && find_account_type($("#templates-list li.selected")) == "utility-company") ){
						$("#currency-iso").text(currency1);
						amount.manage_currencies_tabindex("remove");
					}
				}else if(currency1 == "" && currency2 != ""){
					
				}else{
					if(page_type == "saved-templates"){
        				var list = "templates-list";
        			}else if(page_type == "saved-beneficiaries"){
        				var list = "beneficiary-list";
        			}else{
        			    var list = "recipient-choice-dialog";
        			}
        			
        			var transaction_id = $("#" + list + " li.selected .hidden-value.transaction-id").text();
        			
        			if(currency1.length + currency2.length > 0) {
        				get_currencies(currency1, currency2, transaction_id);
        			}
				}

			}

			//also find converted amount
			amount.find_converted_amount();
			
			//enable converter
			if((currency1 != "" && currency2 != "") || (currency1 != "" && page_type == "utility-company") || page_type == "international" || page_type == "saved-templates" || (page_type == "saved-beneficiaries" && currency1 != "")){
				$("#show-converter").removeClass("disabled").removeAttr("disabled");
			}else{
				$("#show-converter").addClass("disabled").attr("disabled", true);
			}
		},
		
		update_currencies_markup: function(currencies){
			if(currencies.length  > 1){
				amount.manage_currencies_tabindex("add");
			}else{
				amount.manage_currencies_tabindex("remove");				
			}
			//remove old values
			$("#currency-dialog").empty();
			//add the new values
			var selected_currency = $("#currency-iso").text();
			for (var i = 0; i < currencies.length; i++) {
				if(currencies[i] == selected_currency){
					var markup = '<li class="selected"><span class="currency-iso-option">'+currencies[i]+'</span></li>';							
				} else {
					var markup = '<li><span class="currency-iso-option">'+currencies[i]+'</span></li>';
				}
				$("#currency-dialog").append(markup);
			}
			if($("#currency-dialog li.selected").length == 0){
				$("#currency-dialog li:first").addClass("selected");
				$("#currency-iso").text(currencies[0]);
			}else{
				$("#currency-iso").text($("#currency-dialog li.selected").text());
			}
			
		},
		
		manage_currencies_tabindex: function(action){
			if(action == "remove"){
				currency_dialog_tabindex = $(".amount-step .dsq-dialog-container").attr("tabindex");
				$(".amount-step .dsq-dialog-container").removeAttr("tabindex");
				$("#currency-iso").parent().removeClass("show-dialog").removeClass("dd");
			}else if(action == "add"){
				$(".amount-step .dsq-dialog-container").attr("tabindex", currency_dialog_tabindex);
				$("#currency-iso").parent().addClass("show-dialog").addClass("dd");
			}
		}
	}

	//fill fields with preselected template/beneficiary data
	if(page_type == "saved-templates"){
		actions.fill_fields(0, "templates-list");
	}else if(page_type == "saved-beneficiaries"){
		actions.fill_fields(0, "beneficiary-list");			
	}

	update_char_counters();

	$(".reset").live("click", function(){
		////page_mode = "select";
		if(page_type == "saved-templates"){
			/////actions.change(0, undefined);
			$("#templates-list li:not(.hidden):first").click();
		}else if(page_type == "saved-beneficiaries"){
			/////actions.change(0, undefined);
			$("#beneficiary-list li:first").click();
		}else if(page_type == "utility-company"){
			show_utility_company_fields("none")
		}
		//reset to default currencies
		$(".amount-step .label").html(default_currencies);
		//
		$("#show-converter").addClass("disabled").attr("disabled", true);
	});

	$("#beneficiary-iban-intrabank, #beneficiary-iban-domestic, #beneficiary-iban-international").live("blur", function(){
		amount.update_available_currencies();
		actions.fromIntrabankToUtilityCompany();
	});

	$("#modal-from-intra-to-bill #submit-confirmation").live("click", function(){
		actions.fromIntrabankToUtilityCompanySubmit();
	});
	$("#modal-from-intra-to-bill #cancel-confirmation").live("click", function(){
		actions.fromIntrabankToUtilityCompanyCancel();
	});
	
	$("#amount-textfield").live("blur", function(){
		amount.find_converted_amount();
	});

	//=====FOR INTERNATIONAL=====//
	// and transfer fx own error removal
	// step 2 error is removed for the error in transfer own of selecting the same account from and to
	$(document).on("click", "#to-account-list li, #from-account-list li, #currency-iso li", function(){
		$("#step-2 .validation-error, #step-4 .validation-error").remove();
	});
	
	//=====FOR UTILITY COMPANY=====//
	//on utility company select, show appropriate fields in step 4
	$("#predefined-beneficiaries-utility-company li:not(.non-selectable, .filter)").live("click", function(){
		//show correct utility company fields
		var temp = $(this).attr("id").split("-");
		var id = temp[2];
		show_utility_company_fields(id);
	});

	function show_utility_company_fields(id){
		$(".utility-company-fields").slideUp();
		$("#utility-company-fields-"+id).delay(500).slideDown();
	}

	if($("span.restoredState").text() != ""){
		restore_state($("span.restoredState").text());

		var tempIndex = jQuery.inArray("#edit-container", visibility_selectors);
		if(visibility_states[tempIndex] != "none"){
			$("#templates-list, #beneficiary-list").remove();
		}

		page_type = find_account_type($("#recipient-choice-dialog li.selected"));
		if($("#templates-list").length > 0 || $("#beneficiary-list").length > 0){
			page_mode = "select";
		}else{
			page_mode = "edit";
		}
		//$("#recipient-choice-dialog li.selected").click();
		if(page_type == "saved-beneficiaries"){
			actions.update_step_1(-1, -1);
			restore_state($("span.restoredState").text());			
		}
		
		$("#show-converter").removeClass("disabled").removeAttr("disabled");
		scroll.list(300);
	}

	//=====VALIDATIONS=====//
	$("form").submit(function(){

		var validator = new Validator();

		if(page_type == "saved-templates"){
			if($("#templates-list").length > 0){
				var validation_type = find_account_type($("#templates-list li.selected"));
			}else{
				var validation_type = find_validation_type();
				page_mode = "edit";
			}
			
			if(page_mode == "select"){
				var validations = [
					[$("#templates-list"), "has_selected", "not_selected"]
				];
			}
		}else if(page_type == "saved-beneficiaries"){
			if($("#beneficiary-list").length > 0){
				var validation_type = find_account_type($("#beneficiary-list li.selected"));
			}else{
				var validation_type = find_validation_type();
				page_mode = "edit";
			}
			
			if(page_mode == "select"){
				var validations = [
					[$("#beneficiary-list"), "has_selected", "not_selected"]
				];
			}
		}else{
			var validation_type = page_type;
		}
		if(validation_type == "transfer-own"){
			var validations = [
			   	[$("#from-account-list"), "has_selected", "not_selected"],
			   	[$("#amount-textfield"), "not_zero", "amount_zero"],
			   	[$("#amount-textfield"), "valid_amount", "not_valid_amount"],
			   	[$("#amount-textfield"), "not_empty", "not_empty"]
			];
   			if($("#to-account-list").is(":visible")){
   				var validation = [$("#to-account-list"), "has_selected", "not_selected"];
   				validations.push(validation);
   			}
   			var selected_to_account = find_selected_account_number("#to-account-list", "-1");
   			var selected_from_account = find_selected_account_number("#from-account-list", "-1");
   			var selected_to_account_currency = find_account_currency($("#to-account-list li.selected"));
   			var selected_from_account_currency = find_account_currency($("#from-account-list li.selected"));
   			
   			if(selected_to_account == selected_from_account){
   				validator.displayError($("#from-account-list"), "not_equal", "not_equal");
   			} else if(selected_from_account_currency != selected_to_account_currency) {
   				if(actions.check_future_dated_or_recurring())
   					validator.displayError($("#start-date"), "bigger_than_today", "bigger_than_today");
   			}
		}else if(validation_type == "intrabank"){
			var validations = [
				[$("#from-account-list"), "has_selected", "not_selected"],
				[$("#beneficiary-iban-intrabank"), "not_empty", "not_empty"],
				[$("#amount-textfield"), "not_zero", "amount_zero"],
				[$("#amount-textfield"), "valid_amount", "not_valid_amount"],
				[$("#amount-textfield"), "not_empty", "not_empty"]
			];
		}else if(validation_type == "domestic"){
			var validations = [
				[$("#from-account-list"), "has_selected", "not_selected"],
				[$("#amount-textfield"), "not_zero", "amount_zero"],
				[$("#amount-textfield"), "valid_amount", "not_valid_amount"],
				[$("#amount-textfield"), "not_empty", "not_empty"],
				[$("#payment-details-line-1"), "not_empty", "not_empty"],
				[$("#payment-order-number"), "not_empty", "not_empty"]
			];
			if(page_mode == "edit"){
				var validation = [$("#beneficiary-iban-domestic"), "not_empty", "not_empty"];
				validations.push(validation);
				validation = [$("#beneficiary-name"), "not_empty", "not_empty"];
				validations.push(validation);
				if($("#beneficiary-iban-domestic").val().replace(/ /g, "").substring(4, 8).toUpperCase() == "TREZ"){
					var validation = [$("#beneficiary-id"), "has_number", "no_number"];
					validations.push(validation);
					validation = [$("#beneficiary-id"), "not_empty", "not_empty"];
					validations.push(validation);
				} else if($("#beneficiary-id").val() != "") {
					var validation = [$("#beneficiary-id"), "has_number", "no_number"];
					validations.push(validation);
				}
			}
		}else if(validation_type == "international"){
			var selected_txn_currency = $("#currency-iso").text();
   			var selected_from_account_currency = find_account_currency($("#from-account-list li.selected"));
			
   			if(selected_from_account_currency != selected_txn_currency) {
   				if(actions.check_future_dated_or_recurring()){
   					validator.displayError($("#start-date"), "bigger_than_today", "bigger_than_today");
   				}
   			}
   			
			var validations = [
				[$("#from-account-list"), "has_selected", "not_selected"],
				[$("#beneficiary-iban-international"), "not_empty", "not_empty"],
				[$("#beneficiary-name-1"), "not_empty", "not_empty"],
				//[$("#beneficiary-name-2"), "not_empty", "not_empty"],
				//[$("#beneficiary-address"), "not_empty", "not_empty"],
				[[$("#beneficiary-bank-swift-code"), "min", 8], "char_length", "smaller_than_8"],
				[$("#beneficiary-bank-name"), "not_empty", "not_empty"],
				//[$("#beneficiary-bank-address"), "not_empty", "not_empty"],
				[$("#amount-textfield"), "not_zero", "amount_zero"],
				[$("#amount-textfield"), "valid_amount", "not_valid_amount"],
				[$("#amount-textfield"), "not_empty", "not_empty"],
				[$("#payment-details-line-1"), "not_empty", "not_empty"]
			];
		}else if(validation_type == "utility-company"){
			var validations = [
				[$("#predefined-beneficiaries-utility-company"), "has_selected", "not_selected"],
				[$("#from-account-list"), "has_selected", "not_selected"],
				[$("#amount-textfield"), "not_zero", "amount_zero"],
				[$("#amount-textfield"), "valid_amount", "not_valid_amount"],
				[$("#amount-textfield"), "not_empty", "not_empty"]
			];
			
			$(".utility-company-fields input").each(function(){
				if($(this).is(":visible")){
					validation = [$(this), "not_empty", "not_empty"];
					validations.push(validation);
				}
			});
			
//			if($("input[name=idField1]").length > 0){
//				validation = [$("input[name=idField1]"), "not_empty", "not_empty"];
//				validations.push(validation);
//			}
		}
		
		if($("#transaction-planner-dialog li:last").hasClass("selected")){
			var validation = [$("#recurring-interval"), "not_empty", "not_empty"];
			validations.push(validation);
			validation = [$("#recurring-interval"), "not_zero", "amount_zero"];
			validations.push(validation);
		}

		console.log(validations);

		var submit_status = validator.validate(validations, true, true);

		console.log("submit_status="+submit_status);

		if($("span.validation-error").length != 0)
			submit_status = false;
		
		if(submit_status == true){
			show_loading(false);
			save_state();
			fill_hidden_fields(validation_type);
		}

		return submit_status;

	});

	//=====CREATE AND FILL HIDDEN FIELDS=====//
	function fill_hidden_fields(validation_type){
		//globals
		$("input[name=FromAccount]").val(find_selected_account_number("#from-account-list", "-1"));
		
		$("input[name=TransactionCurrency]").val($("#currency-iso").text());
		
		$("input[name=TransactionAmount]").val($("#amount-textfield").val());
		//dates
		$("input[name=TransactionDate]").val($("#start-date").val());
		if(validation_type != "utility-company"){
			if($("#transaction-planner-dialog li:first").hasClass("selected")){
				var flag = "";
			}else{
				var flag = "on";
			}
			$("input[name=RepetitionFlag]").val(flag);
			$("input[name=RepetFreqEdit]").val($("#recurring-interval").val());
			if($("#recurring-duration-dialog li:first").hasClass("selected")){
				var combo = "D";
			}else{
				var combo = "M";
			}
			$("input[name=RepetFreqCombo]").val(combo);
			$("input[name=ExpirationDate]").val($("#end-date").val());
		}
		
		if(validation_type == "transfer-own"){
			$("input[name=ToAccount]").val(find_selected_account_number("#to-account-list", "-1"));
			$("input[name=Comments]").val($("#payment-details-line-1").val());
			//GIV:20120306:set the FX own transid
			fromCurrency = find_account_currency($("#from-account-list li.selected"));
			toCurrency = find_account_currency($("#to-account-list li.selected"));
			if(fromCurrency != toCurrency) {
				$("input[name=fromTransactionID]").val(transferOwnFXtxnID);
			} else {
				$("input[name=fromTransactionID]").val(transferOwnTxnID);
			}
		}else if(validation_type == "intrabank"){
			if(page_mode == "edit"){
				$("input[name=ToAccount]").val($("#beneficiary-iban-intrabank").val().replace(/ /g, "").substring(14));
				$("input[name=IBANAccountNumber]").val($("#beneficiary-iban-intrabank").val().replace(/ /g, ""));
			}else{
				$("input[name=ToAccount]").val($("#beneficiary-iban-intrabank").val().replace(/ /g, "").substring(14));
				$("input[name=IBANAccountNumber]").val($("#beneficiary-iban-intrabank").val().replace(/ /g, ""));
				//$("input[name=ToAccount]").val(find_selected_account_number("#to-account-list", "-1"));
			}
			$("input[name=Comments]").val($("#payment-details-line-1").val());
			$("input[name=SecondDescription]").val($("#payment-details-line-2").val());
			$("input[name=PaymentOrder]").val($("#payment-order-number").val());
		}else if(validation_type == "domestic"){
			if(page_mode == "edit"){
				$("input[name=IBANAccountNumber]").val($("#beneficiary-iban-domestic").val().replace(/ /g, ""));
				$("input[name=BeneficiaryFullName]").val($("#beneficiary-name").val());
				$("input[name=BeneficiaryIdentification]").val($("#beneficiary-id").val());
			}else{
				$("input[name=IBANAccountNumber]").val($("#beneficiary-iban-domestic").val().replace(/ /g, ""));
				$("input[name=BeneficiaryFullName]").val($("#beneficiary-name").val());
				$("input[name=BeneficiaryIdentification]").val($("#beneficiary-id").val());
				//$("input[name=IBANAccountNumber]").val(find_selected_account_number("#to-account-list", "-1"));
				//$("input[name=BeneficiaryFullName]").val($("#to-account-list li.selected .hidden-value.beneficiary-name").text());
				//$("input[name=BeneficiaryIdentification]").val($("#to-account-list li.selected .hidden-value.beneficiary-id").text());
			}
			$("input[name=DetailsOfPayment1]").val($("#payment-details-line-1").val());
			$("input[name=DetailsOfPayment2]").val($("#payment-details-line-2").val());
			$("input[name=PaymentOrder]").val($("#payment-order-number").val());
		}else if(validation_type == "international"){
			$("input[name=BenAccount]").val($("#beneficiary-iban-international").val());
			$("input[name=BenName1]").val($("#beneficiary-name-1").val());
			$("input[name=BenName2]").val($("#beneficiary-name-2").val());
			$("input[name=BenAdr]").val($("#beneficiary-address").val());
			$("input[name=BenSwiftCode]").val($("#beneficiary-bank-swift-code").val());
			if($("#beneficiary-bank-name").val().length > 35){
				$("input[name=BenBankName1]").val($("#beneficiary-bank-name").val().substring(0, 35));
				$("input[name=BenBankName2]").val($("#beneficiary-bank-name").val().substring(35));
			}else{
				$("input[name=BenBankName1]").val($("#beneficiary-bank-name").val());
			}
			$("input[name=BenBankAdr]").val($("#beneficiary-bank-address").val());
			
			//
			$("input[name=desc1]").val($("#payment-details-line-1").val());
			$("input[name=desc2]").val($("#payment-details-line-2").val());
			$("input[name=desc3]").val($("#payment-details-line-3").val());
			$("input[name=b2b1]").val($("#bank-to-bank-info-1").val());
			$("input[name=b2b2]").val($("#bank-to-bank-info-2").val());
			$("input[name=b2b3]").val($("#bank-to-bank-info-3").val());
			$("input[name=statCode]").val($("#statistical-code").val());
			$("input[name=documents]").val($("#documents").val());
			$("input[name=serviceType]").val($("#swift-priority-dialog li.selected .hidden-value").text());
			$("input[name=chargeType]").val($("#swift-charges-dialog li.selected .hidden-value").text());
		}else if(validation_type == "utility-company"){
			$("input[name=UtilityCompanyAccn]").val($("#predefined-beneficiaries-utility-company li.selected .hidden-value.utility-company-account").text());
			//disable not visible fields to not send them
			$(".utility-company-fields:not(:visible) input").attr("disabled", "disabled");
			$("input[name=PaymentOrder]").val($("#payment-order-number").val());
		}
	}
	
	function find_validation_type(){
		if($("#to-account-list").length > 0){
			result = "transfer-own";
		}else if($("#beneficiary-iban-intrabank").length > 0){
			result = "intrabank";
		}else if($("#beneficiary-iban-domestic").length > 0){
			result = "domestic";
		}else if($("#beneficiary-iban-international").length > 0){
			result = "international";
		}else if($("#utility-company-list").length > 0){
			result = "utility-company";
		}
		return result;
	}

});