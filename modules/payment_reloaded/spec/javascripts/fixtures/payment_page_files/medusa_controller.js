$.Controller("MedusaController",{
    bubbling: false,
    next_unfilled_input_container: false,
    init:function(){
        this.card_inputs();
        this.setup_mask();

        this.timer = this.element.find(".timer_js").not("#credit_timer");
        this.cardholder_specials = $('#card_holder').data('specials');
        this.check_factura_vat();
        this.without_real_payment =  Number(this.element.data("without-real-payment"))
        this.credit_timer = this.element.find("#credit_timer");
        this.promocode_value = "";

        if(typeof installment == 'object'){
            installment.init();
        }
        // DEBUG START
        var self = this;
        /**
         * @deprecated присвячується для тих хто не ще не готовий відпустити cost.js
         */
        var deprecatedCostReload = function(){
            Hub.dispatcher.getManager('payment').reloadPrices();
            console.warn('Cost is deprecated and removed, use Hub.dispatcher.getManager(\'payment\').reloadPrices() instead');
        };
        this.cost = {
            waitingServiceTime: 100,
            reload: deprecatedCostReload,
            reloadPrice: deprecatedCostReload,
            getDecimalPrecision: function(){ return 0; }
        };

        Hub.subscribe('additional_service_added', function(envelope){
            envelope.data.addSubscriber(Hub.dispatcher.getManager('payment'));
        }.bind(self));

        Hub.subscribe('archive_initialized', function(){
            Hub.dispatcher.getManager('payment').init();
            Hub.dispatcher.getManager('payment').activate();
            // Hub.dispatcher.getManager('payment').setCalculationService(PriceCalculationObj);

            //Hub.dispatcher.getManager('markup').activate();
            this.afterCostInitializing();
        }.bind(self));

        Hub.subscribe('payment_controller_initialized', function(){
            // if(Hub.dispatcher.getManager('service')) Hub.dispatcher.getManager('service').run();
        });

        Hub.subscribe('cards_picker_changed', function(envelope){
            var card = envelope.data.card;

            this.getPaymentCard().transitToState('cards_picker_' + card.group);
            this.getPaymentCard().getCurrentState().setOption('card', card, UserCard);
        }.bind(self));
    },
    getPaymentManager: function(){
        return Hub.dispatcher.getManager('payment'); //this.paymentManager;
    },
    getBonusManager: function(){
        return Hub.dispatcher.getManager('bonus'); //this.bonusManager;
    },
    getMarkupsManager: function(){
        return Hub.dispatcher.getManager('markup'); //this.markupsManager;
    },
    card_inputs: function(){
        var inputs = this.element.find('.card_block input');
        if(window.is_mobile_iOS){
            inputs.on('focus', function(ev){
                var target = $(ev.target);
                $('html, body').animate({
                    scrollTop: (target.offset().top - target.outerHeight())
                }, 800);
            });
            $(document).on('swipe', function(){
                inputs.blur();
            });
        }
    },
    /**
     * request payment card to initialize if it hasn't done it before
     *
     * @return PaymentCard
     */
    getPaymentCard: function()
    {
        return (! this.payment_card) ? this.initializePaymentCard(true) : this.payment_card;
    },
    /**
     * @jira PS-1476
     *
     */
    initializePaymentCard: function(onDemand){
        var card_types = Hub.archive && Hub.archive.getData().configs && Hub.archive.getData().configs.additional_card_types;
        var canInitialize = onDemand || (card_types && Object.keys(card_types).length);

        if(! canInitialize) return false;

        this.payment_card = new PaymentCard();
        this.card_focus = new Motion(this.payment_card);

        if (card_types.momentum) {
            this.payment_card.addCardType({
                card_type: 'momentum',
                numbers: [63, 66, 67, 68, 69],
                states: [MomentumActivatedState, MomentumFilledState]
            });
        }
        if (card_types.amex) {
            this.payment_card.addCardType({
                card_type: 'amex',
                numbers: [34, 37],
                states: [AmexActivatedState]
            });
        }
        if (card_types.jcb) {
            this.payment_card.addCardType({
                card_type: 'jcb',
                numbers: [35],
                states: [JcbActivatedState]
            });
        }
        if (card_types.union_pay) {
            this.payment_card.addCardType({
                card_type: 'union_pay',
                numbers: [62],
                states: [UnionPayActivatedState]
            });
        }

        this.payment_card.init();

        var showCardTypeDisabledErrorMessage = function()
        {
            var firstInput = this.getActiveFirstInput(), validator, labelText;
            validator = this.getForm().validate();
            labelText = validator.defaultMessage(firstInput, 'valid_card_number_visa_master');
            validator.showLabel(firstInput, labelText);
            validator.showErrors();
            this.reset();
        }.bind(this.payment_card);

        Hub.subscribe('payment_system_changed', function(obj){
            var group_name = obj.data.default_group;
            if(! (group_name === 'direct' || group_name === 'aircompany')) return false;

            var amex = this.getCardTypeById('amex'),
                momentum = this.getCardTypeById('momentum');

            if(group_name === 'direct'){
                if(amex && amex.isActive()) amex.disable();
                if(momentum && ! momentum.isActive()) momentum.enable();
            }else{ // aircompany
                if(amex && ! amex.isActive()) amex.enable();
                if(momentum && momentum.isActive()) momentum.disable();
            }
        }, this.payment_card);

        Hub.subscribe('momentum_disabled', function(obj){
            if(obj.data instanceof CardType && obj.data.states.indexOf(this.getCurrentState().constructor) === -1) return false;

            showCardTypeDisabledErrorMessage();
        }, this.payment_card);

        Hub.subscribe('amex_disabled', function(obj){
            if(obj.data instanceof CardType && obj.data.states.indexOf(this.getCurrentState().constructor) === -1) return false;

            showCardTypeDisabledErrorMessage();
        }, this.payment_card);

        Hub.subscribe('amex_enabled', function(cardType){
            //TODO: add log
        }, this.payment_card);

        return this.payment_card;
    },
    /**
     * @jira PS-1391
     * @deprecated config hide_cardholder use instead, this script has no need
     */
    removeCardOwnerForEventsService: function(card_wrapper){
        var service = $('.way_th').data('current-service');
        if(service === 'events'){
            try{
                var form = $('form:first'),
                    card_holder = form.find('[name=card_holder]'),
                    card_holder_value = "Cardholder";

                if(form && form.length && card_holder && card_holder.length){
                    card_holder.val(card_holder_value);
                    card_wrapper.find('.card_owner').hide();
                }else{
                    console.warn("Cardholder wasn't found! Check if $('form:first').find('[name='card_holder']) is working");
                }
            }catch(err){
                console.warn("Card owner have to be removed from Events service according to task but its gone! Very strange...");
            }
        }
    },
    switch_factura_vat:function(){
        if($('#individual').attr("checked")) {
            $('.firm').hide();
            $('.firm').find('input').attr('disabled', 'disabled');
            $('.individual').show();
            $('.individual').find('input').attr('disabled', false);
        } else if ($('#firm').attr("checked")) {
            $('.individual').hide();
            $('.individual').find('input').attr('disabled', 'disabled');
            $('.firm').show();
            $('.firm').find('input').attr('disabled', false);
        } else {
            $('.user-data').hide();
            $(".user-data").find('input').attr('disabled', 'disabled');
        }
    },
    check_factura_vat:function(){
        if($(".factura_vat").length){
            if($('.way_name_row_aircompany.active[data-default_group=aircompany]').is(':visible')){
                $(".factura_vat").slideUp();
                $(".user-data").find('input').attr('disabled', 'disabled');
            }else{
                $(".factura_vat").slideDown();
                this.switch_factura_vat();
            }
        }
    },
    terminals_change:function(value){
        Hub.dispatcher.getManager('payment').setActivePaymentSystem(value);

        if($(".external_order[data-id="+value+"]").length){
            $(".external_order").hide();
            $(".external_order[data-id="+value+"]").show();
            $('#pay_button').attr('id', 'pay_button_disable').parent('.cost').hide();
        }else{
            $(".external_order").hide();
            $('#pay_button_disable').attr('id', 'pay_button').parent('.cost').show();
        }
    },
    ".terminals_ul input[type=radio] -> change": function(ev) {
        this.terminals_change($(ev.target).val());
    },
    afterCostInitializing: function(){
        this.initializePaymentCard();
        this.bind_copy_card_data();

        $('#credit_signing_repeat_button').on("click",  function() {
            credit.credit_send_sms_code();
        });
        $('#credit_signing_confirmation_button').on("click",  function() {
            credit.ConfirmationOfCodeCredit();
        });
        $(".valid_credit_passport_number").mask("?99 - 99 - 999999");
        $('.payment-links').on("click",function(ev){
            ev.preventDefault();
            var el = ev.target;
            var selected_group_name = $(el).data('payGroup');
            $.magnificPopup.close();
            $('#payment_way_tabs').find('[data-pay_group="'+selected_group_name+'"]').click();
        });

        credit_interval="";
        this.timer_start_interval = "";

        window.domain = this.get_base_host();

        if(this.timer.size() && $('.watch').html()){
            this.timer_start();
        };

        if ($('.active_group_block .my_cards_list li').length > 5) {
            $('.save_card_data').slideUp();
        }
        $('.payment_group_errors .ps_reason').live('click', function() {
            $('.payment_group_errors .ps_reason_description').slideToggle();
        });
        if(window['front_version'] == 'mobile'){
            $('[name=radio-extra-4]').on('change',this.change_payment_group);
            $('input').attr('disabled', false);
        }else if( window['front_version'] == 'v2'){
            $('.payment_tab').on('click',function(ev){
                var parents_block = $(this).parents(".js-tab-block");
                parents_block.find('.payment_tab').removeClass('active');
                $(this).addClass('active');
                self.change_payment_group(ev);
            });
        }else{
            var tabsContainer =  $('#payment_way_tabs');
            var activeTabIndex = this.getActiveTabIndex(tabsContainer);
            tabsContainer.tabs({active: activeTabIndex});
            tabsContainer.on("tabsactivate", this.change_payment_group);
        }
        /**
         * TODO: Need to check legal person functionality
         */
        //this.init_legal_person_block();

        this.paymentScroll();
        $("#pay_button_disable").live("click", function() {
            return false;
        });
        this.setup_magnific_inline();
        if(Hub.dispatcher.getManager('payment').hasPaymentSystems()){
            if( window['front_version'] == 'v2'){
                var self = this;
                setTimeout(function(){
                    var tabsContainer =  $('#payment_way_tabs');
                    var activeTabIndex = self.getActiveTabIndex(tabsContainer);
                    tabsContainer.find('[data-slick-index='+activeTabIndex+']').addClass('active');
                    if(window['front_version'] != "mobile"){
                        $('.payment_block').iCheck('destroy');
                        if($('.no-ui-customization').length > 0){
                            $('.no-ui-customization').button('destroy');
                        }
                    }
                    if(window['front_version'] != "mobile"){
                        var checked_elements = $('.payment_block').find('input[type="radio"], input[type="checkbox"]').not($('.popup__content input[type="radio"], .popup__content input[type="checkbox"], .card-type-list.markups_block_js [type="radio"], .no-ui-customization'));
                        $( checked_elements ).button().button( "option", "disabled", false );
                    }
                    if(Hub.dispatcher.getManager('payment').getActivePaymentSystem().getGroupName() == "cash_map"){ cash_map.run();}

                    if ($('select[name=aircompany_change_currency][data-referer_default_currency]').length) {
                        var referer_currency = $('select[name=aircompany_change_currency]').data('referer_default_currency');
                        if ($('.way_name_row_aircompany.was_direct[data-currency=' + referer_currency + ']').length) {
                            var referer_currency_row_id = $('.way_name_row_aircompany.was_direct[data-currency=' + referer_currency + ']').attr('id');
                            if (window['front_version'] == 'v2') {
                                $('.card-currency:visible .currency_select_js').select().val(referer_currency_row_id).change();
                            } else {
                                if ($('a[rel=' + referer_currency_row_id + ']').length) {
                                    $('a[rel=' + referer_currency_row_id + ']').click();
                                }
                            }
                        }
                    }
                },200);
            }
            this.check_direct_as_service();
        }

        $('#payment_way_tabs').find('.js_tab_display').click();
        if (window.credit_payment_active_tab != undefined && window.credit_payment_active_tab != false ){
            setTimeout(function(){
                var el = window['front_version'] == 'v2' ? "" : " a";
                var a_tab = $(".payment_tab"+el+"[data-payment_system_id="+window.credit_payment_active_tab +"]");
                a_tab.click();
                $('.payment-nav.js-slick-responsive').slick('slickGoTo', a_tab.data("slickIndex"), false);
            },200);
        }
        window.onmessage = function(event) {
            if (event.data === "reload") {
                location.reload();
            }
        };
        if( window['front_version'] == 'mobile'){
            $('[name="direct_as_service"]').on('click',function(){
                self.direct_as_service_event();
            });
        }

        /**
         * @event payment_controller_initialized
         */

        //FIXME: remove timeout
        setTimeout(function(){
            Hub.dispatcher.addController('payment', self);
        }, 100);
    },
    "#cash_city -> change": function(ev) { // cash_2 change city
        cities = pay_cash_cities[$('#cash_city').val()];
        var el = $('#cash_address');
        el.empty();
        $.each(cities, function(key, value){
            $('#cash_address').append($("<option></option>").attr("value",value[0]).text(value[1]));
        });
        if(window['front_version'] == 'v2'){
            el.trigger('chosen:updated');
        } else {
            el.selectbox("detach").selectbox("attach");
        }
        Hub.dispatcher.getManager('payment').setActivePaymentSystem(el.val());
    },
    "#cash_address -> change": function(ev) { // cash_2 change address
        $('.office_phone_alt').html(pay_cash_phones[$('#cash_address').val()]);
        Hub.dispatcher.getManager('payment').setActivePaymentSystem($('#cash_address').val());
    },
    "#credit_WRC_button -> click": function(ev){
        var data = $( "form" ).serialize()

        RequestForApprovalOfAgreementCredit(data)
        ev.preventDefault();
    },
    credit_timer_start:function(){
        var self = this;
        this.parent.credit_diff = self.credit_timer.data("diff");
        $('#credit_watch').show();
        clearInterval(self.credit_interval);
        self.credit_interval = setInterval(
            function(){
                var credit_date =  gmdate('i:s',self.parent.credit_diff).split(":");

                self.credit_timer.find(".digits:eq(0)").text(credit_date[0]);
                self.credit_timer.find(".digits:eq(1)").text(credit_date[1]);
                self.parent.credit_diff--;
                if(!Number(credit_date[0]) && !Number(credit_date[1])){
                    $('#credit_watch').hide();
                    clearInterval(self.credit_interval);
                    $("#sms_code").prop( "disabled", true );
                    $("#credit_signing_repeat_button").show();
                    credit.show_error("timeout_confirm_sms");
                    return true;
                }
            }
            ,1000);
    },
    /**
     * DEPRECATED
     * * * *
     * as bonuses are used without payment_controller in some cases,
     * their events should be apart payment_controller
     */
    "[name=use_user_bonuses] -> change": function(ev){
        var checked = !$(ev.target.parentElement).hasClass('checked');

        $(ev.target).closest('.js-section-additional').toggleClass('active').siblings().toggleClass('disabled');

        if(window['front_version'] == 'mobile'){
            checked = $(ev.target).prop('checked');
        } else {
            checked = $(ev.target).attr('checked');
        }
        this.getBonusManager().setBonusProgramCheck('ttn',checked);
    },
    "[name=use_usblp_bonuses] -> change": function(ev){ // USBLP CHECKBOX
        var checked = !$(ev.target.parentElement).hasClass('checked');
        var cardsPicker = Hub.dispatcher.getManager('payment').getCardsPicker();

        if(window['front_version'] == 'mobile'){
            checked = $(ev.target).prop('checked');
        }
        else{
            checked = $('[name=use_usblp_bonuses]:enabled').is(":checked");
        }

        if(cardsPicker){
            checked ? cardsPicker.state.transitTo('otp') : cardsPicker.state.transitTo('default', 'disabled');
        }

        $(ev.target).closest('.js-section-additional').toggleClass('active').siblings().toggleClass('disabled');
        this.getBonusManager().setBonusProgramCheck('otp',checked);
        //msg when user check bonuses
        if(Hub.dispatcher.getManager('payment').getActivePaymentSystem().getDefaultGroupName() != 'direct' && checked){
            var text = this.element.find('.add_bonus_desc:first').text();
            if(text){
                message('msg_title', text, 'continue_button', window.close_message);
            }
        }
    },
    "#usbl_selector -> change": function(ev){ // otp dropdown
        var option = $(ev.target).find(":selected");
        var picker = Hub.dispatcher.getManager('payment').getCardsPicker();
        var paymentCard = Hub.dispatcher.getController('payment').getPaymentCard();

        if(option.data('action') === 'reset'){
            paymentCard.reset();
        }else{
            picker.setActiveCard(option.data('number'));
        }
    },
    ".markups_js -> change":function(ev){
        var el = $(ev.target);
        this.getMarkupsManager().setActiveMarkup(el.data('system_id'),el.val());
    },
    init_legal_person_block: function() {
        var active_payment_group = Hub.dispatcher.getManager('payment').getActivePaymentSystem().getGroupName();
        if (active_payment_group == 'bank_for_lpp') {
            this.prepare_legal_person_block( Hub.dispatcher.getManager('payment').getDecorator().getGroupBlock() );
        }
    },
    get_base_host: function(){
        var regex = new RegExp(window.cur_domain+".", "i");
        var domain = location.host.replace(regex, "");
        return domain;
    },
    //OPTIMIZE: code duplication
    getActiveTabIndex: function(tabsContainer){
        var active_payment_group = Hub.dispatcher.getManager('payment').getActivePaymentSystem().getGroupName();

        var result = tabsContainer.find('[data-pay_group='+active_payment_group+']');
        if(result.length > 1){
            return $(result[0]).attr('data-slick-index');
        }else if(result.length == 1){
            return $(result).attr('data-slick-index');
        }
        return 0;
    },
    "#savecard -> change":function(ev){
        if($('.save_card_data .icheckbox_minimal').hasClass('checked')){$(ev.target).val("");}else{$(ev.target).val("1");}
    },
    ".paym_card -> click":function(ev){
        console.warn(".paym_card -> click");
        // ev.preventDefault();
        // var el = $(ev.target).parent();
        // el.parent().siblings().removeClass("active");
        // el.parent().addClass("active");
        // $('.card_data input').val('');
        // var card_el = this.element.find(".card_data:visible");
        // var card_data = el.data("card");
        // card_el.find("#card_date_month, #card_date_year").val("XX").prop('type', 'password').focus();
        // var first_four = card_data.pan6.slice(0,4);
        // var last_four = card_data.pan4;
        // card_el.find("#card_number_0").val(first_four).focus();
        // card_el.find("#card_number_3").val(last_four).focus();
        // card_el.find("#card_number_1, #card_number_2").val("XXXX").prop('type', 'password').focus();
        // card_el.find("#card_holder").val("XXXXXXXXXXXXXXXXXXXXXXXX").prop('type', 'password').focus();
        // card_el.find("#card_cvv").val("").focus();
        // this.element.find(".card_data:visible input:not(#card_cvv)").prop('disabled', true);
        // this.element.find("#save_card_id").val(card_data.id);
        // $('.save_card_data').slideUp();
        // $('.save_card_data .icheckbox_minimal').removeClass('checked');
        // $('.save_card_data #savecard').removeAttr('checked');
        // $('.save_card_data #savecard').val("");
    },
    "#card_cvv -> focus":function(ev){
        if(!$.trim($(ev.target).val()).length){
            $(ev.target).caret(0);
        }
    },
    "#card_cvv -> click":function(ev){
        if(!$.trim($(ev.target).val()).length){
            $(ev.target).caret(0);
        }
    },
    ".other_card -> click":function(ev){
        console.warn(".other_card -> click");
        ev.preventDefault();
        $(ev.target).parent().siblings().removeClass("active");
        $(ev.target).closest('li').addClass("active");
        if(this.element.find("#save_card_id").val()){
            //this.element.find(".card_data:visible input:not(#card_cvv)").each(function(){$(this).val("").prop('disabled', false).prop('type', 'text').focus();$(this).removeClass("error")});
            this.element.find("#save_card_id").val("");
        }
        //this.element.find(".card_data:visible #card_number_0").focus();
        if ($('.active_group_block .my_cards_list li').length < 6) {
            $('.save_card_data').slideDown();
        };
    },

    "input[type=text], input[type=tel] -> change": function(ev) {
        // if(window['front_version'] != 'v2'){
        //     if(!this.parent.bubbling) this.next_unfilled_input($(ev.target).attr('id'));
        // }
        console.warn("input[type=text], input[type=tel] -> change");
    },
    ".card_num input -> keyup":function(ev){
        // var $target = $(ev.target),
        //     max_length = $target.attr('maxLength');
        //
        // max_length = max_length ? parseInt(max_length) : 4;

        // if($target.val().length == max_length){
        //     this.parent.next_unfilled_input_container = $('.card_num');
        //     this.next_unfilled_input();
        // }
        console.warn(".card_num input -> keyup");
    },
    ".card_num input -> click":function(ev){
        // var $target = $(ev.target);
        // var t_parent = $target.parent();
        // if(window['front_version'] == "mobile") t_parent = t_parent.parent();
        // var t_id = ev.target.id.substr(12,13);
        // if(t_id > 0){
        //     for(var i = 0; i < t_id; i++){
        //         if(t_parent.find("#card_number_"+i).val().length < 4){
        //             t_parent.find("#card_number_"+i).focus();
        //             break;
        //         }
        //     }
        // }
        // if(window['front_version'] == 'v2' && window['front_version'] != 'mobile' && $target.val().length > 0)
        //     ev.target.select();
        // $target.parents('.card-num-wrapper').removeClass('error');
        console.warn(".card_num input -> click");
    },
    ".card_date_js input -> keyup":function(ev){
        // var $target = $(ev.target);
        //
        // if (ev.keyCode === 37 || ev.keyCode === 8){
        //     $target.val("");
        //     ev.preventDefault();
        // }
        //
        // if($target.val().length == 2){
        //     if(window['front_version'] == 'v2' && ev.target.id == "card_date_year"){//&& window.cur_domain != 'my'
        //         ev.preventDefault();
        //         setTimeout(function(){$('#card_cvv:enabled').focus()},100);
        //     }else{
        //         this.parent.next_unfilled_input_container = $('.card_date');
        //         this.next_unfilled_input();
        //     }
        // }
        console.warn(".card_date_js input -> keyup");
    },
    ".card_date_js input -> click":function(ev){
        //ev.target.select();
        console.warn(".card_date_js input -> click");
    },
    ".card_cvv_js input -> keyup":function(ev){
        // var $target = $(ev.target);
        // var maxLength = parseInt($target.attr('maxLength'));
        //
        // if (ev.keyCode === 37 || ev.keyCode === 8 || ev.keyCode === 46){
        //     $target.val("");
        //     ev.preventDefault();
        // }
        // if($target.val().length == maxLength){
        //     setTimeout(function(){$('#card_holder:enabled').focus()},100);
        // }
        console.warn(".card_cvv_js input -> keyup");
    },
    ".card_cvv_js input -> click":function(ev){
        //ev.target.select();
        console.warn(".card_cvv_js input -> click");
    },
    ".only_latin_specials_js -> keyup":function(ev){
        var el  = $(ev.target)
        var reg1 = "[^a-zA-Z";
        var reg2 = "\\s\\-]+";
        this.valid_element(el,this.cardholder_specials,reg1,reg2);
    },
    ".only_cyrillic_specials_js -> keyup":function(ev){
        var el  = $(ev.target)
        var reg1 = "[^а-яА-ЯёЁ";
        var reg2 = "\\s\\-]+";
        this.valid_element(el,"",reg1,reg2);
    },
    valid_element:function(el,specials,reg1,reg2){
        var regExp = new RegExp(reg1 + specials + reg2);
        var caretPosition = el.caret().begin - (regExp.test(el.val()) ? 1 : 0);
        var val = el.val().replace(regExp, "").split(" ")

        val.length > 2 ? val.pop() : false;
        el.val(val.join(" "))
        el.caret(caretPosition);
    },
    rm_tooltip:function(el){
        var idx = $(".txtinput").index(el);
        window.hide_error_popup(idx);
    },
    set_tooltip:function(el,text,scroll){
        //if($('.b_errors').is(':visible')) return false;
        scroll = scroll || false;
        var idx  = $(".txtinput").index(el);
        var self = this;
        el =  el.hasClass("i_accept_chk") ? el.parents(".i_accept") : el;
        if(!$("._idx_" + idx).size())
            window.show_error_popup(el,text,idx,true);
        if($(".error").length > 0){

            if($(".error:eq(0)").is(':visible')){
                wrapper_error_input = $(".error:eq(0)");
            } else {
                wrapper_error_input = $(".error:eq(0)").parent();
            }

            var first_error = $(wrapper_error_input).offset().top - ($(wrapper_error_input).height() * 3);

            if(!idx && ! this.go_top || scroll && !this.go_top) {
                $('html, body').animate({ scrollTop: first_error }, 500,function(){self.go_to_top(false);});
            }
        }
    },
    setup_mask:function(){
        this.parent.next_unfilled_input_container = $('.card_owner');
    },
    check_direct_as_service:function(){
        if(Hub.dispatcher.getManager('payment').hasDirectAsService()){
            var checked = false;
            if(Hub.dispatcher.getManager('payment').getActivePaymentSystem().getDefaultGroupName() == 'direct'){
                if(window['front_version'] == 'v2'){
                    $("#direct_as_service").parent().find('label').addClass('ui-state-active').attr('aria-pressed',"true");
                }else if(window['front_version'] == 'mobile'){
                    $("#direct_as_service").attr('checked',true).parent().find('label').removeClass('ui-checkbox-off').addClass('ui-checkbox-on');
                }else{
                    $("#direct_as_service").iCheck('check');
                }
                checked = true;
                Hub.dispatcher.getManager('payment').setActivePaymentGroup('aircompany','direct');
            }else{
                Hub.dispatcher.getManager('payment').setActivePaymentGroup('aircompany','aircompany');
            }
            this.direct_as_service_active = checked;
            Hub.dispatcher.getManager('payment').reloadDirectAsService();
        }
    },
    "div.service_package_js -> click": function(ev){
        ev.preventDefault();
        this.direct_as_service_event();
    },
    direct_as_service_event: function () {
        var self = this;
        setTimeout(function(){
            if(window['front_version'] != 'v2'){
                var checked = !!$('#direct_as_service').attr('checked');
            }else {
                var checked = $('div.service_package_js').find('label[for="direct_as_service"]').hasClass('ui-state-active');
            }
            if(self.direct_as_service_active != checked){
                self.direct_as_service_active = checked;
                if(checked){
                    Hub.dispatcher.getManager('payment').setActivePaymentGroup('aircompany','direct');
                    Hub.dispatcher.getManager('payment').reloadDirectAsService();
                }else{
                    Hub.dispatcher.getManager('payment').setActivePaymentGroup('aircompany','aircompany');
                    Hub.dispatcher.getManager('payment').reloadDirectAsService();
                }
            }
        }, 0);
    },
    ".currency_select_js -> change":function(ev){
        var el = $(ev.target);
        var value = el.val();
        // $.each(['card_number_0', 'card_number_1', 'card_number_2', 'card_number_3', 'card_date_year', 'card_date_month', 'card_number', 'card_holder'], function(i,id){
        //     $('#'+id+':disabled').val($('#'+id+':enabled').val());
        // });
        console.warn('deprecated currency change copy input data ');
        Hub.dispatcher.getManager('payment').setActivePaymentSystem(value);
        Hub.dispatcher.getManager('payment').reloadDirectAsService();
        /**
         * TODO: remove updating all layers after forming one-layered card form
         */
        Hub.dispatcher.getManager('payment').getDecorator().getPaymentSystemBlock(value).find('.currency_select_js').select().val(value).trigger("chosen:updated");
    },
    aircompany_change_currency:function(ev){
        var default_currency = $('.way_name_row_aircompany.was_aircompany').data('currency');
        var aircompany_cost = $('.way_name_row_aircompany.was_aircompany[data-default_group=aircompany]').data('topay');
        var default_direct_cost = $('.way_name_row_aircompany.was_direct[data-currency=' + default_currency + ']').data('topay');
        var pay_currency = $(ev).data('currency');
        var direct_cost_in_currency = $('.way_name_row_aircompany.was_direct[data-currency=' + pay_currency + ']').data('topay');
        var margin = default_direct_cost - aircompany_cost;
        if(pay_currency != default_currency){
            var rate = default_direct_cost / direct_cost_in_currency;
            margin = (margin/rate);
        }
        this.reload_direct_as_service(pay_currency,margin);
        this.s7_block_prices(pay_currency, Hub.dispatcher.getManager('payment').getActivePaymentSystem().getId());
        Hub.dispatcher.getManager('payment').reloadPrices();
    },

    s7_block_prices: function(currency, pay_system_id){
        // Change currency in alternative recomendations block
        if(typeof s7_prices != "undefined"){
            currency = currency || s7_prices['avia_default_pay_currency'];
            if($('.s7-recommendations-block').length > 0 ){
                var avia_margins = $.parseJSON(s7_prices['avia_payments_margin']);
                var precisions_arr = $.parseJSON(s7_prices['avia_precisions']);
                var precisions = function(currency, prec_arr){
                    var precision_val = 2;
                    if(typeof prec_arr == 'object'){
                        if(typeof prec_arr[currency] != 'undefined' && prec_arr[currency]) precision_val = 0;
                    }else if(typeof prec_arr == 'boolean' && prec_arr){
                        precision_val = 0;
                    }
                    return precision_val;
                }
                $.each($('.alternative-amount'), function(i, item){
                    var item = $(item);
                    var price = amounts[i][currency];
                    if(currency != s7_prices['avia_default_pay_currency'] && typeof avia_margins != 'undefined' && typeof avia_margins[pay_system_id] != 'undefined'){
                        price = window.ceilNumber(price*avia_margins[pay_system_id]/100-(-price), precisions(currency, precisions_arr));
                    }
                    item.html(price + ' ' + currency)
                });
            }
        }
    },
    bind_copy_card_data: function(){
        console.warn('deprecated');
        // $.each(['card_num', 'card_date', 'card_cvv','card_owner'], function(i, container_class) {
        //     var input = $('.payment_block_aircompany').find('.' + container_class + ' input[type="text"],input[type="tel"],input[type="password"]');
        //     input.removeClass('error');
        //     input.not(':disabled').unbind('keyup.card_input');
        //     input.not(':disabled').bind('keyup.card_input', function() {
        //         var el = $(this), el_name = el.attr('name');
        //         input.filter('[name="'+ el_name +'"]:disabled').val(el.val());
        //     })
        // });
    },
    "input[name=pay_aircompany] -> change":function(ev){
        var el = $(ev.target);
        var group = el.data('current-group');
        Hub.dispatcher.getManager('payment').setActivePaymentGroup(group,el.data('default-group'));
        this.bind_copy_card_data();
        this.check_factura_vat();

        $('.card-type-list__item .iradio_minimal').removeClass('disabled');
    },
    change_payment_group: function(ev){
        window.hide_error_popup('all');
        var el = $(ev.currentTarget);
        if(ev.originalEvent && window['front_version'] != 'mobile'){
            el = $(ev.originalEvent.currentTarget);
        }
        var pay_group = el.data('pay_group');
        var payment_system_id = Hub.dispatcher.getManager('payment').getGroupByName(pay_group).getActivePaymentSystemId();

        var block = Hub.dispatcher.getManager('payment').getDecorator().getGroupBlock(pay_group);//$('#'+unique_id+'_block');

        this.prepare_legal_person_block( block );
        if(!block.hasClass('do_not_expand')){ block.show(); }
        $('.choose_payment_way').find('.error').removeClass('.error');
        $.each(['card_cvv', 'card_date', 'card_number', 'card_number_2', 'card_holder'], function(i,id){
            $('#' + id + '_error').remove();
        });

        if( $('#payment_way_'+payment_system_id).find('.with_external_order').length ){
            this.terminals_change($('.way_name_row.active').data('change-class'));
        }else{
            if ( $('#pay_button_disable').length ) {
                $('#pay_button_disable').attr('id', 'pay_button').parent('.cost').show();
            }
        }
        Hub.dispatcher.getManager('payment').setActivePaymentGroup(pay_group);
        this.check_factura_vat();
        if(pay_group == 'credit'){
            var status = credit.status;
            credit.showTemplateCredit(status,payment_system_id);
            credit.run();
            window.block_credit_open = true;
            if(status == "" || status == "info" ){
                $('#pay_button').show();
            }else{
                $('#pay_button').hide();
            }
        }else{
            if(window.block_credit_open == true){
                window.block_credit_open = false;
                credit.end();
            };
            $('#pay_button').show();
            $('.booking_price_button').find('strong').unbind();
        }
        if("cash_map" == pay_group){
            cash_map.run();
            window.cash_map_open = true;
        }else{
            if(window.cash_map_open == true){
                window.cash_map_open = false;
                cash_map.end();
            }
        }
    },
    prepare_legal_person_block: function(block) {
        var legal_person_block = block.find('.legal_person_block');
        if(legal_person_block.length > 0){
            legal_person_block.show();
            $("#legal_person_inn").prop("disabled", $('#individ').attr('checked') !== 'checked');
        }
    },
    /**
     IMPORTANT: attr('data-payment_system_id') != data('payment_system_id')
     attr('data-payment_system_id') це ідентифікатор першої згенерованої плат.системи
     по ньому привязується таба
     */
    get_active_tab: function(){
        var activePaymentSystem = $('.way_name_row.active'),
            id = activePaymentSystem.attr('data-payment_system_id');
        if(window['front_version'] == 'mobile'){
            var activeTab = $('.payment_tab').find('input[data-payment_system_id='+id+']');
        }else if(window['front_version'] == 'v2'){
            var activeTab = $('.payment_tab[data-payment_system_id='+id+']');
        }else{
            var activeTab = $('.payment_tab').find('a[data-payment_system_id='+id+']');
        }

        return activeTab;
    },
    // next_unfilled_input: function(last_id){
    //     var unfilled = [], unfl;
    //     this.parent.bubbling = true;
    //     this.element.find("input:visible:not([readonly])").filter('[type=text],[type=password],[type=tel]').not('.ignore_tab').each(function(){
    //         if( $(this).val() === "" || $(this).val().replace(/\s+/, "").replace(/\s+/, "").replace("/", "") === "" ) {
    //             unfilled.push($(this));
    //         }
    //     });
    //
    //     if(unfilled.length > 0) {
    //         unfl = unfilled[0];
    //         unfilled = [];
    //         this.parent.bubbling = false;
    //         if(!last_id || (last_id != unfl.attr('id'))) {
    //             setTimeout(function(){unfl.focus()},100);
    //         }
    //     }
    // },
    setup_magnific_inline: function(){
        window.enable_magnific_inline();
    },
    clear_timer_start_interval: function(){
        clearInterval(this.timer_start_interval);
    },
    timer_start:function(){
        // Debug for multi initialization
        if(this.parent.diff != undefined) return;

        var self = this;
        this.parent.diff = self.timer.data("diff");
        this.clear_timer_start_interval();
        this.timer_start_interval = setInterval(
            function(){
                var date =  gmdate('H:i:s',self.parent.diff).split(":");
                var days = Math.floor(self.parent.diff/(60*60*24));
                if(days > 0){
                    var hours = days * 24 + parseInt(date[0]);
                }else{
                    var hours = date[0];
                }
                if(self.timer.find(".digits").length > 1){
                    self.timer.find(".digits:eq(0)").text(hours);
                    self.timer.find(".digits:eq(1)").text(date[1]);
                    self.timer.find(".digits:eq(2)").text(date[2]);
                } else {
                    self.timer.find(".digits").text(hours+' : '+date[1]+' : '+date[2]);
                }
                self.parent.diff--;
                if(!Number(date[0]) && !Number(date[1]) && !Number(date[2])){
                    function end_session_redirect() {
                        $(window).unbind('beforeunload');
                        if(window.cur_domain == 'my'){
                            $('.watch').hide();
                            parent.window.location.reload();
                            return false;
                        }
                        window.location.href = "/";
                        self.clear_timer_start_interval();
                        return false;
                    }
                    if (typeof(window.payment_end_session_message) !== 'undefined' && window.payment_end_session_message) {
                        message('msg_title', window.payment_end_session_message, 'continue_button', function(){
                            end_session_redirect();
                        }, false);
                        return false
                    } else {
                        return end_session_redirect();
                    }
                }
            }
            ,1000);

    },
    paymentScroll:  function (){
        if($('.payment-carousel li').size() > 5){
            var carousel = $('.payment-carousel'),
                carouselWrapper = carousel.parents('.payment-carousel__wrapper'),
                carouselItem = $('.payment-carousel li'),
                carouselItemLength =  carouselItem.size(),
                carouselItemWidth = carouselItem.outerWidth(true);
            carousel.addClass('on');
            carouselWrapper.css('padding','0 50px')
            carousel.width(carouselItemLength*carouselItemWidth);
            carouselWrapper.append('<a class="next-slide"></a><a class="prev-slide enabled" ></a>');
            var carouselNext = carouselWrapper.find('.next-slide'),
                carouselPrev = carouselWrapper.find('.prev-slide');
            carouselNext.click(function() {
                $( carousel ).animate({
                    left :  carouselWrapper.width()- carousel.width() + 60
                }, 500 , function(){
                    carouselNext.addClass('enabled');
                    carouselPrev.removeClass('enabled')
                });
            });
            carouselPrev.click(function() {
                $( carousel ).animate({
                    left : 60
                }, 500 , function(){
                    carouselPrev.addClass('enabled');
                    carouselNext.removeClass('enabled')
                });
            });
        }
    },

});

