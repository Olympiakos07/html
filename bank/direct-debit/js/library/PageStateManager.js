/**
 * Save State
 * Saves the current state of all ids on the page
 * 
 * works by saving a big string that contains 3 values for each field
 * saves id, type, state
 * 
 * Finally saves it into a string to submit it to the server
 */
function save_state(){
	var str = "";
	$("form input[type=text].save-state, form textarea.save-state").each(function(){
		var id = "#" + $(this).attr("id");
		str += id + "|input|" + $(this).val().replace(/"/g, '&quot;') + "~";
	});
	$("form span.save-state").each(function(){
		var id = "#"+ $(this).attr("id");
		str += id + "|span|" + $(this).text().replace(/"/g, '&quot;') + "~";
	});
	$("form div.save-state").each(function(){
		var id = "#"+ $(this).attr("id");
		str += id + "|div|" + $(this).text().replace(/"/g, '&quot;') + "~";
	});
	$("form a.save-state").each(function(){
		var id = "#"+ $(this).attr("id");
		str += id + "|a|" + $(this).text().replace(/"/g, '&quot;') + "~";
	});
	$("form .save-disable").each(function(){
		var id = "#"+ $(this).attr("id");
		if($(this).attr("disabled") === undefined){
			str += id + "|disable|false~";
		}else{
			str += id + "|disable|" + $(this).attr("disabled") + "~";
		}
	});
	$("form .save-html").each(function(){
		var id = "#"+ $(this).attr("id");
		str += id + "|html|" + $(this).html().replace(/"/g, '&quot;') + "~";
	});
	$("form input[type=checkbox].save-state").each(function(){
		var id = "#" + $(this).attr("id");
		str += id + "|checkbox|" + $(this).is(":checked") + "~";
	});
	$("form .list.save-state").each(function(){
		var id = "#" + $(this).attr("id");
		str += id + "|list|" + $(this).find(".selected").index() + "~";
		str += id + "|scroll|" + $(this).scrollTop() + "~";
	});
	$("form .dsq-dialog.save-state").each(function(){
		var id = "#"+ $(this).attr("id");
		str += id + "|dsq-dialog|" + $(this).find(".selected").index() + "~";
	});
	$("form .slider.save-state").each(function(){
		var id = "#"+ $(this).attr("id");
		str += id + "|slider|" + $("#createTimeDeposit-duration-slider").slider("option", "value") + "~";
	});
	$("form .save-class").each(function(){
		var id = "#" + $(this).attr("id");
		str += id + "|class|" + $(this).attr("class") + "~";
	});
	$("form .save-visibility").each(function(){
		var id = "#" + $(this).attr("id");
		str += id + "|visibility|" + $(this).css("display") + "~";
	});
	$("form .save-trigger").each(function(){
		var id = "#" + $(this).attr("id");
		if($(this).hasClass("event-click")){
			var event_type = "click";
		}
		str += id + "|trigger|" + event_type + "~";
	});
	$('form .save-children').each(function(){
		var id  = "#" + $(this).attr('id');
		var children = '';
		$(this).children().each(function(){
			children += '#' + $(this).attr('id');
		});
		str += id + '|save-children|' + children + '~';
	});

	str = str.substring(0, str.length-1);
	// console.log(str);
	$("input[name=restoredState]").val(str);
}

/**
 * State restore
 * 
 * NEEDS ADDITIONAL DOCUMENTATION!!!!!!!
 */
var ajax_states = {};
var selectors = [];
var visibility_selectors = [];
var visibility_states = [];
var event_counter = 0;
var visibility_counter = 0;
var is_restore = false;
function restore_state(str){
	is_restore = true;
	show_loading(true);
	var rules = str.split("~");
	for(i=0; i<rules.length; i++){
		var rule = rules[i].split("|");
		var selector = rule[0];
		var type = rule[1];
		var state = rule[2];

		if(type == "visibility"){
			visibility_selectors.push(selector);
			visibility_states.push(state);
			$(function(){
				//$(selector).addClass("hidden");
				// console.log("selector="+visibility_selectors[visibility_counter]+", state="+visibility_states[visibility_counter]);
				$(visibility_selectors[visibility_counter]).css("display", visibility_states[visibility_counter]);

				if(visibility_states[visibility_counter] != "none"){
					$(visibility_selectors[visibility_counter]).addClass("open");
				}
				visibility_counter++;
			});
		}else if(type == "input"){
			if(state != ""){
				state = state.replace(/&quot;/g, '"');
				if($(selector).hasClass("state-by-ajax") || $(selector).length === 0 ){
					var id = selector.substring(1, selector.length);
					ajax_states[id] = state;
				}else{
					$(selector).val(state);
				}
				if($(selector).next().find(".chars-remaining").length != 0){
					if(! charCounters){
						var charCounters = new CharCounters();
					}
					charCounters.update([selector.substr(1)]);
				}
			}
		}else if(type == "span"){
			if(state != ""){
				$(selector).text(state.replace(/&quot;/g, '"'));
			}
		}else if(type == "disable"){
			if(state == "false"){
				$(selector).removeAttr("disabled");
			}else{
				$(selector).attr("disabled", "disabled");
			}
		}else if(type == "html"){
			if(state != ""){
				$(selector).html(state.replace(/&quot;/g, '"'));
			}
		}else if(type == "class"){
			if(state != ""){
				$(selector).attr("class", state);
			}
		}else if(type == "div"){
			if(state != ""){
				$(selector).text(state.replace(/&quot;/g, '"'));
			}
		}else if(type == "a"){
			if(state != ""){
				$(selector).text(state.replace(/&quot;/g, '"'));
			}
		}else if(type == "checkbox"){
			if(state == "true"){
				$(selector).attr("checked", true);
			}else{
				$(selector).removeAttr("checked");
			}
		}else if(type == "list"){
			if(state != "" && state != "-1"){
				$(selector).children("li").removeClass("selected")
				if($(selector).hasClass("state-by-ajax")){
					var id = selector.substring(1, selector.length);
					ajax_states[id] = state;
				}else{
					$(selector).children("li:eq("+state+")").addClass("selected");
					//$(selector).scrollTop($(selector + " li.selected").index() * $(selector + " li.selected").outerHeight());
				}
			}
			//console.log("list - s="+selector+" t="+type+" s="+state);
		}else if(type == "scroll"){
			if(state != ""){
				$(selector).scrollTop(state);
				//also save it
				var id = selector.substr(1);
				scroll.add({id: id, scroll: state});
			}
		}else if(type == "dsq-dialog"){
			//console.log("dialog - s="+selector+" t="+type+" s="+state);
			if(state != "" && state != "-1"){
				//set selected
				$(selector).children("li").removeClass("selected")
				$(selector).children("li:eq("+state+")").addClass("selected");
				//set text
				if($(selector).children("span").length > 0){
					var receiver = $(selector).parent().prev().children("span");
				}else{
					var receiver = $(selector).parent().prev();
				}
				//console.log("r="+receiver.text());
				var value = $(selector).find("li.selected").children("*:not(.hidden-value)").text();
				//console.log("t="+value);
				receiver.text(value);
			}
		}else if(type == "slider"){
			//console.log("s="+selector+" t="+type+" s="+state);
			if($(selector).hasClass("state-by-ajax")){
				var id = selector.substring(1, selector.length);
				ajax_states[id] = state;
			}else{
				$(selector).slider("option", "value", state);
			}
		}else if(type == "trigger"){
			if($(selector).children("li.selected").length > 0 && ($(selector).hasClass("hidden") == false || $(selector).css("display") == "none")){
				//console.log("s="+selector+" t="+type+" s="+state);
					/*if(selector == "#types-all"){
				$(function(){
						$("#types-all li:first").click();
						$("#predefined-beneficiaries-all li:eq(1)").click();
				});
					}*/
				if($(selector).css("display") != "none" || $(selector).hasClass("dsq-dialog")){
					// alert($(selector).attr("id"));
					if($(selector).hasClass("on-document-ready")){
						selectors.push(selector)
						$(function(){
							// alert($(selectors[event_counter]).children("li.selected").text());
							var event = jQuery.Event("click");
							event.restore = true;
							event.selector = selectors[event_counter];
							$(selectors[event_counter]).children("li.selected").trigger(event);
							// $(selector).children("li.selected").click();
							event_counter++;
						});	
					}else{
						var event = jQuery.Event("click");
						event.restore = true;
						event.selector = selector;
						$(selector).children("li.selected").trigger(event);
						event_counter++;
					}
				}
			}
		}
		else if ( type === 'save-children' ){
			if($(selector).hasClass("state-by-ajax")){
				var id = selector.substring(1, selector.length);
				ajax_states[id] = state;
			}
		}
	}
	//enable terms if disabled
	$("#terms-checkbox").removeAttr("disabled");
	$(".step").addClass("active");

	//resize iban fonts
	$(".format-iban").each(function(){
		resize_font(this);
	});

	scroll.list([], 500);

	remove_loading();
}