function PaymentManager(settings)
{
  PriceComponent.call(this, settings);

  this.getPrice = function(filter)
  {
      var active = this.getActivePaymentSystem();

    return active ? active.getPrice() : 0;
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

PaymentManager.prototype.getCurrency = function()
{
    var active = this.getActivePaymentSystem();

    return active ? active.getCurrency() : 'LOL';
};

function PaymentManagerPresenter(root)
{
    Presenter.call(this, root);

    this.trigger = function(){
        Presenter.prototype.render.call(this);
        $('#buy .cost').text(root.getPrice());
        $('#buy .currency').text(root.getCurrency());

        root.map(function(component){
            component.presenter.trigger();
        });
    };
}

PaymentManagerPresenter.prototype = Object.create(Presenter.prototype);
PaymentManagerPresenter.prototype.constructor = PaymentManagerPresenter;