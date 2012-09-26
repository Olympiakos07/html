var page_type = "";

var recipients = {};

function list_clicked(id, index, changed){
	recipients.change(index);
}

function list_action_clicked(id, index, action){
	recipients.change(index);
	recipients.destroy(index);
}

$(document).ready(function(){

	//=====ON LOAD=====//
	$("#beneficiary-iban-intrabank").attr("readonly", "readonly");

	//for unknown reason, we can catch the click on the x button
	//we need to make the action = update on its click, so we removed it
	//$("#modal-confirm").parent().find(".ui-dialog-titlebar-close").addClass("hidden");
	
	if($("#modal-confirm .result").text() != ""){
		$(".ui-dialog-title").text($(".result-title").text());
		$("#modal-confirm .information").hide();
		$("#modal-confirm .result").show();
		$("#modal-confirm .modal-button").addClass("hidden");
		$("#ok").removeClass("hidden");
		$("#modal-confirm").dialog("open");
	}

	//action udage explanation
	//update is the default state, we always revert to it after any completed action
	//it becomes delete when we click a delete button
	//on popup submit, we submit the form
	//on main submit form button press, actions is update, so, it validates the input
	//popup opens, and if we press submit, action = confirmed-update and form.submit() is called again, but this time it just submits the actual form (no validation or popups opened)
	var action = "update";

	recipients = {
		
		change: function(index){
			$("input[name=actionFlag]").val("modify");
			//fix height and enable submit button
			$("#step-1").children("div.content").height("auto");
			$(".form .buttons input").removeAttr('disabled');
			//remove errors from previous beneficiaries
			$(".validation-error").remove();

			//show steps
			$("#step-2, #step-3").slideDown();

			var selected_recipient = $("#recipients-list li:eq("+index+")");
			if(selected_recipient.hasClass("intrabank")){
				page_type = "intrabank";
				//show fields
				$(".content.domestic, .content.international").css("display", "");
				$(".content.intrabank").css("display", "table-cell")
				//update data
				// var fire = split_iban(selected_recipient.find(".beneficiary-iban").text());
				$("#beneficiary-iban-intrabank").val(split_iban(selected_recipient.find(".beneficiary-iban").text()));
			}else if(selected_recipient.hasClass("domestic")){
				page_type = "domestic";
				//show fields
				$(".content.intrabank, .content.international").css("display", "");
				$(".content.domestic").css("display", "table-cell");
				//update data
				$("#beneficiary-iban-domestic").val(split_iban(selected_recipient.find(".beneficiary-iban").text()));
				$("#beneficiary-name").val(selected_recipient.find(".beneficiary-name").text());
				$("#beneficiary-id").val(selected_recipient.find(".beneficiary-id").text());
			}else if(selected_recipient.hasClass("international")){
				page_type = "international";
				//show fields
				$(".content.intrabank, .content.domestic").css("display", "");
				$(".content.international").css("display", "table-cell")
				//update data
				$("#beneficiary-iban-international").val(selected_recipient.find(".beneficiary-iban").text());
				$("#beneficiary-name-1").val(selected_recipient.find(".beneficiary-name-1").text());
				$("#beneficiary-name-2").val(selected_recipient.find(".beneficiary-name-2").text());
				$("#beneficiary-address").val(selected_recipient.find(".beneficiary-address").text());
				$("#beneficiary-bank-name").val(selected_recipient.find(".beneficiary-bank-name-1").text() + selected_recipient.find(".beneficiary-bank-name-2").text());
				$("#beneficiary-bank-address").val(selected_recipient.find(".beneficiary-bank-address").text());
				$("#beneficiary-bank-swift-code").val(selected_recipient.find(".beneficiary-bank-swift-code").text());

			}
			//also update description
			$("#beneficiary-description").val(selected_recipient.find(".beneficiary-description").text());
			$("#beneficiary-iban-intrabank, #beneficiary-iban-domestic, #beneficiary-iban-international").each(function() {
				resize_font(this);
			});
			
			setTimeout(function(){mainHeightFix()}, 500);
		},

		destroy: function(index){
			action = "delete";
			//
			$("input[name=actionFlag]").val("delete");
			$("input[name=fromTransactionID]").val($("#recipients-list li:eq("+index+") .transaction-id").text());
			$("input[name=PayeeStp]").val($("#recipients-list li:eq("+index+") .payeestp").text());
			//
			$("#modal-confirm .information").hide();
			$("#modal-confirm .delete, #modal-confirm .confirm").show();
			$(".ui-dialog-title").text($(".delete-title").text());
			$("#modal-confirm .account-number").text(find_selected_account_number("#recipients-list", index));
			$("#modal-confirm .modal-button").addClass("hidden");
			$("#submit-confirmation, #cancel-confirmation").removeClass("hidden");
			$("#modal-confirm .success").removeClass("success");
			$("#modal-confirm").dialog("open");
		},
		
		update: function(){
			action = "update";
			$("#modal-confirm .information").hide();
			$("#modal-confirm .update, #modal-confirm .confirm").show();
			$(".ui-dialog-title").text($(".update-title").text());
			var index = $("#recipients-list li.selected").index();
			$("#modal-confirm .account-number").text(find_selected_account_number("#recipients-list", index));
			$("#modal-confirm .modal-button").addClass("hidden");
			$("#submit-confirmation, #cancel-confirmation").removeClass("hidden");
			$("#modal-confirm .success").removeClass("success");
			$("#modal-confirm").dialog("open");
		}

	}

	
	$("input:submit").click(function(){
		action = "update";
		$("input[name=actionFlag]").val("modify");
	});
	
	$("#submit-confirmation").click(function(){
		if(action == "update"){
			action = "confirmed-update"
		}
		$("form").submit();
	});

	$("#cancel-confirmation").click(function(){
		action = "update";
		$("#modal-confirm").dialog("close");
	});
	
	$("#ok").click(function(){
		$("#modal-confirm").dialog("close");
	});

	if($("span.restoredState").text() != ""){
		restore_state($("span.restoredState").text());
		$(".form .buttons input").removeAttr('disabled');
	}
	
	
	$("#recipient-choice-dialog li ").click(function(){
		var transId = $(this).find(".transaction-id").text();
		var url = menuChange(transId);
		var link = $(this).find("a");
		link.attr("href",url);
	});
	
	
	//=====FORM SUBMIT/VALIDATIONS=====//
	$("form").submit(function(){
		console.log(action);
		if(action == "update"){
			if($("#recipients-list li.selected").hasClass("intrabank")){
				var validations = [
					[$("#beneficiary-description"), "not_empty", "not_empty"]
				];
			}else if($("#recipients-list li.selected").hasClass("domestic")){
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
			}else if($("#recipients-list li.selected").hasClass("international")){
				var validations = [
					[$("#beneficiary-iban-international"), "not_empty", "not_empty"],
					[$("#beneficiary-name-1"), "not_empty", "not_empty"],
					////[$("#beneficiary-name-2"), "not_empty", "not_empty"],
					[[$("#beneficiary-bank-swift-code"), "min", 8], "char_length", "smaller_than_8"],
					[$("#beneficiary-bank-name"), "not_empty", "not_empty"],
				];
			}

			var validator = new Validator();
			var submit_status = validator.validate(validations, true, true);
			
			console.log("submit_status="+submit_status);

			if($("span.validation-error").length != 0)
				submit_status = false;
			
			if(submit_status == true){
				//save_state();
				//fill in the hidden fields
				create_hidden_fields();
				//show_loading();
				recipients.update();
			}
			return false;
		}else if(action == "confirmed-update"){
			save_state();
			action = "update";
			return true;
		}else if(action == "delete"){
			action = "update";
			return true;
		}

	});

	//=====CREATE HIDDEN FIELDS=====//
	function create_hidden_fields(){
		if($("#recipients-list li.selected").hasClass("intrabank")){
			var type = "intrabank";
		}else if($("#recipients-list li.selected").hasClass("domestic")){
			var type = "domestic";
		}else if($("#recipients-list li.selected").hasClass("international")){
			var type = "international";
		}

		//find values
		$("input[name=fromTransactionID]").val($("#recipients-list li.selected .transaction-id").text());
		$("input[name=PayeeStp]").val($("#recipients-list li.selected .payeestp").text());
		$("input[name=IBANAccountNumber]").val($("#beneficiary-iban-"+type).val());
		$("input[name=BeneficiaryDescription]").val($("#beneficiary-description").val());

		if(type == "domestic"){
			$("input[name=BeneficiaryName]").val($("#beneficiary-name").val());
			$("input[name=BeneficiaryIdentification]").val($("#beneficiary-id").val());
		}else if(type == "international"){
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

	}

})

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