/**
 * Manages mainly list events
 *
 * @author Achilleas Tsoumitas
 */
var ListManager = (function() {

	//"use strict";
	var instantiated;

	$(document).ready(function() {

		/**
		 * Save the scroll for lists. Important. live (on) events dones not work with scroll
		 */
		$(".list:not(.resizable)").scroll(function() {
			scroll.add(scroll.save($(this).attr("id")));
		});

		/**
		 * Lists on click
		 */
		$("body").on("click", ".list:not(.dragndrop) li:not(.non-selectable)", function(event) {
			listClickCallback(event);
		});

		$("body").on("mousedown", ".list.dragndrop li:not(.non-selectable)", function(event) {
			listClickCallback(event);
		});

		function listClickCallback(event){
			var oldIndex = $(event.currentTarget).closest("ul").find("li.selected").index();

			var continueClick = true;
			if (typeof(listAllowClick) !== "undefined") {
				continueClick = listAllowClick($(event.currentTarget).closest(".list").attr("id"), $(event.currentTarget).index(), oldIndex, $(this).attr("class"));
			}

			if (continueClick) {


				// if we have a drag or drop list
				if($(event.currentTarget).parent().hasClass("drag") || $(event.currentTarget).parent().hasClass("drop")){
					if($(event.currentTarget).parent().hasClass("drag") && $(event.currentTarget).hasClass("selected")){
						$(event.currentTarget).removeClass("selected");
					}else if(!$(event.currentTarget).parent().hasClass("drag")){
						$(event.currentTarget).siblings().removeClass("selected");
					}else if(!$(event.currentTarget).parent().hasClass("drop") && !$(event.currentTarget).hasClass("disabled")){
						$(event.currentTarget).addClass("selected");
					}
				}else{
					$(event.currentTarget).siblings().removeClass("selected");
					$(event.currentTarget).addClass("selected");
				}




				//$(event.currentTarget).siblings().removeClass("selected");
				//$(event.currentTarget).addClass("selected");

				if ($(event.currentTarget).hasClass("filter")) {
					$(event.currentTarget).find(".input-filter").focus();
				}

				$(event.currentTarget).parent().parent().find("span.validation-error:not(.compare_numbers, .not_zero, .invalid_amount)").remove();

				updateStepCompletion();

				//scroll the lists only if the event is by user and not by restore
				if (!event.restore && !event.emulated) {
					if ($(event.currentTarget).closest(".list").hasClass("resizable")) {
						$(event.currentTarget).closest(".list").removeClass("resizable");
						//and let it scroll to the selected item
					} else {
						//save scroll
						scroll.add(scroll.save($(event.currentTarget).closest(".list").attr("id")));
					}
				} else if (event.emulated) {
					scroll.reset([$(event.currentTarget).closest(".list").attr("id")]);
					scroll.goScroll([$(event.currentTarget).closest(".list").attr("id")]);
				}

				//if list_clicked is defined, we call it, with list id and li index params
				if (typeof(list_clicked) !== "undefined") {
					list_clicked($(event.currentTarget).closest(".list").attr("id"), $(event.currentTarget).index(), oldIndex);
				}
				ListManager.getInstance().clicked($(event.currentTarget).closest(".list").attr("id"), $(event.currentTarget).index(), oldIndex);
			}
		}

		/**
		 * List actions on click
		 */
		$("body").on("click", ".list li:not(.non-selectable) .actions a", function(event) {

			var oldIndex = $(this).closest(".list").find("li.selected").index();

			var continueClick = true;
			if (typeof(listAllowClick) !== "undefined") {
				continueClick = listAllowClick($(this).closest(".list").attr("id"), $(this).index(), oldIndex);
			}

			if (continueClick) {

				//select the clicked li only
				$(this).closest(".list").find("li").removeClass("selected");
				$(this).closest("li").addClass("selected");

				if (typeof(list_action_clicked) !== "undefined") {
					list_action_clicked($(this).closest(".list").attr("id"), $(this).closest("li").index(), oldIndex, $(this).attr("class"));
				}
				ListManager.getInstance().actionClicked($(this).closest(".list").attr("id"), $(this).closest("li").index(), oldIndex, $(this).attr("class"));
			}
			event.stopPropagation();
		});

		/**
		 * Trigger click event on list that are single preselect and have only 1 li
		 */
		$(".list.single-preselect").each(function() {
			if ($(this).find("li").length === 1) {
				var element = $(this).find("li");
				setTimeout(function() {
					element.trigger("click");
				}, 100);
			}
		});

		/**
		 * Makes steps with lists active. ITS NOT COMPLETE
		 */

		function updateStepCompletion() {
			for (var i = 1; i < 7; i++) {
				if ($("#step-" + i + " .list li").hasClass("selected")) {
					$("#step-" + i).addClass("active");
				}
			}
		}

		/**
		 * List filtering
		 */
		$("body").on("keyup", ".input-filter", function() {
			var input = $(this).val();
			$(this).parent().parent().children("li:not(:first)").each(function() {
				if ( $(this).hasClass('filter-dont-show') ){
					$(this).slideUp();
					//continue with next iteration of each loop
					return;
				}
				//do the freaking search
				var text = $(this).find("*:not(.hidden-value)").text();
				// console.log(input);
				var regex = new RegExp(input, "i");
				if (regex.test(text)) {
					$(this).slideDown();
				} else {
					$(this).slideUp();
				}
			});
			setTimeout(function() {
				MainPageHeightManager.getInstance().fixHeight();
			}, 500);
		});

		/**
		 * Clear filter button
		 */
		$("body").on("click", ".clear-filter", function() {
			$(this).prev().val("");
			var event = jQuery.Event("keyup");
			$(this).parent().find(".input-filter").trigger(event);
			setTimeout(function() {
				MainPageHeightManager.getInstance().fixHeight();
			}, 500);
		});
	});

	function initialize() {

		return {
			/**
			 * A callback called when a list li is clicked
			 * @param  {String} id       The id of the list that was clicked
			 * @param  {Number} index    The index of the clicked li
			 * @param  {Number} oldIndex The index of the previously selected li
			 */
			clicked: function(id, index, oldIndex) {

			},
			/**
			 * A callback called when an action is clicked
			 * @param  {String} id       The id of the list that was clicked
			 * @param  {Number} index    The index of the clicked li
			 * @param  {Number} oldIndex The index of the previously selected li
			 * @param  {String} classes  The classes of the action clicked, so we can identify which action was clicked when an li has more than 1 actions
			 */
			actionClicked: function(id, index, oldIndex, classes) {

			}
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