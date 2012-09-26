var authorization = {};
var submit_wrapper = {};
var modal = {};
var submit_data = {};
var max_amount = '';

function general_fill_hidden_fields(){
	
	var UseFromMobile = '';
	var UseMaxLimit = '';
	var MobileLimit = '';
	
	if( $(".available-for-mobile-step").is(":visible") && $("#available-for-mobile li.selected").hasClass("available") ){
		UseFromMobile = 'on';
		if ( $("#apply-maximum-limit").is(":checked") ){
			UseMaxLimit = 'on';
		}
		MobileLimit = $("#amount-textfield").val();
	}

	submit_data.useFromMobile = UseFromMobile;
	submit_data.MobileLimit = MobileLimit;
	submit_data.useMaxMobileLimit = UseMaxLimit;
}

function general_fill_form(){
	$("#template-name").val($("input[name=transactionTemplateName]").val());

	var ShowMobileStep = $("input[name=ShowMobileStep]").val();
	var useFromMobile = $("input[name=useFromMobile]").val();
	
	if ( ShowMobileStep == 'true' ){
		max_amount = amount_to_number($(".max-amount").text());
	}
	
	if(ShowMobileStep == "true" && useFromMobile == "on"){
		$("#available-for-mobile li.available").click();
		
		var useMaxMobileLimit = $("input[name=useMaxMobileLimit]").val();
		if(useMaxMobileLimit == "on"){
			$("#amount-textfield").val($(".max-amount").text());
			$("#apply-maximum-limit").attr('checked','checked');
		}else{
			$("#amount-textfield").val($("input[name=MobileLimit]").val());
		}
	}
}

$(document).ready(function(){

	//=====ON LOAD=====//
	max_amount = amount_to_number($(".max-amount").text());

	//=====EVENTS=====//
	
	//reset
	$("#main .form-header .reset").click(function(){
		$("#available-for-mobile li.not-available").click();
		//uncheck
//		$("#amount-textfield").removeAttr("disabled").removeClass("disabled");
//		$("#apply-maximum-limit").removeAttr("checked").removeAttr("disabled");
	});

	//on click, apply limit, remove errors
	$("#apply-maximum-limit").live("click", function(){
		if($(this).is(":checked")){
			$("#amount-textfield").val($(".max-amount").text());
			$("#amount-textfield").parent().find(".validation-error").remove();			
		}
	});

	//cant be over max amount
	$(document).on("keyup", "#amount-textfield", function(event){
		//if he changed the value from max amount limit, remove checkbox
		var limit = amount_to_number($(".max-amount").text());
		if(amount_to_number($(this).val()) != limit){
			$("#apply-maximum-limit").removeAttr("checked");
		}		
	});

	$("#amount-textfield").live("blur", function(){
		//validate amount
		var validations = [
			[$("#amount-textfield"), "not_zero", "amount_zero"],
			[[$("#amount-textfield"), "max", max_amount], "compare_numbers", "amount_over_limit"]
		];
		var validator = new Validator();
		var status = validator.validate(validations, false, true);
		//add/remove class active
		if(status){
			$(this).next().find(".validation-error").remove();
		}
	});

	//available for mobile
	$("#available-for-mobile li").live("click", function(){
		if($(this).hasClass("not-available")){
			$("#amount-textfield, #apply-maximum-limit").addClass("disabled").attr("disabled", "disabled").removeAttr("checked").val("");
			$(this).parent().parent().parent().parent().find(".validation-error").remove();
		}else{
			$("#amount-textfield, #apply-maximum-limit").removeClass("disabled").removeAttr("disabled");			
		}
	});

	if($("span.restoredState").text() != ""){
		restore_state($("span.restoredState").text());
	}
	
	
	authorization = {

		call: function(){

			show_loading(true);
			
			ajax_verify();
		},
	
		result: function(data){
			if(data.hasErrors){

				modal.hide_modal_messages();
				var errorsModalText = "<p>" + data.messages.replace(/\n/g, "</p><p>") + "</p>";
				$("#modal-actions .confirmErr .message").html(errorsModalText);
				modal.update_visibles('confirmErr');
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
					modal.update_visibles('create');
				}
				$("#modal-actions").dialog("open");
			}

			remove_loading();
		}

	}
		
		
	submit_wrapper = {

		call: function(){

			show_loading(true);

			ajax_result();
		},

		result: function(data){
			if(data.hasErrors){
				if(!data.correctAuthorizationElement){
					$("#modal-actions input:visible").parent().append("<div class='helper validation-error'>"+data.messages+"</div>");
				}else{
					modal.hide_modal_messages();
					var errorsModalText = "<p>" + data.messages.replace(/\n/g, "</p><p>") + "</p>";
					$("#modal-actions .submit-error .message p").html(errorsModalText);
					modal.update_visibles('submit-error');
				}
				$("#modal-actions input").val("");
			}else{
				modal.hide_modal_messages();
				$("#modal-actions .submit-success .message p").text(data.messages);
				modal.update_visibles('submit-success');
				$("#modal-actions").parent().find(".ui-dialog-titlebar-close").css("display", "none");
				$("#modal-actions .submit-success .submit-confirmation").attr("href", manage_templates_url);
			}

			remove_loading();
		}

	}
	
	modal = {

		update_visibles: function(status){
			//status
			$("#modal-actions ."+status).removeClass("hidden");
			//title
			$("#ui-dialog-title-modal-actions").text($("#modal-actions ."+status).find(".hidden.title").text());
			modal.reset_data();
		},

		hide_modal_messages: function(){
			$("#modal-actions").children("div").addClass("hidden");
			modal.reset_data();
		},

		reset_data: function(){
			$("#modal-actions input").val("");
			$("#modal-actions .helper").remove();
		}
	}
	
	$("#modal-actions .confirmErr .submit-confirmation, #modal-actions .submit-error .submit-confirmation").click(function(){
		$("#modal-actions").dialog("close");
	});
	
	$("#modal-actions .create .cancel-confirmation, #modal-actions .delete .cancel-confirmation, #modal-actions .password .cancel-confirmation, #modal-actions .authorize .cancel-confirmation").click(function(){
		$("#modal-actions").dialog("close");
	});
	
	$("#modal-actions .password .submit-confirmation, #modal-actions .authorize .submit-confirmation").click(function(){
		var authElementInput = $("#modal-actions input:visible").val();
		
		if(authElementInput != "" && $("#modal-actions").find(".validation-error").length == 0) {
			submit_data.MonetaryConfirmPassword = authElementInput;
			submit_wrapper.call();
		}else if(authElementInput == "") {
			var validator = new Validator();
			validator.displayError($("#modal-actions input:visible"), "not_empty", "not_empty");
		}
	});
	
	$("#modal-actions .create .submit-confirmation").click(function(){
		submit_wrapper.call();
	});
	
	$("#modal-actions .delete .submit-confirmation").click(function(){
		populate_submit_data_for_result();
		submit_wrapper.call();
	});
	
	$("#modal-actions .submit-success .submit-confirmation").click(function(){
		$("#modal-actions").dialog("close");
		show_loading(false);
	});	

});