/* Functions for info and error popups*/
window.show_info_popup = function(where, text, at_top) {
    window.hide_error_popup('all');
    window.hide_info_popup();
    where.after('<samp generated="true" for="' + where.attr('id') + '" class="info">' + text + '</samp>');
};

window.hide_info_popup = function() {
    $('samp.info').remove();
    // $('samp.error:visible').show();
};

window.show_error_popup = function(where, text, idx ,at_top){
    where.addClass('error');
    window.hide_error_popup(idx);
    window.hide_info_popup();
    where.after('<samp generated="true" for="' + where.attr('id') + '" class="error _idx_'+idx+'">' + text + '</samp>');
     $('samp[class*="error _idx_"]:gt(0)').hide();
    // need to test for all servies before deleting
    // if ($('samp[class*="error _idx_"]').parents('div').hasClass('card-wrapper')) {
    //     $('samp[class*="error _idx_"]').hide();

    //     if ($('.card-number .card_input').hasClass('error')) {
    //         $('.card-number samp.error').show();
    //     } else if ($('.card-month .card_input').hasClass('error')) {
    //         $('.card-month samp.error').show();
    //     } else if ($('.card-year .card_input').hasClass('error')) {
    //         $('.card-year samp.error').show();
    //     } else if ($('.card-cvv .card_input').hasClass('error')) {
    //         $('.card-cvv samp.error').show();
    //     } else if ($('.card-holder .card_input').hasClass('error')) {
    //         $('.card-holder samp.error').show();
    //     }
    // }
};
window.hide_error_popup = function(idx){
    if(idx == "all"){
        $('[class*=_idx_]').remove();
    } else {
        $('._idx_' + idx).remove();
    }
};

/**
 * before init function connect jQuery
 *
 * window.enable_tooltip
 *
 * for use default tooltip use .js-tooltip
 * for use tooltip with arrow and custom content use .js-info-tooltip + .js-info-tooltip-popup
 * .js-info-tooltip       - add to target item
 * .js-info-tooltip-popup - add in the same item parent (this is content for js-info-tooltip)
 *
 */
window.enable_tooltip = function(){
    if ( !!jQuery.tooltipster ) {
    $('.js-tooltip').each(function(){
        var current_tooltip = $(this).next().html();
        $(this).tooltipster({
            contentAsHTML: true,
            content: current_tooltip,
            interactive: true,
            delay: 150,
            debug: false,
            arrowColor: "rgba(0,0,0,0.2)",
            trigger: 'custom',
            triggerOpen: {
                mouseenter: true,
                touchstart: true,
                click: true,
                tap: true
            },
            triggerClose: {
                scroll: true,
                mouseleave: true,
                originClick: true,
                touchleave: true,
                click: true,
                tap: true
            }
        });
    });

    $('.js-tooltip-text').each(function(){
        $(this).tooltipster({
            delay: 150,
            debug: false,
            arrowColor: "rgba(0,0,0,0.2)",
            maxWidth: 300,
            trigger: 'custom',
            triggerOpen: {
                mouseenter: true,
                touchstart: true,
                click: true,
                tap: true
            },
            triggerClose: {
                scroll: true,
                mouseleave: true,
                originClick: true,
                touchleave: true,
                click: true,
                tap: true
            }
        });
    });
    }
}

