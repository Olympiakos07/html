(function($){
	find_account_currency = function(item) {
		var classes_str = item.attr("class");
		var classes_array = classes_str.split(' ');
		for(i=0; i<classes_array.length; i++){
			if(classes_array[i].substring(0,8) == 'currency'){
				var temp = classes_array[i].split('-');
				var currency = temp[1];
			}
		}
		return currency;
	};
	
	
	
})(jQuery);

