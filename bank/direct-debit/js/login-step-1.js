$(document).ready(function() {

	$("#username").focus();
	
	$("form").submit(function(){
		
		$('span.errorBE').text('');
		
		var validations = [
			[ [$('#username'), "min", 8], "char_length", "username_size_larger_than_8"]
		];
		var validator = new Validator();
		var submit_status = validator.validate(validations, true, true);
		
		
		$("input.username").val($("#username").val());
		
		return submit_status;
	});

})