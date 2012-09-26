$(document).ready(function(){
	
	//=====ON LOAD=====//
	var selected_offer = 0;
	$("#products-list li").css("display", "none").removeClass("selected");
	$("#products-list li.offer-"+selected_offer).css("display", "block");

	//=====EVENTS=====//
	//on offers click, display the corresponding products
	$("#offers-list li").click(function(event){
		if(!$(this).hasClass("selected") || event.inputMethod == "keyboard"){
			var index = $(this).index();
			$("#products-list li").slideUp().removeClass("selected");
			$("#products-list li.offer-"+index).slideDown();
		}
		$("#step-5").slideUp().removeClass("open");
	});

	$("#products-list li").click(function(){
		//close 2nd beneficiary, if empty
		if($("#secondary-beneficiary-2").val() == ""){
			$("#secondary-beneficiary-2").addClass("disabled").attr("disabled", "disabled");
		}
		//check if product allows the change of the service charge date
		if($(this).find(".service-charge-date").text() == 1){
			$("#step-5").slideDown().addClass("open");
		}else{
			$("#step-5").slideUp().removeClass("open");
		}

		//these are summy data and must be replaced with the real ajax request below
		var jsArray = {
			"infoFilePath1": "fire",
			"infoFilePath2": "fsdfsire",
			"infoFileDesc1": "firesadfs",
			"infoFileDesc2": "firedesc2",
			"isLink1": "1",
			"isLink2": "1"
		}

		show_terms_links(jsArray);


		/*var product_code = $(this).find(".hidden-value").text();
		$.post(
				entryPoint,
				{operation:operation, conversationId:conversationId, locale:locale, OfferProductTypeCode:product_code},
				function(jsArray){
					show_terms_links(jsArray);
				}, 
				"json"
		);*/

	});

	function show_terms_links(jsArray){
		//remove the old links
		$("#terms-dialog li:eq(1)").empty();
		
		//add the links
		if(jsArray.infoFilePath1 != ""){
			if(jsArray.isLink1 == "1"){
				var markup = '<p class="link external"><a href="'+jsArray.infoFilePath1+'">'+jsArray.infoFileDesc1+'</a></p>';
			}else{
				var markup = '<p class="link"><a href="'+jsArray.infoFilePath1+'">'+jsArray.infoFileDesc1+'</a></p>';
			}
		}
		$("#terms-dialog li:eq(1)").prepend(markup);
		if(jsArray.infoFilePath2 != ""){
			if(jsArray.isLink2 == "1"){
				var markup = '<p class="link external"><a href="'+jsArray.infoFilePath2+'">'+jsArray.infoFileDesc2+'</a></p>';
			}else{
				var markup = '<p class="link"><a href="'+jsArray.infoFilePath2+'">'+jsArray.infoFileDesc2+'</a></p>';
			}
		}
		$("#terms-dialog li:eq(1)").prepend(markup);
		//and enable the checkbox
		$("#terms-checkbox").removeAttr("disabled");
	}

	$("#account-nickname").change(function(){
		if($(this).val() != ""){
			$("#step-3").addClass("active");
		}else{
			$("#step-3").removeClass("active");
		}
	});

	$("#secondary-beneficiary-1, #secondary-beneficiary-2").bind("keyup", on_secondary_beneficiary_change).bind("blur", on_secondary_beneficiary_change);

	function on_secondary_beneficiary_change(){
		if($("#secondary-beneficiary-1").val() != ""){
			//this if was added due to a IE bug
			if($("#secondary-beneficiary-2").hasClass("disabled")){
				$("#secondary-beneficiary-2").removeClass("disabled").removeAttr("disabled");
			}
			$("#step-4").addClass("active");
		}else{
			//this if was added due to a IE bug
			if(! $("#secondary-beneficiary-2").hasClass("disabled")){
				$("#secondary-beneficiary-2").addClass("disabled").attr("disabled", "disabled");
			}
			$("#step-4").removeClass("active");
		}
		$("#step-4").find(".validation-error").remove();
	}

	$(".reset").click(function(){
		$("#offers-list li:first").addClass("selected");
		$("#secondary-beneficiary-2").addClass("disabled").attr("disabled", "disabled");
		$("#step-5").slideUp().removeClass("open");
		$("#products-list li").slideUp().removeClass("selected");
		$("#products-list li.offer-0").slideDown().addClass("open");
		$("#terms-checkbox").attr("disabled", "disabled");
	});

	//=====RESTORE STATE=====//
	// setTimeout("restore_state('#account-nickname|input|ess~#secondary-beneficiary-1|input|23434~#secondary-beneficiary-2|input|~#offers-list|list|0~#products-list|list|0~#service-charge-date-dialog|dsq-dialog|0~#products-list|trigger|click')", 1000);
	if($("span.restoredState").text() != ""){
		show_loading();
		restore_state($("span.restoredState").text());

		if($("#secondary-beneficiary-1").val() != ""){
			$("#secondary-beneficiary-2").removeAttr("disabled").removeClass("disabled");
		}
	}

	//=====FORM SUBMIT=====//
	$("form").submit(function(){
		var validations = [
			[$("#offers-list"), "has_selected", "not_selected"],
			[$("#products-list"), "has_selected", "not_selected"],
			[$("#terms-checkbox"), "is_checked", "not_agreed_with_terms"]
		];

		if($("#secondary-beneficiary-1").val() != ""){
			validation = [[$("#secondary-beneficiary-1").val(), "not_equal", $("#secondary-beneficiary-2").val()], "equality", "not_equal"];
			validations.push(validation);
		}
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
		var ProductName = $("#products-list li.selected span.hidden-value").text();
		var secondBenef1 = $("#secondary-beneficiary-1").val();
		var secondBenef2 = $("#secondary-beneficiary-2").val();
		var daysOfMonth = $("#service-charge-date-dialog li.selected span.hidden-value").text();
		// fill in hidden fields
		$("input[name=ProductName]").val(ProductName);
		$("input[name=secondBenef1]").val(secondBenef1);
		$("input[name=secondBenef2]").val(secondBenef2);
		if($("#step-5").hasClass("open")){
			$("input[name=daysOfMonth]").val(daysOfMonth);
		}
	}

});