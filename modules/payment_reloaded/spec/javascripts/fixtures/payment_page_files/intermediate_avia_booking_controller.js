$.Controller('IntermediateAviaBookingController',"BookingController",{

  PREBOOKING_PAGE_INTERACTION: 1,
  BOOKING_PAGE_INTERACTION: 2,
  PAYMENT_CARD_INTERACTION: 3,

  INTERACTION_LIMIT: 4,

  form_btn_ready: true,
  tr_error_reason: false,

  init: function(){


    this.filed_chars = {}
    this.filed_chars[ this.parent.PREBOOKING_PAGE_INTERACTION ] = 0
    this.filed_chars[ this.parent.BOOKING_PAGE_INTERACTION ] = 0
    this.filed_chars[ this.parent.PAYMENT_CARD_INTERACTION ] = 0
  },
  // EVENTS START
  "input -> keyup":function(e){
    var self = this;
    var el = this.element.find(e.target);
    if(window['front_version'] != 'mobile' || el.parents('.payment_block').length == 0){
      e.preventDefault();

      if(e.which === 13) {
        if(!el.hasClass('js-ignore-valid-next-unfilled') && el.valid() && !el.hasClass('js-ignore-next-unfilled')){
          var n_el = this.scroll_to('next_unfilled', 500);
          if(n_el.length == 0 && $('#login_form:visible').length == 0) this.element.find('form .js-form-btn').click();
        }
      }
    }
    this.check_interaction( $(e.target) )
  },
  "input -> keydown":function(e){
    var self = this;
    // if(!window.is_mobile && e.which === 9){
    //   var el = this.element.find(e.target);
    //   if(!el.hasClass('js-ignore-next-unfilled')){
    //     var n_el = this.scroll_to('next_unfilled', 500, false, false);
    //     if(n_el.length > 0){
    //       e.preventDefault();
    //       n_el.focus();
    //     }
    //   }
    // }
    if(window.is_mobile && e.which === 9){
      var el = this.element.find(e.target);
      if(el.parents('.payment_block').length == 0){
        e.preventDefault();
        if(el.parents('.payment_block').length){
          if(!el.hasClass('js-ignore-valid-next-unfilled') && el.valid() && !el.hasClass('js-ignore-next-unfilled')){
            var n_el = this.scroll_to('next_unfilled', 500);
            if(n_el.length == 0 && $('#login_form:visible').length == 0) this.element.find('form .js-form-btn').click();
          }
        }
      }
    }
  },
  ".hidden_nationality -> change":function(ev){
    this.set_docnum_validation_for_ru(ev.target);
  },
  ".js-expiration-checker -> change":function(el){
    var el = $(el.target);
    var input = this.element.find('#js-doc-expire_'+el.data('key')+' input');
    input.removeClass("error")
    input.siblings('.error').remove();
    if(el.is(":checked")){
      input.removeAttr('disabled');
      input.attr('required','required')
      input.addClass('mobile_date_valid');
      el.val('true');
      input.eq(0).focus();
    }else{
      input.attr('disabled','disabled');
      input.removeAttr('required');
      input.removeClass('mobile_date_valid');
      el.val('false');
      input.eq(0).blur();
    }
  },
    //PAGE LOGIN FORM ERRORS
  "input[type=email], #login_form #pass -> focus":function(ev){
    var idx = this.element.find(".js-user-field-form input").index($(ev.target));
    window.hide_error_popup(idx)
  },

  ".js-booking-login-form-btn -> click":function(ev){
    //this.element.find(".js-user-field-form samp.error").remove();
  },
  // EVENTS END

  // FUNCTIONS START
  set_docnum_validation_as_to_nationality:function(data){
    var self = this;
    self.element.find(".hidden_nationality").each(function(){
      self.set_docnum_validation_for_ru(this);
    });
  },
  set_docnum_validation_for_ru:function(nationality_el){
    nat_hidden = $(nationality_el);
    doc_element = nat_hidden.parent().siblings('.document_number').find(':input');
    if(doc_element){
        if(nat_hidden.val() == 'RU' && !doc_element.hasClass('ru_international_check')){
          if(doc_element.hasClass('valid_docnum')){
            if(doc_element.hasClass('sirena_doc_check')){
              doc_element.removeClass('valid_docnum');
              doc_element.removeClass('only_alphanum_latin');
              doc_element.addClass('valid_docnum_for_sirena');
            }else if(ut_passport_validating){
              doc_element.removeClass('valid_docnum');
              doc_element.addClass('valid_docnum_for_ru');
            }
          }
        }else{
          if(doc_element.hasClass('valid_docnum_for_ru')){
            doc_element.removeClass('valid_docnum_for_ru');
            doc_element.addClass('valid_docnum');
          }
          if(doc_element.hasClass('valid_docnum_for_sirena')){
            doc_element.removeClass('valid_docnum_for_sirena');
            doc_element.addClass('valid_docnum');
            doc_element.addClass('only_alphanum_latin');
          }
        }
      }
  },
  login_submit:function(){
    if(!this.element.find("#email").valid() || !this.element.find("#pass").valid()){ return false;}
    var email = this.element.find("#email").val(),
     pass  = this.element.find("#pass").val(),
     ctrl  = $("#log_reg_popup .popup_login ").controller(),
     form  = this.element.find(".js-user-field-form"),
     self  = this;
    $("<form>").ajaxformbar({
      data:{user:{email:email,pass:pass}},
      url: "/" + window.language + "/login",
      set_html:false,
      beforeSend:function(){ self.set_loader(true);},
      success:function(resp){
        if(resp && resp.success){
          $.publish("login_success",[resp.user])
          $('#name').val(resp.user.name);
          $('#phone_number').val(resp.user.phone_number);
          $('#user_type').val(resp.user.user_type);
          el = self.element.find('.js-user-phone-code');
          if( el.find("option[value='"+resp.user.phone_code+"']").length > 0 ) {
            el.find("option").removeAttr('selected');
            el.find("option[value='"+resp.user.phone_code+"']").attr('selected','selected');
            el.parent().find('span.input-text').text(el.find("option[value='"+resp.user.phone_code+"']").text())
          }
          self.hide_login_form();
          self.set_loader(false);
          $('.js-add-passenger').show();
          // $('#name').focus();
        }
        else{
          ctrl.login_failed(resp.errors,form)
          self.set_loader(false);
        }
      }
    }).submit();
  },


  fill_passengers_checkboxes:function(key, one_pass){
    // if(one_pass['doc_no_expiration'] == undefined){
    //   var input = $('#doc_expire_date_'+key);

    //   if(!$('#checkbox-validity-'+key).is(":checked") && input.hasClass('mobile_date_valid')){
    //     input.attr('disabled','disabled');
    //     input.removeAttr('required');
    //     input.removeClass('mobile_date_valid');
    //   }
    //   $('#checkbox-validity-'+key).parents('.passenger-data-inputs').find('.js-splited-date.js-doc-expire').addClass('hidden').find('input').attr('disabled', 'disabled');
    //   if($('#checkbox-validity-'+key).is(":checked")) $('#checkbox-validity-'+key).click();
    // }else{
    //   if(!$('#checkbox-validity-'+key).is(":checked")){
    //     setTimeout(function(){
    //       $('#checkbox-validity-'+key).click();
    //       $('#checkbox-validity-'+key).siblings('input').blur();
    //     },10)
    //   }
    // }
    if(one_pass['patronymic'] == undefined){
      if($('#patronymic-validity-'+key).is(":checked")) $('#patronymic-validity-'+key).click();
    }else{
      if(!$('#patronymic-validity-'+key).is(":checked")) $('#patronymic-validity-'+key).click();
    }

    if(one_pass['bonus_card'] == undefined){
      if($('#card_'+key).is(":checked")) $('#card_'+key).click();
    }else{
      if(!$('#card_'+key).is(":checked")) $('#card_'+key).click();
    }
  },

  fill_genger_data:function(key, value){
    $('#'+$('.js-gender-tab-'+key+'.'+value).attr('for')).change();
    $('.js-gender-tab-'+key+'.'+value).addClass('active');
  },

  fill_passengers_data:function(){
    var self = this;
    exc = ['type','id','gender','citizenship_name','citizenship','bonus_card','type', 'save_user_info']
    $.each(passengers_data, function(key, one_pass){
      self.fill_passengers_checkboxes(key, one_pass)
      $.each(one_pass, function(key_field, value){
        if( $.inArray(key_field, exc) > -1 ){
          switch(key_field){
            case 'citizenship':
              el = $('#'+key_field+'_'+key);
              if(el && one_pass['citizenship_name']){
                el.val(value);
                $('#citizenship_name_'+key).val(one_pass['citizenship_name']).change();
                self.init_international_validation(value.toUpperCase(), el);
                self.set_docnum_validation_for_ru(el);
              }
              break;
            case 'gender':
              self.fill_genger_data(key, value);
              break;
            case 'bonus_card':
              if(value != ''){
                $('#card_'+key).parent().find('.iCheck-helper').click();
                $('#'+key_field+'_'+key).val(value);
              }
              break;
            case 'type':
              $('#pass-type-'+key).click();
              break;
            case 'save_user_info':
              // $('#save_user_'+key).click();
              break;
          }
        }else{
          $('#'+key_field+'_'+key).val(value);
        }
      });
    });
    $('.one-passenger-data input:focus').blur()
    if(window.is_mobile) self.fix_ipad_field_madness();
  },
  fill_user_data:function(){
    this.element.find('#email').val(user_data.email);
    if(!logged_in){
      this.element.find('#email').blur();
    }
    this.element.find('#name').val(user_data.name);
    this.element.find('#phone_number').val(user_data.phone);
    $('select[name="user[phone_code]"]').val(user_data.phone_code).trigger("chosen:updated").trigger("chosen:close")
    this.element.find('span.js-user-phone-code.input-text').text(user_data.phone_code);
  },
  validation_passengers: function(){
    var self = this;
    $.each(validation_passengers_errors, function(key, error_text){
      if(/(birthday|doc_expire_date|gender)/.test(key)){
        var matched = /(birthday|doc_expire_date|gender)/.exec(key);
        var number_key = key.substr(-1);
        if(matched[0] == 'gender'){
          matched[0] = 'passengers_gender';
          number_key += '-M';
          error_text = validation_errors['tab_gender_valid']
        }
        if(matched[0] == 'doc_expire_date'){
          matched[0] = 'doc_expire_date_year'
        }
        if(matched[0] == 'birthday' ){matched[0] = 'birthday_month'}
        self.set_tooltip($('#'+matched[0]+'_'+number_key), error_text);
        self.scroll_to('first_error_label', 500);
      }else{
        self.set_tooltip($('#'+key), error_text);
        self.scroll_to('first_error_label', 500);
      }
    });
  },
  scroll_to:function(type, speed, c_el, with_focus, plus_minus, check_not_req){
    with_focus = (with_focus == undefined)?true:with_focus
    plus_minus = parseInt(plus_minus) || 60;
    c_el = c_el || '';
    check_not_req = check_not_req || false;
    if(check_not_req) required = '';
    else required = '[required]';
    var self = this, el = '';
    switch (type) {
      case 'top':
        el = $('body');
        with_focus = false;
        break;
      case 'element':
        el = c_el;
        break;
      case 'first_error_field':
        el = this.element.find('[name]'+required+'.error:first');
        with_focus = false;
        break;
      case 'first_error_label':
        el = this.element.find('samp.error:first');
        with_focus = false;
        break;
      case 'first_unfilled':
        var first_unfilled = '';
        this.element.find("[name]"+required+":not(:disabled)").each(function(){
          if($(this).val() === ""){
            first_unfilled = $(this);
            return false;
          };
        });
        el = first_unfilled;
        break;
      case 'next_unfilled':
        var c_el_i = 0;
        if(c_el){
          c_el_i = this.element.find("[name]"+required+":visible:not(:disabled)").index(c_el);
        }else{
          c_el_i = this.element.find("[name]"+required+":visible:not(:disabled)").index(this.element.find("[name]"+required+":focus"));
        }
        var next_unfilled = '';
        this.element.find("[name]"+required+":visible:not(:disabled):gt("+c_el_i+")").each(function(){
          if($(this).attr('type') == 'radio'){
            if(!self.element.find('[name = "'+$(this).attr('name')+'"]:checked').length > 0){
              next_unfilled = $(this);
              return false;
            }
          }
          if($(this).val() === ""){
            next_unfilled = $(this);
            return false;
          };
        });
        el = next_unfilled;
        break;
      default:
    }
    if(el.length > 0){
      $('html, body').animate({ scrollTop: parseInt(el.offset().top)-plus_minus}, speed);
      if(with_focus){
        el.focus();
      }
    }
    return el;
  },
  load_full_recommendation:function(){
    var params = this.get_cleared_params();
    if(params){
      $.ajax({
        url: '/search/load_recomendation_for_cache',
        data: params,
        type: 'GET',
        dataType:"json",
        timeout:90000,
        success: function(response, textStatus, jqXHR){
        },
        error: function(jqXHR,textStatus,errorThrown ){
        }
      });
    }
  },
  return_back_after_logout:function(){
    if($('.js-logout')){
      $('.js-logout').attr('href', $('.js-logout').attr('href')+'?rtr=yes');
    }
  },

  check_interaction: function( input ){

    var interaction_type = this.get_interaction_page_type( input );

    if( this.parent.INTERACTION_LIMIT == this.filed_chars[ interaction_type ] ){
      var interaction_code = 1000 + interaction_type ;
      window.klog( interaction_code, JSON.stringify({ input: input.attr("name")}) , window.session_id );
    }
    this.filed_chars[ interaction_type ] = this.filed_chars[ interaction_type ] + 1;
  },

  get_interaction_page_type: function( input ){

    if( input.hasClass( "valid_card_number" ) || input.parents(".card-wrapper").length || input.parents(".card_wrapper").length ){
      return this.parent.PAYMENT_CARD_INTERACTION
    }
    return ( ( window.location.pathname.indexOf("pre_booking") > -1 ) ? this.parent.PREBOOKING_PAGE_INTERACTION : this.parent.BOOKING_PAGE_INTERACTION )
  },

  pb_setup_submit:function(){
    var self = this;
    this.element.find("form").ajaxformbar({
        load_time:180,
        hide_on_success: self.parent.hide_on_success,
        start: 10,
        success_tag: 'success',
        beforeSend:function(jqXHR, settings){
          if(settings.crossDomain){
            settings.url = settings.url.replace(settings.url.split("/")[2],window.location.host);
            jqXHR.setRequestHeader('X-Requested-With','XMLHttpRequest');
          }
          var passengers = self.element.find('[class *= "js-passenger-info-"]'),
              user_names = [];
          passengers.each(function(key, val){
            var name = $(val).find('[id *= "firstname_"]'),
                lastname = $(val).find('[id*="lastname_"]'),
                str = ((lastname.length > 0)?lastname.val():'')+':'+((name.length > 0)?name.val():'');
            user_names.push(str);
          });
          settings.url = settings.url+'&user_names='+user_names.join(';');
        },
        success: function(response, textStatus, jqXHR){
          self.pb_success_call_back(response);
        },
        error: function (xhr, ajaxOptions, thrownError) {
          self.pb_error_call_back(xhr, ajaxOptions, thrownError)
        }
    });
  },
  pb_success_call_back: function(data){
    var self = this;
    if(data.success){
      if(self.element.find("form").data('fast-loader-message')) {
        var texts = self.element.find("form").data('fast-loader-message');
        message('msg_title', texts.msg, texts.btn, function(){location.href = texts.url; return false }, false, true);
      }else {
        location.href =  "/" + window.lang_prefix + window.gds + "/search/booking"+ "?" + self.get_cleared_params() + '&ig_r=1';
      }
    }else if(Object.keys(data.errors).length > 0){

      var lst = {};
      $.each(data.errors, function(error, el){lst[error] = el + "|" + $("#"+error).val();});
      log_error(JSON.stringify(lst), ((typeof(session_id)!="undefined" ? session_id : "")||''), '', 950);

      self.pb_sc_hide_loader();
      validation_passengers_errors = data.errors;
      self.validation_passengers();

    }else if(typeof data.msg != "undefined"){
      message('msg_title', data.msg, 'continue_button', window.close_message);
    }else{
      message('msg_title', I18n.server_error, 'continue_button', window.close_message);
    }
  },
  pb_error_call_back: function( xhr, ajaxOptions, thrownError ){
    if(xhr.status && (typeof(session_id)!="undefined")) log_error(''+xhr.status+': '+thrownError, ((typeof(session_id)!="undefined" ? session_id : "")||''), '');
    message('msg_title', I18n.server_error, 'continue_button', window.close_message);
  },
  pb_sc_hide_loader: function(){
  },
    //fix expiration-date
  fix_ipad_field_madness: function(){
    if((/iphone|ipad|ipod/i).test(navigator.userAgent.toLowerCase())){
      $('[id*="doc_expire_date_"]:not(:disabled)').attr('disabled','disabled').addClass('ipad-fix');
      setTimeout(function(){$('[id*="doc_expire_date_"].ipad-fix').removeAttr('disabled').removeClass('ipad-fix')},100);
    }
  },

  get_cleared_params: function(){
    var params = {};
    decodeURIComponent(location.search.substr(1)).split('&').map(function(v){var s = v.split('='); params[s[0]] = s[1] });
    delete params["from"]
    return $.param(params);
  },

  fast_preloader_init_search: function(){
    var self = this;
    IntermediateAviaBookingController.form_btn_ready = false;
    $.ajax({
      url: search_url,
      data: JSON.parse(preloader_form_fields),
      type: 'POST',
      dataType:"json",
      timeout: 90000,
      success: function(response, textStatus, jqXHR){
        url_prefix = window.lang_prefix != '' ? "/" + window.lang_prefix : "/";
        url_prefix += Number(window.has_subdomais) ? "" : window.cur_domain_name + "/";

        var query = $.parseParams(window.location.search.replace("?",""));

        if (undefined !== query['refid'] && undefined !== response.params) {
          response.params['refid'] = query['refid'];
        }

        if(response.code === false){
          rd = response.action == 'results' ? 1 : (response.action == 'booking' ? 2 : 0);

          if(response.action == 'results' && response.message) self.element.find("form").data('fast-loader-message', response.message)

          if(window.cur_domain == 'avia'){ window.tracking(1, 1, response.params.session_id, 0, rd); }
          var fp = response.params.fp;
          delete response.params.fp;
          window.url_before_fp_replace = location.href.split('#')[0];
          window.history.replaceState(null, null, location.origin + location.pathname + "?" + $.param(response.params));

          if(fp) response.params.fp = fp;

          self.fast_preloader_success_callback(response);
          IntermediateAviaBookingController.form_btn_ready = true;
          if(response.action != 'results') self.load_full_recommendation();
        }else{
          $(window).unbind('beforeunload');
          if(window.cur_domain == 'avia'){ window.tracking(1, 2, '', 0); }
          message('msg_title', response.msg, 'continue_button', function(){window.location.href =  url_prefix;  return false });
        }
      },
      error: function(jqXHR,textStatus,errorThrown ){
        if(window.cur_domain == 'avia'){ window.tracking(1, (textStatus==="timeout" ? 3 : (IntermediateAviaBookingController.tr_error_reason ? IntermediateAviaBookingController.tr_error_reason: 4) ), '', 0); }
        if(typeof(jqXHR.status) != "undefined") log_error( jqXHR.status+': '+textStatus + ' ' + errorThrown, '', window.location.href);
        $(window).unbind('beforeunload');
        message('msg_title', window.I18n.server_error, 'continue_button', function(){window.location.href =  '/' + window.lang_prefix;  return false });
      }
    });
  },
  fast_preloader_success_callback: function(response){
  },
  ".js-patronymic-checker -> change":function(el){
    var el = $(el.target),
        input = this.element.find('#patronymic_'+el.data('key')),
        label = el.parents('.input-wrapper').find('.label-text'),
        state = el.is(":checked"),
        inputText = el.parents('.input-wrapper').find('.input-text');
    if(!window.expecto_patronymic){
      if(state){
        inputText.attr('disabled', 'disabled').addClass('hidden');
        label.addClass('hidden');
      }else{
        inputText.removeAttr('disabled').removeClass('hidden');
        label.removeClass('hidden');
      }
    } else {
      input.removeClass("error").siblings('.error').remove();
      input.attr({'disabled': !state, 'required': state}).
        rules('add', {middlenameLength: state, latinName: state});
      el.val(state);
    }
  },

  on_saver: function(){
    if(typeof FieldSaver != "undefined"){
      var fields_for_saver = $('[data-saver]');
      if(fields_for_saver.length > 0){
        var saver = new FieldSaver(session_id);
        if(saver.is_local_storage_name_supported()){
          saver.clear_all_data_except_current();
          saver.fill_from_save(fields_for_saver);
          saver.bind_save(fields_for_saver);
        }
      }
    }
  },

  log_pre_booking_page_err: function(){
    var url = decodeURIComponent(window.location.href).replace('\/pre_booking', '/pre_booking_validation_error');
    var self = this;
    if(typeof self.block_pre_booking_error_log == 'undefined' || !self.block_pre_booking_error_log){
      $.ajax({
        url: url,
        load_time: 15,
        hide_on_success: false,
        success_tag: 'success',
        dataType: 'json',
        success:function(response){
          self.block_pre_booking_error_log = true;
        },
        error: function (xhr, ajaxOptions, thrownError) {
        }
      });
    }
  },
  start_modules_filter:function() {
    var self = this;
    $(document).ready(function () {

      $('.js-nationality-select').change(function () {
        //off pasport filter
        // var id = $(this).attr('id').split("_");
        // self.sendHideUsersFilds(id[2], $(this).val())
      })
    })
  },
  sendHideUsersFilds:function(element, country) {
    var self = this;

    if(user_field.page != "pre_booking" && !country){
      return false;
    }

    if(user_field.recommendation_id==''){
      user_field.recommendation_id = self.findGetParameter('recommendation_id');
    }

    if(user_field.session_id==''){
      user_field.session_id = self.findGetParameter('session_id');
    }

    var send_string = "recommendation_id="+user_field.recommendation_id+"&session_id="+user_field.session_id+"&recomendation="+user_field.recomendation;
    if (country) send_string += '&country='+country;

    var settings = {
      "async": true,
      "url": "/search/hide_users_filds",
      "method": "GET",
      "headers": {
        "cache-control": "no-cache",
      },
      "processData": false,
      "contentType": false,
      "data": send_string
    }

    $.ajax(settings).done(function (response) {
      response = JSON.parse(response);

      if(response.error != null){
        self.changeFieldsError(element);
        return;
      }

      if (element && element >= 0) self.changeFieldsElement(response.items, element);
      else self.changeFieldsAll(response.items);
    });
  },

  "findGetParameter":function(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
          tmp = item.split("=");
          if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
  },

  changeFieldsAll:function(items){
    var type_passenger = '';
    $(".one-passenger-data").each(function () {
      type_passenger = $(this).data('type-passenger');
      if (items[type_passenger].birthday == true) {
        $(this).find('.js-birthday').parent().removeClass('hidden');
      }
      else {
        $(this).find('.js-birthday').parent().addClass('hidden');
        $(this).find('.js-birthday input').val('');
      }

      if (items[type_passenger].docnum == true)
        $(this).find('.valid_docnum').parent().removeClass('hidden');
      else
        $(this).find('.valid_docnum').parent().addClass('hidden');

      if (items[type_passenger].expiration_date == true) {
        $(this).find('.js-doc-expire input').each(function () {
          $(this).prop("disabled", false);
        });
        $(this).find('.js-doc-expire').parent().removeClass('hidden');
      }
      else {
        $(this).find('.js-doc-expire').parent().addClass('hidden');
        $(this).find('.js-doc-expire input').val('');
      }


    })
  },

  changeFieldsElement:function(items, element) {

    if(user_field.mobile){
      element = parseInt(element)+1;
    }

    element = $(".js-passenger-info-" + element);

    var type_passenger = '';
    type_passenger = element.data('type-passenger');

    if (items[type_passenger].birthday == true) {
      element.find('.js-birthday').parent().removeClass('hidden');
    }
    else {
      element.find('.js-birthday').parent().addClass('hidden');
      element.find('.js-birthday input').val('');
    }

    if (items[type_passenger].docnum == true)
      element.find('.valid_docnum').parent().removeClass('hidden');
    else
      element.find('.valid_docnum').parent().addClass('hidden');

    if (items[type_passenger].expiration_date == true) {
      element.find('.js-doc-expire input').each(function () {
        $(this).prop("disabled", false);
      });
      element.find('.js-doc-expire').parent().removeClass('hidden');
    }
    else {
      element.find('.js-doc-expire').parent().addClass('hidden');
      element.find('.js-doc-expire input').val('');

    }


  },
  changeFieldsError:function (element) {
    if(element){
      if(user_field.mobile){
        element = parseInt(element)+1;
      }
      element = $(".js-passenger-info-" + element);
      element.find('.js-birthday').parent().removeClass('hidden');
      element.find('.valid_docnum').parent().removeClass('hidden');
      element.find('.js-doc-expire').parent().removeClass('hidden');
    }else{
      $(".one-passenger-data").each(function () {
        $(this).find('.js-birthday').parent().removeClass('hidden');
        $(this).find('.valid_docnum').parent().removeClass('hidden');
        $(this).find('.js-doc-expire').parent().removeClass('hidden');
      })
    }
  },
  // FUNCTIONS END
});
$.Controller("V2PassengerSelect",{
  user_passengers: {},
  current_key: 0,
  reload_counter:0,
  genders_list:{},
  select_hover: true,
  field_type: "text",

  start_length: 2,
  result_length: 4,
  reload_limit: 2,
  reload_time: 5, //sec
  init:function(){
    this.default_autocomplete_off();
    if(this.element.data('logged')) this.load_user_passengers();

    this.parent.gender_list = gender_list;
  },
  set_event:function(){
    var self = this;
    $('.js-user-passengers-complete').on('keyup', function(e){
      if($(e.target).val().trim().length >= self.parent.start_length
          && ($(e.target).parents('.js-one-passenger-data').find('input[type="'+self.parent.field_type+'"]:visible:first').attr('id') == $(e.target).attr('id')
              || $(e.target).parents('.js-one-passenger-data').find('input[type="'+self.parent.field_type+'"]:visible:first').val().length == 0)){
        var pass = self.find_pass($(e.target));
        if(pass.length > 0)
        {
          self.clear_select();
          self.create_select(pass);
          self.put_select($(e.target));
        } else
        {
          self.hide_select();
          self.clear_select();
        }
      }else{
        self.hide_select();
        self.clear_select();
      }
    });
    $('.js-user-passengers-complete').on('blur', function(e){
      if(!self.parent.select_hover){
        self.hide_select();
        self.clear_select();
      }
    });
    $('.js-user-passengers-complete').on('focus', function(e){
      self.parent.select_hover = false;
      $(e.target).keyup();
    })
    $('.js-up-select').on('mouseenter', function(){
      self.parent.select_hover = true;
    })
    $('.js-up-select').on('mouseleave', function(){
      self.parent.select_hover = false;
    })

  },
  find_pass:function(el){
    var self = this;
    self.parent.current_key = el.parents('.js-one-passenger-data').data('key');
    var result = [];
    $.each(self.parent.user_passengers, function(id, pass){
      if(new RegExp("^"+el.val().trim().toLowerCase()).test(self.parent.user_passengers[id][el.attr('id').split('_')[0]].toLowerCase()) && result.length < self.parent.result_length)
        result.push(pass);
    })
    return result;
  },
  create_select:function(pass){
    var self = this;
    var one_row = self.element.find('.js-up-one-row');
    self.element.find('li:not(.js-default-row)').remove();
    $.each(pass, function(id, one_pass){
      var cloned_one_row = one_row.clone().removeClass('js-default-row');
      cloned_one_row.attr('id', one_pass.id);
      cloned_one_row.find('span').each(function(el_i, field){
        var clear_field = $(field).attr('class').replace('js-up-','');

        if(one_pass[clear_field])
        {
          var text = one_pass[clear_field];
          switch (clear_field) {
            case "passengers_gender":
              if(self.parent.gender_list[one_pass[clear_field].slice(0,1)])
                text = self.parent.gender_list[one_pass[clear_field].slice(0,1)].capitalize();
              break;
          }
          $(cloned_one_row).find(field).text(text)
        }
      });
      cloned_one_row.removeClass('hidden');
      self.element.append(cloned_one_row);
    })

    var event = ((/iphone|ipad|ipod/i).test(navigator.userAgent.toLowerCase()))?'mouseenter':'click';
    $('.js-up-one-row').on(event, function(e){
      var el = $(e.target).hasClass('js-up-one-row')?$(e.target):$(e.target).parent();
      self.fill_data(self.parent.user_passengers[el.attr('id')]);
      self.log_data(self.parent.user_passengers[el.attr('id')]);
      self.hide_select();
      self.clear_select();
      $('.js-user-passengers-complete').blur();
    });
  },
  put_select:function(element){
    var self = this;
    element.after(self.element.removeClass('hidden'));
  },
  hide_select: function(){
    this.element.addClass('hidden');
  },
  clear_select:function(){
    this.element.find('li:not(.js-default-row)').remove();
  },
  default_autocomplete_off: function(){
    $('.js-user-passengers-complete').attr('autocomplete', 'off')
  },
  load_user_passengers:function(){
    var self = this;
    $.ajax({
      url: '/search/load_user_passengers?session_id='+user_field.session_id,
      type: 'POST',
      dataType:"json",
      timeout:90000,
      success: function(response, textStatus, jqXHR){
        if(response.success){
          $.each(response.data, function(i, val){
            var date = self.get_date(val.birth_day).split('.');
            self.parent.user_passengers[val.id] = {
              passengers_gender: val.gender,
              firstname: val.first_name,
              lastname: val.last_name,
              docnum: val.docnum,
              patronymic: val.patronymic,
              doc_type: val.doc_type,
              id: val.id,
              citizenship: val.country_id,
              birthday_day: date[0],
              birthday_month: date[1],
              birthday_year: date[2],
              birthday: date.join('.'),
              pref_air_seat:val.pref_air_seat,
              pref_air_meal: val.pref_air_meal,
              loyalty_cards: val.loyalty_cards,
            };
            if(val.doc_expire_date > 0) {
              var doc_date = self.get_date(val.doc_expire_date).split('.');
              self.parent.user_passengers[val.id]['doc_expire_date_day']  = doc_date[0];
              self.parent.user_passengers[val.id]['doc_expire_date_month']= doc_date[1];
              self.parent.user_passengers[val.id]['doc_expire_date_year'] = doc_date[2];
              self.parent.user_passengers[val.id]['doc_expire_date'] = date.join('.');
            }
          });
          self.set_event();
        }else{
          if((typeof(session_id)!="undefined")) log_error('Failed load user passengers', ((typeof(session_id)!="undefined" ? session_id : "")||''), '', 101010);
        }
      },
      error: function(xhr, ajaxOptions, thrownError ){
        if(xhr.status && (typeof(session_id)!="undefined")) log_error(''+xhr.status+': '+thrownError, ((typeof(session_id)!="undefined" ? session_id : "")||''), '', 101010);
        if(self.parent.reload_counter < self.parent.reload_limit){
          self.parent.reload_counter++;
          setTimeout(function(){ self.load_user_passengers()}, self.parent.reload_time*1000);
        }
      }
    });
  },
  get_date: function(timestamp){
    var date = new Date(parseInt(timestamp+21600)*1000);
    return ("0" + date.getUTCDate()).slice(-2) +'.'+("0" + (date.getUTCMonth() + 1)).slice(-2)+'.'+date.getUTCFullYear();
  },
  fill_genger_data:function(key, value){
    value = value.replace('I','').replace('C','');
    $("[id*="+key+"-"+((value == 'F')?'W':value)+"]").iCheck('check');
  },
  fill_citizenship:function(el, number_key, val){
    el.val(val);
    el.change();
    // var number = field_with_key.replace(/citizenship_/, '');
    var select = $("[id*=citizenship_name_" + number_key + "]");
    select.val(val).trigger('chosen:updated');
    select.change();
    $('.main').click();
  },
  fill_data:function(passenger){
    var a = {};
    var self = this;
    var field_hidden_el = ['citizenship', 'id', 'pref_air_seat', 'pref_air_meal', 'loyalty_cards'];
    var doc_exist = false;
    $('[data-key="'+self.parent.current_key+'"]').find('.js-splited-date input').val('')
    window.passengerAutocompleting = true;
    for(var field in passenger){
      var field_with_key = field + '_' + self.parent.current_key;

      var el = $("[id*="+field_with_key+"]" + ((!field_hidden_el.some(function(e) { return new RegExp(e).test(field_with_key); }))?':not(:hidden)':'') );
      if(el.length == 0) continue;
      if(/passengers_gender/.test(field_with_key)){
        self.fill_genger_data(field_with_key, passenger[field]);
        continue;
      }
      if(/citizenship/.test(field_with_key)){
        if(el.length > 0) self.fill_citizenship(el, self.parent.current_key, passenger[field]);
        continue;
      }
      if(/doc_expire_date/.test(field_with_key) ){
        if(passenger[field]){
          doc_exist = true;
          if(!el.parents('.db-col').find('input:checkbox').is(":checked")){
            el.parents('.db-col').find('input:checkbox').click();
          }
        }
      }
      if(/id/.test(field_with_key)){
        el.val(passenger[field]);
        continue;
      }
      el.removeClass("error");
      if(/checkbox/.test(el.attr("type")))  el.change();

      el.val(passenger[field]);
      el.change().keyup();
    }
    if(!doc_exist && $('#checkbox-validity-' + self.parent.current_key).is(':checked')) $('#checkbox-validity-' + self.parent.current_key).click().parents('.db-col').find('input').val('');
    $(':focus').blur();
    $('samp').remove();
    $('.error').removeClass('error');
    this.move_to_next_passenger();
    window.passengerAutocompleting = false;
  },

  log_data:function(passenger){
    window.passenger = passenger;
    var tmp = [];
    $.each(passenger, function(i, k){ if(typeof(k) != "undefined") tmp.push(i+':'+k)})

    $.ajax({
      url: '/search/log_user_passenger',
      type: 'POST',
      dataType:"json",
      timeout:90000,
      data: {url: location.pathname, msg: tmp.join('|'), session_id: session_id, error_code: 101010, subdomain: window.cur_domain, status:1},
      success: function(response, textStatus, jqXHR){
      },
      error: function(xhr, ajaxOptions, thrownError ){
        if(xhr.status && (typeof(session_id)!="undefined")) log_error(''+xhr.status+': '+thrownError, ((typeof(session_id)!="undefined" ? session_id : "")||''), '', 101010);
      }
    });
  },

  move_to_next_passenger: function() {
    var $passengers = $('.one-passenger-data'),
        $to = false;

    $passengers.each(function(i){
      if (i > self.parent.current_key) {
        var _element = $(this).find('input[type='+self.parent.field_type+']:visible:first');
        if (_element.length > 0 && _element.val() === '') {
          $to = _element;
          return false;
        }
      }
    });
    if ($to) $('html,body').animate({scrollTop: $to.offset().top-60}, 500, function() { $to.focus(); });
  },

});
