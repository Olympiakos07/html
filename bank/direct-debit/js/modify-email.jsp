<%@page import="ebanking.framework.params.WebParams"%>
<%@page import="ebanking.servlets.AJAXServlet"%>
<%@page import="ebanking.util.AppConstants"%>
$(document).ready(function(){
	
	//=====ON LOAD=====//

	//=====FORM SUBMIT=====//
	$("form").submit(function() {
		console.log($(".current-email:first").text().trim());
		var validations = [
			[[$("#new-email"), "not_equal", $(".current-email:first").text().trim()], "equality", "same_emails"],
			[$("#new-email"), "is_email", "not_valid_email"],
			[$("#new-email"), "not_empty", "not_empty"]
		];

		var validator = new Validator();
		var submit_status = validator.validate(validations, true, true);

		console.log("submit_status="+submit_status);

		if($("span.validation-error").length != 0)
			submit_status = false;

		if(submit_status == true){
			$("#modal-confirm p:first strong:eq(1)").text($("#new-email").val());
			$("#modal-confirm").dialog("open");
		}

		return false;
	});

	//====CONFIRMATION BUTTONS=====//
	$("#submit-confirmation").click(function(){
		$("#modal-confirm").dialog("close");
		var email = $("#new-email").val();
		show_loading(true);
		
		$.post(
				'<%=AJAXServlet.EntryPoint%>/<%=AJAXServlet.Operations.runModifyEmailResultCommand.id()%>',
				{
				
					<%=WebParams.conversationId.id()%> : $('input[name=conversationId]').val(), 
					<%=WebParams.email.id()%>: email
				},
				function(jsArray){
						remove_loading();
					if(jsArray.status == "1"){
						$("#modal-success").dialog("open");
						$("#modal-success").parent().find(".ui-dialog-titlebar-close").css("display", "none");
					}else{
						$("#errors-modal .message p").remove();
						var errorsModelText = "<p>" + jsArray.message.replace(/\n/g,"</p><p>") + "</p>";
						$("#errors-modal .message").append($(errorsModelText));
						$("#errors-modal").dialog("open");
					}
				}, 
				"json"
		);

	});

	$("#cancel-confirmation").click(function(){
		$("#modal-confirm").dialog("close");
	});

});