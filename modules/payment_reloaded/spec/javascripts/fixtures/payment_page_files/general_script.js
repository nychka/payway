var logged_erros = {};
var MAX_LOGGED_ERROR_COUNT = 10
window.onerror = function (msg, url, lineNo, columnNo, err) {
    var token;
    if (typeof(msg) === 'object' && msg.srcElement && msg.target) {
      if(msg.srcElement == '[object HTMLScriptElement]' && msg.target == '[object HTMLScriptElement]'){
          msg = 'Error loading script' + msg.src;
      }else{
          msg = 'Event Error - target:' + msg.target + ' srcElement:' + msg.srcElement;
      }
    }

    var error = {
      message: msg.toLowerCase(),
      error: err,
      script: url,
      line: lineNo,
      col: columnNo
    }
    error = JSON.stringify(error)
    if(!logged_erros[error]){
      logged_erros[error] = 0;
    }
    logged_erros[error] += 1;
    if(logged_erros[error] > MAX_LOGGED_ERROR_COUNT){
      return;
    }
    // token = $.cookie("extended_user_token").replace(/[^0-9]/gi,'');
    token = token ? token : ((typeof(session_id)!="undefined" ? session_id : "")||'')
    window.log_error(error, token , (window.location.pathname) , 955);

}

var keys = [38, 40];

function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
      e.preventDefault();
  e.returnValue = false;
}

function keydown(e) {
    for (var i = keys.length; i--;) {
        if (e.keyCode === keys[i]) {
            preventDefault(e);
            return;
        }
    }
}
function wheel(e) {
  preventDefault(e);
}

function disable_scroll() {
  if (window.addEventListener) {
      window.addEventListener('DOMMouseScroll', wheel, false);
  }
  window.onmousewheel = document.onmousewheel = wheel;
  document.onkeydown = keydown;
  window.scroll_is_disabled = true;
}

function enable_scroll() {
    if (window.removeEventListener) {
        window.removeEventListener('DOMMouseScroll', wheel, false);
    }
    window.onmousewheel = document.onmousewheel = document.onkeydown = null;
    window.scroll_is_disabled = false;
}

function openNewBackgroundTab(url){
    var a = document.createElement("a");
    a.href = url;
    var evt = document.createEvent("MouseEvents");
    //the tenth parameter of initMouseEvent sets ctrl key
    evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0,
                                true, false, false, false, 0, null);
    a.dispatchEvent(evt);
}

if (!window.location.origin) {
  window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
}

window.is_mobile = (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i).test(navigator.userAgent.toLowerCase());

window.is_IE = ( /(MSIE|Trident\/|Edge\/)/i.test(navigator.userAgent) );

window.show_info_popup = function() {}
window.show_error_popup = function(){}
window.hide_error_popup = function(){}

window.hide_info_popup = function() {
  $('.b_errors').hide();
  $('.errors_block').show();
};
window.enable_popups = function(){
  $('*[data-popup-info]').each(function(i, k) {
    var el;
    el = $(this);
    el.focus(function(ev) {
      window.show_info_popup(el, el.data('popup-info'), true);
    });
    el.blur(function(ev) {
      window.hide_info_popup();
    });
    if(window.cur_domain == 'avia'){
      el.keyup(function(ev) {
        if($(ev.target).val().length > 0) window.hide_info_popup();
      });
    }
  });
};
window.show_login = function(){}
window.hide_login = function(){}
window.enable_input_plugin = function(element){}
window.disable_input_plugin = function(element){}

window.loaded_social_scripts = new Array(); // list of already loaded scripts

/**
 * function setup_social_load ( required_scripts )
 *
 * supported scrips:
 *
 *  facebook
 *  vkontakte
 *  odnoklasniki
 *  google_plus
 *  yandex_share
 *  pinterest
 *  tweet_it
 *
 * */

window.setup_social_load = function( required_scripts ){
    if(  window.disable_social_load ){
        return;
    }

    // load only facedook by default
    if( Object.prototype.toString.call( required_scripts ) != "[object Array]" ) {
      required_scripts = [];
    }

    // if no scripts loaded, load facebook script
    if( window.loaded_social_scripts.length == 0  ){
        window.fb_scripts_loader();
        window.loaded_social_scripts = ['facebook'];
      }

    //exclude already loaded scripts
    for( i in window.loaded_social_scripts){
        idx =  required_scripts.indexOf( window.loaded_social_scripts[i] );
      if( idx !== -1 ){
        required_scripts.splice(idx, 1);
      }
    }

    if( required_scripts.length > 0 ){
      $.ajax({
            url: "/" + window.lang_prefix + "social_nets",
            type:"post",
            dataType:"json",
            data: {'scripts': required_scripts },
            success:function(resp){
              $("body").append(resp.view);
              window.loaded_social_scripts = required_scripts.concat( window.loaded_social_scripts );
            }
          });
    }
};

