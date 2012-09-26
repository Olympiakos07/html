<%@page import="ebanking.framework.params.WebParams"%>
<%@page import="ebanking.servlets.AJAXServlet"%>


<script type="text/javascript" language="javascript">

$(document).ready(function(){
	
	$("#delete-message").click(function(){
		$("#modal-confirm").dialog("open");
	});

	$("#submit-confirmation").click(function(){
		//$("form").submit();
		deleteSelectedSecureMails();
	});

	$("#cancel-confirmation").click(function(){
		$("#modal-confirm").dialog("close");
	});

});

function deleteSelectedSecureMails()
{
	$("#modal-confirm").dialog("close");
	show_loading(true);
		
	$.post(
			'<%=AJAXServlet.EntryPoint%>',
			{
				<%=WebParams.ajaxServletMethod.id()%>:	'<%=AJAXServlet.Operations.deleteSelectedSecureMail%>',
				<%=WebParams.conversationId.id()%>:		$('input[name=conversationId]').val(),
				<%=WebParams.selectedSTP.id()%>:		$("input[name=MailSTP]").val()
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
}

</script>