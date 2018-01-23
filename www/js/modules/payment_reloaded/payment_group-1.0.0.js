function PaymentGroup(settings)
{
    PriceComponent.call(this, settings);

    this.getPrice = function(filter)
    {
        var component = this.findActiveComponentBy({ type: PaymentSystem });
        return component ? component.getPrice() : 0;
    };
}

PaymentGroup.prototype = Object.create(PriceComponent.prototype);
PaymentGroup.prototype.constructor = PaymentGroup;

PaymentGroup.prototype.getCurrency = function()
{
    var component = this.findActiveComponentBy({ type: PaymentSystem });

  return component ? component.getCurrency() : 'LOL';
};

function PaymentGroupPresenter(root)
{
    Presenter.call(this, root);

    this.render = function(){
        Presenter.prototype.render.call(this);

        var el = this.findElementByComponent();

        el.find('.cost').text(root.getPrice());
        el.find('.currency').text(root.getCurrency());
    };
}

PaymentGroupPresenter.prototype = Object.create(Presenter.prototype);
PaymentGroupPresenter.prototype.constructor = PaymentGroupPresenter;