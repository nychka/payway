$( document ).ready(function() {
  toggle_additional_services={
    // additional_services: [''],
    pay_contr:null,
    _manager:"",
    _is_hidden:false,
    insurance:   {},
    sms:         {},
    aeroexpress: {},
    was_bonuses_check: false,
    disabled_services: [],
    additional_services_type: "checkbox",
    init: function(manager){
      this.manager = manager;
      this.pay_contr = $("[data-auto-controller=PaymentController]").controller();
    },
    hide: function(){
      if(!this._is_hidden){
        if($('.js-page-need-separate').controller() != undefined){
          $('.js-page-need-separate').controller().hide_separate();
        }
        this._clear_up();
        this._save_param();
        this._set_disabled_services();
        this._hide();
        this._is_hidden = true;
      }
    },
    show: function(manager){
      if(this.manager == manager){
        this._show();
        this._turn_params();
        this._is_hidden = false;
        if($('.js-page-need-separate').controller() != undefined){
          $('.js-page-need-separate').controller().show_separate();
        }
      }
    },
    _hide: function(){
      //insurance
      $('.js-additional-services').addClass('hidden');
      //sms
      $('#additional_services').addClass('hidden');
      //js_aeroexpress
      $('.js_aeroexpress').addClass('hidden');
    },
    _save_param: function(){
      var self = this;
      //insurance
      $('.additional-service__insurance label, .insurance-block label').each(function(item, i, arr) {
        self.insurance[i.getAttribute("for")] = i.getAttribute("aria-pressed");
      });

      if(typeof ancillaryServicesObj != "undefined"){
        ancillaryServicesObj.stash_services("save");
      };

      if(self.additional_services_type == "checkbox"){
        $('#additional_services label').each(function(item, i, arr) {
          if($(i).hasClass('ui-state-active')){
            self.sms[i.getAttribute("for")] = 'true';
          }
        });
      }else{
        if(self._changed_radio_guarantee_block_Q()){
          self._get_radio_guarantee_block('label').each(function(item, i, arr) {
            self.sms[i.getAttribute("for")] = i.getAttribute("aria-pressed");
          });
        }else{
          self._get_radio_guarantee_block('input').each(function(item, i, arr) {
            var r = i.getAttribute("checked") ? 'true' : 'false' ;
            self.sms[i.id] = r;
          });
        }

        if(self._changed_radio_sms_block_Q()){
          self._get_radio_sms_block('label').each(function(item, i, arr) {
            self.sms[i.getAttribute("for")] = i.getAttribute("aria-pressed");
          });
        }else{
          self._get_radio_sms_block('input').each(function(item, i, arr) {
            var r = i.getAttribute("checked") ? 'true' : 'false' ;
            self.sms[i.id] = r;
          });
        }

        if(self._changed_online_checkin_block_Q()){
          self._get_online_checkin_block('label').each(function(item, i, arr) {
            self.sms[i.getAttribute("for")] = i.getAttribute("aria-pressed");
          });
        }else{
          self._get_online_checkin_block('input').each(function(item, i, arr) {
            var r = i.getAttribute("checked") ? 'true' : 'false' ;
            self.sms[i.id] = r;
          });
        }
      }

      $('.js_aeroexpress_form label').each(function(item, i, arr) {
        self.aeroexpress[i.getAttribute("for")] = i.getAttribute("aria-pressed");
      });

    },
    _isset_online_checkin_block_Q: function(el){
      var result = false ;
      if(this._get_online_checkin_block(el).length > 0 ){
        result = true;
        this.disabled_services.push('reset_online_checkin');
      }
      return result
    },
    _changed_online_checkin_block_Q: function(){
      var result = false;
      if(this._isset_online_checkin_block_Q("label")){
        result = this._get_online_checkin_block('label')[0].getAttribute("aria-pressed") != undefined
      }
      return result
    },
    _isset_radio_sms_block_Q: function(el){
      var result = false ;
      if(this._get_radio_sms_block(el).length > 0 ){
        result = true;
        this.disabled_services.push('reset_additional_services_sms');
      }
      return result
    },
    _changed_radio_sms_block_Q: function(){
      var result = false;
      if(this._isset_radio_sms_block_Q("label")){
        result = this._get_radio_sms_block('label')[0].getAttribute("aria-pressed") != undefined
      }
      return result
    },
    _isset_radio_guarantee_block_Q: function(el){
      var result = false ;
      if(this._get_radio_guarantee_block(el).length > 0){
        this.disabled_services.push('reset_additional_services_warranty');
        result = true;
      }
      return result
    },
    _changed_radio_guarantee_block_Q: function(){
      var result = false;
      if(this._isset_radio_guarantee_block_Q("label")){
        result = this._get_radio_guarantee_block('label')[0].getAttribute("aria-pressed") != undefined
      }
      return result
    },
    _get_radio_guarantee_block: function(el){
      return $('#additional_services .guarantee_block .additional_services_list li '+ el);
    },
    _get_radio_sms_block: function(el){
      return $('#additional_services .sms_block .additional_services_list li '+ el);
    },
    _get_online_checkin_block: function(el){
      return $('#additional_services .online_checkin_block .additional_services_list li '+ el);
    },
    _set_disabled_services: function(){
      var self = this;
      this.disabled_services.forEach(function(item, i, arr) {
                                self._el_click(item);
                             });
      //insurance
      if($('#insurance_provider').val()=="mixed"){
          setTimeout(function(){
            for(var index in self.insurance) {
             if(self.insurance[index] == 'true'){
                  self._el_click(index);
                  if($("[for='"+index+"']")[0] != undefined){
                    var pressed = $("[for='"+index+"']")[0].getAttribute("aria-pressed");
                    if(pressed == "true"){
                      self._el_click2(index);
                    }
                  }
                  var info_popup = $("[for='"+index+"']").parent().find(".info_popup");
                  if(!info_popup.hasClass( "hidden" )){
                      info_popup.find(".denial").click();
                  }
                }
              }
          },100);
      }

      if(self.additional_services_type == "checkbox"){
        for(var index in this.sms) {
          if(this.sms[index] == 'true'){
            this._el_click(index);
          }
        }
      }

      for(var index in this.aeroexpress) {
        if(this.aeroexpress[index] == 'true'){
          this._el_click(index);
        }
      }
      //this._toggle_bonus(self.pay_contr.cost.useBonusesCheckedFlag);

    },
    _show: function(){
       //insurance
      $('.js-additional-services').removeClass('hidden');
      //sms
      $('#additional_services').removeClass('hidden');
      //js_aeroexpress
      $('.js_aeroexpress').removeClass('hidden');
    },
    _turn_params: function(){
      var self = this;
      this._turn_params_insurance();

      if(typeof ancillaryServicesObj != "undefined"){
        ancillaryServicesObj.stash_services("apply");
      };

      for(var index in this.aeroexpress) {
        if(this.aeroexpress[index] == 'true'){
          this._el_click(index);
        }
      }
      for(var index in this.sms) {
        if(this.sms[index] == 'true'){
          this._el_click(index);
        }
      }

      //this._toggle_bonus(self.pay_contr.cost.useBonusesCheckedFlag);
      this.was_bonuses_check = false;
      this.disabled_services=[];
    },
    _turn_params_insurance: function(){
      var self = this;
      for(var index in this.insurance) {
        if(this.insurance[index] == 'true'){
          var index_without = index.split('_plus')[0];
          this._el_click(index_without);
          if($("[for='"+index_without+"']")[0] !=  undefined){
            var pressed = $("[for='"+index_without+"']")[0].getAttribute("aria-pressed");
            if(pressed == "false"){
              self._el_click2(index_without);
            }
          }
        }
      }
    },
    _clear_up: function(){
    this.insurance  = {};
    this.sms        = {};
    this.aeroexpres = {};
    },
    _el_click: function(attr){
      var el = $("[for='" + attr + "']");
      if(el.length > 0){
        el[0].click();
      }
    },
    _el_click2: function(attr){
      var el = $("#" + attr);
      if(el.length > 0){
        el[0].click();
      }
    },
    _toggle_bonus:function(flag){
      if(flag != undefined){
        $('#use_user_bonuses__direct').parent().find('label').click();
        this.was_bonuses_check = true;
        flag = undefined;
        $('[name="use_user_bonuses"]').each(function(i, cur_cbox ){ cur_cbox.value = 0; });
      }else{
        if(this.was_bonuses_check){
          flag ="checked";
          $('[name="use_user_bonuses"]').each(function(i, cur_cbox ){ cur_cbox.value = 1; });
        }
      }
      this.pay_contr.cost.setUseBonusesCheck(flag);
    }

  }
})
