$(document).ready(function() {
	
	// This enables all checkboxes to be selected/deselected at once.
	$(".general-table thead input:checkbox").click(function() {
		if ($(this).attr("checked")) {
			$(".general-table input:checkbox:visible").not(".transactions thead input:checkbox").attr("checked", "checked");
		} else {
			$(".general-table input:checkbox:visible").not(".transactions thead input:checkbox").attr("checked", "");
		}
	});

	// This enables each sections checkboxes to be selected/deselected at once.
	$(".table-separator input:checkbox").click(function() {

		if ($(this).attr("checked")) {
			$(this).parent().parent().nextUntil(".table-separator", "tr").find("input:checkbox").attr("checked", "checked");
		} else {
			$(this).parent().parent().nextUntil(".table-separator", "tr").find("input:checkbox").attr("checked", "");
		}
	});

});