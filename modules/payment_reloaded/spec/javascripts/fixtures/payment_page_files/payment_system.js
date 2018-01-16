function PaymentSystem(data,group,manager){
  PriceComponent.call(this);

  this.manager = manager;
  this.group = group;
  this.markupsAvilability = false;

  this.init = function(data){
    this.data = data;
    this.id = parseInt(data.id,10);
    this.currency = data.currency_short;
    this.real_pay_currency = data.real_pay_currency;
    this.groupName = data.group;
    this.defaultGroupName = data.default_group;
    this.cost = parseFloat(data.cost);
    this.rate_against_default_currency = 1;//FIXME: this.manager.exchangeRate(this.currency);
    this.margin = this.initMargin();
  };

  this.initMargin = function () {
    var margin = 1;
    var margins = Hub.archive.getData().data.margins;
    if(margins && margins.hasOwnProperty(this.id)) {
      var m = margins[this.id] * 0.01 + 1;
      if(!isNaN(m)){
        margin = m;
      }
    }
    return margin;
  };
  // this.getId = function(){
  //   return this.id;
  // };
  this.getCurrency = function(){
    return this.currency;
  };
  this.getGroup = function(){
    return this.group;
  };
  this.getGroupName = function(){
    return this.groupName;
  };
  this.getDefaultGroupName = function(){
    return this.defaultGroupName;
  };
  // this.getPrice = function(){
  //   return this.cost;
  // };
  this.getRate = function(){
    //TODO: check if need margins or exchanges
    return this.margin;//this.rate_against_default_currency;
  };
  this.getRealPayCurrency = function(){
    return this.real_pay_currency;
  };

  this.isCurrencyEqualsRealPayCurrency = function(){
    return this.real_pay_currency === this.currency;
  };
  this.isCurrencyEquals = function(currency){
    return this.currency === currency;
  };
  this.getCostByDefaultCurrency = function(currency, originalCost){
    var rate = this.getRate();
    var cost = originalCost ? this.getOriginalCost() : this.getPrice();

    return this.isCurrencyEquals(currency) ? cost : (cost * rate);
  };
  this.getOriginalCost = function(){
    return this.data.original_cost ? parseFloat(this.data.original_cost) : this.getPrice();
  };

  this.getDefaultTariff = function(){
    return this.data.default_tariff;
  };
  this.getDefaultTax = function(){
    return this.data.default_tax;
  };
  this.getDefaultCommission = function(){
    return this.data.default_commission * (this.getDefaultHasSale() ? -1 : 1);
  };
  this.getDefaultTopay = function(){
    return parseFloat(this.data.default_topay);
  };
  this.getDefaultHasSale = function(){
    return this.data.default_has_sale;
  };
  this.getDefaultAdditionalServices = function(){
    return this.data.default_additional_services;
  };
  this.getDefaultInsurance = function(){
    return this.data.default_insurance;
  };
  this.getDefaultTransfers = function(){
    return this.data.default_transfers;
  };

  this.setMarkupsAvilability = function (available) {
    this.markupsAvilability = available;
  };
  this.hasMarkups = function () {
    return this.markupsAvilability;
  };

  this.getCurrentId = function () {
    if(this.hasMarkups() && this.manager.getMarkupsManager().getActiveMarkup(this.getId()).is_fake){
      return this.manager.getMarkupsManager().getDefaultMarkupId();
    } else {
      return this.getId();
    }
  };

  this.getCurrentGroupName = function () {
    if(this.hasMarkups() && this.manager.getMarkupsManager().getActiveMarkup(this.getId()).is_fake){
      return this.manager.getMarkupsManager().getDefaultMarkupGroup();
    } else {
      return this.getDefaultGroupName();
    }
  };

  this.setData = function(type,value){
    this.manager.decorator.setDetailsData(type,value,this.getCurrency());
  };

  //==================

  this.init(data);
};



