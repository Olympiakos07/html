<%@page import="ebanking.servlets.AJAXServlet"%>
<%@page import="ebanking.framework.params.WebParams"%>

<%@page import="java.util.Locale"%>
<%@page import="ebanking.transaction.framework.Environment"%>
<%@page import="ebanking.util.AppConstants"%>

$(document).ready(function(){
	
	//kyrD:20120130:Usability:currentSavings_Account start
	<%
	Locale myLocale = (Locale)session.getAttribute(WebParams.userLocale_ses.id());	
	String prdShrDescTitle = AppConstants.MESSAGE_RESOURCES.getMessage(myLocale, "message.usability.currentSavings_Account_input.main.productShrDescTitle");
	%>	
	var prdShrDescTitle = '<%=prdShrDescTitle%>';
	//kyrD:20120130:Usability:currentSavings_Account end
	
	//=====ON LOAD=====//
	//var selected_offer = 0;
	$("#products-list li").css("display", "none").removeClass("selected");
	//$("#products-list li.offer-"+selected_offer).css("display", "block"); //kyrD:20120127:Usability
	$("#products-list li").css("display", "block"); //kyrD:20120127:Usability

	//=====EVENTS=====//
	
	//on offers click, display the corresponding products
	$("#offers-list li").click(function(event){
		if(!$(this).hasClass("selected") || event.inputMethod == "keyboard"){
			var index = $(this).index();
			$("#products-list li").slideUp().removeClass("selected");
			$("#products-list li.offer-"+index).slideDown();
		}
		
		//kyrD:20120127:Usability:currentSavings_Account start
		$("#products-list").empty();
		$("#terms-dialog li:eq(1)").empty(); //Delete the links retrieve for the selected product
		//$(".ui-dialog").remove();
		destroy_dialogs();//Delete the divs that contain the short description of each product and are in the bottom of the page.
		
			<%--
			 var jsObj = {
					"ArrayOfJsonPrds": [{  
											"htmlClass":"current currency-USD",
										    "prdMjType":"",
										    "prdType":"",
										    "prdCode":"00000",
											"prdChargeDate":"20141201",
											"currency":""
											"prdDesc":"This is a product descr",
											"prdShortDesc": "<ul>   <li><b>Coffee</b></li>   <li><em>Tea</em></li>   <li>Milk</li> </ul>",
								       							        
								      },
									  {  		
								      },
								   ],								
					"errorMessage":""
				}
			 --%>
		 
		var offerCode = $(this).find(".hidden-value").text();
		show_loading(true);
//console.log("Request Prds for OFFERcode=>" + offerCode);
		$.post(
				'<%=AJAXServlet.EntryPoint%>',
				{
					<%=WebParams.ajaxServletMethod.id()%>:		'<%=AJAXServlet.Operations.getProductListByOfferCode%>',
					<%=WebParams.conversationId.id()%>:			$('input[name=<%=WebParams.conversationId.id()%>]').val(),
					<%=WebParams.offerCode.id()%>:				offerCode
				},
				function(jsArray){					

//console.log(jsArray);									
						if(jsArray.errorMessage == ""){				
							//save data							
							var jsonPrds = jsArray.ArrayOfJsonPrds;
							//var title ='';
							//refill it
							for(i=0; i < jsonPrds.length; i++){
								var prd = jsonPrds[i];
								var prdClass = jsonPrds[i].htmlClass;
								
								var markup = '<li class="'+prdClass+'">'
											+	'<a href="javascript:void(0);">'+prd.prdDesc+'</a>';
											
								if(prd.prdShortDesc.length!=0){
								  markup = markup +	'<span id="button-'+i +'" class="product-info dialog-message-button">Info</span>'
								}
								markup = markup +	'<span class="hidden hidden-value productCode">'+prd.prdCode +'</span>'
												
											+	'<span class="hidden hidden-value productType">'+prd.prdType +'</span>'
											+	'<span class="hidden hidden-value majorType">'+prd.prdMjType +'</span>'
											+	'<span class="hidden hidden-value currency">'+prd.currency +'</span>'
													
											+	'<span class="hidden service-charge-date">'+prd.prdChargeDate +'</span>';
								if(prd.prdShortDesc.length!=0){			
								   markup = markup +	 '<div id="modal-'+i +'" class="dialog-message hidden no-style " title="'+prdShrDescTitle+'">'
												  +		 '<p>'+prd.prdShortDesc+'</p>' 
												  +	 '</div>';
								}			
											
								markup = markup +'</li>';
								
								$("#products-list").append(markup);
								if(event.restore){
									var value= ajax_states["products-list"];
									$("#products-list li:eq("+value+")").addClass("selected");
								}
								
								
							}
						}
						remove_loading();
						
					}, 
					"json"		
			);
		//kyrD:20120127:Usability:currentSavings_Account end
		
		$("#step-5").slideUp().removeClass("open");
	});

	$("#products-list li").live("click", function(){
		//close 2nd beneficiary, if empty
		if($("#secondary-beneficiary-2").val() == "") { 
			$("#secondary-beneficiary-2").addClass("disabled").attr("disabled", "disabled");
		}
		
		if($("#secondary-beneficiary-1").val() != "") { 
			$("#secondary-beneficiary-2").removeClass("disabled").removeAttr("disabled");
		}
		
		//check if product allows the change of the service charge date
		if($(this).find(".service-charge-date").text() == 1){
			$("#step-5").slideDown().addClass("open");
		}else{
			$("#step-5").slideUp().removeClass("open");
		}
		
		setTimeout(function(){mainHeightFix()}, 500);
		
		/*
		//these are summy data and must be replaced with the real ajax request below
		var jsArray = {
			"infoFilePath1": "fire",
			"infoFilePath2": "fsdfsire",
			"infoFileDesc1": "firesadfs",
			"infoFileDesc2": "firedesc2",
			"isLink1": "1",
			"isLink2": "1"
		}

		show_terms_links(jsArray);
		

		var product_code = $(this).find(".hidden-value").text();
		$.post(
				entryPoint,
				{operation:operation, conversationId:conversationId, locale:locale, OfferProductTypeCode:product_code},
				function(jsArray){
					show_terms_links(jsArray);
				}, 
				"json"
		);*/
		
		
	//kyrD:20120127:Usability:currentSavings_Account start
	//Custom methods
	//THIS IS A GENERIC METHOD FOR OBTAINING INFO FILES
	//function getInfoLinks(){
		
		var offerCode = $("#offers-list li.selected .hidden-value").text();
		var productType = $(this).find(".productType").text();		
		var productCode = $(this).find(".productCode").text();
		var transactionID  = $("#txnCode").val();
		var majorType   = $(this).find(".majorType").text();

		//console.log("Requested LINKS for prd " + offerCode +"|"+productType+"|"+productCode);
	
		$.post(
				'<%=AJAXServlet.EntryPoint%>',
				{
					<%=WebParams.ajaxServletMethod.id()%>:		'<%=AJAXServlet.Operations.getCurrentSavingsAccountLinks%>',
					<%=WebParams.conversationId.id()%>:			$('input[name=<%=WebParams.conversationId.id()%>]').val(),
					<%=WebParams.offerCode.id()%>:				offerCode,
					<%=WebParams.productType.id()%>:			productType,
					<%=WebParams.productCode.id()%>:			productCode,
					<%=WebParams.fromTransactionID.id()%>:		transactionID,
					<%=WebParams.majorCode.id()%>:				majorType
				},
				function(jsArray){	
				//console.log(jsArray);								
					
					show_terms_links(jsArray);
				}, 
				"json"
		);
	
		//kyrD:20120127:Usability:currentSavings_Account end
		

	});
	
	
	function show_terms_links(jsArray){
		/*var jsArray = [{        "linkType": 1,
									link: "link1",
									"label": "label1",			
								},
						        {        "linkType": 2,
									link: "link2",
									"label": "label2",			
								},
						];
		*/				
		$("#terms-dialog li:eq(1)").empty();
		$.each(jsArray, function(pdfIndex, data) {
			if(data.linkType==1)//is a file
				var markup = "<p class='link' ><a target='_blank' href='"+data.link+"'>"+data.label+"</a></p>";
			else//is a http link
				var markup = "<p class='link external' ><a target='_blank' href='"+data.link+"'>"+data.label+"</a></p>";
			$(markup).appendTo("#terms-dialog li:eq(1)");
		});
		
		$("#terms-checkbox").removeAttr("disabled");
	}
	
    /*
	function show_terms_links(jsArray){
		//remove the old links
		$("#terms-dialog li:eq(1)").empty();
		
		//add the links
		if(jsArray.infoFilePath1 != ""){
			if(jsArray.isLink1 == "1"){
				var markup = '<p class="link external"><a href="'+jsArray.infoFilePath1+'">'+jsArray.infoFileDesc1+'</a></p>';
			}else{
				var markup = '<p class="link"><a href="'+jsArray.infoFilePath1+'">'+jsArray.infoFileDesc1+'</a></p>';
			}
		}
		$("#terms-dialog li:eq(1)").prepend(markup);
		if(jsArray.infoFilePath2 != ""){
			if(jsArray.isLink2 == "1"){
				var markup = '<p class="link external"><a href="'+jsArray.infoFilePath2+'">'+jsArray.infoFileDesc2+'</a></p>';
			}else{
				var markup = '<p class="link"><a href="'+jsArray.infoFilePath2+'">'+jsArray.infoFileDesc2+'</a></p>';
			}
		}
		$("#terms-dialog li:eq(1)").prepend(markup);
		//and enable the checkbox
		$("#terms-checkbox").removeAttr("disabled");
	}
   */
	$("#account-nickname").change(function(){
		if($(this).val() != ""){
			$("#step-3").addClass("active");
		}else{
			$("#step-3").removeClass("active");
		}
	});

	$("#secondary-beneficiary-1").bind("keyup", on_secondary_beneficiary_change).bind("blur", on_secondary_beneficiary_change);

	function on_secondary_beneficiary_change(){
		if($("#secondary-beneficiary-1").val() != ""){
			$("#secondary-beneficiary-2").removeClass("disabled").removeAttr("disabled");
			$("#step-4").addClass("active");
		}else{
			$("#secondary-beneficiary-2").addClass("disabled").attr("disabled", "disabled");
			$("#step-4").removeClass("active");
		}
		$("#step-4").find(".validation-error").remove();
	}

	$(".reset").click(function(){
		$("#offers-list li:first").addClass("selected").click();
		$("#secondary-beneficiary-2").addClass("disabled").attr("disabled", "disabled");
		$("#step-5").slideUp().removeClass("open");
		$("#terms-checkbox").attr("disabled", "disabled");
	});

	//=====RESTORE STATE=====//
	// setTimeout("restore_state('#account-nickname|input|ess~#secondary-beneficiary-1|input|23434~#secondary-beneficiary-2|input|~#offers-list|list|0~#products-list|list|0~#service-charge-date-dialog|dsq-dialog|0~#products-list|trigger|click')", 1000);
	if($("span.restoredState").text() != ""){
		restore_state($("span.restoredState").text());
		if($("#secondary-beneficiary-1").val() !=""){
			$("#secondary-beneficiary-2").removeAttr("disabled").removeClass("disabled");
		}
		setTimeout('$("#products-list li.selected").click()', 1000)
	}

	//=====FORM SUBMIT=====//
	$("form").submit(function(){
	
		var validations = [
			[$("#offers-list"), "has_selected", "not_selected"],
			[$("#products-list"), "has_selected", "not_selected"],
			[$("#terms-checkbox"), "is_checked", "not_agreed_with_terms"]
		];

		if($("#secondary-beneficiary-1").val() !=""){
			var validation = [[$("#secondary-beneficiary-1"), "not_equal", $("#secondary-beneficiary-2").val()], "equality", "error_inval_cnp_secBenef2"];
			validations.push(validation);
		}
		
		if($("#service-charge-date-list").is(":visible")){
			var validation = [$("#service-charge-date-list"), "has_selected", "not_selected"];
			validations.push(validation);
		}
		
		var validator = new Validator();
		var submit_status = validator.validate(validations, true, true);
		
		//console.log("submit_status="+submit_status);

		if($("span.validation-error").length != 0)
			submit_status = false;

		if(submit_status == true){
			save_state();
			//fill in the hidden fields
			create_hidden_fields();
			show_loading(false);
		}
		return submit_status;
	});

	//=====CREATE AND FILL HIDDEN FIELDS=====//
	function create_hidden_fields(){
	
	
		//find values
		var productName =  $("#products-list li.selected a").text();//$("#products-list li.selected span.hidden-value.productName").text();
		var secondBenef1 = $("#secondary-beneficiary-1").val();
		var secondBenef2 = $("#secondary-beneficiary-2").val();
		var daysOfMonth = $("#service-charge-date-list li.selected span.hidden-value").text();
		// fill in hidden fields
		//	$("input[name=ProductName]").val(productName); 
		$("input[name=secondBenef1]").val(secondBenef1);
		$("input[name=secondBenef2]").val(secondBenef2);
		
		var offerCode1 = $("#offers-list li.selected span.hidden-value").text();
		var productCode1 = $("#products-list li.selected span.hidden-value.productCode").text();
		var productType1 = $("#products-list li.selected span.hidden-value.productType").text();
		var prdChargeDate = $("#products-list li.selected .service-charge-date").text();
		//	$("input[name=OfferProductTypeCode]").val(offerCode1+"|"+productType1+"|"+productCode1);//????????
		
		$("input[name=offerCode]").val(offerCode1);
		$("input[name=ProductId]").val(productCode1);
		$("input[name=ProductCurrency]").val($("#products-list li.selected span.hidden-value.currency").text());
		$("input[name=ProductDescription]").val($("#products-list li.selected a").text());
		$("input[name=ProductType]").val( productType1 );
		$("input[name=nickname]").val($("#account-nickname").val()); 
		
		$("input[name=SetChargeDayAllowedForProduct]").val(prdChargeDate);

		if($("#step-5").hasClass("open")){
			$("input[name=daysOfMonth]").val(daysOfMonth);
			$("input[name=ServiceChargeDay]").val(daysOfMonth);
		}
	}
	
	function destroy_dialogs(){
		$(".cyber-receipt-message:not(#errors-modal), .dialog-message:not(#errors-modal)").dialog("destroy");
		//$(".cyber-receipt-message").dialog("destroy");
	}

});
