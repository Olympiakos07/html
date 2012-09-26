/**
 * An object that counts the remaining time for automatic logout
 *
 * @author Achilleas Tsoumitas
 */
var LogoutTimer = (function() {

	"use strict";

	var instantiated;

	var setIntervalTimer;

	/**
	 * Makes the actual counting
	 */
	function count() {
		if (LogoutTimer.getInstance().secondsRemaining > 0) {
			LogoutTimer.getInstance().secondsRemaining--;
			//the timer will appear at 120 seconds
			if (LogoutTimer.getInstance().secondsRemaining === 120) {
				$("#top-menu .soon").removeClass("transparent hidden");
			}
			//since its no visible, we must format it and display it
			if (LogoutTimer.getInstance().secondsRemaining <= 120) {
				var minutes = parseInt(LogoutTimer.getInstance().secondsRemaining / 60, 10);
				var seconds = LogoutTimer.getInstance().secondsRemaining - minutes * 60;
				if (minutes < 10) {
					minutes = "0" + minutes;
				}
				if (seconds < 10) {
					seconds = "0" + seconds;
				}

				var temp = $("#top-menu .soon").text().split(" ");

				$("#top-menu .soon").text(minutes + ":" + seconds + " " + temp[1]);
				if (LogoutTimer.getInstance().secondsRemaining === 0) {
					clearTimeout(setIntervalTimer);
				}
			}
		}
	}

	function initialize() {

		return {
			"secondsRemaining": 0,
			/**
			 * Starts the countdown
			 */
			start: function() {
				setIntervalTimer = setInterval(function() {
					count();
				}, 1000);
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