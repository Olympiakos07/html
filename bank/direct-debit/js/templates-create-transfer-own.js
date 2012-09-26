var submit_data = {};

$(document).ready(function(){

	//=====ON LOAD=====//
	fill_form();

	//=====SUBMIT=====//
	$("form").unbind('submit');
	$("form").submit(function(){
		var validations = [
			[$("#to-account-list"), "has_selected", "not_selected"],
			[$("#from-account-list"), "has_selected", "not_selected"],
			[$("#template-name"), "not_empty", "not_empty"]
		];

		var validator = new Validator();
		var submit_status = validator.validate(validations, true, true);
		
		console.log("submit_status="+submit_status);
		
		if($("span.validation-error").length != 0)
			submit_status = false;

		if(submit_status == true){
			fill_hidden_fields();
			authorization.call();
		}

		return false;
	});

	//=====CREATE AND FILL HIDDEN FIELDS=====//
	function fill_hidden_fields(){
		// fill in hidden fields
		var ToAccount = find_selected_account_number("#to-account-list", "-1");
		var FromAccount = find_selected_account_number("#from-account-list", "-1");
		var Comments = $("#payment-details-line-1").val();
		var TransactionTemplateName = $("#template-name").val();
		var transactionId = get_transaction_id();
		var ActionFlag = $('span.hidden-value.action-mode').text();

		submit_data = {
			"ToAccount": ToAccount,
			"FromAccount": FromAccount,
			"Comments": Comments,
			"transactionTemplateName": TransactionTemplateName,
			"fromTransactionID": transactionId,
			"actionFlag" : ActionFlag
		};
		
		if ( ActionFlag === template_action_modify ){
			submit_data.transactionTemplate = $("#manage-templates-list li.selected span.hidden-value.transaction-template").text();
		}
		
		console.log(submit_data);
	}

	//populate the form with the data by the hidden fields
	function fill_form(){
		var index = find_account_index("to-account-list", $("input[name=ToAccount]").val());
		if(index > 0){		
			$("#to-account-list li:eq(" + index + ")").addClass("selected");
		}
		var index = find_account_index("from-account-list", $("input[name=FromAccount]").val());
		if(index > 0){
			$("#from-account-list li:eq(" + index + ")").addClass("selected");
		}
		$("#payment-details-line-1").val($("input[name=Comments]").val()).blur();
		$("#template-name").val($("input[name=transactionTemplateName]").val());
	}
	
	function get_transaction_id(){
		var toCurr = get_currency( "#to-account-list li.selected" );
		var fromCurr = get_currency( "#from-account-list li.selected" );
		
		if ( toCurr === fromCurr ){
			return '0003';
		}
		else{
			return '0110';
		}
	}
	
	function get_currency(selector){
		var classes_str = $(selector).attr('class');
		var classes_array = classes_str.split(' ');
		for(i=0; i<classes_array.length; i++){
			if(classes_array[i].length >8 && 
			classes_array[i].substring(0,9) === 'currency-'){
				var temp = classes_array[i].split('-');
				var currency = temp[1];
				return currency;
			}
		}
	}

});