Hub.subscribe('payment_decorator_initialized', function(obj){
  var decorator = Hub.dispatcher.getManager('payment').getDecorator();

  decorator.loadUsblpBonusesSelector = function (status) {
    var cards = Hub.archive.getData().data.bonuses.otp.cards;
    if (cards != undefined) {
      if (status) {
        if ($('#usbl_selector').length > 0) {
          $('#usbl_selector').remove();
        }
        cards = cards.split(',');
        var USBLP_Select = $('<select></select>', {
          id: 'usbl_selector',
          class: "chosen-select-no-search ignore-selectbox"
        });
        $('#usb_selector_block').append(USBLP_Select);
        var option = '';
        var text = '';
        for (var i = 0; i < cards.length; i++) {
          text = cards[i].substr(0, 4) + " " + cards[i].substr(4, 2) + "XX XXXX " + cards[i].substr(6, 4);
          option = $('<option></option>', {value: cards[i].substr(0, 4) + cards[i].substr(6, 4), text: text});
          USBLP_Select.append(option);
        }
        var self = this;
        USBLP_Select.on('change', function (val) {
          self.setInterfaceForUsblpUse(true);
        });
        $('#usb_cards_block_' + this.manager.getActivePaymentSystem().getId()).show();
        this.setInterfaceForUsblpUse(true);
      } else {
        $('.usb_cards_block').hide();
        $('#usbl_selector').remove();
        if (this.getPaymentSystemBlock(this.manager.getActivePaymentSystem().getId()).find('#usbl_selector_chosen').length > 0) {
          this.getPaymentSystemBlock(this.manager.getActivePaymentSystem().getId()).find('#usbl_selector_chosen').remove();
        }
        this.setInterfaceForUsblpUse(false);
      }
    }
  };


  decorator.additionalPricesSet = function (id, text, price, html) {
    this.manager.additionalPrices[id] = {text: text, price: price};
    html = html || '';
    var block = $('.additional_prices_js');
    var discount = (price < 0) ? ' discount' : '';
    var div = '';
    $('#addP_' + id).hide();
    if (price != 0) {
      if (id == 'price') text = '<strong>' + text + '</strong>';
      div = '<div class="left ui-block-a' + discount +'">' + text + '</div>' +
        '<div class="right ui-block-b' + discount + '">' +
        '<strong>' + price + ' ' + this.manager.getActivePaymentSystem().getCurrency() + '</strong>' +
        '</div>' +
        html;
      if ($('#addP_' + id).length < 1) {
        div = '<div id="addP_' + id + '" class="ui-grid-a">' + div + '</div>';
        block.append(div);
      } else {
        $('#addP_' + id).html(div).show();
      }
    }
  };


});