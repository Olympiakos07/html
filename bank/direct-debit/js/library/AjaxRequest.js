/**
 * A function that handles all the ajax requests
 *
 * TODO: Ask if my idea for the multiple server error will be implemented
 */

/*var data = {
	"errors": {
		"hasErrors": false,
		"messages": ["sdfsdf", "sfsdfsd"]
	},
	"response": {
		"accounts": [
			{
				"accountNumber": "34242342",
				"restrictions": true
			},
			{
				"accountNumber": "2333223",
				"restrictions": false
			}
		]
	}
};*/

var AjaxRequest;

(function() {
	"use strict";

	/**
	 * The constructor
	 */
	AjaxRequest = function() {};

	/**
	 * Makes the actual request
	 * @param  {String} url             The url of the server that we want to communicate with
	 * @param  {Object} requestData     The data that we want to send to the server
	 * @param  {String} dataType        The accepted values are "json", "html", "xml", "script". This tag is currently not used, as jQuery will automatically try to detect the type by the mime of the response
	 */
	AjaxRequest.prototype.request = function(url, requestData, dataType) {
		//save the object functions because "this" will change inside the post request
		var success = this.success;
		var error = this.error;
		var complete = this.complete;

		$.post(url, requestData, function(responseData) {
			// check for server errors
			var errorMessage = "";
			if (responseData.errors && responseData.errors.messages) {
				for (var i = 0, length = responseData.errors.messages.length; i < length; i++) {
					errorMessage += responseData.errors.messages[i] + " ";
				}
				errorMessage = errorMessage.substr(0, errorMessage.length - 1);
			}
			// if we found server errors, call error method instead
			if (errorMessage) {
				error(responseData, errorMessage);
			}else{
				success(responseData);
			}

		}, dataType).error(function(responseData) {
			error(responseData, "");
		}).complete(function(responseData) {
			complete(responseData);
		});
	};

	/**
	 * If defined by the user as a function, it is called after the ajax request has succeeded and the server responded without errors
	 * @param  {Object} responseData The responce data
	 */
	AjaxRequest.prototype.success = function(responseData) {};

	/**
	 * It is called after the ajax request has failed to communicate with the server or the server responded with error messages, else this is empty
	 * @param  {Object} responseData         The default request data responce
	 * @param  {String} errorMessage If the server responded with an error message and this is the concatenation of the error messages issued
	 */
	AjaxRequest.prototype.error = function(responseData, errorMessage) {
		//display validator error that the server is not responding
		//if a second request, started by the user with a button is not responding
		// prompt the user to try the transaction later
		// since a validation error exists on the screen, the transaction cannot be submitted
		console.log("open server side errors modal");
	};

	/**
	 * If defined by the user as a function, it is called after the ajax request is completed
	 * either with success or error
	 * @param  {Object} responseData The responce data
	 */
	AjaxRequest.prototype.complete = function(responseData) {};

}());
