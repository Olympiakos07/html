
<%@page import="ebanking.util.Utilities"%>
<%@page import="ebanking.servlets.AJAXServlet"%>
<%@page import="ebanking.util.TimeHandler"%>
<%@page import="ebanking.transaction.framework.Environment"%>
<%@page import="ebanking.util.AppConstants"%>
<%@page import="ebanking.framework.params.WebParams"%>
<%@page import="java.util.Locale"%><%

	String myLocaleStr = "ro_RO";
	Locale locale = (Locale)session.getAttribute(WebParams.userLocale_ses.id());
	if ( locale != null )
		myLocaleStr = locale.toString();
	else
		locale = new Locale(Environment.getDefaultLanguage(), Environment.getDefaultCountry());
		
	TimeHandler th = new TimeHandler();	
	String currentDateFromServer=th.getCurrentDate(locale); //  dd/MM/yyyy
	if (currentDateFromServer.length()==9) currentDateFromServer = "0"+currentDateFromServer;
%>
//this will prevent js to crash on ie when console is used
if(typeof console=='undefined' || typeof console.log=='undefined') var console = { log: function(){} };

var locale = "<%=myLocaleStr%>";
var today_date = "<%=currentDateFromServer%>";
//JS date object for today
var temp_today_date_obj = today_date.split("/");
var today = new Date(temp_today_date_obj[2], temp_today_date_obj[1]-1, temp_today_date_obj[0]);
var month_locale = "<%= AppConstants.MESSAGE_RESOURCES.getMessage(locale,"message.createCyberReceipt.txnRepeatMONTHdesc")%>";
var months_locale = "<%= AppConstants.MESSAGE_RESOURCES.getMessage(locale,"message.createCyberReceipt.txnRepeatMONTHSdesc")%>";
var days_locale = "<%= AppConstants.MESSAGE_RESOURCES.getMessage(locale,"message.createCyberReceipt.txnRepeatDAYSdesc")%>";
var day_locale = "<%= AppConstants.MESSAGE_RESOURCES.getMessage(locale,"message.createCyberReceipt.txnRepeatDAYdesc")%>";
var today_locale = "<%= AppConstants.MESSAGE_RESOURCES.getMessage(locale,"message.usability.common.today")%>";
var tomorrow_locale = "<%= AppConstants.MESSAGE_RESOURCES.getMessage(locale,"message.usability.common.tomorrow")%>";
var loading_locale = "<%= AppConstants.MESSAGE_RESOURCES.getMessage(locale,"message.common.pleaseWait")%>";
var beneficiaries_locale = "<%=AppConstants.MESSAGE_RESOURCES.getMessage(locale,"message.common.beneficiaries")%>";
var img_path = "assets/usability/img/";

var monthNames = [	'<%=Utilities.getValueFromResources(locale, "message.common.January")%>',
				'<%=Utilities.getValueFromResources(locale, "message.common.February")%>',
				'<%=Utilities.getValueFromResources(locale, "message.common.March")%>',
				'<%=Utilities.getValueFromResources(locale, "message.common.April")%>',
				'<%=Utilities.getValueFromResources(locale, "message.common.May")%>',
				'<%=Utilities.getValueFromResources(locale, "message.common.June")%>',
				'<%=Utilities.getValueFromResources(locale, "message.common.July")%>',
				'<%=Utilities.getValueFromResources(locale, "message.common.August")%>',
				'<%=Utilities.getValueFromResources(locale, "message.common.September")%>',
				'<%=Utilities.getValueFromResources(locale, "message.common.October")%>',
				'<%=Utilities.getValueFromResources(locale, "message.common.November")%>',
				'<%=Utilities.getValueFromResources(locale, "message.common.December")%>'
		];
		
