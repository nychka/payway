$.Controller("PaymentCreditController",{

});

$( document ).ready(function() {

credit = {
    id:'',
    status:'info',
    wait:            1000,
    attempts:        1,
    max_attempts:    100,
    start_obtaining: false,
    errors: {},
    run: function(){
      toggle_additional_services.init("credit");
      toggle_additional_services.hide();
      this.init_checked();
    },
    end: function(){
      toggle_additional_services.show("credit");
    },
    init_checked: function(){
      var el = $('#checkbox-confirm2');
      if(!el.parent().hasClass("icheckbox_minimal")){
        el.iCheck({ checkboxClass: 'icheckbox_minimal'  });
      }
    },
    show_error:function(type){
      if(credit.errors[type] != undefined){
        $('.js_place_errors').text(credit.errors[type]);
      }
    },
    hide_errors:function(){
      $(".js_place_errors").text("");
    },
    timer_hide:function(){
      var pay_contr      = $("[data-auto-controller=PaymentController]").controller();
      $('#credit_timer').hide();
      clearInterval(pay_contr.credit_interval);
      $('#credit_timer .digits').text("00");
      $("#sms_code").prop( "disabled", true );
    },
    timer_show:function(){
      var pay_contr      = $("[data-auto-controller=PaymentController]").controller();
      $('#credit_timer').show();
      $("#sms_code").prop( "disabled", false );
      var time_out = pay_contr.credit_timer_start();
    },
    obtaining_the_status_of_book: function(){
      var pay_contr      = $("[data-auto-controller=PaymentController]").controller();
      var payment_system = pay_contr.cost.getActivePaymentSystem().id;
      var order_id       = $("[name=order_id]").val();
      this.start_obtaining = true;
          $.ajax({
            url: '/credit/get_status_book',
            type: 'post',
            data:  {
              locator:    order_id,
              pay_system: payment_system
            },
            success: function(response) {
              var r = JSON.parse(response);
              if(r.success){
                location.reload();
              }else{
                credit.attempts += 1;
                if(credit.attempts < 60){//15 minute
                  setTimeout(credit.obtaining_the_status_of_book, 15*credit.wait);
                }else if(credit.attempts >= 60 && credit.attempts < credit.max_attempts){
                  setTimeout(credit.obtaining_the_status_of_book, 60*credit.wait);
                }
              }
            }
          });
    },
    fibonacci: function(n){
      if (n === 0 || n === 1)
        return n;
      else
      return this.fibonacci(n - 1) + this.fibonacci(n - 2);
    },
    set_status_credit: function(status){
      var pay_contr = $("[data-auto-controller=PaymentController]").controller();
      var payment_system = pay_contr.cost.getActivePaymentSystem().id;
      $(".credit_" + payment_system ).data('creditStatus', status);
    },
    credit_send_sms_code:function(){
        var pay_contr = $("[data-auto-controller=PaymentController]").controller();
        var payment_system = pay_contr.cost.getActivePaymentSystem().id;
        var order_id       = $("[name=order_id]").val();
        var service        = $("[name=service]").val();

        $.ajax({
          url: '/credit/request_send_sms_code',
          type: 'post',
          data:  {
            service:           service,
            payment_system:    payment_system,
            order_id:          order_id
          },
          beforeSend: function( xhr ) {
            $("#credit_signing_repeat_button").hide();
            credit.hide_errors();
          },
          success: function(response) {
            var c = JSON.parse(response);
            credit.set_status_credit(c.status);
            $("#sms_code").prop( "disabled", false );
            if(c.error){
              $("#credit_signing_repeat_button").show();
              if(c.status == "signing"){
                credit.show_error(c.discription);
              }else{
                credit.showTemplateCredit(c.status, payment_system );
              }
            }else{
              if(c.status == "signing"){
                $("#request_sms_code_discription").text(c.discription);
                credit.timer_show();
              }else{
                credit.showTemplateCredit(c.status, payment_system );
              }
            }
          }
        });
    },
    showTemplateCredit: function(status, payment_system_id){
      $(".credit_"+payment_system_id).children().toArray().forEach(function(item){
        $("#"+item.id).hide();
      });

      credit.hide_errors();
      credit.status = status;
      switch (status) {
      case 'info':
          $("#credit_info_"+payment_system_id).show();
          this.GetInfoAboutCredit(payment_system_id,'RUR');
          break
      case 'process':
          this.RequestForApprovalOfAgreementCredit()
          break
      case 'signing':
          $("#credit_signing_"+payment_system_id).click();
          $("#popup_credit_signing_"+payment_system_id).show();
          this.credit_send_sms_code();
          credit.timer_show();
          break
      case 'canceled':
          $("#credit_canceled_"+payment_system_id).click();
          $("#popup_credit_canceled_"+payment_system_id).show();
          break
      case 'verification':
          $("#popup_credit_signing_"+payment_system_id).hide();
          $("#credit_verification_"+payment_system_id).show();
          if($('#credit_form').attr('id') == undefined ){$("#footer").append(window.credit_form);}
          $('#credit_form').submit();
          if(!credit.start_obtaining){
            setTimeout(credit.obtaining_the_status_of_book, credit.fibonacci(9)*1000);
            //setTimeout("$('#credit_verification_button_block').removeClass('hidden')", 30000);
            setTimeout(credit.cancel, 30*60*1000);
            $( "#credit_verification_button" ).on( "click", function(ev) {
              ev.preventDefault();
              $('#credit_form').submit();
            });
          }
          break
      default:
        alert('Я таких значений не знаю <status>')
      }
    },
    ConfirmationOfCodeCredit: function(){
      var code           = $("#sms_code").val()
      var payment_system = Hub.dispatcher.getManager('payment').getActivePaymentSystem().getId();
      var order_id       = $("[name=order_id]").val();
      var service        = $("[name=service]").val();
      var label          = $("label[for='checkbox-confirm2']");
      var sms_code       = $("#sms_code");

      if(!$("#popup_credit_signing_"+payment_system).find(".icheckbox_minimal").hasClass("checked")){
        label.find('.error').show();
        return;
      }else{
        label.find('.error').hide();
      };

      if(!code.length){
        sms_code.addClass("error");
        sms_code.tooltip().tooltip("open");
        return;
      }else{
        sms_code.removeClass('error');
      };

      $.ajax({
        url: '/credit/confirmation_of_code',
        type: 'post',
        data:  {
          code:           code,
          payment_system: payment_system,
          order_id:       order_id,
          service:        service
        },
        beforeSend: function( xhr ) {
          credit.timer_hide();
          credit.hide_errors();
          $('.sms-popup').append($('<div id="sms_prepared_credit_loader" class="filter_loader_bg"><img alt="" src="/img/preloader_loader2.gif" /></div>'));
          $("#sms_prepared_credit_loader").show();
        },
        success: function(response) {
          $("#sms_prepared_credit_loader").remove();
          var c = JSON.parse(response);
          if(c.error == true){
            credit.show_error(c.discription);
            $("#credit_signing_repeat_button").show();
          }else{
            if(c.status == "verification"){
              window.credit_form = c.result;
            }
          }
          credit.set_status_credit(c.status);
          if(c.status != "signing"){
            $.magnificPopup.close();
            credit.showTemplateCredit(c.status, payment_system );
          }
        },
        error: function(){
          $("#sms_prepared_credit_loader").remove();
        }
      });
    },
    credit_hide: function(){
      $(".credit").children().toArray().forEach(function(item){
        $("."+item.className).hide();
      });
    },
    RequestForApprovalOfAgreementCredit: function(){
      var payment_system_id = Hub.dispatcher.getManager('payment').getActivePaymentSystem().getId();
      var data  ={
        'payment_system': payment_system_id,
        'order_id'      : $("[name=order_id]").val(),
        'service'       : $("[name=service]").val()
      }
      var url = '/credit/request_for_approval_of_agreement';
      if(credit.status=="process"){
        $.ajax({
          url: url,
          type: 'post',
          data:  data,
          beforeSend: function() {
            $('body').append($('<div id="prepared_credit_loader" class="filter_loader_bg"><img alt="" src="/img/preloader_loader2.gif" /></div>'));
            $("#prepared_credit_loader").show();
          },
          success: function(response) {
            $("#prepared_credit_loader").remove();
            var c = JSON.parse(response);
            if(c.error == false){
               $('#doc_url').attr('href', c.result);
            }else{
              $('.credit-popup>.alert-text').append("<p>"+ c.result +"</p>")
            }
            credit.showTemplateCredit(c.status, payment_system_id);
          },
          error: function(){
            $("#prepared_credit_loader").remove();
          }
        });
      }else{
        credit.showTemplateCredit("canceled", payment_system_id);
      }

    },
    GetInfoAboutCredit: function(ps_id, currency){
      // setTimeout(function(){
        var cost = Hub.dispatcher.getManager('payment').getFullPrice();
        var loan_amount = (typeof(cost) == 'undefined') ? clear_cost : cost ;
        var service;
        var currency;
        if(typeof(loan_amount) != 'undefined'){
          $.ajax({
            url: '/credit/get_info',
            type: 'post',
            data:  {
              loan_amount: loan_amount,
              service:        "avia",
              currency:       currency,
              payment_system: ps_id,
            } ,
            success: function(response) {
              if(response == 'null' ){
                    console.log("response - null");
              } else {
                var o = JSON.parse(response).result;
                $('#loan_amount').text(loan_amount);
                $('#loan_days').text(o.days);
                $('#loan_grace_period_days').text(o.grace_period_days);
                $('#loan_amount_interval').text(o.amount_interval.toFixed(2));
                $('#loan_percent_after_grace_period').text(o.percent_after_grace_period);
              }
            }
        });
        }else{
          console.log("error - loan_amount");
        }
      // },100);
    },
    cancel:function(){
      var payment_system_id = $("[data-auto-controller=PaymentController]").controller().cost.getActivePaymentSystem().id;
      var data  ={
        'payment_system': payment_system_id,
        'order_id'      : $("[name=order_id]").val(),
        'service'       : $("[name=service]").val(),
        'id'            : credit.id
      }
      if(credit.status=="verification"){
        $.ajax({
          url: '/credit/cancel',
          type: 'post',
          data:  data,
          success: function(response) {
            $('.credit-popup>.alert-text').append("<p>Время на верификацию карты истекло</p>")
            credit.showTemplateCredit("canceled", payment_system_id);
          }
        });
      }
    }


  }


}); //document ready