$(".select-popup-overlay").live('click', function(e) {
    $('.select-popup-overlay').remove();
});

function payment_step(step){
    if(step == 1){
        $('.extras').show();
        $('.flight_more_js .your-flight_footer').show();
        $('.pay_block_2_js').hide();
        $('.accept_checkbox_js').hide();
        $('.btn-wrapper.buy-ticket').hide();
        $('.order-price.container').hide();
        $('.header_step_2').addClass("hidden");
        $('.header_step_1').removeClass("hidden");
        $(".js-mobile-ff_block-wrap").removeClass("hidden");
        setTimeout("$('.back-arrow:first').attr('href',window['back_href']);",100);
        window.scrollTo(0,0);
        location.hash = '';
        // $('.service__title').html($('.ui-content').attr('data-booking_title'));
    }else if(step == 2){
        $('.extras').hide();
        $('.flight_more_js .your-flight_footer').hide();
        $('.pay_block_2_js').show();
        $('.accept_checkbox_js').show();
        $('.btn-wrapper.buy-ticket').show();
        $('.order-price.container').show();
        $('.header_step_2').removeClass("hidden");
        $('.header_step_1').addClass("hidden");
        $(".js-mobile-ff_block-wrap").addClass("hidden");
        // window['back_href'] = $('.back-arrow:first').attr('href');
        $('.back-arrow:first').attr('href','javascript:void(0);').on("click",function(){payment_step(1);});
        window.scrollTo(0,0);
        location.hash = '#page';
        if(window['onInit'] == undefined){
            if ($('select[name=aircompany_change_currency][data-referer_default_currency]').length) {
                referer_currency = $('select[name=aircompany_change_currency]').data('referer_default_currency');
                if ($('.way_name_row_aircompany.was_direct[data-currency=' + referer_currency + ']').length) {
                    var referer_currency_row_id = $('.way_name_row_aircompany.was_direct[data-currency=' + referer_currency + ']').attr('id');
                    $('.card-currency:visible select').val(referer_currency_row_id).change();
                }
            }
            window['onInit'] = true;
        }
        Hub.subscribe('payment_controller_initialized', function(){
            Hub.dispatcher.getManager('payment').reloadPrices();

            if(typeof(googlemap_chash_map_small) != 'undefined'){
                googlemap_chash_map_small.resize();
            }
        });
        // $('.service__title').html($('.ui-content').attr('data-pay_title'));
    }
}

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

        context.wrapper.find('input').prop('readonly', false);
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
        var card = this.options['card'];
        context.card_number_0.val(card.get('first_token')).prop('readonly', true);
        context.card_number_1.prop('readonly', true);
        context.card_number_2.prop('readonly', true);
        context.card_number_3.val(card.get('last_token')).prop('readonly', true);
        context.card_date_month.prop('readonly', true);
        context.card_date_year.prop('readonly', true);
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