window.fb_scripts_loader = function(){
    var d = document, s = 'script', id = 'facebook-jssdk';
    var js, fjs = d.getElementsByTagName(s)[0];
    var FB_Locale = typeof(window.cur_locale ) == 'undefined' ? 'en_US' : window.cur_locale;
    var FB_Application_ID = typeof(FBappId) == 'undefined' ? '' : FBappId;

    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = location.protocol + "//connect.facebook.net/" + FB_Locale + "/all.js#xfbml=1&appId=" + FB_Application_ID ;
    js.async = true;
    js.onload = js.onreadystatechange = function () {
        if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") {
          if (!this.executed) {
            this.executed = true;
            if( typeof window.fbAsyncInit != 'undefined' ){
                setTimeout(function () {
                    window.fbAsyncInit();
                }, 0);
            }
          }
    }};

    fjs.parentNode.insertBefore(js, fjs);
    ($.browser.safari) ? $('.fb-safari').show().prev('.fb-like-box').hide() : $('.fb-safari').hide();
};

window.track_resolution = function(){
  if( undefined == $.cookie("resolution_is_tracked") ){
    var resolution = String( window.screen.availWidth ) + "x" + String( window.screen.availHeight )
    window.klog( 1010, JSON.stringify({resolution: resolution}))
    $.cookie("resolution_is_tracked", true, {expires: 1})
  }
}


$(function() {
  /* Enable controllers for elements */
  $('*[data-auto-controller]').each(function() {
    var plg;
    var result;
    var controllers = $(this).data('auto-controller').split(" ");
    for (i = 0; i < controllers.length; ++i) {
      if (!$(this).controller() || ($(this).controller() && $(this).controller().parent.controllerName !== controllers[i]))  {
        if ((plg = $(this)['attach' + controllers[i]])) {
          result = plg.call($(this));
        }
      }
    }
    return result;
  });
  window.track_resolution()
});

window.check_cookies_enabled = function ()
{
  var enabled = (navigator.cookieEnabled) ? true : false;

  if (typeof navigator.cookieEnabled == "undefined" && !enabled)
  {
    document.cookie="testcookie";
    enabled = (document.cookie.indexOf("testcookie") != -1) ? true : false;
  }
  if(!enabled){
    message('msg_title', I18n.cookies_are_disabled, 'continue_button', window.close_message);
  }
};

window.show_error = function(text){
  alert(text);
};
window.close_message = function(){};

window.prepare_el_value_for_log = function(el, check_list_el_names) {
  var el_value = el.val(), el_spec = el.parents('.spec_container'), el_value_spec = [];
  if ($.inArray(el.attr('type'), ['checkbox']) != -1) { if (!el.is(':checked')) { el_value = ''; } }
  if (el_spec.length) { el_spec.find('input').each(function() { if ($(this).val()) { el_value_spec.push($(this).val()); }}); }
  if (el_value_spec.length) { el_value = el_value_spec.join('-'); }
  if (!$.isArray(check_list_el_names) || !check_list_el_names.length) return el_value;
  $.each(check_list_el_names, function(i, name) {
    regex_name = name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    if (el.attr('name').match(new RegExp(regex_name))) { el_value = '***'; return false; }
  });
  if(el.parents('.js-splited-date').find('input').length > 0) el_value = el.parents('.js-splited-date').find('input').map(function(k,inp){ return $(inp).val();}).toArray().join('.');
  return el_value;
};

window.log_error = function(msg, session_id, url, error_code){
  $.ajax({
    url: '/log_error',
    type: 'post',
    data:  {url: url, msg: msg, session_id: session_id, error_code: error_code, subdomain: window.cur_domain}
  });

};

window.klog = function(code, msg, session_id, url){
  session_id = session_id || ''
  url = url || ''
  $.ajax({
    url: '/klog',
    type: 'post',
    data:  {msg: msg, code: code, subdomain: window.cur_domain, session_id: session_id, url: window.location.href }
  });
};

  // JSON.stringify({ input: input.attr("name")})

window.on_clicks_klog = function(){
  window.clicks_klog = true;
  $('[data-ktracking]').each(function(e){
    var data = $(this).data('ktracking');
    if(typeof data === "object" && typeof data.event !== "undefined"){
      $(this).on(data.event, function(ev){
        if(!window.clicks_klog) return;
        var el = $(this),
            sdata = el.data('ktracking');
        if(typeof sdata === "object"){
          var params = {},
              def_params = {click_name:"unknown_click", subdomain: window.cur_domain, page_path: location.pathname};
          if(typeof data.params !== "undefined" && typeof data.params === "object") params = data.params;

          $.ajax({
            url: '/index/page_click_klog',
            type: 'post',
            data:  {code:2010, success:true, addl_params: encodeURIComponent(JSON.stringify(jQuery.extend(def_params, params)))}
          });
        }
      });
    }
  });
};

window.page_click_klog = function(code, breakpoint_name, breakpoint_desc, success, addl_params){
  $.ajax({
    url: '/index/page_click_klog',
    type: 'post',
    data:  {code:code, breakpoint_name:breakpoint_name, breakpoint_desc:breakpoint_desc, success:success, addl_params:addl_params }
  });
};


window.formatNumber = function(number, fixed){
  fixed = fixed || 0;
  return Math.max(0, Number(number.toString().replace(",","."))).toFixed(fixed).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ');
};

