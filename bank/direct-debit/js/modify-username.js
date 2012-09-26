$(document).ready(function(){
	
	//=====ON LOAD=====//

	//=====FORM SUBMIT=====//
	$("form").submit(function() {
		var validations = [
			[[$("#new-username"), "not_equal", $(".current-username").text().trim()], "equality", "same_usernames"],
			[[$("#new-username"), "max", 12], "char_length", "bigger"],
			[[$("#new-username"), "min", 8], "char_length", "smaller"],
			[$("#new-username"), "has_number", "no_numbers"],
			[$("#new-username"), "has_letter", "no_letters"],
			[$("#new-username"), "not_empty", "not_empty"]
		];

		var submit_status = validator(validations, true);

		console.log("submit_status="+submit_status);

		if($("span.validation-error").length != 0){
			submit_status = false;
		}

		if(submit_status == true){
			$("#modal-confirm p:first strong:eq(1)").text($("#new-username").val());
			$("#modal-confirm").dialog("open");
		}

		return false;
	});

	//====CONFIRMATION BUTTONS=====//
	$("#submit-confirmation").click(function(){
		$("#modal-confirm").dialog("close");
		var username = $("#new-username").val();

		
		//THESE ARE DUMMY DATA AND MUST BE REMOVED AND UNCOMMENT THE FOLLOWING BLOCK OF CODE TO REPLACE IT
		var jsArray = {
			"status": "1"
		}

		$("#modal-success").dialog("open");
		$("#modal-success").parent().find(".ui-dialog-titlebar-close").css("display", "none");

		/*$.post(
				entryPoint,
				{operation:operation, conversationId:conversationId, newUserName:username},
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