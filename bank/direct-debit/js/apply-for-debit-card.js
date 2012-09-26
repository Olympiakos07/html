$(document).ready(function() {

	//=====VARIABLES=====//
	var entryPoint = $("#ajaxServletEntryPoint").val();
	var conversationId = $('input[name=conversationId]').val();
	//var account_list_height =  $("#from-account-list").parent().parent().attr("style").replace("height: ", "").replace(";", "");
	//console.log(account_list_height);

	//=====EVENTS=====//

	//reset
	$("#main .form-header .reset").click(function(){
		$("#nationality-list").slideUp();
		$("#step-2, #step-3, #step-4").css("display", "none");
		$("#terms-checkbox").attr("disabled", "disabled");
		$("#terms-checkbox").removeAttr("checked");
		$("#branch-list-container").slideUp();
		$("#select-nationality li.is-not-romanian").find(".hidden-value").text("");
		$("#from-account-list").addClass("huge").removeClass("medium");

	});

	//on from account list select, update debit card types
	$("#from-account-list li").live("click", function(){
		$(".validation-error").remove();
		$("#from-account-list").removeClass("huge").addClass("medium");
		
		//fix scroll due to from account list size change
		scroll.list(500);
		
		updateDebitCardProducts($(this).index());

		//auto_size_height($("#main").height(), $("#side").height(), 0, 0);
		$("#main .content").css("height", "auto");
	});

	//on debit card types click, show/hide step 3
	$("#debit-card-types-list li").live("click", function(){

		$(".validation-error").remove();

		$("#terms-checkbox").attr("disabled",false);
		getTermsLinks($(this).index());

		//auto_size_height($("#main").height(), $("#side").height(), 0, 0);
		$("#main .content").css("height", "auto");
	});

	//on nationality dropdown select, show/hide nationality list
	$("#select-nationality li").click(function(){
		if($(this).hasClass("is-not-romanian")){
			$("#nationality-list").slideDown();
		}else{
			$("#nationality-list").slideUp();
		}
	});
	
	//on nationality list select, save the hidden value to the select-nationality dropdown
	//because theres where we read this value
	$("#nationality-list li").click(function(){
		var value = $(this).find(".hidden-value").text();
		$("#select-nationality li.is-not-romanian").find(".hidden-value").text(value);
	});

	//on county select, update branches
	$("#county-list li").click(function(){
		if($(this).hasClass("filter") == false){
			getBranchesPerCounty($(this).index());
		}
	});
	
	function updateDebitCardProducts(index){

		show_loading(true);
		var operation = $("#getProductTypesForAccountUsability").val();
		var fromAccount = find_selected_account_number("#from-account-list" ,index);
		
		//this is dummy response and must be deleted in production and uncomment the following code block
		/*
		if(index == 1 || index == 3){
			var jsArray = {
				"data": 
					{"accountType": "credit-card", "accountCurrency": "RON", "productDescr": "American VISA", "cardType": "Supplementary", "productCode": "0111", "isSupplementary": true}
				, "data2": 
					{"accountType": "credit-card", "accountCurrency": "EUR", "productDescr": "Mastercard", "cardType": "Primary", "productCode": "0113", "isSupplementary": false}
			}
		}else{
			var jsArray = {
				"data": 
					{"accountType": "credit-card", "accountCurrency": "USD", "productDescr": "Mastercard", "cardType": "Supplementary", "productCode": "0111", "isSupplementary": true}
				, "data2": 
					{"accountType": "credit-card", "accountCurrency": "EUR", "productDescr": "VISA", "cardType": "Primary", "productCode": "0113", "isSupplementary": false}
				, "data3": 
					{"accountType": "credit-card", "accountCurrency": "EUR", "productDescr": "VISA Electron", "cardType": "Primary", "productCode": "0113", "isSupplementary": false}
			}	
		}

		displayDebitCardProducts(jsArray);
		*/
		$.post(
				entryPoint,
				{operation:operation, conversationId:conversationId, FromAccount:fromAccount},
				function(jsArray){
					displayDebitCardProducts(jsArray);
					remove_loading();
				}, 
				"json"

		);

	}

	//parses the ajax request and displays the data that contain the debit card types
	function displayDebitCardProducts(jsArray){
		$("#debit-card-types-list").empty();
		$.each(jsArray, function(cardIndex, data) { 
			var className = data.accountType + ' currency-' + data.accountCurrency;
			var prdDescr = data.productDescr;
			var prdCode = data.productCode;
			var cardType = data.cardType;
			var isSupplementary = data.isSupplementary;
			if(isSupplementary){
				var cardClasses = "supplementary total";
			}else{
				var cardClasses = "primary total";
			}
			var markup = "<li class='"+className+"' ><a href='javascript:void(0);'>"+prdDescr+"</a><span class='"+cardClasses+"'>"+cardType+"</span><span class ='hidden hidden-value'>"+prdCode+"</span></li>";
			$(markup).appendTo("#debit-card-types-list");
		});
		console.log("display debits");
		if($("span.restoredState").text() != ""){
			console.log("found restore");
			$("#step-2").css("display", "block");
			var value = ajax_states["debit-card-types-list"];
			$("#debit-card-types-list").children("li:eq("+value+")").addClass("selected");
			$("#debit-card-types-list").children("li:eq("+value+")").click();
			console.log("debit card value="+value);
		}else{
			$("#step-2").slideDown();			
		}
		mainHeightFix();
	}
	
	function getTermsLinks(index){
		
		var operation = $("#getDebitCardAdditionalFieldsUsability").val();
		var cardProductCode = $("#debit-card-types-list li:eq("+index+") span.hidden-value").text();
		var fromAccount = find_selected_account_number("#from-account-list", "-1");

		//this is dummy response and must be deleted in production and uncomment the following code block
		/*
		var jsArray = {
			"data": 
				{"pdfPath": "#", "pdfLabel": "Terms and Conditions"}
			, "data2": 
				{"pdfPath": "#", "pdfLabel": "Privacy Policy"}
		}
		$("#terms-dialog li:eq(1)").empty();
		$.each(jsArray, function(pdfIndex, data) { 
			var markup = "<p class='link' ><a href='"+data.pdfPath+"'>"+data.pdfLabel+"</a></p>";
			$(markup).appendTo("#terms-dialog li:eq(1)");
		});

		steps_management(index);


		*/
				show_loading(true);
				$.post(
				entryPoint,
				{
					operation:operation, 
					conversationId:conversationId, 
					FromAccount:fromAccount, 
					CardProductCode:cardProductCode
				},
				function(jsArray){					
					$("#terms-dialog li:eq(1)").empty();
					$.each(jsArray, function(linkIndex, data) { 
						if(data.linkType==1)//is a file
							var markup = "<p class='link' ><a target='_blank' href='"+data.link+"'>"+data.label+"</a></p>";
						else//is a http link
							var markup = "<p class='link external' ><a target='_blank' href='"+data.link+"'>"+data.label+"</a></p>";
						$(markup).appendTo("#terms-dialog li:eq(1)");
					});
					console.log(index);
					steps_management(index);
					remove_loading();
				}, 
				"json"

		);

		
	}
	
	
	function getBranchesPerCounty(index){
		
		var operation = $("#getBranchesPerCountyUsability").val();
		var countyCode = $("#county-list li:eq("+index+")").find(".hidden-value").text();
		
		//this is dummy response and must be deleted in production and uncomment the following code block
		/*
		if(countyCode == "0501"){
			var jsArray = {
				"data": 
					{"branchName": "AGENT.AIUD", "branchCode": "1232"}
				, "data2": 
					{"branchName": "AGENT.BLAJ", "branchCode": "7643"}
			}
		}else if(countyCode == "0502"){
			var jsArray = {
				"data": 
					{"branchName": "AGENT.ARAD", "branchCode": "1232"}
				, "data2": 
					{"branchName": "AGENT.CEBIS", "branchCode": "7643"}
			}
		}else if(countyCode == "0503"){
			var jsArray = {
				"data": 
					{"branchName": "AGENT.ARGES", "branchCode": "1232"}
				, "data2": 
					{"branchName": "AGENT.GAVANA", "branchCode": "7643"}
				, "data3": 
					{"branchName": "AGENT.BISOI", "branchCode": "7643"}
			}
		}else if(countyCode == "0504"){
			var jsArray = {
				"data": 
					{"branchName": "AGENT.DACIA", "branchCode": "1232"}
				, "data2": 
					{"branchName": "AGENT.SALONDA", "branchCode": "7643"}
			}
		}else if(countyCode == "0505"){
			var jsArray = {
				"data": 
					{"branchName": "AGENT.BRAILA", "branchCode": "1232"}
				, "data2": 
					{"branchName": "AGENT.VIDIN", "branchCode": "7643"}
			}
		}else if(countyCode == "0506"){
			var jsArray = {
				"data": 
					{"branchName": "AGENT.GILAU", "branchCode": "1232"}
			}
		}else if(countyCode == "0507"){
			var jsArray = {
				"data": 
					{"branchName": "AGENT.ERA", "branchCode": "1232"}
				, "data2": 
					{"branchName": "AGENT.HARLAU", "branchCode": "7643"}
			}
		}else if(countyCode == "0508"){
			var jsArray = {
				"data": 
					{"branchName": "AGENT.OLT", "branchCode": "1232"}
				, "data2": 
					{"branchName": "AGENT.SELECT", "branchCode": "7643"}
			}
		}else if(countyCode == "0509"){
			var jsArray = {
				"data": 
					{"branchName": "AGENT.BEGA", "branchCode": "1232"}
				, "data2": 
					{"branchName": "AGENT.DETA", "branchCode": "7643"}
			}
		}
		display_branches(jsArray);

		*/
		show_loading(true);
		console.log("op="+operation);
		$.post(
				entryPoint,
				{operation:operation, conversationId:conversationId, County:countyCode},
				function(jsArray){
					display_branches(jsArray);
					remove_loading();
				}, 
				"json"

		);
	}
	
	function display_branches(jsArray){
		$("#branch-list").empty();
		var filterChoicesText = jsArray[0].filterChoicesText;
		var clearFiltersText = jsArray[0].clearFiltersText;
		var markup = '<li class="filter non-selectable"><label>'+filterChoicesText+'</label><input type="text" class="input-filter field" tabindex="1" /><button type="button" class="clear-filter">'+clearFiltersText+'</button></li>';
		$(markup).appendTo("#branch-list");
		var i = 0;
		$.each(jsArray, function(branchIndex, data) { 
			if(i != 0){
				markup = '<li class="branch single-line"><a href="javascript:void(0);">'+data.branchName+'</a><span class="hidden hidden-value">'+data.branchCode+'</span></li>';
				$(markup).appendTo("#branch-list");
			}
			i++;
		});
		
		$("#branch-list-container").slideDown();
		
		if($("span.restoredState").text() != ""){
			var value = ajax_states["branch-list"];
			$("#branch-list").children("li:eq("+value+")").addClass("selected");
		}
	}
	
	function steps_management(index){
		console.log("steps_manage");
		$("#step-4").slideDown();
		if($("#debit-card-types-list li:eq("+index+")").find("span.total").hasClass("primary")) {
			$("#step-3").slideUp();
			$("#step-4 .no").text("3");
		} else { 
			$("#step-3").slideDown();
			$("#step-4 .no").text("4");
		}
	}

	restore_state("#national-id|input|3433434343344~#legal-card-id|input|DD~#legal-card-number|input|344334~#first-name|input|EFF~#last-name|input|WFWE~#phone-number|input|343434~#security-password|input|23~#name-on-the-card|input|WE~#from-account-list|list|1~#debit-card-types-list|list|0~#nationality-list|list|1~#county-list|list|2~#branch-list|list|2~#select-nationality|dsq-dialog|1~#select-residency|dsq-dialog|0~#select-marital-status|dsq-dialog|1~#nationality-list|visibility|block~#from-account-list|trigger|click~#debit-card-types-list|trigger|click~#county-list|trigger|click");
	/*if($("span.restoredState").text() != ""){
		setTimeout("restore_state($('span.restoredState').text())", 1000);
	}*/

	//=====FORM SUBMIT=====//
	$("form").submit(function() {
		var validations = [
			[$("#from-account-list"), "has_selected", "not_selected"],
			[$("#debit-card-types-list"), "has_selected", "not_selected"],
			[$("#security-password"), "not_empty", "not_empty_sec_info"],
			[$("#name-on-the-card"), "not_empty", "not_empty_card_name"],
			[$("#county-list"), "has_selected", "not_selected_county"],
			[$("#branch-list"), "has_selected", "not_selected_branch"],
			[$("#terms-checkbox"), "is_checked", "not_agreed_with_terms"]

		];

		if($("#select-nationality li.is-not-romanian").hasClass("selected")){
			var validation = [$("#nationality-list"), "has_selected", "not_selected"];
			validations.push(validation);
		}

		if($("#debit-card-types-list li.selected span.total").hasClass("supplementary")){
			var supplementary = true;
		}else{
			var supplementary = false;
		}
		if(supplementary){
			var validation = [[$("#national-id"), "exactly", 13], "char_length", "exactly_13"];
			var validation2 = [[$("#legal-card-id"), "exactly", 2], "char_length", "exactly_2"];
			var validation3 = [[$("#legal-card-number"), "exactly", 6], "char_length", "exactly_6"];
			var validation4 = [$("#first-name"), "not_empty", "not_empty_fname"];
			var validation5 = [$("#last-name"), "not_empty", "not_empty_lname"];
			var validation6 = [$("#select-marital-status"), "has_selected", "not_selected"];
			var validation7 = [$("#select-residency"), "has_selected", "not_selected"];

			validations.push(validation, validation2, validation3, validation4, validation5, validation6, validation7);			
		}

		var validator = new Validator();
		var submit_status = validator.validate(validations, true, true);
		
		console.log("submit_status="+submit_status);

		if($("span.validation-error").length != 0)
			submit_status = false;
		
		if(submit_status == true){
			show_loading(false);
			save_state();
			//fill in the hidden fields
			fill_hidden_fields();

		}

		return submit_status;
	});

	//=====CREATE AND FILL HIDDEN FIELDS=====//
	function fill_hidden_fields(){
		var fromAccount = find_selected_account_number("#from-account-list", "-1");
		$("input[name=FromAccount]").val(fromAccount);
		$("input[name=FirstName]").val($("#first-name").val());
		$("input[name=LastName]").val($("#last-name").val());
		$("input[name=PhoneNumber]").val($("#phone-number").val());
		$("input[name=EmbossingName]").val($("#name-on-the-card").val());
		$("input[name=MaritalStatus]").val($("#select-marital-status li.selected .hidden-value").text());
		$("input[name=LegalCardId]").val($("#legal-card-id").val());
		$("input[name=LegalCardNumber]").val($("#legal-card-number").val());
		$("input[name=Residency]").val($("#select-residency li.selected .hidden-value").text());
		$("input[name=SecurityInformation]").val($("#security-password").val());
		$("input[name=County]").val($("#county-list li.selected .hidden-value").text());
		$("input[name=Branch]").val($("#branch-list li.selected .hidden-value").text());
		$("input[name=ConditionsAgreement]").val("true");
		if($("#nationality-list").is(":visible")){
			$("input[name=Nationality]").val($("#nationality-list li.selected .hidden-value").text());
		}else{
			$("input[name=Nationality]").val($("#select-nationality li.selected .hidden-value").text());
		}
		$("input[name=CardProductCode]").val($("#debit-card-types-list li.selected span.hidden-value").text());
		$("input[name=CardProductDescription]").val($("#debit-card-types-list li.selected a").text());

		$("input[name=Cnp]").val($("#national-id").val());
		
		if ($("#debit-card-types-list li.selected").find("span.total").hasClass("primary")) {
			$("input[name=isSupplementary]").val("false");
			$("input[name=cardType]").val('P');
		}else{
			$("input[name=isSupplementary]").val("true");
			$("input[name=cardType]").val('A');
		}
		
		
		$("input[name=cancelOperation]").val("");
		$("input[name=FromAccountFromCurrentSavings]").val("");
		$("input[name=autoDisplayActiveTransactions]").val("");
	}
});
