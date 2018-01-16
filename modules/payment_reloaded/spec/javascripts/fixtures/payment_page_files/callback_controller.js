$.Controller("CallbackController",{
  init:function(){
    this.callback_block = this.element.find(".callback_popup");
    this.setup_validation();
    this.check_now();
  },

  ".callback -> click":function(ev){
    ev.preventDefault();
    if($(ev.target).parents(".callback_popup").size()<1)
      this.callback_block.show()
  },

  "#call_close -> click":function(ev){
    ev.preventDefault();
    this.callback_block.hide()
    this.callback_block.find("form input[type=text],form textarea").val("")
  },

  ".send.call -> click":function(ev){
    ev.preventDefault();
    if(this.callback_block.find("form").valid()){
      this.submit_form();
    }
  },

  setup_validation:function(){
    var self = this;
    this.callback_block.find("form").validate({
      ignore: "",
      highlight: function(el, e_cls) {
        $(el).addClass(e_cls);
      },
      unhighlight: function(el, e_cls) {
        $(el).removeClass(e_cls);
        self.rm_tooltip($(el));
      },
      errorPlacement: function(err,el) {
      },
      onkeyup: false,
      onfocusout: false,
      focusCleanup: true,
      focusInvalid: false,
      minlength:3
    });
  },

  check_now:function(){
    var self = this;
    this.callback_block.find('.urgently').on('ifChecked', function(ev) {
      self.callback_block.find('.time_select').hide();  

    });
    this.callback_block.find('.urgently').on('ifUnchecked', function(ev) {
      self.callback_block.find('.time_select').show();
    });  
  },

  submit_form:function(){
    var self = this
    var form = this.callback_block.find("form")
    $.ajax({
      url: form.attr("action"),
      data:form.serialize(),
      type:"post",
      dataType:"json",
      beforeSend:function(){
        self.set_loader();
      },
      success:function(resp){
        if(resp.success){
          self.success()
        }
        else{
          self.failed(resp.errors,form)
        }
      },
      error:function(){
        message('msg_title', I18n.server_error, 'continue_button', window.close_message);
      },
    })
  },

  success:function(){
    this.hide_loader();
    this.callback_block.find("form input[type=email],form textarea").val("")
    this.callback_block.hide()
    message('msg_title', I18n.callback_added, 'continue_button', window.close_message);
  },

  failed:function(data,form){
    var self = this
    this.hide_loader();
    $.each(data,function(id,text){
      var el = form.find("#" + id)
      el.addClass("error");
      var idx  = form.find("input").index(el);
      window.show_error_popup(el,text,idx,true);
    })
  },

  set_loader:function(){
    this.element.find(".callback_loader").show()
  },

  hide_loader:function(){
    this.element.find(".callback_loader").hide()    
  },

  rm_tooltip:function(el){
    var idx = el.parents("form").find("input").index(el);
    window.hide_error_popup(idx)
  },

  ".only_numbers -> keyup":function(ev){
    el = $(ev.target)
    el.val(el.val().replace(/[^0-9\.]/g,''));
  },
    
});
