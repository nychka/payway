function Component(settings)
{
    this.id = 0;
    this.extensions = {};

    var init = function(settings)
    {
        this.prepareExtensions();

        for(var option in settings){
            if(this.hasOwnProperty(option) && typeof this[option] !== 'function'){
                this[option] = settings[option];
            }
        }

        this.log('initialized', settings);
    };

    this.prepareExtensions = function()
    {
        var extensions = this.constructor.settings && this.constructor.settings.extensions;

        if(! (extensions && Object.keys(extensions).length > 0)) return false;

        for(var extension in extensions) this.extend(extension, extensions[extension]);
    };

    this.getId = function(){
        return this.id;
    };

    this.setId = function(id)
    {
        this.log('property_changed', { prop: 'id', previous: this.id, current: id });
        this.id = id;
    };

    this.log = function(event, record){
        if(this.history) this.history.save(event, record);
    };

    this.extend = function(id, fn)
    {
        if(this.extensions.hasOwnProperty(id)) return false;
        if(typeof fn !== 'function') throw new Error('Extension must be Function!');

        var extension = new fn(this);
        this.extensions[id] = extension;

        this[id] = extension;
    };

    init.call(this, settings);
};

function StateMachine(component)
{
    var self = this;
    var states = {};
    var current = 'default';
    var previous;

    var init = function(){
      _prepareStates();
    };

    this.getCurrent = function()
    {
      return states[current];
    };

    this.transitTo = function(state)
    {
        if(this.canTransitTo(state)){
            this.get(state).handle.call(this, component);
            previous = current;
            current = state;
            component.log('state_changed', { current: current, previous: previous });
        }else{
            component.log('state_not_changed', { current: state });
        }
    };

    this.canTransitTo = function(state)
    {
        return states.hasOwnProperty(state) && this.get(state).canHandle(component);
    };

    this.get = function(state)
    {
        if(! states.hasOwnProperty(state)) throw StateMachine.settings.errors.state_not_found(state);

        return states[state];
    };

    this.register = function(id, state)
    {
        if(typeof state !== 'function') throw new TypeError('Must be function! ' + typeof state + ' given instead');
        var instance = new state();
        if(! (instance instanceof State)) throw new TypeError('Must be instance of State! ' + typeof instance + ' given instead');

        states[id] = instance;

        component.log('state_registered', { state: id });
    };

    var _prepareStates = function()
    {
        var states = component.constructor.settings && component.constructor.settings.states;

        if(! (states && Object.keys(states).length)) return false;

        for(var state in states) this.register(state, states[state]);
    }.bind(self);

    init.call(this);
};

function State()
{
    this.id = 0;
};

State.prototype.getId = function(){ return this.id; };

State.prototype.setId = function(id){ this.id = id; };

State.prototype.canHandle = function(){ return true; };

State.prototype.handle = function(){ throw StateMachine.settings.errors.method_not_overloaded('handle'); };

function History(root)
{
    var history = {};

    this.find = function(tag)
    {
      return (tag && history.hasOwnProperty(tag)) ? history[tag] : history;
    };

    this.save = function(tag, data)
    {
        var record = History.settings.tags.hasOwnProperty(tag) ? History.settings.tags[tag].call(this, root, data) : { message: tag };

        this.add(tag, record);
    };

    this.add = function(tag, record)
    {
        if(! history.hasOwnProperty(tag)) history[tag] = [];
        history[tag].push(record);
    };
};

function Subscriber(component)
{
    var self = this;
    this.subscriptions = {};
    this.publications = {};
    this.broker = this.constructor.settings.event_broker;

    var _init = function()
    {
       _prepareSubscriptions();
       _extendComponent();
    };

    this.setBroker = function(broker)
    {
      this.broker = broker;
    };

    this.getBroker = function()
    {
      return this.broker;
    };

    this.subscribe = function(event, fn)
    {
        if(this.subscriptions.hasOwnProperty(event)) {
          throw new Error('Component ' + this.getId() + ' has already subscribed on event: ' + event);
          return false;
        }

        this.subscriptions[event] = fn;
        this.broker.subscribe(event, fn.bind(component));
        this.count();
    };

    this.publish = function(event, envelope)
    {
      if(this.subscriptions.hasOwnProperty(event)) {
        // throw new Error('Component ' + component.getId() + ' has already subscribed on event: ' + event + ' and can NOT publish it!');
        // return false;
      }

      this.publications[event] = envelope;
      this.broker.publish(event, envelope);
    };

    this.count = function()
    {
      this.length = Object.keys(this.subscriptions).length;

      return this.length;
    };

    var _prepareSubscriptions = function()
    {
        var subscriptions = component.constructor.settings.subscriptions;

        if(subscriptions && Object.keys(subscriptions).length){
            for(var event in subscriptions){
                this.subscribe(event, subscriptions[event].bind(component));
            }
        }
    }.bind(self);

    var _extendComponent = function()
    {
        component.subscribe = this.subscribe.bind(self);
        component.publish = this.publish.bind(self);
        component.log('New methods subscribe and publish were added by extension Subscriber');
    }.bind(self);

    _init.call(self);
};

function PriceComponent(settings)
{
  this.price = 0;

  this.getPrice = function(filterId, filterParams)
  {
      if(this.hasComponents() && this.price_filter){
          return this.price_filter.getPrice(filterId, filterParams);
      }
    return this.price;
  };

  this.setPrice = function(price)
  {
    this.log('property_changed', { prop: 'price', previous: this.price, current: price });
    this.price = price;
  };

  Component.call(this, settings);
};

