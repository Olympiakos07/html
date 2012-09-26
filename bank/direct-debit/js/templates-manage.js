var templates = {};
var template_type = "";

function list_clicked(id, index, old_index){
	
	if ( id === 'manage-templates-list' ){

		if(index != old_index){
			//fix height and enable submit button
			$("#step-1").children("div.content").height("auto");
			$(".form .buttons input").removeAttr("disabled");
			templates.change(index);
		}
	}
}

function list_action_clicked(id, index, action){
	$("fieldset:not(#step-1, .buttons)").remove();
	
	$("#"+id + " li").removeClass("selected");
	$("#"+id + " li:eq(" +index+ ")").addClass("selected");
	
	modal.hide_modal_messages();
	modal.update_visibles('delete');
	$("#modal-actions").dialog("open");
	
	setTimeout(function(){mainHeightFix()}, 500);
}

$(document).ready(function()	{

	$(".specific").css("display", "none");

	//=====EVENTS=====//

//	$("#manage-templates-list li").click(function() {
//		//fix height and enable submit button
//		$("#step-1").children("div.content").height("auto");
//		$(".form .buttons input").removeAttr("disabled");
//
//		templates.change($(this).index());
//		
//	});

	$("#available-for-mobile li").live("click", function(){
		if($(this).hasClass("available-for-mobile")){
			$(this).parent().parent().next().slideDown();
		}else{
			$(this).parent().parent().next().slideUp();			
		}
	});

	$("#filter-mobile-templates").live("click", function(){
		if($(this).is(":checked")){
			$("#manage-templates-list li:not(.available-for-mobile)").slideUp();
		}else{
			$("#manage-templates-list li:not(.available-for-mobile)").slideDown();
		}
	});

	templates = {
		change: function(index){
			show_loading(true);

			template_type = find_account_type($("#manage-templates-list li:eq("+index+")"));

			var transaction_id = $("#manage-templates-list li:eq("+index+")").find(".transaction-id").text();
			var transaction_template = $("#manage-templates-list li:eq("+index+")").find(".transaction-template").text();
			
			get_template_html(transaction_id, transaction_template);

		},

		update_html: function(data){
			$("fieldset:not(#step-1, .buttons)").remove();
			$(data).insertAfter("#step-1");
			
			$(".check-iban").each(function(){
				if($(this).val().length == 24){
					$(this).val(split_iban($(this).val()));
					resize_font(this);
				}
			});
			
			$(".qMarkClass").remove();
			initializeTooltips(0);
			
			scroll.list(500);
			remove_loading();
			
			setTimeout(function(){mainHeightFix()}, 500);
		}
	}

});
