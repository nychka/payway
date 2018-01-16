$(function(){

	// Tabs script
	//  Model:
	//  .js-tabs
	//    .js-tabs-nav
	//       li.active
	//         a
	//    .js-tabs-content
	//        div(li)
	//           .js-close

	/*$(".js-tabs-nav a, .js-tabs-nav label").bind("click", function(event){
		event.preventDefault();
		var cur_tab_nav = $(this).parent("li");
		$(".js-tabs-nav li").removeClass("active");
		cur_tab_nav.addClass("active");
		$(this)
			.closest(".js-tabs").find(".js-tabs-content")
			.children().hide()
			.eq(cur_tab_nav.index()).show();

		if( $(this).parents('.js-tabs-nav').data("callback") ){
			eval($(this).parents('.js-tabs-nav').data("callback"));
		}
	}); */

	// tabs close button script
	/*$(".js-tabs-content .js-close").bind("click", function(event) {
		event.preventDefault();
		var cur_tab = $(this).parent();
		cur_tab.hide();
		$(this)
			.closest(".js-tabs").find(".js-tabs-nav li")
			.eq(cur_tab.index()).removeClass("active");
	});*/

	//if ($('ul.nav.js-accordion li.active').length > 0) {
	// 	$('ul.nav.js-accordion li.active').parent().show();
	//}
	/*
	*	Accordion script
	*	Model:
	*		.js-accordion
	*			.js-accordion-item
	*				.active
	*			.js-accordion-content
	*/
	//$('.js-accordion-item').click(function(ev){
    //if ($(ev.currentTarget).next().length > 0 || $(ev.currentTarget).attr('href') === '' || $(ev.currentTarget).attr('href') === '#') {
     //   if($(ev.currentTarget).next().is(':hidden')) {
     //           $(ev.currentTarget).closest('.js-accordion').find('.js-accordion-item').removeClass('active');
     //           $(ev.currentTarget).closest('.js-accordion').find('.js-accordion-content').slideUp();
     //   }
     //   $(ev.currentTarget).toggleClass('active').next().slideToggle();
     //   $(ev.currentTarget).css('cursor', 'pointer');
     //   ev.preventDefault();
    //}
	//});

	/*
	 *	Menu Toggle Script
	 *	min-width: 768
	 *
	*/
	menuToggle = function(){
		var toggle 		= $('.js-toggle-item'),
			menu 		= $('.nav.js-accordion'),
			menuHeight 	= menu.height();

		toggle.click(function(ev){
			$(ev.currentTarget).toggleClass('active').closest('.js-toggle').find('.nav').slideToggle();
			ev.preventDefault();
		});
		$(window).resize(function(){
			var windowW = $(window).width();
			if(windowW > 768 && menu.is(':hidden')) {
				menu.removeAttr('style');
			}
		});
	},
	menuToggle();

	window.TextFieldTranslitFilter = new function(){
		var self = this,
			initialized = [],
			jobs = [];

		this.init = function(element){
			initialized.push(element);
			var char_list = window.getTranslitObject(),
				  regex_replace = new RegExp('['+Object.keys(char_list).join("")+']',"gi");
			$(element).filter_input({translit:char_list, regex:'[a-zA-Z0-9@.!_-]' });
			$(document).off("focusout", element)
				.on("focusout", element, function(){
					$(this).val($(this).val().replace(regex_replace, function(matched){return char_list[matched]}));
				});
			$(document).off("paste", element)
				.on("paste", element, function(e){
					var text = false;
					if(window.clipboardData) text = window.clipboardData.getData("Text");
					else if ((e.originalEvent || e).clipboardData) text = (e.originalEvent || e).clipboardData.getData('text/plain');
					if(text){
						e.preventDefault();
						$(e.target).val( text.replace(regex_replace, function(matched){return char_list[matched]}).replace(/\s/g,"") );
					}
				});
		};

		this.initJobs = function(){
			$.each(jobs, function(key,el){ if(initialized.indexOf(el) == -1 && $(el).length) self.init(el);});
			jobs = [];
		};

		this.add = function(el){
			if (typeof $.fn.filter_input == "undefined" && jobs.indexOf(el) == -1) {
				if (!jobs.length) $.getScript('/js/jquery.filter_input.js', function(){self.initJobs();});
				jobs.push(el);
			} else if(initialized.indexOf(el) == -1 && $(el).length) self.init(el);
		};
	};

});
