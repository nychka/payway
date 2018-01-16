$(document).ready(function(){
  if(typeof(window.csrf_token) != 'undefined'){
   $('<input>').attr('type','hidden').attr('name','csrf_token').attr('value',window.csrf_token).appendTo('form');

   $.ajaxPrefilter(function( options, originalOptions, jqXHR ) {
      if(typeof(options.data)!='undefined'){

        var post_params = $.parseParams(options.data);
        if(typeof(post_params.csrf_token) == 'undefined' || post_params.csrf_token.length == 0){
          post_params.csrf_token = window.csrf_token;
        }

        res = [];
        $.each(post_params,function(k,v){
          res.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
        })

        options.data = res.join('&');
      }
    });
  }
});
