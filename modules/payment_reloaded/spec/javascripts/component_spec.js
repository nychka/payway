describe('Component', function(){
    var component;


    describe('Constructor', function(){
        it('defines option: id by constructor', function(){
           component = new Component({ id: 'foo'});

           expect(component.getId()).toEqual('foo');
        });

        it('when component does not have property', function(){
           component = new Component({ foo: 'bar' });

           expect(component.hasOwnProperty('foo')).toBeFalsy();
        });

        it('when property has name as existing method', function(){
           component = new Component({ getId: 'hello'});

           expect(component.getId).not.toEqual('hello');
        });
    });

    describe('Extensions', function(){
       describe('History', function(){
          it('save', function(){
              var history = new History();
              var record = { message: 'hello_world'};

              history.save('hello_world', record);

              expect(history.find('hello_world')).toEqual([record]);
          });

          it('find', function(){
              var history = new History();

              history.save('foo', { message: 'foo'});
              history.save('bar', { message: 'bar'});

              expect(Object.keys(history.find()).length).toEqual(2);
              expect(history.find()).toEqual({
                  foo: [{ message: 'foo'}],
                  bar: [{ message: 'bar'}]
              });
          });
       });

       describe('Aggregator', function(){
         var component;

         beforeEach(function(){
           component = new Component({id: 'root' });
           component.extend('aggregator', Aggregator);
         });

         it('registerComponent', function(){
           var foo = new Component({ id: 'foo'});
           component.registerComponent(foo);

           expect(component.getComponents()).toEqual({'foo': foo});
         });
       });
    });

    describe('Subscriber', function(){
        var component, hub;

        beforeEach(function(){
          component = new Component();
          component.extend('subscriber', Subscriber);
          Hub.publish('subscriber_tested', { message: 'price changed to 0', data: { price: 0 }});
        });

        it('count', function(){
          var fn = function () { this.foo = 'bar'; };
          component.subscriber.subscribe('subscriber_tested', fn);

          expect(component.subscriber.count()).toEqual(1);
        });

        describe('publish', function(){
          it('publications', function(){
            var publication = { data: { foo: 'bar'} };
            component.subscriber.publish('foo_bar_fired', publication);

            expect(component.subscriber.publications).toEqual({ 'foo_bar_fired': publication });
          });
        });

        describe('subscribe', function(){
            it('full', function() {
              var fn = function () {
                this.foo = 'bar';
              };
              component.subscriber.subscribe('subscriber_tested', fn);

              expect(component.foo).toEqual('bar');
            });

            it('short', function(){
              var fn = function () {
                this.foo = 'bar';
              };
              component.subscribe('subscriber_tested', fn);

              expect(component.foo).toEqual('bar');
            });
        });

        it('setBroker', function(){
          var hub = new Hub.constructor;
          var fn = function(){ this.bar = 'foo'; };
          component.subscriber.setBroker(hub);
          component.subscriber.subscribe('custom_event_fired', fn);

          hub.publish('custom_event_fired', { message: 'price changed to 0', data: { price: 0 }});

          expect(component.bar).toEqual('foo');
        });
    });

    describe('History', function(){
        it('initialized', function(){
           component = new Component();
           component.setId('foo');
           var record = { message: 'Component with id: 0 has been initialized without settings' };
           var history = [record];

           expect(component.history.find('initialized')).toEqual(history);
        });

        it('property_changed', function(){
            component = new Component();
            component.setId('foo');
            var record = { message: "Component has changed property [id] from 0 to foo" };

            expect(component.history.find('property_changed')).toEqual([record]);
        });
    });

    describe('API', function(){
        beforeEach(function(){
            component = new Component();
        });

        it('getId', function(){
            expect(component.getId()).toEqual(0);
        });

        it('setId', function(){
           component.setId('bar');

           expect(component.getId()).toEqual('bar');
        });

        it('extend', function(){
            var extension = function(){ this.foo = function(){ return 'bar'; }};
            component.extend('fooExt', extension);

            expect(component.fooExt.foo()).toEqual('bar');
        });
    });
});

describe('PriceComponent', function(){
    var component;

    beforeEach(function(){
        component = new PriceComponent({ id: 'foo', price: 101 });
    });

    describe('Settings', function(){
        it('sets id and price', function(){
            component = new PriceComponent({ id: 'foo', price: -101 });

            expect(component.getId()).toEqual('foo');
            expect(component.getPrice()).toEqual(-101);
        });
    });

    describe('History', function(){
        describe('initialized', function(){
            it('with settings', function(){
                component = new PriceComponent({ price: 22 });
                var record = { message: 'Component with id: 0 has been initialized with settings' };
                var history = [record];

                expect(component.history.find('initialized')).toEqual(history);
            });

            it('without settings', function(){
                component = new PriceComponent();
                var record = { message: 'Component with id: 0 has been initialized without settings' };
                var history = [record];

                expect(component.history.find('initialized')).toEqual(history);
            });
        });

        it('property_changed', function(){
            component = new PriceComponent();
            component.setPrice(102);
            var record = { message: "Component has changed property [price] from 0 to 102" };

            expect(component.history.find('property_changed')).toEqual([record]);
        });
    });

    describe('Hierarchy', function(){
        it('inherits Component', function(){
           expect(component instanceof Component).toBeTruthy();
        });
    });

    describe('API', function(){
        it('getPrice', function(){
            expect(component.getPrice()).toEqual(101);
        });

        it('setPrice', function(){
            component.setPrice(12);

            expect(component.getPrice()).toEqual(12);
        });
    });
});