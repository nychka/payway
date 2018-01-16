jQuery.fn.translit = function(options){
  var o = jQuery.extend({
    keyboard_en: false,
    dictinary: 'RU_TO_EN',
    mobile: false,
    to_upper: false
  },options);
  return this.each(function(){
    var elName = $(this),
        nameVal,
        allowed_numbers = $(this).hasClass('alpha_num');
    function tr(el){
      nameVal = el.val();
      if(nameVal.length > 0){
        inser_trans(get_trans(o.dictinary, o.keyboard_en, o.to_upper));
      }
    };
    elName.keyup(function (ev) {
      if(ev.ctrlKey || ev.keyCode == 17) return;
      if(o.mobile) return;
      tr($(this));
    });
    elName.focusout(function (ev) {
      if(!o.mobile) return;
      tr($(this));
    });
    tr(elName);
    function get_trans(dictinary, keyboard_en, to_upper) {
      RU_TO_EN = {
        '-':'-',
        'а': 'a',
        'б': 'b',
        'в': 'v',
        'г': 'g',
        'д': 'd',
        'е': 'e',
        'ё': 'jo',
        'ж': 'zh',
        'з': 'z',
        'и': 'i',
        'й': 'j',
        'к': 'k',
        'л': 'l',
        'м': 'm',
        'н': 'n',
        'о': 'o',
        'п': 'p',
        'р': 'r',
        'с': 's',
        'т': 't',
        'у': 'u',
        'ф': 'f',
        'х': 'kh',
        'ц': 'ts',
        'ч': 'ch',
        'ш': 'sh',
        'щ': 'shch',
        'ъ': '',
        'ы': 'y',
        'ь': '',
        'э': 'ye',
        'ю': 'yu',
        'я': 'ya',
        'і': 'i',
        'ї': 'i',
        'є': 'ie',

        'А': 'A',
        'Б': 'B',
        'В': 'V',
        'Г': 'G',
        'Д': 'D',
        'Е': 'E',
        'Ё': 'JO',
        'Ж': 'ZH',
        'З': 'Z',
        'И': 'I',
        'Й': 'J',
        'К': 'K',
        'Л': 'L',
        'М': 'M',
        'Н': 'N',
        'О': 'O',
        'П': 'P',
        'Р': 'R',
        'С': 'S',
        'Т': 'T',
        'У': 'U',
        'Ф': 'F',
        'Х': 'H',
        'Ц': 'C',
        'Ч': 'CH',
        'Ш': 'SH',
        'Щ': 'SCH',
        'Ъ': '',
        'Ы': 'Y',
        'Ь': '',
        'Э': 'YE',
        'Ю': 'YU',
        'Я': 'YA',
        'І': 'I',
        'Ї': 'I',
        'Є': 'IE'
      };
      PL_TO_EN = RU_TO_EN;
      var MD_extended = {
        'Ă':'A',
        'ă':'a',
        'Â':'A',
        'â':'a',
        'ş':'s',
        'Ş':'S',
        'Ș':'S',
        'ș':'s',
        'Ț':'T',
        'ț':'t',
        'Ţ':'T',
        'ţ':'t',
        'î':'i',
        'Î':'I'
      };
      MD_TO_EN = RU_TO_EN;//$.extend({}, RU_TO_EN, MD_extended);
      RO_TO_EN = MD_TO_EN;
      KZ_TO_EN = RU_TO_EN;
      var az_extended = {
        'Q':'G',
        'q':'g',
        'Ü':'U',
        'ü':'u',
        'Ö':'O',
        'ö':'o',
        'Ə':'A',
        'ə':'a',
        'Ğ':'Gh',
        'ğ':'gh',
        'Ş':'Sh',
        'ş':'sh',
        'Ç':'Ch',
        'ç':'ch',
        'X':'Kh',
        'x':'kh',
        'C':'J',
        'c':'j',
        'ı':'i'
      };
      AZ_TO_EN = RU_TO_EN; //$.extend({}, RU_TO_EN, az_extended);
      AT_TO_EN = RU_TO_EN;
      EE_TO_EN = RU_TO_EN;
      AE_TO_EN = RU_TO_EN;
      NG_TO_EN = RU_TO_EN;
      FR_TO_EN = RU_TO_EN;
      DE_TO_EN = {
        '-':'-',
        'a':'a',
        'b':'b',
        'c':'c',
        'd':'d',
        'e':'e',
        'f':'f',
        'g':'g',
        'h':'h',
        'i':'i',
        'j':'j',
        'k':'k',
        'l':'l',
        'm':'m',
        'n':'n',
        'o':'o',
        'p':'p',
        'q':'q',
        'r':'r',
        's':'s',
        't':'t',
        'u':'u',
        'v':'v',
        'w':'w',
        'x':'x',
        'y':'y',
        'z':'z',
        'ä':'ae',
        'ü':'ue',
        'ö':'oe',
        'ß':'ss',

        'A':'A',
        'B':'B',
        'C':'C',
        'D':'D',
        'E':'E',
        'F':'F',
        'G':'G',
        'H':'H',
        'I':'I',
        'J':'J',
        'K':'K',
        'L':'L',
        'M':'M',
        'N':'N',
        'O':'O',
        'P':'P',
        'Q':'Q',
        'R':'R',
        'S':'S',
        'T':'T',
        'U':'U',
        'V':'V',
        'W':'W',
        'X':'X',
        'Y':'Y',
        'Z':'Z',
        'Ä':'Ae',
        'Ü':'Ue',
        'Ö':'Oe',
        'ẞ':'Ss'
      };

      US_TO_EN = DE_TO_EN;

      UA_TO_EN = {
        '-':'-',
        'а': 'a',
        'б': 'b',
        'в': 'v',
        'г': 'h',
        'д': 'd',
        'е': 'e',
        'ё': 'jo',
        'ж': 'zh',
        'з': 'z',
        'и': 'y',
        'й': 'i',
        'к': 'k',
        'л': 'l',
        'м': 'm',
        'н': 'n',
        'о': 'o',
        'п': 'p',
        'р': 'r',
        'с': 's',
        'т': 't',
        'у': 'u',
        'ф': 'f',
        'х': 'kh',
        'ц': 'ts',
        'ч': 'ch',
        'ш': 'sh',
        'щ': 'shch',
        'ъ': '',
        'ы': 'y',
        'ь': '',
        'э': 'je',
        'ю': 'iu',
        'я': 'ia',
        'і': 'i',
        'ї': 'i',
        'є': 'ie',

        'А': 'A',
        'Б': 'B',
        'В': 'V',
        'Г': 'H',
        'Д': 'D',
        'Е': 'E',
        'Ё': 'JO',
        'Ж': 'ZH',
        'З': 'Z',
        'И': 'Y',
        'Й': 'I',
        'К': 'K',
        'Л': 'L',
        'М': 'M',
        'Н': 'N',
        'О': 'O',
        'П': 'P',
        'Р': 'R',
        'С': 'S',
        'Т': 'T',
        'У': 'U',
        'Ф': 'F',
        'Х': 'KH',
        'Ц': 'TS',
        'Ч': 'CH',
        'Ш': 'SH',
        'Щ': 'SHCH',
        'Ъ': '',
        'Ы': 'Y',
        'Ь': '',
        'Э': 'JE',
        'Ю': 'IU',
        'Я': 'IA',
        'І': 'I',
        'Ї': 'I',
        'Є': 'IE',
        'Ґ':'G',
        'ґ':'g'
      };

      BY_TO_EN = {
        '-':'-',
        'а': 'a',
        'б': 'b',
        'в': 'v',
        'г': 'h',
        'д': 'd',
        'е': 'e',
        'ё': 'io',
        'ж': 'zh',
        'з': 'z',
        'і': 'i',
        'й': 'i',
        'к': 'k',
        'л': 'l',
        'м': 'm',
        'н': 'n',
        'о': 'o',
        'п': 'p',
        'р': 'r',
        'с': 's',
        'т': 't',
        'у': 'u',
        'ў': 'u',
        'ф': 'f',
        'х': 'kh',
        'ц': 'ts',
        'ч': 'ch',
        'ш': 'sh',
        'ь': '',
        'э': 'e',
        'ю': 'iu',
        'я': 'ia',

        'А': 'A',
        'Б': 'B',
        'В': 'V',
        'Г': 'H',
        'Д': 'D',
        'Е': 'E',
        'Ё': 'IO',
        'Ж': 'ZH',
        'З': 'Z',
        'І': 'I',
        'Й': 'I',
        'К': 'K',
        'Л': 'L',
        'М': 'M',
        'Н': 'N',
        'О': 'O',
        'П': 'P',
        'Р': 'R',
        'С': 'S',
        'Т': 'T',
        'У': 'U',
        'Ў': 'U',
        'Ф': 'F',
        'Х': 'KH',
        'Ц': 'TS',
        'Ч': 'CH',
        'Ш': 'SH',
        'Ь': '',
        'Э': 'E',
        'Ю': 'IU',
        'Я': 'IA'
      };

      TR_TO_EN = {
        '-':'-',
        'a':'a',
        'b':'b',
        'c':'c',
        'd':'d',
        'e':'e',
        'f':'f',
        'g':'g',
        'h':'h',
        'i':'i',
        'j':'j',
        'k':'k',
        'l':'l',
        'm':'m',
        'n':'n',
        'o':'o',
        'p':'p',
        'q':'q',
        'r':'r',
        's':'s',
        't':'t',
        'u':'u',
        'v':'v',
        'w':'w',
        'x':'x',
        'y':'y',
        'z':'z',
        //'ç':'cc',
        //'ğ':'gg',
        //'ı':'i',
        //'ö':'oo',
        //'ş':'ss',
        //'ü':'uu',
        //'â':'aa',

        'A':'A',
        'B':'B',
        'C':'C',
        'D':'D',
        'E':'E',
        'F':'F',
        'G':'G',
        'H':'H',
        'I':'I',
        'J':'J',
        'K':'K',
        'L':'L',
        'M':'M',
        'N':'N',
        'O':'O',
        'P':'P',
        'Q':'Q',
        'R':'R',
        'S':'S',
        'T':'T',
        'U':'U',
        'V':'V',
        'W':'W',
        'X':'X',
        'Y':'Y',
        'Z':'Z',
        //'Ç':'Cc',
        //'Ğ':'Gg',
        //'İ':'Ii',
        //'Ö':'Oo',
        //'Ş':'Ss',
        //'Ü':'Uu',
        //'Â':'Aa',
      };


      first_letters = {
        'Є':'YE',
        'є':'ye',
        'Ї':'YI',
        'ї':'yi',
        'Й':'Y',
        'й':'y',
        'Ю':'YU',
        'ю':'yu',
        'Я':'YA',
        'я':'ya',
      }

      nameVal = trim(nameVal, keyboard_en);

      if(keyboard_en){
        _dictinary = {
          ' ':'',
          '.':'',
          'Б':'B',
          'Ю':'U',
          'Ж':'G',
          'Э':'E',
          'Х':'X',
          'Ъ':'',
          'Ї':'I',
          'Є':'E',
          'Й':'Q',
          'Ц':'W',
          'У':'E',
          'К':'R',
          'Е':'T',
          'Н':'Y',
          'Г':'U',
          'Ш':'I',
          'Щ':'O',
          'З':'P',
          'Ф':'A',
          'Ы':'S',
          'В':'D',
          'А':'F',
          'П':'G',
          'Р':'H',
          'О':'J',
          'Л':'K',
          'Д':'L',
          'Я':'Z',
          'Ч':'X',
          'С':'C',
          'М':'V',
          'И':'B',
          'Т':'N',
          'Ь':'M',
          '#':'№',
        };

        nameVal = nameVal.toUpperCase();
      }
      if(to_upper){
         nameVal = nameVal.toUpperCase();
      }
      nameVal = nameVal.split("");
      var trans = new String();

      if(!keyboard_en){
        _dictinary = eval(dictinary);

        if(nameVal.length == 1 && !keyboard_en && dictinary == "UA_TO_EN"){
          _dictinary = $.extend(_dictinary, first_letters);
        }
      }
      var EN = {
        ' ':' ',
        'a':'a',
        'b':'b',
        'c':'c',
        'd':'d',
        'e':'e',
        'f':'f',
        'g':'g',
        'h':'h',
        'i':'i',
        'j':'j',
        'k':'k',
        'l':'l',
        'm':'m',
        'n':'n',
        'o':'o',
        'p':'p',
        'q':'q',
        'r':'r',
        's':'s',
        't':'t',
        'u':'u',
        'v':'v',
        'w':'w',
        'x':'x',
        'y':'y',
        'z':'z',
      };
      var last;
      for (key in _dictinary) {
        last = key;
      };
      for (i = 0; i < nameVal.length; i++) {
        if(o.mobile){
          if(_dictinary[nameVal[i]]){
            trans += _dictinary[nameVal[i]];
          }else if(nameVal[i] == nameVal[i].toLowerCase() && EN[nameVal[i]]){
            trans += nameVal[i];
          }else if(EN[nameVal[i].toLowerCase()]){
            trans += nameVal[i].toUpperCase();
          }else{
            trans += '';
          }
        }else{
          for (key in _dictinary) {
            val = _dictinary[key];
            if (key == nameVal[i]) {
              trans += val;
              break;
            } else if ( key == last ) {
                trans += nameVal[i];
            }
          };
        }
      };
      return trans;
    };
    function inser_trans(result) {
      caretPosition = 0;
      var translit_with_caret = (function(result){
        if (elName.attr('type') != 'email' && elName.caret != null){
          delta = elName.val().length - result.length;
          if(typeof elName.caret() == 'object')caretPosition = elName.caret().begin - (elName.val().length !== result.length ? delta : 0);
          elName.val(result);
          elName.caret(caretPosition, caretPosition);
        }
      });

      if(o.mobile){
        if (elName.attr('type') == 'email'){
          elName.val(result);
        }else{
          translit_with_caret(result);
        }
      }else{
        if(result.length){
          translit_with_caret(result);
        }else{
            elName.val(result);
            elName.caret(caretPosition, caretPosition);
        }
      }
    };
    function trim(string, keyboard_en){
      string = string.replace(/’|`|~|\(|\)|'|"|<|>|\!|\||@|%|\^|\$|\\|\/|&|\*|\(\)|\|\/|;|\+|,|\?|_|:|{|}|\[|\]|\=/g, ""); // №|#|
      if(!keyboard_en && !allowed_numbers) string = string.replace(/[0-9]/g, "");
      return string;
    };
  });
};
