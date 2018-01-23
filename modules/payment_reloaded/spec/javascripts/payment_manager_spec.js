describe('PaymentManager', function(){
    var manager, cardGroup, directGroup, aircompanyGroup, webmoneyGroup, qiwiGroup;
    var ps_341, ps_342, ps_343, ps_204, ps_105, ps_96;
    var buyButton;

   beforeEach(function(){
       manager = new PaymentManager();
       cardGroup = new PaymentGroup({ id: 'card' });
       directGroup = new PaymentGroup({ id: 'direct' });
       aircompanyGroup = new PaymentGroup({ id: 'aircompany' });
       webmoneyGroup = new PaymentGroup({ id: 'webmoney'});
       qiwiGroup = new PaymentGroup({ id: 'qiwi'});

       ps_341 = new PaymentSystem({ id: 341, currency: 'USD', price: 321 });
       ps_342 = new PaymentSystem({ id: 342, currency: 'EUR', price: 300 });
       ps_343 = new PaymentSystem({ id: 343, currency: 'UAH', price: 9000 });
       ps_204 = new PaymentSystem({ id: 204, currency: 'USD', price: 321 });
       ps_105 = new PaymentSystem({ id: 105, currency: 'USD', price: 321 });
       ps_96  = new PaymentSystem({ id: 96, currency: 'USD', price: 321 });

       directGroup.registerComponent(ps_341);
       directGroup.registerComponent(ps_342);
       directGroup.registerComponent(ps_343);

       aircompanyGroup.registerComponent(ps_204);
       webmoneyGroup.registerComponent(ps_105);
       qiwiGroup.registerComponent(ps_96);

       cardGroup.registerComponent(directGroup);
       cardGroup.registerComponent(aircompanyGroup);

       manager.registerComponent(cardGroup);
       manager.registerComponent(webmoneyGroup);
       manager.registerComponent(qiwiGroup);
   });

   describe('API', function(){
       describe('findActiveComponentBy', function(){
           it('by PaymentSystem', function(){
               manager.setActive(directGroup);

               expect(manager.findActiveComponentBy({ type: PaymentSystem })).toEqual(ps_341);
           });

           it('by PaymentGroup', function(){
               manager.setActive(directGroup);

               expect(manager.findActiveComponentBy({ type: PaymentGroup })).toEqual(cardGroup);
           });
       });

       it('getActivePaymentSystem', function(){
           manager.setActive(ps_96);

           expect(manager.getActivePaymentSystem()).toEqual(ps_96);
       });

       it('setActivePaymentSystem', function(){
           manager.setActivePaymentSystem(ps_105);

           expect(manager.getActivePaymentSystem()).toEqual(ps_105);
       });

      describe('findComponentById', function(){
          it('one level tree', function(){
              expect(manager.findComponentById('card')).toEqual(cardGroup);
          });

          it('two level tree', function(){
              expect(manager.findComponentById('aircompany')).toEqual(aircompanyGroup);
          });

          it('three level tree', function(){
              expect(manager.findComponentById('341')).toEqual(ps_341);
          });
      });

      describe('setActiveParent', function(){
        it('direct -> card -> manager', function(){
          directGroup.setActiveParent();

          expect(cardGroup.getActiveComponent()).toEqual(directGroup);
          expect(manager.getActiveComponent()).toEqual(cardGroup);
        });
      });

      describe('setActiveChild', function(){
        it('manager sets active card, but direct and 341 are active as well', function(){
          manager.setActiveChild(cardGroup);

          expect(cardGroup.getActiveComponent()).toEqual(directGroup);
          expect(directGroup.getActiveComponent()).toEqual(ps_341);
        });

        it('manager sets active card, but 342 was active before and stays active', function(){
          directGroup.setActiveComponent(ps_342);
          manager.setActiveChild(cardGroup);

          expect(cardGroup.getActiveComponent()).toEqual(directGroup);
          expect(directGroup.getActiveComponent()).toEqual(ps_342);
        });

        it('saves all active components', function(){
         directGroup.setActive('343');
         aircompanyGroup.setActive();

         expect(cardGroup.getActiveComponent()).toEqual(aircompanyGroup);
         expect(aircompanyGroup.getActiveComponent()).toEqual(ps_204);

         directGroup.setActive();

         expect(directGroup.getActiveComponent()).toEqual(ps_343);

         webmoneyGroup.setActive();

         expect(webmoneyGroup.getActiveComponent()).toEqual(ps_105);

         cardGroup.setActive();

         expect(cardGroup.getActiveComponent()).toEqual(directGroup);
         expect(directGroup.getActiveComponent()).toEqual(ps_343);
        });
      });

      describe('setActive', function(){
        it('makes active lower component', function(){
          manager.setActive('direct');

          expect(manager.getActiveComponent()).toEqual(cardGroup);
          expect(cardGroup.getActiveComponent()).toEqual(directGroup);
          expect(directGroup.getActiveComponent()).toEqual(ps_341);
        });

        it('makes active upper component', function(){
          directGroup.setActive(cardGroup);

          expect(directGroup.getActiveComponent()).toEqual(ps_341);
          expect(cardGroup.getActiveComponent()).toEqual(directGroup);
          expect(manager.getActiveComponent()).toEqual(cardGroup);
        });

        it('makes active itself', function(){
          cardGroup.setActive();

          expect(manager.getActiveComponent()).toEqual(cardGroup);
          expect(cardGroup.getActiveComponent()).toEqual(directGroup);
          expect(directGroup.getActiveComponent()).toEqual(ps_341);
        });
      });
   });

   describe('Decorator', function(){
       var tabsWrapper, buyButton;

       beforeEach(function(){
           loadFixtures('payment_systems.html');

           $('[data-component-id]').on('click', function(ev, isReversedActivated){
             if(ev.isTrigger && isReversedActivated === 'isReversedActivated') return false;

             manager.setActive($(ev.currentTarget).data('component-id'));
           });

           $('select').on('change', function(ev, isReversedActivated){
             if(ev.isTrigger && isReversedActivated === 'isReversedActivated') return false;

               manager.setActive($(this).find(':selected').data('component-id').toString());
           });

           $('.tabs').tabs();
         buyButton = $('#buy');
       });

      it('when clicks on card tab get direct first payment system', function(){
        $('[href="#tabs-card-group"]').trigger('click');

        expect(manager.getActivePaymentSystem()).toEqual(ps_341);
      });

      it('when clicks on webmoney and then on card get active payment system', function(){
        $('[href="#tabs-direct-group"]').trigger('click');
        $('[href="#tabs-webmoney-group"]').trigger('click');

        expect(manager.getActivePaymentSystem()).toEqual(ps_105);

        $('[href="#tabs-card-group"]').trigger('click');

        expect(manager.getActivePaymentSystem()).toEqual(ps_341);
      });

      it('when selects eur currency changes payment system', function(){
            $('select').find('[data-component-id="342"]').prop('selected', 'selected').trigger('change');

            expect(manager.getActivePaymentSystem()).toEqual(ps_342);

            $('[href="#tabs-qiwi-group"]').trigger('click');

          expect(manager.getActivePaymentSystem()).toEqual(ps_96);


            $('[href="#tabs-card-group"]').trigger('click');

            expect(manager.getActivePaymentSystem()).toEqual(ps_342);
      });

      it('when sets active payment system its selects its component via decorator', function(){
          manager.setActivePaymentSystem('qiwi');

          var tabsWrapper = $('#tabs');
          var tabs = tabsWrapper.find('ul:first a');
          var activeIndex = tabsWrapper.tabs('option', 'active');

          expect($(tabs[activeIndex]).data('component-id')).toEqual('qiwi');
      });

      it('when sets active payment system 342 it selects option', function(){
        expect($('select').find('option:selected').data('component-id')).toEqual(341);
        manager.setActivePaymentSystem('342');

        expect($('select').find('option:selected').data('component-id')).toEqual(342);
      });

      describe('PriceAggregator', function(){
        it('when active payment system is selected, buy button is updated', function(){
          manager.setActivePaymentSystem('343');

          expect(manager.getPrice()).toEqual(9000);
          expect(buyButton.find('.currency').text()).toEqual('UAH');
          expect(buyButton.find('.cost').text()).toEqual('9000');
        });
      });
   });
});