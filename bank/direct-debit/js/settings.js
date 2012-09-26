// This will prevent js to crash on IE when cosnole is used
if (typeof console == "undefined" || typeof console.log == "undefined") var console = { log: function() {} }; 

var locale = "en_US";
// var locale = "ro_RO";

//the following must be commented out and replaced by server date calculation
var today = new Date();
var today_day = today.getDate();
if(today_day < 10){
	today_day_full = '0' + today_day;
}else{
	today_day_full = today_day;
}
var today_month = today.getMonth() + 1;
if(today_month < 10){
	today_month_full = '0' + today_month;
}else{
	today_month_full = today_month;
}

var today_date = today_day_full + '/' + today_month_full + '/' + today.getFullYear();
//today_date = DATE_BY_JAVA_HERE

var month_locale = "Month";
var months_locale = "Months";
var days_locale = "Days";
var day_locale = "Day";
var today_locale = "Today";
var tomorrow_locale = "Tomorrow";
var loading_locale = "Please wait while proccessing...";
var beneficiaries_locale = "beneficiaries";
var img_path = "../img/";

var monthNames = ['January', 'February', '2March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var monthNamesShort = ['Jan', 'Feb', '2Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var dayNames = ['Sunday', 'Monday', '2Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var dayNamesMin = ["Su", "Mo", "2Tu", "We", "Th", "Fr", "Sa"];

//beneficiary ajax validation
function beneficiary_server_validation(id, iban){
	//this is a dummy request and must be replaced with the actual below

	var result = {
		"currency": "GBP",
		"iban": iban
	};
	return result;

	/*
	show_loading();
	$.post('<%=AJAXServlet.EntryPoint%>',
		{
		<%=WebParams.ajaxServletMethod.id() %>: '<%=AJAXServlet.Operations.validateToAccountField%>',
		<%=WebParams.beneficiaryAccount.id()%>: iban,
		<%=WebParams.transactionType.id()%>:    page_type
		},
		function(jsObj) {
			var isValid = jsObj.isValid;
			var ccy = jsObj.currency;
			var errorMsg = jsObj.errorMsg;
			var iban = jsObj.iban;
			if(isValid == "1"){
				var result = {
					"currency": ccy,
					"iban": iban
				};
			}else{
				var result = {
					"currency": "",
					"iban": iban
				};
			}

			remove_loading();
			return result;
		},
		"json"
	);*/
}

function get_converted_amount(item, currency1, currency2, amount1, amount2, fromAccountCurrency, toAccountCurrency){

	var result = "1,409.34";
	converter.convertRequestResult(item, result)

}