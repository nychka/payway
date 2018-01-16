/*

  Author - Rudolf Naprstek
  Website - http://www.thimbleopensource.com/tutorials-snippets/jquery-plugin-filter-text-input
  Version - 1.2.0
  Release - 20th November 2010

  Thanks to Niko Halink from ARGH!media for bugfix!

*/

(function($){

    $.fn.extend({

        filter_input: function(options) {

          var defaults = {
              regex:".*",
              live:false,
              msg_regex: false,
              on_show_msg : false,
              on_finish : false,
              translit : false
          }

          var options =  $.extend(defaults, options);
          var regex = new RegExp(options.regex);
          var msg_regex = options.msg_regex ? new RegExp(options.msg_regex) : false;

          function filter_mobile_devices(event){
            if ( options.regex != ".*" ){
              if( $.browser.webkit ){
                var el = $(event.target);
                el.val( el.val().replace(new RegExp(options.regex.toString().replace(/\//g,'').replace('[', '[^'), 'g'), '') );
                return true;
              }
            }
          }

          function translit_input(event){
              var key = event.charCode ? event.charCode : event.keyCode ? event.keyCode : 0;
              // 8 = backspace, 9 = tab, 13 = enter, 35 = end, 36 = home, 37 = left, 39 = right, 46 = delete
              if (key == 8 || key == 9 || key == 13 || key == 35 || key == 36|| key == 37 || key == 39 || key == 46) {
                  if ($.browser.mozilla) {
                      // if charCode = key & keyCode = 0
                      // 35 = #, 36 = $, 37 = %, 39 = ', 46 = .
                      if (event.charCode == 0 && event.keyCode == key) {
                          return true;
                      }

                  }

                  if ($.browser.opera){
                      if(event.shiftKey == false && (key == 8 || key == 9 || key == 13 || key == 35 || key == 36|| key == 37) ){
                          return true;
                      }   else if (!event.charCode && (key == 39 || key == 46)){
                          return true;
                      }
                  }
              }

              var string = String.fromCharCode(key);
              var char_list_keys = Object.keys(options.translit).join("");
              var regex_replace = new RegExp('['+char_list_keys+']',"gi");

              if (regex_replace.test(string)) {
                  event.preventDefault();
                  var el = $(event.target);
                  el.val( el.val()+string.replace(regex_replace, function(matched){return options.translit[matched]}) )
              }
          }

          function filter_input_function(event) {

            var key = event.charCode ? event.charCode : event.keyCode ? event.keyCode : 0;
            // 8 = backspace, 9 = tab, 13 = enter, 35 = end, 36 = home, 37 = left, 39 = right, 46 = delete
            if (key == 8 || key == 9 || key == 13 || key == 35 || key == 36|| key == 37 || key == 39 || key == 46) {
              if ($.browser.mozilla) {
                // if charCode = key & keyCode = 0
                // 35 = #, 36 = $, 37 = %, 39 = ', 46 = .
                if (event.charCode == 0 && event.keyCode == key) {
                  return true;
                }

              }

              if ($.browser.opera){
                if(event.shiftKey == false && (key == 8 || key == 9 || key == 13 || key == 35 || key == 36|| key == 37) ){
                    return true;
                }   else if (!event.charCode && (key == 39 || key == 46)){
                    return true;
                }
              }
            }


            var string = String.fromCharCode(key);
            if (regex.test(string)) {
              if(options.on_finish){
                options.on_finish(this, true);
              }
              return true;
            }
            if(msg_regex  && options.on_show_msg){
                if(msg_regex.test(string)){
                   options.on_show_msg(this);
                }
            }
            if(options.on_finish){
                options.on_finish(this, false);
            }
            return false;
          }
          if (options.translit){
              $(this).live('keypress', translit_input);
          }
          if (options.live) {
            $(this).live('keypress', filter_input_function);
          } else {
            return this.each(function() {
              var input = $(this);
              input.unbind('keypress').keypress(filter_input_function);
              if( window.is_mobile ) input.bind('change', filter_mobile_devices)
            });
          }
        }
    });

})(jQuery);
