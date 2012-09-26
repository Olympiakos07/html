/**
 * An special tooltip created for the payments page
 *
 * @author  Achilleas Tsoumitas
 */
var Infotip;

(function() {

	"use strict";

	/**
	 * An info tooltip
	 */
	Infotip = function() {};

	/**
	 * The id of the infotip
	 * @type {String}
	 */
	Infotip.prototype.id = "";

	/**
	 * The infotip's timer that will eventually remove it (set with setTimeout)
	 * @type {Number}
	 */
	Infotip.prototype.timer = "";

	/**
	 * Initialize the info tip.
	 * Add its markup, set its timer, attach events
	 *
	 * setTimeout has a problem with this, documented here
	 * https://developer.mozilla.org/en/DOM/window.setTimeout
	 *
	 * @param  {Number} timeout The time (in ms) that the tooltip will appear
	 */
	Infotip.prototype.initialize = function(iconMarkup, arrowMarkup, timeout) {
		// Append the markup
		$("#" + this.id).append(iconMarkup);
		$("#" + this.id).append(arrowMarkup);
		// Close after timeout secs
		// avoid the "this" problem
		var object = this;
		this.timer = setTimeout(function() {
			object.remove();
		}, timeout);
		// Remove on click, mouseout event
		$("#" + this.id).closest("fieldset").on("click", ".label", function() {
			object.remove();
		});
		// Remove on tooltip mouseout
		$("#" + this.id).closest("fieldset").on("click, mouseout", "#" + this.id, function() {
			object.remove();
		});
		// Dont remove (stop timer) while hovering
		$("#" + this.id).closest("fieldset").on("mouseover", "#" + this.id, function() {
			clearTimeout(object.timer);
		});
	};

	/**
	 * Remove the infotip and clear its timer
	 * @return {[type]} [description]
	 */
	Infotip.prototype.remove = function() {
		$("#" + this.id).remove();
		clearTimeout(this.timer);
	};

}());
