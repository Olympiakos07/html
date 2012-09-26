function modalOpened(event, ui){
	if (event.target.id == 'modal-transactions'){
		updateAutoDisplayActiveTransactions(true);
	}
}

function modalClosed(event, ui){
	if (event.target.id == 'modal-transactions'){
		resetModalTransactions();
		updateAutoDisplayActiveTransactions(false);
	}
}

$(document).ready(function() {
	
	//=====ON LOAD=====//
	
	var submitType = $("input[name=AccountDetailsSubmitType]").val();
	if (submitType == "") submitType = "list"; 
	if (submitType == "list"){
		showListHideCalendar();
	}
	else{
		showCalendarHideList();
	}
	submitType = "list";
	
	$("#start-date").val(one_month_back_date);
	$("#end-date").val(today_date);

//	if($("ul.beneficiaries li").length > 1){
//		$('.open-beneficiaries').removeClass("hidden");
//	}
	
	function showListHideCalendar(){
		$("#views-trigger").text(viewCalendar).addClass('calendar').removeClass('table'); // change button icon and text
		$("#transactions-calendar").slideUp(300); // close calendar
		$("#TheTxnsList").delay(299).slideDown(300); // then open list
		$("#filters-trigger").fadeIn(750);
	}
	
	function showCalendarHideList(){
		$("#views-trigger").text(viewList).addClass('table').removeClass('calendar'); // change button icon and text
		$("#TheTxnsList").slideUp(300); // close list
		if ($(".table-filters form").is(":visible")) {
			toggleFilterVisibility();
		}
		$("#transactions-calendar").delay(300).slideDown(300); // then Open Calendar
		$("#filters-trigger").fadeOut(750);
	}
	
	//auto display active transactions, if needed
	var autoDisplayActiveTransactions = $("input[name=autoDisplayActiveTransactions]").val();
	if (autoDisplayActiveTransactions == "true"){
		$("#modal-transactions").dialog("open");
		if(!checkAjaxRequestsStatus()){
			setTimeout("get_active_transactions()", 200);
		}
	}
	
	
	//=====EVENTS=====//
	
	$("#views-trigger").click(function(){
		if ($("#TheTxnsList").is(":visible")) {
			showCalendarHideList();
		} else {
			showListHideCalendar();
		}
	});

	$("#button-transactions").click(function(){
		//if(!checkAjaxRequestsStatus()){
			setTimeout("get_active_transactions()", 200);
		//}
	});
	
	$("#filters-trigger").click(function(){toggleFilterVisibility()});

	function toggleFilterVisibility() {
		if ($(".table-filters form").is(":visible")) {
			$("#filters-trigger").text(showFilters);
		} else {
			$("#filters-trigger").text(hideFilters);
		}
		$(".table-filters form").slideToggle(300);
	}

	/**
	 * Updates the bubble and arrow position
	 * @param  {HTMLElement} element The element
	 */
	function updatePosition(element){
		var date = element.find("div").clone().children().remove().end().text().trim();
		//
		if(element.index() < 2){
			element.find(".date-transactions").css("right", "auto").css("left", "-10px");
			var left = 9
			if(date.length == 1){
				left = 4;
			}
			element.find(".arrow").css("left", left + "px");
		}else{
			//find the character length in the box to move the arrow just above it
			var offset = 20
			if(date.length == 1){
				offset = 15;
			}
			var right = element.width() - offset;
			element.find(".arrow").css("right", right + "px");
		}
	}
	
	$(".date-has-transactions").click(function(){
		if($(this).find(".date-transactions").hasClass("closed")){
			$("#transactions-calendar").find(".date-transactions").fadeOut().addClass("closed").removeClass("open");
			$(this).find(".date-transactions").fadeIn().removeClass("closed").addClass("open").css("z-index", "100000");
			$("#content").css("overflow", "visible");
			updatePosition($(this));
			var elementHtml = $(this).find(".date-transactions").html();
			$(this).find(".date-transactions").remove();
			elementHtml.prependTo($("#transactions-calendar"));
		}else{
			$(this).find(".date-transactions").fadeOut().addClass("closed").removeClass("open");
			$("#content").css("overflow", "hidden");
		}
	});
	
	$(".open-beneficiaries").click(function(){
		if($(this).hasClass("open")){
			$(this).removeClass("open");
			$("ul.beneficiaries li:not(:first)").slideUp();			
		}else{
			$(this).addClass("open");
			$("ul.beneficiaries li:not(:first)").slideDown();
		}
	});

	//
	$("#TheTxnsList tbody .icon-expand").live("click", function(event){
		if($(this).hasClass("expand")){
			$(this).removeClass("expand").addClass("collapse");
			$(this).parent().parent().find(".extra").slideDown();
			transaction.fetch($(this).closest("tr"));
		}else{
			$(this).addClass("expand").removeClass("collapse");
			$(this).parent().parent().find(".extra").slideUp();
		}
		//
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
			if ($("#TheTxnsList").find("td.beneficiary").length == 0){
				transaction.fetch($(this).closest("tr"));
			}
		}
	});

	$("#todays-activity-report").click(function(){
		console.log($("input[name=ActivityReportUrl]").val());
		window.location = $("input[name=ActivityReportUrl]").val();
	});
	
	var transaction = {
			
		fetch: function(element){
		
			var accNum;
			var transactions = new Array();
			
			if(element.find(".expand-all").length > 0){
				$("#TheTxnsList tbody tr").each(function(){
					i = $(this).index();
					transactions[i] = {};
					transactions[i].detailsDivName = $(this).find(".hidden-value.detailsDivName").text();
					transactions[i].signTranKey = $(this).find(".hidden-value.signTranKey").text();
					transactions[i].AccType = $(this).find(".hidden-value.AccType").text();
					transactions[i].tranDate = $(this).find(".hidden-value.tranDate").text();
					if (i == 0) accNum = $(this).find(".hidden-value.accNum").text();
					
				});
			}else{
				transactions[0] = {};
				transactions[0].detailsDivName = element.find(".hidden-value.detailsDivName").text();
				transactions[0].signTranKey = element.find(".hidden-value.signTranKey").text();
				transactions[0].AccType = element.find(".hidden-value.AccType").text();
				transactions[0].tranDate = element.find(".hidden-value.tranDate").text();
				accNum = element.find(".hidden-value.accNum").text();
			}
			get_transaction_details(transactions, accNum)
		}
			
	}
	
	if ($("span.restoredState").text() != ""){
		restore_state($("span.restoredState").text());
	}
	
	$(".prev-year, .prev-month, .next-month, .next-year").click(function(){
		var year = $(".navigation .hidden-value.year").text();
		var month = $(".navigation .hidden-value.month").text();
		if($(this).hasClass("prev-year")){
			year = parseInt(year) - 1;
		}else if($(this).hasClass("next-year")){
			year = parseInt(year) + 1;
		}else if($(this).hasClass("prev-month")){
			month = parseInt(month) - 1
			if(month == -1){
				month = 11;
				year = parseInt(year) - 1;
			}
		}else if($(this).hasClass("next-month")){
			month = parseInt(month) + 1
			if(month == 12){
				month = 0;
				year = parseInt(year) + 1;
			}
		}
		
		$("input[name=FromCalendarDate]").val("01"+FormatNumberLength(parseInt(month) + 1, 2)+FormatNumberLength(parseInt(year), 4));
		$("input[name=ToCalendarDate]").val(FormatNumberLength(LastDayOfMonth(parseInt(year)-1900, parseInt(month)), 2)+FormatNumberLength(parseInt(month)+1, 2)+FormatNumberLength(parseInt(year), 4));
		
		submitType = "calendar";

		$("form").submit();
		
	});
	
	function FormatNumberLength(num, length) {
	    var r = "" + num;
	    while (r.length < length) {
	        r = "0" + r;
	    }
	    return r;
	}
	
    function LastDayOfMonth(Year, Month)
    {
        return(new Date((new Date(Year, Month+1,1))-1)).getDate();
    }
		
    var createHiddenFields = true;
	//=====FORM SUBMIT/VALIDATIONS=====//
	$("form").submit(function(){
		
		var validations = [
   		    [$("#number-of-transactions"), "not_zero", "amount_zero"]
   		];
   		var validator = new Validator();
   		var submit_status = validator.validate(validations, false, true);
   		
   		if (submit_status){
			//fill in the hidden fields
			if (createHiddenFields){
				save_state();
				create_hidden_fields(submitType);
			}
			show_loading(true);
		}
		
		return submit_status;
	});

	//=====CREATE HIDDEN FIELDS=====//
	function create_hidden_fields(submitType){

		//find values
		$("input[name=FromDate]").val($("#start-date").val().replace(/\//g, ""));
		$("input[name=ToDate]").val($("#end-date").val().replace(/\//g, ""));
		$("input[name=FromAmount]").val($("#from-amount").val().replace(/,|\./g,''));
		$("input[name=ToAmount]").val($("#to-amount").val().replace(/,|\./g,''));
		$("input[name=NumOfTransactions]").val($("#number-of-transactions").val());
		$("input[name=TransactionType]").val($("#transaction-type li.selected span.hidden-value").text());

		$("input[name=AccountDetailsSubmitType]").val(submitType);
		if (submitType == 'list'){
			$("input[name=ButtonPressed]").val('SubmitButton');
		}
		else{
			$("input[name=ButtonPressed]").val('Calendar');
		}
	}
	
	function reset_hidden_fields(){
		$("input[name=FromDate]").val("");
		$("input[name=ToDate]").val("");
		$("input[name=FromAmount]").val("");
		$("input[name=ToAmount]").val("");
		$("input[name=NumOfTransactions]").val("");
		$("input[name=TransactionType]").val("");
		$("input[name=AccountDetailsSubmitType]").val("");
		$("input[name=FromCalendarDate]").val("");
		$("input[name=ToCalendarDate]").val("");
	}
	
	function setParameters(accountIndex) {		
		var accountNumbers = $("span.accountNumbers").text();
		var accountTypes = $("span.accountTypes").text();
		var nextPages = $("span.nextPages").text();
		//Actual Account
		var accountNumber = $("input[name=AccountNumber]").val();
		
		selectedAccount = tokenize(accountNumbers,"|", accountIndex);
		if (!(selectedAccount == accountNumber)) {
			selectedAccountType = tokenize(accountTypes,"|", accountIndex);
			selectedNextPage = tokenize(nextPages,"|", accountIndex);
			
			$("input[name=AccountNumber]").val(selectedAccount);
			$("input[name=AccountType]").val(selectedAccountType);
			$("input[name=ButtonPressed]").val('SubmitAccountButton');
			if (!(selectedNextPage == $("input[name=nextPage]").val())) {
				$("input[name=nextPage]").val(selectedNextPage);		
			}
			return true;
		}
		else{
			return false;
		}
	}
	
	$("#account-selection li").click(function(){
		reset_hidden_fields();
		if (setParameters($(this).index())){
			createHiddenFields = false;
			$("form").submit();
		}
	});
});

