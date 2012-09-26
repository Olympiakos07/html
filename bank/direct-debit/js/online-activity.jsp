<% 	
	java.util.Locale locale = (java.util.Locale) session.getAttribute("userLocale");
%>
<%@page import="ebanking.framework.params.WebParams"%>
<%@page import="ebanking.servlets.AJAXServlet"%>
<%@page import="ebanking.util.AppConstants"%>
<%@page language="java" contentType="text/javascript; charset=UTF-8"%>

$(document).ready(function() {

	//fill in predefined dates for start date and end date
	
	if($("span.restoredState").text() == ""){
		$("#start-date").val(one_month_back_date);
		$("#end-date").val(today_date);
	}
	
	//show/hide filters button
	$("#filters-trigger").click(function(){
		if($(this).hasClass("open")){
			$(this).parent().parent().next().slideUp();
			$(this).removeClass("open");
			$(this).text('<%=AppConstants.MESSAGE_RESOURCES.getMessage(locale, "message.common.showFilters")%>');
		}else{
			$(this).parent().parent().next().slideDown();
			$(this).addClass("open");
			$(this).text('<%=AppConstants.MESSAGE_RESOURCES.getMessage(locale, "message.common.hideFilters")%>');
			scroll.list(300);
		}
	});

	//hide all beneficiary lists
	$(".parties").css("display", "none");
	//show first
	$(".parties:first").css("display", "block");
	//preselect the first (any) item in all lists
	$(".parties").each(function(){
		$(this).children("li:first").addClass("selected");
	});

	//=====SET UP TRANSACTION TYPES LISTS=====//
	//create the all list
	//first create an array and fill it with all elements froms all lists
	var list = [];
	$(".select-transaction-type").each(function(){
		var i = 0;
		$(this).children("li").each(function(){
			//var html = $(this).html();
			var html = $('<div></div>').append($(this).clone()).remove().html();
			if(i != 0){
				list.push(html);
			}
			i++;
		});
	});

	//now create the final html from the above array
	var final_html = '<ul id="types-all" class="select-transaction-type list medium open save-state save-visibility save-trigger event-click on-document-ready" tabindex="4"><li class="all"><a href="javascript:void(0);">All Transactions</a><span class="hidden hidden-value"></span></li>';
	for(i=0; i < list.length; i++){
		final_html += list[i];	
	}
	//finish it
	final_html += "</ul>";

	//and add it
	$(final_html).insertBefore("ul#types-0");
	
	//find the All Transactions value
	$("#types-all li:first .hidden-value").text($("#types-0 li:first .hidden-value").text());

	//hide all lists
	$(".select-transaction-type").hide();

	//preselect the first (all) item in all lists
	$(".select-transaction-type").each(function(){
		$(this).children("li:first").addClass("selected");
	});
	
	//show the preselected one
	//find it first
	var counter = 0;
	var selected_id = 0;
	$('.select-transaction-category li').each(function(){
		if($(this).hasClass("selected")){
			selected_id = counter;
		}
		counter++;
	});
	//now show it
	$("ul.select-transaction-type:eq(" + selected_id + ")").show();
	
	if($("span.restoredState").text() != ""){
		setTimeout("restore_state($('span.restoredState').text())", 1000);
	}
	
	//split ibans
	$("#beneficiary-list .list li:not(.any-type) a").children("span").each(function(){
		$(this).text(split_iban($(this).text()));
	});
	
	//=====EVENTS=====//
	$(".select-transaction-category li").click(function(event){
		//show transaction types logic
		var temp = $(this).attr("id").split("-");
		var id = temp[1];
		var item = $("ul#types-"+id);

		if(!item.is(":visible")){
			//hide all
			$(".select-transaction-type").addClass("closed").fadeOut(300);
			//show the specific one
			//but first select the first li
			$("ul#types-"+id).children("li.selected").removeClass("selected");
			$("ul#types-"+id).children("li:first").addClass("selected");
			$("ul#types-"+id).removeClass("closed").delay(300).fadeIn(300);
		}
		manage_beneficiary_list(event);
	});

	$(".select-transaction-type li").live("click", function(event){
		manage_beneficiary_list(event);
	});

	//checks the selected type, and does show the correct beneficiary list
	//and the correct items in that list
	function manage_beneficiary_list(event){
		//those variables are used when the selected has class all (type=all)
		var show_list = false;
		var show_account = false;
		var show_name = false;

		if(event.restore){
			var selected_type = $(event.selector).children("li.selected");
		}else{
			var selected_type = $(".select-transaction-type:not(.closed) li.selected");
		}

		//find the selected type class
		var type = selected_type.attr("class").replace("beneficiary-list", "").replace("beneficiary-account", "").replace("beneficiary-name", "").replace("selected", "").replace("on-document-ready", "").replace(/ /g, "");

		//make the correct list visible
		var item;
		if(type == "ram"){
			item = $("#predefined-beneficiaries-ram-fund");
		}else if(type == "billpayment"){
			item = $("#predefined-beneficiaries-utility-company");
		}else{
			item = $("#predefined-beneficiaries-all");
			if(type == "all"){
				selected_type.parent().children("li").each(function(){
					if($(this).hasClass("beneficiary-list") == true && $(this).hasClass("ram") == false && $(this).hasClass("billpayment") == false){
						show_list = true;
					}
					if($(this).hasClass("beneficiary-account")){
						show_account = true;
					}
					if($(this).hasClass("beneficiary-name")){
						show_name = true;
					}
				});
			}
			//if we found type, filter all list
			//close all li first
			$("#predefined-beneficiaries-all li").each(function(){
				if($(this).is(":visible")){
					$(this).slideUp();
				}else{
					$(this).hide();
				}
				
			});
			//show li only of this type
			$("#predefined-beneficiaries-all li").each(function(){
				if($(this).hasClass(type) == true || $(this).hasClass("any-type") == true || type == "all"){
					$(this).slideDown();
				}
			});
		}

		//finally, show/hide the beneficiary filters
		if(selected_type.hasClass("beneficiary-list") == true || show_list == true){
			if(!item.is(":visible")){
				$(".parties").css("display", "none");
				item.css("display", "block");

				$("fieldset.beneficiary-filter.beneficiary-list").slideDown().addClass("open");
			}
		}else{
			if(event.restore){
				$("fieldset.beneficiary-filter.beneficiary-list").css("display", "none").removeClass("open");
			}else{
				$("fieldset.beneficiary-filter.beneficiary-list").slideUp().removeClass("open");
			}
		}
		if(selected_type.hasClass("beneficiary-account") == true || show_account == true){
			$("fieldset.beneficiary-filter.beneficiary-account").slideDown().addClass("open");
		}else{
			if(event.restore){
				$("fieldset.beneficiary-filter.beneficiary-account").css("display", "none").removeClass("open");
			}else{
				$("fieldset.beneficiary-filter.beneficiary-account").slideUp().removeClass("open");
			}
		}
		if(selected_type.hasClass("beneficiary-name") == true || show_name == true){
			$("fieldset.beneficiary-filter.beneficiary-name").slideDown().addClass("open");
		}else{
			if(event.restore){
				$("fieldset.beneficiary-filter.beneficiary-name").css("display", "none").removeClass("open");
			}else{
				$("fieldset.beneficiary-filter.beneficiary-name").slideUp().removeClass("open");
			}
		}
	}
	
	//show/hide beneficiary inputs if the user changes from any beneficiary
	$(".parties li").click(function(event){
		if(event.restore == false){
			//reset them 
			$("#input-beneficiary-account").val("");
			$("#input-beneficiary-name").val("");
		}
		if($(this).hasClass("any-type") && $(this).hasClass("beneficiary-account") && $(this).hasClass("beneficiary-name")){
			$(".beneficiary-filter.beneficiary-account").slideDown();
			$(".beneficiary-filter.beneficiary-name").slideDown();
		}else{
			//if by restore, slide up does not work
			if(event.restore){
				$(".beneficiary-filter.beneficiary-account").css("display", "none");
				$(".beneficiary-filter.beneficiary-name").css("display", "none");
			}else{
				$(".beneficiary-filter.beneficiary-account").slideUp().removeClass("open");
				$(".beneficiary-filter.beneficiary-name").slideUp().removeClass("open");
			}
		}
	});

	$('form ul, form .dsq-dialog-container').keypress(function(e){
		if(e.which == 13){
			$("form").submit();
		}
	});

	//=====VALIDATIONS=====//
	var submit_status = true;

	//ajax validation, if iban exists
	$("#input-beneficiary-account").blur(function(){
		var beneficiary_account = $("#input-beneficiary-account").val();
		if(beneficiary_account != ""){
			// if we selected transaction type 0111, or 0113 or 0114, then validate beneficiary account
			var transaction_type = $(".select-transaction-type:visible li.selected span.hidden-value").text();
			if(transaction_type == "0111" || transaction_type == "0113" || transaction_type == "0114"){
				var validations = [
					[$("#input-beneficiary-account"), "valid_iban", "invalid_iban_error_message"]
				];
		
				var validator = new Validator();
				var status = validator.validate(validations, false, true);

				if(status == true){
					show_loading(true);
					$.post('<%=AJAXServlet.EntryPoint%>',
						{
						 <%=WebParams.ajaxServletMethod.id() %> : '<%=AJAXServlet.Operations.isAccountFormatValidFor0111%>',
						 <%=WebParams.beneficiaryAccount.id() %>: beneficiary_account
						},
						function(data) {
							if(data == "1"){
								submit_status = true;
							}else{
								submit_status = false;
								validator.displayError($("#input-beneficiary-account"), "invalid_iban", "invalid_iban_error_message");
							}
							remove_loading();
						}, 
						"html"
					);
				}else{
					submit_status = false;
				}
			}
		}
	});

	$("form").submit(function(){
		//console.log("submit_status="+submit_status);
		//if the field is not visible, cancel the validation
		if(!$("#input-beneficiary-account").is(":visible")){
			submit_status = true;
		}
		
		//console.log("submit_status="+submit_status);

		if($("span.validation-error").length != 0)
			submit_status = false;

		if(submit_status == true) {
			save_state();
			//fill in the hidden fields
			create_hidden_fields();
			//disable_submit();
			show_loading(false);
		}

		return submit_status;
	});

	//=====CREATE HIDDEN FIELDS=====//
	function create_hidden_fields(){
		//find values
		var FromDate = $("#start-date").val();
		var ToDate = $("#end-date").val();
		var trans_type = $(".select-transaction-type:visible li.selected").find("span.hidden-value").text();
		var OriginatingChannel = $("#select-channel li.selected").find("span.hidden-value").text();
		var BeneficiaryPredefined = $(".parties:visible li.selected").find("span.hidden-value.id").text();
		var status = $("#select-status li.selected").find("span.hidden-value").text();
		
		var beneficiaryAccount= '';
		if($("#input-beneficiary-account").is(":visible")){
			beneficiaryAccount = $("#input-beneficiary-account").val();
		}
		var beneficiaryName = '';
		var matchingMethod = 'Contains';
		if($("#input-beneficiary-name").is(":visible")){
			beneficiaryName = $("#input-beneficiary-name").val();
			matchingMethod = $("#select-beneficiary-search-type li.selected").find("span.hidden-value").text();
		}
		
		var categCode = $(".select-transaction-category li.selected").find("span.hidden-value").text();
		
		// fill in hidden fields
		$("input[name=FromDate]").val(FromDate);
		$("input[name=ToDate]").val(ToDate);
		$("input[name=trans_type]").val(trans_type);
		$("input[name=OriginatingChannel]").val(OriginatingChannel);
		$("input[name=BeneficiaryPredefined]").val(BeneficiaryPredefined);
		$("input[name=TranStatus]").val(status);
		$("input[name=BeneficiaryAccount]").val(beneficiaryAccount);
		$("input[name=BeneficiaryName]").val(beneficiaryName);
		$("input[name=MatchingMethod]").val(matchingMethod);
		$("input[name=CategCode]").val(categCode);
	}

})



