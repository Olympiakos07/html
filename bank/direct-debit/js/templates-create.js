$(document).ready(function(){
	
	// beneficiary type select
	$("#recipient-choice-dialog li").live("click", function(){
		var type = $(this).children().attr("class");
		var txt = $(this).children().text();
		$("#recipient-choice-dialog").slideUp().removeClass('open');
		//display multi repeat
		$("#step-1 .recipient-type .dd").text(txt);
		//
		$("#recipient-choice-dialog li").removeClass("selected");
		$(this).addClass("selected");
	});
	
	// available for mobile select
	$("#available-for-mobile-dialog li").live("click", function(){
		var type = $(this).children().attr("class");
		var txt = $(this).children().text();
		$("#available-for-mobile-dialog").slideUp().removeClass('open');
		//display multi repeat
		$("label.available-for-mobile-status.dd").text(txt);
		//
		$("#available-for-mobile-dialog li").removeClass("selected");
		$(this).addClass("selected");
		//enable/disable input
		if($(".available-for-mobile-input").attr("disabled") == false){
			$(".available-for-mobile-input").attr("disabled", "disabled");
		}else{
			$(".available-for-mobile-input").removeAttr("disabled");
		}
		
	});
	
	$("form.romanian #step-1 #beneficiary-iban").blur(function(){
		var value = $(this).val();
		//if its a number
		if(!isNaN(value)){
			if(value.length >= 7 && value.length <= 10){
				$(this).next().html("<span>Valid Raiffeisen Account</span>");
				$("form.romanian #step-1 ul.fields-list li:last, form.romanian #step-1 div.fields.sep").slideUp();
			}else{
				$(this).next().html("<span class='error iban-message'>Invalid Raiffeisen Account</span>");
				$("form.romanian #step-1 ul.fields-list li:last, form.romanian #step-1 div.fields.sep").slideUp();
			}
		}else{
			if(value.length == 24){
				if(value.substr(0, 2) == 'RO'){
					if(value.substr(4, 4) == 'RZBR'){
						$(this).next().html("<span>Valid Raiffeisen IBAN</span>");
						$("form.romanian #step-1 ul.fields-list li:last, form.romanian #step-1 div.fields.sep").slideUp();
					}else{
						$(this).next().html("<span>Valid Romanian IBAN</span>");
						$("form.romanian #step-1 ul.fields-list li:last, form.romanian #step-1 div.fields.sep").slideDown();
					}
				}else{
					$(this).next().html("<span class='error iban-message'>Invalid IBAN</span>");
					$("form.romanian #step-1 ul.fields-list li:last, form.romanian #step-1 div.fields.sep").slideUp();
				}
			}else{
				$(this).next().html("<span class='error iban-message'>Invalid IBAN</span>");
				$("form.romanian #step-1 ul.fields-list li:last, form.romanian #step-1 div.fields.sep").slideUp();
			}
		}
	});

});
