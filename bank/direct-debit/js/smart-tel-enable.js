$(document).ready(function(){

	$("form").submit(function(){

		var validations = [
			[$("#terms-checkbox"), "is_checked", "not_agreed_with_terms"]
		];

		var validator = new Validator();
		var submit_status = validator.validate(validations, true, true);

		console.log("submit_status="+submit_status);

		if ( submit_status ){
			
			show_loading(true);
			
			$.post(
					entrypoint,
					{
						operation: operation, 
						conversationId: $("input[name=conversationId]").val(),
						EnrollSmartTel: "on",
						agreeWithChkBox: "on"
					},
					function(jsArray){
						if ( jsArray.hasErrors ){
							remove_loading();
							$("#errors-modal p").empty().text(jsArray.messages);
							$("#errors-modal").dialog("open");
						}
						else{
							window.location = $("#errors-modal a").attr('href');
						}
					}, 
					"json"
			);
		}
		
		return false;
	});

});