//Custom methods
	function crButton_onclick(href,idx){
		var entryPoint = '<%=AJAXServlet.EntryPoint%>';
		var operation = '<%=AJAXServlet.Operations.sessionSummaryGetCyberReceipt%>';
		var conversationId = $('input[name=conversationId]').val();
		var crLink = href;
		
		show_loading(true);
	
		jQuery.ajax({
	        url: '<%=AJAXServlet.EntryPoint%>',
	        type: 'POST',
	        data: {
				<%=WebParams.ajaxServletMethod.id()%>:	operation,
				crLink:									crLink,
				conversationId:							conversationId
			},
			dataType: 'json',
	        async: false,
	        cache: false,
	        timeout: 30000,
	        error: function(){
				remove_loading();
			},
	        success: function(data){
					var crfilename = data.crfilename;
					var errorDescr = data.errorDescr;
					var OthrCRfrmt = data.otherCyberReceiptFormatFlag;
					var nextPage = 'GetCR';
					if(errorDescr == ''){
						//alert('no error');
						crButton_success(href,idx,data);
					}else{
						////alert('yes error');
						//$("#cyber-receipt-message").css('display', 'none');
					}
					remove_loading();
			}
	    });
/*		
		$.post(
				entryPoint,
				{operation:operation, conversationId:conversationId, crLink:crLink},
				function(data){
					var crfilename = data.crfilename;
					var errorDescr = data.errorDescr;
					var OthrCRfrmt = data.otherCyberReceiptFormatFlag;
					var nextPage = 'GetCR';
					if(errorDescr == ''){
						//alert('no error');
						crButton_success(href,idx,data);
					}else{
						alert('yes error');
						//$("#cyber-receipt-message").css('display', 'none');
					}
				}, 
				"json"
		);	
*/
	}
	
	function crButton_success(href,idx,data){
		var cr_window = "modal-"+idx;
		
		var link_html 		= $('#'+cr_window +' a:eq(0)');
		var link_paym_ord 	= $('#'+cr_window +' a:eq(1)');
		var link_dpe 		= $('#'+cr_window +' a:eq(2)');
		
		$('#'+cr_window +' a').attr('target', '_blank');
		
		var href_html = 'GetCR?nextPage=GetCR&crfilename='+data.crfilename;
		link_html.attr('href', href_html);
		
		var displayOtherCRs = data.displayOtherCRs;
		if(displayOtherCRs == 'false'){
//			if (link_paym_ord.length > 0){
//				link_paym_ord.attr('href', 'javascript:void(0)');
//				link_paym_ord.hide();
//			}
//			if (link_dpe.length > 0){
//				link_dpe.attr('href', 'javascript:void(0)');
//				link_dpe.hide();
//			}
		}
		else{
			if (link_paym_ord.length > 0){
				link_paym_ord.show();
			}
			if (link_dpe.length > 0){
				link_dpe.show();
			}
		}
	}
	
<%--GIV:20120110:Usability:SecureEmail:Function has been moved to settings.jsp
function changePage(page)
{
	show_loading();
	
	jQuery.ajax({
        url: '<%=AJAXServlet.EntryPoint%>',
        type: 'POST',
        data: {
			<%=WebParams.ajaxServletMethod.id()%>: '<%=AJAXServlet.Operations.getSessionSummaryResultPages%>',
			goToPage : page,
			conversationId : $('input[name=conversationId]').val()
		},
		dataType: 'html',
        async: false,
        cache: false,
        timeout: 30000,
        error: function(){
			remove_loading();
			auto_size_height($("#main").height(), $("#side").height(), 0, 1);
		},
        success: function(data){
	        jQuery('#TheTxnsList').html(data);
	        remove_loading();
	        auto_size_height($("#main").height(), $("#side").height(), 0, 1);
		}
    });
}
--%>