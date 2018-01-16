function PromotionRule(data){
  this.init = function(data){
    this.data = data;
    this.minimalPayment = data.minimal_payment;
  };
  this.canUse = function(){
    return this.data.can_use;
  };
  this.getMinimalPayment = function(){
    return this.data.minimal_payment;
  };
  this.init(data);
};

function Promocodes(){
  this.promocode_value = "";
  this.usePromotionCheckedFlag = false;
  this.usePromotionPercentDiscount = false;
  this.usePromotionCost = 0;
  this.realPromotionCost = 0;

  //clean_price і total будуть різні для авіа (clean_price - чиста ціна авіа, total = clean_price + insuranceCost + transfersCost...)
  this.recalculatePrice = function(clean_price, total){
    var total = (typeof total !== 'undefined') ? total : clean_price;
    this.setPromotionRule();
    this.finalPrice = total;
    if(this.hasPromotionRule() && this.promotionRule.canUse() && this.usePromotionChecked()){
      var minimalPayment = this.promotionRule.getMinimalPayment();
      if(typeof minimalPayment !== 'number' && minimalPayment.indexOf('%') >= 0){
        minimalPayment = (clean_price * parseFloat(minimalPayment)) / 100;
      }
      minimalPayment = (minimalPayment > total) ? total : minimalPayment;
      var discount = this.usePromotionCost;
      var startPrice = total;
      if(this.usePromotionPercentDiscount){
        discount = (clean_price * parseFloat(discount)) / 100;
      }
      diff = (clean_price - discount);
      total = (diff > minimalPayment) ? diff : minimalPayment;
      this.realPromotionCost = startPrice - total;
    }
    return parseFloat(total);
  };

  //метод для оновлення даних в блоці зі всіма складовими ціни
  this.updatePriceBlock = function(){
    if(this.usePromotionChecked() && typeof Hub.dispatcher.getManager('payment') != "undefined"){
      Hub.dispatcher.getManager('payment').additionalPricesSet('promocodes', $('#up_ad_text_js').data('promocodes'), -this.realPromotionCost.toFixed(2));
    }
  };

  //метод для встановлення ціни
  this.updatePrice = function(start_price, currency, precision, element){
    var precision = (typeof precision !== 'undefined') ? precision : 2;
    var element   = (typeof element !== 'undefined') ? element : ".cost_row span";
    var new_price = this.recalculatePrice(start_price);
    if(this.finalPrice != new_price) $(element).text(formatNumber(new_price.toFixed(2), precision) + ' ' + I18n.currency_short[currency]);
    this.finalPrice = new_price;
  };

  //оновлення ціни біля кнопки Оплатити
  this.reload = function(){
    if(Hub && Hub.dispatcher.getManager('payment')){
      Hub.dispatcher.getManager('payment').reloadPrices();
    } else if(typeof $('.js-one_offer').controller() != "undefined"){
      $('.js-one_offer').controller().reloadPrice();
    }
  };

  this.setUsePromotionCheck = function(flag){
    this.usePromotionCheckedFlag = flag;
    this.reload();
  };

  this.usePromotionChecked = function(){
    return this.usePromotionCheckedFlag;
  };

  this.usePromotion = function(){
    return this.usePromotionCost > 0;
  };

  this.setPromotionCost = function(amount, is_percent){
    this.usePromotionCost = parseFloat(amount);
    this.realPromotionCost = 0;
    this.usePromotionPercentDiscount = is_percent;
  };

  this.setPromotionRule = function(){
    var promotion_rule_storage = $('#promotion_rule');
    if(promotion_rule_storage.length && promotion_rule_storage.data('promotionRule')){
      this.promotionRule = new PromotionRule(promotion_rule_storage.data('promotionRule'));
    }
  };

  this.preChecking = function(input){
    if(this.promocode_value != "" && input.val().length < input.attr('maxlength')){
      input.removeClass('error');
    }
    return (input.val().length == input.attr('maxlength') && input.val() == this.promocode_value)
  };

  this.isValid = function(input){
    if(this.promocode_value != "" && input.val().length <= input.attr('maxlength')){
      input.removeClass('error, checking').parent().find('.js-code-error, .js-clear, .promocode-valid').remove();
      this.promocode_value = "";
    }
    return input.val().length == input.attr('maxlength') && (!input.parent().find('.js-code-loader').length || !input.parent().find('.js-code-error').length) && input.val() != this.promocode_value
  };

  this.hasPromotionRule = function(){
    return (typeof this.promotionRule === 'object');
  };

  this.reloadPromotionInfo = function(amount, is_percent, check_promo, show_block){
    this.setPromotionCost(amount, is_percent);
    this.setUsePromotionCheck(check_promo);
    this.reload();
    if(!show_block && $("#addP_promocodes").length){
      $("#addP_promocodes").hide();
    }
  };

  this.clearPromoError = function(name){
    var name = !!name ? $('[name='+name+'] + .js-clear') : $('.js-clear');
    name.each(function(){
      name.on('click', function(ev){
        ev.preventDefault();
        name.parent().find('input[type="text"].error').removeClass('error').val('').focus();
        name.parent().find('span.error').remove();
        name.remove();
      });
    });
  };

  this.checkPromocodeValue = function(input){
    var obj = this,
        checkboxes = $('[name=use_promocode]'),
        promoValid = '<span class="promocode-valid"></span>',
        promoError = '<span class="error error--promocode js-code-error">%error_msg%</span>',
        promoLoader = '<span class="loader loader--inline js-code-loader"><img src="/img/loaders/loader_s.gif" alt="loader"/>' + window.I18n.wait_for_commit + '</span>',
        promoBtnClear = '<a href="javascript:void(0)" class="btn-clear js-clear"></a>';
    if(this.preChecking(input)){
      return;
    } else if(this.isValid(input)){
      this.promocode_value = input.val();
      var session_id = window.session_id,
          session_id_name = "real_" + window.cur_domain + "_session_id";
      session_id = (typeof window[session_id_name] !== 'undefined') ? window[session_id_name] : session_id;
      var data = {
        "code": input.val(),
        "session_id": session_id
      };
      if(window.cur_domain == "avia"){
        data["recommendation_id"] = window.recommendation_id;
      }
      $.ajax({
        url:'/' + window.lang_prefix + 'promotion/check_promotion_code',
        type: 'post',
        data: data,
        dataType:"json",
        beforeSend: function(){
          input.after(promoLoader);
          input.removeClass('error').addClass('checking').attr('readonly', 'readonly');
        },
        success: function(response){
          input.removeAttr('readonly').removeClass('checking');
          input.parent().find('.js-code-loader').remove();
          if(response.success){
            input.removeClass('error').after(promoValid);
            obj.reloadPromotionInfo(response.details.amount, response.details.percentage, true, true);

            if(Hub) Hub.publish('promo_code_used', { data: { use: true, amount: response.details.amount }, message: 'use promocode'});
          } else {
            promoError = promoError.replace("%error_msg%", response.msg);
            input.addClass('error').after(promoError).after(promoBtnClear);
            obj.reloadPromotionInfo(0, false, false, false);
            obj.clearPromoError();
          }
          checkboxes.each(function(i, cur_cbox){
            var text_input = $(cur_cbox).closest(".js-section-additional").find(".js-promocode-input");
            if(input.attr("id") != text_input.attr("id")){
              text_input.closest('.js-section-additional').find('span.promocode-valid, span.error--promocode, .js-clear').remove();
              text_input.val(input.val());
              if(response.success){
                text_input.removeClass('error').after(promoValid);
              } else {
                text_input.addClass('error').after(promoError).after(promoBtnClear);
                obj.clearPromoError(text_input.attr("name"));
              }
            }
          });
        },
        error: function(xhr, ajaxOptions, thrownError){
          input.removeAttr('readonly').removeClass('checking');
          input.parent().find('.js-code-loader').remove();
          return;
        }
      });
    } else {
      this.reloadPromotionInfo(0, false, false, false);
    }
  };
};

