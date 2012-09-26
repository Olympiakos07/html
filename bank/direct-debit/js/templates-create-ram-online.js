function resetClicked(){
	$(".yes-3rd-party-fields").slideUp().removeClass("open");
	$(".no-3rd-party-fields").delay(500).slideDown().addClass("open");
	$("#is-3rd-party li").removeClass("selected");
	$("#is-3rd-party li:first").addClass("selected");
}

$(document).ready(function() {

	//=====ON LOAD=====//
	$("#predefined-beneficiaries-ram-fund li a span").each(function(){
		$(this).text(split_iban($(this).text()));
	});

	//=====EVENTS=====//
	$(".yes-3rd-party, .no-3rd-party").off('click');
	$(".yes-3rd-party, .no-3rd-party").click(function(){
		$(".dsq-dialog").removeClass("open").slideUp();
		var value = $(this).text();
		$(this).parent().parent().prev().text(value);
		$(this).parent().parent().children("li").removeClass("selected");
		$(this).parent().addClass("selected");
		if($(this).hasClass("yes-3rd-party")){
			$(this).closest(".step").find(".validation-error").remove();
			$(".no-3rd-party-fields").slideUp().removeClass("open");
			$(".yes-3rd-party-fields").delay(400).slideDown().addClass("open");
		}else{
			$(".yes-3rd-party-fields").slideUp().removeClass("open");
			$(".no-3rd-party-fields").delay(400).slideDown().addClass("open");
		}
	});

	
	fill_form();
	
	
	//=====SUBMIT=====//
	$("form").off('submit');
	$("form").submit(function(){
		var validations = [
			[$("#predefined-beneficiaries-ram-fund"), "has_selected", "not_selected"],
			[$("#from-account-list"), "has_selected", "not_selected"],
			[$("#template-name"), "not_empty", "not_empty"]
		];

		if($("#is-3rd-party li.selected span.yes-3rd-party").length > 0){
			validation = [$("#third-party-name"), "not_empty", "not_empty"];
			validations.push(validation);
			validation = [$("#third-party-cnp"), "not_empty", "not_empty"];
			validations.push(validation);
		}
		
		var validator = new Validator();
		var submit_status = validator.validate(validations, true, true);
		
		if (submit_status){
			//cross currency is not allowed
			var currency1 = $("#predefined-beneficiaries-ram-fund li.selected .hidden-value.currency").text();
			var currency2 = find_account_currency($("#from-account-list li.selected"));
			var foundError = validator.checkEquality([currency1, "equal", currency2]);
			if(foundError){
				submit_status = false;
				validator.displayError($("#from-account-list"), "not_equal", "not_equal");
			}
		}
		
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
		var ToAccount = $("#predefined-beneficiaries-ram-fund li.selected .hidden-value.id").text();
		var FromAccount = find_selected_account_number("#from-account-list", "-1");
		var thirdParty = "";
		var thirdParty_cnp = "";
		var thirdParty_name = "";
		var TransactionTemplateName = $("#template-name").val();
		var transactionId = '0208';
		var ActionFlag = $('span.hidden-value.action-mode').text();
	
		if ( $("#is-3rd-party li.selected span").hasClass("yes-3rd-party") ){
			thirdParty = "on";
			thirdParty_name = $("#third-party-name").val();
			thirdParty_cnp = $("#third-party-cnp").val();
		}
		
		submit_data = {
			"ToAccount": ToAccount,
			"FromAccount": FromAccount,
			"thirdParty": thirdParty,
			"thirdParty_cnp": thirdParty_cnp,
			"thirdParty_name": thirdParty_name,
			"transactionTemplateName": TransactionTemplateName,
			"fromTransactionID": transactionId,
			"actionFlag" : ActionFlag
		};
		
		if ( ActionFlag === template_action_modify ){
			submit_data.transactionTemplate = $("#manage-templates-list li.selected span.hidden-value.transaction-template").text();
		}

	}

	//populate the form with the data by the hidden fields
	function fill_form(){
		var index = find_selected_ram_account_index( $("input[name=ToAccount]").val() );
		$("#predefined-beneficiaries-ram-fund li:eq(" + index + ")").addClass("selected");
		var index = find_account_index("from-account-list", $("input[name=FromAccount]").val());
		$("#from-account-list li:eq(" + index + ")").addClass("selected");

		$("#template-name").val($("input[name=transactionTemplateName]").val());
		$("#third-party-name").val($("input[name=thirdParty_name]").val());
		$("#third-party-cnp").val($("input[name=thirdParty_cnp]").val());
		if ( "on"===$("input[name=thirdParty]").val() &&
				( ($("input[name=thirdParty_name]").val().length + $("input[name=thirdParty_cnp]").val().length) > 0 )
		   )
		{
			$(".yes-3rd-party").click();
		}
		
		//fix scroll due to list size change
		scroll.list(500);
	}
	
	function find_selected_ram_account_index(selected_account){
		var i=1;	//0 is the filter li
		var result = -1;
		
		$("#predefined-beneficiaries-ram-fund li.ram-fund").each(function(){
			var number = $(this).find('span.hidden-value.id').text();
			if(number === selected_account){
				result = i;
			}
			i++;
		});
		return result;
	}

});