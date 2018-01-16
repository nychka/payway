function BonusRule(data){
    this.init = function(data){
        this.data = data;
    };
    this.getAvailableBonus = function(){
        return this.data.available_bonus;
    };
    this.getMinimalPayment = function(){
        return this.data.minimal_payment;
    };
    this.getReward = function(){
        return this.data.reward;
    };
    this.init(data);
}