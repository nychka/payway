// PaymentSystem.prototype = Object.create(PriceComponent.prototype);
// PaymentSystem.prototype.constructor = PaymentSystem;

CardsPicker.prototype = Object.create(Component.prototype);
CardsPicker.prototype.constructor = CardsPicker;

function CardsPickerDefaultState()
{
    this.id = 'default';

    this.canHandle = function(component)
    {
        var hasCards = component.cards && component.cards.length;
        var hasOtpCards = hasCards && component.cards.filter(function(card){ return card.group === 'default'; }).length;

        return hasOtpCards;
    }

    this.handle = function(component)
    {
        var paymentCard, number, card;

        paymentCard = Hub.dispatcher.getController('payment').getPaymentCard();
        component.setup({ filter: 'default' });
        number = component.getFirstOption().data('number');
        card = component.findCardById(number);
        paymentCard.states['cards_picker_default'] = new CardsPickerDefault(paymentCard);
        paymentCard.states['cards_picker_default'].setOption('card', card, UserCard);
        paymentCard.transitToState('default');
        paymentCard.transitToState('cards_picker_default');
    };
};

function CardsPickerOtpState()
{
    this.id = 'otp';

    this.canHandle = function(component)
    {
        var hasCards = component.cards && component.cards.length;
        var hasOtpCards = hasCards && component.cards.filter(function(card){ return card.group === 'otp'; }).length;

        return hasOtpCards;
    }

    this.handle = function(component)
    {
        var paymentCard, number, card;

        paymentCard = Hub.dispatcher.getController('payment').getPaymentCard();
        paymentCard.states['cards_picker_otp'] = new CardsPickerOtp(paymentCard);
        component.setup({ filter: 'otp' });
        number = component.getFirstOption().data('number');
        card = component.findCardById(number);
        paymentCard.states['cards_picker_otp'].setOption('card', card, UserCard);
        paymentCard.transitToState('default');
        paymentCard.transitToState('cards_picker_otp');
    }
};

function CardsPickerDisabledState()
{
    this.id = 'disabled';

    this.handle = function(component){
        var paymentCard = Hub.dispatcher.getController('payment').getPaymentCard();

        paymentCard.reset();
        component.disable();
    }
};

CardsPickerDisabledState.prototype = Object.create(State.prototype);
CardsPickerDisabledState.prototype.constructor = CardsPickerDisabledState;

CardsPickerDefaultState.prototype = Object.create(State.prototype);
CardsPickerDefaultState.prototype.constructor = CardsPickerDefaultState;

CardsPickerOtpState.prototype = Object.create(State.prototype);
CardsPickerOtpState.prototype.constructor = CardsPickerOtpState;

CardsPicker.prototype.states = {
    'disabled': CardsPickerDisabledState,
    'default': CardsPickerDefaultState,
    'otp': CardsPickerOtpState
};

CardsPicker.prototype.filters = {
    'number': function(cards, number){
        return cards.filter(function(card){
            return card.number === number;
        });
    },
    'group': function(cards, group){
        return cards.filter(function(card){
            return card.group === group;
        });
    },
};

StateMachine.prototype.errors = {
    'state_not_found': function(data){
        function NoStateFoundError(state){
            this.name = 'NoStateFoundError';
            this.message = 'No state found by id: ' + state;
        };
        NoStateFoundError.prototype = Object.create(Error.prototype);
        NoStateFoundError.prototype.constructor = NoStateFoundError;

        return new NoStateFoundError(data);
    },
    'method_not_overloaded': function(method)
    {
        function MethodNotOverloadedError(method){
            this.name = 'MethodNotOverloadedError';
            this.message = 'Method ' + method + ' must be overloaded!';
        };
        MethodNotOverloadedError.prototype = Object.create(Error.prototype);
        MethodNotOverloadedError.prototype.constructor = MethodNotOverloadedError;

        return new MethodNotOverloadedError(method);
    }
};