window.enable_magnific = function(){
    $('.js-magnific-link').each(function() {
        //change url for iframe popups
        var url = $(this).attr('href');
        //check if a has a data-type
        newUrl = url.indexOf( 'ajax=1' ) >= 0 ? url : (url + (url.indexOf( '?' ) >= 0 ? '&' : '?') + 'ajax=1');

        var dataTYpe =  ($(this).data('type') ? 'post' : 'ajax' );
        if( $(this).attr('data-mfp-type') == 'iframe'){
            dataTYpe = 'iframe';
        }
        var hasSpecClass = $(this).hasClass('open_infoframe');
        var hasVisaClass = $(this).hasClass('open_infoframe__visa');
        var hasEANTermsHotelClass = $(this).hasClass('ean_terms');

        var scrolling = ($(this).data('scrolling') && $(this).data('scrolling') === 'true' ? 'yes' : 'no' );

        var obj = $(this),
            opts = {
                type: dataTYpe,
                preloader: false,
                ajax: {
                    cursor: ''
                },

                iframe: {
                    markup: '<div class="mfp-iframe-scaler">'+
                    '<div class="mfp-close"></div>'+
                    '<iframe src = "'+newUrl+'" class="mfp-iframe" frameborder="0" allowfullscreen scrolling="' + scrolling + '">'+
                    '</iframe>'+
                    '</div>',

                    srcAction: ''
                },

                callbacks: {
                    open: function(){
                        if(hasSpecClass){
                            $('.mfp-content').addClass('open_infoframe');
                        }
                        if(hasVisaClass){
                            $('.mfp-content').addClass('open_infoframe__visa');
                        }
                        if (hasEANTermsHotelClass){
                            $('.mfp-content').addClass('ean_terms_class');
                        }
                        obj.trigger('mfp.c_open');

                    },
                    parseAjax: function(jqXHR) {
                        try {
                            var respon = jQuery.parseJSON(jqXHR.data);
                            //alert( "JSON" ); // undefined

                            jqXHR.data = '<div class="popup">';
                            jqXHR.data += '<div class="popup__header" >' + (respon.header || '&nbsp;') + '<div class="popup__close js-popup-close"></div>' + '</div>';
                            jqXHR.data += '<div class="popup__content" style="overflow: auto;">' + (respon.content || '&nbsp;') + '</div>';
                            if(respon.footer) jqXHR.data += '<div class="popup__footer">' + respon.footer + '</div>';
                            jqXHR.data += '</div>';

                        } catch (e) {
                            var respon = {};
                            respon.content = jqXHR.data;
                            // console.log(respon);

                            //alert( "HTML" );

                        }
                    },

                    updateStatus: function(data) {
                        if(data.status === 'error') {
                            message('msg_title', I18n.server_error, 'continue_button', function(){window.close_message();});
                            $('.mfp-content').css('display','inline-block');
                        }
                    },
                    ajaxContentAdded: function() {
                        // Ajax content is loaded and appended to DOM
                        // Calc popups height
                        var popupHeight = this.content,
                            popupContent = $('.popup__content'),
                            popupHeader = $('.popup__header').outerHeight();
                        // console.log(popupContent.height());
                        if(popupHeight.height() <  window.innerHeight){
                            popupContent.css('height', popupHeight.height() - popupHeader + "px");
                            // console.log(popupContent.height());
                        }else{
                            popupHeight.height('100%');
                            // console.log(popupContent.height());
                        }
                        $('.mfp-ajax-holder .popup').css('margin-top', -popupHeight.height()/2);  // for Ipad
                    },
                    close: function(){
                        var popupHeight = this.content,
                            popupContent = $('.popup__content');
                        if(popupHeight) popupHeight.height('auto');
                        if(popupContent) popupContent.height('auto');
                    }
                }
            };
        if (obj.data('magnificPopupOptions')) {
            $.extend(opts, obj.data('magnificPopupOptions'));
        }
        $(this).magnificPopup(opts);
    });
    // popups
    $('.js-popup-login').magnificPopup({
        type: 'inline',
        preloader: false
    });
    $('.js-popup-close').live('click', function (e) {
        e.preventDefault();
        $.magnificPopup.close();
    });
    $.ajaxPrefilter(function( options, originalOptions, jqXHR ) {
        if(options.crossDomain){
            options.url = options.url.replace(options.url.split("/")[2],window.location.host);
            jqXHR.setRequestHeader('X-Requested-With','XMLHttpRequest');
        }
    });
}

// Magnific inline popups

window.enable_magnific_inline = function() {

    $('.js-magnific-link-inline').each(function() {

        $(this).magnificPopup({
            items : {
                src:  $(this).attr('href'),
                type: 'inline'
            },
            callbacks:{

                open: function() {
                    var hasSpecClass = $(".js-magnific-link-inline.ins__btn").hasClass('inline-dark-popup');
                    var popupHeight = $('.popup');

                    $('.mfp-inline-holder .popup').css('margin-top', -popupHeight.height()/2);  // for Ipad
                    if(hasSpecClass){
                        $('.mfp-bg').addClass('inline-dark-popup');
                    }
                },

                сlose: function() {
                    $('.mfp-bg').removeClass('inline-dark-popup');
                }
            }
        });
    });
}

//Magnific POPUP
window.show_login = function(){
    if(window.location.protocol.indexOf("s")!=-1){
        window.hide_error_popup('all');
        $('body').css({'overflow':'hidden'});
        $('#log_reg_popup').css({'overflow':'auto'});
        $('.hasDatepicker').datepicker('hide');
        $("#log_reg_popup").show();
        if(navigator.platform == 'iPad' || navigator.platform == 'iPhone' || navigator.platform == 'iPod') {
            $(".popup_login ")
                .css('transform' , 'none')
                .css('position' , 'fixed')
                .css("top", "250px");
        };
    }
    else{
        window.location.href = "https://" +window.location.host+ "/" + window.lang_prefix +"login_page"
    }
    // disable_scroll()
};


window.hide_login = function(){
    window.hide_error_popup('all');
    $("#log_reg_popup").find("input").each(function(){
        $(this).removeClass("error");
        if($(this).attr("type")!="submit"){
            $(this).val("");
        }
    });
    $("#reg_popup,#forgot_popup,.form_row.hidden").hide();
    $("#login_popup").show();
    $("#log_reg_popup").hide();
    $('.login_loader').hide();
    $('body').removeAttr('style');
    $('#log_reg_popup').removeAttr('style');
    // enable_scroll()
};

window._show_reset_email_block = function(){
    if(window.location.protocol.indexOf("s")!=-1){
        window.hide_error_popup('all');
        $('body').css({'overflow':'hidden'});
        $('#log_reg_popup').css({'overflow':'auto'});
        $('.hasDatepicker').datepicker('hide');
        $("#log_reg_popup").show();
        if(navigator.platform == 'iPad' || navigator.platform == 'iPhone' || navigator.platform == 'iPod') {
            $(".popup_login ")
                .css('transform' , 'none')
                .css('position' , 'fixed')
                .css("top", "250px");
        };
    }
    else{
        window.location.href = "https://" +window.location.host+ "/" + window.lang_prefix +"login_page"
    }
    // disable_scroll()
};


