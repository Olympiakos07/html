/**
 * An object that manages all datepickers
 *
 * @author Achilleas Tsoumitas
 */
var DatepickersManager = (function() {

	"use strict";

	var instantiated;

	$(document).ready(function() {
		/**
		 * Datepickers localization
		 */
		$.datepicker.regional[locale] = {
			monthNames: monthNames,
			monthNamesShort: monthNamesShort,
			dayNames: dayNames,
			dayNamesMin: dayNamesMin
		};
		$.datepicker.setDefaults($.datepicker.regional[locale]);

		/**
		 * On datepicker click, try to setup the datepickers again in case some new came from html ajax request
		 * @return {[type]} [description]
		 */
		$("body").on("click", ".datepicker", function() {
			if ($(this).hasClass("past-datepicker")) {
				DatepickersManager.getInstance().setupPastDatepickers();
			} else if ($(this).hasClass("all-dates")) {
				DatepickersManager.getInstance().setupAllDatesDatepickers();
			} else if ($(this).hasClass("custom-date-datepicker")) {
				DatepickersManager.getInstance().setupCustomDatepickers();
			} else {
				DatepickersManager.getInstance().setupDatepickers();
			}
			$(this).datepicker("show");
		});

		/**
		 * Transaction planner step open/close
		 * @return {[type]} [description]
		 */
		$("body").on("click", "#transaction-planner-dialog li", function() {
			ResetManager.getInstance().resetAvailableDates();
			//set first input date to today
			DatepickersManager.getInstance().setTransactionPlannerDateText();
			var type = $(this).children().attr("class");
			//display multi repeat
			if (type === 'multi-sending') {
				$(".transaction-planner-step .multi-sending-fields").slideDown();
				$(".first-send-difference").show();
			} else {
				$(".transaction-planner-step").find(".validation-error").remove();
				$(".transaction-planner-step .multi-sending-fields").slideUp();
				$(".first-send-difference").hide();
			}
			setTimeout(function() {
				MainPageHeightManager.getInstance().fixHeight();
			}, 500);
		});

		/**
		 * On transactions planner step duration change
		 */
		$("body").on("click", "#recurring-duration-dialog li", function() {
			DatepickersManager.getInstance().sendingsCalculator();
			DatepickersManager.getInstance().setupPastDatepickers();
		});

		/**
		 * On transactions planner step recurring interval change
		 */
		$("body").on("keyup", ".transaction-planner-step #recurring-interval", function() {
			DatepickersManager.getInstance().sendingsCalculator();
		});

	});

	function initialize() {

		return {
			/**
			 * Calculates the sendings for steps with dates with repetition
			 */
			sendingsCalculator: function() {

				//find interval
				var interval = $(".transaction-planner-step #recurring-interval").val().trim();
				if (interval !== "") {
					interval = parseInt(interval, 10);
				}

				//find period
				var period;
				if ($(".transaction-planner-step #recurring-duration-dialog li.selected").hasClass("months")) {
					period = "months";
				} else {
					period = "days";
				}

				if (interval !== "") {
					//find the two dates to compare
					var date1 = $(".transaction-planner-step #start-date").val();
					var date2 = $(".transaction-planner-step #end-date").val();
					if (date1 !== '' && date2 !== '' && interval !== '') {
						var date1Array = date1.split('/');
						var date2Array = date2.split('/');
						var times;
						if (period === 'months') {
							/*var times = Math.floor(((date2_array[2] - date1_array[2]) * 12 + (date2_array[1] - date1_array[1]))/interval);
							if(times == 0){
								times = 1;
							}*/
							times = 0;
							date1 = new Date(date1Array[2], date1Array[1] - 1, date1Array[0]);
							date2 = new Date(date2Array[2], date2Array[1] - 1, date2Array[0]);
							while (date2 >= date1) {
								times++;
								date1 = new Date(date1Array[2], date1Array[1] - 1 + (interval * times), date1Array[0]);
								date2 = new Date(date2Array[2], date2Array[1] - 1, date2Array[0]);
							}
						} else {
							date1 = new Date(date1Array[2], date1Array[1] - 1, date1Array[0]);
							date2 = new Date(date2Array[2], date2Array[1] - 1, date2Array[0]);
							var oneDay = 1000 * 60 * 60 * 24;
							times = Math.floor((date2.getTime() - date1.getTime()) / (oneDay) / interval) + 1;
						}
						$(".transaction-planner-step .sendings-estimation").text(times);
					}
				} else {
					$(".transaction-planner-step .sendings-estimation").text(0);
				}
			},
			/**
			 * Initiates any custom datepickers
			 */
			setupCustomDatepickers: function() {
				//$(".custom-date.datepicker").each(function() {
				$(".custom-date.datepicker").datepicker({
					showOtherMonths: true,
					dateFormat: 'dd/mm/yy',
					/*minDate: 0,
						maxDate: 0,*/
					numberOfMonths: 1,
					firstDay: 1,
					changeMonth: true,
					changeYear: true
				});
				/*var last_date;
					if($(this).hasClass("without-today")){
						last_date = -1;
					}else{
						last_date = 0;
					}*/
				// if this functionality and past datepicker are needed,
				// add thos options after u create the datepicker
				//});
			},
			//limit the datepicker results, start date cant be after end date
			// setup_datepickers();
			setupDatepickers: function() {
				var lastDate;
				if ($("#start-date.datepicker.past-datepicker").hasClass("without-today")) {
					lastDate = -1;
				} else {
					lastDate = 0;
				}
				var dates = $("#start-date.datepicker:not(.past-datepicker), #end-date.datepicker:not(.past-datepicker, .single-date)").datepicker({
					showOtherMonths: true,
					dateFormat: 'dd/mm/yy',
					minDate: lastDate,
					numberOfMonths: 1,
					firstDay: 1,
					changeMonth: true,
					changeYear: true,
					onSelect: function(selectedDate) {

						var option = this.id === "start-date" ? "minDate" : "maxDate",
							instance = $(this).data("datepicker");
						var date = $.datepicker.parseDate(
						instance.settings.dateFormat || $.datepicker._defaults.dateFormat, selectedDate, instance.settings);
						dates.not(this).datepicker("option", option, date);
						//
						$("fieldset.transaction-planner-step").addClass("active");
						//all the following are to display the date text
						DatepickersManager.getInstance().updateDateString($(this), selectedDate);
						if (dates.not(this).attr("id") !== "start-date") {
							DatepickersManager.getInstance().updateDateString(dates.not(this), selectedDate);
						}

						if (!$(this).hasClass("single-date") && $(this).closest(".transaction-planner-step").length > 0) {
							DatepickersManager.getInstance().sendingsCalculator();
						}
					}
				});
			},
			setupAllDatesDatepickers: function() {
				var allDates = $("#start-date.datepicker.all-dates:not(.past-datepicker), #end-date.datepicker.all-dates:not(.past-datepicker, .single-date)").datepicker({
					showOtherMonths: true,
					dateFormat: 'dd/mm/yy',
					numberOfMonths: 1,
					firstDay: 1,
					changeMonth: true,
					changeYear: true,
					onSelect: function(selectedDate) {

						var option = this.id === "start-date" ? "minDate" : "maxDate",
							instance = $(this).data("datepicker");
						var date = $.datepicker.parseDate(
						instance.settings.dateFormat || $.datepicker._defaults.dateFormat, selectedDate, instance.settings);
						allDates.not(this).datepicker("option", option, date);
						//
						$("fieldset.transaction-planner-step").addClass("active");
						//all the following are to display the date text
						DatepickersManager.getInstance().updateDateString($(this), selectedDate);
						if (allDates.not(this).attr("id") !== "start-date") {
							DatepickersManager.getInstance().updateDateString(allDates.not(this), selectedDate);
						}

						if (!$(this).hasClass("single-date") && $(this).closest(".transaction-planner-step").length > 0) {
							DatepickersManager.getInstance().sendingsCalculator();
						}
					}
				});
			},
			setupPastDatepickers: function() {
				//limit the datepicker results for past datepickers
				//limit the datepicker results
				var lastDate;
				if ($("#start-date.datepicker.past-datepicker").hasClass("without-today")) {
					lastDate = -1;
				} else {
					lastDate = 0;
				}
				var pastDates = $("#start-date.datepicker.past-datepicker, #end-date.datepicker.past-datepicker").datepicker({
					showOtherMonths: true,
					dateFormat: 'dd/mm/yy',
					// minDate: -2000,
					maxDate: lastDate,
					numberOfMonths: 1,
					firstDay: 1,
					changeMonth: true,
					changeYear: true,
					onSelect: function(selectedDate) {
						var option = this.id === "start-date" ? "minDate" : "maxDate",
							instance = $(this).data("datepicker");
						var date = $.datepicker.parseDate(
						instance.settings.dateFormat || $.datepicker._defaults.dateFormat, selectedDate, instance.settings);
						pastDates.not(this).datepicker("option", option, date);
					}
				});
			},
			setTransactionPlannerDateText: function() {
				$(".transaction-planner-step #start-date, .transaction-planner-step #end-date").val(today_date);
				$(".transaction-planner-step .date-string").text(today_locale + " " + today.getDate() + " " + monthNames[today.getMonth()] + " " + today.getFullYear() + ".");
			},
			updateDateString: function(item, selectedDate) {
				var temp = selectedDate.split('/');
				var selectedDay = temp[0];
				var selectedMonth = temp[1];
				var selectedYear = temp[2];
				//create date object so we can find the day
				selectedDate = new Date(parseFloat(temp[2]), parseFloat(temp[1]) - 1, parseFloat(temp[0]));
				var day = selectedDate.getDay();
				//check what day he selected (today, tomorrow, or just day name)
				var dateName;
				if (selectedDate === todayDate) {
					dateName = todayLocale;
				} else {
					if (selectedYear === todayDate.split("/")[2] && selectedMonth === todayDate.split("/")[1] && parseInt(selectedDay, 10) - 1 === parseInt(todayDate.split("/")[0], 10)) {
						dateName = tomorrow_locale;
					} else {
						dateName = dayNames[day];
					}
				}
				//and display it
				item.parent().find(".date-string").text(dateName + " " + selectedDay + " " + monthNames[selectedMonth - 1] + " " + selectedYear + ".");
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