Component.prototype.extensions = {
    'history': History,
    'subscriber': Subscriber,
    'state'  : StateMachine,
    'aggregator': Aggregator,
    'presenter': Presenter
};

PriceComponent.prototype.extensions['price_filter'] = PriceAggregator;

BonusProgram.prototype.extensions.decorator = BonusDecorator;

Subscriber.prototype.settings = {
  'event_broker': Hub
};

History.prototype.tags = {
    'initialized': function(root, data){
        var record = { message: 'Component with id: '+ root.getId() +' has been initialized ' };

        if(data && Object.keys(data).length){
            record.message += 'with settings';
        }else{
            record.message += 'without settings';
        }

        return record;
    },

    'property_changed': function(root, data){
        var record = { message: 'Component has changed property '};

        record.message += '[' + data.prop + '] ';
        record.message += 'from ' + data.previous + ' to ' + data.current;

        return record;
    },

    'prepared': function(root, data)
    {
        var record = { message: 'Component has been prepared', data: data };

        return record;
    },

    'state_changed': function(root, data)
    {
        var record = { message: 'Component transits ' };
        record.message += (data.previous && data.previous !== data.current) ? 'from ' + data.previous + ' ' : '';
        record.message += 'to state ' + data.current;

        return record;
    }
};

PriceAggregator.prototype.filters = {
    'total': function(root){
        var price = 0;

        root.getComponents(function(component){
            price += component.getPrice();
        });

        return price;
    },
    'sum': function(root, component_ids){
        var sum = 0;

        for(var i in component_ids){
            var component = root.findComponentById(component_ids[i]);

            if(component){
                sum += component.getPrice();
            }
        }

        return sum;
    }
};

function BonusProgramDefaultState()
{
    this.id = 'default';

    this.handle = function(component){
        component.setPrice(0);
    };
}

function BonusProgramActivatedState()
{
    this.id = 'activated';

    this.canHandle = function(component)
    {
        return  Hub.dispatcher.getManager('payment') && Hub.dispatcher.getManager('payment').getActivePaymentSystem();
    };

    this.handle = function(component)
    {
        // the lowest price at which user can buy a ticket
        var minimalPayment = component.getMinimalPayment();
        // amount of user's bonuses he can use to lower ticket's price
        var availableBonus = component.getAvailableBonus();
        // current ticket's price to buy
        var price = Hub.dispatcher.getManager('payment').getActivePaymentSystem().getPrice();
        // minimal acceptable price after user uses his bonuses; ALWAYS higher than minimalPayment
        var acceptablePrice = (price - availableBonus) < minimalPayment ? minimalPayment : price - availableBonus;
        // final component's price
        var currentPrice = acceptablePrice - price;

        component.setPrice(currentPrice);
    }
}

BonusProgramDefaultState.prototype = Object.create(State.prototype);
BonusProgramDefaultState.prototype.constructor = BonusProgramDefaultState;

BonusProgramActivatedState.prototype = Object.create(State.prototype);
BonusProgramActivatedState.prototype.constructor = BonusProgramActivatedState;

BonusProgram.prototype.states = {
    'default': BonusProgramDefaultState,
    'activated': BonusProgramActivatedState
};

