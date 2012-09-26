$(document).ready(function(){

	//=====ON LOAD=====//
	$("#manage-templates-list li .iban").each(function(){
		$(this).text(split_iban($(this).text()));
	});
	
	//add overflow visible if we have only a few templates
	if($("#manage-templates-list li").length < 5){
		$("#manage-templates-list").css("overflow", "visible");
	}
	
	var requiresAuthorization = true;

	//=====EVENTS=====//

	//apply max limit for all templates button
	$("#apply-maximum-limit-for-all").click(function(){
		if($(this).is(":checked")){
			$("#manage-templates-list li").each(function(){
				var max_limit = $(this).find(".hidden-value.max-limit").text();
				$(this).find(".mobile-limit .value").text($(this).find(".hidden-value.max-limit").text());
			});
			$("#manage-templates-list .mobile-limit .apply-maximum-limit").attr("checked", "checked");
		}else{
			$("#manage-templates-list .mobile-limit .apply-maximum-limit").attr("checked", false);
		}
	});

	$("#enable-mobile-for-all").click(function(){
		console.log("ckecked");
		if($(this).hasClass("enabled")){
			$(this).removeClass("enabled");
			$("#manage-templates-list li").removeClass("available-for-mobile");
			$("#manage-templates-list li .mobile-limit").empty();
			//also hide all the templates if the show only enabled templates checkbox is checked
			if($("#filter-mobile-templates").is(":checked")){
				$("#manage-templates-list li").slideUp();
			}
		}else{
			$(this).addClass("enabled");
			//if not already enabled
			$("#manage-templates-list li").each(function(){
				if(!$(this).hasClass("available-for-mobile")){
					$(this).addClass("available-for-mobile");
					var max_limit = $(this).find(".hidden-value.max-limit").text();
					$(this).find(".mobile-limit").empty().append('<span class="value">'+max_limit+'</span><input type="checkbox" class="apply-maximum-limit" checked="checked">');
					$(this).addClass("enabled");
				}
			});
			//also hide all the templates if the show only enabled templates checkbox is checked
			if($("#filter-mobile-templates").is(":checked")){
				$("#manage-templates-list li").slideDown();
			}
		}
	});

	$(".apply-maximum-limit").live("click", function(){
		var max_limit = $(this).closest("li").find(".hidden-value.max-limit").text();
		$(this).parent().find(".value").text(max_limit);
	});

	$("#manage-templates-list .enable-mobile").click(function(){
		if($(this).parent().parent().hasClass("available-for-mobile")){
			$(this).parent().parent().removeClass("available-for-mobile");
			$(this).prev().empty();
			//if one is disabled, disable apply to all button too
			$("#enable-mobile-for-all").removeClass("enabled");
			//also hided if the filter only-mobile is checked
			if ( $("#filter-mobile-templates").is(":checked") ){
				$(this).closest("li").slideUp();
			}
		}else{
			$(this).parent().parent().addClass("available-for-mobile");
			var max_limit = $(this).closest("li").find(".hidden-value.max-limit").text();
			$(this).prev().append('<span class="value">'+max_limit+'</span><input type="checkbox" class="apply-maximum-limit" checked="checked">');
		}
	});
	
	$("#manage-templates-list .value").live("click", function(){
		//find if its one of the last 2 templates
		var templates_number = $("#manage-templates-list li:visible").length;
		var index = $(this).closest("li").index("#manage-templates-list li:visible");
		
		/*if(templates_number - index < 3){
			$("#permanent-tooltip").css("top", "-70px");
		}else{
			$("#permanent-tooltip").css("top", "40px");
		}*/

		var liHeight = $("#manage-templates-list li:first").outerHeight();
		var height;
		if (index >= templates_number - 2) {
			height = liHeight * (index - 2) + 100;
		} else {
			height = liHeight * (index + 1) + 100;
		}
		if (scroll.savedScroll[0]) {
			height = height -  scroll.savedScroll[0].scroll
		}
		/*if (height < 100 || templates_number - index < 3) {
			height = 100;
		}*/
		if (height > 360 - liHeight) {
			height = liHeight * (index - 2) + 100;
			if(scroll.savedScroll[0]) {
				height = height -  scroll.savedScroll[0].scroll
			}
		}
		$("#permanent-tooltip").css("top", height + "px");
		
		$(this).addClass("opened-tooltip");
		var position = $("#manage-templates-list .value").offset();
		$("#permanent-tooltip").css("left", "340px");
		if(!$("#permanent-tooltip").hasClass("open")){
			//$("#permanent-tooltip").insertAfter($(this).parent().parent());
			$("#permanent-tooltip").fadeIn();
			$("#permanent-tooltip input").val($(this).text());
		}
		//fix for IE 7 bug
		if( (templates_number - index < 3) && $.browser.msie && $.browser.version == "7.0"){
			$("#permanent-tooltip").parent().css("z-index", "99999");
		}
	});

	
	$("#permanent-tooltip input").keyup(function(){
		$(".opened-tooltip").text($(this).val());
		var max_limit = $(".opened-tooltip").closest("li").find(".hidden-value.max-limit").text();
		if(parseFloat(amount_to_number($(this).val())) == parseFloat(max_limit)){
			$(".opened-tooltip").next().attr("checked", "checked");
		}else{
			$(".opened-tooltip").next().removeAttr("checked");
		}
	});

	$("#permanent-tooltip .save").click(function(){

		var max_limit = $(".opened-tooltip").closest("li").find(".hidden-value.max-limit").text();

		var validations = [
			[$("#mobile-limit-input"), "valid_amount", "invalid_amount"],
			[$("#mobile-limit-input"), "not_zero", "amount_zero"],
			[[$("#mobile-limit-input"), "max", max_limit], "compare_numbers", "amount_over_limit"]
		];

		var validator = new Validator();
		var submit_status = validator.validate(validations, true, true);
		
		console.log("submit_status="+submit_status);

		if(submit_status){
			$("#permanent-tooltip").fadeOut();
			//format amount
			if($(".opened-tooltip").text() != ""){
				$(".opened-tooltip").text(format_amount($(".opened-tooltip").text()));
			}
			$("*").removeClass("opened-tooltip");
		}

	})

	//close tooltip when i press anything else on any li
	$("#manage-templates-list li *:not(.mobile-limit, .value, .actions)").click(function(){
		$("#permanent-tooltip").fadeOut();
		$("*").removeClass("opened-tooltip");
	});


	$("#filter-mobile-templates").click(function(){
		if($(this).is(":checked")){
			$("#manage-templates-list li:not(.available-for-mobile)").slideUp();
		}else{
			$("#manage-templates-list li").slideDown();
		}
	});


	//==========SUBMIT=====//

	//=====EVENTS=====//

	//submit (with authorization) submit button
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

	//submit (with password) submit button
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
	$("#modal-actions .confirm .submit-confirmation").click(function(){
		submit.call();
	});

	//general modal buttons

	$(".cancel-confirmation").click(function(){
		$("#modal-actions").dialog("close");
	});

	//=====VALIDATIONS=====//
	$("form").submit(function(){

		var displayPage = $("input[name=DisplayPage]").val();		//TRI:Issue fix SMOB_20120306_4:20120313
		
		if (displayPage == "true"){
			if($("span.validation-error").length == 0)
				authorization.call();
		}
		else{
			window.location = $(".wizard-steps .step-3 .hidden-value.link").text();
		}
		return false;
		
	});

	var authorization = {

		call: function(){

			show_loading(true);

			var data = {
				"operation": verify_operation,
				"action": verify_action,
				"actionFlag" : templates_action
			}

			var i = 1;
			$("#manage-templates-list li").each(function(){
				if($(this).hasClass("available-for-mobile")){
					var useFromMobile = "on";
				}else{
					var useFromMobile = "";				
				}
				if($(this).find(".apply-maximum-limit").is(":checked")){
					var useMaxLimit = "on";
				}else{
					var useMaxLimit = "";				
				}
				data["useFromMobile"+i] = useFromMobile;
				data["useMaxLimit"+i] = useMaxLimit;
				data["mobileLimit"+i] = $(this).find(".mobile-limit .value").text();
				data["templateTrans"+i] = $(this).find(".hidden-value.templateTrans").text();
				data["templateStp"+i] = $(this).find(".hidden-value.templateStp").text();
				i++;
			});

			$.post(
					verify_entryPoint,
					data,
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
				$("#modal-actions .submit .message").html(errorsModalText);
				modal.update_visibles("submit");
				$("#modal-actions").dialog("open");
			}else{
				modal.hide_modal_messages();
				if(data.needsAuthorization){
					requiresAuthorization = true;
					if(data.isPasswordUser){
						modal.update_visibles("password");
					}else{
						modal.update_visibles("authorize");
						$("#modal-actions .authorize strong:eq(0)").text(data.amount);
						$("#modal-actions .authorize strong:eq(1)").text(data.account);
					}
				}else{
					requiresAuthorization = false;
					modal.update_visibles("confirm");
				}
				$("#modal-actions").dialog("open");
			}

			remove_loading();
		}

	}

	var submit = {

		call: function(){

			show_loading(true);

			var data = {};
			data.operation = submit_operation;
			data.nextPage = submit_page;
			data.actionFlag = templates_action;
			if (requiresAuthorization){
				data.MonetaryConfirmPassword = $("#modal-actions input:visible").val();
			}
			
			var i = 1;
			$("#manage-templates-list li").each(function(){
				if($(this).hasClass("available-for-mobile")){
					var useFromMobile = "on";
				}else{
					var useFromMobile = "";				
				}
				if($(this).find(".apply-maximum-limit").is(":checked")){
					var useMaxLimit = "on";
				}else{
					var useMaxLimit = "";				
				}
				data["useFromMobile"+i] = useFromMobile;
				data["useMaxLimit"+i] = useMaxLimit;
				data["mobileLimit"+i] = $(this).find(".mobile-limit .value").text();
				data["templateTrans"+i] = $(this).find(".hidden-value.templateTrans").text();
				data["templateStp"+i] = $(this).find(".hidden-value.templateStp").text();
				i++;
			});

			$.post(
					submit_entryPoint,
					data,
					function(jsArray){
						submit.result(jsArray);
					}, 
					"json"
			);
		},

		result: function(data){
			if(data.hasErrors){
				if(!data.correctAuthorizationElement){
					modal.reset_data();
					$("#modal-actions input:visible").parent().append("<div class='helper error'>"+data.messages+"</div>");
				}else{
					modal.hide_modal_messages();
					var errorsModalText = "<p>" + data.messages.replace(/\n/g, "</p><p>") + "</p>";
					$("#modal-actions .submit .message").html(errorsModalText);
					modal.update_visibles("submit");
					$("#modal-actions .submit .submit-confirmation").attr("href", $(".wizard-steps .step-2 .hidden-value.link").text());
				}
			}else{
				modal.hide_modal_messages();
				$("#modal-actions .submit .message p").text(data.messages);
				$("#modal-actions .submit .message").addClass("success");
				modal.update_visibles("submit");
				$("#modal-actions").parent().find(".ui-dialog-titlebar-close").css("display", "none");
				$("#modal-actions .submit .submit-confirmation").attr("href", $(".wizard-steps .step-3 .hidden-value.link").text());
			}

			remove_loading();
		}

	}

	var modal = {

		update_visibles: function(status){
			//status
			$("#modal-actions ."+status).removeClass("hidden");
			//title
			$("#ui-dialog-title-modal-actions").text($("#modal-actions ."+status).find(".hidden.title").text());
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

	$("#modal-actions .submit .submit-confirmation").click(function(){
		if($(this).attr("href").substring(0, 4) == "http"){
			show_loading(false);
			window.location = $(this).attr("href");
		}else{
			$("#modal-actions").dialog("close");
		}
	});

});