promocodes = new Promocodes();

$(document).delegate('.js-promocode-input', 'keyup click input', function(ev){
  var el = $(ev.target),
      regExp = /[^a-zA-Z0-9]+/,
      caretPosition = el.caret().begin - (regExp.test(el.val()) ? 1 : 0);
  el.val(el.val().replace(regExp, ""))
  el.caret(caretPosition);
  promocodes.checkPromocodeValue($(ev.target));
});

$(document).delegate('[name=use_promocode]', 'change', function(ev){
  var checked = $(ev.target).attr('checked'),
      checkboxes = $('[name=use_promocode]'),
      checked_status = $(ev.target).is(':checked');
  $('[name=promotion_code]').val("").removeClass('error');
  $('[name=promotion_code]').closest('.js-section-additional').find('span.promocode-valid, span.error--promocode, .js-clear').remove();
  $("#addP_promocodes").hide();
  promocodes.promocode_value = "";
  var promoTextInput = $(ev.target).closest('.section-promocode').find('.js-promocode-input');
  promocodes.checkPromocodeValue(promoTextInput);
  if(! checked_status && Hub) Hub.publish('promo_code_used', { data: { use: checked_status }, message: 'fix this'});

  checkboxes.each(function(i, cur_cbox){
    $(cur_cbox).closest('.js-section-additional').toggleClass('active').siblings(".js-section-additional").toggleClass('disabled');
    if(window['front_version'] == 'v2'){
      checked ? $(cur_cbox).attr('checked', true) : $(cur_cbox).removeAttr('checked');
    } else if(window['front_version'] == 'mobile'){
      var promocodes_input_wrap = $(cur_cbox).closest(".js-use-promocodes-block").find(".ui-input-text");
      if (checked_status){
        promocodes_input_wrap.show();
        $(cur_cbox).attr('checked', 'checked').parent().find('label').toggleClass('ui-checkbox-off ui-checkbox-on');
      } else {
        promocodes_input_wrap.hide();
        $(cur_cbox).removeAttr('checked').parent().find('label').toggleClass('ui-checkbox-on ui-checkbox-off');;
      }
    } else {
      checked ? checkboxes.iCheck('check') : checkboxes.iCheck('uncheck');
    }
  });
});