function DefaultState()
{
  this.name = 'default';

  this.handle = function(context)
  {
    var card = context.self;
    card.removeValidationRule();
    context.card_number_4.prop('disabled', true).val('').hide();
    context.card_holder.prop('required', true);
    context.card_cvv.val('');
    context.wrapper.find(card.settings['card_holder_wrapper']).show();
    context.wrapper.find(card.settings['card_cvv_wrapper']).show();
    context.wrapper.find(card.settings['if_you_have_cvv']).hide();
    context.wrapper.find(card.settings['card_holder_not_required']).hide();

    this.restore_cvv_description(context);
    context.card_number_3.prop('maxlength', 4).attr('maxlength', 4);
    context.card_number_3.prop('data-length', 4).attr('data-length', 4);
    context.card_number_3.prop('placeholder', 'XXXX').attr('placeholder', 'XXXX');

    context.card_cvv
        .prop('maxlength', 3)
        .attr('maxlength', 3)
        .prop('placeholder', 'XXX');

    context.card_input_wrapper.removeClass('jcb union');

    context.card_number_0.prop('readonly', false);
    context.card_number_1.prop('readonly', false);
    context.card_number_2.prop('readonly', false);
    context.card_number_3.prop('readonly', false);
  };

  this.restore_cvv_description = function(context)
  {
    var card = context.self,
        cvv_wrapper = context.wrapper.find(card.settings['card_cvv_wrapper']),
        cvv_description_element  = cvv_wrapper.find('[data-cvv=description]'),
        cvv_title_element = cvv_wrapper.find('[data-cvv=title]'),
        cvv_description = cvv_description_element.first().text(),
        cvv_title = cvv_title_element.first().text();

    if(!card.hasDefaultValue('cvv'))
      card.setDefaultValue('cvv', { description: cvv_description, title: cvv_title });

    if(card.hasDefaultValue('cvv') && card.getDefaultValue('cvv').description !== cvv_description){
      var cvv = card.getDefaultValue('cvv');

      cvv_wrapper.each(function(i, wrapper){
        $(wrapper).find('[data-cvv=description]').text(cvv.description);
        $(wrapper).find('[data-cvv=title]').text(cvv.title);
      });
    }
  };
};
function MomentumActivatedState()
{
  this.name = 'momentum_activated';
  this.rule = 'valid_card_number_maestro_momentum';
  this.handle = function(context)
  {
    var card = context.self;
    context.wrapper.find(card.settings['card_holder_wrapper']).show();
    context.card_holder.prop('required', false);
    context.card_number_4.prop('disabled', false).show();
    context.wrapper.find(card.settings['card_holder_not_required']).removeAttr('hidden').show();
    context.wrapper.find(card.settings['card_cvv_wrapper']).show();
    context.card_cvv.val('');
    context.wrapper.find(card.settings['if_you_have_cvv']).hide();

    card.prepareValidationRule(this.rule);
    card.addValidationRule(this.rule);
  };
};
function MomentumFilledState()
{
  this.name = 'momentum_filled';
  this.handle = function(context)
  {
    var card = context.self;
    context.card_holder.val('');
    context.card_cvv.val('123');
    context.wrapper.find(card.settings['card_holder_wrapper']).hide();
    context.wrapper.find(card.settings['card_cvv_wrapper']).hide();
    context.wrapper
        .find(card.settings['if_you_have_cvv'])
        .off('click').on('click', function(e){
      e.preventDefault();
      card.transitToState('momentum_activated');
      context.card_cvv.focus();
    })
        .show();
  };
};
function AmexActivatedState()
{
  this.name = 'amex_activated';
  this.rule = 'valid_card_number_amex';
  this.handle = function(context)
  {
    var lastCardInputSize = 3,
        cvvInputSize      = 4;

    context.card_number_3
        .prop('maxlength', lastCardInputSize)
        .data('length', lastCardInputSize).attr('data-length', lastCardInputSize).prop('data-length', lastCardInputSize);

    context.card_number_3.prop('placeholder', 'XXX');

    context.card_cvv
        .prop('maxlength', cvvInputSize)
        .prop('placeholder', 'XXXX');

    this.set_cvv_description(context);

    context.self.prepareValidationRule(this.rule);
    context.self.addValidationRule(this.rule);
  };
  this.set_cvv_description = function(context)
  {
    var card = context.self,
        element = context.wrapper.find(card.settings['card_cvv_wrapper']).find('span:first'),
        cvv_description = Hub.archive && Hub.archive.getData().translations && Hub.archive.getData().translations.cvv_description;

    if(typeof cvv_description === 'string' && cvv_description.length){
      element.each(function(i, item){
        $(item).text(cvv_description);
      });
    }else{
      console.warn('cvv_description for Amex is not defined! Look first into storage.translations, then into client_storage.php for more details');
      console.info(storage);
    }
  };
};

