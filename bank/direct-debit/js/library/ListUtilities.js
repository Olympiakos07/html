/**
 * A group of functions that allow us to extract info from lists
 *
 * @author Achilleas Tsoumitas
 */
var ListUtilities = (function() {

	"use strict";

	var instantiated;

	function initialize() {

		return {
			/**
			 * A function the finds the account number of the selected or specified li of a list
			 * 
			 * @param  {String} id    The id of the list
			 * @param  {Number} index The index of the li we want to find its account number. If its -1, the selected li will be scanned
			 * @return {String}       The account number found
			 */
			findAccountNumber: function(id, index) {
				var txt, accountNumber, temp;

				if (index !== -1) {
					txt = $("#" + id + " li:eq(" + index + ") a").html();
				} else {
					txt = $("#" + id + " li.selected a").html();
				}

				if (txt) {

					//if it has a nickname, it has a parenthesis, else, has no nickname
					if (txt.search(/\(/i) === -1) {
						//check if we also found markup, most probably the account has a product too
						if (txt.indexOf("<") !== -1) {
							temp = txt.split("<");
							accountNumber = temp[0];
						} else {
							accountNumber = txt;
						}
					} else {
						temp = txt.split("(");
						accountNumber = temp[1].split(")")[0];
					}

					return accountNumber;
				} else {
					return "";
				}
			},
			/**
			 * Finds the account nickname given a list id and an index
			 * @param  {String} id    The id of the list
			 * @param  {Number} index The index of the li we want to search for. If -1 is used, the selected one will be used
			 * @return {String}       The nickname found
			 */
			findAccountNickname: function(id, index) {
				var nickname;
				if (index !== -1) {
					nickname = $("#" + id + " li:eq(" + index + ") .nickname").text();			
				} else {
					nickname = $("#" + id + " li.selected .nickname").text();
				}

				// if nickname is not found, try to find it from the markup
				if (!nickname) {
					//this functionality is not needed for now. If someone needs it, plz add the necessary code here
					//following what is done on the findAccountNumber function
				}

				return nickname;
			},
			/**
			 * Finds the account currency
			 * @param  {String} id    The id of the list
			 * @param  {Number} index The index of the li we want to search for. If -1 is used, the selected one will be used
			 * @return {String}       The currency found
			 */
			findAccountCurrency: function(id, index) {
				var currency = "";
				if (index !== -1) {
					var classes = $("#" + id + " li:eq(" + index + ")").attr("class").split(" ");
				} else {
					var classes = $("#" + id + " li.selected").attr("class").split(" ");
				}
				for (var i = 0; i < classes.length; i++) {
					if (classes[i].substring(0, 8) === "currency") {
						currency = classes[i].split("-")[1];
					}
				}
				return currency;
			},
			/**
			 * Finds the account type
			 * @param  {String} id    The id of the list
			 * @param  {Number} index The index of the li we want to search for. If -1 is used, the selected one will be used
			 * @return {String}       The currency found
			 */
			findAccountType: function(id, index) {
				var type = "";
				if (index !== -1) {
					var classes = $("#" + id + " li:eq(" + index + ")").attr("class").split(" ");
				} else {
					var classes = $("#" + id + " li.selected").attr("class").split(" ");
				}
				for(var i = 0; i < classes.length; i++){
					if(classes[i].substring(0,8) != 'currency' && classes[i] != "selected" && classes[i] != "available-for-mobile"){
						type = classes[i];
					}
				}
			},
			/**
			 * Finds the account index
			 * @param  {String} id            The id of the list
			 * @param  {String} accountNumber The account number that we want to search for
			 * @return {Number}               The index that has this account number
			 */
			findAccountIndex: function(id, accountNumber) {
				var i = 0;
				var result = -1;
				$("#" + id + " li").each(function(){
					var number = ListUtilities.getInstance().findAccountNumber(id, i);
					if(number === accountNumber && result === -1){
						result = i;
					}
					i++;
				});

				return result;
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