<%@ page language="java" contentType="text/javascript; charset=UTF-8"%>
<%@page import="ebanking.framework.params.WebParams"%>
<%@page import="ebanking.servlets.AJAXServlet"%>
function changePage(pageNumber, listId, secondaryListPaging)
{
	if (listId == undefined || listId == ""){
		listId = 'TheTxnsList';	//The id of the div that contains the list to be paginated
	}
	if (secondaryListPaging == undefined){
		secondaryListPaging = "";	//This parameters states if the list to be paginated is a secondary list (useful when there are multiple lists to be paginated in the same page).
	}

	show_loading(true);
	
	jQuery.ajax({
        url: '<%=AJAXServlet.EntryPoint%>',
        type: 'POST',
        data: {
			<%=WebParams.ajaxServletMethod.id()%>: '<%=AJAXServlet.Operations.handlePaging%>',
			goToPage : pageNumber,
			secondaryListPaging : secondaryListPaging,
			conversationId : $('input[name=conversationId]').val()
		},
		dataType: 'html',
        async: false,
        cache: false,
        timeout: 30000,
        error: function(){
			remove_loading();
			//auto_size_height($("#main").height(), $("#side").height(), 0, 1);
		},
        success: function(data){
	        jQuery('#'+ listId).html(data);
	        mainHeightFix();
	        remove_loading();
	        //auto_size_height($("#main").height(), $("#side").height(), 0, 1);
		}
    });
}
