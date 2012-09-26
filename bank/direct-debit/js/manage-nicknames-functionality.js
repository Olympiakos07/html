$(document).ready(function(){
	$("#accounts-list li").click(function(){
		//remove "disabled" from modify field
		$("#modify-nickname").removeClass("disabled").removeAttr("disabled");
		$("#modify-nickname").next().find(".clear-input").removeClass("disabled").removeAttr("disabled");
		$("#modify-nickname").parent().find(".chars-remaining").text("15");
		$("#modify-nickname").val($("#accounts-list li:eq(" + $(this).index() + ") .nickname").text());
		$("#modify-nickname").parent().find(".chars-remaining").text(15 - $("#modify-nickname").val().length);
		$("#modify-nickname").focus();
	});

	$("#modify-nickname").keyup(function(){
		var nickname = $(this).val();
		//find number and nickname and update the list with it
		if(nickname == ""){
			$("#accounts-list li.selected .parenthesis").addClass("hidden");
		}else{
			$("#accounts-list li.selected .parenthesis").removeClass("hidden");
		}
		$("#accounts-list li.selected .nickname").text(nickname);
	});
});