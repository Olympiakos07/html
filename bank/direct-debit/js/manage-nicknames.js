$(document).ready(function() {

	//=====EVENTS=====//


	//=====FORM SUBMIT=====//
	$("form").submit(function() {

		$("#modal-confirm").dialog("open");

		return false;
	});

	//====CONFIRMATION BUTTONS=====//
	$("#submit-confirmation").click(function(){
		$("#modal-confirm").dialog("close");
		show_loading(true);
		
		var entrypoint = $('#js-value-entrypoint').text();
		
		var jsdata = {};
		jsdata.operation = $('#js-value-operation').text();
		jsdata.actionFlag = $('#js-value-actionSave').text();
		jsdata.conversationId = $('input[name="conversationId"]').val();
		
		var i = 1;
		$("#accounts-list li").each(function(){
			var j = i - 1;
			jsdata['accountNumber'+i] = $("#accounts-list li:eq(" + j + ") .number").text();
			jsdata['nickname'+i] = $.trim( find_selected_account_nickname("#accounts-list", j) );
			i++;
		});

		$.post(
				entrypoint,
				jsdata,
				function(jsArray){
					remove_loading();
					if(jsArray.status == "1"){
						$("#modal-success").dialog("open");
						$("#modal-success").parent().find(".ui-dialog-titlebar-close").css("display", "none");
					}else{
						$("#errors-modal p").remove();
						var errorsText = "<p>" + jsArray.errorMsg.replace(/\n/g,"</p><p>") + "</p>";
						$("#errors-modal").append($(errorsText));
						$("#errors-modal").dialog("open");
					}
				},
				"json"
		);
	});

	$("#cancel-confirmation").click(function(){
		$("#modal-confirm").dialog("close");
	});
	
	$("#return").click(function(){
		$("#modal-success").dialog("close");
		show_loading(false);
		return true;
	});

});