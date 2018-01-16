var DateInput = function(controller_instance){
  var caret_before = 0;
  var caret_after  = 0;
  var length_before = 0;
  var self = this,
      private = {};
  self.controller_instance = controller_instance;

  self.createDateInput = function(){
    self.controller_instance.element.find('.js-date-input-mask').mask("99.99.?9999", {placeholder: '_', skipOptionalPartCharacter: " "});
    self.controller_instance.element.find('.js-date-input-mask').filter_input({regex:'[0-9.]', live: true});
    self.setEvents();
    if(window.enable_popups && window.cur_domain == 'my') window.enable_popups();
  }

  self.setEvents = function(){
    //fix date backspace
    $('.js-date-input-mask').on('focus', function(ev){$(ev.target).trigger('keydown')})

    self.controller_instance.element.find('.js-date-input-mask').on('click', function(e){
      var el = $(e.target)
      if(el.val().length == 0 || el.val() == el.attr("placeholder")) setCaretToPos(e.target,0)
    })
    self.controller_instance.element.find('.js-date-input-mask').on('focus', function(e){
      var el = $(e.target)
      if(el.val().length == 0 || el.val() == el.attr("placeholder")) setCaretToPos(e.target,0)
    })
    self.controller_instance.element.find('.js-date-input-mask.date_check_dbl').on('keydown', function(e){
      if(window.is_mobile) { caret_before = $(e.target).caret().begin;}
    })
    self.controller_instance.element.find('.js-date-input-mask.js-expiration-date').on('keydown', function(e){
      if(window.is_mobile) { caret_before = $(e.target).caret().begin;}
    })
    self.controller_instance.element.find('.js-date-input-mask.date_check_dbl').on('keyup', function(e){
      if(window.is_mobile) { caret_after  = $(e.target).caret().begin;}
      private.checkDateField(e);
    })
    self.controller_instance.element.find('.js-date-input-mask.js-expiration-date').on('keyup', function(e){
      if(window.is_mobile) { caret_after  = $(e.target).caret().begin;}
      private.checkDateField(e);
    })
    self.controller_instance.element.find('.js-date-input-mask.date_check_dbl').on('blur', function(e){
      if(window.is_mobile) private.checkDateField(e);
    })
    self.controller_instance.element.find('.js-date-input-mask.js-expiration-date').on('blur', function(e){
      if(window.is_mobile) private.checkDateField(e);
    })

    self.controller_instance.element.find('.js-date-input-mask').each(function(i, value){
      if($(value).data('input-group-class')){
        $(value).on('change', function(e){
          var el = $(e.target),
              dates = $(e.target).val().split('.');
          if(dates.length == 3){
            var inputs = el.parents('.js-date-block').find('.' + el.data('input-group-class')).find('input');
            if(inputs.length == 3){
              $(inputs[0]).val(dates[0]);
              $(inputs[1]).val(dates[1]);
              $(inputs[2]).val(dates[2]);
            }
          }

        })
      }
    })
  }

  //splited
  self.createSplitedDateInput = function(){
    self.controller_instance.element.find('.js-splited-date input').filter_input({regex:'[0-9.]', live: true});
    self.setSplitedEvents();
    if(window.enable_popups && window.cur_domain == 'my') window.enable_popups();
  }

  self.validGroupByElement = function(el){
    var group = self.getAllGroupByElement(el),
        valid = group.valid();
    if(!valid) group.addClass('error');
    return valid;
  }
  self.getAllGroupByElement = function(el){
    return el.parents('.js-splited-date').find('input');
  }
  self.clearGroupErorByElement = function(el){
    self.getAllGroupByElement(el).removeClass('error');
    var err_el;
    if((err_el = self.getAllGroupByElement(el).siblings('samp.error')).length > 0 || (err_el = self.getAllGroupByElement(el).parent().siblings('samp.error')).length > 0) err_el.remove();
  }

  self.valid = function(el){
    if(el.val().length == 0){
      el.valid();
      return false;
    }

    var need_group_valid = false,
        grouped_inputs = self.getAllGroupByElement(el);
    if(grouped_inputs.index(el) == grouped_inputs.length-1) need_group_valid = true;
    else if($.makeArray(grouped_inputs).every(function(v){ return $(v).val().length != 0; })) need_group_valid = true;

    if(need_group_valid && !self.validGroupByElement(el)) return false;
    return true;
  }

  self.setSplitedEvents = function(){
    //fix date backspace

    $('.js-splited-date input').on('focus', function(ev){$(ev.target).trigger('keydown')})

    var inputs =  self.controller_instance.element.find('.js-splited-date input');
    inputs.on('blur', function(){
      var $el = $(this);
      $el.val($el.val().replace(/[^0-9]/,''));
    })
    inputs.on('click', function(e){
      var el = $(e.target)
      if(el.val().length == 0 || el.val() == el.attr("placeholder")) setCaretToPos(e.target,0)
    })
    inputs.on('focus', function(e){
      var el = $(e.target)
      self.clearGroupErorByElement(el);
      if(el.val().length == 0 || el.val() == el.attr("placeholder")) setCaretToPos(e.target,0)
    })

    inputs.on('keydown', function(e){
      length_before = $(e.target).val().length;
      if((window.is_mobile && e.which === 9) || (e.which === 13 && !$(e.target).hasClass('pass'))){
        if(self.valid($(e.target))){
          if(typeof self.controller_instance.scroll_to != 'undefined') self.controller_instance.scroll_to('next_unfilled', 500, '', true, 60, true);
          else return true;
        } else {
          return false;
        }
      }
      if(e.which === 13 && $(e.target).hasClass('pass')) $(e.target).parents('form').submit();
      return true;

    })
    inputs.on('keyup', function(e){
      if(($(e.target).val().length-length_before != 0 && $(e.target).val().length == $(e.target).attr('maxlength')) && !window.passengerAutocompleting){
        if(self.valid($(e.target))){
          if(typeof self.controller_instance.scroll_to != 'undefined') self.controller_instance.scroll_to('next_unfilled', 500, '', true, 60, true);
          else return true;
        } else {
          return false;
        }
      }else if($(e.target).val().length != $(e.target).attr('maxlength') && (e.which !== 9 && e.which !== 13)){
        self.clearGroupErorByElement($(e.target));
      }
    })

    inputs.filter('.date_check_dbl').on('keydown', function(e){
      if(window.is_mobile) { caret_before = $(e.target).caret().begin;}
    })
    inputs.filter('.js-expiration-date-sp').on('keydown', function(e){
      if(window.is_mobile) { caret_before = $(e.target).caret().begin;}
    })
    inputs.filter('.date_check_dbl').on('keyup', function(e){
      if(window.is_mobile) { caret_after  = $(e.target).caret().begin;}
      private.checkDateField(e, 'splited');
    })
    inputs.filter('.js-expiration-date-sp').on('keyup', function(e){
      if(window.is_mobile) { caret_after  = $(e.target).caret().begin;}
      private.checkDateField(e, 'splited');
    })
    inputs.filter('.date_check_dbl').on('blur', function(e){
      if(window.is_mobile) private.checkDateField(e, 'splited');
    })
    inputs.filter('.js-expiration-date-sp').on('blur', function(e){
      if(window.is_mobile) private.checkDateField(e, 'splited');
    })

    inputs.each(function(i, value){
      if($(value).data('input-group-class')){
        $(value).on('change', function(e){
          var el = $(e.target),
              dates = $(e.target).val().split('.');
          if(dates.length == 3){
            var inputs = el.parents('.js-date-block').find('.' + el.data('input-group-class')).find('input');
            if(inputs.length == 3){
              $(inputs[0]).val(dates[0]);
              $(inputs[1]).val(dates[1]);
              $(inputs[2]).val(dates[2]);
            }
          }

        })
      }
    })

  }
  //splited
  private.checkDateField = function(e, type) {
    type = type || 'mask';
    var el = self.controller_instance.element.find(e.target);

    if(window.is_mobile){
      if(caret_after <= caret_before) return false
    } else {
      if([8, 46].indexOf(e.keyCode) !== -1) return false;
    }

    if(type == 'mask'){
      if(/^[0-9]{2}\.[0-9]{2}\.[0-9]{2}(_){2}$/g.test(el.val()) || /^[0-9]{2}\.[0-9]{2}\.[0-9]{2}$/g.test(el.val())){
        private.AutoFillDate(e);
      }
      if(/^[0-9]{2}\.[0-9]{2}\.[0-9]{4}$/g.test(el.val()) && el.is(':focus')){
        private.ChangeFocus(e);
      }
    } else if(type == 'splited'){
      if(/^[0-9]{2}(_){2}$/g.test(el.val()) || /^[0-9]{2}$/g.test(el.val())){
        private.AutoFillDate(e);
      }
      if(/^[0-9]{4}$/g.test(el.val()) && el.is(':focus') && self.validGroupByElement($(e.target))){
        private.ChangeFocus(e);
      }
    }
    return false;
  }

  private.AutoFillDate = function(e) {
    var el, dbl, initVal, clearVal, newVal, rez;
    el = self.controller_instance.element.find(e.target);
    dbl = el.hasClass('date_check_dbl');
    initVal = el.val().split('.').pop();
    clearVal = initVal.replace(/_/g, '');

    if ( (dbl ? ['20', '19'] : ['20']).indexOf(clearVal) !== -1 ) return false;

    newVal = (dbl && parseInt('20'+clearVal) > new Date().getFullYear() ? '19' : '20') + clearVal;
    rez = el.val().replace(initVal, newVal);
    el.val(rez)
      .trigger('input')
      .trigger('change');
    setTimeout(function() { el.caret(rez.length, rez.length); }, 100 );
  }

  private.ChangeFocus = function(e) {
    var el = self.controller_instance.element.find(e.target);
    if(self.controller_instance.validator_instance) self.controller_instance.validator_instance.element( el );
    setTimeout(function() {
      var container = el.parents('.input-wrapper').length > 0 ? '.input-wrapper' : '.db-col',
        $to = self.controller_instance.focus_to ? self.controller_instance.focus_to(container) : el.parents(container).next().next().find('input');
      if ($to.length > 0) $to.focus();
      else if(typeof self.controller_instance.scroll_to != 'undefined') self.controller_instance.scroll_to('next_unfilled', 500, '', true, 60, true);
    }, 100);
  }
}
