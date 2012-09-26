$(document).ready(function(){
	
	//=====ON LOAD=====//

	//=====FORM SUBMIT=====//
	$("form").submit(function() {
		//console.log($(".current-email:first").text().trim());
		/*var validations = [
			[[$("#new-email").val(), "not_equal", $(".current-email:first").text().trim()], "equality", "same_emails"],
			[$("#new-email").val(), "is_email", "not_valid_email"],
			[$("#new-email").val(), "not_empty", "not_empty"]
		];

		var submit_status = validator(validations, true);

		console.log("submit_status="+submit_status);
		*/
		var submit_status = true;
		if($("span.validation-error").length != 0){
			submit_status = false;
		}

		if(submit_status == true){
			var currentEmail = $("#step-1 .current-email").text().trim();

			if(currentEmail){
				$("#modal-confirm .current-email").text(currentEmail);
			}else{
				$("#modal-confirm .current-email-container").css("display", "none");
			}
			$("#modal-confirm .new-email").text($("#new-email").val());
			$("#modal-confirm").dialog("open");
		}

		return false;
	});

	//====CONFIRMATION BUTTONS=====//
	$("#submit-confirmation").click(function(){
		$("#modal-confirm").dialog("close");
		var email = $("#new-email").val();

		//THESE ARE DUMMY DATA AND MUST BE REMOVED AND UNCOMMENT THE FOLLOWING BLOCK OF CODE TO REPLACE IT
		var jsArray = {
			"status": "1"
		}

		$("#modal-success").dialog("open");
		$("#modal-success").parent().find(".ui-dialog-titlebar-close").css("display", "none");

		/*$.post(
				entryPoint,
				{operation:operation, conversationId:conversationId, NewEmail:email},
				function(jsArray){
					if(jsArray.status == "1"){
						$("#modal-success").dialog("open");
						$("#modal-success").parent().find(".ui-dialog-titlebar-close").css("display", "none");
					}else{
						$("#errors-modal p").text(jsArray.errorMessage);
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