$(document).ready(function(){
	
	$("#delete-message").click(function(){
		$("#modal-confirm").dialog("open");
	});

	$("#submit-confirmation").click(function(){
		$("form").submit();
	});

	$("#cancel-confirmation").click(function(){
		$("#modal-confirm").dialog("close");
	});

});