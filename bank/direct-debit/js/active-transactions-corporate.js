$(document).ready(function() {

	$("#from-account-list-company li").click(function(){
		$("#from-account-list li").slideDown();
		if($(this).index() == 1){
			$("#from-account-list li:eq(2), #from-account-list li:eq(3)").slideUp();
		}else if($(this).index() == 2){
			$("#from-account-list li:eq(6), #from-account-list li:eq(4)").slideUp();
		}else if($(this).index() == 3){
			$("#from-account-list li:eq(3), #from-account-list li:eq(5)").slideUp();
		}
	});

	//=====EVENTS=====//
	$("#filters-trigger").click(function(){
		var old_text = $(this).text();
		var new_text = $(this).parent().find(".hide-text").text();
		$(this).parent().find(".hide-text").text(old_text);
		$(this).text(new_text);
		if($(this).hasClass("open")){
			$(".form").slideUp().removeClass("open");
			$(this).removeClass("open");
		}else{
			$(".form").slideDown().addClass("open");
			$(this).addClass("open")
		}
	})

	$(".show-text-tooltip").hover(
		function(){
			var text = $(this).text();
			var offset = $(this).offset();
			var left = offset.left + 30;
			var top = offset.top + 30;
			$("body").append('<div id="tooltip" style="position: absolute; left: '+ left +'px; top: '+ top +'px;">'+ text +'</div>'); 
		},
		function() {
			$("#tooltip").remove(); 
		}
	);

	$("#transaction-type-list li").click(function(){
		if($(this).hasClass("ram")){
			$("#beneficiary-account").slideUp();
			$("#predefined-beneficiaries-ram-fund").delay(500).slideDown();
		}else{
			$("#predefined-beneficiaries-ram-fund").slideUp();
			$("#beneficiary-account").delay(500).slideDown();
		}
	});

	$("form").submit(function(){

		if($("#filters-trigger").hasClass("open") && ($("from-amount").val() != "" || $("to-amount").val() != "")){
			var validations = [
				[[$("#from-amount"), "max", $("#to-amount").val()], "compare_numbers", "from_amount_bigger_than_to"]

			];

			var submit_status = validator(validations, true);
		}else{
			var submit_status = true;
		}

		console.log("submit_status="+submit_status);

		if(submit_status == true){
			save_state();
			//fill in the hidden fields
			create_hidden_fields();
			show_loading();
		}

		return submit_status;
	});

	function create_hidden_fields(){
		
	}

});