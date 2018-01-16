function BonusProgram(settings)
{
  this.availability = {
      /*
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
      */
  };
  this.rules = {
      available_bonus: 0,
      minimal_payment: 0,
      reward: 0
  };

  PriceComponent.call(this, settings);
};

BonusProgram.prototype = Object.create(PriceComponent.prototype);
BonusProgram.prototype.constructor = BonusProgram;

BonusProgram.prototype.getAvailableBonus = function()
{
    return this.rules.available_bonus;
};
BonusProgram.prototype.getMinimalPayment = function()
{
  return this.rules.minimal_payment;
};

BonusProgram.prototype.getReward = function()
{
  return this.rules.reward;
};

BonusProgram.prototype.canShow = function(component)
{
  var id = component.getId();

  return this.availability[id] && this.availability[id]['can_show'];
};

BonusProgram.prototype.canUse = function(component)
{
  var id = component.getId();

  return this.availability[id] && this.availability[id]['can_use'];
};

BonusProgram.prototype.reload = function(component)
{
  this.canShow(component) ? this.decorator.getBlock().show() : this.decorator.getBlock().hide();
  this.canUse(component) ? this.decorator.getBlock('use').show() : this.decorator.getBlock('use').hide();
};

function BonusManager(settings)
{
    PriceComponent.call(this, settings);
};

BonusManager.prototype = Object.create(PriceComponent.prototype);
BonusManager.prototype.constructor = BonusManager;

BonusProgram.prototype.subscriptions = {
  'payment_system_changed': function(envelope){
    this.reload(envelope.data.component);
  }
};

function BonusDecorator(component)
{
  this.component = component;
}

BonusDecorator.prototype.getBlock = function(block)
{
  var id = this.component.getId();
  var block = block || 'block';
  var selector = '[data-bonus-program-'+ block +'="'+ id +'"]';

  return $(selector);
};

BonusDecorator.prototype.updateBlock = function(block, value)
{
  this.getBlock(block).text(value);
};