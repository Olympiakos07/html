/**
 * Manages the drag and drop functionality between 2 lists
 *
 * @author Achilleas Tsoumitas
 */
var DragndropListManager = (function() {

	"use strict";

	var instantiated;

	$(document).ready(function() {
		
		/**
		 * Enables the drag list
		 */
		$(".list.drag li").draggable({
			containment: $(this).parent().parent(),
			cursor: "move",
			zIndex: 2700,
			snap: $(".drag, .drop"),
			helper: "clone",
			drag: function(event, ui) {
				var length = $(".drag li.selected").length - 1;
				$(".ui-draggable-dragging.selected a").text(length + " " + beneficiaries_locale);
			}
		});

		/**
		 * Enables the drop list
		 */
		$(".list.drop").droppable({
			activeClass: 'ui-state-highlight-droparea',
			hoverClass: 'drophover',
			drop: function(event, ui) {
				if (ui.draggable.hasClass("selected")) {
					$(".drag li.selected").each(function() {
						var html = $('<div>').append($(this).clone()).remove().html();
						$(".drop").append(html);
						$(".drop li:last").attr("id", "item-" + $(this).index());
						$(".drop li:last").removeClass("selected");
					});
					$(".drag li.selected").draggable("disable");
					$(".drag li.selected").addClass("disabled");
					$(".ui-draggable-dragging").remove();
					//
					$(".drag li.selected").removeClass("selected");
				} else {
					var html = $('<div>').append(ui.draggable.clone()).remove().html();
					$(this).append(html);
					$(this).children("li:last").attr("id", "item-" + ui.draggable.index());
					ui.draggable.draggable("disable");
					ui.draggable.addClass("disabled");
				}
				//show all deletes
				$(this).find(".actions").removeClass("hidden");
			}
		});

		/**
		 * Remove an element from the drop list
		 * 
		 */
		$("body").on("click", ".list li .actions .delete", function() {
			if ($(this).closest("li").attr("id")) {
				var id = $(this).closest("li").attr("id").split("-")[1];
				$(".list.drag li:eq(" + id + ")").draggable("enable").removeClass("disabled");
				$(this).closest("li").remove();
			}
		});
	});

	function initialize() {

		return {

		};
	}

	return {
		getInstance: function() {
			if (!instantiated) {
				instantiated = initialize();
			}
			return instantiated;
		}
	};
})();