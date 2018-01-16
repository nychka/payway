(function($){
    $.ajaxformbar = function(e, o){
        this.options = $.extend({
            text: '',
            id:  0,
            dataType: 'json',
            loaders: [],
            set_html: true,
            type: 'post',
            start: 1,
            step: 0.3,
            line_loader:true,
            limit: 100,
            load_time: 100,
            data:{'def_param': 1},
            startSpeed: 200,
            endSpeed: 5,
            autohide:true,
            loader_type:'line_top',
            hide_on_success: true,
            success_tag: 'status',
            loader_position:'body',
            beforeSend: function(){},
            success: function(){},
            after: function(){},
            error: function(){},
            /* init JQuery validate (false - for disable)*/
            validator: {
                ignore: "",
                onkeyup: false,
                onfocusout: false,
                focusCleanup: true,
                focusInvalid: false,
                minlength:3,
                errorElement: "samp"
            },
            logErrors: false,
            showAjaxFormErrors: false
        }, o || {});

        this.el = $(e);
        this.progress_status = 0;
        this.interval = null;
        this.init();
    };
    // LOADER TYPES = line_bottom | line_top | circle_big | circle_small | preloader_light | globus | pug

    $.ajaxformbar.prototype = {
        init: function(){
            var self = this;
            if(this.options.set_html){
                this["_" + this.options.loader_type + "_init"]();
            }
            if (this.options.validator !== false) {
                $.extend($.validator.messages, validation_errors);
                this.el.validate(this.options.validator);
            }
            this.el.bind('submit.progressbar',function(e){
                e.preventDefault();
                var url  = self.el.attr('action') || self.options.url;
                var data = self.el.serialize() || self.options.data;
                if (self.options.validator !== false) {
                    if (!self.el.valid()) {
                        if (self.options.validator.errorElement) {
                            self.el.find(self.options.validator.errorElement + ':visible').not(":eq(0)").hide();
                        }
                        self._logErrors();
                        return false;
                    }
                }
                self._send_ajax(url,data);
            });
            this.html = new Array(this.save_wrap, this.save_shadow);
        },
        _send_ajax: function(url,data){
            var self = this;
            $.ajaxPrefilter(function( options, originalOptions, jqXHR ) {

                if(typeof(window.csrf_token) != 'undefined'){
                    var post_params = $.parseParams(options.data);
                    if(typeof(post_params.csrf_token) == 'undefined' || post_params.csrf_token.length == 0){
                      post_params.csrf_token = window.csrf_token;
                    }
                    var res = [];
                    $.each(post_params,function(k,v){
                      res.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
                    });
                    options.data = res.join('&');
                }

                if(options.crossDomain){
                    options.url = options.url.replace(options.url.split("/")[2],window.location.host);
                    jqXHR.setRequestHeader('X-Requested-With','XMLHttpRequest');
                }
            });
            this.ajax_loader = $.ajax({
                url: url,
                type: self.options.type,
                dataType: self.options.dataType,
                data: data,
                beforeSend: function(jqXHR, settings){
                    var status = self.options.beforeSend.apply(self.el,[jqXHR, settings]);
                    if (status !== false) {
                        self._show();
                    }
                    return status;
                },
                success: function(response, textStatus, jqXHR){
                    self._hide(textStatus, response);
                    self.options.success.apply(self.el,[response, textStatus, jqXHR]);
                },
                complete : function(response,status){
                    var resp = (status !== "success" ? {success:false} : JSON.parse(response.responseText));
//                    self._hide(status, resp);
                    if (self.options.showAjaxFormErrors) {
                        self._showFormErrors(resp);
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    self._hide(false,{success:false});
                    self.options.error.apply(self.el,[xhr, ajaxOptions, thrownError]);
                }
            });
        },
        _showFormErrors: function(response) {
            if (this.options.validator !== false) {
                if (typeof(response.success) !== 'undefined' && typeof(response.errors) !== 'undefined') {
                    if (!response.success && Object.keys(response.errors).length > 0) {
                        var validator = this.el.validate(), errors = {}, self = this;
                        $.each(response.errors, function(id, text) {
                            var el = self.el.find("#" + id);
                            errors[el.prop('name')] = text;
                        });
                        validator.showErrors(errors);
                    }
                }
                if (this.options.validator.errorElement) {
                    this.el.find(this.options.validator.errorElement + ':visible').not(":eq(0)").hide();
                }
//                $('samp').not(":eq(0)").hide();
            }
        },
        resetForm: function() {
            if (this.options.validator !== false) {
                var validator = this.el.validate();
                validator.resetForm();
            }
            this.el.trigger('reset');
        },
        _show: function(){
            if(this.options.set_html){
                this.save_shadow.show();
                if (this.save_wrap.length) {
                    this.save_wrap.show();
                }
                this["_show_"+this.options.loader_type]();
            }
        },
        _hide: function(status, response){
            if(this.options.set_html){
                this["_hide_"+this.options.loader_type](response);
            }
        },
        _line_top_init:function(){
            this.save_shadow = $('<div class="line_loader_bg"/>');
            this.save_wrap   = $('<div class="line_loader"><div class="line_loader_end"></div></div>');
            var append_block = this._get_loader_position();
            if (append_block.length) {
                append_block.append(
                    this.save_shadow.append(this.save_wrap)
                );
                this.save_wrap.css('width',this.options.start+'%');
            }
        },
        _line_bottom_init:function(){
            this.save_shadow    = $('<div class="save_shadow"/>');
            this.save_wrap      = $('<div class="save_wrap"><span class="save_wrap_text">'+this.options.text+'</div>');
            this.save_bar       = $('<div class="save_bar"></div>');
            var append_block = this._get_loader_position();
            if (append_block.length) {
                append_block.append(
                    this.save_shadow,
                    this.save_wrap.append(this.save_bar)
                );
                this.save_bar.css('width',this.options.start+'%');
            }
        },
        _globus_init:function(){
            this.save_shadow = $('<div class="globus-loader" style="display: none"></div>');
            this.save_wrap = $('<img src="/img/loader_ins-big.gif"><img src="/img/globus.png" class="globus_img">');
            var append_block = this._get_loader_position();
            if (append_block.length) {
                append_block.append(
                    this.save_shadow.append(this.save_wrap)
                );
            }
        },
        _pug_init:function(){
            this.save_shadow = $('<div class="loader-overlay js-loader-pug" style="display: none"/>');
            this.save_wrap = $('<div class="loader loader--m"><div class="loader__title">' + this.options.text + '</div><img src="/img/events_pug.gif" class="loader__pug"></div>');
            var append_block = this._get_loader_position();
            if (append_block.length) {
                append_block.append(
                    this.save_shadow.append(this.save_wrap)
                );
            }
        },
        _circle_big_init:function(){
            this.save_shadow = $('<div class="big-preloader__overlay" style="display: none"/>');
            this.save_wrap = $('<div class="big-preloader"><div class="big-preloader__place"></div></div>');
            this.save_bar = $('<div class="big-preloader__text">' + this.options.text + '</div>');
            var append_block = this._get_loader_position();
            if (append_block.length) {
                append_block.append(
                    this.save_shadow.append(this.save_wrap.prepend(this.save_bar))
                );
            }
        },
        _circle_small_init:function(){
            this.save_shadow = $('<div class="filter_loader_bg"/>');
            this.save_wrap = $('<img alt="" src="/img/preloader_loader2.gif" />');
            var append_block = this._get_loader_position();
            if (append_block.length) {
                append_block.append(
                    this.save_shadow.append(this.save_wrap)
                );
            }
        },
        _preloader_light_init: function(){
            this.save_shadow = $('<div class="preloader_light" style="display: none"><span>' + this.options.text + '</span></div>');
            this.save_wrap = '';
            var append_block = this._get_loader_position();
            if (append_block.length && append_block.children('.preloader_light').length === 0) {
                append_block.append(
                    this.save_shadow
                );
            } else if (append_block.find('.preloader_light').length !== 0) {
                this.save_shadow = append_block.find('.preloader_light');
            }
        },
        _show_preloader_light: function(){
        },
        _show_line_top:function(){
            var self = this;
            self.save_wrap.css("width",self.options.start + "%");
            self.interval = self.save_wrap.stop().animate({
                width: "100%"
            },self.options.load_time * 1000,function(){
                self.ajax_loader.abort();
                self.save_shadow.hide();
                self.save_wrap.hide();
            });
        },
        _show_line_bottom:function(){
            var self = this;
            self.save_bar.css("width",self.options.start + "%");
            self.interval = self.save_bar.stop().animate({
                width: "100%"
            },self.options.load_time * 1000,function(){
                self.ajax_loader.abort();
                self.save_shadow.hide();
                self.save_wrap.hide();
            });
        },
        _hide_preloader_light: function(response){
            if((!this.options.hide_on_success && !response.success) ||  this.options.hide_on_success || (!this.options.hide_on_success && response[this.options.success_tag] !== true) ){
                this.save_shadow.hide();
                this.ajax_loader.abort();
            }
        },
        _hide_line_top:function(response){
            var self = this;
            this.save_wrap.stop();
            self.interval = self.save_wrap.animate({
                width: "100%"
            }, 500, function(){
                  if((!self.options.hide_on_success && !response.success) || self.options.hide_on_success || (!self.options.hide_on_success && response[self.options.success_tag] !== true) ){
                      self.save_shadow.hide();
                      self.save_wrap.hide();
                  }
            });
        },
        _hide_line_bottom:function(response){
            var self = this;
            this.save_bar.stop();
            self.interval = self.save_bar.animate({
                width: "100%"
            }, 500, function(){
                if((!self.options.hide_on_success && !response.success) ||  self.options.hide_on_success || (!self.options.hide_on_success && response[self.options.success_tag] !== true) ){
                    self.save_shadow.hide();
                    self.save_wrap.hide();
                }
            });
        },
        _show_globus:function(){

        },
        _hide_globus:function(response){
            if((!this.options.hide_on_success && !response.success) ||  this.options.hide_on_success || (!this.options.hide_on_success && response[this.options.success_tag] !== true) ) {
                this.save_shadow.remove();
                this.save_wrap.remove();
            }
        },
        _show_pug:function(){

        },
        _hide_pug:function(response){
            if((!this.options.hide_on_success && !response.success) ||  this.options.hide_on_success || (!this.options.hide_on_success && response[this.options.success_tag] !== true) ){
                this.save_shadow.hide();
                this.save_wrap.hide();
                this.ajax_loader.abort();
           }
        },
        _show_circle_big:function(){
        },
        _show_circle_small:function(){
        },
        _hide_circle_big:function(response){
            if((!this.options.hide_on_success && !response.success) ||  this.options.hide_on_success || (!this.options.hide_on_success && response[this.options.success_tag] !== true) ){
                this.save_shadow.hide();
                this.save_wrap.hide();
                this.ajax_loader.abort();
           }
        },
        _hide_circle_small:function(response){
            if((!this.options.hide_on_success && !response.success) ||  this.options.hide_on_success || (!this.options.hide_on_success && response[this.options.success_tag] !== true) ){
                this.save_shadow.hide();
                this.save_wrap.hide();
                this.ajax_loader.abort();
            }
        },
        _get_loader_position: function(){
            var append_block = this.el;
            if (this.options.loader_position !== false) {
                if (typeof(this.options.loader_position) === 'string') {
                    append_block = $(this.options.loader_position);
                } else {
                    append_block = this.options.loader_position;
                }
            }
            return append_block;
        },
        _logErrors: function(){
            if (this.options.logErrors !== false && this.options.validator !== false) {
                var lst = {}, escaped_fields = ['card_number', 'card_date', 'card_cvv', 'card_holder'];
                $.each(this.el.validate().errorList, function(index, el){ lst[ $(el['element']).attr('name') ] = el['message'] + '|' + prepare_el_value_for_log($(el['element']), escaped_fields); });
                log_error(JSON.stringify(lst), ((typeof(session_id)!="undefined" ? session_id : "")||''), '', this.options.logErrors);
            }
        },
        submit: function() {
            this.el.submit();
        },
        destroy: function() {
            $.removeData(this.el.get(0));
            this.el.off('ajaxformbar');
            this.el.unbind('.' + 'ajaxformbar');
            this.el.off('submit.progressbar');
            this.el.unbind('submit.progressbar');
        }
    };

    $.fn.ajaxformbar = function(o){
        var instance;
        this.each(function() {
            instance = $(this).data('ajaxformbar');
            if (typeof instance === 'undefined') {
                instance = new $.ajaxformbar(this, o);
                $(this).data('ajaxformbar', instance);
            }
        });
        return instance;
    };
})(jQuery);
