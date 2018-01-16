function BonusDecorator(manager) {
    this.manager = manager;

    this.init = function () {

    };

    this.replaceBonusBlock = function(program, html)
    {
      this.getBonusMainBlock(program).replaceWith(html);
    };

    this.getBonusMainBlock = function(program){
        var bonusBlock = $('[data-bonus-program-block="'+ program +'"]');
        return bonusBlock ? bonusBlock : false;
    };

    this.getBonusUseBlock = function(program){
        var bonusBlock = $('[data-bonus-program-use="'+ program +'"]');
        return bonusBlock ? bonusBlock : false;
    };

    /**
     * @param program
     * @param count of bonuses by default currency
     * @param amount(count) of bonuses by currency of current payment system
     * @param currency
     */
    this.updateBonusBlock = function (program,count,amount,currency) {
        var block = this.getBonusMainBlock(program),
            bonusesCount = block.find('[data-bonus-program-count="'+program+'"]'),
            bonusesAmount = block.find('[data-bonus-program-amount="'+program+'"]'),
            bonusesCurrency = block.find('[data-bonus-program-currency="'+program+'"]');

        bonusesCount.text(count);
        bonusesAmount.text(amount);
        bonusesCurrency.text(currency);
    };

    this.init();
}