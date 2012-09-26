$(document).ready(function() {

	var password = retrieveAuthenticationFieldId();
	password.focus();
	
	$("form").submit(function(){
		
		$('span.errorBE').text('');
		
		var errorId = retrieveErrorId();
		var vldMethod = "not_empty";
		
		var validations = [
		 	[password, vldMethod, errorId]
		];
		
		var validator = new Validator();
		var	submit_status = validator.validate(validations, true, true);
		
		if(submit_status){
			create_hidden_fields(password);
			show_loading(false);
		}
		
		return submit_status;
	});

})

function retrieveAuthenticationFieldId() {
	if($('#authentication-code').length > 0){
		return  $('#authentication-code');
	}
	if($('#password').length > 0) {
		return $('#password');
	}
}

function retrieveErrorId(){
	if($('#authentication-code').length > 0){
		return  "not_empty_emv_password";
	}
	if($('#password').length > 0) {
		return "not_empty_static_password";
	}
}

function create_hidden_fields(password) {
	$("input.otp").val(password.val());
	$("input.pin").val(password.val());
}


