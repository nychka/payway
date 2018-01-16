function PaymentGroup(manager,name) {
    this.manager = manager;
    this.name = name;
    this.systems = [];
    this.defaultGroups = []; // default PS groups that display inside group tab
    this.activePaymentSystemId = null;

    this.addPaymentSystem = function (sys,set_active) {
        this.systems[sys.getId()] = sys;
        // set default active PS
        if(!this.activePaymentSystemId || set_active) this.activePaymentSystemId = sys.getId();
        // set default active PS for default group
        if(!this.defaultGroups[sys.getDefaultGroupName()]){
            this.defaultGroups[sys.getDefaultGroupName()] = [];
            this.defaultGroups[sys.getDefaultGroupName()]['systems'] = [];
        }
        if(!this.defaultGroups[sys.getDefaultGroupName()].activePaymentSystemId || set_active){
            this.defaultGroups[sys.getDefaultGroupName()]['activePaymentSystemId'] = sys.getId();
        }
        this.defaultGroups[sys.getDefaultGroupName()]['systems'].push(sys);

    };

    this.getPaymentSystemByDefaultGroupAndCurrency = function (def_group,currency) {
        var system = false;
        if(!this.defaultGroups[def_group]) Hub.track('Group "'+this.name+'" doesn\'t contains default group "'+def_group+'"');

        $.each(this.defaultGroups[def_group]['systems'], function( i, sys ){
            if(sys.getCurrency() == currency){ system = sys;return;}
        });

        return system;
    };

    this.hasDefaultGroup = function(name){
        return !!this.defaultGroups[name];
    };

    this.getActivePaymentSystemId = function(defaultGroup) {
        if(defaultGroup) return this.defaultGroups[defaultGroup].activePaymentSystemId;
        return this.activePaymentSystemId;
    };

    this.setActivePaymentSystem = function (id) {
        if(!this.systems[id]) Hub.track('Group "'+this.name+'" doesn\'t contains system "'+id+'"');

        this.activePaymentSystemId = id;
        this.defaultGroups[this.systems[id].getDefaultGroupName()].activePaymentSystemId = id;
    };

}