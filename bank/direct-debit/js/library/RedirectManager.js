/**
 * Converts an href link to a form and submits it so that no ugly urls appear on the address bar
 *
 * @author Ioannis Triantafyllou
 */
var RedirectManager = (function () {
	
	"use strict";
	
	var instantiated;
	
	$(document).ready(function(){
		if ($(".javascript-redirect").length) {
			$("body").on("click", ".javascript-redirect", function(event) {
				event.preventDefault();
				RedirectManager.getInstance().redirect($(this).attr("href"));
			});		
		}
	});
	
	function initialize() {
		
		return {
			/**
			 * This function is used to redirect to a url through the controller.
			 * 
			 * @author Triantafyllou Ioannis
			 * 
			 * @param  {String} 	url   	The redirection url
			 * @param  {Boolean}	newTab	Specifies if the redirection will occur in a new browser window
			 */
			redirect: function (url, newTab) {
				
				if (url !== '') {
					var questionMarkIndex = url.indexOf('?');
					var searchString = "";
					if (questionMarkIndex >= 0) {
						searchString = url.substring(questionMarkIndex + 1);
					}
					var actionValue = url.substring(0, questionMarkIndex);
					var params = this.getUrlParams(searchString);

					this.submitParamList(params, false, false, newTab, actionValue);
				}
			},
			
			
			/**
			 * This is a function that parses an href search string and returns a map containing key/value pairs of the parameters.
			 * The following assumptions are made about the url, in order for the function to work properly:
			 * 1)	The parameters in the search string are in the format (variable name)=(variable value) without the parenthesis and separated by the character '&'.
			 * 2)	The (variable name) part does not contain the ambersand character'&'.
			 * 3)	The (variable value) part may contain the ambersand character'&' any number of times.
			 * 
			 * @author Triantafyllou Ioannis
			 * 
			 * @param  {String} 	url   			The redirection url
			 * @param  {Boolean}	decodeParams	Specifies if the params extracted from the url need to be url-decoded
			 */
			getUrlParams: function (url, decodeParams) {
				var paramPair;
				var additionRegex = /\+/g;	//Regex for replacing addition symbol with a space
				var paramRegex = /(([^&=]+)=?([^&]*))|&/g;	//Regex that matches either to a parameter pair or an ambersand
				var validParamRegex = /([^&=]+)=([^&]*)/g;	//Regex that matches only to a valid parameter pair
				
				var decode = function (s) {
					return decodeURIComponent(s.replace(additionRegex, " "));
				};
				
				var urlParams = {};
				var ambersands = "";
				var paramPairs = {};
				var counter = -1;
				//first get the param pairs from the url
				while (paramPair = paramRegex.exec(url)) {
					if (paramPair[0] === "&") { //if the match was the ambersand
						ambersands += "&"; //add it to a temp string. It will be either added to the param pair's value, or ignored, if it is a param separator ambersand
					} else if (paramPair[0].match(validParamRegex)) { //if the match was a valid param pair
						if (ambersands !== "") { //check if there is a sequence of ambersands that have not been added yet to the previous pair. If so, add them now, except for the last one (separator).
							paramPairs[counter][0] += ambersands.substring(1);
							paramPairs[counter][3] += ambersands.substring(1);
							ambersands = "";
						}
						paramPairs[++counter] = paramPair; //add the valid param pair to the map
					} else { //fragment match that is not a valid param pair (e.g. the part " Spencer" of the param pair 'name="Marks & Spencer"'). It should be added to the previous valid pair.
						
						paramPairs[counter][0] += ambersands + paramPair[0];
						paramPairs[counter][3] += ambersands + paramPair[0];
						ambersands = "";
					}
				}
				
				//Add to the last param value the ambersands that may exist in the buffer string
				if (counter >= 0) {
					paramPairs[counter][0] += ambersands;
					paramPairs[counter][3] += ambersands;
				}
				
				//now create the params map
				paramPair = {};
				for (var i = 0; i <= counter; i++) {
					paramPair = paramPairs[i];
					if (decodeParams) {
						urlParams[paramPair[2]] = decode(paramPair[3]);
					} else {
						urlParams[paramPair[2]] = paramPair[3];
					}
				}
				return urlParams;
			},
			/**
			 * This function accepts a map of params (key/value pairs) as arguments and submits them in a new form.
			 * @author Triantafyllou Ioannis
			 * 
			 * @param  {Object} 	params   				The parameters that will be submittted
			 * @param  {Boolean}	includeCommonParams		Specifies if the setup and conversationId params will be included
			 * @param  {Boolean} 	includeRestoreState   	Specifies if the restoredState param will be included
			 * @param  {Boolean}	newTab					Specifies if the target will be a new tab
			 * @param  {String}		actionValue				Specifies what the form submit action will be. Default is Controller.
			 */
			submitParamList: function (params, includeCommonParams, includeRestoreState, newTab, actionValue) {
				var form = document.createElement("form");
				form.setAttribute("method", "post");
				form.setAttribute("action", "Controller");
				
				if (actionValue) {
					form.setAttribute("action", actionValue);
				}
				if (newTab) {
					form.setAttribute("target", "_blank");
				}
				
				if (includeCommonParams) {
					params[setup] = $("input[name=" + setup + "]").val();
					params[conversationId] = $("input[name=" + conversationId + "]").val();
				}
				
				if (includeRestoreState) {
					params[restoredState] = $("input[name=" + restoredState + "]").val();
				}
				
				for (var key in params) {
					if (params.hasOwnProperty(key)) {
						var hiddenField = document.createElement("input");
						hiddenField.setAttribute("type", "hidden");
						hiddenField.setAttribute("name", key);
						hiddenField.setAttribute("value", params[key]);
						
						form.appendChild(hiddenField);
					}
				}
				
				document.body.appendChild(form);
				form.submit();
			}
		};
	}
	
	return {
		getInstance : function () {
			if (!instantiated) {
				instantiated = initialize();
			}
			return instantiated;
		}
	};
})();
