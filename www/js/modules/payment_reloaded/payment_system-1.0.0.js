function PaymentSystem(settings)
{
    this.currency = null;
    PriceComponent.call(this, settings);
}

PaymentSystem.prototype = Object.create(PriceComponent.prototype);
PaymentSystem.prototype.constructor = PaymentSystem;

PaymentSystem.prototype.getCurrency = function()
{
    return this.currency;
};

PaymentSystem.prototype.setCurrency = function(currency)
{
  return this.currency = currency;
};