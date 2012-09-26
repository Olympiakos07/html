/**
 * Controls (makes possible) the keybard navigation
 *
 * @author Achilleas Tsoumitas
 */
var KeyboardNavigation = (function() {

	"use strict";

	var instantiated;

	var focusedItem = "";

	$(document).ready(function() {
		//on lists focus
		$("body").on("focus", "ul.list", function() {
			focusedItem = $(this);
			$(".dsq-dialog:not(.is-tooltip)").slideUp().removeClass('open');
		});
		//on input focus
		$("body").on("focus", "input:not(:checkbox)", function() {
			focusedItem = $(this);
			//closes dsq-dialogs when you press tab button to move to next focusable item
			$(".dsq-dialog:not(.is-tooltip)").slideUp().removeClass('open');
		});

		//on dropdowns focus (we put tabIndex on div, because ul is hidden and label tabIndex is not working)
		$("body").on("focus", "div.dsq-dialog-container", function(event) {
			/*var this_id = $(this).find("ul.dsq-dialog").attr("id");
			if(focusedItem != ""){
				var focusedItem_id = focusedItem.attr("id");
			}else{
				var focusedItem_id = "";
			}*/
			if ($(this).find("ul.dsq-dialog").length > 0) { // && focusedItem_id != this_id){
				focusedItem = $(this).find("ul.dsq-dialog");
				//close other dialogs
				//$(".dsq-dialog").slideUp().removeClass('open');
				//open this one
				if (!focusedItem.next().hasClass("open")) {
					//if its very big, display without animation, so that we can made overflow scrollable
					if ($(this).find("ul.dsq-dialog li").length > 20) {
						focusedItem.css("display", "block").addClass('open');
						$(this).find("ul.dsq-dialog").css("overflow-y", "scroll");
					} else {
						focusedItem.slideDown().addClass('open');
					}
				}
			}
		});

		$("body").on("keydown", ".list, .dsq-dialog-container", function(e) {
			if (e.keyCode === 37) {
				//alert( "left pressed" );
				return true;
			} else if (e.keyCode === 38) {
				//if out list has selected item
				var prevItem;
				if (!focusedItem.hasClass("closed")) {
					if (focusedItem.children("li").hasClass("selected")) {
						//if selected item is not the first one, move northern
						if (!focusedItem.children("li.selected").is(':first-child')) {
							//propose prev item
							prevItem = focusedItem.children("li.selected").prev();
							focusPrev(prevItem);
						}
					} else {
						//if none is already selected, focus the last one
						prevItem = focusedItem.children("li:last");
						focusPrev(prevItem);
					}
				}
				return false;
			} else if (e.keyCode === 39) {
				//alert( "left pressed" );
				return true;
				//on key down
			} else if (e.keyCode === 40) {
				//if out list has selected item
				var nextItem;
				if (!focusedItem.hasClass("closed")) {
					if (focusedItem.children("li").hasClass("selected")) {
						//if selected item is not the last one, move southern
						if (!focusedItem.children("li.selected").is(':last-child')) {
							//propose next item
							nextItem = focusedItem.children("li.selected").next();
							focusNext(nextItem);
						}
					} else {
						//if none is already selected, focus the first one
						nextItem = focusedItem.children("li:first");
						focusNext(nextItem);
					}
				}
				return false;
			}
		});

		function focusNext(nextItem) {
			//next item we received may be hidden, so loop
			for (var i = 0; i < 100; i++) {
				if (nextItem.is(':visible')) {
					focusedItem.children("li.selected").removeClass("selected");
					nextItem.addClass("selected");
					break;
				} else {
					//go to next item
					nextItem = nextItem.next();
				}
			}
			//send click event
			var event = jQuery.Event("click");
			event.inputMethod = "keyboard";
			focusedItem.children("li.selected").trigger(event);
			//move scrollbar
			var itemsNumber = focusedItem.height() / focusedItem.children("li").innerHeight();
			if (focusedItem.children("li.selected").index() + 1 > itemsNumber) {
				var scroll = focusedItem.children("li").outerHeight() + focusedItem.scrollTop();
				focusedItem.scrollTop(scroll);
			}
		}

		function focusPrev(prevItem) {
			//previous item may be hidden, so loop
			for (var i = 0; i < 100; i++) {
				if (prevItem.is(':visible')) {
					focusedItem.children("li.selected").removeClass("selected");
					prevItem.addClass("selected");
					break;
				} else {
					//go to previous item
					prevItem = prevItem.prev();
				}
			}
			//send click event
			var event = jQuery.Event("click");
			event.inputMethod = "keyboard";
			focusedItem.children("li.selected").trigger(event);
			//move scrollbar
			var itemsNumber = focusedItem.height() / focusedItem.children("li").innerHeight();
			if (focusedItem.children("li.selected").index() < focusedItem.children("li").length - itemsNumber) {
				var scroll = focusedItem.scrollTop() - focusedItem.children("li").outerHeight();
				focusedItem.scrollTop(scroll);
			}
		}

		/**
		 * Slider functionality (used in create time deposit)
		 * @param  {event} e 
		 * @return {Boolean}   We always prevent default action
		 */
		$("body").on("keydown", ".slider", function(e){
			var steps = $(this).find(".slider-step").length;
			if (e.keyCode == 37) { 
			   //alert( "left pressed" );
				var current_value = $(this).slider("option", "value");
				if(current_value !== 0){
					var new_value = parseInt(current_value) - 1;
					$(this).slider("option", "value", new_value);
				}
			   return false;
			}else if (e.keyCode === 38) { 
				return false;
			}else if (e.keyCode === 39) { 
				var current_value = $(this).slider("option", "value");
				if(current_value !== steps - 1){
					var new_value = parseInt(current_value) + 1;
					$(this).slider("option", "value", new_value);
				}
				return false;
			//on key down
			}else if (e.keyCode == 40) {
				return false;
			}
		});

	});

	function initialize() {

		return {
			focusedItem: focusedItem
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