
$(document).ready(function() {

	//=====ON LOAD=====//
	$("#start-date").val("01/01/" + today.getFullYear());
	$("#end-date").val(today_date);
	$("#button-last_statement").attr("id", "button-error");

	//=====EVENTS=====//
	$("#from-account-list li").click(function(){
		$("#button-error").attr("id", "button-last_statement");
		remove_statements();
	});

	$("#button-error").click(function(){
		var validations = [
			[$("#from-account-list"), "has_selected", "not_selected"]
		];

		var validator = new Validator();
		var submit_status = validator.validate(validations, false, true);
	});
	
	$("a.ui-state-default").live("click", function(){
		remove_statements();
		setTimeout(function(){mainHeightFix()}, 500);
	});

	$("#show-statements").click(function(){

		var validations = [
			[$("#from-account-list"), "has_selected", "not_selected"]
		];

		var validator = new Validator();
		var submit_status = validator.validate(validations, false, true);
//		if($("#start-date").val() == '' && $("#end-date").val() == ''){
//			submit_status = false;
//			var validator = new Validator();
//			validator.displayError($("#end-date"), "not_empty", "not_empty");
//		}

		if (submit_status){
			show_loading(true);		
			var from_account = find_selected_account_number("#from-account-list", "-1");
			var start_date = $("#start-date").val().replace(/\//g, "");
			var end_date = $("#end-date").val().replace(/\//g, "");
			$.post(
					'AJAXServlet',
					{
						operation: 			'getStatementList',
						conversationId: 	jQuery('input[name=conversationId]').val(),
						FromAccount: 		from_account,
						FromDate: 			start_date,
						ToDate: 			end_date
					
					/*	
						operation:operation, 
						conversationId:conversationId, 
						FromAccount:from_account, 
						FromDate:start_date, 
						ToDate:end_date 
					*/
					},
					function(jsArray){
						show_statements(jsArray);
						remove_loading();
						
					}, 
					"json"
			);
		}
	});

	function remove_statements(){
		$("#statements-select tbody").empty();
		$("#statements-select").css("display", "none");
		$('.download').attr('disabled', 'disabled');
//		auto_size_height($("#main").height(), $("#side").height(), 0, 0);
	}
	
	function show_statements(jsArray){
		if(jsArray.errorMessage == ""){
			//save data
			var label = jsArray.label;
			var statements = jsArray.statements;
			//empty list
			$("#statements-select tbody").empty();
			//refill it
			for(i=0; i < statements.length ; i++){
				var statement = statements[i];
				var markup = '<tr><td><input type="checkbox" /></td><th>'+label+' <span class="date">'+statement+'</span></th><td>&nbsp;</td></tr>';
				$("#statements-select tbody").append(markup);
			}
			//if we have statements, show the results
			if(statements.length > 0){
				//$(".modified-height").css("height", "35");
				resetMainHeight();
				$("#statements-select").slideDown();
				setTimeout(function(){mainHeightFix()}, 500);
			//if not show errors modal
			} else {
				data = {
					"location": 	"",
					"title": 		error_messages["title"],
					"message": 		error_messages["message"]
				};
				download_statements(data);
			}
		}else{
			$("#modal-0 p").text(jsArray.errorMessage);
			$("#modal-0").dialog("open");
		}
	}
	
	/* old method delete it
	function show_statements(jsArray){
		//save data
		var label = jsArray.label;
		var statements = jsArray.statements;
		
		//empty list
		$("#statements-select tbody").empty();
		//if(statements!=undefined){
			//refill it
			for(i=0; i < statements.length; i++){
				var statement = statements[i];
				var markup = '<tr><td><input type="checkbox" /></td><th>'+label+' <span class="date">'+statement+'</span></th><td></td></tr>';
				$("#statements-select tbody").append(markup);
			}
		//}
	}*/

	$("form").submit(function(){
		return false;
	});

	//checkbox functionality
	$(".transactions input:checkbox:not(.multi-checkbox)").live("click", function(){
		if(!$(this).is(":checked")){
			$(".multi-checkbox").removeAttr("checked");
		}
		downloadAvailability();
	});
	
	// Add check to all if thead checkbox checked
	$('.transactions thead input[type="checkbox"]').click(function(){

		if($(this).is(":checked")){
			$("table input:checkbox").each(function(){
				$(this).attr("checked", "checked");
			});

		}else{
			$("table input:checkbox").each(function(){
				$(this).removeAttr("checked");
			});
		}
		downloadAvailability();
	});
	
	function downloadAvailability() {
		var checked_found = 0;
		$(".transactions input:checkbox").not(".transactions thead input:checkbox").each(function(){
			if($(this).is(":checked")){
				checked_found++;
			}
		});
		//
		if(checked_found == 0) {
		
			$('.download').attr('disabled', 'disabled');

		} else if (checked_found > 0) {
		
			$(".download").removeAttr('disabled');

		}
	}

	$(".download-statement").click(function(){
		/*
		//these are summy data and must be replaced with the real ajax request below
		var jsArray = {
				"location": "/download_file",
				"title": "",
				"message": ""
			}
		var jsArray = {
				"location": "",
				"title": "My title",
				"message": "my message"
			}

		download_statements(jsArray);
		*/

		var from_account = find_selected_account_number("#from-account-list", "-1");
		var type = find_account_type($("#from-account-list li.selected"));
		if($(this).hasClass("pdf")){
			var format = "pdf";
		}else if($(this).hasClass("excel")){
			var format = "xls";
		}else if($(this).hasClass("mt")){
			var format = "mt940";
		}
		var statements = [];
		if( !$(this).hasClass("dialog-close") ) {
			$("input[type=checkbox]:not(.multi-checkbox)").each(function(){
				if($(this).is(":checked")){
					statements.push($(this).parent().parent().find(".date").text().replace(/\//g, ""));
				}
			});
		}
		
		jQuery.ajaxSettings.traditional = true; 
		
		$.post(
				'AJAXServlet',
				{
					operation: 				'downloadStatement',
					conversationId: 		jQuery('input[name=conversationId]').val(),
					StartingStatementDate: 	statements, 
					FromAccount: 			from_account,
					FromAccountType: 		type,
					SelectedFormat: 		format
				/*
					operation:operation, 
					conversationId:conversationId, 
					'StartingStatementDate[]': statements, 
					FromAccount:from_account, 
					FromAccountType:type, 
					SelectedFormat: format
				*/
				},
				function(jsArray){
					download_statements(jsArray);
				}, 
				"json"
		);
	});

	function download_statements(jsArray){
		if(jsArray.location != ""){
			window.location = jsArray.location;
		}else{
			$("#errors-modal").remove();
			var markup = '<div id="errors-modal" class="dialog dialog-message hidden" title="'+jsArray.title+'"><p>'+jsArray.message+'</p></div>';
			$("body").append(markup);
			$("#errors-modal").dialog({
				modal: true,
				width: 560,
				dialogClass: "modal",
				autoOpen: true
			});
		}
	}

});