window.enable_input_plugin = function(element){
    var checked_elements = element.find('input[type="radio"], input[type="checkbox"]').not('.ignore-icheck');
    checked_elements.iCheck({
        checkboxClass: 'icheckbox_minimal',
        radioClass:    'iradio_minimal'
    });
    checked_elements.on('ifClicked', function(ev){
        $(ev.target).change();
        $('input[name="' + $(ev.target).prop('name') + '"]').parent().removeClass('error').find('samp').remove();
    });
//    var select_config = {
//        '.chosen-select-deselect'  : {allow_single_deselect: true},
//        '.chosen-select-no-search' : {disable_search_threshold: 10},
//        '.chosen-select-no-results': {no_results_text: window.I18n.selectivity.no_results_for_term},
//        '.chosen-select-width'     : {
//          width: "95%",
//          search_contains: true
//      }
//    };
    var select_default_config = {
        allow_single_deselect: true,
        disable_search_threshold: 10,
        no_results_text: window.I18n.selectivity.no_results_for_term,
        width: "95%",
        search_contains: true,
        '.chosen-select-no-search' : {
            disable_search: true,
            inherit_select_classes: true
        },
    };
    element.find('select').each(function() {
//        var element_config = {};
//        for (var config_key in select_config) {
//            element_config = $.extend(element_config, select_config[config_key]);
//        }
        var element_config = select_default_config;
        if ($(this).data('select-options')) {
            element_config = $.extend({}, element_config, $(this).data('select-options'));
        }
        $(this).chosen(element_config);



        if ($(this).hasClass('chosen-select-required')) {
            $(this).on("change", function(ev) {
                $(ev.currentTarget).parent().removeClass('error').find('samp').remove();
            });
            $(this).on("chosen:showing_dropdown", function(ev) {
                $(ev.currentTarget).parent().removeClass('error').find('samp').remove();
            });
        }
    });
    if ($('.chosen-container').length > 0) {
        $('.chosen-container').on('touchend', function(e){
            e.stopPropagation(); e.preventDefault();
            $(this).trigger('mousedown');
        });
    }
};
window.disable_input_plugin = function(element){
    var checked_elements = element.find('input[type="radio"], input[type="checkbox"]');
    checked_elements.iCheck('destroy');
    element.find('select').each(function() {
        $(this).chosen();
        $(this).chosen('destroy');
    });
};

window.is_mobile_iOS = (/iphone|ipad|ipod/i).test(navigator.userAgent.toLowerCase());

$(window).bind('keyup', function(e){
    if ($(e.target).hasClass('tab_gender_select') && e.keyCode == 32){
        setTimeout(function(){
            $(e.target).trigger('change');
        }, 100);
    }
});

