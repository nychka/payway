function CardType(obj)
{
    this.id = obj.card_type;
    this.numbers = obj.numbers;
    this.states = obj.states;
    this.active = true;

    this.disable = function()
    {
        this.active = false;

        var self = this;
        var envelope = {
            event: self.id + '_disabled',
            message: 'card type: ' + self.id + ' disabled',
            data: self
        };
        Hub.publish(envelope.event, envelope);
    };
    this.enable = function()
    {
        this.active = true;

        var self = this;
        var envelope = {
            event: self.id + '_enabled',
            message: 'card type: ' + self.id + ' enabled',
            data: self
        };
        Hub.publish(envelope.event, envelope);
    };
    this.isActive = function()
    {
        return this.active;
    };
    this.getId = function()
    {
        return this.id;
    };
};
