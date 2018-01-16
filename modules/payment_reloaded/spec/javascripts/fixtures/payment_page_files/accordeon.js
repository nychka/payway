/* 
 t.kumpanenko@gmail.com
 JQuery Accordion Plugin v 1.1
 */

 (function($) {

  var defaultSetting = {
    customClass: {
      openClass: 'accordion-open',
      headerClass: '',
      contentClass: ''
    },
    animation: {
      duration: 500
    },
    onLoad: 'allClose', //allClose, firstOpen, allOpen, '#id'
    onLoadError: 'allClose', //allClose, firstOpen, allOpen Якщо нема відкриваємо за id i отримуємо пустий обєкт
    onlyOneOpen: 'false'
  };

  var methods = {
    init: function(options) {
      var obj = this;
      var setting = $.extend(true, defaultSetting, options);

      $(obj).data('AccordionSetting', setting);
      var _openClass = $(obj).data('AccordionSetting').customClass.openClass;
      var _onLoad = String($(obj).data('AccordionSetting').onLoad);
      var _onLoadError = String($(obj).data('AccordionSetting').onLoadError);
      var $accordionContent = getParam(obj).content;
      var $accordionHeader = getParam(obj).header;
      
      switch (_onLoad) {
        case 'allClose':
        $accordionContent.hide();
        break;
        case 'firstOpen':
        $accordionContent.not(':first').hide();
        
        $(obj).filter(':first').addClass(_openClass);
        break;
        case 'allOpen':
        $accordionContent.show();
        break;
        default:
        if (!$(_onLoad).length == 0) {
          obj.not(_onLoad).find($accordionContent).hide();
        }
        else {
          switch (_onLoadError) {
            case 'allClose':
            $accordionContent.hide();
            break;
            case 'allOpen':
            $accordionContent.show();
            break;
            case 'firstOpen':
            $accordionContent.not(':first').hide();
            $(obj).filter(':first').addClass(_openClass);
            break;
          }
        }
        break;
      }
      ;

      $($accordionHeader).click(function() {
        
        toogleAccordeon($(this).closest(obj), obj);
        return false;
      });

    },
    close: function() {
      closeAccordeon(this);
    },
    open: function() {
      openAccordeon(this);
    }


  };

  //функції


  var getParam = function(curr) {
    var setting = $(curr).data('AccordionSetting');
    if (!setting.customClass.headerClass ) {
      
      $Header = $(curr).children().filter(':first-child');
      
    }
    else
    {
      $Header = $(setting.customClass.headerClass);
      
    }
    if (!setting.customClass.contentClass) {
      $Content = $(curr).children().filter(':nth-child(2)');
    }
    else
    {
      $Content = $(setting.customClass.contentClass);
    }

    return  {'header': $Header, 'content': $Content};


  };
//

var toogleAccordeon = function(current, obj) {
  var _onlyOneOpen = String($(obj).data('AccordionSetting').onlyOneOpen);
  var _openClass = $(obj).data('AccordionSetting').customClass.openClass;
  var $accordionContent = getParam(obj).content;
  var $closestAccordeonItemContent = $(current).find($accordionContent);
  var duration = $(obj).data('AccordionSetting').animation.duration;
  $(current).find($accordionContent).stop(true, true).slideToggle(duration);
  $(current).toggleClass(_openClass);

  if (_onlyOneOpen == 'true') {
    $(obj).find($accordionContent).not($closestAccordeonItemContent).slideUp(duration);
    $(obj).not(current).removeClass(_openClass);
  }
};

var closeAccordeon = function(obj) {

  var duration = $(obj).data('AccordionSetting').animation.duration;
  getParam(obj).content.slideUp(duration);
  obj.removeClass($(obj).data('AccordionSetting').customClass.openClass);
};

var openAccordeon = function(obj) {
  var duration = $(obj).data('AccordionSetting').animation.duration;
  getParam(obj).content.slideDown(duration);
  obj.addClass($(obj).data('AccordionSetting').customClass.openClass);
};

$.fn.Accordion = function(method) {
  var obj = this;
  if ($(obj).length > 0){
    if (methods[method]) {
      return methods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error(method + '  is undefined');
    }
  }else{
    console.log('Accordeon init, but items not found ');
  }
};
}(jQuery));
