var isDelete = false;
var authorization = {};

function list_action_clicked(id, index, action){
	$("#"+id + " li").removeClass("selected");
	$("#"+id + " li:eq(" +index+ ")").addClass("selected");
	isDelete = true;
	authorization.call();
}

$(document).ready(function(){
	
	$("#select-payment-type li").click(function(){
		$("#step-2").addClass("active");	
	});

	$("#transaction-limit").blur(function(){
		if($(this).val() != ""){
			$("#step-3").addClass("active");
		}
	});


	$("form").submit(function(){
		var validations = [
			[$("#account-list"), "has_selected", "not_selected_account"],
			[$("#select-payment-type"), "has_selected", "not_selected"],
			[$("#transaction-limit"), "valid_amount", "not_valid_amount"],
			[$("#transaction-limit"), "not_zero", "amount_zero"]
		];

		var validator = new Validator();
		var submit_status = validator.validate(validations, true, true);
		
		if ( submit_status ){
			isDelete = false;
			authorization.call();
		}

		return false;
	});
	
	
	authorization = {

		call: function(){

			show_loading(true);
			
			var deleting = "false";
			if ( isDelete ){
				deleting = "true";
			}
			
			var data = {};
			data.operation = verify_operation; 
			data.conversationId = $("input[name='conversationId']").val();
			data.nextPage = verify_page;
			data.isDelete = deleting;
			data.NotificationType = 'PN';
			
			if ( !isDelete ){
				data.FromAccount = find_selected_account_number("#account-list", "-1");
				data.PaymentType = $("#select-payment-type li.selected").find("span.hidden-value").text();
				//var limit = $("#transaction-limit").val();
				//data.TxnLimit = limit.substr(0, limit.length-3);
				data.TxnLimit = $("#transaction-limit").val().split(decimal_separator)[0];
			}
			else{
				var alertToBeDeleted = $("#notifications-list li.selected");
				data.FromAccount =  alertToBeDeleted.find("span.hidden-value.accountNumber").text();
				data.PaymentType = alertToBeDeleted.find("span.hidden-value.paymentType").text();
				data.TxnLimit = alertToBeDeleted.find("span.hidden-value.limit").text();
				data.PhoneNumber = alertToBeDeleted.find("span.hidden-value.phoe").text();
				data.AlertId = alertToBeDeleted.find("span.hidden-value.alertId").text();
			}
			
			
			$.post(
					entrypoint,
					data,
					function(jsArray){
						authorization.result(jsArray);
					}, 
					"json"
			);
		},
	
		result: function(data){
			if(data.hasErrors){

				modal.hide_modal_messages();
				var errorsModalText = "<p>" + data.messages.replace(/\n/g, "</p><p>") + "</p>";
				$("#modal-actions .confirmErr .message").html(errorsModalText);
				modal.update_visibles('confirmErr');
				$("#modal-actions").dialog("open");
			}else{
				modal.hide_modal_messages();
				if(data.needsAuthorization){
					if(data.isPasswordUser){
						modal.update_visibles('password');
					}else{
						modal.update_visibles('authorize');
						$("#modal-actions .authorize strong:eq(0)").text(data.amount);
						$("#modal-actions .authorize strong:eq(1)").text(data.account);
					}
				}else{
					if( isDelete){
						modal.update_visibles('delete');
					}else{
						modal.update_visibles('create');
					}
				}
				$("#modal-actions").dialog("open");
			}

			remove_loading();
		}

	}
	
	
	var submit = {

		call: function(){

			show_loading(true);

			$.post(
					entrypoint,
					{
						operation: result_operation,
						conversationId: $("input[name=conversationId]").val(),
						nextPage: result_page
					},
					function(jsArray){
						submit.result(jsArray);
					}, 
					"json"
			);
		},

		result: function(data){
			if(data.hasErrors){
				if(!data.correctAuthorizationElement){
					$("#modal-actions input:visible").parent().append("<div class='helper error'>"+data.messages+"</div>");
				}else{
					modal.hide_modal_messages();
					var errorsModalText = "<p>" + data.messages.replace(/\n/g, "</p><p>") + "</p>";
					$("#modal-actions .submit .message p").html(errorsModalText);
					modal.update_visibles('submit');
					$("#modal-actions .submit .submit-confirmation").attr("href", $(".wizard-steps .step-4 .hidden-value.link").text());
				}
			}else{
				modal.hide_modal_messages();
				$("#modal-actions .submit .message p").text(data.messages);
				modal.update_visibles('submit');
				$("#modal-actions").parent().find(".ui-dialog-titlebar-close").css("display", "none");
				$("#modal-actions .submit .submit-confirmation").attr("href", $(".wizard-steps .step-4 .hidden-value.link").text());
			}

			remove_loading();
		}

	}
	
	
	var modal = {

		update_visibles: function(status){
			//status
			$("#modal-actions ."+status).removeClass("hidden");
			//title
			$("#ui-dialog-title-modal-actions").text($("#modal-actions ."+status).find(".hidden.title").text());
		},

		hide_modal_messages: function(){
			$("#modal-actions").children("div").addClass("hidden");
			modal.reset_data();
		},

		reset_data: function(){
			$("#modal-actions input").val("");
			$("#modal-actions .helper").remove();
		}
	}
	
	$("#modal-actions .confirmErr .submit-confirmation").click(function(){
		$("#modal-actions").dialog("close");
	});
	
	$("#modal-actions .create .cancel-confirmation, #modal-actions .delete .cancel-confirmation").click(function(){
		$("#modal-actions").dialog("close");
	});
	
	$("#modal-actions .create .submit-confirmation, #modal-actions .delete .submit-confirmation").click(function(){
		submit.call();
	});
	
	$("#modal-actions .submit .submit-confirmation").click(function(){
		$("#modal-actions").dialog("close");
		show_loading(false);
	});

});