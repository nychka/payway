function PaymentGroup(settings)
{
    PriceComponent.call(this, settings);
}

PaymentGroup.prototype = Object.create(PriceComponent.prototype);
PaymentGroup.prototype.constructor = PaymentGroup;