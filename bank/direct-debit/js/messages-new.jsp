<%@page import="ebanking.framework.params.WebParams"%>
<%@page import="ebanking.servlets.AJAXServlet"%>


<script type="text/javascript" language="javascript">

$(document).ready(function(){
	
	//=====RESTORE STATE=====//
	// setTimeout("restore_state('#subject|input|asdfa~#message|input|sdf')", 1000);
//	if($("span.restoredState").text() != ""){
//		show_loading();
//		setTimeout('restore_state($("span.restoredState").text())', 1000);
//	}

	//=====VALIDATIONS=====//
	$("form").submit(function(){
		var validations = [
			[$("#subject"), "not_empty", "not_empty"],
			[$("#message"), "not_empty", "not_empty"],
			[[$("#message"), "max", 1500], "char_length", "over_1500"]
		];

		var validator = new Validator();
		var submit_status = validator.validate(validations, true, true);
		
		console.log("submit_status="+submit_status);

		if($("span.validation-error").length != 0)
			submit_status = false;

		if(submit_status == true){
//			save_state();
//			//fill in the hidden fields
//			create_hidden_fields();
//			show_loading();
			$("#modal-confirm").dialog("open");
		}

		return false;
		//return submit_status;
	});
	
//GIV:20120111:Usability:SecureEmail:START:
	//====CONFIRMATION BUTTON=====//
	$("#submit-confirmation").click(function(){
		$("#modal-confirm").dialog("close");
		var Subject = $("#subject").val();
		var Body = $("#message").val();
		show_loading(true);
		
		$.post(
				'<%=AJAXServlet.EntryPoint%>/<%=AJAXServlet.Operations.sendSecureMail.id()%>',<%--This type of call invokes the ajax validator filter--%>
				{
					<%=WebParams.conversationId.id()%>:		$('input[name=conversationId]').val(),
					<%=WebParams.subject.id()%>:			Subject,
					<%=WebParams.messageBody.id()%>:		Body
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
//GIV:20120111:Usability:SecureEmail:END

	//=====CREATE AND FILL HIDDEN FIELDS=====//
//	function create_hidden_fields(){
//		//find values
//		var Subject = $("#subject").val();
//		var Body = $("#message").val();
//		// fill in hidden fields
//		$("input[name=Subject]").val(Subject);
//		$("input[name=Body]").val(Body);
//	}

});
</script>