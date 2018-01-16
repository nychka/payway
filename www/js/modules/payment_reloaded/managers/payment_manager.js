function PaymentManager() {
  this.decorator = null;
  this.paymentSystems = [];
  this.paymentGroups = [];
  this.exchangeData = [];
  this.additionalPrices = {};
  this.activePaymentSystem = null;
  this.activeGroup = null;
  this.dataGroupNames = null;
  this.dataSysytems = null;
  this.hideDiscount = false;
  this.cardsPicker = null;
  this.hasFutureSupport = true;

  this.oldPrice = null;
  this.oldCurrency = null;
  this.oldServicePrices = {};

  //configs
  this.isDirectAsService = null; // is servicepackage functionality enabled
  this.defaultCurrency = null;

  this.activate = function () {
    this.setActivePaymentSystem(this.default_active);
    var envelope = {
      event: 'payment_manager_activated',
        message: 'payment manager is ready to work. Active payment system is defined as well',
        data: { id: this.getActivePaymentSystem().getId() }
    };
    Hub.publish(envelope.event, envelope);
  };

  this.init = function () {
    this.decorator = new PaymentDecorator(this);
    this.dataGroupNames = Hub.archive.getData().data.groups;
    this.dataSysytems = Hub.archive.getData().data.systems;
    this.defaultCurrency = Hub.archive.getData().configs.default_currency;
    this.hideDiscount = Hub.archive.getData().configs.payment_hide_discount;
    this.prepareExchanges();

    var self = this;
    var active = null;
    $.each( this.dataGroupNames, function( i, group ) {
      self.paymentGroups[group] = new PaymentGroup(self,group);
    });

    $.each( this.dataSysytems, function( i, sys ) {
      self.paymentSystems[sys.id] = new PaymentGroup(sys,self.paymentGroups[sys.group],self);
      self.paymentGroups[sys.group].addPaymentSystem(self.paymentSystems[sys.id],sys.active);
      if(sys.active){
        active = sys.id;
      }
    });
    this.getDecorator().init();
    this.isDirectAsService = this.initDirectAsService();
    this.default_active = active;

    Hub.subscribe('bonus_use_changed', this.reloadPrices.bind(self));
    Hub.subscribe('service_price_changed', this.reloadPrices.bind(self));

    setTimeout(this.initializeCardsPicker.bind(self), 300);
  };

  this.initializeCardsPicker = function()
  {
    if(this.hasSavedCards()){
      this.cardsPicker = new CardsPicker({
        wrapper: $('.usb_cards_block'),
        cardNumbers:  this.getSavedCards(),
        pickerSelector: '#usbl_selector',
      });

      this.cardsPicker.setup();
    }
  };

  this.getTicketsCommission = function () {
    return Hub.archive.getData().data.tickets_commission;
  };

  this.getDecorator = function () {
    return this.decorator;
  };

  this.getMarkupsManager = function () {
    return Hub.dispatcher.getManager('markup');
  };

  this.getBonusManager = function () {
    return Hub.dispatcher.getManager('bonus');
  };

  this.getDecimalPrecision = function(currency){
    if(typeof this.decimalPrecisions === 'undefined'){
      this.decimalPrecisions = Hub.archive.getData().data.decimal_precisions || false;
    }
    var prec = 2;
    if(typeof this.decimalPrecisions === 'object'){
      if(this.decimalPrecisions[currency]){
        prec = 0;
      }
    }else if(this.decimalPrecisions){
      prec = 0;
    }
    return prec;
  };

  this.formatNumber = function(number,currency){
    var decimalPrecision = this.getDecimalPrecision(currency);
    return window.ceilNumber(number, decimalPrecision, true);
  };

  this.hasPaymentSystems = function () {
    return !jQuery.isEmptyObject(this.paymentSystems);
  };

  this.isDiscountHidden = function () {
    return this.hideDiscount;
  };

  this.hasDirectAsService = function () {
    return this.isDirectAsService;
  };

  this.initDirectAsService = function () {
    if(!this.hasPaymentGroup('aircompany')) return false;
    var hasConfig = Hub.archive.getData().configs.direct_as_service,
        hasAircompany = this.getGroupByName('aircompany').hasDefaultGroup('aircompany'),
        hasDirect = this.getGroupByName('aircompany').hasDefaultGroup('direct');
    return hasConfig && hasAircompany && hasDirect;
  };

  this.setActivePaymentGroup = function (group,defaultGroup) {
    if(this.paymentGroups[group]){
      this.setActivePaymentSystem(this.paymentGroups[group].getActivePaymentSystemId(defaultGroup));
    }else{
      Hub.error('Payment group "'+group+'" doesn\'t exist');
    }
  };

  this.setActivePaymentSystem = function(id) {
    var old = null;
    if(this.paymentSystems[id]){
      var ps = this.getPaymentSystemById(id);
      // hide block and disable fields of previous group if change
      if(this.activeGroup && this.getActiveGroupName() != ps.getGroupName()){
        this.decorator.disableGroupBlock(this.getActiveGroupName());
      }
      // hide block and disable fields of previous payment system
      if(this.activePaymentSystem){
        old = this.activePaymentSystem;
        this.decorator.disablePaymentSystemBlock(this.activePaymentSystem.getId());
      }

      this.decorator.enablePaymentSystemBlock(id);
      this.decorator.setActivePaymentSystem(ps);
      this.activePaymentSystem = ps;

      if(old !== ps) {
        var envelope = {
          event: 'payment_system_changed',
          message: 'payment system changed from ' + ((old !== null) ? old.getId() : 'null') + ' to ' + id,
          data: {id: id, default_group: ps.getDefaultGroupName()}
        };
        Hub.publish(envelope.event, envelope);

        if(this.oldCurrency !== ps.getCurrency()){
          var envelope = {
            event: 'currency_changed',
            message: 'currency changed from ' + this.oldCurrency + ' ' + ' to ' + ps.getCurrency(),
            data: { currency: ps.getCurrency() }
          };
          Hub.publish(envelope.event, envelope);
        }
      }

      if (ps.getGroup()) {
        this.activeGroup = ps.getGroup();
        this.activeGroup.setActivePaymentSystem(id);
        if(!old || ps.getGroup() != old.getGroup()) {
          this.decorator.enableGroupBlock(ps.getGroupName());

          var envelope = {
            event: 'payment_group_changed',
            message: 'payment group changed from '+((old !== null) ? old.getGroupName() : 'null')+' to '+ps.getGroupName(),
            data: { name: ps.getGroupName() }
          };
          Hub.publish(envelope.event, envelope);
        }
        this.reloadPrices();
      } else {
        Hub.error('Payment system "' + id + '" doesn\'t have group attached to.');
      }
    } else {
      Hub.error('Payment system "'+id+'" doesn\'t exist');
    }
  };


  // current payment system price with markups, bonuses and additional services(main services from config)
  //
  // EXCEPT PARAMS: "bonuses", "markups", "services"
  /**
   *
   * @param except = array of services that must not be included ["services","markups"]
   * @returns {Number} // current payment system price
   */
  this.getBasePrice = function(except){
    var paymentSystem = this.getActivePaymentSystem();
    // Default price
    var cost = Hub.priceLog.set('ticket_base_price',paymentSystem.getDefaultTopay(),'-> getDefaultTopay');
    // + main additional services
    if(!except || except.indexOf("services") < 0){
      cost = Hub.priceLog.add('ticket_base_price',this.getAdditionalServicesCost(true),'-> getAdditionalServicesCost(true)');
    }
    // + markups
    if((!except || except.indexOf("markups") < 0) && paymentSystem.hasMarkups()) {
      cost = Hub.priceLog.add('ticket_base_price',this.getMarkupsManager().getCurrentMarkupPrice(paymentSystem.getId()),'-> getMarkupsManager.getCurrentMarkupPrice');
    }
    return parseFloat(cost);
  };

  this.getFullPrice = function(){
    var paymentSystem = this.getActivePaymentSystem();
    var cost = Hub.priceLog.set('ticket_full_price',this.getBasePrice(),'-> getBasePrice');
    // + other additional services
    cost = Hub.priceLog.add('ticket_full_price',this.getAdditionalServicesCost(false),'-> getAdditionalServicesCost(false)');
    // + bonuses
    if(this.getBonusManager()) {
      var rate = paymentSystem.getRate();
      cost = Hub.priceLog.add('ticket_full_price',this.getBonusManager().calculateBonus(cost / rate) * rate,'-> getBonusManager.calculateBonus');
    }

    return parseFloat(cost);
  };

  this.reloadInfoBlocks = function () {
    var paymentSystem = this.getActivePaymentSystem(),
        commission = paymentSystem.getDefaultCommission(),
        tariff = paymentSystem.getDefaultTariff(),
        tax = paymentSystem.getDefaultTax(),
        cost = this.getBasePrice(),
        bonus_cost = 0,
        markup_commission = false;

    // if(!paymentSystem.isCurrencyEquals(this.getDefaultCurrency())){
    //   cost = (cost / paymentSystem.getRate());
    // }

    if(paymentSystem.hasMarkups()){
      var markup_price = this.getMarkupsManager().getCurrentMarkupPrice(paymentSystem.getId());
      if(!this.isDiscountHidden()){
        commission += markup_price;
      }else{
        tax += markup_price;
        if(tax < 0){
          tariff += tax;
          tax = 0;
        }
      }
      markup_commission = commission;
      // $('.pay_aircompany_type').find('[data-payment_system_id="'+paymentSystem.id+'"]').find('strong').html(clear_cost + " " + currency);
    }

    // if(this.getBonusManager()) {
    //   bonus_cost = this.getBonusManager().calculateBonus(cost);
    //   cost += bonus_cost;
    // }

    paymentSystem.setData('commission',commission + bonus_cost);
    paymentSystem.setData('tariff',tariff);
    paymentSystem.setData('tax',tax);
    paymentSystem.setData('topay',cost);

    paymentSystem.setData('additional_services',paymentSystem.getDefaultAdditionalServices());
    paymentSystem.setData('insurance',paymentSystem.getDefaultInsurance());
    paymentSystem.setData('transfers',paymentSystem.getDefaultTransfers());


    if(this.getDecorator().HasAdditionalPricesBlock()){
      this.additionalPricesSet('tariff',this.getDecorator().getAdditionalPricesBlockTranslations('tariff'),tariff);
      this.additionalPricesSet('taxes',this.getDecorator().getAdditionalPricesBlockTranslations('taxes'),tax);
      if(!markup_commission){
        if(commission < 0) {
          this.additionalPricesSet('comm', $('.commission_head_js').data("text-sale"), commission);
        } else {
          this.additionalPricesSet('comm', $('.commission_head_js').data("text-commission"), commission);
        }
      }else{
        this.additionalPricesSet('comm',this.getDecorator().getAdditionalPricesBlockTranslations('comm'),-markup_commission);
      }
      if(paymentSystem.getDefaultAdditionalServices() > 0){
        this.additionalPricesSet('additional_services',this.getDecorator().getAdditionalPricesBlockTranslations('additional_services'),paymentSystem.getDefaultAdditionalServices());
      }
      if(paymentSystem.getDefaultInsurance() > 0){
        this.additionalPricesSet('insurance',this.getDecorator().getAdditionalPricesBlockTranslations('insurance'),paymentSystem.getDefaultInsurance());
      }
      if(paymentSystem.getDefaultTransfers() > 0){
        this.additionalPricesSet('transfers',$('.transfers.passenger_data').find('.total-text').text(), paymentSystem.getDefaultTransfers());
      }
    }
  };

  this.reloadPrices = function() {
    if (!this.hasPaymentSystems()) return false;

    var paymentSystem = this.getActivePaymentSystem(),
        currency = paymentSystem.getCurrency(),
        cost = this.getFullPrice(),
        clear_cost = this.getBasePrice();

    // if (this.getBonusManager()) {
    //   var rate = paymentSystem.getRate();
    //   cost = Hub.priceLog.add('ticket_full_price',this.getBonusManager().calculateBonus(cost / rate) * rate,"Use bonuses");
    // }
    //
    // if (Hub.dispatcher.getManager('service')) {
    //   // service.reloadCost();
    //   cost = Hub.priceLog.add('ticket_full_price',this.getAdditionalServicesCost() - this.getAdditionalServicesCost(true),"Add other additional services prices");
    // }
    //
    // // NEED TO REWORK -- CHANGE PRICE IN AVIA CABINET OLD VERSION
    // if (window['front_version'] !== 'v2' && window['front_version'] !== 'mobile' && window.cur_domain === 'my') {
    //   for (var i = window['currencies'].length - 1; i >= 0; i--) {
    //     if (this.exchangeData[window['currencies'][i]] !== undefined) {
    //       $('.cabinet_tickets_details .text. strong.price.' + window['currencies'][i]).html(this.formatNumber(this.exchangeRate(window['currencies'][i], currency) * cost, window['currencies'][i]) + "&nbsp;" + window['currencies'][i]);
    //     }
    //   }
    // }

    this.reloadInfoBlocks();
    this.additionalPricesSet('price', this.getDecorator().getAdditionalPricesBlockTranslations('price'), cost);
    this.getDecorator().setWillBeChargedPrice(clear_cost);
    this.getDecorator().setPriceInTab(paymentSystem.getGroupName(), clear_cost, currency);
    if (paymentSystem.getDefaultGroupName() === 'direct') this.getDecorator().setCardPaymentTypePrice(clear_cost);
    this.getDecorator().updateBookingPrice(cost, currency);

    //this.getBonusManager().reloadBonuses();  // @deprecated use events instead
    if (this.oldPrice != cost){
      var envelope = {
        event: 'price_changed',
        message: 'price changed from ' + this.oldPrice + ' ' + this.oldCurrency + ' to ' + cost + ' ' + currency,
        data: {price: cost, currency: currency, rate: paymentSystem.getRate()}
      };
      Hub.publish(envelope.event, envelope);
    }
    this.oldPrice = cost;
    this.oldCurrency = currency;
  };

  this.reloadDirectAsService = function () {
    if(this.hasDirectAsService()){
      var default_currency = this.getDefaultCurrency();
      var aircompany_cost = this.getGroupByName('aircompany').getPaymentSystemByDefaultGroupAndCurrency('aircompany',default_currency).getDefaultTopay();
      var default_direct_cost = this.getGroupByName('aircompany').getPaymentSystemByDefaultGroupAndCurrency('direct',default_currency).getDefaultTopay();
      var pay_currency = this.getActivePaymentSystem().getCurrency();
      var direct_cost_in_currency = this.getGroupByName('aircompany').getPaymentSystemByDefaultGroupAndCurrency('direct',pay_currency).getDefaultTopay();
      var price = default_direct_cost - aircompany_cost;
      if(pay_currency !== default_currency){
        var rate = default_direct_cost / direct_cost_in_currency;
        price = (price/rate);
      }

      if(this.getActivePaymentSystem().hasMarkups()){
        var markup = this.getMarkupsManager().getActiveMarkup(this.getActivePaymentSystem().getId());
        price = price + (markup.old_markup - this.getMarkupsManager().getAircompanyMarkup(pay_currency,markup.rule_id).payment_markup);

      }
      this.getDecorator().setDirectAsServicePrice(price);
    }
  };

  this.getDefaultCurrency = function(){
    return this.defaultCurrency;
  };

  this.getGroupByName = function (group) {
    if(!this.paymentGroups[group]) Hub.error('Payment group "'+group+'" doesn\'t exist');

    return this.paymentGroups[group];
  };

  this.hasPaymentGroup = function(name){
    return !!this.paymentGroups[name];
  };

  this.getActiveGroupName = function() {
    return this.activeGroup.name;
  };

  this.getActivePaymentSystem = function() {
    return this.activePaymentSystem;
  };

  this.getPaymentSystems = function () {
    return this.paymentSystems;
  };

  this.getPaymentSystemById = function (id) {
    if(!this.paymentSystems[id]) Hub.error('Payment system "'+id+'" doesn\'t exist');

    return this.paymentSystems[id];
  };

  this.prepareExchanges = function(){
    var exchanges_data = Hub.archive.getData().data.exchanges;
    if(Object.keys(exchanges_data).length > 0){
      var data = exchanges_data;
      var exchanges = [];
      $.each(data, function(i, item) {
        exchanges[i] = item;
      });
      this.exchangeData = exchanges;
    }
  };

  this.exchangeRate = function(to, from){
    if(from === undefined){
      return 1/this.exchangeData[to];
    }else{
      if(this.exchangeData[to] == 1){
        return this.exchangeData[from];
      }else{
        return this.exchangeData[from]/this.exchangeData[to];
      }
    }
  };

  this.additionalPricesSet = function(id,text,price,html){
    this.decorator.additionalPricesSet(id,text,price,html);
  };

  // return price of additional services
  // if "commonServicesOnly" == "TRUE" will return only common services price, if "FALSE" or undefined - the other's
  this.getAdditionalServicesCost = function(commonServicesOnly){
   return Hub.dispatcher.getManager('service') ? Hub.dispatcher.getManager('service').getCost(commonServicesOnly) : 0;
  };

  this.hasSavedCards = function(){
    var data = Hub.archive.getData().data;

    return data.bonuses && data.bonuses.otp && data.bonuses.otp.cards && data.bonuses.otp.cards.length;
  };

  this.getSavedCards = function()
  {
    return Hub.archive.getData().data.bonuses.otp.cards.split(",");
  };

  this.getCardsPicker = function()
  {
    return this.cardsPicker;
  };
}

Hub.subscribe('archive_initialized', function(){
    Hub.logger.count('new PaymentManager()');
    Hub.dispatcher.addManager('payment', new PaymentManager());
});