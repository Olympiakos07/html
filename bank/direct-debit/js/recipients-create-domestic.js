var page_type = "domestic";

$(document).ready(function(){
	
	if($("#modal-confirm .result").text() != ""){
		$(".ui-dialog-title").text($(".result-title").text());
		$("#modal-confirm .information").hide();
		$("#modal-confirm .result").show();
		$("#modal-confirm .modal-button").addClass("hidden");
		$("#ok").removeClass("hidden");
		$("#modal-confirm").dialog("open");
	}
	
	$("#type-submit-button").click(function(){
		var validations = [
			[$("#beneficiary-iban-domestic"), "not_empty", "not_empty"],
			[$("#beneficiary-name"), "not_empty", "not_empty"],
			[$("#beneficiary-description"), "not_empty", "not_empty"]
		];

		if($("#beneficiary-iban-domestic").val().replace(/ /g, "").substring(4, 8).toUpperCase() == "TREZ"){
			var validation = [$("#beneficiary-id"), "has_number", "no_number"];
			validations.push(validation);
			validation = [$("#beneficiary-id"), "not_empty", "not_empty"];
			validations.push(validation);
		} else if($("#beneficiary-id").val() != "") {
			var validation = [$("#beneficiary-id"), "has_number", "no_number"];
			validations.push(validation);
		}

		var validator = new Validator();
		var submit_status = validator.validate(validations, true, true);
		
		console.log("submit_status="+submit_status);

		if($("span.validation-error").length != 0)
			submit_status = false;
		
		if(submit_status == true){
			//fill modal data
			$("#modal-confirm .beneficiary-iban").text($("#beneficiary-iban-domestic").val());
			$("#modal-confirm .beneficiary-name").text($("#beneficiary-name").val());
			$("#modal-confirm .beneficiary-id").text($("#beneficiary-id").val());
			$("#modal-confirm .beneficiary-description").text($("#beneficiary-description").val());
			//
			$("#modal-confirm .result").hide();
			$("#modal-confirm .information").show();
			$(".ui-dialog-title").text($(".update-title").text());
			$("#modal-confirm .modal-button").addClass("hidden");
			$("#submit-confirmation, #cancel-confirmation").removeClass("hidden");
			$("#modal-confirm").dialog("open");
		}
	});

	$("#cancel-confirmation").click(function(){
		$("#modal-confirm").dialog("close");
	});
	
	$("#ok").click(function(){
		$("#modal-confirm").dialog("close");
	});

	$("#submit-confirmation").click(function(){
		$("form").submit();
	});

	//also remove the error from id, because the id validation depends on the iban (check form submit to see the dependancy)
	$("#beneficiary-iban").keyup(function(){
		$("#beneficiary-id").next().find(".validation-error").remove();
	});

	if($("span.restoredState").text() != ""){
		restore_state($("span.restoredState").text());
	}

	$("#recipient-choice-dialog li ").click(function(){
		var transId = $(this).find(".transaction-id").text();
		var url = menuChange(transId);
		var link = $(this).find("a");
		link.attr("href",url);
	});
	
	//=====FORM SUBMIT/VALIDATIONS=====//
	$("form").submit(function(){
		
		save_state();
		//fill in the hidden fields
		create_hidden_fields();
		show_loading(false);

		return true;
	});

	//=====CREATE HIDDEN FIELDS=====//
	function create_hidden_fields(){

		//find values
		$("input[name=IBANAccountNumber]").val($("#beneficiary-iban-domestic").val().replace(/ /g, ""));
		$("input[name=BeneficiaryName]").val($("#beneficiary-name").val());
		$("input[name=BeneficiaryIdentification]").val($("#beneficiary-id").val());
		$("input[name=BeneficiaryDescription]").val($("#beneficiary-description").val());

	}

});

	function menuChange(transId){
		var setup = $("input[name=Setup]").val();
		var url = "Controller?nextPage=manage_beneficiaries";
		if(transId != 'all'){//in case of save-template option
			url += "&actionFlag=input";
			url += "&fromTransactionID="+transId;
		}else{
			url += "&actionFlag=view";
		}
		url += "&Setup="+setup;
		return url;
	}