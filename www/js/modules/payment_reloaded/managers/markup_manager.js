function MarkupsManager() {
  // this.data = Hub.dispatcher.getManager('payment').getClientStorage().data.markups.items;
  this.decorator = null;
  this.markups = [];
  this.activeMarkups = [];
  this.aircompany_markups = {}; // List of active markups per payment system
  // this.aircompany_prices = Hub.dispatcher.getManager('payment').getClientStorage().data.aircompany_prices; // List of markups prices for aircompany currencies
  this.hasFutureSupport = true;

  this.initCardTypes = function (id,types) {
    var self = this;
    var arr = [];
    $.each(types, function (i, m) {
      arr[m.rule_id] = m;
      if(m.hasOwnProperty('display')) self.activeMarkups[id] = m;
    });
    return arr;
  };

  this.init = function () {
    var self = this;
    var systems = Hub.dispatcher.getManager('payment').getPaymentSystems();
    this.decorator = new MarkupsDecorator();

    systems.forEach(function(system) {
      if (system.data.markups && system.data.markups.length > 0) {
        self.markups[system.getId()] = self.initCardTypes(system.getId(),system.data.markups);
        system.setMarkupsAvilability(true);
      }
    });

    // init markups list for aircompany per currency
    $.each(Hub.archive.getData().data.aircompany_markups,function(currency,markup){
      self.aircompany_markups[currency] = {};
      $.each(markup,function (i,m) {
        self.aircompany_markups[currency][m.rule_id] = m;
      });
    });

  };

  this.activate = function () {
    if(Hub.dispatcher.getManager('payment').getActivePaymentSystem().hasMarkups())
      this.setActiveMarkup(Hub.dispatcher.getManager('payment').getActivePaymentSystem().getId(),this.getActiveMarkup(Hub.dispatcher.getManager('payment').getActivePaymentSystem().getId()).rule_id);
  };

  this.getAircompanyMarkup = function (currency,rule_id) {
    if(this.aircompany_markups[currency][rule_id]){
      return this.aircompany_markups[currency][rule_id];
    }else{
      console.error('Aircompany markup for "' + currency + '" and with rule ID = "' + rule_id + '" doesn\'t exist.');
      return false;
    }
  };

  this.getCurrentMarkupPrice = function (ps_id) {
    if(!this.getActiveMarkup(ps_id)) return 0;
    return this.getActiveMarkup(ps_id).old_markup;
  };

  this.getActiveMarkup = function (ps_id) {
    if(!this.activeMarkups[ps_id]) return false;
    return this.activeMarkups[ps_id];
  };

  this.setActiveMarkup = function (ps_id,markup_id) {
    if(this.activeMarkups[ps_id] !== this.markups[ps_id][markup_id]) {
      var envelope = {
        event: 'markup_changed',
        message: 'markup changed from ' +
        this.getActiveMarkup(ps_id).name + '(id: ' + this.getActiveMarkup(ps_id).rule_id + ', markup_price: ' + this.getActiveMarkup(ps_id).old_markup + ') to ' +
        this.markups[ps_id][markup_id].name + '(id: ' + this.markups[ps_id][markup_id].rule_id + ', markup_price: ' + this.markups[ps_id][markup_id].old_markup + ')',
        data: {markup_price: this.markups[ps_id][markup_id].old_markup, rule_id: this.markups[ps_id][markup_id].rule_id}
      };
      Hub.publish(envelope.event, envelope);
      this.activeMarkups[ps_id] = this.markups[ps_id][markup_id];
    }
    this.decorator.setActiveMarkup(this.markups[ps_id][markup_id]);

    Hub.dispatcher.getManager('payment').getDecorator().setActivePaymentSystem(Hub.dispatcher.getManager('payment').getPaymentSystemById(ps_id)); // reset markup data for payment system form fields
    Hub.dispatcher.getManager('payment').reloadPrices();
  };

  this.getDefaultMarkupId = function () {
    return 10100;
  };
  this.getDefaultMarkupGroup = function () {
    return "visa_debit";
  };

  this.init();
}

Hub.subscribe('payment_manager_activated', function(){
  Hub.logger.count('new MarkupsManager()');
  Hub.dispatcher.addManager('markup', new MarkupsManager());
});

function MarkupsDecorator() {

  this.setActiveMarkup = function(markup){

    $('[name=markup_rule_id]').val(markup.rule_id);
    $('[name=markup_card_name]').val(markup.name);

  };
};