var monthNamesShort = [	'<%=Utilities.getValueFromResources(locale, "message.common.JanuaryShort")%>',
				'<%=Utilities.getValueFromResources(locale, "message.common.FebruaryShort")%>',
				'<%=Utilities.getValueFromResources(locale, "message.common.MarchShort")%>',
				'<%=Utilities.getValueFromResources(locale, "message.common.AprilShort")%>',
				'<%=Utilities.getValueFromResources(locale, "message.common.MayShort")%>',
				'<%=Utilities.getValueFromResources(locale, "message.common.JuneShort")%>',
				'<%=Utilities.getValueFromResources(locale, "message.common.JulyShort")%>',
				'<%=Utilities.getValueFromResources(locale, "message.common.AugustShort")%>',
				'<%=Utilities.getValueFromResources(locale, "message.common.SeptemberShort")%>',
				'<%=Utilities.getValueFromResources(locale, "message.common.OctoberShort")%>',
				'<%=Utilities.getValueFromResources(locale, "message.common.NovemberShort")%>',
				'<%=Utilities.getValueFromResources(locale, "message.common.DecemberShort")%>'
		];
		
var dayNames = [
			'<%=Utilities.getValueFromResources(locale, "message.common.Sunday")%>',
			'<%=Utilities.getValueFromResources(locale, "message.common.Monday")%>',
			'<%=Utilities.getValueFromResources(locale, "message.common.Tuesday")%>',
			'<%=Utilities.getValueFromResources(locale, "message.common.Wednesday")%>',
			'<%=Utilities.getValueFromResources(locale, "message.common.Thursday")%>',
			'<%=Utilities.getValueFromResources(locale, "message.common.Friday")%>',
			'<%=Utilities.getValueFromResources(locale, "message.common.Saturday")%>'
		];
		
var dayNamesMin = [
			'<%=Utilities.getValueFromResources(locale, "message.common.Sunday2letter")%>',
			'<%=Utilities.getValueFromResources(locale, "message.common.Monday2letter")%>',
			'<%=Utilities.getValueFromResources(locale, "message.common.Tuesday2letter")%>',
			'<%=Utilities.getValueFromResources(locale, "message.common.Wednesday2letter")%>',
			'<%=Utilities.getValueFromResources(locale, "message.common.Thursday2letter")%>',
			'<%=Utilities.getValueFromResources(locale, "message.common.Friday2letter")%>',
			'<%=Utilities.getValueFromResources(locale, "message.common.Saturday2letter")%>'
		];

//beneficiary ajax validation
function beneficiary_server_validation(id, iban, type){
	var statue = false;
	show_loading(true);
	var result1;
	jQuery.ajax({
      		url: '<%=AJAXServlet.EntryPoint%>',
       		type: 'POST',
       		data: {
				<%=WebParams.ajaxServletMethod.id() %>: '<%=AJAXServlet.Operations.validateToAccountField%>',
				<%=WebParams.beneficiaryAccount.id()%>: iban,
				<%=WebParams.transactionType.id()%>: 	type
			},
			dataType: 'json',
       		async: false,
       		cache: false,
       		timeout: 5000,
       		error: function() {
       			var result = {
					"currency": "",
					"iban": iban,
					"isValid": "0",
					"isUtilityCompanyAccount": false
				};
				result1 = result;
			},
       		success: function(jsObj) {
       			var isValid = jsObj.isValid;
				var ccy = jsObj.currency;
				var errorMsg = jsObj.errorMsg;
				var ibanFormat = jsObj.iban;
				var isUtilityCompanyAccount = jsObj.isUtilityCompanyAccount;
				
				var result = {
					"currency": ccy,
					"iban": ibanFormat,
					"isValid": isValid,
					"isUtilityCompanyAccount": isUtilityCompanyAccount
				};
				
				result1 = result;
			}
	});
	remove_loading();
	return result1;
}

	function get_converted_amount(item, currency1, currency2, amount1, amount2, fromAccountCurrency, toAccountCurrency){
		var entryPoint = '<%=AJAXServlet.EntryPoint%>';
	
		jQuery.ajax({
      		url: entryPoint,
       		type: 'POST',
       		data: {
				<%=WebParams.ajaxServletMethod.id()%>: '<%=AJAXServlet.Operations.calcConvertedAmount%>', 
				<%=WebParams.fromAccountCurrency.id()%>: fromAccountCurrency,
				<%=WebParams.toAccountCurrency.id()%>: toAccountCurrency,
				currency1: currency1, 
				currency2: currency2, 
				amount1: amount1,
				amount2: amount2
			},
			dataType: 'json',
       		async: false,
       		cache: false,
       		timeout: 5000,
       		error: function() {
				remove_loading();
			},
       		success: function(jsObj) {
				var convAmount = jsObj.convertedAmount;
				converter.convertRequestResult(item, convAmount);
			}
		});
	}

