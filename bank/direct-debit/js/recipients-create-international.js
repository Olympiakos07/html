var page_type = "international";

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
			[$("#beneficiary-iban-international"), "not_empty", "not_empty"],
			[$("#beneficiary-name-1"), "not_empty", "not_empty"],
			//[$("#beneficiary-name-2"), "not_empty", "not_empty"],//GIV:20120403:BUG_1044_UIF 20120320
			[[$("#beneficiary-bank-swift-code"), "min", 8], "char_length", "smaller_than_8"],
			[$("#beneficiary-bank-name"), "not_empty", "not_empty"]
		];

		var validator = new Validator();
		var submit_status = validator.validate(validations, true, true);
		
		console.log("submit_status="+submit_status);

		if($("span.validation-error").length != 0)
			submit_status = false;
		
		if(submit_status == true){
			//fill modal data
			$("#modal-confirm .beneficiary-iban").text($("#beneficiary-iban-international").val());
			$("#modal-confirm .beneficiary-name-1").text($("#beneficiary-name-1").val());
			$("#modal-confirm .beneficiary-name-2").text($("#beneficiary-name-2").val());
			$("#modal-confirm .beneficiary-address").text($("#beneficiary-address").val());
			$("#modal-confirm .beneficiary-bank-swift-code").text($("#beneficiary-bank-swift-code").val());
			$("#modal-confirm .beneficiary-bank-name").text($("#beneficiary-bank-name").val());
			$("#modal-confirm .beneficiary-bank-address").text($("#beneficiary-bank-address").val());
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

		$("input[name=IBANAccountNumber]").val($("#beneficiary-iban-international").val());
		$("input[name=BeneficiaryDescription]").val($("#beneficiary-description").val());
		$("input[name=BenName1]").val($("#beneficiary-name-1").val());
		$("input[name=BenName2]").val($("#beneficiary-name-2").val());
		$("input[name=BenAdr]").val($("#beneficiary-address").val());
		if($("#beneficiary-bank-name").val().length > 35){
			$("input[name=BenBankName1]").val($("#beneficiary-bank-name").val().substring(0, 35));
			$("input[name=BenBankName2]").val($("#beneficiary-bank-name").val().substring(35));
		}else{
			$("input[name=BenBankName1]").val($("#beneficiary-bank-name").val());
		}
		$("input[name=BenBankAdr]").val($("#beneficiary-bank-address").val());
		$("input[name=BenSwiftCode]").val($("#beneficiary-bank-swift-code").val());
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