$(function() {
    if( typeof(_show_login) != "undefined" && _show_login ){
        window.show_login();
    }
    if( typeof(_show_reset_email) != "undefined" && _show_reset_email ){
        window._show_reset_email_block();
    }

    /* Google Maps prototypes*/
    (function () {
        if(typeof(google) != "undefined"){
            google.maps.Map.prototype.markers = [];
            google.maps.Map.prototype.addMarker = function(marker) {
                this.markers[this.markers.length] = marker;
            };

            google.maps.Map.prototype.getMarkers = function() {
                return this.markers;
            };
            google.maps.Map.prototype.clearMarkers = function() {
                for(var i=0; i<this.markers.length; i++){
                    this.markers[i].setMap(null);
                }

                this.markers = [];
            };
        }

    })();
    window.hotel_map_is_visible = false;
    $('body').click(function(ev){
        if(window.hotel_map_is_visible && !$(ev.target).parents(".hotel_address").size() &&  !$(ev.target).parents(".map_popup").size() && $(ev.target).prop('tagName')!="IMG" && !$('.map_popup').hasClass("hotels_on_map")){
            $(".map_popup").hide()
            window.hotel_map_is_visible = false;
        }
        if($('.autocomplete:first').hasClass('ui-autocomplete-input')){ $('.autocomplete').autocomplete('close'); }
        if ($(ev.target).parents('.persons_select_popup').length === 0 && $(ev.target).parents('.persons_field').length === 0){
            $('.persons_select_popup').hide();
        }
        if ($(ev.target).parents('.person-group').length === 0){
            $('.person-group').hide();
        }
        if ($(ev.target).parents('.feedback_block').length === 0){
            $('.feedback_popup').hide();
        }
        if ($(ev.target).parents('.js-persons-select-popup').length === 0){
            $('.js-persons-select-popup').hide();
        }
    });

    $('body').bind('keyup', function(ev){
        var target = $(ev.target);
        if( ev.keyCode == 9 && target.prev().hasClass('toggle_when_focus') ){
            target.parents('.field').find('.sbSelector').click();
        }
    });

    /* Enable plugin for checboxes ,radio,select */
    window.enable_input_plugin($(document));

    $('.show_buttons input, .currency_buttons input, .checkbox-button').iCheck('destroy');
    $( ".show_buttons, .currency_buttons, .checkbox-button" ).buttonset();

//  $(".change_search").click(function(ev){
//    if(!$(ev.target).hasClass("logout")){
//      ev.preventDefault();
//      $(".new_search").slideToggle();
//      $('.js-datepicker').datepicker('hide');
//    }
//  });

    $(".change-search-parameters").click(function(ev){
        if(!$(ev.target).hasClass("logout")){
            ev.preventDefault();
            $(this).toggleClass('active_btn');
            // $(".new_search").slideToggle();
            // $(".js-tripinfo-block").slideToggle();
            $('.hasDatepicker').datepicker('hide');

            var _self = $('.js-main-search');
            _self.slideToggle('fast');
        }
    });

    window.setup_social_load();

    $('#ui-datepicker-div').click(function(e){
        e.stopPropagation();
    });

    $('[name="direction"]').change(function(){
        $(".js-datepicker").datepicker("hide");
    });

    $(document).click(function(e){
        var target = e.target;
        if($(target).hasClass('ui-corner-all') || $(target).parent().hasClass("ui-corner-all")){
            return;
        }
        if(typeof(window.not_use_default_datepicker_hide) == "undefined" && !$(target).hasClass('js-datepicker') && !$(target).hasClass("ui-autocomplete") && !$(target).parents(".ui-datepicker").size() && $('#ui-datepicker-div').is(":visible")) {
            $(".js-datepicker").datepicker("hide");
        }
        if(!$(target).parents(".nationality_my_class").size() &&  !$(target).hasClass("nationality_select")){
            if($(".nationality_select").size() > 0){
                $(".nationality_select").each(function(){
                    $(this).autocomplete();
                    $(this).autocomplete("close");
                })
            }
        }
        if(!$(target).parents('.js-tabs').size() && !$(target).parents('.filters-item').size()){
            $.publish('train_close_filter');
        }
    });
    $("input").focus(function(e){
        var target = e.target;
        if(!$(target).parents(".nationality_my_class").size() && !$(target).hasClass("nationality_select")){
            if($(".nationality_select").size() > 0){
                $(".nationality_select").each(function(){
                    $(this).autocomplete("close");
                })
            }
        }
    });

    $(".js-login").click(function(){
        window.show_login();
        $('.js-dropdown').removeClass('active'); //for task --> VE-243
        return false;
    });

    $(".js-logout").click(function(){
        if(!confirm(window.I18n.logout_mesage)) {
            return false;
        }
    });
    window.check_cookies_enabled();

    $('.icheckbox_minimal').on('ifClicked', function(ev){
        var trg = $(ev.target).closest('.icheckbox_minimal');

        setTimeout(function(){
            if(trg.prev().hasClass('checked')){
                trg.iCheck('check');
            }
        }, 250);
    });

    $.cookie("client_time_offset",(-(new Date()).getTimezoneOffset()/60), {path: '/'});

    $('a.help-link').click(function(e){
        e.preventDefault();
    })


    $(window).scroll(function(){
        $("input.error").each(function(){
            var id = $(this).attr('id') + "_error"
            var new_top = $(this).offset().top + $(this).height() + 25
            $("#"+id).offset({top:new_top})
        });
    })


});

function scrollToDiv(element, navheight) {
    var offset = element.offset();
    var offsetTop = offset.top;
    var totalScroll = offsetTop - navheight;
    $('body,html').animate({
        scrollTop: totalScroll
    }, 500);
};

function scrollElementToCenterScreen(element) {
    var elOffset = element.offset().top, elHeight = element.height(), windowHeight = $(window).height(), offset, speed = 700;
    if (elHeight < windowHeight) {
        offset = elOffset - ((windowHeight / 2) - (elHeight / 2));
    } else {
        offset = elOffset;
    }
    $('html, body').animate({scrollTop: offset}, speed);
};

function message(title_index, text, button_index, action, close_on_bc_click, btn_olready_text){
    if($('.js-globus-loader:visible')) window.hide_globus_loader();
    $.magnificPopup.open({
        closeOnBgClick: (typeof(close_on_bc_click) === "undefined"),
        items: {
            src: _message_popup_content(title_index, text, button_index, action, btn_olready_text),
            type: 'inline'
        }
    }, 0);
}

function _message_popup_content(title_index, text, button_index, action, btn_olready_text)
{
    btn_olready_text = btn_olready_text || false;
    var repeat_url = 'none';
    if(text && (-1 < text.indexOf('repeat_search'))){
        var url = text.match(/[0-9a-zA-Z.|/:]{0,}[a-zA-Z0-9]{1}[/]preloader[/][0-9a-zA-Z.|/]{0,}/);
        if(url){
            repeat_url = url[0];
        }
        text = text.split('repeat_search=')[0];
        text = text.replace('repeat_search', '');
        button_index = 'repeat_btn';
    }
    var popup_content = $(
        '<div id="alert_popup" class="popup" >'
        + '<div class="popup__header">'
        + window.I18n[title_index]
        + '<div class="popup__close js-popup-close"><button title="Close (Esc)" type="button" class="mfp-close">×</button></div>'
        + '</div>'
        + '<div class="popup-info__content">'
        + '<p class="popup-info__text">' + text + '</p>'
        + '</div>'
        + '<div class="popup__footer">'
        + '<a href="#" class="btn js-popup-btn">' + ((btn_olready_text)?button_index:window.I18n[button_index]) + '</a>'
        + '</div>'
        + '</div>'
    );

    if(button_index == "repeat_btn" && repeat_url !== 'none'){
        popup_content.find('.js-popup-btn').click(function() {
            $(location).attr('href',repeat_url);
        });
    }else{
        popup_content.find('.js-popup-btn').click(function() {
            action();
            return false;
        });
    }
    popup_content.find('.js-popup-close').click(function() {
        action();
        return false;
    });
//     $.magnificPopup.open({
//         closeOnBgClick: close_popup,
//         fixedContentPos: 'auto',
//         overflowY: 'hidden',
//         items: {
//             src: popup_content,
//             type: 'inline'
//         }
//     }, 0);
// }
    return popup_content;
};

