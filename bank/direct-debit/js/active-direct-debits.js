$(document).ready(function() {

	//=====ON LOAD=====//

	
	//=====RESET=====//
	$("#main .form-header .reset").click(function(){
		
	});

	//=====EVENTS=====//
	
	//on action links click..
	$("a.icon.view").click(function(){
		link_onclick_wrapper('MOD', $(this));
	});
	$("a.icon.edit").click(function(){
		link_onclick_wrapper('MOD', $(this));
	});
	$("a.icon.delete").click(function(){
		link_onclick_wrapper('DEL', $(this));
	});
	
//	$("#step-1 li").live("click", function(){
//		if($(this).hasClass("filter")){
//			$("#step-1").removeClass("active");
//		}
//	});

	//=====REAL TIME VALIDATIONS=====//

	//on calendar date click..
	$("a.ui-state-default").live("click", function(){

	});
	
	//=====VALIDATIONS=====//
	$("form").submit(function(){
		var submit_status = true;
		alert('submit ready');
		return submit_status;
	});

});

function link_onclick_wrapper(flag, thiss){
	var index = thiss.attr("indexAttr");  //<%--$(this).index()--%>
	link_onclick(flag, index);
}
function link_onclick(flag, index){
	alert('indexx..'+index);
	var actionFlag = '';
	var nextPage = '';
	if(flag == 'MOD'){
		actionFlag ='modifyActive';
		nextPage = 'modify_direct_debit';
	}else if(flag == 'DEL'){
		actionFlag = 'deleteActive';
		nextPage = 'add_direct_debit_verify';
	}else if(flag == 'DSP'){
		actionFlag = 'details';
		nextPage = 'details_active_direct_debit';
	}
	$("input[name='actionFlag']").val(actionFlag);
	$("input[name='nextPage']").val(nextPage);
	$("input[name='transactionListIndex']").val(index);
}



function changePage(pageNumber){
	alert('the changePage() function should be implemented');
}