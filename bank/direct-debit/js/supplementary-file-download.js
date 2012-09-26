$(document).ready(function() {

	// Maybe this should be in main.js
	$(".table-filters input:submit").click(function() {
		$("#supplementary-file-select").fadeIn();
		restore_height();
	});

	//fill in predefined dates for start date and end date
	$("#start-date").val(one_month_back_date);
	$("#end-date").val(today_date);
	
	//show/hide filters button
	$("#filters-trigger").click(function(){
		if($(this).hasClass("open")){
			$(this).parent().parent().next().slideUp();
			$(this).removeClass("open");
			$(this).text('Show filters');
		}else{
			$(this).parent().parent().next().slideDown();
			$(this).addClass("open");
			$(this).text('Hide filters');
		}
	});

	// Cancel filters submit DELIVERY ONLY !
	$("form").submit(function(){
		return false;
	});

});