function verification_message(title_index, text, button_index, close_on_bc_click){
    if($('.js-globus-loader:visible')) window.hide_globus_loader();

    $.magnificPopup.open({
        closeOnBgClick: (typeof(close_on_bc_click) === "undefined"),
        items: {
            src: _verification_content(title_index, text, button_index),
            type: 'inline'
        }
    }, 0);

    var contentHeight = $(document.body).height(),
        parentBody = window.parent.document.body;
    $('#verification_popup').animate({
        height: contentHeight + 40,
        maxHeight : '550px',
        minWidth: '900px'
    }, 100)
        .css('position', 'relative');

    var siteloader = $('#siteloader');
    var source = siteloader.attr('source');
    siteloader.html('<object style=\"width:100%;\" data=\"' + source + '\">');

    $('.booking-continue').on('click', function(){
        $(".js-book-button").trigger('click');
        $.magnificPopup.close();
    });
}

function _verification_content(title_index, text, button_index) {
    var popup_content = $(
        '<div id="verification_popup" class="popup">'
        + '<div class="popup__header">'
        + window.I18n[title_index]
        + '<div class="popup__close js-popup-close"><button title="Close (Esc)" type="button" class="mfp-close">×</button></div>'
        + '</div>'
        + '<div class="popup-info__content" style="height:75%;">'
        + '<p class="popup-info__text">' + text + '</p>'
        + '</div>'
        + '<div class="popup__footer" style="padding-top: 5px;">'
        + '<a href="#" class="btn js-popup-btn booking-continue">' + window.I18n[button_index] + '</a>'
        + '</div>'
        + '</div>'
    );
    return popup_content;
}

function confirm_message(title_index, text, submit_button_index, submit_action, cancel_button_index, cancel_action, close_on_bc_click) {
    var close_popup = typeof(close_on_bc_click) == "undefined";
    var popup_content = $(
        '<div id="alert_popup" class="popup " >'
        + '<div class="popup__header">'
        + window.I18n[title_index]
        + '<div class="popup__close js-popup-close"><button title="Close (Esc)" type="button" class="mfp-close">×</button>'
        +'</div>'
        + '</div>'
        + '<div class="popup-info__content">'
        + '<p>' + text + '</p>'
        + '</div>'
        + '<div class="popup__footer">'
        + '<a href="#" class="btn js-popup-btn">' + window.I18n[submit_button_index] + '</a>'
        + '</div>'
        + '</div>'
    );
    popup_content.find('.js-popup-btn').click(function() {
        submit_action();
        return false;
    });
    popup_content.find('.js-popup-close').click(function() {
        cancel_action();
        return false;
    });
    popup_content.find('.popup__footer').append('<span class="popup__footer-info"> <a href="#" class="inline-link">'+window.I18n[cancel_button_index]+'</a></span>');
    var cancelBtn = popup_content.find('.inline-link');


    cancelBtn.click(function(ev){
        ev.preventDefault();
        cancel_action();
    });

    $.magnificPopup.open({
        closeOnBgClick: close_popup,
        items: {
            src: popup_content,
            type: 'inline'
        }
    }, 0);
};

function auto_search_message(title_index, text, submit_button_index, submit_action, cancel_button_index, auto_search_action, cancel_action) {
    var popup_content = $(
        '<div id="alert_popup" class="popup" >'
        + '<div class="popup__header">'
        + window.I18n[title_index]
        + '<div class="popup__close js-popup-close"><button title="Close (Esc)" type="button" class="mfp-close">×</button></div>'
        + '</div>'
        + '<div class="popup-info__content">'
        + '<p>' + text + '</p>'
        + '</div>'
        + '<div class="popup__footer">'
        + '<a href="#" class="btn js-popup-btn">' + window.I18n[submit_button_index] + '</a>'
        + '</div>'
        + '</div>'
    );
    popup_content.find('.js-popup-btn').click(function() {
        submit_action();
        return false;
    });
    popup_content.find('.js-popup-close').click(function() {
        window.close_message();
        cancel_action();
        return false;
    });
    popup_content.find('.popup__footer').append('<span class="popup__footer-info"> <a href="#" class="inline-link">'+window.I18n[cancel_button_index]+'</a></span>');
    var cancelBtn = popup_content.find('.inline-link');


    cancelBtn.click(function(ev){
        ev.preventDefault();
        auto_search_action();
    });

    $.magnificPopup.open({
        closeOnBgClick: false,
        items: {
            src: popup_content,
            type: 'inline'
        }
    }, 0);
};

