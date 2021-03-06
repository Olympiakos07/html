$(document).ready(function() {
	
	
	
	$("form").submit(function(){
		
		$('span.validation-error').text('');
		$('span.errorBE').text('');
		
		if( $('#new-password').length > 0 ){
			var validations = [
	   		 	[ [$('#username'), 				"min", 8], "char_length", "username_size_larger_than_8"],
	   		 	[ [$('#new-password'), 			"min", 8], "char_length", "new_password_size_larger_than_8"],
	   		 	[ [$('#confirm-new-password'), 	"min", 8], "char_length", "confirm_new_password_size_larger_than_8"],
	   		 	[ [$('#confirm-new-password'), "equal", $('#new-password').val()], "equality", "confirm_new_password_same_as_new_password"],
	   		 	[ [$('#new-password'), 	"not_equal",	$('#password').val()], 	"equality", "new_password_not_same_as_password"],
	   		 	[ [$('#username'), 	"not_equal",		$('#new-password').val()], "equality", "username_not_same_as_new_password"]
	   		];
		
		} else {
			
			var validations = [
       		 	[ [$('#username'), "min", 8], "char_length", "username_size_larger_than_8"]
       		 ];
		}
		
		
		var validator = new Validator();
		var submit_status = validator.validate(validations, true, true);
		
		if(submit_status) {
			create_hidden_fields();
			//disable_submit();
		}
		
		return submit_status;
	});

})
function go2SecurityPDF(retail) {
	var locale_ = $("#userLocaleToString_hidden").val();
	if (retail == '1')
		PopUpResize('open_retail_security_info?Lang='+locale_+'&version='+version,800,600);
	else
		PopUpResize('open_commercial_security_info?Lang='+locale_+'&version='+version,800,600);
}

function create_hidden_fields(){
	$("input.newUserName").val($('#username').val());
	$("input.CurrentPIN").val($('#password').val());
	$("input.newPassword").val($('#new-password').val());
	$("input.validateNewPassword").val($('#confirm-new-password').val());
}