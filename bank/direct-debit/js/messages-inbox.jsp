<%@page import="ebanking.framework.params.WebParams"%>
<%@page import="ebanking.servlets.AJAXServlet"%>


<script type="text/javascript" language="javascript">

$(document).ready(function(){

	$("#submit-confirmation").click(function(){
		deleteSelectedSecureMails();
	});
	
	//=====ON LOAD=====//
	$("#start-date").val(one_month_back_date);
	$("#end-date").val(today_date)

	//=====EVENTS=====//
	//show/hide filters
	$("#filters-trigger").click(function(){
		if($(this).hasClass("open")){
			$(".form").slideUp().removeClass("open");
			$(this).removeClass("open");
			$(this).text('Show filters');
		}else{
			$(".form").slideDown().addClass("open");
			$(this).addClass("open");
			$(this).text('Hide filters');
		}
	});

	$("input:checkbox").live("click", function(event){//click(function(){
		var found = false;
		$("input:checkbox").each(function(index){
			if($(this).attr("checked")){
				found = true;
			}
		});
		if(found){
			$('#delete-messages').removeAttr('disabled');
		}else{
			$('#delete-messages').attr("disabled", true);
		}
	});

	$('#messages thead input[type="checkbox"]').live("click", function(event){//click(function(){
		if($(this).attr("checked")){
			$("input:checkbox").each(function(){
				$(this).attr("checked", true);
			});
		}else{
			$("input:checkbox").each(function(){
				$(this).removeAttr("checked");
			});
			$('#delete-messages').attr("disabled", true);
		}
	});

	$("#delete-messages, .delete").live("click", function(event){//click(function(){
		var selectedForDeletion="";
		$("#modal-confirm p.titles").empty();
		if($(this).hasClass("delete")){
			selectedForDeletion += $(this).parent().parent().find(".deletionSTP").val();
			//console.log(selectedForDeletion);
			var title = $(this).parent().parent().find(".title").text();
			$("#modal-confirm p.titles").append("<strong>&nbsp;&nbsp;"+title+"</strong><br />");
		}else{
			$("input:not(.all):checkbox").each(function(){
				if($(this).is(':checked')){
					selectedForDeletion += $(this).val()+'A';
					var title = $(this).parent().parent().find(".title").text();
					$("#modal-confirm p.titles").append("<strong>&nbsp;&nbsp;"+title+"</strong><br />");
				}
			});
		}
		$("#modal-confirm").dialog("open");
		$("input[name=selectedSTP]").val(selectedForDeletion);//get all selected for deletion
	});

	$("#cancel-confirmation").click(function(){
		$("#modal-confirm").dialog("close");
	});

	//=====RESTORE STATE=====//
	// setTimeout("restore_state('#start-date|input|08/12/2011~#end-date|input|23/12/2011~#select-read-status|dsq-dialog|1')", 1000);
	if($("span.restoredState").text() != ""){
		setTimeout('restore_state($("span.restoredState").text())', 1000);
	}

	//=====FORM SUBMIT=====//
	$("form").submit(function(){
		var validations = [
			[$("#start-date"), "not_empty", "not_empty"],
			[$("#end-date"), "not_empty", "not_empty"]
		];

		var validator = new Validator();
		var submit_status = validator.validate(validations, true, true);
		
		console.log("submit_status="+submit_status);

		if($("span.validation-error").length != 0)
			submit_status = false;

		if(submit_status == true){
			save_state();
			//fill in the hidden fields
			create_hidden_fields();
			show_loading(false);
		}

		return submit_status;
	});

	//=====CREATE AND FILL HIDDEN FIELDS=====//
	function create_hidden_fields(){
		//find values
		var FromDate = $("#start-date").val();
		var ToDate = $("#end-date").val();
		var ReadStatus = $("#select-read-status li.selected .hidden-value").text();
		var priority = $("#select-read-priority li.selected .hidden-value").text();
		
		// fill in hidden fields
		$("input[name=FromDate]").val(FromDate);
		$("input[name=ToDate]").val(ToDate);
		$("input[name=ReadStatus]").val(ReadStatus);
		$("input[name=Priority]").val(priority);
	}

});

function viewSecureMail(stp,np)
{
	$("input[name=MailSTP]").val(stp);
	$("input[name=nextPage]").val(np);
	
	$("form").submit();
}

function deleteSelectedSecureMails()
{
	$("#modal-confirm").dialog("close");
	show_loading(true);
		
	$.post(
			'<%=AJAXServlet.EntryPoint%>',
			{
				<%=WebParams.ajaxServletMethod.id()%>:	'<%=AJAXServlet.Operations.deleteSelectedSecureMail%>',
				<%=WebParams.conversationId.id()%>:		$('input[name=conversationId]').val(),
				<%=WebParams.selectedSTP.id()%>:		$("input[name=selectedSTP]").val()
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