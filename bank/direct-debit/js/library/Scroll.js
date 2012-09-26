/**
 * Saves the scroll state and scrolls all the lists on the page after a certain delay
 */
var Scroll = function(){};
var scroll = new Scroll();

Scroll.prototype.savedScroll = [];

/**
 * It scrolls the lists with a timeout
 * @param  {Number} timeout The timeout
 */
Scroll.prototype.list = function(lists, timeout){
	setTimeout(function(){scroll.goScroll(lists)}, 500);
};

/**
 * Saves the lists scroll values
 * @return {array} An array with the ids and scrolls of each list in the page
 */
Scroll.prototype.save = function(id){
	//var savedScroll = [];
	if(id){
		var scroll = $("#" + id).scrollTop();
		var object = {id: id, scroll: scroll};
	}/*else{
		$(".list").each(function(){
			var id = $(this).attr("id");
			savedScroll.push({id: id, scroll: $("#" + id).scrollTop()});
		});
	}*/
	return object;
};

/**
 * Checks if a scroll rule for this id already exists and updates it, or otherwiese, justs adds it at the end of savedScroll
 */
Scroll.prototype.add = function(object) {
	var found = false;
	for(var i = 0, length = this.savedScroll.length; i < length; i++){
		if(this.savedScroll[i]){
			if(this.savedScroll[i].id == object.id){
				this.savedScroll[i].scroll = object.scroll;
				found = true;
			}
		}
	}

	if(! found){
		this.savedScroll.push(object);
	}
};

/**
 * Scrolls all the list found in the page to either the saved values, or the selected item
 */
Scroll.prototype.goScroll = function(lists){
	//if its "all" or empty, means to scroll all lists
	if(! jQuery.isArray(lists) || lists.length == 0){
		lists = [];
		var i = 0;
		$(".list").each(function(){
			lists[i] = $(this).attr("id");
			i++;
		});
	}

	//if we have saved scrolls
	if(this.savedScroll.length > 0){
		for(var i = 0, length = this.savedScroll.length; i < length; i++){
			if(this.savedScroll[i]){
				//if we were told to scroll this list
				if($.inArray(this.savedScroll[i].id, lists) != -1){
					//delete makes that array spot undefined
					delete lists[$.inArray(this.savedScroll[i].id, lists)];
					$("#" + this.savedScroll[i].id).scrollTop(this.savedScroll[i].scroll)
				}
			}
		}
	}
	//
	for(var i = 0, length = lists.length; i < length; i++){
		var id = lists[i];
		//if id hasnt become undefined by delete and has a selected item, scroll to it
		if(id && $("#" + id + " li.selected").length > 0){
			if($("#" + id + " li:first").hasClass("filter") && $("#" + id + " li.selected").index("#" + id + " li:visible") == 1){
				$("#" + id).scrollTop(0);
			}else{
				$("#" + id).scrollTop($("#" + id + " li.selected").index("#" + id + " li:visible") * $("#" + id + " li.selected").outerHeight());
			}
		}else{
			$("#" + id).scrollTop(0);
		}
	}		
};

/**
 * Resets the scroll
 */
Scroll.prototype.reset = function(lists){
	if(lists && lists.length > 0){
		//if we have saved scrolls
		if(this.savedScroll.length > 0){
			for(var i = 0, length = this.savedScroll.length; i < length; i++){
				if(this.savedScroll[i]){
					//if we were told to scroll this list
					if($.inArray(this.savedScroll[i].id, lists) != -1){
						//delete makes that array spot undefined
						delete this.savedScroll[i];
					}
				}
			}
		}
	}else{
		scroll.savedScroll = [];
	}
}