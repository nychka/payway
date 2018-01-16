$.Controller("BookingController",{
  last_val: '',
  booking_start:I18n.booking_start_avia,
  hide_on_success:false,
  validator_instance: false,

  PREBOOKING_PAGE_INTERACTION: 1,
  BOOKING_PAGE_INTERACTION: 2,
  PAYMENT_CARD_INTERACTION: 3,

  INTERACTION_LIMIT: 4,

  init:function(){
    this.filed_chars = {}
    this.filed_chars[ this.parent.PREBOOKING_PAGE_INTERACTION ] = 0
    this.filed_chars[ this.parent.BOOKING_PAGE_INTERACTION ] = 0
    this.filed_chars[ this.parent.PAYMENT_CARD_INTERACTION ] = 0
    $.extend($.validator.messages, validation_errors);
    this.setup_validation();
    this.setup_submit();
    if(window['front_version'] != 'mobile'){
      this.setup_magnific();
    }
    this.nationalities = typeof(nationalities) != "undefined" ? nationalities : [];
    this.go_top = false;
    $("#phone_code").autocomplete({
      open: function () {
        var mywidth = $("#phone_code").outerWidth();
        $(this).data("uiAutocomplete").menu.element.addClass("my_class");
        $(this).data("uiAutocomplete").menu.element.width(mywidth);
        setTimeout( function(){$("#phone_code").addClass("open-up")} , 500 );
      },
      close: function () {
        $("#phone_code").removeClass("open-up");
        $('.ui-dialog-content').dialog('close');
      }
    });
    if (window.IE_detect && window.IE_detect() === true) {
      this.fix_IE_autocomplete_blur('phone_code');
    }
    // $("#phone_code").click(function(){
    //   if ($(this).hasClass("open-up")) {$(this).autocomplete("close").blur();}
    // })
    this.element.find('#phone').filter_input({regex:'[0-9]'});

    this.set_nationality_complete();
    if(this.element.data('country')){
      this.set_nationality();
    }
    if($.isFunction( $.fn.filter_input )){
      this.element.find('[id*=doc_expire_date_], [id*=birthday_day_], [id*=birthday_month], [id*=birthday_year]').filter_input({regex:'[0-9]'});
    }
    var polish = {ś:"s",ć:"c",ę:"e",ą:"a",ó:"o",ż:"z",ź:"z",ł:"l",ń:"n",Ś:"S",Ć:"C",Ę:"E",Ą:"A",Ó:"O",Ż:"Z",Ź:"Z",Ł:"L",Ń:"N",Ş:"S",Ç:"C",Ğ:"G",Ö:"O",ş:"S",ç:"C",ğ:"G",ö:"O",ü:"U",Ü:'U',İ:"I",ı:"i",é:"e",è:"e",à:"a",ù:"u",â:"a",ê:"e",î:"i",ô:"o",û:"u",ë:"e",ï:"i",É:"E",À:"A",È:"E",Ù:"U",Â:"A",Ê:"E",Î:"I",Ô:"O",Û:"U",Ë:"E",Ï:"I"};
    switch(window.custom_domain_translit){
      case 'de':
        var char_list = $.extend({}, polish, {ä:"ae",ü:"ue",ö:"oe",ß:"ss",Ä:"Ae",Ü:"Ue",Ö:"Oe",ẞ:"Ss"});
      break;
      default:
        var char_list = $.extend({}, polish);
    }
    char_list_keys = Object.keys(char_list).join("");
    var regex_input = new RegExp("[a-zA-Z"+char_list_keys+"\\-\\s]");
    if( !window.is_mobile ){
      $('.alpha:not(.translit)').filter_input({regex:regex_input});
    }
    if($('.additional_note_checker').length){ $('.additional_note_checker').iCheck({ checkboxClass: 'icheckbox_minimal' });}
  },
  fix_IE_autocomplete_blur:function(id){
    var selector = "#"+id;
    $(selector).unbind('blur');
    $(document).click(function(e){
      if (e.target.id !== id) $(selector).autocomplete('close');
    });
  },
  set_nationality:function(){
    var country = this.element.data('country'),
     self = this;
    this.element.find(".nationality_select").each(function(){
      $(this).val(country.name);
      $(this).siblings("input[type=hidden]").val(country.code.toUpperCase());
      self.init_international_validation(country.code.toUpperCase(), $(this));
    });
  },
  set_nationality_complete:function(){
    var self = this;
    var i = 0;
    this.element.find(".nationality_select").each(function(){
      $(this).autocomplete({
            minLength: 0,
            select: function(ev, ui){
                $(this).val(ui.item.name);
                $(this).siblings("input[type=hidden]").val(ui.item.code).change();
                $(this).parent().next().find("input").focus();
                $(this).change();
                $(this).autocomplete("close").blur();
                self.init_international_validation(ui.item.code, $(this));
                i = 1;
                return false;

            },
            open: function(event, ui) {
              if ($(".ui-menu-item:visible").length === 1) {
                return $($(this).data('autocomplete').menu.active).find('a:visible').trigger('click');
              }
            },
            response: function(event, ui) {
              if (ui.content.length == 1)
              {
                    $(this).val(ui.content[0].name);
                    $(this).siblings("input[type=hidden]").val(ui.content[0].code).change();
                    $(this).parent().next().find("input").focus();
                    $(this).change();
                    $(this).autocomplete( "close" );
                    self.init_international_validation(ui.content[0].code, $(this));
               }
            },
            search:function(ev, ui){
              i = 0;
              if(ev.originalEvent){
                $(this).siblings("input[type=hidden]").val("");
              }
            },
            source: function(req, add) {
              var data = [];
              for(var i in self.nationalities){
                if(self.nationalities[i].name){
                  if(eval("/^"+req.term.toLowerCase()+"/").test(self.nationalities[i].name.toLowerCase())){
                    data.push(self.nationalities[i]);
                  }
                }
              }
              add(data);
            },
			open: function () {
				var my_top = $(this).data("uiAutocomplete").menu.element.offset();
				$(this).data("uiAutocomplete").menu.element.addClass("nationality_my_class").css('top', my_top.top - 1);
			  //setTimeout( function(){$(".nationality_select").addClass("open-up")} , 500 ); // IE fix
			  $(".nationality_select").addClass("open-up");
      },
      close: function () {
        $(".nationality_select").removeClass("open-up");

      }
    }).focus(function(ev){
      if(ev.originalEvent && !i)    {
        $(this).autocomplete("search", '');
      }
    }).on('touchstart', function(){
        if($(this).hasClass('open-up')){
          $(this).autocomplete("close");
          event.preventDefault();
          $(this).blur();
        }
    }).data("autocomplete")._renderItem = function(ul, item) {
      return $("<li></li>").data("item.autocomplete", item).append("<a><strong>" + item.name + "</strong></a>").appendTo(ul);
    }
    })
    //$(".nationality_select").click(function(){
    //  if ($(this).hasClass("open-up")) {$(this).autocomplete("close").blur();}
    //})
  },
  init_international_validation: function(value, el){
    var self = this;
    if(typeof(just_international_passport) != "undefined" && just_international_passport){
      index = el.attr('id').replace('citizenship', '');
      index = index.replace('name_', '');
      doc_el = $('#docnum'+index);
      if(doc_el.attr('id')){
        if(value == 'RU'){
          doc_el.rules("add", "ru_international");
          doc_el.addClass('ru_international_check');
        } else{
          doc_el.rules("remove", "ru_international");
          doc_el.removeClass('ru_international_check');
        }
      }
    }

    var doc_element = $(el).parent().siblings('.document_number').find(':input');
    if(doc_element && $(el).parent().is(":visible")){
      var previous_nationality = doc_element.data('previous_nationality');

      if(previous_nationality && doc_element.hasClass('nation_valid_docnum_for_'+previous_nationality)){
        doc_element.removeClass('nation_valid_docnum_for_'+previous_nationality).addClass('valid_docnum');
      }

      if($.validator.methods['nation_valid_docnum_for_'+value.toUpperCase()] && doc_element.hasClass('valid_docnum')){
          doc_element.addClass('nation_valid_docnum_for_'+value.toUpperCase()).removeClass('valid_docnum');
          $.validator.messages['nation_valid_docnum_for_'+value.toUpperCase()] = validation_errors['valid_docnum'];
      }

      if(self.set_docnum_validation_for_ru) self.set_docnum_validation_for_ru($(el).siblings('.hidden_nationality'));
      doc_element.data('previous_nationality', value.toUpperCase());
    }
  },
  check_nationality_complete:function(){
    this.element.find(".hidden_nationality").each(function(){
      if(!$(this).val().length){
        $(this).siblings("input[type=text]").val("");
      }
    });
  },
  check_document_type_complete:function(){
    this.element.find(".hidden_document_type").each(function(){
      if(!$(this).val().length){
        $(this).siblings("input[type=text]").val("");
      }
    });
  },
  set_loader:function(show){
    if(show){
      $("#user_loader").show();
    } else {
      $("#user_loader").hide();
    }
  },
  go_to_top:function(type){
    this.go_top = type;
  },
  show_login_form:function(){
    $('.errors_block').remove()
    this.element.find("#buyer_data").hide();
    this.element.find("#buyer_data .error").removeClass('error');
    this.element.find("#login_form").show();
    this.element.find("#login_form #pass").removeAttr("disabled");
    this.element.find("#login_form #pass").prop('required', true);
    this.element.find("#login_form #pass").focus();
  },
  hide_login_form:function(){
    this.element.find("#buyer_data").show();
    this.element.find("#login_form").hide();
    this.element.find("#login_form #pass").attr("disabled","disabled");
    this.element.find("#login_form #pass").removeAttr('required');
    this.element.find("#login_form #pass").removeClass('error');
  },
  setup_validation: function() {
   var self = this;
   self.validator_instance = this.element.find("form").validate({
     ignore: ":not(:visible):not(.required-hidden)",
     highlight: function(el, e_cls) {
        $(el).addClass(e_cls);
     },
     unhighlight: function(el, e_cls) {
       $(el).removeClass(e_cls);
       self.rm_tooltip($(el));
     },
     errorPlacement: function(err,el) {
       txt = $(el).data("error-info");
       if( typeof($(err.get(0)).context) != "undefined" && typeof($(err.get(0)).context.textContent) != "undefined" && !txt ){
       txt = $(err.get(0)).context.textContent;
      }

      self.set_tooltip($(el),txt,true);
      self.check_spec_input();

     },
     invalidHandler: function(event, validator){
      $.each(validator.errorList, function(i,v){ $(v.element).data("error-info", v.message); });
     },
     onkeyup: function(element){
      el = $(element);
      if( el.hasClass('ru_international_check') ){
        val = el.val();
        idx = $(".txtinput").index(el);
        if(/[^0-9]/.test(val)){
          el.val(val.replace(/[^0-9]/g, ''));
          window.hide_info_popup();
          window.show_error_popup(el, validation_errors['ru_international'], idx, false);
        } else if(val.length > 9){
          el.val(val.substring(0,9));
          window.hide_info_popup();
          window.show_error_popup(el, validation_errors['ru_international'], idx, false);
        } else{
          window.hide_error_popup( idx );
        }
      }
     },
     onfocusout: function(element){
      el = $(element);
      if( el.hasClass('ru_international_check') ){
        idx = $(".txtinput").index(el);
        window.hide_error_popup( idx );
      }
     },
     focusCleanup: true,
     focusInvalid: false,
     minlength:3
    });
  },
  set_tooltip:function(el,text,scroll){
      //if($('.b_errors').is(':visible')) return false;
      if(window['front_version'] == 'mobile'){
        if(/checkbox-payment/.test(el.attr('id'))){
          el.parents('.accept_checkbox_js').addClass('error');
        }
      }
      scroll = scroll || false;
      var idx  = $(".txtinput").index(el);
      var self = this;
      el =  el.hasClass("i_accept_chk") ? el.parents(".i_accept, .s_check").addClass("accept-error") : el;
      if(!$("._idx_" + idx).size())
        window.show_error_popup(el,text,idx,true);
    if($(".error").length > 0){

      if($(".error:eq(0)").is(':visible')){
        wrapper_error_input = $(".error:eq(0)");
      } else {
        wrapper_error_input = $(".error:eq(0)").parent();
      }

      var first_error = $(wrapper_error_input).offset().top - ($(wrapper_error_input).height() * 3);

      if(!idx && ! this.go_top || scroll && !this.go_top) {
        this.go_to_top(true);
        $('html, body').animate({ scrollTop: first_error }, 500,function(){self.go_to_top(false);});
      }
    }
  },
  rm_tooltip:function(el){
    var idx = $(".txtinput").index(el);
    window.hide_error_popup(idx);
  },
  check_spec_input:function(){
    this.element.find(".error.spec").parents(".spec_container").find("input").addClass("error");
    $(".b_errors.errors_block").each(function(i,el){
      if(i) $(el).remove();
    });

    /**
     * might be more than 1
     */
//    if(this.element.find(".field.sex input[type=checkbox]:checked").size() < 1){
//      this.element.find(".field.sex li").addClass("error");
//    }

    $.each( this.element.find((".field.sex")), function(k,v){

        var genders = $(this).find("input[type=checkbox]");
        var n = genders.length;
        $.each( genders, function(k,v){
            if( $(this).is(":checked") ){
                n --
            }
        })

        if( n == genders.length ){
            $(this).find("li").addClass("error");
        }
    })
  },
  setup_submit:function(){
    var self = this;
      this.element.find("form").ajaxformbar({
        load_time:60,
        loader_type:'circle_big',
        hide_on_success: self.parent.hide_on_success,
        start: 10,
        text:self.parent.booking_start,
        success_tag: 'success',
        success: function(response, textStatus, jqXHR){
          $(window).unbind('beforeunload');
          self.success_call_back(response);
        },
        error: function (xhr, ajaxOptions, thrownError) {
          self.error_call_back(xhr, ajaxOptions, thrownError)
        }
      });
  },
  success_call_back:function(data){
    var self = this;
    if(data.success){
      $(window).unbind('beforeunload');
      if(data.redirect){
        window.location.href = data.url;
      }
      else if(data.status){
        window.location.reload();
      }
      else{
        $("body").append(data.form);
        $("#payment_form").submit();
      }

    }else{
      if(typeof data.renew_search != 'undefined' && data.renew_search){
        $('.line_loader_bg .dark_loader strong').text(data.renew_search.action_description);
        $('.line_loader_bg').show();
        $.ajax({
          url: data.renew_search.url,
          data: data.renew_search.params,
          type: 'POST',
          dataType:"json",
          timeout:90000,
          success: function(response, textStatus, jqXHR){
                $(window).unbind('beforeunload');
                if(response.code === false){
                  rd = response.action == 'results' ? 1 : (response.action == 'booking' ? 2 : 0);
                  if(window.cur_domain == 'avia'){ window.tracking(1, 1, response.params.session_id, 0, rd); }
                  if(window.gds){
                    window.location.href = '/' + window.lang_prefix + window.gds +  "/search/"+ response.action +"?" + $.param(response.params)
                  }else{
                    url_prefix = window.lang_prefix != '' ? "/" + window.lang_prefix : "/";
                    window.location.href = url_prefix+ "search/"+ response.action +"?" + $.param(response.params)
                  }
                }else{
                  $('.line_loader_bg').hide();
                  message('msg_title', response.msg, 'continue_button', function(){window.location.href =  '/' + window.lang_prefix;  return false });
                }
          },
          error: function(jqXHR,textStatus,errorThrown ){
            if(window.cur_domain == 'avia'){ window.tracking(1, (textStatus==="timeout" ? 3 : (tr_error_reason ? tr_error_reason: 4) ), '', 0); }
            $(window).unbind('beforeunload');
            message('msg_title', window.I18n.server_error, 'continue_button', function(){window.location.href =  '/' + window.lang_prefix;  return false });
          }
        });
      }else{
        if(data.data_error){
          self.before_show_errors_after_submit();
          $.each(data.errors,function(id,text){
            var el = false;
            if(/card/.test(id)){
          	  el = self.element.find(".way_description_block_aircompany:visible #" + id.replace("|","-"));
          	  if(el.length == 0){
              	  el = self.element.find(".way_description_block:visible #" + id.replace("|","-"))
          	  }
            } else if(id == 'promotion_code'){
              el = self.element.find("#" + id.replace("|","-")+':visible');
            } else {
          	  el = self.element.find("#" + id.replace("|","-"));
            }

            if(el && el.length > 0){
                el.addClass("error");
                self.set_tooltip(el,text,true);
            }else{
          	  message('msg_title', text, 'continue_button', window.close_message);
            }

          });
          self.check_spec_input();
        }
        else{
          if(data.to_direct){
            $('[data-default_group="direct"]:visible').find('ins').click()
          }
          log_error(data.msg, ((typeof(session_id)!="undefined" ? session_id : "")||''), '');
          $(window).unbind('beforeunload');
          if (data.error_code == 750) {
            verification_message('msg_title', data.msg, 'continue_button', window.close_message);
          } else {
            message('msg_title', data.msg, 'continue_button', window.close_message);
          }
        }
      }
    }

  },
  before_show_errors_after_submit: function(){
  },
  error_call_back: function( xhr, ajaxOptions, thrownError ){
      if(xhr.status && (typeof(session_id)!="undefined")) log_error(''+xhr.status+': '+thrownError, ((typeof(session_id)!="undefined" ? session_id : "")||''), '');
      message('msg_title', I18n.server_error, 'continue_button', window.close_message);
  },

  load_passengers:function(url){
    var self = this
    $("<form>").ajaxformbar({
        url:url,
          load_time:10,
          start: 3,
        success:function(resp){
          if(resp.success){
            $("#passengers_popup").remove()
            $("body").append(resp.html)
            $("#passengers_popup").attachPassengerPopup({ctrl:self})
          }
          else{
            message('msg_title', resp.msg, 'continue_button', window.close_message);
          }
        }
    }).submit()
  },
  set_date_validation_error: function(el){
    var self = this;
    el.parents(".spec_container").find("input").addClass('error');
    self.set_tooltip(el.parents(".spec_container").find(".valid_correct_date"), validation_errors.date, true);
  },

  ".spec_container input -> focus":function(ev){
    var self = this
    $(ev.target).parents(".spec_container").find("input").each(function(){
      self.rm_tooltip($(this))
      $(this).removeClass("error");
    })
  },
  ".i_accept_chk -> change":function(ev){
    if($(ev.target).attr("checked") == null)
      this.rm_tooltip($(ev.target));
      $(ev.target).parents(".i_accept").removeClass("accept-error error");
  },
  ".passenger_age_select -> click":function(ev){
    this.rm_tooltip($(ev.target))
  },
  ".login_link -> click":function(ev){
    ev.preventDefault();
    window.show_login();
  },
  ".load_passengers -> click":function(ev){
    ev.preventDefault();
  },

  ".autoCMP -> keyup":function(){
    this.auto_compliete_user_name();
  },
  auto_compliete_user_name: function(){

    var username_val = $.trim($('#name').val())

        ,firstname_val_gd = $(".passenger:first .first").val()
        ,lastname_val_gd = $(".passenger:first .last").val();
      if(this.parent.last_val == username_val || username_val == '' || username_val == firstname_val_gd || username_val == lastname_val_gd){
        this.parent.last_val = $.trim($(".passenger:first .first").val() + ' ' + $(".passenger:first .last").val());
        $('#name').val(this.parent.last_val);
      }

   },

  "input[type=submit] -> click":function(ev){
    ev.preventDefault();
    if($('.js-separate-page:visible').length > 0){
      $('.js-separate-page:visible').click();
      return;
    }
    if($(ev.target).parents(".user_contacts_block").size()) return;
    if($('.big-preloader').is(':visible')) return;

    window.hide_error_popup("all");
    this.check_nationality_complete();
    this.check_document_type_complete();
    if( this.element.find("form").valid() ) {
      if (this.element.find("#login_form").is(':visible')) {
        var pass_el = this.element.find("#pass");
        pass_el.addClass("error");
        window.hide_info_popup();
        this.set_tooltip(pass_el, window.I18n.please_login, true);
        return;
      }

      //показуємо попап з вибором страховки
      if( typeof(insWithAviaObj) != "undefined" && typeof(insWithAviaObj.checkInsuranceAlertOnBooking) != "undefined" && insWithAviaObj.checkInsuranceAlertOnBooking() ){
        insWithAviaObj.showInsuranceAlertOnBooking( {form: this.element.find("form"), action: "submit"} );
      } else {
        this.element.find("form").submit();
      }
    } else{
      if(['avia','hotels','rgd','gd','aeroexpress','car','transfer','insurance', 'carinsurance'].indexOf(window.cur_domain) > -1){
        var lst = {};
        var escaped_fields = ['card_number', 'card_date', 'card_cvv', 'card_holder'];
        $.each(this.validator_instance.errorList, function(index, el){ lst[ $(el['element']).attr('name') ] = el['message'] + '|' + prepare_el_value_for_log($(el['element']), escaped_fields); });
        log_error(JSON.stringify(lst), ((typeof(session_id)!="undefined" ? session_id : "")||''), '', 950);
      }
      this.check_spec_input();
    }
  },
  "input[type=email], #login_form #pass -> focus":function(ev){
    var idx = this.element.find("#user_form input").index($(ev.target));
    window.hide_error_popup(idx)
  },

  "#login_form #pass -> keydown":function(ev){

    if (ev.keyCode == 13) {
      ev.preventDefault()
      this.login_submit()
    }
  },

  "#email -> focus":function(ev){
    /* Dirty hack for IE and Safary. Change is not working */
    ev.target.old_value = $(ev.target).val();
  },

  "#email -> blur":function(ev){
    this.check_user_email(ev);
  },

  "#email -> change":function(ev){
    this.check_user_email(ev);
  },

  check_user_email: function(ev) {
    var mail = $(ev.target).val();
    var self = this;
    if(mail && mail != ev.target.old_value && !$(ev.target).attr('readonly') && !$(ev.target).data("process")){   /* <<<----------- */
      $(ev.target).data("process", true);
      if (!ev.target.old_value) {
          ev.target.old_value = mail; //Dirty hack for IE and Safary autocomplete
      }
      $.ajax({
        url:  "/check_user",
        dataType:"json",
        data: {email:mail},
        success:function(reps){
          if(reps.exist){
            self.show_login_form();
            if(window.ajaxBufferUpdateSearch != undefined){
              window.ajaxBufferUpdateSearch.abort();
            }
          }
          else{
            self.hide_login_form();
          }
          $(ev.target).data("process", false);
        },
        error:function(){
          self.hide_login_form();
          $(ev.target).data("process", false);
        }

      })
    }
  },

  "#login_form input[type=button] -> click":function(ev){
    ev.preventDefault();
    this.login_submit()
  },
  login_submit:function(){

    var email = this.element.find("#email").val()
    var pass  = this.element.find("#pass").val()
    var ctrl  = $(".popup_login").controller();
    var form  = this.element.find("#user_form");
    var self  = this;

    $("<form>").ajaxformbar({
      data:{user:{email:email,pass:pass}},
      url: "/" + window.language + "/login",
      set_html:false,
      beforeSend:function(){
        window.hide_error_popup("all");
        self.set_loader(true);
      },
      success:function(resp){
        if(resp.success){
          $.publish("login_success",[resp.user])
          $("#buyer_data").show();
          self.set_loader(false);
        }
        else{
          ctrl.login_failed(resp.errors,form)
          self.set_loader(false);
        }
      }
    }).submit();
  },
  ".expire_date input, .birth_date input -> focus":function(ev){
    $(".error_doc_expire_date_month,.error_birthday_month").remove()
  },
  ".tab_gender_select -> change":function(ev){
    $(ev.target).parents('.sex').find("label, .icheckbox_minimal").removeClass("checked");
    $(ev.target).parents('.sex').find('input[type="checkbox"]').prop('checked', false);
    $(ev.target).parent().addClass("checked").prev().addClass("checked");
    $(ev.target).prop('checked', true);

    $(ev.target).closest(".field.sex").find("li").removeClass("error");
    $("div:regex(class, .*error_passengers_gender.*)").remove();
    $(ev.target).parents('.field.sex').next().find("input:first").focus();
  },
  "input.splited_date_input -> keyup":function(ev){
    el = $(ev.target);

    var date_check_dbl = el.hasClass('date_check_dbl');
    var date_check_dbl_pass = el.hasClass('date_check_dbl_pass');
    var inc = parseInt(el.attr('tabindex')) + 1;
    var currentPass = 0;
    if(el.parents(".passenger").length > 0){
        currentPass = parseInt(el.parents(".passenger").attr('class').replace(/passenger/g, ''));
    }
    if(date_check_dbl || date_check_dbl_pass){
        if(date_check_dbl){
            var arrDates = ['20', '19'];
            inc += 1
        }else{
            var arrDates = ['20'];
            inc = currentPass > 0 && $(".passenger_num").length == currentPass? 100 : inc += 2
        }
        var val = el.val();
        if(arrDates.indexOf(val) === -1 && parseInt(el.val().length) === 2){
            if(parseInt('20' + val) > new Date().getFullYear() && date_check_dbl){
                el.val('19' + val);
            }else{
                el.val('20' + val);
            }
        }
    }
    if( el.val().length == el.attr('maxlength') && [37,38,39,40].indexOf(ev.keyCode) === -1){
        if(el.attr('maxlength') == 4 ){
            if(!$('[tabindex=' + inc + ']').is(':visible')){
                inc = currentPass > 0 && $(".passenger_num").length == currentPass? 100 : inc += 6
            }
            $('[tabindex=' + inc + ']').focus();
        }else{
            el.next().focus();
        }
    }
  },
  ".field input, .card_data input -> keyup":function(ev){

    el = $(ev.target);

    this.check_interaction( el )

    if( el.val().length > el.attr('maxlength')){
      el.val(el.val().slice(0, -1))
    }
  },
  ".add_passenger -> click":function(ev){
    ev.preventDefault()
    var el = $(ev.target).hasClass("add_passenger") ? $(ev.target) : $(ev.target).parent()
    this.load_passengers(el.attr("href"))
  },
  setup_magnific: function(){
    window.enable_magnific();
  },
  ".help_link -> click": function(ev){
    return false;
  },
  ".forgot_password -> click":function(ev){
    ev.preventDefault();
    window.show_login();

    var current = $('.popup_content:visible');
    $("#" + $(ev.target).data("cls")).show();
    current.hide();
    var inputs = $("input[type=text],input[type=email],input[type=password]");
    inputs.removeClass("error");
    $(".errors_block").remove();

    $(".popup_login").controller().events[2][2](ev)
  },
  ".only_chars -> keyup":function(ev){
    el = $(ev.target)
    regExp = /[^а-яА-ЯA-zA-ZїЇіІЄє]|[_\^]+/;
    var caretPosition = el.caret().begin - (regExp.test(el.val()) ? 1 : 0);
    el.val(el.val().replace(regExp, ""))
    el.caret(caretPosition);
  },
  ".only_chars_with_space -> keyup":function(ev){
    var el  = $(ev.target)
    var regExp = /[^а-яА-Яa-zA-ZїЇіІЄєśćęąóżźłńŚĆĘĄÓŻŹŁŃŞÇĞÖşçğöüÜäßÄÖẞ\s\-]+/;
    var caretPosition = el.caret().begin - (regExp.test(el.val()) ? 1 : 0);
    var val = el.val().replace(regExp, "").split(" ")

    val.length > 2 ? val.pop() : false;
    el.val(val.join(" "))
    el.caret(caretPosition);
  },
  ".only_latin -> keyup":function(ev){
    el = $(ev.target)
    regExp = /[^a-zA-Z]+/;
    var caretPosition = el.caret().begin - (regExp.test(el.val()) ? 1 : 0);
    el.val(el.val().replace(regExp, ""))
    el.caret(caretPosition);
  },
  ".only_latin_with_space -> keyup":function(ev){
    var el  = $(ev.target)
    var regExp = /[^a-zA-Z\s]+/;
    var caretPosition = el.caret().begin - (regExp.test(el.val()) ? 1 : 0);

    var val = el.val().ltrim().replace(regExp, "").replace(/\s\s/, " ");
    el.val(val)
    el.caret(caretPosition);

  },
  ".only_latin_with_space_hyphen -> keyup":function(ev){
    var el  = $(ev.target)
    var regExp = /[^a-zA-Z\s\-]+/;
    var caretPosition = el.caret().begin - (regExp.test(el.val()) ? 1 : 0);
    var val = el.val().ltrim().replace(regExp, "").replace(/\s\s/, " ").replace(/\-\-/, "-");
    el.val(val)
    el.caret(caretPosition);
  },
  ".student_num -> keyup": function(ev){
    el = $(ev.target);
    regExp = /[^а-яА-Я0-9]+/;
    var caretPosition = el.caret().begin - (regExp.test(el.val()) ? 1 : 0);
    el.val(el.val().replace(regExp, ""))
    el.caret(caretPosition);
  },
    ".only_post_number -> keyup": function(ev){
    el = $(ev.target);
    regExp = /[^0-9\-]+/;
    var caretPosition = el.caret().begin - (regExp.test(el.val()) ? 1 : 0);
    el.val(el.val().replace(regExp, ""))
    el.caret(caretPosition);
  },
    ".only_house_number -> keyup": function(ev){
      el = $(ev.target);
      regExp = /[^0-9a-z\//\-]+/;
      var caretPosition = el.caret().begin - (regExp.test(el.val()) ? 1 : 0);
      el.val(el.val().replace(regExp, ""))
      el.caret(caretPosition);
    },
    ".only_street_string -> keyup": function(ev){
      el = $(ev.target);
      regExp = /[^A-Za-zśćęąóżźłńŚĆĘĄÓŻŹŁŃ/\-\., ]+/;
      var caretPosition = el.caret().begin - (regExp.test(el.val()) ? 1 : 0);
      el.val(el.val().replace(regExp, ""))
      el.caret(caretPosition);
    },
    ".only_city_string -> keyup": function(ev){
      el = $(ev.target);
      regExp = /[^A-Za-zśćęąóżźłńŚĆĘĄÓŻŹŁŃ\ \-]+/;
      var caretPosition = el.caret().begin - (regExp.test(el.val()) ? 1 : 0);
      el.val(el.val().replace(regExp, ""))
      el.caret(caretPosition);
    },
  ".document_kz -> keyup": function(ev){
    el = $(ev.target);
    regExp = /[^A-Za-zа-яА-Я0-9]+/;
    var caretPosition = el.caret().begin - (regExp.test(el.val()) ? 1 : 0);
    el.val(el.val().replace(regExp, ""))
    el.caret(caretPosition);
  },
  ".only_numbers -> keyup":function(ev){
    el = $(ev.target)
    regExp = /[^0-9]+/;
    var caretPosition = el.caret().begin - (regExp.test(el.val()) ? 1 : 0);
    el.val(el.val().replace(regExp, ""))
    el.caret(caretPosition);
  },
  ".only_days -> keyup": function (ev) {
    var self = this;
    var el = $(ev.target);
    if (ev.keyCode == '9' || ev.keyCode == '16' || ev.keyCode == '17' || ev.keyCode == '65') {
      return;
    }

    if (el.val() == '') return;

    if (el.val().length == 1 && el.val() > 3) {
      el.next().focus();
    } else if (el.val().length == 2 && el.val() <= 31) {
      el.next().focus();
    } else if (el.val() >= 0 && el.val() <= 31) {
      //console.log('valid');
    } else {
      self.set_date_validation_error(el);
    }
  },
  ".only_months -> keyup": function (ev) {
    var self = this;
    var el = $(ev.target);
    if (ev.keyCode == '9' || ev.keyCode == '16' || ev.keyCode == '17' || ev.keyCode == '65') {
      return;
    }

    if (el.val() == '') return;

    if (el.val().length == 1 && el.val() > 1) {
      el.next().focus();
    } else if (el.val().length == 2 && el.val() <= 12) {
      el.next().focus();
    } else if (el.val() >= 0 && el.val() <= 12) {
      //console.log('valid');
    } else {
      self.set_date_validation_error(el);
    }
  },
  ".only_years -> keyup": function (ev) {
    var self = this;
    var el = $(ev.target);
    if (ev.keyCode == '9' || ev.keyCode == '16' || ev.keyCode == '17' || ev.keyCode == '65') {
      return;
    }

    if (el.val() >= 1900 && el.val() <= new Date().getFullYear()) {
      $('input[tabindex=' + (el.attr('tabindex') + 1) + ']').focus();
    } else if(el.val().length < 4) {
      //console.log('not valid');
    } else {
      self.set_date_validation_error(el);
    }
  },
  ".only_alphanum_latin -> keyup":function(ev){
    // if( window.is_mobile ) return true;
    el = $(ev.target)
    regExp = /[^a-zA-Z0-9]+/;
    var caretPosition = el.caret().begin - (regExp.test(el.val()) ? 1 : 0);
    el.val(el.val().replace(regExp, ""))
    el.caret(caretPosition);
  },
  ".chec_cyrylic -> keypress":function(ev){
    var el = $(ev.target);
    if(/[а-яА-Я]+/.test(el.val())){
      el.addClass("error");
      window.hide_info_popup();
      this.set_tooltip(el,window.I18n.please_change_keyboad)
    }
    else{
      el.removeClass("error");
      this.rm_tooltip(el);
    }
  },
  ".nationality_select -> focus":function(ev){
    $(ev.target).select()
    $(ev.target).autocomplete("search", '');
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

  '.additional_note_checker -> ifClicked':function(ev){
      var el  = $(ev.target);
      var inp = $('#additional_' + el.attr('id'));
      if(el.is(':checked')){
          inp.val('').hide();
          inp.removeAttr('required');
      } else {
          inp.attr('required', 'required');
          inp.show();
      }
  },

});

$.Controller("PassengerPopup",{
  init:function(){
    $('.sel_doc, .sort').chosen({
      allow_single_deselect: true,
      disable_search_threshold: 10,
      no_results_text: window.I18n.selectivity.no_results_for_term,
      search_contains: true,
      '.chosen-select-no-search' : {disable_search: true}
    });
  },
  ".select-popup-close -> click":function(ev){
    ev.preventDefault();
    this.element.remove();
  },
  "input[type=button] -> click":function(ev){
    ev.preventDefault();
    this.fill_data($(ev.target).parent().data("passenger"));
  },
  fill_data:function(passenger){
    this.element.remove()
    this.options.ctrl.element.find(".nationality select").selectbox("detach")
    $('div.passenger_info .icheckbox_minimal').iCheck('uncheck');
    $("[id*=" + "pas_series" + "]").val("");
    $("[id*=" + "pas_number" + "]").val("");
    for(i in passenger){
      var el = this.options.ctrl.element.find("[id*="+i+"]");

      if(el.parent("div").hasClass('hidden') || el.parents(".expire_date").hasClass('hidden')) continue; //ignore hidden blocks

      if(/passengers_gender/.test(i) && el.size() < 1){
        var reg = i.split("-");
        el = $('[id^="'+reg[0]+'"][id$="'+reg[1]+'"]');
      }
      if(/citizenship/.test(i)){
        var nationality_string = "";
        for(n in nationalities){
          if(nationalities[n].code == passenger[i]){
            nationality_string = nationalities[n].name;
          }
        }
        el.val(nationality_string).change();
        el = el.siblings("input[type=hidden]");
      }
      if(/patronymic/.test(i) ){
        if(el[1]){
          el = $(el[1]);
        }else{
          continue;
        }
      }
      if(/docs/.test(i)){
        for(key in passenger[i]){
          for(doc in passenger[i][key]){
            if(doc.match(/doc_series.*/) && passenger[i][key][doc]) $("[id*=" + "pas_series" + "]").val(passenger[i][key][doc]);
            if(doc.match(/docnum.*/) && passenger[i][key][doc]) $("[id*=" + "pas_number" + "]").val(passenger[i][key][doc]);
          }
        }
      }
      if((/doc_expire_date_day/).test(i)){
        $(el).click();
      }
      this.options.ctrl.rm_tooltip(el)
      el.removeClass("error");
      if(/checkbox/.test(el.attr("type")))  el.attr("checked","checked")
      el.val(passenger[i]).change();
    }
    this.options.ctrl.element.find(".nationality select").selectbox("attach")

  },
  ".sort -> change":function(ev){
    var mylist = $('.scroll_box');
    var listitems = mylist.children('div').get();
    listitems.sort(function(a, b) {
      if($(ev.target).val() == 'desc'){
        return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
      }else{
        return $(b).text().toUpperCase().localeCompare($(a).text().toUpperCase());
      }
    });
    $.each(listitems, function(index, item) {
       mylist.append(item);
    });
  },
  ".corp_cabinet_filters .form-text -> keyup":function(ev){
    var mylist = $('.scroll_box');
    var listitems = mylist.children('div').get();
    var searchtext = $.trim($(ev.target.parentNode).find("input[name=name]").val()).toUpperCase();
    $.each(listitems, function(index, item) {
      $(item).show();
      if($(item).text().toUpperCase().search(searchtext) == -1){
        $(item).hide();
      }
      mylist.append(item);
    });
  }
});
