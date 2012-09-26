$(document).ready(function(){
	
	$("#step-2 #beneficiary-iban").blur(function(){
		var value = $(this).val();
		//if its a number
		if(!isNaN(value)){
			if(value.length >= 7 && value.length <= 10){
				$(this).next().html("<span>Valid Raiffeisen Account</span>");
				$("#step-2 ul.fields-list li:last, #step-2 div.fields.sep").slideUp();
			}else{
				$(this).next().html("<span class='error iban-message'>Invalid Raiffeisen Account</span>");
				$("#step-2 ul.fields-list li:last, #step-2 div.fields.sep").slideUp();
			}
		}else{
			if(value.length == 24){
				if(value.substr(0, 2) == 'RO'){
					if(value.substr(4, 4) == 'RZBR'){
						$(this).next().html("<span>Valid Raiffeisen IBAN</span>");
						$("#step-2 ul.fields-list li:last, #step-2 div.fields.sep").slideUp();
					}else{
						$(this).next().html("<span>Valid Romanian IBAN</span>");
						$("#step-2 ul.fields-list li:last, #step-2 div.fields.sep").slideDown();
					}
				}else{
					$(this).next().html("<span class='error iban-message'>Invalid IBAN</span>");
					$("#step-2 ul.fields-list li:last, #step-2 div.fields.sep").slideUp();
				}
			}else{
				$(this).next().html("<span class='error iban-message'>Invalid IBAN</span>");
				$("#step-2 ul.fields-list li:last, #step-2 div.fields.sep").slideUp();
			}
		}
	});
	
});