function propose_message(title_index, text, previous_departure_date, next_departure_date, previous_button_index, previous_submit_action, next_button_index, next_submit_action, cancel_action) {
    var popup_content = $(
        '<div id="alert_popup" class="popup" >'
        + '<div class="popup__header">'
        + window.I18n[title_index]
        + '<div class="popup__close js-popup-close"><button title="Close (Esc)" type="button" class="mfp-close">×</button></div>'
        + '</div>'
        + '<div class="popup-info__content">'
        + '<p>' + text + '</p>'
        + '</div>'
        + '<div class="popup__footer">'
        + '</div>'
        + '</div>'
    );

    if (next_departure_date) {
        popup_content.find('.popup__footer').append('<a href="#" class="btn js-popup-btn-next">' + window.I18n[next_button_index] + ' ' + next_departure_date + '</a>');
    }

    if (previous_departure_date) {
        popup_content.find('.popup__footer').append('<a href="#" class="btn js-popup-btn-previous">' + window.I18n[previous_button_index] + ' ' + previous_departure_date + '</a>');
    }

    popup_content.find('.js-popup-btn-previous').click(function() {
        previous_submit_action();
        return false;
    });
    popup_content.find('.js-popup-btn-next').click(function() {
        next_submit_action();
        return false;
    });
    popup_content.find('.js-popup-close').click(function() {
        window.close_message();
        cancel_action();
        return false;
    });

    $.magnificPopup.open({
        closeOnBgClick: false,
        items: {
            src: popup_content,
            type: 'inline'
        }
    }, 0);
};

window.close_message = function(){
    $.magnificPopup.close();
    return false;
};

$(document).ready(function(){
    if( typeof( $().placeholder ) == 'function' ){
        $('input, textarea').placeholder(); //on mobile version there is no placeholder script
    }

    $('.card_data input.ph_bg').live('focus',function(){
        $(this).removeClass('ph_bg');
    }).blur(function(){
        if ($(this).val() == '') {
            $(this).addClass('ph_bg');
        }
    });
    /*fancy header*/
    setTimeout(function(){ $('.js-nav-list').css('overflow','visible') }, 150);
    //if(window.cur_domain != 'avia'){  // CTN-293
    if ( !!jQuery.fn.flexMenu ) {
        $('.js-nav-list').flexMenu({
            'linkText': window.I18n.menu_all_btn,
            'showOnHover': false,
            'cutoff' : 2,
            'threshold' : 2,
            'linkTextAll' : window.I18n.menu_show_all_service, // [string] If we hit the cutoff, what text should we display on the "view more" link?
            'linkTitleAll' : window.I18n.menu_show_all_service
        });
    }
    // datepicker
    $.datepicker.setDefaults( $.datepicker.regional[ "ru" ] );
    $( ".js-datepicker" ).datepicker({
        numberOfMonths: 2,
        beforeShow: function(input, inst) {
            $('#ui-datepicker-div').addClass("main_datepicker");
        }
    });


    window.enable_magnific();
    window.enable_magnific_inline();
    window.enable_tooltip();
    // window.enable_slick_sliders(); // enable slick slider

    //переключалки вкладок в попапі
    LoginPopup = $('#login-popup');
    LoginPopupSection = LoginPopup.find('.popup__content');
    LoginPopupSection.filter(':not([data-section="login-popup__login"])').hide();
    LoginPopup.find('a[data-trigger]').click(function(){
        LoginPopupSection.hide();
        $('[data-section="'+$(this).attr('data-trigger')+'"]').show();
    });
    //переключалки вкладок в попапі

    // мобільна навігація
    $('.js-showLeftNav').on('click',function(){
        $('body').addClass('push-right');
    });

    function removeNavClasses(){
        $('body').removeClass('push-left');
        $('body').removeClass('push-right');
    }

    $(window).resize(removeNavClasses)
    $('.js-nav-close').click(removeNavClasses);
    // мобільна навігація

    $('samp').live('click',function(){
        $(this).remove();
    });

    var offset = 500;
    var duration = 500;
    $(window).scroll(function() {
        if ($(this).scrollTop() > offset) {
            $('.scrollTop').fadeIn(duration);
        } else {
            $('.scrollTop').fadeOut(duration);
        }
    });
    $('.scrollTop').on('click', function(event) {
        event.preventDefault();
        $('html, body').animate({scrollTop: 0}, 500);
        return false;
    });

    // prevent touchend event for planshet devices
    if ($('.chosen-container').length > 0) {
      $('.chosen-container').on('touchend', function(e){
        e.stopPropagation(); e.preventDefault();
        $(this).trigger('mousedown');
      });
    }

    $('.js-tooltip-init').tooltip();
});

window.render_popups = function(ajax_data, type){
    switch (type){
        case "content":
            break;
        case "alert":
            break;
        case "error":
            break;
    }
}

var insWithAviaObj;

window.check_tab_click = function(selector){
    $(selector).click(function(ev){
        ev.preventDefault();
        $(window).unbind('beforeunload');
        window.location.href = $(ev.target).attr("href");
    })
};

