function BonusManager() {
  this.bonusesCheckedFlag = {};
  this.bonusRule = {};
  this.availabilityList = {};
  this.activePaymentSystemId = 0;
  this.hasFutureSupport = true;


  this.init = function () {
    this.decorator = new BonusDecorator(this);

    this.prepareBonusProgram('ttn');
    this.prepareBonusProgram('otp');

    Hub.subscribe('promotion_deprecated_loaded', function(){
        this.preparePromotionRule();
    }.bind(this));


    Hub.subscribe('payment_system_changed',function(obj){
      console.warn('under construction');
      // this.setActivePaymentSystemId(obj.data.id);
      // this.checkAllBlocksVisibility(obj.data.id);
    }, this);

    Hub.subscribe('price_changed', function(obj){
      console.warn('price_changed event dismissed');
      //this.reloadBonuses(obj.data.price,obj.data.currency,obj.data.rate);
    }, this);

    Hub.subscribe('promo_code_used', function(obj){
      this.usePromotionCost = obj.data && obj.data.use ? obj.data.amount : 0;
      this.setBonusProgramCheck('promo', obj.data.use);
    }, this);

    this.reload();
  };

  this.getDecorator = function () {
    return this.decorator;
  };

  this.getPaymentManager = function () {
    return Hub.dispatcher.getManager('payment');
  };
  this.prepareBonusProgram = function (program) {
    this.prepareBonusRule(program);
    this.prepareBonusAvailability(program);
  };
  this.prepareBonusRule = function(program){
    var bonuses_storage = Hub.archive.getData().data.bonuses;
    if(bonuses_storage){
      this.bonusRule[program] = new BonusRule(bonuses_storage[program].rules);
    }
  };
  this.prepareBonusAvailability = function (program) {
    var bonuses_storage = Hub.archive.getData().data.bonuses;
    if(bonuses_storage){
      this.availabilityList[program] = bonuses_storage[program].availability_list;
    }
  };
    /**
     * FIXME: refactor PromotionRule
     */
  this.preparePromotionRule = function(){
    var promotion_rule_storage = $('#promotion_rule');
    if(promotion_rule_storage.length && promotion_rule_storage.data('promotionRule')){
      this.promotionRule = new PromotionRule(promotion_rule_storage.data('promotionRule'));
    }
  };
  this.getActivePaymentSystemId = function () {
    return this.activePaymentSystemId;
  };
  this.setActivePaymentSystemId = function (id) {
    this.activePaymentSystemId = id;
  };
  /**
   * @deprecated already fixed
   */
  this.refreshBonusRule = function(user){
    this.prepareBonusAvailability('ttn');
    this.prepareBonusAvailability('otp');
    this.checkAllBlocksVisibility(this.getPaymentManager().getActivePaymentSystem().getId());
  };

  this.canPaymentSystemUseBonus = function(program,id){
    return (this.availabilityList[program] && this.availabilityList[program][id] && this.availabilityList[program][id].can_use);
  };

  this.canPaymentSystemShowBonus = function(program,id){
    return (this.availabilityList[program] && this.availabilityList[program][id] && this.availabilityList[program][id].can_charge);
  };

  this.hasBonusRule = function(program){
    if(typeof program === 'undefined') return Object.keys(this.bonusRule).length > 0;
    return (typeof this.bonusRule[program] === 'object');
  };
  this.getBonusRule = function(program){
    return this.bonusRule[program];
  };
  this.hasPromotionRule = function(){
    return (typeof this.promotionRule === 'object');
  };
  this.getPromotionRule = function(){
    return this.promotionRule;
  };

  this.setBonusProgramCheck = function(program,flag){
    this.bonusesCheckedFlag[program] = flag;

    var envelope = {
      event: 'bonus_use_changed',
      message: program + ' bonus program flag changed to ' + flag,
      data: { program: program, checked: flag }
    };
    Hub.publish(envelope.event, envelope);
  };
  this.isBonusProgramChecked = function (program) {
    return !!this.bonusesCheckedFlag[program];
  };

  this.setPromotionCost = function(amount, is_percent) {
    this.usePromotionCost = parseFloat( amount );
    this.realPromotionCost = 0;
    this.usePromotionPercentDiscount = is_percent;
    // this.updateWillBeCharged();
    // this.reloadBonuses();
  };

  this.reloadBonuses = function(amount,currency,rate) {
    var cost = 0;
    if (this.hasBonusRule('ttn')){
      cost = this.getBonusProgramAmount(amount,'ttn');
      this.getDecorator().updateBonusBlock('ttn', window.ceilNumber(cost/rate, 2), window.ceilNumber(cost,2), currency);
    }
    if (this.hasBonusRule('otp')) {
      cost = this.getBonusProgramAmount(amount,'otp');
      this.getDecorator().updateBonusBlock('otp', window.ceilNumber(cost/rate, 2), window.ceilNumber(cost,2), currency);
    }
  };

  this.toggleBonusBlock =function(ps_id,program){
    var show_bonus_block = this.getDecorator().getBonusMainBlock(program);
    if(show_bonus_block && this.canPaymentSystemShowBonus(program, ps_id)) {
      show_bonus_block.show();
      var use_bonuses_block = this.getDecorator().getBonusUseBlock(program);
      if (use_bonuses_block) {
        this.canPaymentSystemUseBonus(program, ps_id) ? use_bonuses_block.show() : use_bonuses_block.hide();
      }
    } else if(show_bonus_block) {
      show_bonus_block.hide();
    }
  };

  this.toggleAvailabilityForBonus = function(program)
  {
    this.toggleBonusBlock(0, program);
  };

  this.checkAllBlocksVisibility = function(ps_id){
    this.toggleBonusBlock(ps_id,'ttn');
    this.toggleBonusBlock(ps_id,'otp');
  };
  this.getBonusProgramAmount = function(amount, program){
    var bonusReward = this.getBonusRule(program).getReward();
    amount = amount * bonusReward; // TODO: add case when if bonusReward 0

    return amount;
  };

  this.calculateFinalCostWithUsedBonuses = function(cost)
  {
    var rate = 1;
    var willBeCharged = cost / rate;
    var availableBonus = this.getBonusRule('ttn').getAvailableBonus();
    var minimalPayment = this.getBonusRule('ttn').getMinimalPayment();
    if (typeof(minimalPayment) !== 'number' && minimalPayment.indexOf('%') >= 0) {
        minimalPayment = (willBeCharged*parseFloat(minimalPayment))/100;
    }
    var diff = (willBeCharged - availableBonus);
    willBeCharged = (diff > minimalPayment) ? diff : minimalPayment;

    return willBeCharged;
  };

  //FIXME: refactor
  /**
   *
   * @param cost (always in depot currency)
   * @returns {Number} cost with calculated bonus commission
   */
  this.calculateBonus = function(cost){
    var willBeCharged = cost;
    
    if( this.hasBonusRule('otp') && this.canPaymentSystemUseBonus('otp',this.getActivePaymentSystemId()) && this.isBonusProgramChecked('otp') ){
      // var usblp_bonuses_available = parseFloat( $('#can_use_usblp_bonuses').attr('data-usblp_bonuses_available') );
      // var usblp_min_usable_bonuses = parseFloat( $('#can_use_usblp_bonuses').attr('data-usblp_min_usable') );
      //
      // var minimalPayment = this.getBonusRule('otp').getMinimalPayment();
      //
      // var payable_percent = 0.99;
      // if(window.cur_domain == 'hotels'){
      //   payable_percent = 0.3;
      // }
      //
      // if( typeof minimalPayment === 'string' && minimalPayment.indexOf('%') != -1 ){
      //   minimalPayment = cost - cost*payable_percent
      // }
      //
      // var services_with_min_payment_10_uah = ['events','insurance','hotels'];
      //
      // if( minimalPayment < 10 && services_with_min_payment_10_uah.indexOf(window.cur_domain) >=0 ){
      //   minimalPayment = 10;
      // }else if(minimalPayment < 1){
      //   minimalPayment = 1;
      // }
      //
      // if( usblp_bonuses_available >= usblp_min_usable_bonuses ){
      //   var max_bonus_payment = cost*payable_percent;   // max allowed bonus payment payable_percent %, round down
      //   var max_allowed_bonus = cost - max_bonus_payment >= minimalPayment ? max_bonus_payment : cost - minimalPayment;
      //   willBeCharged = (usblp_bonuses_available < max_allowed_bonus) ? (cost - usblp_bonuses_available) : cost - max_allowed_bonus;
      // }

      var availableBonus = this.getBonusRule('otp').getAvailableBonus();
      var minimalPayment = this.getBonusRule('otp').getMinimalPayment();
      if (typeof(minimalPayment) !== 'number' && minimalPayment.indexOf('%') >= 0) {
        minimalPayment = (willBeCharged*parseFloat(minimalPayment))/100;
      }
      var diff = (willBeCharged - availableBonus);
      willBeCharged = (diff > minimalPayment) ? diff : minimalPayment;

    }else if(this.hasBonusRule('ttn') && this.canPaymentSystemUseBonus('ttn',this.getActivePaymentSystemId()) && this.isBonusProgramChecked('ttn')){
      var availableBonus = this.getBonusRule('ttn').getAvailableBonus();
      var minimalPayment = this.getBonusRule('ttn').getMinimalPayment();
      if (typeof(minimalPayment) !== 'number' && minimalPayment.indexOf('%') >= 0) {
        minimalPayment = (willBeCharged*parseFloat(minimalPayment))/100;
      }
      var diff = (willBeCharged - availableBonus);
      willBeCharged = (diff > minimalPayment) ? diff : minimalPayment;
    }else if(this.isBonusProgramChecked('promo')){
      // var minimalPayment = this.getPromotionRule().getMinimalPayment();
      // if (typeof(minimalPayment) !== 'number' && minimalPayment.indexOf('%') >= 0) {
      //   minimalPayment = (willBeCharged*parseFloat(minimalPayment))/100;
      // }
      // var discount = this.usePromotionCost;
      // var startPrice = willBeCharged;
      // if (this.usePromotionPercentDiscount) {
      //   discount = (willBeCharged*parseFloat(discount))/100;
      // }
      // diff = (willBeCharged - discount);
      // willBeCharged = (diff > minimalPayment) ? diff : minimalPayment;
      // this.realPromotionCost = startPrice - willBeCharged;
        Hub.log('todo: calculate promo');
         willBeCharged = (willBeCharged - this.usePromotionCost);
    }
    /**
     * TODO: NEED REWORK PROMO
     */
    // if(this.isBonusProgramChecked('promo')){
    //   this.getPaymentManager().additionalPricesSet('promocodes',$('#up_ad_text_js').data('promocodes'), -this.realPromotionCost.toFixed(2));
    // }
    if(this.isBonusProgramChecked('ttn') || this.isBonusProgramChecked('otp')){
      this.getPaymentManager().additionalPricesSet('bonuses',$('#up_ad_text_js').data('bonuses'), ( willBeCharged - cost ).toFixed(2) );
    }else{
      this.getPaymentManager().additionalPricesSet('bonuses',$('#up_ad_text_js').data('bonuses'),0);
    }
    return parseFloat((willBeCharged - cost).toFixed(2));
  };

  this.reload = function(){
    this.prepareBonusAvailability('ttn');
    this.toggleAvailabilityForBonus('ttn');
    Hub.logger.info('BonusManager::reload triggered');
  };

  this.init();
}

Hub.subscribe('archive_initialized', function(){
  Hub.logger.count('new BonusManager()');
  Hub.dispatcher.addManager('bonus', new BonusManager());
});

Hub.subscribe('login_succeeded', function(obj){
  if(obj.data && obj.data.bonuses && Hub.archive.getData().data.bonuses){
    if(obj.data.bonuses.template.ttn) Hub.dispatcher.getManager('bonus').getDecorator().replaceBonusBlock('ttn', obj.data.bonuses.template.ttn);
    if(obj.data.bonuses.template.otp) Hub.dispatcher.getManager('bonus').getDecorator().replaceBonusBlock('otp', obj.data.bonuses.template.otp);

    Hub.archive.updateData('bonuses', obj.data.bonuses.availability);
    Hub.dispatcher.getManager('bonus').reload();
    Hub.trigger('price_changed');
  }
});