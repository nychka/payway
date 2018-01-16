function PromoCode()
{
  var container, count, currentState, previousState;

  this.init = function()
  {
    container = $('[data-bonus-program-block="promo"]');
    currentState = 'default';
    this.bindEvents();
    this.resetTooltip();
    this.reset = this.defaultState;
  };

  this.getContainer = function()
  {
    return container;
  };

  this.getUsePromoInput = function()
  {
    return container.find('input[type=checkbox]');
  };

  this.getPromoInput = function()
  {
    return container.find('input[type=text]');
  };

  this.getPromoInputContainer = function()
  {
    return this.getPromoInput().parent();
  };

  this.isActive = function()
  {
    return container.hasClass('checked');
  };

  this.useCodeHandler =  function(ev)
  {
    var code = $(ev.target).val();

    if(this.hasEnoughCount()) {
      this.waitingState();
      this.useCode(code);
    }else{
      this.activatedState();
    }

    count = code.length;
  }.bind(this);

  this.bindEvents = function()
  {
    var self = this;

    this.getUsePromoInput()
        .off('click').on('click', function(ev) {
      $(ev.target).prop('checked') ? self.activatedState() : self.defaultState();
      console.debug('usePromoInput was clicked ~> container ' + (container.hasClass('checked') ? 'add' : 'remove') + ' class \'checked\'');
    });

    this.getPromoInput().off('keyup').on('keyup', this.useCodeHandler);
  };

  this.defaultState = function(){
    if(currentState === 'valid'){
      Hub.publish('promo_code_used', { data: { use: false }, message: 'Uncheck promocodes'});
    }
    console.log('transit from ' + currentState + 'to default');
    currentState = 'default';

    this.getPromoInput().prop('readonly', false);
    this.getContainer().removeClass('checked');
    this.getUsePromoInput().prop('checked', false);
    this.getPromoInput().val('').removeClass('valid').removeClass('unvalid');
    this.getTooltip().content('');
    this.getTooltip().close();
    count = 0;

    //mobile
    this.getPromoInput().addClass('hidden');
    if(typeof this.getUsePromoInput().checkboxradio === 'function'){
      this.getUsePromoInput().checkboxradio('refresh');
    }
  };

  this.getTooltip = function()
  {
    var hasTooltipster = $.hasOwnProperty('tooltipster');
    var fn = function(){ console.warn('fake tooltip action fired'); };
    var fakeTooltipster = { close: fn, content: fn, open: fn };

    return hasTooltipster ? this.getPromoInputContainer().tooltipster('instance') : fakeTooltipster;
  };

  this.activatedState = function(){
    if(currentState === 'activated' || currentState === 'waiting' || currentState === 'valid') return false;
    console.log('transit from ' + currentState + 'to activated');
    currentState = 'activated';

    this.getContainer().addClass('checked');
    this.getPromoInput().val('');
    this.getPromoInput().removeClass('unvalid');
    this.getPromoInput().removeClass('valid');
    this.getPromoInput().prop('readonly', false);

    //mobile
    this.getPromoInput().removeClass('hidden');

    if(typeof this.getUsePromoInput().checkboxradio === 'function'){
      this.getUsePromoInput().checkboxradio('refresh');
    }

  };

  this.resetTooltip = function()
  {
    var instance;

    if(! jQuery.hasOwnProperty('tooltipster')) return false;

    if(this.getPromoInputContainer().hasClass('tooltipstered')){
      instance = this.getPromoInputContainer().tooltipster('instance');
      instance.close(function(){
        instance.destroy();
      });
    }

    this.getPromoInputContainer().tooltipster({
      trigger: 'custom',
      triggerClose: {
        click: true,
        scroll: true,
        mouseleave: true
      },
      content: 'You ad may be here',
      delay: 0
    });
  };

  this.hasEnoughCount = function()
  {
    var maxlength = this.getPromoInput().prop('maxlength');
    var length = this.getPromoInput().val().length;

    return (count !== maxlength && length === maxlength);
  };

  this.getCount = function()
  {
    return count;
  };

  this.useCode = function(code)
  {
    var self = this;
    console.info('code is used: ', code);

    $.ajax({
      url: '/promotion/check_promotion_code',
      method: 'post',
      dataType: 'json',
      data: {
        code: code,
        session_id: window.session_id,
        recommendation_id: window.recommendation_id
      },
      success: function(response){
        response.success ? self.validState(response) : self.invalidState(response);
      },
      error: function(response){
        self.invalidState(response);
      }
    });
  };
  this.waitingState = function()
  {
    console.log('transit from '+ currentState + ' to waiting');
    currentState = 'waiting';
    this.getTooltip().content('');
    this.getPromoInput().removeClass('unvalid').removeClass('valid');
    this.getPromoInput().prop('readonly', true);
  };

  this.validState = function(response)
  {
    console.log('transit from '+ currentState + ' to valid');
    currentState = 'valid';
    this.getPromoInput().removeClass('unvalid').addClass('valid');
    this.getTooltip().close();
    Hub.publish('promo_code_used', { data: { use: true, amount: response.details.amount }, message: 'use promocode'});
  };

  this.invalidState = function(response)
  {
    console.log('transit from '+ currentState + ' to invalid');
    currentState = 'invalid';
    var tooltip = this.getTooltip();
    tooltip.content(response.msg);
    tooltip.open();
    this.getPromoInput().removeClass('valid').addClass('unvalid');
    this.getPromoInput().prop('readonly', false);
  };
};

(function(){
  Hub.subscribe('payment_controller_initialized', function(){
    var promoCode = new PromoCode();
    promoCode.init();
  });
})();