window.ceilNumber = function(number, fixed, formatted){
  fixed = fixed || 0;
  var sign = 1;
  if(number < 0){
    sign = -1;
    number *= sign;
  }
  number = (Math.floor(Math.max(0, Number(number.toString().replace(",","."))) * Math.pow(10,fixed) + 0.9999) / Math.pow(10,fixed));
  if(formatted){
    number = window.formatNumber(number,fixed);
    if(sign < 0) number = '-'+number;
  }else{
    number *= sign;
  }
  return number;
};

window.tracking = function (ri, rs, s, u, rd){
  dr=0;
  $.each(window.location.search.split('&'),function(x,y){ p = y.split('='); if(p[0] == 'refid'){ dr=1; return } })
  $.ajax({
    url: '/search/tracking',
    type: 'post',
    data:  {ri: ri, rs: rs, u:u, s:s, rd:rd, dr:dr},
    timeout: 1000
  });
}

jQuery.expr[':'].regex = function(elem, index, match) {
    var matchParams = match[3].split(','),
        validLabels = /^(data|css):/,
        attr = {
            method: matchParams[0].match(validLabels) ?
                        matchParams[0].split(':')[0] : 'attr',
            property: matchParams.shift().replace(validLabels,'')
        },
        regexFlags = 'ig',
        regex = new RegExp(matchParams.join('').replace(/^\s+|\s+$/g,''), regexFlags);
    return regex.test(jQuery(elem)[attr.method](attr.property));
}


window.getTranslitObject = function(){
  var general = {
    ś:"s",ć:"c",ę:"e",ą:"a",ó:"o",ż:"z",ź:"z",ł:"l",ń:"n",Ś:"S",Ć:"C",Ę:"E",Ą:"A",Ó:"O",Ż:"Z",Ź:"Z",Ł:"L",
    Ń:"N",Ş:"S",Ç:"C",Ğ:"G",Ö:"O",ş:"s",ç:"c",ğ:"g",ö:"o",ü:"u",Ü:'U',İ:"I",ı:"i",Ă:'A',ă:'a',Â:'A',â:'a',
    Ș:'S',ș:'s',Ț:'T',ț:'t',Ţ:'T',ţ:'t',é:"e",è:"e",à:"a",ù:"u",ê:"e",î:"i",ô:"o",û:"u",ë:"e",ï:"i",
    É:"E",À:"A",È:"E",Ù:"U",Ê:"E",Î:"I",Ô:"O",Û:"U",Ë:"E",Ï:"I" };
  var char_list = {};
  switch(window.custom_domain_translit){
    case 'de':
      char_list = $.extend({}, general, {ä:"ae",ü:"ue",ö:"oe",ß:"ss",Ä:"Ae",Ü:"Ue",Ö:"Oe",ẞ:"Ss"});
      break;
    case 'ee':
      //char_list = $.extend({}, general, {Ä:"Ae",ä:"ae",Ü:"Ue",ü:"ue",Ö:"Oe",ö:"oe",õ:"o",š:"s",ž:"z",Õ:"O",Š:"S",Ž:"Z"});
      char_list = $.extend({}, general, {ä:"a",ü:"u",ö:"o",õ:"o",š:"s",ž:"z",Ä:"A",Ü:"U",Ö:"O",Õ:"O",Š:"S",Ž:"Z"});
      break;
    //case 'pl':
    //  char_list = $.extend({}, general, {j:'i',J:'I',Ż:"Zh",ż:"zh",Ę:"En",ę:"en",Ą:"On",ą:"on",Sz:'Sh','sz':'sh','Gz':'Ghz',
    //                                     'gz':'ghz',Ch:'Kh',ch:'kh',Cz:'Ch',cz:'ch',Rz:'Zh',rz:'zh'});
      break;
    default:
      char_list = $.extend({}, general);
  }
  return char_list;
};


function setSelectionRange(input, selectionStart, selectionEnd) {
  if (input.setSelectionRange) {
    input.focus();
    input.setSelectionRange(selectionStart, selectionEnd);
  }
  else if (input.createTextRange) {
    var range = input.createTextRange();
    range.collapse(true);
    range.moveEnd('character', selectionEnd);
    range.moveStart('character', selectionStart);
    range.select();
  }
}

function setCaretToPos (input, pos) {
    setSelectionRange(input, pos, pos);
}

function notificationClick(element, ev, page){
  var action = '';
  if (ev.target.classList.value.split(' ').includes("js-mark-as-read")) {
    action =  page + '_mark_as_read';
  } else {
    action = page + '_' + ev.target.tagName + '_click';
    if(element.data('notification-url')!='#'){ window.open(element.data('notification-url'), '_blank') }
  }
  $.ajax({ url: element.data('click_url') + '/' + action });

  if(element.hasClass('notifications_not-readed')){
    element.removeClass('notifications_not-readed');
    var newCount = parseInt($('.js-notifications-count').html()) - 1;
    if (newCount > 0) {
      $('.js-notifications-count').html(newCount);
    } else {
      $('.js-notifications-count').remove();
    }
  }
} 