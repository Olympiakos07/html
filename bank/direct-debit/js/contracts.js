$(document).ready(function(){
	
	var open_category = 0;

	$(".sub-header").click(function(){
		var id = $(this).attr("id").split("-")[3];
		console.log(id);
		if(id != open_category){
			$(".sub-header").removeClass("open");
			$(this).addClass("open");
			$("#contracts-list li:not(.in-category-"+id+", .sub-header)").slideUp();
			$(".in-category-"+id).slideDown().addClass("open");
			open_category = id;	
		}
		
		setTimeout(function(){mainHeightFix()}, 500);
	});

});