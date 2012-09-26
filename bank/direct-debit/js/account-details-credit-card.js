
$(document).ready(function() {
	
	//=====ON LOAD=====//
	
	
	//=====EVENTS=====//
	
	$("#filters-trigger").click(function(){toggleFilterVisibility()});

	function toggleFilterVisibility() {
		if ($(".table-filters form").is(":visible")) {
			$("#filters-trigger").text(showFilters);
		} else {
			$("#filters-trigger").text(hideFilters);
		}
		$(".table-filters form").slideToggle(300);
	}

	//
	$("#TheTxnsList tbody .icon-expand").live("click", function(event){
		if($(this).hasClass("expand")){
			$(this).removeClass("expand").addClass("collapse");
			$(this).parent().parent().find(".extra").slideDown();
		}else{
			$(this).addClass("expand").removeClass("collapse");
			$(this).parent().parent().find(".extra").slideUp();
		}
		
		var found = 0;
		var all = $("#TheTxnsList tbody .icon-expand").length;
		$("#TheTxnsList tbody .icon-expand").each(function(){
			if($(this).hasClass("collapse")){
				found++;
			}
		});
		if(found == all){
			$(".expand-all").addClass("open");
		}else if(found == 0){
			$(".expand-all").removeClass("open");
		}
	});

	$(".expand-all").live("click", function(event){
		if($(this).hasClass("open")){
			$(this).removeClass("open");
			$("#TheTxnsList tbody .icon-expand").addClass("expand").removeClass("collapse");
			$("#TheTxnsList .extra").slideUp();
		}else{
			$(this).addClass("open");
			$("#TheTxnsList tbody .icon-expand").removeClass("expand").addClass("collapse");
			$("#TheTxnsList .extra").slideDown();
		}
	});
	
	if ($("span.restoredState").text() != ""){
		restore_state($("span.restoredState").text());
	}
		
	//=====FORM SUBMIT/VALIDATIONS=====//
	$("form").submit(function(){
		
		if ($("#date-range li.selected").length > 0){
			var dateRange = $("#date-range li.selected").find("span").text();
			setDateRange(dateRange);
		}
		
		save_state();

		show_loading(true);

		return true;
	});

	
//	$("#date-range li").click(function(){
//		var dateRange = $(this).find("span").text();
//		setDateRange(dateRange);
//	});
	
	function setDateRange(dateRange){
		if (dateRange == "" || dateRange == selectDateRange){
			$("input[name=FromDate]").val("");
			$("input[name=ToDate]").val("");
		}
		else{
			$("input[name=FromDate]").val(dateRange.substring(0, dateRange.indexOf('-')));
			$("input[name=ToDate]").val(dateRange.substring(dateRange.indexOf('-')+1, dateRange.length));
		}
	}
	
	$("#XLSButton").live("click", function(event){
		initiate_dialogs(false);
		$("#modal-download-excel").dialog("open");
	});
	
	$("#modal-download-excel #submit-confirmation").live("click", function(){
		$("#modal-download-excel").dialog("destroy");
	});
	
	
});

