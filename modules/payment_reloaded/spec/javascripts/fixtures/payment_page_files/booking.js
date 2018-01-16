;window.enable_input_plugin = function(){};
$(document).ready(function(){
 var checked_elements = $('input[type="radio"].tab_gender_select, input[type="checkbox"].tab_gender_select');
  checked_elements.push($('.popup__content input[type="radio"], .popup__content input[type="checkbox"]'));
  checked_elements.push($('.card-type-list.markups_js input[type="radio"]'));
  checked_elements.iCheck({
      checkboxClass: 'icheckbox_minimal',
      radioClass:    'iradio_minimal'
  });

  var checked_elements = $('input[type="radio"]:not(.tab_gender_select), input[type="checkbox"]:not(.tab_gender_select)').not($('.popup__content input[type="radio"], .popup__content input[type="checkbox"], .card-type-list input[type="radio"], .ui-disable')).not($('.factura_vat input[type="radio"]'));

  $( checked_elements ).button();
  $(".chosen-select").chosen(
    {
        '.chosen-select-no-search' : {disable_search: true},
    }
  );

  var select_config = {
    '.chosen-select-deselect'  : {allow_single_deselect: true},
      '.chosen-select-no-search' : {disable_search: true},
    '.chosen-select-no-results': {no_results_text: window.I18n.selectivity.no_results_for_term},
    '.chosen-select-width'     : {width: "95%"}
  };
  $('select').each(function() {
    var element_config = {};
    for (var config_key in select_config) {
        element_config = $.extend(element_config, select_config[config_key]);
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
    window.chosenTablet();
  $(".js-gender-list").find("input").each(function(){
    $(this).on('ifChecked', function(event){
      $(this).parents(".js-gender-list").find("label").removeClass("active");
      $(this).parents(".gender-list__item").find("label").addClass("active");
    });
  });

  $(".payer-data").find("input").each(function(){
    $(this).on('ifChecked', function(event){
      $(this).parents(".payer-data").find("label").removeClass("active");
      $(this).parents(".gender-list__item").find("label").addClass("active");
    });
  });

  var section_width = $(".js-about-flight").width();
  if (section_width < 960) {
    $(".js-details-col").addClass("cabinet-size")
  } else {
    $(".js-details-col").removeClass("cabinet-size")
  }

  $(window).on('resize',function(){
    var section_width = $(".js-about-flight").width();
    if (section_width < 960) {
      $(".js-details-col").addClass("cabinet-size")
    } else {
      $(".js-details-col").removeClass("cabinet-size")
    }
  });

    $('.js-tab-item').on('click',function(ev){
        var curTab = $(this).attr('data-attr');
        var parents_block = $(this).parents(".js-tab-block");
        parents_block.find('.js-tab-item').removeClass('active');
        $(this).addClass('active');
        parents_block.find('.tab-content').removeClass('active');
        parents_block.find('.'+curTab).addClass('active');
    });

    $(".js-tabs-nav a").click(function(ev){
        ev.preventDefault();
        var el = $(ev.target);
        var cur_tab_nav = $(el).parent('li');
        if (cur_tab_nav.hasClass('active')) { $('.js-close').click(); return false; }
        $(cur_tab_nav).addClass('active').siblings().removeClass('active');
        $(el)
            .closest(".js-tabs").find(".js-tabs-content")
            .children().hide()
            .eq(cur_tab_nav.index()).show();
    });

    $('.close_filter').click(function(){
        var el = $('.js-close');
        var cur_tab = $(el).parent();
        if ($(el).parent().parents('.js-tabs-content').size()) cur_tab.hide();
        $(el).closest(".js-tabs").find(".js-tabs-nav li").removeClass('active');
    });

    $(".js-show-visa").click(function(){
        $(".js-visa-info").show();
    });

    /*choose transfer*/
    $(".js-check-transfer").each(function(){
        var button_label = $(this).parents(".js-transfer-item").find(".js-check-transfer-label"),
            transfer_offer = $(this).parents(".js-transfer-item").find(".js-want-this-car")

        if (button_label.hasClass("ui-state-active")) {
            transfer_offer.show()
        } else {
            transfer_offer.hide();
        }

        $(this).on("change", function(event){
            if (button_label.hasClass("ui-state-active")) {
                transfer_offer.show()
            } else {
                transfer_offer.hide();
            }
        })
    });

    $(".js-choose-class").each(function(index){
        $(".js-choose-class").removeClass("js-just-clicked");
        $(this).addClass("js-just-clicked").magnificPopup({
            fixedContentPos: 'auto',
            items: {
                src: $(".js-type-car-content"),
                type: 'inline',
            }
        });
    });

    $(".js-want-this").click(function(){
        var choosen_transfer = $(this).parents(".js-want-this-car").clone();
        var magnificPopup = $.magnificPopup.instance; // save instance in magnificPopup variable
        choosen_transfer.addClass("choosen-cartype").insertAfter($(".js-just-clicked")).next().show();
        magnificPopup.close();
        $(".js-just-clicked").hide();
    });

    /**************** recommendations block ***************/
    $(".js-recommendations").each(function(){
      var recom_popup = $(this).next(".js-recommendations-popup")
      if (recom_popup.length>0) {
        $(this).hover(
          function(){recom_popup.show()},
          function(){recom_popup.hide()}
        );
      }
    });

    $('.booking_recommend_block .booking_block_ins').click(function(){
    	el = $(this).find('input[name="tua_recom"]');
    	if(el.hasClass('active')){ return false; }
    	$("<form/>").ajaxformbar({
        url: el.val().replace('booking', 'check_free_seats')+'&rscfs=1',
        load_time: 15,
        loader_type:'line_bottom',
        hide_on_success: false,
        success_tag: 'success',
        text: window.I18n.avia_check_seats,
        success:function(response){
            if(response.success){
            	$(window).unbind('beforeunload');
              window.location.href = el.val();
            } else{
              log_error(response.error, (session_id||''), '');
              message('msg_title', response.error, 'continue_button', window.close_message);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
           log_error(''+xhr.status+': '+thrownError, (session_id||''), '');
           message('msg_title', window.I18n.server_error, 'continue_button', window.close_message);
        }
    	}).submit();
    	return false;
    });

    /* for displaying popup on radio checked event

    $(".js-recommendations-radio").each(function(){
      var recom_label = $(this).parents(".js-recommendations").find(".js-recommendations-label"),
          recom_popup = $(this).parents(".js-recommendations").next(".js-recommendations-popup")

      $(this).on("change", function(event){
        if (recom_popup.length>0) {
          if (recom_label.hasClass("ui-state-active")) {
              recom_popup.show()
          } else {
              recom_popup.hide();
          }
        } else {
          $(".js-recommendations-popup").hide();
        }
      });
    });*/

    if(!($('.js-additional-services .js-tab-item:visible').size() > 0)) $('.js-additional-services').addClass('hidden');
    if(($('.js-additional-services .js-tab-item:visible').size() == 1)) $('.js-off-single-tab').addClass('hidden');


});