window.disable_slick_sliders = function(){
    if($('.js-slick_single').length){
        $('.js-slick_single').each(function() {
            var slides = $(this).find('div');
            if($(slides).length > 1){
                $(this).slick('unslick');
            }
        });
    }
    if($('.js-slick_multiple').length){
        $('.js-slick_multiple').each(function() {
            var slides = $(this).find('div');
            if($(slides).length > 1){
                $(this).slick('unslick');
            }
        });
    }
    if($('.js-slick_variable-width').length){
        $('.js-slick_variable-width').each(function() {
            var slides = $(this).find('div');
            if($(slides).length > 1){
                $(this).slick('unslick')
            }
        });
    }
    if($('.js-slick_syncling').length){
        $('.js-slick_syncling').each(function(){
            $(this).find('.js-slick_syncling__main').slick('unslick');
            $(this).find('.js-slick_syncling__nav').slick('unslick');
        });
    }
};


window.enable_slick_sliders = function(){
    if($('.js-slick_single').length){
        $('.js-slick_single').each(function() {
            var slides = $(this).find('div');
            if($(slides).length > 1){
                $(this).slick({
                    autoplay: true,
                    autoplaySpeed: 5000,
                });
            }
        });
    }
    if($('.js-slick_multiple').length){
        $('.js-slick_multiple').each(function() {
            var slides = $(this).find('div');
            if($(slides).length > 1){
                $(this).slick({
                    infinite: true,
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    autoplay: true,
                    autoplaySpeed: 5000
                });
            }
        });
    }
    if($('.js-slick_variable-width').length){
        $('.js-slick_variable-width').each(function() {
            var slides = $(this).find('div');
            if($(slides).length > 1 && !$(this).hasClass('slick-initialized')){
                $(this).slick({
                    dots: false,
                    infinite: true,
                    speed: 300,
                    slidesToShow: 5,
                    variableWidth: true
                })
            }
        });
    };
    if($('.js-slick_syncling').length){
        $('.js-slick_syncling').each(function(){
            $(this).find('.js-slick_syncling__main').slick({
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: false,
                fade: true,
                asNavFor: '.js-slick_syncling__nav'
            });
            $(this).find('.js-slick_syncling__nav').slick({
                slidesToScroll: 1,
                asNavFor: '.js-slick_syncling__main',
                arrow: true,
                focusOnSelect: true,
                autoplay: true,
                autoplaySpeed: 5000
            });
        });
    };
    if($('.js-slick-responsive').length){
        $('.js-slick-responsive').each(function(){
            $(this).slick({
                dots: false,
                infinite: false,
                speed: 300,
                slidesToShow: 5,
                slidesToScroll: 1,
                swipe:false,
                respondTo: 'slider',
                focusOnSelect: false,
                prevArrow: "<button type='button' class='slick-prev'>&lsaquo;</button>",
                nextArrow: "<button type='button' class='slick-next'>&rsaquo;</button>",
                responsive: [
                    {
                        breakpoint: 1024,
                        settings: {
                            slidesToShow: 5,
                            slidesToScroll: 1,
                            infinite: false,
                            focusOnSelect: false,
                            dots: false
                        }
                    },
                    {
                        breakpoint: 900,
                        settings: {
                            slidesToShow: 4,
                            slidesToScroll: 1,
                            focusOnSelect: false,
                            swipe:true
                        }
                    },
                    {
                        breakpoint: 700,
                        settings: {
                            slidesToShow: 3,
                            slidesToScroll: 1,
                            focusOnSelect: false,
                            swipe:true
                        }
                    },
                    {
                        breakpoint: 570,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 1,
                            focusOnSelect: false,
                            swipe:true
                        }
                    },
                    {
                        breakpoint: 480,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 1,
                            focusOnSelect: false,
                            swipe:true
                        }
                    },
                    {
                        breakpoint: 380,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1,
                            focusOnSelect: false,
                            swipe:true
                        }
                    }
                ]
            });
        })
    }

    // if($('.js-slick-responsive-4').length){
    //     $('.js-slick-responsive-4').each(function(){
    //         $(this).slick({
    //             dots: false,
    //             infinite: false,
    //             speed: 300,
    //             slidesToShow: 4,
    //             slidesToScroll: 1,
    //             swipe:false,
    //             respondTo: 'slider',
    //             focusOnSelect: true,
    //             prevArrow: "<button type='button' class='slick-prev'>&lsaquo;</button>",
    //             nextArrow: "<button type='button' class='slick-next'>&rsaquo;</button>",
    //             responsive: [
    //                 {
    //                     breakpoint: 1024,
    //                     settings: {
    //                         slidesToShow: 4,
    //                         slidesToScroll: 1,
    //                         infinite: false,
    //                         focusOnSelect: true,
    //                         dots: false
    //                     }
    //                 },
    //                 {
    //                     breakpoint: 900,
    //                     settings: {
    //                         slidesToShow: 3,
    //                         slidesToScroll: 1,
    //                         focusOnSelect: true,
    //                         swipe:true
    //                     }
    //                 },
    //                 {
    //                     breakpoint: 700,
    //                     settings: {
    //                         slidesToShow: 3,
    //                         slidesToScroll: 1,
    //                         focusOnSelect: true,
    //                         swipe:true
    //                     }
    //                 },
    //                 {
    //                     breakpoint: 570,
    //                     settings: {
    //                         slidesToShow: 2,
    //                         slidesToScroll: 1,
    //                         focusOnSelect: true,
    //                         swipe:true
    //                     }
    //                 },
    //                 {
    //                     breakpoint: 480,
    //                     settings: {
    //                         slidesToShow: 2,
    //                         slidesToScroll: 1,
    //                         focusOnSelect: true,
    //                         swipe:true
    //                     }
    //                 },
    //                 {
    //                     breakpoint: 380,
    //                     settings: {
    //                         slidesToShow: 1,
    //                         slidesToScroll: 1,
    //                         focusOnSelect: true,
    //                         swipe:true
    //                     }
    //                 }
    //             ]
    //         });
    //     })
    // }
}
window.onload = function() {
    if ($('ul.nav.js-accordion').length > 0) {
        if ($('ul.nav.js-accordion li.active').length > 0) {
            $('ul.nav.js-accordion li.active').parent().show();
        }
        $('.js-accordion-item').click(function(ev){
            if ($(ev.currentTarget).next().length > 0 || $(ev.currentTarget).attr('href') === '' || $(ev.currentTarget).attr('href') === '#') {
                if($(ev.currentTarget).next().is(':hidden')) {
                    $(ev.currentTarget).closest('.js-accordion').find('.js-accordion-item').removeClass('active');
                    $(ev.currentTarget).closest('.js-accordion').find('.js-accordion-content').slideUp();
                }
                $(ev.currentTarget).toggleClass('active').next().slideToggle();
                $(ev.currentTarget).css('cursor', 'pointer');
                ev.preventDefault();
            }
        });
    }
};

