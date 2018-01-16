function PaymentManager(settings)
{
  this.activePaymentSystem = null;

  PriceComponent.call(this, settings);

  this.getPrice = function(filter)
  {
    if(filter) return this.price_filter.getPrice(filter);

    return this.getActivePaymentSystem().getPrice();
  };
};

PaymentManager.prototype = Object.create(PriceComponent.prototype);
PaymentManager.prototype.constructor = PaymentManager;

PaymentManager.prototype.setActivePaymentSystem = function(id)
{
    this.setActive(id);

    this.publish('payment_system_changed', { data: { component: this.defineComponent(id) }, message: 'paysytem changed' });
};


PaymentManager.prototype.getActivePaymentSystem = function()
{
  return this.findActiveComponentBy({ type: PaymentSystem });
};

PaymentManager.prototype.extensions_callbacks = {
  // 'price_filter': function(ext){
  //   console.log(ext, this);
  //   var self = this;
  //
  //   ext.registerFilter('active', function(){
  //     return self.getActivePaymentSystem().getPrice();
  //   });
  //
  //   ext.setDefaultFilter('active');
  // }
};