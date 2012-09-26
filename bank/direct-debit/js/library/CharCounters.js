/**
 * This object has not changed during the main.js split
 */

/**
 * Updates the characters counters
 */

function update_char_counters() {
	$(".field.has-counter").each(function() {
		var input = $(this).val();
		var input_size = input.length;
		var chars_left = $(this).attr("maxlength") - input_size;
		$(this).next().find(".chars-remaining").text(chars_left);
	});
}

var CharCounters = function() {};

/**
 * Updates the character remaining counters in input fields
 * @param  {array} elements An array containing the ids of the fields to update. If its undefined, all fields will update
 */
CharCounters.prototype.update = function(elements) {
	if (!elements) {
		elements = [];
		var i = 0;
		$(".field.has-counter").each(function() {
			elements[i] = $(this).attr("id");
			i++;
		});
	}
	for (i = 0, length = elements.length; i < length; i++) {
		var id = elements[i];
		var input = $("#" + id).val();
		var input_size = input.length;
		var chars_left = $("#" + id).attr("maxlength") - input_size;
		$("#" + id).nextAll(".helper").find(".chars-remaining").text(chars_left);
	}
};

$(document).ready(function(){
	//field with limited character number
	$(".field.has-counter").each(function(){
		if(! $(this).attr("maxlength")){
			$(this).attr("maxlength", $(this).next().find(".chars-remaining").text());
		}
	});

	/**
	 * Update the character counter on blur or keyup
	 * @return {[type]} [description]
	 */
	$(document).on("keyup blur", ".field.has-counter", function(){
		if(! charCounters){
			var charCounters = new CharCounters();
		}
		charCounters.update([$(this).attr("id")]);
	});
})