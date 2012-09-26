$(document).ready(function(){
	
	//=====ON LOAD=====//
	$("#old-password, #new-password, #confirm-new-password").on("blur", function(){
		$("#old-password, #new-password, #confirm-new-password").blur();
	});

	//=====FORM SUBMIT=====//
	$("form").submit(function() {
		var validations = [
			[$("#old-password"), "not_empty", "not_empty"],
			[[$("#confirm-new-password"), "equal", $("#new-password").val()], "equality", "wrong_confirm_password"],
			[[$("#new-password"), "not_equal", $(".username").val()], "equality", "password_same_with_username"],
			[[$("#new-password"), "not_equal", $("#old-password").val()], "equality", "same_passwords"],
			[[$("#new-password"), "max", 12], "char_length", "bigger"],
			[[$("#new-password"), "min", 8], "char_length", "smaller"],
			[$("#new-password"), "has_number", "no_numbers"],
			[$("#new-password"), "has_letter", "no_letters"],
			[$("#new-password"), "not_empty", "not_empty"]
		];

		var validator = new Validator();
		var submit_status = validator.validate(validations, true, true);

		console.log("submit_status="+submit_status);

		if($("span.validation-error").length != 0){
			submit_status = false;
		}

		if(submit_status == true){
			$("#modal-confirm .current-email").text($(".current-email").text().trim());
			$("#modal-confirm .new-email").text($("#new-email").val());
			$("#modal-confirm").dialog("open");
		}

		return false;
	});

	//====CONFIRMATION BUTTONS=====//
	$("#submit-confirmation").click(function(){
		$("#modal-confirm").dialog("close");
		var old_password = $("#old-password").val();
		var new_password = $("#new-password").val();
		var confirm_new_password = $("#confirm-new-password").val();

		//THESE ARE DUMMY DATA AND MUST BE REMOVED AND UNCOMMENT THE FOLLOWING BLOCK OF CODE TO REPLACE IT
		var jsArray = {
			"status": "1"
		}

		$("#modal-success").dialog("open");
		$("#modal-success").parent().find(".ui-dialog-titlebar-close").css("display", "none");

		/*$.post(
				entryPoint,
				{operation:operation, conversationId:conversationId, NewPIN:new_password, ValidateNewPIN:confirm_new_password, MonetaryConfirmationPassword:old_password},
				function(jsArray){
					remove_loading();
					if(jsArray.status == "1"){
						$("#modal-success p").text(jsArray.message);
						$("#modal-success").dialog("open");
						$("#modal-success").parent().find(".ui-dialog-titlebar-close").css("display", "none");
					}else{
						$("#errors-modal p").remove();
						var errorsModelText = "<p>" + jsArray.message.replace(/\n/g,"</p><p>") + "</p>";
						$("#errors-modal").append($(errorsModelText));
						$("#errors-modal").dialog("open");
					}
				}, 
				"json"
		);*/
	});

	$("#cancel-confirmation").click(function(){
		$("#modal-confirm").dialog("close");
	});

});