function JcbActivatedState()
{
  this.name = 'jcb_activated';
  this.cvv_title = 'CAV2';
  this.cvv_description = null;

  this.handle = function(context)
  {
    context.card_input_wrapper.addClass('jcb');
    this.set_cvv_description(context);
  };

  this.set_cvv_description = function(context)
  {
    var self = this,
        card_wrapper = context.wrapper.find(context.self.settings['card_cvv_wrapper']);

    if(self.cvv_description === null){
      var defaultDescription = context.self.getDefaultValue('cvv').description;
      var divideLineIndex = defaultDescription.indexOf('-');
      var replacementText = defaultDescription.substr(0, divideLineIndex - 1);
      self.cvv_description = defaultDescription.replace(replacementText, self.cvv_title);
    }

    card_wrapper.each(function(i, wrapper){
      $(wrapper).find('[data-cvv=description]').text(self.cvv_description);
      $(wrapper).find('[data-cvv=title]').text(self.cvv_title);
    });
  };
};

function UnionPayActivatedState()
{
  this.name = 'union_pay_activated';
  this.cvv_title = 'CVN2';
  this.cvv_description = null;

  this.handle = function(context)
  {
    this.set_cvv_description(context);
    context.card_input_wrapper.addClass('union');
  };

  this.set_cvv_description = function(context)
  {
    var self = this,
        card_wrapper = context.wrapper.find(context.self.settings['card_cvv_wrapper']);

    if(self.cvv_description === null){
      var defaultDescription = context.self.getDefaultValue('cvv').description;
      var divideLineIndex = defaultDescription.indexOf('-');
      var replacementText = defaultDescription.substr(0, divideLineIndex - 1);
      self.cvv_description = defaultDescription.replace(replacementText, self.cvv_title);
    }

    card_wrapper.each(function(i, wrapper){
      $(wrapper).find('[data-cvv=description]').text(self.cvv_description);
      $(wrapper).find('[data-cvv=title]').text(self.cvv_title);
    });
  };
};

function CardsPickerDefault(component)
{
  this.name = 'cards_picker_default';
  this.options = {};
  this.context = component.getContext();

  this.handle = function(context)
  {
    var context = component.getContext();
    var card = this.options['card'];
    context.card_number_0.val(card.get('first_token')).prop('disabled', true);
    context.card_number_1.prop('disabled', true);
    context.card_number_2.prop('disabled', true);
    context.card_number_3.val(card.get('last_token')).prop('disabled', true);
    context.card_date_month.prop('disabled', true);
    context.card_date_year.prop('disabled', true);
  };

  this.setOption = function(option, data, type)
  {
    if(! (data instanceof type)) throw new TypeError(type + ' must be given! ' + typeof data + ' given instead');

    this.options[option] = data;
    this.trigger();
  };

  this.trigger = function()
  {
    this.handle(this.context);
  };
};

function CardsPickerOtp(component)
{
  this.name = 'cards_picker_otp';
  this.context = component.getContext();
  this.options = {};

  this.handle = function(context)
  {
    var card = this.options['card'];
    context.card_number_0.val(card.get('first_token')).prop('readonly', true).focus();
    context.card_number_3.val(card.get('last_token')).prop('readonly', true).focus();
  };

  this.setOption = function(option, data, type)
  {
    if(! (data instanceof type)) throw new TypeError(type + ' must be given! ' + typeof data + ' given instead');

    this.options[option] = data;
    this.trigger();
  };

  this.trigger = function()
  {
    this.handle(this.context);
  };
};
