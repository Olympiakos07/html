var graphTooltipMarkup;
var plotOptions;

function dialog_clicked(id, index, old_index){
	if(id == "show-in-currency-dialog"){
		if($(".graph-manager").hasClass("open")){
			show_loading();
			getGraphData($("#" + id + " li:eq(" + index + ") .value").text().trim());
		}
	}
}

/**
 * redraws the plot with the data by the ajax request
 * @param  {[type]} points [description]
 * @return {[type]}        [description]
 */
function redrawPlot(points){
	plotOptions = createPlotOptions(points[0][0], points[points.length-1][0]);
	/*var temp = [];
	for(var i = 0, len = points.length; i < len; i++) {
		temp[i] = points[i][1];
	};
	var min = Array.min(temp);
	var max = Array.max(temp);
	//plotOptions.axes.yaxis.min = min;
	if(min == max){
		//plotOptions.axes.yaxis.max = min + 1;	
	}else{
		//plotOptions.axes.yaxis.max = max;
	}*/
	$.jqplot ('account-graph', [points], plotOptions).replot();
	remove_loading();
}

/**
 * Creates an object with the plot options
 * @param  {string} startDate The plot start date string (e.g. 2012-03-17)
 * @param  {string} endDate   The plot end date string
 * @return {object}           
 */
function createPlotOptions(startDate, endDate){
	plotOptions = {
		axesDefaults:	{
		},
		axes:{
			xaxis:{
				renderer:$.jqplot.DateAxisRenderer, 
				// tickOptions:{formatString:'%b %#d, %y'},
				tickOptions:{formatString:'%b %#d'},
				min: startDate,
				max: endDate,  
				tickInterval:'5 day'
			},
			yaxis: {
				autoscale: false,
				tickOptions: {formatString:'%d', formatter: $.jqplot.amountFormatter},
				pad: 1.3
			}
		},
		highlighter: {
			show: true,
			sizeAdjust: 7.5,
			showTooltip: true,
			tooltipAxes: 'both',
			yvalues: 3,
			//tooltipFormatString: '%.5P',
			formatString: graphTooltipMarkup.replace("date", "%s").replace("number1", "%s").replace("number2", "%s").replace("number3", "%s")
		},
		cursor: {
			show: false
		},
		grid: 	{
			shadow: false,
			background: "#fff",
			borderColor: "#b6b6b6",
			borderWidth: "0",
			gridLineColor: "#fafafa"
		},
		seriesDefaults: 	{
			color: "#f3f900",
			shadow: true,

			markerOptions: 	{
				style: "circle",
				color: "#6d6d6d",
				shadow: true
			}
		}
	}

	return plotOptions;
}

$(document).ready(function(){
	

	/**
	 * Resizes the amounts font on the dashboard header to not destroy the design
	 * @param  {HTMLElement} selector The amount to resize
	 */
	function resize_amounts_font(selector){
		var length = $(selector).val().length;
		if(length > 15 && length < 17){
			$(selector).css("font-size", "13px");
		}else if(length >= 17 && length <= 19){
			$(selector).css("font-size", "12px");
		}else if(length > 19){
			$(selector).css("font-size", "11px");
		}else{
			$(selector).css("font-size", "12px");
		}
	}

	for(var i=0; i<3; i++){
		resize_amounts_font($("#account-overview .amount-"+i));
	}

	/**
	 * Graph
	 */
	
	//the markup used for the tooltip of the graph
	//date, number1, number2, number3 are special values that are replaced by the real ones
	graphTooltipMarkup = "<strong>date</strong><div class='title'><span class='left'>" + $("#account-overview li:first span:not(.hidden)").text() + ": </span><strong class='right'>number1</strong></div><div class='title'><span class='left'>" + $("#account-overview li:eq(2) span:not(.hidden)").text() + ": </span><strong class='right'>number2</strong></div><div class='title'><span class='left'>" + $("#account-overview li:eq(1) span:not(.hidden)").text() + ": </span><strong class='right'>number3</strong></div>";

	//check if we will display the graph, and its button
	if($("#graph .has-graph").text() == "true"){
		if($("#graph .hide-graph").text() == "false"){
			$(".graph-manager").text($("#graph .hide-text").text()).addClass("open");
			getGraphData($(".selector .current-value").text(), false);
		}else{
			$(".graph-manager").text($("#graph .show-text").text());
		}
	}else{
		$(".graph-manager").css("display", "none");
	}

	$(".graph-manager").on("click", function(){
		if($(this).hasClass("open")){
			$("#account-graph").slideUp();
			$(this).removeClass("open");
			$(this).text($(".hidden.show-text").text());
			getGraphData("", true);
		}else{
			$("#account-graph").slideDown();
			$(this).addClass("open");
			$(this).text($(".hidden.hide-text").text());
			show_loading();
			setTimeout(function(){getGraphData($(".selector .current-value").text(), false)}, 500);
		}
	});

	/**
	 * jqplot amount formatter
	 * @param  {string} format 
	 * @param  {number} value  The number to format
	 * @return {string}        The formatted amount
	 */
	$.jqplot.amountFormatter = function (format, value) {
		var negative = false;
		if(value < 0){
			negative = true;
		}
		//its a number, so backend always sends numbers with .
		if(locale == "en_US"){
			value = value.toString();
		}else{
			value = value.toString().replace(".", ",");			
		}
		//if it has no decimals, dont add them (most probably yaxes values apply to this)
		var noDesimals = false;
		if(value.indexOf(".") == -1 && value.indexOf(",") == -1){
			noDesimals = true;
		}
		value = format_amount(value);
		if(noDesimals){
			value = value.split(decimal_separator)[0];
		}
		//if its negative number, add -
		if(negative){
			value = "-" + value;
		}
		return value;
	};

	//=====EVENTS=====//

	// on currency change
	$("#show-in-currency-dialog li").click(function(){
		currency_change.on_change($(this).find(".value").text().trim());
	});

	var currency_change = {
		
		on_change: function(currency){
			for(var i=0; i<3; i++){
				var amount = $(".amount-"+i).parent().find(".amount-"+currency).text();
				$("#account-overview .amount-"+i).text(currency + " " + amount);
				resize_amounts_font($("#account-overview .amount-"+i));
			}
    	},

	};

	$(".icon.view").live("click", function() {
		var i = $(this).find(".index").text();
		var transId = $(this).find(".transaction-id").text();
		var nextPage = $(this).find(".next-page").text();
		go2verify(i, transId, nextPage, 'displayActive');
	});
	$(".icon.delete").live("click", function() {
		var i = $(this).find(".index").text();
		var transId = $(this).find(".transaction-id").text();
		var nextPage = $(this).find(".next-page").text();
		go2verify(i, transId, nextPage, 'deleteActive');
	});

	function go2verify(i, transId, nextPage, actionFlag) {
		$("input[name=actionFlag]").val(actionFlag);
		$("input[name=transactionListIndex]").val(i);
		$("input[name=fromTransactionID]").val(transId);
		$("input[name=nextPage]").val(nextPage);
		document.forms[0].submit();
	}	
	
});
