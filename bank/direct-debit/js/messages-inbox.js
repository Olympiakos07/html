$(document).ready(function(){
	
	//=====ON LOAD=====//
	$("#start-date").val(one_month_back_date);
	$("#end-date").val(today_date)

	//=====EVENTS=====//
	//show/hide filters
	$("#filters-trigger").click(function(){
		if($(this).hasClass("open")){
			$(".form").removeClass("open").slideUp();
			$(this).removeClass("open");
			$(this).text('Show filters');
		}else{
			$(".form").addClass("open").slideDown();
			$(this).addClass("open");
			$(this).text('Hide filters');
		}
	});

	$("input:checkbox").click(function(){
		var found = false;
		$("input:checkbox").each(function(index){
			if($(this).attr("checked")){
				found = true;
			}
		});
		if(found){
			$('#delete-messages').removeAttr("disabled");
		}else{
			$('#delete-messages').attr("disabled", true);
		}
	});

	$('#messages thead input[type="checkbox"]').click(function(){
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

	$("#delete-messages, .delete").click(function(){
		$("#modal-confirm p.titles").empty();
		if($(this).hasClass("delete")){
			var title = $(this).parent().parent().find(".title").text();
			$("#modal-confirm p.titles").append("<strong>&nbsp;&nbsp;"+title+"</strong><br />");
		}else{
			$("input:not(.all):checkbox").each(function(){
				if($(this).is(':checked')){
					var title = $(this).parent().parent().find(".title").text();
					$("#modal-confirm p.titles").append("<strong>&nbsp;&nbsp;"+title+"</strong><br />");
				}
			});
		}
		$("#modal-confirm").dialog("open");
	});

	$("#cancel-confirmation").click(function(){
		$("#modal-confirm").dialog("close");
	});

	//=====RESTORE STATE=====//
	// setTimeout("restore_state('#start-date|input|08/12/2011~#end-date|input|23/12/2011~#select-read-status|dsq-dialog|1')", 1000);
	if($("span.restoredState").text() != ""){
		show_loading();
		setTimeout('restore_state($("span.restoredState").text())', 1000);
	}

	//=====FORM SUBMIT=====//
	$("form").submit(function(){
		var validations = [
			[$("#start-date").val(), "not_empty", "not_empty"],
			[$("#end-date").val(), "not_empty", "not_empty"]
		];

		var submit_status = validator(validations, true);
		
		console.log("submit_status="+submit_status);

		if($("span.validation-error").length != 0){
			submit_status = false;
		}

		if(submit_status == true){
			save_state();
			//fill in the hidden fields
			create_hidden_fields();
			show_loading();
		}

		return submit_status;
	});

	//=====CREATE AND FILL HIDDEN FIELDS=====//
	function create_hidden_fields(){
		//find values
		var FromDate = $("#start-date").val();
		var ToDate = $("#end-date").val();
		var ReadStatus = $("#select-read-status li.selected .hidden-value").text();
		// fill in hidden fields
		$("input[name=FromDate]").val(FromDate);
		$("input[name=ToDate]").val(ToDate);
		$("input[name=ReadStatus]").val(ReadStatus);
	}

});