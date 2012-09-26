// Add .not-in-group for DEVLIVERY ONLY as an example.
function addNotInGroup() {
	$("#step-3 .drag.parties.list li:nth-child(1)").addClass("not-in-group");
	$("#step-3 .drag.parties.list li:nth-child(3)").addClass("not-in-group");
	$("#step-3 .drag.parties.list li:nth-child(4)").addClass("not-in-group");
	$("#step-3 .drag.parties.list li:nth-child(5)").addClass("not-in-group");
}

$(document).ready(function() {
	
	// Add .not-in-group when loaded for DEVLIVERY ONLY as an example.
	addNotInGroup();	
	
	// DELIVERY ONLY, should be replaced with Ajax object on implementation
	$("#select-group li").click(function() {
	
		// Reset ul.drop and .drag li classes and enable them.
	//	$("#step-3 .drag.parties.list li").removeClass("ui-state-disabled").removeClass("ui-draggable-disabled").removeClass("disabled").removeClass("selected").draggable("enable");
	//	$("#step-3 .drop.parties.list li").remove();
				
		// Hide/Show beneficiaries
		if ($(this).hasClass("any-type") == false) {
			$("#step-3 .drag.parties.list li.not-in-group").hide();
		} else {
			addNotInGroup();
			$("#step-3 .drag.parties.list li.not-in-group").show();
		}
	});
	
	$("input.button.reset").click( function() {
		// Reset ul.drop and .drag li classes and enable them.
		$("#step-3 .drag.parties.list li").removeClass("ui-state-disabled").removeClass("ui-draggable-disabled").removeClass("disabled").removeClass("selected").draggable("enable");
		$("#step-3 .drop.parties.list li").remove();
		
		// Make the selected group li the all beneficiaries
		$("#step-1 .selected").removeClass("selected");
		$("#step-1 li:nth-child(1)").addClass("selected");
	});
		
});