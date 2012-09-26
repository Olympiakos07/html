var displayVariable = "block";

/**
 * Adds the function trim to the String object if it doesnt already exist
 */
if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, ''); 
  }
}

function fixIEStacks(elements)	{
	var zIndexNumber = 1000;
	
	$(elements).each(function() {
		$(this).css('zIndex', zIndexNumber);
		zIndexNumber -= 10;
	});	
}

function activateDialog(){
	$(document).on("focus", "div.dsq-dialog-container", function(){
		if($(this).find("ul.dsq-dialog").length > 0){// && focused_item_id != this_id){
 			focused_item = $(this).find("ul.dsq-dialog");
			if(!focused_item.next().hasClass("open")){
				focused_item.slideDown().addClass('open');
			}
 		}
	});
}

$(document).ready(function(){
	if ($.browser.msie && $.browser.version == '7.0') {
		fixIEStacks(".form .fields.has-dropdown, .table-filters fieldset, #transactions-calendar .transactions td div, #manage-templates-list.smart-mobile li");
	}

	//add the class has-filter, to the lists that have filter so that they take position relative
	$("ul li.filter").each(function(){
		$(this).parent().addClass("has-filter");
	})

	$(document).on("click", ".dsq-dialog li", function(event) {
		$(document).off("focus", "div.dsq-dialog-container");
		setTimeout(function(){activateDialog()}, 500);
	});

	$("#top-menu .soon").addClass("hidden");

	//=====FOR DESIGN=====//
	// take care of display quirks in IE7
	if ($.browser.msie && $.browser.version == '7.0') {
		
		// display: table, display: table-cell
		if((fieldsets = $(".form fieldset")).length > 0)	{

			fieldsets.each(function() {
				if(!$(this).is('.buttons'))	{
					var bgColor = '#676767';
					
					if($(this).is('.active'))	{
						bgColor = '#606060';
					}
					
					$('<table cellpadding="0" cellspacing="0"><tr><td style="vertical-align: top; background: ' + bgColor + '; border-bottom: 1px solid #6d6d6d"></td><td style="vertical-align: top;"></td></tr></table>')
				    .find('td')
				        .eq(0)
				            .append($(this).children('span.no').css("border-bottom", "none"))
				            .end()
				        .eq(1)
				            .append($(this).children('.content'))
				            .end()
				        .end()
				    .appendTo($(this));
			    }

			});
		}
		
		// :before, :after
		if((selected = $("#menu .submenu li.active a")).length > 0)	{
			selected.after('<span class="menu-arrow"></span>');
		}
		
		if((selectedOptions = $(".dsq-dialog.is-dropdown li.selected span a")).length > 0)	{
			selectedOptions.prepend('&raquo; ');
		}
		
		// silly z-index bug
		var zIndexNumber = 1000;		
		$(".form .label").each(function() {
		       $(this).css('zIndex', zIndexNumber);
		       zIndexNumber -= 10;
		});
	}
	
});