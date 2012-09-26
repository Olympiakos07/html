$(document).ready(function() {

	$("form").submit(function(){
		var validations = [
			[$("#password"), "not_empty", "not_empty"]
		];
		
		var validator = new Validator();
		var submit_status = validator.validate(validations, true, true);

		return submit_status;
	});

})