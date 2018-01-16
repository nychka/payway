function PaymentDecorator(manager) {
  this.manager = manager;
  this.group_block = [];
  this.system_block = [];
  this.group_tab_price = [];

  this.init = function () {
    var self = this;
    // Init group blocks
    $.each(this.manager.dataSysytems, function (i, system) {
      if ($('[data-payment-system-block=' + system.id + ']'))
        self.system_block[system.id] = $('[data-payment-system-block=' + system.id + ']');
    });
    // Init group blocks
    $.each(this.manager.dataGroupNames, function (i, group) {
      self.group_block[group] = $('[data-group-block=' + group + ']');
    });
    // Init group tabs prices
    $.each(this.manager.dataGroupNames, function (i, group) {
      self.group_tab_price[group] = $('[data-group-tab-price=' + group + ']');
    });
  };
  /**
   * Розшифровка цін або інфоблоки
   *
   * @returns {jQuery|HTMLElement}
   */
  this.getPriceDetailsBlock = function () {
    var block = $('.price_details_block_js');
    if (block && block.length !== 1) throw Error('price details block is missed! Check selector .price_details_block_js');

    return block;
  };

  this.getPaymentSystemBlock = function (id) {
    if (!this.system_block[id]) Hub.track('Decoration payment system "' + id + '" doesn\'t exist');

    return this.system_block[id];
  };

  this.disablePaymentSystemBlock = function (id) {
    if (!this.system_block[id]) return;

    var block = this.system_block[id];
    block.hide();
    block.find('input').attr('disabled', 'disabled');
  };

  this.enablePaymentSystemBlock = function (id) {
    if (!this.system_block[id]) return;

    var block = this.system_block[id];
    block.show();
    block.find('input').attr('disabled', false);
  };

  this.getGroupBlock = function (group) {
    if (!this.group_block[group]) Hub.track('Decoration payment group "' + group + '" doesn\'t exist');

    return this.group_block[group];
  };

  this.disableGroupBlock = function (group) {
    var block = this.getGroupBlock(group);
    block.hide();
    block.find('input').attr('disabled', 'disabled'); // [name!="pay_aircompany"] -- check selector usability
  };

  this.enableGroupBlock = function (group) {
    var block = this.getGroupBlock(group);
    block.show();
    var fields = $('[data-payment-group-fields="'+group+'"]');
    if(fields.length) $(fields).find('input').attr('disabled', false);
    // block.find('input').attr('disabled', false); // [name!="pay_aircompany"] -- check selector usability
  };

  this.setPriceInTab = function (group, price, currency) {
    if (!this.group_tab_price[group]) return;
    this.group_tab_price[group].text(this.manager.formatNumber(price, currency) + " " + currency);
  };

  this.setDetailsData = function (type, value, currency) {
    var row = $('.price_details_block_js');

    if (window['front_version'] == 'mobile') {
      row.find('[data-payment-data="' + type + '"]').html(this.manager.formatNumber(value, currency) + ' ' + currency);
    }
    else if (window['front_version'] == 'v2') {
      if (type == 'commission') {
        if (value < 0) {
          $('.commission_head_js:visible').html($('.commission_head_js:visible').data("text-sale"));
          $('[data-payment-data="commission"]:visible').removeClass('plus').addClass('discount');
          value = Math.abs(value);
        } else {
          $('.commission_head_js:visible').html($('.commission_head_js:visible').data("text-commission"));
          $('[data-payment-data="commission"]:visible').removeClass('discount').addClass('plus');
        }
      }

      if (type == 'topay') {
        row.find('[data-payment-data="' + type + '"]').html(this.manager.formatNumber(value, currency) + ' ' + currency);
      } else {
        row.find('[data-payment-data="' + type + '"]').html(this.manager.formatNumber(value, currency));
      }
    }
    else {
      row.find('[data-payment-data="' + type + '"]').find('strong').html(this.manager.formatNumber(value, currency) + ' ' + currency);
    }

  };

  this.getAdditionalPricesBlockTranslations = function (key) {
    return $('#up_ad_text_js').data(key);
  };

  this.HasAdditionalPricesBlock = function () {
    return $('#up_ad_text_js').length > 0;
  };

  /**
   * NOTICE: ie8 doesn't support textContent
   * <div><span>hello</span>UPDATEME</div>
   */
  this.updateTextNode = function (node, value) {
    var value = value || '';
    if (typeof(node) != 'undefined') {
      var prop = (typeof(node.textContent) == 'undefined') ? 'nodeValue' : 'textContent';
      node[prop] = ' ' + value;
    }
  };

  this.additionalPricesSet = function (id, text, price, html) {
    this.manager.additionalPrices[id] = {text: text, price: price};
    html = html || '';
    var block = $('.additional_prices_js');
    var discount = (price < 0) ? ' discount' : '';
    var div = '';
    $('#addP_' + id).hide();
    if (price != 0) {
      if (id == 'price') text = '<strong>' + text + '</strong>';
      div = '<div class="col-6 col-xl-8 col-l-10' + discount + ' col-m-12">' + text + '</div>' +
          '<div class="col-4 col-xl-4 col-l-2' + discount + ' col-m-12">' +
          '<strong>' + price + ' ' + this.manager.getActivePaymentSystem().getCurrency() + '</strong>' +
          '</div>' +
          html;
      if ($('#addP_' + id).length < 1) {
        div = '<div id="addP_' + id + '" class="row">' + div + '</div>';
        block.append(div);
      } else {
        $('#addP_' + id).html(div).show();
      }
    }
  };

  this.setCardPaymentTypePrice = function (price) {
    var price_block = $('[data-card-payment-type="direct"]');
    if (price_block.length > 0) {
      var currency = this.manager.getActivePaymentSystem().getCurrency();
      price_block.text(this.manager.formatNumber(price, currency) + ' ' + currency);
    }
  };

  this.setWillBeChargedPrice = function (willBeChargedAmount) {
    var active_ps = this.manager.getActivePaymentSystem();
    var element = this.getPaymentSystemBlock(active_ps.getId()).find('.will_be_charged:visible');
    var cc_price = element.find('.cc_price');
    if (cc_price.length > 1) {
      cc_price = cc_price.first();
      willBeChargedAmount -= this.manager.getTicketsCommission();
    }
    var target = cc_price.contents();
    var currencyNode = target.last()[0];
    target.first().text(willBeChargedAmount);
    this.updateTextNode(currencyNode, active_ps.getCurrency());
  };

  this.updateBookingPrice = function (price, currency) {
    if (window['front_version'] == 'mobile') {
      var booking_price_button = $('.your-price');
      booking_price_button.find('strong').html(this.manager.formatNumber(price, currency) + ' ' + currency);
    } else {
      var booking_price_button = $('.booking_price_button');  //TODO: memorize
      booking_price_button.find('strong').html("<em>" + this.manager.formatNumber(price, currency) + "</em>" + ' ' + currency);
    }
    // this.total_cost = [price, currency]
    // this.manager.controller.getHub().publish('total_cost_changed', this.total_cost);
  };

  this.setDirectAsServicePrice = function (price) {
    var currency = this.manager.getActivePaymentSystem().getCurrency();
    $('.direct_as_service strong').text('+' + this.manager.formatNumber(price, currency) + ' ' + currency);
    $('#direct_as_service').data('last_currency', currency);
  };

  this.setActivePaymentSystem = function (ps) { // data for payment form

    $('[name=paysystem]').val(ps.getCurrentId());
    $('[name=pay_group]').first().val(ps.getCurrentGroupName());

  };

  this.getServicePackageBlock = function () {
    return $('[data-service-package="block"]');
  };

  this.getPaymentGroupsSwitcher = function () {
    return $('[data-payment-switcher="payment_group"]');
  };

  this.getAircompanySystemSwitcher = function () {
    return $('[data-aircompany-switcher="block"]');
  };

  /**
   USBLP card selector loading
   */
  this.loadUsblpBonusesSelector = function (status) {
      var cards = Hub.archive.getData().data.bonuses.otp.cards;
      if (cards != undefined) {
        if (status) {
          if ($('#usbl_selector').length > 0) {
            $('#usbl_selector').selectbox("detach").remove();
            $('#usbl_selector_chosen').remove();
          }
          cards = cards.split(',');
          var USBLP_Select = $('<select></select>', {
            id: 'usbl_selector',
            class: "chosen-select-no-search ignore-selectbox"
          });
          $('#usb_selector_block_' + this.manager.getActivePaymentSystem().getId()).append(USBLP_Select);
          var option = '';
          var text = '';
          for (var i = 0; i < cards.length; i++) {
            text = cards[i].substr(0, 4) + " " + cards[i].substr(4, 2) + "XX XXXX " + cards[i].substr(6, 4);
            option = $('<option></option>', {value: cards[i].substr(0, 4) + cards[i].substr(6, 4), text: text});
            USBLP_Select.append(option);
          }
          $('#usbl_selector').chosen({
            disable_search_threshold: true
          });
          var self = this;
          USBLP_Select.on('change', function (val) {
            self.setInterfaceForUsblpUse(true);
          });
          $('#usb_cards_block_' + this.manager.getActivePaymentSystem().getId()).show();
          this.setInterfaceForUsblpUse(true);
        } else {
          $('.usb_cards_block').hide();
          $('#usbl_selector').selectbox("detach").remove();
          $('#usbl_selector_chosen').remove();
          if (this.getPaymentSystemBlock(this.manager.getActivePaymentSystem().getId()).find('#usbl_selector_chosen').length > 0) {
            this.getPaymentSystemBlock(this.manager.getActivePaymentSystem().getId()).find('#usbl_selector_chosen').remove();
          }
          this.setInterfaceForUsblpUse(false);
        }
      }
  };
  /**
   USBLP on/off
   - hiding/showing payment tabs and aircompany switchers
   - fiilling/clearing card data
   **/
  this.setInterfaceForUsblpUse = function (status) {
    console.warn('deprecated setInterfaceForUsblpUse');
    var card_el = this.getPaymentSystemBlock(this.manager.getActivePaymentSystem().getId());
    card_el.find('#card_number_2').val('').trigger('blur.usbl');
    card_el.find('#card_date_month').val('').trigger('blur.usbl');
    card_el.find('#card_date_year').val('').trigger('blur.usbl');
    card_el.find('#card_holder').val('').trigger('blur.usbl');
    card_el.find('#card_cvv').val('').trigger('blur.usbl');
    if (status) {
      this.getPaymentGroupsSwitcher().hide();
      this.getServicePackageBlock().hide();
      this.getAircompanySystemSwitcher().hide();

        // $('.payment_options').hide(); // TODO: check selectors for mobile

      card_el.find('#card_number_0').val($('#usbl_selector').val().substr(0, 4)).prop('readonly', true).focus();
      card_el.find('#card_number_3').val($('#usbl_selector').val().substr(4, 4)).prop('readonly', true).focus();
      card_el.find('#card_number_1').val('').trigger('blur.usbl');
    } else {
      this.getPaymentGroupsSwitcher().show();
      this.getServicePackageBlock().show();
      this.getAircompanySystemSwitcher().show();

        // $('.payment_options').show(); // TODO: check selectors for mobile

      card_el.find('#card_number_1').val('').trigger('blur.usbl');
      card_el.find('#card_number_3').val('').prop('readonly', false).trigger('blur.usbl');
      card_el.find('#card_number_0').val('').prop('readonly', false).trigger('blur.usbl');
    }
  };

}