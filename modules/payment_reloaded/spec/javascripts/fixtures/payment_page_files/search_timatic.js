$( document ).ready(function() {
	setup_citizenship_autocomplete();
});

var setup_citizenship_autocomplete = function(){
    
	$(".timc_nationality_select").each(function()
	{
	    $(this).autocomplete(
	    {
	            minLength: 0,
	            select: function(ev, ui){
	                ev.preventDefault();
	                // console.log( ui.item.name );
	                $(this).val(ui.item.name);
	                var a_link = $(this).parent().find('.open_infoframe');
	                var newLink = a_link.attr('href').replace(/\/nc=[A-Z]{2}\//, '/nc=' + ui.item.code + '/');
	                //a_link.attr('data-nc', ui.item.code);
	                a_link.attr('href', newLink );
					a_link.magnificPopup({
					      items: {
					        src: newLink,
					        type: 'iframe'
					       },
					  	 callbacks: {
			                open: function(){
			                    var hasSpecClass = a_link.hasClass('open_infoframe');
			                    if(hasSpecClass){
			                      $('.mfp-content').addClass('open_infoframe');
			                    }
			                }
	            		}
					    });

	                a_link.focus();
	                $(this).parent().find('.timc_nationality_select_span').html(ui.item.name);
	            },
	            search:function(ev, ui){
	              
	            },
	            source: function(req, add) {
	              var data = [];
	              for(i in self.nationalities){
	                if(self.nationalities[i].name){
	                  if(eval("/^"+req.term.toLowerCase()+"/").test(self.nationalities[i].name.toLowerCase())){
	                    data.push(self.nationalities[i]);
	                  }
	                }
	              }
	              add(data)
	            },
				open: function () {
					var my_top = $(this).data("uiAutocomplete").menu.element.offset();
					$(this).data("uiAutocomplete").menu.element.addClass("nationality_my_class").css('top', my_top.top - 1);
				},
				close: function( event, ui ) {
					$(this).hide();
					$(this).parent().find('.timc_nationality_select_span').show();
				}
				
		}).focus(function(){
		    $(this).autocomplete("search", '');
		}).blur(function(){
		    $(this).autocomplete("close");
		}).data("autocomplete")._renderItem = function(ul, item) {
		  return $("<li></li>").data("item.autocomplete", item).append("<a><strong>" + item.name + "</strong></a>").appendTo(ul);
		}
	      
		var a = $(this);
		$(this).parent().find('.timc_nationality_select_span').click( function(){ 
		    $(this).hide();
		    a.show();
		   	setTimeout( function(){ a.focus() } ,1) ;
		});
	    
		// $(this).parent().find('.open_infoframe').click(function(){
			
		// 	var nc  = $(this).attr('data-nc');
		// 	var dc  =  $(this).attr('data-dc');
		// 	var dec = $(this).attr('data-dec');
		// 	var dcc =  $(this).attr('data-dcc');
		// 	var dac =  $(this).attr('data-dac');
		// 	var ad  = $(this).attr('data-ad');
		// 	var dt = 'Passport';
				
		// 	var link = 'https://www.timaticweb2.com/integration/external?ref=b41336f19563b2cbbe882a510008bb8f'
		// 					+ "&rule=/dc="+dc+"/ad=" + ad + "/nc=" + nc + "/dt=" + dt + "/dec=" + dec + "/dac=" + dac ;
			
		// 	y = 1;
		// 	for( i=1; i<=5; i++ ){
		// 		if( $(this).attr('data-tc' + i) && $(this).attr('data-tcad' + i) && $(this).attr('data-tcdd' + i) ){
		// 			link = link + '/tc' + y + '=' + $(this).attr('data-tc' + i) + '/tcad' + y + '=' +  $(this).attr('data-tcad' + i) + '/tcdd' + y + '=' + $(this).attr('data-tcdd' + i); 
		// 			y++;
		// 		}
		// 	}
			
			// h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
			// if( h > 900 ) h = 900;
			// if( h < 600 ) h = 600;

		// 	try {
		// 		$.fancybox({
		// 			href: link,
		// 			type: 'iframe',
		// 			height: h, 
		// 			onStart : function(){
		// 				$("#fancybox-wrap").addClass("newClass");

		// 			},
  //                   onClosed : function(){
  //                       $("#fancybox-wrap").removeClass("newClass");
  //                   }
		// 		});
		// 	} catch(e) {
		// 		log_error(e.message, (session_id||''), '');
		// 	}
		//});
	})
};
