jQuery(document).ready(function() {
	
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
});
