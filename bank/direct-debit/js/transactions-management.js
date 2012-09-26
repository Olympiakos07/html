$(document).ready(function() {
	
	// This enables all checkboxes to be selected/deselected at once.
	$(".transactions thead input:checkbox").click(function() {
		if ($(this).attr("checked")) {
			$(".transactions input:checkbox:visible").not(".transactions thead input:checkbox").attr("checked", "checked");
		} else {
			$(".transactions input:checkbox:visible").not(".transactions thead input:checkbox").attr("checked", "");
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

	$(".list.users li").click(function() {
		if ($(this).hasClass("inputer")) {
			$("tbody.inputer").fadeIn().removeClass("hidden");
			$("tbody.verifier").fadeOut().addClass("hidden");
			$("tbody.operator").fadeOut().addClass("hidden");
			$(".additional-column").addClass("hidden"); // Should think of a better way
			$("tfoot th").attr("colspan", "2"); // Should think of a better way
		} else if ($(this).hasClass("verifier")) {
			$("tbody.inputer").fadeOut().addClass("hidden");
			$("tbody.verifier").fadeIn().removeClass("hidden");
			$("tbody.operator").fadeOut().addClass("hidden");
			$(".additional-column").addClass("hidden"); // Should think of a better way
			$("tfoot th").attr("colspan", "2"); // Should think of a better way
		} else if ($(this).hasClass("operator")) {
			$("tbody.inputer").fadeOut().addClass("hidden");
			$("tbody.verifier").fadeOut().addClass("hidden");
			$("tbody.operator").fadeIn().removeClass("hidden");
			$(".additional-column").removeClass("hidden"); // Should think of a better way
			$("tfoot th").attr("colspan", "3"); // Should think of a better way
		}
	});
	
	$(".operator input:checkbox").change(function() {
		field = $(this).next(".field");
		if ($(this).attr("checked")) {
			field.removeClass("disabled").removeAttr("disabled");
		} else {
			field.addClass("disabled").attr("disabled", "disabled");
		};
	});

});