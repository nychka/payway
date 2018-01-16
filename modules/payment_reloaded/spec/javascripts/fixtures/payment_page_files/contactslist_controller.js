$.Controller("ContactsListController", {
  init:function(){
    this.feedback_block = this.element.find(".js-feedback_popup");
    this.form_footer = this.element;
    this.init_form();
    this.init_height();
    this.initChosen();
    $.each( $( '.tooltip-btn' ), function(){
      new CallTooltip( $( this ) );
    } );
    $(document).ready(function(){
      if (typeof TextFieldTranslitFilter != "undefined") TextFieldTranslitFilter.add(".js-feedback_popup from");
    });
  },
  /*".js-phone-block -> change":function(ev){
   this.element.find(".phone_descr").hide();
   this.element.find(".phone_descr:eq(" + $(ev.target).val() + ")").show();
   },*/
  init_height:function(){
    var tooltipHeight = this.feedback_block.innerHeight(),
      tooltipWidth = this.feedback_block.innerWidth(),
      btnHeight = this.feedback_block.innerHeight(),
      btnWidth = this.feedback_block.innerWidth();
    if (this.feedback_block.hasClass('tooltip_top')) {
      this.feedback_block.css({
        "left":(btnWidth-tooltipWidth)/2,
        "top": -tooltipHeight-20
      });
    } else if (this.feedback_block.hasClass('tooltip_bottom')) {
      this.feedback_block.css({
        "left":(btnWidth-tooltipWidth)/2,
        "bottom": -tooltipHeight-20
      });
    } else if (this.feedback_block.hasClass('tooltip_left')) {
      this.feedback_block.css({
        "left":-tooltipWidth-20 ,
        "top": (btnHeight-tooltipHeight)/2
      });
    } else if (this.feedback_block.hasClass('tooltip_right')) {
      this.feedback_block.css({
        "right":-tooltipWidth-20 ,
        "top": (btnHeight-tooltipHeight)/2
      });
    }
  },
  init_form: function(){
    var self = this;
    this.form_footer.find("form").ajaxformbar({
      success:function(resp){
        if (resp.success) {
          self.success();
        }
      },
      error:function(){
        message('msg_title', I18n.server_error, 'continue_button', window.close_message);
      },
      validator: {
        ignore: "",
        onkeyup: false,
        onfocusout: false,
        focusCleanup: true,
        focusInvalid: false,
        minlength:3,
        errorElement: "samp"
      },
      showAjaxFormErrors: true,
      loader_type: 'preloader_light',
      loader_position: false
    });
  },
  success:function(){
    this.form_footer.find('.js-close').click();
    message('msg_title', I18n.feedback_added, 'continue_button', window.close_message);
  },

  initChosen:function(){
    var config = {
      '.chosen-select'           : {},
      '.chosen-select-deselect'  : {allow_single_deselect:true},
      '.chosen-select-no-search' : {disable_search: true},
      '.chosen-select-no-results': {no_results_text:window.I18n.selectivity.no_results_for_term},
      '.chosen-select-width'     : {width:"95%"}
    }
    if ( !!this.element.find('select').selectbox ) {
      this.element.find('select').selectbox('detach').hide();
    }
    for (var selector in config) {
      this.element.find(selector).chosen(config[selector]);
    }
  }
});

var CallTooltip = function( obj ){
  this.obj = obj;
  this.init();

};

CallTooltip.prototype = {
  init: function(){
    var self = this;
    self.core = self.core();
    self.core.build();
  },
  core: function(){
    var self = this;
    return {
      build: function(){
        self.core.declareVariables();
        self.core.controls();
      },
      declareVariables: function (){
        self.tooltip = self.obj.next();
        self.body = $('body');
        self.btnClose = $(".js-close");
        self.asap_callback = $('#call_urgently');
      },
      controls: function(){
        self.obj.on ({
          click: function(){
            self.core.displayBlock();
            self.core.tooltipPosition();
            var dropBlock = self.obj.parent().find('.js-dropdown');
            if( !!dropBlock ) { dropBlock.removeClass('active'); }; //hide footer dropdown menu
            return false;
          }
        });
        self.btnClose.on ({
          click: function(){
            self.core.displayNone();
            return false;
          }
        });
        self.body.on ({
          click: function(){
            if( $('.tooltip_top:visible').length ){
              self.core.displayNone();
              return false;
            }
          }
        });
        self.tooltip.on({
          click: function (event){
            event = event || window.event;
            if (event.stopPropagation) {
              event.stopPropagation()
            } else {
              event.cancelBubble = true
            }
          }
        });
        self.asap_callback.on({
          change: function(event){
            if( !$('#call_urgently:checked').length  ){
              $('.time_select').hide()
            } else {
              $('.time_select').show();
            }
            self.core.tooltipPosition();
          }
        })
      },
      displayBlock: function(){
        self.tooltip.fadeIn(200);
      },
      displayNone: function(){
        self.tooltip.fadeOut(200);
      },
      tooltipPosition: function (){
        var tooltipHeight = self.tooltip.innerHeight(),
          tooltipWidth = self.tooltip.innerWidth(),
          btnHeight = self.obj.innerHeight(),
          btnWidth = self.obj.innerWidth();
        if(self.tooltip.hasClass('tooltip_top')){
          self.tooltip.css({
            "left":(btnWidth-tooltipWidth)/2,
            "top": -tooltipHeight-20
          });
        }else if(self.tooltip.hasClass('tooltip_bottom')){
          self.tooltip.css({
            "left":(btnWidth-tooltipWidth)/2,
            "bottom": -tooltipHeight-20
          });
        }else if(self.tooltip.hasClass('tooltip_left')){
          self.tooltip.css({
            "left":-tooltipWidth-20 ,
            "top": (btnHeight-tooltipHeight)/2
          });
        }else if(self.tooltip.hasClass('tooltip_right')){
          self.tooltip.css({
            "right":-tooltipWidth-20 ,
            "top": (btnHeight-tooltipHeight)/2
          });
        }
      }
    };
  }
};
