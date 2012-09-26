<%@page import="ebanking.framework.params.WebParams"%>
<%@page import="ebanking.servlets.AJAXServlet"%>
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

		var validator = new Validator();
		var submit_status = validator.validate(validations, true, true);

		console.log("submit_status="+submit_status);

		if($("span.validation-error").length != 0)
			submit_status = false;

		if(submit_status == true){
			$("#modal-confirm p:first strong:eq(1)").text($("#new-username").val());
			$("#modal-confirm").dialog("open");
		}

		return false;
	});
	
	//====CONFIRMATION BUTTON=====//
	$("#submit-confirmation").click(function(){
		$("#modal-confirm").dialog("close");
		var username = $("#new-username").val();
		show_loading(true);
		
		$.post(
				'<%=AJAXServlet.EntryPoint%>/<%=AJAXServlet.Operations.runModifyRetailUsernameCommand.id()%>',<%--This type of call invokes the ajax validator filter--%>
				{
					<%--<%=WebParams.ajaxServletMethod.id()%>:	'<%=AJAXServlet.Operations.runModifyRetailUsernameCommand.id()%>',--%>
					<%=WebParams.conversationId.id()%>:		$('input[name=conversationId]').val(),
					<%=WebParams.username.id()%>:			username
				},
				function(jsArray){
					remove_loading();
					if(jsArray.status == "1"){
						$("#modal-success p").text(jsArray.message);
						$("#modal-success").dialog("open");
						$("#modal-success").parent().find(".ui-dialog-titlebar-close").css("display", "none");
					}else{
						$("#errors-modal p").text(jsArray.message);
						$("#errors-modal").dialog("open");
					}
				}, 
				"json"
		);
	});
	
	//====CANCEL BUTTON=====//
	$("#cancel-confirmation").click(function(){
		$("#modal-confirm").dialog("close");
	});

});