window.show_globus_loader = function(){
    $('.js-globus-loader').removeClass('hidden');
}
window.chosenTablet = function(){
    if ($('.chosen-container').length > 0) {
        $('.chosen-container').on('touchend', function(e){
            e.stopPropagation(); e.preventDefault();
            $(this).trigger('mousedown');
        });
    }
}
window.hide_globus_loader = function(){
    $('.js-globus-loader').addClass('hidden');
}

if(!Base64){
    var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(r){var t,e,o,a,h,n,c,d="",C=0;for(r=Base64._utf8_encode(r);C<r.length;)t=r.charCodeAt(C++),e=r.charCodeAt(C++),o=r.charCodeAt(C++),a=t>>2,h=(3&t)<<4|e>>4,n=(15&e)<<2|o>>6,c=63&o,isNaN(e)?n=c=64:isNaN(o)&&(c=64),d=d+this._keyStr.charAt(a)+this._keyStr.charAt(h)+this._keyStr.charAt(n)+this._keyStr.charAt(c);return d},decode:function(r){var t,e,o,a,h,n,c,d="",C=0;for(r=r.replace(/[^A-Za-z0-9\+\/\=]/g,"");C<r.length;)a=this._keyStr.indexOf(r.charAt(C++)),h=this._keyStr.indexOf(r.charAt(C++)),n=this._keyStr.indexOf(r.charAt(C++)),c=this._keyStr.indexOf(r.charAt(C++)),t=a<<2|h>>4,e=(15&h)<<4|n>>2,o=(3&n)<<6|c,d+=String.fromCharCode(t),64!=n&&(d+=String.fromCharCode(e)),64!=c&&(d+=String.fromCharCode(o));return d=Base64._utf8_decode(d)},_utf8_encode:function(r){r=r.replace(/\r\n/g,"\n");for(var t="",e=0;e<r.length;e++){var o=r.charCodeAt(e);128>o?t+=String.fromCharCode(o):o>127&&2048>o?(t+=String.fromCharCode(o>>6|192),t+=String.fromCharCode(63&o|128)):(t+=String.fromCharCode(o>>12|224),t+=String.fromCharCode(o>>6&63|128),t+=String.fromCharCode(63&o|128))}return t},_utf8_decode:function(r){for(var t="",e=0,o=c1=c2=0;e<r.length;)o=r.charCodeAt(e),128>o?(t+=String.fromCharCode(o),e++):o>191&&224>o?(c2=r.charCodeAt(e+1),t+=String.fromCharCode((31&o)<<6|63&c2),e+=2):(c2=r.charCodeAt(e+1),c3=r.charCodeAt(e+2),t+=String.fromCharCode((15&o)<<12|(63&c2)<<6|63&c3),e+=3);return t}};
}

window.IE_detect = function(){ // detect IE browser
  var ua = window.navigator.userAgent;
  var msie = ua.indexOf('MSIE ');
  if (msie > 0) {
    // IE 10 or older => return version number
    return true;
  }
  var trident = ua.indexOf('Trident/');
  if (trident > 0) {
    // IE 11 => return version number
    var rv = ua.indexOf('rv:');
    return true;
  }
  var edge = ua.indexOf('Edge/');
  if (edge > 0) {
    // Edge (IE 12+) => return version number
    return true;
  }
  // other browser
  return false;
}