//This function is used to redirect to a url through the controller.
function redirect(url) {
	
	if (url != ''){
		var questionMarkIndex = url.indexOf('?');
		var searchString = "";
		if (questionMarkIndex >= 0){
			searchString = url.substring(questionMarkIndex + 1);
		}
		var params = getUrlParams(searchString);
	    // The rest of this code assumes you are not using a library.
	    // It can be made less wordy if you use one.
	    var form = document.createElement("form");
	    form.setAttribute("method", "post");
	    form.setAttribute("action", "Controller");
	
	    for(var key in params) {
	        if(params.hasOwnProperty(key)) {
	            var hiddenField = document.createElement("input");
	            hiddenField.setAttribute("type", "hidden");
	            hiddenField.setAttribute("name", key);
	            hiddenField.setAttribute("value", params[key]);
	
	            form.appendChild(hiddenField);
	         }
	    }
	
	    document.body.appendChild(form);
	    form.submit();
	}
}

//This is a function that parses an href search string and returns a map containing key/value pairs of the parameters.
function getUrlParams(url) {
    return getUrlParams(url, false);
}

//This is a function that parses an href search string and returns a map containing key/value pairs of the parameters.
//The following assumptions are made about the url, in order for the function to work properly:
//1) 	The parameters in the search string are in the format (variable name)=(variable value) without the parenthesis and separated by the character '&'.
//2) 	The (variable name) part does not contain the ambersand character'&'.
//3) 	The (variable value) part may contain the ambersand character'&' any number of times.

function getUrlParams(url, decodeParams) {
    var paramPair
        ,additionRegex = /\+/g  // Regex for replacing addition symbol with a space
        ,paramRegex = /(([^&=]+)=?([^&]*))|&/g	//Regex that matches either to a parameter pair or an ambersand
        ,validParamRegex = /([^&=]+)=([^&]*)/g	//Regex that matches only to a valid parameter pair
        ,decode = function (s) { return decodeURIComponent(s.replace(additionRegex, " ")); };
        //,decode = function (s) { return decodeURIComponent(s); };
	var urlParams = {};
	var prevMatchPart = "";
	var ambersands = "";
	var paramPairs = {};
	var counter = -1;
	//first get the param pairs from the url
	while (paramPair = paramRegex.exec(url)){
		if (paramPair[0] == "&"){//if the match was the ambersand
	 		ambersands += "&";	//add it to a temp string. It will be either added to the param pair's value, or ignored, if it is a param separator ambersand
	 	}
	 	else if (paramPair[0].match(validParamRegex)){//if the match was a valid param pair
	 		if (ambersands != ""){//check if there is a sequence of ambersands that have not been added yet to the previous pair. If so, add them now, except for the last one (separator).
	 			paramPairs[counter][0] += ambersands.substring(1);
	 			paramPairs[counter][3] += ambersands.substring(1);
	 			ambersands="";
	 		}
	 		paramPairs[++counter] = paramPair;	//add the valid param pair to the map
	 	}
	 	else{//fragment match that is not a valid param pair (e.g. the part " Spencer" of the param pair 'name="Marks & Spencer"'). It should be added to the previous valid pair.
	 		
		 	paramPairs[counter][0] += ambersands + paramPair[0];
		 	paramPairs[counter][3] += ambersands + paramPair[0];
		 	ambersands = "";
	 	}
	}
	
	//Add to the last param value the ambersands that may exist in the buffer string
	if (counter >= 0){
		paramPairs[counter][0] += ambersands;
		paramPairs[counter][3] += ambersands
	}
	
	//now create the params map
	var paramPair = {};
    for (var i=0; i<=counter; i++){
    	paramPair = paramPairs[i];
    	if (decodeParams) {
    		urlParams[paramPair[2]] = decode(paramPair[3]);
    	}
       else{
       		urlParams[paramPair[2]] = paramPair[3];
       }
    }
    return urlParams;
}