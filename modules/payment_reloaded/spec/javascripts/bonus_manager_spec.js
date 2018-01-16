describe('BonusProgram', function(){
  var ttn, settings, manager, hub;

  beforeEach(function(){
    Subscriber.prototype.settings.event_broker = Object.create(Hub);
    manager = new PaymentManager();
    manager.registerComponent(new PriceComponent({ id: 1, price: 0 }));
    settings =  {
      'rules': {
        'available_bonus': 900,
        'minimal_payment': 200,
        'reward': 0.01
      },
      'availability_list': {
        101: {
          can_show: true,
              can_use: true
        },
        202: {
          can_show: true,
              can_use: false
        },
        303: {
          can_show: false,
              can_use: false
        }
      }
    };
    ttn = new BonusProgram(settings);
  });

  afterEach(function(){
      Subscriber.prototype.settings.event_broker = Hub;
  });

  describe('Subscriber', function(){
    it('subscribes on payment_system_changed', function(){
      spyOn(ttn, 'reload');
      manager.setActivePaymentSystem('1');

      expect(ttn.reload).toHaveBeenCalled();
      expect(ttn.subscriber.count()).toEqual(1);
    });
  });

  describe('API', function() {
    describe('getAvailableBonus', function () {
      it('from settings', function () {
        expect(ttn.getAvailableBonus()).toEqual(900);
      });

      it('by default zero', function(){
        expect(new BonusProgram().getAvailableBonus()).toEqual(0);
      });
    });

    describe('getMinimalPayment', function () {
      it('from settings', function () {
        expect(ttn.getMinimalPayment()).toEqual(200);
      });

      it('by default zero', function(){
        expect(new BonusProgram().getMinimalPayment()).toEqual(0);
      });
    });

    describe('getReward', function () {
      it('from settings', function () {
        expect(ttn.getReward()).toEqual(0.01);
      });

      it('by default zero', function(){
        expect(new BonusProgram().getReward()).toEqual(0);
      });
    });
  });
});

describe('BonusManager', function(){
    var bonusManager, paymentManager, payment_systems, ttn;
    /**
     *| payment system | can show bonus | can use bonus | price |
     *|----------------|----------------|---------------|-------|
     *| 101            |     Y          |       Y       | 1000  |
     *| 202            |     Y          |       N       | 1500  |
     *| 303            |     N          |       N       | 2000  |
     *|----------------|----------------|---------------|-------|
     */
    beforeEach(function(){
      var data = {
        'ttn': {
          'rules': {
            'available_bonus': 900,
            'minimal_payment': 200,
            'reward': 0.01
          },
          'availability_list': {
            101: {
              can_show: true,
              can_use: true
            },
            202: {
              can_show: true,
              can_use: false
            },
            303: {
              can_show: false,
              can_use: false
            }
          }
        }
      };
      Subscriber.prototype.settings.event_broker = Hub;
      paymentManager = new PaymentManager();
      bonusManager = new BonusManager({ data: data });


      Hub.dispatcher.flush();
      Hub.dispatcher.addManager('payment', paymentManager);
      //Hub.dispatcher.addManager('bonus', bonusManager);

      payment_systems = {
        101: new PaymentSystem({ id: 101, price: 1000 }),
        202: new PaymentSystem({ id: 202, price: 1500 }),
        303: new PaymentSystem({ id: 303, price: 2000 })
      };

      paymentManager.registerComponent(payment_systems[101]);
      paymentManager.registerComponent(payment_systems[202]);
      paymentManager.registerComponent(payment_systems[303]);

      ttn = new BonusProgram({ id: 'ttn', availability: data.ttn.availability_list, rules: data.ttn.rules });
      bonusManager.registerComponent(ttn);

      expect(paymentManager.getComponents()).toEqual(payment_systems);
    });

  describe('Decorator', function(){
    beforeEach(function(){
      loadFixtures('bonus_programs.html');
    });

    describe('getBlock', function(){
      it('without param returns main block also known as wrapper', function(){
        expect(ttn.decorator.getBlock()).toBeInDOM();
        expect(ttn.decorator.getBlock().parent()).toHaveClass('bonuses');
      });

      it('with param: use', function(){
        expect(ttn.decorator.getBlock('use')).toBeInDOM();
        expect(ttn.decorator.getBlock('use').children('input')).toHaveId('use_user_bonuses');
      });
    });

    describe('updateBonusBlock', function(){
      it('bonus block updates when payment system changes', function(){
        expect(ttn.decorator.getBlock('count').text()).toEqual('99');

        ttn.decorator.updateBlock('count', 100);

        expect(ttn.decorator.getBlock('count').text()).toEqual('100');
      });
    });
  });

  describe('Scenarios', function(){
    beforeEach(function(){
      loadFixtures('bonus_programs.html');
    });

    describe('bonus program availability according active payment system', function(){
      it('when id:101 is active', function(){
          Hub.dispatcher.getManager('payment').setActivePaymentSystem('101');
          var component = paymentManager.getActivePaymentSystem();

          expect(ttn.canShow(component)).toBeTruthy();
          expect(ttn.decorator.getBlock()).toBeVisible();
          
          expect(ttn.canUse(component)).toBeTruthy();
          expect(ttn.decorator.getBlock('use')).toBeVisible();
      });

      it('when id:202 is active', function(){
          Hub.dispatcher.getManager('payment').setActivePaymentSystem('202');
        var component = paymentManager.getActivePaymentSystem();

        expect(ttn.canShow(component)).toBeTruthy();
        expect(ttn.decorator.getBlock()).toBeVisible();

        expect(ttn.canUse(component)).toBeFalsy();
        expect(ttn.decorator.getBlock('use')).toBeHidden();
      });

      it('when id:303 is active', function(){
          Hub.dispatcher.getManager('payment').setActivePaymentSystem('303');
        var component = paymentManager.getActivePaymentSystem();

        expect(ttn.canShow(component)).toBeFalsy();
        expect(ttn.decorator.getBlock()).toBeHidden();

        expect(ttn.canUse(component)).toBeFalsy();
        expect(ttn.decorator.getBlock('use')).toBeHidden();
      });
    });

    describe('When use bonus program its price changes according active payment system', function(){
      it('when id:101 is active, transits from default to activated', function() {
          Hub.dispatcher.getManager('payment').setActivePaymentSystem('101');

        expect(ttn.getPrice()).toEqual(0);

        ttn.state.transitTo('activated');

        expect(ttn.getPrice()).toEqual(-800);
      });

      it('when id:101 is active, transits from activated to default', function(){
          Hub.dispatcher.getManager('payment').setActivePaymentSystem('101');

        expect(ttn.getPrice()).toEqual(0);

        ttn.state.transitTo('activated');

        expect(ttn.getPrice()).toEqual(-800);

        ttn.state.transitTo('default');

        expect(ttn.getPrice()).toEqual(0);
      });

      it('when id:202 is active, transits from default to activated', function() {
          Hub.dispatcher.getManager('payment').setActivePaymentSystem('202');

        expect(ttn.getPrice()).toEqual(0);

        ttn.state.transitTo('activated');

        expect(ttn.getPrice()).toEqual(-900);
      });
    });
  });
});