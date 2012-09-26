$(document).ready(function(){

	var action='';
	
	//=====EVENTS=====//
	var password_changed = false;
	$("#password").keyup(function(){
		password_changed = true;
	});

	//disenroll button
	$("#button-disenroll").click(function(){
		action = 'disenroll';
		authorization.call();
	});

	//enroll/disenroll (with authorization) submit button
	$("#modal-actions .authorize .submit-confirmation").click(function(){
		var validations = [
			[$("#authorization-code"), "not_empty", "not_empty"]
		];

		var validator = new Validator();
		var submit_status = validator.validate(validations, true, true);
		
		if(submit_status){
			submit.call();
		}
	});

	//enroll/disenroll (with password) submit button
	$("#modal-actions .password .submit-confirmation").click(function(){
		var validations = [
			[$("#authorization-password"), "not_empty", "not_empty"]
		];

		var validator = new Validator();
		var submit_status = validator.validate(validations, true, true);
		
		if(submit_status){
			submit.call();
		}
	});

	//submit buttons for enroll/disenroll without authorization
	$("#modal-actions .disenroll .submit-confirmation, #modal-actions .enroll .submit-confirmation").click(function(){
		submit.call();
	});

	//unblock button
	$("#button-unblock").click(function(){
		unblock.call();
	});

	//unblock ok
	$("#modal-actions .unblock .submit-confirmation").click(function(){
		$("#modal-actions").dialog("close");
	});

	//general modal buttons
	$("#modal-actions .submit .submit-confirmation").click(function(){
		$("#modal-actions").dialog("close");
	});

	$(".cancel-confirmation").click(function(){
		$("#modal-actions").dialog("close");
	});

	//=====VALIDATIONS=====//
	$("form").submit(function(){

		//modal.reset_data();
		
		var submit_status = false;
		var link = false;

		//if EMV user
		if($("#password").length > 0){
			if($("#password").val() == "" || password_changed){
				var validations = [
					[[$("#confirm-password"), "equal", $("#password").val()], "equality", "not_equal"],
					[[$("#password"), "max", 12], "char_length", "bigger"],
					[[$("#password"), "min", 8], "char_length", "smaller"],
					[$("#password"), "has_number", "no_numbers"],
					[$("#password"), "has_letter", "no_letters"],
					[$("#password"), "not_empty", "not_empty"]
				];

				var validator = new Validator();
				submit_status = validator.validate(validations, true, true);
			}else{
				link = true;
			}
		}
		//if password user
		else{
			if ( isEnrolled ){
				link = true;
			}
			else{
				submit_status = true;
			}
		}

		if(link){
			show_loading(false);
			window.location = $(".wizard-steps a:eq(1) .hidden-value.link").text();
		}else{
			if(submit_status && $("#terms-checkbox").length > 0){
				validations = [[$("#terms-checkbox"), "is_checked", "not_agreed_with_terms"]];
				var validator = new Validator();
				submit_status = validator.validate(validations, true, true);
			}
			
			console.log("submit_status="+submit_status);

			if(submit_status){
				action = 'enroll';
				authorization.call();
			}			
		}
		return false;

	});

	var authorization = {

		call: function(){

			show_loading(true);

			if(action == "enroll"){
				var EnrollMobile = "on";
			}else{
				var EnrollMobile = "";
			}

			if(password_changed){
				var ChangePassword = "on";
			}else{
				var ChangePassword = "";
			}

			if($("#password").length > 0){
				var password = $("#password").val();
			}else{
				var password = "";
			}

			$.post(
					entryPoint,
					{
						operation: operation, 
						conversationId: $("input[name=conversationId]").val(),
						nextPage: verify_page,
						EnrollMobile: EnrollMobile,
						AuthenticationMethod: AuthenticationMethod,
						ChangePassword: ChangePassword, 
						Password: password,
						ConfirmPassword: password,
						agreeWithChkBox: "on"
					},
					function(jsArray){
						authorization.result(jsArray);
					}, 
					"json"
			);
		},
	
		result: function(data){
			if(data.hasErrors){

				modal.hide_modal_messages();
				var errorsModalText = "<p>" + data.messages.replace(/\n/g, "</p><p>") + "</p>";
				$("#modal-actions .submit .message p").html(errorsModalText);
				modal.update_visibles('submit');
				$("#modal-actions").dialog("open");
			}else{
				modal.hide_modal_messages();
				if(data.needsAuthorization){
					if(data.isPasswordUser){
						modal.update_visibles('password');
					}else{
						modal.update_visibles('authorize');
						$("#modal-actions .authorize strong:eq(0)").text(data.amount);
						$("#modal-actions .authorize strong:eq(1)").text(data.account);
					}
				}else{
					if(action == "enroll"){
						$("#modal-actions .enroll .message").addClass("success");
						modal.update_visibles('enroll');
					}else if(action == "disenroll"){
						$("#modal-actions .disenroll .message").addClass("success");
						modal.update_visibles('disenroll');
					}
				}
				$("#modal-actions").dialog("open");
			}

			remove_loading();
		}

	}

	var unblock = {

		call: function(){

			show_loading(true);

			$.post(
					unblock_entryPoint,
					{
						operation: unblock_operation, 
						conversationId: $("input[name=conversationId]").val(),
					},
					function(jsArray){
						unblock.result(jsArray);
					}, 
					"json"
			);
		},

		result: function(data){
			
			if(data.success){
				$("#modal-actions .unblock .success").removeClass("hidden");
				$("#modal-actions .unblock .message").addClass("success");
				$(".blocked").remove();
			}else{
				$("#modal-actions .unblock .fail").removeClass("hidden");
			}
			modal.hide_modal_messages();
			modal.update_visibles('unblock');
			$("#modal-actions").dialog("open");
			remove_loading();
		}
	}

	var submit = {

		call: function(){

			show_loading(true);

			$.post(
					submit_entryPoint,
					{
						operation: submit_operation, 
						conversationId: $("input[name=conversationId]").val(),
						nextPage: submit_page,
						MonetaryConfirmPassword: $("#modal-actions input:visible").val()
					},
					function(jsArray){
						submit.result(jsArray);
					}, 
					"json"
			);
		},

		result: function(data){
			if(data.hasErrors){
				$("#modal-actions").find("#authorization-password, #authorization-code").val("");
				if(!data.correctAuthorizationElement){
					if ($("#modal-actions").find(".validation-error").length > 0) { 
						$("#modal-actions").find(".validation-error").remove();
					}
					$("#modal-actions input:visible").parent().append("<div class='helper validation-error'>"+data.messages+"</div>");
				}else{
					modal.hide_modal_messages();
					var errorsModalText = "<p>" + data.messages.replace(/\n/g, "</p><p>") + "</p>";
					$("#modal-actions .submit .message p").html(errorsModalText);
					modal.update_visibles('submit');
					$("#modal-actions .submit .submit-confirmation").attr("href", $(".wizard-steps .step-1 .hidden-value.link").text());
				}
			}else{
				modal.hide_modal_messages();
				$("#modal-actions .submit .message p").text(data.messages);
				$("#modal-actions .submit .message").addClass("success");
				modal.update_visibles('submit');
				$("#modal-actions").parent().find(".ui-dialog-titlebar-close").css("display", "none");
				if ( action == 'enroll' ){
					$("#modal-actions .submit .submit-confirmation").attr("href", $(".wizard-steps .step-2 .hidden-value.link").text());
				}
				else{
					$("#modal-actions .submit .submit-confirmation").attr("href", $(".wizard-steps .step-1 .hidden-value.link").text());
				}
			}

			remove_loading();
		}

	}

	var modal = {

		update_visibles: function(status){
			//status
			$('#modal-actions .' +status).removeClass('hidden');
			//title
			$('#ui-dialog-title-modal-actions').text($('#modal-actions .'+status ).find('.hidden.title').text());
		},
	
		hide_modal_messages: function(){
			$("#modal-actions").children("div").addClass("hidden");
			modal.reset_data();
		},
		
		reset_data: function(){
			$('#modal-actions input').val('');
			$('#modal-actions .helper').remove();
		}
	}
});