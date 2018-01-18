function PaymentManager(settings)
{
  PriceComponent.call(this, settings);

  this.getPrice = function(filter)
  {
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