function Presenter(root)
{
  this.root = root;

  this.trigger = function()
  {
      console.log('Component with id: ' + root.getId() + ' was triggered');
      this.render();
    var el = this.findElementByComponent();

    if(el.length == 0) return false;

    var node = this.defineNode(el);

    switch(node){
      case 'OPTION':
        el.prop('selected', 'selected').trigger('change', 'isReversedActivated');
        break;
      default:
        el.trigger('click', 'isReversedActivated');
    }
  };

  this.defineNode = function(element)
  {
    return element[0].nodeName;
  };

  this.findElementByComponent = function()
  {
    return $('[data-component-id="'+ this.root.getId() +'"]');
  }
};

Presenter.prototype.render = function()
{
    console.log('Call render on component id: '+ this.root.getId());
};

function Aggregator(root)
{
    this.root = root;
  this.activeComponent = null;
  var self = this;
  var components = {};
  this.parent = null;

  var init = function()
  {
    this.extendComponent();
  };

  this.extendComponent = function()
  {
    Object.keys(self).map(function(name){
        if(typeof self[name] === 'function'){
            if(root.hasOwnProperty(name)){
                root.log('method_overloaded', { data: { method: name }, message: 'Method '+ name + ' will be overloaded'});
            }
            root[name] = self[name].bind(self);
        }
    });
  }.bind(self);

  this.hasComponents = function()
  {
     return Object.keys(components).length;
  };

  this.getComponents = function(fn)
  {
    if(typeof fn === 'function'){ for(var i in components){ fn.call(this, components[i]); } }

    return components;
  };

  this.registerComponent = function(component)
  {
    if(! (component instanceof Component)) throw new Error('Must be instance of Component!');

    var id = component.getId();

    components[id] = component;
    component.setParent(root);
  };

  this.findComponentById = function(id)
  {
    var component, name;

    if(component = components[id]) return component;

    for(name in components) {
      if (component = (typeof components[name].findComponentById === 'function') && components[name].findComponentById(id)){
        return component;
      }
    }
    return false;
  };

  this.findActiveComponentBy = function(options)
  {
      var component;

      if(component = this.getActiveComponent()){
          if(component instanceof options.type){
              return component;
          }else{
              return component.findActiveComponentBy(options);
          }
      }

     return false;
  };

  this.setParent = function(component)
  {
    this.parent = component;
  };

  this.getParent = function(){
    return this.parent;
  };

  this.setActiveParent = function() {
    this.getParent().setActiveComponent(root);

    if(this.getParent().getParent()) this.getParent().setActiveParent();
  };

  this.hasActiveComponent = function()
  {
    return this.activeComponent && this.activeComponent instanceof Component;
  };

  this.setActiveChild = function()
  {
    var children = this.getComponents();
    var firstChild = children && Object.keys(children).length && Object.values(children)[0];

    if(firstChild && !this.hasActiveComponent()){
      this.setActiveComponent(firstChild);
      if(typeof firstChild.setActiveChild === 'function') firstChild.setActiveChild();
    }else{
      return false;
    }
  };

  this.setActive = function(component)
  {
    var component = this.defineComponent(component);

    component.setActiveParent();
    component.setActiveChild();
  };

  this.map = function(fn)
  {
      var components = [];

      var picker = function(component){
          if(typeof fn === 'function') fn.call(root, component);
          components.push(component);
          if(component.hasActiveComponent()) picker(component.getActiveComponent());
      };
      if(this.hasActiveComponent()) picker(this.getActiveComponent());

    return components;
  };

  this.defineComponent = function(component)
  {
    if(! component) return this;

    return typeof component === 'string' ? this.findComponentById(component) : component;
  };

  this.setActiveComponent = function(component)
  {
    this.activeComponent = component;
  };

  this.getActiveComponent = function()
  {
    return this.activeComponent;
  };

  init.call(this);
};

function PriceAggregator(root)
{
    this.filters = {};
    this.default_filter = 'total';

    var init = function()
    {
        this._prepareFilters();
        this.extendComponent();
    };

    this._prepareFilters = function()
    {
        var filters = this.constructor.settings && this.constructor.settings.filters;

        if(! (filters && Object.keys(filters).length > 0)){
            throw new Error('No filters found! Check '+ this.constructor.name + '.settings');
            return false;
        }

        for(var filter in filters) this.registerFilter(filter, filters[filter]);
    };

  this.extendComponent = function()
  {
    var self = this;
    Object.keys(self).map(function(name){
      if(typeof self[name] === 'function'){
        if(root.hasOwnProperty(name)){
          root.log('method_overloaded', { data: { method: name }, message: 'Method '+ name + ' will be overloaded'});
        }

        if(! root.constructor.prototype.hasOwnProperty(name)){
          root[name] = self[name].bind(self);
        }else{
          root[name] = root.constructor.prototype[name];
        }
      }
    });
  };

    /**
     * @override
     * @param filterId
     * @returns {number}
     */
    this.getPrice = function(filterId, params)
    {
        var filter = filterId ? this.getFilterById(filterId) : this.getDefaultFilter();
        if(typeof filter !== 'function') console.warn('filter not prepared');

        return filter.call(this, root, params);
    };
    /**
     * @override
     */
    this.setPrice = function(){ console.warn('This operation is useless. What have you been expected?')};

    this.registerFilter = function(id, fn)
    {
        this.filters[id] = fn;
    };

    this.getFilterById = function(id)
    {
        return this.filters[id];
    };

    this.getDefaultFilter = function()
    {
        return this.getFilterById(this.default_filter);
    };

    this.setDefaultFilter = function(filter){
      this.default_filter = filter;
    };

    init.call(this);
};

PriceComponent.prototype = Object.create(Component.prototype);
PriceComponent.prototype.constructor = PriceComponent;