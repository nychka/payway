$.Controller("HeaderController",{
  init:function(){
    var _self  = this;

    _self.header_choser();
    _self.header_select();
    _self.header_notification();

    $(window).on('resize', function(){
      _self.headerResize();
    });
    $(document).ready(function(){
      _self.update_chosen_single_class(_self.element.find("[name='country_changer']"));
      typeof $().selectbox === 'function' ? _self.element.find('.ignore-selectbox').selectbox('detach').hide() : ''; //desable selectbox
    });
  },
  "update_chosen_single_class": function(el){
    var el = el;
    var el_id = el.attr('id');
    var el_chosen_single = this.element.find('#'+el_id+'_chosen a.chosen-single');
    el_chosen_single.removeAttr('class').addClass('chosen-single icon-'+el.val());
  },
  "header_select": function(){
    var select = this.element.find('.js-chosen-select');
    typeof $.fn.chosen != 'undefined' ? select.chosen() : '';
  },
  "header_choser": function(){
    var _self    = this;
    var body     = $('body');
    var lang     = _self.element.find('.js-header-choser');
    var langicur = _self.element.find('a').is('.js-current-lang');
    var langcur  = _self.element.find('#current-lang');
    langcur.on('click', function(ev){
      ev.preventDefault();
      $(this).toggleClass('active').parent().find(lang).toggle();
    });
    body.on('click', function(ev){
      var _self = $(ev.target);
      var _options = _self.is(lang) || _self.is(lang.find('*')) || _self.is(langcur) || _self.is(langcur.find('*'));
      !_options ? lang.removeAttr('style').parent().find(langcur).removeClass('active') : '';
    });
    lang.find('li').on('click', function(){
      $(window).unbind('beforeunload');
    });
  },
  "headerResize": function(){
    var headerNav = this.element.find('.js-header_nav');
    headerNav.removeAttr('style');
  },
  "loader": function(el, condition){
    var check = condition;
    var el = !!el ? el : $('body');
    var loader = $('<div class="loader-thin js-loader"></div>');
    !!check ? el.append(loader) : el.find('.js-loader').remove();
  },
  ".js-header-submit -> click":function(ev){
    this.loader(this.element.find('.js-country-choser'), true);
    var self = this;
    setTimeout(function(){
      self.loader(self.element.find('.js-country-choser'), false);
      self.element.find('.js-lang-item').removeClass('active');
      self.element.find('.js-header-choser').removeAttr('style');
    }, 500);
  },
  ".js-header_toggle -> click":function(ev){
    ev.preventDefault();
    this.element.find('.js-header_nav').slideToggle(300);
  },
  ".js-bla-bla-click -> click": function( ev ){
    var el = $(ev.target);
    this.track( el.data("url") )
  },
  track: function( url ){
    $.ajax({ url: url });
  },
  "header_notification": function(){
    var _self = this;
    var body = $('body');
    var showBtn = _self.element.find('.js-notifications-show');
    var wrapper = _self.element.find('.js-notifications');
    var content = _self.element.find('.js-notifications-content');
    var checkOllBtn = _self.element.find('.js-notifications-check-all');
    var notificationItem = _self.element.find('li.js-notifications-item');
    var notificationUrl = _self.element.find('li.js-notifications-item a');
    var checkThisBtn = _self.element.find('.js-notifications-check-this');

    wrapper.on('click', function(ev){
      ev.stopPropagation();
    });
    showBtn.on('click', function(){
      content.slideDown().addClass('open');
    });
    body.on('click', function(){
      content.hasClass('open') ? content.slideUp().removeClass('open') : '';
    });

    notificationItem.on('click', function(ev){
      notificationClick($(this), ev, 'header');
    });

    checkOllBtn.on('click', function(ev){
      notificationItem.hasClass('notifications_not-readed') ? notificationItem.removeClass('notifications_not-readed') : '';
      $.ajax({ url: $(this).data('url') });
      $('.js-notifications-count').remove();
    });
  },
  "[name='country_changer'] -> change":function(ev){
    var target = $(ev.target);
    var val = target.val();
    var submit = this.element.find('.js-header-submit');
    var lang = this.element.find('[name="language_changer"]');
    var url = '';
    this.update_chosen_single_class(target);
    lang.find('option').remove();
    url = allowed_projects[val].domain;
    for (var item in allowed_projects[val].language){
      var el = allowed_projects[val].language[item];
      lang.append('<option value="'+el.locale.substring(0, 2)+'">'+el.name+'</option>')
    }
    lang.chosen().trigger("chosen:updated");
    submit.attr('href', window.location.protocol + '//' + url).attr('data-href', window.location.protocol + '//' + url +'/');
  },
  "[name='language_changer'] -> change":function(ev){
    var target = $(ev.target);
    var submit = this.element.find('.js-header-submit');
    var url = target.val();
    var dataUrl = submit.attr('data-href');
    submit.attr('href', dataUrl + url);
  }
});